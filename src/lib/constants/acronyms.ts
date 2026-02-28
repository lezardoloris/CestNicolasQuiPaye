/**
 * Dictionnaire des acronymes des finances publiques françaises.
 * Utilisé par le composant <Abbr> pour générer des infobulles accessibles (<abbr title>).
 */
export const ACRONYMS: Record<string, string> = {
  // ─── Impôts & prélèvements ────────────────────────────────
  IR: 'Impôt sur le Revenu',
  IS: 'Impôt sur les Sociétés',
  TVA: 'Taxe sur la Valeur Ajoutée',
  TICPE: 'Taxe Intérieure de Consommation sur les Produits Énergétiques',
  CSG: 'Contribution Sociale Généralisée',
  CRDS: 'Contribution au Remboursement de la Dette Sociale',

  // ─── Indicateurs économiques ──────────────────────────────
  PIB: 'Produit Intérieur Brut',
  SMIC: 'Salaire Minimum Interprofessionnel de Croissance',
  ETP: 'Équivalents Temps Plein',

  // ─── Lois de finances ─────────────────────────────────────
  PLF: 'Projet de Loi de Finances',
  PLFSS: 'Projet de Loi de Financement de la Sécurité Sociale',
  LFSS: 'Loi de Financement de la Sécurité Sociale',
  ONDAM: 'Objectif National des Dépenses d\u2019Assurance Maladie',

  // ─── Organismes statistiques & contrôle ───────────────────
  INSEE: 'Institut National de la Statistique et des Études Économiques',
  DGFiP: 'Direction Générale des Finances Publiques',
  DREES: 'Direction de la Recherche, des Études, de l\u2019Évaluation et des Statistiques',
  DNLF: 'Direction Nationale de Lutte contre la Fraude',
  IGAS: 'Inspection Générale des Affaires Sociales',
  HCFiPS: 'Haut Conseil du Financement de la Protection Sociale',
  COFOG: 'Classification des Fonctions des Administrations Publiques',

  // ─── Sécurité sociale ─────────────────────────────────────
  ACOSS: 'Agence Centrale des Organismes de Sécurité Sociale',
  CNAM: 'Caisse Nationale d\u2019Assurance Maladie',
  CNAF: 'Caisse Nationale d\u2019Allocations Familiales',
  CNAV: 'Caisse Nationale d\u2019Assurance Vieillesse',
  CAF: 'Caisse d\u2019Allocations Familiales',
  CADES: 'Caisse d\u2019Amortissement de la Dette Sociale',

  // ─── Think tanks & sources ────────────────────────────────
  IFRAP: 'Fondation pour la Recherche sur les Administrations et les Politiques Publiques',
  FIPECO: 'Finances Publiques, Économie et Comptes',
  OCDE: 'Organisation de Coopération et de Développement Économiques',

  // ─── Opérateurs de l'État ─────────────────────────────────
  CNRS: 'Centre National de la Recherche Scientifique',
  CEA: 'Commissariat à l\u2019Énergie Atomique et aux Énergies Alternatives',
  CNES: 'Centre National d\u2019Études Spatiales',
  ADEME: 'Agence de la Transition Écologique',
  ANAH: 'Agence Nationale de l\u2019Habitat',
  INSERM: 'Institut National de la Santé et de la Recherche Médicale',
  INRAE: 'Institut National de Recherche pour l\u2019Agriculture, l\u2019Alimentation et l\u2019Environnement',
  ONF: 'Office National des Forêts',
  OFII: 'Office Français de l\u2019Immigration et de l\u2019Intégration',
  OFPRA: 'Office Français de Protection des Réfugiés et Apatrides',
  ANSES: 'Agence Nationale de Sécurité Sanitaire de l\u2019Alimentation',
  ANSM: 'Agence Nationale de Sécurité du Médicament',
  HAS: 'Haute Autorité de Santé',
  SPF: 'Santé Publique France',
  IGN: 'Institut National de l\u2019Information Géographique et Forestière',
  ANRU: 'Agence Nationale pour la Rénovation Urbaine',
  ASP: 'Agence de Services et de Paiement',
  CEREMA: 'Centre d\u2019Études et d\u2019Expertise sur les Risques, la Mobilité et l\u2019Aménagement',
  VNF: 'Voies Navigables de France',

  // ─── Géopolitique ─────────────────────────────────────────
  UE: 'Union Européenne',

  // ─── Entreprises publiques ────────────────────────────────
  SNCF: 'Société Nationale des Chemins de fer Français',
  EDF: 'Électricité de France',
  RATP: 'Régie Autonome des Transports Parisiens',
} as const;
