/**
 * Donnees statiques du Budget de l'Etat 2026 (Loi de Finances Initiale 2026)
 * et depenses publiques totales 2024 (INSEE, COFOG).
 *
 * Sources :
 * - budget.gouv.fr — Chiffres-cles Loi de Finances Initiale 2026
 * - Senat — Rapport general sur le PLF 2026
 * - IFRAP — Emissions de dette 2026
 * - INSEE — Dette publique T3 2025
 * - INSEE Premiere n°2093 — Depenses publiques par fonction 2024
 * - Cour des comptes — Situation des finances publiques debut 2026
 * - DGFiP Statistiques n°41 (nov. 2025) — IR 2024
 * - Senat / Assemblee nationale — Indemnites parlementaires
 */

// ─── Interfaces ──────────────────────────────────────────────────────

export interface BudgetMission {
  name: string;
  amount: number; // millions d'euros (CP)
  color: string;
}

export interface RevenueSource {
  name: string;
  amount: number; // millions d'euros
  color: string;
}

export interface DebtDataPoint {
  year: number;
  debtBn: number; // dette en Md€
  debtPctGdp: number; // % du PIB
  interestBn: number; // charge de la dette en Md€
  projected?: boolean;
}

export interface PublicSpendingFunction {
  name: string;
  amountBn: number; // milliards d'euros
  pctTotal: number; // % du total
  color: string;
  per1000eur: number; // sur 1 000€ d'impots
}

export interface IncomeTaxDecile {
  decile: string;
  label: string;
  incomeRange: string; // revenu indicatif net/mois par UC
  taxBn: number; // milliards d'euros
  pctOfTotal: number; // % de l'IR total
  color: string;
}

export interface PublicSalary {
  role: string;
  entity: string;
  annualGross: number; // euros brut/an
  monthlyNet?: number; // euros net/mois (avant IR)
  note?: string;
}

export interface SubsidizedAssociation {
  name: string;
  subsidy: number; // euros
  sector: string;
  url?: string; // site web
}

export interface SocialSpendingItem {
  name: string;
  amountBn: number; // milliards d'euros
  pctOfTotal: number; // % du total
  color: string;
}

export interface SocialFraudItem {
  domain: string;
  estimatedBn: number; // estimation en Md€/an
  detectedBn: number; // montant détecté en Md€/an
  note: string;
  source: string;
}

export interface StateAgency {
  name: string;
  acronym: string;
  stateFundingM: number; // financement État en M€ (SCSP + transferts)
  employeesEtp: number; // effectifs en ETP
  mission: string; // description en 1 phrase
  url: string; // site web officiel
  criticism: string; // critique notable (IFRAP, Cour des comptes…)
  criticismSource: string;
}

export interface EUCountryComparison {
  country: string;
  code: string;
  flag: string;
  debtPctGdp: number; // % du PIB (2024)
  deficitPctGdp: number; // % du PIB (2024)
  spendingPctGdp: number; // dépenses publiques % du PIB (2024)
  highlight?: boolean; // mettre en evidence
}

export interface BudgetData {
  netRevenue: number; // M€
  netExpenditure: number; // M€
  deficit: number; // M€ (negatif)
  deficitPctGdp: number;
  stateEmployees: number;
  missions: BudgetMission[];
  revenues: RevenueSource[];
  population: number;
  taxpayers: number;
  totalFiscalHouseholds: number;
  currentDebtBn: number; // Md€
  debtEmissions2026Bn: number; // Md€
  debtTimeline: DebtDataPoint[];
  publicSpending: PublicSpendingFunction[];
  incomeTaxDeciles: IncomeTaxDecile[];
  incomeTaxTotal: number; // Md€
  publicSalaries: PublicSalary[];
  smic: { annualGross: number; monthlyNet: number };
  associations: SubsidizedAssociation[];
  totalAssociationSubsidies: number; // Md€
  stateAgencies: StateAgency[];
  totalOperators: number;
  totalOperatorFundingBn: number; // Md€
  socialProtection: SocialSpendingItem[];
  socialProtectionTotalBn: number; // Md€
  healthSpending: SocialSpendingItem[];
  healthSpendingTotalBn: number; // Md€
  socialFraud: SocialFraudItem[];
  socialFraudEstimatedTotalBn: number; // Md€
  secuDeficit2024Bn: number; // Md€
  euComparison: EUCountryComparison[];
}

// ─── Donnees ─────────────────────────────────────────────────────────

