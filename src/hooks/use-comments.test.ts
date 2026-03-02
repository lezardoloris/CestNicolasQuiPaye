import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useComments } from '@/hooks/use-comments';

// Mock sonner
vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock useXpResponse
const mockProcessXpResponse = vi.fn();
vi.mock('@/hooks/useXpResponse', () => ({
  useXpResponse: () => ({ processXpResponse: mockProcessXpResponse }),
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

const mockCommentsResponse = {
  data: [
    {
      id: 'comment-1',
      authorId: 'user-1',
      authorDisplay: 'Jean Dupont',
      submissionId: 'sub-1',
      parentCommentId: null,
      body: 'Premier commentaire',
      depth: 0,
      upvoteCount: 5,
      downvoteCount: 1,
      score: 4,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      deletedAt: null,
    },
    {
      id: 'comment-2',
      authorId: 'user-2',
      authorDisplay: 'Marie Martin',
      submissionId: 'sub-1',
      parentCommentId: null,
      body: 'Deuxieme commentaire',
      depth: 0,
      upvoteCount: 2,
      downvoteCount: 0,
      score: 2,
      createdAt: '2026-01-02T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
      deletedAt: null,
    },
  ],
  error: null,
  meta: {
    cursor: undefined,
    hasMore: false,
    totalCount: 2,
  },
};

describe('useComments', () => {
  const submissionId = 'sub-1';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('s\'importe correctement', () => {
    expect(useComments).toBeDefined();
    expect(typeof useComments).toBe('function');
  });

  it('retourne les valeurs initiales correctes', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCommentsResponse),
      }),
    );

    const { result } = renderHook(() => useComments(submissionId), {
      wrapper: createWrapper(),
    });

    expect(result.current.comments).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isCreating).toBe(false);
    expect(typeof result.current.fetchNextPage).toBe('function');
    expect(typeof result.current.createComment).toBe('function');
  });

  it('charge les commentaires avec le bon endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCommentsResponse),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useComments(submissionId, 'best'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/submissions/${submissionId}/comments`),
    );
    // Verifie que les parametres sort et limit sont inclus
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('sort=best');
    expect(calledUrl).toContain('limit=20');
  });

  it('charge les commentaires tries par "newest"', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCommentsResponse),
    });
    vi.stubGlobal('fetch', mockFetch);

    renderHook(() => useComments(submissionId, 'newest'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('sort=newest');
  });

  it('aplatit les pages de commentaires en une seule liste', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCommentsResponse),
      }),
    );

    const { result } = renderHook(() => useComments(submissionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.comments).toHaveLength(2);
    expect(result.current.comments[0].id).toBe('comment-1');
    expect(result.current.comments[1].id).toBe('comment-2');
    expect(result.current.totalCount).toBe(2);
  });

  it('cree un commentaire avec le bon payload', async () => {
    const createResponse = {
      data: { id: 'new-comment', body: 'Nouveau commentaire' },
    };
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCommentsResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createResponse),
      })
      // After invalidation, refetch
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCommentsResponse),
      });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useComments(submissionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.createComment({ body: 'Nouveau commentaire', parentCommentId: null });
    });

    await waitFor(() => {
      // Verifie que la creation utilise POST
      const postCalls = mockFetch.mock.calls.filter(
        (call) => call[1]?.method === 'POST',
      );
      expect(postCalls).toHaveLength(1);
      expect(postCalls[0][0]).toContain(`/api/submissions/${submissionId}/comments`);
      const body = JSON.parse(postCalls[0][1].body);
      expect(body).toEqual({ body: 'Nouveau commentaire', parentCommentId: null });
    });
  });

  it('affiche un toast de succes apres creation', async () => {
    const { toast } = await import('sonner');
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCommentsResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { id: 'new' } }),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCommentsResponse),
      });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useComments(submissionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.createComment({ body: 'Test' });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Commentaire publie');
    });
  });

  it('appelle processXpResponse apres creation reussie', async () => {
    const createResponse = { data: { id: 'new', xp: { amount: 5 } } };
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCommentsResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createResponse),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCommentsResponse),
      });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useComments(submissionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.createComment({ body: 'Test' });
    });

    await waitFor(() => {
      expect(mockProcessXpResponse).toHaveBeenCalledWith(createResponse);
    });
  });

  it('affiche un toast d\'erreur si la creation echoue', async () => {
    const { toast } = await import('sonner');
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCommentsResponse),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Contenu trop court' } }),
      });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useComments(submissionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.createComment({ body: 'X' });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Contenu trop court');
    });
  });

  it('gere les erreurs de chargement des commentaires', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
      }),
    );

    const { result } = renderHook(() => useComments(submissionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Apres une erreur, la liste reste vide
    expect(result.current.comments).toEqual([]);
  });

  it('utilise "best" comme tri par defaut', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCommentsResponse),
    });
    vi.stubGlobal('fetch', mockFetch);

    renderHook(() => useComments(submissionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('sort=best');
  });
});
