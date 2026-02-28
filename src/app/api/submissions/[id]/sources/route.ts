import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { submissionSources } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { addSourceSchema, isValidUUID } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';

/**
 * GET /api/submissions/[id]/sources
 * List all sources for a submission, sorted by validation count desc.
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
    .from(submissionSources)
    .where(eq(submissionSources.submissionId, submissionId))
    .orderBy(desc(submissionSources.validationCount));

  return apiSuccess(results);
}

/**
 * POST /api/submissions/[id]/sources
 * Add a new source to a submission.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const ip = getClientIp(request.headers);

  const rateLimitError = await checkRateLimit('source', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  const { id: submissionId } = await params;

  if (!isValidUUID(submissionId)) {
    return apiError('VALIDATION_ERROR', 'ID de soumission invalide', 400);
  }

  const rawBody = await request.json();
  const parsed = addSourceSchema.safeParse(rawBody);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
  }

  const addedBy = session?.user?.id ?? null;

  try {
    const [source] = await db
      .insert(submissionSources)
      .values({
        submissionId,
        url: parsed.data.url,
        title: parsed.data.title,
        sourceType: parsed.data.sourceType,
        addedBy,
      })
      .returning();

    // Award XP for adding a source (authenticated only)
    let xp = null;
    if (addedBy) {
      const { awardXp } = await import('@/lib/gamification/xp-engine');
      const { formatXpResponse } = await import('@/lib/gamification/xp-response');
      const xpResult = await awardXp(addedBy, 'source_added', source.id, 'source');
      xp = formatXpResponse(xpResult);

      // Check cross-reference bonus: 2+ distinct source types on this submission
      const allSources = await db
        .select({ sourceType: submissionSources.sourceType })
        .from(submissionSources)
        .where(eq(submissionSources.submissionId, submissionId));
      const distinctTypes = new Set(allSources.map((s) => s.sourceType));
      if (distinctTypes.size >= 2) {
        // Award cross-reference bonus to the submission author
        const { submissions } = await import('@/lib/db/schema');
        const [sub] = await db
          .select({ authorId: submissions.authorId })
          .from(submissions)
          .where(eq(submissions.id, submissionId))
          .limit(1);
        if (sub?.authorId) {
          await awardXp(sub.authorId, 'cross_reference_bonus', submissionId, 'submission');
        }
      }
    }

    return apiSuccess({ ...source, xp }, {}, 201);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes('idx_submission_sources_url_submission')
    ) {
      return apiError('DUPLICATE', 'Cette source a deja ete ajoutee', 409);
    }
    console.error('Add source error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors de l\'ajout de la source', 500);
  }
}
