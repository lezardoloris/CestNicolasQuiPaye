import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { isValidUUID } from '@/lib/utils/validation';
import { ensureAiContext } from '@/lib/api/ai-context';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiContexts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/submissions/[id]/ai-context
 * Returns AI-generated context for a submission (auto-generates if missing).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: submissionId } = await params;

  if (!isValidUUID(submissionId)) {
    return apiError('VALIDATION_ERROR', 'ID de soumission invalide', 400);
  }

  try {
    const context = await ensureAiContext(submissionId);
    return apiSuccess(context);
  } catch (error) {
    console.error('AI context GET error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors de la génération du contexte', 500);
  }
}

/**
 * PATCH /api/submissions/[id]/ai-context
 * Admin-only: edit or approve AI context.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: submissionId } = await params;

  if (!isValidUUID(submissionId)) {
    return apiError('VALIDATION_ERROR', 'ID de soumission invalide', 400);
  }

  const session = await auth();
  if (
    !session?.user ||
    (session.user as { role?: string }).role !== 'admin'
  ) {
    return apiError('UNAUTHORIZED', 'Accès réservé aux administrateurs', 403);
  }

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.budgetContext === 'string') updates.budgetContext = body.budgetContext;
    if (typeof body.costComparison === 'string') updates.costComparison = body.costComparison;
    if (typeof body.summary === 'string') updates.summary = body.summary;
    if (Array.isArray(body.relatedFacts)) updates.relatedFacts = body.relatedFacts;

    if (body.approve === true) {
      updates.status = 'approved';
      updates.approvedBy = session.user.id;
      updates.approvedAt = new Date();
      updates.source = 'admin';
    } else if (body.reject === true) {
      updates.status = 'rejected';
    }

    const [updated] = await db
      .update(aiContexts)
      .set(updates)
      .where(eq(aiContexts.submissionId, submissionId))
      .returning();

    if (!updated) {
      return apiError('NOT_FOUND', 'Contexte IA non trouvé', 404);
    }

    return apiSuccess(updated);
  } catch (error) {
    console.error('AI context PATCH error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors de la mise à jour', 500);
  }
}
