import { Skeleton } from '@/components/ui/skeleton';

export default function SubmissionDetailLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 pb-20 md:pb-8">
      {/* Back link */}
      <Skeleton className="h-4 w-28 mb-6" />

      {/* Title and vote */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>

      {/* Author */}
      <Skeleton className="h-4 w-48 mb-6" />

      {/* Cost box */}
      <div className="rounded-lg bg-surface-elevated p-4 mb-6 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Description */}
      <div className="space-y-3 mb-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Source button */}
      <Skeleton className="h-10 w-48 rounded-md" />

      {/* Consequence card skeleton */}
      <div className="mt-6 rounded-lg bg-surface-secondary p-4 border-l-4 border-l-chainsaw-red space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </main>
  );
}
