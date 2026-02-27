import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { flags, submissions } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { flagSubmissionSchema } from '@/lib/utils/validation';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

const FLAG_THRESHOLD = parseInt(process.env.FLAG_AUTO_QUEUE_THRESHOLD ?? '3');

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return apiError('UNAUTHORIZED', 'Authentification requise', 401);
  }

  const rateLimited = await checkRateLimit('api', session.user.id!);
  if (rateLimited) {
    return apiError('RATE_LIMITED', rateLimited, 429);
  }

  try {
    const body = await request.json();
    const parsed = flagSubmissionSchema.safeParse(body);

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

    // Insert flag (unique constraint will prevent duplicates)
    try {
      await db.insert(flags).values({
        submissionId: id,
        userId: session.user.id!,
        reason: parsed.data.reason,
        details: parsed.data.details ?? null,
      });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === '23505'
      ) {
        return apiError(
          'CONFLICT',
          'Vous avez deja signale ce contenu.',
          409
        );
      }
      throw err;
    }

    // Check auto-flagging threshold
    const [flagCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(flags)
      .where(eq(flags.submissionId, id));

    if ((flagCount?.count ?? 0) >= FLAG_THRESHOLD) {
      await db
        .update(submissions)
        .set({ moderationStatus: 'flagged' })
        .where(eq(submissions.id, id));
    }

    return apiSuccess(
      { ok: true },
      {},
      201
    );
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return apiSuccess({ flagged: false });
  }

  try {
    const flag = await db.query.flags.findFirst({
      where: and(
        eq(flags.submissionId, id),
        eq(flags.userId, session.user.id!)
      ),
    });

    return apiSuccess({ flagged: !!flag });
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
