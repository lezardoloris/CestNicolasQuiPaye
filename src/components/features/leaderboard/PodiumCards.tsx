'use client';

import { cn } from '@/lib/utils';
import { Zap, Flame } from 'lucide-react';
import { LevelBadge } from '@/components/features/gamification/LevelBadge';
import type { LeaderboardEntry } from './LeaderboardTable';

interface PodiumCardsProps {
  top3: LeaderboardEntry[];
}

const podiumStyles: Record<number, { border: string; bg: string; glow: string; size: string }> = {
  1: {
    border: 'border-yellow-400/60',
    bg: 'bg-yellow-400/[0.07]',
    glow: 'shadow-yellow-400/20',
    size: 'md:scale-105',
  },
  2: {
    border: 'border-slate-300/60',
    bg: 'bg-slate-300/[0.05]',
    glow: 'shadow-slate-300/10',
    size: '',
  },
  3: {
    border: 'border-amber-600/60',
    bg: 'bg-amber-600/[0.05]',
    glow: 'shadow-amber-600/10',
    size: '',
  },
};

export function PodiumCards({ top3 }: PodiumCardsProps) {
  if (top3.length === 0) return null;

  // Display order: 2nd, 1st, 3rd (classic podium layout)
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-end md:justify-center md:gap-6">
      {ordered.map((entry) => {
        const style = podiumStyles[entry.rank] ?? podiumStyles[3];
        return (
          <div
            key={entry.rank}
            className={cn(
              'relative flex w-full max-w-[280px] flex-col items-center gap-3 rounded-xl border-2 p-6',
              'bg-surface-secondary transition-all',
              style.border,
              style.bg,
              style.size,
              entry.rank === 1 && 'shadow-lg',
              entry.rank === 1 && style.glow,
            )}
          >
            <LevelBadge level={entry.level} title={entry.levelTitle} size="md" />

            {entry.avatarUrl ? (
              <img
                src={entry.avatarUrl}
                alt=""
                className={cn(
                  'rounded-full border-2',
                  entry.rank === 1 ? 'size-16 border-yellow-400' : 'size-12 border-border-default',
                )}
              />
            ) : (
              <div
                className={cn(
                  'flex items-center justify-center rounded-full bg-chainsaw-red/10 font-bold text-chainsaw-red border-2',
                  entry.rank === 1 ? 'size-16 text-xl border-yellow-400' : 'size-12 text-lg border-border-default',
                )}
              >
                {entry.displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="text-center">
              <p className="font-semibold text-text-primary truncate max-w-[200px]">
                {entry.displayName}
              </p>
            </div>

            <p className="text-2xl font-black tabular-nums text-chainsaw-red">
              <Zap className="inline size-5 -mt-0.5" />
              {entry.totalXp.toLocaleString('fr-FR')}
              <span className="ml-1 text-xs font-medium text-text-muted">XP</span>
            </p>

            <div className="flex gap-3 text-[10px] text-text-muted">
              <span>{entry.submissionCount} signal.</span>
              {entry.streak > 0 && (
                <span className="inline-flex items-center gap-0.5">
                  <Flame className="size-3 text-yellow-400" />
                  {entry.streak}j
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
