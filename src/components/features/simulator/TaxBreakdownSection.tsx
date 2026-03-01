'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatEUR } from '@/lib/utils/format';
import type { TaxSimulationResult } from '@/types/simulator';
import { cn } from '@/lib/utils';

interface TaxBreakdownSectionProps {
  simulation: TaxSimulationResult;
}

const BRACKET_COLORS = [
  'bg-emerald-500',
  'bg-sky-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-red-600',
];

export function TaxBreakdownSection({ simulation }: TaxBreakdownSectionProps) {
  const { ir, cotisations } = simulation;
  const maxBracketTax = Math.max(...ir.brackets.map((b) => b.taxInBracket), 1);

  return (
    <div className="rounded-xl border border-border-default bg-surface-secondary p-5">
      <Tabs defaultValue="ir">
        <TabsList variant="line" className="mb-4 w-full">
          <TabsTrigger value="ir" className="flex-1">
            Impôt sur le revenu
          </TabsTrigger>
          <TabsTrigger value="cotisations" className="flex-1">
            Cotisations
          </TabsTrigger>
          <TabsTrigger value="tva" className="flex-1">
            TVA
          </TabsTrigger>
        </TabsList>

        {/* ─── IR Tab ───────────────────────────────────────────── */}
        <TabsContent value="ir" className="space-y-3">
          <div className="space-y-2">
            {ir.brackets.map((bracket, i) => {
              const max = bracket.max ? formatEUR(bracket.max) : '∞';
              const width = maxBracketTax > 0 ? (bracket.taxInBracket / maxBracketTax) * 100 : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">
                      {formatEUR(bracket.min)} → {max}{' '}
                      <span className="font-medium text-text-secondary">
                        ({(bracket.rate * 100).toFixed(0)} %)
                      </span>
                    </span>
                    <span className="tabular-nums font-medium text-text-primary">
                      {formatEUR(bracket.taxInBracket)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-primary">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', BRACKET_COLORS[i])}
                      style={{ width: `${Math.max(width, bracket.taxInBracket > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-border-default pt-3">
            <span className="text-sm font-medium text-text-secondary">Total IR</span>
            <span className="font-display text-lg font-bold tabular-nums text-chainsaw-red">
              {formatEUR(ir.irTotal)}
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Taux effectif IR : {(ir.effectiveRate * 100).toFixed(1)} % — Revenu imposable :{' '}
            {formatEUR(ir.revenuImposable)}
          </p>
        </TabsContent>

        {/* ─── Cotisations Tab ──────────────────────────────────── */}
        <TabsContent value="cotisations" className="space-y-2">
          <CotisationRow label="CSG (9,2 %)" amount={cotisations.csg} />
          <CotisationRow label="CRDS (0,5 %)" amount={cotisations.crds} />
          <CotisationRow label="Retraite de base (6,9 %)" amount={cotisations.retraiteBase} />
          <CotisationRow label="Retraite complémentaire (3,86 %)" amount={cotisations.retraiteComplementaire} />
          {cotisations.assuranceMaladie > 0 && (
            <CotisationRow label="Assurance maladie" amount={cotisations.assuranceMaladie} />
          )}
          <div className="flex items-center justify-between border-t border-border-default pt-3">
            <span className="text-sm font-medium text-text-secondary">Total cotisations</span>
            <span className="font-display text-lg font-bold tabular-nums text-chainsaw-red">
              {formatEUR(cotisations.total)}
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Les cotisations financent la Sécurité sociale (maladie, retraite, famille).
          </p>
        </TabsContent>

        {/* ─── TVA Tab ──────────────────────────────────────────── */}
        <TabsContent value="tva" className="space-y-3">
          <p className="text-sm text-text-secondary">
            La TVA est un impôt indirect prélevé sur la consommation. Son montant dépend de vos habitudes
            de dépense.
          </p>
          <div className="rounded-lg bg-surface-primary p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">TVA estimée</span>
              <span className="font-display text-lg font-bold tabular-nums text-chainsaw-red">
                {formatEUR(simulation.tva.estimatedTVA)}
              </span>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              Estimation basée sur un taux effectif moyen de ~13 % appliqué à 80 % du revenu disponible
              (hypothèse : 20 % épargné).
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CotisationRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="tabular-nums font-medium text-text-primary">{formatEUR(amount)}</span>
    </div>
  );
}
