import { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { ProjectWithTransactions } from '@/types/project';

export default function ComparativeAnalysis() {
  const { t, language } = useTranslation();
  const numberLocale = language === 'it' ? 'it-IT' : 'en-US';
  const { projects, loading } = useProjects(true) as { projects: ProjectWithTransactions[], loading: boolean };
  
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const projectStats = useMemo(() => {
    return projects.map(project => {
      const transactions = project.transactions || [];
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const profit = income - expense;
      const profitMargin = income > 0 ? (profit / income) * 100 : 0;
      const transactionCount = transactions.length;
      const avgTransactionValue = transactionCount > 0 
        ? transactions.reduce((sum, t) => sum + Number(t.amount), 0) / transactionCount 
        : 0;

      return {
        id: project.id,
        name: project.name,
        currency: project.currency,
        income,
        expense,
        profit,
        profitMargin,
        transactionCount,
        avgTransactionValue,
        targetRevenue: project.target_revenue || 0,
        progressToTarget: project.target_revenue ? (income / project.target_revenue) * 100 : 0,
      };
    });
  }, [projects]);

  const comparedProjects = useMemo(() => {
    if (selectedProjects.length === 0) return projectStats.slice(0, 4);
    return projectStats.filter(p => selectedProjects.includes(p.id));
  }, [projectStats, selectedProjects]);

  const barChartData = useMemo(() => {
    return comparedProjects.map(p => ({
      name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
      [t('incomeLabel')]: p.income,
      [t('expenseLabel')]: p.expense,
      [t('profitLabel')]: p.profit,
    }));
  }, [comparedProjects, t]);

  const radarData = useMemo(() => {
    const maxValues = {
      income: Math.max(...comparedProjects.map(p => p.income), 1),
      expense: Math.max(...comparedProjects.map(p => p.expense), 1),
      profit: Math.max(...comparedProjects.map(p => Math.abs(p.profit)), 1),
      transactions: Math.max(...comparedProjects.map(p => p.transactionCount), 1),
      profitMargin: 100,
    };

    return [
      {
        metric: t('incomeLabel'),
        ...Object.fromEntries(comparedProjects.map(p => [p.name, (p.income / maxValues.income) * 100])),
      },
      {
        metric: t('expenseLabel'),
        ...Object.fromEntries(comparedProjects.map(p => [p.name, (p.expense / maxValues.expense) * 100])),
      },
      {
        metric: t('profitLabel'),
        ...Object.fromEntries(comparedProjects.map(p => [p.name, (Math.abs(p.profit) / maxValues.profit) * 100])),
      },
      {
        metric: t('transactions'),
        ...Object.fromEntries(comparedProjects.map(p => [p.name, (p.transactionCount / maxValues.transactions) * 100])),
      },
      {
        metric: t('profitMargin'),
        ...Object.fromEntries(comparedProjects.map(p => [p.name, Math.max(0, p.profitMargin)])),
      },
    ];
  }, [comparedProjects, t]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--income))', 'hsl(var(--expense))'];

  const formatCurrency = (value: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat(numberLocale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), projectId];
      }
      return [...prev, projectId];
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (projects.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ArrowLeftRight className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('needMoreProjects')}</h2>
        <p className="text-muted-foreground">{t('createMoreProjectsToCompare')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative">
        <div className="absolute -top-20 right-0 w-64 h-64 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('comparativeAnalysis')}
            </h1>
            <p className="text-muted-foreground mt-2">{t('compareProjectsPerformance')}</p>
          </div>
        </div>
      </div>

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('selectProjectsToCompare')}</CardTitle>
          <CardDescription>{t('selectUpTo4Projects')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {projects.map((project) => (
              <Badge
                key={project.id}
                variant={selectedProjects.includes(project.id) ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleProject(project.id)}
              >
                {project.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {comparedProjects.map((project, index) => (
          <Card key={project.id} className="border-l-4" style={{ borderLeftColor: COLORS[index % COLORS.length] }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium truncate">{project.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t('incomeLabel')}</span>
                <span className="text-sm font-medium text-income">{formatCurrency(project.income, project.currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t('expenseLabel')}</span>
                <span className="text-sm font-medium text-expense">{formatCurrency(project.expense, project.currency)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">{t('profitLabel')}</span>
                <span className={`text-sm font-bold ${project.profit >= 0 ? 'text-income' : 'text-expense'}`}>
                  {formatCurrency(project.profit, project.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t('profitMargin')}</span>
                <Badge variant={project.profitMargin >= 0 ? 'default' : 'destructive'}>
                  {project.profitMargin.toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{t('revenueComparison')}</CardTitle>
            <CardDescription>{t('incomeExpenseByProject')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey={t('incomeLabel')} fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
                <Bar dataKey={t('expenseLabel')} fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
                <Bar dataKey={t('profitLabel')} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{t('performanceRadar')}</CardTitle>
            <CardDescription>{t('multiDimensionalComparison')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                {comparedProjects.map((project, index) => (
                  <Radar
                    key={project.id}
                    name={project.name}
                    dataKey={project.name}
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => `${value.toFixed(0)}%`}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{t('detailedComparison')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">{t('projectName')}</th>
                  <th className="text-right py-3 px-4 font-medium">{t('incomeLabel')}</th>
                  <th className="text-right py-3 px-4 font-medium">{t('expenseLabel')}</th>
                  <th className="text-right py-3 px-4 font-medium">{t('profitLabel')}</th>
                  <th className="text-right py-3 px-4 font-medium">{t('profitMargin')}</th>
                  <th className="text-right py-3 px-4 font-medium">{t('transactions')}</th>
                  <th className="text-right py-3 px-4 font-medium">{t('avgTransaction')}</th>
                </tr>
              </thead>
              <tbody>
                {comparedProjects.map((project, index) => (
                  <tr key={project.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{project.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-income">{formatCurrency(project.income, project.currency)}</td>
                    <td className="text-right py-3 px-4 text-expense">{formatCurrency(project.expense, project.currency)}</td>
                    <td className={`text-right py-3 px-4 font-medium ${project.profit >= 0 ? 'text-income' : 'text-expense'}`}>
                      {formatCurrency(project.profit, project.currency)}
                    </td>
                    <td className="text-right py-3 px-4">
                      <Badge variant={project.profitMargin >= 20 ? 'default' : project.profitMargin >= 0 ? 'secondary' : 'destructive'}>
                        {project.profitMargin.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4">{project.transactionCount}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">
                      {formatCurrency(project.avgTransactionValue, project.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
