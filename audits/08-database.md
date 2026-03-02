# Audit 08 -- Database Quality

**Date**: 2026-03-02
**Scope**: Drizzle ORM schema, queries, connection management, data integrity
**Stack**: PostgreSQL 16 + Drizzle ORM 0.45.1 + postgres.js driver

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 5     |
| HIGH     | 12    |
| MEDIUM   | 14    |
| LOW      | 8     |

---

## 1. Schema Design

### CRITICAL-01: `updatedAt` never auto-updates -- relies on manual `new Date()`

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Lines**: 67, 131, 193, 239, 601, 645

**Description**: Every table with `updatedAt` uses `.defaultNow()` which only sets the value on INSERT. There is no database-level trigger or Drizzle `.$onUpdate()` to automatically update it. The codebase manually passes `updatedAt: new Date()` in some updates but not all.

**Missing updates found**:
- `src/app/api/comments/[id]/vote/route.ts` line 101-108: Updates `comments.upvoteCount/downvoteCount/score` but never sets `updatedAt`.
- `src/app/api/submissions/[id]/validate/route.ts` lines 107-109: Updates `submissions.approveWeight/rejectWeight` without `updatedAt`.
- `src/app/api/submissions/[id]/validate/route.ts` lines 118-119, 123-124: Updates `moderationStatus` without `updatedAt`.
- `src/app/api/notes/[id]/vote/route.ts`: All updates to `communityNotes.upvoteCount/downvoteCount` omit `updatedAt`.
- `src/app/api/solutions/[id]/vote/route.ts`: All updates to `solutions.upvoteCount/downvoteCount` omit `updatedAt`.

**Fix**: Add a PostgreSQL trigger or use Drizzle's `.$onUpdate(() => new Date())`:
```typescript
updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
```
Alternatively, create a database trigger:
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
```

---

### CRITICAL-02: `generateAnonymousId()` has a race condition

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/helpers.ts`
**Lines**: 8-27

**Description**: The anonymous ID generator reads the last ID and increments it. Under concurrent registration, two users can get the same anonymous ID. The query `ORDER BY created_at DESC LIMIT 1` is not reliable for this because:
1. Two concurrent requests can read the same "latest" row before either inserts.
2. The `anonymousId` column has a UNIQUE constraint, so one will fail with a duplicate key error, but there is no retry logic.
3. The raw SQL query `SELECT anonymous_id FROM users ORDER BY created_at DESC LIMIT 1` bypasses Drizzle's type safety.

**Fix**: Use a PostgreSQL sequence or `SERIAL` column for the numeric part:
```sql
CREATE SEQUENCE anonymous_id_seq;
```
Then generate IDs as:
```typescript
const [{ nextval }] = await database.execute(sql`SELECT nextval('anonymous_id_seq')`);
return `Nicolas #${String(nextval).padStart(4, '0')}`;
```

---

### CRITICAL-03: Missing transactions in multi-step vote operations

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/api/comments/[id]/vote/route.ts`
**Lines**: 56-108

**Description**: The comment vote handler performs multiple related operations (check existing vote, delete/update vote, count votes, update comment scores) without a transaction. If the process crashes between deleting the old vote and updating the comment scores, the cached counts will be permanently wrong.

Similarly affected:
- `src/app/api/notes/[id]/vote/route.ts` (lines 63-144) -- community note vote toggling without transaction
- `src/app/api/solutions/[id]/vote/route.ts` (lines 54-112) -- solution vote toggling without transaction
- `src/app/api/sources/[id]/validate/route.ts` (lines 59-118) -- source validation toggling without transaction
- `src/app/api/submissions/[id]/validate/route.ts` (lines 79-127) -- community validation + weight recalculation + auto-resolve without transaction

**Fix**: Wrap each of these handlers in `db.transaction()` like the existing `castVote()` and `castIpVote()` functions already do.

---

### CRITICAL-04: Comment count on submission never decremented

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/api/submissions/[id]/comments/route.ts`
**Line**: 191

**Description**: When a comment is created, `commentCount` is incremented on the submission. However, there is no code path that decrements it when a comment is soft-deleted. Over time, the cached `commentCount` will drift higher than reality. This also applies to soft-deleting solutions or community notes -- their count on the parent submission is never decremented.

**Fix**: Add a decrement operation wherever comments/solutions/notes are soft-deleted, or recalculate the count from the actual data.

---

### CRITICAL-05: No index on `submissions` for feed queries

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Lines**: 109-142

**Description**: The `submissions` table has NO indexes at all (besides the primary key and the `external_id_source` unique index). Every feed query filters on `status='published' AND moderation_status='approved'` and then sorts by either `hot_score`, `created_at`, or a computed score. Without composite indexes, every feed query requires a sequential scan of the entire submissions table.

**Missing indexes**:
1. `(status, moderation_status, hot_score DESC)` -- for hot feed
2. `(status, moderation_status, created_at DESC)` -- for new feed
3. `(status, moderation_status, (upvote_count - downvote_count) DESC)` -- for top feed (expression index)
4. `(author_id)` -- for user profile queries, user deletion
5. `(slug)` -- if submission detail pages use slug lookups
6. `(moderation_status)` -- for admin pending queue

**Fix**:
```typescript
(table) => [
  index('idx_submissions_feed_hot').on(table.status, table.moderationStatus, table.hotScore),
  index('idx_submissions_feed_new').on(table.status, table.moderationStatus, table.createdAt),
  index('idx_submissions_author').on(table.authorId),
  index('idx_submissions_slug').on(table.slug),
  index('idx_submissions_moderation').on(table.moderationStatus, table.status),
  uniqueIndex('idx_submissions_external_id_source').on(table.importSource, table.externalId),
]
```

---

## 2. Connection Pooling

### HIGH-01: Low connection pool limit for production

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/index.ts`
**Lines**: 7-11

