import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface TelegramLoginButtonProps {
  botId: string;
  redirectPath?: string;
}

export interface TelegramLoginData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export default function TelegramLoginButton({ botId, redirectPath = "/telegram-callback" }: TelegramLoginButtonProps) {
  const handleClick = () => {
    const origin = window.location.origin;
    const returnTo = `${origin}${redirectPath}`;
    const authUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(origin)}&embed=0&request_access=write&return_to=${encodeURIComponent(returnTo)}`;
    window.location.href = authUrl;
  };

  return (
    <Button
      variant="outline"
      className="flex w-full items-center justify-center gap-3"
      onClick={handleClick}
    >
      <Send className="h-5 w-5 text-[#2AABEE]" />
      Войти через Telegram
    </Button>
  );
}
