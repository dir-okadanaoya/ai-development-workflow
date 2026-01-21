'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import OverviewTab from './OverviewTab';
import HistoryTab from './HistoryTab';
import BreakdownTab from './BreakdownTab';

type TabType = 'overview' | 'history' | 'breakdown';

export default function BudgetApp() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-01');

  // Load transactions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (
    type: TransactionType,
    amount: number,
    date: string,
    category: Category,
    description: string
  ) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount,
      date,
      category,
      description,
    };
    setTransactions([...transactions, newTransaction]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(
      transactions.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">💰</span>
            <h1 className="text-3xl font-bold text-gray-800">家計簿アプリ</h1>
          </div>
          <p className="text-gray-600">収入と支出を記録して、家計を管理しましょう</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white shadow-md text-gray-800'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            📈 概要
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white shadow-md text-gray-800'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            📋 取引履歴
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              activeTab === 'breakdown'
                ? 'bg-white shadow-md text-gray-800'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            🥧 カテゴリ内訳
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'overview' && (
            <OverviewTab
              transactions={transactions}
              selectedMonth={selectedMonth}
              onAddTransaction={addTransaction}
              onMonthChange={setSelectedMonth}
            />
          )}
          {activeTab === 'history' && (
            <HistoryTab
              transactions={transactions}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onUpdateTransaction={updateTransaction}
              onDeleteTransaction={deleteTransaction}
            />
          )}
          {activeTab === 'breakdown' && (
            <BreakdownTab
              transactions={transactions}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
          )}
        </div>
      </div>
    </div>
  );
}
