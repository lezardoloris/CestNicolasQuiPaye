import { db } from '@/lib/db';
import { ipFourPositionVotes, fourPositionVotes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashIpWithSalt, getDailySalt, getClientIp } from '@/lib/utils/ip-hash';

/**
 * Migrate anonymous 4-position votes to a newly registered user's account.
 * Uses the current day's salt to find matching anonymous votes from the same IP.
 * Idempotent: skips any submissions where the user already has a vote.
 *
 * @returns The number of votes successfully migrated
 */
export async function migrateAnonymousVotes(
  userId: string,
  clientIp: string,
): Promise<number> {
  const currentSalt = getDailySalt();
  const currentHash = hashIpWithSalt(clientIp, currentSalt);

  // Find all non-migrated anonymous votes matching current day's IP hash
  const anonymousVotes = await db
    .select()
    .from(ipFourPositionVotes)
    .where(
      and(
        eq(ipFourPositionVotes.ipHash, currentHash),
        eq(ipFourPositionVotes.isMigrated, false),
      ),
    );

  if (anonymousVotes.length === 0) return 0;

  let migratedCount = 0;

  for (const anonVote of anonymousVotes) {
    // Check if user already has a vote on this submission (idempotent)
    const [existing] = await db
      .select({ id: fourPositionVotes.id })
      .from(fourPositionVotes)
      .where(
        and(
          eq(fourPositionVotes.userId, userId),
          eq(fourPositionVotes.submissionId, anonVote.submissionId),
        ),
      )
      .limit(1);

    if (existing) continue; // Skip — already has a vote

    // Create authenticated vote from anonymous vote
    await db.insert(fourPositionVotes).values({
      userId,
      submissionId: anonVote.submissionId,
      position: anonVote.position,
      createdAt: anonVote.createdAt,
      updatedAt: new Date(),
    });

    // Mark anonymous vote as migrated (soft-delete for audit)
    await db
      .update(ipFourPositionVotes)
      .set({ isMigrated: true, updatedAt: new Date() })
      .where(eq(ipFourPositionVotes.id, anonVote.id));

    migratedCount++;
  }

  return migratedCount;
}

/**
 * Extract client IP from a Request object for migration purposes.
 */
export { getClientIp };
