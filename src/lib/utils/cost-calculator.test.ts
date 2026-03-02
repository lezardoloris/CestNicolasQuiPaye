import { describe, it, expect } from 'vitest';
import {
  costPerCitizen,
  costPerTaxpayer,
  costPerHousehold,
  daysOfWork,
  formatEUR,
  formatDays,
  calculateCostToNicolas,
} from './cost-calculator';
import type { DenominatorData } from '@/types/cost-engine';

// ─── costPerCitizen ─────────────────────────────────────────────────

describe('costPerCitizen', () => {
  it('calcule le cout par citoyen', () => {
    expect(costPerCitizen(68000000, 68000000)).toBe(1);
  });

  it('retourne 0 si la population est zero', () => {
    expect(costPerCitizen(1000, 0)).toBe(0);
  });

  it('retourne 0 si la population est negative', () => {
    expect(costPerCitizen(1000, -1)).toBe(0);
  });

  it('calcule correctement pour un grand montant', () => {
    const result = costPerCitizen(800000000, 67000000);
    expect(result).toBeCloseTo(11.94, 1);
  });

  it('gere un montant de zero', () => {
    expect(costPerCitizen(0, 67000000)).toBe(0);
  });

  it('gere un montant negatif', () => {
    const result = costPerCitizen(-1000, 100);
    expect(result).toBe(-10);
  });
});

// ─── costPerTaxpayer ────────────────────────────────────────────────

describe('costPerTaxpayer', () => {
  it('calcule le cout par contribuable', () => {
    expect(costPerTaxpayer(20000000, 20000000)).toBe(1);
  });

  it('retourne 0 si le nombre de contribuables est zero', () => {
    expect(costPerTaxpayer(1000, 0)).toBe(0);
  });

  it('retourne 0 si le nombre de contribuables est negatif', () => {
    expect(costPerTaxpayer(1000, -5)).toBe(0);
  });

  it('calcule correctement', () => {
    const result = costPerTaxpayer(1000000, 20000000);
    expect(result).toBeCloseTo(0.05, 5);
  });
});

// ─── costPerHousehold ───────────────────────────────────────────────

describe('costPerHousehold', () => {
  it('calcule le cout par foyer', () => {
    expect(costPerHousehold(30000000, 30000000)).toBe(1);
  });

  it('retourne 0 si le nombre de foyers est zero', () => {
    expect(costPerHousehold(1000, 0)).toBe(0);
  });

  it('retourne 0 si le nombre de foyers est negatif', () => {
    expect(costPerHousehold(1000, -1)).toBe(0);
  });
});

// ─── daysOfWork ─────────────────────────────────────────────────────

describe('daysOfWork', () => {
  it('calcule le nombre de jours de travail equivalent', () => {
    // 100 EUR / 10 contribuables / 5 EUR/jour = 2 jours
    expect(daysOfWork(100, 10, 5)).toBe(2);
  });

  it('retourne 0 si le nombre de contribuables est zero', () => {
    expect(daysOfWork(1000, 0, 100)).toBe(0);
  });

  it('retourne 0 si le salaire journalier est zero', () => {
    expect(daysOfWork(1000, 100, 0)).toBe(0);
  });

  it('retourne 0 si le nombre de contribuables est negatif', () => {
    expect(daysOfWork(1000, -1, 100)).toBe(0);
  });

  it('retourne 0 si le salaire journalier est negatif', () => {
    expect(daysOfWork(1000, 100, -50)).toBe(0);
  });

  it('calcule correctement pour des valeurs realistes', () => {
    // 800M EUR / 17M contribuables / 100 EUR/jour
    const result = daysOfWork(800000000, 17000000, 100);
    expect(result).toBeCloseTo(0.47, 1);
  });
});

// ─── formatEUR (cost-calculator version) ────────────────────────────

describe('formatEUR (cost-calculator)', () => {
  it('formate avec 2 decimales par defaut', () => {
    const result = formatEUR(11.7006);
    expect(result).toContain('11,70');
    expect(result).toContain('€');
  });

  it('formate avec un nombre de decimales specifie', () => {
    const result = formatEUR(11.7006, 4);
    expect(result).toContain('11,7006');
  });

  it('formate zero', () => {
    const result = formatEUR(0);
    expect(result).toContain('0,00');
    expect(result).toContain('€');
  });

  it('formate un nombre negatif', () => {
    const result = formatEUR(-5.5);
    expect(result).toContain('5,50');
    expect(result).toContain('€');
  });
});

// ─── formatDays ─────────────────────────────────────────────────────

describe('formatDays', () => {
  it('formate un nombre de jours au singulier', () => {
    const result = formatDays(0.69);
    expect(result).toContain('0,69');
    expect(result).toContain('jour');
    expect(result).not.toContain('jours');
  });

  it('formate un nombre de jours au pluriel (>= 2)', () => {
    const result = formatDays(2.5);
    expect(result).toContain('2,50');
    expect(result).toContain('jours');
  });

  it('formate 1 jour au singulier', () => {
    const result = formatDays(1);
    expect(result).toContain('1,00');
    expect(result).toContain('jour');
    expect(result).not.toContain('jours');
  });

  it('formate zero jour', () => {
    const result = formatDays(0);
    expect(result).toContain('0,00');
    expect(result).toContain('jour');
  });
});

