import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac, createHash } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramLoginData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

function verifyTelegramLogin(data: TelegramLoginData, botToken: string): boolean {
  const { hash, ...rest } = data;
  const dataCheckString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${(rest as any)[key]}`)
    .join('\n');

  const secretKey = createHash('sha256').update(botToken).digest();
  const hmac = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (hmac !== hash) return false;

  // Check auth_date is not too old (1 hour)
  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > 3600) return false;

  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { telegram_data, action, user_id } = body;
    // action: "login" | "link"
    // user_id: only for "link" action

    const tgData: TelegramLoginData = telegram_data;

    if (!verifyTelegramLogin(tgData, botToken)) {
      return new Response(JSON.stringify({ error: 'Invalid Telegram data' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'link') {
      // Link Telegram to existing profile
      if (!user_id) {
        return new Response(JSON.stringify({ error: 'user_id required for linking' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if telegram_id already linked to another account
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('telegram_id', tgData.id)
        .maybeSingle();

      if (existing && existing.id !== user_id) {
        return new Response(JSON.stringify({ error: 'Этот Telegram аккаунт уже привязан к другому пользователю' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          telegram_id: tgData.id,
          telegram_username: tgData.username || null,
        })
        .eq('id', user_id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // action === "login" - sign in or sign up via Telegram
    // Check if a profile with this telegram_id exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_id', tgData.id)
      .maybeSingle();

    if (profile) {
      // User exists, generate a session token
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `tg_${tgData.id}@telegram.local`,
      });

      if (sessionError) throw sessionError;

      // Sign in the user directly
      const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `tg_${tgData.id}@telegram.local`,
      });

      // Use admin to create a session
      const tokenHash = new URL(signInData.properties.action_link).searchParams.get('token');

      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: 'magiclink',
      });

      if (verifyError) throw verifyError;

      return new Response(JSON.stringify({
        success: true,
        session: verifyData.session,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // New user - create account via Supabase Auth
      const email = `tg_${tgData.id}@telegram.local`;
      const nickname = tgData.username || tgData.first_name || `tg_${tgData.id}`;
      const avatarUrl = tgData.photo_url || `https://api.dicebear.com/9.x/adventurer/svg?seed=${tgData.id}&backgroundColor=1a1f2e`;

      // Create user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: nickname,
          avatar_url: avatarUrl,
          telegram_id: tgData.id,
        },
      });

      if (createError) throw createError;

      // Update profile with telegram fields
      await supabase
        .from('profiles')
        .update({
          telegram_id: tgData.id,
          telegram_username: tgData.username || null,
        })
        .eq('id', newUser.user.id);

      // Generate session
      const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });

      if (signInError) throw signInError;

      const tokenHash = new URL(signInData.properties.action_link).searchParams.get('token');

      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: 'magiclink',
      });

      if (verifyError) throw verifyError;

      return new Response(JSON.stringify({
        success: true,
        session: verifyData.session,
        isNewUser: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error: unknown) {
    console.error('Telegram auth error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
