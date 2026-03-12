import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import PlayerCard from "@/components/PlayerCard";
import MatchModal from "@/components/MatchModal";
import { mockPlayers } from "@/data/mockPlayers";
import { useNavigate } from "react-router-dom";

export default function SwipePlayers() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedPlayer, setMatchedPlayer] = useState(mockPlayers[0]);

  const current = mockPlayers[currentIndex];

  const handleLike = () => {
    // Simulate match on 2nd and 4th player
    if (currentIndex === 1 || currentIndex === 3) {
      setMatchedPlayer(current);
      setShowMatch(true);
    } else {
      next();
    }
  };

  const handleSkip = () => next();

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % mockPlayers.length);
  };

  return (
    <div className="grid min-h-screen place-items-center p-8">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Поиск тиммейтов
        </h2>

        <AnimatePresence mode="wait">
          {current && (
            <PlayerCard
              key={current.id}
              player={current}
              onLike={handleLike}
              onSkip={handleSkip}
            />
          )}
        </AnimatePresence>
      </div>

      <MatchModal
        open={showMatch}
        myAvatar="https://api.dicebear.com/9.x/adventurer/svg?seed=You&backgroundColor=1a1f2e"
        theirAvatar={matchedPlayer.avatar}
        theirName={matchedPlayer.nickname}
        onMessage={() => {
          setShowMatch(false);
          navigate("/chat");
        }}
        onKeepSwiping={() => {
          setShowMatch(false);
          next();
        }}
      />
    </div>
  );
}
