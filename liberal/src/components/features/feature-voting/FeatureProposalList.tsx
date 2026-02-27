'use client';

import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { FeatureProposalCard } from '@/components/features/feature-voting/FeatureProposalCard';
import { cn } from '@/lib/utils';
import {
  FEATURE_PROPOSAL_CATEGORIES,
  FEATURE_VOTE_STATUS_LABELS,
} from '@/lib/utils/validation';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  voteCount: number;
  authorDisplay: string;
  createdAt: string;
  userVote: number | null;
  rejectionReason: string | null;
}

interface FeaturesResponse {
  data: FeatureItem[];
  error: null;
  meta: {
    cursor?: string;
    hasMore?: boolean;
  };
}

type SortBy = 'votes' | 'date';

export function FeatureProposalList() {
  const [sortBy, setSortBy] = useState<SortBy>('votes');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['features', sortBy, statusFilter, categoryFilter],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams({ sortBy, limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      if (pageParam) params.set('cursor', pageParam);

      const res = await fetch(`/api/features?${params}`);
      if (!res.ok) throw new Error('Erreur de chargement');
      return res.json() as Promise<FeaturesResponse>;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? lastPage.meta.cursor : undefined,
    staleTime: 30_000,
  });

  const allFeatures = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={sortBy === 'votes' ? 'default' : 'outline'}
            onClick={() => setSortBy('votes')}
            className="min-h-10"
            aria-label="Trier par nombre de votes"
            aria-pressed={sortBy === 'votes'}
          >
            Plus votes
          </Button>
          <Button
            size="sm"
            variant={sortBy === 'date' ? 'default' : 'outline'}
            onClick={() => setSortBy('date')}
            className="min-h-10"
            aria-label="Trier par date"
            aria-pressed={sortBy === 'date'}
          >
            Plus recents
          </Button>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={!statusFilter ? 'default' : 'outline'}
            className={cn('min-h-8 cursor-pointer px-3', !statusFilter && 'bg-chainsaw-red')}
            onClick={() => setStatusFilter('')}
            role="button"
            aria-label="Tous les statuts"
            aria-pressed={!statusFilter}
          >
            Tous
          </Badge>
          {Object.entries(FEATURE_VOTE_STATUS_LABELS).map(([key, label]) => (
            <Badge
              key={key}
              variant={statusFilter === key ? 'default' : 'outline'}
              className={cn(
                'min-h-8 cursor-pointer px-3',
                statusFilter === key && 'bg-chainsaw-red',
              )}
              onClick={() => setStatusFilter(key)}
              role="button"
              aria-label={`Filtrer par ${label}`}
              aria-pressed={statusFilter === key}
            >
              {label}
            </Badge>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={!categoryFilter ? 'default' : 'outline'}
            className={cn('min-h-8 cursor-pointer px-3', !categoryFilter && 'bg-info')}
            onClick={() => setCategoryFilter('')}
            role="button"
            aria-label="Toutes les categories"
            aria-pressed={!categoryFilter}
          >
            Toutes
          </Badge>
          {Object.entries(FEATURE_PROPOSAL_CATEGORIES).map(([key, label]) => (
            <Badge
              key={key}
              variant={categoryFilter === key ? 'default' : 'outline'}
              className={cn(
                'min-h-8 cursor-pointer px-3',
                categoryFilter === key && 'bg-info',
              )}
              onClick={() => setCategoryFilter(key)}
              role="button"
              aria-label={`Filtrer par ${label}`}
              aria-pressed={categoryFilter === key}
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-lg border border-border/50 p-4">
              <Skeleton className="h-16 w-16" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : allFeatures.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-muted">
          Aucune proposition pour l&apos;instant. Soyez le premier a proposer une idee !
        </p>
      ) : (
        <div className="space-y-3" role="list" aria-label="Propositions de fonctionnalites">
          {allFeatures.map((feature) => (
            <div key={feature.id} role="listitem">
              <FeatureProposalCard feature={feature} />
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasNextPage && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="min-h-10 gap-2"
            aria-label="Charger plus de propositions"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Chargement...
              </>
            ) : (
              'Voir plus'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
