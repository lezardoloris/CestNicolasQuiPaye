'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { FeedResponse } from '@/types/submission';

interface UseInfiniteScrollOptions {
  sort: string;
  timeWindow?: string;
  initialData: FeedResponse;
}

export function useInfiniteScroll({
  sort,
  timeWindow,
  initialData,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const query = useInfiniteQuery<FeedResponse>({
    queryKey: ['feed', sort, timeWindow],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ sort });
      if (pageParam) params.set('cursor', pageParam as string);
      if (timeWindow) params.set('timeWindow', timeWindow);

      const res = await fetch(`/api/feed?${params}`);
      if (!res.ok) throw new Error('Feed fetch failed');
      return res.json();
    },
    initialData: {
      pages: [initialData],
      pageParams: [null],
    },
    getNextPageParam: (lastPage) => lastPage.meta?.cursor ?? undefined,
    initialPageParam: null as string | null,
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '200px',
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect]);

  return {
    ...query,
    sentinelRef,
  };
}
