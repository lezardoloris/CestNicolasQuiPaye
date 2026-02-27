'use client';

import { useMemo } from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useVoteHydration } from '@/hooks/useVoteHydration';
import { SubmissionCard } from '@/components/features/feed/SubmissionCard';
import { FeedSkeleton } from '@/components/features/feed/FeedSkeleton';
import type { FeedResponse, SubmissionCardData } from '@/types/submission';

interface FeedListProps {
  initialData: FeedResponse;
  sort: string;
  timeWindow?: string;
  /** When set, only cards matching this ministryTag are shown. null = show all */
  activeCategory?: string | null;
}

export function FeedList({ initialData, sort, timeWindow, activeCategory = null }: FeedListProps) {
  const { data, isFetchingNextPage, sentinelRef, hasNextPage } =
    useInfiniteScroll({
      sort,
      timeWindow,
      initialData,
    });

  const allSubmissions = useMemo<SubmissionCardData[]>(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  // Client-side category filtering
  const filteredSubmissions = useMemo<SubmissionCardData[]>(
    () =>
      activeCategory
        ? allSubmissions.filter((s) => s.ministryTag === activeCategory)
        : allSubmissions,
    [allSubmissions, activeCategory],
  );

  // Hydrate vote state for all visible submissions
  const submissionIds = useMemo(
    () => allSubmissions.map((s) => s.id),
    [allSubmissions],
  );
  useVoteHydration(submissionIds);

  if (filteredSubmissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-text-secondary">
          {activeCategory
            ? 'Aucun signalement dans cette catégorie.'
            : 'Aucun signalement pour le moment.'}
        </p>
        <p className="mt-2 text-sm text-text-muted">
          {activeCategory
            ? 'Essayez une autre catégorie ou signalez une dépense.'
            : 'Soyez le premier Nicolas à manier la tronçonneuse.'}
        </p>
      </div>
    );
  }

  return (
    <div id="main-feed" className="flex flex-col gap-3 md:gap-4">
      {filteredSubmissions.map((submission, index) => (
        <SubmissionCard key={submission.id} submission={submission} index={index} />
      ))}

      {isFetchingNextPage && <FeedSkeleton count={3} />}

      {/* Infinite scroll sentinel */}
      {hasNextPage && !activeCategory && (
        <div ref={sentinelRef} className="h-1" aria-hidden="true" />
      )}

      {!hasNextPage && filteredSubmissions.length > 0 && (
        <p className="py-8 text-center text-sm text-text-muted">
          Vous avez tout vu. Revenez bientôt.
        </p>
      )}
    </div>
  );
}
