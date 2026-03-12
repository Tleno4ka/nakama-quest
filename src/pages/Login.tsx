import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Supabase auth
    navigate("/swipe");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-card p-10 shadow-card-hover"
      >
        <h1 className="text-3xl font-extrabold text-foreground">
          Вход в <span className="text-primary">Nakama</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Рад тебя видеть снова!</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground shadow-card outline-none transition-shadow focus:shadow-input-focus"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground shadow-card outline-none transition-shadow focus:shadow-input-focus"
              placeholder="Введи пароль"
              required
            />
          </div>
          <Button variant="hero" type="submit" className="mt-4 w-full">
            Войти
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <button onClick={() => navigate("/register")} className="font-semibold text-primary hover:underline">
            Зарегистрироваться
          </button>
        </p>
      </motion.div>
    </div>
  );
}
