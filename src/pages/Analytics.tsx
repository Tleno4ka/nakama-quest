import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BarChart3, Activity, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OverviewDashboard, { computeStats, type Stats, type ProfileRow } from "@/components/analytics/OverviewDashboard";
import FunnelDashboard from "@/components/analytics/FunnelDashboard";

export default function Analytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactCount, setContactCount] = useState(0);

  useEffect(() => {
    async function load() {
      const [{ data: profilesData }, { count }] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
      ]);
      if (profilesData) {
        const rows = profilesData as unknown as ProfileRow[];
        setProfiles(rows);
        setStats(computeStats(rows));
      }
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

  return (
    <div className="min-h-screen bg-background">
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="funnel" className="gap-2">
              <Filter className="h-4 w-4" />
              Воронка AARRR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewDashboard stats={stats} contactCount={contactCount} />
          </TabsContent>

          <TabsContent value="funnel">
            <FunnelDashboard profiles={profiles} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
