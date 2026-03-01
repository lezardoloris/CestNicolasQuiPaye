import { describe, it, expect } from 'vitest';
import {
  calculateSocialContributions,
  calculateNetImposable,
  calculateIR,
  estimateTVA,
  calculateBudgetAllocation,
  runFullSimulation,
} from './tax-calculator';
import { calculateQFParts } from '@/lib/constants/tax-2026';

// ─── QF Parts ─────────────────────────────────────────────────────

describe('calculateQFParts', () => {
  it('returns 1 for single without children', () => {
    expect(calculateQFParts(true, 0)).toBe(1);
  });

  it('returns 2 for couple without children', () => {
    expect(calculateQFParts(false, 0)).toBe(2);
  });

  it('returns 1.5 for single with 1 child', () => {
    expect(calculateQFParts(true, 1)).toBe(1.5);
  });

  it('returns 2 for single with 2 children', () => {
    expect(calculateQFParts(true, 2)).toBe(2);
  });

  it('returns 3 for single with 3 children (+1 for 3rd)', () => {
    expect(calculateQFParts(true, 3)).toBe(3);
  });

  it('returns 4 for couple with 3 children', () => {
    expect(calculateQFParts(false, 3)).toBe(4);
  });
});

// ─── Social Contributions ─────────────────────────────────────────

describe('calculateSocialContributions', () => {
  it('returns zero for zero gross', () => {
    const result = calculateSocialContributions(0);
    expect(result.total).toBe(0);
    expect(result.csg).toBe(0);
  });

  it('computes CSG at 9.2% of 98.25% of gross', () => {
    const gross = 30_000;
    const result = calculateSocialContributions(gross);
    const expected = gross * 0.9825 * 0.092;
    expect(result.csg).toBeCloseTo(expected, 2);
  });

  it('total is roughly 20-25% of gross for typical salary', () => {
    const gross = 40_000;
    const result = calculateSocialContributions(gross);
    const ratio = result.total / gross;
    expect(ratio).toBeGreaterThan(0.18);
    expect(ratio).toBeLessThan(0.28);
  });
});

// ─── Net Imposable ────────────────────────────────────────────────

describe('calculateNetImposable', () => {
  it('returns 0 for 0 gross', () => {
    expect(calculateNetImposable(0)).toBe(0);
  });

  it('is lower than gross due to deductions', () => {
    const gross = 30_000;
    const netImposable = calculateNetImposable(gross);
    expect(netImposable).toBeLessThan(gross);
    expect(netImposable).toBeGreaterThan(0);
  });

  it('net imposable is roughly 70-80% of gross', () => {
    const gross = 40_000;
    const netImposable = calculateNetImposable(gross);
    const ratio = netImposable / gross;
    expect(ratio).toBeGreaterThan(0.65);
    expect(ratio).toBeLessThan(0.85);
  });
});

// ─── IR ───────────────────────────────────────────────────────────

describe('calculateIR', () => {
  it('returns 0 IR for income below first bracket', () => {
    const result = calculateIR(10_000, 1);
    expect(result.irTotal).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.marginalRate).toBe(0);
  });

  it('SMIC produces very low or zero IR', () => {
    // SMIC brut ~21 622 → net imposable ~15 500
    const netImposable = calculateNetImposable(21_622);
    const result = calculateIR(netImposable, 1);
    expect(result.irTotal).toBeLessThan(1_000);
  });

  it('30k gross single → marginal rate should be 11%', () => {
    const netImposable = calculateNetImposable(30_000);
    const result = calculateIR(netImposable, 1);
    expect(result.marginalRate).toBe(0.11);
    expect(result.irTotal).toBeGreaterThan(0);
  });

  it('100k gross single → marginal rate should be 30%', () => {
    const netImposable = calculateNetImposable(100_000);
    const result = calculateIR(netImposable, 1);
    expect(result.marginalRate).toBe(0.30);
  });

  it('QF reduces IR: same salary, more parts = less tax', () => {
    const netImposable = calculateNetImposable(50_000);
    const ir1Part = calculateIR(netImposable, 1);
    const ir3Parts = calculateIR(netImposable, 3);
    expect(ir3Parts.irTotal).toBeLessThan(ir1Part.irTotal);
  });

  it('fills all 5 brackets', () => {
    const result = calculateIR(10_000, 1);
    expect(result.brackets).toHaveLength(5);
  });
});

// ─── TVA ──────────────────────────────────────────────────────────

describe('estimateTVA', () => {
  it('returns 0 for zero net', () => {
    const result = estimateTVA(0);
    expect(result.estimatedTVA).toBe(0);
  });

  it('TVA is ~10.4% of net (80% consumed × 13%)', () => {
    const net = 30_000;
    const result = estimateTVA(net);
    const expectedRate = 0.8 * 0.13;
    expect(result.estimatedTVA).toBeCloseTo(net * expectedRate, -1);
  });
});

// ─── Budget Allocation ────────────────────────────────────────────

describe('calculateBudgetAllocation', () => {
  it('returns 12 missions', () => {
    const result = calculateBudgetAllocation(10_000);
    expect(result).toHaveLength(12);
  });

  it('amounts sum to approximately total', () => {
    const total = 10_000;
    const result = calculateBudgetAllocation(total);
    const sum = result.reduce((s, m) => s + m.amount, 0);
    // Rounding may cause small differences
    expect(sum).toBeGreaterThan(total * 0.95);
    expect(sum).toBeLessThan(total * 1.05);
  });
});

// ─── Full Simulation ──────────────────────────────────────────────

describe('runFullSimulation', () => {
  it('SMIC single → low effective rate', () => {
    const result = runFullSimulation({ annualGross: 21_622, isSingle: true, nbChildren: 0 });
    expect(result.nbParts).toBe(1);
    expect(result.tauxEffectifGlobal).toBeGreaterThan(0.15);
    expect(result.tauxEffectifGlobal).toBeLessThan(0.40);
    expect(result.netApresIR).toBeGreaterThan(0);
  });

  it('50k couple with 2 children → 3 parts', () => {
    const result = runFullSimulation({ annualGross: 50_000, isSingle: false, nbChildren: 2 });
    expect(result.nbParts).toBe(3);
  });

  it('net après IR + cotisations is positive for any positive salary', () => {
    const result = runFullSimulation({ annualGross: 100_000, isSingle: true, nbChildren: 0 });
    expect(result.netApresIR).toBeGreaterThan(0);
  });

  it('zero gross returns zeroes', () => {
    const result = runFullSimulation({ annualGross: 0, isSingle: true, nbChildren: 0 });
    expect(result.ir.irTotal).toBe(0);
    expect(result.cotisations.total).toBe(0);
    expect(result.tva.estimatedTVA).toBe(0);
    expect(result.totalPrelevements).toBe(0);
  });

  it('budget allocation is based on IR + TVA, not cotisations', () => {
    const result = runFullSimulation({ annualGross: 50_000, isSingle: true, nbChildren: 0 });
    const budgetTotal = result.budgetAllocation.reduce((s, m) => s + m.amount, 0);
    const irPlusTVA = result.ir.irTotal + result.tva.estimatedTVA;
    // Should be close (rounding differences allowed)
    expect(Math.abs(budgetTotal - irPlusTVA)).toBeLessThan(irPlusTVA * 0.06);
  });
});
