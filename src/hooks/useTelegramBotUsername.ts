import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TelegramBotInfo {
  botUsername: string | null;
  botId: string | null;
  loading: boolean;
}

let cached: { username: string; id: string } | null = null;

export function useTelegramBotUsername(): TelegramBotInfo {
  const [info, setInfo] = useState<{ username: string | null; id: string | null }>({
    username: cached?.username ?? null,
    id: cached?.id ?? null,
  });
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return;

    supabase.functions
      .invoke("telegram-bot-info")
      .then(({ data, error }) => {
        if (!error && data?.bot_username && data?.bot_id) {
          cached = { username: data.bot_username, id: data.bot_id };
          setInfo({ username: data.bot_username, id: data.bot_id });
        }
        setLoading(false);
      });
  }, []);

  return { botUsername: info.username, botId: info.id, loading };
}
