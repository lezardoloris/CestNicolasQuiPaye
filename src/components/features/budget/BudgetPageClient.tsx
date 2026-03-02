import type { BudgetData } from '@/lib/constants/budget-2026';
import { BudgetNav } from './BudgetNav';
import { DeficitCounter } from './DeficitCounter';
import { BudgetKpiCards } from './BudgetKpiCards';
import { DebtPerCapitaCards } from './DebtPerCapitaCards';
import { PublicSalariesSection } from './PublicSalariesSection';
import { AssociationsSection } from './AssociationsSection';
import { AgenciesSection } from './AgenciesSection';
import { BudgetSourcesSection } from './BudgetSourcesSection';

// Lazy-load chart-heavy components (Recharts ~1 MB) — client islands
import {
  PublicSpendingChart,
  MissionBarChart,
  RevenueBreakdownChart,
  DebtProjectionChart,
  SocialSpendingSection,
  IncomeTaxSection,
  EUComparisonSection,
} from './BudgetDynamicCharts';
import { Landmark, TrendingDown, Receipt, BadgeEuro, Heart, Building2, ShieldAlert, Globe } from 'lucide-react';

interface BudgetPageClientProps {
  data: BudgetData;
}

export function BudgetPageClient({ data }: BudgetPageClientProps) {
  const interestBn =
    data.debtTimeline.find((d) => d.year === 2026)?.interestBn ?? 55;

  const deficitPctBudget =
    (Math.abs(data.deficit) / data.netExpenditure) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Landmark className="size-7 text-chainsaw-red" aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
          Les chiffres
        </h1>
      </div>

      <p className="text-sm text-text-secondary">
        Finances publiques françaises : budget de l&apos;État (Loi de Finances 2026), dette,
        protection sociale, santé, fraude, impôts, rémunérations publiques,
        associations, agences de l&apos;État et comparaison européenne.<br />
        Sources : budget.gouv.fr, Sénat, INSEE, Cour des comptes, DGFiP, DREES, Eurostat, IFRAP.
      </p>

      {/* Data freshness badge */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface-secondary px-3 py-1">
          <span className="size-1.5 rounded-full bg-success" />
          Données à jour au 28 février 2026
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface-secondary px-3 py-1">
          Loi de Finances 2026 — Vote définitif
        </span>
      </div>

      {/* Sub-navigation */}
      <BudgetNav />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION : Déficit */}
      <section id="deficit">
        <DeficitCounter
          deficit={data.deficit * 1_000_000}
          deficitPctBudget={deficitPctBudget}
        />

        <div className="mt-6">
          <BudgetKpiCards
            netRevenue={data.netRevenue}
            netExpenditure={data.netExpenditure}
            deficit={data.deficit}
            deficitPctBudget={deficitPctBudget}
            deficitPctGdp={data.deficitPctGdp}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION : Dépenses publiques totales (COFOG) */}
      <section id="depenses-publiques" className="space-y-4">
        <div className="rounded-lg border border-info/20 bg-info/5 p-4 text-sm text-text-secondary">
          <p>
            <strong className="text-text-primary">1 672 Md&euro;</strong> = total
            des dépenses publiques françaises (État + Sécurité sociale +
            collectivités territoriales + opérateurs).<br />Le budget de l&apos;État
            ci-dessous (<strong className="text-text-primary">459 Md&euro;</strong>)
            n&apos;en représente qu&apos;environ <strong className="text-text-primary">27%</strong>.
            <br />Le reste finance les retraites, la santé (Sécu), les écoles, routes
            et services des communes, départements et régions.
          </p>
        </div>
        <PublicSpendingChart data={data.publicSpending} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION : Budget de l'État (missions + recettes) */}
      <section id="budget-etat" className="space-y-4">
        <h2 className="text-base font-semibold text-text-primary">
          Budget de l&apos;État (459 Md&euro; — 27% du total)
        </h2>
        <p className="text-xs text-text-muted">
          Dépenses nettes du budget général. L&apos;audiovisuel public (France TV,
          Radio France…) est financé séparément par une fraction de TVA (~3,8 Md&euro;).
        </p>
        <div className="grid gap-8 lg:grid-cols-2">
          <MissionBarChart data={data.missions} />
          <RevenueBreakdownChart data={data.revenues} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION : Protection sociale, santé et fraude */}
      <section id="protection-sociale" className="space-y-6">
        <div className="flex items-center gap-3 border-t border-border-default pt-8">
          <ShieldAlert className="size-6 text-chainsaw-red" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-text-primary sm:text-2xl">
            Protection sociale, santé et fraude
          </h2>
        </div>

        <p className="text-sm text-text-secondary">
          La protection sociale représente <strong className="text-text-primary">693 Md&euro;</strong> (COFOG)
          et la dépense courante de santé <strong className="text-text-primary">333 Md&euro;</strong> (DCSi).
          Où va cet argent ? Et combien est perdu en fraude ?
        </p>

        <SocialSpendingSection
          socialProtection={data.socialProtection}
          socialProtectionTotalBn={data.socialProtectionTotalBn}
          healthSpending={data.healthSpending}
          healthSpendingTotalBn={data.healthSpendingTotalBn}
          socialFraud={data.socialFraud}
          socialFraudEstimatedTotalBn={data.socialFraudEstimatedTotalBn}
          secuDeficit2024Bn={data.secuDeficit2024Bn}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION : Prospective dette */}
      <section id="prospective" className="space-y-6">
        <div className="flex items-center gap-3 border-t border-border-default pt-8">
          <TrendingDown className="size-6 text-chainsaw-red" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-text-primary sm:text-2xl">
            Prospective : la dette publique
          </h2>
        </div>

        <p className="text-sm text-text-secondary">
          Si le rythme actuel de déficit (~140 Md&euro;/an) se maintient, la dette publique
          continuera de croître sous l&apos;effet cumulé des déficits et de la hausse des taux
          d&apos;intérêt. Voici ce que cela représente pour chaque Français.
        </p>

        <DebtPerCapitaCards
          currentDebtBn={data.currentDebtBn}
          population={data.population}
          taxpayers={data.taxpayers}
          interestBn={interestBn}
          debtEmissions2026Bn={data.debtEmissions2026Bn}
        />

        <DebtProjectionChart data={data.debtTimeline} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION : Impot sur le revenu */}
      <section id="impot-revenu" className="space-y-6">
        <div className="flex items-center gap-3 border-t border-border-default pt-8">
          <Receipt className="size-6 text-info" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-text-primary sm:text-2xl">
            L&apos;impôt sur le revenu
          </h2>
        </div>

        <p className="text-sm text-text-secondary">
          Sur 41,5 millions de foyers fiscaux, seuls 19,6 millions (47%) payent effectivement
          l&apos;impôt sur le revenu. Et la répartition est très concentrée.
        </p>

        <IncomeTaxSection
          deciles={data.incomeTaxDeciles}
          totalIRBn={data.incomeTaxTotal}
          taxpayers={data.taxpayers}
          totalFiscalHouseholds={data.totalFiscalHouseholds}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION : Remunerations publiques */}
      <section id="remunerations" className="space-y-6">
        <div className="flex items-center gap-3 border-t border-border-default pt-8">
          <BadgeEuro className="size-6 text-warning" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-text-primary sm:text-2xl">
            Rémunérations publiques
          </h2>
        </div>

        <p className="text-sm text-text-secondary">
          Combien gagnent ceux qui gèrent l&apos;argent public ? Élus, dirigeants d&apos;entreprises
          publiques, hauts fonctionnaires et directeurs d&apos;agences de l&apos;État.
        </p>

        <PublicSalariesSection salaries={data.publicSalaries} smic={data.smic} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION : Associations subventionnees */}
      <section id="associations" className="space-y-6">
        <div className="flex items-center gap-3 border-t border-border-default pt-8">
          <Heart className="size-6 text-[#ec4899]" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-text-primary sm:text-2xl">
            Associations subventionnées
          </h2>
        </div>

        <p className="text-sm text-text-secondary">
          L&apos;État, les collectivités et la Sécurité sociale versent 23 Md&euro;/an
          de subventions aux associations. Voici les plus gros bénéficiaires.
        </p>

        <AssociationsSection
          associations={data.associations}
          totalSubsidiesBn={data.totalAssociationSubsidies}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION : Agences de l'État */}
      <section id="agences" className="space-y-6">
        <div className="flex items-center gap-3 border-t border-border-default pt-8">
          <Building2 className="size-6 text-chainsaw-red" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-text-primary sm:text-2xl">
            Opérateurs et agences de l&apos;État
          </h2>
        </div>

        <p className="text-sm text-text-secondary">
          L&apos;État délègue des missions à 431 opérateurs publics (agences, instituts,
          offices…) pour un coût total de 51,6 Md&euro; de crédits budgétaires et 482 000 agents.
          Voici les 20 plus gros par financement public.
        </p>

        <AgenciesSection
          agencies={data.stateAgencies}
          totalOperators={data.totalOperators}
          totalFundingBn={data.totalOperatorFundingBn}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION : La France et l'UE */}
      <section id="france-ue" className="space-y-6">
        <div className="flex items-center gap-3 border-t border-border-default pt-8">
          <Globe className="size-6 text-info" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-text-primary sm:text-2xl">
            La France et l&apos;UE
          </h2>
        </div>

        <p className="text-sm text-text-secondary">
          Comment se situe la France par rapport à ses voisins européens ?
          Comparaison de la dette, du déficit et des dépenses publiques en % du PIB,
          face aux critères de Maastricht.
        </p>

        <EUComparisonSection data={data.euComparison} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION : Sources */}
      <section id="sources">
        <BudgetSourcesSection />
      </section>
    </div>
  );
}
