import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Transaction, ProjectStats } from '@/types/project';
import type { TransactionFiltersState } from '@/components/project-detail/TransactionFilters';

interface UseTransactionsOptions {
  projectId: string | undefined;
  page?: number;
  itemsPerPage?: number;
  filters?: TransactionFiltersState;
}

export function useTransactions({ projectId, page = 0, itemsPerPage = 20, filters }: UseTransactionsOptions) {
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
      
      setAllTransactions(data || []);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Apply filters and pagination
  const filteredTransactions = useMemo(() => {
    let result = [...allTransactions];

    if (filters) {
      // Filter by type
      if (filters.type !== 'all') {
        result = result.filter(t => t.type === filters.type);
      }

      // Filter by category
      if (filters.category !== 'all') {
        result = result.filter(t => t.category === filters.category);
      }

      // Filter by date range
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        result = result.filter(t => new Date(t.transaction_date) >= fromDate);
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        result = result.filter(t => new Date(t.transaction_date) <= toDate);
      }

      // Filter by search query (note)
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        result = result.filter(t => 
          t.note?.toLowerCase().includes(query) || 
          t.category?.toLowerCase().includes(query)
        );
      }
    }

    return result;
  }, [allTransactions, filters]);

  // Calculate paginated transactions
  useEffect(() => {
    const from = page * itemsPerPage;
    const to = from + itemsPerPage;
    setTransactions(filteredTransactions.slice(from, to));
    setTotalPages(Math.ceil(filteredTransactions.length / itemsPerPage));
  }, [page, itemsPerPage, filteredTransactions]);

  useEffect(() => {
    loadAllTransactions();
  }, [loadAllTransactions]);

  // Stats based on all transactions (unfiltered) for accurate totals
  const stats: ProjectStats = useMemo(() => {
    const totalIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpense = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalSavings = allTransactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalHours = allTransactions
      .reduce((sum, t) => sum + Number(t.hours_worked || 0), 0);

    const netProfit = totalIncome - totalExpense - totalSavings;
    const grossProfit = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      totalSavings,
      netProfit,
      transactionCount: allTransactions.length,
      totalHours,
      roi: totalIncome > 0 ? (grossProfit / totalIncome) * 100 : null,
      hourlyRate: totalHours > 0 ? grossProfit / totalHours : null,
    };
  }, [allTransactions]);

  // Extract unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = allTransactions
      .map(t => t.category)
      .filter((cat): cat is string => !!cat);
    return [...new Set(cats)].sort();
  }, [allTransactions]);

  return {
    transactions,
    allTransactions,
    filteredTransactions,
    stats,
    loading,
    totalPages,
    categories,
    refetch: loadAllTransactions,
  };
}
