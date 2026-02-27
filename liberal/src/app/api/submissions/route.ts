import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { submissionFormSchema } from '@/lib/utils/validation';
import { isTweetUrl, normalizeTweetUrl } from '@/lib/utils/tweet-detector';
import { apiSuccess, apiError } from '@/lib/api/response';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ip = getClientIp(request.headers);

    // Rate limit: authenticated 5/24h, anonymous 2/24h
    const rateLimitError = await checkRateLimit('submission', ip);
    if (rateLimitError) {
      return apiError('RATE_LIMITED', rateLimitError, 429);
    }

    const body = await request.json();
    const result = submissionFormSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      return apiError('VALIDATION_ERROR', 'Donnees invalides', 400, { fieldErrors });
    }

    const { title, description, estimatedCostEur, sourceUrl } = result.data;

    const tweetUrl = isTweetUrl(sourceUrl)
      ? normalizeTweetUrl(sourceUrl)
      : null;

    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 200);

    // Determine author info
    const authorId = session?.user?.id ?? null;
    const authorDisplay = session?.user?.name ?? 'Citoyen Anonyme';

    // All submissions go to moderation before publication
    const moderationStatus = 'pending';

    const [submission] = await db
      .insert(submissions)
      .values({
        authorId,
        authorDisplay,
        title,
        slug,
        description,
        sourceUrl,
        tweetUrl,
        amount: String(estimatedCostEur),
        status: 'published',
        moderationStatus,
      })
      .returning();

    return apiSuccess(submission, {}, 201);
  } catch (error) {
    console.error('Submission creation error:', error);
    return apiError(
      'INTERNAL_ERROR',
      'Une erreur est survenue. Veuillez reessayer.',
      500,
    );
  }
}
