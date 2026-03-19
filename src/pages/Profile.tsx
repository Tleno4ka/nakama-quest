import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TelegramLoginButton from "@/components/TelegramLoginButton";
import { useTelegramBotUsername } from "@/hooks/useTelegramBotUsername";
import GameSearchDropdown from "@/components/GameSearchDropdown";
import TimeSlotGrid from "@/components/TimeSlotGrid";
import { lovable } from "@/integrations/lovable/index";

import avatar1 from "@/assets/avatars/avatar-1.png";
import avatar2 from "@/assets/avatars/avatar-2.png";
import avatar3 from "@/assets/avatars/avatar-3.png";
import avatar4 from "@/assets/avatars/avatar-4.png";
import avatar5 from "@/assets/avatars/avatar-5.png";
import avatar6 from "@/assets/avatars/avatar-6.png";
import avatar7 from "@/assets/avatars/avatar-7.png";
import avatar8 from "@/assets/avatars/avatar-8.png";
import avatar9 from "@/assets/avatars/avatar-9.png";
import avatar10 from "@/assets/avatars/avatar-10.png";

const presetAvatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10];

const skillOptions = ["Casual", "Silver", "Gold", "Platinum", "Diamond", "Immortal", "Global Elite"];

const primaryGames = [
  "Valorant", "CS2", "Dota 2", "League of Legends", "Apex Legends",
  "Overwatch 2", "Fortnite", "Rainbow Six Siege", "Minecraft", "Terraria",
];

const languageOptions = [
  { value: "RU", label: "Русский" },
  { value: "EN", label: "English" },
  { value: "EN/RU", label: "EN / RU" },
  { value: "ES", label: "Español" },
  { value: "FR", label: "Français" },
  { value: "DE", label: "Deutsch" },
  { value: "TR", label: "Türkçe" },
  { value: "PT", label: "Português" },
  { value: "IT", label: "Italiano" },
  { value: "PL", label: "Polski" },
  { value: "UK", label: "Українська" },
  { value: "ZH", label: "中文" },
  { value: "JA", label: "日本語" },
  { value: "KO", label: "한국어" },
  { value: "AR", label: "العربية" },
];

const playTimePresets = ["Утро", "День", "Вечер", "Ночь", "Весь день", "Установить вручную"];

