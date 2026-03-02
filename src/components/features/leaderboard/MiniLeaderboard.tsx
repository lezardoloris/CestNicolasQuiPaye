import Link from 'next/link';
import { Trophy, Zap, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/lib/api/leaderboard';

interface MiniLeaderboardProps {
  entries: LeaderboardEntry[];
  variant?: 'sidebar' | 'inline';
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isTop3 = entry.rank <= 3;

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 rounded-lg px-3 py-2.5',
        entry.rank === 1 && 'bg-chainsaw-red/6',
        isTop3 && 'border-l-2',
        entry.rank === 1 && 'border-l-amber-400',
        entry.rank === 2 && 'border-l-gray-400',
        entry.rank === 3 && 'border-l-amber-600',
      )}
    >
      {/* Rank */}
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center text-sm',
          isTop3 ? 'text-base' : 'text-xs font-bold text-text-muted',
        )}
      >
        {RANK_MEDALS[entry.rank] ?? `#${entry.rank}`}
      </span>

      {/* Name & meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              'truncate text-xs font-semibold',
              isTop3 ? 'text-text-primary' : 'text-text-secondary',
            )}
          >
            {entry.displayName}
          </p>
          <span
            className={cn(
              'shrink-0 text-xs tabular-nums font-bold',
              isTop3 ? 'text-chainsaw-red' : 'text-text-muted',
            )}
          >
            {entry.totalXp.toLocaleString('fr-FR')}
            <span className="ml-0.5 text-[10px] font-medium text-text-muted">XP</span>
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="flex items-center gap-0.5">
            <Zap className="h-2.5 w-2.5 text-amber-500" />
            Niv.{entry.level}
          </span>
          {entry.streak > 0 && (
            <span className="flex items-center gap-0.5">
              <Flame className="h-2.5 w-2.5 text-orange-500" />
              {entry.streak}j
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function InlineCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="bg-surface-primary border-border-default flex min-w-[130px] shrink-0 flex-col items-center gap-1.5 rounded-xl border p-3">
      <span className="text-2xl">{RANK_MEDALS[entry.rank] ?? `#${entry.rank}`}</span>
      <p className="text-text-primary max-w-[120px] truncate text-xs font-semibold">
        {entry.displayName}
      </p>
      <span className="text-chainsaw-red text-sm font-bold tabular-nums">
        {entry.totalXp.toLocaleString('fr-FR')}
        <span className="ml-0.5 text-[10px] font-medium text-text-muted">XP</span>
      </span>
      <span className="text-text-muted flex items-center gap-0.5 text-[10px]">
        <Zap className="h-2.5 w-2.5 text-amber-500" />
        Niv. {entry.level}
      </span>
    </div>
  );
}

export function MiniLeaderboard({ entries, variant = 'sidebar' }: MiniLeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-surface-primary border-border-default rounded-2xl border p-4 text-center">
        <Trophy className="text-text-secondary mx-auto mb-2 h-8 w-8" />
        <p className="text-text-primary text-sm font-medium">Classement</p>
        <p className="text-text-secondary mt-1 text-xs">Soyez le premier au classement !</p>
        <Link
          href="/register"
          className="bg-drapeau-rouge mt-3 inline-block rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
        >
          Créer mon compte
        </Link>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h2 className="text-text-primary text-sm font-semibold">Classement</h2>
        </div>
        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {entries.slice(0, 3).map((entry) => (
            <InlineCard key={entry.rank} entry={entry} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-primary border-border-default rounded-2xl border p-4">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h2 className="text-text-primary text-sm font-semibold">Classement</h2>
      </div>
      <div className="space-y-0.5">
        {entries.map((entry) => (
          <LeaderboardRow key={entry.rank} entry={entry} />
        ))}
      </div>
      <Link
        href="/leaderboard"
        className="text-drapeau-rouge mt-3 block text-center text-xs font-medium hover:underline"
      >
        Voir le classement complet →
      </Link>
    </div>
  );
}
