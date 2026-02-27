import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { desc, gt, gte, and, eq, sql, or } from 'drizzle-orm';
import type { SortType } from '@/lib/utils/validation';

// ─── Cursor Encoding ──────────────────────────────────────────────

interface CursorPayload {
  id: string;
  sortValue: string;
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor(cursor: string): CursorPayload {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString());
  } catch {
    throw new Error('Invalid cursor format');
  }
}

// ─── Feed Parameters ──────────────────────────────────────────────

interface FeedParams {
  sort: SortType;
  cursor?: string;
  limit?: number;
  timeWindow?: 'today' | 'week' | 'month' | 'all';
}

// ─── Time Window Helpers ──────────────────────────────────────────

const TIME_WINDOW_MS: Record<string, number | null> = {
  today: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  all: null,
};

// ─── Main Feed Query ──────────────────────────────────────────────

export async function getSubmissions({
  sort,
  cursor,
  limit = 20,
  timeWindow = 'week',
}: FeedParams) {
  const decoded = cursor ? decodeCursor(cursor) : null;

  switch (sort) {
    case 'hot':
      return getHotFeed({ cursor: decoded, limit });
    case 'new':
      return getNewFeed({ cursor: decoded, limit });
    case 'top':
      return getTopFeed({ cursor: decoded, limit, timeWindow });
  }
}

// ─── Hot Feed ─────────────────────────────────────────────────────

async function getHotFeed({
  cursor,
  limit,
}: {
  cursor: CursorPayload | null;
  limit: number;
}) {
  // Exclude stale submissions: older than 7 days with score < 10
  const staleThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const conditions = [
    eq(submissions.status, 'published'),
    or(
      gt(submissions.createdAt, staleThreshold),
      gte(
        sql`(${submissions.upvoteCount} - ${submissions.downvoteCount})`,
        10,
      ),
    ),
  ];

  if (cursor) {
    conditions.push(
      sql`(${submissions.hotScore} < ${cursor.sortValue} OR (${submissions.hotScore} = ${cursor.sortValue} AND ${submissions.id} < ${cursor.id}))`,
    );
  }

  const results = await db
    .select()
    .from(submissions)
    .where(and(...conditions))
    .orderBy(desc(submissions.hotScore), desc(submissions.id))
    .limit(limit + 1);

  return paginateResults(results, limit, 'hot');
}

// ─── New Feed ─────────────────────────────────────────────────────

async function getNewFeed({
  cursor,
  limit,
}: {
  cursor: CursorPayload | null;
  limit: number;
}) {
  const conditions = [eq(submissions.status, 'published')];

  if (cursor) {
    conditions.push(
      sql`(${submissions.createdAt} < ${cursor.sortValue} OR (${submissions.createdAt} = ${cursor.sortValue} AND ${submissions.id} < ${cursor.id}))`,
    );
  }

  const results = await db
    .select()
    .from(submissions)
    .where(and(...conditions))
    .orderBy(desc(submissions.createdAt), desc(submissions.id))
    .limit(limit + 1);

  return paginateResults(results, limit, 'new');
}

// ─── Top Feed ─────────────────────────────────────────────────────

async function getTopFeed({
  cursor,
  limit,
  timeWindow,
}: {
  cursor: CursorPayload | null;
  limit: number;
  timeWindow: string;
}) {
  const conditions = [eq(submissions.status, 'published')];

  const windowMs = TIME_WINDOW_MS[timeWindow];
  if (windowMs) {
    const windowThreshold = new Date(Date.now() - windowMs);
    conditions.push(gt(submissions.createdAt, windowThreshold));
  }

  if (cursor) {
    conditions.push(
      sql`((${submissions.upvoteCount} - ${submissions.downvoteCount}) < ${Number(cursor.sortValue)} OR ((${submissions.upvoteCount} - ${submissions.downvoteCount}) = ${Number(cursor.sortValue)} AND ${submissions.id} < ${cursor.id}))`,
    );
  }

  const results = await db
    .select()
    .from(submissions)
    .where(and(...conditions))
    .orderBy(
      desc(sql`(${submissions.upvoteCount} - ${submissions.downvoteCount})`),
      desc(submissions.id),
    )
    .limit(limit + 1);

  return paginateResults(results, limit, 'top');
}

// ─── Pagination Helper ────────────────────────────────────────────

function paginateResults(
  results: (typeof submissions.$inferSelect)[],
  limit: number,
  sort: SortType,
) {
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const lastItem = data[data.length - 1];

  let nextCursor: string | null = null;

  if (lastItem && hasMore) {
    let sortValue: string;

    switch (sort) {
      case 'hot':
        sortValue = String(lastItem.hotScore);
        break;
      case 'top':
        sortValue = String(lastItem.upvoteCount - lastItem.downvoteCount);
        break;
      case 'new':
        sortValue = lastItem.createdAt.toISOString();
        break;
    }

    nextCursor = encodeCursor({ id: lastItem.id, sortValue });
  }

  return {
    data,
    error: null,
    meta: {
      cursor: nextCursor,
      hasMore,
    },
  };
}
