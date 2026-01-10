import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, type TransactionFormData } from '@/lib/schemas/transactionSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { Transaction } from '@/types/project';

interface TransactionFormProps {
  projectId: string;
  currency: string;
  editingTransaction?: Transaction | null;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel?: () => void;
}

export function TransactionForm({ projectId, currency, editingTransaction, onSubmit, onCancel }: TransactionFormProps) {
  const { t } = useTranslation();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: editingTransaction ? {
      type: editingTransaction.type,
      amount: editingTransaction.amount,
      category: editingTransaction.category || '',
      note: editingTransaction.note || '',
      transaction_date: editingTransaction.transaction_date,
    } : {
      type: 'income',
      amount: 0,
      category: '',
      note: '',
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = async (data: TransactionFormData) => {
    await onSubmit(data);
    if (!editingTransaction) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('type')} *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">{t('income')}</SelectItem>
                  <SelectItem value="expense">{t('expense')}</SelectItem>
                  <SelectItem value="savings">{t('savings')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('amount')} * ({currency})</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('category')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('categoryPlaceholder')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('notes')}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="transaction_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('date')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingTransaction ? t('saveChanges') : t('add')}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('cancel')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
