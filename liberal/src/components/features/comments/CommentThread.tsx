'use client';

import { CommentItem } from '@/components/features/comments/CommentItem';
import { CommentSkeleton } from '@/components/features/comments/CommentSkeleton';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CommentData {
  id: string;
  authorDisplay: string;
  body: string;
  depth: number;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  createdAt: string;
  deletedAt: string | null;
  replies?: CommentData[];
  hasMoreReplies?: boolean;
  totalReplyCount?: number;
}

interface CommentThreadProps {
  comments: CommentData[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onReply: (body: string, parentCommentId: string) => void;
  isReplying: boolean;
}

export function CommentThread({
  comments,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onReply,
  isReplying,
}: CommentThreadProps) {
  if (isLoading) {
    return <CommentSkeleton />;
  }

  if (comments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        Aucun commentaire pour l&apos;instant. Soyez le premier a commenter !
      </p>
    );
  }

  return (
    <div role="list" aria-label="Liste des commentaires">
      {comments.map((comment) => (
        <div
          key={comment.id}
          role="listitem"
          className="border-b border-border/50 last:border-0"
        >
          <CommentItem
            comment={comment}
            onReply={onReply}
            isReplying={isReplying}
          />
        </div>
      ))}

      {hasNextPage && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="min-h-10 gap-2"
            aria-label="Charger plus de commentaires"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Chargement...
              </>
            ) : (
              'Voir plus de commentaires'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
