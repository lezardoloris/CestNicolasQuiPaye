import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { communityNotes, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { editCommunityNoteSchema, isValidUUID } from '@/lib/utils/validation';

/**
 * Check if the current user is the author or has admin/moderator role.
 */
async function canEditNote(
  noteAuthorId: string | null,
  sessionUserId: string,
): Promise<boolean> {
  if (noteAuthorId === sessionUserId) return true;

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, sessionUserId))
    .limit(1);

  return user?.role === 'admin' || user?.role === 'moderator';
}

/**
 * PATCH /api/notes/[id]
 * Edit a community note. Author or admin/moderator only.
 * Resets isPinned and pinnedAt so the note re-enters community validation.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError('UNAUTHORIZED', 'Connexion requise', 401);
  }

  const { id: noteId } = await params;
  if (!isValidUUID(noteId)) {
    return apiError('VALIDATION_ERROR', 'ID de note invalide', 400);
  }

  const [note] = await db
    .select()
    .from(communityNotes)
    .where(eq(communityNotes.id, noteId))
    .limit(1);

  if (!note || note.deletedAt) {
    return apiError('NOT_FOUND', 'Note introuvable', 404);
  }

  const allowed = await canEditNote(note.authorId, session.user.id);
  if (!allowed) {
    return apiError('FORBIDDEN', 'Vous ne pouvez pas modifier cette note', 403);
  }

  const rawBody = await request.json();
  const parsed = editCommunityNoteSchema.safeParse(rawBody);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
  }

  const [updated] = await db
    .update(communityNotes)
    .set({
      body: parsed.data.body,
      sourceUrl: parsed.data.sourceUrl || null,
      updatedAt: new Date(),
      isPinned: 0,
      pinnedAt: null,
    })
    .where(eq(communityNotes.id, noteId))
    .returning();

  return apiSuccess(updated);
}

/**
 * DELETE /api/notes/[id]
 * Soft-delete a community note. Author or admin/moderator only.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError('UNAUTHORIZED', 'Connexion requise', 401);
  }

  const { id: noteId } = await params;
  if (!isValidUUID(noteId)) {
    return apiError('VALIDATION_ERROR', 'ID de note invalide', 400);
  }

  const [note] = await db
    .select()
    .from(communityNotes)
    .where(eq(communityNotes.id, noteId))
    .limit(1);

  if (!note || note.deletedAt) {
    return apiError('NOT_FOUND', 'Note introuvable', 404);
  }

  const allowed = await canEditNote(note.authorId, session.user.id);
  if (!allowed) {
    return apiError('FORBIDDEN', 'Vous ne pouvez pas supprimer cette note', 403);
  }

  await db
    .update(communityNotes)
    .set({
      deletedAt: new Date(),
      isPinned: 0,
      pinnedAt: null,
    })
    .where(eq(communityNotes.id, noteId));

  return apiSuccess({ deleted: true });
}
