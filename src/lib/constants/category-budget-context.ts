/**
 * Maps each submission category (ministryTag) to a key official budget fact
 * and the corresponding anchor on /chiffres for deep-linking.
 *
 * Sources: Loi de Finances 2026, INSEE COFOG 2024, DREES DCSi.
 */

export interface CategoryBudgetFact {
  /** Short official budget fact, e.g. "Budget santé : 333 Md€/an" */
  fact: string;
  /** Anchor id on /chiffres page, e.g. "protection-sociale" */
  anchor: string;
}

const CATEGORY_BUDGET_CONTEXT: Record<string, CategoryBudgetFact> = {
  'Santé': { fact: 'Budget santé : 333 Md€/an', anchor: 'protection-sociale' },
  'Social': { fact: 'Protection sociale : 693 Md€/an', anchor: 'protection-sociale' },
  'Éducation': { fact: 'Budget éducation : 91 Md€ (État)', anchor: 'budget-etat' },
  'Défense': { fact: 'Budget défense : 66,7 Md€', anchor: 'budget-etat' },
  'Institutions': { fact: 'Services généraux : 181 Md€/an', anchor: 'budget-etat' },
  'Culture': { fact: 'Budget culture : 3,7 Md€ (État)', anchor: 'budget-etat' },
  'Recherche': { fact: 'Recherche & enseignement sup. : 31 Md€', anchor: 'budget-etat' },
  'Environnement': { fact: 'Budget écologie : 21,8 Md€', anchor: 'budget-etat' },
  'Transport': { fact: 'Budget écologie & transports : 21,8 Md€', anchor: 'budget-etat' },
  'Énergie': { fact: 'Budget écologie & énergie : 21,8 Md€', anchor: 'budget-etat' },
  'Travail': { fact: 'Budget travail & emploi : 17,7 Md€', anchor: 'budget-etat' },
  'Agriculture': { fact: 'Budget agriculture : 3,5 Md€', anchor: 'budget-etat' },
  'Industrie': { fact: 'Affaires économiques : 166 Md€/an', anchor: 'depenses-publiques' },
  'Collectivités': { fact: 'Dotations collectivités : 11 Md€', anchor: 'budget-etat' },
  'Aménagement': { fact: 'Cohésion des territoires : 8,5 Md€', anchor: 'budget-etat' },
  'Numérique': { fact: 'Affaires économiques : 166 Md€/an', anchor: 'depenses-publiques' },
};

export function getCategoryBudgetFact(ministryTag: string | null): CategoryBudgetFact | null {
  if (!ministryTag) return null;
  return CATEGORY_BUDGET_CONTEXT[ministryTag] ?? null;
}
