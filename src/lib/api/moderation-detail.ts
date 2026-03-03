import { db } from '@/lib/db';
import {
  submissions,
  aiContexts,
  moderationActions,
  users,
  solutions,
  communityNotes,
  submissionSources,
} from '@/lib/db/schema';
import { eq, count, isNull, desc } from 'drizzle-orm';
import type { ModerationDetailData } from '@/types/moderation-detail';

export async function getModerationDetail(
  submissionId: string
): Promise<ModerationDetailData | null> {
  const [submissionRows, historyRows, counts] = await Promise.all([
    // Main submission + AI context (left join)
    db
      .select({
        id: submissions.id,
        title: submissions.title,
        description: submissions.description,
        amount: submissions.amount,
        sourceUrl: submissions.sourceUrl,
        ministryTag: submissions.ministryTag,
        authorDisplay: submissions.authorDisplay,
        moderationStatus: submissions.moderationStatus,
        createdAt: submissions.createdAt,
        updatedAt: submissions.updatedAt,
        costPerTaxpayer: submissions.costPerTaxpayer,
        upvoteCount: submissions.upvoteCount,
        downvoteCount: submissions.downvoteCount,
        fourPosEssentielCount: submissions.fourPosEssentielCount,
        fourPosJustifieCount: submissions.fourPosJustifieCount,
        fourPosDiscutableCount: submissions.fourPosDiscutableCount,
        fourPosInjustifieCount: submissions.fourPosInjustifieCount,
        fourPosTotalCount: submissions.fourPosTotalCount,
        consensusType: submissions.consensusType,
        approveWeight: submissions.approveWeight,
        rejectWeight: submissions.rejectWeight,
        aiBudgetContext: aiContexts.budgetContext,
        aiCostComparison: aiContexts.costComparison,
        aiSummary: aiContexts.summary,
        aiVoteSummary: aiContexts.voteSummary,
        aiSolutionSummary: aiContexts.solutionSummary,
        aiRelatedFacts: aiContexts.relatedFacts,
        aiSource: aiContexts.source,
      })
      .from(submissions)
      .leftJoin(aiContexts, eq(aiContexts.submissionId, submissions.id))
      .where(eq(submissions.id, submissionId))
      .limit(1),

    // Moderation history with admin display names
    db
      .select({
        id: moderationActions.id,
        action: moderationActions.action,
        reason: moderationActions.reason,
        adminDisplay: users.displayName,
        createdAt: moderationActions.createdAt,
      })
      .from(moderationActions)
      .leftJoin(users, eq(moderationActions.adminUserId, users.id))
      .where(eq(moderationActions.submissionId, submissionId))
      .orderBy(desc(moderationActions.createdAt)),

    // Counts for solutions, notes, sources
    Promise.all([
      db
        .select({ value: count() })
        .from(solutions)
        .where(eq(solutions.submissionId, submissionId))
        .then((r) => r[0]?.value ?? 0),
      db
        .select({ value: count() })
        .from(communityNotes)
        .where(eq(communityNotes.submissionId, submissionId))
        .then((r) => r[0]?.value ?? 0),
      db
        .select({ value: count() })
        .from(submissionSources)
        .where(eq(submissionSources.submissionId, submissionId))
        .then((r) => r[0]?.value ?? 0),
    ]),
  ]);

  const row = submissionRows[0];
  if (!row) return null;

  const [solutionCount, noteCount, sourceCount] = counts;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    amount: row.amount,
    sourceUrl: row.sourceUrl,
    ministryTag: row.ministryTag,
    authorDisplay: row.authorDisplay,
    moderationStatus: row.moderationStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    costPerTaxpayer: row.costPerTaxpayer,
    upvoteCount: row.upvoteCount,
    downvoteCount: row.downvoteCount,
    fourPosEssentielCount: row.fourPosEssentielCount,
    fourPosJustifieCount: row.fourPosJustifieCount,
    fourPosDiscutableCount: row.fourPosDiscutableCount,
    fourPosInjustifieCount: row.fourPosInjustifieCount,
    fourPosTotalCount: row.fourPosTotalCount,
    consensusType: row.consensusType,
    approveWeight: row.approveWeight ?? 0,
    rejectWeight: row.rejectWeight ?? 0,
    solutionCount,
    noteCount,
    sourceCount,
    aiContext: row.aiSource
      ? {
          budgetContext: row.aiBudgetContext,
          costComparison: row.aiCostComparison,
          summary: row.aiSummary,
          voteSummary: row.aiVoteSummary,
          solutionSummary: row.aiSolutionSummary,
          relatedFacts: row.aiRelatedFacts,
          source: row.aiSource,
        }
      : null,
    moderationHistory: historyRows.map((h) => ({
      id: h.id,
      action: h.action as ModerationDetailData['moderationHistory'][number]['action'],
      reason: h.reason,
      adminDisplay: h.adminDisplay ?? 'Inconnu',
      createdAt: h.createdAt.toISOString(),
    })),
  };
}
