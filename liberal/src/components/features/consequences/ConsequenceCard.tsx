import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatEURPrecise, formatWorkDays } from '@/lib/utils/format';
import Link from 'next/link';
import type { CostCalculationData, CostToNicolasResults } from '@/types/submission';

interface ConsequenceCardProps {
  data?: CostCalculationData | null;
  jsonData?: CostToNicolasResults | null;
}

interface MetricRowProps {
  label: string;
  value: string;
}

function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-text-primary">{value}</span>
        <Link
          href="/data-status"
          className="text-xs text-text-muted hover:text-chainsaw-red transition-colors"
        >
          Verifier
        </Link>
      </div>
    </div>
  );
}

export function ConsequenceCard({ data, jsonData }: ConsequenceCardProps) {
  // Handle costToNicolasResults (JSONB from submissions table)
  if (jsonData) {
    return (
      <Card className="mt-6 border-l-4 border-l-chainsaw-red bg-surface-secondary">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg text-text-primary">
            Cout pour Nicolas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {jsonData.costPerCitizen != null && (
            <MetricRow
              label="Cout par citoyen"
              value={formatEURPrecise(jsonData.costPerCitizen)}
            />
          )}
          {jsonData.costPerTaxpayer != null && (
            <MetricRow
              label="Cout par contribuable"
              value={formatEURPrecise(jsonData.costPerTaxpayer)}
            />
          )}
          {jsonData.costPerHousehold != null && (
            <MetricRow
              label="Cout par foyer"
              value={formatEURPrecise(jsonData.costPerHousehold)}
            />
          )}
          {jsonData.daysOfWorkEquivalent != null && (
            <MetricRow
              label="Equivalent en travail"
              value={formatWorkDays(jsonData.daysOfWorkEquivalent)}
            />
          )}
          {jsonData.equivalences && jsonData.equivalences.length > 0 && (
            <div className="mt-3 rounded-md bg-surface-elevated p-3">
              <p className="text-xs text-text-muted mb-2">Equivalences concretes</p>
              {jsonData.equivalences.map((eq, i) => (
                <p key={i} className="text-sm text-text-secondary">
                  Soit{' '}
                  <span className="font-semibold text-text-primary">
                    {new Intl.NumberFormat('fr-FR').format(eq.value)}
                  </span>{' '}
                  {eq.label}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Handle costCalculations table data
  if (!data) return null;

  return (
    <Card className="mt-6 border-l-4 border-l-chainsaw-red bg-surface-secondary">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg text-text-primary">
          Cout pour Nicolas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {data.costPerCitizen && (
          <MetricRow
            label="Cout par citoyen"
            value={formatEURPrecise(data.costPerCitizen)}
          />
        )}
        {data.costPerTaxpayer && (
          <MetricRow
            label="Cout par contribuable"
            value={formatEURPrecise(data.costPerTaxpayer)}
          />
        )}
        {data.costPerHousehold && (
          <MetricRow
            label="Cout par foyer"
            value={formatEURPrecise(data.costPerHousehold)}
          />
        )}
        {data.daysOfWorkEquivalent && (
          <MetricRow
            label="Equivalent en travail"
            value={formatWorkDays(data.daysOfWorkEquivalent)}
          />
        )}

        <p className="pt-2 text-xs text-text-muted">
          Calcule le{' '}
          {new Intl.DateTimeFormat('fr-FR').format(
            new Date(data.calculatedAt),
          )}
        </p>
      </CardContent>
    </Card>
  );
}
