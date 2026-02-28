'use client';

import { useGamificationStore } from '@/stores/gamification-store';
import { Flame } from 'lucide-react';

export function StreakBadge() {
  const currentStreak = useGamificationStore((s) => s.currentStreak);
  const loaded = useGamificationStore((s) => s.loaded);

  if (!loaded || currentStreak === 0) return null;

  return (
    <div className="flex items-center gap-1 text-xs font-bold">
      <Flame
        className={`size-3.5 ${
          currentStreak >= 30
            ? 'text-orange-400'
            : currentStreak >= 7
              ? 'text-yellow-400'
              : 'text-text-muted'
        }`}
      />
      <span className="tabular-nums text-text-secondary">{currentStreak}j</span>
    </div>
  );
}

export function StreakBadgeLarge({
  streak,
  longestStreak,
  freezeCount,
}: {
  streak: number;
  longestStreak: number;
  freezeCount: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <Flame
          className={`size-5 ${
            streak >= 30
              ? 'text-orange-400'
              : streak >= 7
                ? 'text-yellow-400'
                : 'text-text-muted'
          }`}
        />
        <span className="text-lg font-bold tabular-nums text-text-primary">
          {streak}j
        </span>
      </div>
      <div className="text-xs text-text-muted">
        <span>Record : {longestStreak}j</span>
        {freezeCount > 0 && (
          <span className="ml-2">❄️ {freezeCount} gel{freezeCount > 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
}
