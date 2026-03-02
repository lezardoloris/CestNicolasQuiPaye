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

  // ──────────────────────────────────────────────────────
  // Signalements issus du rapport Gemini — sources doubles
  // ──────────────────────────────────────────────────────

  // === INSTITUTIONS ===
  {
    title: 'Budget de fonctionnement du CESE : 34,4 M\u20ac/an d\'auto-saisines',
    description:
      'Le CESE est vivement critiqué pour son manque d\'utilité publique : 79 % de ses rapports sont des auto-saisines pour justifier son existence. La Cour des comptes a également pointé le non-respect du temps de travail légal des agents.',
    amount: 34_400_000,
    sourceUrl: 'https://www.ccomptes.fr/sites/default/files/2025-07/20250711-S2025-0776-Conseil-economique-social-et-environnemental.pdf',
    ministryTag: 'Institutions',
  },
  {
    title: 'Coût de fonctionnement cumulé des CESER : 55 M\u20ac/an',
    description:
      'Les Conseils économiques, sociaux et environnementaux régionaux (CESER) coûtent entre 50 et 60 M\u20ac annuellement. Leur suppression, couplée à celle du CESE national, générerait jusqu\'à 95 M\u20ac d\'économies.',
    amount: 55_000_000,
    sourceUrl: 'https://www.ifrap.org/fonction-publique-et-administration/le-cese-sur-la-sellette',
    ministryTag: 'Institutions',
  },
  {
    title: 'Maintien des 317 Comités « Théodule » : 30 M\u20ac/an',
    description:
      'Instances consultatives redondantes (ex : Commission d\'enrichissement de la langue française en doublon avec l\'Académie). Leur coût stagne malgré les annonces politiques successives de suppression.',
    amount: 30_000_000,
    sourceUrl: 'https://www.ifrap.org/etat-et-collectivites/agnes-verdier-molinie-parmi-les-agences-de-letat-les-doublons-et-les-instances-inutiles-ont-la-peau-dure',
    ministryTag: 'Institutions',
  },
  {
    title: 'Maintien des 243 taxes à faible rendement : 307 M\u20ac/an de coût net',
    description:
      'La persistance de ces micro-taxes engendre des coûts de collecte et une complexité bureaucratique largement supérieurs aux bénéfices des recettes générées, pénalisant l\'administration et les entreprises.',
    amount: 307_000_000,
    sourceUrl: 'https://www.ccomptes.fr/sites/default/files/2025-04/20250417-Taxes-a-faible-rendement_0.pdf',
    ministryTag: 'Institutions',
  },

  // === SANTÉ ===
  {
    title: 'Surcoût institutionnel des Agences de Santé : 4 Mds\u20ac/an',
    description:
      'Coût annuel massif dû à l\'empilement d\'agences (Anses, ANSM, HAS, SPF, ARS) créant un doublon flagrant de compétences avec la CNAM (72 200 agents) et le Ministère.',
    amount: 4_000_000_000,
    sourceUrl: 'https://www.senat.fr/fileadmin/Illustrations/Controle/Structures_temporaires/2024-2025/CE-Agences_Etat/TOME_I_-_Rapport_CE_Agences.pdf',
    ministryTag: 'Sant\u00e9',
  },
  {
    title: 'Fraude non recouvrée à l\'Assurance Maladie : 4,15 Mds\u20ac/an',
    description:
      'La fraude aux prestations (majoritairement le fait de professionnels de santé et d\'arrêts de travail) est estimée entre 3,8 et 4,5 Md\u20ac. Seuls 467 M\u20ac sont détectés et stoppés.',
    amount: 4_150_000_000,
    sourceUrl: 'https://www.ccomptes.fr/sites/default/files/2024-05/20240529-RALFSS-2024.pdf',
    ministryTag: 'Sant\u00e9',
  },
  {
    title: 'Hypertrophie administrative des ARS : 800 M\u20ac/an',
    description:
      'L\'existence de 8 000 agents dans les Agences Régionales de Santé en parallèle des structures territoriales de la Sécurité Sociale alourdit les coûts de pilotage de l\'hôpital public.',
    amount: 800_000_000,
    sourceUrl: 'https://www.assemblee-nationale.fr/dyn/opendata/PRJLANR5L15B3360.html',
    ministryTag: 'Sant\u00e9',
  },

  // === SOCIAL ===
  {
    title: 'Fraudes avérées aux prestations de la branche Famille : 1 Md\u20ac/an',
    description:
      'Malgré 32 millions de contrôles ayant identifié 49 000 cas en 2024, les détournements restent massifs en raison de la complexité des critères d\'éligibilité au RSA et aux primes.',
    amount: 1_000_000_000,
    sourceUrl: 'https://www.ifrap.org/budget-et-fiscalite/fraudes-dans-la-branche-famille-des-resultats-2024-en-demi-teinte',
    ministryTag: 'Social',
  },
  {
    title: 'Gaspillages dans la sous-traitance de l\'Aide Sociale à l\'Enfance : 500 M\u20ac/an',
    description:
      'Les départements allouent des budgets colossaux à l\'ASE, mais l\'absence de contrôle sur les prestataires privés (hôtels sociaux, associations) entraîne une déperdition majeure de fonds publics.',
    amount: 500_000_000,
    sourceUrl: 'https://contribuablesassocies.org/categories/actualites/gaspillages-publics/',
    ministryTag: 'Social',
  },

  // === NUMÉRIQUE ===
  {
    title: 'Surcoûts et dérive calendaire du projet SI-SAMU : 218 M\u20ac',
    description:
      'Lancé en 2014, le projet de modernisation des centres de régulation du 15 dérive sur un calendrier de 15,3 ans, rendant la technologie obsolète avant son déploiement.',
    amount: 218_000_000,
    sourceUrl: 'https://www.cio-online.com/actualites/lire-les-45-plus-grands-projets-it-de-l-etat-pesent-3-3-mdeteuro-16500.html',
    ministryTag: 'Num\u00e9rique',
  },
  {
    title: 'Risques budgétaires sur le Réseau Radio du Futur (RRF) : 900 M\u20ac',
    description:
      'Projet massif du ministère de l\'Intérieur, pointé pour sa complexité tentaculaire et l\'évitement prolongé des audits préalables de la DINUM. 8 ans de développement prévu.',
    amount: 900_000_000,
    sourceUrl: 'https://www.cio-online.com/actualites/lire-les-45-plus-grands-projets-it-de-l-etat-pesent-3-3-mdeteuro-16500.html',
    ministryTag: 'Num\u00e9rique',
  },
  {
    title: 'Dérapage du projet de Facturation Électronique (AIFE) : 259 M\u20ac',
    description:
      'Augmentation imprévue de 28 M\u20ac en six mois. Durée prévue de 8 ans avec de multiples reports d\'application, perturbant la visibilité des entreprises assujetties.',
    amount: 259_000_000,
    sourceUrl: 'https://www.cio-online.com/actualites/lire-les-45-plus-grands-projets-it-de-l-etat-pesent-3-3-mdeteuro-16500.html',
    ministryTag: 'Num\u00e9rique',
  },
  {
    title: 'Abandon définitif du logiciel Scribe : 13,3 M\u20ac perdus',
    description:
      'Logiciel de procédure pénale pour la Police nationale, soumis à l\'expertise de la DINUM avec quatre ans de retard. Abandonné en 2021, perte totale des fonds engagés.',
    amount: 13_300_000,
    sourceUrl: 'https://www.ccomptes.fr/system/files/2020-10/20201014-58-2-conduite-grands-projets-numeriques-Etat.pdf',
    ministryTag: 'Num\u00e9rique',
  },

  // === TRANSPORT ===
  {
    title: 'Subventions aux 70 aéroports régionaux déficitaires : 140 M\u20ac/an',
    description:
      'Maintien artificiel d\'aéroports locaux (moins d\'1 M de passagers) au nom de l\'aménagement du territoire. Ces structures absorbent des fonds massifs sans perspective de rentabilité.',
    amount: 140_000_000,
    sourceUrl: 'https://www.apna-asso.com/les-dossiers/70-aeroports-regionaux-tres-defeicitaires-le-cas-daurillac',
    ministryTag: 'Transport',
  },
  {
    title: 'Déficit d\'exploitation de la liaison aérienne Aurillac-Paris : 5 M\u20ac/an',
    description:
      'Ligne massivement subventionnée au titre de l\'OSP. La subvention atteint 200 à 300 \u20ac d\'argent public par passager, contredisant toute logique économique et environnementale.',
    amount: 5_000_000,
    sourceUrl: 'https://www.apna-asso.com/les-dossiers/70-aeroports-regionaux-tres-defeicitaires-le-cas-daurillac',
    ministryTag: 'Transport',
  },

  // === AMÉNAGEMENT ===
  {
    title: 'Doublons administratifs territoriaux (Cerema, ANCT, Ademe) : 600 M\u20ac/an',
    description:
      'La non-fusion de ces trois agences d\'ingénierie territoriale (2 400 + 360 + 1 197 agents) maintient un surcoût structurel. L\'Ademe fait notamment doublon avec les 7 800 agents des DREAL.',
    amount: 600_000_000,
    sourceUrl: 'https://www.ifrap.org/etat-et-collectivites/agnes-verdier-molinie-parmi-les-agences-de-letat-les-doublons-et-les-instances-inutiles-ont-la-peau-dure',
    ministryTag: 'Am\u00e9nagement',
  },
  {
    title: 'Surcoûts et lignes inutiles du Grand Paris Express : 3 Mds\u20ac de dérive',
    description:
      'Les Lignes 17 Nord et 18 Ouest sont dénoncées comme des gaspillages détruisant des terres agricoles, basés sur des prévisions de trafic surévaluées. Qualifié d\'« éléphant blanc ».',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.colos.info/actualites/8-grand-paris',
    ministryTag: 'Am\u00e9nagement',
  },

  // === DÉFENSE ===
  {
    title: 'Arriérés de paiement de l\'État à Naval Group : 836 M\u20ac',
    description:
      'L\'État retarde ses paiements contractuels massifs. L\'industriel naval doit autofinancer la production, ce qui génère des surcoûts sur le prix des sous-marins et frégates.',
    amount: 836_000_000,
    sourceUrl: 'https://www.assemblee-nationale.fr/dyn/17/rapports/cion_def/l17b2048-tv_rapport-avis.pdf',
    ministryTag: 'D\u00e9fense',
  },
  {
    title: 'Reports de charges impayés à l\'OCCAr : 380 M\u20ac',
    description:
      'Défaut de paiement de la France à l\'organisme européen de coopération en matière d\'armement. Une pratique qui mine la confiance des partenaires de défense.',
    amount: 380_000_000,
    sourceUrl: 'https://www.assemblee-nationale.fr/dyn/17/rapports/cion_def/l17b2048-tv_rapport-avis.pdf',
    ministryTag: 'D\u00e9fense',
  },
  {
    title: 'Surcoûts explosifs du MCO dus aux retards industriels : 1,879 Md\u20ac',
    description:
      'Les retards de livraison de nouveaux équipements (SLAM-F, Patrouilleurs) obligent à réparer des matériels obsolètes. Les crédits d\'entretien bondissent de 105 % (dépense subie).',
    amount: 1_879_000_000,
    sourceUrl: 'https://www.assemblee-nationale.fr/dyn/17/rapports/cion_def/l17b2048-tv_rapport-avis.pdf',
    ministryTag: 'D\u00e9fense',
  },

  // === AGRICULTURE ===
  {
    title: 'Subventions agricoles défavorables à l\'environnement : 3,8 Mds\u20ac/an',
    description:
      'Dépenses (exonérations sur les carburants fossiles et aides PAC couplées à l\'élevage) contredisant directement les objectifs climatiques de l\'État. 7 % des 53,6 Mds\u20ac du système alimentaire.',
    amount: 3_800_000_000,
    sourceUrl: 'https://www.i4ce.org/wp-content/uploads/2024/09/Les-financements-publics-du-systeme-alimentaire-francais.pdf',
    ministryTag: 'Agriculture',
  },
  {
    title: 'Budget de l\'Agence Bio en doublon : 15 M\u20ac/an',
    description:
      'Agence ciblée par une recommandation de suppression par le Sénat. Ses prérogatives font doublon avec celles de l\'administration centrale et des Chambres d\'agriculture.',
    amount: 15_000_000,
    sourceUrl: 'https://www.senat.fr/fileadmin/Illustrations/Controle/Structures_temporaires/2024-2025/CE-Agences_Etat/TOME_I_-_Rapport_CE_Agences.pdf',
    ministryTag: 'Agriculture',
  },

  // === RECHERCHE ===
  {
    title: 'Inefficience du Crédit Impôt Recherche (CIR) : 7 Mds\u20ac/an d\'effet d\'aubaine',
    description:
      'Dépense fiscale majeure accusée d\'effets d\'aubaine. Dépourvu de conditionnalité, de grands groupes captent l\'aide tout en supprimant des emplois scientifiques en France.',
    amount: 7_000_000_000,
    sourceUrl: 'https://www.ofce.sciences-po.fr/blog2024/fr/2025/20250115_ES/',
    ministryTag: 'Recherche',
  },

  // === ENVIRONNEMENT ===
  {
    title: 'Budget de communication de l\'Ademe : 150 M\u20ac/an contestés',
    description:
      'Dépense vivement contestée au Parlement pour financer des campagnes publicitaires jugées inefficaces. Le Parlement réclame la réinternalisation de ces missions.',
    amount: 150_000_000,
    sourceUrl: 'https://www.assemblee-nationale.fr/17/cr-dvp/25-26/c2526011.asp',
    ministryTag: 'Environnement',
  },

  // === CULTURE ===
  {
    title: 'Dotation surdimensionnée de France Télévisions : 2,568 Mds\u20ac/an',
    description:
      'Dépense critiquée par le Sénat en raison de la lenteur du processus de fusion avec Radio France et des refus de mutualisation des rédactions et fonctions supports.',
    amount: 2_568_000_000,
    sourceUrl: 'https://www.senat.fr/rap/a23-133-41/a23-133-41_mono.html',
    ministryTag: 'Culture',
  },
  {
    title: 'Subvention inutile au dispositif Pass Culture : 210 M\u20ac/an',
    description:
      'Effet d\'aubaine : l\'aide finance massivement la consommation de biens grand public (mangas, jeux vidéo) chez les grands distributeurs plutôt que la découverte artistique. Suppression recommandée par le Sénat.',
    amount: 210_000_000,
    sourceUrl: 'https://www.senat.fr/fileadmin/Illustrations/Controle/Structures_temporaires/2024-2025/CE-Agences_Etat/TOME_I_-_Rapport_CE_Agences.pdf',
    ministryTag: 'Culture',
  },

  // === TRAVAIL ===
  {
    title: 'Fraudes et siphonnage du Compte Personnel de Formation (CPF) : 500 M\u20ac/an',
    description:
      'Sur les 2 Md\u20ac annuels du CPF, des sommes colossales ont été détournées (49 000 fraudes identifiées) par des sociétés écrans en raison d\'une sécurisation défaillante au lancement.',
    amount: 500_000_000,
    sourceUrl: 'https://www.caissedesdepots.fr/sites/cdc.fr/files/2025-11/Mon%20Compte%20Formation%20_%20la%20Caisse%20des%20D%C3%A9p%C3%B4ts%20publie%20le%20rapport%20annuel%20de%20gestion%202024.pdf',
    ministryTag: 'Travail',
  },

  // === ÉDUCATION ===
  {
    title: 'Généralisation aveugle du Service National Universel (SNU) : 200 M\u20ac/an',
    description:
      'L\'État tente de généraliser ce service sans disposer de suivi budgétaire exhaustif des coûts complets par jeune. La Cour des comptes exige une remise à plat de ce projet.',
    amount: 200_000_000,
    sourceUrl: 'https://www.ccomptes.fr/sites/default/files/2024-09/20240913-SNU.pdf',
    ministryTag: '\u00c9ducation',
  },

  // === COLLECTIVITÉS ===
  {
    title: 'Dérapage du déficit de fonctionnement des collectivités (APUL) : 16,7 Mds\u20ac',
    description:
      'Les collectivités locales refusent d\'appliquer l\'objectif de baisse de 0,5 % de leurs dépenses fixé par la LPFP, creusant dangereusement le besoin de financement de la Nation.',
    amount: 16_700_000_000,
    sourceUrl: 'https://www.agence-france-locale.fr/actualite/decryptage-face-a-des-comptes-publics-sous-pression-en-2024-quelle-contribution-des-collectivites-locales-a-laccroissement-du-deficit-et-de-la-dette/',
    ministryTag: 'Collectivit\u00e9s',
  },
  {
    title: 'Saupoudrage des subventions associatives de Paris : 1,8 Md\u20ac sur le mandat',
    description:
      'Volume cumulé des subventions distribuées par l\'exécutif parisien à des associations. Dépense décriée pour son manque de contrôle de performance et ses fins clientélistes.',
    amount: 1_800_000_000,
    sourceUrl: 'https://contribuablesassocies.org/categories/actualites/gaspillages-publics/',
    ministryTag: 'Collectivit\u00e9s',
  },
  {
    title: 'Dépenses d\'autopromotion des exécutifs locaux : 1 Md\u20ac/an',
    description:
      'Coût évalué des magazines municipaux et campagnes marketing. L\'Observatoire de l\'Éthique Publique dénonce l\'utilisation des deniers publics pour la promotion politique pré-électorale.',
    amount: 1_000_000_000,
    sourceUrl: 'https://www.observatoireethiquepublique.com/nos-propositions/notes/mieux-encadrer-les-depenses-de-communication-des-collectivites-territoriales.html',
    ministryTag: 'Collectivit\u00e9s',
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
      authorDisplay: 'Nicolas Paie',
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
