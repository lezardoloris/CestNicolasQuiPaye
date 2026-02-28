import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { communityNoteVotes, communityNotes } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { communityNoteVoteSchema, isValidUUID } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import { getHashedIp } from '@/lib/utils/ip-hash';

const PIN_SCORE_THRESHOLD = 10;
const PIN_USEFUL_PERCENT_THRESHOLD = 0.8;

/**
 * POST /api/notes/[id]/vote
 * Vote on community note usefulness. Dual-track: userId or ipHash.
 * Automatically pins/unpins based on consensus threshold.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const ip = getClientIp(request.headers);

  const rateLimitError = await checkRateLimit('vote', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  const { id: noteId } = await params;

  if (!isValidUUID(noteId)) {
    return apiError('VALIDATION_ERROR', 'ID de note invalide', 400);
  }

  const body = await request.json();
  const parsed = communityNoteVoteSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Donnees invalides', 400);
  }

  const { isUseful } = parsed.data;
  const isUsefulInt = isUseful ? 1 : 0;

  try {
    const userId = session?.user?.id ?? null;
    const ipHash = !userId ? getHashedIp(request) : null;

    // Find existing vote
    const whereClause = userId
      ? and(eq(communityNoteVotes.userId, userId), eq(communityNoteVotes.noteId, noteId))
      : and(eq(communityNoteVotes.ipHash, ipHash!), eq(communityNoteVotes.noteId, noteId));

    const existing = await db
      .select()
      .from(communityNoteVotes)
      .where(whereClause)
      .limit(1);

    const existingVote = existing[0];

    if (existingVote) {
      if (existingVote.isUseful === isUsefulInt) {
        // Toggle off
        await db.delete(communityNoteVotes).where(eq(communityNoteVotes.id, existingVote.id));
        if (isUseful) {
          await db.update(communityNotes).set({
            upvoteCount: sql`${communityNotes.upvoteCount} - 1`,
          }).where(eq(communityNotes.id, noteId));
        } else {
          await db.update(communityNotes).set({
            downvoteCount: sql`${communityNotes.downvoteCount} - 1`,
          }).where(eq(communityNotes.id, noteId));
        }
      } else {
        // Switch
        await db.update(communityNoteVotes)
          .set({ isUseful: isUsefulInt, createdAt: new Date() })
          .where(eq(communityNoteVotes.id, existingVote.id));
        if (isUseful) {
          await db.update(communityNotes).set({
            upvoteCount: sql`${communityNotes.upvoteCount} + 1`,
            downvoteCount: sql`${communityNotes.downvoteCount} - 1`,
          }).where(eq(communityNotes.id, noteId));
        } else {
          await db.update(communityNotes).set({
            upvoteCount: sql`${communityNotes.upvoteCount} - 1`,
            downvoteCount: sql`${communityNotes.downvoteCount} + 1`,
          }).where(eq(communityNotes.id, noteId));
        }
      }
    } else {
      // New vote
      await db.insert(communityNoteVotes).values({
        noteId,
        userId,
        ipHash,
        isUseful: isUsefulInt,
      });
      if (isUseful) {
        await db.update(communityNotes).set({
          upvoteCount: sql`${communityNotes.upvoteCount} + 1`,
        }).where(eq(communityNotes.id, noteId));
      } else {
        await db.update(communityNotes).set({
          downvoteCount: sql`${communityNotes.downvoteCount} + 1`,
        }).where(eq(communityNotes.id, noteId));
      }
    }

    // Check pinning threshold
    const [updatedNote] = await db
      .select({
        upvoteCount: communityNotes.upvoteCount,
        downvoteCount: communityNotes.downvoteCount,
        isPinned: communityNotes.isPinned,
      })
      .from(communityNotes)
      .where(eq(communityNotes.id, noteId));

    if (updatedNote) {
      const score = updatedNote.upvoteCount - updatedNote.downvoteCount;
      const totalVotes = updatedNote.upvoteCount + updatedNote.downvoteCount;
      const usefulPercent = totalVotes > 0 ? updatedNote.upvoteCount / totalVotes : 0;
      const shouldPin = score > PIN_SCORE_THRESHOLD && usefulPercent >= PIN_USEFUL_PERCENT_THRESHOLD;

      if (shouldPin && !updatedNote.isPinned) {
        await db.update(communityNotes).set({
          isPinned: 1,
          pinnedAt: new Date(),
        }).where(eq(communityNotes.id, noteId));
        // Award pin bonus XP to the note author
        const noteData = await db.select({ authorId: communityNotes.authorId }).from(communityNotes).where(eq(communityNotes.id, noteId)).limit(1);
        if (noteData[0]?.authorId) {
          const { awardXp } = await import('@/lib/gamification/xp-engine');
          await awardXp(noteData[0].authorId, 'community_note_pinned', noteId, 'community_note');
        }
      } else if (!shouldPin && updatedNote.isPinned) {
        await db.update(communityNotes).set({
          isPinned: 0,
          pinnedAt: null,
        }).where(eq(communityNotes.id, noteId));
      }
    }

    return apiSuccess({ userVote: isUseful });
  } catch (error) {
    console.error('Community note vote error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors du vote', 500);
  }
}
