/**
 * Template-based AI context generator.
 * Generates budget context, cost comparisons, and related facts
 * from existing static budget data — zero API cost.
 */

import {
  BUDGET_2026,
  BUDGET_MISSIONS,
  PUBLIC_SPENDING,
  PUBLIC_SALARIES,
  SMIC_2025,
} from '@/lib/constants/budget-2026';
import { getCategoryBudgetFact } from '@/lib/constants/category-budget-context';

interface TemplateInput {
  title: string;
  amount: number; // euros
  ministryTag: string | null;
  costPerTaxpayer: number | null;
}

interface TemplateOutput {
  budgetContext: string;
  costComparison: string;
  relatedFacts: string[];
}

/**
 * Generate a full AI context from static budget data.
 * Pure function, no API calls, deterministic.
 */
export function generateTemplateContext(input: TemplateInput): TemplateOutput {
  const budgetContext = buildBudgetContext(input);
  const costComparison = buildCostComparison(input.amount);
  const relatedFacts = buildRelatedFacts(input);

  return { budgetContext, costComparison, relatedFacts };
}

// ─── Budget Context ──────────────────────────────────────────────────

function buildBudgetContext(input: TemplateInput): string {
  const parts: string[] = [];

  // Category-specific budget fact
  const categoryFact = getCategoryBudgetFact(input.ministryTag);
  if (categoryFact) {
    parts.push(categoryFact.fact + '.');
  }

  // Find matching mission
  const mission = findMatchingMission(input.ministryTag);
  if (mission) {
    const missionBn = mission.amount / 1000;
    const pctOfMission = (input.amount / (mission.amount * 1_000_000)) * 100;
    if (pctOfMission >= 0.0001) {
      parts.push(
        `Le budget « ${mission.name} » est de ${fmtBn(missionBn)} Md€. ` +
          `Cette dépense en représente ${fmtPct(pctOfMission)}.`,
      );
    }
  }

  // Total state budget context
  const pctOfStateBudget = (input.amount / (BUDGET_2026.netExpenditure * 1_000_000)) * 100;
  if (pctOfStateBudget >= 0.0001) {
    parts.push(
      `Sur un budget de l'État de ${fmtBn(BUDGET_2026.netExpenditure / 1000)} Md€, ` +
        `cela représente ${fmtPct(pctOfStateBudget)} des dépenses nettes.`,
    );
  }

  // Cost per taxpayer
  if (input.costPerTaxpayer && input.costPerTaxpayer > 0.01) {
    parts.push(`Coût pour chaque contribuable : ${fmtEur(input.costPerTaxpayer)}.`);
  }

  if (parts.length === 0) {
    parts.push(
      `Le budget total de l'État est de ${fmtBn(BUDGET_2026.netExpenditure / 1000)} Md€ ` +
        `pour ${fmtNum(BUDGET_2026.population)} habitants.`,
    );
  }

  return parts.join(' ');
}

// ─── Cost Comparisons ────────────────────────────────────────────────

function buildCostComparison(amount: number): string {
  const comparisons: string[] = [];

  // SMIC comparison
  const smicMonths = amount / SMIC_2025.monthlyNet;
  if (smicMonths >= 1) {
    comparisons.push(`${fmtNum(smicMonths)} mois de SMIC net (${fmtEur(SMIC_2025.monthlyNet)}/mois)`);
  } else {
    const smicDays = smicMonths * 30;
    comparisons.push(`${fmtNum(smicDays)} jours de SMIC net`);
  }

  // Deputy salary comparison
  const deputeSalary = PUBLIC_SALARIES.find((s) => s.role === 'Sénateur / Député');
  if (deputeSalary?.monthlyNet) {
    const deputeMonths = amount / deputeSalary.monthlyNet;
    if (deputeMonths >= 1) {
      comparisons.push(
        `${fmtNum(deputeMonths)} mois de salaire d'un député (${fmtEur(deputeSalary.monthlyNet)}/mois)`,
      );
    }
  }

  // President salary comparison (for larger amounts)
  const presidentSalary = PUBLIC_SALARIES.find((s) => s.role === 'Président de la République');
  if (presidentSalary?.monthlyNet && amount >= presidentSalary.monthlyNet * 12) {
    const presYears = amount / (presidentSalary.monthlyNet * 12);
    comparisons.push(
      `${fmtNum(presYears)} année${presYears >= 2 ? 's' : ''} de salaire présidentiel`,
    );
  }

  // Debt comparison (for very large amounts)
  if (amount >= 1_000_000) {
    const debtPct = (amount / (BUDGET_2026.currentDebtBn * 1_000_000_000)) * 100;
    if (debtPct >= 0.00001) {
      comparisons.push(`${fmtPct(debtPct)} de la dette publique (${BUDGET_2026.currentDebtBn} Md€)`);
    }
  }

  return comparisons.length > 0
    ? comparisons.map((c) => `• ${c}`).join('\n')
    : `• ${fmtEur(amount)} de dépense publique`;
}

