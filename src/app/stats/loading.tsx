import { Skeleton } from '@/components/ui/skeleton';

export default function StatsLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 pb-20 md:pb-8">
      {/* Title */}
      <Skeleton className="mb-8 h-8 w-64" />

      {/* Grand total */}
      <Skeleton className="mb-8 h-24 w-full rounded-xl" />

      {/* KPI cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>

      {/* Charts */}
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>

      <Skeleton className="mt-8 h-72 w-full rounded-xl" />
    </main>
  );
}
