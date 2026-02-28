import { FeedSkeleton } from '@/components/features/feed/FeedSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeedLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 md:pb-6">
      {/* Sort tabs skeleton */}
      <div className="sticky top-16 z-10 flex gap-2 bg-surface-primary py-3">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-16 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>

      {/* Feed skeleton */}
      <div className="mt-4">
        <FeedSkeleton count={5} />
      </div>
    </main>
  );
}
