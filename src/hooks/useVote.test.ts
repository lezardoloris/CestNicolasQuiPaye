import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useVote } from '@/hooks/useVote';

// Mock useXpResponse
const mockProcessXpResponse = vi.fn();
vi.mock('@/hooks/useXpResponse', () => ({
  useXpResponse: () => ({ processXpResponse: mockProcessXpResponse }),
}));

// Mock vote store
const mockSetVote = vi.fn();
const mockSetCounts = vi.fn();
let mockGetVoteValue: 'up' | 'down' | null = null;
let mockGetCountsValue: { up: number; down: number } | undefined = undefined;

vi.mock('@/stores/vote-store', () => ({
  useVoteStore: () => ({
    setVote: mockSetVote,
    setCounts: mockSetCounts,
    getVote: () => mockGetVoteValue,
    getCounts: () => mockGetCountsValue,
  }),
}));

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

describe('useVote', () => {
  const submissionId = 'sub-123';
  const serverCounts = { up: 10, down: 3 };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVoteValue = null;
    mockGetCountsValue = undefined;
    vi.stubGlobal('fetch', vi.fn());
  });

  it('s\'importe correctement', () => {
    expect(useVote).toBeDefined();
    expect(typeof useVote).toBe('function');
  });

  it('retourne les valeurs initiales avec les compteurs du serveur', () => {
    const { result } = renderHook(() => useVote(submissionId, serverCounts), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentVote).toBeNull();
    expect(result.current.counts).toEqual({ up: 10, down: 3 });
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.vote).toBe('function');
  });

  it('utilise les compteurs du cache s\'ils existent', () => {
    mockGetCountsValue = { up: 15, down: 5 };
    mockGetVoteValue = 'up';

    const { result } = renderHook(() => useVote(submissionId, serverCounts), {
      wrapper: createWrapper(),
    });

    expect(result.current.counts).toEqual({ up: 15, down: 5 });
    expect(result.current.currentVote).toBe('up');
  });

  it('appelle fetch avec les bons parametres lors d\'un vote up', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { upvoteCount: 11, downvoteCount: 3, userVote: 'up' } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useVote(submissionId, serverCounts), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.vote('up');
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/submissions/${submissionId}/vote`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voteType: 'up' }),
        }),
      );
    });
  });

  it('appelle fetch avec les bons parametres lors d\'un vote down', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { upvoteCount: 10, downvoteCount: 4, userVote: 'down' } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useVote(submissionId, serverCounts), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.vote('down');
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/submissions/${submissionId}/vote`,
        expect.objectContaining({
          body: JSON.stringify({ voteType: 'down' }),
        }),
      );
    });
  });

  it('mise a jour optimiste : ajoute un upvote quand aucun vote existant', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { upvoteCount: 11, downvoteCount: 3, userVote: 'up' } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useVote(submissionId, serverCounts), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.vote('up');
    });

    // Optimistic update should call setVote and setCounts
    await waitFor(() => {
      expect(mockSetVote).toHaveBeenCalledWith(submissionId, 'up');
      expect(mockSetCounts).toHaveBeenCalledWith(submissionId, 11, 3);
    });
  });

  it('mise a jour optimiste : annule le vote si meme type', async () => {
    mockGetVoteValue = 'up';
    mockGetCountsValue = { up: 11, down: 3 };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { upvoteCount: 10, downvoteCount: 3, userVote: null } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useVote(submissionId, serverCounts), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.vote('up');
    });

    await waitFor(() => {
      // Toggle off: setVote(null), setCounts(up-1, down)
      expect(mockSetVote).toHaveBeenCalledWith(submissionId, null);
      expect(mockSetCounts).toHaveBeenCalledWith(submissionId, 10, 3);
    });
  });

  it('met a jour les compteurs du serveur apres succes', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: { upvoteCount: 12, downvoteCount: 2, userVote: 'up' },
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useVote(submissionId, serverCounts), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.vote('up');
    });

    await waitFor(() => {
      // On success, server values should be applied
      expect(mockSetCounts).toHaveBeenCalledWith(submissionId, 12, 2);
      expect(mockSetVote).toHaveBeenCalledWith(submissionId, 'up');
    });
  });

  it('appelle processXpResponse apres succes', async () => {
    const responseData = {
      data: { upvoteCount: 11, downvoteCount: 3, userVote: 'up', xp: { amount: 2 } },
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseData),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useVote(submissionId, serverCounts), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.vote('up');
    });

    await waitFor(() => {
      expect(mockProcessXpResponse).toHaveBeenCalledWith(responseData);
    });
  });

  it('restaure les valeurs precedentes en cas d\'erreur', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Vote failed' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useVote(submissionId, serverCounts), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.vote('up');
    });

    await waitFor(() => {
      // onError should restore previous values
      const setVoteCalls = mockSetVote.mock.calls;
      const lastSetVoteCall = setVoteCalls[setVoteCalls.length - 1];
      // Last call should restore null (previous vote)
      expect(lastSetVoteCall).toEqual([submissionId, null]);
    });
  });
});
