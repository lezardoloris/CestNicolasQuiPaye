import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetKpiCardProps {
  value: string;
  label: string;
  icon?: LucideIcon;
  color?: string;
  detail?: string;
  className?: string;
}

export function BudgetKpiCard({
  value,
  label,
  icon: Icon,
  color = 'text-text-primary',
  detail,
  className,
}: BudgetKpiCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border-default bg-surface-secondary p-4',
        className,
      )}
    >
      {Icon && <Icon className={cn('size-5', color)} aria-hidden="true" />}
      <p
        className={cn(
          'font-display text-xl font-bold tabular-nums sm:text-2xl',
          Icon && 'mt-2',
          color,
        )}
      >
        {value}
      </p>
      <p className="text-xs text-text-muted">{label}</p>
      {detail && <p className="mt-1 text-[10px] text-text-muted">{detail}</p>}
    </div>
  );
}
