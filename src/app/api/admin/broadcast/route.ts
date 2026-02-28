import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { broadcasts, submissions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { broadcastSchema } from '@/lib/utils/validation';
import { auth } from '@/lib/auth';
import { postTweet } from '@/lib/twitter/client';

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return apiError('FORBIDDEN', 'Acces reserve aux administrateurs', 403);
  }

  try {
    const history = await db
      .select({
        id: broadcasts.id,
        tweetText: broadcasts.tweetText,
        tweetUrl: broadcasts.tweetUrl,
        status: broadcasts.status,
        sentAt: broadcasts.sentAt,
        createdAt: broadcasts.createdAt,
        submissionTitle: submissions.title,
      })
      .from(broadcasts)
      .innerJoin(submissions, eq(broadcasts.submissionId, submissions.id))
      .orderBy(desc(broadcasts.createdAt))
      .limit(50);

    return apiSuccess(history);
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return apiError('FORBIDDEN', 'Acces reserve aux administrateurs', 403);
  }

  try {
    const body = await request.json();
    const parsed = broadcastSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Donnees invalides', 400, {
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    // Verify submission exists and is approved
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, parsed.data.submissionId),
    });

    if (!submission) {
      return apiError('NOT_FOUND', 'Soumission introuvable', 404);
    }

    if (submission.moderationStatus !== 'approved') {
      return apiError(
        'VALIDATION_ERROR',
        'Seules les soumissions approuvees peuvent etre diffusees',
        400
      );
    }

    // Create broadcast record
    const [broadcast] = await db
      .insert(broadcasts)
      .values({
        submissionId: parsed.data.submissionId,
        adminUserId: session.user.id!,
        tweetText: parsed.data.tweetText,
        status: 'draft',
      })
      .returning();

    // Post tweet
    const result = await postTweet(parsed.data.tweetText);

    if (result.success) {
      await db
        .update(broadcasts)
        .set({
          status: 'sent',
          tweetUrl: result.tweetUrl ?? null,
          sentAt: new Date(),
        })
        .where(eq(broadcasts.id, broadcast.id));

      // Update submission tweetUrl
      if (result.tweetUrl) {
        await db
          .update(submissions)
          .set({ tweetUrl: result.tweetUrl })
          .where(eq(submissions.id, parsed.data.submissionId));
      }

      return apiSuccess({
        id: broadcast.id,
        status: 'sent',
        tweetUrl: result.tweetUrl,
      }, {}, 201);
    } else {
      await db
        .update(broadcasts)
        .set({ status: 'failed' })
        .where(eq(broadcasts.id, broadcast.id));

      return apiError(
        'EXTERNAL_ERROR',
        result.error || 'Echec de la publication du tweet',
        502
      );
    }
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
