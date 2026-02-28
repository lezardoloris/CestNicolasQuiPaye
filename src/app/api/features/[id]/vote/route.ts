import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { featureVotes, featureVoteBallots } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { featureVoteBallotSchema } from '@/lib/utils/validation';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return apiError('UNAUTHORIZED', 'Authentification requise', 401);
  }

  const rateLimited = await checkRateLimit('vote', session.user.id!);
  if (rateLimited) {
    return apiError('RATE_LIMITED', rateLimited, 429);
  }

  try {
    const body = await request.json();
    const parsed = featureVoteBallotSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Donnees invalides', 400, {
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    // Verify feature exists
    const feature = await db.query.featureVotes.findFirst({
      where: eq(featureVotes.id, id),
    });

    if (!feature) {
      return apiError('NOT_FOUND', 'Proposition introuvable', 404);
    }

    const userId = session.user.id!;

    // Check existing ballot
    const existingBallot = await db.query.featureVoteBallots.findFirst({
      where: and(
        eq(featureVoteBallots.featureVoteId, id),
        eq(featureVoteBallots.userId, userId)
      ),
    });

    if (existingBallot) {
      if (existingBallot.voteValue === parsed.data.value) {
        // Toggle off - remove vote
        await db
          .delete(featureVoteBallots)
          .where(eq(featureVoteBallots.id, existingBallot.id));
      } else {
        // Switch direction
        await db
          .update(featureVoteBallots)
          .set({ voteValue: parsed.data.value })
          .where(eq(featureVoteBallots.id, existingBallot.id));
      }
    } else {
      // New vote
      await db.insert(featureVoteBallots).values({
        featureVoteId: id,
        userId,
        voteValue: parsed.data.value,
      });
    }

    // Recalculate vote count
    const [result] = await db
      .select({ total: sql<number>`coalesce(sum(${featureVoteBallots.voteValue}), 0)` })
      .from(featureVoteBallots)
      .where(eq(featureVoteBallots.featureVoteId, id));

    const newCount = result?.total ?? 0;

    await db
      .update(featureVotes)
      .set({ voteCount: newCount, updatedAt: new Date() })
      .where(eq(featureVotes.id, id));

    // Get current user ballot
    const currentBallot = await db.query.featureVoteBallots.findFirst({
      where: and(
        eq(featureVoteBallots.featureVoteId, id),
        eq(featureVoteBallots.userId, userId)
      ),
    });

    return apiSuccess({
      featureVoteId: id,
      voteCount: newCount,
      userVote: currentBallot?.voteValue ?? null,
    });
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
