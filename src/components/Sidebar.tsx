import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Heart, MessageCircle, Bot, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/swipe", icon: Search, label: "Поиск" },
  { to: "/matches", icon: Heart, label: "Мэтчи" },
  { to: "/chat", icon: MessageCircle, label: "Чат" },
  { to: "/ai", icon: Bot, label: "AI" },
  { to: "/profile", icon: User, label: "Профиль" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-sidebar border-r border-border">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="text-2xl font-extrabold tracking-tight text-foreground">
          Naka<span className="text-primary">ma</span>
        </span>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink key={item.to} to={item.to} className="relative">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.8 }}
                />
              )}
              <div className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <item.icon className="h-5 w-5" />
                {item.label}
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <LogOut className="h-5 w-5" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
