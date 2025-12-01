import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import type { Transaction, ProjectStats } from '@/types/project';

interface UseTransactionsOptions {
  projectId: string | undefined;
  page?: number;
  itemsPerPage?: number;
}

export function useTransactions({ projectId, page = 0, itemsPerPage = 20 }: UseTransactionsOptions) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();
  const { t } = useTranslation();

  const loadTransactions = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const from = page * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId)
        .order('transaction_date', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setTransactions(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, page, itemsPerPage, toast, t]);

  const loadAllTransactions = useCallback(async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('project_id', projectId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setAllTransactions(data || []);
    } catch (error: any) {
      console.error('Error loading all transactions:', error);
    }
  }, [projectId]);

  useEffect(() => {
    loadTransactions();
    loadAllTransactions();
  }, [loadTransactions, loadAllTransactions]);

  const stats: ProjectStats = useMemo(() => {
    const totalIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpense = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      transactionCount: allTransactions.length,
    };
  }, [allTransactions]);

  return {
    transactions,
    allTransactions,
    stats,
    loading,
    totalPages,
    refetch: loadTransactions,
  };
}
