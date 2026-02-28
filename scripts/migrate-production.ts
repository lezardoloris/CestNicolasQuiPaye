/**
 * Combined production migration script:
 * 1. Rejects spam/troll submissions (amount > 500B or inappropriate content)
 * 2. Updates seeded data with correct French accents (titles + descriptions)
 * 3. Replaces iFRAP sources with official institutional sources
 *
 * Usage: railway run npx tsx scripts/migrate-production.ts
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { submissions } from '../src/lib/db/schema';
import { eq, and, like, gt, or, sql as sqlExpr } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sqlConn = postgres(DATABASE_URL);
const db = drizzle(sqlConn);

// ─── Step 1: Cleanup spam ───────────────────────────────────────────

async function cleanupSpam() {
  console.log('\n=== Step 1: Cleanup spam submissions ===');

  // Reject submissions with unrealistic amounts (> 500 Mds€)
  const spamResult = await db
    .update(submissions)
    .set({ moderationStatus: 'rejected' })
    .where(gt(submissions.amount, '500000000000'));

  console.log('  Rejected submissions with amount > 500B€');

  // Reject submissions with inappropriate content
  const inappropriatePatterns = [
    '%humouriste%',
    '%piano%bite%',
  ];

  for (const pattern of inappropriatePatterns) {
    await db
      .update(submissions)
      .set({ moderationStatus: 'rejected' })
      .where(like(submissions.title, pattern));
    console.log(`  Checked pattern: ${pattern}`);
  }

  console.log('  Spam cleanup done.');
}

// ─── Step 2: Fix accents in seeded data ──────────────────────────────

interface AccentFix {
  titlePattern: string;
  newTitle: string;
  newDescription: string;
}

const ACCENT_FIXES: AccentFix[] = [
  {
    titlePattern: '%Senat%340 M%',
    newTitle: 'Sénat : 340 M€/an de budget de fonctionnement',
    newDescription: 'Le budget annuel du Sénat s\'élève à 340 millions d\'euros. Chaque sénateur représente un coût moyen d\'environ 1 million d\'euros par an, en incluant indemnités, collaborateurs et frais de fonctionnement.',
  },
  {
    titlePattern: '%CESE%40 M%',
    newTitle: 'CESE : 40 M€/an pour un organe consultatif',
    newDescription: 'Le Conseil Économique, Social et Environnemental dispose d\'un budget annuel de 40 millions d\'euros, selon le Projet de Loi de Finances (Mission "Conseil et contrôle de l\'État"). Il produit des avis consultatifs non contraignants. Ses membres perçoivent 3 800 euros mensuels.',
  },
  {
    titlePattern: '%Audiovisuel public%4 Mds%',
    newTitle: 'Audiovisuel public : 4 Mds€/an de financement',
    newDescription: 'Selon le Projet de Loi de Finances (Compte de concours financiers "Avances à l\'audiovisuel public"), le groupe France Télévisions et l\'audiovisuel public reçoivent plus de 4 milliards d\'euros de fonds publics annuels. L\'audience cumulée des chaînes publiques reste inférieure à celle du secteur privé.',
  },
  {
    titlePattern: '%Aides%la presse%1,8 Md%',
    newTitle: 'Aides à la presse : 1,8 Md€/an en aides directes et indirectes',
    newDescription: 'Selon la Cour des Comptes (rapport "Les aides de l\'État à la presse écrite"), l\'État verse 1,8 milliard d\'euros par an en aides à la presse, incluant subventions directes, tarifs postaux réduits et avantages fiscaux. Source irréfutable.',
  },
  {
    titlePattern: '%rateurs de l%tat%80 Mds%',
    newTitle: 'Opérateurs de l\'État : 1 200 agences pour 80 Mds€/an',
    newDescription: 'Selon le rapport d\'information du Sénat sur les opérateurs de l\'État (2022), la France compte plus de 1 200 opérateurs (agences, établissements publics) représentant un budget cumulé de 80 milliards d\'euros par an. La Cour des comptes relève des doublons avec les administrations centrales.',
  },
  {
    titlePattern: '%Fraude au RSA%',
    newTitle: 'Fraude au RSA : 3 à 5 Mds€/an selon la Cour des comptes',
    newDescription: 'Le RSA représente un budget de 15 milliards d\'euros par an. La Cour des comptes estime la fraude entre 3 et 5 milliards d\'euros annuels, liée à des déclarations inexactes ou des non-déclarations de revenus.',
  },
  {
    titlePattern: '%Fraude aux prestations sociales%20 Mds%',
    newTitle: 'Fraude aux prestations sociales : 20 Mds€/an estimés',
    newDescription: 'La fraude aux prestations sociales est estimée entre 20 et 50 milliards d\'euros par an selon les rapports du Sénat et de la Cour des comptes. Les contrôles restent limités face à l\'ampleur du phénomène.',
  },
  {
    titlePattern: '%Aide M%dicale d%tat%1,2 Md%',
    newTitle: 'Aide Médicale d\'État : 1,2 Md€/an, en hausse de 10%/an',
    newDescription: 'Selon le rapport du Sénat sur le PLF (Mission Santé), l\'Aide Médicale d\'État (AME) représente un budget de 1,2 milliard d\'euros par an pour environ 400 000 bénéficiaires. Son coût augmente d\'environ 10% chaque année depuis 2015.',
  },
  {
    titlePattern: '%Charge administrative des normes%84 Mds%',
    newTitle: 'Charge administrative des normes : 84 Mds€/an pour les entreprises',
    newDescription: 'Selon l\'OCDE et des rapports repris par le Sénat sur la simplification administrative, le coût de la réglementation et des obligations administratives est estimé à 84 milliards d\'euros par an pour les entreprises françaises. La France compte plus de 400 000 normes en vigueur.',
  },
  {
    titlePattern: '%Formation professionnelle%32 Mds%',
    newTitle: 'Formation professionnelle : 32 Mds€/an, 30% de retour à l\'emploi',
    newDescription: 'Selon l\'annexe au PLF "Jaune budgétaire : Formation professionnelle", le système de formation professionnelle coûte 32 milliards d\'euros par an. Seulement 30% des stagiaires retrouvent un emploi à l\'issue de leur formation.',
  },
  {
    titlePattern: '%Aides au logement%45 Mds%',
    newTitle: 'Aides au logement : 45 Mds€/an, crise persistante',
    newDescription: 'Selon le Compte du Logement (Ministère) et la Cour des Comptes, les aides au logement et le logement social représentent 45 milliards d\'euros par an de dépenses publiques. Malgré ces montants, la crise du logement persiste et les prix continuent d\'augmenter.',
  },
  {
    titlePattern: '%Doublons d%partements%r%gions%10 Mds%',
    newTitle: 'Doublons départements-régions : 10 Mds€/an d\'économies possibles',
    newDescription: 'Selon le Sénat et la Cour des Comptes (rapports sur la décentralisation et les compétences partagées), les 101 départements coûtent 75 milliards d\'euros par an. La suppression des doublons avec les régions et intercommunalités économiserait au moins 10 milliards d\'euros.',
  },
  {
    titlePattern: '%Fragmentation communale%35 000%',
    newTitle: 'Fragmentation communale : 35 000 communes, 10 Mds€/an de surcoût',
    newDescription: 'Selon la Cour des Comptes (rapport sur les finances publiques locales), la France compte 35 000 communes, plus que tous les autres pays de l\'UE réunis. Le coût de cette fragmentation est estimé à 10 milliards d\'euros par an en doublons administratifs.',
  },
  {
    titlePattern: '%Subventions aux associations%50 Mds%',
    newTitle: 'Subventions aux associations : 50 Mds€/an',
    newDescription: 'Selon la Cour des Comptes, l\'État et les collectivités versent environ 50 milliards d\'euros par an aux associations. La Cour pointe un manque de contrôle sur l\'utilisation effective de ces fonds publics.',
  },
  {
    titlePattern: '%Frais de fonctionnement des collectivit%s%8 Mds%',
    newTitle: 'Frais de fonctionnement des collectivités : 8 Mds€/an',
    newDescription: 'Selon la Cour des Comptes (rapport sur les finances locales) et l\'Observatoire des Finances et de la Gestion publique Locales (OFGL), les collectivités dépensent 8 milliards d\'euros par an en frais de personnel, véhicules de fonction, voyages et réceptions.',
  },
  {
    titlePattern: '%Haute fonction publique%3 Mds%',
    newTitle: 'Haute fonction publique : 3 Mds€/an en rémunérations et avantages',
    newDescription: 'Selon la Cour des Comptes (rapport sur la haute fonction publique), les hauts fonctionnaires issus des grands corps (ENA, Polytechnique, Mines) représentent un coût de 3 milliards d\'euros par an en salaires, primes et avantages divers.',
  },
  {
    titlePattern: '%bsent%isme fonction publique%12 Mds%',
    newTitle: 'Absentéisme fonction publique : 12 Mds€/an, 26 jours/an en moyenne',
    newDescription: 'Selon la Cour des Comptes (rapport sur la gestion des ressources humaines dans la fonction publique), l\'absentéisme représente un coût estimé à 12 milliards d\'euros par an. Le taux d\'absence moyen est de 26 jours par an, contre 14 jours dans le secteur privé.',
  },
  {
    titlePattern: '%Doublons%tat-collectivit%s%15 Mds%',
    newTitle: 'Doublons État-collectivités : 15 Mds€/an de dépenses redondantes',
    newDescription: 'Les doublons entre l\'État central et les collectivités territoriales représentent 15 milliards d\'euros de dépenses redondantes. Chaque compétence est exercée par 3 à 4 échelons administratifs différents.',
  },
  {
    titlePattern: '%Subventions agricoles%20 Mds%',
    newTitle: 'Subventions agricoles : 20 Mds€/an, 80% pour 20% des exploitations',
    newDescription: 'Selon la Cour des Comptes (rapport sur les aides à l\'agriculture) et le PLF (Mission Agriculture), la France dépense 20 milliards d\'euros par an en subventions agricoles (PAC et aides nationales). 80% des aides sont concentrées sur 20% des exploitations.',
  },
  {
    titlePattern: '%Politique de la ville%10 Mds%',
    newTitle: 'Politique de la ville : 10 Mds€/an depuis 40 ans, indicateurs stables',
    newDescription: 'Les quartiers prioritaires reçoivent 10 milliards d\'euros par an depuis quatre décennies. Les indicateurs de pauvreté, de chômage et d\'insécurité dans ces zones n\'ont pas significativement évolué.',
  },
  {
    titlePattern: '%dit d%imp%t recherche%7 Mds%',
    newTitle: 'Crédit d\'impôt recherche : 7 Mds€/an, efficacité contestée',
    newDescription: 'Le Crédit d\'Impôt Recherche représente 7 milliards d\'euros par an. La Cour des comptes et le Sénat questionnent son efficacité, relevant que de nombreuses entreprises l\'utilisent sans accroître leur effort de R&D.',
  },
  {
    titlePattern: '%Aides aux entreprises%160 Mds%',
    newTitle: 'Aides aux entreprises : 160 Mds€/an sans conditionnalité',
    newDescription: 'Selon France Stratégie (rapport sur les aides publiques aux entreprises), les aides aux entreprises totalisent 160 milliards d\'euros par an (exonérations, subventions, niches fiscales). Elles ne sont généralement pas conditionnées au maintien de l\'emploi ou à des objectifs mesurables.',
  },
  {
    titlePattern: '%Gestion des d%chets%15 Mds%',
    newTitle: 'Gestion des déchets : 15 Mds€/an, taux de recyclage à 25%',
    newDescription: 'La gestion des déchets coûte 15 milliards d\'euros par an. Le taux de recyclage français stagne à 25%, contre 67% en Allemagne. L\'incinération et l\'enfouissement restent prédominants.',
  },
  {
    titlePattern: '%Administration hospitali%re%10 Mds%',
    newTitle: 'Administration hospitalière : 10 Mds€/an, 35% du personnel',
    newDescription: 'Selon la Cour des Comptes (rapport "Les personnels des établissements publics de santé"), sur les 95 milliards d\'euros du budget hospitalier public, environ 10 milliards sont consacrés à l\'administration. Le personnel administratif représente 35% des effectifs, contre 25% en Allemagne.',
  },
  {
    titlePattern: '%Retraites fonctionnaires%40 Mds%',
    newTitle: 'Retraites fonctionnaires : 40 Mds€/an de subvention d\'équilibre',
    newDescription: 'Selon le PLF (Compte d\'affectation spéciale "Pensions"), le régime de retraite des fonctionnaires nécessite 40 milliards d\'euros par an de subvention d\'équilibre. Le taux de remplacement atteint 75% du dernier salaire, contre environ 50% du salaire moyen dans le privé.',
  },
  {
    titlePattern: '%gimes sp%ciaux de retraite%8 Mds%',
    newTitle: 'Régimes spéciaux de retraite : 8 Mds€/an de subventions',
    newDescription: 'Selon le PLF (Mission "Régimes sociaux et de retraite"), les régimes spéciaux (RATP, SNCF, EDF, Banque de France) coûtent 8 milliards d\'euros par an en subventions d\'équilibre. Les conditions de départ y sont plus avantageuses que le régime général.',
  },
  {
    titlePattern: '%Budget justice%9 Mds%',
    newTitle: 'Budget justice : 9 Mds€/an, délais moyens de 3 ans',
    newDescription: 'La justice française dispose d\'un budget de 9 milliards d\'euros par an. Les délais de traitement atteignent 3 ans en moyenne. La France se classe 23e sur 27 en Europe pour le budget justice par habitant.',
  },
  {
    titlePattern: '%immigration%20%30 Mds%',
    newTitle: 'Coût net de l\'immigration : 20 à 30 Mds€/an selon les estimations',
    newDescription: 'Le coût net de l\'immigration pour les finances publiques est estimé entre 20 et 30 milliards d\'euros par an par différentes sources (OCDE, rapports parlementaires), incluant santé, éducation et prestations sociales.',
  },
  {
    titlePattern: '%Fraude fiscale%80 Mds%',
    newTitle: 'Fraude fiscale : 80 Mds€/an de manque à gagner',
    newDescription: 'La fraude fiscale représente un manque à gagner estimé à 80 milliards d\'euros par an pour l\'État. Seulement 10 milliards sont effectivement recouvrés. Les contrôles fiscaux ont diminué de 30% en dix ans.',
  },
  {
    titlePattern: '%Niches fiscales%94 Mds%',
    newTitle: 'Niches fiscales et sociales : 94 Mds€/an, moitié non évaluée',
    newDescription: 'Les dépenses fiscales et sociales représentent 94 milliards d\'euros par an. Selon la Cour des comptes, la moitié de ces niches n\'a jamais fait l\'objet d\'une évaluation d\'efficacité.',
  },
  {
    titlePattern: '%Projets informatiques%3 Mds%',
    newTitle: 'Projets informatiques de l\'État : 3 Mds€/an de dépassements',
    newDescription: 'Les grands projets informatiques de l\'État accusent en moyenne 3 milliards d\'euros de surcoûts et retards par an. La Cour des comptes cite les projets Louvois, Sirhen et ONP parmi les échecs notables.',
  },
  {
    titlePattern: '%rogrammes d%armement%5 Mds%',
    newTitle: 'Programmes d\'armement : 5 Mds€/an de dépassements budgétaires',
    newDescription: 'Les programmes d\'armement français dépassent leur budget initial de 5 milliards d\'euros par an en moyenne, selon la Cour des comptes. Les projets Rafale, A400M et Barracuda sont documentés comme hors budget.',
  },
  {
    titlePattern: '%Aide publique au d%veloppement%15 Mds%',
    newTitle: 'Aide publique au développement : 15 Mds€/an, résultats peu mesurés',
    newDescription: 'La France consacre 15 milliards d\'euros par an à l\'aide au développement. La Cour des comptes relève que l\'efficacité de ces dépenses est rarement évaluée de manière rigoureuse.',
  },
  {
    titlePattern: '%Double si%ge%Parlement europ%en%114 M%',
    newTitle: 'Double siège du Parlement européen : 114 M€/an',
    newDescription: 'Le déplacement mensuel du Parlement européen entre Strasbourg et Bruxelles coûte 114 millions d\'euros par an, selon les estimations officielles du Parlement européen lui-même.',
  },
  {
    titlePattern: '%France Info%120 M%',
    newTitle: 'France Info (TV, radio, web) : 120 M€/an de budget',
    newDescription: 'Selon le PLF (Compte "Avances à l\'audiovisuel public"), le pôle France Info (télévision, radio et numérique) dispose d\'un budget de 120 millions d\'euros par an. Son audience reste limitée face aux chaînes d\'information privées.',
  },
  {
    titlePattern: '%Ville de Paris%10 Mds%',
    newTitle: 'Budget de la Ville de Paris : 10 Mds€/an, dette de 8 Mds€',
    newDescription: 'La Ville de Paris gère un budget de 10 milliards d\'euros par an. Sa dette a atteint 8 milliards d\'euros. La Chambre régionale des comptes a relevé des coûts élevés d\'aménagement et de personnel.',
  },
  {
    titlePattern: '%omit%s consultatifs%800 commissions%',
    newTitle: 'Comités consultatifs : 800 commissions, 500 M€/an',
    newDescription: 'Selon le PLF (annexe "Jaune budgétaire" : Liste des commissions et instances consultatives), la France compte environ 800 commissions et comités consultatifs pour un coût de 500 millions d\'euros par an. Nombre d\'entre eux ne se réunissent que rarement.',
  },
  {
    titlePattern: '%Bouclier tarifaire EDF%10 Mds%',
    newTitle: 'Bouclier tarifaire EDF : 10 Mds€ de compensation en 2023',
    newDescription: 'Le bouclier tarifaire sur l\'électricité a coûté 10 milliards d\'euros au contribuable en 2023. EDF, dont la dette atteint 64 milliards d\'euros, vend l\'électricité en dessous de son coût de production.',
  },
  {
    titlePattern: '%Subventions SNCF%3 Mds%',
    newTitle: 'Subventions SNCF : 3 Mds€/an d\'exploitation',
    newDescription: 'L\'État verse 3 milliards d\'euros par an à la SNCF en subventions d\'exploitation, hors investissements d\'infrastructure. Le taux d\'occupation des TER reste faible dans de nombreuses régions.',
  },
  {
    titlePattern: '%seau routier national%1 Md%',
    newTitle: 'Réseau routier national : 1 Md€/an de sous-investissement',
    newDescription: 'L\'État consacre 700 millions d\'euros par an à l\'entretien de 12 000 km de routes nationales, alors que le besoin est estimé à 1,7 milliard d\'euros. 20% des ponts sont classés en mauvais état structural.',
  },
  {
    titlePattern: '%Plan France Tr%s Haut D%bit%3 Mds%',
    newTitle: 'Plan France Très Haut Débit : 3 Mds€, 5 ans de retard',
    newDescription: 'Le plan France Très Haut Débit représente 3 milliards d\'euros d\'investissement public. Il accuse 5 ans de retard sur ses objectifs initiaux, selon le rapport de la Cour des comptes.',
  },
  {
    titlePattern: '%Contrats aid%s%6 Mds%',
    newTitle: 'Contrats aidés : 6 Mds€/an, 70% sans emploi durable',
    newDescription: 'Selon la Cour des Comptes et la DARES (Ministère du Travail), les contrats aidés coûtent 6 milliards d\'euros par an. Les évaluations officielles montrent que 70% des bénéficiaires se retrouvent sans emploi à l\'issue de leur contrat.',
  },
  {
    titlePattern: '%Charge de la dette%52 Mds%',
    newTitle: 'Charge de la dette : 52 Mds€/an d\'intérêts',
    newDescription: 'La charge annuelle de la dette publique atteint 52 milliards d\'euros, soit le 2e poste budgétaire de l\'État. Cela représente environ 1 430 euros par habitant uniquement pour le paiement des intérêts.',
  },
  {
    titlePattern: '%Parc automobile%300 000%3 Mds%',
    newTitle: 'Parc automobile de l\'État : 300 000 véhicules, 3 Mds€/an',
    newDescription: 'L\'État et ses opérateurs possèdent 300 000 véhicules pour un coût annuel de 3 milliards d\'euros. La Cour des comptes relève une sous-utilisation significative de ce parc.',
  },
  {
    titlePattern: '%Immobilier de l%tat%10 Mds%',
    newTitle: 'Immobilier de l\'État : 10 Mds€/an de gestion, 30% sous-occupé',
    newDescription: 'L\'État possède 191 000 bâtiments d\'une valeur de 30 milliards d\'euros. Le coût de gestion annuel est de 10 milliards d\'euros. 30% du parc est vacant ou sous-occupé selon la Cour des comptes.',
  },
  {
    titlePattern: '%ducation nationale%60 Mds%',
    newTitle: 'Éducation nationale : 60 Mds€/an, recul au classement PISA',
    newDescription: 'Selon le PLF (Mission "Enseignement scolaire"), l\'Éducation nationale dispose d\'un budget de 60 milliards d\'euros par an. La France est passée du 15e au 26e rang du classement PISA (OCDE) en mathématiques entre 2003 et 2022.',
  },
  {
    titlePattern: '%seau diplomatique%3 Mds%',
    newTitle: 'Réseau diplomatique : 3 Mds€/an, 200 ambassades',
    newDescription: 'Le réseau diplomatique français, 3e mondial par sa taille, coûte 3 milliards d\'euros par an pour 200 ambassades et représentations. Son dimensionnement fait l\'objet de questionnements réguliers.',
  },
  {
    titlePattern: '%Forces de s%curit%25 Mds%',
    newTitle: 'Forces de sécurité : 25 Mds€/an, 40% du temps en tâches administratives',
    newDescription: 'Police et gendarmerie représentent un budget de 25 milliards d\'euros par an. Les agents consacrent environ 40% de leur temps à des tâches administratives selon les rapports internes.',
  },
  {
    titlePattern: '%France Travail%6 Mds%',
    newTitle: 'France Travail : 6 Mds€/an de fonctionnement',
    newDescription: 'Selon la Cour des Comptes (rapport sur la gestion de Pôle Emploi), France Travail (ex-Pôle Emploi) dispose d\'un budget de fonctionnement de 6 milliards d\'euros par an. Le coût moyen par placement est estimé à 10 000 euros.',
  },
];

async function fixAccents() {
  console.log('\n=== Step 2: Fix French accents in seeded data ===');

  let updated = 0;
  for (const fix of ACCENT_FIXES) {
    await db
      .update(submissions)
      .set({
        title: fix.newTitle,
        description: fix.newDescription,
      })
      .where(
        and(
          eq(submissions.isSeeded, 1),
          like(submissions.title, fix.titlePattern),
        ),
      );
    console.log(`  Fixed: ${fix.titlePattern}`);
    updated++;
  }

  console.log(`  ${updated} accent fix queries executed.`);
}

// ─── Step 3: Update sources (from update-sources.ts) ─────────────────

interface SourceUpdate {
  titlePattern: string;
  sourceUrl: string;
}

const SOURCE_UPDATES: SourceUpdate[] = [
  { titlePattern: '%CESE%40 M%', sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general' },
  { titlePattern: '%Audiovisuel public%4 Mds%', sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux' },
  { titlePattern: '%presse%1,8 Md%', sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-de-letat-a-la-presse-ecrite' },
  { titlePattern: '%rateurs%tat%80 Mds%', sourceUrl: 'https://www.senat.fr/rap/r21-800/r21-800.html' },
  { titlePattern: '%dicale d%tat%1,2 Md%', sourceUrl: 'https://www.senat.fr/rap/a23-131-5/a23-131-5.html' },
  { titlePattern: '%Charge administrative%84 Mds%', sourceUrl: 'https://www.senat.fr/rap/r23-033/r23-033.html' },
  { titlePattern: '%Formation professionnelle%32 Mds%', sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/annexes-informatives' },
  { titlePattern: '%Aides au logement%45 Mds%', sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-personnelles-au-logement' },
  { titlePattern: '%Doublons d%partements%r%gions%10 Mds%', sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023' },
  { titlePattern: '%Fragmentation communale%35 000%', sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023' },
  { titlePattern: '%Subventions aux associations%50 Mds%', sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-subventions-aux-associations' },
  { titlePattern: '%Frais de fonctionnement des collectivit%s%8 Mds%', sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2023' },
  { titlePattern: '%Haute fonction publique%3 Mds%', sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-haute-fonction-publique' },
  { titlePattern: '%bsent%isme fonction publique%12 Mds%', sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-gestion-des-ressources-humaines-dans-la-fonction-publique' },
  { titlePattern: '%Subventions agricoles%20 Mds%', sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-aides-a-lagriculture' },
  { titlePattern: '%Aides aux entreprises%160 Mds%', sourceUrl: 'https://www.strategie.gouv.fr/publications/les-aides-publiques-aux-entreprises' },
  { titlePattern: '%Administration hospitali%re%10 Mds%', sourceUrl: 'https://www.ccomptes.fr/fr/publications/les-personnels-des-etablissements-publics-de-sante' },
  { titlePattern: '%Retraites fonctionnaires%40 Mds%', sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux' },
  { titlePattern: '%gimes sp%ciaux de retraite%8 Mds%', sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general' },
  { titlePattern: '%France Info%120 M%', sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/comptes-speciaux' },
  { titlePattern: '%omit%s consultatifs%800 commissions%', sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/annexes-informatives' },
  { titlePattern: '%Contrats aid%s%6 Mds%', sourceUrl: 'https://dares.travail-emploi.gouv.fr/publications/les-contrats-aides' },
  { titlePattern: '%ducation nationale%60 Mds%', sourceUrl: 'https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2024/projet-de-loi-de-finances/budget-general' },
  { titlePattern: '%France Travail%6 Mds%', sourceUrl: 'https://www.ccomptes.fr/fr/publications/pole-emploi' },
];

async function updateSources() {
  console.log('\n=== Step 3: Update iFRAP sources to official sources ===');

  let updated = 0;
  for (const item of SOURCE_UPDATES) {
    await db
      .update(submissions)
      .set({ sourceUrl: item.sourceUrl })
      .where(
        and(
          eq(submissions.isSeeded, 1),
          like(submissions.title, item.titlePattern),
        ),
      );
    console.log(`  Updated source: ${item.titlePattern}`);
    updated++;
  }

  console.log(`  ${updated} source update queries executed.`);
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log('Starting production migration...\n');

  await cleanupSpam();
  await fixAccents();
  await updateSources();

  console.log('\n=== Migration complete! ===');
  await sqlConn.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
