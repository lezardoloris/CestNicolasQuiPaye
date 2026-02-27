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
    title: 'Senat: 346 senateurs a 340 000 EUR/an chacun',
    description:
      'Le cout total du Senat depasse 340 millions EUR par an. Chaque senateur coute en moyenne pres de 1 million EUR/an en incluant les frais de fonctionnement, collaborateurs et avantages.',
    amount: 340_000_000,
    sourceUrl: 'https://www.senat.fr/budget.html',
    ministryTag: 'Institutions',
  },
  {
    title: 'CESE: le Conseil economique qui ne sert a rien',
    description:
      'Le Conseil Economique Social et Environnemental coute 40 millions EUR par an pour des avis consultatifs que personne ne lit. Ses membres touchent 3 800 EUR/mois.',
    amount: 40_000_000,
    sourceUrl: 'https://www.ifrap.org/etat-et-collectivites/le-cese-un-organisme-a-supprimer',
    ministryTag: 'Institutions',
  },
  {
    title: 'France Televisions: 4 milliards de redevance',
    description:
      'Le groupe France Televisions engloutit plus de 4 milliards EUR de fonds publics par an. La qualite des programmes ne justifie pas un tel investissement quand des chaines privees font mieux avec moins.',
    amount: 4_000_000_000,
    sourceUrl: 'https://www.ifrap.org/budget-et-fiscalite/audiovisuel-public',
    ministryTag: 'Culture',
  },
  {
    title: 'Aides a la presse: 1,8 milliard pour des journaux que personne ne lit',
    description:
      'L Etat verse 1,8 milliard EUR par an en aides directes et indirectes a la presse, y compris des journaux a diffusion confidentielle.',
    amount: 1_800_000_000,
    sourceUrl: 'https://www.ifrap.org/budget-et-fiscalite/aides-la-presse',
    ministryTag: 'Culture',
  },
  {
    title: 'Agences de l Etat: 1 200 operateurs pour 80 milliards',
    description:
      'La France compte plus de 1 200 operateurs de l Etat (agences, etablissements publics) qui coutent 80 milliards EUR par an. Beaucoup font doublon avec les ministeres.',
    amount: 80_000_000_000,
    sourceUrl: 'https://www.ifrap.org/etat-et-collectivites/les-operateurs-de-letat',
    ministryTag: 'Administration',
  },
  {
    title: 'RSA: 15 milliards dont 30% de fraude estimee',
    description:
      'Le RSA coute 15 milliards EUR par an. La fraude est estimee entre 3 et 5 milliards EUR par la Cour des comptes, soit pres d un tiers du budget.',
    amount: 5_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/le-revenu-de-solidarite-active',
    ministryTag: 'Social',
  },
  {
    title: 'Fraude sociale: 20 milliards minimum par an',
    description:
      'La fraude aux prestations sociales est estimee entre 20 et 50 milliards EUR par an par la Cour des comptes et le Senat. Les controles sont largement insuffisants.',
    amount: 20_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r19-614/r19-614.html',
    ministryTag: 'Social',
  },
  {
    title: 'AME: 1,2 milliard pour la sante des sans-papiers',
    description:
      'L Aide Medicale d Etat coute 1,2 milliard EUR par an et beneficie a environ 400 000 personnes en situation irreguliere. Le cout augmente de 10% chaque annee.',
    amount: 1_200_000_000,
    sourceUrl: 'https://www.ifrap.org/emploi-et-politiques-sociales/aide-medicale-detat-ame',
    ministryTag: 'Sante',
  },
  {
    title: 'Normes et paperasse: 84 milliards de cout pour les entreprises',
    description:
      'Le poids de la reglementation francaise coute 84 milliards EUR par an aux entreprises en charges administratives. La France produit 400 000 normes actives.',
    amount: 84_000_000_000,
    sourceUrl: 'https://www.ifrap.org/etat-et-collectivites/le-cout-de-la-norme',
    ministryTag: 'Economie',
  },
  {
    title: 'Formation professionnelle: 32 milliards gaspilles',
    description:
      'La formation professionnelle coute 32 milliards EUR par an. Seulement 30% des stagiaires trouvent un emploi apres. Un systeme opaque qui profite aux organismes de formation.',
    amount: 32_000_000_000,
    sourceUrl: 'https://www.ifrap.org/emploi-et-politiques-sociales/formation-professionnelle',
    ministryTag: 'Emploi',
  },
  {
    title: 'Logement social: 45 milliards de depenses sans resultat',
    description:
      'Les aides au logement et le logement social coutent 45 milliards EUR par an. Les prix de l immobilier continuent d augmenter et la crise du logement persiste.',
    amount: 45_000_000_000,
    sourceUrl: 'https://www.ifrap.org/immobilier-et-logement/aides-au-logement',
    ministryTag: 'Logement',
  },
  {
    title: 'Departements: un echelon administratif inutile',
    description:
      'Les 101 departements coutent 75 milliards EUR par an. La plupart de leurs competences font doublon avec les regions et les intercommunalites. La suppression economiserait au moins 10 milliards.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ifrap.org/etat-et-collectivites/suppression-des-departements',
    ministryTag: 'Collectivites',
  },
  {
    title: 'Communes: 35 000 communes pour 67 millions d habitants',
    description:
      'La France a 35 000 communes, plus que tous les autres pays d Europe reunis. Le cout de cette fragmentation est estime a 10 milliards EUR/an en doublons et inefficacites.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ifrap.org/etat-et-collectivites/les-communes',
    ministryTag: 'Collectivites',
  },
  {
    title: 'Subventions aux associations: 50 milliards sans controle',
    description:
      'L Etat et les collectivites versent 50 milliards EUR par an aux associations. Beaucoup servent a financer des emplois fictifs ou des activites sans utilite publique reelle.',
    amount: 50_000_000_000,
    sourceUrl: 'https://www.ifrap.org/etat-et-collectivites/subventions-aux-associations',
    ministryTag: 'Administration',
  },
  {
    title: 'Trains de vie des collectivites locales',
    description:
      'Les collectivites locales depensent 8 milliards EUR par an en frais de personnel excessifs, voitures de fonction, voyages et receptions. Les elus locaux coutent 2 milliards EUR/an.',
    amount: 8_000_000_000,
    sourceUrl: 'https://www.ifrap.org/etat-et-collectivites/train-de-vie-des-collectivites',
    ministryTag: 'Collectivites',
  },
  {
    title: 'ENA et hauts fonctionnaires: la caste qui coute cher',
    description:
      'Les hauts fonctionnaires (X-ENA-Mines) coutent 3 milliards EUR par an en salaires, primes et avantages. Pantouflage, cumul de mandats et revolving doors inclus.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ifrap.org/fonction-publique-et-target-administration/hauts-fonctionnaires',
    ministryTag: 'Fonction publique',
  },
  {
    title: 'Absenteisme dans la fonction publique',
    description:
      'L absenteisme dans la fonction publique coute 12 milliards EUR par an. Le taux d absence est 2 fois superieur au prive: 26 jours/an en moyenne contre 14 dans le prive.',
    amount: 12_000_000_000,
    sourceUrl: 'https://www.ifrap.org/fonction-publique-et-administration/absenteisme',
    ministryTag: 'Fonction publique',
  },
  {
    title: 'Doublons Etat-regions: 15 milliards de gaspillage',
    description:
      'Les doublons entre l Etat central et les collectivites territoriales representent 15 milliards EUR de gaspillage annuel. Chaque competence est exercee par 3 a 4 echelons administratifs.',
    amount: 15_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r19-048/r19-048.html',
    ministryTag: 'Administration',
  },
  {
    title: 'Politique agricole: 20 milliards de subventions',
    description:
      'La France depense 20 milliards EUR par an en subventions agricoles (PAC + aides nationales). 80% des aides vont a 20% des exploitations, les plus grandes.',
    amount: 20_000_000_000,
    sourceUrl: 'https://www.ifrap.org/agriculture-et-alimentation/pac',
    ministryTag: 'Agriculture',
  },
  {
    title: 'Politique de la ville: 10 milliards sans amelioration',
    description:
      'Les quartiers prioritaires recoivent 10 milliards EUR par an depuis 40 ans. Les indicateurs de pauvrete, de chomage et d insecurite n ont pas bouge.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-politique-de-la-ville',
    ministryTag: 'Ville',
  },
  {
    title: 'Credits d impot recherche: 7 milliards detournes',
    description:
      'Le Credit d Impot Recherche coute 7 milliards EUR/an. De nombreuses entreprises l utilisent pour de l optimisation fiscale sans faire de vraie recherche. La France stagne en innovation.',
    amount: 7_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/le-credit-dimpot-recherche',
    ministryTag: 'Economie',
  },
  {
    title: 'Aides aux entreprises: 160 milliards sans conditionnalite',
    description:
      'Les aides aux entreprises totalisent 160 milliards EUR par an (exonerations, subventions, niches fiscales). Aucune condition de maintien de l emploi ou de relocalisation.',
    amount: 160_000_000_000,
    sourceUrl: 'https://www.ifrap.org/budget-et-fiscalite/aides-aux-entreprises',
    ministryTag: 'Economie',
  },
  {
    title: 'Gestion des dechets: 15 milliards d inefficacite',
    description:
      'La gestion des dechets coute 15 milliards EUR par an en France. Le taux de recyclage stagne a 25% quand l Allemagne est a 67%. Incineration massive et enfouissement couteux.',
    amount: 15_000_000_000,
    sourceUrl: 'https://www.ademe.fr/dechets',
    ministryTag: 'Environnement',
  },
  {
    title: 'Hopital public: 10 milliards de gaspillage administratif',
    description:
      'Sur les 95 milliards EUR de l hopital public, 10 milliards sont absorbes par l administration. Un hopital francais a 35% de personnel administratif contre 25% en Allemagne.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ifrap.org/sante-et-assurance-maladie/hopital-public',
    ministryTag: 'Sante',
  },
  {
    title: 'Retraites des fonctionnaires: un regime injustifie',
    description:
      'Le regime special de retraite des fonctionnaires coute 40 milliards EUR par an en subvention d equilibre. Un fonctionnaire touche 75% de son dernier salaire, le prive 50% du salaire moyen.',
    amount: 40_000_000_000,
    sourceUrl: 'https://www.ifrap.org/retraites/retraite-des-fonctionnaires',
    ministryTag: 'Fonction publique',
  },
  {
    title: 'Regimes speciaux de retraite: RATP, SNCF, EDF...',
    description:
      'Les regimes speciaux (RATP, SNCF, EDF, Banque de France...) coutent 8 milliards EUR par an en subventions. Les agents partent plus tot avec des pensions plus elevees.',
    amount: 8_000_000_000,
    sourceUrl: 'https://www.ifrap.org/retraites/regimes-speciaux',
    ministryTag: 'Social',
  },
  {
    title: 'Justice: 9 milliards et des delais de 3 ans',
    description:
      'La justice francaise coute 9 milliards EUR par an mais affiche des delais moyens de 3 ans. La France est 23e sur 27 en Europe pour le budget justice par habitant.',
    amount: 9_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-justice',
    ministryTag: 'Justice',
  },
  {
    title: 'Immigration: 30 milliards de cout net annuel',
    description:
      'Le cout net de l immigration pour les finances publiques est estime entre 20 et 30 milliards EUR par an (OCDE, Cour des comptes). Incluant sante, education, prestations sociales et securite.',
    amount: 30_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r18-024/r18-024.html',
    ministryTag: 'Immigration',
  },
  {
    title: 'Fraude fiscale: 80 milliards de manque a gagner',
    description:
      'La fraude fiscale represente 80 milliards EUR/an de manque a gagner pour l Etat. Seulement 10 milliards sont recouvres. Les controles fiscaux ont baisse de 30% en 10 ans.',
    amount: 80_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r22-490/r22-490.html',
    ministryTag: 'Fiscalite',
  },
  {
    title: 'Niches fiscales: 94 milliards de depenses cachees',
    description:
      'Les niches fiscales et sociales coutent 94 milliards EUR par an. La moitie n a jamais ete evaluee. Certaines beneficient exclusivement aux plus riches sans effet economique prouve.',
    amount: 94_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-depenses-fiscales',
    ministryTag: 'Fiscalite',
  },
  {
    title: 'Projets informatiques de l Etat: 3 milliards de fiascos',
    description:
      'Les projets informatiques de l Etat sont un gouffre financier: 3 milliards EUR gaspilles par an entre retards, surcouts et abandons. Louvois, Sirhen, ONP... la liste est longue.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-conduite-des-grands-projets-numeriques-de-letat',
    ministryTag: 'Numerique',
  },
  {
    title: 'Defense: 5 milliards de surcout sur les programmes d armement',
    description:
      'Les programmes d armement depassent systematiquement leur budget de 5 milliards EUR par an en moyenne. Le Rafale, le Charles de Gaulle, l A400M: tous hors budget.',
    amount: 5_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-programmation-militaire',
    ministryTag: 'Defense',
  },
  {
    title: 'Aide au developpement: 15 milliards sans resultats mesurables',
    description:
      'La France depense 15 milliards EUR par an en aide au developpement. L efficacite est rarement evaluee et les pays beneficiaires ne montrent pas d amelioration significative.',
    amount: 15_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/laide-publique-au-developpement',
    ministryTag: 'Affaires etrangeres',
  },
  {
    title: 'Parlement europeen: le cirque Strasbourg-Bruxelles',
    description:
      'Le demenagement mensuel du Parlement europeen entre Strasbourg et Bruxelles coute 114 millions EUR par an. La France s y accroche pour des raisons de prestige.',
    amount: 114_000_000,
    sourceUrl: 'https://www.europarl.europa.eu/news/fr/headlines/eu-affairs/20140203STO34645',
    ministryTag: 'Europe',
  },
  {
    title: 'Chaines d info en continu publiques: 120 millions pour France Info',
    description:
      'France Info (TV + radio + web) coute 120 millions EUR par an. Son audience est marginale face a BFM et CNews. Un service qui fait triplon avec les autres chaines publiques.',
    amount: 120_000_000,
    sourceUrl: 'https://www.ifrap.org/budget-et-fiscalite/audiovisuel-public',
    ministryTag: 'Culture',
  },
  {
    title: 'Ville de Paris: 10 milliards de budget et dette record',
    description:
      'Paris depense 10 milliards EUR par an avec une dette qui a explose a 8 milliards. Pistes cyclables a 1 million EUR le km, mobilier urbain hors de prix, effectifs plethpriques.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.paris.fr/budget',
    ministryTag: 'Collectivites',
  },
  {
    title: 'Comites Theodoule: 800 commissions consultatives',
    description:
      'La France compte 800 commissions et comites consultatifs qui coutent 500 millions EUR par an. La plupart ne se reunissent jamais ou produisent des rapports ignores.',
    amount: 500_000_000,
    sourceUrl: 'https://www.ifrap.org/etat-et-collectivites/les-comites-theodule',
    ministryTag: 'Administration',
  },
  {
    title: 'EDF: 64 milliards de dette et prix regules',
    description:
      'EDF accumule 64 milliards de dette tout en vendant l electricite en dessous du cout de production a cause du bouclier tarifaire. Le contribuable paie la difference: 10 milliards en 2023.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/edf',
    ministryTag: 'Energie',
  },
  {
    title: 'SNCF: 3 milliards de subvention annuelle',
    description:
      'L Etat verse 3 milliards EUR par an a la SNCF en subventions d exploitation, sans compter les investissements. Les TER roulent a moitie vides dans beaucoup de regions.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-sncf',
    ministryTag: 'Transport',
  },
  {
    title: 'Entretien du reseau routier: 1 milliard de retard cumule',
    description:
      'L Etat depense 700 millions EUR par an pour entretenir 12 000 km de routes nationales alors qu il en faudrait 1,7 milliard. 20% des ponts sont en mauvais etat.',
    amount: 1_000_000_000,
    sourceUrl: 'https://www.senat.fr/rap/r22-332/r22-332.html',
    ministryTag: 'Transport',
  },
  {
    title: 'Operateurs telephoniques: 3 milliards de plan France THD',
    description:
      'Le plan France Tres Haut Debit coute 3 milliards EUR. En retard de 5 ans, il subventionne des operateurs prives qui auraient deploye la fibre de toute facon dans les zones rentables.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/le-plan-france-tres-haut-debit',
    ministryTag: 'Numerique',
  },
  {
    title: 'Emplois aidés: 6 milliards pour des postes temporaires',
    description:
      'Les contrats aides coutent 6 milliards EUR par an. 70% des beneficiaires se retrouvent sans emploi a la fin du contrat. Un outil de maquillage des chiffres du chomage.',
    amount: 6_000_000_000,
    sourceUrl: 'https://www.ifrap.org/emploi-et-politiques-sociales/emplois-aides',
    ministryTag: 'Emploi',
  },
  {
    title: 'Agence France Tresor: 52 milliards d interets de la dette',
    description:
      'La charge de la dette coute 52 milliards EUR par an, soit le 2e poste budgetaire apres l education. C est 1 430 EUR par Francais juste pour payer les interets.',
    amount: 52_000_000_000,
    sourceUrl: 'https://www.aft.gouv.fr/fr/charges-dette',
    ministryTag: 'Budget',
  },
  {
    title: 'Vehicules de fonction: 300 000 voitures pour l Etat',
    description:
      'L Etat et ses operateurs possedent 300 000 vehicules de fonction pour un cout de 3 milliards EUR par an. Beaucoup sont sous-utilises ou servent a des usages personnels.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-gestion-du-parc-automobile-de-letat',
    ministryTag: 'Administration',
  },
  {
    title: 'Immobilier de l Etat: 30 milliards de patrimoine mal gere',
    description:
      'L Etat possede 191 000 batiments pour une valeur de 30 milliards EUR. 30% sont vacants ou sous-occupes. Le cout de gestion est de 10 milliards EUR par an.',
    amount: 10_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-gestion-immobiliere-de-letat',
    ministryTag: 'Administration',
  },
  {
    title: 'Education nationale: 60 milliards, classement PISA en chute',
    description:
      'L education nationale coute 60 milliards EUR par an. La France est passee du 15e au 26e rang PISA en maths. Le probleme n est pas le budget mais la gestion et les methodes.',
    amount: 60_000_000_000,
    sourceUrl: 'https://www.ifrap.org/education-et-culture/education-nationale',
    ministryTag: 'Education',
  },
  {
    title: 'Diplomatie: 200 ambassades pour un influence en baisse',
    description:
      'Le reseau diplomatique francais (3e mondial) coute 3 milliards EUR par an pour 200 ambassades. L influence francaise ne cesse de diminuer malgre ce cout.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/le-reseau-diplomatique',
    ministryTag: 'Affaires etrangeres',
  },
  {
    title: 'Police et gendarmerie: 25 milliards et paperasse',
    description:
      'Police et gendarmerie coutent 25 milliards EUR par an. Les agents passent 40% de leur temps sur de la paperasse administrative au lieu d etre sur le terrain.',
    amount: 25_000_000_000,
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-forces-de-securite',
    ministryTag: 'Securite',
  },
  {
    title: 'Pole Emploi / France Travail: 6 milliards de cout de fonctionnement',
    description:
      'France Travail (ex-Pole Emploi) coute 6 milliards EUR par an en fonctionnement. Chaque placement coute 10 000 EUR. Les conseillers ont en moyenne 150 demandeurs chacun.',
    amount: 6_000_000_000,
    sourceUrl: 'https://www.ifrap.org/emploi-et-politiques-sociales/pole-emploi',
    ministryTag: 'Emploi',
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