function daysSince(dateStr: string | null): number {
  if (!dateStr) return Infinity;
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Editable fields
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [ageError, setAgeError] = useState("");
  const [language, setLanguage] = useState("RU");
  const [description, setDescription] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [gameRanks, setGameRanks] = useState<Record<string, string>>({});
  const [playTime, setPlayTime] = useState("Вечер");
  const [timeSlots, setTimeSlots] = useState<Record<string, number[]>>({});
  const [avatarUrl, setAvatarUrl] = useState("");

  // Original values for change restriction checks
  const [origNickname, setOrigNickname] = useState("");
  const [origAge, setOrigAge] = useState("");

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
          setNickname(data.nickname || "");
          setOrigNickname(data.nickname || "");
          setAge(data.age ? String(data.age) : "");
          setOrigAge(data.age ? String(data.age) : "");
          setLanguage(data.language || "RU");
          setDescription(data.description || "");
          setSelectedGames(data.games || []);
          setGameRanks((data.game_ranks as Record<string, string>) || {});
          setPlayTime(data.play_time || "Вечер");
          setTimeSlots((data as any).time_slots as Record<string, number[]> || {});
          setAvatarUrl(data.avatar_url || `https://api.dicebear.com/9.x/adventurer/svg?seed=${user.id}&backgroundColor=1a1f2e`);
        }
        setLoading(false);
      });
  }, [user]);

  const toggleGame = (game: string) => {
    setSelectedGames((prev) =>
      prev.includes(game) ? prev.filter((g) => g !== game) : [...prev, game]
    );
  };

  const handleAgeChange = (val: string) => {
    setAge(val);
    const num = parseInt(val);
    if (val && !isNaN(num) && num < 16) {
      setAgeError("Минимальный возраст — 16 лет");
    } else {
      setAgeError("");
    }
  };

  const canChangeNickname = daysSince(profile?.nickname_changed_at) >= 30;
  const canChangeAge = daysSince(profile?.age_changed_at) >= 30;

  const daysUntilNickname = profile?.nickname_changed_at
    ? Math.max(0, Math.ceil(30 - daysSince(profile.nickname_changed_at)))
    : 0;
  const daysUntilAge = profile?.age_changed_at
    ? Math.max(0, Math.ceil(30 - daysSince(profile.age_changed_at)))
    : 0;

  const handleSave = async () => {
    if (!user) return;

    const ageNum = parseInt(age);
    if (age && (isNaN(ageNum) || ageNum < 16)) {
      setAgeError("Минимальный возраст — 16 лет");
      return;
    }

    const nicknameChanged = nickname !== origNickname;
    const ageChanged = age !== origAge;

    if (nicknameChanged && !canChangeNickname) {
      toast.error(`Никнейм можно менять раз в 30 дней. Осталось ${daysUntilNickname} дн.`);
      return;
    }
    if (ageChanged && !canChangeAge) {
      toast.error(`Возраст можно менять раз в 30 дней. Осталось ${daysUntilAge} дн.`);
      return;
    }

    const updates: Record<string, any> = {
      language,
      description,
      games: selectedGames,
      game_ranks: gameRanks,
      play_time: playTime,
      time_slots: timeSlots,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    };

    if (nicknameChanged) {
      updates.nickname = nickname;
      updates.nickname_changed_at = new Date().toISOString();
    }
    if (ageChanged) {
      updates.age = ageNum;
      updates.age_changed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      toast.error("Ошибка сохранения");
    } else {
      toast.success("Профиль обновлён");
      setOrigNickname(nickname);
      setOrigAge(age);
      setProfile((prev: any) => ({ ...prev, ...updates }));
    }
  };

  const handleSelectAvatar = (url: string) => {
    setAvatarUrl(url);
    setShowAvatarPicker(false);
  };

  const handleLinkGoogle = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/profile",
    });
    if (error) toast.error("Ошибка привязки Google");
  };

  const { botId: tgBotId } = useTelegramBotUsername();

  const inputClass =
    "w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground shadow-card outline-none transition-shadow focus:shadow-input-focus";

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
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/30"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
          >
            Сменить аватар
          </Button>

          {showAvatarPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 grid grid-cols-5 gap-2"
            >
              {presetAvatars.map((av, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectAvatar(av)}
                  className={`rounded-full overflow-hidden ring-2 transition-all ${
                    avatarUrl === av ? "ring-primary scale-110" : "ring-transparent hover:ring-primary/50"
                  }`}
                >
                  <img src={av} alt={`Avatar ${i + 1}`} className="h-14 w-14 object-cover" />
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-5">
          {/* Nickname */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Твое имя или никнейм
            </label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={`${inputClass} ${!canChangeNickname ? "opacity-60" : ""}`}
              placeholder="Как тебя называть?"
              disabled={!canChangeNickname}
            />
            {!canChangeNickname && (
              <p className="mt-1 text-xs text-muted-foreground">
                Изменить можно через {daysUntilNickname} дн.
              </p>
            )}
          </div>

          {/* Age & Language */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Возраст
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => handleAgeChange(e.target.value)}
                className={`${inputClass} ${ageError ? "shadow-[0_0_0_1px_hsl(var(--destructive))]" : ""} ${!canChangeAge ? "opacity-60" : ""}`}
                placeholder="16+"
                min={1}
                max={99}
                disabled={!canChangeAge}
              />
              {ageError && (
                <p className="mt-1 text-xs font-medium text-destructive">{ageError}</p>
              )}
              {!canChangeAge && !ageError && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Изменить можно через {daysUntilAge} дн.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Язык
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={inputClass}
              >
                {languageOptions.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              О себе
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-[80px] resize-none`}
              placeholder="Расскажи что-нибудь о себе..."
            />
          </div>

          {/* Games */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Игры
            </label>
            <div className="flex flex-wrap gap-2">
              {primaryGames.map((game) => (
                <button
                  key={game}
                  type="button"
                  onClick={() => toggleGame(game)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedGames.includes(game)
                      ? "bg-primary text-primary-foreground shadow-[0_0_0_1px_hsla(0,0%,100%,0.1)_inset]"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {game}
                </button>
              ))}
              <GameSearchDropdown
                selectedGames={selectedGames}
                onToggle={toggleGame}
                primaryGames={primaryGames}
              />
            </div>
          </div>

          {/* Per-game ranks */}
          {selectedGames.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Ранги
              </label>
              <div className="flex flex-col gap-2">
                {selectedGames.map((g) => (
                  <div key={g} className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-2.5">
                    <span className="text-sm font-medium text-foreground">{g}</span>
                    <select
                      value={gameRanks[g] || "Casual"}
                      onChange={(e) => setGameRanks((prev) => ({ ...prev, [g]: e.target.value }))}
                      className="rounded-lg bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none"
                    >
                      {skillOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Play Time */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Время игры
            </label>
            <div className="flex flex-wrap gap-2">
              {playTimePresets.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setPlayTime(time)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    playTime === time
                      ? "bg-primary text-primary-foreground shadow-[0_0_0_1px_hsla(0,0%,100%,0.1)_inset]"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            {playTime === "Установить вручную" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3"
              >
                <TimeSlotGrid value={timeSlots} onChange={setTimeSlots} />
              </motion.div>
            )}
          </div>

          {/* Linked accounts */}
          <div>
            <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Привязанные аккаунты
            </label>
            <div className="flex flex-col gap-2">
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
                ) : tgBotId ? (
                  <TelegramLoginButton botId={tgBotId || ""} redirectPath="/telegram-callback?link=true" />
                ) : (
                  <span className="text-xs text-muted-foreground">Не настроен</span>
                )}
              </div>
            </div>
          </div>

          <Button variant="hero" className="mt-4 w-full" onClick={handleSave}>
            Сохранить изменения
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
