import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FormulaSection from '@/components/features/methodology/FormulaSection';
import LastUpdatedSection from '@/components/features/methodology/LastUpdatedSection';
import { getDenominators } from '@/lib/api/denominators';

export const metadata: Metadata = {
  title: 'Méthodologie de calcul',
  description:
    'Explication détaillée de chaque formule et source de données utilisée dans les calculs Coût pour Nicolas.',
};

export const revalidate = 3600; // ISR: 1 hour

export default async function MethodologiePage() {
  const denominators = await getDenominators();

  // Build lookup map
  const denomMap = Object.fromEntries(
    denominators.map((d) => [d.key, d])
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
        Méthodologie de calcul
      </h1>
      <p className="text-text-secondary mb-8">
        Chaque chiffre affiché sur NICOLAS PAYE est calculable, vérifiable et
        contestable. Voici les formules exactes et les sources officielles
        utilisées.
      </p>

      {/* Section 1: Coût par citoyen */}
      <FormulaSection
        title="Coût par citoyen"
        formula="montant / population_france"
        formulaAriaLabel="montant divisé par la population française"
        denominatorKey="france_population"
        denominatorValue={denomMap.france_population?.value}
        denominatorUnit="habitants"
        sourceName={denomMap.france_population?.source_name}
        sourceUrl={denomMap.france_population?.source_url}
        lastUpdated={denomMap.france_population?.last_updated}
        description="Le coût total est divisé par le nombre d'habitants en France pour obtenir le coût par citoyen."
      />

      {/* Section 2: Coût par contribuable */}
      <FormulaSection
        title="Coût par contribuable"
        formula="montant / nombre_contribuables"
        formulaAriaLabel="montant divisé par le nombre de contribuables à l'impôt sur le revenu"
        denominatorKey="income_tax_payers"
        denominatorValue={denomMap.income_tax_payers?.value}
        denominatorUnit="foyers fiscaux"
        sourceName={denomMap.income_tax_payers?.source_name}
        sourceUrl={denomMap.income_tax_payers?.source_url}
        lastUpdated={denomMap.income_tax_payers?.last_updated}
        description="Le coût total est divisé par le nombre de foyers fiscaux imposables à l'impôt sur le revenu."
      />

      {/* Section 3: Coût par ménage */}
      <FormulaSection
        title="Coût par ménage"
        formula="montant / nombre_menages"
        formulaAriaLabel="montant divisé par le nombre de ménages français"
        denominatorKey="france_households"
        denominatorValue={denomMap.france_households?.value}
        denominatorUnit="ménages"
        sourceName={denomMap.france_households?.source_name}
        sourceUrl={denomMap.france_households?.source_url}
        lastUpdated={denomMap.france_households?.last_updated}
        description="Le coût total est divisé par le nombre de ménages en France."
      />

      {/* Section 4: Jours de travail équivalents */}
      <FormulaSection
        title="Jours de travail équivalents"
        formula="cout_par_contribuable / revenu_net_median_journalier"
        formulaAriaLabel="coût par contribuable divisé par le revenu net médian journalier"
        denominatorKey="daily_median_net_income"
        denominatorValue={denomMap.daily_median_net_income?.value}
        denominatorUnit="EUR/jour"
        sourceName={denomMap.daily_median_net_income?.source_name}
        sourceUrl={denomMap.daily_median_net_income?.source_url}
        lastUpdated={denomMap.daily_median_net_income?.last_updated}
        description="Le coût par contribuable est divisé par le revenu net médian journalier pour exprimer le coût en nombre de jours de travail."
      />

      {/* Section 5: Équivalences concrètes */}
      <h2 className="font-display text-2xl font-bold text-text-primary mt-12 mb-4">
        Équivalences concrètes
      </h2>
      <p className="text-text-secondary mb-6">
        Pour rendre les montants tangibles, nous les convertissons en objets du
        quotidien.
      </p>

      <FormulaSection
        title="Repas de cantine scolaire"
        formula="cout_par_citoyen / cout_repas_cantine"
        formulaAriaLabel="coût par citoyen divisé par le coût moyen d'un repas de cantine scolaire"
        denominatorKey="school_lunch_cost"
        denominatorValue={denomMap.school_lunch_cost?.value}
        denominatorUnit="EUR/repas"
        sourceName={denomMap.school_lunch_cost?.source_name}
        sourceUrl={denomMap.school_lunch_cost?.source_url}
        lastUpdated={denomMap.school_lunch_cost?.last_updated}
        description="Le coût par citoyen exprimé en nombre de repas de cantine scolaire au tarif moyen national."
      />

      <FormulaSection
        title="Journées d'hospitalisation"
        formula="cout_par_citoyen / cout_journee_hospitalisation"
        formulaAriaLabel="coût par citoyen divisé par le coût moyen d'une journée d'hospitalisation"
        denominatorKey="hospital_bed_day_cost"
        denominatorValue={denomMap.hospital_bed_day_cost?.value}
        denominatorUnit="EUR/jour"
        sourceName={denomMap.hospital_bed_day_cost?.source_name}
        sourceUrl={denomMap.hospital_bed_day_cost?.source_url}
        lastUpdated={denomMap.hospital_bed_day_cost?.last_updated}
        description="Le coût par citoyen exprimé en nombre de journées d'hospitalisation au coût moyen national."
      />

      {/* Section: Exemple concret */}
      <section className="mt-12 mb-8 rounded-lg border border-border-default bg-surface-secondary p-6">
        <h2 className="font-display text-xl font-bold text-text-primary mb-4">
          Exemple concret
        </h2>
        <p className="text-text-secondary mb-4">
          Pour un plan de souveraineté numérique à{' '}
          <strong className="text-text-primary">800 000 000 EUR</strong> :
        </p>
        <ul className="space-y-2 text-text-secondary">
          <li>
            <span className="text-text-muted">Coût par citoyen :</span>{' '}
            <span className="font-mono text-text-primary">
              800 000 000 / 68 373 433 ={' '}
              <strong className="text-chainsaw-red">11,70 EUR</strong>
            </span>
          </li>
          <li>
            <span className="text-text-muted">Coût par contribuable :</span>{' '}
            <span className="font-mono text-text-primary">
              800 000 000 / 18 600 000 ={' '}
              <strong className="text-chainsaw-red">43,01 EUR</strong>
            </span>
          </li>
          <li>
            <span className="text-text-muted">Coût par ménage :</span>{' '}
            <span className="font-mono text-text-primary">
              800 000 000 / 30 400 000 ={' '}
              <strong className="text-chainsaw-red">26,32 EUR</strong>
            </span>
          </li>
          <li>
            <span className="text-text-muted">
              Jours de travail équivalents :
            </span>{' '}
            <span className="font-mono text-text-primary">
              43,01 / 62,47 ={' '}
              <strong className="text-chainsaw-red">0,69 jour</strong>{' '}
              (~5,5 heures)
            </span>
          </li>
          <li>
            <span className="text-text-muted">Repas de cantine :</span>{' '}
            <span className="font-mono text-text-primary">
              11,70 / 3,50 ={' '}
              <strong className="text-chainsaw-red">3,34 repas</strong>
            </span>
          </li>
        </ul>
      </section>

      {/* Dernière mise à jour */}
      <LastUpdatedSection denominators={denominators} />

      {/* Navigation */}
      <div className="mt-12 flex gap-4">
        <Link
          href="/data-status"
          className="text-chainsaw-red hover:underline"
        >
          Statut des données
        </Link>
        <Link
          href="/feed/hot"
          className="inline-flex items-center gap-2 text-text-secondary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au fil
        </Link>
      </div>
    </main>
  );
}
