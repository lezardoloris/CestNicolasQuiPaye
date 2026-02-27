import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { comments, submissions } from '@/lib/db/schema';
import { eq, desc, asc, and, sql } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { createCommentSchema, commentQuerySchema } from '@/lib/utils/validation';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;

  const queryParsed = commentQuerySchema.safeParse({
    sort: searchParams.get('sort') || 'best',
    cursor: searchParams.get('cursor') || undefined,
    limit: searchParams.get('limit') || '20',
    parentId: searchParams.get('parentId') || undefined,
  });

  if (!queryParsed.success) {
    return apiError('VALIDATION_ERROR', 'Parametres invalides', 400);
  }

  const { sort, cursor: _cursor, limit, parentId } = queryParsed.data;

  try {
    // If parentId is provided, return all replies for that parent
    if (parentId) {
      const replies = await db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.submissionId, id),
            eq(comments.parentCommentId, parentId)
          )
        )
        .orderBy(asc(comments.createdAt));

      return apiSuccess(replies);
    }

    // Fetch top-level comments
    const orderBy =
      sort === 'best'
        ? [desc(comments.score), desc(comments.id)]
        : [desc(comments.createdAt), desc(comments.id)];

    const conditions = [
      eq(comments.submissionId, id),
      eq(comments.depth, 0),
    ];

    const topLevelComments = await db
      .select()
      .from(comments)
      .where(and(...conditions))
      .orderBy(...orderBy)
      .limit(limit + 1);

    const hasMore = topLevelComments.length > limit;
    const items = hasMore ? topLevelComments.slice(0, limit) : topLevelComments;

    // Fetch initial replies (up to 3 per top-level comment)
    const commentsWithReplies = await Promise.all(
      items.map(async (comment) => {
        const replies = await db
          .select()
          .from(comments)
          .where(eq(comments.parentCommentId, comment.id))
          .orderBy(asc(comments.createdAt))
          .limit(3);

        const [replyCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(comments)
          .where(eq(comments.parentCommentId, comment.id));

        return {
          ...comment,
          replies,
          hasMoreReplies: (replyCount?.count ?? 0) > 3,
          totalReplyCount: replyCount?.count ?? 0,
        };
      })
    );

    // Get total comment count
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(and(eq(comments.submissionId, id), eq(comments.depth, 0)));

    return apiSuccess(commentsWithReplies, {
      cursor: hasMore ? items[items.length - 1]?.id : undefined,
      hasMore,
      totalCount: totalResult?.count ?? 0,
    });
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return apiError('UNAUTHORIZED', 'Authentification requise', 401);
  }

  // Rate limit
  const rateLimited = await checkRateLimit('comment', session.user.id!);
  if (rateLimited) {
    return apiError('RATE_LIMITED', rateLimited, 429);
  }

  try {
    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);

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

    let depth = 0;
    const parentCommentId = parsed.data.parentCommentId ?? null;

    // If replying, verify parent comment and depth
    if (parentCommentId) {
      const parentComment = await db.query.comments.findFirst({
        where: and(
          eq(comments.id, parentCommentId),
          eq(comments.submissionId, id)
        ),
      });

      if (!parentComment) {
        return apiError('NOT_FOUND', 'Commentaire parent introuvable', 404);
      }

      if (parentComment.depth >= 2) {
        return apiError(
          'VALIDATION_ERROR',
          'Profondeur maximale de commentaire atteinte',
          400
        );
      }

      depth = parentComment.depth + 1;
    }

    const authorDisplay =
      session.user.displayName || session.user.anonymousId || 'Anonyme';

    const [newComment] = await db
      .insert(comments)
      .values({
        submissionId: id,
        authorId: session.user.id!,
        parentCommentId,
        body: parsed.data.body,
        authorDisplay,
        depth,
      })
      .returning();

    // Increment comment count on submission
    await db
      .update(submissions)
      .set({ commentCount: sql`${submissions.commentCount} + 1` })
      .where(eq(submissions.id, id));

    return apiSuccess(newComment, {}, 201);
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
