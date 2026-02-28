'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatEUR, formatCompactEUR, truncate } from '@/lib/utils/format';

interface Top10BarChartProps {
  data: Array<{
    id: string;
    title: string;
    amount: number;
    ministryTag: string | null;
  }>;
}

export function Top10BarChart({ data }: Top10BarChartProps) {
  if (data.length === 0) return null;

  const chartData = data.map((item) => ({
    ...item,
    shortTitle: truncate(item.title, 20),
  }));

  return (
    <div className="rounded-xl border border-border-default bg-surface-secondary p-4">
      <h2 className="mb-4 text-base font-semibold text-text-primary">
        Top 10 — Plus gros montants
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
          <XAxis
            type="number"
            tickFormatter={(v: number) => formatCompactEUR(v)}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="shortTitle"
            width={130}
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
            }}
            formatter={(value) => formatEUR(Number(value))}
            labelFormatter={(label) => {
              const item = chartData.find((d) => d.shortTitle === String(label));
              return item?.title ?? String(label);
            }}
          />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={index === 0 ? '#ef4444' : '#f59e0b'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
