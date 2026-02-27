'use client';

import { useEffect, useRef } from 'react';

/**
 * Track a page view once per mount.
 * Sends a POST to the page-views endpoint with UTM params from the URL.
 */
export function usePageView(pagePath: string) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const params = new URLSearchParams(window.location.search);

    const payload: Record<string, string> = { pagePath };
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const referrer = document.referrer || undefined;

    if (utmSource) payload.utmSource = utmSource;
    if (utmMedium) payload.utmMedium = utmMedium;
    if (utmCampaign) payload.utmCampaign = utmCampaign;
    if (referrer) payload.referrer = referrer;

    // Fire and forget - no need to await
    fetch('/api/page-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently fail - analytics should never block user experience
    });
  }, [pagePath]);
}
