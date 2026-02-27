# Story 5.2: Comment Voting

## Story

**As a** registered user (Nicolas),
**I want** to upvote or downvote comments,
**So that** the most helpful and accurate comments rise to the top.

## Status

**Status:** Draft
**Epic:** 5 -- Comments & Community Discussion
**Priority:** High
**Estimate:** 5 story points
**FRs:** FR21 (comment upvotes), FR22 (comment sorting by best/newest)
**NFRs:** NFR2 (optimistic UI < 100ms), NFR8 (rate limiting), NFR13 (parameterized queries), NFR23 (eventually consistent vote counts)

---

## Acceptance Criteria (BDD)

### AC 1: Database Migration -- comment_votes table

```gherkin
Given a Drizzle migration creates the `comment_votes` table (if not exists) with columns:
  | Column      | Type                          | Constraints                                   |
  |-------------|-------------------------------|-----------------------------------------------|
  | id          | UUID                          | PK, default random                            |
  | user_id     | UUID                          | FK to users, NOT NULL                         |
  | comment_id  | UUID                          | FK to comments, NOT NULL                      |
  | direction   | enum('up', 'down')            | NOT NULL                                      |
  | created_at  | timestamp                     | NOT NULL, default now()                       |
When the migration runs,
Then the table is created with:
  - a UNIQUE constraint on `(user_id, comment_id)` enforced at the database level
  - an index `idx_comment_votes_user_comment` on `(user_id, comment_id)`
```

### AC 2: Upvote a comment

```gherkin
Given a logged-in user clicks the upvote arrow on a comment,
When the click is registered,
Then the UI optimistically updates:
  - the upvote arrow turns `chainsaw-red` (#DC2626)
  - the comment score increments by 1
  - the counter animates (subtle scale bounce)
And a POST /api/v1/comment-votes request is sent with { "comment_id": "<id>", "direction": "up" },
And the vote is persisted in the `comment_votes` table,
And the comment's `score`, `upvote_count`, and `downvote_count` are updated atomically.
```

### AC 3: Downvote a comment

```gherkin
Given a logged-in user clicks the downvote arrow on a comment,
When the click is registered,
Then the UI optimistically updates:
  - the downvote arrow turns indigo
  - the comment score decrements by 1
And a POST /api/v1/comment-votes request is sent with { "comment_id": "<id>", "direction": "down" },
And the vote is persisted and the comment's aggregates are updated atomically.
```

### AC 4: Toggle vote off (remove vote)

```gherkin
Given a user has already upvoted a comment and clicks the upvote arrow again,
When the click is registered,
Then the UI optimistically updates:
  - the upvote arrow returns to default gray
  - the comment score decrements by 1
And a DELETE /api/v1/comment-votes request is sent with { "comment_id": "<id>" },
And the vote row is deleted from `comment_votes`,
And the comment's aggregates are decremented.
```

### AC 5: Switch vote direction

```gherkin
Given a user has already upvoted a comment and clicks the downvote arrow,
When the click is registered,
Then the UI optimistically updates:
  - the upvote arrow returns to default gray, the downvote arrow turns indigo
  - the comment score decrements by 2 (removing upvote + adding downvote)
And the vote direction is updated in the `comment_votes` table (upsert),
And the comment's `upvote_count` decrements by 1 and `downvote_count` increments by 1.
```

### AC 6: Comment sorting by best/newest

```gherkin
Given comments are displayed on a submission detail page,
When the comment list renders with "Best" sort (default),
Then comments at depth 0 are sorted by `score` descending (best first),
And replies within a thread are sorted by `created_at` ascending (chronological).

Given the user selects "Newest" sort,
When the comment list re-renders,
Then comments at depth 0 are sorted by `created_at` descending (newest first),
And replies within a thread remain sorted by `created_at` ascending.
```

### AC 7: Optimistic rollback on error

```gherkin
Given a user casts a comment vote and the API request fails (network error or server error),
When the error is caught,
Then the UI reverts to the previous vote state (arrow color, score count),
And an error toast "Erreur lors du vote. Réessayez." is displayed.
```

### AC 8: Unauthenticated user attempts to vote

```gherkin
Given an unauthenticated user clicks a comment vote arrow,
When the click is registered,
Then the LazyAuthGate modal appears with login/register options,
And after successful authentication, the vote action is completed automatically.
```

### AC 9: Rate limiting on comment votes

