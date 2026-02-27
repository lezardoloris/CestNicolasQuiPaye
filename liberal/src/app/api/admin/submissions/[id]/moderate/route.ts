import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { submissions, moderationActions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { moderationActionSchema } from '@/lib/utils/validation';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return apiError('UNAUTHORIZED', 'Authentification requise', 401);
  }

  if (!['admin', 'moderator'].includes(session.user.role as string)) {
    return apiError('FORBIDDEN', 'Acces refuse', 403);
  }

  try {
    const body = await request.json();
    const parsed = moderationActionSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Donnees invalides', 400, {
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    // Verify submission exists
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, id),
    });

    if (!submission) {
      return apiError('NOT_FOUND', 'Soumission introuvable', 404);
    }

    // Only admin can remove
    if (
      parsed.data.action === 'remove' &&
      session.user.role !== 'admin'
    ) {
      return apiError(
        'FORBIDDEN',
        'Seuls les administrateurs peuvent retirer un signalement',
        403
      );
    }

    // Map action to moderation status
    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      request_edit: 'pending', // stays pending for re-edit
      remove: 'flagged', // or use a 'removed' status
    };

    const newStatus = statusMap[parsed.data.action] ?? 'pending';

    // Update submission status
    await db
      .update(submissions)
      .set({
        moderationStatus: newStatus as typeof submission.moderationStatus,
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, id));

    // Insert moderation action
    await db.insert(moderationActions).values({
      submissionId: id,
      adminUserId: session.user.id!,
      action: parsed.data.action,
      reason: parsed.data.reason ?? null,
    });

    return apiSuccess({
      id,
      action: parsed.data.action,
      newStatus,
    });
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