export const BUDGET_MISSIONS: BudgetMission[] = [
  { name: 'Défense', amount: 66_700, color: '#3b82f6' },
  { name: 'Enseignement scolaire', amount: 60_000, color: '#8b5cf6' },
  { name: 'Charge de la dette', amount: 55_000, color: '#ef4444' },
  { name: 'Recherche & Ens. supérieur', amount: 31_000, color: '#06b6d4' },
  { name: 'Solidarités & Santé', amount: 30_000, color: '#ec4899' },
  { name: 'Écologie & Mobilité durables', amount: 21_800, color: '#10b981' },
  { name: 'Travail & Emploi', amount: 17_700, color: '#f59e0b' },
  { name: 'Sécurités', amount: 15_500, color: '#6366f1' },
  { name: 'Justice', amount: 12_200, color: '#14b8a6' },
  { name: 'Relations collectivités', amount: 11_000, color: '#a855f7' },
  { name: 'Cohésion des territoires', amount: 8_500, color: '#f97316' },
  { name: 'Pensions fonctionnaires (CAS)', amount: 62_000, color: '#dc2626' },
  { name: 'Gestion des finances publiques', amount: 8_500, color: '#0ea5e9' },
  { name: 'Régimes sociaux et de retraite', amount: 6_100, color: '#d946ef' },
  { name: 'Investir pour la France de 2030', amount: 4_300, color: '#059669' },
  { name: 'Aide publique au développement', amount: 3_700, color: '#7c3aed' },
  { name: 'Agriculture, alimentation', amount: 3_500, color: '#65a30d' },
  { name: 'Culture', amount: 3_700, color: '#e11d48' },
  { name: 'Économie', amount: 3_000, color: '#0891b2' },
  { name: 'Action extérieure de l\'État', amount: 2_800, color: '#4f46e5' },
  { name: 'Outre-mer', amount: 2_500, color: '#ca8a04' },
  { name: 'Immigration, asile', amount: 2_200, color: '#475569' },
  { name: 'Autres missions', amount: 27_159, color: '#737373' },
];

export const BUDGET_REVENUES: RevenueSource[] = [
  { name: 'TVA (nette)', amount: 100_000, color: '#10b981' },
  // 90 Md€ = recette nette État (après transferts aux collectivités).
  // Le total brut collecté par la DGFiP est de 92 Md€ (cf. incomeTaxTotal) ;
  // la différence correspond aux prélèvements sur recettes.
  { name: 'Impôt sur le revenu', amount: 90_000, color: '#3b82f6' },
  { name: 'Impôt sur les sociétés', amount: 55_000, color: '#8b5cf6' },
  { name: 'TICPE', amount: 18_000, color: '#f59e0b' },
  { name: 'Autres recettes fiscales', amount: 25_382, color: '#ec4899' },
  { name: 'Recettes non fiscales', amount: 37_000, color: '#737373' },
];

export const DEBT_TIMELINE: DebtDataPoint[] = [
  { year: 2017, debtBn: 2_250, debtPctGdp: 98.0, interestBn: 41 },
  { year: 2018, debtBn: 2_315, debtPctGdp: 98.0, interestBn: 41 },
  { year: 2019, debtBn: 2_380, debtPctGdp: 98.1, interestBn: 40 },
  { year: 2020, debtBn: 2_650, debtPctGdp: 115.0, interestBn: 36 },
  { year: 2021, debtBn: 2_813, debtPctGdp: 112.9, interestBn: 37 },
  { year: 2022, debtBn: 2_950, debtPctGdp: 111.9, interestBn: 42 },
  { year: 2023, debtBn: 3_101, debtPctGdp: 111.0, interestBn: 46 },
  { year: 2024, debtBn: 3_300, debtPctGdp: 113.7, interestBn: 50 },
  { year: 2025, debtBn: 3_482, debtPctGdp: 117.4, interestBn: 53 },
  { year: 2026, debtBn: 3_620, debtPctGdp: 118.6, interestBn: 55 },
  // Projections (déficit ~140 Md€/an + intérêts croissants)
  { year: 2027, debtBn: 3_770, debtPctGdp: 120.1, interestBn: 58, projected: true },
  { year: 2028, debtBn: 3_930, debtPctGdp: 121.8, interestBn: 62, projected: true },
  { year: 2029, debtBn: 4_100, debtPctGdp: 123.5, interestBn: 66, projected: true },
  { year: 2030, debtBn: 4_280, debtPctGdp: 125.4, interestBn: 71, projected: true },
  { year: 2031, debtBn: 4_470, debtPctGdp: 127.3, interestBn: 76, projected: true },
  { year: 2032, debtBn: 4_670, debtPctGdp: 129.4, interestBn: 82, projected: true },
  { year: 2033, debtBn: 4_880, debtPctGdp: 131.5, interestBn: 88, projected: true },
  { year: 2034, debtBn: 5_100, debtPctGdp: 133.8, interestBn: 95, projected: true },
  { year: 2035, debtBn: 5_340, debtPctGdp: 136.2, interestBn: 102, projected: true },
  { year: 2036, debtBn: 5_590, debtPctGdp: 138.7, interestBn: 110, projected: true },
];

