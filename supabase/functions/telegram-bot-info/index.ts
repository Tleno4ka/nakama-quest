const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const botUsername = Deno.env.get('TELEGRAM_BOT_USERNAME');

  if (!botToken || !botUsername) {
    return new Response(JSON.stringify({ error: 'Telegram bot not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Bot ID is the part before the colon in the token
  const botId = botToken.split(':')[0];

  return new Response(JSON.stringify({ bot_username: botUsername, bot_id: botId }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
