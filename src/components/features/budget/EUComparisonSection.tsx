'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import {
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_WRAPPER_STYLE,
} from '@/lib/constants/chart-styles';
import { formatPctFr } from '@/lib/utils/format';
import type { EUCountryComparison } from '@/lib/constants/budget-2026';
import { BudgetKpiCard } from './BudgetKpiCard';

interface EUComparisonSectionProps {
  data: EUCountryComparison[];
}

export function EUComparisonSection({ data }: EUComparisonSectionProps) {
  const isMobile = useIsMobile();

  const france = data.find((d) => d.code === 'FR');
  const eu27 = data.find((d) => d.code === 'EU');

  const debtData = useMemo(() =>
    [...data]
      .sort((a, b) => b.debtPctGdp - a.debtPctGdp)
      .map((d) => ({
        ...d,
        label: isMobile ? d.code : `${d.flag} ${d.country}`,
      })),
    [data, isMobile],
  );

  const deficitData = useMemo(() =>
    [...data]
      .sort((a, b) => b.deficitPctGdp - a.deficitPctGdp)
      .map((d) => ({
        ...d,
        label: isMobile ? d.code : `${d.flag} ${d.country}`,
      })),
    [data, isMobile],
  );

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <BudgetKpiCard
          value={formatPctFr(france?.debtPctGdp ?? 0)}
          label="Dette / PIB (France)"
          color="text-chainsaw-red"
          className="border-chainsaw-red/20 bg-chainsaw-red/5"
        />
        <BudgetKpiCard
          value={formatPctFr(eu27?.debtPctGdp ?? 0)}
          label="Moyenne UE-27"
        />
        <BudgetKpiCard
          value={formatPctFr(france?.spendingPctGdp ?? 0)}
          label="Dépenses publiques / PIB (1re UE)"
          color="text-warning"
          className="col-span-2 border-warning/20 bg-warning/5 sm:col-span-1"
        />
      </div>

      {/* Charts grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Dette / PIB */}
        <div className="overflow-hidden rounded-xl border border-border-default bg-surface-secondary p-4">
          <h3 className="mb-1 text-base font-semibold text-text-primary">
            Dette publique (% du PIB)
          </h3>
          <p className="mb-3 text-xs text-text-muted">
            Eurostat 2024 — Critère de Maastricht : 60%
          </p>
          <div role="img" aria-label="Graphique de la dette publique en % du PIB : Grèce 163%, Italie 137%, France 114%, Espagne 105%, critère de Maastricht 60%">
          <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
            <BarChart data={debtData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis
                type="number"
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={isMobile ? 35 : 120}
                tick={{ fill: 'var(--color-text-secondary)', fontSize: isMobile ? 10 : 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
                labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                wrapperStyle={CHART_TOOLTIP_WRAPPER_STYLE}
                formatter={(value) => [formatPctFr(Number(value)), 'Dette / PIB']}
                labelFormatter={(label) => {
                  const item = debtData.find((d) => d.label === String(label));
                  return item ? `${item.flag} ${item.country}` : String(label);
                }}
              />
              <ReferenceLine
                x={60}
                stroke="var(--color-warning)"
                strokeDasharray="6 4"
                label={{
                  value: '60%',
                  fill: 'var(--color-warning)',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Bar dataKey="debtPctGdp" radius={[0, 4, 4, 0]}>
                {debtData.map((item) => (
                  <Cell
                    key={item.code}
                    fill={item.highlight ? '#ef4444' : 'var(--color-text-muted)'}
                    fillOpacity={item.highlight ? 1 : 0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Déficit / PIB */}
        <div className="overflow-hidden rounded-xl border border-border-default bg-surface-secondary p-4">
          <h3 className="mb-1 text-base font-semibold text-text-primary">
            Déficit public (% du PIB)
          </h3>
          <p className="mb-3 text-xs text-text-muted">
            Eurostat 2024 — Critère de Maastricht : 3%
          </p>
          <div role="img" aria-label="Graphique du déficit public en % du PIB : France 5,5%, Italie 3,4%, Espagne 3,2%, critère de Maastricht 3%">
          <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
            <BarChart data={deficitData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis
                type="number"
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={isMobile ? 35 : 120}
                tick={{ fill: 'var(--color-text-secondary)', fontSize: isMobile ? 10 : 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
                labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                wrapperStyle={CHART_TOOLTIP_WRAPPER_STYLE}
                formatter={(value) => [formatPctFr(Number(value)), 'Déficit / PIB']}
                labelFormatter={(label) => {
                  const item = deficitData.find((d) => d.label === String(label));
                  return item ? `${item.flag} ${item.country}` : String(label);
                }}
              />
              <ReferenceLine
                x={3}
                stroke="var(--color-warning)"
                strokeDasharray="6 4"
                label={{
                  value: '3%',
                  fill: 'var(--color-warning)',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Bar dataKey="deficitPctGdp" radius={[0, 4, 4, 0]}>
                {deficitData.map((item) => (
                  <Cell
                    key={item.code}
                    fill={item.highlight ? '#ef4444' : 'var(--color-text-muted)'}
                    fillOpacity={item.highlight ? 1 : 0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table complète */}
      <div className="overflow-x-auto rounded-xl border border-border-default">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Comparaison des finances publiques : France vs pays de l&apos;UE</caption>
          <thead>
            <tr className="border-b border-border-default bg-surface-secondary text-xs text-text-muted">
              <th scope="col" className="px-4 py-2 font-medium">Pays</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Dette / PIB</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Déficit / PIB</th>
              <th scope="col" className="hidden px-4 py-2 text-right font-medium sm:table-cell">Dép. pub. / PIB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {data.map((d) => (
              <tr
                key={d.code}
                className={d.highlight ? 'bg-chainsaw-red/5' : 'bg-surface-primary/50'}
              >
                <td scope="row" className="px-4 py-2.5">
                  <span className={`font-medium ${d.highlight ? 'text-chainsaw-red' : 'text-text-primary'}`}>
                    {d.flag} {d.country}
                  </span>
                </td>
                <td className={`px-4 py-2.5 text-right font-mono text-sm tabular-nums ${d.debtPctGdp > 60 ? 'text-chainsaw-red' : 'text-success'}`}>
                  {formatPctFr(d.debtPctGdp)}
                </td>
                <td className={`px-4 py-2.5 text-right font-mono text-sm tabular-nums ${d.deficitPctGdp > 3 ? 'text-chainsaw-red' : 'text-success'}`}>
                  {formatPctFr(d.deficitPctGdp)}
                </td>
                <td className="hidden px-4 py-2.5 text-right font-mono text-sm tabular-nums text-text-primary sm:table-cell">
                  {formatPctFr(d.spendingPctGdp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-chainsaw-red/20 bg-chainsaw-red/5 p-4">
        <p className="text-sm font-semibold text-chainsaw-red">
          La France dépasse les deux critères de Maastricht
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Avec une dette à <strong className="text-text-primary">{formatPctFr(france?.debtPctGdp ?? 0)}</strong> du PIB
          (critère : 60%) et un déficit à <strong className="text-text-primary">{formatPctFr(france?.deficitPctGdp ?? 0)}</strong> (critère : 3%),
          la France fait partie des pays de l&apos;UE les plus éloignés des critères de convergence.
          Seules la Grèce et l&apos;Italie ont une dette supérieure. La France est le pays de l&apos;UE
          qui consacre la plus grande part de son PIB aux dépenses publiques ({formatPctFr(france?.spendingPctGdp ?? 0)}).
        </p>
      </div>

      <p className="text-xs text-text-muted">
        Sources : Eurostat — Government finance statistics (2024), Prévisions économiques
        de la Commission européenne (printemps 2025). Les critères de Maastricht (60% dette,
        3% déficit) sont définis par le Traité sur l&apos;Union européenne.
      </p>
    </div>
  );
}