// ─── Dépenses publiques totales par fonction (COFOG, INSEE 2024) ────

export const PUBLIC_SPENDING: PublicSpendingFunction[] = [
  { name: 'Protection sociale', amountBn: 693, pctTotal: 41, color: '#ef4444', per1000eur: 414 },
  // NB : 261 Md€ = dépenses publiques de santé au sens COFOG (INSEE), périmètre État + Sécu + collectivités.
  // healthSpendingTotalBn = 332,6 Md€ = Dépense Courante de Santé au sens international (DCSi, DREES),
  // qui inclut aussi les complémentaires et le reste à charge des ménages. Ce ne sont PAS les mêmes périmètres.
  { name: 'Santé', amountBn: 261, pctTotal: 16, color: '#ec4899', per1000eur: 156 },
  { name: 'Services généraux', amountBn: 181, pctTotal: 11, color: '#737373', per1000eur: 108 },
  { name: 'Affaires économiques', amountBn: 166, pctTotal: 10, color: '#f59e0b', per1000eur: 99 },
  { name: 'Enseignement', amountBn: 149, pctTotal: 9, color: '#8b5cf6', per1000eur: 89 },
  { name: 'Défense', amountBn: 54, pctTotal: 3, color: '#3b82f6', per1000eur: 32 },
  { name: 'Ordre et sécurité', amountBn: 52, pctTotal: 3, color: '#6366f1', per1000eur: 31 },
  { name: 'Culture et loisirs', amountBn: 43, pctTotal: 3, color: '#14b8a6', per1000eur: 26 },
  { name: 'Logement', amountBn: 42, pctTotal: 3, color: '#f97316', per1000eur: 25 },
  { name: 'Environnement', amountBn: 30, pctTotal: 2, color: '#10b981', per1000eur: 18 },
];

// ─── Répartition IR par décile (DGFiP 2024) ─────────────────────────

export const INCOME_TAX_DECILES: IncomeTaxDecile[] = [
  { decile: 'D1-D5', label: 'Les 50% les moins aisés', incomeRange: '< 1 900€ net/mois', taxBn: -1.5, pctOfTotal: -1.6, color: '#10b981' },
  { decile: 'D6', label: '6e décile', incomeRange: '1 900 - 2 200€/mois', taxBn: 0.8, pctOfTotal: 0.9, color: '#22c55e' },
  { decile: 'D7', label: '7e décile', incomeRange: '2 200 - 2 600€/mois', taxBn: 2.9, pctOfTotal: 3.1, color: '#84cc16' },
  { decile: 'D8', label: '8e décile', incomeRange: '2 600 - 3 200€/mois', taxBn: 5.8, pctOfTotal: 6.3, color: '#f59e0b' },
  { decile: 'D9', label: '9e décile', incomeRange: '3 200 - 4 200€/mois', taxBn: 12.0, pctOfTotal: 13.0, color: '#f97316' },
  { decile: 'D10', label: 'Les 10% les plus aisés', incomeRange: '> 4 200€ net/mois', taxBn: 72.0, pctOfTotal: 78.3, color: '#ef4444' },
];

// ─── Rémunérations publiques ─────────────────────────────────────────