**Description**: The connection pool is configured with `max: 10` and `idle_timeout: 20`. With Next.js serverless functions and parallel API calls, 10 connections may be insufficient. Additionally:
1. There is no `min` setting, so cold starts will create connections on demand.
2. No `max_lifetime` to rotate connections and avoid stale connections after PostgreSQL restarts.
3. No SSL configuration (`ssl: true` or `ssl: { rejectUnauthorized: false }`) for production.

**Fix**:
```typescript
const client = postgres(connectionString, {
  max: parseInt(process.env.DB_POOL_MAX ?? '20'),
  idle_timeout: 30,
  max_lifetime: 60 * 5,      // 5 minutes
  connect_timeout: 10,
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});
```

---

### HIGH-02: Single global connection for all environments

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/index.ts`
**Lines**: 1-13

**Description**: The `db` instance is created at module scope with no environment-specific configuration. In development with hot-reload, every file change creates a new connection pool without closing the old one, eventually exhausting connections. The standard Next.js pattern is to cache on `globalThis`.

**Fix**:
```typescript
const globalForDb = globalThis as unknown as { dbClient: ReturnType<typeof postgres> };
const client = globalForDb.dbClient ??= postgres(connectionString, { ... });
export const db = drizzle(client, { schema });
```

---

## 3. Missing Indexes

### HIGH-03: No index on `comments.submissionId`

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Lines**: 222-243

**Description**: The `comments` table only has an index on `solutionId`. Every comments query filters by `submissionId` (`eq(comments.submissionId, id)`), but there is no index for it. With many comments, this causes full table scans.

**Fix**: Add `index('idx_comments_submission').on(table.submissionId)` and consider a composite: `index('idx_comments_submission_depth').on(table.submissionId, table.depth)`.

---

### HIGH-04: No index on `comments.parentCommentId`

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Lines**: 222-243

**Description**: Reply fetching queries use `eq(comments.parentCommentId, comment.id)` in a loop (N+1 pattern, see HIGH-09). Even with the N+1 fixed, this column needs an index.

**Fix**: Add `index('idx_comments_parent').on(table.parentCommentId)`.

---

### HIGH-05: No index on `votes.userId` or `votes.submissionId`

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Lines**: 145-159

**Description**: The `votes` table only has the composite unique index on `(userId, submissionId)`. However, queries like `getUserVoteCount` filter on `votes.userId` alone, and batch vote queries use `votes.submissionId IN (...)`. The composite index helps when both columns are used, but single-column lookups on `submissionId` alone (like batch votes) cannot use it efficiently because `submissionId` is the second column.

**Fix**: The composite unique index covers `userId`-first lookups. Add a separate index for `submissionId` lookups:
```typescript
index('idx_votes_submission').on(table.submissionId),
```

---

### HIGH-06: No index on `accounts.userId`

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Lines**: 72-87

**Description**: NextAuth queries the `accounts` table by `userId` during session creation/validation. Without an index, this is a sequential scan on every authentication.

**Fix**: Add `index('idx_accounts_user').on(table.userId)` and also `uniqueIndex('idx_accounts_provider').on(table.provider, table.providerAccountId)`.

---

### HIGH-07: No index on `sessions.userId`

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Lines**: 89-96

**Description**: NextAuth queries sessions by `userId` when checking active sessions. No index exists.

**Fix**: Add `index('idx_sessions_user').on(table.userId)`.

---

## 4. Query Patterns

### HIGH-08: N+1 query pattern in comments endpoint

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/api/submissions/[id]/comments/route.ts`
**Lines**: 69-90

**Description**: After fetching top-level comments, the code uses `Promise.all(items.map(async (comment) => { ... }))` to fetch replies and reply counts for each comment individually. With 20 top-level comments, this fires 40 additional queries (20 for replies + 20 for counts).

**Fix**: Replace with a single query that fetches all replies for all parent IDs:
```typescript
const parentIds = items.map(c => c.id);
const allReplies = await db
  .select()
  .from(comments)
  .where(sql`${comments.parentCommentId} IN ${parentIds}`)
  .orderBy(asc(comments.createdAt));
```
Then group in JavaScript and truncate to 3 per parent.

---

