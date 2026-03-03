'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useFourPositionVote } from '@/hooks/useFourPositionVote';
import { VoteDistributionBar } from './VoteDistributionBar';
import { incrementAnonVoteCount } from '@/components/features/auth/SoftRegistrationPrompt';
import { VOTING_POSITION_LABELS } from '@/lib/utils/validation';
import type { VotingPosition } from '@/lib/utils/validation';
import { Skeleton } from '@/components/ui/skeleton';

interface FourPositionVotingProps {
  submissionId: string;
  variant?: 'full' | 'compact';
}

const POSITION_CONFIG: Record<VotingPosition, { color: string; activeColor: string; icon: string }> = {
  essentiel: {
    color: 'border-emerald-600/30 bg-emerald-600/5 text-emerald-700 hover:bg-emerald-600/10',
    activeColor: 'border-emerald-600 bg-emerald-600 text-white',
    icon: '✓',
  },
  justifie_ameliorable: {
    color: 'border-blue-600/30 bg-blue-600/5 text-blue-700 hover:bg-blue-600/10',
    activeColor: 'border-blue-600 bg-blue-600 text-white',
    icon: '~',
  },
  discutable: {
    color: 'border-orange-500/30 bg-orange-500/5 text-orange-700 hover:bg-orange-500/10',
    activeColor: 'border-orange-500 bg-orange-500 text-white',
    icon: '?',
  },
  injustifie: {
    color: 'border-chainsaw-red/30 bg-chainsaw-red/5 text-chainsaw-red hover:bg-chainsaw-red/10',
    activeColor: 'border-chainsaw-red bg-chainsaw-red text-white',
    icon: '✗',
  },
};

const POSITIONS: VotingPosition[] = ['essentiel', 'justifie_ameliorable', 'discutable', 'injustifie'];

const LEGACY_LABELS: Record<string, string> = {
  up: 'Dépense à revoir',
  down: 'Dépense justifiée',
};

export function FourPositionVoting({ submissionId, variant = 'full' }: FourPositionVotingProps) {
  const { userVote, legacyVote, distribution, consensus, isLoading, vote, isVoting } =
    useFourPositionVote(submissionId);

  const handleVote = useCallback(
    (position: VotingPosition) => {
      vote(position);
      incrementAnonVoteCount();
    },
    [vote],
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-6 w-full rounded-full" />
      </div>
    );
  }

  const isCompact = variant === 'compact';

  return (
    <div className={cn('space-y-3', isCompact && 'space-y-2')}>
      {/* Legacy vote migration prompt */}
      {legacyVote && !userVote && !isCompact && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs text-blue-700">
          <span>
            Vote précédent : <strong>{LEGACY_LABELS[legacyVote] ?? legacyVote}</strong>
          </span>
          <span className="text-text-muted">—</span>
          <span>Précisez votre position avec le nouveau système</span>
        </div>
      )}

      <div
        role="radiogroup"
        aria-label="Votre position sur cette dépense"
        className={cn(
          'grid gap-1.5',
          isCompact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4',
        )}
      >
        {POSITIONS.map((position) => {
          const config = POSITION_CONFIG[position];
          const isActive = userVote === position;

          return (
            <button
              key={position}
              role="radio"
              aria-checked={isActive}
              aria-label={`Vote : ${VOTING_POSITION_LABELS[position]}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleVote(position);
              }}
              disabled={isVoting}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
                'disabled:opacity-50',
                isCompact ? 'min-h-[36px]' : 'min-h-[44px]',
                isActive ? config.activeColor : config.color,
              )}
            >
              <span className="shrink-0" aria-hidden="true">{config.icon}</span>
              <span className={cn('truncate', isCompact && 'text-[11px]')}>
                {VOTING_POSITION_LABELS[position]}
              </span>
            </button>
          );
        })}
      </div>

      {distribution && (
        <VoteDistributionBar
          distribution={distribution}
          consensus={consensus}
          variant={variant}
        />
      )}
    </div>
  );
}
