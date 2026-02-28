'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
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
        title="Tronçonner"
        aria-label={`Tronçonner: ${counts.up} votes`}
        aria-pressed={activeVote === 'up'}
        className={cn(
          'min-h-12 min-w-12 rounded-md p-2 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
          activeVote === 'up'
            ? 'text-success'
            : 'text-text-muted hover:text-success/60',
        )}
      >
        <ArrowUp className="h-6 w-6" aria-hidden="true" />
      </button>

      <span
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          'text-sm font-semibold tabular-nums',
          activeVote === 'up' && 'text-success',
          activeVote === 'down' && 'text-chainsaw-red',
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
        title="Garder le gaspillage"
        aria-label={`Garder: ${counts.down} votes`}
        aria-pressed={activeVote === 'down'}
        className={cn(
          'min-h-12 min-w-12 rounded-md p-2 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
          activeVote === 'down'
            ? 'text-chainsaw-red'
            : 'text-text-muted hover:text-chainsaw-red/60',
        )}
      >
        <ArrowDown className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}