### HIGH-09: N+1 in `getSubmissionById` -- sequential vote + count queries

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/api/submission-detail.ts`
**Lines**: 52-83

**Description**: After fetching the submission with a JOIN, the function fires up to 4 additional sequential queries: one for user vote, then 3 in parallel for source/note/solution counts. The vote query should be part of the initial query or at least parallelized with the count queries.

**Fix**: Move the vote check into the `Promise.all` block with the counts:
```typescript
const [voteResult, sourceCount, noteCount, solutionCount] = await Promise.all([
  currentUserId ? db.select(...).from(votes).where(...) : ipHash ? db.select(...).from(ipVotes).where(...) : Promise.resolve([]),
  db.select({ value: count() }).from(submissionSources).where(...),
  db.select({ value: count() }).from(communityNotes).where(...),
  db.select({ value: count() }).from(solutions).where(...),
]);
```

---

### HIGH-10: Correlated subqueries in feed `feedSelect` cause performance issues

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/api/submissions.ts`
**Lines**: 7-15

**Description**: The `feedSelect` object contains 6 correlated subqueries that run for each row in the result set:
```typescript
sourceCount: sql`(SELECT count(*) FROM submission_sources WHERE ...)`,
pinnedNoteBody: sql`(SELECT body FROM community_notes WHERE ...)`,
authorLevel: sql`(SELECT total_xp FROM users WHERE ...)`,
authorStreak: sql`(SELECT current_streak FROM users WHERE ...)`,
solutionCount: sql`(SELECT count(*) FROM solutions WHERE ...)`,
topSolutionBody: sql`(SELECT LEFT(body, 200) FROM solutions WHERE ...)`,
```

For a page of 20 results, this executes 120 subqueries inside the main query. While PostgreSQL can sometimes optimize these, it often results in nested loops.

**Fix**: Replace correlated subqueries with LEFT JOINs and lateral joins, or compute enrichment in a separate batch query.

---

### HIGH-11: Unbounded export query

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/api/public-submissions.ts`
**Lines**: 416-450

**Description**: The `exportPublicSubmissions()` function has no LIMIT clause. If the submissions table grows to hundreds of thousands of rows, this will attempt to load all of them into memory at once, potentially causing OOM errors.

**Fix**: Add a configurable maximum limit (e.g., 10,000) or stream results:
```typescript
.limit(params.limit ?? 10_000)
```

---

## 5. Missing Transactions

### HIGH-12: Comment creation + count increment not transactional

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/api/submissions/[id]/comments/route.ts`
**Lines**: 175-191

**Description**: The comment insert and the `commentCount` increment on the parent submission are separate operations. If the count increment fails, the comment exists but the count is wrong.

**Fix**: Wrap in `db.transaction()`.

---

## 6. Data Types and Constraints

### MEDIUM-01: Boolean columns stored as `integer` instead of `boolean`

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`

**Affected columns**:
- `submissions.isSeeded` (line 133): Uses `integer` with values 0/1/2 -- actually an enum, not a boolean.
- `communityNotes.isPinned` (line 598): Uses `integer` with values 0/1, compared as `=== 1` throughout.
- `sourceValidations.isValid` (line 574): Uses `integer` with values 0/1.
- `communityNoteVotes.isUseful` (line 620): Uses `integer` with values 0/1.

**Description**: Using integers for boolean values loses semantic meaning and allows invalid values (2, -1, etc.). PostgreSQL has a native `boolean` type.

**Fix**: For true booleans, use `boolean()`. For `isSeeded` which has 3 values (0=not seeded, 1=seeded, 2=imported), convert to a proper enum.

---

### MEDIUM-02: `submissions.slug` lacks a unique constraint

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Line**: 114

**Description**: The slug is used for URL routing (`/s/[slug]`) but has no UNIQUE constraint. Two submissions with the same title will generate identical slugs, causing routing ambiguity. The PATCH handler (line 80 in `submissions/[id]/route.ts`) appends `id.slice(0,8)` to avoid collisions, but the POST handler does not.

**Fix**: Either enforce uniqueness on slug, or use a collision-resolution strategy on creation (append random suffix or incrementing counter).

---

### MEDIUM-03: `decimal` columns return strings, not numbers

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`

**Affected columns**: `amount`, `costPerTaxpayer`, `hotScore`, `amountEur`, `costPerCitizen`, `costPerTaxpayer`, `costPerHousehold`, `daysOfWorkEquivalent`

**Description**: PostgreSQL `numeric`/`decimal` types are returned as strings by the postgres.js driver to preserve precision. The codebase handles this with manual `Number()` conversions scattered throughout (e.g., `num()` helper in `public-submissions.ts`, inline `Number()` calls in `stats.ts`). This is error-prone; forgetting to convert causes string comparison bugs.

**Fix**: Either:
1. Add `.mapWith(Number)` to decimal columns in the schema for consistent conversion, or
2. Use `real` or `doublePrecision` for columns where 64-bit float precision is acceptable (e.g., `hotScore`).

---

