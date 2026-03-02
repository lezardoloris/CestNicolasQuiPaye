import { formatCompactEUR, fmtDecimal1 } from '@/lib/utils/format';
import { ArrowUpRight, ArrowDownRight, TrendingDown, CreditCard, Percent } from 'lucide-react';
import { BudgetKpiCard } from './BudgetKpiCard';

interface BudgetKpiCardsProps {
  netRevenue: number;
  netExpenditure: number;
  deficit: number;
  deficitPctBudget: number;
  deficitPctGdp: number;
}

export function BudgetKpiCards({
  netRevenue,
  netExpenditure,
  deficit,
  deficitPctBudget,
  deficitPctGdp,
}: BudgetKpiCardsProps) {
  const kpis = [
    { label: 'Recettes nettes', value: formatCompactEUR(netRevenue * 1_000_000), icon: ArrowUpRight, color: 'text-success' },
    { label: 'Dépenses nettes', value: formatCompactEUR(netExpenditure * 1_000_000), icon: ArrowDownRight, color: 'text-chainsaw-red' },
    { label: 'Déficit budgétaire', value: formatCompactEUR(deficit * 1_000_000), icon: TrendingDown, color: 'text-chainsaw-red' },
    { label: 'Dépenses non financées', value: `${Math.round(deficitPctBudget)}%`, icon: CreditCard, color: 'text-warning' },
    { label: 'Déficit / PIB', value: `${fmtDecimal1.format(deficitPctGdp)}%`, icon: Percent, color: 'text-info' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <BudgetKpiCard
          key={kpi.label}
          value={kpi.value}
          label={kpi.label}
          icon={kpi.icon}
          color={kpi.color}
        />
      ))}
    </div>
  );
}
