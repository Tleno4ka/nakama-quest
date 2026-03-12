import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const gameOptions = ["Valorant", "CS2", "Dota 2", "League of Legends", "Apex Legends", "Overwatch 2", "Fortnite"];

export default function Profile() {
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
            <p className="text-xs text-muted-foreground">22 года · RU · Diamond</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Ищу сыгранную команду для вечерних сессий. Коммуникабельный, без токсика.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {["Valorant", "CS2", "Apex Legends"].map((g) => (
            <span key={g} className="rounded-lg bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {g}
            </span>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Время игры</span>
            <span className="text-foreground">Вечер</span>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Уровень</span>
            <span className="text-foreground">Diamond</span>
          </div>
        </div>

        <Button variant="outline" className="mt-8 w-full">
          Редактировать профиль
        </Button>
      </motion.div>
    </div>
  );
}
