import { FeatureProposalList } from '@/components/features/feature-voting/FeatureProposalList';
import { FeatureProposalForm } from '@/components/features/feature-voting/FeatureProposalForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Propositions de fonctionnalites',
  description:
    'Votez pour les prochaines fonctionnalites de NICOLAS PAYE ou proposez vos propres idees.',
};

export default function FeaturesPage() {
  return (
    <main
      id="main-content"
      className="mx-auto max-w-3xl px-4 py-8 pb-20 md:pb-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
            Propositions
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Votez pour les fonctionnalites que vous souhaitez voir sur NICOLAS PAYE ou
            proposez vos propres idees.
          </p>
        </div>
        <FeatureProposalForm />
      </div>

      {/* Feature list */}
      <div className="mt-8">
        <FeatureProposalList />
      </div>
    </main>
  );
}
