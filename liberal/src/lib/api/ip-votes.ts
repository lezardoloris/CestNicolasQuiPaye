import { db } from '@/lib/db';
import { ipVotes, submissions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { calculateHotScore } from '@/lib/utils/hot-score';

/**
 * Cast an anonymous IP-based vote: new vote, toggle off, or switch direction.
 * Same logic as user votes but keyed on ipHash instead of userId.
 */
export async function castIpVote(
  ipHash: string,
  submissionId: string,
  voteType: 'up' | 'down',
) {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(ipVotes)
      .where(and(eq(ipVotes.ipHash, ipHash), eq(ipVotes.submissionId, submissionId)))
      .limit(1);

    const existingVote = existing[0];

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off
        await tx.delete(ipVotes).where(eq(ipVotes.id, existingVote.id));

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

        await recalculateHotScore(tx, submissionId);
        return { action: 'removed' as const, userVote: null };
      } else {
        // Switch direction
        await tx
          .update(ipVotes)
          .set({ voteType, createdAt: new Date() })
          .where(eq(ipVotes.id, existingVote.id));

        if (voteType === 'up') {
          await tx
            .update(submissions)
            .set({
              upvoteCount: sql`${submissions.upvoteCount} + 1`,
              downvoteCount: sql`${submissions.downvoteCount} - 1`,
              updatedAt: new Date(),
            })
            .where(eq(submissions.id, submissionId));
        } else {
          await tx
            .update(submissions)
            .set({
              upvoteCount: sql`${submissions.upvoteCount} - 1`,
              downvoteCount: sql`${submissions.downvoteCount} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(submissions.id, submissionId));
        }

        await recalculateHotScore(tx, submissionId);
        return { action: 'switched' as const, userVote: voteType };
      }
    } else {
      // New vote
      await tx.insert(ipVotes).values({
        ipHash,
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

      await recalculateHotScore(tx, submissionId);
      return { action: 'created' as const, userVote: voteType };
    }
  });
}

/**
 * Remove an IP-based vote entirely.
 */
export async function removeIpVote(ipHash: string, submissionId: string) {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(ipVotes)
      .where(and(eq(ipVotes.ipHash, ipHash), eq(ipVotes.submissionId, submissionId)))
      .limit(1);

    const existingVote = existing[0];
    if (!existingVote) return { action: 'noop' as const };

    await tx.delete(ipVotes).where(eq(ipVotes.id, existingVote.id));

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
 * Get IP vote state for multiple submissions at once (batch).
 */
export async function getIpVoteBatch(ipHash: string, submissionIds: string[]) {
  if (submissionIds.length === 0) return {};

  const results = await db
    .select({
      submissionId: ipVotes.submissionId,
      voteType: ipVotes.voteType,
    })
    .from(ipVotes)
    .where(
      and(
        eq(ipVotes.ipHash, ipHash),
        sql`${ipVotes.submissionId} IN ${submissionIds}`,
      ),
    );

  const voteMap: Record<string, 'up' | 'down'> = {};
  for (const row of results) {
    voteMap[row.submissionId] = row.voteType as 'up' | 'down';
  }
  return voteMap;
}

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
