'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { UserComment } from '@/types/user';

interface CommentsListProps {
  userId: string;
}

async function fetchComments(userId: string, cursor?: string) {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', '20');

  const res = await fetch(`/api/v1/users/${userId}/comments?${params}`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  const json = await res.json();
  return {
    items: json.data as UserComment[],
    nextCursor: json.meta?.cursor as string | undefined,
    hasMore: json.meta?.hasMore as boolean,
  };
}

function CommentSkeleton() {
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

export default function CommentsList({ userId }: CommentsListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['user-comments', userId],
    queryFn: ({ pageParam }) => fetchComments(userId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

  if (isLoading) {
    return (
      <div aria-live="polite" aria-label="Chargement des commentaires">
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-text-muted">
        Une erreur est survenue lors du chargement des commentaires.
      </div>
    );
  }

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <MessageSquare className="size-12 text-text-muted" />
        <div>
          <p className="text-text-secondary">Aucun commentaire.</p>
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
        {allItems.map((comment) => {
          const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
            locale: fr,
          });
          const truncatedBody =
            comment.body.length > 150
              ? comment.body.slice(0, 150) + '...'
              : comment.body;

          return (
            <div
              key={comment.id}
              className="flex items-center justify-between p-4 transition-colors hover:bg-surface-elevated"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/s/${comment.submissionId}`}
                    className="font-medium text-text-primary hover:text-chainsaw-red transition-colors line-clamp-1"
                  >
                    {comment.submissionTitle}
                  </Link>
                  <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                    {truncatedBody}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{timeAgo}</p>
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
