import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CategoryBudget, BudgetAlert } from '@/types/budget';

interface ExpenseByCategory {
  category: string;
  amount: number;
}

export function useCategoryBudgets() {
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategory[]>([]);

  const loadBudgets = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('category_budgets')
        .select('*')
        .order('category');

      if (error) throw error;
      setBudgets((data || []) as CategoryBudget[]);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCurrentMonthExpenses = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Get all user's projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id');

      if (!projects || projects.length === 0) {
        setExpensesByCategory([]);
        return;
      }

      const projectIds = projects.map(p => p.id);

      // Get expenses for current month across all projects
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('category, amount')
        .in('project_id', projectIds)
        .eq('type', 'expense')
        .gte('transaction_date', startOfMonth)
        .lte('transaction_date', endOfMonth);

      if (error) throw error;

      // Aggregate by category (normalize with trim for consistent matching)
      const categoryTotals: { [key: string]: number } = {};
      (transactions || []).forEach(t => {
        const cat = (t.category || 'Uncategorized').trim();
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
      });

      setExpensesByCategory(
        Object.entries(categoryTotals).map(([category, amount]) => ({
          category,
          amount,
        }))
      );
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
    loadCurrentMonthExpenses();
  }, [loadBudgets, loadCurrentMonthExpenses]);

  const budgetAlerts = useMemo((): BudgetAlert[] => {
    return budgets.map(budget => {
      // Normalize: trim whitespace and compare case-insensitively
      const budgetCategoryNormalized = budget.category.trim().toLowerCase();
      const expense = expensesByCategory.find(e => 
        e.category.trim().toLowerCase() === budgetCategoryNormalized
      );
      const currentSpent = expense?.amount || 0;
      const percentage = budget.budget_limit > 0 ? (currentSpent / budget.budget_limit) * 100 : 0;

      return {
        category: budget.category,
        budgetLimit: budget.budget_limit,
        currentSpent,
        percentage,
        isOverBudget: percentage >= 100,
        currency: budget.currency,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [budgets, expensesByCategory]);

  const addBudget = async (category: string, budgetLimit: number, currency: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('category_budgets')
      .insert({
        user_id: user.id,
        category,
        budget_limit: budgetLimit,
        currency,
      });

    if (error) throw error;
    await loadBudgets();
  };

  const updateBudget = async (id: string, budgetLimit: number) => {
    const { error } = await supabase
      .from('category_budgets')
      .update({ budget_limit: budgetLimit })
      .eq('id', id);

    if (error) throw error;
    await loadBudgets();
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase
      .from('category_budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await loadBudgets();
  };

  return {
    budgets,
    budgetAlerts,
    loading,
    addBudget,
    updateBudget,
    deleteBudget,
    refetch: () => {
      loadBudgets();
      loadCurrentMonthExpenses();
    },
  };
}
