'use client';

import { useState } from 'react';
import { FeedSortTabs } from '@/components/features/feed/FeedSortTabs';
import { CategoryFilter } from '@/components/features/feed/CategoryFilter';
import { FeedList } from '@/components/features/feed/FeedList';
import type { FeedResponse } from '@/types/submission';

interface FeedPageClientProps {
    initialData: FeedResponse;
    sort: string;
    timeWindow?: string;
    activeCategories?: string[];
}

export function FeedPageClient({ initialData, sort, timeWindow, activeCategories }: FeedPageClientProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    return (
        <>
            <FeedSortTabs activeSort={sort} />
            <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                activeCategories={activeCategories}
            />
            <FeedList
                initialData={initialData}
                sort={sort}
                timeWindow={timeWindow}
                activeCategory={activeCategory}
            />
        </>
    );
}
