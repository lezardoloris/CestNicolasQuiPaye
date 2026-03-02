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
      className="sticky top-12 md:top-16 z-10 flex overflow-x-auto border-b border-border-default bg-surface-primary scrollbar-hide md:overflow-x-visible"
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
            'whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors',
            'border-b-2',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-inset',
            activeSort === option.value
              ? 'border-chainsaw-red text-text-primary'
              : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-surface-secondary/50',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
