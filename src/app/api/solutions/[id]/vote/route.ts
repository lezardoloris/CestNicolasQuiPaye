import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { solutionVotes, solutions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { voteSchema, isValidUUID } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import { getHashedIp } from '@/lib/utils/ip-hash';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const ip = getClientIp(request.headers);

  const rateLimitError = await checkRateLimit('vote', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  const { id: solutionId } = await params;

  if (!isValidUUID(solutionId)) {
    return apiError('VALIDATION_ERROR', 'ID de solution invalide', 400);
  }

  const body = await request.json();
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Type de vote invalide', 400);
  }

  const { voteType } = parsed.data;

  try {
    const userId = session?.user?.id ?? null;
    const ipHash = !userId ? getHashedIp(request) : null;

    // Find existing vote
    const whereClause = userId
      ? and(eq(solutionVotes.userId, userId), eq(solutionVotes.solutionId, solutionId))
      : and(eq(solutionVotes.ipHash, ipHash!), eq(solutionVotes.solutionId, solutionId));

    const existing = await db
      .select()
      .from(solutionVotes)
      .where(whereClause)
      .limit(1);

    const existingVote = existing[0];

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off
        await db.delete(solutionVotes).where(eq(solutionVotes.id, existingVote.id));
        if (voteType === 'up') {
          await db.update(solutions).set({
            upvoteCount: sql`${solutions.upvoteCount} - 1`,
          }).where(eq(solutions.id, solutionId));
        } else {
          await db.update(solutions).set({
            downvoteCount: sql`${solutions.downvoteCount} - 1`,
          }).where(eq(solutions.id, solutionId));
        }
        return apiSuccess({ userVote: null });
      } else {
        // Switch
        await db.update(solutionVotes)
          .set({ voteType, createdAt: new Date() })
          .where(eq(solutionVotes.id, existingVote.id));
        if (voteType === 'up') {
          await db.update(solutions).set({
            upvoteCount: sql`${solutions.upvoteCount} + 1`,
            downvoteCount: sql`${solutions.downvoteCount} - 1`,
          }).where(eq(solutions.id, solutionId));
        } else {
          await db.update(solutions).set({
            upvoteCount: sql`${solutions.upvoteCount} - 1`,
            downvoteCount: sql`${solutions.downvoteCount} + 1`,
          }).where(eq(solutions.id, solutionId));
        }
        return apiSuccess({ userVote: voteType });
      }
    } else {
      // New vote
      await db.insert(solutionVotes).values({
        solutionId,
        userId,
        ipHash,
        voteType,
      });
      if (voteType === 'up') {
        await db.update(solutions).set({
          upvoteCount: sql`${solutions.upvoteCount} + 1`,
        }).where(eq(solutions.id, solutionId));
        // Award XP to solution author for upvote (not self-vote)
        if (userId) {
          const sol = await db.select({ authorId: solutions.authorId }).from(solutions).where(eq(solutions.id, solutionId)).limit(1);
          if (sol[0]?.authorId && sol[0].authorId !== userId) {
            const { awardXp } = await import('@/lib/gamification/xp-engine');
            await awardXp(sol[0].authorId, 'solution_upvoted', solutionId, 'solution');
          }
        }
      } else {
        await db.update(solutions).set({
          downvoteCount: sql`${solutions.downvoteCount} + 1`,
        }).where(eq(solutions.id, solutionId));
      }
      return apiSuccess({ userVote: voteType });
    }
  } catch (error) {
    console.error('Solution vote error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors du vote', 500);
  }
}
