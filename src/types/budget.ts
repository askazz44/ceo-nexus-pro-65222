export interface CategoryBudget {
  id: string;
  user_id: string;
  category: string;
  budget_limit: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetAlert {
  category: string;
  budgetLimit: number;
  currentSpent: number;
  percentage: number;
  isOverBudget: boolean;
  currency: string;
}