### MEDIUM-04: Timestamps lack timezone specification

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`

**Description**: All `timestamp()` calls use the default mode, which maps to `timestamp without time zone` in PostgreSQL. This is dangerous in a French civic app where users might be in different timezones. If the server timezone changes, all stored timestamps will be misinterpreted.

**Fix**: Use `timestamp('created_at', { withTimezone: true })` for all timestamp columns. This maps to `timestamptz` which stores UTC and converts on display.

---

### MEDIUM-05: `submissions.amount` uses `decimal(15,2)` -- may be insufficient

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Line**: 118

**Description**: With precision 15 and scale 2, the maximum value is 9,999,999,999,999.99 (about 10 trillion EUR). The validation allows up to 500 billion EUR. While technically sufficient, French state budgets can reference multi-year amounts that exceed this. The field also stores the amount as `String(estimatedCostEur)` in inserts, adding unnecessary type conversion.

**Fix**: Consider `decimal(18, 2)` for future-proofing, and store numeric values directly rather than converting to strings.

---

### MEDIUM-06: `featureVotes.status` and `featureVotes.category` use `varchar` instead of `pgEnum`

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Lines**: 637-638

**Description**: These are clearly enum-like values (`status: 'proposed'`, `category: 'general'`) but stored as free-form varchar, which allows typos and lacks database-level validation.

**Fix**: Define `pgEnum` types for feature vote status and category.

---

### MEDIUM-07: `comments.parentCommentId` lacks a foreign key constraint

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Line**: 231

**Description**: `parentCommentId` is defined as `uuid('parent_comment_id')` with no `.references(() => comments.id)`. This means the database cannot enforce referential integrity -- a comment could reference a non-existent parent.

**Fix**:
```typescript
parentCommentId: uuid('parent_comment_id').references(() => comments.id, { onDelete: 'cascade' }),
```
Note: Self-referencing FKs in Drizzle may require special handling.

---

### MEDIUM-08: Missing `onDelete` cascade on `shareEvents.submissionId`

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Lines**: 389-391

**Description**: `shareEvents.submissionId` references `submissions.id` but has no `onDelete` behavior specified. If a submission is deleted, orphaned share events remain. Same issue with:
- `moderationActions.submissionId` (line 459-460)
- `moderationActions.adminUserId` (line 461-462)
- `flags.submissionId` (line 485-486)
- `flags.userId` (line 488-489)
- `broadcasts.submissionId` (line 515-516)
- `broadcasts.adminUserId` (line 518-519)
- `featureVotes.authorId` (line 639-640)
- `featureVoteBallots.userId` (line 662-663)

**Fix**: Add `{ onDelete: 'cascade' }` or `{ onDelete: 'set null' }` as appropriate for each foreign key.

---

### MEDIUM-09: `users.passwordHash` is NOT NULL but OAuth users may not have one

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Line**: 40

**Description**: The `passwordHash` column is `text('password_hash').notNull()`. OAuth-only users (Google, Twitter, GitHub) do not have a password. This forces a dummy value to be stored, which is a security antipattern (empty string or placeholder hash could be confused with a valid credential).

**Fix**: Make `passwordHash` nullable: `text('password_hash')`. Validate at the application layer that password-based auth is only attempted when a password hash exists.

---

### MEDIUM-10: `solutionVotes` allows both `userId` and `ipHash` to be NULL

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Lines**: 209-210

**Description**: Both `userId` and `ipHash` are nullable. A row with both NULL would be an orphan vote with no attribution. There is no CHECK constraint to ensure at least one is set.

**Fix**: Add a database-level check constraint:
```sql
ALTER TABLE solution_votes ADD CONSTRAINT chk_solution_votes_identity
  CHECK (user_id IS NOT NULL OR ip_hash IS NOT NULL);
```
Same issue affects `sourceValidations` and `communityNoteVotes`.

---

## 7. Migrations Strategy

### MEDIUM-11: Using `drizzle-kit push` in production instead of migrations

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/package.json`
**Line**: 8

**Description**: The `start` script runs `drizzle-kit push --force --verbose && next start`. The `--force` flag automatically applies destructive changes (dropping columns/tables) without confirmation. In production, this is extremely dangerous:
1. If a column is renamed, `push --force` will DROP the old and CREATE the new, losing all data.
2. There is no migration history, so rollbacks are impossible.
3. No review step before schema changes are applied.
4. The `drizzle/migrations` output directory is configured but the migrations folder does not exist -- migrations have never been generated.

**Fix**: Switch to a proper migration workflow:
```bash
# Generate migrations from schema changes
npm run db:generate
# Review the generated SQL
# Apply in production
npm run db:migrate
```
Remove `drizzle-kit push --force` from the `start` script. Use a dedicated migration step in the deployment pipeline.

---

### MEDIUM-12: No migration files exist

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/drizzle.config.ts`
**Line**: 5

**Description**: The config specifies `out: './drizzle/migrations'` but the directory does not exist. There is no migration history for the database. This means:
1. The schema has only ever been pushed directly.
2. There is no way to audit what schema changes were made and when.
3. Rolling back to a previous schema version is impossible.

**Fix**: Generate an initial migration from the current schema: `npx drizzle-kit generate`. Commit the migration files to version control.

---

## 8. Soft Deletes

### MEDIUM-13: Soft delete filtering inconsistent across queries

**File**: Multiple files

**Description**: Several tables have `deletedAt` columns (users, submissions, comments, solutions, communityNotes), but filtering on `isNull(deletedAt)` is inconsistent:
- `getPublicSubmissions()` correctly checks `isNull(submissions.deletedAt)`.
- `getSubmissions()` (internal feed) does NOT check `deletedAt` -- deleted submissions can appear in the feed.
- `getUserSubmissions()` does NOT check `deletedAt`.
- Solution queries in `solutions/route.ts` do NOT check `deletedAt` on the GET endpoint.
- Community notes GET does NOT filter by `deletedAt`.

**Fix**: Systematically add `isNull(table.deletedAt)` to all queries for tables with soft delete, or create helper functions like `whereNotDeleted(table)`.

---

### MEDIUM-14: User soft-delete does not cascade to related data

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/api/user/delete/route.ts`
**Lines**: 31-71

