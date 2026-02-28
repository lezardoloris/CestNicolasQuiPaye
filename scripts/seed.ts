/**
 * Seed script: 50 dépenses publiques françaises inutiles
 * Usage: npx tsx scripts/seed.ts
 *
 * Idempotent: skips if already seeded (checks isSeeded flag).
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { submissions } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculateHotScore } from '../src/lib/utils/hot-score';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

interface SeedItem {
  title: string;
  description: string;
  amount: number; // EUR annuel
  sourceUrl: string;
  ministryTag: string;
}

const SEED_DATA: SeedItem[] = [
  {
    title: 'Sénat : 340 M\u20ac/an de budget de fonctionnement',
    description:
      'Le budget annuel du Sénat s\'élève à 340 millions d\'euros. Chaque sénateur représente un coût moyen d\'environ 1 million d\'euros par an, en incluant indemnités, collaborateurs et frais de fonctionnement.',
    amount: 340_000_000,
    sourceUrl: 'https://www.senat.fr/budget.html',
    ministryTag: 'Institutions',
  },
  {
    title: 'CESE : 40 M\u20ac/an pour un organe consultatif',
    description:
      'Le Conseil Économique, Social et Environnemental dispose d\'un budget annuel de 40 millions d\'euros, selon le Projet de Loi de Finances (Mission "Conseil et contrôle de l\'État"). Il produit des avis consultatifs non contraignants. Ses membres perçoivent 3 800 euros mensuels.',
    amount: 40_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general',
    ministryTag: 'Institutions',
  },
  {
    title: 'Audiovisuel public : 4 Mds\u20ac/an de financement',
    description:
      'Selon le Projet de Loi de Finances (Compte de concours financiers "Avances à l\'audiovisuel public"), le groupe France Télévisions et l\'audiovisuel public reçoivent plus de 4 milliards d\'euros de fonds publics annuels. L\'audience cumulée des chaînes publiques reste inférieure à celle du secteur privé.',
    amount: 4_000_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux',
    ministryTag: 'Culture',
  },
  {
    title: 'Aides à la presse : 1,8 Md\u20ac/an en aides directes et indirectes',
    description:
      'Selon la Cour des Comptes (rapport "Les aides de l\'État à la presse écrite"), l\'État verse 1,8 milliard d\'euros par an en aides à la presse, incluant subventions directes, tarifs postaux réduits et avantages fiscaux. Source irréfutable.',
    amount: 1_800_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-de-letat-a-la-presse-ecrite',
    ministryTag: 'Culture',
  },
  {
    title: 'Opérateurs de l\'État : 1 200 agences pour 80 Mds\u20ac/an',
    description:
      'Selon le rapport d\'information du Sénat sur les opérateurs de l\'État (2022), la France compte plus de 1 200 opérateurs (agences, établissements publics) représentant un budget cumulé de 80 milliards d\'euros par an. La Cour des comptes relève des doublons avec les administrations centrales.',
    amount: 80_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r21-800/r21-800.html',
    ministryTag: 'Institutions',
  },
  {
    title: 'Fraude au RSA : 3 à 5 Mds\u20ac/an selon la Cour des comptes',
    description:
      'Le RSA représente un budget de 15 milliards d\'euros par an. La Cour des comptes estime la fraude entre 3 et 5 milliards d\'euros annuels, liée à des déclarations inexactes ou des non-déclarations de revenus.',
    amount: 5_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/le-revenu-de-solidarite-active',
    ministryTag: 'Social',
  },
  {
    title: 'Fraude aux prestations sociales : 20 Mds\u20ac/an estimés',
    description:
      'La fraude aux prestations sociales est estimée entre 20 et 50 milliards d\'euros par an selon les rapports du Sénat et de la Cour des comptes. Les contrôles restent limités face à l\'ampleur du phénomène.',
    amount: 20_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r19-614/r19-614.html',
    ministryTag: 'Social',
  },
  {
    title: 'Aide Médicale d\'État : 1,2 Md\u20ac/an, en hausse de 10%/an',
    description:
      'Selon le rapport du Sénat sur le PLF (Mission Santé), l\'Aide Médicale d\'État (AME) représente un budget de 1,2 milliard d\'euros par an pour environ 400 000 bénéficiaires. Son coût augmente d\'environ 10% chaque année depuis 2015.',
    amount: 1_200_000_000,
    sourceUrl: 'https://www.senat.fr/rap/a23-131-5/a23-131-5.html',
    ministryTag: 'Social',
  },
  {
    title: 'Charge administrative des normes : 84 Mds\u20ac/an pour les entreprises',
    description:
      'Selon l\'OCDE et des rapports repris par le Sénat sur la simplification administrative, le coût de la réglementation et des obligations administratives est estimé à 84 milliards d\'euros par an pour les entreprises françaises. La France compte plus de 400 000 normes en vigueur.',
    amount: 84_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r23-033/r23-033.html',
    ministryTag: 'Institutions',
  },
  {
    title: 'Formation professionnelle : 32 Mds\u20ac/an, 30% de retour à l\'emploi',
    description:
      'Selon l\'annexe au PLF "Jaune budgétaire : Formation professionnelle", le système de formation professionnelle coûte 32 milliards d\'euros par an. Seulement 30% des stagiaires retrouvent un emploi à l\'issue de leur formation.',
    amount: 32_000_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/annexes-informatives',
    ministryTag: 'Travail',
  },
  {
    title: 'Aides au logement : 45 Mds\u20ac/an, crise persistante',
    description:
      'Selon le Compte du Logement (Ministère) et la Cour des Comptes, les aides au logement et le logement social représentent 45 milliards d\'euros par an de dépenses publiques. Malgré ces montants, la crise du logement persiste et les prix continuent d\'augmenter.',
    amount: 45_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-personnelles-au-logement',
    ministryTag: 'Social',
  },
  {
    title: 'Doublons départements-régions : 10 Mds\u20ac/an d\'économies possibles',
    description:
      'Selon le Sénat et la Cour des Comptes (rapports sur la décentralisation et les compétences partagées), les 101 départements coûtent 75 milliards d\'euros par an. La suppression des doublons avec les régions et intercommunalités économiserait au moins 10 milliards d\'euros.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023',
    ministryTag: 'Collectivit\u00e9s',
  },
  {
    title: 'Fragmentation communale : 35 000 communes, 10 Mds\u20ac/an de surcoût',
    description:
      'Selon la Cour des Comptes (rapport sur les finances publiques locales), la France compte 35 000 communes, plus que tous les autres pays de l\'UE réunis. Le coût de cette fragmentation est estimé à 10 milliards d\'euros par an en doublons administratifs.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023',
    ministryTag: 'Collectivit\u00e9s',
  },
  {
    title: 'Subventions aux associations : 50 Mds\u20ac/an',
    description:
      'Selon la Cour des Comptes, l\'État et les collectivités versent environ 50 milliards d\'euros par an aux associations. La Cour pointe un manque de contrôle sur l\'utilisation effective de ces fonds publics.',
    amount: 50_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-subventions-aux-associations',
    ministryTag: 'Institutions',
  },
  {
    title: 'Frais de fonctionnement des collectivités : 8 Mds\u20ac/an',
    description:
      'Selon la Cour des Comptes (rapport sur les finances locales) et l\'Observatoire des Finances et de la Gestion publique Locales (OFGL), les collectivités dépensent 8 milliards d\'euros par an en frais de personnel, véhicules de fonction, voyages et réceptions.',
    amount: 8_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023',
    ministryTag: 'Collectivit\u00e9s',
  },
  {
    title: 'Haute fonction publique : 3 Mds\u20ac/an en rémunérations et avantages',
    description:
      'Selon la Cour des Comptes (rapport sur la haute fonction publique), les hauts fonctionnaires issus des grands corps (ENA, Polytechnique, Mines) représentent un coût de 3 milliards d\'euros par an en salaires, primes et avantages divers.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-haute-fonction-publique',
    ministryTag: 'Institutions',
  },
  {
    title: 'Absentéisme fonction publique : 12 Mds\u20ac/an, 26 jours/an en moyenne',
    description:
      'Selon la Cour des Comptes (rapport sur la gestion des ressources humaines dans la fonction publique), l\'absentéisme représente un coût estimé à 12 milliards d\'euros par an. Le taux d\'absence moyen est de 26 jours par an, contre 14 jours dans le secteur privé.',
    amount: 12_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-gestion-des-ressources-humaines-dans-la-fonction-publique',
    ministryTag: 'Institutions',
  },
  {
    title: 'Doublons État-collectivités : 15 Mds\u20ac/an de dépenses redondantes',
    description:
      'Les doublons entre l\'État central et les collectivités territoriales représentent 15 milliards d\'euros de dépenses redondantes. Chaque compétence est exercée par 3 à 4 échelons administratifs différents.',
    amount: 15_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r19-048/r19-048.html',
    ministryTag: 'Institutions',
  },
  {
    title: 'Subventions agricoles : 20 Mds\u20ac/an, 80% pour 20% des exploitations',
    description:
      'Selon la Cour des Comptes (rapport sur les aides à l\'agriculture) et le PLF (Mission Agriculture), la France dépense 20 milliards d\'euros par an en subventions agricoles (PAC et aides nationales). 80% des aides sont concentrées sur 20% des exploitations.',
    amount: 20_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-a-lagriculture',
    ministryTag: 'Agriculture',
  },
  {
    title: 'Politique de la ville : 10 Mds\u20ac/an depuis 40 ans, indicateurs stables',
    description:
      'Les quartiers prioritaires reçoivent 10 milliards d\'euros par an depuis quatre décennies. Les indicateurs de pauvreté, de chômage et d\'insécurité dans ces zones n\'ont pas significativement évolué.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-politique-de-la-ville',
    ministryTag: 'Social',
  },
  {
    title: 'Crédit d\'impôt recherche : 7 Mds\u20ac/an, efficacité contestée',
    description:
      'Le Crédit d\'Impôt Recherche représente 7 milliards d\'euros par an. La Cour des comptes et le Sénat questionnent son efficacité, relevant que de nombreuses entreprises l\'utilisent sans accroître leur effort de R&D.',
    amount: 7_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/le-credit-dimpot-recherche',
    ministryTag: 'Recherche',
  },
  {
    title: 'Aides aux entreprises : 160 Mds\u20ac/an sans conditionnalité',
    description:
      'Selon France Stratégie (rapport sur les aides publiques aux entreprises), les aides aux entreprises totalisent 160 milliards d\'euros par an (exonérations, subventions, niches fiscales). Elles ne sont généralement pas conditionnées au maintien de l\'emploi ou à des objectifs mesurables.',
    amount: 160_000_000_000,
    sourceUrl: 'https://www.strategie.gouv.fr/publications/les-aides-publiques-aux-entreprises',
    ministryTag: 'Industrie',
  },
  {
    title: 'Gestion des déchets : 15 Mds\u20ac/an, taux de recyclage à 25%',
    description:
      'La gestion des déchets coûte 15 milliards d\'euros par an. Le taux de recyclage français stagne à 25%, contre 67% en Allemagne. L\'incinération et l\'enfouissement restent prédominants.',
    amount: 15_000_000_000,
    sourceUrl: 'https://www.ademe.fr/dechets',
    ministryTag: 'Environnement',
  },
  {
    title: 'Administration hospitalière : 10 Mds\u20ac/an, 35% du personnel',
    description:
      'Selon la Cour des Comptes (rapport "Les personnels des établissements publics de santé"), sur les 95 milliards d\'euros du budget hospitalier public, environ 10 milliards sont consacrés à l\'administration. Le personnel administratif représente 35% des effectifs, contre 25% en Allemagne.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-personnels-des-etablissements-publics-de-sante',
    ministryTag: 'Sant\u00e9',
  },
  {
    title: 'Retraites fonctionnaires : 40 Mds\u20ac/an de subvention d\'équilibre',
    description:
      'Selon le PLF (Compte d\'affectation spéciale "Pensions"), le régime de retraite des fonctionnaires nécessite 40 milliards d\'euros par an de subvention d\'équilibre. Le taux de remplacement atteint 75% du dernier salaire, contre environ 50% du salaire moyen dans le privé.',
    amount: 40_000_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux',
    ministryTag: 'Social',
  },
  {
    title: 'Régimes spéciaux de retraite : 8 Mds\u20ac/an de subventions',
    description:
      'Selon le PLF (Mission "Régimes sociaux et de retraite"), les régimes spéciaux (RATP, SNCF, EDF, Banque de France) coûtent 8 milliards d\'euros par an en subventions d\'équilibre. Les conditions de départ y sont plus avantageuses que le régime général.',
    amount: 8_000_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general',
    ministryTag: 'Social',
  },
  {
    title: 'Budget justice : 9 Mds\u20ac/an, délais moyens de 3 ans',
    description:
      'La justice française dispose d\'un budget de 9 milliards d\'euros par an. Les délais de traitement atteignent 3 ans en moyenne. La France se classe 23e sur 27 en Europe pour le budget justice par habitant.',
    amount: 9_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-justice',
    ministryTag: 'Institutions',
  },
  {
    title: 'Coût net de l\'immigration : 20 à 30 Mds\u20ac/an selon les estimations',
    description:
      'Le coût net de l\'immigration pour les finances publiques est estimé entre 20 et 30 milliards d\'euros par an par différentes sources (OCDE, rapports parlementaires), incluant santé, éducation et prestations sociales.',
    amount: 30_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r18-024/r18-024.html',
    ministryTag: 'Social',
  },
  {
    title: 'Fraude fiscale : 80 Mds\u20ac/an de manque à gagner',
    description:
      'La fraude fiscale représente un manque à gagner estimé à 80 milliards d\'euros par an pour l\'État. Seulement 10 milliards sont effectivement recouvrés. Les contrôles fiscaux ont diminué de 30% en dix ans.',
    amount: 80_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r22-490/r22-490.html',
    ministryTag: 'Institutions',
  },
  {
    title: 'Niches fiscales et sociales : 94 Mds\u20ac/an, moitié non évaluée',
    description:
      'Les dépenses fiscales et sociales représentent 94 milliards d\'euros par an. Selon la Cour des comptes, la moitié de ces niches n\'a jamais fait l\'objet d\'une évaluation d\'efficacité.',
    amount: 94_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-depenses-fiscales',
    ministryTag: 'Institutions',
  },
  {
    title: 'Projets informatiques de l\'État : 3 Mds\u20ac/an de dépassements',
    description:
      'Les grands projets informatiques de l\'État accusent en moyenne 3 milliards d\'euros de surcoûts et retards par an. La Cour des comptes cite les projets Louvois, Sirhen et ONP parmi les échecs notables.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-conduite-des-grands-projets-numeriques-de-letat',
    ministryTag: 'Num\u00e9rique',
  },
  {
    title: 'Programmes d\'armement : 5 Mds\u20ac/an de dépassements budgétaires',
    description:
      'Les programmes d\'armement français dépassent leur budget initial de 5 milliards d\'euros par an en moyenne, selon la Cour des comptes. Les projets Rafale, A400M et Barracuda sont documentés comme hors budget.',
    amount: 5_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-programmation-militaire',
    ministryTag: 'D\u00e9fense',
  },
  {
    title: 'Aide publique au développement : 15 Mds\u20ac/an, résultats peu mesurés',
    description:
      'La France consacre 15 milliards d\'euros par an à l\'aide au développement. La Cour des comptes relève que l\'efficacité de ces dépenses est rarement évaluée de manière rigoureuse.',
    amount: 15_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/laide-publique-au-developpement',
    ministryTag: 'Institutions',
  },
  {
    title: 'Double siège du Parlement européen : 114 M\u20ac/an',
    description:
      'Le déplacement mensuel du Parlement européen entre Strasbourg et Bruxelles coûte 114 millions d\'euros par an, selon les estimations officielles du Parlement européen lui-même.',
    amount: 114_000_000,
    sourceUrl: 'https://www.europarl.europa.eu/news/fr/headlines/eu-affairs/20140203STO34645',
    ministryTag: 'Institutions',
  },
  {
    title: 'France Info (TV, radio, web) : 120 M\u20ac/an de budget',
    description:
      'Selon le PLF (Compte "Avances à l\'audiovisuel public"), le pôle France Info (télévision, radio et numérique) dispose d\'un budget de 120 millions d\'euros par an. Son audience reste limitée face aux chaînes d\'information privées.',
    amount: 120_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux',
    ministryTag: 'Culture',
  },
  {
    title: 'Budget de la Ville de Paris : 10 Mds\u20ac/an, dette de 8 Mds\u20ac',
    description:
      'La Ville de Paris gère un budget de 10 milliards d\'euros par an. Sa dette a atteint 8 milliards d\'euros. La Chambre régionale des comptes a relevé des coûts élevés d\'aménagement et de personnel.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.paris.fr/budget',
    ministryTag: 'Collectivit\u00e9s',
  },
  {
    title: 'Comités consultatifs : 800 commissions, 500 M\u20ac/an',
    description:
      'Selon le PLF (annexe "Jaune budgétaire" : Liste des commissions et instances consultatives), la France compte environ 800 commissions et comités consultatifs pour un coût de 500 millions d\'euros par an. Nombre d\'entre eux ne se réunissent que rarement.',
    amount: 500_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/annexes-informatives',
    ministryTag: 'Institutions',
  },
  {
    title: 'Bouclier tarifaire EDF : 10 Mds\u20ac de compensation en 2023',
    description:
      'Le bouclier tarifaire sur l\'électricité a coûté 10 milliards d\'euros au contribuable en 2023. EDF, dont la dette atteint 64 milliards d\'euros, vend l\'électricité en dessous de son coût de production.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/edf',
    ministryTag: '\u00c9nergie',
  },
  {
    title: 'Subventions SNCF : 3 Mds\u20ac/an d\'exploitation',
    description:
      'L\'État verse 3 milliards d\'euros par an à la SNCF en subventions d\'exploitation, hors investissements d\'infrastructure. Le taux d\'occupation des TER reste faible dans de nombreuses régions.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-sncf',
    ministryTag: 'Transport',
  },
  {
    title: 'Réseau routier national : 1 Md\u20ac/an de sous-investissement',
    description:
      'L\'État consacre 700 millions d\'euros par an à l\'entretien de 12 000 km de routes nationales, alors que le besoin est estimé à 1,7 milliard d\'euros. 20% des ponts sont classés en mauvais état structural.',
    amount: 1_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r22-332/r22-332.html',
    ministryTag: 'Transport',
  },
  {
    title: 'Plan France Très Haut Débit : 3 Mds\u20ac, 5 ans de retard',
    description:
      'Le plan France Très Haut Débit représente 3 milliards d\'euros d\'investissement public. Il accuse 5 ans de retard sur ses objectifs initiaux, selon le rapport de la Cour des comptes.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/le-plan-france-tres-haut-debit',
    ministryTag: 'Num\u00e9rique',
  },
  {
    title: 'Contrats aidés : 6 Mds\u20ac/an, 70% sans emploi durable',
    description:
      'Selon la Cour des Comptes et la DARES (Ministère du Travail), les contrats aidés coûtent 6 milliards d\'euros par an. Les évaluations officielles montrent que 70% des bénéficiaires se retrouvent sans emploi à l\'issue de leur contrat.',
    amount: 6_000_000_000,
    sourceUrl: 'https://dares.travail-emploi.gouv.fr/publications/les-contrats-aides',
    ministryTag: 'Travail',
  },
  {
    title: 'Charge de la dette : 52 Mds\u20ac/an d\'intérêts',
    description:
      'La charge annuelle de la dette publique atteint 52 milliards d\'euros, soit le 2e poste budgétaire de l\'État. Cela représente environ 1 430 euros par habitant uniquement pour le paiement des intérêts.',
    amount: 52_000_000_000,
    sourceUrl: 'https://www.aft.gouv.fr/fr/charges-dette',
    ministryTag: 'Institutions',
  },
  {
    title: 'Parc automobile de l\'État : 300 000 véhicules, 3 Mds\u20ac/an',
    description:
      'L\'État et ses opérateurs possèdent 300 000 véhicules pour un coût annuel de 3 milliards d\'euros. La Cour des comptes relève une sous-utilisation significative de ce parc.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-gestion-du-parc-automobile-de-letat',
    ministryTag: 'Institutions',
  },
  {
    title: 'Immobilier de l\'État : 10 Mds\u20ac/an de gestion, 30% sous-occupé',
    description:
      'L\'État possède 191 000 bâtiments d\'une valeur de 30 milliards d\'euros. Le coût de gestion annuel est de 10 milliards d\'euros. 30% du parc est vacant ou sous-occupé selon la Cour des comptes.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-gestion-immobiliere-de-letat',
    ministryTag: 'Institutions',
  },
  {
    title: 'Éducation nationale : 60 Mds\u20ac/an, recul au classement PISA',
    description:
      'Selon le PLF (Mission "Enseignement scolaire"), l\'Éducation nationale dispose d\'un budget de 60 milliards d\'euros par an. La France est passée du 15e au 26e rang du classement PISA (OCDE) en mathématiques entre 2003 et 2022.',
    amount: 60_000_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general',
    ministryTag: '\u00c9ducation',
  },
  {
    title: 'Réseau diplomatique : 3 Mds\u20ac/an, 200 ambassades',
    description:
      'Le réseau diplomatique français, 3e mondial par sa taille, coûte 3 milliards d\'euros par an pour 200 ambassades et représentations. Son dimensionnement fait l\'objet de questionnements réguliers.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/le-reseau-diplomatique',
    ministryTag: 'Institutions',
  },
  {
    title: 'Forces de sécurité : 25 Mds\u20ac/an, 40% du temps en tâches administratives',
    description:
      'Police et gendarmerie représentent un budget de 25 milliards d\'euros par an. Les agents consacrent environ 40% de leur temps à des tâches administratives selon les rapports internes.',
    amount: 25_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-forces-de-securite',
    ministryTag: 'Institutions',
  },
  {
    title: 'France Travail : 6 Mds\u20ac/an de fonctionnement',
    description:
      'Selon la Cour des Comptes (rapport sur la gestion de Pôle Emploi), France Travail (ex-Pôle Emploi) dispose d\'un budget de fonctionnement de 6 milliards d\'euros par an. Le coût moyen par placement est estimé à 10 000 euros.',
    amount: 6_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/pole-emploi',
    ministryTag: 'Travail',
  },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200);
}

async function main() {
  const forceReseed = process.argv.includes('--reseed');

  console.log('Checking for existing seeded data...');

  const existing = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(eq(submissions.isSeeded, 1))
    .limit(1);

  if (existing.length > 0) {
    if (!forceReseed) {
      console.log('Database already seeded. Use --reseed to replace. Skipping.');
      await sql.end();
      return;
    }
    console.log('Removing old seeded data...');
    await db.delete(submissions).where(eq(submissions.isSeeded, 1));
    console.log('Old seeded data removed.');
  }

  console.log(`Seeding ${SEED_DATA.length} submissions...`);

  const now = new Date();
  const values = SEED_DATA.map((item, index) => {
    // Stagger creation times so hot scores vary (older items get lower scores)
    // Spread across ~12 months so the timeline chart shows a meaningful curve
    const monthsBack = Math.floor((index / SEED_DATA.length) * 12);
    const dayOffset = index % 28; // vary days within each month
    const createdAt = new Date(now.getFullYear(), now.getMonth() - monthsBack, Math.max(1, now.getDate() - dayOffset), 10 + (index % 12));
    const hotScore = calculateHotScore(0, 0, createdAt);

    return {
      authorDisplay: 'Nicolas Paye',
      title: item.title,
      slug: generateSlug(item.title),
      description: item.description,
      sourceUrl: item.sourceUrl,
      amount: String(item.amount),
      ministryTag: item.ministryTag,
      costPerTaxpayer: String(Math.round((item.amount / 18_600_000) * 100) / 100),
      status: 'published' as const,
      moderationStatus: 'approved' as const,
      hotScore: String(hotScore),
      isSeeded: 1,
      createdAt,
    };
  });

  await db.insert(submissions).values(values);

  console.log(`Successfully seeded ${SEED_DATA.length} submissions.`);
  await sql.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
