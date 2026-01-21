'use client';

import { useState } from 'react';
import { Transaction, TransactionType, Category, MonthlyStats } from '../types';

const CATEGORIES: Category[] = [
  '食費',
  '交通費',
  '娯楽',
  '医療費',
  '住居費',
  '光熱費',
  '通信費',
  '給与',
  'その他',
];

interface OverviewTabProps {
  transactions: Transaction[];
  selectedMonth: string;
  onAddTransaction: (
    type: TransactionType,
    amount: number,
    date: string,
    category: Category,
    description: string
  ) => void;
  onMonthChange: (month: string) => void;
}

export default function OverviewTab({
  transactions,
  selectedMonth,
  onAddTransaction,
}: OverviewTabProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('0');
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<Category>('その他');
  const [description, setDescription] = useState<string>('');

  // Calculate monthly stats
  const getMonthlyStats = (): MonthlyStats => {
    const monthTransactions = transactions.filter(
      (t) => t.date.substring(0, 7) === selectedMonth
    );

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      incomeCount: monthTransactions.filter((t) => t.type === 'income').length,
      expenseCount: monthTransactions.filter((t) => t.type === 'expense')
        .length,
    };
  };

  const stats = getMonthlyStats();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onAddTransaction(type, numAmount, date, category, description);
      setAmount('0');
      setDescription('');
    }
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${year}年${parseInt(monthNum)}月`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">
        {formatMonth(selectedMonth)}の収支
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">収入</span>
            <span className="text-green-600">📈</span>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            ¥{stats.income.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">{stats.incomeCount}件の取引</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">支出</span>
            <span className="text-red-600">📉</span>
          </div>
          <div className="text-3xl font-bold text-red-600 mb-1">
            ¥{stats.expense.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">
            {stats.expenseCount}件の取引
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">収支</span>
            <span className="text-blue-600">💰</span>
          </div>
          <div
            className={`text-3xl font-bold mb-1 ${
              stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}
          >
            {stats.balance >= 0 ? '+' : '-'}¥
            {Math.abs(stats.balance).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">赤字</div>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>➕</span>
          新しい取引を追加
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Transaction Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              取引種類
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="income"
                  checked={type === 'income'}
                  onChange={(e) => setType(e.target.value as TransactionType)}
                  className="mr-2"
                />
                <span className="text-green-600 font-medium">収入</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="expense"
                  checked={type === 'expense'}
                  onChange={(e) => setType(e.target.value as TransactionType)}
                  className="mr-2"
                />
                <span className="text-red-600 font-medium">支出</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                金額
              </label>
              <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
                <span className="text-gray-500 mr-2">¥</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 outline-none"
                  min="0"
                  step="1"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日付
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明（任意）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="詳細を入力してください"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            追加
          </button>
        </form>
      </div>
    </div>
  );
}
