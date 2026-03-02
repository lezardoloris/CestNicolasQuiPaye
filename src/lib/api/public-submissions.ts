import { db } from '@/lib/db';
import {
  submissions,
  users,
  costCalculations,
  submissionSources,
  communityNotes,
  solutions,
} from '@/lib/db/schema';
import { desc, and, eq, gte, lte, sql, isNull, or, ilike } from 'drizzle-orm';
import { encodeCursor, decodeCursor } from '@/lib/api/submissions';
import type {
  PublicSubmission,
  PublicSubmissionDetail,
  PublicSource,
  PublicCommunityNote,
  PublicSolution,
  PublicCostCalculation,
  PublicExportRow,
} from '@/types/public-api';
import type {
  PublicSubmissionsQuery,
  PublicSearchQuery,
  PublicExportQuery,
} from '@/lib/utils/validation';

// ─── Helpers ─────────────────────────────────────────────────────

const TIME_WINDOW_MS: Record<string, number | null> = {
  today: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  all: null,
};

function num(v: unknown): number {
  return Number(v) || 0;
}

function toISOString(d: Date | string | null | undefined): string {
  if (!d) return '';
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

// ─── Serializers ─────────────────────────────────────────────────

function toPublicSubmission(
  row: typeof submissions.$inferSelect,
  author: { displayName: string | null; anonymousId: string } | null,
): PublicSubmission {
  const costResults = row.costToNicolasResults as Record<string, unknown> | null;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    sourceUrl: row.sourceUrl,
    amount: num(row.amount),
    category: row.ministryTag,
    author: {
      displayName: author?.displayName ?? row.authorDisplay,
      anonymousId: author?.anonymousId ?? 'anonyme',
    },
    votes: {
      up: row.upvoteCount,
      down: row.downvoteCount,
      score: row.upvoteCount - row.downvoteCount,
    },
    commentCount: row.commentCount,
    costPerTaxpayer: row.costPerTaxpayer ? num(row.costPerTaxpayer) : null,
    costToNicolas: costResults
      ? {
          amountEur: num(costResults.costPerCitizen != null ? row.amount : 0),
          costPerCitizen: costResults.costPerCitizen != null ? num(costResults.costPerCitizen) : null,
          costPerTaxpayer: costResults.costPerTaxpayer != null ? num(costResults.costPerTaxpayer) : null,
          costPerHousehold: costResults.costPerHousehold != null ? num(costResults.costPerHousehold) : null,
          daysOfWorkEquivalent:
            costResults.daysOfWorkEquivalent != null ? num(costResults.daysOfWorkEquivalent) : null,
          equivalences: costResults.equivalences ?? null,
        }
      : null,
    createdAt: toISOString(row.createdAt),
    updatedAt: toISOString(row.updatedAt),
  };
}

// ─── Base Conditions ─────────────────────────────────────────────

function baseConditions() {
  return [
    eq(submissions.status, 'published'),
    eq(submissions.moderationStatus, 'approved'),
    isNull(submissions.deletedAt),
  ];
}

function buildFilters(params: {
  category?: string;
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
  timeWindow?: string;
}) {
  const filters = [];

  if (params.category) {
    filters.push(eq(submissions.ministryTag, params.category));
  }
  if (params.amountMin != null) {
    filters.push(gte(sql`${submissions.amount}::numeric`, params.amountMin));
  }
  if (params.amountMax != null) {
    filters.push(lte(sql`${submissions.amount}::numeric`, params.amountMax));
  }
  if (params.dateFrom) {
    filters.push(gte(submissions.createdAt, new Date(params.dateFrom)));
  }
  if (params.dateTo) {
    filters.push(lte(submissions.createdAt, new Date(params.dateTo)));
  }

  const windowMs = params.timeWindow ? TIME_WINDOW_MS[params.timeWindow] : null;
  if (windowMs) {
    filters.push(gte(submissions.createdAt, new Date(Date.now() - windowMs)));
  }

  return filters;
}

// ─── Public Submissions List ─────────────────────────────────────

