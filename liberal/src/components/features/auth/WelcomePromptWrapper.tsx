'use client';

import { useState, useSyncExternalStore, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import WelcomeDisplayNameModal from '@/components/features/auth/WelcomeDisplayNameModal';

function getCookieValue(name: string): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((row) => row.startsWith(`${name}=`));
}

function subscribeToCookies(_callback: () => void) {
  // Cookies don't have an event system; we just need an initial snapshot
  return () => {};
}

export default function WelcomePromptWrapper() {
  const { data: session, status } = useSession();
  const [dismissed, setDismissed] = useState(false);

  const hasDismissedCookie = useSyncExternalStore(
    subscribeToCookies,
    () => getCookieValue('liberal_welcome_dismissed'),
    () => false,
  );

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const shouldShow =
    isAuthenticated &&
    !session.user.displayName &&
    !hasDismissedCookie &&
    !dismissed;

  const handleClose = useCallback(() => {
    setDismissed(true);
  }, []);

  if (!shouldShow || !session?.user) return null;

  return (
    <WelcomeDisplayNameModal
      open={true}
      onClose={handleClose}
      anonymousId={session.user.anonymousId}
    />
  );
}
