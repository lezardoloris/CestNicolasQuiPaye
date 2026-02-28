import { ExternalLink } from 'lucide-react';
import { DENOMINATOR_LABELS } from '@/lib/utils/denominator-labels';
import {
  formatFrenchNumber,
  formatFrenchCurrency,
  formatFrenchDate,
} from '@/lib/utils/format';
import { getDenominatorFreshness } from '@/lib/utils/denominator-freshness';
import FreshnessBadge from './FreshnessBadge';
import type { DenominatorData } from '@/types/cost-engine';

interface DataStatusTableProps {
  denominators: DenominatorData[];
}

function formatDenominatorValue(
  value: number,
  formatType: 'integer' | 'currency' | 'decimal'
): string {
  switch (formatType) {
    case 'integer':
      return formatFrenchNumber(value, 0);
    case 'currency':
      return formatFrenchCurrency(value, 2);
    case 'decimal':
      return formatFrenchNumber(value, 4);
    default:
      return formatFrenchNumber(value);
  }
}

export default function DataStatusTable({
  denominators,
}: DataStatusTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border-default">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Statut des donnees utilisees pour les calculs Cout pour Nicolas
        </caption>
        <thead>
          <tr className="border-b border-border-default bg-surface-secondary">
            <th
              scope="col"
              className="px-4 py-3 text-left font-display font-medium text-text-primary"
            >
              Donnee
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right font-display font-medium text-text-primary"
            >
              Valeur actuelle
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-display font-medium text-text-primary"
            >
              Source
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-display font-medium text-text-primary"
            >
              Derniere mise a jour
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-display font-medium text-text-primary"
            >
              Prochaine mise a jour
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-center font-display font-medium text-text-primary"
            >
              Statut
            </th>
          </tr>
        </thead>
        <tbody>
          {denominators.map((denom, index) => {
            const labelInfo = DENOMINATOR_LABELS[denom.key] || {
              label: denom.key,
              unit: '',
              formatType: 'decimal' as const,
            };

            const freshness = getDenominatorFreshness(
              denom.last_updated,
              denom.update_frequency
            );

            return (
              <tr
                key={denom.key}
                className={`border-b border-border-default last:border-0 ${
                  index % 2 === 1 ? 'bg-surface-secondary/50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-text-primary">
                    {labelInfo.label}
                  </div>
                  <div className="text-xs text-text-muted">
                    {labelInfo.unit}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-text-primary">
                  {formatDenominatorValue(denom.value, labelInfo.formatType)}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={denom.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-chainsaw-red hover:underline"
                    aria-label={`Source : ${denom.source_name} (ouvre dans un nouvel onglet)`}
                  >
                    <span className="max-w-[200px] truncate">
                      {denom.source_name}
                    </span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {formatFrenchDate(denom.last_updated)}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {freshness.nextUpdate}
                </td>
                <td className="px-4 py-3 text-center">
                  <FreshnessBadge
                    status={freshness.status}
                    label={freshness.label}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