export const PUBLIC_SALARIES: PublicSalary[] = [
  // Élus
  {
    role: 'Président de la République',
    entity: 'Élysée',
    annualGross: 192_000,
    monthlyNet: 12_500,
  },
  {
    role: 'Premier ministre',
    entity: 'Matignon',
    annualGross: 192_000,
    monthlyNet: 12_500,
  },
  {
    role: 'Ministre',
    entity: 'Gouvernement',
    annualGross: 128_304,
    monthlyNet: 8_300,
  },
  {
    role: 'Sénateur / Député',
    entity: 'Parlement',
    annualGross: 91_649,
    monthlyNet: 5_676,
    note: '+ 6 600 à 7 238€/mois de frais de mandat',
  },
  // Dirigeants d'entreprises publiques
  {
    role: 'PDG SNCF',
    entity: 'SNCF',
    annualGross: 520_000,
    note: '+ part variable jusqu\'à 30%',
  },
  {
    role: 'PDG EDF',
    entity: 'EDF',
    annualGross: 450_000,
  },
  {
    role: 'PDG La Poste',
    entity: 'La Poste',
    annualGross: 400_000,
  },
  {
    role: 'Présidente France Télévisions',
    entity: 'France Télévisions',
    annualGross: 400_000,
    note: 'fixe 322 000€ + prime jusqu\'à 78 000€',
  },
  {
    role: 'PDG RATP',
    entity: 'RATP',
    annualGross: 450_000,
  },
  // Hauts fonctionnaires (moyennes)
  {
    role: 'Top 10 agents ministériels (moy.)',
    entity: 'Hauts fonctionnaires',
    annualGross: 200_400,
    monthlyNet: 12_900,
    note: 'Dépasse la rémunération présidentielle',
  },
  {
    role: 'Directeur d\'administration centrale',
    entity: 'Hauts fonctionnaires',
    annualGross: 120_000,
    note: 'Fourchette 100 000 - 140 000€',
  },
  {
    role: 'Préfet / Ambassadeur',
    entity: 'Hauts fonctionnaires',
    annualGross: 110_000,
    note: 'Fourchette 100 000 - 120 000€',
  },
  // Dirigeants d'agences de l'Etat (top 10 moy. mensuel brut, IFRAP 2023)
  {
    role: 'DG Opéra de Paris (top 10 moy.)',
    entity: 'Agences de l\'État',
    annualGross: 240_500,
    note: 'Moy. top 10 : 20 042€/mois brut',
  },
  {
    role: 'DG Société des Grands Projets (top 10)',
    entity: 'Agences de l\'État',
    annualGross: 207_800,
    note: 'Moy. top 10 : 17 317€/mois brut',
  },
  {
    role: 'DG CNES (top 10)',
    entity: 'Agences de l\'État',
    annualGross: 200_800,
    note: 'Moy. top 10 : 16 733€/mois brut',
  },
  {
    role: 'DG CEA (top 10)',
    entity: 'Agences de l\'État',
    annualGross: 194_000,
    note: 'Moy. top 10 : 16 167€/mois brut',
  },
  {
    role: 'DG France Travail (top 10)',
    entity: 'Agences de l\'État',
    annualGross: 180_000,
    note: 'Moy. top 10 : ~15 000€/mois brut',
  },
  {
    role: 'Moy. top 10 des 431 opérateurs',
    entity: 'Agences de l\'État',
    annualGross: 86_382,
    note: '7 199€/mois brut — +24% vs fonct. publique',
  },
];

// ─── Associations les plus subventionnées (2018, Contribuables Associés) ──

export const TOP_ASSOCIATIONS: SubsidizedAssociation[] = [
  { name: 'Fongecfa Transport', subsidy: 79_117_276, sector: 'Formation' },
  { name: 'Fondation Nat. Sciences Po', subsidy: 69_242_924, sector: 'Enseignement', url: 'https://www.sciencespo.fr' },
  { name: 'Association Aurore', subsidy: 65_483_122, sector: 'Social / Hébergement', url: 'https://www.aurore.asso.fr' },
  { name: 'Institut Pasteur', subsidy: 61_979_055, sector: 'Recherche', url: 'https://www.pasteur.fr' },
  { name: 'ANRT', subsidy: 48_104_704, sector: 'Recherche & Technologie', url: 'https://www.anrt.asso.fr' },
  { name: 'Emmaüs Solidarité', subsidy: 46_024_276, sector: 'Social / Hébergement', url: 'https://www.emmaus-solidarite.org' },
  { name: 'Formiris', subsidy: 35_608_626, sector: 'Enseignement privé', url: 'https://www.formiris.org' },
  { name: 'CARPA de Paris', subsidy: 33_500_000, sector: 'Juridique', url: 'https://www.avocatparis.org' },
  { name: 'FPSPP (Fonds Paritaire)', subsidy: 32_600_000, sector: 'Formation professionnelle', url: 'https://www.francecompetences.fr' },
  { name: 'Croix-Rouge française', subsidy: 28_198_666, sector: 'Humanitaire', url: 'https://www.croix-rouge.fr' },
  { name: 'Groupe SOS Solidarités', subsidy: 26_528_394, sector: 'Social', url: 'https://www.groupe-sos.org' },
  { name: 'Ligue de l\'enseignement', subsidy: 25_260_000, sector: 'Éducation populaire', url: 'https://www.laligue.org' },
  { name: 'Éducation et Plein Air', subsidy: 24_300_000, sector: 'Éducation' },
  { name: 'Cités du Secours Catholique', subsidy: 23_300_000, sector: 'Social / Hébergement', url: 'https://www.secours-catholique.org' },
  { name: 'Coallia', subsidy: 21_500_000, sector: 'Social / Hébergement', url: 'https://www.coallia.org' },
  { name: 'Agence Univ. de la Francophonie', subsidy: 19_200_000, sector: 'Enseignement supérieur', url: 'https://www.auf.org' },
  { name: 'France Terre d\'Asile', subsidy: 18_500_000, sector: 'Aide aux réfugiés', url: 'https://www.france-terre-asile.org' },
  { name: 'Espace Social', subsidy: 18_000_000, sector: 'Social' },
  { name: 'CASP (Action Sociale Protestant)', subsidy: 17_900_000, sector: 'Social', url: 'https://www.casp.asso.fr' },
  { name: 'Adoma', subsidy: 17_500_000, sector: 'Logement social', url: 'https://www.adoma.cdc-habitat.fr' },
];

