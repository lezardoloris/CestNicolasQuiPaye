import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimulatorSummaryKpi } from './SimulatorSummaryKpi';
import type { TaxSimulationResult } from '@/types/simulator';

// ─── Helpers ─────────────────────────────────────────────────────────────

function makeSimulation(
  overrides: Partial<TaxSimulationResult> = {},
): TaxSimulationResult {
  return {
    input: { annualGross: 40000, isSingle: true, nbChildren: 0 },
    nbParts: 1,
    netImposable: 36000,
    ir: {
      brackets: [],
      irTotal: 3200,
      effectiveRate: 0.089,
      marginalRate: 0.3,
      nbParts: 1,
      revenuImposable: 36000,
    },
    cotisations: {
      csg: 3400,
      crds: 185,
      retraiteBase: 2760,
      retraiteComplementaire: 1544,
      assuranceMaladie: 0,
      chomage: 0,
      total: 7889,
    },
    tva: { estimatedTVA: 2800, effectiveRate: 0.13 },
    totalPrelevements: 13889,
    netApresIR: 26111,
    tauxEffectifGlobal: 0.347,
    budgetAllocation: [],
    ...overrides,
  };
}

function renderKpi(overrides: Partial<TaxSimulationResult> = {}) {
  return render(
    <SimulatorSummaryKpi simulation={makeSimulation(overrides)} />,
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe('SimulatorSummaryKpi', () => {
  it('affiche la region avec le role "region" et le label accessible', () => {
    renderKpi();
    expect(
      screen.getByRole('region', { name: 'Résumé fiscal' }),
    ).toBeInTheDocument();
  });

  it('affiche les 4 KPI', () => {
    renderKpi();
    expect(screen.getByText('Net après IR')).toBeInTheDocument();
    expect(screen.getByText('Total prélèvements')).toBeInTheDocument();
    expect(screen.getByText('Taux effectif global')).toBeInTheDocument();
    expect(screen.getByText('Tranche marginale')).toBeInTheDocument();
  });

  it('affiche le net apres IR formate en EUR', () => {
    renderKpi({ netApresIR: 26111 });
    // formatEUR(26111) -> something like "26 111 €"
    expect(screen.getByText(/26[\s\u202f]?111/)).toBeInTheDocument();
  });

  it('affiche le total des prelevements formate en EUR', () => {
    renderKpi({ totalPrelevements: 13889 });
    expect(screen.getByText(/13[\s\u202f]?889/)).toBeInTheDocument();
  });

  it('affiche le taux effectif global en pourcentage', () => {
    renderKpi({ tauxEffectifGlobal: 0.347 });
    // (0.347 * 100).toFixed(1) = "34.7" -> "34,7 %" (toFixed uses . but the component template has a space)
    expect(screen.getByText('34.7 %')).toBeInTheDocument();
  });

  it('affiche la tranche marginale en pourcentage', () => {
    renderKpi({
      ir: {
        brackets: [],
        irTotal: 3200,
        effectiveRate: 0.089,
        marginalRate: 0.3,
        nbParts: 1,
        revenuImposable: 36000,
      },
    });
    // (0.3 * 100).toFixed(0) = "30" -> "30 %"
    expect(screen.getByText('30 %')).toBeInTheDocument();
  });

  it('affiche "/an" pour les KPI monetaires', () => {
    renderKpi();
    const anElements = screen.getAllByText('/an');
    // "Net après IR" et "Total prélèvements" ont "/an"
    expect(anElements).toHaveLength(2);
  });

  it('affiche 0 % pour une tranche marginale a 0', () => {
    renderKpi({
      ir: {
        brackets: [],
        irTotal: 0,
        effectiveRate: 0,
        marginalRate: 0,
        nbParts: 1,
        revenuImposable: 0,
      },
    });
    expect(screen.getByText('0 %')).toBeInTheDocument();
  });

  it('affiche 45 % pour la tranche maximale', () => {
    renderKpi({
      ir: {
        brackets: [],
        irTotal: 50000,
        effectiveRate: 0.35,
        marginalRate: 0.45,
        nbParts: 1,
        revenuImposable: 200000,
      },
    });
    expect(screen.getByText('45 %')).toBeInTheDocument();
  });

  it('affiche les 4 elements avec aria-live="polite"', () => {
    renderKpi();
    const liveElements = screen.getAllByRole('region', { name: 'Résumé fiscal' });
    expect(liveElements).toHaveLength(1);

    // 4 value elements with aria-live
    const { container } = renderKpi();
    const politeElements = container.querySelectorAll('[aria-live="polite"]');
    expect(politeElements).toHaveLength(4);
  });
});
