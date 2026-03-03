'use client';

import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ArgumentItemProps {
  argument: {
    id: string;
    authorDisplay: string;
    type: 'pour' | 'contre';
    body: string;
    upvoteCount: number;
    downvoteCount: number;
    createdAt: string;
  };
  onVote: (argumentId: string, voteType: 'up' | 'down') => void;
  isVoting: boolean;
}

export function ArgumentItem({ argument, onVote, isVoting }: ArgumentItemProps) {
  const isPour = argument.type === 'pour';

  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        isPour
          ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30'
          : 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30',
      )}
    >
      <p className="text-sm leading-relaxed text-text-primary">{argument.body}</p>

      <div className="mt-2 flex items-center gap-2 text-[11px] text-text-muted">
        <span>{argument.authorDisplay}</span>
        <span aria-hidden="true">&middot;</span>
        <time>
          {formatDistanceToNow(new Date(argument.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </time>
        <span className="flex-1" />
        <button
          onClick={() => onVote(argument.id, 'up')}
          disabled={isVoting}
          title="Soutenir cet argument"
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors',
            isPour
              ? 'text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50'
              : 'text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50',
          )}
        >
          <ArrowUp className="size-3.5" />
          <span className="tabular-nums">{argument.upvoteCount}</span>
        </button>
      </div>
    </div>
  );
}