// ─── Top 20 opérateurs de l'État (PLF 2026, FIPECO, IFRAP, Cour des comptes) ──

export const TOP_STATE_AGENCIES: StateAgency[] = [
  {
    name: 'Universités (ensemble)',
    acronym: 'Universités',
    stateFundingM: 12_800,
    employeesEtp: 180_000,
    mission: 'Enseignement supérieur public et recherche universitaire pour 1,7 million d\'étudiants.',
    url: 'https://www.enseignementsup-recherche.gouv.fr',
    criticism: 'Seulement 30% disposent d\'un contrat de performance en vigueur ; charge administrative absorbant 20 à 30% du temps des chercheurs.',
    criticismSource: 'Cour des comptes (2025)',
  },
  {
    name: 'Centre national de la recherche scientifique',
    acronym: 'CNRS',
    stateFundingM: 2_939,
    employeesEtp: 32_000,
    mission: 'Premier organisme de recherche fondamentale pluridisciplinaire en France.',
    url: 'https://www.cnrs.fr',
    criticism: 'Trésorerie excédentaire de 1,4 Md€ fin 2023 révélant une sous-utilisation des crédits ; redondances avec l\'INSERM.',
    criticismSource: 'Cour des comptes (mars 2025)',
  },
  {
    name: 'France Compétences',
    acronym: 'France Compétences',
    stateFundingM: 2_026,
    employeesEtp: 80,
    mission: 'Régulation et financement de la formation professionnelle et de l\'apprentissage.',
    url: 'https://www.francecompetences.fr',
    criticism: 'Déficit chronique ; le CPF jugé trop coûteux et mal contrôlé avec des fraudes estimées à 43 M€ en 2021.',
    criticismSource: 'Cour des comptes (2023), IFRAP',
  },
  {
    name: 'Commissariat à l\'énergie atomique',
    acronym: 'CEA',
    stateFundingM: 1_900,
    employeesEtp: 21_000,
    mission: 'Recherche en énergie nucléaire et renouvelable, défense, sécurité et technologies de l\'information.',
    url: 'https://www.cea.fr',
    criticism: 'Coûts de démantèlement nucléaire sous-estimés ; opacité du budget dual civil/défense.',
    criticismSource: 'Cour des comptes (2021), IFRAP',
  },
  {
    name: 'Centre national d\'études spatiales',
    acronym: 'CNES',
    stateFundingM: 1_650,
    employeesEtp: 2_350,
    mission: 'Agence spatiale française : politique spatiale nationale et contribution à l\'ESA.',
    url: 'https://cnes.fr',
    criticism: 'Rémunérations des dirigeants parmi les plus élevées des opérateurs (top 10 : 16 733€/mois brut).',
    criticismSource: 'IFRAP, Sénat (2024)',
  },
  {
    name: 'France Travail (ex-Pôle emploi)',
    acronym: 'France Travail',
    stateFundingM: 1_350,
    employeesEtp: 53_500,
    mission: 'Accompagnement et indemnisation des demandeurs d\'emploi.',
    url: 'https://www.francetravail.fr',
    criticism: 'Moins de 13% des chômeurs retrouvent un emploi grâce à l\'opérateur ; coûte 1 000€ de plus par chômeur que le privé ; seulement 30% du temps consacré à l\'accompagnement.',
    criticismSource: 'Cour des comptes, IFRAP',
  },
  {
    name: 'Agence de l\'environnement et de la maîtrise de l\'énergie',
    acronym: 'ADEME',
    stateFundingM: 908,
    employeesEtp: 1_300,
    mission: 'Transition écologique et énergétique : rénovation, économie circulaire, qualité de l\'air.',
    url: 'https://www.ademe.fr',
    criticism: 'L\'IFRAP propose sa suppression (doublon avec les DREAL), économie estimée à 150 M€/an ; missions chevauchant CEREMA et ANCT.',
    criticismSource: 'IFRAP (2024)',
  },
  {
    name: 'Agence nationale de l\'habitat',
    acronym: 'ANAH',
    stateFundingM: 800,
    employeesEtp: 300,
    mission: 'Financement de la rénovation énergétique des logements privés (MaPrimeRénov\').',
    url: 'https://www.anah.gouv.fr',
    criticism: 'Sous-consommation massive des crédits MaPrimeRénov\' en 2024 (1,8 Md€ de moins que prévu) ; complexité administrative.',
    criticismSource: 'Cour des comptes (2024), Sénat',
  },
  {
    name: 'Institut national de la santé et de la recherche médicale',
    acronym: 'INSERM',
    stateFundingM: 726,
    employeesEtp: 7_800,
    mission: 'Recherche biomédicale et en santé publique, de la biologie fondamentale aux essais cliniques.',
    url: 'https://www.inserm.fr',
    criticism: 'Redondance avec l\'INSB du CNRS en sciences du vivant ; l\'alliance AVIESAN n\'a pas résolu la fragmentation.',
    criticismSource: 'Cour des comptes (2023)',
  },
  {
    name: 'Institut national de recherche pour l\'agriculture',
    acronym: 'INRAE',
    stateFundingM: 690,
    employeesEtp: 12_000,
    mission: 'Recherche pour l\'agriculture durable, l\'alimentation, l\'environnement et les territoires.',
    url: 'https://www.inrae.fr',
    criticism: 'Fusion INRA-IRSTEA jugée inachevée ; subvention d\'État stagnante ne compensant pas l\'inflation.',
    criticismSource: 'Sénat (PLF 2026)',
  },
  {
    name: 'Office national des forêts',
    acronym: 'ONF',
    stateFundingM: 285,
    employeesEtp: 8_043,
    mission: 'Gestion durable des forêts publiques françaises (4,6 millions d\'hectares).',
    url: 'https://www.onf.fr',
    criticism: 'Effectifs réduits de 40% en 20 ans ; moyens jugés « désormais insuffisants » ; l\'IFRAP propose la privatisation.',
    criticismSource: 'Cour des comptes (2024), IFRAP',
  },
  {
    name: 'Office français de l\'immigration et de l\'intégration',
    acronym: 'OFII',
    stateFundingM: 242,
    employeesEtp: 1_193,
    mission: 'Accueil et intégration des étrangers primo-arrivants, hébergement des demandeurs d\'asile.',
    url: 'https://www.ofii.fr',
    criticism: 'Budget immigration en baisse de 65 M€ entre 2023 et 2025 ; perte de 34 ETP en 2025.',
    criticismSource: 'La Cimade (2024), Sénat',
  },
  {
    name: 'Météo-France',
    acronym: 'Météo-France',
    stateFundingM: 200,
    employeesEtp: 2_632,
    mission: 'Prévision météorologique, vigilance événements extrêmes, appui aux forces armées et à l\'aviation civile.',
    url: 'https://meteofrance.fr',
    criticism: 'L\'IFRAP propose la privatisation (économie estimée cumulée de 4 Md€) ; coupes budgétaires menaçant la souveraineté météo.',
    criticismSource: 'IFRAP (2025), Sénat (2021)',
  },
  {
    name: 'Centre d\'études sur les risques et la mobilité',
    acronym: 'CEREMA',
    stateFundingM: 194,
    employeesEtp: 2_458,
    mission: 'Expertise technique pour les collectivités en matière de risques, environnement, mobilité et urbanisme.',
    url: 'https://www.cerema.fr',
    criticism: 'L\'IFRAP propose la fusion avec l\'ADEME et l\'ANCT (économie 500-700 M€/an) ; subvention réduite de 11 M€ en 2025.',
    criticismSource: 'IFRAP (2025)',
  },
  {
    name: 'Agence nationale de sécurité sanitaire',
    acronym: 'ANSES',
    stateFundingM: 130,
    employeesEtp: 1_400,
    mission: 'Évaluation des risques sanitaires liés à l\'alimentation, l\'environnement et le travail.',
    url: 'https://www.anses.fr',
    criticism: 'Multiplication des agences de santé (ANSES, ANSM, HAS, SPF) pour un coût total de 4 Md€/an ; doublons entre elles.',
    criticismSource: 'IFRAP (2024)',
  },
  {
    name: 'Office français de protection des réfugiés',
    acronym: 'OFPRA',
    stateFundingM: 100,
    employeesEtp: 800,
    mission: 'Instruction des demandes d\'asile et protection juridique des réfugiés et apatrides.',
    url: 'https://www.ofpra.gouv.fr',
    criticism: 'Délais de traitement encore trop longs ; dépendance aux financements européens fragilisant la planification.',
    criticismSource: 'Sénat (PLF 2026)',
  },
  {
    name: 'Institut national de l\'information géographique',
    acronym: 'IGN',
    stateFundingM: 97,
    employeesEtp: 1_330,
    mission: 'Production de l\'information géographique souveraine (cartes, Géoportail, données 3D).',
    url: 'https://www.ign.fr',
    criticism: 'Déficit structurel chronique de 6 M€/an ; réductions d\'effectifs continues malgré des missions en expansion (IA, LiDAR).',
    criticismSource: 'Sénat (2022)',
  },
  {
    name: 'Business France',
    acronym: 'Business France',
    stateFundingM: 95,
    employeesEtp: 1_433,
    mission: 'Accompagnement à l\'export des entreprises françaises et promotion de l\'attractivité du territoire.',
    url: 'https://www.businessfrance.fr',
    criticism: 'L\'IFRAP propose la fusion avec Atout France ; 45% des effectifs basés en France plutôt qu\'à l\'étranger.',
    criticismSource: 'IFRAP (2024), Sénat',
  },
  {
    name: 'Agence nationale pour la rénovation urbaine',
    acronym: 'ANRU',
    stateFundingM: 50,
    employeesEtp: 140,
    mission: 'Pilotage du renouvellement urbain des quartiers prioritaires (447 quartiers, 3 M d\'habitants).',
    url: 'https://www.anru.fr',
    criticism: 'Financement reposant à 90% sur Action Logement plutôt que l\'État ; retards massifs dans les projets.',
    criticismSource: 'Cour des comptes (2023), Sénat',
  },
  {
    name: 'Agence de services et de paiement',
    acronym: 'ASP',
    stateFundingM: 177,
    employeesEtp: 1_727,
    mission: 'Principal organisme payeur : verse les aides PAC et de nombreuses aides publiques (8,5 Md€/an).',
    url: 'https://www.asp.gouv.fr',
    criticism: 'Retards chroniques dans le versement des aides PAC aux agriculteurs ; systèmes d\'information obsolètes.',
    criticismSource: 'Cour des comptes (2024), Sénat',
  },
];

