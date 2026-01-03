import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { useCategoryBudgets } from '@/hooks/useCategoryBudgets';
import type { CategoryBudget } from '@/types/budget';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'];

export function BudgetManager() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const numberLocale = language === 'it' ? 'it-IT' : 'en-US';
  const { budgets, addBudget, updateBudget, deleteBudget, loading } = useCategoryBudgets();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<CategoryBudget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [category, setCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [currency, setCurrency] = useState('EUR');

  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat(numberLocale, {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  const resetForm = () => {
    setCategory('');
    setBudgetLimit('');
    setCurrency('EUR');
    setEditingBudget(null);
  };

  const handleSubmit = async () => {
    if (!category.trim() || !budgetLimit) {
      toast({ title: t('error'), description: t('fillAllFields'), variant: 'destructive' });
      return;
    }

    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, parseFloat(budgetLimit));
        toast({ title: t('budgetUpdated') });
      } else {
        await addBudget(category.trim(), parseFloat(budgetLimit), currency);
        toast({ title: t('budgetAdded') });
      }
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (budget: CategoryBudget) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setBudgetLimit(budget.budget_limit.toString());
    setCurrency(budget.currency);
    setIsOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBudget(deleteId);
      toast({ title: t('budgetDeleted') });
      setDeleteId(null);
    } catch (error: any) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    }
  };

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('categoryBudgets')}</CardTitle>
            <CardDescription>{t('setSpendingLimits')}</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t('addBudget')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBudget ? t('editBudget') : t('addBudget')}</DialogTitle>
                <DialogDescription>{t('setBudgetForCategory')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{t('category')}</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={t('categoryPlaceholder')}
                    disabled={!!editingBudget}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('budgetLimit')}</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(e.target.value)}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('currency')}</Label>
                    <Select value={currency} onValueChange={setCurrency} disabled={!!editingBudget}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingBudget ? t('saveChanges') : t('addBudget')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-4">{t('loading')}</p>
          ) : budgets.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">{t('noBudgetsSet')}</p>
          ) : (
            <div className="space-y-2">
              {budgets.map((budget) => (
                <div key={budget.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{budget.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(budget.budget_limit, budget.currency)} / {t('month')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(budget)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(budget.id)}>
                      <Trash2 className="h-4 w-4 text-expense" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDeletion')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteBudgetWarning')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-expense hover:bg-expense/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
