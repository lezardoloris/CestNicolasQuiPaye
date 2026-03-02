'use client';

import { useState } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAdjustments } from '@/hooks/useAdjustments';
import { AdjustmentThread } from '@/components/features/solutions/AdjustmentThread';

interface SolutionItemProps {
  solution: {
    id: string;
    authorDisplay: string;
    body: string;
    upvoteCount: number;
    downvoteCount: number;
    createdAt: string;
  };
  totalUpvotes: number;
  rank: number;
  onVote: (solutionId: string, voteType: 'up' | 'down') => void;
  isVoting: boolean;
}

export function SolutionItem({
  solution,
  totalUpvotes,
  rank,
  onVote,
  isVoting,
}: SolutionItemProps) {
  const [showThread, setShowThread] = useState(false);
  const { adjustments, isLoading: loadingAdjustments, refetch, createAdjustment, isCreating } =
    useAdjustments(solution.id);

  const handleToggleThread = () => {
    const next = !showThread;
    setShowThread(next);
    if (next) refetch();
  };

  const percentage = totalUpvotes > 0
    ? Math.round((solution.upvoteCount / totalUpvotes) * 100)
    : 0;
  const isLeader = rank === 0 && solution.upvoteCount > 0;

  return (
    <div className="rounded-lg border border-border-default bg-surface-secondary p-3">
      {/* Solution text */}
      <p className="text-sm leading-relaxed text-text-primary">
        {solution.body}
      </p>

      {/* Progress bar + percentage + vote */}
      <div className="mt-2.5 flex items-center gap-2">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-elevated">
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
              isLeader ? 'bg-chainsaw-red' : 'bg-text-muted/40',
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span
          className={cn(
            'min-w-[3ch] text-right text-xs font-bold tabular-nums',
            isLeader ? 'text-chainsaw-red' : 'text-text-muted',
          )}
        >
          {percentage}%
        </span>
        <button
          onClick={() => onVote(solution.id, 'up')}
          disabled={isVoting}
          title="Soutenir cette solution"
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors',
            'text-text-muted hover:bg-chainsaw-red/10 hover:text-chainsaw-red',
          )}
        >
          <ArrowUp className="size-3.5" />
          <span className="tabular-nums">{solution.upvoteCount}</span>
        </button>
      </div>

      {/* Author + date + thread toggle */}
      <div className="mt-2 flex items-center gap-2 text-[11px] text-text-muted">
        <span>{solution.authorDisplay}</span>
        <span aria-hidden="true">&middot;</span>
        <time>
          {formatDistanceToNow(new Date(solution.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </time>
        <span className="flex-1" />
        <button
          onClick={handleToggleThread}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-secondary"
        >
          <MessageCircle className="size-3" aria-hidden="true" />
          Suggérer un ajustement
        </button>
      </div>

      {showThread && (
        <AdjustmentThread
          adjustments={adjustments}
          isLoading={loadingAdjustments}
          onSubmit={createAdjustment}
          isSubmitting={isCreating}
        />
      )}
    </div>
  );
}
