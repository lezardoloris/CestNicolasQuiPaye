import type {
  DenominatorData,
  CostToNicolasResult,
  Equivalence,
  DenominatorUsed,
} from '@/types/cost-engine';

// ─── Denominator Keys ──────────────────────────────────────────────

const FRANCE_POPULATION = 'france_population';
const INCOME_TAX_PAYERS = 'income_tax_payers';
const FRANCE_HOUSEHOLDS = 'france_households';
const DAILY_MEDIAN_NET_INCOME = 'daily_median_net_income';
const SCHOOL_LUNCH_COST = 'school_lunch_cost';
const HOSPITAL_BED_DAY_COST = 'hospital_bed_day_cost';

// ─── Pure Calculation Functions ────────────────────────────────────

/**
 * Cost per citizen = amount / population
 */
export function costPerCitizen(amount: number, population: number): number {
  if (population <= 0) return 0;
  return amount / population;
}

/**
 * Cost per taxpayer = amount / taxpayers
 */
export function costPerTaxpayer(amount: number, taxpayers: number): number {
  if (taxpayers <= 0) return 0;
  return amount / taxpayers;
}

/**
 * Cost per household = amount / households
 */
export function costPerHousehold(amount: number, households: number): number {
  if (households <= 0) return 0;
  return amount / households;
}

/**
 * Days of work equivalent = (amount / taxpayers) / medianDailyWage
 */
export function daysOfWork(
  amount: number,
  taxpayers: number,
  medianDailyWage: number
): number {
  if (taxpayers <= 0 || medianDailyWage <= 0) return 0;
  return amount / taxpayers / medianDailyWage;
}

// ─── Formatting Functions ──────────────────────────────────────────

/**
 * Format a number as EUR currency with French locale.
 * Example: 11.7006 -> "11,70 EUR"
 */
export function formatEUR(n: number, decimals = 2): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

/**
 * Format a number of days in French.
 * Example: 0.69 -> "0,69 jour(s)"
 */
export function formatDays(n: number): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
  return `${formatted} jour${n >= 2 ? 's' : ''}`;
}

/**
 * Round to N decimal places using banker's rounding.
 */
function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ─── Full Calculation Engine ───────────────────────────────────────

/**
 * Calculate the full Cost to Nicolas result from an amount and denominator data.
 * Pure TypeScript implementation (mirrors the Python FastAPI service).
 */
export function calculateCostToNicolas(
  amountEur: number,
  denominators: DenominatorData[]
): CostToNicolasResult {
  // Build lookup map
  const denomMap = new Map<string, DenominatorData>();
  for (const d of denominators) {
    denomMap.set(d.key, d);
  }

  const denominatorsUsed: DenominatorUsed[] = [];
  const equivalences: Equivalence[] = [];

  const result: CostToNicolasResult = {
    amount_eur: amountEur,
    cost_per_citizen: null,
    cost_per_taxpayer: null,
    cost_per_household: null,
    days_of_work_equivalent: null,
    equivalences: [],
    denominators_used: [],
    calculated_at: new Date().toISOString(),
  };

  // Helper to get denominator value, returns null if missing or zero
  function getDenom(key: string): number | null {
    const entry = denomMap.get(key);
    if (!entry || entry.value === 0) return null;
    return entry.value;
  }

  // Helper to track denominator usage
  function trackDenom(key: string) {
    const entry = denomMap.get(key);
    if (entry) {
      denominatorsUsed.push({
        key: entry.key,
        value: entry.value,
        source_url: entry.source_url,
        last_updated: entry.last_updated,
      });
    }
  }

  // Cost per citizen
  const population = getDenom(FRANCE_POPULATION);
  if (population) {
    result.cost_per_citizen = roundTo(
      costPerCitizen(amountEur, population),
      4
    );
    trackDenom(FRANCE_POPULATION);
  } else {
    result.cost_per_citizen_unavailable = true;
  }

  // Cost per taxpayer + days of work
  const taxpayers = getDenom(INCOME_TAX_PAYERS);
  if (taxpayers) {
    const perTaxpayer = costPerTaxpayer(amountEur, taxpayers);
    result.cost_per_taxpayer = roundTo(perTaxpayer, 4);
    trackDenom(INCOME_TAX_PAYERS);

    const dailyIncome = getDenom(DAILY_MEDIAN_NET_INCOME);
    if (dailyIncome) {
      result.days_of_work_equivalent = roundTo(
        perTaxpayer / dailyIncome,
        2
      );
      trackDenom(DAILY_MEDIAN_NET_INCOME);
    } else {
      result.days_of_work_unavailable = true;
    }
  } else {
    result.cost_per_taxpayer_unavailable = true;
    result.days_of_work_unavailable = true;
  }

  // Cost per household
  const households = getDenom(FRANCE_HOUSEHOLDS);
  if (households) {
    result.cost_per_household = roundTo(
      costPerHousehold(amountEur, households),
      4
    );
    trackDenom(FRANCE_HOUSEHOLDS);
  } else {
    result.cost_per_household_unavailable = true;
  }

  // Equivalences (only if cost_per_citizen is available)
  if (result.cost_per_citizen !== null) {
    const lunchCost = getDenom(SCHOOL_LUNCH_COST);
    if (lunchCost) {
      const lunchEntry = denomMap.get(SCHOOL_LUNCH_COST)!;
      equivalences.push({
        label: 'repas de cantine scolaire',
        count: roundTo(result.cost_per_citizen / lunchCost, 2),
        unit_cost: lunchCost,
        source_url: lunchEntry.source_url,
      });
      trackDenom(SCHOOL_LUNCH_COST);
    }

    const hospitalCost = getDenom(HOSPITAL_BED_DAY_COST);
    if (hospitalCost) {
      const hospitalEntry = denomMap.get(HOSPITAL_BED_DAY_COST)!;
      equivalences.push({
        label: "journee d'hospitalisation",
        count: roundTo(result.cost_per_citizen / hospitalCost, 4),
        unit_cost: hospitalCost,
        source_url: hospitalEntry.source_url,
      });
      trackDenom(HOSPITAL_BED_DAY_COST);
    }
  }

  result.equivalences = equivalences;
  result.denominators_used = denominatorsUsed;

  return result;
}
