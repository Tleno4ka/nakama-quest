import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, UserCheck, UserX, Gamepad2, Clock, Shield,
  TrendingUp, ArrowLeft, BarChart3, Activity, Target,
  Calendar, Globe, MessageSquare, AlertTriangle, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const spring = { type: "spring" as const, stiffness: 260, damping: 28 };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

interface Stats {
  total: number;
  withGames: number;
  withDesc: number;
  withSlots: number;
  withTelegram: number;
  withAge: number;
  withRanks: number;
  new7d: number;
  new30d: number;
  active7d: number;
  active30d: number;
  avgProfileCompleteness: number;
  languages: Record<string, number>;
  playTimes: Record<string, number>;
  registrationDates: { date: string; count: number }[];
}

interface ProfileRow {
  nickname: string | null;
  games: string[] | null;
  language: string | null;
  play_time: string | null;
  age: number | null;
  created_at: string;
  updated_at: string;
  description: string | null;
  game_ranks: Record<string, unknown> | null;
  time_slots: Record<string, unknown> | null;
  telegram_username: string | null;
}

function computeStats(profiles: ProfileRow[]): Stats {
  const total = profiles.length;
  let withGames = 0, withDesc = 0, withSlots = 0, withTelegram = 0, withAge = 0, withRanks = 0;
  const languages: Record<string, number> = {};
  const playTimes: Record<string, number> = {};
  const regMap: Record<string, number> = {};
  let totalCompleteness = 0;

  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86400000);
  const d30 = new Date(now.getTime() - 30 * 86400000);
  let new7d = 0, new30d = 0, active7d = 0, active30d = 0;

  for (const p of profiles) {
    const hasGames = p.games && p.games.length > 0;
    const hasDesc = !!p.description;
    const hasSlots = p.time_slots && Object.keys(p.time_slots).length > 0;
    const hasTg = !!p.telegram_username;
    const hasAge = p.age != null;
    const hasRanksVal = p.game_ranks && Object.keys(p.game_ranks).length > 0;

    if (hasGames) withGames++;
    if (hasDesc) withDesc++;
    if (hasSlots) withSlots++;
    if (hasTg) withTelegram++;
    if (hasAge) withAge++;
    if (hasRanksVal) withRanks++;

    // Profile completeness: 7 fields
    const fields = [hasGames, hasDesc, hasSlots, hasTg, hasAge, hasRanksVal, !!p.nickname];
    totalCompleteness += fields.filter(Boolean).length / fields.length;

    const lang = p.language || "Не указан";
    languages[lang] = (languages[lang] || 0) + 1;

    const pt = p.play_time || "Не указано";
    playTimes[pt] = (playTimes[pt] || 0) + 1;

    const created = new Date(p.created_at);
    const updated = new Date(p.updated_at);
    if (created >= d7) new7d++;
    if (created >= d30) new30d++;
    if (updated >= d7) active7d++;
    if (updated >= d30) active30d++;

    const dateKey = created.toISOString().slice(0, 10);
    regMap[dateKey] = (regMap[dateKey] || 0) + 1;
  }

  const registrationDates = Object.entries(regMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return {
    total, withGames, withDesc, withSlots, withTelegram, withAge, withRanks,
    new7d, new30d, active7d, active30d,
    avgProfileCompleteness: total > 0 ? Math.round((totalCompleteness / total) * 100) : 0,
    languages, playTimes, registrationDates,
  };
}

