import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, eachMonthOfInterval, parseISO, subMonths } from "date-fns";
import { enUS, it as itLocale } from "date-fns/locale";
import { Calendar, TrendingUp, PieChartIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { Transaction } from "@/types/project";

interface ProjectChartsProps {
  transactions: Transaction[];
  currency: string;
}

export function ProjectCharts({ transactions, currency }: ProjectChartsProps) {
  const { t, language } = useTranslation();
  const numberLocale = language === 'it' ? 'it-IT' : 'en-US';
  const dLocale = language === 'it' ? itLocale : enUS;
  const [timeRange, setTimeRange] = useState<"week" | "month" | "3months" | "year">("month");

  const COLORS = [
    'hsl(var(--primary))', 
    'hsl(var(--accent))', 
    'hsl(var(--income))', 
    'hsl(var(--expense))', 
    'hsl(var(--chart-1))', 
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
  ];

  const timeSeriesData = useMemo(() => {
    const now = new Date();
    let intervals: Date[] = [];
    let dateFormat = "dd MMM";
    
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
    } else if (timeRange === "3months") {
      intervals = eachDayOfInterval({
        start: startOfMonth(subMonths(now, 2)),
        end: endOfMonth(now)
      });
      dateFormat = "dd/MM";
    } else {
      intervals = eachMonthOfInterval({
        start: new Date(now.getFullYear(), 0, 1),
        end: now
      });
      dateFormat = "MMM";
    }

    return intervals.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      let income = 0;
      let expense = 0;
      let savings = 0;

      transactions.forEach((t) => {
        try {
          if (!t.transaction_date) return;
          
          if (timeRange === "year") {
            const tMonth = format(parseISO(t.transaction_date), "yyyy-MM");
            const intervalMonth = format(date, "yyyy-MM");
            if (tMonth === intervalMonth) {
              if (t.type === "income") income += Number(t.amount || 0);
              else if (t.type === "savings") savings += Number(t.amount || 0);
              else expense += Number(t.amount || 0);
            }
          } else {
            const tDate = format(parseISO(t.transaction_date), "yyyy-MM-dd");
            if (tDate === dateStr) {
              if (t.type === "income") income += Number(t.amount || 0);
              else if (t.type === "savings") savings += Number(t.amount || 0);
              else expense += Number(t.amount || 0);
            }
          }
        } catch (error) {
          console.error("Error parsing transaction date:", error);
        }
      });

      return {
        date: format(date, dateFormat, { locale: dLocale }),
        income,
        expense,
        savings,
        profit: income - expense - savings
      };
    });
  }, [transactions, timeRange, dLocale]);

  const uncategorizedLabel = t('uncategorized');

  const categoryExpenseData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    
    transactions.forEach((tx) => {
      if (tx.type === "expense") {
        const cat = tx.category || uncategorizedLabel;
        categories[cat] = (categories[cat] || 0) + Number(tx.amount);
      }
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, uncategorizedLabel]);

  const categoryIncomeData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    
    transactions.forEach((tx) => {
      if (tx.type === "income") {
        const cat = tx.category || uncategorizedLabel;
        categories[cat] = (categories[cat] || 0) + Number(tx.amount);
      }
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, uncategorizedLabel]);

  const monthlyComparisonData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(now, 5),
      end: now
    });

    return months.map(month => {
      const monthStr = format(month, "yyyy-MM");
      let income = 0;
      let expense = 0;
      let savings = 0;

      transactions.forEach((t) => {
        if (!t.transaction_date) return;
        const tMonth = format(parseISO(t.transaction_date), "yyyy-MM");
        if (tMonth === monthStr) {
          if (t.type === "income") income += Number(t.amount || 0);
          else if (t.type === "savings") savings += Number(t.amount || 0);
          else expense += Number(t.amount || 0);
        }
      });

      return {
        month: format(month, "MMM", { locale: dLocale }),
        income,
        expense,
        savings
      };
    });
  }, [transactions, dLocale]);

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">{t('noTransactionsForCharts')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
          <SelectTrigger className="w-[180px] border-primary/20 bg-card/50 backdrop-blur-sm">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{t('lastWeek')}</SelectItem>
            <SelectItem value="month">{t('lastMonth')}</SelectItem>
            <SelectItem value="3months">{t('last3Months')}</SelectItem>
            <SelectItem value="year">{t('thisYear')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trend Chart */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t('temporalTrend')}
          </CardTitle>
          <CardDescription>{t('incomeExpensePeriod')}</CardDescription>
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
                formatter={(value: any) => new Intl.NumberFormat(numberLocale, { style: 'currency', currency }).format(value)}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="hsl(var(--income))" strokeWidth={2} name={t('incomeLabel')} dot={{ fill: 'hsl(var(--income))' }} />
              <Line type="monotone" dataKey="expense" stroke="hsl(var(--expense))" strokeWidth={2} name={t('expenseLabel')} dot={{ fill: 'hsl(var(--expense))' }} />
              <Line type="monotone" dataKey="savings" stroke="hsl(var(--savings))" strokeWidth={2} name={t('savingsLabel')} dot={{ fill: 'hsl(var(--savings))' }} />
              <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" strokeWidth={2} name={t('profitLabel')} dot={{ fill: 'hsl(var(--primary))' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Comparison Bar Chart */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">{t('monthlyComparison')}</CardTitle>
          <CardDescription>{t('last6Months')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => new Intl.NumberFormat(numberLocale, { style: 'currency', currency }).format(value)}
              />
              <Legend />
              <Bar dataKey="income" fill="hsl(var(--income))" name={t('incomeLabel')} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="hsl(var(--expense))" name={t('expenseLabel')} radius={[4, 4, 0, 0]} />
              <Bar dataKey="savings" fill="hsl(var(--savings))" name={t('savingsLabel')} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        {categoryExpenseData.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-expense" />
                {t('expensesByCategory')}
              </CardTitle>
              <CardDescription>{t('expenseDistribution')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryExpenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryExpenseData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => new Intl.NumberFormat(numberLocale, { style: 'currency', currency }).format(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {categoryIncomeData.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-income" />
                {t('incomeByCategory')}
              </CardTitle>
              <CardDescription>{t('incomeDistribution')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryIncomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryIncomeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => new Intl.NumberFormat(numberLocale, { style: 'currency', currency }).format(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
