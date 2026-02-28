'use client';

import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useVote } from '@/hooks/useVote';
import { formatScore } from '@/lib/utils/format';

interface VoteButtonInlineProps {
  submissionId: string;
  serverCounts: { up: number; down: number };
  serverVote?: 'up' | 'down' | null;
}

export function VoteButtonInline({
  submissionId,
  serverCounts,
  serverVote,
}: VoteButtonInlineProps) {
  const { vote, currentVote, counts, isLoading } = useVote(
    submissionId,
    serverCounts,
  );

  const activeVote = currentVote ?? serverVote ?? null;
  const score = counts.up - counts.down;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0 rounded-full',
        'transition-colors',
        activeVote === 'up' && 'bg-success/10',
        activeVote === 'down' && 'bg-chainsaw-red/10',
        !activeVote && 'bg-surface-elevated/50',
      )}
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
          'inline-flex items-center justify-center rounded-full p-1.5',
          'transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success',
          activeVote === 'up'
            ? 'text-success'
            : 'text-text-muted hover:text-success/70 hover:bg-success/10',
        )}
      >
        <ArrowBigUp
          className={cn('size-5', activeVote === 'up' && 'fill-current')}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence mode="popLayout">
        <motion.span
          key={score}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            'min-w-[2ch] text-center text-xs font-bold tabular-nums',
            activeVote === 'up' && 'text-success',
            activeVote === 'down' && 'text-chainsaw-red',
            !activeVote && 'text-text-secondary',
          )}
        >
          {formatScore(score)}
        </motion.span>
      </AnimatePresence>

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
          'inline-flex items-center justify-center rounded-full p-1.5',
          'transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red',
          activeVote === 'down'
            ? 'text-chainsaw-red'
            : 'text-text-muted hover:text-chainsaw-red/70 hover:bg-chainsaw-red/10',
        )}
      >
        <ArrowBigDown
          className={cn('size-5', activeVote === 'down' && 'fill-current')}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
