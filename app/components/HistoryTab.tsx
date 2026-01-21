'use client';

import { useState } from 'react';
import { Transaction, TransactionType, Category } from '../types';

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

interface HistoryTabProps {
  transactions: Transaction[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function HistoryTab({
  transactions,
  selectedMonth,
  onUpdateTransaction,
  onDeleteTransaction,
}: HistoryTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Transaction | null>(null);

  const monthTransactions = transactions
    .filter((t) => t.date.substring(0, 7) === selectedMonth)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${year}年${parseInt(monthNum)}月`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({ ...transaction });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (editForm && editingId) {
      onUpdateTransaction(editingId, {
        type: editForm.type,
        amount: editForm.amount,
        date: editForm.date,
        category: editForm.category,
        description: editForm.description,
      });
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('この取引を削除しますか？')) {
      onDeleteTransaction(id);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">取引履歴</h2>
      <p className="text-center text-gray-600 mb-6">
        {formatMonth(selectedMonth)}
      </p>

      {monthTransactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">取引履歴がありません</p>
          <p className="text-sm mt-2">概要タブから取引を追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {monthTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {editingId === transaction.id && editForm ? (
                // Edit Mode
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={editForm.type === 'income'}
                        onChange={() =>
                          setEditForm({ ...editForm, type: 'income' })
                        }
                        className="mr-2"
                      />
                      <span className="text-green-600 font-medium">収入</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={editForm.type === 'expense'}
                        onChange={() =>
                          setEditForm({ ...editForm, type: 'expense' })
                        }
                        className="mr-2"
                      />
                      <span className="text-red-600 font-medium">支出</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        金額
                      </label>
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            amount: parseFloat(e.target.value),
                          })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        日付
                      </label>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) =>
                          setEditForm({ ...editForm, date: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      カテゴリ
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          category: e.target.value as Category,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      説明
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`text-2xl font-bold ${
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '📈' : '📉'}{' '}
                      {transaction.type === 'income' ? '+' : '-'}¥
                      {transaction.amount.toLocaleString()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {transaction.category}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </div>
                      {transaction.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {transaction.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(transaction)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="編集"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