// ─── Protection sociale (COFOG 2024, 693 Md€) ──────────────────────

export const SOCIAL_PROTECTION: SocialSpendingItem[] = [
  { name: 'Retraites (vieillesse)', amountBn: 375, pctOfTotal: 54.1, color: '#ef4444' },
  { name: 'Maladie et invalidité', amountBn: 92, pctOfTotal: 13.3, color: '#ec4899' },
  { name: 'Famille et enfants', amountBn: 67, pctOfTotal: 9.7, color: '#8b5cf6' },
  { name: 'Chômage', amountBn: 49, pctOfTotal: 7.1, color: '#f59e0b' },
  { name: 'Pensions de réversion', amountBn: 43, pctOfTotal: 6.2, color: '#f97316' },
  { name: 'Exclusion sociale (RSA…)', amountBn: 35, pctOfTotal: 5.1, color: '#6366f1' },
  { name: 'Logement (APL)', amountBn: 16, pctOfTotal: 2.3, color: '#14b8a6' },
  { name: 'Administration', amountBn: 16, pctOfTotal: 2.3, color: '#737373' },
];

// ─── Dépenses de santé (DREES 2024, DCSi = 332,6 Md€) ──────────────

export const HEALTH_SPENDING: SocialSpendingItem[] = [
  { name: 'Soins hospitaliers', amountBn: 120.8, pctOfTotal: 36.3, color: '#ef4444' },
  { name: 'Soins ambulatoires (ville)', amountBn: 77.8, pctOfTotal: 23.4, color: '#3b82f6' },
  { name: 'Soins de longue durée', amountBn: 52.2, pctOfTotal: 15.7, color: '#8b5cf6' },
  { name: 'Médicaments', amountBn: 34.5, pctOfTotal: 10.4, color: '#10b981' },
  { name: 'Dispositifs médicaux', amountBn: 21.7, pctOfTotal: 6.5, color: '#f59e0b' },
  { name: 'Frais de gestion', amountBn: 16.9, pctOfTotal: 5.1, color: '#737373' },
  { name: 'Prévention', amountBn: 8.7, pctOfTotal: 2.6, color: '#14b8a6' },
];

