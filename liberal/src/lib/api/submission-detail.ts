import { db } from '@/lib/db';
import { submissions, users, costCalculations, votes, ipVotes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { isValidUUID } from '@/lib/utils/validation';

export async function getSubmissionById(
  id: string,
  currentUserId?: string,
  ipHash?: string,
  viewerRole?: string,
) {
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

  // Visibility check: only approved submissions are public
  if (row.submission.moderationStatus !== 'approved') {
    const isAuthor = currentUserId && row.submission.authorId === currentUserId;
    const isModerator = viewerRole === 'admin' || viewerRole === 'moderator';
    if (!isAuthor && !isModerator) {
      return null;
    }
  }

  // Fetch current vote: user-based if authenticated, IP-based otherwise
  let userVote: 'up' | 'down' | null = null;
  if (currentUserId) {
    const voteResult = await db
      .select({ voteType: votes.voteType })
      .from(votes)
      .where(and(eq(votes.userId, currentUserId), eq(votes.submissionId, id)))
      .limit(1);
    userVote = (voteResult[0]?.voteType as 'up' | 'down') ?? null;
  } else if (ipHash) {
    const ipVoteResult = await db
      .select({ voteType: ipVotes.voteType })
      .from(ipVotes)
      .where(and(eq(ipVotes.ipHash, ipHash), eq(ipVotes.submissionId, id)))
      .limit(1);
    userVote = (ipVoteResult[0]?.voteType as 'up' | 'down') ?? null;
  }

  return {
    ...row.submission,
    author: row.author,
    costCalculation: row.costCalculation,
    userVote,
  };
}
