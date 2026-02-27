'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { UserVote } from '@/types/user';

interface VotesListProps {
  userId: string;
}

async function fetchVotes(userId: string, cursor?: string) {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', '20');

  const res = await fetch(`/api/v1/users/${userId}/votes?${params}`);
  if (!res.ok) throw new Error('Failed to fetch votes');
  const json = await res.json();
  return {
    items: json.data as UserVote[],
    nextCursor: json.meta?.cursor as string | undefined,
    hasMore: json.meta?.hasMore as boolean,
  };
}

function VoteSkeleton() {
  return (
    <div className="flex items-center justify-between border-b border-border-default p-4">
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="size-6 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-4 w-8" />
    </div>
  );
}

export default function VotesList({ userId }: VotesListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['user-votes', userId],
    queryFn: ({ pageParam }) => fetchVotes(userId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

  if (isLoading) {
    return (
      <div aria-live="polite" aria-label="Chargement des votes">
        <VoteSkeleton />
        <VoteSkeleton />
        <VoteSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-text-muted">
        Une erreur est survenue lors du chargement des votes.
      </div>
    );
  }

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <ArrowUp className="size-12 text-text-muted" />
        <div>
          <p className="text-text-secondary">
            Vous n&apos;avez pas encore vote.
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Parcourez le fil pour commencer !
          </p>
        </div>
        <Button asChild variant="outline" className="border-border-default text-text-secondary">
          <Link href="/feed/hot">Voir le fil</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-border-default">
        {allItems.map((vote) => {
          const isUpvote = vote.voteType === 'up';
          const timeAgo = formatDistanceToNow(new Date(vote.votedAt), {
            addSuffix: true,
            locale: fr,
          });

          return (
            <div
              key={`${vote.submissionId}-${vote.votedAt}`}
              className="flex items-center justify-between p-4 transition-colors hover:bg-surface-elevated"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isUpvote ? (
                  <ArrowUp
                    className="size-5 shrink-0 text-chainsaw-red"
                    aria-label="Vote positif"
                  />
                ) : (
                  <ArrowDown
                    className="size-5 shrink-0 text-text-secondary"
                    aria-label="Vote negatif"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/s/${vote.submissionId}/${vote.submissionSlug}`}
                    className="font-medium text-text-primary hover:text-chainsaw-red transition-colors line-clamp-1"
                  >
                    {vote.submissionTitle}
                  </Link>
                  <p className="mt-1 text-xs text-text-muted">{timeAgo}</p>
                </div>
              </div>
              <span className="text-sm text-text-secondary font-medium shrink-0">
                {vote.submissionScore}
              </span>
            </div>
          );
        })}
      </div>

      {hasNextPage && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="border-border-default text-text-secondary"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Chargement...
              </>
            ) : (
              'Charger plus'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
