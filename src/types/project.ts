export interface Project {
  id: string;
  user_id: string;
  name: string;
  industry: string | null;
  description: string | null;
  target_revenue: number | null;
  currency: string;
  start_date: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithTransactions extends Project {
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  project_id: string;
  type: 'income' | 'expense' | 'savings';
  amount: number;
  category: string | null;
  note: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectStats {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  netProfit: number;
  transactionCount: number;
}
