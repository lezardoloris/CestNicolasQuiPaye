import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { featureVotes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { featureVoteStatusUpdateSchema } from '@/lib/utils/validation';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return apiError('FORBIDDEN', 'Acces reserve aux administrateurs', 403);
  }

  try {
    const body = await request.json();
    const parsed = featureVoteStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Donnees invalides', 400, {
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    // Verify feature exists
    const feature = await db.query.featureVotes.findFirst({
      where: eq(featureVotes.id, id),
    });

    if (!feature) {
      return apiError('NOT_FOUND', 'Proposition introuvable', 404);
    }

    const [updated] = await db
      .update(featureVotes)
      .set({
        status: parsed.data.status,
        rejectionReason: parsed.data.rejectionReason ?? null,
        updatedAt: new Date(),
      })
      .where(eq(featureVotes.id, id))
      .returning();

    return apiSuccess(updated);
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
