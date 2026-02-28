export default function LeaderboardLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 pb-20 md:pb-8">
      <div className="space-y-8 animate-pulse">
        {/* Title skeleton */}
        <div className="space-y-2 text-center">
          <div className="mx-auto h-8 w-64 rounded bg-surface-elevated" />
          <div className="mx-auto h-4 w-96 rounded bg-surface-elevated" />
        </div>

        {/* Podium skeleton */}
        <div className="flex justify-center gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-52 w-full max-w-[280px] rounded-xl border border-border-default bg-surface-secondary"
            />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-surface-secondary"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
