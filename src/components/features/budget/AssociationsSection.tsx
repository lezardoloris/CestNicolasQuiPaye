import { formatEUR, formatCompactEUR } from '@/lib/utils/format';
import type { SubsidizedAssociation } from '@/lib/constants/budget-2026';

interface AssociationsSectionProps {
  associations: SubsidizedAssociation[];
  totalSubsidiesBn: number;
}

export function AssociationsSection({
  associations,
  totalSubsidiesBn,
}: AssociationsSectionProps) {
  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-default bg-surface-secondary p-4">
          <p className="font-display text-xl font-bold tabular-nums text-chainsaw-red sm:text-2xl">
            {formatCompactEUR(totalSubsidiesBn * 1_000_000_000)}
          </p>
          <p className="text-xs text-text-muted">Subventions publiques/an aux associations</p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-secondary p-4">
          <p className="font-display text-xl font-bold tabular-nums text-text-primary sm:text-2xl">
            1,3 M
          </p>
          <p className="text-xs text-text-muted">Associations en France</p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-secondary p-4 col-span-2 sm:col-span-1">
          <p className="font-display text-xl font-bold tabular-nums text-warning sm:text-2xl">
            44%
          </p>
          <p className="text-xs text-text-muted">Ne publient pas leurs comptes (IGAS)</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border-default">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Top des associations les plus subventionnées par l&apos;État</caption>
          <thead>
            <tr className="border-b border-border-default bg-surface-secondary text-xs text-text-muted">
              <th scope="col" className="px-4 py-2 font-medium">#</th>
              <th scope="col" className="px-4 py-2 font-medium">Association</th>
              <th scope="col" className="hidden px-4 py-2 font-medium sm:table-cell">Secteur</th>
              <th scope="col" className="px-4 py-2 font-medium text-right">Subvention État</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {associations.map((a, i) => (
              <tr key={a.name} className="bg-surface-primary/50">
                <td className="px-4 py-2.5 text-xs text-text-muted">{i + 1}</td>
                <td scope="row" className="px-4 py-2.5">
                  {a.url ? (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-text-primary underline decoration-border-default underline-offset-2 hover:text-info hover:decoration-info"
                    >
                      {a.name}
                    </a>
                  ) : (
                    <p className="font-medium text-text-primary">{a.name}</p>
                  )}
                  <p className="text-xs text-text-muted sm:hidden">{a.sector}</p>
                </td>
                <td className="hidden px-4 py-2.5 text-xs text-text-secondary sm:table-cell">
                  {a.sector}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-sm tabular-nums text-text-primary">
                  {formatEUR(a.subsidy)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Opacité des rémunérations */}
      <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
        <p className="text-sm font-semibold text-warning">
          Rémunérations des dirigeants des associations financées par vos impôts : un angle mort
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Les associations recevant plus de 153 000&euro; de subventions publiques
          doivent déclarer les 3 plus hautes rémunérations à l&apos;administration.
          Toutefois, ces données ne sont <strong className="text-text-primary">pas rendues publiques</strong>.
          Le plafond légal de rémunération d&apos;un dirigeant d&apos;association est fixé
          à 3 fois le plafond de la Sécurité sociale, soit environ{' '}
          <strong className="text-text-primary">11 592&euro; brut/mois</strong> (2025).
          Selon l&apos;IGAS, 44% des associations contrôlées ne publient pas leurs
          comptes, rendant tout contrôle citoyen impossible.
        </p>
      </div>

      <p className="text-xs text-text-muted">
        Sources : Contribuables Associés (données 2018), IFRAP, IGAS, Code
        général des impôts (art. 261-7-1&deg;-d). Total de 23 Md&euro; = État
        (7 Md&euro;) + collectivités (8 Md&euro;) + Sécu et opérateurs
        (8 Md&euro;).
      </p>
    </div>
  );
}
