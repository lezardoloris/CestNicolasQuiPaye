import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useXpResponse } from '@/hooks/useXpResponse';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock gamification store
const mockAddXpToast = vi.fn();
const mockIncrementTodayXp = vi.fn();
const mockSetStats = vi.fn();
let mockLoaded = true;

vi.mock('@/stores/gamification-store', () => ({
  useGamificationStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      addXpToast: mockAddXpToast,
      incrementTodayXp: mockIncrementTodayXp,
      setStats: mockSetStats,
      loaded: mockLoaded,
    };
    return selector(state);
  },
}));

// Mock xp-config
vi.mock('@/lib/gamification/xp-config', () => ({
  getLevelFromXp: vi.fn((totalXp: number) => {
    if (totalXp >= 300) return { level: 3, title: 'Sentinelle', minXp: 300 };
    if (totalXp >= 100) return { level: 2, title: 'Citoyen Vigilant', minXp: 100 };
    return { level: 1, title: 'Citoyen', minXp: 0 };
  }),
}));

describe('useXpResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoaded = true;
  });

  it('s\'importe correctement', () => {
    expect(useXpResponse).toBeDefined();
    expect(typeof useXpResponse).toBe('function');
  });

  it('retourne processXpResponse comme fonction', () => {
    const { result } = renderHook(() => useXpResponse());
    expect(typeof result.current.processXpResponse).toBe('function');
  });

  it('ne fait rien si le store n\'est pas charge (loaded=false)', () => {
    mockLoaded = false;
    const { result } = renderHook(() => useXpResponse());

    act(() => {
      result.current.processXpResponse({
        data: { xp: { amount: 10, total: 100, leveledUp: false, newLevel: null, newLevelTitle: null, streak: 0 } },
      });
    });

    expect(mockAddXpToast).not.toHaveBeenCalled();
    expect(mockIncrementTodayXp).not.toHaveBeenCalled();
  });

  it('ne fait rien si la reponse ne contient pas de donnees XP', () => {
    const { result } = renderHook(() => useXpResponse());

    act(() => {
      result.current.processXpResponse({ data: {} });
    });

    expect(mockAddXpToast).not.toHaveBeenCalled();
  });

  it('ne fait rien si le montant XP est 0', () => {
    const { result } = renderHook(() => useXpResponse());

    act(() => {
      result.current.processXpResponse({
        data: { xp: { amount: 0, total: 50, leveledUp: false, newLevel: null, newLevelTitle: null, streak: 0 } },
      });
    });

    expect(mockAddXpToast).not.toHaveBeenCalled();
  });

  it('ne fait rien si le montant XP est negatif', () => {
    const { result } = renderHook(() => useXpResponse());

    act(() => {
      result.current.processXpResponse({
        data: { xp: { amount: -5, total: 50, leveledUp: false, newLevel: null, newLevelTitle: null, streak: 0 } },
      });
    });

    expect(mockAddXpToast).not.toHaveBeenCalled();
  });

  it('ne fait rien si la reponse est null ou undefined', () => {
    const { result } = renderHook(() => useXpResponse());

    act(() => {
      result.current.processXpResponse(null);
    });
    expect(mockAddXpToast).not.toHaveBeenCalled();

    act(() => {
      result.current.processXpResponse(undefined);
    });
    expect(mockAddXpToast).not.toHaveBeenCalled();
  });

  it('declenche un toast XP et incremente le XP du jour', () => {
    const { result } = renderHook(() => useXpResponse());

    act(() => {
      result.current.processXpResponse({
        data: {
          xp: {
            amount: 10,
            total: 110,
            leveledUp: false,
            newLevel: null,
            newLevelTitle: null,
            streak: 0,
          },
        },
      });
    });

    expect(mockAddXpToast).toHaveBeenCalledWith(10, false, null);
    expect(mockIncrementTodayXp).toHaveBeenCalledWith(10);
  });

  it('met a jour les stats de niveau lors d\'un level-up', () => {
    const { result } = renderHook(() => useXpResponse());

    act(() => {
      result.current.processXpResponse({
        data: {
          xp: {
            amount: 50,
            total: 300,
            leveledUp: true,
            newLevel: 3,
            newLevelTitle: 'Sentinelle',
            streak: 0,
          },
        },
      });
    });

    expect(mockAddXpToast).toHaveBeenCalledWith(50, true, 'Sentinelle');
    expect(mockSetStats).toHaveBeenCalledWith({
      level: 3,
      levelTitle: 'Sentinelle',
      totalXp: 300,
    });
  });

  it('ne met pas a jour le niveau si leveledUp est false', () => {
    const { result } = renderHook(() => useXpResponse());

    act(() => {
      result.current.processXpResponse({
        data: {
          xp: {
            amount: 5,
            total: 50,
            leveledUp: false,
            newLevel: null,
            newLevelTitle: null,
            streak: 0,
          },
        },
      });
    });

    expect(mockSetStats).not.toHaveBeenCalled();
  });

  it('met a jour le streak si superieur a 0', () => {
    const { result } = renderHook(() => useXpResponse());

    act(() => {
      result.current.processXpResponse({
        data: {
          xp: {
            amount: 10,
            total: 100,
            leveledUp: false,
            newLevel: null,
            newLevelTitle: null,
            streak: 5,
          },
        },
      });
    });

    expect(mockSetStats).toHaveBeenCalledWith({ currentStreak: 5 });
  });

  it('ne met pas a jour le streak si egal a 0', () => {
    const { result } = renderHook(() => useXpResponse());

    act(() => {
      result.current.processXpResponse({
        data: {
          xp: {
            amount: 10,
            total: 100,
            leveledUp: false,
            newLevel: null,
            newLevelTitle: null,
            streak: 0,
          },
        },
      });
    });

    expect(mockSetStats).not.toHaveBeenCalled();
  });

  it('affiche un toast de cooldown de session une seule fois', async () => {
    const { toast } = await import('sonner');
    const { result } = renderHook(() => useXpResponse());

    act(() => {
      result.current.processXpResponse({
        data: {
          xp: {
            amount: 10,
            total: 600,
            leveledUp: false,
            newLevel: null,
            newLevelTitle: null,
            streak: 0,
            sessionCooldown: true,
          },
        },
      });
    });

    expect(toast).toHaveBeenCalledWith(
      expect.stringContaining('Bonne session'),
      expect.objectContaining({ duration: 5000 }),
    );

    vi.mocked(toast).mockClear();

    // Deuxieme appel avec sessionCooldown - ne devrait pas afficher a nouveau
    act(() => {
      result.current.processXpResponse({
        data: {
          xp: {
            amount: 5,
            total: 610,
            leveledUp: false,
            newLevel: null,
            newLevelTitle: null,
            streak: 0,
            sessionCooldown: true,
          },
        },
      });
    });

    expect(toast).not.toHaveBeenCalled();
  });

  it('accepte les donnees XP au format alternatif (apiResponse.xp)', () => {
    const { result } = renderHook(() => useXpResponse());

    act(() => {
      result.current.processXpResponse({
        xp: {
          amount: 15,
          total: 200,
          leveledUp: false,
          newLevel: null,
          newLevelTitle: null,
          streak: 2,
        },
      });
    });

    expect(mockAddXpToast).toHaveBeenCalledWith(15, false, null);
    expect(mockIncrementTodayXp).toHaveBeenCalledWith(15);
    expect(mockSetStats).toHaveBeenCalledWith({ currentStreak: 2 });
  });
});
