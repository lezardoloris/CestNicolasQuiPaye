'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SolutionItemProps {
  solution: {
    id: string;
    authorDisplay: string;
    body: string;
    upvoteCount: number;
    downvoteCount: number;
    createdAt: string;
  };
  onVote: (solutionId: string, voteType: 'up' | 'down') => void;
  isVoting: boolean;
}

export function SolutionItem({ solution, onVote, isVoting }: SolutionItemProps) {
  const score = solution.upvoteCount - solution.downvoteCount;

  return (
    <div className="flex gap-3 rounded-lg border border-border-default bg-surface-secondary p-4">
      {/* Vote buttons */}
      <div className="flex flex-col items-center gap-0.5">
        <button
          onClick={() => onVote(solution.id, 'up')}
          disabled={isVoting}
          title="Bonne solution"
          className="rounded p-1 text-text-muted transition-colors hover:text-success"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <span
          className={cn(
            'text-xs font-semibold tabular-nums',
            score > 0 && 'text-success',
            score < 0 && 'text-chainsaw-red',
            score === 0 && 'text-text-muted',
          )}
        >
          {score}
        </span>
        <button
          onClick={() => onVote(solution.id, 'down')}
          disabled={isVoting}
          title="Mauvaise solution"
          className="rounded p-1 text-text-muted transition-colors hover:text-chainsaw-red"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="whitespace-pre-wrap text-sm text-text-primary">
          {solution.body}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
          <span>{solution.authorDisplay}</span>
          <span>&middot;</span>
          <time>
            {formatDistanceToNow(new Date(solution.createdAt), {
              addSuffix: true,
              locale: fr,
            })}
          </time>
        </div>
      </div>
    </div>
  );
}
