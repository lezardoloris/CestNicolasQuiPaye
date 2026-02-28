import type { StatsData } from '@/types/stats';
import { GrandTotalCounter } from '@/components/features/stats/GrandTotalCounter';
import { KpiCards } from '@/components/features/stats/KpiCards';
import { CategoryPieChart } from '@/components/features/stats/CategoryPieChart';
import { Top10BarChart } from '@/components/features/stats/Top10BarChart';
import { TimelineChart } from '@/components/features/stats/TimelineChart';

interface HomeStatsProps {
  stats: StatsData;
}

export function HomeStats({ stats }: HomeStatsProps) {
  return (
    <section className="mb-6 space-y-6">
      <GrandTotalCounter totalAmountEur={stats.totals.totalAmountEur} />

      <KpiCards
        submissions={stats.totals.submissions}
        totalUpvotes={stats.totals.totalUpvotes}
        uniqueVoters={stats.totals.uniqueVoters}
        categories={stats.byCategory.length}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <CategoryPieChart data={stats.byCategory} />
        <Top10BarChart data={stats.top10} />
      </div>

      <TimelineChart data={stats.overTime} />
    </section>
  );
}
