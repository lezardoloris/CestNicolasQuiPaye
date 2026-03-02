export function BudgetSourcesSection() {
  return (
    <div className="rounded-lg border border-border-default bg-surface-secondary/50 p-4 text-xs text-text-muted">
      <p className="font-medium text-text-secondary">Sources et méthodologie</p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        <li>
          Budget de l&apos;État :{' '}
          <a
            href="https://www.budget.gouv.fr/reperes/loi_de_finances/articles/chiffres-cles-budget-etat-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            budget.gouv.fr — Chiffres-clés Loi de Finances 2026
          </a>
        </li>
        <li>
          Dépenses publiques par fonction :{' '}
          <a
            href="https://www.insee.fr/fr/statistiques/8735252"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            INSEE Première n&deg;2093 (COFOG 2024)
          </a>
        </li>
        <li>
          Dette publique :{' '}
          <a
            href="https://www.insee.fr/fr/statistiques/8686951"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            INSEE — T3 2025
          </a>
          {', '}
          <a
            href="https://www.ccomptes.fr/fr/publications/la-situation-des-finances-publiques-debut-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            Cour des comptes
          </a>
        </li>
        <li>
          Émissions dette :{' '}
          <a
            href="https://www.ifrap.org/budget-et-fiscalite/2026-annee-record-pour-les-emissions-de-dette-de-la-france"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            IFRAP — 2026 année record
          </a>
        </li>
        <li>
          Rapport budgétaire :{' '}
          <a
            href="https://www.senat.fr/rap/l25-139-1/l25-139-16.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            Sénat — PLF 2026
          </a>
        </li>
        <li>
          Impôt sur le revenu :{' '}
          <a
            href="https://www.impots.gouv.fr/dgfip-statistiques-limpot-sur-le-revenu-2024-ete-plus-dynamique-que-les-revenus"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            DGFiP Statistiques n&deg;41 (nov. 2025)
          </a>
          {', '}
          <a
            href="https://www.ifrap.org/budget-et-fiscalite/75-de-limpot-sur-le-revenu-paye-par-10-des-menages"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            IFRAP — 75% de l&apos;IR payé par 10% des ménages
          </a>
        </li>
        <li>
          Rémunérations :{' '}
          <a
            href="https://www.senat.fr/connaitre-le-senat/role-et-fonctionnement/lindemnite-parlementaire.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            Sénat — Indemnité parlementaire
          </a>
          {', '}
          <a
            href="https://www.ifrap.org/etat-et-collectivites/agences-de-letat-des-points-de-chute-mieux-payes-pour-hauts-fonctionnaires"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            IFRAP — Agences de l&apos;État
          </a>
        </li>
        <li>
          Protection sociale et santé :{' '}
          <a
            href="https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/panoramas-de-la-drees/251217-protection-sociale-france-europe-2024"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            DREES — Protection sociale 2024
          </a>
          {', '}
          <a
            href="https://www.ccomptes.fr/fr/publications/securite-sociale-2025"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            Cour des comptes — Sécu 2025
          </a>
        </li>
        <li>
          Associations :{' '}
          <a
            href="https://www.ifrap.org/budget-et-fiscalite/plus-de-23-milliards-de-subventions-publiques-aux-associations-par-et-quasi-pas-de-controle"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            IFRAP — 23 Md&euro; de subventions
          </a>
        </li>
        <li>
          Opérateurs de l&apos;État :{' '}
          <a
            href="https://www.fipeco.fr/fiche/Les-d%C3%A9penses-des-op%C3%A9rateurs-de-lEtat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            FIPECO — Dépenses des opérateurs
          </a>
          {', '}
          <a
            href="https://www.ifrap.org/etat-et-collectivites/quand-la-transparence-sur-les-107-milliards-des-operateurs-et-agences-de-letat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            IFRAP — 107 Md&euro; des opérateurs
          </a>
        </li>
        <li>
          Comparaison européenne :{' '}
          <a
            href="https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1/default/table"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline"
          >
            Eurostat — Government finance statistics (2024)
          </a>
        </li>
      </ul>
      <p className="mt-3">
        Projections dette : extrapolation linéaire à déficit constant avec effet boule de neige
        des intérêts (taux moyen 3,5%). Ces projections sont indicatives et ne constituent
        pas une prévision officielle. Population : 68,4 M (INSEE 2025).
      </p>
    </div>
  );
}
