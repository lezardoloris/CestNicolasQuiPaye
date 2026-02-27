'use client';

import {
  Users,
  Receipt,
  Home,
  Clock,
  UtensilsCrossed,
  BedDouble,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatEUR, formatDays } from '@/lib/utils/cost-calculator';
import type { CostToNicolasResult } from '@/types/cost-engine';

interface ConsequenceCardProps {
  result: CostToNicolasResult;
  className?: string;
}

interface MetricRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unavailable?: boolean;
  verifyUrl?: string;
}

function MetricRow({
  icon,
  label,
  value,
  unavailable,
  verifyUrl,
}: MetricRowProps) {
  if (unavailable) {
    return (
      <div className="flex items-center gap-3 py-3 border-b border-border-default last:border-0">
        <div className="flex-shrink-0 text-text-muted">{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-text-muted">{label}</p>
          <Badge variant="outline" className="mt-1 text-text-muted">
            Donnee indisponible
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border-default last:border-0">
      <div className="flex-shrink-0 text-chainsaw-red">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-lg font-display font-bold text-text-primary">
          {value}
        </p>
      </div>
      {verifyUrl && (
        <a
          href={verifyUrl}
          className="text-xs text-text-muted hover:text-chainsaw-red transition-colors"
          title="Verifier cette donnee"
        >
          Verifier
        </a>
      )}
    </div>
  );
}

export default function ConsequenceCard({
  result,
  className,
}: ConsequenceCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-display text-lg">
          Cout pour Nicolas
        </CardTitle>
        <p className="text-sm text-text-secondary">
          Ce que ce gaspillage vous coute personnellement
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          <MetricRow
            icon={<Users className="h-5 w-5" />}
            label="Cout par citoyen"
            value={
              result.cost_per_citizen !== null
                ? formatEUR(result.cost_per_citizen, 4)
                : ''
            }
            unavailable={result.cost_per_citizen_unavailable}
            verifyUrl="/data-status"
          />
          <MetricRow
            icon={<Receipt className="h-5 w-5" />}
            label="Cout par contribuable"
            value={
              result.cost_per_taxpayer !== null
                ? formatEUR(result.cost_per_taxpayer, 4)
                : ''
            }
            unavailable={result.cost_per_taxpayer_unavailable}
            verifyUrl="/data-status"
          />
          <MetricRow
            icon={<Home className="h-5 w-5" />}
            label="Cout par menage"
            value={
              result.cost_per_household !== null
                ? formatEUR(result.cost_per_household, 4)
                : ''
            }
            unavailable={result.cost_per_household_unavailable}
            verifyUrl="/data-status"
          />
          <MetricRow
            icon={<Clock className="h-5 w-5" />}
            label="Jours de travail equivalents"
            value={
              result.days_of_work_equivalent !== null
                ? formatDays(result.days_of_work_equivalent)
                : ''
            }
            unavailable={result.days_of_work_unavailable}
            verifyUrl="/data-status"
          />
        </div>

        {/* Equivalences */}
        {result.equivalences.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border-default">
            <p className="text-sm font-medium text-text-secondary mb-3">
              Equivalences concretes
            </p>
            <div className="space-y-0">
              {result.equivalences.map((eq, index) => {
                const icon =
                  eq.label.includes('cantine') ? (
                    <UtensilsCrossed className="h-5 w-5" />
                  ) : (
                    <BedDouble className="h-5 w-5" />
                  );

                const formatted = new Intl.NumberFormat('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                }).format(eq.count);

                return (
                  <MetricRow
                    key={index}
                    icon={icon}
                    label={eq.label}
                    value={`${formatted} ${eq.label}`}
                    verifyUrl="/data-status"
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Data transparency link */}
        <div className="mt-4 pt-4 border-t border-border-default text-center">
          <a
            href="/data-status"
            className="text-xs text-text-muted hover:text-chainsaw-red transition-colors"
          >
            Verifier toutes les donnees utilisees
          </a>
          {' | '}
          <a
            href="/methodologie"
            className="text-xs text-text-muted hover:text-chainsaw-red transition-colors"
          >
            Methodologie de calcul
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
