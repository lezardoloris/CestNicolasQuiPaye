import type {
  MaturityLevel,
  MaturityThresholds,
  SubmissionMaturityData,
  MaturityResult,
} from '@/types/maturity';
import { MATURITY_LABELS } from '@/types/maturity';

export const DEFAULT_THRESHOLDS: MaturityThresholds = {
  sourcesRequired: 1,
  aiContextRequired: false,
  votesRequired: 5,
  positionDiversity: 2,
  commentsRequired: 2,
  solutionsRequired: 1,
  supportPct: 60,
  supportVotes: 3,
};

/**
 * Pure, deterministic maturity calculation.
 * Must complete in <50ms. No DB calls.
 */
export function calculateMaturity(
  data: SubmissionMaturityData,
  thresholds: MaturityThresholds = DEFAULT_THRESHOLDS,
): MaturityResult {
  // Level 1→2: Sources (+ optional AI context)
  const hasEnoughSources = data.validatedSourceCount >= thresholds.sourcesRequired;
  const hasAiContext = !thresholds.aiContextRequired || data.hasAiContext;
  const canReachLevel2 = hasEnoughSources && hasAiContext;

  if (!canReachLevel2) {
    const missing = getMissingForLevel2(data, thresholds);
    const pct = getWithinLevelPct([
      data.validatedSourceCount / thresholds.sourcesRequired,
      thresholds.aiContextRequired ? (data.hasAiContext ? 1 : 0) : 1,
    ]);
    return { level: 1, label: MATURITY_LABELS[1], percentage: pct, missingForNext: missing };
  }

  // Level 2→3: Votes + diversity + comments/notes
  const totalDiscussion = data.commentCount + data.noteCount;
  const hasEnoughVotes = data.fourPosTotalCount >= thresholds.votesRequired;
  const hasEnoughDiversity = data.positionDiversityCount >= thresholds.positionDiversity;
  const hasEnoughDiscussion = totalDiscussion >= thresholds.commentsRequired;
  const canReachLevel3 = hasEnoughVotes && hasEnoughDiversity && hasEnoughDiscussion;

  if (!canReachLevel3) {
    const missing = getMissingForLevel3(data, thresholds);
    const pct = getWithinLevelPct([
      data.fourPosTotalCount / thresholds.votesRequired,
      data.positionDiversityCount / thresholds.positionDiversity,
      totalDiscussion / thresholds.commentsRequired,
    ]);
    return { level: 2, label: MATURITY_LABELS[2], percentage: pct, missingForNext: missing };
  }

  // Level 3→4: Structured solutions
  const hasEnoughSolutions = data.solutionCount >= thresholds.solutionsRequired;

  if (!hasEnoughSolutions) {
    const missing = getMissingForLevel4(data, thresholds);
    const pct = getWithinLevelPct([data.solutionCount / thresholds.solutionsRequired]);
    return { level: 3, label: MATURITY_LABELS[3], percentage: pct, missingForNext: missing };
  }

  // Level 4→5: Top solution with consensus support
  const topSolutionPct =
    data.topSolutionTotalVotes > 0
      ? (data.topSolutionUpvotes / data.topSolutionTotalVotes) * 100
      : 0;
  const hasSupportPct = topSolutionPct >= thresholds.supportPct;
  const hasSupportVotes = data.topSolutionUpvotes >= thresholds.supportVotes;
  const canReachLevel5 = hasSupportPct && hasSupportVotes;

  if (!canReachLevel5) {
    const missing = getMissingForLevel5(data, thresholds, topSolutionPct);
    const pct = getWithinLevelPct([
      topSolutionPct / thresholds.supportPct,
      data.topSolutionUpvotes / thresholds.supportVotes,
    ]);
    return { level: 4, label: MATURITY_LABELS[4], percentage: pct, missingForNext: missing };
  }

  return { level: 5, label: MATURITY_LABELS[5], percentage: 100, missingForNext: [] };
}

/** Average of ratios, clamped to 0-100. */
function getWithinLevelPct(ratios: number[]): number {
  if (ratios.length === 0) return 0;
  const avg = ratios.reduce((sum, r) => sum + Math.min(r, 1), 0) / ratios.length;
  return Math.round(avg * 100);
}

function getMissingForLevel2(
  data: SubmissionMaturityData,
  t: MaturityThresholds,
): string[] {
  const missing: string[] = [];
  const sourcesNeeded = t.sourcesRequired - data.validatedSourceCount;
  if (sourcesNeeded > 0) {
    missing.push(`Ajoutez ${sourcesNeeded} source${sourcesNeeded > 1 ? 's' : ''} validée${sourcesNeeded > 1 ? 's' : ''}`);
  }
  if (t.aiContextRequired && !data.hasAiContext) {
    missing.push('Contexte IA requis');
  }
  return missing;
}

function getMissingForLevel3(
  data: SubmissionMaturityData,
  t: MaturityThresholds,
): string[] {
  const missing: string[] = [];
  const votesNeeded = t.votesRequired - data.fourPosTotalCount;
  if (votesNeeded > 0) {
    missing.push(`${votesNeeded} vote${votesNeeded > 1 ? 's' : ''} supplémentaire${votesNeeded > 1 ? 's' : ''}`);
  }
  const diversityNeeded = t.positionDiversity - data.positionDiversityCount;
  if (diversityNeeded > 0) {
    missing.push(`Diversité des positions insuffisante`);
  }
  const discussionNeeded = t.commentsRequired - (data.commentCount + data.noteCount);
  if (discussionNeeded > 0) {
    missing.push(`${discussionNeeded} commentaire${discussionNeeded > 1 ? 's' : ''} ou note${discussionNeeded > 1 ? 's' : ''}`);
  }
  return missing;
}

function getMissingForLevel4(
  data: SubmissionMaturityData,
  t: MaturityThresholds,
): string[] {
  const needed = t.solutionsRequired - data.solutionCount;
  if (needed > 0) {
    return [`Proposez ${needed} solution${needed > 1 ? 's' : ''} structurée${needed > 1 ? 's' : ''}`];
  }
  return [];
}

function getMissingForLevel5(
  data: SubmissionMaturityData,
  t: MaturityThresholds,
  currentPct: number,
): string[] {
  const missing: string[] = [];
  if (currentPct < t.supportPct) {
    missing.push(`La meilleure solution doit atteindre ${t.supportPct}% de soutien (actuellement ${Math.round(currentPct)}%)`);
  }
  const votesNeeded = t.supportVotes - data.topSolutionUpvotes;
  if (votesNeeded > 0) {
    missing.push(`${votesNeeded} vote${votesNeeded > 1 ? 's' : ''} de soutien supplémentaire${votesNeeded > 1 ? 's' : ''}`);
  }
  return missing;
}
