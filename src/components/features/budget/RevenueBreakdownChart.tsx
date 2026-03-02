'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatEUR, formatCompactEUR } from '@/lib/utils/format';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import {
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_WRAPPER_STYLE,
} from '@/lib/constants/chart-styles';
import type { RevenueSource } from '@/lib/constants/budget-2026';

interface RevenueBreakdownChartProps {
  data: RevenueSource[];
}

export function RevenueBreakdownChart({ data }: RevenueBreakdownChartProps) {
  const isMobile = useIsMobile();
  if (data.length === 0) return null;

  const chartData = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.amount, 0);
    return data.map((item) => ({
      ...item,
      amountEur: item.amount * 1_000_000,
      pct: Math.round((item.amount / total) * 100),
    }));
  }, [data]);

  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-surface-secondary p-4">
      <h3 className="mb-2 text-base font-semibold text-text-primary">
        Recettes de l&apos;État
      </h3>

      {/* Donut avec labels % */}
      <div role="img" aria-label="Graphique en donut des recettes de l'État : TVA 100 Md€, IR 90 Md€, IS 55 Md€, TICPE 18 Md€ et autres">
      <ResponsiveContainer width="100%" height={isMobile ? 230 : 260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="amountEur"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? 38 : 50}
            outerRadius={isMobile ? 65 : 90}
            paddingAngle={2}
            stroke="var(--color-surface-secondary)"
            strokeWidth={2}
            label={({ percent }: { name?: string; percent?: number }) => {
              const p = (percent ?? 0) * 100;
              if (p < 5) return '';
              return `${Math.round(p)}%`;
            }}
            labelLine={false}
          >
            {chartData.map((item) => (
              <Cell key={item.name} fill={item.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
            labelStyle={{ ...CHART_TOOLTIP_LABEL_STYLE, fontWeight: 600 }}
            itemStyle={CHART_TOOLTIP_ITEM_STYLE}
            wrapperStyle={CHART_TOOLTIP_WRAPPER_STYLE}
            formatter={(value, name) => {
              const item = chartData.find((d) => d.name === String(name));
              const pct = item ? ` (${item.pct}%)` : '';
              return [
                isMobile ? formatCompactEUR(Number(value)) : formatEUR(Number(value)),
                `${String(name)}${pct}`,
              ];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      </div>

      {/* Légende — liste verticale, texte complet */}
      <div className="mt-3 space-y-1.5">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 text-text-secondary">{item.name}</span>
            <span className="font-mono text-xs font-semibold tabular-nums text-text-primary">
              {formatCompactEUR(item.amountEur)}
            </span>
            <span className="w-8 text-right font-mono text-xs tabular-nums text-text-muted">
              {item.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
