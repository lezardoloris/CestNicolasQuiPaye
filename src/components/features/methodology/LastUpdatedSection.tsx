import { DENOMINATOR_LABELS } from '@/lib/utils/denominator-labels';
import { formatFrenchDate } from '@/lib/utils/format';
import { getDenominatorFreshness } from '@/lib/utils/denominator-freshness';
import FreshnessBadge from '@/components/features/data-status/FreshnessBadge';
import type { DenominatorData } from '@/types/cost-engine';

interface LastUpdatedSectionProps {
  denominators: DenominatorData[];
}

export default function LastUpdatedSection({
  denominators,
}: LastUpdatedSectionProps) {
  return (
    <section className="mt-12 mb-8">
      <h2 className="font-display text-2xl font-bold text-text-primary mb-4">
        Dernière mise à jour des données
      </h2>
      <p className="text-text-secondary mb-6">
        Chaque donnée est mise à jour selon un calendrier défini. Voici
        l&apos;état actuel de chaque source.
      </p>

      <div className="space-y-3">
        {denominators.map((denom) => {
          const labelInfo = DENOMINATOR_LABELS[denom.key];
          const freshness = getDenominatorFreshness(
            denom.last_updated,
            denom.update_frequency
          );

          return (
            <div
              key={denom.key}
              className="flex items-center justify-between rounded-lg border border-border-default bg-surface-secondary px-4 py-3"
            >
              <div>
                <p className="font-medium text-text-primary">
                  {labelInfo?.label || denom.key}
                </p>
                <p className="text-sm text-text-muted">
                  Mis à jour le {formatFrenchDate(denom.last_updated)}
                </p>
              </div>
              <FreshnessBadge
                status={freshness.status}
                label={freshness.label}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <a
          href="/data-status"
          className="text-sm text-chainsaw-red hover:underline"
        >
          Voir le statut complet des données
        </a>
      </div>
    </section>
  );
}
