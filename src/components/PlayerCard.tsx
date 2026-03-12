import { motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompatibilityRing from "./CompatibilityRing";

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  games: string[];
  description: string;
  compatibility: number;
  age?: number;
  language?: string;
  skill_level?: string;
}

interface PlayerCardProps {
  player: Player;
  onLike: () => void;
  onSkip: () => void;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 25, mass: 0.8 };

export default function PlayerCard({ player, onLike, onSkip }: PlayerCardProps) {
  return (
    <motion.div
      className="relative w-[380px] rounded-3xl bg-card shadow-card-hover"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: 300, rotate: 8, opacity: 0 }}
      transition={spring}
      whileHover={{ scale: 1.02 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onLike();
        else if (info.offset.x < -100) onSkip();
      }}
    >
      {/* Avatar & Compatibility */}
      <div className="flex flex-col items-center pt-10 pb-4">
        <CompatibilityRing value={player.compatibility} size={128}>
          <img
            src={player.avatar}
            alt={player.nickname}
            className="h-[112px] w-[112px] rounded-full object-cover outline-4 outline-card"
          />
        </CompatibilityRing>

        <h2 className="mt-4 text-xl font-bold text-foreground">{player.nickname}</h2>
        {player.age && (
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {player.age} лет · {player.language}
          </span>
        )}
      </div>

      {/* Games */}
      <div className="flex flex-wrap justify-center gap-2 px-6">
        {player.games.map((g) => (
          <span
            key={g}
            className="rounded-lg bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
          >
            {g}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="mt-4 px-8 text-center text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {player.description}
      </p>

      {/* Skill */}
      {player.skill_level && (
        <div className="mt-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            {player.skill_level}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-6 py-8">
        <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }} transition={spring}>
          <Button variant="skip" size="icon-lg" onClick={onSkip}>
            <X className="h-6 w-6" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }} transition={spring}>
          <Button variant="like" size="icon-lg" onClick={onLike}>
            <Heart className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
