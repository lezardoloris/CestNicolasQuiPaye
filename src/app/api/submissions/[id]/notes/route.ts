import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { communityNotes } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { createCommunityNoteSchema, isValidUUID } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';

/**
 * GET /api/submissions/[id]/notes
 * List all community notes for a submission.
 * Pinned notes first, then sorted by score desc.
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
    .from(communityNotes)
    .where(eq(communityNotes.submissionId, submissionId))
    .orderBy(
      desc(communityNotes.isPinned),
      desc(sql`${communityNotes.upvoteCount} - ${communityNotes.downvoteCount}`),
    );

  return apiSuccess(results);
}

/**
 * POST /api/submissions/[id]/notes
 * Create a new community note. Requires authentication.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError('UNAUTHORIZED', 'Connexion requise pour ajouter une note de contexte', 401);
  }

  const ip = getClientIp(request.headers);
  const rateLimitError = await checkRateLimit('communityNote', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  const { id: submissionId } = await params;

  if (!isValidUUID(submissionId)) {
    return apiError('VALIDATION_ERROR', 'ID de soumission invalide', 400);
  }

  const rawBody = await request.json();
  const parsed = createCommunityNoteSchema.safeParse(rawBody);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
  }

  const [note] = await db
    .insert(communityNotes)
    .values({
      submissionId,
      authorId: session.user.id,
      authorDisplay: session.user.name ?? 'Citoyen Anonyme',
      body: parsed.data.body,
      sourceUrl: parsed.data.sourceUrl || null,
    })
    .returning();

  // Award XP for writing a community note
  const { awardXp } = await import('@/lib/gamification/xp-engine');
  const { formatXpResponse } = await import('@/lib/gamification/xp-response');
  const xpResult = await awardXp(session.user.id, 'community_note_written', note.id, 'community_note');
  const xp = formatXpResponse(xpResult);

  return apiSuccess({ ...note, xp }, {}, 201);
}
