import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/hooks/useLocale';
import type { ProjectStats } from '@/types/project';

interface ProjectStatsProps {
  stats: ProjectStats;
  currency: string;
}

export function ProjectStatsCards({ stats, currency }: ProjectStatsProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLocale();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('totalIncome')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-income" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-income">
            {formatCurrency(stats.totalIncome, currency)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('totalExpenses')}</CardTitle>
          <TrendingDown className="h-4 w-4 text-expense" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-expense">
            {formatCurrency(stats.totalExpense, currency)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('netProfit')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatCurrency(stats.netProfit, currency)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
