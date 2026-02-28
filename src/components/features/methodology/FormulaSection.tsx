import { ExternalLink } from 'lucide-react';
import FormulaDisplay from './FormulaDisplay';
import VerifyLink from '@/components/features/data-status/VerifyLink';
import {
  formatFrenchNumber,
  formatFrenchCurrency,
  formatFrenchDate,
} from '@/lib/utils/format';

interface FormulaSectionProps {
  title: string;
  formula: string;
  formulaAriaLabel: string;
  denominatorKey: string;
  denominatorValue?: number;
  denominatorUnit: string;
  sourceName?: string;
  sourceUrl?: string;
  lastUpdated?: string;
  description: string;
}

export default function FormulaSection({
  title,
  formula,
  formulaAriaLabel,
  denominatorValue,
  denominatorUnit,
  sourceName,
  sourceUrl,
  lastUpdated,
  description,
}: FormulaSectionProps) {
  const formattedValue =
    denominatorValue !== undefined
      ? denominatorUnit.includes('EUR')
        ? formatFrenchCurrency(denominatorValue, 2)
        : formatFrenchNumber(denominatorValue, 0)
      : 'N/A';

  return (
    <section className="mb-8 pb-8 border-b border-border-default last:border-0">
      <h2 className="font-display text-xl font-bold text-text-primary mb-2">
        {title}
      </h2>
      <p className="text-text-secondary mb-3">{description}</p>

      <FormulaDisplay formula={formula} ariaLabel={formulaAriaLabel} />

      <div className="mt-4 space-y-2">
        {/* Current denominator value */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-muted">Valeur actuelle :</span>
          <span className="font-mono font-medium text-text-primary">
            {formattedValue}
          </span>
          <span className="text-text-muted">({denominatorUnit})</span>
        </div>

        {/* Source */}
        {sourceName && sourceUrl && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-muted">Source :</span>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-chainsaw-red hover:underline"
              aria-label={`Source : ${sourceName} (ouvre dans un nouvel onglet)`}
            >
              <span className="max-w-[300px] truncate">{sourceName}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
        )}

        {/* Last updated */}
        {lastUpdated && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-muted">Derniere mise a jour :</span>
            <span className="text-text-secondary">
              {formatFrenchDate(lastUpdated)}
            </span>
            <VerifyLink lastUpdated={lastUpdated} />
          </div>
        )}
      </div>
    </section>
  );
}
