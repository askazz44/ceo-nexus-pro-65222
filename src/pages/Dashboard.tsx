import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, Wallet, FolderKanban, Calendar, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";

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
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

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
      setAllProjects(projects);
      
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
    }

    setLoading(false);
  };

  const filteredProjects = useMemo(() => {
    if (selectedProject === "all") return allProjects;
    return allProjects.filter(p => p.id === selectedProject);
  }, [allProjects, selectedProject]);

  const filteredStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const currency = filteredProjects[0]?.currency || stats.currency;

    filteredProjects.forEach((project) => {
      project.transactions?.forEach((t: any) => {
        if (t.type === "income") {
          totalIncome += parseFloat(t.amount);
        } else {
          totalExpense += parseFloat(t.amount);
        }
      });
    });

    return {
      totalProjects: filteredProjects.length,
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      currency,
    };
  }, [filteredProjects, stats.currency]);

  const timeSeriesData = useMemo(() => {
    const now = new Date();
    let intervals: Date[] = [];
    
    if (timeRange === "week") {
      intervals = eachDayOfInterval({
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 })
      });
    } else if (timeRange === "month") {
      intervals = eachDayOfInterval({
        start: startOfMonth(now),
        end: endOfMonth(now)
      });
    } else {
      intervals = eachMonthOfInterval({
        start: new Date(now.getFullYear(), 0, 1),
        end: now
      });
    }

    return intervals.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      let income = 0;
      let expense = 0;

      filteredProjects.forEach(project => {
        project.transactions?.forEach((t: any) => {
          const tDate = format(parseISO(t.transaction_date), "yyyy-MM-dd");
          if (tDate === dateStr) {
            if (t.type === "income") income += parseFloat(t.amount);
            else expense += parseFloat(t.amount);
          }
        });
      });

      return {
        date: timeRange === "year" ? format(date, "MMM", { locale: it }) : format(date, "dd MMM", { locale: it }),
        income,
        expense,
        profit: income - expense
      };
    });
  }, [filteredProjects, timeRange]);

  const categoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    
    filteredProjects.forEach(project => {
      project.transactions?.forEach((t: any) => {
        if (t.type === "expense" && t.category) {
          categories[t.category] = (categories[t.category] || 0) + parseFloat(t.amount);
        }
      });
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [filteredProjects]);

  const projectsWithProgress = useMemo(() => {
    return filteredProjects.map(project => {
      const projectIncome = project.transactions
        ?.filter((t: any) => t.type === "income")
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0;
      const target = parseFloat(project.target_revenue || 0);
      const progress = target > 0 ? (projectIncome / target) * 100 : 0;

      return { ...project, projectIncome, progress, target };
    }).filter(p => p.target > 0);
  }, [filteredProjects]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--income))', 'hsl(var(--expense))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dashboard Globale
            </h1>
            <p className="text-muted-foreground mt-2">Panoramica di tutti i tuoi progetti</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px] border-primary/20 bg-card/50 backdrop-blur-sm">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtra progetto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i progetti</SelectItem>
                {allProjects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="w-[180px] border-primary/20 bg-card/50 backdrop-blur-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Ultima settimana</SelectItem>
                <SelectItem value="month">Ultimo mese</SelectItem>
                <SelectItem value="year">Quest'anno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
            <div className="text-3xl font-bold">{filteredStats.totalProjects}</div>
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
                currency: filteredStats.currency,
              }).format(filteredStats.totalIncome)}
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
                currency: filteredStats.currency,
              }).format(filteredStats.totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">costi totali</p>
          </CardContent>
        </Card>

        <Card className={`card-hover border-l-4 ${filteredStats.netProfit >= 0 ? 'border-l-income/50 bg-gradient-to-br from-card to-income-light/20' : 'border-l-expense/50 bg-gradient-to-br from-card to-expense-light/20'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profitto Netto</CardTitle>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${filteredStats.netProfit >= 0 ? 'bg-income/10' : 'bg-expense/10'}`}>
              <Wallet className={`h-5 w-5 ${filteredStats.netProfit >= 0 ? 'text-income' : 'text-expense'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${filteredStats.netProfit >= 0 ? 'text-income' : 'text-expense'}`}>
              {new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: filteredStats.currency,
              }).format(filteredStats.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">risultato netto</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Andamento Temporale</CardTitle>
            <CardDescription>Entrate e uscite nel periodo selezionato</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: filteredStats.currency }).format(value)}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="hsl(var(--income))" strokeWidth={2} name="Entrate" />
                <Line type="monotone" dataKey="expense" stroke="hsl(var(--expense))" strokeWidth={2} name="Uscite" />
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" strokeWidth={2} name="Profitto" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {categoryData.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Distribuzione Spese</CardTitle>
              <CardDescription>Spese suddivise per categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: filteredStats.currency }).format(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {projectsWithProgress.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Progressi verso gli Obiettivi</CardTitle>
            <CardDescription>Stato di avanzamento dei progetti con target revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {projectsWithProgress.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat('it-IT', { style: 'currency', currency: project.currency }).format(project.projectIncome)} di {new Intl.NumberFormat('it-IT', { style: 'currency', currency: project.currency }).format(project.target)}
                    </p>
                  </div>
                  <span className={`text-lg font-bold ${project.progress >= 100 ? 'text-income' : 'text-primary'}`}>
                    {project.progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={Math.min(project.progress, 100)} className="h-3" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Progetti Recenti</CardTitle>
          <CardDescription>I tuoi ultimi progetti creati</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Nessun progetto trovato</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.slice(0, 5).map((project) => {
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
