import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { solutions, submissions } from '@/lib/db/schema';
import { eq, desc, isNull, and, sql } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { createSolutionSchema, isValidUUID } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';

/**
 * GET /api/submissions/[id]/solutions
 * List all solutions for a submission, sorted by upvotes desc.
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
    .from(solutions)
    .where(and(eq(solutions.submissionId, submissionId), isNull(solutions.deletedAt)))
    .orderBy(desc(solutions.upvoteCount));

  return apiSuccess(results);
}

/**
 * POST /api/submissions/[id]/solutions
 * Create a new solution. Open to everyone.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
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
  const parsed = createSolutionSchema.safeParse(rawBody);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
  }

  const authorId = session?.user?.id ?? null;
  const authorDisplay = session?.user?.name ?? 'Citoyen Anonyme';

  const [solution] = await db
    .insert(solutions)
    .values({
      submissionId,
      authorId,
      authorDisplay,
      body: parsed.data.body,
    })
    .returning();

  // Award XP for proposing a solution (authenticated only)
  let xp = null;
  if (authorId) {
    const { awardXp } = await import('@/lib/gamification/xp-engine');
    const { formatXpResponse } = await import('@/lib/gamification/xp-response');
    const xpResult = await awardXp(authorId, 'solution_proposed', solution.id, 'solution');
    xp = formatXpResponse(xpResult);
  }

  // Recalculate maturity
  import('@/lib/api/maturity').then(({ recalculateMaturity }) =>
    recalculateMaturity(submissionId).catch(() => {}),
  );

  // Fire-and-forget: enrich AI solution summary at thresholds (3, 5, 10)
  const SOLUTION_THRESHOLDS = [3, 5, 10];
  db.select({ count: sql<number>`count(*)::int` })
    .from(solutions)
    .where(and(eq(solutions.submissionId, submissionId), isNull(solutions.deletedAt)))
    .then(async ([{ count }]) => {
      if (!SOLUTION_THRESHOLDS.includes(count)) return;
      const [sub] = await db
        .select({ title: submissions.title })
        .from(submissions)
        .where(eq(submissions.id, submissionId))
        .limit(1);
      if (!sub) return;
      const allSolutions = await db
        .select({
          body: solutions.body,
          authorDisplay: solutions.authorDisplay,
          upvoteCount: solutions.upvoteCount,
        })
        .from(solutions)
        .where(and(eq(solutions.submissionId, submissionId), isNull(solutions.deletedAt)))
        .orderBy(desc(solutions.upvoteCount));
      const { enrichSolutionSummary } = await import('@/lib/api/ai-enrich');
      await enrichSolutionSummary(submissionId, sub.title, allSolutions);
    })
    .catch(() => {});

  return apiSuccess({ ...solution, xp }, {}, 201);
}
