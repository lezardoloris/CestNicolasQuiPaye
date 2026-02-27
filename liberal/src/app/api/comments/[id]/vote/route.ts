import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { comments, commentVotes } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { commentVoteSchema } from '@/lib/utils/validation';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: commentId } = await params;
  const session = await auth();

  if (!session?.user) {
    return apiError('UNAUTHORIZED', 'Authentification requise', 401);
  }

  const rateLimited = await checkRateLimit('vote', session.user.id!);
  if (rateLimited) {
    return apiError('RATE_LIMITED', rateLimited, 429);
  }

  try {
    const body = await request.json();
    const parsed = commentVoteSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Donnees invalides', 400, {
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    // Verify comment exists and is not deleted
    const comment = await db.query.comments.findFirst({
      where: and(eq(comments.id, commentId), isNull(comments.deletedAt)),
    });

    if (!comment) {
      return apiError('NOT_FOUND', 'Commentaire introuvable', 404);
    }

    const userId = session.user.id!;
    const { direction } = parsed.data;

    // Check existing vote
    const existingVote = await db.query.commentVotes.findFirst({
      where: and(
        eq(commentVotes.userId, userId),
        eq(commentVotes.commentId, commentId)
      ),
    });

    if (existingVote) {
      if (existingVote.direction === direction) {
        // Toggle off - remove vote
        await db
          .delete(commentVotes)
          .where(eq(commentVotes.id, existingVote.id));
      } else {
        // Switch direction
        await db
          .update(commentVotes)
          .set({ direction })
          .where(eq(commentVotes.id, existingVote.id));
      }
    } else {
      // New vote
      await db.insert(commentVotes).values({
        userId,
        commentId,
        direction,
      });
    }

    // Recalculate scores atomically
    const [upCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(commentVotes)
      .where(
        and(
          eq(commentVotes.commentId, commentId),
          eq(commentVotes.direction, 'up')
        )
      );
    const [downCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(commentVotes)
      .where(
        and(
          eq(commentVotes.commentId, commentId),
          eq(commentVotes.direction, 'down')
        )
      );

    const up = upCount?.count ?? 0;
    const down = downCount?.count ?? 0;

    await db
      .update(comments)
      .set({
        upvoteCount: up,
        downvoteCount: down,
        score: up - down,
      })
      .where(eq(comments.id, commentId));

    // Get current user vote
    const currentVote = await db.query.commentVotes.findFirst({
      where: and(
        eq(commentVotes.userId, userId),
        eq(commentVotes.commentId, commentId)
      ),
    });

    return apiSuccess({
      commentId,
      direction: currentVote?.direction ?? null,
      score: up - down,
      upvoteCount: up,
      downvoteCount: down,
    });
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: commentId } = await params;
  const session = await auth();

  if (!session?.user) {
    return apiError('UNAUTHORIZED', 'Authentification requise', 401);
  }

  try {
    const userId = session.user.id!;

    await db
      .delete(commentVotes)
      .where(
        and(
          eq(commentVotes.userId, userId),
          eq(commentVotes.commentId, commentId)
        )
      );

    return apiSuccess({ ok: true });
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}

function isNull(column: typeof comments.deletedAt) {
  return sql`${column} IS NULL`;
}
