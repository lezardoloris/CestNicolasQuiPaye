import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { featureVotes, featureVoteBallots, users } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { featureProposalCreateSchema, featureVoteQuerySchema } from '@/lib/utils/validation';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const queryParsed = featureVoteQuerySchema.safeParse({
    sortBy: searchParams.get('sortBy') || 'votes',
    status: searchParams.get('status') || undefined,
    category: searchParams.get('category') || undefined,
    cursor: searchParams.get('cursor') || undefined,
    limit: searchParams.get('limit') || '20',
  });

  if (!queryParsed.success) {
    return apiError('VALIDATION_ERROR', 'Parametres invalides', 400);
  }

  const { sortBy, status, category, cursor: _cursor, limit } = queryParsed.data;

  try {
    const conditions = [];

    if (status) {
      conditions.push(eq(featureVotes.status, status));
    }
    if (category) {
      conditions.push(eq(featureVotes.category, category));
    }

    const orderBy =
      sortBy === 'votes'
        ? [desc(featureVotes.voteCount), desc(featureVotes.createdAt)]
        : [desc(featureVotes.createdAt)];

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select({
        id: featureVotes.id,
        title: featureVotes.title,
        description: featureVotes.description,
        category: featureVotes.category,
        status: featureVotes.status,
        authorId: featureVotes.authorId,
        voteCount: featureVotes.voteCount,
        rejectionReason: featureVotes.rejectionReason,
        createdAt: featureVotes.createdAt,
        authorDisplay: users.displayName,
      })
      .from(featureVotes)
      .leftJoin(users, eq(featureVotes.authorId, users.id))
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;

    // If user is authenticated, check their votes
    const session = await auth();
    let userBallots: Map<string, number> = new Map();

    if (session?.user) {
      const ballots = await db
        .select({
          featureVoteId: featureVoteBallots.featureVoteId,
          voteValue: featureVoteBallots.voteValue,
        })
        .from(featureVoteBallots)
        .where(eq(featureVoteBallots.userId, session.user.id!));

      userBallots = new Map(
        ballots.map((b) => [b.featureVoteId, b.voteValue])
      );
    }

    const itemsWithVoteStatus = items.map((item) => ({
      ...item,
      authorDisplay: item.authorDisplay ?? 'Anonyme',
      userVote: userBallots.get(item.id) ?? null,
    }));

    return apiSuccess(itemsWithVoteStatus, {
      cursor: hasMore ? items[items.length - 1]?.id : undefined,
      hasMore,
    });
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return apiError('UNAUTHORIZED', 'Authentification requise', 401);
  }

  const rateLimited = await checkRateLimit('submission', session.user.id!);
  if (rateLimited) {
    return apiError('RATE_LIMITED', rateLimited, 429);
  }

  try {
    const body = await request.json();
    const parsed = featureProposalCreateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Donnees invalides', 400, {
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const [newFeature] = await db
      .insert(featureVotes)
      .values({
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        authorId: session.user.id!,
      })
      .returning();

    return apiSuccess(newFeature, {}, 201);
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
