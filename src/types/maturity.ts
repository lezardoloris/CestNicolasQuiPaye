export type MaturityLevel = 1 | 2 | 3 | 4 | 5;

export type MaturityLabel =
  | 'signalée'
  | 'contextualisée'
  | 'débattue'
  | 'solution_proposée'
  | 'solution_consensuelle';

export const MATURITY_LABELS: Record<MaturityLevel, MaturityLabel> = {
  1: 'signalée',
  2: 'contextualisée',
  3: 'débattue',
  4: 'solution_proposée',
  5: 'solution_consensuelle',
};

export const MATURITY_DISPLAY_LABELS: Record<MaturityLevel, string> = {
  1: 'Signalée',
  2: 'Contextualisée',
  3: 'Débattue',
  4: 'Solution proposée',
  5: 'Solution consensuelle',
};

export const MATURITY_COLORS: Record<MaturityLevel, { text: string; bg: string; border: string }> = {
  1: { text: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  2: { text: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  3: { text: 'text-yellow-600', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  4: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  5: { text: 'text-green-600', bg: 'bg-green-600/10', border: 'border-green-600/30' },
};

export interface MaturityThresholds {
  /** Validated sources required for Level 2 */
  sourcesRequired: number;
  /** Whether AI context must be present for Level 2 */
  aiContextRequired: boolean;
  /** Total 4-position votes required for Level 3 */
  votesRequired: number;
  /** Min distinct positions with >5% share for Level 3 */
  positionDiversity: number;
  /** Comments or community notes required for Level 3 */
  commentsRequired: number;
  /** Structured solutions with source required for Level 4 */
  solutionsRequired: number;
  /** Support % threshold for top solution (Level 5) */
  supportPct: number;
  /** Min support votes on top solution (Level 5) */
  supportVotes: number;
}

export interface SubmissionMaturityData {
  validatedSourceCount: number;
  hasAiContext: boolean;
  fourPosTotalCount: number;
  positionDiversityCount: number;
  commentCount: number;
  noteCount: number;
  solutionCount: number;
  topSolutionUpvotes: number;
  topSolutionTotalVotes: number;
}

export interface MaturityResult {
  level: MaturityLevel;
  label: MaturityLabel;
  percentage: number;
  missingForNext: string[];
}