```gherkin
Given a user exceeds 100 comment votes per hour,
When they attempt another vote,
Then a 429 Too Many Requests response is returned,
And a warning toast is shown: "Trop de requêtes. Réessayez dans X minutes."
```

---

## Tasks / Subtasks

### Task 1: Drizzle ORM Schema & Migration

- [ ] 1.1: Define the `comment_votes` table in `src/lib/db/schema.ts`
- [ ] 1.2: Create `voteDirection` pgEnum with values `'up'` and `'down'`
- [ ] 1.3: Add UNIQUE constraint on `(user_id, comment_id)` in migration
- [ ] 1.4: Add `score` and `downvote_count` columns to comments table if not already present (see Story 5.1 schema -- `score`, `upvote_count`, `downvote_count` are already defined)
- [ ] 1.5: Generate and run migration with `drizzle-kit generate` and `drizzle-kit migrate`
- [ ] 1.6: Write migration test verifying table creation and UNIQUE constraint enforcement

### Task 2: Zod Validation Schemas

- [ ] 2.1: Create `commentVoteSchema` in `src/lib/api/validation.ts`:
  ```typescript
  export const commentVoteSchema = z.object({
    commentId: z.string().uuid('ID de commentaire invalide'),
    direction: z.enum(['up', 'down'], {
      errorMap: () => ({ message: 'Direction de vote invalide' }),
    }),
  });
  ```
- [ ] 2.2: Unit tests for validation schemas

### Task 3: API Route Handler -- POST /api/v1/comment-votes

- [ ] 3.1: Create route handler at `src/app/api/v1/comment-votes/route.ts`
- [ ] 3.2: Implement POST handler:
  - Authenticate user via `getServerSession`
  - Apply rate limiting (`rateLimiters.vote` -- 100/hour)
  - Validate request body with `commentVoteSchema`
  - Check if comment exists and is not soft-deleted
  - Check if user already has a vote on this comment
  - **No existing vote:** INSERT into `comment_votes`, increment comment's `upvote_count` or `downvote_count`, recalculate `score`
  - **Same direction:** DELETE from `comment_votes`, decrement count, recalculate `score`
  - **Different direction:** UPDATE `direction` in `comment_votes`, adjust both counts, recalculate `score`
  - All operations in a single database transaction
  - Return `200 OK` with updated comment vote state `{ data: { commentId, direction, score, upvoteCount, downvoteCount } }`
- [ ] 3.3: Implement DELETE handler for explicit vote removal
- [ ] 3.4: Error handling (400 validation, 401 auth, 404 comment not found, 409 duplicate, 429 rate limit)

### Task 4: Comment Vote Store (Zustand)

- [ ] 4.1: Create `src/stores/comment-vote-cache.ts` (mirrors `vote-cache.ts` pattern):
  ```typescript
  import { create } from 'zustand';

  type VoteDirection = 'up' | 'down' | null;

  interface CommentVoteCacheStore {
    votes: Map<string, VoteDirection>;
    scores: Map<string, { up: number; down: number; score: number }>;
    setVote: (commentId: string, direction: VoteDirection) => void;
    setScores: (commentId: string, up: number, down: number, score: number) => void;
    getVote: (commentId: string) => VoteDirection;
    getScores: (commentId: string) => { up: number; down: number; score: number } | undefined;
  }
  ```
- [ ] 4.2: Implement store with optimistic update helpers

### Task 5: useCommentVote Hook

- [ ] 5.1: Create `src/hooks/use-comment-vote.ts` following the `useVote` pattern from architecture:
  ```typescript
  export function useCommentVote(
    commentId: string,
    serverCounts: { up: number; down: number; score: number }
  ) {
    // Use cache if available, fallback to server data
    // useMutation with optimistic update + rollback on error
    // LazyAuthGate integration for unauthenticated users
  }
  ```
- [ ] 5.2: Implement optimistic update in `onMutate`:
  - Toggle off: remove vote, adjust score
  - New vote: set vote, adjust score
  - Switch: change direction, adjust both counts and score
- [ ] 5.3: Implement rollback in `onError`: restore previous vote state and counts
- [ ] 5.4: Return `{ vote, currentVote, counts, isLoading }`

### Task 6: CommentVoteButton Component

