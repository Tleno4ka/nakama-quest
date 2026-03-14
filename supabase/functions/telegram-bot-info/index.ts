import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const botUsername = Deno.env.get('TELEGRAM_BOT_USERNAME');
  if (!botUsername) {
    return new Response(JSON.stringify({ error: 'TELEGRAM_BOT_USERNAME not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ bot_username: botUsername }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
