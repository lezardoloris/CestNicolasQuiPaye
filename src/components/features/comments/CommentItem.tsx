'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommentVoteButton } from '@/components/features/comments/CommentVoteButton';
import { CommentForm } from '@/components/features/comments/CommentForm';
import { formatRelativeTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface CommentItemData {
  id: string;
  authorDisplay: string;
  body: string;
  depth: number;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  createdAt: string;
  deletedAt: string | null;
  replies?: CommentItemData[];
  hasMoreReplies?: boolean;
  totalReplyCount?: number;
}

interface CommentItemProps {
  comment: CommentItemData;
  onReply: (body: string, parentCommentId: string) => void;
  isReplying?: boolean;
  maxDepth?: number;
}

export function CommentItem({
  comment,
  onReply,
  isReplying = false,
  maxDepth = 2,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);

  const isDeleted = !!comment.deletedAt;
  const canReply = comment.depth < maxDepth;

  const handleReply = (body: string) => {
    onReply(body, comment.id);
    setShowReplyForm(false);
  };

  const displayedReplies = showAllReplies
    ? comment.replies
    : comment.replies?.slice(0, 3);

  return (
    <article
      className={cn(
        'group',
        comment.depth > 0 && 'ml-6 border-l-2 border-border/50 pl-4 md:ml-8 md:pl-6',
      )}
      aria-label={`Commentaire de ${comment.authorDisplay}`}
    >
      <div className="py-3">
        {/* Header: author + time */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-text-primary">
            {comment.authorDisplay}
          </span>
          <span className="text-text-muted" aria-label="Date de publication">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {/* Body */}
        {isDeleted ? (
          <p className="mt-1 text-sm italic text-text-muted">
            [Commentaire supprime]
          </p>
        ) : (
          <p className="mt-1 whitespace-pre-wrap text-sm text-text-primary leading-relaxed">
            {comment.body}
          </p>
        )}

        {/* Actions */}
        {!isDeleted && (
          <div className="mt-2 flex items-center gap-3">
            <CommentVoteButton
              commentId={comment.id}
              initialScore={comment.score}
              initialUpvotes={comment.upvoteCount}
              initialDownvotes={comment.downvoteCount}
            />

            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm((prev) => !prev)}
                className="min-h-8 gap-1.5 text-xs text-text-muted hover:text-text-secondary"
                aria-label="Repondre a ce commentaire"
                aria-expanded={showReplyForm}
              >
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                Repondre
              </Button>
            )}
          </div>
        )}

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-3">
            <CommentForm
              onSubmit={handleReply}
              isSubmitting={isReplying}
              placeholder={`Repondre a ${comment.authorDisplay}...`}
              autoFocus
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>

      {/* Replies */}
      {displayedReplies && displayedReplies.length > 0 && (
        <div role="list" aria-label="Reponses">
          {displayedReplies.map((reply) => (
            <div key={reply.id} role="listitem">
              <CommentItem
                comment={reply}
                onReply={onReply}
                isReplying={isReplying}
                maxDepth={maxDepth}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load more replies */}
      {!showAllReplies &&
        comment.hasMoreReplies &&
        (comment.totalReplyCount ?? 0) > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllReplies(true)}
            className="ml-6 mt-1 text-xs text-text-muted hover:text-text-secondary md:ml-8"
            aria-label={`Voir les ${(comment.totalReplyCount ?? 0) - 3} autres reponses`}
          >
            Voir {(comment.totalReplyCount ?? 0) - 3} autres reponses
          </Button>
        )}
    </article>
  );
}
