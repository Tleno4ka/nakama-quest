import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TelegramLoginData } from "@/components/TelegramLoginButton";

export default function TelegramCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const id = searchParams.get("id");
    const hash = searchParams.get("hash");
    const auth_date = searchParams.get("auth_date");

    if (!id || !hash || !auth_date) {
      toast.error("Неверные данные авторизации Telegram");
      navigate("/login");
      return;
    }

    const telegramData: TelegramLoginData = {
      id: Number(id),
      first_name: searchParams.get("first_name") ?? undefined,
      last_name: searchParams.get("last_name") ?? undefined,
      username: searchParams.get("username") ?? undefined,
      photo_url: searchParams.get("photo_url") ?? undefined,
      auth_date: Number(auth_date),
      hash,
    };

    (async () => {
      try {
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
      } catch (err: any) {
        console.error("Telegram auth error:", err);
        toast.error("Ошибка входа через Telegram");
        navigate("/login");
      } finally {
        setProcessing(false);
      }
    })();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">
        {processing ? "Авторизация через Telegram..." : "Перенаправление..."}
      </p>
    </div>
  );
}
