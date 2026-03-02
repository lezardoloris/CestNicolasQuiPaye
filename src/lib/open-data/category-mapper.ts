/**
 * Maps government ministry/mission labels to platform categories.
 * Uses keyword matching on the normalised (lowercased, accent-stripped) label.
 */

const MINISTRY_CATEGORY_MAP: [string, string][] = [
  ['armees', 'Défense'],
  ['defense', 'Défense'],
  ['education', 'Éducation'],
  ['enseignement', 'Éducation'],
  ['sante', 'Santé'],
  ['solidarites', 'Social'],
  ['solidarite', 'Social'],
  ['travail', 'Travail'],
  ['emploi', 'Travail'],
  ['ecologie', 'Environnement'],
  ['transition', 'Environnement'],
  ['agriculture', 'Agriculture'],
  ['alimentation', 'Agriculture'],
  ['culture', 'Culture'],
  ['recherche', 'Recherche'],
  ['numerique', 'Numérique'],
  ['interieur', 'Institutions'],
  ['justice', 'Institutions'],
  ['economie', 'Industrie'],
  ['finances', 'Institutions'],
  ['comptes publics', 'Institutions'],
  ['transport', 'Transport'],
  ['energie', 'Énergie'],
  ['collectivites', 'Collectivités'],
  ['amenagement', 'Aménagement'],
  ['cohesion', 'Aménagement'],
  ['sport', 'Culture'],
  ['outre-mer', 'Collectivités'],
];

const DEFAULT_CATEGORY = 'Institutions';

function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function mapToCategory(label: string): string {
  const normalised = normalise(label);

  for (const [keyword, category] of MINISTRY_CATEGORY_MAP) {
    if (normalised.includes(keyword)) {
      return category;
    }
  }

  return DEFAULT_CATEGORY;
}
