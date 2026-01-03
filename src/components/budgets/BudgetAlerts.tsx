import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/lib/i18n';
import type { BudgetAlert } from '@/types/budget';

interface BudgetAlertsProps {
  alerts: BudgetAlert[];
}

export function BudgetAlerts({ alerts }: BudgetAlertsProps) {
  const { t, language } = useTranslation();
  const numberLocale = language === 'it' ? 'it-IT' : 'en-US';

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(numberLocale, {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (alerts.length === 0) return null;

  const overBudget = alerts.filter(a => a.isOverBudget);
  const warningBudgets = alerts.filter(a => a.percentage >= 80 && !a.isOverBudget);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {overBudget.length > 0 ? (
            <AlertTriangle className="h-5 w-5 text-expense" />
          ) : warningBudgets.length > 0 ? (
            <TrendingUp className="h-5 w-5 text-warning" />
          ) : (
            <CheckCircle className="h-5 w-5 text-income" />
          )}
          {t('budgetStatus')}
        </CardTitle>
        <CardDescription>{t('monthlyBudgetTracking')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.category} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{alert.category}</span>
              <span className={alert.isOverBudget ? 'text-expense font-semibold' : 'text-muted-foreground'}>
                {formatCurrency(alert.currentSpent, alert.currency)} / {formatCurrency(alert.budgetLimit, alert.currency)}
              </span>
            </div>
            <Progress 
              value={Math.min(alert.percentage, 100)} 
              className={`h-2 ${
                alert.isOverBudget 
                  ? '[&>div]:bg-expense' 
                  : alert.percentage >= 80 
                    ? '[&>div]:bg-warning' 
                    : '[&>div]:bg-income'
              }`}
            />
            {alert.isOverBudget && (
              <p className="text-xs text-expense flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {t('overBudgetBy')} {formatCurrency(alert.currentSpent - alert.budgetLimit, alert.currency)}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
