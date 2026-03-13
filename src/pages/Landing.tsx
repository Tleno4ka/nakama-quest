import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Search, Users, MessageCircle, Bot, Zap, Shield } from "lucide-react";

const features = [
  { icon: Search, title: "Умный поиск", desc: "Находи игроков по играм, рангу и стилю игры" },
  { icon: Users, title: "Свайпы", desc: "Листай карточки и выбирай напарников" },
  { icon: MessageCircle, title: "Мгновенный чат", desc: "Общайся с мэтчами в реальном времени" },
  { icon: Bot, title: "AI-ассистент", desc: "Получай советы и аналитику от ИИ" },
  { icon: Zap, title: "Быстрый мэтч", desc: "2-3 минуты до идеального напарника" },
  { icon: Shield, title: "Без токсичности", desc: "Система рейтингов и модерация" },
];

const spring = { type: "spring" as const, stiffness: 300, damping: 25, mass: 0.8 };

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5">
        <span className="text-2xl font-extrabold tracking-tight">
          Naka<span className="text-primary">ma</span>
        </span>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate("/login")}>Войти</Button>
          <Button variant="hero" onClick={() => navigate("/register")}>Начать</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="max-w-2xl"
        >
          <h1 className="text-5xl font-extrabold leading-tight text-foreground md:text-6xl">
            Найди своего
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              напарника
            </span>
            . Быстро.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Nakama подбирает идеальных тиммейтов для твоих любимых игр.
            Свайпай, мэтчься, побеждай вместе.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button variant="hero" size="lg" onClick={() => navigate("/register")}>
              Найти тиммейта
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/login")}>
              Уже есть аккаунт
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-24 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: i * 0.08 }}
            className="rounded-2xl bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <f.icon className="mb-3 h-8 w-8 text-primary" />
            <h3 className="text-base font-bold text-foreground">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Nakama. Все права защищены.
      </footer>
    </div>
  );
}
