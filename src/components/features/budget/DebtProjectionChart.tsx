'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import {
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_WRAPPER_STYLE,
} from '@/lib/constants/chart-styles';
import type { DebtDataPoint } from '@/lib/constants/budget-2026';

interface DebtProjectionChartProps {
  data: DebtDataPoint[];
}

export function DebtProjectionChart({ data }: DebtProjectionChartProps) {
  const isMobile = useIsMobile();
  if (data.length === 0) return null;

  const chartData = useMemo(() =>
    data.map((d) => ({
      year: String(d.year),
      debtBn: d.debtBn,
      interestBn: d.interestBn,
      debtPctGdp: d.debtPctGdp,
      projected: d.projected ?? false,
      debtHistorical: d.projected ? undefined : d.debtBn,
      debtProjected: d.projected ? d.debtBn : undefined,
      // Bridge point: last historical = first projected
      ...(d.year === 2026 ? { debtProjected: d.debtBn } : {}),
    })),
    [data],
  );

  const fmtBn = (v: number): string => `${new Intl.NumberFormat('fr-FR').format(v)} Md€`;

  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-surface-secondary p-4">
      <h3 className="mb-1 text-base font-semibold text-text-primary">
        Évolution de la dette publique
      </h3>
      <p className="mb-4 text-xs text-text-muted">
        Historique 2017-2026 + projection 2027-2036 au rythme actuel
      </p>
      <div role="img" aria-label="Graphique de l'évolution de la dette publique française de 2 250 Md€ en 2017 à 3 620 Md€ en 2026, avec projection jusqu'en 2036">
      <ResponsiveContainer width="100%" height={isMobile ? 260 : 340}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="debtHistGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="debtProjGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" />
          <XAxis
            dataKey="year"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={isMobile ? 2 : 1}
          />
          <YAxis
            tickFormatter={(v: number) => `${v} Md`}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={isMobile ? 55 : 70}
            domain={['dataMin - 200', 'dataMax + 200']}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
            labelStyle={CHART_TOOLTIP_LABEL_STYLE}
            itemStyle={CHART_TOOLTIP_ITEM_STYLE}
            wrapperStyle={CHART_TOOLTIP_WRAPPER_STYLE}
            formatter={(value, name) => {
              const v = Number(value);
              if (name === 'debtHistorical') return [fmtBn(v), 'Dette (constatée)'];
              if (name === 'debtProjected') return [fmtBn(v), 'Dette (projection)'];
              return [fmtBn(v), String(name)];
            }}
            labelFormatter={(label) => `Année ${label}`}
          />
          <ReferenceLine
            y={3_000}
            stroke="var(--color-text-muted)"
            strokeDasharray="6 4"
            label={{
              value: '3 000 Md€',
              fill: 'var(--color-text-muted)',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />
          <Area
            type="monotone"
            dataKey="debtHistorical"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#debtHistGradient)"
            connectNulls={false}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="debtProjected"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="6 4"
            fill="url(#debtProjGradient)"
            connectNulls={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-[#ef4444]" />
          Constaté
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-[#f59e0b]" />
          Projection
        </span>
      </div>
    </div>
  );
}