// ─── Fraude sociale (Cour des comptes, DNLF, Haut Conseil Financement PS) ──

export const SOCIAL_FRAUD: SocialFraudItem[] = [
  {
    domain: 'Cotisations sociales (travail dissimulé)',
    estimatedBn: 8.0,
    detectedBn: 1.1,
    note: 'Travail au noir, faux statuts auto-entrepreneur, sous-déclaration — 6 à 10 Md€ selon la Cour des comptes.',
    source: 'Cour des comptes (2024), HCFiPS',
  },
  {
    domain: 'Assurance maladie (prestations)',
    estimatedBn: 2.4,
    detectedBn: 0.42,
    note: 'Fausses prescriptions, surfacturation, arrêts maladie abusifs. +50% de fraude détectée en 2024 vs 2023.',
    source: 'CNAM rapport charges & produits 2025',
  },
  {
    domain: 'Prestations familiales (CAF)',
    estimatedBn: 2.8,
    detectedBn: 0.35,
    note: 'Fausses déclarations de situation familiale, fraudes à l\'adresse, identités fictives. 49 000 fraudes détectées en 2023.',
    source: 'CNAF rapport 2024',
  },
  {
    domain: 'Retraites',
    estimatedBn: 1.0,
    detectedBn: 0.15,
    note: 'Faux certificats de vie de retraités à l\'étranger, carrières fictives. 800 M€ d\'erreurs en faveur des assurés en 2023.',
    source: 'CNAV, Cour des comptes (2024)',
  },
  {
    domain: 'Chômage (France Travail)',
    estimatedBn: 0.8,
    detectedBn: 0.22,
    note: 'Cumul indu emploi/allocation, fausses déclarations de recherche d\'emploi.',
    source: 'Unédic (2024)',
  },
  {
    domain: 'Fraude aux prestations sociales (RSA, APL…)',
    estimatedBn: 1.5,
    detectedBn: 0.3,
    note: 'Fausses déclarations de revenus, non-déclaration de concubinage, fraude à l\'adresse.',
    source: 'DNLF rapport 2024',
  },
  {
    domain: 'Fraude documentaire & identitaire',
    estimatedBn: 2.0,
    detectedBn: 0.1,
    note: 'Faux numéros de Sécu, usurpation d\'identité. Le rapport Sénat 2020 évoquait 14 Md€ (chiffre contesté).',
    source: 'Sénat (2020), DNLF',
  },
];

