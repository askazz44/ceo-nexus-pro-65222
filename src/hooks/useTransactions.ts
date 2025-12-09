import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  const loadAllTransactions = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('project_id', projectId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      
      const all = data || [];
      setAllTransactions(all);
      
      // Paginate from allTransactions locally
      const from = page * itemsPerPage;
      const to = from + itemsPerPage;
      setTransactions(all.slice(from, to));
      setTotalPages(Math.ceil(all.length / itemsPerPage));
    } catch (error: any) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Update pagination when page changes (without refetching)
  useEffect(() => {
    const from = page * itemsPerPage;
    const to = from + itemsPerPage;
    setTransactions(allTransactions.slice(from, to));
    setTotalPages(Math.ceil(allTransactions.length / itemsPerPage));
  }, [page, itemsPerPage, allTransactions]);

  useEffect(() => {
    loadAllTransactions();
  }, [loadAllTransactions]);

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
    refetch: loadAllTransactions,
  };
}