function MetricCard({ icon: Icon, label, value, sub, color = "text-primary" }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <motion.div variants={fadeUp} transition={spring}>
      <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className={`mt-2 text-3xl font-extrabold ${color}`}>{value}</p>
              {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
            </div>
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CompletionRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const isLow = pct < 30;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold ${isLow ? "text-destructive" : "text-foreground"}`}>
          {value}/{total} ({pct}%)
        </span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactCount, setContactCount] = useState(0);

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { count }] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
      ]);
      if (profiles) setStats(computeStats(profiles as unknown as ProfileRow[]));
      setContactCount(count ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <BarChart3 className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!stats) return null;

  const retentionRate = stats.total > 0 ? Math.round((stats.active30d / stats.total) * 100) : 0;
  const problems: string[] = [];
  if (stats.avgProfileCompleteness < 50) problems.push("Низкая заполняемость профилей — пользователи не завершают настройку");
  if (stats.withGames === 0) problems.push("Ни один пользователь не указал игры — возможна проблема с UX");
  if (stats.active7d === 0) problems.push("Нет активных пользователей за последнюю неделю");
  if (stats.withDesc === 0) problems.push("Никто не заполнил описание профиля");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Аналитика продукта</h1>
              <p className="text-xs text-muted-foreground">Naka<span className="text-primary">ma</span> — дашборд</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-4 w-4" />
            Обновлено сейчас
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 space-y-8">
        {/* KPI Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <MetricCard icon={Users} label="Всего пользователей" value={stats.total} />
          <MetricCard icon={TrendingUp} label="Новые (30д)" value={stats.new30d} sub={`За 7 дней: ${stats.new7d}`} />
          <MetricCard icon={UserCheck} label="Активные (30д)" value={stats.active30d} sub={`За 7 дней: ${stats.active7d}`} />
          <MetricCard
            icon={Target}
            label="Retention 30д"
            value={`${retentionRate}%`}
            color={retentionRate > 50 ? "text-green-500" : retentionRate > 20 ? "text-yellow-500" : "text-destructive"}
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Profile Completeness */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ ...spring, delay: 0.2 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-5 w-5 text-primary" />
                  Заполняемость профилей
                </CardTitle>
                <CardDescription>
                  Средняя заполняемость:{" "}
                  <span className={`font-bold ${stats.avgProfileCompleteness < 50 ? "text-destructive" : "text-green-500"}`}>
                    {stats.avgProfileCompleteness}%
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CompletionRow label="Указали игры" value={stats.withGames} total={stats.total} />
                <CompletionRow label="Заполнили описание" value={stats.withDesc} total={stats.total} />
                <CompletionRow label="Указали возраст" value={stats.withAge} total={stats.total} />
                <CompletionRow label="Настроили расписание" value={stats.withSlots} total={stats.total} />
                <CompletionRow label="Указали ранги" value={stats.withRanks} total={stats.total} />
                <CompletionRow label="Привязали Telegram" value={stats.withTelegram} total={stats.total} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Distribution Cards */}
          <div className="space-y-6">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ ...spring, delay: 0.3 }}>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-5 w-5 text-primary" />
                    Языки пользователей
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.languages).map(([lang, count]) => (
                      <div key={lang} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{lang}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-primary/20" style={{ width: `${Math.max(40, (count / stats.total) * 200)}px` }}>
                            <div className="h-full rounded-full bg-primary" style={{ width: `${(count / stats.total) * 100}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-foreground">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ ...spring, delay: 0.4 }}>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-5 w-5 text-primary" />
                    Время игры
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.playTimes).map(([time, count]) => (
                      <div key={time} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{time}</span>
                        <span className="text-sm font-semibold text-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Registration Timeline */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ ...spring, delay: 0.5 }}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5 text-primary" />
                Регистрации по дням
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-32">
                {stats.registrationDates.map(({ date, count }) => {
                  const maxCount = Math.max(...stats.registrationDates.map(d => d.count));
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={date} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-foreground">{count}</span>
                      <div
                        className="w-full min-w-[16px] max-w-[48px] rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                        style={{ height: `${Math.max(height, 8)}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(date).toLocaleDateString("ru", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Engagement + Problems */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ ...spring, delay: 0.6 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Активность
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">Обращения (контакт-форма)</span>
                  <span className="text-lg font-bold text-foreground">{contactCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">Retention 7д</span>
                  <span className="text-lg font-bold text-foreground">
                    {stats.total > 0 ? Math.round((stats.active7d / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">Retention 30д</span>
                  <span className="text-lg font-bold text-foreground">{retentionRate}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ ...spring, delay: 0.7 }}>
            <Card className={`border-border/50 bg-card/80 backdrop-blur-sm ${problems.length > 0 ? "border-destructive/30" : "border-green-500/30"}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {problems.length > 0
                    ? <AlertTriangle className="h-5 w-5 text-destructive" />
                    : <CheckCircle2 className="h-5 w-5 text-green-500" />
                  }
                  {problems.length > 0 ? "Выявленные проблемы" : "Всё в порядке"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {problems.length > 0 ? (
                  <ul className="space-y-3">
                    {problems.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        <span className="text-muted-foreground">{p}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Критических проблем не обнаружено</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
