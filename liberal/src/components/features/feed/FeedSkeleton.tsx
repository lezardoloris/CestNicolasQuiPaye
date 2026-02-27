import { Skeleton } from '@/components/ui/skeleton';

interface FeedSkeletonProps {
  count?: number;
}

export function FeedSkeleton({ count = 5 }: FeedSkeletonProps) {
  return (
    <div className="flex flex-col gap-4" aria-label="Chargement du fil" role="status">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-lg border border-border-default bg-surface-secondary p-4"
        >
          {/* Vote skeleton - desktop only */}
          <div className="hidden flex-col items-center gap-1 md:flex">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          {/* Content skeleton */}
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Vote skeleton - mobile only */}
          <div className="flex flex-col items-center gap-1 md:hidden">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
}
