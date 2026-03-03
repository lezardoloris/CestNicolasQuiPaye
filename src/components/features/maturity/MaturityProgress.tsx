'use client';

import { cn } from '@/lib/utils';
import type { MaturityLevel } from '@/types/maturity';
import { MATURITY_DISPLAY_LABELS, MATURITY_COLORS } from '@/types/maturity';

interface MaturityProgressProps {
  level: MaturityLevel;
  percentage: number;
  missingForNext: string[];
}

export function MaturityProgress({ level, percentage, missingForNext }: MaturityProgressProps) {
  const colors = MATURITY_COLORS[level];
  const nextLevel = level < 5 ? (level + 1) as MaturityLevel : null;
  const nextLabel = nextLevel ? MATURITY_DISPLAY_LABELS[nextLevel] : null;

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <span className={cn('text-[11px] font-semibold', colors.text)}>
          {MATURITY_DISPLAY_LABELS[level]}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-secondary">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              level === 1 && 'bg-red-500',
              level === 2 && 'bg-orange-500',
              level === 3 && 'bg-yellow-500',
              level === 4 && 'bg-emerald-500',
              level === 5 && 'bg-green-600',
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className="text-[11px] font-medium tabular-nums text-text-muted">
          {percentage}%
        </span>
      </div>

      {/* Actionable prompt */}
      {missingForNext.length > 0 && nextLabel && (
        <p className="text-[11px] text-text-muted">
          Pour atteindre <strong className={colors.text}>{nextLabel}</strong> :{' '}
          {missingForNext.join(' · ')}
        </p>
      )}
      {level === 5 && (
        <p className="text-[11px] font-medium text-green-600">
          Niveau maximal atteint — cette dépense est pleinement documentée
        </p>
      )}
    </div>
  );
}
