import Link from 'next/link';
import { Trophy, Zap, Flame } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/api/leaderboard';

interface MiniLeaderboardProps {
  entries: LeaderboardEntry[];
  variant?: 'sidebar' | 'inline';
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-text-secondary text-sm font-medium">#{rank}</span>;
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <RankBadge rank={entry.rank} />
      <div className="bg-drapeau-rouge/10 text-drapeau-rouge flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
        {entry.displayName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-text-primary truncate text-xs font-medium">{entry.displayName}</p>
        <div className="text-text-secondary flex items-center gap-1.5 text-[10px]">
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
          <span className="ml-auto tabular-nums font-medium">{entry.totalXp.toLocaleString('fr-FR')} XP</span>
        </div>
      </div>
    </div>
  );
}

function InlineCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="bg-surface-primary border-border-default flex min-w-[140px] shrink-0 flex-col items-center gap-1 rounded-xl border p-3">
      <RankBadge rank={entry.rank} />
      <div className="bg-drapeau-rouge/10 text-drapeau-rouge flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold">
        {entry.displayName.charAt(0).toUpperCase()}
      </div>
      <p className="text-text-primary max-w-[120px] truncate text-xs font-medium">
        {entry.displayName}
      </p>
      <span className="text-text-secondary flex items-center gap-0.5 text-xs">
        <Zap className="h-3 w-3 text-amber-500" />
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
      <div className="divide-border-default divide-y">
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