**Description**: The user delete transaction correctly handles votes, submissions, and comments, but misses:
1. `solutions` authored by the user -- not anonymized.
2. `communityNotes` authored by the user -- not anonymized.
3. `submissionSources.addedBy` -- not cleared.
4. `xpEvents` -- not cleaned up (contains userId references).
5. `communityValidations` -- not cleaned up.
6. `featureVotes` / `featureVoteBallots` -- not cleaned up.
7. `solutionVotes` -- not cleaned up.
8. `commentVotes` -- not cleaned up.

Under GDPR, all personal data references must be removed or anonymized.

**Fix**: Add anonymization/cleanup for all tables referencing the deleted user.

---

## 9. SQL Injection and Safety

### LOW-01: Potential SQL injection in search via `ilike`

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/api/public-submissions.ts`
**Lines**: 364-365

**Description**: The search query uses `ilike(submissions.title, '%${q}%')`. While Drizzle parameterizes the `ilike` value, the `%` wildcards are concatenated in JavaScript. If the user input contains `%` or `_` characters (which are LIKE wildcards), they will be interpreted as wildcards rather than literals.

**Fix**: Escape LIKE special characters before interpolation:
```typescript
const escaped = q.replace(/[%_\\]/g, '\\$&');
ilike(submissions.title, `%${escaped}%`)
```

---

### LOW-02: Raw SQL in `getIpVoteBatch` uses array interpolation

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/api/ip-votes.ts`
**Lines**: 163-166

**Description**: The query uses `sql'${ipVotes.submissionId} IN ${submissionIds}'` where `submissionIds` is a string array. While Drizzle handles parameterization, passing arrays directly to the `IN` clause via raw `sql` template is fragile. If the array is empty (already guarded) or contains non-UUIDs (partially guarded upstream), unexpected behavior could occur.

**Fix**: Use Drizzle's `inArray()` operator:
```typescript
import { inArray } from 'drizzle-orm';
inArray(ipVotes.submissionId, submissionIds)
```

---

## 10. Audit Trail

### LOW-03: No audit trail for most data mutations

**File**: Schema-wide

**Description**: Only `moderationActions` provides an audit trail for moderation. There is no audit trail for:
1. Submission edits (PATCH endpoint)
2. User profile changes
3. Vote count recalculations
4. Badge awards
5. Schema changes (no migration files)

For a civic platform dealing with public spending, traceability of changes is important for trust.

**Fix**: Consider adding an `audit_log` table or using PostgreSQL's built-in auditing features. At minimum, track edits to submissions (diff of what changed).

---

### LOW-04: `createdAt` timestamps not indexed for time-range queries

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`

**Description**: Several queries filter by `createdAt` ranges (hot feed stale threshold, time window filters, "this week" counts, daily XP counts). The `submissions.createdAt` column has no index. While `xpEvents.createdAt` does have an index, `submissions.createdAt` does not.

**Fix**: Already covered in CRITICAL-05 (composite indexes for feed queries include `createdAt`).

---

## 11. Denormalized Counters

### LOW-05: Denormalized counters lack reconciliation mechanism

**File**: Schema-wide

**Description**: The schema uses denormalized counters extensively:
- `submissions.upvoteCount`, `downvoteCount`, `commentCount`
- `solutions.upvoteCount`, `downvoteCount`
- `communityNotes.upvoteCount`, `downvoteCount`
- `submissionSources.validationCount`, `invalidationCount`
- `users.submissionCount`, `karmaScore`, `totalXp`
- `featureVotes.voteCount`
- `submissions.approveWeight`, `rejectWeight`

These counters can drift from reality due to:
1. Missing transactions (CRITICAL-03)
2. Missing decrements (CRITICAL-04)
3. Race conditions in concurrent updates
4. Bugs in individual update paths

There is no scheduled job or admin tool to reconcile these counters against the actual data.

**Fix**: Add a cron job or admin endpoint that recalculates counters from source data:
```sql
UPDATE submissions SET upvote_count = (
  SELECT count(*) FROM votes WHERE submission_id = submissions.id AND vote_type = 'up'
) + (
  SELECT count(*) FROM ip_votes WHERE submission_id = submissions.id AND vote_type = 'up'
);
```

---

### LOW-06: `users.submissionCount` is manually maintained but never updated

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Line**: 50

**Description**: The `submissionCount` column on users has a default of 0, but there is no code that increments it when a submission is created (checked `src/app/api/submissions/route.ts` -- no counter update). The `getUserProfile` function reads `user.submissionCount` and uses it for karma calculation, which means karma is always calculated with submissionCount=0.

**Fix**: Either increment `submissionCount` in the submission creation handler, or compute it on the fly:
```typescript
const submissionCount = await db.select({ count: count() }).from(submissions)
  .where(and(eq(submissions.authorId, userId), eq(submissions.status, 'published')));
