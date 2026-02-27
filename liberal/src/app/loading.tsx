import { SkeletonCard } from '@/components/ui/skeleton-card';

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <SkeletonCard count={5} />
    </div>
  );
}
