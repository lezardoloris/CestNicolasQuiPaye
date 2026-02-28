import { notFound } from 'next/navigation';
import { FeedSortTabs } from '@/components/features/feed/FeedSortTabs';
import { TopTimeFilter } from '@/components/features/feed/TopTimeFilter';
import { HeroSection } from '@/components/features/feed/HeroSection';
import { FeedPageClient } from '@/components/features/feed/FeedPageClient';
import { getSubmissions } from '@/lib/api/submissions';
import { getPlatformStats } from '@/lib/api/stats';
import { isValidSort } from '@/lib/utils/validation';
import type { Metadata } from 'next';

// ISR revalidation: base 60s (hot default)
// This is overridden per sort in generateStaticParams
export const revalidate = 60;

export async function generateStaticParams() {
  return [{ sort: 'hot' }, { sort: 'new' }, { sort: 'top' }];
}

const SORT_META: Record<string, { title: string; description: string }> = {
  hot: {
    title: 'Tendances',
    description:
      'Les gaspillages publics les plus signalés en ce moment sur NICOLAS PAYE.',
  },
  new: {
    title: 'Récent',
    description:
      'Les derniers signalements de gaspillage public soumis par les citoyens.',
  },
  top: {
    title: 'Top',
    description:
      'Les gaspillages publics les plus votés de tous les temps sur NICOLAS PAYE.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sort: string }>;
}): Promise<Metadata> {
  const { sort } = await params;
  const meta = SORT_META[sort];
  if (!meta) return { title: 'NICOLAS PAYE' };

  return {
    title: `${meta.title} - NICOLAS PAYE`,
    description: meta.description,
  };
}

interface FeedPageProps {
  params: Promise<{ sort: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function FeedPage({ params, searchParams }: FeedPageProps) {
  const { sort } = await params;
  const { t: timeWindow } = await searchParams;

  if (!isValidSort(sort)) {
    notFound();
  }

  const validTimeWindow =
    sort === 'top' && timeWindow && ['today', 'week', 'month', 'all'].includes(timeWindow)
      ? (timeWindow as 'today' | 'week' | 'month' | 'all')
      : 'week';

  const [submissions, stats] = await Promise.all([
    getSubmissions({ sort, timeWindow: validTimeWindow }),
    getPlatformStats(),
  ]);

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 pb-20 md:pb-6">
      <HeroSection stats={stats} />

      <FeedSortTabs activeSort={sort} />

      {sort === 'top' && <TopTimeFilter activeWindow={validTimeWindow} />}

      <div className="mt-4">
        <FeedPageClient
          initialData={submissions}
          sort={sort}
          timeWindow={sort === 'top' ? validTimeWindow : undefined}
        />
      </div>
    </main>
  );
}
