import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

let cachedBotUsername: string | null = null;

export function useTelegramBotUsername() {
  const [botUsername, setBotUsername] = useState<string | null>(cachedBotUsername);
  const [loading, setLoading] = useState(!cachedBotUsername);

  useEffect(() => {
    if (cachedBotUsername) return;

    supabase.functions
      .invoke("telegram-bot-info")
      .then(({ data, error }) => {
        if (!error && data?.bot_username) {
          cachedBotUsername = data.bot_username;
          setBotUsername(data.bot_username);
        }
        setLoading(false);
      });
  }, []);

  return { botUsername, loading };
}
