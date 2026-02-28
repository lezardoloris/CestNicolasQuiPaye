/**
 * Format a number as EUR using French locale.
 * e.g. 12500000 -> "12 500 000,00 EUR"
 */
export function formatEUR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 EUR';

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format a number as EUR with 2 decimal places for cost-per-citizen display.
 * e.g. 0.0263 -> "0,03 EUR"
 */
export function formatEURPrecise(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0,00 EUR';

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a relative time string in French.
 * e.g. "il y a 3h", "il y a 2j", "il y a 5min"
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'il y a quelques secondes';
  if (diffMinutes < 60) return `il y a ${diffMinutes}min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  if (diffWeeks < 5) return `il y a ${diffWeeks}sem`;
  if (diffMonths < 12) return `il y a ${diffMonths}mois`;

  return `il y a ${Math.floor(diffDays / 365)}a`;
}

/**
 * Extract domain from a URL, stripping "www." prefix.
 * e.g. "https://www.lemonde.fr/article/123" -> "lemonde.fr"
 */
export function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Truncate a string to a maximum length, adding ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '\u2026';
}

/**
 * Format a score number compactly.
 * e.g. 1500 -> "1,5k"
 */
export function formatScore(score: number): string {
  if (Math.abs(score) < 1000) return String(score);
  const val = score / 1000;
  return (
    new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 1,
    }).format(val) + 'k'
  );
}

/**
 * Format work days in French.
 * e.g. 2.5 -> "2,5 jours de travail"
 */
export function formatWorkDays(days: number | string): string {
  const num = typeof days === 'string' ? parseFloat(days) : days;
  if (isNaN(num)) return '0 jours de travail';

  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num);

  return `${formatted} jours de travail`;
}

/**
 * Format a number compactly for display (e.g. 1200 -> "1,2k")
 */
export function formatCompactNumber(n: number): string {
  if (Math.abs(n) < 1000) return String(n);
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(n);
}

/**
 * Format EUR compactly for chart axes.
 * e.g. 1500000000 -> "1,5 Md €", 45000000 -> "45 M €"
 */
export function formatCompactEUR(n: number): string {
  if (Math.abs(n) < 1000) return `${n} €`;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Format a date in French locale (dd/MM/yyyy)
 */
export function formatDateFr(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * French pluralization helper
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count <= 1 ? singular : plural;
}

// ─── Denominator-specific formatting ───────────────────────────────

/**
 * Format a number with French locale with explicit decimal control.
 * Examples: 68373433 -> "68 373 433", 62.4658 -> "62,4658"
 */
export function formatFrenchNumber(
  value: number,
  decimals?: number
): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? (Number.isInteger(value) ? 0 : 4),
  }).format(value);
}

/**
 * Format a EUR amount with French locale and specific decimal places.
 * Example: 62.47 -> "62,47 EUR"
 */
export function formatFrenchCurrency(
  value: number,
  decimals = 2
): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a date as DD/MM/YYYY using French locale.
 */
export function formatFrenchDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
