'use client';

import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: number;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const levelColors: Record<number, string> = {
  1: 'bg-slate-500/10 text-slate-400',
  2: 'bg-slate-500/10 text-slate-400',
  3: 'bg-green-500/10 text-green-400',
  4: 'bg-green-500/10 text-green-400',
  5: 'bg-blue-500/10 text-blue-400',
  6: 'bg-blue-500/10 text-blue-400',
  7: 'bg-purple-500/10 text-purple-400',
  8: 'bg-purple-500/10 text-purple-400',
  9: 'bg-amber-500/10 text-amber-400',
  10: 'bg-amber-500/10 text-amber-400',
};

function getLevelColor(level: number): string {
  if (level >= 19) return 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30';
  if (level >= 15) return 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20';
  if (level >= 11) return 'bg-orange-500/10 text-orange-400';
  return levelColors[level] ?? 'bg-slate-500/10 text-slate-400';
}

export function LevelBadge({ level, title, size = 'sm', className }: LevelBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        getLevelColor(level),
        sizeClasses[size],
        className,
      )}
    >
      <span className="tabular-nums">Nv.{level}</span>
      <span className="hidden sm:inline">{title}</span>
    </span>
  );
}
