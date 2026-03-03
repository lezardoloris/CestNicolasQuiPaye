import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { argumentVotes, submissionArguments } from '@/lib/db/schema';
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

  const { id: argumentId } = await params;

  if (!isValidUUID(argumentId)) {
    return apiError('VALIDATION_ERROR', 'ID d\'argument invalide', 400);
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

    const whereClause = userId
      ? and(eq(argumentVotes.userId, userId), eq(argumentVotes.argumentId, argumentId))
      : and(eq(argumentVotes.ipHash, ipHash!), eq(argumentVotes.argumentId, argumentId));

    const existing = await db
      .select()
      .from(argumentVotes)
      .where(whereClause)
      .limit(1);

    const existingVote = existing[0];

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off
        await db.delete(argumentVotes).where(eq(argumentVotes.id, existingVote.id));
        if (voteType === 'up') {
          await db.update(submissionArguments).set({
            upvoteCount: sql`${submissionArguments.upvoteCount} - 1`,
          }).where(eq(submissionArguments.id, argumentId));
        } else {
          await db.update(submissionArguments).set({
            downvoteCount: sql`${submissionArguments.downvoteCount} - 1`,
          }).where(eq(submissionArguments.id, argumentId));
        }
        return apiSuccess({ userVote: null });
      } else {
        // Switch
        await db.update(argumentVotes)
          .set({ voteType, createdAt: new Date() })
          .where(eq(argumentVotes.id, existingVote.id));
        if (voteType === 'up') {
          await db.update(submissionArguments).set({
            upvoteCount: sql`${submissionArguments.upvoteCount} + 1`,
            downvoteCount: sql`${submissionArguments.downvoteCount} - 1`,
          }).where(eq(submissionArguments.id, argumentId));
        } else {
          await db.update(submissionArguments).set({
            upvoteCount: sql`${submissionArguments.upvoteCount} - 1`,
            downvoteCount: sql`${submissionArguments.downvoteCount} + 1`,
          }).where(eq(submissionArguments.id, argumentId));
        }
        return apiSuccess({ userVote: voteType });
      }
    } else {
      // New vote
      await db.insert(argumentVotes).values({
        argumentId,
        userId,
        ipHash,
        voteType,
      });
      if (voteType === 'up') {
        await db.update(submissionArguments).set({
          upvoteCount: sql`${submissionArguments.upvoteCount} + 1`,
        }).where(eq(submissionArguments.id, argumentId));
        // Award XP to argument author
        if (userId) {
          const arg = await db.select({ authorId: submissionArguments.authorId }).from(submissionArguments).where(eq(submissionArguments.id, argumentId)).limit(1);
          if (arg[0]?.authorId && arg[0].authorId !== userId) {
            const { awardXp } = await import('@/lib/gamification/xp-engine');
            await awardXp(arg[0].authorId, 'argument_upvoted', argumentId, 'argument');
          }
        }
      } else {
        await db.update(submissionArguments).set({
          downvoteCount: sql`${submissionArguments.downvoteCount} + 1`,
        }).where(eq(submissionArguments.id, argumentId));
      }
      return apiSuccess({ userVote: voteType });
    }
  } catch (error) {
    console.error('Argument vote error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors du vote', 500);
  }
}
