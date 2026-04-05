import { motion } from "framer-motion";
import {
  Megaphone, UserPlus, Sparkles, Gamepad2, Users, RefreshCw,
  ArrowDown, TrendingDown, Lightbulb
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ProfileRow } from "./OverviewDashboard";

const spring = { type: "spring" as const, stiffness: 260, damping: 28 };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

interface FunnelStage {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  count: number;
  aarrr: string;
  color: string;
}

function computeFunnel(profiles: ProfileRow[]): FunnelStage[] {
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86400000);
  const d30 = new Date(now.getTime() - 30 * 86400000);

  const total = profiles.length;

  // Activation: filled at least nickname
  const activated = profiles.filter(p => !!p.nickname).length;

  // Key action: added at least 1 game
  const withGames = profiles.filter(p => p.games && p.games.length > 0).length;

  // Engaged: games + description or age
  const engaged = profiles.filter(p =>
    p.games && p.games.length > 0 && (!!p.description || p.age != null)
  ).length;

  // Active 30d
  const active30d = profiles.filter(p => new Date(p.updated_at) >= d30).length;

  // Retained: created > 7d ago AND active in last 7d
  const retained = profiles.filter(p => {
    const created = new Date(p.created_at);
    const updated = new Date(p.updated_at);
    return created < d7 && updated >= d7;
  }).length;

  return [
    {
      key: "acquisition",
      label: "Acquisition — Регистрация",
      description: "Зарегистрировались в системе",
      icon: Megaphone,
      count: total,
      aarrr: "Acquisition",
      color: "from-blue-500 to-blue-600",
    },
    {
      key: "activation",
      label: "Activation — Активация",
      description: "Заполнили никнейм (создали профиль)",
      icon: UserPlus,
      count: activated,
      aarrr: "Activation",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      key: "key_action",
      label: "Целевое действие",
      description: "Добавили хотя бы одну игру",
      icon: Gamepad2,
      count: withGames,
      aarrr: "Activation+",
      color: "from-violet-500 to-violet-600",
    },
    {
      key: "engagement",
      label: "Вовлечение",
      description: "Игры + описание или возраст",
      icon: Sparkles,
      count: engaged,
      aarrr: "Retention",
      color: "from-amber-500 to-amber-600",
    },
    {
      key: "active",
      label: "Retention — Активные 30д",
      description: "Были активны за последние 30 дней",
      icon: Users,
      count: active30d,
      aarrr: "Retention",
      color: "from-orange-500 to-orange-600",
    },
    {
      key: "retained",
      label: "Retention — Постоянные",
      description: "Зарегистрированы >7д назад и активны за 7д",
      icon: RefreshCw,
      count: retained,
      aarrr: "Retention",
      color: "from-rose-500 to-rose-600",
    },
  ];
}

function getInsights(stages: FunnelStage[]): string[] {
  const insights: string[] = [];
  const total = stages[0].count;
  if (total === 0) return ["Нет данных для анализа"];

  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1].count;
    const curr = stages[i].count;
    if (prev === 0) continue;
    const dropPct = Math.round(((prev - curr) / prev) * 100);
    if (dropPct > 50) {
      insights.push(
        `Потеря ${dropPct}% между «${stages[i - 1].label.split("—")[0].trim()}» и «${stages[i].label.split("—")[0].trim()}» — критическое узкое место`
      );
    }
  }

  const activationRate = total > 0 ? Math.round((stages[1].count / total) * 100) : 0;
  if (activationRate < 70) {
    insights.push(`Активация ${activationRate}% — пользователи не завершают создание профиля`);
  }

  const retainedRate = total > 0 ? Math.round((stages[stages.length - 1].count / total) * 100) : 0;
  if (retainedRate < 20) {
    insights.push(`Только ${retainedRate}% становятся постоянными пользователями — нужна работа над удержанием`);
  }

  if (insights.length === 0) insights.push("Воронка выглядит здоровой — нет критических потерь");

  return insights;
}

export default function FunnelDashboard({ profiles }: { profiles: ProfileRow[] }) {
  const stages = computeFunnel(profiles);
  const insights = getInsights(stages);
  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <div className="space-y-8">
      {/* AARRR Label */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={spring}>
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Модель AARRR — Пиратские метрики</CardTitle>
            <CardDescription>
              Acquisition → Activation → Retention → Revenue → Referral
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Acquisition", "Activation", "Retention", "Revenue*", "Referral*"].map((s) => (
                <span
                  key={s}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    s.includes("*")
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              * Revenue и Referral пока не применимы — продукт бесплатный и не имеет реферальной системы
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Funnel visualization */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-3"
      >
        {stages.map((stage, i) => {
          const pct = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
          const convFromPrev = i > 0 && stages[i - 1].count > 0
            ? Math.round((stage.count / stages[i - 1].count) * 100)
            : null;
          const convFromTop = stages[0].count > 0
            ? Math.round((stage.count / stages[0].count) * 100)
            : 0;

          return (
            <motion.div key={stage.key} variants={fadeUp} transition={spring}>
              {i > 0 && (
                <div className="flex items-center justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  {convFromPrev !== null && (
                    <span className={`ml-2 text-xs font-semibold ${convFromPrev < 50 ? "text-destructive" : "text-muted-foreground"}`}>
                      {convFromPrev < 50 && <TrendingDown className="inline h-3 w-3 mr-0.5" />}
                      {convFromPrev}% конверсия
                    </span>
                  )}
                </div>
              )}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-colors overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl bg-gradient-to-br ${stage.color} p-3 text-white shrink-0`}>
                      <stage.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{stage.label}</p>
                          <p className="text-xs text-muted-foreground">{stage.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-2xl font-extrabold text-foreground">{stage.count}</p>
                          <p className="text-xs text-muted-foreground">{convFromTop}% от всех</p>
                        </div>
                      </div>
                      {/* Bar */}
                      <div className="h-2.5 w-full rounded-full bg-muted/50 mt-2">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${stage.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, 3)}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Insights */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ ...spring, delay: 0.8 }}>
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Инсайты по воронке
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span className="text-muted-foreground">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
