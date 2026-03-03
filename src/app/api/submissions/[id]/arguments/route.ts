import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { submissionArguments } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { createArgumentSchema, isValidUUID } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';

/**
 * GET /api/submissions/[id]/arguments
 * List all arguments for a submission, sorted by net score desc.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: submissionId } = await params;

  if (!isValidUUID(submissionId)) {
    return apiError('VALIDATION_ERROR', 'ID de soumission invalide', 400);
  }

  const results = await db
    .select()
    .from(submissionArguments)
    .where(eq(submissionArguments.submissionId, submissionId))
    .orderBy(desc(sql`${submissionArguments.upvoteCount} - ${submissionArguments.downvoteCount}`));

  return apiSuccess(results);
}

/**
 * POST /api/submissions/[id]/arguments
 * Create a new argument (pour or contre). Requires authentication.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return apiError('UNAUTHORIZED', 'Connectez-vous pour proposer un argument', 401);
  }

  const ip = getClientIp(request.headers);
  const rateLimitError = await checkRateLimit('comment', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  const { id: submissionId } = await params;

  if (!isValidUUID(submissionId)) {
    return apiError('VALIDATION_ERROR', 'ID de soumission invalide', 400);
  }

  const rawBody = await request.json();
  const parsed = createArgumentSchema.safeParse(rawBody);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
  }

  const [argument] = await db
    .insert(submissionArguments)
    .values({
      submissionId,
      authorId: session.user.id,
      authorDisplay: session.user.name ?? 'Citoyen Anonyme',
      type: parsed.data.type,
      body: parsed.data.body,
    })
    .returning();

  // Award XP
  let xp = null;
  const { awardXp } = await import('@/lib/gamification/xp-engine');
  const { formatXpResponse } = await import('@/lib/gamification/xp-response');
  const xpResult = await awardXp(session.user.id, 'argument_proposed', argument.id, 'argument');
  xp = formatXpResponse(xpResult);

  return apiSuccess({ ...argument, xp }, {}, 201);
}
