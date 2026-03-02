'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'hot', label: 'Tendances' },
  { value: 'top', label: 'Top' },
  { value: 'new', label: 'Recent' },
] as const;

const ALL_TAB_COUNT = SORT_OPTIONS.length + 1; // +1 for Budget tab

interface FeedSortTabsProps {
  activeSort: string;
}

export function FeedSortTabs({ activeSort }: FeedSortTabsProps) {
  const router = useRouter();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isBudgetActive = activeSort === 'budget_desc' || activeSort === 'budget_asc';

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex: number | null = null;

      if (e.key === 'ArrowRight') {
        nextIndex = (index + 1) % ALL_TAB_COUNT;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (index - 1 + ALL_TAB_COUNT) % ALL_TAB_COUNT;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = ALL_TAB_COUNT - 1;
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

  const handleBudgetClick = useCallback(() => {
    if (activeSort === 'budget_desc') {
      router.push('/feed/budget_asc');
    } else if (activeSort === 'budget_asc') {
      router.push('/feed/budget_desc');
    } else {
      router.push('/feed/budget_desc');
    }
  }, [activeSort, router]);

  const BudgetIcon = activeSort === 'budget_asc' ? ArrowUpWideNarrow : ArrowDownWideNarrow;
  const budgetIndex = SORT_OPTIONS.length;

  return (
    <div
      role="tablist"
      aria-label="Trier les signalements"
      className="sticky top-12 md:top-16 lg:top-0 z-10 flex overflow-x-auto border-b border-border-default bg-surface-primary scrollbar-hide md:overflow-x-visible"
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
      <button
        ref={(el) => {
          tabRefs.current[budgetIndex] = el;
        }}
        role="tab"
        aria-selected={isBudgetActive}
        tabIndex={isBudgetActive ? 0 : -1}
        onKeyDown={(e) => handleKeyDown(e, budgetIndex)}
        onClick={handleBudgetClick}
        className={cn(
          'inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors',
          'border-b-2',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-inset',
          isBudgetActive
            ? 'border-chainsaw-red text-text-primary'
            : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-surface-secondary/50',
        )}
      >
        <BudgetIcon className="h-4 w-4" />
        Budget
      </button>
    </div>
  );
}
