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
    <div className="space-y-6 animate-fade-in">
      <div className="relative">
        <div className="absolute -top-20 left-0 w-64 h-64 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dashboard Globale
        </h1>
        <p className="text-muted-foreground mt-2">Panoramica di tutti i tuoi progetti</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover border-l-4 border-l-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progetti Attivi</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">progetti in gestione</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-income/50 bg-gradient-to-br from-card to-income-light/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Entrate</CardTitle>
            <div className="h-10 w-10 rounded-full bg-income/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-income" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-income">
              {new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: stats.currency,
              }).format(stats.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">ricavi totali</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-expense/50 bg-gradient-to-br from-card to-expense-light/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Uscite</CardTitle>
            <div className="h-10 w-10 rounded-full bg-expense/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-expense" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-expense">
              {new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: stats.currency,
              }).format(stats.totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">costi totali</p>
          </CardContent>
        </Card>

        <Card className={`card-hover border-l-4 ${stats.netProfit >= 0 ? 'border-l-income/50 bg-gradient-to-br from-card to-income-light/20' : 'border-l-expense/50 bg-gradient-to-br from-card to-expense-light/20'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profitto Netto</CardTitle>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stats.netProfit >= 0 ? 'bg-income/10' : 'bg-expense/10'}`}>
              <Wallet className={`h-5 w-5 ${stats.netProfit >= 0 ? 'text-income' : 'text-expense'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-income' : 'text-expense'}`}>
              {new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: stats.currency,
              }).format(stats.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">risultato netto</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Progetti Recenti</CardTitle>
          <CardDescription>I tuoi ultimi progetti creati</CardDescription>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Nessun progetto creato</p>
            </div>
          ) : (
            <div className="space-y-3">
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
                    className="group relative flex items-center justify-between p-5 border rounded-xl hover:shadow-md hover:border-primary/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-card to-accent/5"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                    <div className="relative">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{project.name}</h3>
                      {project.industry && (
                        <p className="text-sm text-muted-foreground mt-1">{project.industry}</p>
                      )}
                    </div>
                    <div className="relative text-right">
                      <p className={`font-bold text-xl ${projectProfit >= 0 ? 'text-income' : 'text-expense'}`}>
                        {new Intl.NumberFormat('it-IT', {
                          style: 'currency',
                          currency: project.currency,
                        }).format(projectProfit)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
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
