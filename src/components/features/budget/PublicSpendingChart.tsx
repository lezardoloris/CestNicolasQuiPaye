'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCompactEUR, truncate } from '@/lib/utils/format';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import {
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_WRAPPER_STYLE,
} from '@/lib/constants/chart-styles';
import type { PublicSpendingFunction } from '@/lib/constants/budget-2026';

interface PublicSpendingChartProps {
  data: PublicSpendingFunction[];
}

export function PublicSpendingChart({ data }: PublicSpendingChartProps) {
  const isMobile = useIsMobile();
  if (data.length === 0) return null;

  const chartData = useMemo(() =>
    data.map((item) => ({
      ...item,
      amountEur: item.amountBn * 1_000_000_000,
      shortName: truncate(item.name, isMobile ? 14 : 22),
    })),
    [data, isMobile],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-surface-secondary p-4">
      <h3 className="mb-1 text-base font-semibold text-text-primary">
        Où va l&apos;argent public ? (1 672 Md&euro;)
      </h3>
      <p className="mb-4 text-xs text-text-muted">
        Dépenses publiques totales 2024 par fonction (État + Sécu + collectivités) — INSEE, COFOG
      </p>
      <div role="img" aria-label="Graphique des dépenses publiques totales (1 672 Md€) par fonction : protection sociale 414€, santé 156€, enseignement 89€ sur 1 000€ d'impôts">
      <ResponsiveContainer width="100%" height={isMobile ? 320 : 380}>
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
            dataKey="shortName"
            width={isMobile ? 95 : 150}
            tick={{ fill: 'var(--color-text-secondary)', fontSize: isMobile ? 10 : 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              ...CHART_TOOLTIP_CONTENT_STYLE,
              maxWidth: isMobile ? '220px' : undefined,
              whiteSpace: isMobile ? ('normal' as const) : undefined,
            }}
            labelStyle={CHART_TOOLTIP_LABEL_STYLE}
            itemStyle={CHART_TOOLTIP_ITEM_STYLE}
            wrapperStyle={CHART_TOOLTIP_WRAPPER_STYLE}
            formatter={(value) => [formatCompactEUR(Number(value)), 'Dépenses']}
            labelFormatter={(label) => {
              const item = chartData.find((d) => d.shortName === String(label));
              return item
                ? `${item.name} (${item.pctTotal}% — ${item.per1000eur}€ sur 1 000€ d'impôts)`
                : String(label);
            }}
          />
          <Bar dataKey="amountEur" radius={[0, 4, 4, 0]}>
            {chartData.map((item) => (
              <Cell key={item.name} fill={item.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-text-muted">
        Sur 1 000&euro; d&apos;impôts : 414&euro; vont à la protection sociale, 156&euro; à la santé,
        89&euro; à l&apos;enseignement, 32&euro; à la défense.
      </p>
    </div>
  );
}