// ─── calculateCostToNicolas ─────────────────────────────────────────

describe('calculateCostToNicolas', () => {
  function makeDenom(key: string, value: number): DenominatorData {
    return {
      key,
      value,
      source_name: 'Test',
      source_url: 'https://example.com',
      last_updated: '2026-01-01',
      update_frequency: 'annually',
    };
  }

  const fullDenominators: DenominatorData[] = [
    makeDenom('france_population', 68000000),
    makeDenom('income_tax_payers', 17000000),
    makeDenom('france_households', 30000000),
    makeDenom('daily_median_net_income', 100),
    makeDenom('school_lunch_cost', 3.5),
    makeDenom('hospital_bed_day_cost', 1500),
  ];

  it('calcule tous les champs avec des denominateurs complets', () => {
    const result = calculateCostToNicolas(800000000, fullDenominators);

    expect(result.amount_eur).toBe(800000000);
    expect(result.cost_per_citizen).not.toBeNull();
    expect(result.cost_per_taxpayer).not.toBeNull();
    expect(result.cost_per_household).not.toBeNull();
    expect(result.days_of_work_equivalent).not.toBeNull();
    expect(result.equivalences.length).toBeGreaterThan(0);
    expect(result.denominators_used.length).toBeGreaterThan(0);
    expect(result.calculated_at).toBeTruthy();
  });

  it('calcule le cout par citoyen correctement', () => {
    const result = calculateCostToNicolas(680000000, fullDenominators);
    // 680M / 68M = 10
    expect(result.cost_per_citizen).toBeCloseTo(10, 2);
  });

  it('calcule le cout par contribuable correctement', () => {
    const result = calculateCostToNicolas(17000000, fullDenominators);
    // 17M / 17M = 1
    expect(result.cost_per_taxpayer).toBeCloseTo(1, 2);
  });

  it('calcule le cout par foyer correctement', () => {
    const result = calculateCostToNicolas(30000000, fullDenominators);
    // 30M / 30M = 1
    expect(result.cost_per_household).toBeCloseTo(1, 2);
  });

  it('calcule les jours de travail equivalent', () => {
    const result = calculateCostToNicolas(17000000, fullDenominators);
    // cost_per_taxpayer = 1 / daily_median = 100 => 0.01 jours
    expect(result.days_of_work_equivalent).toBeCloseTo(0.01, 2);
  });

  it('genere des equivalences repas et hospitalisation', () => {
    const result = calculateCostToNicolas(680000000, fullDenominators);
    const labels = result.equivalences.map((e) => e.label);
    expect(labels).toContain('repas de cantine scolaire');
    expect(labels).toContain("journee d'hospitalisation");
  });

  it('marque les champs indisponibles quand les denominateurs manquent', () => {
    const result = calculateCostToNicolas(1000000, []);

    expect(result.cost_per_citizen).toBeNull();
    expect(result.cost_per_taxpayer).toBeNull();
    expect(result.cost_per_household).toBeNull();
    expect(result.days_of_work_equivalent).toBeNull();
    expect(result.cost_per_citizen_unavailable).toBe(true);
    expect(result.cost_per_taxpayer_unavailable).toBe(true);
    expect(result.cost_per_household_unavailable).toBe(true);
    expect(result.days_of_work_unavailable).toBe(true);
    expect(result.equivalences).toHaveLength(0);
  });

  it('gere les denominateurs avec valeur zero', () => {
    const zeroDenominators = [
      makeDenom('france_population', 0),
      makeDenom('income_tax_payers', 0),
    ];
    const result = calculateCostToNicolas(1000000, zeroDenominators);

    expect(result.cost_per_citizen).toBeNull();
    expect(result.cost_per_taxpayer).toBeNull();
  });

  it('calcule les jours de travail indisponibles si daily_median manque', () => {
    const partialDenom = [
      makeDenom('france_population', 68000000),
      makeDenom('income_tax_payers', 17000000),
    ];
    const result = calculateCostToNicolas(17000000, partialDenom);

    expect(result.cost_per_taxpayer).not.toBeNull();
    expect(result.days_of_work_equivalent).toBeNull();
    expect(result.days_of_work_unavailable).toBe(true);
  });

  it('ne genere pas d\'equivalences si cost_per_citizen est null', () => {
    const denomSansPop = [
      makeDenom('income_tax_payers', 17000000),
      makeDenom('school_lunch_cost', 3.5),
    ];
    const result = calculateCostToNicolas(1000000, denomSansPop);

    expect(result.cost_per_citizen).toBeNull();
    expect(result.equivalences).toHaveLength(0);
  });

  it('gere un montant de zero', () => {
    const result = calculateCostToNicolas(0, fullDenominators);
    expect(result.amount_eur).toBe(0);
    expect(result.cost_per_citizen).toBe(0);
    expect(result.cost_per_taxpayer).toBe(0);
  });

  it('suivi des denominateurs utilises est correct', () => {
    const result = calculateCostToNicolas(100000000, fullDenominators);
    const keys = result.denominators_used.map((d) => d.key);
    expect(keys).toContain('france_population');
    expect(keys).toContain('income_tax_payers');
    expect(keys).toContain('france_households');
  });
});
