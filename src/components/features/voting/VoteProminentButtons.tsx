'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVote } from '@/hooks/useVote';

interface VoteProminentButtonsProps {
  submissionId: string;
  serverCounts: { up: number; down: number };
  serverVote?: 'up' | 'down' | null;
}

export function VoteProminentButtons({
  submissionId,
  serverCounts,
  serverVote,
}: VoteProminentButtonsProps) {
  const { vote, currentVote, counts, isLoading } = useVote(
    submissionId,
    serverCounts,
  );

  const activeVote = currentVote ?? serverVote ?? null;

  return (
    <div className="flex flex-col gap-2" role="group" aria-label="Votre avis sur cette depense">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          vote('up');
        }}
        disabled={isLoading}
        aria-pressed={activeVote === 'up'}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-semibold transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
          activeVote === 'up'
            ? 'border-chainsaw-red bg-chainsaw-red text-white'
            : 'border-chainsaw-red/30 bg-chainsaw-red/5 text-chainsaw-red hover:bg-chainsaw-red/10',
        )}
      >
        <span className="flex items-center gap-2">
          <AlertTriangle className="size-4" aria-hidden="true" />
          Depense a revoir
        </span>
        <span className="tabular-nums">{counts.up}</span>
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          vote('down');
        }}
        disabled={isLoading}
        aria-pressed={activeVote === 'down'}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
          activeVote === 'down'
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-border-default bg-surface-secondary text-text-muted hover:bg-surface-elevated hover:text-text-secondary',
        )}
      >
        <span className="flex items-center gap-2">
          <CheckCircle className="size-4" aria-hidden="true" />
          Depense justifiee
        </span>
        <span className="tabular-nums">{counts.down}</span>
      </button>
    </div>
  );
}
