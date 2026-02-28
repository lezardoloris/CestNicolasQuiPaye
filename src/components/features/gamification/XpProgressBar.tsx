'use client';

import { useGamificationStore } from '@/stores/gamification-store';
import { Zap } from 'lucide-react';

export function XpProgressBar() {
  const level = useGamificationStore((s) => s.level);
  const progressPercent = useGamificationStore((s) => s.progressPercent);
  const totalXp = useGamificationStore((s) => s.totalXp);
  const loaded = useGamificationStore((s) => s.loaded);

  if (!loaded) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-xs font-bold text-chainsaw-red">
        <Zap className="size-3.5" />
        <span>Nv.{level}</span>
      </div>
      <div className="relative h-2 w-20 overflow-hidden rounded-full bg-surface-elevated">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-chainsaw-red to-red-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-text-muted">
        {totalXp.toLocaleString('fr-FR')} XP
      </span>
    </div>
  );
}

export function XpProgressBarCompact() {
  const level = useGamificationStore((s) => s.level);
  const progressPercent = useGamificationStore((s) => s.progressPercent);
  const loaded = useGamificationStore((s) => s.loaded);

  if (!loaded) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold text-chainsaw-red">Nv.{level}</span>
      <div className="relative h-1.5 w-12 overflow-hidden rounded-full bg-surface-elevated">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-chainsaw-red transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
