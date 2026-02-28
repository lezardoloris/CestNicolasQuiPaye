'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const TIME_OPTIONS = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'all', label: 'Tout temps' },
] as const;

interface TopTimeFilterProps {
  activeWindow: string;
}

export function TopTimeFilter({ activeWindow }: TopTimeFilterProps) {
  const router = useRouter();

  return (
    <div
      className="flex gap-2 overflow-x-auto py-2 scrollbar-hide"
      role="group"
      aria-label="Filtrer par periode"
    >
      {TIME_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() =>
            router.push(`/feed/top?t=${option.value}`)
          }
          aria-pressed={activeWindow === option.value}
          className={cn(
            'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red',
            activeWindow === option.value
              ? 'bg-chainsaw-red/20 text-chainsaw-red'
              : 'bg-surface-elevated text-text-secondary hover:text-text-primary',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
