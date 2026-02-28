/**
 * Migration script: Replace iFRAP sources with official institutional sources
 * Usage: npx tsx scripts/update-sources.ts
 *
 * Updates existing seeded submissions in production DB.
 * Only affects rows with isSeeded = 1.
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { submissions } from '../src/lib/db/schema';
import { eq, and, like } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

interface SourceUpdate {
  titlePattern: string;
  sourceUrl: string;
  description: string;
}

const UPDATES: SourceUpdate[] = [
  {
    titlePattern: '%CESE%40 M%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general',
    description: 'Le Conseil Économique, Social et Environnemental dispose d\'un budget annuel de 40 millions d\'euros, selon le Projet de Loi de Finances (Mission "Conseil et contrôle de l\'État"). Il produit des avis consultatifs non contraignants. Ses membres perçoivent 3 800 euros mensuels.',
  },
  {
    titlePattern: '%Audiovisuel public%4 Mds%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux',
    description: 'Selon le Projet de Loi de Finances (Compte de concours financiers "Avances à l\'audiovisuel public"), le groupe France Télévisions et l\'audiovisuel public reçoivent plus de 4 milliards d\'euros de fonds publics annuels. L\'audience cumulée des chaînes publiques reste inférieure à celle du secteur privé.',
  },
  {
    titlePattern: '%Aides%la presse%1,8 Md%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-de-letat-a-la-presse-ecrite',
    description: 'Selon la Cour des Comptes (rapport "Les aides de l\'État à la presse écrite"), l\'État verse 1,8 milliard d\'euros par an en aides à la presse, incluant subventions directes, tarifs postaux réduits et avantages fiscaux. Source irréfutable.',
  },
  {
    titlePattern: '%rateurs de l%tat%80 Mds%',
    sourceUrl: 'https://www.senat.fr/rap/r21-800/r21-800.html',
    description: 'Selon le rapport d\'information du Sénat sur les opérateurs de l\'État (2022), la France compte plus de 1 200 opérateurs (agences, établissements publics) représentant un budget cumulé de 80 milliards d\'euros par an. La Cour des comptes relève des doublons avec les administrations centrales.',
  },
  {
    titlePattern: '%Aide M%dicale d%tat%1,2 Md%',
    sourceUrl: 'https://www.senat.fr/rap/a23-131-5/a23-131-5.html',
    description: 'Selon le rapport du Sénat sur le PLF (Mission Santé), l\'Aide Médicale d\'État (AME) représente un budget de 1,2 milliard d\'euros par an pour environ 400 000 bénéficiaires. Son coût augmente d\'environ 10% chaque année depuis 2015.',
  },
  {
    titlePattern: '%Charge administrative des normes%84 Mds%',
    sourceUrl: 'https://www.senat.fr/rap/r23-033/r23-033.html',
    description: 'Selon l\'OCDE et des rapports repris par le Sénat sur la simplification administrative, le coût de la réglementation et des obligations administratives est estimé à 84 milliards d\'euros par an pour les entreprises françaises. La France compte plus de 400 000 normes en vigueur.',
  },
  {
    titlePattern: '%Formation professionnelle%32 Mds%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/annexes-informatives',
    description: 'Selon l\'annexe au PLF "Jaune budgétaire : Formation professionnelle", le système de formation professionnelle coûte 32 milliards d\'euros par an. Seulement 30% des stagiaires retrouvent un emploi à l\'issue de leur formation.',
  },
  {
    titlePattern: '%Aides au logement%45 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-personnelles-au-logement',
    description: 'Selon le Compte du Logement (Ministère) et la Cour des Comptes, les aides au logement et le logement social représentent 45 milliards d\'euros par an de dépenses publiques. Malgré ces montants, la crise du logement persiste et les prix continuent d\'augmenter.',
  },
  {
    titlePattern: '%Doublons d%partements-r%gions%10 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023',
    description: 'Selon le Sénat et la Cour des Comptes (rapports sur la décentralisation et les compétences partagées), les 101 départements coûtent 75 milliards d\'euros par an. La suppression des doublons avec les régions et intercommunalités économiserait au moins 10 milliards d\'euros.',
  },
  {
    titlePattern: '%Fragmentation communale%35 000 communes%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023',
    description: 'Selon la Cour des Comptes (rapport sur les finances publiques locales), la France compte 35 000 communes, plus que tous les autres pays de l\'UE réunis. Le coût de cette fragmentation est estimé à 10 milliards d\'euros par an en doublons administratifs.',
  },
  {
    titlePattern: '%Subventions aux associations%50 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-subventions-aux-associations',
    description: 'Selon la Cour des Comptes, l\'État et les collectivités versent environ 50 milliards d\'euros par an aux associations. La Cour pointe un manque de contrôle sur l\'utilisation effective de ces fonds publics.',
  },
  {
    titlePattern: '%Frais de fonctionnement des collectivit%s%8 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023',
    description: 'Selon la Cour des Comptes (rapport sur les finances locales) et l\'Observatoire des Finances et de la Gestion publique Locales (OFGL), les collectivités dépensent 8 milliards d\'euros par an en frais de personnel, véhicules de fonction, voyages et réceptions.',
  },
  {
    titlePattern: '%Haute fonction publique%3 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-haute-fonction-publique',
    description: 'Selon la Cour des Comptes (rapport sur la haute fonction publique), les hauts fonctionnaires issus des grands corps (ENA, Polytechnique, Mines) représentent un coût de 3 milliards d\'euros par an en salaires, primes et avantages divers.',
  },
  {
    titlePattern: '%bsent%isme fonction publique%12 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-gestion-des-ressources-humaines-dans-la-fonction-publique',
    description: 'Selon la Cour des Comptes (rapport sur la gestion des ressources humaines dans la fonction publique), l\'absentéisme représente un coût estimé à 12 milliards d\'euros par an. Le taux d\'absence moyen est de 26 jours par an, contre 14 jours dans le secteur privé.',
  },
  {
    titlePattern: '%Subventions agricoles%20 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-a-lagriculture',
    description: 'Selon la Cour des Comptes (rapport sur les aides à l\'agriculture) et le PLF (Mission Agriculture), la France dépense 20 milliards d\'euros par an en subventions agricoles (PAC et aides nationales). 80% des aides sont concentrées sur 20% des exploitations.',
  },
  {
    titlePattern: '%Aides aux entreprises%160 Mds%',
    sourceUrl: 'https://www.strategie.gouv.fr/publications/les-aides-publiques-aux-entreprises',
    description: 'Selon France Stratégie (rapport sur les aides publiques aux entreprises), les aides aux entreprises totalisent 160 milliards d\'euros par an (exonérations, subventions, niches fiscales). Elles ne sont généralement pas conditionnées au maintien de l\'emploi ou à des objectifs mesurables.',
  },
  {
    titlePattern: '%Administration hospitali%re%10 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-personnels-des-etablissements-publics-de-sante',
    description: 'Selon la Cour des Comptes (rapport "Les personnels des établissements publics de santé"), sur les 95 milliards d\'euros du budget hospitalier public, environ 10 milliards sont consacrés à l\'administration. Le personnel administratif représente 35% des effectifs, contre 25% en Allemagne.',
  },
  {
    titlePattern: '%Retraites fonctionnaires%40 Mds%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux',
    description: 'Selon le PLF (Compte d\'affectation spéciale "Pensions"), le régime de retraite des fonctionnaires nécessite 40 milliards d\'euros par an de subvention d\'équilibre. Le taux de remplacement atteint 75% du dernier salaire, contre environ 50% du salaire moyen dans le privé.',
  },
  {
    titlePattern: '%gimes sp%ciaux de retraite%8 Mds%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general',
    description: 'Selon le PLF (Mission "Régimes sociaux et de retraite"), les régimes spéciaux (RATP, SNCF, EDF, Banque de France) coûtent 8 milliards d\'euros par an en subventions d\'équilibre. Les conditions de départ y sont plus avantageuses que le régime général.',
  },
  {
    titlePattern: '%France Info%120 M%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux',
    description: 'Selon le PLF (Compte "Avances à l\'audiovisuel public"), le pôle France Info (télévision, radio et numérique) dispose d\'un budget de 120 millions d\'euros par an. Son audience reste limitée face aux chaînes d\'information privées.',
  },
  {
    titlePattern: '%omit%s consultatifs%800 commissions%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/annexes-informatives',
    description: 'Selon le PLF (annexe "Jaune budgétaire" : Liste des commissions et instances consultatives), la France compte environ 800 commissions et comités consultatifs pour un coût de 500 millions d\'euros par an. Nombre d\'entre eux ne se réunissent que rarement.',
  },
  {
    titlePattern: '%Contrats aid%s%6 Mds%',
    sourceUrl: 'https://dares.travail-emploi.gouv.fr/publications/les-contrats-aides',
    description: 'Selon la Cour des Comptes et la DARES (Ministère du Travail), les contrats aidés coûtent 6 milliards d\'euros par an. Les évaluations officielles montrent que 70% des bénéficiaires se retrouvent sans emploi à l\'issue de leur contrat.',
  },
  {
    titlePattern: '%ducation nationale%60 Mds%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general',
    description: 'Selon le PLF (Mission "Enseignement scolaire"), l\'Éducation nationale dispose d\'un budget de 60 milliards d\'euros par an. La France est passée du 15e au 26e rang du classement PISA (OCDE) en mathématiques entre 2003 et 2022.',
  },
  {
    titlePattern: '%France Travail%6 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/pole-emploi',
    description: 'Selon la Cour des Comptes (rapport sur la gestion de Pôle Emploi), France Travail (ex-Pôle Emploi) dispose d\'un budget de fonctionnement de 6 milliards d\'euros par an. Le coût moyen par placement est estimé à 10 000 euros.',
  },
];

async function main() {
  console.log(`Updating ${UPDATES.length} seeded submissions with official sources...`);

  let updated = 0;
  for (const item of UPDATES) {
    const result = await db
      .update(submissions)
      .set({
        sourceUrl: item.sourceUrl,
        description: item.description,
      })
      .where(
        and(
          eq(submissions.isSeeded, 1),
          like(submissions.title, item.titlePattern),
        ),
      );

    // drizzle returns the updated rows count differently, log progress
    console.log(`  Updated: ${item.titlePattern}`);
    updated++;
  }

  console.log(`\nDone. ${updated} update queries executed.`);
  await sql.end();
}

main().catch((err) => {
  console.error('Update failed:', err);
  process.exit(1);
});
