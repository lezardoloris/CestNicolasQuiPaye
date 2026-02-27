// ─── Denominator Types ─────────────────────────────────────────────

export interface DenominatorData {
  key: string;
  value: number;
  source_name: string;
  source_url: string;
  last_updated: string;
  update_frequency: string;
}

export interface DenominatorCache {
  data: DenominatorData[];
  cachedAt: string;
  ttl: number;
}

// ─── Cost Calculation Types ────────────────────────────────────────

export interface Equivalence {
  label: string;
  count: number;
  unit_cost: number;
  source_url: string;
}

export interface DenominatorUsed {
  key: string;
  value: number;
  source_url: string;
  last_updated: string;
}

export interface CostToNicolasResult {
  amount_eur: number;
  cost_per_citizen: number | null;
  cost_per_taxpayer: number | null;
  cost_per_household: number | null;
  days_of_work_equivalent: number | null;
  equivalences: Equivalence[];
  denominators_used: DenominatorUsed[];
  calculated_at: string;
  cost_per_citizen_unavailable?: boolean;
  cost_per_taxpayer_unavailable?: boolean;
  cost_per_household_unavailable?: boolean;
  days_of_work_unavailable?: boolean;
}

// ─── API Response Envelope ─────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
  meta: Record<string, unknown>;
}
