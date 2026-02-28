import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  count?: number;
}

export function SkeletonCard({ count = 5 }: SkeletonCardProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg bg-surface-secondary p-4 space-y-3"
        >
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
