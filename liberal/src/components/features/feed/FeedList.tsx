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
}

export function FeedList({ initialData, sort, timeWindow }: FeedListProps) {
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

  // Hydrate vote state for all visible submissions
  const submissionIds = useMemo(
    () => allSubmissions.map((s) => s.id),
    [allSubmissions],
  );
  useVoteHydration(submissionIds);

  if (allSubmissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-text-secondary">
          Aucun signalement pour le moment.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Soyez le premier Nicolas a manier la tronconneuse.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      {allSubmissions.map((submission) => (
        <SubmissionCard key={submission.id} submission={submission} />
      ))}

      {isFetchingNextPage && <FeedSkeleton count={3} />}

      {/* Infinite scroll sentinel */}
      {hasNextPage && (
        <div ref={sentinelRef} className="h-1" aria-hidden="true" />
      )}

      {!hasNextPage && allSubmissions.length > 0 && (
        <p className="py-8 text-center text-sm text-text-muted">
          Vous avez tout vu. Revenez bientot.
        </p>
      )}
    </div>
  );
}
