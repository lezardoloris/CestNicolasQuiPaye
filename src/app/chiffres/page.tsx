import { BudgetPageClient } from '@/components/features/budget/BudgetPageClient';
import { BUDGET_2026 } from '@/lib/constants/budget-2026';
import { SITE_NAME, SITE_URL } from '@/lib/metadata';
import type { Metadata } from 'next';

const pageTitle = `Les chiffres — ${SITE_NAME}`;
const pageDescription =
  'Budget 2026, déficit (-135 Md€), dette (3 620 Md€), protection sociale, santé, fraude, impôt sur le revenu, rémunérations, associations, agences de l\'État et comparaison UE.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: `${SITE_URL}/chiffres`,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: `${SITE_URL}/chiffres`,
    siteName: SITE_NAME,
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
  },
};

export default function BudgetPage() {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 pb-20 md:pb-8">
      <BudgetPageClient data={BUDGET_2026} />
    </main>
  );
}
