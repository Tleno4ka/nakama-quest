import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockMatches = [
  { id: "2", nickname: "LunarFox", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=LunarFox&backgroundColor=1a1f2e", game: "Dota 2", time: "Сегодня" },
  { id: "4", nickname: "IronWolf", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=IronWolf&backgroundColor=1a1f2e", game: "CS2", time: "Вчера" },
];

export default function Matches() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-foreground">Мэтчи</h1>
      <p className="mt-1 text-sm text-muted-foreground">Твои взаимные лайки</p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockMatches.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => navigate("/chat")}
            className="flex items-center gap-4 rounded-2xl bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover text-left"
          >
            <img src={m.avatar} alt={m.nickname} className="h-14 w-14 rounded-full object-cover" />
            <div className="flex-1">
              <p className="font-bold text-foreground">{m.nickname}</p>
              <p className="text-xs text-muted-foreground">{m.game} · {m.time}</p>
            </div>
            <Heart className="h-5 w-5 text-primary" />
          </motion.button>
        ))}
      </div>

      {mockMatches.length === 0 && (
        <div className="mt-24 text-center text-muted-foreground">
          Пока нет мэтчей. Продолжай свайпать!
        </div>
      )}
    </div>
  );
}
