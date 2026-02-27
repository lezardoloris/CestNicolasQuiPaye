'use client';

import { useState, useCallback } from 'react';

/**
 * Minimal auth hook for voting.
 * In a full implementation, this would read from NextAuth session.
 * For now, it provides the interface needed by useVote.
 */
export function useSession() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  // TODO: Replace with actual NextAuth session check
  // const session = useSession() from next-auth/react
  const isAuthenticated = false;

  const openAuthGate = useCallback(() => {
    setShowAuthModal(true);
    // In production, this would open the LazyAuthGate modal
    // For now, redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
    }
  }, []);

  return {
    isAuthenticated,
    showAuthModal,
    setShowAuthModal,
    openAuthGate,
  };
}
