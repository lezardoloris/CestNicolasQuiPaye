import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSession } from '@/hooks/useAuth';

describe('useAuth (useSession)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('s\'importe correctement', () => {
    expect(useSession).toBeDefined();
    expect(typeof useSession).toBe('function');
  });

  it('retourne isAuthenticated a false par defaut', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('retourne showAuthModal a false par defaut', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.showAuthModal).toBe(false);
  });

  it('expose setShowAuthModal pour mettre a jour le modal', () => {
    const { result } = renderHook(() => useSession());
    expect(typeof result.current.setShowAuthModal).toBe('function');

    act(() => {
      result.current.setShowAuthModal(true);
    });
    expect(result.current.showAuthModal).toBe(true);

    act(() => {
      result.current.setShowAuthModal(false);
    });
    expect(result.current.showAuthModal).toBe(false);
  });

  it('expose openAuthGate comme fonction', () => {
    const { result } = renderHook(() => useSession());
    expect(typeof result.current.openAuthGate).toBe('function');
  });

  it('openAuthGate redirige vers /login avec callbackUrl', () => {
    // Mock window.location
    const originalLocation = window.location;
    const locationMock = { ...originalLocation, href: '', pathname: '/s/test-submission' };
    Object.defineProperty(window, 'location', {
      value: locationMock,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useSession());

    act(() => {
      result.current.openAuthGate();
    });

    expect(locationMock.href).toContain('/login?callbackUrl=');
    expect(locationMock.href).toContain(encodeURIComponent('/s/test-submission'));

    // Restore
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('retourne une reference stable pour openAuthGate', () => {
    const { result, rerender } = renderHook(() => useSession());
    const firstRef = result.current.openAuthGate;
    rerender();
    expect(result.current.openAuthGate).toBe(firstRef);
  });
});
