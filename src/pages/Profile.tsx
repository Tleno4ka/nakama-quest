import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const skillOptions = ["Casual", "Silver", "Gold", "Platinum", "Diamond", "Immortal", "Global Elite"];

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [games] = useState(["Valorant", "CS2", "Apex Legends"]);
  const [gameRanks, setGameRanks] = useState<Record<string, string>>({
    "Valorant": "Diamond",
    "CS2": "Global Elite",
    "Apex Legends": "Platinum",
  });

  const inputClass = "w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground shadow-card outline-none transition-shadow focus:shadow-input-focus";

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
            src="https://api.dicebear.com/9.x/adventurer/svg?seed=You&backgroundColor=1a1f2e"
            alt="Avatar"
            className="h-20 w-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-bold text-foreground">Player_One</h2>
            <p className="text-xs text-muted-foreground">22 года · RU</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Ищу сыгранную команду для вечерних сессий. Коммуникабельный, без токсика.
        </p>

        {/* Games with per-game ranks */}
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

        <div className="mt-6 grid grid-cols-1 gap-4 text-sm">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Время игры</span>
            <span className="text-foreground">Вечер</span>
          </div>
        </div>

        <Button
          variant={isEditing ? "hero" : "outline"}
          className="mt-8 w-full"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Сохранить" : "Редактировать профиль"}
        </Button>
      </motion.div>
    </div>
  );
}
