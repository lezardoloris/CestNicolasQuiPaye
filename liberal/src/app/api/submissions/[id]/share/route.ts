import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { shareEvents, submissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { shareEventSchema } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Rate limit
  const ip = getClientIp(request.headers);
  const rateLimited = await checkRateLimit('api', ip);
  if (rateLimited) {
    return apiError('RATE_LIMITED', rateLimited, 429);
  }

  try {
    const body = await request.json();
    const parsed = shareEventSchema.safeParse({ submissionId: id, ...body });

    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Donnees invalides', 400, {
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    // Verify submission exists
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, id),
      columns: { id: true },
    });

    if (!submission) {
      return apiError('NOT_FOUND', 'Soumission introuvable', 404);
    }

    // Insert share event
    await db.insert(shareEvents).values({
      submissionId: id,
      platform: parsed.data.platform,
    });

    return apiSuccess({ ok: true }, {}, 201);
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
