import { SITE_URL } from '@/lib/metadata';

/**
 * Build the canonical share text for a submission.
 */
export function buildShareText(
  title: string,
  costPerTaxpayer: number
): string {
  const truncatedTitle = title.length > 80 ? title.slice(0, 80) + '...' : title;
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(costPerTaxpayer);
  return `${truncatedTitle} coute ${formatted} EUR par an a chaque contribuable francais. #NicolasPaye #Tronconneuse`;
}

/**
 * Append UTM parameters to a URL.
 */
export function appendUtmParams(
  url: string,
  source: string,
  medium: string,
  campaign = 'submission'
): string {
  const u = new URL(url);
  u.searchParams.set('utm_source', source);
  u.searchParams.set('utm_medium', medium);
  u.searchParams.set('utm_campaign', campaign);
  return u.toString();
}

/**
 * Build the submission URL with optional UTM params.
 */
export function buildSubmissionUrl(
  submissionId: string,
  source?: string,
  medium?: string
): string {
  const base = `${SITE_URL}/submissions/${submissionId}`;
  if (source && medium) {
    return appendUtmParams(base, source, medium);
  }
  return base;
}

/**
 * Build Twitter share intent URL.
 */
export function buildTwitterShareUrl(text: string, url: string): string {
  const params = new URLSearchParams({ text, url });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Build Facebook share URL.
 */
export function buildFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/**
 * Build WhatsApp share URL.
 */
export function buildWhatsAppShareUrl(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
}

/**
 * Copy text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch {
    return false;
  }
}

/**
 * Feature detect Web Share API.
 */
export function canUseWebShareApi(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

/**
 * Trigger native share via Web Share API.
 */
export async function triggerWebShare(
  title: string,
  text: string,
  url: string
): Promise<boolean> {
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}

/**
 * Open a popup window for social sharing.
 */
export function openSharePopup(url: string): void {
  window.open(url, '_blank', 'width=550,height=420,noopener,noreferrer');
}

/**
 * Sanitize a referrer to domain only.
 */
export function sanitizeReferrer(referrer: string): string {
  try {
    return new URL(referrer).hostname;
  } catch {
    return '';
  }
}
