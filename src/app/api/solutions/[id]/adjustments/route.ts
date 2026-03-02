import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { comments, solutions, submissions } from '@/lib/db/schema';
import { eq, and, isNull, asc, sql } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { createAdjustmentSchema, isValidUUID } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';

/**
 * GET /api/solutions/[id]/adjustments
 * List adjustment suggestions for a solution.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id: solutionId } = await params;

  if (!isValidUUID(solutionId)) {
    return apiError('VALIDATION_ERROR', 'ID de solution invalide', 400);
  }

  const results = await db
    .select({
      id: comments.id,
      authorDisplay: comments.authorDisplay,
      body: comments.body,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .where(and(eq(comments.solutionId, solutionId), isNull(comments.deletedAt)))
    .orderBy(asc(comments.createdAt));

  return apiSuccess(results);
}

/**
 * POST /api/solutions/[id]/adjustments
 * Create an adjustment suggestion on a solution.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth();
  const ip = getClientIp(request.headers);

  const rateLimitError = await checkRateLimit('comment', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  const { id: solutionId } = await params;

  if (!isValidUUID(solutionId)) {
    return apiError('VALIDATION_ERROR', 'ID de solution invalide', 400);
  }

  const rawBody = await request.json();
  const parsed = createAdjustmentSchema.safeParse(rawBody);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
  }

  // Look up the solution to get submissionId (required FK on comments)
  const [solution] = await db
    .select({ submissionId: solutions.submissionId })
    .from(solutions)
    .where(eq(solutions.id, solutionId))
    .limit(1);

  if (!solution) {
    return apiError('NOT_FOUND', 'Solution introuvable', 404);
  }

  const authorId = session?.user?.id ?? null;
  const authorDisplay = session?.user?.name ?? 'Citoyen Anonyme';

  const [comment] = await db
    .insert(comments)
    .values({
      submissionId: solution.submissionId,
      solutionId,
      authorId,
      authorDisplay,
      body: parsed.data.body,
    })
    .returning();

  // Increment denormalized comment count on submission
  await db
    .update(submissions)
    .set({ commentCount: sql`${submissions.commentCount} + 1` })
    .where(eq(submissions.id, solution.submissionId));

  return apiSuccess(comment, {}, 201);
}
