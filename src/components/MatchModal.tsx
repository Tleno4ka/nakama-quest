import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface MatchModalProps {
  open: boolean;
  myAvatar: string;
  theirAvatar: string;
  theirName: string;
  onMessage: () => void;
  onKeepSwiping: () => void;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 25, mass: 0.8 };

export default function MatchModal({ open, myAvatar, theirAvatar, theirName, onMessage, onKeepSwiping }: MatchModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center gap-8 rounded-3xl bg-card p-12 shadow-card-hover"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={spring}
          >
            <h2 className="text-3xl font-extrabold text-foreground">
              It's a <span className="text-primary">Match!</span>
            </h2>

            <div className="flex items-center gap-4">
              <img src={myAvatar} alt="You" className="h-20 w-20 rounded-full object-cover outline-4 outline-primary" />
              <div className="h-0.5 w-12 bg-gradient-to-r from-primary to-accent" />
              <img src={theirAvatar} alt={theirName} className="h-20 w-20 rounded-full object-cover outline-4 outline-accent" />
            </div>

            <p className="text-muted-foreground">
              Ты и <span className="font-semibold text-foreground">{theirName}</span> хотите играть вместе!
            </p>

            <div className="flex gap-4">
              <Button variant="hero" onClick={onMessage}>
                Написать
              </Button>
              <Button variant="outline" size="lg" onClick={onKeepSwiping}>
                Продолжить поиск
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
