import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api/response';
import { criteriaVoteSchema, isValidUUID } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import { getHashedIp } from '@/lib/utils/ip-hash';
import { db } from '@/lib/db';
import { criteriaVotes, ipCriteriaVotes } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

type CriterionKey = 'proportional' | 'legitimate' | 'alternative';

interface CriterionAggregates {
  yes: number;
  no: number;
  userVote: boolean | null;
}

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

    // Aggregate counts from both tables
    const aggregates = await db
      .select({
        criterion: criteriaVotes.criterion,
        yes: sql<number>`count(*) filter (where ${criteriaVotes.value} = true)`,
        no: sql<number>`count(*) filter (where ${criteriaVotes.value} = false)`,
      })
      .from(criteriaVotes)
      .where(eq(criteriaVotes.submissionId, submissionId))
      .groupBy(criteriaVotes.criterion);

    const ipAggregates = await db
      .select({
        criterion: ipCriteriaVotes.criterion,
        yes: sql<number>`count(*) filter (where ${ipCriteriaVotes.value} = true)`,
        no: sql<number>`count(*) filter (where ${ipCriteriaVotes.value} = false)`,
      })
      .from(ipCriteriaVotes)
      .where(eq(ipCriteriaVotes.submissionId, submissionId))
      .groupBy(ipCriteriaVotes.criterion);

    // Merge counts
    const criteria: Record<CriterionKey, CriterionAggregates> = {
      proportional: { yes: 0, no: 0, userVote: null },
      legitimate: { yes: 0, no: 0, userVote: null },
      alternative: { yes: 0, no: 0, userVote: null },
    };

    for (const row of aggregates) {
      const key = row.criterion as CriterionKey;
      if (criteria[key]) {
        criteria[key].yes += Number(row.yes);
        criteria[key].no += Number(row.no);
      }
    }

    for (const row of ipAggregates) {
      const key = row.criterion as CriterionKey;
      if (criteria[key]) {
        criteria[key].yes += Number(row.yes);
        criteria[key].no += Number(row.no);
      }
    }

    // Get current user's votes
    if (session?.user?.id) {
      const userVotes = await db
        .select({ criterion: criteriaVotes.criterion, value: criteriaVotes.value })
        .from(criteriaVotes)
        .where(
          and(
            eq(criteriaVotes.submissionId, submissionId),
            eq(criteriaVotes.userId, session.user.id),
          ),
        );
      for (const v of userVotes) {
        const key = v.criterion as CriterionKey;
        if (criteria[key]) criteria[key].userVote = v.value;
      }
    } else {
      const ipHash = getHashedIp(request);
      const ipUserVotes = await db
        .select({ criterion: ipCriteriaVotes.criterion, value: ipCriteriaVotes.value })
        .from(ipCriteriaVotes)
        .where(
          and(
            eq(ipCriteriaVotes.submissionId, submissionId),
            eq(ipCriteriaVotes.ipHash, ipHash),
          ),
        );
      for (const v of ipUserVotes) {
        const key = v.criterion as CriterionKey;
        if (criteria[key]) criteria[key].userVote = v.value;
      }
    }

    return apiSuccess({ criteria });
  } catch (error) {
    console.error('Criteria vote GET error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors du chargement des évaluations', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  // Rate limiting
  const ip = getClientIp(request.headers);
  const rateLimitError = await checkRateLimit('vote', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  const { id: submissionId } = await params;

  if (!isValidUUID(submissionId)) {
    return apiError('VALIDATION_ERROR', 'ID de soumission invalide', 400);
  }

  const body = await request.json();
  const parsed = criteriaVoteSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Données de vote invalides', 400);
  }

  const { criterion, value } = parsed.data;

  try {
    let userVote: boolean | null = value;

    if (session?.user?.id) {
      // Authenticated user vote
      const [existing] = await db
        .select()
        .from(criteriaVotes)
        .where(
          and(
            eq(criteriaVotes.userId, session.user.id),
            eq(criteriaVotes.submissionId, submissionId),
            eq(criteriaVotes.criterion, criterion),
          ),
        )
        .limit(1);

      if (existing) {
        if (existing.value === value) {
          // Toggle off: same value clicked again
          await db.delete(criteriaVotes).where(eq(criteriaVotes.id, existing.id));
          userVote = null;
        } else {
          // Switch: different value
          await db
            .update(criteriaVotes)
            .set({ value })
            .where(eq(criteriaVotes.id, existing.id));
        }
      } else {
        // New vote
        await db.insert(criteriaVotes).values({
          userId: session.user.id,
          submissionId,
          criterion,
          value,
        });
      }

      // Award XP for new criteria votes
      if (userVote !== null && !existing) {
        const { awardXp } = await import('@/lib/gamification/xp-engine');
        await awardXp(session.user.id, 'criteria_vote', submissionId, 'submission');
      }
    } else {
      // Anonymous IP vote
      const ipHash = getHashedIp(request);

      const [existing] = await db
        .select()
        .from(ipCriteriaVotes)
        .where(
          and(
            eq(ipCriteriaVotes.ipHash, ipHash),
            eq(ipCriteriaVotes.submissionId, submissionId),
            eq(ipCriteriaVotes.criterion, criterion),
          ),
        )
        .limit(1);

      if (existing) {
        if (existing.value === value) {
          await db.delete(ipCriteriaVotes).where(eq(ipCriteriaVotes.id, existing.id));
          userVote = null;
        } else {
          await db
            .update(ipCriteriaVotes)
            .set({ value })
            .where(eq(ipCriteriaVotes.id, existing.id));
        }
      } else {
        await db.insert(ipCriteriaVotes).values({
          ipHash,
          submissionId,
          criterion,
          value,
        });
      }
    }

    return apiSuccess({ criterion, userVote });
  } catch (error) {
    console.error('Criteria vote POST error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors du vote', 500);
  }
}
