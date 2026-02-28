'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatEUR, formatCompactEUR } from '@/lib/utils/format';

interface TimelineChartProps {
  data: Array<{
    month: string;
    count: number;
    cumulativeAmount: number;
  }>;
}

export function TimelineChart({ data }: TimelineChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-default bg-surface-secondary p-4">
      <h2 className="mb-4 text-base font-semibold text-text-primary">
        Evolution dans le temps
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatCompactEUR(v)}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
            }}
            formatter={(value, name) => [
              formatEUR(Number(value)),
              name === 'cumulativeAmount' ? 'Cumul' : 'Signalements',
            ]}
          />
          <Area
            type="monotone"
            dataKey="cumulativeAmount"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#colorAmount)"
            dot={data.length < 4}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
