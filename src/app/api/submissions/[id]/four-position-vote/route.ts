import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api/response';
import { fourPositionVoteSchema, isValidUUID } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import { getClientIp as getClientIpFromRequest, hashIpWithDailySalt } from '@/lib/utils/ip-hash';
import { db } from '@/lib/db';
import {
  submissions,
  fourPositionVotes,
  ipFourPositionVotes,
  votes,
} from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { calculateConsensus } from '@/lib/utils/consensus';

/**
 * Cast a 4-position vote on a submission.
 * Works for both authenticated users (fourPositionVotes) and anonymous users (ipFourPositionVotes).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id: submissionId } = await params;

  if (!isValidUUID(submissionId)) {
    return apiError('VALIDATION_ERROR', 'ID de soumission invalide', 400);
  }

  // Rate limiting by IP (stricter for anonymous)
  const ip = getClientIp(request.headers);
  const limiterKey = session?.user?.id ? 'vote' : 'anonymousVote';
  const rateLimitError = await checkRateLimit(limiterKey, ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  const body = await request.json();
  const parsed = fourPositionVoteSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Position de vote invalide', 400);
  }

  const { position } = parsed.data;

  try {
    // Verify submission exists
    const [submission] = await db
      .select({ id: submissions.id, title: submissions.title, consensusType: submissions.consensusType })
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1);

    if (!submission) {
      return apiError('NOT_FOUND', 'Dépense introuvable', 404);
    }

    let isNew: boolean;

    if (session?.user?.id) {
      // Authenticated user: upsert into fourPositionVotes
      const [existing] = await db
        .select()
        .from(fourPositionVotes)
        .where(
          and(
            eq(fourPositionVotes.userId, session.user.id),
            eq(fourPositionVotes.submissionId, submissionId),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .update(fourPositionVotes)
          .set({ position, updatedAt: new Date() })
          .where(eq(fourPositionVotes.id, existing.id));
        isNew = false;
      } else {
        await db.insert(fourPositionVotes).values({
          userId: session.user.id,
          submissionId,
          position,
        });
        isNew = true;
      }

      // Award XP for authenticated votes
      if (isNew) {
        const { awardXp } = await import('@/lib/gamification/xp-engine');
        await awardXp(session.user.id, 'vote_cast', submissionId, 'submission');

        // Supersede any old binary vote on this submission
        await db
          .update(votes)
          .set({ superseded: true })
          .where(
            and(
              eq(votes.userId, session.user.id),
              eq(votes.submissionId, submissionId),
              eq(votes.superseded, false),
            ),
          );
      }
    } else {
      // Anonymous user: upsert into ipFourPositionVotes with daily salt
      const rawIp = getClientIpFromRequest(request);
      const { hash: ipHash, salt } = hashIpWithDailySalt(rawIp);

      const [existing] = await db
        .select()
        .from(ipFourPositionVotes)
        .where(
          and(
            eq(ipFourPositionVotes.ipHash, ipHash),
            eq(ipFourPositionVotes.submissionId, submissionId),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .update(ipFourPositionVotes)
          .set({ position, updatedAt: new Date() })
          .where(eq(ipFourPositionVotes.id, existing.id));
        isNew = false;
      } else {
        await db.insert(ipFourPositionVotes).values({
          ipHash,
          salt,
          submissionId,
          position,
        });
        isNew = true;
      }
    }

    // Get updated distribution (authenticated + anonymous combined)
    const distribution = await getVoteDistribution(submissionId);

    // Update denormalized counts + consensus on submissions table
    const consensus = calculateConsensus(distribution.weighted);
    await db
      .update(submissions)
      .set({
        fourPosEssentielCount: distribution.essentiel,
        fourPosJustifieCount: distribution.justifie_ameliorable,
        fourPosDiscutableCount: distribution.discutable,
        fourPosInjustifieCount: distribution.injustifie,
        fourPosTotalCount: distribution.total,
        consensusType: consensus.type,
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, submissionId));

    // Recalculate maturity (fire-and-forget, don't block response)
    import('@/lib/api/maturity').then(({ recalculateMaturity }) =>
      recalculateMaturity(submissionId).catch(() => {}),
    );

    // Fire-and-forget: enrich AI vote summary at thresholds or on consensus change
    const VOTE_THRESHOLDS = [10, 25, 50, 100];
    const previousConsensus = submission.consensusType;
    const consensusChanged = previousConsensus !== null && previousConsensus !== consensus.type;
    if (VOTE_THRESHOLDS.includes(distribution.total) || consensusChanged) {
      import('@/lib/api/ai-enrich')
        .then(({ enrichVoteSummary }) =>
          enrichVoteSummary(submissionId, submission.title, {
            ...distribution,
            consensusType: consensus.type,
          }),
        )
        .catch(() => {});
    }

    return apiSuccess({
      position,
      isNew,
      distribution,
      consensus,
    });
  } catch (error) {
    console.error('Four-position vote error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors du vote. Réessayez.', 500);
  }
}

/**
 * Get the current user's 4-position vote on a submission.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: submissionId } = await params;

  if (!isValidUUID(submissionId)) {
    return apiError('VALIDATION_ERROR', 'ID de soumission invalide', 400);
  }

  try {
    const session = await auth();
    let userVote: string | null = null;
    let legacyVote: string | null = null;

    if (session?.user?.id) {
      const [vote] = await db
        .select({ position: fourPositionVotes.position })
        .from(fourPositionVotes)
        .where(
          and(
            eq(fourPositionVotes.userId, session.user.id),
            eq(fourPositionVotes.submissionId, submissionId),
          ),
        )
        .limit(1);
      userVote = vote?.position ?? null;

      // Check for legacy binary vote (for migration badge)
      if (!userVote) {
        const [binaryVote] = await db
          .select({ voteType: votes.voteType })
          .from(votes)
          .where(
            and(
              eq(votes.userId, session.user.id),
              eq(votes.submissionId, submissionId),
              eq(votes.superseded, false),
            ),
          )
          .limit(1);
        legacyVote = binaryVote?.voteType ?? null;
      }
    } else {
      const rawIp = getClientIpFromRequest(request);
      const { hash: ipHash } = hashIpWithDailySalt(rawIp);
      const [vote] = await db
        .select({ position: ipFourPositionVotes.position })
        .from(ipFourPositionVotes)
        .where(
          and(
            eq(ipFourPositionVotes.ipHash, ipHash),
            eq(ipFourPositionVotes.submissionId, submissionId),
          ),
        )
        .limit(1);
      userVote = vote?.position ?? null;
    }

    const distribution = await getVoteDistribution(submissionId);
    const consensus = calculateConsensus(distribution.weighted);

    return apiSuccess({
      userVote,
      legacyVote,
      distribution,
      consensus,
    });
  } catch (error) {
    console.error('Four-position vote GET error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors du chargement du vote', 500);
  }
}

/**
 * Get combined vote distribution from both authenticated and anonymous tables.
 * Anonymous votes count 0.5x weight.
 */
