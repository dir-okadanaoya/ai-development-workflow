export type TransactionType = 'income' | 'expense';

export type Category =
  | '食費'
  | '交通費'
  | '娯楽'
  | '医療費'
  | '住居費'
  | '光熱費'
  | '通信費'
  | '給与'
  | 'その他';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  category: Category;
  description: string;
}

export interface MonthlyStats {
  income: number;
  expense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
}
