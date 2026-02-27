import { db } from '@/lib/db';
import { votes, submissions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { calculateHotScore } from '@/lib/utils/hot-score';

/**
 * Cast a vote: new vote, toggle off, or switch direction.
 * All operations are atomic within a transaction.
 */
export async function castVote(
  userId: string,
  submissionId: string,
  voteType: 'up' | 'down',
) {
  return db.transaction(async (tx) => {
    // Check for existing vote
    const existing = await tx
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.submissionId, submissionId)))
      .limit(1);

    const existingVote = existing[0];

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off: same direction clicked again -> remove vote
        await tx.delete(votes).where(eq(votes.id, existingVote.id));

        if (voteType === 'up') {
          await tx
            .update(submissions)
            .set({
              upvoteCount: sql`${submissions.upvoteCount} - 1`,
              updatedAt: new Date(),
            })
            .where(eq(submissions.id, submissionId));
        } else {
          await tx
            .update(submissions)
            .set({
              downvoteCount: sql`${submissions.downvoteCount} - 1`,
              updatedAt: new Date(),
            })
            .where(eq(submissions.id, submissionId));
        }

        // Recalculate hot score
        await recalculateHotScore(tx, submissionId);

        return { action: 'removed' as const, userVote: null };
      } else {
        // Switch direction
        await tx
          .update(votes)
          .set({ voteType, createdAt: new Date() })
          .where(eq(votes.id, existingVote.id));

        if (voteType === 'up') {
          // Switching from down to up
          await tx
            .update(submissions)
            .set({
              upvoteCount: sql`${submissions.upvoteCount} + 1`,
              downvoteCount: sql`${submissions.downvoteCount} - 1`,
              updatedAt: new Date(),
            })
            .where(eq(submissions.id, submissionId));
        } else {
          // Switching from up to down
          await tx
            .update(submissions)
            .set({
              upvoteCount: sql`${submissions.upvoteCount} - 1`,
              downvoteCount: sql`${submissions.downvoteCount} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(submissions.id, submissionId));
        }

        // Recalculate hot score
        await recalculateHotScore(tx, submissionId);

        return { action: 'switched' as const, userVote: voteType };
      }
    } else {
      // New vote
      await tx.insert(votes).values({
        userId,
        submissionId,
        voteType,
      });

      if (voteType === 'up') {
        await tx
          .update(submissions)
          .set({
            upvoteCount: sql`${submissions.upvoteCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(submissions.id, submissionId));
      } else {
        await tx
          .update(submissions)
          .set({
            downvoteCount: sql`${submissions.downvoteCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(submissions.id, submissionId));
      }

      // Recalculate hot score
      await recalculateHotScore(tx, submissionId);

      return { action: 'created' as const, userVote: voteType };
    }
  });
}

/**
 * Remove a vote entirely.
 */
export async function removeVote(userId: string, submissionId: string) {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.submissionId, submissionId)))
      .limit(1);

    const existingVote = existing[0];
    if (!existingVote) return { action: 'noop' as const };

    await tx.delete(votes).where(eq(votes.id, existingVote.id));

    if (existingVote.voteType === 'up') {
      await tx
        .update(submissions)
        .set({
          upvoteCount: sql`${submissions.upvoteCount} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(submissions.id, submissionId));
    } else {
      await tx
        .update(submissions)
        .set({
          downvoteCount: sql`${submissions.downvoteCount} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(submissions.id, submissionId));
    }

    await recalculateHotScore(tx, submissionId);

    return { action: 'removed' as const };
  });
}

/**
 * Recalculate hot score for a submission after a vote change.
 */
async function recalculateHotScore(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  submissionId: string,
) {
  const [sub] = await tx
    .select({
      upvoteCount: submissions.upvoteCount,
      downvoteCount: submissions.downvoteCount,
      createdAt: submissions.createdAt,
    })
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1);

  if (!sub) return;

  const hotScore = calculateHotScore(
    sub.upvoteCount,
    sub.downvoteCount,
    sub.createdAt,
  );

  await tx
    .update(submissions)
    .set({ hotScore: String(hotScore) })
    .where(eq(submissions.id, submissionId));
}
