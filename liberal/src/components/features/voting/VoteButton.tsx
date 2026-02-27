'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVote } from '@/hooks/useVote';
import { formatScore } from '@/lib/utils/format';

interface VoteButtonProps {
  submissionId: string;
  serverCounts: { up: number; down: number };
  serverVote?: 'up' | 'down' | null;
}

export function VoteButton({
  submissionId,
  serverCounts,
  serverVote,
}: VoteButtonProps) {
  const { vote, currentVote, counts, isLoading } = useVote(
    submissionId,
    serverCounts,
  );

  const activeVote = currentVote ?? serverVote ?? null;
  const score = counts.up - counts.down;

  return (
    <div
      className="flex flex-col items-center gap-1"
      role="group"
      aria-label="Vote"
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          vote('up');
        }}
        disabled={isLoading}
        aria-label={`Voter pour: ${counts.up} votes positifs`}
        aria-pressed={activeVote === 'up'}
        className={cn(
          'min-h-12 min-w-12 rounded-md p-2 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
          activeVote === 'up'
            ? 'text-chainsaw-red'
            : 'text-text-muted hover:text-text-secondary',
        )}
      >
        <ChevronUp className="h-6 w-6" aria-hidden="true" />
      </button>

      <span
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          'text-sm font-semibold tabular-nums',
          activeVote === 'up' && 'text-chainsaw-red',
          activeVote === 'down' && 'text-info',
          !activeVote && 'text-text-secondary',
        )}
      >
        {formatScore(score)}
      </span>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          vote('down');
        }}
        disabled={isLoading}
        aria-label={`Voter contre: ${counts.down} votes negatifs`}
        aria-pressed={activeVote === 'down'}
        className={cn(
          'min-h-12 min-w-12 rounded-md p-2 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
          activeVote === 'down'
            ? 'text-info'
            : 'text-text-muted hover:text-text-secondary',
        )}
      >
        <ChevronDown className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}
