'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatEUR } from '@/lib/utils/format';

interface CategoryPieChartProps {
  data: Array<{
    category: string;
    count: number;
    totalAmount: number;
  }>;
}

const COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#6366f1',
  '#14b8a6', '#a855f7', '#e11d48', '#0ea5e9', '#eab308',
  '#22c55e',
];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) return null;

  // Sort by amount descending and take top 8, merge rest into "Autres"
  const sorted = [...data].sort((a, b) => b.totalAmount - a.totalAmount);
  const top = sorted.slice(0, 8);
  const rest = sorted.slice(8);
  const chartData = rest.length > 0
    ? [...top, { category: 'Autres', count: rest.reduce((s, r) => s + r.count, 0), totalAmount: rest.reduce((s, r) => s + r.totalAmount, 0) }]
    : top;

  return (
    <div className="rounded-xl border border-border-default bg-surface-secondary p-4">
      <h2 className="mb-4 text-base font-semibold text-text-primary">
        Repartition par categorie
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="totalAmount"
            nameKey="category"
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={100}
            paddingAngle={2}
            stroke="var(--color-surface-secondary)"
            strokeWidth={2}
            label={({ name, percent }: { name?: string; percent?: number }) =>
              (percent ?? 0) > 0.05 ? `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%` : ''
            }
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
            }}
            formatter={(value) => formatEUR(Number(value))}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
