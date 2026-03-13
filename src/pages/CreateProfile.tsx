import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const gameOptions = ["Valorant", "CS2", "Dota 2", "League of Legends", "Apex Legends", "Overwatch 2", "Fortnite", "Rainbow Six Siege", "Minecraft", "Terraria"];

export default function CreateProfile() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState("RU");
  const [description, setDescription] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [playTime, setPlayTime] = useState("Вечер");

  const toggleGame = (game: string) => {
    setSelectedGames((prev) =>
      prev.includes(game) ? prev.filter((g) => g !== game) : [...prev, game]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Supabase
    navigate("/swipe");
  };

  const inputClass = "w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground shadow-card outline-none transition-shadow focus:shadow-input-focus";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl bg-card p-10 shadow-card-hover"
      >
        <h1 className="text-3xl font-extrabold text-foreground">Создай профиль</h1>
        <p className="mt-2 text-sm text-muted-foreground">Расскажи о себе, чтобы найти идеальных тиммейтов</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Никнейм</label>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputClass} placeholder="Твой игровой ник" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Возраст</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} placeholder="22" required min={13} max={99} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Язык</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
                <option value="RU">Русский</option>
                <option value="EN">English</option>
                <option value="EN/RU">EN/RU</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">О себе</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} min-h-[80px] resize-none`} placeholder="Расскажи что-нибудь о себе..." />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Игры</label>
            <div className="flex flex-wrap gap-2">
              {gameOptions.map((game) => (
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Уровень</label>
              <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className={inputClass}>
                {skillOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Время игры</label>
              <select value={playTime} onChange={(e) => setPlayTime(e.target.value)} className={inputClass}>
                <option>Утро</option>
                <option>День</option>
                <option>Вечер</option>
                <option>Ночь</option>
                <option>Весь день</option>
              </select>
            </div>
          </div>

          <Button variant="hero" type="submit" className="mt-4 w-full">
            Сохранить и начать
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
