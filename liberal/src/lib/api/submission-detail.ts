import { db } from '@/lib/db';
import { submissions, users, costCalculations, votes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { isValidUUID } from '@/lib/utils/validation';

export async function getSubmissionById(id: string, currentUserId?: string) {
  // Validate UUID format
  if (!isValidUUID(id)) return null;

  const result = await db
    .select({
      submission: submissions,
      author: {
        displayName: users.displayName,
        anonymousId: users.anonymousId,
      },
      costCalculation: costCalculations,
    })
    .from(submissions)
    .leftJoin(users, eq(submissions.authorId, users.id))
    .leftJoin(costCalculations, eq(submissions.id, costCalculations.submissionId))
    .where(eq(submissions.id, id))
    .limit(1);

  if (!result.length) return null;

  const row = result[0];

  // Fetch current user's vote if authenticated
  let userVote: 'up' | 'down' | null = null;
  if (currentUserId) {
    const voteResult = await db
      .select({ voteType: votes.voteType })
      .from(votes)
      .where(and(eq(votes.userId, currentUserId), eq(votes.submissionId, id)))
      .limit(1);
    userVote = (voteResult[0]?.voteType as 'up' | 'down') ?? null;
  }

  return {
    ...row.submission,
    author: row.author,
    costCalculation: row.costCalculation,
    userVote,
  };
}
