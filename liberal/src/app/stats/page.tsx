import { getFullStats } from '@/lib/api/stats';
import { StatsPageClient } from '@/components/features/stats/StatsPageClient';
import { SITE_NAME } from '@/lib/metadata';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes ISR

export const metadata: Metadata = {
  title: `Statistiques - ${SITE_NAME}`,
  description:
    'Le compteur global des dépenses publiques signalées. Visualisez les gaspillages par catégorie, montant et évolution dans le temps.',
};

export default async function StatsPage() {
  const stats = await getFullStats();

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 pb-20 md:pb-8">
      <StatsPageClient stats={stats} />
    </main>
  );
}
