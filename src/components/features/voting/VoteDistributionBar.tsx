'use client';

import { cn } from '@/lib/utils';
import type { VotingPosition } from '@/lib/utils/validation';
import type { ConsensusResult } from '@/lib/utils/consensus';
import { CONSENSUS_LABELS, CONSENSUS_COLORS } from '@/lib/utils/consensus';

interface VoteDistribution {
  essentiel: number;
  justifie_ameliorable: number;
  discutable: number;
  injustifie: number;
  total: number;
}

interface VoteDistributionBarProps {
  distribution: VoteDistribution;
  consensus: ConsensusResult | null;
  variant?: 'full' | 'compact';
}

const SEGMENT_COLORS: Record<VotingPosition, string> = {
  essentiel: 'bg-emerald-600',
  justifie_ameliorable: 'bg-blue-600',
  discutable: 'bg-orange-500',
  injustifie: 'bg-chainsaw-red',
};

const SEGMENTS: { key: VotingPosition; label: string }[] = [
  { key: 'essentiel', label: 'Ess.' },
  { key: 'justifie_ameliorable', label: 'Just.' },
  { key: 'discutable', label: 'Disc.' },
  { key: 'injustifie', label: 'Inj.' },
];

export function VoteDistributionBar({
  distribution,
  consensus,
  variant = 'full',
}: VoteDistributionBarProps) {
  const total = distribution.total;
  const isCompact = variant === 'compact';

  if (total === 0) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-full bg-surface-secondary text-text-muted',
        isCompact ? 'h-4 text-[10px]' : 'h-6 text-[11px]',
      )}>
        Aucun vote
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Stacked bar */}
      <div
        className={cn(
          'flex overflow-hidden rounded-full',
          isCompact ? 'h-4' : 'h-6',
        )}
        role="img"
        aria-label={`Distribution des votes : ${SEGMENTS.map(
          (s) => `${s.label} ${total > 0 ? Math.round((distribution[s.key] / total) * 100) : 0}%`,
        ).join(', ')}`}
      >
        {SEGMENTS.map(({ key }) => {
          const count = distribution[key];
          const percent = (count / total) * 100;
          if (percent === 0) return null;

          return (
            <div
              key={key}
              className={cn(
                'flex items-center justify-center text-white font-semibold transition-all duration-300',
                isCompact ? 'text-[9px]' : 'text-[11px]',
                SEGMENT_COLORS[key],
              )}
              style={{ width: `${percent}%` }}
            >
              {percent >= (isCompact ? 20 : 12) && `${Math.round(percent)}%`}
            </div>
          );
        })}
      </div>

      {/* Footer: total + consensus */}
      <div className="flex items-center justify-between">
        <span className={cn('text-text-muted', isCompact ? 'text-[10px]' : 'text-[11px]')}>
          {total} citoyen{total > 1 ? 's' : ''} {total > 1 ? 'ont' : 'a'} voté
        </span>
        {consensus && (
          <span className={cn(
            'font-medium',
            isCompact ? 'text-[10px]' : 'text-[11px]',
            CONSENSUS_COLORS[consensus.type],
          )}>
            {CONSENSUS_LABELS[consensus.type]}
          </span>
        )}
      </div>
    </div>
  );
}