// ─── Related Facts ───────────────────────────────────────────────────

function buildRelatedFacts(input: TemplateInput): string[] {
  const facts: string[] = [];

  // Deficit context
  facts.push(
    `Le déficit de l'État est de ${fmtBn(Math.abs(BUDGET_2026.deficit) / 1000)} Md€ en 2026 ` +
      `(${BUDGET_2026.deficitPctGdp}% du PIB).`,
  );

  // Debt context
  facts.push(
    `La dette publique atteint ${BUDGET_2026.currentDebtBn} Md€, ` +
      `soit ${fmtEur(Math.round((BUDGET_2026.currentDebtBn * 1_000_000_000) / BUDGET_2026.population))} par habitant.`,
  );

  // Interest on debt
  const interestBn =
    BUDGET_2026.debtTimeline.find((d) => d.year === 2026)?.interestBn ?? 55;
  facts.push(
    `La charge de la dette coûte ${interestBn} Md€/an, ` +
      `soit ${fmtEur(Math.round((interestBn * 1_000_000_000) / BUDGET_2026.taxpayers))}/contribuable.`,
  );

  // Category-specific fact from public spending
  const spendingFunc = findMatchingSpendingFunction(input.ministryTag);
  if (spendingFunc) {
    facts.push(
      `Les dépenses publiques en « ${spendingFunc.name} » totalisent ${spendingFunc.amountBn} Md€/an ` +
        `(${spendingFunc.pctTotal}% du total). Sur 1 000€ d'impôts, ${spendingFunc.per1000eur}€ y sont consacrés.`,
    );
  }

  // Number of taxpayers
  facts.push(
    `Seuls ${fmtNum(BUDGET_2026.taxpayers)} foyers (sur ${fmtNum(BUDGET_2026.totalFiscalHouseholds)}) ` +
      `paient effectivement l'impôt sur le revenu.`,
  );

  return facts;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const CATEGORY_TO_MISSION: Record<string, string> = {
  'Défense': 'Défense',
  'Éducation': 'Enseignement scolaire',
  'Recherche': 'Recherche & Ens. supérieur',
  'Santé': 'Solidarités & Santé',
  'Social': 'Solidarités & Santé',
  'Environnement': 'Écologie & Mobilité durables',
  'Transport': 'Écologie & Mobilité durables',
  'Énergie': 'Écologie & Mobilité durables',
  'Travail': 'Travail & Emploi',
  'Culture': 'Culture',
  'Institutions': 'Sécurités',
  'Agriculture': 'Agriculture, alimentation',
  'Collectivités': 'Relations collectivités',
  'Aménagement': 'Cohésion des territoires',
};

const CATEGORY_TO_SPENDING: Record<string, string> = {
  'Santé': 'Santé',
  'Social': 'Protection sociale',
  'Éducation': 'Enseignement',
  'Défense': 'Défense',
  'Culture': 'Culture et loisirs',
  'Environnement': 'Environnement',
  'Institutions': 'Services généraux',
  'Industrie': 'Affaires économiques',
  'Numérique': 'Affaires économiques',
  'Travail': 'Affaires économiques',
};

function findMatchingMission(ministryTag: string | null) {
  if (!ministryTag) return null;
  const missionName = CATEGORY_TO_MISSION[ministryTag];
  if (!missionName) return null;
  return BUDGET_MISSIONS.find((m) => m.name === missionName) ?? null;
}

function findMatchingSpendingFunction(ministryTag: string | null) {
  if (!ministryTag) return null;
  const funcName = CATEGORY_TO_SPENDING[ministryTag];
  if (!funcName) return null;
  return PUBLIC_SPENDING.find((s) => s.name === funcName) ?? null;
}

/** Format a number with French locale */
function fmtNum(n: number): string {
  return Math.round(n).toLocaleString('fr-FR');
}

/** Format euros with French locale */
function fmtEur(n: number): string {
  if (n >= 1_000_000_000) {
    return `${(n / 1_000_000_000).toFixed(1).replace('.', ',')} Md€`;
  }
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace('.', ',')} M€`;
  }
  return `${Math.round(n).toLocaleString('fr-FR')} €`;
}

/** Format billions */
function fmtBn(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',')} Md`;
  return n.toFixed(1).replace('.', ',');
}

/** Format percentage smartly */
function fmtPct(n: number): string {
  if (n >= 1) return `${n.toFixed(1).replace('.', ',')}%`;
  if (n >= 0.01) return `${n.toFixed(2).replace('.', ',')}%`;
  if (n >= 0.001) return `${n.toFixed(3).replace('.', ',')}%`;
  return `${n.toFixed(4).replace('.', ',')}%`;
}
