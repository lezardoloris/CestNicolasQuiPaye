import { formatCompactEUR } from '@/lib/utils/format';
import type { StateAgency } from '@/lib/constants/budget-2026';
import { BudgetKpiCard } from './BudgetKpiCard';

interface AgenciesSectionProps {
  agencies: StateAgency[];
  totalOperators: number;
  totalFundingBn: number;
}

export function AgenciesSection({
  agencies,
  totalOperators,
  totalFundingBn,
}: AgenciesSectionProps) {
  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <BudgetKpiCard
          value={String(totalOperators)}
          label="Opérateurs de l'État"
          color="text-chainsaw-red"
        />
        <BudgetKpiCard
          value={formatCompactEUR(totalFundingBn * 1_000_000_000)}
          label="Crédits budgétaires (PLF 2026)"
        />
        <BudgetKpiCard
          value="482 000"
          label="Agents (ETP) rémunérés"
          color="text-warning"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border-default">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Top 20 des opérateurs de l&apos;État par financement public</caption>
          <thead>
            <tr className="border-b border-border-default bg-surface-secondary text-xs text-text-muted">
              <th scope="col" className="px-4 py-2 font-medium">#</th>
              <th scope="col" className="px-4 py-2 font-medium">Opérateur</th>
              <th scope="col" className="hidden px-4 py-2 font-medium sm:table-cell">ETP</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Financement État</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {agencies.map((a, i) => (
              <tr key={a.acronym} className="bg-surface-primary/50">
                <td className="px-4 py-2.5 text-xs text-text-muted">{i + 1}</td>
                <td scope="row" className="px-4 py-2.5">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-text-primary underline decoration-border-default underline-offset-2 hover:text-info hover:decoration-info"
                  >
                    {a.acronym}
                  </a>
                  <p className="mt-0.5 text-xs text-text-muted">{a.mission}</p>
                  <p className="text-xs text-text-secondary sm:hidden">
                    {a.employeesEtp.toLocaleString('fr-FR')} ETP
                  </p>
                </td>
                <td className="hidden px-4 py-2.5 text-xs tabular-nums text-text-secondary sm:table-cell">
                  {a.employeesEtp.toLocaleString('fr-FR')}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-sm tabular-nums text-text-primary">
                  {formatCompactEUR(a.stateFundingM * 1_000_000)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Critiques notables */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">
          Critiques notables (Cour des comptes, IFRAP, Sénat)
        </h3>
        <div className="space-y-2">
          {agencies
            .filter((a) => a.criticism.length > 50)
            .slice(0, 10)
            .map((a) => (
              <div
                key={a.acronym}
                className="rounded-lg border border-border-default bg-surface-secondary/50 p-3"
              >
                <p className="text-sm font-medium text-text-primary">{a.acronym}</p>
                <p className="mt-0.5 text-xs text-text-secondary">{a.criticism}</p>
                <p className="mt-0.5 text-xs italic text-text-muted">{a.criticismSource}</p>
              </div>
            ))}
        </div>
      </div>

      {/* IFRAP reform proposals */}
      <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
        <p className="text-sm font-semibold text-warning">
          Propositions de rationalisation (IFRAP)
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-text-secondary">
          <li>
            <strong className="text-text-primary">Fusionner</strong> ADEME + CEREMA + ANCT
            &rarr; économie estimée 600 M&euro;/an
          </li>
          <li>
            <strong className="text-text-primary">Fusionner</strong> Business France + Atout France
            &rarr; économie estimée 50 M&euro;/an
          </li>
          <li>
            <strong className="text-text-primary">Rationaliser</strong> les 4 agences de santé
            (ANSES, ANSM, HAS, SPF) &rarr; économie estimée 400 M&euro;/an
          </li>
          <li>
            <strong className="text-text-primary">Privatiser</strong> Météo-France et VNF
            &rarr; économie estimée 300 M&euro;/an
          </li>
        </ul>
        <p className="mt-2 text-xs text-text-muted">
          Total des économies potentielles estimées par l&apos;IFRAP : ~7 Md&euro; d&apos;ici 2029.
        </p>
      </div>

      <p className="text-xs text-text-muted">
        Sources : PLF 2026 — Jaune budgétaire « Opérateurs de l&apos;État »,
        FIPECO (fév. 2025), IFRAP, Cour des comptes, Sénat.
        Les 431 opérateurs reçoivent 51,6 Md&euro; de crédits budgétaires
        et emploient 482 000 agents (ETP).
      </p>
    </div>
  );
}
