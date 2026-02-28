declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string> }
    ) => void;
    umami?: { track: (event: string, data?: Record<string, string>) => void };
  }
}

/**
 * Track a custom event via Plausible or Umami (cookie-free analytics).
 * Fire-and-forget: never blocks UI, never throws.
 */
export function trackEvent(
  name: string,
  props?: Record<string, string>
): void {
  try {
    if (typeof window === 'undefined') return;

    // Plausible
    if (window.plausible) {
      window.plausible(name, { props });
      return;
    }

    // Umami
    if (window.umami) {
      window.umami.track(name, props);
      return;
    }
  } catch {
    // Silently fail -- analytics should never break the app
  }
}
