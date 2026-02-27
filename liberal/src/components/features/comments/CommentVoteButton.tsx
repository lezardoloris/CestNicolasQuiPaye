'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCommentVote } from '@/hooks/use-comment-vote';

interface CommentVoteButtonProps {
  commentId: string;
  initialDirection?: 'up' | 'down' | null;
  initialScore: number;
  initialUpvotes: number;
  initialDownvotes: number;
}

export function CommentVoteButton({
  commentId,
  initialDirection = null,
  initialScore,
  initialUpvotes,
  initialDownvotes,
}: CommentVoteButtonProps) {
  const { vote, direction, score, isLoading } = useCommentVote({
    commentId,
    initialDirection,
    initialScore,
    initialUpvotes,
    initialDownvotes,
  });

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Vote sur le commentaire"
    >
      <button
        onClick={() => vote('up')}
        disabled={isLoading}
        aria-label={`Voter pour ce commentaire`}
        aria-pressed={direction === 'up'}
        className={cn(
          'min-h-8 min-w-8 rounded p-1 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
          direction === 'up'
            ? 'text-chainsaw-red'
            : 'text-text-muted hover:text-text-secondary',
        )}
      >
        <ChevronUp className="h-4 w-4" aria-hidden="true" />
      </button>

      <span
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          'min-w-6 text-center text-xs font-semibold tabular-nums',
          direction === 'up' && 'text-chainsaw-red',
          direction === 'down' && 'text-info',
          !direction && 'text-text-secondary',
        )}
      >
        {score}
      </span>

      <button
        onClick={() => vote('down')}
        disabled={isLoading}
        aria-label={`Voter contre ce commentaire`}
        aria-pressed={direction === 'down'}
        className={cn(
          'min-h-8 min-w-8 rounded p-1 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
          direction === 'down'
            ? 'text-info'
            : 'text-text-muted hover:text-text-secondary',
        )}
      >
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
