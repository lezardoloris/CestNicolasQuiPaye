'use client';

import { cn } from '@/lib/utils';
import { LevelBadge } from '@/components/features/gamification/LevelBadge';
import { Flame, Zap } from 'lucide-react';

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
  levelTitle: string;
  streak: number;
  submissionCount: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-border-default bg-surface-secondary">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-default bg-surface-primary/50 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
            <th className="px-4 py-3 text-center w-12">#</th>
            <th className="px-4 py-3">Contributeur</th>
            <th className="px-4 py-3 text-center hidden sm:table-cell">Niveau</th>
            <th className="px-4 py-3 text-right">XP</th>
            <th className="px-4 py-3 text-center hidden md:table-cell">Serie</th>
            <th className="px-4 py-3 text-right hidden md:table-cell">Signalements</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default">
          {entries.map((entry) => (
            <tr
              key={entry.rank}
              className="transition-colors hover:bg-surface-elevated/50"
            >
              <td className="px-4 py-3 text-center font-bold text-text-muted">
                {entry.rank}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {entry.avatarUrl ? (
                    <img
                      src={entry.avatarUrl}
                      alt=""
                      className="size-7 rounded-full"
                    />
                  ) : (
                    <div className="flex size-7 items-center justify-center rounded-full bg-chainsaw-red/10 text-xs font-bold text-chainsaw-red">
                      {entry.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-text-primary truncate max-w-[150px] sm:max-w-[200px]">
                    {entry.displayName}
                  </span>
                  <span className="sm:hidden">
                    <LevelBadge level={entry.level} title={entry.levelTitle} size="sm" />
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center hidden sm:table-cell">
                <LevelBadge level={entry.level} title={entry.levelTitle} size="md" />
              </td>
              <td className="px-4 py-3 text-right font-bold tabular-nums text-chainsaw-red">
                <span className="inline-flex items-center gap-1">
                  <Zap className="size-3" />
                  {entry.totalXp.toLocaleString('fr-FR')}
                </span>
              </td>
              <td className="px-4 py-3 text-center hidden md:table-cell">
                {entry.streak > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs">
                    <Flame
                      className={cn(
                        'size-3.5',
                        entry.streak >= 30
                          ? 'text-orange-400'
                          : entry.streak >= 7
                            ? 'text-yellow-400'
                            : 'text-text-muted',
                      )}
                    />
                    <span className="tabular-nums">{entry.streak}j</span>
                  </span>
                ) : (
                  <span className="text-text-muted">&mdash;</span>
                )}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-text-secondary hidden md:table-cell">
                {entry.submissionCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