- [ ] 6.1: Create `src/components/features/comments/CommentVoteButton.tsx` (Client Component)
- [ ] 6.2: Render upvote/downvote arrows (vertically stacked, mirroring submission VoteButton design)
- [ ] 6.3: Score display between arrows
- [ ] 6.4: Visual states:
  - Default: gray arrows, neutral score
  - Active up: upvote arrow `chainsaw-red` (#DC2626)
  - Active down: downvote arrow indigo
  - Loading: subtle pulse animation
  - Disabled (not logged in): triggers LazyAuthGate
- [ ] 6.5: Counter animation: subtle scale bounce on vote change
- [ ] 6.6: Touch target: minimum 44x44px per arrow for mobile
- [ ] 6.7: Wire up `useCommentVote` hook

### Task 7: Comment Sort Toggle

- [ ] 7.1: Create sort toggle UI in CommentThread header: "Meilleurs" (default) | "Récents"
- [ ] 7.2: "Meilleurs" sorts top-level by `score DESC`, "Récents" sorts by `created_at DESC`
- [ ] 7.3: Replies within threads always sorted by `created_at ASC` regardless of sort mode
- [ ] 7.4: Sort toggle updates URL query param `?commentSort=best|newest` for shareability
- [ ] 7.5: Refetch comments on sort change via TanStack Query

### Task 8: Integration into CommentThread

- [ ] 8.1: Add CommentVoteButton to each rendered comment in CommentThread
- [ ] 8.2: Pass server-side vote counts to each CommentVoteButton
- [ ] 8.3: Fetch current user's comment votes on page load (batch request)
- [ ] 8.4: Add sort toggle to CommentThread header

### Task 9: Testing

- [ ] 9.1: Unit tests for `commentVoteSchema` (Vitest)
- [ ] 9.2: Unit tests for POST /api/v1/comment-votes (all cases: new vote, toggle off, switch direction, duplicate constraint, rate limit)
- [ ] 9.3: Unit tests for `useCommentVote` hook (optimistic update, rollback)
- [ ] 9.4: Component tests for CommentVoteButton (render states, click handlers, auth gate)
- [ ] 9.5: Component tests for sort toggle (sort change, URL update)
- [ ] 9.6: Integration test: vote -> optimistic update -> server sync -> rollback on error

---

## Dev Notes

### Architecture

- **Optimistic UI pattern:** Mirrors the submission voting pattern from architecture (see `src/hooks/use-vote.ts` and `src/stores/vote-cache.ts`). The comment vote system follows the identical three-step pattern: (1) immediate UI update via Zustand store, (2) API mutation via TanStack Query, (3) rollback on error or cache sync on success.
- **Atomic score updates:** Comment `score`, `upvote_count`, and `downvote_count` are updated atomically in a single SQL transaction. Score = upvote_count - downvote_count.
- **UNIQUE constraint:** Database-level `UNIQUE(user_id, comment_id)` prevents duplicate votes. Application code uses upsert logic (INSERT ON CONFLICT UPDATE) for direction changes.
- **Eventual consistency:** Per NFR23, displayed vote counts may lag by up to 5 seconds during high traffic but must converge to accurate totals.
- **Comment sort:** FR22 requires sort by best (score DESC) and newest (created_at DESC). This is implemented as a query parameter on the GET comments endpoint and a UI toggle in the CommentThread header.

### Tech Stack

| Technology | Version | Usage in This Story |
|---|---|---|
| Next.js | 16.1.6 | API route handlers |
| Drizzle ORM | 0.45.1 | comment_votes table, atomic updates, transactions |
| PostgreSQL | 17.9 | UNIQUE constraint, atomic score recalculation |
| Zod | 3.x | Vote input validation |
| TanStack Query | 5.90.x | Mutation with optimistic update |
| Zustand | 5.0.11 | Comment vote cache store |
| shadcn/ui | 2026-02 | Button component for vote arrows |
| Motion (Framer Motion) | 12.34.x | Counter animation, scale bounce |
| Vitest | 4.0.18 | Unit and component tests |

### Drizzle ORM Schema

```typescript
// src/lib/db/schema.ts (additions for comment_votes)
import { pgTable, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const voteDirectionEnum = pgEnum('vote_direction', ['up', 'down']);

export const commentVotes = pgTable('comment_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  commentId: uuid('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  direction: voteDirectionEnum('direction').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
// UNIQUE constraint on (user_id, comment_id) enforced via migration:
// CREATE UNIQUE INDEX idx_comment_votes_user_comment ON comment_votes (user_id, comment_id);
```

### Atomic Vote Transaction Example

```typescript
// Inside POST handler -- transaction for vote + score update
await db.transaction(async (tx) => {
  // Upsert vote
  await tx
    .insert(commentVotes)
    .values({ userId, commentId, direction })
    .onConflictDoUpdate({
      target: [commentVotes.userId, commentVotes.commentId],
      set: { direction },
    });

  // Recalculate score atomically
  await tx
    .update(comments)
    .set({
      upvoteCount: sql`(SELECT COUNT(*) FROM comment_votes WHERE comment_id = ${commentId} AND direction = 'up')`,
      downvoteCount: sql`(SELECT COUNT(*) FROM comment_votes WHERE comment_id = ${commentId} AND direction = 'down')`,
      score: sql`(SELECT COUNT(*) FILTER (WHERE direction = 'up') - COUNT(*) FILTER (WHERE direction = 'down') FROM comment_votes WHERE comment_id = ${commentId})`,
    })
    .where(eq(comments.id, commentId));
});
```

### Key Files

| File | Purpose |
|---|---|
| `src/lib/db/schema.ts` | Add `commentVotes` table definition |
| `src/lib/db/migrations/` | Generated migration with UNIQUE constraint |
| `src/lib/api/validation.ts` | `commentVoteSchema` Zod schema |
| `src/app/api/v1/comment-votes/route.ts` | API route handler (POST + DELETE) |
| `src/stores/comment-vote-cache.ts` | Zustand store for optimistic vote cache |
| `src/hooks/use-comment-vote.ts` | Comment voting hook with optimistic UI |
| `src/components/features/comments/CommentVoteButton.tsx` | Vote button component |
| `src/components/features/comments/CommentThread.tsx` | Integration point (add vote buttons + sort) |

### Testing Strategy

| Test Type | Tool | Coverage Target |
|---|---|---|
| Unit: Zod schemas | Vitest | Valid/invalid vote inputs |
| Unit: API route handler | Vitest + mocks | All vote scenarios (new, toggle, switch, remove), auth, rate limit |
| Unit: useCommentVote | Vitest + TanStack Query test utils | Optimistic update, rollback, auth gate |
| Component: CommentVoteButton | Vitest + Testing Library | Render states (default, active-up, active-down, loading), click handlers |
| Component: Sort toggle | Vitest + Testing Library | Sort mode switch, URL param update |
| Integration: Vote flow | Vitest | Full vote -> optimistic -> server -> sync/rollback cycle |

### UX Reference

- **Vote button design:** Mirrors submission VoteButton -- upvote/downvote arrows vertically stacked with score between. Active-up: `chainsaw-red` (#DC2626). Active-down: indigo. Counter increment/decrement animation with subtle scale bounce. Touch target 48x48px minimum.
- **Sort toggle:** "Meilleurs" | "Récents" toggle in CommentThread header. Uses shadcn/ui Tabs or custom segmented control.
- **Error toast:** "Erreur lors du vote. Réessayez." (red left border, 3 seconds auto-dismiss).
- **No toast on successful vote** -- optimistic UI provides immediate feedback without interrupting flow.

### Dependencies

| Dependency | Story | Reason |
|---|---|---|
| Story 5.1 | Comment Submission & Threading | Comments table must exist for votes to reference |
| Story 3.3 | Submission Voting | Mirrors the optimistic voting pattern (`useVote` hook, `vote-cache` store) |
| Story 1.1 | User Registration | Users must be authenticated to vote |

### References

- Epic 5 definition: `_bmad-output/planning-artifacts/epics.md` (lines 926-952)
- Architecture -- comment_votes schema: `_bmad-output/planning-artifacts/architecture.md` (lines 381-388)
- Architecture -- UNIQUE index: `_bmad-output/planning-artifacts/architecture.md` (line 466)
- Architecture -- optimistic voting pattern: `_bmad-output/planning-artifacts/architecture.md` (lines 895-965)
- Architecture -- vote-cache store: `_bmad-output/planning-artifacts/architecture.md` (lines 860-893)
- Architecture -- rate limiting (vote): `_bmad-output/planning-artifacts/architecture.md` (lines 593, 615-618)
- Architecture -- FR21 mapping: `_bmad-output/planning-artifacts/architecture.md` (line 1796)
- Architecture -- FR22 mapping: `_bmad-output/planning-artifacts/architecture.md` (line 1797)
- UX spec -- VoteButton component: `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 780-792)

---

## Dev Agent Record

### Agent Model

_Not yet started_

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-27 | Story created from Epic 5 definition | BMAD |

### Implementation Notes

_To be filled during implementation._

### Test Results

_To be filled after test execution._
