/**
 * Calculateur fiscal français 2026 — fonctions pures, sans effet de bord.
 * Utilisé côté client uniquement (pas d'import serveur).
 */

import type {
  SimulatorInput,
  TaxSimulationResult,
  TaxBracketResult,
  IRResult,
  SocialContributions,
  TVAResult,
  BudgetMission,
} from '@/types/simulator';
import {
  IR_BRACKETS,
  QF_CEILING_PER_HALF_PART,
  COTISATIONS,
  CSG_CRDS_BASE_RATE,
  PASS_2026,
  TVA_EFFECTIVE_RATE,
  BUDGET_MISSIONS,
  calculateQFParts,
} from '@/lib/constants/tax-2026';

// ─── Cotisations sociales ─────────────────────────────────────────

export function calculateSocialContributions(annualGross: number): SocialContributions {
  const csgCrdsBase = annualGross * CSG_CRDS_BASE_RATE;

  const csg = csgCrdsBase * COTISATIONS.csg.rate;
  const crds = csgCrdsBase * COTISATIONS.crds.rate;

  // Retraite base : plafonné au PASS
  const retraiteBase = Math.min(annualGross, PASS_2026) * COTISATIONS.retraiteBase.rate;

  // Retraite complémentaire : sur totalité (tranche 1 simplifiée)
  const retraiteComplementaire = annualGross * COTISATIONS.retraiteComplementaire.rate;

  const assuranceMaladie = annualGross * COTISATIONS.assuranceMaladie.rate;
  const chomage = annualGross * COTISATIONS.chomage.rate;

  const total = csg + crds + retraiteBase + retraiteComplementaire + assuranceMaladie + chomage;

  return { csg, crds, retraiteBase, retraiteComplementaire, assuranceMaladie, chomage, total };
}

// ─── Revenu net imposable ─────────────────────────────────────────

export function calculateNetImposable(annualGross: number): number {
  const csgCrdsBase = annualGross * CSG_CRDS_BASE_RATE;

  // CSG déductible
  const csgDeductible = csgCrdsBase * COTISATIONS.csg.deductibleRate;

  // Cotisations salariales hors CSG/CRDS
  const retraiteBase = Math.min(annualGross, PASS_2026) * COTISATIONS.retraiteBase.rate;
  const retraiteComplementaire = annualGross * COTISATIONS.retraiteComplementaire.rate;
  const assuranceMaladie = annualGross * COTISATIONS.assuranceMaladie.rate;
  const chomage = annualGross * COTISATIONS.chomage.rate;

  // Abattement de 10% pour frais professionnels (plafonné à 14 171 €, plancher 495 €)
  const netAvantAbattement =
    annualGross - csgDeductible - retraiteBase - retraiteComplementaire - assuranceMaladie - chomage;
  const abattement = Math.max(495, Math.min(netAvantAbattement * 0.1, 14_171));

  return Math.max(0, netAvantAbattement - abattement);
}

// ─── Impôt sur le Revenu ──────────────────────────────────────────

export function calculateIR(netImposable: number, nbParts: number): IRResult {
  const revenuParPart = netImposable / nbParts;

  // Calcul par tranche sur 1 part
  const brackets: TaxBracketResult[] = IR_BRACKETS.map((bracket) => {
    const max = bracket.max ?? Infinity;
    const taxableInBracket = Math.max(0, Math.min(revenuParPart, max) - bracket.min);
    const taxInBracket = taxableInBracket * bracket.rate;
    return {
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      taxableInBracket,
      taxInBracket,
    };
  });

  const irPerPart = brackets.reduce((sum, b) => sum + b.taxInBracket, 0);

  // IR sans QF (référence 1 part pour célibataire, 2 pour couple)
  // Simplifié : on calcule l'avantage QF par rapport à la situation sans enfants
  const baseParts = nbParts >= 2 ? 2 : 1;
  const revenuParPartBase = netImposable / baseParts;
  const irPerPartBase = IR_BRACKETS.reduce((sum, bracket) => {
    const max = bracket.max ?? Infinity;
    const taxable = Math.max(0, Math.min(revenuParPartBase, max) - bracket.min);
    return sum + taxable * bracket.rate;
  }, 0);
  const irSansQF = irPerPartBase * baseParts;
  const irAvecQF = irPerPart * nbParts;

  // Plafonnement QF
  const extraHalfParts = (nbParts - baseParts) * 2; // nombre de demi-parts supplémentaires
  const maxAdvantage = extraHalfParts * QF_CEILING_PER_HALF_PART;
  const qfAdvantage = irSansQF - irAvecQF;
  const irTotal = qfAdvantage > maxAdvantage ? irSansQF - maxAdvantage : irAvecQF;

  const effectiveRate = netImposable > 0 ? irTotal / netImposable : 0;

  // Tranche marginale : dernière tranche avec montant taxable > 0
  const lastActiveBracket = [...brackets].reverse().find((b) => b.taxableInBracket > 0);
  const marginalRate = lastActiveBracket?.rate ?? 0;

  return {
    brackets,
    irTotal: Math.max(0, Math.round(irTotal)),
    effectiveRate,
    marginalRate,
    nbParts,
    revenuImposable: netImposable,
  };
}

// ─── TVA estimée ──────────────────────────────────────────────────

export function estimateTVA(netAfterIR: number): TVAResult {
  // Hypothèse : ~80% du revenu net est consommé (le reste est épargné)
  const consumption = netAfterIR * 0.8;
  const estimatedTVA = consumption * TVA_EFFECTIVE_RATE;

  return {
    estimatedTVA: Math.round(estimatedTVA),
    effectiveRate: TVA_EFFECTIVE_RATE,
  };
}

// ─── Répartition budgétaire ───────────────────────────────────────

export function calculateBudgetAllocation(totalTaxes: number): BudgetMission[] {
  return BUDGET_MISSIONS.map((mission) => ({
    label: mission.label,
    percentage: mission.percentage,
    amount: Math.round((totalTaxes * mission.percentage) / 100),
    color: mission.color,
    icon: mission.icon,
  }));
}

// ─── Simulation complète ──────────────────────────────────────────

export function runFullSimulation(input: SimulatorInput): TaxSimulationResult {
  const { annualGross, isSingle, nbChildren } = input;
  const nbParts = calculateQFParts(isSingle, nbChildren);

  // Cotisations sociales
  const cotisations = calculateSocialContributions(annualGross);

  // Revenu net imposable
  const netImposable = calculateNetImposable(annualGross);

  // IR
  const ir = calculateIR(netImposable, nbParts);

  // Net après IR et cotisations
  const netApresIR = annualGross - cotisations.total - ir.irTotal;

  // TVA estimée
  const tva = estimateTVA(netApresIR);

  // Total prélèvements
  const totalPrelevements = cotisations.total + ir.irTotal + tva.estimatedTVA;

  // Taux effectif global
  const tauxEffectifGlobal = annualGross > 0 ? totalPrelevements / annualGross : 0;

  // Répartition budgétaire (basée sur IR + TVA, pas les cotisations qui vont à la sécu)
  const budgetAllocation = calculateBudgetAllocation(ir.irTotal + tva.estimatedTVA);

  return {
    input,
    nbParts,
    netImposable,
    ir,
    cotisations,
    tva,
    totalPrelevements,
    netApresIR,
    tauxEffectifGlobal,
    budgetAllocation,
  };
}
