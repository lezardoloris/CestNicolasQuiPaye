'use client';

import { formatEUR } from '@/lib/utils/format';
import type { TaxSimulationResult } from '@/types/simulator';

interface SimulatorSummaryKpiProps {
  simulation: TaxSimulationResult;
}

interface KpiItem {
  label: string;
  value: string;
  sub?: string;
  color: string;
}

export function SimulatorSummaryKpi({ simulation }: SimulatorSummaryKpiProps) {
  const kpis: KpiItem[] = [
    {
      label: 'Net après IR',
      value: formatEUR(simulation.netApresIR),
      sub: '/an',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Total prélèvements',
      value: formatEUR(simulation.totalPrelevements),
      sub: '/an',
      color: 'text-chainsaw-red',
    },
    {
      label: 'Taux effectif global',
      value: `${(simulation.tauxEffectifGlobal * 100).toFixed(1)} %`,
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Tranche marginale',
      value: `${(simulation.ir.marginalRate * 100).toFixed(0)} %`,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4" role="region" aria-label="Résumé fiscal">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-xl border border-border-default bg-surface-secondary p-4 text-center"
        >
          <p className="mb-1 text-xs text-text-muted">{kpi.label}</p>
          <p className={`font-display text-xl font-bold tabular-nums ${kpi.color}`} aria-live="polite">
            {kpi.value}
          </p>
          {kpi.sub && <p className="text-xs text-text-muted">{kpi.sub}</p>}
        </div>
      ))}
    </div>
  );
}
