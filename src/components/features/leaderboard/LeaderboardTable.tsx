'use client';

import { cn } from '@/lib/utils';

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  karma: number;
  submissionCount: number;
  voteCount: number;
  sourceCount: number;
  noteCount: number;
  tier: {
    label: string;
    emoji: string;
    color: string;
  };
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
            <th className="px-4 py-3 text-center hidden sm:table-cell">Tier</th>
            <th className="px-4 py-3 text-right">Karma</th>
            <th className="px-4 py-3 text-right hidden md:table-cell">Signalements</th>
            <th className="px-4 py-3 text-right hidden md:table-cell">Votes</th>
            <th className="px-4 py-3 text-right hidden lg:table-cell">Sources</th>
            <th className="px-4 py-3 text-right hidden lg:table-cell">Notes</th>
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
                  <span className="sm:hidden text-xs" title={entry.tier.label}>
                    {entry.tier.emoji}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center hidden sm:table-cell">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    entry.tier.color,
                  )}
                >
                  {entry.tier.emoji} {entry.tier.label}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-bold tabular-nums text-chainsaw-red">
                {entry.karma.toLocaleString('fr-FR')}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-text-secondary hidden md:table-cell">
                {entry.submissionCount}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-text-secondary hidden md:table-cell">
                {entry.voteCount}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-text-secondary hidden lg:table-cell">
                {entry.sourceCount}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-text-secondary hidden lg:table-cell">
                {entry.noteCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
