import { formatEUR, fmtDecimal1 } from '@/lib/utils/format';
import type { PublicSalary } from '@/lib/constants/budget-2026';

interface PublicSalariesSectionProps {
  salaries: PublicSalary[];
  smic: { annualGross: number; monthlyNet: number };
}

export function PublicSalariesSection({ salaries, smic }: PublicSalariesSectionProps) {
  const smicMultiple = (annual: number): string =>
    `${fmtDecimal1.format(annual / smic.annualGross)}x`;

  const groups = [
    { title: 'Élus et membres du gouvernement', filter: (s: PublicSalary) => ['Élysée', 'Matignon', 'Gouvernement', 'Parlement'].includes(s.entity) },
    { title: 'Dirigeants d\'entreprises publiques', filter: (s: PublicSalary) => ['SNCF', 'EDF', 'La Poste', 'France Télévisions', 'RATP'].includes(s.entity) },
    { title: 'Hauts fonctionnaires', filter: (s: PublicSalary) => s.entity === 'Hauts fonctionnaires' },
    { title: 'Dirigeants d\'agences de l\'État (moy. top 10 agents)', filter: (s: PublicSalary) => s.entity === 'Agences de l\'État' },
  ];

  return (
    <div className="space-y-6">
      {/* SMIC reference */}
      <div className="rounded-lg border border-border-default bg-surface-secondary/50 p-3 text-center text-sm">
        <span className="text-text-muted">Référence SMIC 2025 : </span>
        <span className="font-bold text-text-primary">{formatEUR(smic.annualGross)}</span>
        <span className="text-text-muted"> brut/an = </span>
        <span className="font-bold text-text-primary">{formatEUR(smic.monthlyNet)}</span>
        <span className="text-text-muted"> net/mois</span>
      </div>

      {groups.map((group) => {
        const items = salaries.filter(group.filter);
        if (items.length === 0) return null;
        return (
          <div key={group.title}>
            <h3 className="mb-3 text-sm font-semibold text-text-secondary">{group.title}</h3>
            <div className="overflow-x-auto rounded-xl border border-border-default">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">{group.title} — rémunérations brutes annuelles</caption>
                <thead>
                  <tr className="border-b border-border-default bg-surface-secondary text-xs text-text-muted">
                    <th scope="col" className="px-4 py-2 font-medium">Fonction</th>
                    <th scope="col" className="px-4 py-2 font-medium text-right">Brut/an</th>
                    <th scope="col" className="hidden px-4 py-2 font-medium text-right sm:table-cell">x SMIC</th>
                    <th scope="col" className="hidden px-4 py-2 font-medium md:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {items.map((s) => (
                    <tr key={`${s.role}-${s.entity}`} className="bg-surface-primary/50">
                      <td scope="row" className="px-4 py-2.5">
                        <p className="font-medium text-text-primary">{s.role}</p>
                        <p className="text-xs text-text-muted">{s.entity}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm tabular-nums text-text-primary">
                        {formatEUR(s.annualGross)}
                      </td>
                      <td className="hidden px-4 py-2.5 text-right text-sm tabular-nums text-warning sm:table-cell">
                        {smicMultiple(s.annualGross)}
                      </td>
                      <td className="hidden max-w-48 px-4 py-2.5 text-xs text-text-muted md:table-cell">
                        {s.note ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <p className="text-xs text-text-muted">
        Sources : Sénat, Assemblée nationale, rapports annuels des entreprises publiques,
        DGFiP, presse. Les montants sont en brut annuel. Les parts variables et avantages
        en nature ne sont pas toujours inclus.
      </p>
    </div>
  );
}
