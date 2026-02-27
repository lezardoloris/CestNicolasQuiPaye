import type { DenominatorData } from '@/types/cost-engine';
import { getCachedDenominators } from './cost-cache';

/**
 * Get denominator data for server-side rendering.
 * Uses the cache layer which falls back to seed data if the cost engine is unavailable.
 */
export async function getDenominators(): Promise<DenominatorData[]> {
  return getCachedDenominators();
}

/**
 * Get a single denominator by key.
 */
export async function getDenominator(
  key: string
): Promise<DenominatorData | undefined> {
  const all = await getDenominators();
  return all.find((d) => d.key === key);
}

/**
 * Get denominators as a lookup map (key -> DenominatorData).
 */
export async function getDenominatorMap(): Promise<
  Record<string, DenominatorData>
> {
  const all = await getDenominators();
  return Object.fromEntries(all.map((d) => [d.key, d]));
}
