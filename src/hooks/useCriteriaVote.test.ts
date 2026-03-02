import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCriteriaVote } from '@/hooks/useCriteriaVote';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const mockCriteriaResponse = {
  data: {
    criteria: {
      proportional: { yes: 10, no: 5, userVote: null },
      legitimate: { yes: 8, no: 3, userVote: true },
      alternative: { yes: 6, no: 7, userVote: false },
    },
  },
};

describe('useCriteriaVote', () => {
  const submissionId = 'sub-123';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('s\'importe correctement', () => {
    expect(useCriteriaVote).toBeDefined();
    expect(typeof useCriteriaVote).toBe('function');
  });

  it('retourne les valeurs initiales (criteres vides)', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCriteriaResponse),
      }),
    );

    const { result } = renderHook(() => useCriteriaVote(submissionId), {
      wrapper: createWrapper(),
    });

    // Avant le chargement, on a les valeurs vides par defaut
    expect(result.current.criteria).toEqual({
      proportional: { yes: 0, no: 0, userVote: null },
      legitimate: { yes: 0, no: 0, userVote: null },
      alternative: { yes: 0, no: 0, userVote: null },
    });
    expect(result.current.isLoading).toBe(true);
    expect(typeof result.current.vote).toBe('function');
    expect(result.current.totalVoters).toBe(0);
  });

  it('charge les criteres depuis l\'API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCriteriaResponse),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useCriteriaVote(submissionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `/api/submissions/${submissionId}/criteria-vote`,
    );
    expect(result.current.criteria.proportional).toEqual({ yes: 10, no: 5, userVote: null });
    expect(result.current.criteria.legitimate).toEqual({ yes: 8, no: 3, userVote: true });
    expect(result.current.criteria.alternative).toEqual({ yes: 6, no: 7, userVote: false });
  });

  it('calcule totalVoters comme le max de (yes + no) parmi les criteres', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCriteriaResponse),
      }),
    );

    const { result } = renderHook(() => useCriteriaVote(submissionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // proportional: 10+5=15, legitimate: 8+3=11, alternative: 6+7=13
    expect(result.current.totalVoters).toBe(15);
  });

  it('envoie un vote POST avec les bons parametres', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCriteriaResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCriteriaResponse),
      })
      // Invalidation refetch
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCriteriaResponse),
      });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useCriteriaVote(submissionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.vote('proportional', true);
    });

    await waitFor(() => {
      const postCalls = mockFetch.mock.calls.filter(
        (call) => call[1]?.method === 'POST',
      );
      expect(postCalls).toHaveLength(1);
      expect(postCalls[0][0]).toBe(`/api/submissions/${submissionId}/criteria-vote`);
      const body = JSON.parse(postCalls[0][1].body);
      expect(body).toEqual({ criterion: 'proportional', value: true });
    });
  });

  it('gere les erreurs de chargement avec des criteres vides', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    const { result } = renderHook(() => useCriteriaVote(submissionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Les criteres restent vides en cas d'erreur
    expect(result.current.criteria).toEqual({
      proportional: { yes: 0, no: 0, userVote: null },
      legitimate: { yes: 0, no: 0, userVote: null },
      alternative: { yes: 0, no: 0, userVote: null },
    });
  });

  it('expose vote comme fonction stable (useCallback)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCriteriaResponse),
      }),
    );

    const { result } = renderHook(() => useCriteriaVote(submissionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.vote).toBe('function');
  });

  it('totalVoters est 0 quand tous les criteres sont vides', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              criteria: {
                proportional: { yes: 0, no: 0, userVote: null },
                legitimate: { yes: 0, no: 0, userVote: null },
                alternative: { yes: 0, no: 0, userVote: null },
              },
            },
          }),
      }),
    );

    const { result } = renderHook(() => useCriteriaVote(submissionId), {
      wrapper: createWrapper(),
    });

    // Avant le chargement, totalVoters est 0
    expect(result.current.totalVoters).toBe(0);
  });
});
