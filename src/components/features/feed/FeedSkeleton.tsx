import { Skeleton } from '@/components/ui/skeleton';

interface FeedSkeletonProps {
  count?: number;
}

export function FeedSkeleton({ count = 5 }: FeedSkeletonProps) {
  return (
    <div className="flex flex-col gap-3 md:gap-4" aria-label="Chargement du fil" role="status">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-lg border border-l-4 border-border-default border-l-border-default bg-surface-secondary p-4"
        >
          {/* Row 1: Metadata — category badge + domain + time */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Row 2: Title */}
          <Skeleton className="h-5 w-11/12" />
          {/* optional 2nd title line (varies) */}
          {i % 3 !== 2 && <Skeleton className="h-5 w-3/4" />}

          {/* Row 3: Description preview */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />

          {/* Row 4: Action bar — vote pill + comments pill + share pill + cost badge */}
          <div className="flex items-center gap-2 pt-1">
            {/* Vote pill */}
            <Skeleton className="h-7 w-24 rounded-full" />
            {/* Comments pill */}
            <Skeleton className="h-7 w-16 rounded-full" />
            {/* Share pill */}
            <Skeleton className="hidden h-7 w-20 rounded-full sm:block" />
            {/* Spacer */}
            <div className="flex-1" />
            {/* Cost badge */}
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
}
