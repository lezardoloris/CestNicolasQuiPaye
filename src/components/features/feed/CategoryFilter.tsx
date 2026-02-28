'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { motion } from 'motion/react';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants/categories';

interface CategoryFilterProps {
    activeCategory: string | null;
    onCategoryChange: (category: string | null) => void;
}

export function CategoryFilter({
    activeCategory,
    onCategoryChange,
}: CategoryFilterProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSelect = (slug: string | null) => {
        // Toggle off if already selected
        onCategoryChange(activeCategory === slug ? null : slug);
    };

    return (
        <div className="relative mb-4">
            {/* Fade edges */}
            <div
                className="pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-gradient-to-r from-surface-primary to-transparent"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-gradient-to-l from-surface-primary to-transparent"
                aria-hidden="true"
            />

            <div
                ref={scrollRef}
                role="group"
                aria-label="Filtrer par catégorie"
                className="scrollbar-hide flex gap-2 overflow-x-auto px-1 py-1"
            >
                {/* "Tous" pill */}
                <CategoryPill
                    label="Tous"
                    icon={<LayoutGrid className="size-3.5" aria-hidden="true" />}
                    active={activeCategory === null}
                    onClick={() => handleSelect(null)}
                    id="category-filter-tous"
                />

                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <CategoryPill
                            key={cat.slug}
                            label={cat.label}
                            icon={<Icon className={cn('size-3.5', cat.color)} aria-hidden="true" />}
                            active={activeCategory === cat.slug}
                            onClick={() => handleSelect(cat.slug)}
                            id={`category-filter-${cat.slug.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}

interface CategoryPillProps {
    label: string;
    icon: ReactNode;
    active: boolean;
    onClick: () => void;
    id: string;
}

function CategoryPill({ label, icon, active, onClick, id }: CategoryPillProps) {
    return (
        <motion.button
            id={id}
            onClick={onClick}
            whileTap={{ scale: 0.95 }}
            aria-pressed={active}
            className={cn(
                'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5',
                'text-xs font-medium whitespace-nowrap select-none',
                'border transition-all duration-150',
                active
                    ? 'border-chainsaw-red bg-chainsaw-red/10 text-chainsaw-red shadow-sm shadow-chainsaw-red/10'
                    : 'border-border-default bg-surface-secondary text-text-muted hover:border-border-default/80 hover:bg-surface-elevated hover:text-text-secondary',
            )}
        >
            {icon}
            {label}
        </motion.button>
    );
}
