import { formatEUR, formatCompactEUR } from '@/lib/utils/format';
import { Users, Receipt, Landmark, TrendingUp } from 'lucide-react';
import { BudgetKpiCard } from './BudgetKpiCard';

interface DebtPerCapitaCardsProps {
  currentDebtBn: number;
  population: number;
  taxpayers: number;
  interestBn: number;
  debtEmissions2026Bn: number;
}

export function DebtPerCapitaCards({
  currentDebtBn,
  population,
  taxpayers,
  interestBn,
  debtEmissions2026Bn,
}: DebtPerCapitaCardsProps) {
  const debtTotal = currentDebtBn * 1_000_000_000;
  const debtPerCapita = Math.round(debtTotal / population);
  const debtPerTaxpayer = Math.round(debtTotal / taxpayers);
  const interestPerCapita = Math.round((interestBn * 1_000_000_000) / population);

  const cards = [
    {
      label: 'Dette par habitant',
      value: formatEUR(debtPerCapita),
      icon: Users,
      color: 'text-chainsaw-red',
      detail: `${formatCompactEUR(debtTotal)} / ${new Intl.NumberFormat('fr-FR').format(population)} hab.`,
    },
    {
      label: 'Dette par contribuable IR',
      value: formatEUR(debtPerTaxpayer),
      icon: Receipt,
      color: 'text-warning',
      detail: `${new Intl.NumberFormat('fr-FR').format(taxpayers)} foyers imposables`,
    },
    {
      label: 'Intérêts / habitant / an',
      value: formatEUR(interestPerCapita),
      icon: Landmark,
      color: 'text-info',
      detail: `Charge de la dette : ${interestBn} Md€/an`,
    },
    {
      label: 'Émissions 2026',
      value: formatCompactEUR(debtEmissions2026Bn * 1_000_000_000),
      icon: TrendingUp,
      color: 'text-[#ec4899]',
      detail: 'Record historique d\'emprunts',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <BudgetKpiCard
          key={card.label}
          value={card.value}
          label={card.label}
          icon={card.icon}
          color={card.color}
          detail={card.detail}
        />
      ))}
    </div>
  );
}