```

---

### LOW-07: `users.karmaScore` column exists but is never written to

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts`
**Line**: 51

**Description**: The `karmaScore` column has a default of 0 and is never updated anywhere in the codebase. Karma is always computed on the fly in `getUserProfile()`. This is dead data in the schema.

**Fix**: Either remove the column or implement a cron to periodically update it for leaderboard queries.

---

### LOW-08: `allUsers` query in `getUserProfile` loads entire user table

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/api/users.ts`
**Lines**: 62-79

**Description**: To compute the user's rank, the code loads ALL non-deleted users into memory and filters in JavaScript. As the user count grows, this will become a major performance bottleneck and memory issue.

**Fix**: Use a SQL-based ranking query:
```sql
SELECT count(*) + 1 AS rank FROM users
WHERE deleted_at IS NULL AND submission_count * 10 > $karma;
```
Or better yet, use the `karmaScore` column with a proper index and let PostgreSQL compute the rank.

---

## Findings Summary Table

| ID | Severity | Category | Description |
|----|----------|----------|-------------|
| CRITICAL-01 | CRITICAL | Schema | `updatedAt` never auto-updates |
| CRITICAL-02 | CRITICAL | Schema | `generateAnonymousId()` race condition |
| CRITICAL-03 | CRITICAL | Transactions | Vote operations without transactions (5 endpoints) |
| CRITICAL-04 | CRITICAL | Data Integrity | Comment/solution/note counts never decremented |
| CRITICAL-05 | CRITICAL | Indexes | No indexes on submissions table for feed queries |
| HIGH-01 | HIGH | Connection | Low pool limit, no SSL, no lifetime |
| HIGH-02 | HIGH | Connection | No globalThis caching for dev hot-reload |
| HIGH-03 | HIGH | Indexes | No index on `comments.submissionId` |
| HIGH-04 | HIGH | Indexes | No index on `comments.parentCommentId` |
| HIGH-05 | HIGH | Indexes | No index on `votes.submissionId` alone |
| HIGH-06 | HIGH | Indexes | No index on `accounts.userId` |
| HIGH-07 | HIGH | Indexes | No index on `sessions.userId` |
| HIGH-08 | HIGH | Queries | N+1 in comments (replies per parent) |
| HIGH-09 | HIGH | Queries | Sequential queries in `getSubmissionById` |
| HIGH-10 | HIGH | Queries | 6 correlated subqueries in feed select |
| HIGH-11 | HIGH | Queries | Unbounded export query |
| HIGH-12 | HIGH | Transactions | Comment creation + count not transactional |
| MEDIUM-01 | MEDIUM | Types | Boolean columns as integer |
| MEDIUM-02 | MEDIUM | Constraints | Slug lacks unique constraint |
| MEDIUM-03 | MEDIUM | Types | Decimal columns return strings |
| MEDIUM-04 | MEDIUM | Types | Timestamps without timezone |
| MEDIUM-05 | MEDIUM | Types | `amount` precision may be insufficient |
| MEDIUM-06 | MEDIUM | Types | varchar instead of pgEnum |
| MEDIUM-07 | MEDIUM | Constraints | `parentCommentId` lacks FK constraint |
| MEDIUM-08 | MEDIUM | Constraints | Missing `onDelete` on 9 foreign keys |
| MEDIUM-09 | MEDIUM | Constraints | `passwordHash` NOT NULL blocks OAuth |
| MEDIUM-10 | MEDIUM | Constraints | No CHECK constraint for voter identity |
| MEDIUM-11 | MEDIUM | Migrations | `push --force` in production start script |
| MEDIUM-12 | MEDIUM | Migrations | No migration files exist |
| MEDIUM-13 | MEDIUM | Soft Deletes | Inconsistent `deletedAt` filtering |
| MEDIUM-14 | MEDIUM | Soft Deletes | User delete misses many related tables |
| LOW-01 | LOW | Safety | LIKE wildcard characters not escaped |
| LOW-02 | LOW | Safety | Raw SQL array interpolation |
| LOW-03 | LOW | Audit | No audit trail for mutations |
| LOW-04 | LOW | Indexes | `createdAt` not indexed on submissions |
| LOW-05 | LOW | Data Integrity | No counter reconciliation mechanism |
| LOW-06 | LOW | Data Integrity | `submissionCount` never incremented |
| LOW-07 | LOW | Data Integrity | `karmaScore` column is dead data |
| LOW-08 | LOW | Queries | `getUserProfile` loads all users for rank |

---

## Priority Recommendations

### Immediate (before next deployment)
1. **CRITICAL-05**: Add composite indexes on `submissions` for feed queries.
2. **CRITICAL-03**: Wrap comment vote, solution vote, note vote, source validation, and community validation handlers in transactions.
3. **MEDIUM-11**: Remove `drizzle-kit push --force` from the `start` script and switch to proper migrations.
4. **HIGH-01/02**: Fix connection pooling with `globalThis` caching and proper pool settings.

### Short-term (next sprint)
5. **CRITICAL-01**: Add `.$onUpdate()` to all `updatedAt` columns or create a database trigger.
6. **CRITICAL-02**: Replace sequential ID generation with a PostgreSQL sequence.
7. **CRITICAL-04**: Add decrement logic for comment/solution/note deletion.
8. **HIGH-03/04/05/06/07**: Add all missing indexes.
9. **HIGH-08**: Fix N+1 in comments endpoint.
10. **MEDIUM-04**: Switch all timestamps to `withTimezone: true`.

### Medium-term (next month)
11. **HIGH-10**: Replace correlated subqueries in feed select with JOINs.
12. **MEDIUM-14**: Complete user deletion to cover all related tables (GDPR).
13. **LOW-05/06**: Build counter reconciliation mechanism.
14. **MEDIUM-12**: Generate initial migration and commit to version control.
15. **MEDIUM-01**: Convert integer booleans to proper boolean type.

---

## Addendum — Post-rebase delta (2 mars 2026)

This addendum covers the new database tables introduced by the **multi-criteria voting** feature, the new pgEnum, relations, type exports, and the updated XP action enum.

### New Schema Elements

The following were added to `src/lib/db/schema.ts`:

1. **`criterionKey` pgEnum** (line 180): `['proportional', 'legitimate', 'alternative']`
2. **`criteriaVotes` table** (lines 182-204): Authenticated user votes per criterion per submission.
3. **`ipCriteriaVotes` table** (lines 206-226): Anonymous IP-based votes per criterion per submission.
4. **`criteriaVotesRelations`** (lines 355-364): Relations to `users` and `submissions`.
5. **`ipCriteriaVotesRelations`** (lines 366-371): Relation to `submissions`.
6. **`submissionsRelations` updated** (lines 312-313): Added `criteriaVotes` and `ipCriteriaVotes` as `many()`.
7. **`xpActionType` enum updated** (line 880): Added `'criteria_vote'` action type.
8. **Type exports** (lines 1085-1088): `CriteriaVote`, `NewCriteriaVote`, `IpCriteriaVote`, `NewIpCriteriaVote`.

---

### DELTA-INFO-01: `criteriaVotes` table -- well-designed (positive)

**Severity**: INFO (positive)
**File**: `src/lib/db/schema.ts`, lines 182-204

**Description**: The `criteriaVotes` table is well-structured and follows established patterns:
- **Primary key**: UUID with `defaultRandom()` -- consistent with all other tables.
- **Foreign keys**: Both `userId` and `submissionId` reference parent tables with `onDelete: 'cascade'` -- good, prevents orphaned rows.
- **Enum column**: Uses the dedicated `criterionKey` pgEnum for the `criterion` column -- database-level validation, unlike `featureVotes.status` which uses varchar (see MEDIUM-06 in original audit).
- **Boolean value column**: Uses native `boolean` type for `value` -- correct, unlike the integer-as-boolean pattern in older tables (MEDIUM-01 in original audit).
- **Composite unique index**: `criteria_votes_user_submission_criterion_idx` on `(userId, submissionId, criterion)` -- correctly prevents duplicate votes per user per criterion per submission.
- **Submission index**: `idx_criteria_votes_submission` on `(submissionId)` -- enables efficient aggregation queries.
- **Timestamp**: `createdAt` with `defaultNow()` -- consistent.

---

### DELTA-INFO-02: `ipCriteriaVotes` table -- well-designed (positive)

**Severity**: INFO (positive)
**File**: `src/lib/db/schema.ts`, lines 206-226

**Description**: Mirrors `criteriaVotes` for anonymous users, following the same dual-table pattern as `votes`/`ipVotes`. Includes:
- **Composite unique index**: `ip_criteria_votes_hash_submission_criterion_idx` on `(ipHash, submissionId, criterion)` -- prevents duplicate anonymous votes.
- **Submission index**: `idx_ip_criteria_votes_submission` on `(submissionId)` -- enables efficient aggregation.
- **Foreign key**: `submissionId` with `onDelete: 'cascade'` -- good.

---

### DELTA-MEDIUM-01: No `updatedAt` column on criteria vote tables

**Severity**: MEDIUM
**File**: `src/lib/db/schema.ts`, lines 182-226

**Description**: Neither `criteriaVotes` nor `ipCriteriaVotes` has an `updatedAt` column. The API route supports vote switching (changing a vote from true to false or vice versa via UPDATE), but there is no way to know when a vote was last modified. While votes are simple and typically immutable, the switch operation is an in-place UPDATE that loses the original `createdAt` meaning.

This is a minor concern since:
- The `createdAt` records when the vote was first cast.
- Switches are relatively rare (user must explicitly click the opposite button).
- The original `votes`/`ipVotes` tables also lack `updatedAt`.

**Fix**: Consider adding `updatedAt` to capture vote switches, or accept this as consistent with the existing vote table pattern.

---

### DELTA-MEDIUM-02: `criteriaVotes` and `ipCriteriaVotes` not included in user deletion cascade

**Severity**: MEDIUM
**File**: `src/app/api/user/delete/route.ts`

**Description**: The user deletion handler (identified in MEDIUM-14 of the original audit as incomplete) does not clean up `criteriaVotes` rows for the deleted user. While the `onDelete: 'cascade'` on the `userId` foreign key means the rows will be automatically deleted when the user row is removed, the current user deletion flow uses soft-delete (setting `deletedAt`), NOT hard delete. The cascade only fires on hard DELETE, not on UPDATE.

This means that after user soft-deletion:
- The user's `criteriaVotes` rows remain, still counting toward aggregates.
- The user's `ipCriteriaVotes` rows are unaffected (they are linked by IP hash, not userId).

**Fix**: Add explicit cleanup of `criteriaVotes` in the user soft-delete transaction, consistent with how other vote tables should be handled (part of the broader MEDIUM-14 fix).

---

### DELTA-LOW-01: Relations defined for `criteriaVotes` but `usersRelations` not updated

**Severity**: LOW
**File**: `src/lib/db/schema.ts`, lines 295-303

**Description**: The `usersRelations` (lines 295-303) include `votes`, `comments`, `xpEvents`, and `badges` as `many()` relations, but do not include `criteriaVotes`. While Drizzle relations are only used for relational query mode (`db.query.users.findMany({ with: { criteriaVotes: true } })`), the omission creates an inconsistency -- the `submissionsRelations` correctly lists `criteriaVotes` and `ipCriteriaVotes`, but the user side is missing.

**Fix**: Add `criteriaVotes: many(criteriaVotes)` to `usersRelations`:
```typescript
export const usersRelations = relations(users, ({ many }) => ({
  ...existing,
  criteriaVotes: many(criteriaVotes),
}));
```

---

### DELTA-LOW-02: No denormalized counter for criteria votes on submissions

**Severity**: LOW
**File**: `src/lib/db/schema.ts`, lines 109-142

**Description**: The `submissions` table has denormalized counters for `upvoteCount`, `downvoteCount`, and `commentCount`, but no equivalent counter for criteria votes. The criteria-vote GET handler must aggregate counts from both `criteriaVotes` and `ipCriteriaVotes` tables on every request (two GROUP BY queries).

This is actually a **deliberate improvement** over the counter pattern -- the aggregation approach avoids the counter drift issues documented in CRITICAL-04 and LOW-05 of the original audit. However, as the number of criteria votes grows, these GROUP BY queries will become slower without a caching layer.

**Fix**: No immediate action needed. The query-based approach is correct. If performance becomes an issue, consider:
1. A materialized view refreshed periodically, or
2. Adding denormalized counters with proper transaction wrapping (learning from the existing counter issues).

---

### DELTA-LOW-03: `criterionKey` pgEnum placement creates implicit coupling

**Severity**: LOW
**File**: `src/lib/db/schema.ts`, line 180

**Description**: The `criterionKey` enum is defined at line 180, between the `ipVotes` table and the `criteriaVotes` table. While this is logical placement, the enum values (`'proportional'`, `'legitimate'`, `'alternative'`) are also duplicated in:
- The Zod schema `criteriaVoteSchema` in `validation.ts` (line 64): `z.enum(['proportional', 'legitimate', 'alternative'])`
- The `CRITERION_LABELS` constant in `validation.ts` (lines 70-74)
- The `CRITERIA` array in `CriteriaVoteSection.tsx` (lines 9-13)
- The local `CriterionKey` type in `route.ts` (line 11) and `useCriteriaVote.ts` (line 6)

If a new criterion is added (e.g., `'transparent'`), it must be updated in 5+ places.

**Fix**: Derive the Zod schema from the pgEnum values and export a single source of truth:
```typescript
// In schema.ts
export const CRITERION_KEYS = ['proportional', 'legitimate', 'alternative'] as const;
export const criterionKey = pgEnum('criterion_key', CRITERION_KEYS);