export async function getPublicSubmissions(params: PublicSubmissionsQuery): Promise<{
  data: PublicSubmission[];
  meta: { cursor: string | null; hasMore: boolean };
}> {
  const { sort, cursor, limit } = params;
  const decoded = cursor ? decodeCursor(cursor) : null;

  const conditions = [...baseConditions(), ...buildFilters(params)];

  // Sort-specific cursor condition and ordering
  let orderBy;
  switch (sort) {
    case 'hot':
      if (decoded) {
        conditions.push(
          sql`(${submissions.hotScore} < ${decoded.sortValue} OR (${submissions.hotScore} = ${decoded.sortValue} AND ${submissions.id} < ${decoded.id}))`,
        );
      }
      orderBy = [desc(submissions.hotScore), desc(submissions.id)];
      break;
    case 'top':
      if (decoded) {
        conditions.push(
          sql`((${submissions.upvoteCount} - ${submissions.downvoteCount}) < ${Number(decoded.sortValue)} OR ((${submissions.upvoteCount} - ${submissions.downvoteCount}) = ${Number(decoded.sortValue)} AND ${submissions.id} < ${decoded.id}))`,
        );
      }
      orderBy = [
        desc(sql`(${submissions.upvoteCount} - ${submissions.downvoteCount})`),
        desc(submissions.id),
      ];
      break;
    case 'amount':
      if (decoded) {
        conditions.push(
          sql`(${submissions.amount}::numeric < ${Number(decoded.sortValue)} OR (${submissions.amount}::numeric = ${Number(decoded.sortValue)} AND ${submissions.id} < ${decoded.id}))`,
        );
      }
      orderBy = [desc(sql`${submissions.amount}::numeric`), desc(submissions.id)];
      break;
    case 'new':
    default:
      if (decoded) {
        conditions.push(
          sql`(${submissions.createdAt} < ${decoded.sortValue} OR (${submissions.createdAt} = ${decoded.sortValue} AND ${submissions.id} < ${decoded.id}))`,
        );
      }
      orderBy = [desc(submissions.createdAt), desc(submissions.id)];
      break;
  }

  const rows = await db
    .select({
      submission: submissions,
      authorDisplayName: users.displayName,
      authorAnonymousId: users.anonymousId,
    })
    .from(submissions)
    .leftJoin(users, eq(submissions.authorId, users.id))
    .where(and(...conditions))
    .orderBy(...orderBy)
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = data[data.length - 1];

  let nextCursor: string | null = null;
  if (lastRow && hasMore) {
    const s = lastRow.submission;
    let sortValue: string;
    switch (sort) {
      case 'hot':
        sortValue = String(s.hotScore);
        break;
      case 'top':
        sortValue = String(s.upvoteCount - s.downvoteCount);
        break;
      case 'amount':
        sortValue = String(s.amount);
        break;
      case 'new':
      default:
        sortValue = s.createdAt.toISOString();
        break;
    }
    nextCursor = encodeCursor({ id: s.id, sortValue });
  }

  return {
    data: data.map((row) =>
      toPublicSubmission(row.submission, {
        displayName: row.authorDisplayName,
        anonymousId: row.authorAnonymousId ?? 'anonyme',
      }),
    ),
    meta: { cursor: nextCursor, hasMore },
  };
}

// ─── Public Submission Detail ────────────────────────────────────

