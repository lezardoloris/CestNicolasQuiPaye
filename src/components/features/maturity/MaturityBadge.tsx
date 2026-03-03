import { cn } from '@/lib/utils';
import type { MaturityLevel } from '@/types/maturity';
import { MATURITY_DISPLAY_LABELS, MATURITY_COLORS } from '@/types/maturity';

interface MaturityBadgeProps {
  level: MaturityLevel;
  compact?: boolean;
}

const LEVEL_ICONS: Record<MaturityLevel, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
};

export function MaturityBadge({ level, compact = false }: MaturityBadgeProps) {
  const colors = MATURITY_COLORS[level];
  const label = MATURITY_DISPLAY_LABELS[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-semibold',
        colors.text,
        colors.bg,
        colors.border,
        compact
          ? 'px-1.5 py-0 text-[10px] leading-5'
          : 'px-2 py-0.5 text-[11px]',
      )}
      title={`Maturité : ${label}`}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full font-bold',
          compact ? 'size-3.5 text-[8px]' : 'size-4 text-[9px]',
          colors.text,
        )}
        aria-hidden="true"
      >
        {LEVEL_ICONS[level]}
      </span>
      {compact ? label.split(' ')[0] : label}
    </span>
  );
}
