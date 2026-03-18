import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TelegramLoginData } from "@/components/TelegramLoginButton";

function parseTelegramData(): { data: TelegramLoginData | null; isLink: boolean } {
  const searchParams = new URLSearchParams(window.location.search);
  const isLink = searchParams.get("link") === "true";

  // Method 1: Telegram OAuth returns data in hash fragment as #tgAuthResult=<base64json>
  const hash = window.location.hash;
  if (hash) {
    const match = hash.match(/tgAuthResult=([A-Za-z0-9+/=_-]+)/);
    if (match) {
      try {
        const decoded = atob(match[1]);
        const parsed = JSON.parse(decoded);
        if (parsed.id && parsed.hash && parsed.auth_date) {
          return {
            data: {
              id: Number(parsed.id),
              first_name: parsed.first_name,
              last_name: parsed.last_name,
              username: parsed.username,
              photo_url: parsed.photo_url,
              auth_date: Number(parsed.auth_date),
              hash: parsed.hash,
            },
            isLink,
          };
        }
      } catch (e) {
        console.error("Failed to parse tgAuthResult:", e);
      }
    }
  }

  // Method 2: Data in query parameters (fallback)
  const id = searchParams.get("id");
  const hashParam = searchParams.get("hash");
  const authDate = searchParams.get("auth_date");

  if (id && hashParam && authDate) {
    return {
      data: {
        id: Number(id),
        first_name: searchParams.get("first_name") ?? undefined,
        last_name: searchParams.get("last_name") ?? undefined,
        username: searchParams.get("username") ?? undefined,
        photo_url: searchParams.get("photo_url") ?? undefined,
        auth_date: Number(authDate),
        hash: hashParam,
      },
      isLink,
    };
  }

  return { data: null, isLink };
}

export default function TelegramCallback() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const { data: telegramData, isLink } = parseTelegramData();

    console.log("TelegramCallback: hash =", window.location.hash);
    console.log("TelegramCallback: search =", window.location.search);
    console.log("TelegramCallback: parsed data =", telegramData);

    if (!telegramData) {
      toast.error("Неверные данные авторизации Telegram");
      navigate(isLink ? "/profile" : "/login");
      return;
    }

    (async () => {
      try {
        if (isLink) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast.error("Необходимо войти в аккаунт");
            navigate("/login");
            return;
          }

          const res = await supabase.functions.invoke("telegram-auth", {
            body: { telegram_data: telegramData, action: "link", user_id: user.id },
          });

          if (res.error) throw res.error;
          if (res.data?.error) {
            toast.error(res.data.error);
          } else {
            toast.success("Telegram привязан!");
          }
          navigate("/profile");
        } else {
          const res = await supabase.functions.invoke("telegram-auth", {
            body: { telegram_data: telegramData, action: "login" },
          });

          if (res.error) throw res.error;
          const result = res.data;

          if (result.error) {
            toast.error(result.error);
            navigate("/login");
            return;
          }

          if (result.session) {
            await supabase.auth.setSession(result.session);
            navigate(result.isNewUser ? "/create-profile" : "/swipe");
          } else {
            navigate("/login");
          }
        }
      } catch (err: any) {
        console.error("Telegram auth error:", err);
        toast.error("Ошибка авторизации через Telegram");
        navigate(isLink ? "/profile" : "/login");
      } finally {
        setProcessing(false);
      }
    })();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">
        {processing ? "Авторизация через Telegram..." : "Перенаправление..."}
      </p>
    </div>
  );
}
