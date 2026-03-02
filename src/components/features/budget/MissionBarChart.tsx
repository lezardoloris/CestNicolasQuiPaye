'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatEUR, formatCompactEUR, truncate } from '@/lib/utils/format';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import {
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_WRAPPER_STYLE,
} from '@/lib/constants/chart-styles';
import type { BudgetMission } from '@/lib/constants/budget-2026';

interface MissionBarChartProps {
  data: BudgetMission[];
}

export function MissionBarChart({ data }: MissionBarChartProps) {
  const isMobile = useIsMobile();
  if (data.length === 0) return null;

  const chartData = useMemo(() =>
    [...data]
      .sort((a, b) => b.amount - a.amount)
      .map((item) => ({
        ...item,
        amountEur: item.amount * 1_000_000,
        shortName: truncate(item.name, isMobile ? 14 : 28),
      })),
    [data, isMobile],
  );

  const chartHeight = Math.max(isMobile ? 400 : 500, data.length * (isMobile ? 26 : 30));

  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-surface-secondary p-4">
      <h3 className="mb-4 text-base font-semibold text-text-primary">
        Dépenses par mission (Md&euro;)
      </h3>
      <div role="img" aria-label="Graphique en barres des dépenses de l'État par mission budgétaire, de la Défense (66,7 Md€) à l'Enseignement scolaire (60 Md€)">
      <ResponsiveContainer width="100%" height={chartHeight}>
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
            width={isMobile ? 90 : 160}
            tick={{ fill: 'var(--color-text-secondary)', fontSize: isMobile ? 10 : 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              ...CHART_TOOLTIP_CONTENT_STYLE,
              maxWidth: isMobile ? '200px' : undefined,
              whiteSpace: isMobile ? ('normal' as const) : undefined,
            }}
            labelStyle={CHART_TOOLTIP_LABEL_STYLE}
            itemStyle={CHART_TOOLTIP_ITEM_STYLE}
            wrapperStyle={CHART_TOOLTIP_WRAPPER_STYLE}
            formatter={(value) => [
              isMobile ? formatCompactEUR(Number(value)) : formatEUR(Number(value)),
              'Crédits',
            ]}
            labelFormatter={(label) => {
              const item = chartData.find((d) => d.shortName === String(label));
              return item?.name ?? String(label);
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
    </div>
  );
}
