export type FreshnessStatus = 'fresh' | 'stale';

export interface FreshnessInfo {
  status: FreshnessStatus;
  label: string;
  nextUpdate: string; // DD/MM/YYYY
}

const FREQUENCY_MONTHS: Record<string, number> = {
  quarterly: 3,
  yearly: 12,
  monthly: 1,
};

/**
 * Determine if a denominator is fresh or stale.
 * Stale = last_updated > 6 months ago.
 * Fresh = within expected frequency window.
 */
export function getDenominatorFreshness(
  lastUpdated: string,
  updateFrequency: string
): FreshnessInfo {
  const lastDate = new Date(lastUpdated);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const isStale = lastDate < sixMonthsAgo;

  const frequencyMonths = FREQUENCY_MONTHS[updateFrequency] || 3;
  const nextUpdate = new Date(lastDate);
  nextUpdate.setMonth(nextUpdate.getMonth() + frequencyMonths);

  const nextUpdateFormatted = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(nextUpdate);

  return {
    status: isStale ? 'stale' : 'fresh',
    label: isStale ? 'Donnee potentiellement obsolete' : 'A jour',
    nextUpdate: nextUpdateFormatted,
  };
}
