import type {
  CostToNicolasResult,
  DenominatorData,
} from '@/types/cost-engine';

// ─── Configuration ─────────────────────────────────────────────────

const COST_ENGINE_URL =
  process.env.COST_ENGINE_URL || 'http://localhost:8000';
const COST_ENGINE_KEY = process.env.COST_ENGINE_KEY || '';

// ─── Cost Engine Client ────────────────────────────────────────────

/**
 * Calculate Cost to Nicolas for a given amount in EUR.
 * Calls the Python FastAPI microservice.
 */
export async function calculateCostToNicolas(
  amountEur: number
): Promise<CostToNicolasResult> {
  const response = await fetch(
    `${COST_ENGINE_URL}/api/cost-to-nicolas`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': COST_ENGINE_KEY,
      },
      body: JSON.stringify({ amount_eur: amountEur }),
      signal: AbortSignal.timeout(5000), // 5s timeout (NFR3)
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.error || `Cost engine error: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Fetch all denominator data from the cost engine.
 * Used by the Data Status and Methodology pages.
 */
export async function fetchDenominators(): Promise<DenominatorData[]> {
  const response = await fetch(
    `${COST_ENGINE_URL}/api/denominators`,
    {
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch denominators: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Trigger a manual refresh of all denominators.
 * Requires admin API key.
 */
export async function refreshDenominators(
  adminKey: string
): Promise<{ updated: string[]; failed: string[]; message: string }> {
  const response = await fetch(
    `${COST_ENGINE_URL}/api/denominators/refresh`,
    {
      method: 'POST',
      headers: {
        'X-Admin-Key': adminKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to refresh denominators: ${response.status}`
    );
  }

  return response.json();
}
