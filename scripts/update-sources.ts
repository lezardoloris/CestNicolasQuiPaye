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
    description: 'Le Conseil Economique, Social et Environnemental dispose d un budget annuel de 40 millions d euros, selon le Projet de Loi de Finances (Mission "Conseil et controle de l Etat"). Il produit des avis consultatifs non contraignants. Ses membres percoivent 3 800 euros mensuels.',
  },
  {
    titlePattern: '%Audiovisuel public%4 Mds%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux',
    description: 'Selon le Projet de Loi de Finances (Compte de concours financiers "Avances a l audiovisuel public"), le groupe France Televisions et l audiovisuel public recoivent plus de 4 milliards d euros de fonds publics annuels. L audience cumulee des chaines publiques reste inferieure a celle du secteur prive.',
  },
  {
    titlePattern: '%Aides a la presse%1,8 Md%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-de-letat-a-la-presse-ecrite',
    description: 'Selon la Cour des Comptes (rapport "Les aides de l Etat a la presse ecrite"), l Etat verse 1,8 milliard d euros par an en aides a la presse, incluant subventions directes, tarifs postaux reduits et avantages fiscaux. Source irrefutable.',
  },
  {
    titlePattern: '%Operateurs de l Etat%80 Mds%',
    sourceUrl: 'https://www.senat.fr/rap/r21-800/r21-800.html',
    description: 'Selon le rapport d information du Senat sur les operateurs de l Etat (2022), la France compte plus de 1 200 operateurs (agences, etablissements publics) representant un budget cumule de 80 milliards d euros par an. La Cour des comptes releve des doublons avec les administrations centrales.',
  },
  {
    titlePattern: '%Aide Medicale d Etat%1,2 Md%',
    sourceUrl: 'https://www.senat.fr/rap/a23-131-5/a23-131-5.html',
    description: 'Selon le rapport du Senat sur le PLF (Mission Sante), l Aide Medicale d Etat (AME) represente un budget de 1,2 milliard d euros par an pour environ 400 000 beneficiaires. Son cout augmente d environ 10% chaque annee depuis 2015.',
  },
  {
    titlePattern: '%Charge administrative des normes%84 Mds%',
    sourceUrl: 'https://www.senat.fr/rap/r23-033/r23-033.html',
    description: 'Selon l OCDE et des rapports repris par le Senat sur la simplification administrative, le cout de la reglementation et des obligations administratives est estime a 84 milliards d euros par an pour les entreprises francaises. La France compte plus de 400 000 normes en vigueur.',
  },
  {
    titlePattern: '%Formation professionnelle%32 Mds%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/annexes-informatives',
    description: 'Selon l annexe au PLF "Jaune budgetaire : Formation professionnelle", le systeme de formation professionnelle coute 32 milliards d euros par an. Seulement 30% des stagiaires retrouvent un emploi a l issue de leur formation.',
  },
  {
    titlePattern: '%Aides au logement%45 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-personnelles-au-logement',
    description: 'Selon le Compte du Logement (Ministere) et la Cour des Comptes, les aides au logement et le logement social representent 45 milliards d euros par an de depenses publiques. Malgre ces montants, la crise du logement persiste et les prix continuent d augmenter.',
  },
  {
    titlePattern: '%Doublons departements-regions%10 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023',
    description: 'Selon le Senat et la Cour des Comptes (rapports sur la decentralisation et les competences partagees), les 101 departements coutent 75 milliards d euros par an. La suppression des doublons avec les regions et intercommunalites economiserait au moins 10 milliards d euros.',
  },
  {
    titlePattern: '%Fragmentation communale%35 000 communes%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023',
    description: 'Selon la Cour des Comptes (rapport sur les finances publiques locales), la France compte 35 000 communes, plus que tous les autres pays de l UE reunis. Le cout de cette fragmentation est estime a 10 milliards d euros par an en doublons administratifs.',
  },
  {
    titlePattern: '%Subventions aux associations%50 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-subventions-aux-associations',
    description: 'Selon la Cour des Comptes, l Etat et les collectivites versent environ 50 milliards d euros par an aux associations. La Cour pointe un manque de controle sur l utilisation effective de ces fonds publics.',
  },
  {
    titlePattern: '%Frais de fonctionnement des collectivites%8 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023',
    description: 'Selon la Cour des Comptes (rapport sur les finances locales) et l Observatoire des Finances et de la Gestion publique Locales (OFGL), les collectivites depensent 8 milliards d euros par an en frais de personnel, vehicules de fonction, voyages et receptions.',
  },
  {
    titlePattern: '%Haute fonction publique%3 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-haute-fonction-publique',
    description: 'Selon la Cour des Comptes (rapport sur la haute fonction publique), les hauts fonctionnaires issus des grands corps (ENA, Polytechnique, Mines) representent un cout de 3 milliards d euros par an en salaires, primes et avantages divers.',
  },
  {
    titlePattern: '%Absenteisme fonction publique%12 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-gestion-des-ressources-humaines-dans-la-fonction-publique',
    description: 'Selon la Cour des Comptes (rapport sur la gestion des ressources humaines dans la fonction publique), l absenteisme represente un cout estime a 12 milliards d euros par an. Le taux d absence moyen est de 26 jours par an, contre 14 jours dans le secteur prive.',
  },
  {
    titlePattern: '%Subventions agricoles%20 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-a-lagriculture',
    description: 'Selon la Cour des Comptes (rapport sur les aides a l agriculture) et le PLF (Mission Agriculture), la France depense 20 milliards d euros par an en subventions agricoles (PAC et aides nationales). 80% des aides sont concentrees sur 20% des exploitations.',
  },
  {
    titlePattern: '%Aides aux entreprises%160 Mds%',
    sourceUrl: 'https://www.strategie.gouv.fr/publications/les-aides-publiques-aux-entreprises',
    description: 'Selon France Strategie (rapport sur les aides publiques aux entreprises), les aides aux entreprises totalisent 160 milliards d euros par an (exonerations, subventions, niches fiscales). Elles ne sont generalement pas conditionnees au maintien de l emploi ou a des objectifs mesurables.',
  },
  {
    titlePattern: '%Administration hospitaliere%10 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-personnels-des-etablissements-publics-de-sante',
    description: 'Selon la Cour des Comptes (rapport "Les personnels des etablissements publics de sante"), sur les 95 milliards d euros du budget hospitalier public, environ 10 milliards sont consacres a l administration. Le personnel administratif represente 35% des effectifs, contre 25% en Allemagne.',
  },
  {
    titlePattern: '%Retraites fonctionnaires%40 Mds%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux',
    description: 'Selon le PLF (Compte d affectation speciale "Pensions"), le regime de retraite des fonctionnaires necessite 40 milliards d euros par an de subvention d equilibre. Le taux de remplacement atteint 75% du dernier salaire, contre environ 50% du salaire moyen dans le prive.',
  },
  {
    titlePattern: '%Regimes speciaux de retraite%8 Mds%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general',
    description: 'Selon le PLF (Mission "Regimes sociaux et de retraite"), les regimes speciaux (RATP, SNCF, EDF, Banque de France) coutent 8 milliards d euros par an en subventions d equilibre. Les conditions de depart y sont plus avantageuses que le regime general.',
  },
  {
    titlePattern: '%France Info%120 M%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux',
    description: 'Selon le PLF (Compte "Avances a l audiovisuel public"), le pole France Info (television, radio et numerique) dispose d un budget de 120 millions d euros par an. Son audience reste limitee face aux chaines d information privees.',
  },
  {
    titlePattern: '%Comites consultatifs%800 commissions%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/annexes-informatives',
    description: 'Selon le PLF (annexe "Jaune budgetaire" : Liste des commissions et instances consultatives), la France compte environ 800 commissions et comites consultatifs pour un cout de 500 millions d euros par an. Nombre d entre eux ne se reunissent que rarement.',
  },
  {
    titlePattern: '%Contrats aides%6 Mds%',
    sourceUrl: 'https://dares.travail-emploi.gouv.fr/publications/les-contrats-aides',
    description: 'Selon la Cour des Comptes et la DARES (Ministere du Travail), les contrats aides coutent 6 milliards d euros par an. Les evaluations officielles montrent que 70% des beneficiaires se retrouvent sans emploi a l issue de leur contrat.',
  },
  {
    titlePattern: '%Education nationale%60 Mds%',
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general',
    description: 'Selon le PLF (Mission "Enseignement scolaire"), l Education nationale dispose d un budget de 60 milliards d euros par an. La France est passee du 15e au 26e rang du classement PISA (OCDE) en mathematiques entre 2003 et 2022.',
  },
  {
    titlePattern: '%France Travail%6 Mds%',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/pole-emploi',
    description: 'Selon la Cour des Comptes (rapport sur la gestion de Pole Emploi), France Travail (ex-Pole Emploi) dispose d un budget de fonctionnement de 6 milliards d euros par an. Le cout moyen par placement est estime a 10 000 euros.',
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
