import { Skeleton } from '@/components/ui/skeleton';

export function CommentSkeleton() {
  return (
    <div className="space-y-4" aria-label="Chargement des commentaires" role="status">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2 py-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-3 pt-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
      <span className="sr-only">Chargement des commentaires en cours...</span>
    </div>
  );
}
