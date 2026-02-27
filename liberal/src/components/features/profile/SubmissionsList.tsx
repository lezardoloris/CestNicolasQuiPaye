'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown, Loader2, PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { UserSubmission } from '@/types/user';

interface SubmissionsListProps {
  userId: string;
}

async function fetchSubmissions(userId: string, cursor?: string) {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', '20');

  const res = await fetch(`/api/v1/users/${userId}/submissions?${params}`);
  if (!res.ok) throw new Error('Failed to fetch submissions');
  const json = await res.json();
  return {
    items: json.data as UserSubmission[],
    nextCursor: json.meta?.cursor as string | undefined,
    hasMore: json.meta?.hasMore as boolean,
  };
}

const STATUS_CONFIG = {
  pending: { label: 'En attente', className: 'text-warning border-warning/30' },
  approved: { label: 'Approuve', className: 'text-success border-success/30' },
  rejected: { label: 'Rejete', className: 'text-chainsaw-red border-chainsaw-red/30' },
  flagged: { label: 'Signale', className: 'text-warning border-warning/30' },
} as const;

function SubmissionSkeleton() {
  return (
    <div className="flex items-center justify-between border-b border-border-default p-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-8" />
      </div>
    </div>
  );
}

export default function SubmissionsList({ userId }: SubmissionsListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['user-submissions', userId],
    queryFn: ({ pageParam }) => fetchSubmissions(userId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

  if (isLoading) {
    return (
      <div aria-live="polite" aria-label="Chargement des signalements">
        <SubmissionSkeleton />
        <SubmissionSkeleton />
        <SubmissionSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-text-muted">
        Une erreur est survenue lors du chargement des signalements.
      </div>
    );
  }

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <PlusCircle className="size-12 text-text-muted" />
        <div>
          <p className="text-text-secondary">
            Aucun signalement pour le moment.
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Soyez le premier Nicolas a utiliser la tronconneuse !
          </p>
        </div>
        <Button asChild className="bg-chainsaw-red text-white hover:bg-chainsaw-red-hover">
          <Link href="/submit">Signaler un gaspillage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-border-default">
        {allItems.map((submission) => {
          const score = submission.upvoteCount - submission.downvoteCount;
          const statusConfig = STATUS_CONFIG[submission.moderationStatus];
          const timeAgo = formatDistanceToNow(new Date(submission.createdAt), {
            addSuffix: true,
            locale: fr,
          });

          return (
            <div
              key={submission.id}
              className="flex items-center justify-between p-4 transition-colors hover:bg-surface-elevated"
            >
              <div className="flex-1 min-w-0 pr-4">
                <Link
                  href={`/s/${submission.id}/${submission.slug}`}
                  className="font-medium text-text-primary hover:text-chainsaw-red transition-colors line-clamp-1"
                >
                  {submission.title}
                </Link>
                <p className="mt-1 text-xs text-text-muted">{timeAgo}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge
                  variant="outline"
                  className={statusConfig.className}
                  aria-label={`Statut: ${statusConfig.label}`}
                >
                  {statusConfig.label}
                </Badge>
                <div className="flex items-center gap-1 text-sm">
                  {score >= 0 ? (
                    <ArrowUp className="size-4 text-chainsaw-red" />
                  ) : (
                    <ArrowDown className="size-4 text-text-secondary" />
                  )}
                  <span className="text-text-secondary font-medium">
                    {score}
                  </span>
                </div>
              </div>
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
