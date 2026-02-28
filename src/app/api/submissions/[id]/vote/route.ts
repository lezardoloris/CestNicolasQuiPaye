import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { castVote, removeVote } from '@/lib/api/votes';
import { castIpVote, removeIpVote } from '@/lib/api/ip-votes';
import { apiSuccess, apiError } from '@/lib/api/response';
import { voteSchema, isValidUUID } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import { getHashedIp } from '@/lib/utils/ip-hash';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  // Rate limiting (always by IP)
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
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Type de vote invalide', 400);
  }

  const { voteType } = parsed.data;

  try {
    let result;

    if (session?.user?.id) {
      result = await castVote(session.user.id, submissionId, voteType);
    } else {
      const ipHash = getHashedIp(request);
      result = await castIpVote(ipHash, submissionId, voteType);
    }

    const [submission] = await db
      .select({
        upvoteCount: submissions.upvoteCount,
        downvoteCount: submissions.downvoteCount,
      })
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1);

    // Award XP (authenticated only)
    let xp = null;
    if (session?.user?.id) {
      const { awardXp } = await import('@/lib/gamification/xp-engine');
      const xpResult = await awardXp(session.user.id, 'vote_cast', submissionId, 'submission');
      xp = xpResult.awarded ? { amount: xpResult.xpAmount + (xpResult.dailyBonusAwarded ? xpResult.dailyBonusXp : 0), total: xpResult.totalXp, leveledUp: xpResult.leveledUp, newLevel: xpResult.newLevel, newLevelTitle: xpResult.newLevelTitle, streak: xpResult.currentStreak } : null;

      // Award author XP on upvote (no self-vote)
      if (voteType === 'up') {
        const [sub] = await db
          .select({ authorId: submissions.authorId })
          .from(submissions)
          .where(eq(submissions.id, submissionId))
          .limit(1);
        if (sub?.authorId && sub.authorId !== session.user.id) {
          await awardXp(sub.authorId, 'upvote_received', submissionId, 'submission');
        }
      }
    }

    return apiSuccess({
      upvoteCount: submission?.upvoteCount ?? 0,
      downvoteCount: submission?.downvoteCount ?? 0,
      userVote: result.userVote,
      xp,
    });
  } catch (error) {
    console.error('Vote error:', error);
    return apiError(
      'INTERNAL_ERROR',
      'Erreur lors du vote. Reessayez.',
      500,
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id: submissionId } = await params;

  if (!isValidUUID(submissionId)) {
    return apiError('VALIDATION_ERROR', 'ID de soumission invalide', 400);
  }

  try {
    if (session?.user?.id) {
      await removeVote(session.user.id, submissionId);
    } else {
      const ipHash = getHashedIp(request);
      await removeIpVote(ipHash, submissionId);
    }

    const [submission] = await db
      .select({
        upvoteCount: submissions.upvoteCount,
        downvoteCount: submissions.downvoteCount,
      })
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1);

    return apiSuccess({
      upvoteCount: submission?.upvoteCount ?? 0,
      downvoteCount: submission?.downvoteCount ?? 0,
      userVote: null,
    });
  } catch (error) {
    console.error('Vote removal error:', error);
    return apiError(
      'INTERNAL_ERROR',
      'Erreur lors de la suppression du vote',
      500,
    );
  }
}
