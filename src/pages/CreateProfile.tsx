import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import GameSearchDropdown from "@/components/GameSearchDropdown";
import TimeSlotGrid from "@/components/TimeSlotGrid";

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

export default function CreateProfile() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [ageError, setAgeError] = useState("");
  const [language, setLanguage] = useState("RU");
  const [description, setDescription] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [playTime, setPlayTime] = useState("Вечер");
  const [timeSlots, setTimeSlots] = useState<Record<string, number[]>>({});

  const toggleGame = (game: string) => {
    setSelectedGames((prev) =>
      prev.includes(game) ? prev.filter((g) => g !== game) : [...prev, game]
    );
  };

  const handleAgeChange = (val: string) => {
    setAge(val);
    const num = parseInt(val);
    if (val && !isNaN(num) && num < 16) {
      setAgeError("Регистрация доступна с 16 лет");
    } else {
      setAgeError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(age);
    if (isNaN(num) || num < 16) {
      setAgeError("Регистрация доступна с 16 лет");
      return;
    }
    // TODO: Save to Supabase
    navigate("/swipe");
  };

  const inputClass =
    "w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground shadow-card outline-none transition-shadow focus:shadow-input-focus";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl bg-card p-10 shadow-card-hover"
      >
        <h1 className="text-3xl font-extrabold text-foreground">Создай профиль</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Расскажи о себе, чтобы найти идеальных тиммейтов
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* Nickname */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Твое имя или никнейм
            </label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={inputClass}
              placeholder="Как тебя называть?"
              required
            />
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
                className={`${inputClass} ${ageError ? "shadow-[0_0_0_1px_hsl(var(--destructive))]" : ""}`}
                placeholder="16+"
                required
                min={1}
                max={99}
              />
              {ageError && (
                <p className="mt-1 text-xs font-medium text-destructive">{ageError}</p>
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

          <Button variant="hero" type="submit" className="mt-4 w-full">
            Сохранить и начать
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
