'use client';

import type { StatsData } from '@/types/stats';
import { GrandTotalCounter } from './GrandTotalCounter';
import { KpiCards } from './KpiCards';
import { CategoryPieChart } from './CategoryPieChart';
import { Top10BarChart } from './Top10BarChart';
import { TimelineChart } from './TimelineChart';
import { BarChart3 } from 'lucide-react';

interface StatsPageClientProps {
  stats: StatsData;
}

export function StatsPageClient({ stats }: StatsPageClientProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="size-7 text-chainsaw-red" aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
          Le Compteur de la Honte
        </h1>
      </div>

      <GrandTotalCounter totalAmountEur={stats.totals.totalAmountEur} />

      <KpiCards
        submissions={stats.totals.submissions}
        totalUpvotes={stats.totals.totalUpvotes}
        uniqueVoters={stats.totals.uniqueVoters}
        categories={stats.byCategory.length}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <CategoryPieChart data={stats.byCategory} />
        <Top10BarChart data={stats.top10} />
      </div>

      <TimelineChart data={stats.overTime} />
    </div>
  );
}
