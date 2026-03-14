import { useEffect, useRef } from "react";

interface TelegramLoginButtonProps {
  botName: string;
  onAuth: (data: TelegramLoginData) => void;
  buttonSize?: "large" | "medium" | "small";
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

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramLoginData) => void;
  }
}

export default function TelegramLoginButton({ botName, onAuth, buttonSize = "large" }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.onTelegramAuth = (user: TelegramLoginData) => {
      onAuth(user);
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", buttonSize);
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, [botName, onAuth, buttonSize]);

  return <div ref={containerRef} className="flex justify-center" />;
}
