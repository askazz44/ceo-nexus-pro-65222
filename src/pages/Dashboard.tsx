import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, Wallet, FolderKanban } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    currency: "EUR",
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: projects } = await supabase
      .from("projects")
      .select("*, transactions(*)")
      .order("created_at", { ascending: false });

    if (projects) {
      let totalIncome = 0;
      let totalExpense = 0;
      const currency = projects[0]?.currency || "EUR";

      projects.forEach((project) => {
        project.transactions?.forEach((t: any) => {
          if (t.type === "income") {
            totalIncome += parseFloat(t.amount);
          } else {
            totalExpense += parseFloat(t.amount);
          }
        });
      });

      setStats({
        totalProjects: projects.length,
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        currency,
      });

      setRecentProjects(projects.slice(0, 3));
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Globale</h1>
        <p className="text-muted-foreground">Panoramica di tutti i tuoi progetti</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progetti Attivi</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Entrate</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">
              {new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: stats.currency,
              }).format(stats.totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Uscite</CardTitle>
            <TrendingDown className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">
              {new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: stats.currency,
              }).format(stats.totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profitto Netto</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-chart-1' : 'text-chart-2'}`}>
              {new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: stats.currency,
              }).format(stats.netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progetti Recenti</CardTitle>
          <CardDescription>I tuoi ultimi progetti creati</CardDescription>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessun progetto creato
            </p>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => {
                const projectIncome = project.transactions
                  ?.filter((t: any) => t.type === "income")
                  .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0;
                const projectExpense = project.transactions
                  ?.filter((t: any) => t.type === "expense")
                  .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0;
                const projectProfit = projectIncome - projectExpense;

                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <div>
                      <h3 className="font-semibold">{project.name}</h3>
                      {project.industry && (
                        <p className="text-sm text-muted-foreground">{project.industry}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${projectProfit >= 0 ? 'text-chart-1' : 'text-chart-2'}`}>
                        {new Intl.NumberFormat('it-IT', {
                          style: 'currency',
                          currency: project.currency,
                        }).format(projectProfit)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {project.transactions?.length || 0} transazioni
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
