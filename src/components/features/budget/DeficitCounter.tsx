import { formatEUR } from '@/lib/utils/format';
import { TrendingDown } from 'lucide-react';

interface DeficitCounterProps {
  deficit: number;
  deficitPctBudget: number;
}

export function DeficitCounter({ deficit, deficitPctBudget }: DeficitCounterProps) {
  return (
    <div className="rounded-xl border border-chainsaw-red/20 bg-chainsaw-red/5 p-6 text-center">
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-text-muted">
        <TrendingDown className="size-4 text-chainsaw-red" aria-hidden="true" />
        Déficit budgétaire de l&apos;État (Loi de Finances Initiale 2026)
      </div>
      <p className="mt-2 font-display text-3xl font-black tabular-nums text-chainsaw-red sm:text-5xl">
        {formatEUR(deficit)}
      </p>
      <p className="mt-2 text-sm font-semibold text-chainsaw-red">
        {Math.round(deficitPctBudget)}% des dépenses financées à crédit
      </p>
      <p className="mt-1 text-xs text-text-muted">
        Aucun ménage, aucune entreprise ne pourrait voter un budget
        où près d&apos;un tiers des dépenses n&apos;est pas financé.
      </p>
    </div>
  );
}
