import { notFound } from 'next/navigation';
import { FeedSortTabs } from '@/components/features/feed/FeedSortTabs';
import { TopTimeFilter } from '@/components/features/feed/TopTimeFilter';
import { HeroSection } from '@/components/features/feed/HeroSection';
import { FeedPageClient } from '@/components/features/feed/FeedPageClient';
import { MiniLeaderboard } from '@/components/features/leaderboard/MiniLeaderboard';
import { LevelUpTeaser } from '@/components/features/gamification/LevelUpTeaser';
import { SidebarGamification } from '@/components/features/gamification/SidebarGamification';

import { getSubmissions, getActiveCategories } from '@/lib/api/submissions';
import { getPlatformStats } from '@/lib/api/stats';
import { getTopLeaderboard } from '@/lib/api/leaderboard';
import { getPendingSubmissionCount } from '@/lib/api/pending-count';
import { isValidSort } from '@/lib/utils/validation';
import { auth } from '@/lib/auth';
import { PendingReviewCard } from '@/components/features/submissions/PendingReviewCard';
import { FeedRightSidebar } from '@/components/features/feed/FeedRightSidebar';
import { MobileContributeBanner } from '@/components/features/feed/MobileContributeBanner';
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
      'Les gaspillages publics les plus signalés en ce moment sur C\'est Nicolas Qui Paie.',
  },
  new: {
    title: 'Récent',
    description:
      'Les derniers signalements de gaspillage public soumis par les citoyens.',
  },
  top: {
    title: 'Top',
    description:
      'Les gaspillages publics les plus votés de tous les temps sur C\'est Nicolas Qui Paie.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sort: string }>;
}): Promise<Metadata> {
  const { sort } = await params;
  const meta = SORT_META[sort];
  if (!meta) return { title: 'C\'est Nicolas Qui Paie' };

  return {
    title: `${meta.title} - C'est Nicolas Qui Paie`,
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

  const [submissions, stats, leaderboard, session, pendingCount, activeCategories] =
    await Promise.all([
      getSubmissions({ sort, timeWindow: validTimeWindow }),
      getPlatformStats(),
      getTopLeaderboard(5),
      auth(),
      getPendingSubmissionCount(),
      getActiveCategories(),
    ]);

  const isLoggedOut = !session?.user;

  return (
    <main id="main-content" className="px-4 pt-4 pb-20 md:pt-6 md:pb-6 lg:pt-0">
      <div className="lg:flex lg:gap-6">
        {/* Feed column — center column with vertical borders on desktop */}
        <div className="mx-auto min-w-0 w-full max-w-[600px] lg:mx-0 lg:flex-1 lg:max-w-none lg:border-x lg:border-border-default">
          <HeroSection stats={stats} />

          {/* Mobile: contribution CTAs */}
          <MobileContributeBanner />

          <FeedSortTabs activeSort={sort} />

          {sort === 'top' && <TopTimeFilter activeWindow={validTimeWindow} />}

          <FeedPageClient
            initialData={submissions}
            sort={sort}
            timeWindow={sort === 'top' ? validTimeWindow : undefined}
            activeCategories={activeCategories}
          />
        </div>

        {/* Right sidebar — widgets + submission preview on card click */}
        <FeedRightSidebar>
          {pendingCount > 0 && <PendingReviewCard count={pendingCount} />}
          {!isLoggedOut && <LevelUpTeaser />}
          <MiniLeaderboard entries={leaderboard} variant="sidebar" />
          {isLoggedOut && <SidebarGamification />}
        </FeedRightSidebar>
      </div>
    </main>
  );
}
