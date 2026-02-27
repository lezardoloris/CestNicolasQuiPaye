'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'hot', label: 'Tendances' },
  { value: 'top', label: 'Top' },
  { value: 'new', label: 'Recent' },
] as const;

interface FeedSortTabsProps {
  activeSort: string;
}

export function FeedSortTabs({ activeSort }: FeedSortTabsProps) {
  const router = useRouter();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex: number | null = null;

      if (e.key === 'ArrowRight') {
        nextIndex = (index + 1) % SORT_OPTIONS.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (index - 1 + SORT_OPTIONS.length) % SORT_OPTIONS.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = SORT_OPTIONS.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        tabRefs.current[nextIndex]?.focus();
      }
    },
    [],
  );

  const handleTabClick = useCallback(
    (sortValue: string) => {
      router.push(`/feed/${sortValue}`);
    },
    [router],
  );

  return (
    <div
      role="tablist"
      aria-label="Trier les signalements"
      className="sticky top-16 z-10 flex gap-1 overflow-x-auto bg-surface-primary py-3 scrollbar-hide md:overflow-x-visible"
    >
      {SORT_OPTIONS.map((option, index) => (
        <button
          key={option.value}
          ref={(el) => {
            tabRefs.current[index] = el;
          }}
          role="tab"
          aria-selected={activeSort === option.value}
          tabIndex={activeSort === option.value ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onClick={() => handleTabClick(option.value)}
          className={cn(
            'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
            'scroll-snap-align-start',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
            activeSort === option.value
              ? 'bg-chainsaw-red text-white'
              : 'bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-elevated',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
