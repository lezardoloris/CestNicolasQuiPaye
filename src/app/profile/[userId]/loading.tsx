import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Profile header skeleton */}
      <Card className="border-border-default bg-surface-secondary">
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-3 mt-1">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <div className="flex gap-4 border-b border-border-default pb-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-0 divide-y divide-border-default">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
