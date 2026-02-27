import { notFound } from 'next/navigation';
import { FeedSortTabs } from '@/components/features/feed/FeedSortTabs';
import { FeedList } from '@/components/features/feed/FeedList';
import { TopTimeFilter } from '@/components/features/feed/TopTimeFilter';
import { getSubmissions } from '@/lib/api/submissions';
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
      'Les gaspillages publics les plus signales en ce moment sur LIBERAL.',
  },
  new: {
    title: 'Recent',
    description:
      'Les derniers signalements de gaspillage public soumis par les citoyens.',
  },
  top: {
    title: 'Top',
    description:
      'Les gaspillages publics les plus votes de tous les temps sur LIBERAL.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sort: string }>;
}): Promise<Metadata> {
  const { sort } = await params;
  const meta = SORT_META[sort];
  if (!meta) return { title: 'LIBERAL' };

  return {
    title: `${meta.title} - LIBERAL`,
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

  const submissions = await getSubmissions({
    sort,
    timeWindow: validTimeWindow,
  });

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 pb-20 md:pb-6">
      <FeedSortTabs activeSort={sort} />

      {sort === 'top' && <TopTimeFilter activeWindow={validTimeWindow} />}

      <div className="mt-4">
        <FeedList
          initialData={submissions}
          sort={sort}
          timeWindow={sort === 'top' ? validTimeWindow : undefined}
        />
      </div>
    </main>
  );
}
