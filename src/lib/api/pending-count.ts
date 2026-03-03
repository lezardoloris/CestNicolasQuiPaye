import { db } from '@/lib/db';
import { submissions, communityValidations } from '@/lib/db/schema';
import { eq, and, isNull, ne, notExists, sql } from 'drizzle-orm';

/**
 * Count pending submissions visible to a specific user.
 * When userId is provided, excludes the user's own submissions
 * and those they already validated (matching /api/submissions/pending logic).
 */
export async function getPendingSubmissionCount(userId?: string): Promise<number> {
  const conditions = [
    eq(submissions.moderationStatus, 'pending'),
    eq(submissions.status, 'published'),
    isNull(submissions.deletedAt),
  ];

  if (userId) {
    conditions.push(ne(submissions.authorId, userId));
    conditions.push(
      notExists(
        db
          .select({ one: sql<number>`1` })
          .from(communityValidations)
          .where(
            and(
              eq(communityValidations.submissionId, submissions.id),
              eq(communityValidations.userId, userId),
            ),
          ),
      ),
    );
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(submissions)
    .where(and(...conditions));
  return Number(result.count);
}