// SMIC pour comparaison
export const SMIC_2025 = { annualGross: 21_622, monthlyNet: 1_427 };

// ─── Comparaison UE (Eurostat, prévisions Commission européenne printemps 2025) ──

export const EU_COMPARISON: EUCountryComparison[] = [
  { country: 'France', code: 'FR', flag: '🇫🇷', debtPctGdp: 113.7, deficitPctGdp: 5.5, spendingPctGdp: 56.9, highlight: true },
  { country: 'Allemagne', code: 'DE', flag: '🇩🇪', debtPctGdp: 62.9, deficitPctGdp: 2.2, spendingPctGdp: 49.3 },
  { country: 'Italie', code: 'IT', flag: '🇮🇹', debtPctGdp: 137.3, deficitPctGdp: 3.4, spendingPctGdp: 56.7 },
  { country: 'Espagne', code: 'ES', flag: '🇪🇸', debtPctGdp: 104.3, deficitPctGdp: 3.2, spendingPctGdp: 47.6 },
  { country: 'Pays-Bas', code: 'NL', flag: '🇳🇱', debtPctGdp: 46.8, deficitPctGdp: 0.3, spendingPctGdp: 44.5 },
  { country: 'Belgique', code: 'BE', flag: '🇧🇪', debtPctGdp: 106.3, deficitPctGdp: 4.4, spendingPctGdp: 55.3 },
  { country: 'Zone euro', code: 'EA', flag: '🇪🇺', debtPctGdp: 88.7, deficitPctGdp: 3.0, spendingPctGdp: 49.6 },
  { country: 'UE-27', code: 'EU', flag: '🇪🇺', debtPctGdp: 82.1, deficitPctGdp: 3.0, spendingPctGdp: 49.0 },
];

// ─── Objet principal ─────────────────────────────────────────────────

export const BUDGET_2026: BudgetData = {
  // Chiffres-cles (budget.gouv.fr)
  netRevenue: 325_382,
  netExpenditure: 458_859,
  // netRevenue − netExpenditure = -133 477 M€ ; l'écart de 1 150 M€ correspond
  // au solde des comptes spéciaux du Trésor (budget.gouv.fr, Loi de Finances 2026).
  deficit: -134_627,
  deficitPctGdp: 4.7,
  stateEmployees: 2_016_588,

  missions: BUDGET_MISSIONS,
  revenues: BUDGET_REVENUES,

  // Demographie et dette
  population: 68_373_433,
  taxpayers: 19_600_000,
  totalFiscalHouseholds: 41_500_000,
  currentDebtBn: 3_620,
  debtEmissions2026Bn: 530,
  debtTimeline: DEBT_TIMELINE,

  // Depenses publiques totales (INSEE COFOG 2024)
  publicSpending: PUBLIC_SPENDING,

  // IR par decile (DGFiP 2024)
  incomeTaxDeciles: INCOME_TAX_DECILES,
  incomeTaxTotal: 92, // Md€

  // Remunerations
  publicSalaries: PUBLIC_SALARIES,
  smic: SMIC_2025,

  // Associations
  associations: TOP_ASSOCIATIONS,
  totalAssociationSubsidies: 23, // Md€ (toutes APU confondues)

  // Opérateurs de l'État
  stateAgencies: TOP_STATE_AGENCIES,
  totalOperators: 431,
  totalOperatorFundingBn: 51.6, // Md€ (PLF 2026)

  // Protection sociale et santé
  socialProtection: SOCIAL_PROTECTION,
  socialProtectionTotalBn: 693, // Md€ (COFOG 2024)
  healthSpending: HEALTH_SPENDING,
  healthSpendingTotalBn: 332.6, // Md€ (DREES DCSi 2024)
  socialFraud: SOCIAL_FRAUD,
  socialFraudEstimatedTotalBn: 18.5, // Md€/an estimation basse
  secuDeficit2024Bn: 15.3, // Md€ (Cour des comptes)

  // Comparaison UE
  euComparison: EU_COMPARISON,
};