export async function getPublicSubmissionDetail(
  id: string,
): Promise<PublicSubmissionDetail | null> {
  const [submissionRows, sourcesRows, notesRows, solutionsRows, costRows] =
    await Promise.all([
      db
        .select({
          submission: submissions,
          authorDisplayName: users.displayName,
          authorAnonymousId: users.anonymousId,
        })
        .from(submissions)
        .leftJoin(users, eq(submissions.authorId, users.id))
        .where(
          and(
            eq(submissions.id, id),
            eq(submissions.status, 'published'),
            eq(submissions.moderationStatus, 'approved'),
            isNull(submissions.deletedAt),
          ),
        )
        .limit(1),

      db
        .select()
        .from(submissionSources)
        .where(eq(submissionSources.submissionId, id))
        .orderBy(desc(submissionSources.createdAt)),

      db
        .select()
        .from(communityNotes)
        .where(
          and(
            eq(communityNotes.submissionId, id),
            isNull(communityNotes.deletedAt),
          ),
        )
        .orderBy(desc(communityNotes.isPinned), desc(communityNotes.createdAt)),

      db
        .select()
        .from(solutions)
        .where(
          and(eq(solutions.submissionId, id), isNull(solutions.deletedAt)),
        )
        .orderBy(
          desc(sql`(${solutions.upvoteCount} - ${solutions.downvoteCount})`),
        ),

      db
        .select()
        .from(costCalculations)
        .where(eq(costCalculations.submissionId, id))
        .limit(1),
    ]);

  const row = submissionRows[0];
  if (!row) return null;

  const base = toPublicSubmission(row.submission, {
    displayName: row.authorDisplayName,
    anonymousId: row.authorAnonymousId ?? 'anonyme',
  });

  // Override costToNicolas with the detailed cost calculation if available
  const costRow = costRows[0];
  if (costRow) {
    base.costToNicolas = {
      amountEur: num(costRow.amountEur),
      costPerCitizen: costRow.costPerCitizen ? num(costRow.costPerCitizen) : null,
      costPerTaxpayer: costRow.costPerTaxpayer ? num(costRow.costPerTaxpayer) : null,
      costPerHousehold: costRow.costPerHousehold ? num(costRow.costPerHousehold) : null,
      daysOfWorkEquivalent: costRow.daysOfWorkEquivalent
        ? num(costRow.daysOfWorkEquivalent)
        : null,
      equivalences: costRow.equivalences,
    } satisfies PublicCostCalculation;
  }

  const publicSources: PublicSource[] = sourcesRows.map((s) => ({
    id: s.id,
    url: s.url,
    title: s.title,
    sourceType: s.sourceType,
    validationCount: s.validationCount,
    createdAt: toISOString(s.createdAt),
  }));

  const publicNotes: PublicCommunityNote[] = notesRows.map((n) => ({
    id: n.id,
    authorDisplay: n.authorDisplay,
    body: n.body,
    sourceUrl: n.sourceUrl,
    upvoteCount: n.upvoteCount,
    downvoteCount: n.downvoteCount,
    isPinned: n.isPinned === 1,
    createdAt: toISOString(n.createdAt),
  }));

  const publicSolutions: PublicSolution[] = solutionsRows.map((s) => ({
    id: s.id,
    authorDisplay: s.authorDisplay,
    body: s.body,
    upvoteCount: s.upvoteCount,
    downvoteCount: s.downvoteCount,
    createdAt: toISOString(s.createdAt),
  }));

  return {
    ...base,
    sources: publicSources,
    communityNotes: publicNotes,
    solutions: publicSolutions,
  };
}

// ─── Search ──────────────────────────────────────────────────────

export async function searchPublicSubmissions(params: PublicSearchQuery): Promise<{
  data: PublicSubmission[];
  meta: { cursor: string | null; hasMore: boolean };
}> {
  const { q, cursor, limit, category } = params;
  const decoded = cursor ? decodeCursor(cursor) : null;

  const conditions = [
    ...baseConditions(),
    or(
      ilike(submissions.title, `%${q}%`),
      ilike(submissions.description, `%${q}%`),
    ),
  ];

  if (category) {
    conditions.push(eq(submissions.ministryTag, category));
  }

  if (decoded) {
    conditions.push(
      sql`(${submissions.createdAt} < ${decoded.sortValue} OR (${submissions.createdAt} = ${decoded.sortValue} AND ${submissions.id} < ${decoded.id}))`,
    );
  }

  const rows = await db
    .select({
      submission: submissions,
      authorDisplayName: users.displayName,
      authorAnonymousId: users.anonymousId,
    })
    .from(submissions)
    .leftJoin(users, eq(submissions.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(submissions.createdAt), desc(submissions.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = data[data.length - 1];

  let nextCursor: string | null = null;
  if (lastRow && hasMore) {
    nextCursor = encodeCursor({
      id: lastRow.submission.id,
      sortValue: lastRow.submission.createdAt.toISOString(),
    });
  }

  return {
    data: data.map((row) =>
      toPublicSubmission(row.submission, {
        displayName: row.authorDisplayName,
        anonymousId: row.authorAnonymousId ?? 'anonyme',
      }),
    ),
    meta: { cursor: nextCursor, hasMore },
  };
}

// ─── Export ──────────────────────────────────────────────────────

export async function exportPublicSubmissions(
  params: PublicExportQuery,
): Promise<PublicExportRow[]> {
  const conditions = [...baseConditions()];

  if (params.category) {
    conditions.push(eq(submissions.ministryTag, params.category));
  }
  if (params.dateFrom) {
    conditions.push(gte(submissions.createdAt, new Date(params.dateFrom)));
  }
  if (params.dateTo) {
    conditions.push(lte(submissions.createdAt, new Date(params.dateTo)));
  }

  const rows = await db
    .select()
    .from(submissions)
    .where(and(...conditions))
    .orderBy(desc(submissions.createdAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    amount: num(row.amount),
    category: row.ministryTag,
    sourceUrl: row.sourceUrl,
    votesUp: row.upvoteCount,
    votesDown: row.downvoteCount,
    commentCount: row.commentCount,
    costPerTaxpayer: row.costPerTaxpayer ? num(row.costPerTaxpayer) : null,
    createdAt: toISOString(row.createdAt),
  }));
}
