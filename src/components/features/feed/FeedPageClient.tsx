'use client';

import { useState } from 'react';
import { CategoryFilter } from '@/components/features/feed/CategoryFilter';
import { FeedList } from '@/components/features/feed/FeedList';
import type { FeedResponse } from '@/types/submission';

interface FeedPageClientProps {
    initialData: FeedResponse;
    sort: string;
    timeWindow?: string;
}

export function FeedPageClient({ initialData, sort, timeWindow }: FeedPageClientProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    return (
        <>
            <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
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