// In validation.ts
import { CRITERION_KEYS } from '@/lib/db/schema';
export const criteriaVoteSchema = z.object({
  criterion: z.enum(CRITERION_KEYS),
  value: z.boolean(),
});
```

---

### Delta Summary Table

| ID | Severity | Category | Description |
|----|----------|----------|-------------|
| DELTA-INFO-01 | INFO | Schema Design | `criteriaVotes` well-structured: proper FK cascades, pgEnum, indexes |
| DELTA-INFO-02 | INFO | Schema Design | `ipCriteriaVotes` follows dual-table pattern correctly |
| DELTA-MEDIUM-01 | MEDIUM | Schema Design | No `updatedAt` on criteria vote tables (vote switches lose timestamp) |
| DELTA-MEDIUM-02 | MEDIUM | Soft Deletes | Criteria votes not cleaned up during user soft-delete |
| DELTA-LOW-01 | LOW | Relations | `usersRelations` missing `criteriaVotes` relation |
| DELTA-LOW-02 | LOW | Performance | No denormalized counter (correct trade-off, monitor perf) |
| DELTA-LOW-03 | LOW | DRY | Criterion enum values duplicated across 5+ files |

### Updated Totals (original + delta)

| Severity | Original | Delta | New Total |
|----------|----------|-------|-----------|
| CRITICAL | 5        | 0     | 5         |
| HIGH     | 12       | 0     | 12        |
| MEDIUM   | 14       | 2     | 16        |
| LOW      | 8        | 3     | 11        |
