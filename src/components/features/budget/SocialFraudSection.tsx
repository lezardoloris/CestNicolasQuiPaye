import type { SocialFraudItem } from '@/lib/constants/budget-2026';
import { fmtDecimal1 } from '@/lib/utils/format';
import { BudgetKpiCard } from './BudgetKpiCard';

interface SocialFraudSectionProps {
  socialFraud: SocialFraudItem[];
  socialFraudEstimatedTotalBn: number;
  secuDeficit2024Bn: number;
}

export function SocialFraudSection({
  socialFraud,
  socialFraudEstimatedTotalBn,
  secuDeficit2024Bn,
}: SocialFraudSectionProps) {
  const totalFraudEstimated = socialFraud.reduce((sum, f) => sum + f.estimatedBn, 0);
  const totalFraudDetected = socialFraud.reduce((sum, f) => sum + f.detectedBn, 0);
  const detectionRate = Math.round((totalFraudDetected / totalFraudEstimated) * 100);

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-chainsaw-red">
        Fraude sociale : l&apos;angle mort des finances publiques
      </h3>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <BudgetKpiCard
          value={`~${fmtDecimal1.format(totalFraudEstimated)} Md€`}
          label="Fraude estimée/an"
          color="text-chainsaw-red"
          className="border-chainsaw-red/20 bg-chainsaw-red/5"
        />
        <BudgetKpiCard
          value={`${fmtDecimal1.format(totalFraudDetected)} Md€`}
          label="Fraude détectée/an"
        />
        <BudgetKpiCard
          value={`${detectionRate}%`}
          label="Taux de détection"
          color="text-warning"
          className="col-span-2 border-warning/20 bg-warning/5 sm:col-span-1"
        />
      </div>

      {/* Fraud table */}
      <div className="overflow-x-auto rounded-xl border border-border-default">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Fraude sociale par domaine : montants estimés et détectés</caption>
          <thead>
            <tr className="border-b border-border-default bg-surface-secondary text-xs text-text-muted">
              <th scope="col" className="px-4 py-2 font-medium">Domaine</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Estimée</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Détectée</th>
              <th scope="col" className="hidden px-4 py-2 font-medium sm:table-cell">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {socialFraud.map((f) => (
              <tr key={f.domain} className="bg-surface-primary/50">
                <td scope="row" className="px-4 py-2.5">
                  <p className="font-medium text-text-primary">{f.domain}</p>
                  <p className="text-xs text-text-muted sm:hidden">{f.note}</p>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-sm tabular-nums text-chainsaw-red">
                  {f.estimatedBn} Md&euro;
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-sm tabular-nums text-text-primary">
                  {f.detectedBn} Md&euro;
                </td>
                <td className="hidden max-w-xs px-4 py-2.5 text-xs text-text-secondary sm:table-cell">
                  {f.note}
                  <span className="block italic text-text-muted">{f.source}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key insights */}
      <div className="rounded-lg border border-chainsaw-red/20 bg-chainsaw-red/5 p-4">
        <p className="text-sm font-semibold text-chainsaw-red">
          La fraude couvre le déficit de la Sécu
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Le déficit de la Sécurité sociale en 2024 est de{' '}
          <strong className="text-text-primary">{secuDeficit2024Bn} Md&euro;</strong>.
          L&apos;estimation basse de la fraude sociale est de{' '}
          <strong className="text-text-primary">~{socialFraudEstimatedTotalBn} Md&euro;/an</strong>.
          Autrement dit, la fraude sociale représente plus que le déficit de la Sécu.
          Pourtant, seuls <strong className="text-text-primary">{detectionRate}%</strong> des
          montants estimés sont détectés. La Cour des comptes dénonce un « angle mort »
          persistant, en particulier sur le travail dissimulé (6 à 10 Md&euro;) et la fraude
          documentaire.
        </p>
      </div>

      <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
        <p className="text-sm font-semibold text-warning">
          Sécu : trajectoire « hors de contrôle »
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Le déficit de la Sécu s&apos;est creusé de 10,8 Md&euro; (2023) à 15,3 Md&euro; (2024),
          avec une projection à 22-23 Md&euro; pour 2025. La dette sociale (ACOSS) passerait de
          42 Md&euro; (2025) à <strong className="text-text-primary">113 Md&euro; d&apos;ici 2028</strong>.
          La Cour des comptes alerte sur un risque de « crise de liquidité » dès 2026.
          Le PLFSS 2026 prévoit 9 Md&euro; d&apos;économies, dont 7 Md&euro; sur l&apos;assurance maladie.
        </p>
      </div>
    </div>
  );
}
