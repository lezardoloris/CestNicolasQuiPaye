import { db } from '@/lib/db';
import {
  submissions,
  submissionSources,
  fourPositionVotes,
  ipFourPositionVotes,
  comments,
  communityNotes,
  solutions,
} from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { SubmissionMaturityData } from '@/types/maturity';

/**
 * Fetch all data needed for maturity calculation from the DB.
 * Extracted so it can be reused by both recalculateMaturity and the maturity API endpoint.
 */
export async function getMaturityDataForSubmission(
  submissionId: string,
): Promise<SubmissionMaturityData> {
  const [sourceData, voteData, discussionData, solutionData, submissionRow] =
    await Promise.all([
      getSourceData(submissionId),
      getVoteData(submissionId),
      getDiscussionData(submissionId),
      getSolutionData(submissionId),
      db
        .select({ consequenceText: submissions.consequenceText })
        .from(submissions)
        .where(eq(submissions.id, submissionId))
        .limit(1),
    ]);

  return {
    validatedSourceCount: sourceData.validatedCount,
    hasAiContext: !!submissionRow[0]?.consequenceText,
    fourPosTotalCount: voteData.totalCount,
    positionDiversityCount: voteData.diversityCount,
    commentCount: discussionData.commentCount,
    noteCount: discussionData.noteCount,
    solutionCount: solutionData.count,
    topSolutionUpvotes: solutionData.topUpvotes,
    topSolutionTotalVotes: solutionData.topTotalVotes,
  };
}

async function getSourceData(submissionId: string): Promise<{ validatedCount: number }> {
  const [row] = await db
    .select({
      validatedCount: sql<number>`count(*) filter (where ${submissionSources.validationCount} > ${submissionSources.invalidationCount})::int`,
    })
    .from(submissionSources)
    .where(eq(submissionSources.submissionId, submissionId));

  return { validatedCount: row?.validatedCount ?? 0 };
}

async function getVoteData(submissionId: string): Promise<{
  totalCount: number;
  diversityCount: number;
}> {
  const authCounts = await db
    .select({
      position: fourPositionVotes.position,
      count: sql<number>`count(*)::int`,
    })
    .from(fourPositionVotes)
    .where(eq(fourPositionVotes.submissionId, submissionId))
    .groupBy(fourPositionVotes.position);

  const anonCounts = await db
    .select({
      position: ipFourPositionVotes.position,
      count: sql<number>`count(*)::int`,
    })
    .from(ipFourPositionVotes)
    .where(
      and(
        eq(ipFourPositionVotes.submissionId, submissionId),
        eq(ipFourPositionVotes.isMigrated, false),
      ),
    )
    .groupBy(ipFourPositionVotes.position);

  const positionTotals: Record<string, number> = {};
  let total = 0;
  for (const row of authCounts) {
    positionTotals[row.position] = (positionTotals[row.position] ?? 0) + row.count;
    total += row.count;
  }
  for (const row of anonCounts) {
    positionTotals[row.position] = (positionTotals[row.position] ?? 0) + row.count;
    total += row.count;
  }

  const diversityCount = Object.values(positionTotals).filter(
    (count) => total > 0 && (count / total) * 100 > 5,
  ).length;

  return { totalCount: total, diversityCount };
}

async function getDiscussionData(submissionId: string): Promise<{
  commentCount: number;
  noteCount: number;
}> {
  const [commentRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(comments)
    .where(and(eq(comments.submissionId, submissionId), sql`${comments.deletedAt} IS NULL`));

  const [noteRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(communityNotes)
    .where(eq(communityNotes.submissionId, submissionId));

  return {
    commentCount: commentRow?.count ?? 0,
    noteCount: noteRow?.count ?? 0,
  };
}

async function getSolutionData(submissionId: string): Promise<{
  count: number;
  topUpvotes: number;
  topTotalVotes: number;
}> {
  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(solutions)
    .where(eq(solutions.submissionId, submissionId));

  const solutionList = await db
    .select({
      id: solutions.id,
      upvoteCount: solutions.upvoteCount,
      downvoteCount: solutions.downvoteCount,
    })
    .from(solutions)
    .where(eq(solutions.submissionId, submissionId))
    .orderBy(sql`${solutions.upvoteCount} - ${solutions.downvoteCount} DESC`)
    .limit(1);

  const topSolution = solutionList[0];

  return {
    count: countRow?.count ?? 0,
    topUpvotes: topSolution?.upvoteCount ?? 0,
    topTotalVotes: (topSolution?.upvoteCount ?? 0) + (topSolution?.downvoteCount ?? 0),
  };
}
