/** Types for the tax simulator (/simulateur) */

// ─── Input ────────────────────────────────────────────────────────

export interface SimulatorInput {
  annualGross: number;
  isSingle: boolean;
  nbChildren: number;
}

// ─── IR (Impôt sur le Revenu) ─────────────────────────────────────

export interface TaxBracketResult {
  min: number;
  max: number | null;
  rate: number;
  taxableInBracket: number;
  taxInBracket: number;
}

export interface IRResult {
  brackets: TaxBracketResult[];
  irTotal: number;
  effectiveRate: number;
  marginalRate: number;
  nbParts: number;
  revenuImposable: number;
}

// ─── Cotisations sociales ─────────────────────────────────────────

export interface SocialContributions {
  csg: number;
  crds: number;
  retraiteBase: number;
  retraiteComplementaire: number;
  assuranceMaladie: number;
  chomage: number;
  total: number;
}

// ─── TVA ──────────────────────────────────────────────────────────

export interface TVAResult {
  estimatedTVA: number;
  effectiveRate: number;
}

// ─── Budget allocation ────────────────────────────────────────────

export interface BudgetMission {
  label: string;
  percentage: number;
  amount: number;
  color: string;
  icon: string;
}

// ─── Profile comparison ───────────────────────────────────────────

export type ProfileType =
  | 'enfant'
  | 'etudiant'
  | 'actif'
  | 'chomeur'
  | 'retraite'
  | 'rsa';

export interface PublicProfile {
  type: ProfileType;
  label: string;
  icon: string;
  annualCost: number;
  breakdown: { label: string; amount: number }[];
  source: string;
}

// ─── Full simulation result ───────────────────────────────────────

export interface TaxSimulationResult {
  input: SimulatorInput;
  nbParts: number;
  netImposable: number;
  ir: IRResult;
  cotisations: SocialContributions;
  tva: TVAResult;
  totalPrelevements: number;
  netApresIR: number;
  tauxEffectifGlobal: number;
  budgetAllocation: BudgetMission[];
}