async function getVoteDistribution(submissionId: string): Promise<{
  essentiel: number;
  justifie_ameliorable: number;
  discutable: number;
  injustifie: number;
  total: number;
  weighted: {
    essentiel: number;
    justifie_ameliorable: number;
    discutable: number;
    injustifie: number;
    total: number;
  };
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

  const rawCounts = {
    essentiel: 0,
    justifie_ameliorable: 0,
    discutable: 0,
    injustifie: 0,
  };

  const weightedCounts = {
    essentiel: 0,
    justifie_ameliorable: 0,
    discutable: 0,
    injustifie: 0,
  };

  for (const row of authCounts) {
    const key = row.position as keyof typeof rawCounts;
    rawCounts[key] += row.count;
    weightedCounts[key] += row.count; // 1.0x weight
  }

  for (const row of anonCounts) {
    const key = row.position as keyof typeof rawCounts;
    rawCounts[key] += row.count;
    weightedCounts[key] += row.count * 0.5; // 0.5x weight
  }

  const total = Object.values(rawCounts).reduce((a, b) => a + b, 0);
  const weightedTotal = Object.values(weightedCounts).reduce((a, b) => a + b, 0);

  return {
    ...rawCounts,
    total,
    weighted: {
      ...weightedCounts,
      total: weightedTotal,
    },
  };
}
