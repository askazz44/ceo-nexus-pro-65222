import { BudgetManager } from '@/components/budgets/BudgetManager';
import { BudgetAlerts } from '@/components/budgets/BudgetAlerts';
import { useCategoryBudgets } from '@/hooks/useCategoryBudgets';
import { useTranslation } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';
import { PiggyBank } from 'lucide-react';

export default function Budgets() {
  const { t } = useTranslation();
  const { budgetAlerts, loading } = useCategoryBudgets();

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative">
        <div className="absolute -top-20 left-0 w-64 h-64 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <PiggyBank className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('budgets')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('manageBudgets')}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BudgetManager />
        {budgetAlerts.length > 0 && <BudgetAlerts alerts={budgetAlerts} />}
      </div>
    </div>
  );
}
