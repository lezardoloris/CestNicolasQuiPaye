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
    title: 'Senat : 340 M\u20ac/an de budget de fonctionnement',
    description:
      'Le budget annuel du Senat s eleve a 340 millions d euros. Chaque senateur represente un cout moyen d environ 1 million d euros par an, en incluant indemnites, collaborateurs et frais de fonctionnement.',
    amount: 340_000_000,
    sourceUrl: 'https://www.senat.fr/budget.html',
    ministryTag: 'Institutions',
  },
  {
    title: 'CESE : 40 M\u20ac/an pour un organe consultatif',
    description:
      'Le Conseil Economique, Social et Environnemental dispose d un budget annuel de 40 millions d euros, selon le Projet de Loi de Finances (Mission "Conseil et controle de l Etat"). Il produit des avis consultatifs non contraignants. Ses membres percoivent 3 800 euros mensuels.',
    amount: 40_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general',
    ministryTag: 'Institutions',
  },
  {
    title: 'Audiovisuel public : 4 Mds\u20ac/an de financement',
    description:
      'Selon le Projet de Loi de Finances (Compte de concours financiers "Avances a l audiovisuel public"), le groupe France Televisions et l audiovisuel public recoivent plus de 4 milliards d euros de fonds publics annuels. L audience cumulee des chaines publiques reste inferieure a celle du secteur prive.',
    amount: 4_000_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux',
    ministryTag: 'Culture',
  },
  {
    title: 'Aides a la presse : 1,8 Md\u20ac/an en aides directes et indirectes',
    description:
      'Selon la Cour des Comptes (rapport "Les aides de l Etat a la presse ecrite"), l Etat verse 1,8 milliard d euros par an en aides a la presse, incluant subventions directes, tarifs postaux reduits et avantages fiscaux. Source irrefutable.',
    amount: 1_800_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-de-letat-a-la-presse-ecrite',
    ministryTag: 'Culture',
  },
  {
    title: 'Operateurs de l Etat : 1 200 agences pour 80 Mds\u20ac/an',
    description:
      'Selon le rapport d information du Senat sur les operateurs de l Etat (2022), la France compte plus de 1 200 operateurs (agences, etablissements publics) representant un budget cumule de 80 milliards d euros par an. La Cour des comptes releve des doublons avec les administrations centrales.',
    amount: 80_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r21-800/r21-800.html',
    ministryTag: 'Institutions',
  },
  {
    title: 'Fraude au RSA : 3 a 5 Mds\u20ac/an selon la Cour des comptes',
    description:
      'Le RSA represente un budget de 15 milliards d euros par an. La Cour des comptes estime la fraude entre 3 et 5 milliards d euros annuels, liee a des declarations inexactes ou des non-declarations de revenus.',
    amount: 5_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/le-revenu-de-solidarite-active',
    ministryTag: 'Social',
  },
  {
    title: 'Fraude aux prestations sociales : 20 Mds\u20ac/an estimes',
    description:
      'La fraude aux prestations sociales est estimee entre 20 et 50 milliards d euros par an selon les rapports du Senat et de la Cour des comptes. Les controles restent limites face a l ampleur du phenomene.',
    amount: 20_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r19-614/r19-614.html',
    ministryTag: 'Social',
  },
  {
    title: 'Aide Medicale d Etat : 1,2 Md\u20ac/an, en hausse de 10%/an',
    description:
      'Selon le rapport du Senat sur le PLF (Mission Sante), l Aide Medicale d Etat (AME) represente un budget de 1,2 milliard d euros par an pour environ 400 000 beneficiaires. Son cout augmente d environ 10% chaque annee depuis 2015.',
    amount: 1_200_000_000,
    sourceUrl: 'https://www.senat.fr/rap/a23-131-5/a23-131-5.html',
    ministryTag: 'Social',
  },
  {
    title: 'Charge administrative des normes : 84 Mds\u20ac/an pour les entreprises',
    description:
      'Selon l OCDE et des rapports repris par le Senat sur la simplification administrative, le cout de la reglementation et des obligations administratives est estime a 84 milliards d euros par an pour les entreprises francaises. La France compte plus de 400 000 normes en vigueur.',
    amount: 84_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r23-033/r23-033.html',
    ministryTag: 'Institutions',
  },
  {
    title: 'Formation professionnelle : 32 Mds\u20ac/an, 30% de retour a l emploi',
    description:
      'Selon l annexe au PLF "Jaune budgetaire : Formation professionnelle", le systeme de formation professionnelle coute 32 milliards d euros par an. Seulement 30% des stagiaires retrouvent un emploi a l issue de leur formation.',
    amount: 32_000_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/annexes-informatives',
    ministryTag: 'Travail',
  },
  {
    title: 'Aides au logement : 45 Mds\u20ac/an, crise persistante',
    description:
      'Selon le Compte du Logement (Ministere) et la Cour des Comptes, les aides au logement et le logement social representent 45 milliards d euros par an de depenses publiques. Malgre ces montants, la crise du logement persiste et les prix continuent d augmenter.',
    amount: 45_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-personnelles-au-logement',
    ministryTag: 'Social',
  },
  {
    title: 'Doublons departements-regions : 10 Mds\u20ac/an d economies possibles',
    description:
      'Selon le Senat et la Cour des Comptes (rapports sur la decentralisation et les competences partagees), les 101 departements coutent 75 milliards d euros par an. La suppression des doublons avec les regions et intercommunalites economiserait au moins 10 milliards d euros.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023',
    ministryTag: 'Collectivit\u00e9s',
  },
  {
    title: 'Fragmentation communale : 35 000 communes, 10 Mds\u20ac/an de surcout',
    description:
      'Selon la Cour des Comptes (rapport sur les finances publiques locales), la France compte 35 000 communes, plus que tous les autres pays de l UE reunis. Le cout de cette fragmentation est estime a 10 milliards d euros par an en doublons administratifs.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023',
    ministryTag: 'Collectivit\u00e9s',
  },
  {
    title: 'Subventions aux associations : 50 Mds\u20ac/an',
    description:
      'Selon la Cour des Comptes, l Etat et les collectivites versent environ 50 milliards d euros par an aux associations. La Cour pointe un manque de controle sur l utilisation effective de ces fonds publics.',
    amount: 50_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-subventions-aux-associations',
    ministryTag: 'Institutions',
  },
  {
    title: 'Frais de fonctionnement des collectivites : 8 Mds\u20ac/an',
    description:
      'Selon la Cour des Comptes (rapport sur les finances locales) et l Observatoire des Finances et de la Gestion publique Locales (OFGL), les collectivites depensent 8 milliards d euros par an en frais de personnel, vehicules de fonction, voyages et receptions.',
    amount: 8_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023',
    ministryTag: 'Collectivit\u00e9s',
  },
  {
    title: 'Haute fonction publique : 3 Mds\u20ac/an en remunerations et avantages',
    description:
      'Selon la Cour des Comptes (rapport sur la haute fonction publique), les hauts fonctionnaires issus des grands corps (ENA, Polytechnique, Mines) representent un cout de 3 milliards d euros par an en salaires, primes et avantages divers.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-haute-fonction-publique',
    ministryTag: 'Institutions',
  },
  {
    title: 'Absenteisme fonction publique : 12 Mds\u20ac/an, 26 jours/an en moyenne',
    description:
      'Selon la Cour des Comptes (rapport sur la gestion des ressources humaines dans la fonction publique), l absenteisme represente un cout estime a 12 milliards d euros par an. Le taux d absence moyen est de 26 jours par an, contre 14 jours dans le secteur prive.',
    amount: 12_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-gestion-des-ressources-humaines-dans-la-fonction-publique',
    ministryTag: 'Institutions',
  },
  {
    title: 'Doublons Etat-collectivites : 15 Mds\u20ac/an de depenses redondantes',
    description:
      'Les doublons entre l Etat central et les collectivites territoriales representent 15 milliards d euros de depenses redondantes. Chaque competence est exercee par 3 a 4 echelons administratifs differents.',
    amount: 15_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r19-048/r19-048.html',
    ministryTag: 'Institutions',
  },
  {
    title: 'Subventions agricoles : 20 Mds\u20ac/an, 80% pour 20% des exploitations',
    description:
      'Selon la Cour des Comptes (rapport sur les aides a l agriculture) et le PLF (Mission Agriculture), la France depense 20 milliards d euros par an en subventions agricoles (PAC et aides nationales). 80% des aides sont concentrees sur 20% des exploitations.',
    amount: 20_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-a-lagriculture',
    ministryTag: 'Agriculture',
  },
  {
    title: 'Politique de la ville : 10 Mds\u20ac/an depuis 40 ans, indicateurs stables',
    description:
      'Les quartiers prioritaires recoivent 10 milliards d euros par an depuis quatre decennies. Les indicateurs de pauvrete, de chomage et d insecurite dans ces zones n ont pas significativement evolue.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-politique-de-la-ville',
    ministryTag: 'Social',
  },
  {
    title: 'Credit d impot recherche : 7 Mds\u20ac/an, efficacite contestee',
    description:
      'Le Credit d Impot Recherche represente 7 milliards d euros par an. La Cour des comptes et le Senat questionnent son efficacite, relevant que de nombreuses entreprises l utilisent sans accroitre leur effort de R&D.',
    amount: 7_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/le-credit-dimpot-recherche',
    ministryTag: 'Recherche',
  },
  {
    title: 'Aides aux entreprises : 160 Mds\u20ac/an sans conditionnalite',
    description:
      'Selon France Strategie (rapport sur les aides publiques aux entreprises), les aides aux entreprises totalisent 160 milliards d euros par an (exonerations, subventions, niches fiscales). Elles ne sont generalement pas conditionnees au maintien de l emploi ou a des objectifs mesurables.',
    amount: 160_000_000_000,
    sourceUrl: 'https://www.strategie.gouv.fr/publications/les-aides-publiques-aux-entreprises',
    ministryTag: 'Industrie',
  },
  {
    title: 'Gestion des dechets : 15 Mds\u20ac/an, taux de recyclage a 25%',
    description:
      'La gestion des dechets coute 15 milliards d euros par an. Le taux de recyclage francais stagne a 25%, contre 67% en Allemagne. L incineration et l enfouissement restent predominants.',
    amount: 15_000_000_000,
    sourceUrl: 'https://www.ademe.fr/dechets',
    ministryTag: 'Environnement',
  },
  {
    title: 'Administration hospitaliere : 10 Mds\u20ac/an, 35% du personnel',
    description:
      'Selon la Cour des Comptes (rapport "Les personnels des etablissements publics de sante"), sur les 95 milliards d euros du budget hospitalier public, environ 10 milliards sont consacres a l administration. Le personnel administratif represente 35% des effectifs, contre 25% en Allemagne.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-personnels-des-etablissements-publics-de-sante',
    ministryTag: 'Sant\u00e9',
  },
  {
    title: 'Retraites fonctionnaires : 40 Mds\u20ac/an de subvention d equilibre',
    description:
      'Selon le PLF (Compte d affectation speciale "Pensions"), le regime de retraite des fonctionnaires necessite 40 milliards d euros par an de subvention d equilibre. Le taux de remplacement atteint 75% du dernier salaire, contre environ 50% du salaire moyen dans le prive.',
    amount: 40_000_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux',
    ministryTag: 'Social',
  },
  {
    title: 'Regimes speciaux de retraite : 8 Mds\u20ac/an de subventions',
    description:
      'Selon le PLF (Mission "Regimes sociaux et de retraite"), les regimes speciaux (RATP, SNCF, EDF, Banque de France) coutent 8 milliards d euros par an en subventions d equilibre. Les conditions de depart y sont plus avantageuses que le regime general.',
    amount: 8_000_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general',
    ministryTag: 'Social',
  },
  {
    title: 'Budget justice : 9 Mds\u20ac/an, delais moyens de 3 ans',
    description:
      'La justice francaise dispose d un budget de 9 milliards d euros par an. Les delais de traitement atteignent 3 ans en moyenne. La France se classe 23e sur 27 en Europe pour le budget justice par habitant.',
    amount: 9_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-justice',
    ministryTag: 'Institutions',
  },
  {
    title: 'Cout net de l immigration : 20 a 30 Mds\u20ac/an selon les estimations',
    description:
      'Le cout net de l immigration pour les finances publiques est estime entre 20 et 30 milliards d euros par an par differentes sources (OCDE, rapports parlementaires), incluant sante, education et prestations sociales.',
    amount: 30_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r18-024/r18-024.html',
    ministryTag: 'Social',
  },
  {
    title: 'Fraude fiscale : 80 Mds\u20ac/an de manque a gagner',
    description:
      'La fraude fiscale represente un manque a gagner estime a 80 milliards d euros par an pour l Etat. Seulement 10 milliards sont effectivement recouvres. Les controles fiscaux ont diminue de 30% en dix ans.',
    amount: 80_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r22-490/r22-490.html',
    ministryTag: 'Institutions',
  },
  {
    title: 'Niches fiscales et sociales : 94 Mds\u20ac/an, moitie non evaluee',
    description:
      'Les depenses fiscales et sociales representent 94 milliards d euros par an. Selon la Cour des comptes, la moitie de ces niches n a jamais fait l objet d une evaluation d efficacite.',
    amount: 94_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-depenses-fiscales',
    ministryTag: 'Institutions',
  },
  {
    title: 'Projets informatiques de l Etat : 3 Mds\u20ac/an de depassements',
    description:
      'Les grands projets informatiques de l Etat accusent en moyenne 3 milliards d euros de surcouts et retards par an. La Cour des comptes cite les projets Louvois, Sirhen et ONP parmi les echecs notables.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-conduite-des-grands-projets-numeriques-de-letat',
    ministryTag: 'Num\u00e9rique',
  },
  {
    title: 'Programmes d armement : 5 Mds\u20ac/an de depassements budgetaires',
    description:
      'Les programmes d armement francais depassent leur budget initial de 5 milliards d euros par an en moyenne, selon la Cour des comptes. Les projets Rafale, A400M et Barracuda sont documentes comme hors budget.',
    amount: 5_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-programmation-militaire',
    ministryTag: 'D\u00e9fense',
  },
  {
    title: 'Aide publique au developpement : 15 Mds\u20ac/an, resultats peu mesures',
    description:
      'La France consacre 15 milliards d euros par an a l aide au developpement. La Cour des comptes releve que l efficacite de ces depenses est rarement evaluee de maniere rigoureuse.',
    amount: 15_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/laide-publique-au-developpement',
    ministryTag: 'Institutions',
  },
  {
    title: 'Double siege du Parlement europeen : 114 M\u20ac/an',
    description:
      'Le deplacement mensuel du Parlement europeen entre Strasbourg et Bruxelles coute 114 millions d euros par an, selon les estimations officielles du Parlement europeen lui-meme.',
    amount: 114_000_000,
    sourceUrl: 'https://www.europarl.europa.eu/news/fr/headlines/eu-affairs/20140203STO34645',
    ministryTag: 'Institutions',
  },
  {
    title: 'France Info (TV, radio, web) : 120 M\u20ac/an de budget',
    description:
      'Selon le PLF (Compte "Avances a l audiovisuel public"), le pole France Info (television, radio et numerique) dispose d un budget de 120 millions d euros par an. Son audience reste limitee face aux chaines d information privees.',
    amount: 120_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux',
    ministryTag: 'Culture',
  },
  {
    title: 'Budget de la Ville de Paris : 10 Mds\u20ac/an, dette de 8 Mds\u20ac',
    description:
      'La Ville de Paris gere un budget de 10 milliards d euros par an. Sa dette a atteint 8 milliards d euros. La Chambre regionale des comptes a releve des couts eleves d amenagement et de personnel.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.paris.fr/budget',
    ministryTag: 'Collectivit\u00e9s',
  },
  {
    title: 'Comites consultatifs : 800 commissions, 500 M\u20ac/an',
    description:
      'Selon le PLF (annexe "Jaune budgetaire" : Liste des commissions et instances consultatives), la France compte environ 800 commissions et comites consultatifs pour un cout de 500 millions d euros par an. Nombre d entre eux ne se reunissent que rarement.',
    amount: 500_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/annexes-informatives',
    ministryTag: 'Institutions',
  },
  {
    title: 'Bouclier tarifaire EDF : 10 Mds\u20ac de compensation en 2023',
    description:
      'Le bouclier tarifaire sur l electricite a coute 10 milliards d euros au contribuable en 2023. EDF, dont la dette atteint 64 milliards d euros, vend l electricite en dessous de son cout de production.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/edf',
    ministryTag: '\u00c9nergie',
  },
  {
    title: 'Subventions SNCF : 3 Mds\u20ac/an d exploitation',
    description:
      'L Etat verse 3 milliards d euros par an a la SNCF en subventions d exploitation, hors investissements d infrastructure. Le taux d occupation des TER reste faible dans de nombreuses regions.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-sncf',
    ministryTag: 'Transport',
  },
  {
    title: 'Reseau routier national : 1 Md\u20ac/an de sous-investissement',
    description:
      'L Etat consacre 700 millions d euros par an a l entretien de 12 000 km de routes nationales, alors que le besoin est estime a 1,7 milliard d euros. 20% des ponts sont classes en mauvais etat structural.',
    amount: 1_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r22-332/r22-332.html',
    ministryTag: 'Transport',
  },
  {
    title: 'Plan France Tres Haut Debit : 3 Mds\u20ac, 5 ans de retard',
    description:
      'Le plan France Tres Haut Debit represente 3 milliards d euros d investissement public. Il accuse 5 ans de retard sur ses objectifs initiaux, selon le rapport de la Cour des comptes.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/le-plan-france-tres-haut-debit',
    ministryTag: 'Num\u00e9rique',
  },
  {
    title: 'Contrats aides : 6 Mds\u20ac/an, 70% sans emploi durable',
    description:
      'Selon la Cour des Comptes et la DARES (Ministere du Travail), les contrats aides coutent 6 milliards d euros par an. Les evaluations officielles montrent que 70% des beneficiaires se retrouvent sans emploi a l issue de leur contrat.',
    amount: 6_000_000_000,
    sourceUrl: 'https://dares.travail-emploi.gouv.fr/publications/les-contrats-aides',
    ministryTag: 'Travail',
  },
  {
    title: 'Charge de la dette : 52 Mds\u20ac/an d interets',
    description:
      'La charge annuelle de la dette publique atteint 52 milliards d euros, soit le 2e poste budgetaire de l Etat. Cela represente environ 1 430 euros par habitant uniquement pour le paiement des interets.',
    amount: 52_000_000_000,
    sourceUrl: 'https://www.aft.gouv.fr/fr/charges-dette',
    ministryTag: 'Institutions',
  },
  {
    title: 'Parc automobile de l Etat : 300 000 vehicules, 3 Mds\u20ac/an',
    description:
      'L Etat et ses operateurs possedent 300 000 vehicules pour un cout annuel de 3 milliards d euros. La Cour des comptes releve une sous-utilisation significative de ce parc.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-gestion-du-parc-automobile-de-letat',
    ministryTag: 'Institutions',
  },
  {
    title: 'Immobilier de l Etat : 10 Mds\u20ac/an de gestion, 30% sous-occupe',
    description:
      'L Etat possede 191 000 batiments d une valeur de 30 milliards d euros. Le cout de gestion annuel est de 10 milliards d euros. 30% du parc est vacant ou sous-occupe selon la Cour des comptes.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-gestion-immobiliere-de-letat',
    ministryTag: 'Institutions',
  },
  {
    title: 'Education nationale : 60 Mds\u20ac/an, recul au classement PISA',
    description:
      'Selon le PLF (Mission "Enseignement scolaire"), l Education nationale dispose d un budget de 60 milliards d euros par an. La France est passee du 15e au 26e rang du classement PISA (OCDE) en mathematiques entre 2003 et 2022.',
    amount: 60_000_000_000,
    sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general',
    ministryTag: '\u00c9ducation',
  },
  {
    title: 'Reseau diplomatique : 3 Mds\u20ac/an, 200 ambassades',
    description:
      'Le reseau diplomatique francais, 3e mondial par sa taille, coute 3 milliards d euros par an pour 200 ambassades et representations. Son dimensionnement fait l objet de questionnements reguliers.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/le-reseau-diplomatique',
    ministryTag: 'Institutions',
  },
  {
    title: 'Forces de securite : 25 Mds\u20ac/an, 40% du temps en taches administratives',
    description:
      'Police et gendarmerie representent un budget de 25 milliards d euros par an. Les agents consacrent environ 40% de leur temps a des taches administratives selon les rapports internes.',
    amount: 25_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-forces-de-securite',
    ministryTag: 'Institutions',
  },
  {
    title: 'France Travail : 6 Mds\u20ac/an de fonctionnement',
    description:
      'Selon la Cour des Comptes (rapport sur la gestion de Pole Emploi), France Travail (ex-Pole Emploi) dispose d un budget de fonctionnement de 6 milliards d euros par an. Le cout moyen par placement est estime a 10 000 euros.',
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
  console.log('Checking for existing seeded data...');

  const existing = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(eq(submissions.isSeeded, 1))
    .limit(1);

  if (existing.length > 0) {
    console.log('Database already seeded. Skipping.');
    await sql.end();
    return;
  }

  console.log(`Seeding ${SEED_DATA.length} submissions...`);

  const now = new Date();
  const values = SEED_DATA.map((item, index) => {
    // Stagger creation times so hot scores vary (older items get lower scores)
    const createdAt = new Date(now.getTime() - index * 3600_000); // 1h apart
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
