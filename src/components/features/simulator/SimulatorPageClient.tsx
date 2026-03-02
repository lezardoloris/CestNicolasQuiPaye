'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calculator } from 'lucide-react';
import { calculateQFParts, REFERENCE_SALARIES } from '@/lib/constants/tax-2026';
import { runFullSimulation } from '@/lib/utils/tax-calculator';
import { SalaryInput } from '@/components/features/simulator/SalaryInput';
import { FamilySituationSelector } from '@/components/features/simulator/FamilySituationSelector';
import { SimulatorSummaryKpi } from '@/components/features/simulator/SimulatorSummaryKpi';
import { TaxBreakdownSection } from '@/components/features/simulator/TaxBreakdownSection';
import { BudgetAllocationChart } from '@/components/features/simulator/BudgetAllocationChart';
import { ProfileComparisonCards } from '@/components/features/simulator/ProfileComparisonCards';
import { SimulatorShareCard } from '@/components/features/simulator/SimulatorShareCard';

function parseUrlParams(params: URLSearchParams): {
  gross: number;
  single: boolean;
  children: number;
} {
  const gross = parseInt(params.get('gross') ?? '', 10);
  const single = params.get('single');
  const children = parseInt(params.get('children') ?? '', 10);

  return {
    gross: !isNaN(gross) && gross >= 0 && gross <= 200_000 ? gross : REFERENCE_SALARIES.median,
    single: single === '0' ? false : true,
    children: !isNaN(children) && children >= 0 && children <= 10 ? children : 0,
  };
}

export function SimulatorPageClient() {
  const searchParams = useSearchParams();
  const defaults = parseUrlParams(searchParams);

  const [annualGross, setAnnualGross] = useState(defaults.gross);
  const [isSingle, setIsSingle] = useState(defaults.single);
  const [nbChildren, setNbChildren] = useState(defaults.children);

  const nbParts = useMemo(() => calculateQFParts(isSingle, nbChildren), [isSingle, nbChildren]);
  const simulation = useMemo(
    () => runFullSimulation({ annualGross, isSingle, nbChildren }),
    [annualGross, isSingle, nbChildren],
  );

  const irPlusTva = simulation.ir.irTotal + simulation.tva.estimatedTVA;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Calculator className="size-6 text-chainsaw-red" />
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Combien Nicolas paie ?
          </h1>
        </div>
        <p className="text-sm text-text-muted">
          Simulez votre contribution fiscale réelle et découvrez où va votre argent.
        </p>
      </div>

      {/* Input section */}
      <div className="grid gap-4 md:grid-cols-2">
        <SalaryInput value={annualGross} onChange={setAnnualGross} />
        <FamilySituationSelector
          isSingle={isSingle}
          nbChildren={nbChildren}
          nbParts={nbParts}
          onSingleChange={setIsSingle}
          onChildrenChange={setNbChildren}
        />
      </div>

      {/* KPI Summary */}
      <SimulatorSummaryKpi simulation={simulation} />

      {/* Tax breakdown */}
      <TaxBreakdownSection simulation={simulation} />

      {/* Budget allocation */}
      <BudgetAllocationChart allocation={simulation.budgetAllocation} totalTaxes={irPlusTva} />

      {/* Profile comparison */}
      <ProfileComparisonCards totalTaxes={irPlusTva} />

      {/* Share */}
      <SimulatorShareCard simulation={simulation} />

      {/* Disclaimer */}
      <div className="rounded-lg border border-border-default bg-surface-secondary p-4 text-xs text-text-muted">
        <p className="mb-1 font-medium text-text-secondary">Avertissement</p>
        <p>
          Ce simulateur fournit une estimation simplifiée à but pédagogique. Il ne remplace pas le{' '}
          <a
            href="https://simulateur.impots.gouv.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-chainsaw-red underline"
          >
            simulateur officiel des impôts
          </a>
          . Les montants réels dépendent de votre situation complète (déductions, crédits d'impôt,
          revenus du patrimoine, etc.).
        </p>
      </div>
    </main>
  );
}
