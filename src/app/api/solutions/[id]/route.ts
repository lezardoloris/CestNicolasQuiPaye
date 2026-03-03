import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { solutions, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { editSolutionSchema, isValidUUID } from '@/lib/utils/validation';

/**
 * Check if the current user is the author or has admin/moderator role.
 */
async function canEditSolution(
  solutionAuthorId: string | null,
  sessionUserId: string,
): Promise<boolean> {
  if (solutionAuthorId === sessionUserId) return true;

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, sessionUserId))
    .limit(1);

  return user?.role === 'admin' || user?.role === 'moderator';
}

/**
 * PATCH /api/solutions/[id]
 * Edit a solution. Author or admin/moderator only.
 * Resets vote counts so the solution re-enters community vote workflow.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError('UNAUTHORIZED', 'Connexion requise', 401);
  }

  const { id: solutionId } = await params;
  if (!isValidUUID(solutionId)) {
    return apiError('VALIDATION_ERROR', 'ID de solution invalide', 400);
  }

  const [solution] = await db
    .select()
    .from(solutions)
    .where(eq(solutions.id, solutionId))
    .limit(1);

  if (!solution || solution.deletedAt) {
    return apiError('NOT_FOUND', 'Solution introuvable', 404);
  }

  const allowed = await canEditSolution(solution.authorId, session.user.id);
  if (!allowed) {
    return apiError('FORBIDDEN', 'Vous ne pouvez pas modifier cette solution', 403);
  }

  const rawBody = await request.json();
  const parsed = editSolutionSchema.safeParse(rawBody);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
  }

  const [updated] = await db
    .update(solutions)
    .set({
      body: parsed.data.body,
      updatedAt: new Date(),
      upvoteCount: 0,
      downvoteCount: 0,
    })
    .where(eq(solutions.id, solutionId))
    .returning();

  return apiSuccess(updated);
}

/**
 * DELETE /api/solutions/[id]
 * Soft-delete a solution. Author or admin/moderator only.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError('UNAUTHORIZED', 'Connexion requise', 401);
  }

  const { id: solutionId } = await params;
  if (!isValidUUID(solutionId)) {
    return apiError('VALIDATION_ERROR', 'ID de solution invalide', 400);
  }

  const [solution] = await db
    .select()
    .from(solutions)
    .where(eq(solutions.id, solutionId))
    .limit(1);

  if (!solution || solution.deletedAt) {
    return apiError('NOT_FOUND', 'Solution introuvable', 404);
  }

  const allowed = await canEditSolution(solution.authorId, session.user.id);
  if (!allowed) {
    return apiError('FORBIDDEN', 'Vous ne pouvez pas supprimer cette solution', 403);
  }

  await db
    .update(solutions)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(solutions.id, solutionId));

  return apiSuccess({ deleted: true });
}
