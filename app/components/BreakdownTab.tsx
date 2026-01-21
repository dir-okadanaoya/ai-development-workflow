'use client';

import { Transaction, CategoryBreakdown } from '../types';

interface BreakdownTabProps {
  transactions: Transaction[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function BreakdownTab({
  transactions,
  selectedMonth,
}: BreakdownTabProps) {
  const monthTransactions = transactions.filter(
    (t) => t.date.substring(0, 7) === selectedMonth
  );

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${year}年${parseInt(monthNum)}月`;
  };

  const calculateBreakdown = (
    type: 'income' | 'expense'
  ): CategoryBreakdown[] => {
    const filtered = monthTransactions.filter((t) => t.type === type);
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<string, number>();
    filtered.forEach((t) => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });

    const breakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category: category as any,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return breakdown;
  };

  const incomeBreakdown = calculateBreakdown('income');
  const expenseBreakdown = calculateBreakdown('expense');

  const totalIncome = incomeBreakdown.reduce((sum, b) => sum + b.amount, 0);
  const totalExpense = expenseBreakdown.reduce((sum, b) => sum + b.amount, 0);

  const PieChart = ({ data, total }: { data: CategoryBreakdown[]; total: number }) => {
    if (data.length === 0) {
      return (
        <div className="w-64 h-64 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          データなし
        </div>
      );
    }

    const colors = [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#84CC16',
      '#6366F1',
    ];

    let currentAngle = -90;
    const slices = data.map((item, index) => {
      const angle = (item.amount / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = 128 + 120 * Math.cos(startRad);
      const y1 = 128 + 120 * Math.sin(startRad);
      const x2 = 128 + 120 * Math.cos(endRad);
      const y2 = 128 + 120 * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      const path = [
        `M 128 128`,
        `L ${x1} ${y1}`,
        `A 120 120 0 ${largeArc} 1 ${x2} ${y2}`,
        `Z`,
      ].join(' ');

      return (
        <path
          key={index}
          d={path}
          fill={colors[index % colors.length]}
          stroke="white"
          strokeWidth="2"
        />
      );
    });

    return (
      <svg width="256" height="256" viewBox="0 0 256 256" className="mx-auto">
        {slices}
      </svg>
    );
  };

  const BreakdownTable = ({
    data,
    type,
  }: {
    data: CategoryBreakdown[];
    type: 'income' | 'expense';
  }) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {type === 'income' ? '収入' : '支出'}のデータがありません
        </div>
      );
    }

    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-amber-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-cyan-500',
      'bg-lime-500',
      'bg-indigo-500',
    ];

    return (
      <div className="space-y-2">
        {data.map((item, index) => (
          <div
            key={item.category}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`} />
            <div className="flex-1">
              <div className="font-medium text-gray-800">{item.category}</div>
              <div className="text-sm text-gray-500">
                {item.percentage.toFixed(1)}%
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-800">
                ¥{item.amount.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">カテゴリ内訳</h2>
      <p className="text-center text-gray-600 mb-8">
        {formatMonth(selectedMonth)}
      </p>

      {/* Expense Breakdown */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4 text-red-600 flex items-center gap-2">
          <span>📉</span>
          支出内訳
        </h3>
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              ¥{totalExpense.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">合計支出</div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="flex justify-center">
            <PieChart data={expenseBreakdown} total={totalExpense} />
          </div>
          <div>
            <BreakdownTable data={expenseBreakdown} type="expense" />
          </div>
        </div>
      </div>

      {/* Income Breakdown */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-green-600 flex items-center gap-2">
          <span>📈</span>
          収入内訳
        </h3>
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              ¥{totalIncome.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">合計収入</div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="flex justify-center">
            <PieChart data={incomeBreakdown} total={totalIncome} />
          </div>
          <div>
            <BreakdownTable data={incomeBreakdown} type="income" />
          </div>
        </div>
      </div>
    </div>
  );
}
