'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants/categories';

interface CategoryFilterProps {
    activeCategory: string | null;
    onCategoryChange: (category: string | null) => void;
    /** Only show categories that have approved submissions */
    activeCategories?: string[];
}

export function CategoryFilter({
    activeCategory,
    onCategoryChange,
    activeCategories,
}: CategoryFilterProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const visibleCategories = useMemo(
        () =>
            activeCategories
                ? CATEGORIES.filter((cat) => activeCategories.includes(cat.slug))
                : CATEGORIES,
        [activeCategories],
    );

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 2);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateScrollState();
        el.addEventListener('scroll', updateScrollState, { passive: true });
        const ro = new ResizeObserver(updateScrollState);
        ro.observe(el);
        return () => {
            el.removeEventListener('scroll', updateScrollState);
            ro.disconnect();
        };
    }, [updateScrollState]);

    const scroll = useCallback((direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.6;
        el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }, []);

    const handleSelect = (slug: string | null) => {
        onCategoryChange(activeCategory === slug ? null : slug);
    };

    // Hide filter row entirely when only 0-1 categories exist
    if (visibleCategories.length <= 1) return null;

    return (
        <div className="relative mb-4">
            {/* Left chevron */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 z-20 flex h-full items-center bg-gradient-to-r from-surface-primary via-surface-primary/90 to-transparent pl-1 pr-2"
                    aria-label="Défiler les catégories vers la gauche"
                >
                    <ChevronLeft className="size-4 text-text-secondary" />
                </button>
            )}

            {/* Right chevron */}
            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 z-20 flex h-full items-center bg-gradient-to-l from-surface-primary via-surface-primary/90 to-transparent pl-2 pr-1"
                    aria-label="Défiler les catégories vers la droite"
                >
                    <ChevronRight className="size-4 text-text-secondary" />
                </button>
            )}

            <div
                ref={scrollRef}
                role="group"
                aria-label="Filtrer par catégorie"
                className="scrollbar-hide flex gap-2 overflow-x-auto px-4 py-1"
            >
                {/* "Tous" pill */}
                <CategoryPill
                    label="Tous"
                    icon={<LayoutGrid className="size-3.5" aria-hidden="true" />}
                    active={activeCategory === null}
                    onClick={() => handleSelect(null)}
                    id="category-filter-tous"
                />

                {visibleCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <CategoryPill
                            key={cat.slug}
                            label={cat.label}
                            icon={<Icon className="size-3.5" aria-hidden="true" />}
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
