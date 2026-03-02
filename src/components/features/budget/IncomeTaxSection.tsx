'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCompactEUR } from '@/lib/utils/format';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { BudgetKpiCard } from './BudgetKpiCard';
import {
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_WRAPPER_STYLE,
} from '@/lib/constants/chart-styles';
import type { IncomeTaxDecile } from '@/lib/constants/budget-2026';

interface IncomeTaxSectionProps {
  deciles: IncomeTaxDecile[];
  totalIRBn: number;
  taxpayers: number;
  totalFiscalHouseholds: number;
}

export function IncomeTaxSection({
  deciles,
  totalIRBn,
  taxpayers,
  totalFiscalHouseholds,
}: IncomeTaxSectionProps) {
  const isMobile = useIsMobile();

  const nonPayingPct = Math.round(
    ((totalFiscalHouseholds - taxpayers) / totalFiscalHouseholds) * 100,
  );

  const chartData = useMemo(() =>
    deciles
      .filter((d) => d.taxBn > 0)
      .map((d) => ({
        ...d,
        taxEur: d.taxBn * 1_000_000_000,
      })),
    [deciles],
  );

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <BudgetKpiCard
          value={formatCompactEUR(totalIRBn * 1_000_000_000)}
          label="IR total collecté (2024)"
        />
        <BudgetKpiCard
          value={new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(totalFiscalHouseholds)}
          label="Foyers fiscaux"
        />
        <BudgetKpiCard
          value={new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(taxpayers)}
          label={`Payent l'IR (${100 - nonPayingPct}%)`}
          color="text-warning"
        />
        <BudgetKpiCard
          value={`${nonPayingPct}%`}
          label="Non imposables"
          color="text-chainsaw-red"
        />
      </div>

      {/* Bar chart */}
      <div className="overflow-hidden rounded-xl border border-border-default bg-surface-secondary p-4">
        <h3 className="mb-1 text-base font-semibold text-text-primary">
          Qui paye l&apos;impôt sur le revenu ?
        </h3>
        <p className="mb-4 text-xs text-text-muted">
          Répartition de l&apos;IR par décile de revenu fiscal (DGFiP 2024)
        </p>
        <div role="img" aria-label="Graphique de la répartition de l'impôt sur le revenu par décile : les 10% les plus aisés payent 78% de l'IR total">
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="decile"
              tick={{ fill: 'var(--color-text-muted)', fontSize: isMobile ? 10 : 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => formatCompactEUR(v)}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={isMobile ? 55 : 70}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              itemStyle={CHART_TOOLTIP_ITEM_STYLE}
              wrapperStyle={CHART_TOOLTIP_WRAPPER_STYLE}
              formatter={(value) => [formatCompactEUR(Number(value)), 'IR payé']}
              labelFormatter={(label) => {
                const item = chartData.find((d) => d.decile === String(label));
                return item
                  ? `${item.label} — ${item.incomeRange}\n${item.pctOfTotal}% de l'IR`
                  : String(label);
              }}
            />
            <Bar dataKey="taxEur" radius={[4, 4, 0, 0]}>
              {chartData.map((item) => (
                <Cell key={item.decile} fill={item.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-text-muted">
          Les 10% des foyers les plus aisés payent <strong className="text-chainsaw-red">78%</strong> de
          l&apos;impôt sur le revenu. Les 50% les moins aisés sont en solde négatif (crédits d&apos;impôt).
        </p>
      </div>
    </div>
  );
}
