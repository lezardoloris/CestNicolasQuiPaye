import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { FeedResponse } from '@/types/submission';

// Mock IntersectionObserver
let _observerCallback: ((entries: IntersectionObserverEntry[]) => void) | null = null;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
    _observerCallback = callback;
  }
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = vi.fn();
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

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

const mockInitialData: FeedResponse = {
  data: [
    {
      id: 'sub-1',
      title: 'Soumission 1',
      slug: 'soumission-1',
      description: 'Description 1',
      sourceUrl: 'https://example.com',
      amount: '1000000',
      costPerTaxpayer: '0.50',
      upvoteCount: 10,
      downvoteCount: 2,
      commentCount: 5,
      hotScore: '100',
      status: 'published',
      authorDisplay: 'Utilisateur',
      createdAt: '2026-01-01T00:00:00Z',
      costToNicolasResults: null,
      ministryTag: null,
    },
  ],
  error: null,
  meta: {
    cursor: 'cursor-abc',
    hasMore: true,
  },
};

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _observerCallback = null;
    vi.stubGlobal('fetch', vi.fn());
  });

  it('s\'importe correctement', () => {
    expect(useInfiniteScroll).toBeDefined();
    expect(typeof useInfiniteScroll).toBe('function');
  });

  it('retourne les donnees initiales', () => {
    const { result } = renderHook(
      () =>
        useInfiniteScroll({
          sort: 'hot',
          initialData: mockInitialData,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.data?.pages[0].data).toHaveLength(1);
    expect(result.current.data?.pages[0].data[0].id).toBe('sub-1');
  });

  it('retourne un sentinelRef', () => {
    const { result } = renderHook(
      () =>
        useInfiniteScroll({
          sort: 'hot',
          initialData: mockInitialData,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.sentinelRef).toBeDefined();
    expect(result.current.sentinelRef.current).toBeNull();
  });

  it('expose les proprietes de la requete infinie', () => {
    const { result } = renderHook(
      () =>
        useInfiniteScroll({
          sort: 'hot',
          initialData: mockInitialData,
        }),
      { wrapper: createWrapper() },
    );

    expect(typeof result.current.fetchNextPage).toBe('function');
    expect(typeof result.current.hasNextPage).toBe('boolean');
    expect(typeof result.current.isFetchingNextPage).toBe('boolean');
    expect(result.current.isLoading).toBe(false); // initialData provided
  });

  it('utilise le bon queryKey avec sort', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockInitialData),
    });
    vi.stubGlobal('fetch', mockFetch);

    renderHook(
      () =>
        useInfiniteScroll({
          sort: 'new',
          initialData: mockInitialData,
        }),
      { wrapper: createWrapper() },
    );

    // React Query refetches in background even with initialData (staleTime=0)
    // Verify the fetch URL includes the correct sort parameter
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('sort=new');
  });

  it('inclut le timeWindow dans la queryKey quand fourni', async () => {
    const nextPageData: FeedResponse = {
      data: [],
      error: null,
      meta: { cursor: null, hasMore: false },
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(nextPageData),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(
      () =>
        useInfiniteScroll({
          sort: 'top',
          timeWindow: '24h',
          initialData: mockInitialData,
        }),
      { wrapper: createWrapper() },
    );

    // Trigger next page fetch
    result.current.fetchNextPage();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('sort=top');
    expect(calledUrl).toContain('timeWindow=24h');
  });

  it('passe le curseur lors du chargement de la page suivante', async () => {
    const nextPageData: FeedResponse = {
      data: [],
      error: null,
      meta: { cursor: null, hasMore: false },
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(nextPageData),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(
      () =>
        useInfiniteScroll({
          sort: 'hot',
          initialData: mockInitialData,
        }),
      { wrapper: createWrapper() },
    );

    // Fetch next page (should use cursor from initialData)
    result.current.fetchNextPage();

    await waitFor(() => {
      // Background refetch + fetchNextPage = at least 2 calls
      // Look for the call that includes the cursor param
      const allUrls = mockFetch.mock.calls.map((call) => call[0] as string);
      const cursorCall = allUrls.find((url) => url.includes('cursor='));
      expect(cursorCall).toBeDefined();
      expect(cursorCall).toContain('cursor=cursor-abc');
    });
  });

  it('ne charge pas la page suivante quand hasMore est false', () => {
    const noMoreData: FeedResponse = {
      data: [mockInitialData.data[0]],
      error: null,
      meta: { cursor: null, hasMore: false },
    };

    const { result } = renderHook(
      () =>
        useInfiniteScroll({
          sort: 'hot',
          initialData: noMoreData,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.hasNextPage).toBe(false);
  });

  it('gere les erreurs de chargement', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(
      () =>
        useInfiniteScroll({
          sort: 'hot',
          initialData: mockInitialData,
        }),
      { wrapper: createWrapper() },
    );

    result.current.fetchNextPage();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});
