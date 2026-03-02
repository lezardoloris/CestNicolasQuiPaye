/**
 * Barèmes fiscaux français 2026 (revenus 2025).
 * Sources : LFI 2026, INSEE, URSSAF, Sécurité sociale.
 */

import type { PublicProfile } from '@/types/simulator';

// ─── IR : Barème par tranche (par part de QF) ────────────────────

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export const IR_BRACKETS: TaxBracket[] = [
  { min: 0, max: 11_600, rate: 0 },
  { min: 11_600, max: 29_579, rate: 0.11 },
  { min: 29_579, max: 84_577, rate: 0.30 },
  { min: 84_577, max: 181_917, rate: 0.41 },
  { min: 181_917, max: null, rate: 0.45 },
];

/** Plafond de l'avantage du quotient familial par demi-part supplémentaire */
export const QF_CEILING_PER_HALF_PART = 1_759;

/** Décote applicable si l'IR brut est inférieur à ce seuil */
export const DECOTE_THRESHOLD_SINGLE = 1_929;
export const DECOTE_THRESHOLD_COUPLE = 3_191;

// ─── Cotisations salariales ──────────────────────────────────────

/** Assiette CSG/CRDS : 98.25% du brut */
export const CSG_CRDS_BASE_RATE = 0.9825;

export const COTISATIONS = {
  /** CSG totale : 9.2% (dont 6.8% déductible, 2.4% non déductible) */
  csg: { rate: 0.092, deductibleRate: 0.068, nonDeductibleRate: 0.024 },
  /** CRDS : 0.5% (non déductible) */
  crds: { rate: 0.005 },
  /** Retraite de base (CNAV) : 6.9% du brut plafonné */
  retraiteBase: { rate: 0.069 },
  /** Retraite complémentaire (AGIRC-ARRCO) : ~3.86% */
  retraiteComplementaire: { rate: 0.0386 },
  /** Assurance maladie : 0% depuis 2018 (supprimée pour la plupart) */
  assuranceMaladie: { rate: 0 },
  /** Chômage : 0% côté salarié depuis 2018 */
  chomage: { rate: 0 },
} as const;

/** Plafond annuel de la Sécurité sociale 2026 */
export const PASS_2026 = 47_100;

/** Taux global approximatif des cotisations salariales (hors CSG/CRDS) */
export const COTISATIONS_RATE_APPROX = 0.1076; // retraite base + complémentaire

// ─── TVA ─────────────────────────────────────────────────────────

/** Taux effectif moyen de TVA sur la consommation (~13%) */
export const TVA_EFFECTIVE_RATE = 0.13;

// ─── Quotient familial ───────────────────────────────────────────

/**
 * Calcule le nombre de parts du QF.
 * Célibataire = 1, couple = 2.
 * Enfants : +0.5 pour les 2 premiers, +1 à partir du 3e.
 */
export function calculateQFParts(isSingle: boolean, nbChildren: number): number {
  const baseParts = isSingle ? 1 : 2;
  let childParts = 0;
  if (nbChildren >= 1) childParts += 0.5;
  if (nbChildren >= 2) childParts += 0.5;
  if (nbChildren >= 3) childParts += nbChildren - 2; // +1 par enfant à partir du 3e
  return baseParts + childParts;
}

// ─── Répartition budgétaire par mission (LFI 2026) ───────────────

export const BUDGET_MISSIONS = [
  { label: 'Enseignement scolaire', percentage: 17.0, color: '#3B82F6', icon: '🏫' },
  { label: 'Défense', percentage: 14.2, color: '#6366F1', icon: '🛡️' },
  { label: 'Recherche & enseignement supérieur', percentage: 7.5, color: '#8B5CF6', icon: '🔬' },
  { label: 'Solidarité & insertion', percentage: 7.3, color: '#EC4899', icon: '🤝' },
  { label: 'Écologie & mobilité', percentage: 6.5, color: '#10B981', icon: '🌿' },
  { label: 'Sécurités', percentage: 5.8, color: '#F59E0B', icon: '🚔' },
  { label: 'Cohésion des territoires', percentage: 5.3, color: '#14B8A6', icon: '🏘️' },
  { label: 'Travail & emploi', percentage: 4.5, color: '#F97316', icon: '💼' },
  { label: 'Justice', percentage: 3.2, color: '#EF4444', icon: '⚖️' },
  { label: 'Santé', percentage: 3.0, color: '#06B6D4', icon: '🏥' },
  { label: 'Charge de la dette', percentage: 12.7, color: '#DC2626', icon: '💸' },
  { label: 'Autres missions', percentage: 13.0, color: '#9CA3AF', icon: '📋' },
] as const;

// ─── Profils de coût public ──────────────────────────────────────

export const PUBLIC_PROFILES: PublicProfile[] = [
  {
    type: 'enfant',
    label: 'Enfant (0-17 ans)',
    icon: '👶',
    annualCost: 7_000,
    breakdown: [
      { label: 'Éducation nationale', amount: 4_800 },
      { label: 'Allocations familiales', amount: 1_400 },
      { label: 'Santé (PUMa)', amount: 800 },
    ],
    source: 'Éducation nationale, CNAF, DREES',
  },
  {
    type: 'etudiant',
    label: 'Étudiant',
    icon: '🎓',
    annualCost: 9_300,
    breakdown: [
      { label: 'Enseignement supérieur', amount: 7_200 },
      { label: 'Bourses & aides', amount: 1_300 },
      { label: 'Santé', amount: 800 },
    ],
    source: 'Min. Enseignement supérieur, CNOUS',
  },
  {
    type: 'actif',
    label: 'Actif (salarié)',
    icon: '💼',
    annualCost: 3_600,
    breakdown: [
      { label: 'Santé (CNAM)', amount: 3_200 },
      { label: 'Services publics nets', amount: 400 },
    ],
    source: 'CNAM, DREES (contributeur net)',
  },
  {
    type: 'chomeur',
    label: 'Demandeur d\'emploi',
    icon: '📋',
    annualCost: 15_000,
    breakdown: [
      { label: 'Allocation chômage (ARE)', amount: 10_500 },
      { label: 'France Travail', amount: 2_500 },
      { label: 'Santé', amount: 2_000 },
    ],
    source: 'Unédic, France Travail',
  },
  {
    type: 'retraite',
    label: 'Retraité',
    icon: '🧓',
    annualCost: 25_612,
    breakdown: [
      { label: 'Pension retraite (CNAV)', amount: 19_512 },
      { label: 'Santé (surconsommation)', amount: 6_100 },
    ],
    source: 'CNAV, DREES',
  },
  {
    type: 'rsa',
    label: 'Bénéficiaire RSA',
    icon: '🏠',
    annualCost: 11_358,
    breakdown: [
      { label: 'RSA socle', amount: 7_758 },
      { label: 'Complémentaire santé (C2S)', amount: 2_000 },
      { label: 'APL', amount: 1_600 },
    ],
    source: 'CNAF, DREES',
  },
];

// ─── Salaires de référence ───────────────────────────────────────

export const REFERENCE_SALARIES = {
  smic: 21_622, // SMIC annuel brut 2026
  median: 29_000, // Salaire médian brut (~INSEE)
  moyen: 39_800, // Salaire moyen brut (~INSEE)
} as const;
