import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import TelegramLoginButton from "@/components/TelegramLoginButton";
import { useTelegramBotUsername } from "@/hooks/useTelegramBotUsername";

const skillOptions = ["Casual", "Silver", "Gold", "Platinum", "Diamond", "Immortal", "Global Elite"];

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [games, setGames] = useState<string[]>([]);
  const [gameRanks, setGameRanks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setGames(data.games || []);
          setGameRanks((data.game_ranks as Record<string, string>) || {});
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ game_ranks: gameRanks, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      toast.error("Ошибка сохранения");
    } else {
      toast.success("Профиль обновлён");
      setIsEditing(false);
    }
  };

  const handleLinkGoogle = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/profile",
    });
    if (error) toast.error("Ошибка привязки Google");
  };

  const handleLinkTelegram = useCallback(async (data: TelegramLoginData) => {
    if (!user) return;
    try {
      const res = await supabase.functions.invoke("telegram-auth", {
        body: { telegram_data: data, action: "link", user_id: user.id },
      });

      if (res.error) throw res.error;
      const result = res.data;

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Telegram привязан!");
      setProfile((prev: any) => ({
        ...prev,
        telegram_id: data.id,
        telegram_username: data.username,
      }));
    } catch {
      toast.error("Ошибка привязки Telegram");
    }
  }, [user]);

  const inputClass = "w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground shadow-card outline-none transition-shadow focus:shadow-input-focus";
  const { botId: tgBotId } = useTelegramBotUsername();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const hasGoogle = user?.app_metadata?.provider === "google" || user?.identities?.some((i) => i.provider === "google");
  const hasTelegram = !!profile?.telegram_id;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-foreground">Профиль</h1>
      <p className="mt-1 text-sm text-muted-foreground">Твоя карточка игрока</p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 max-w-lg rounded-3xl bg-card p-8 shadow-card-hover"
      >
        <div className="flex items-center gap-5">
          <img
            src={profile?.avatar_url || `https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.id}&backgroundColor=1a1f2e`}
            alt="Avatar"
            className="h-20 w-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-bold text-foreground">{profile?.nickname || "Игрок"}</h2>
            <p className="text-xs text-muted-foreground">
              {profile?.age ? `${profile.age} лет` : ""}{profile?.age && profile?.language ? " · " : ""}{profile?.language || ""}
            </p>
          </div>
        </div>

        {profile?.description && (
          <p className="mt-6 text-sm text-muted-foreground">{profile.description}</p>
        )}

        {/* Games with per-game ranks */}
        {games.length > 0 && (
          <div className="mt-4">
            <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Игры и ранги</span>
            <div className="flex flex-col gap-2">
              {games.map((g) => (
                <div key={g} className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-2.5">
                  <span className="text-sm font-medium text-foreground">{g}</span>
                  {isEditing ? (
                    <select
                      value={gameRanks[g] || "Casual"}
                      onChange={(e) => setGameRanks((prev) => ({ ...prev, [g]: e.target.value }))}
                      className="rounded-lg bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none"
                    >
                      {skillOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                      {gameRanks[g] || "—"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 text-sm">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Время игры</span>
            <span className="text-foreground">{profile?.play_time || "—"}</span>
          </div>
        </div>

        {/* Linked accounts */}
        <div className="mt-6">
          <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Привязанные аккаунты</span>
          <div className="flex flex-col gap-2">
            {/* Google */}
            <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-medium text-foreground">Google</span>
              </div>
              {hasGoogle ? (
                <span className="text-xs font-semibold text-primary">Привязан</span>
              ) : (
                <Button variant="outline" size="sm" onClick={handleLinkGoogle}>Привязать</Button>
              )}
            </div>

            {/* Telegram */}
            <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.65-2.89 7.99-3.44 3.8-1.58 4.59-1.86 5.1-1.87.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z" fill="#2AABEE"/>
                </svg>
                <span className="text-sm font-medium text-foreground">Telegram</span>
              </div>
              {hasTelegram ? (
                <span className="text-xs font-semibold text-primary">
                  @{profile?.telegram_username || "Привязан"}
                </span>
              ) : tgBotUsername ? (
                <TelegramLoginButton botId={tgBotId || ""} redirectPath="/telegram-callback?link=true" />
              ) : (
                <span className="text-xs text-muted-foreground">Не настроен</span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant={isEditing ? "hero" : "outline"}
          className="mt-8 w-full"
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? "Сохранить" : "Редактировать профиль"}
        </Button>
      </motion.div>
    </div>
  );
}
