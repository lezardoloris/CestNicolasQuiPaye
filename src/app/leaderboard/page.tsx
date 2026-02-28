import { SITE_NAME } from '@/lib/metadata';
import type { Metadata } from 'next';
import { LeaderboardPageClient } from '@/components/features/leaderboard/LeaderboardPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export const metadata: Metadata = {
  title: `Classement - La Tronconneuse d'Or - ${SITE_NAME}`,
  description:
    'Le classement des contributeurs les plus actifs. Soumettez des signalements, votez, ajoutez des sources et grimpez au classement pour decrocher la Tronconneuse d\'Or.',
};

export default function LeaderboardPage() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 pb-20 md:pb-8">
      <LeaderboardPageClient />
    </main>
  );
}
