# Story 3.3: Upvote/Downvote Mechanics with Optimistic UI

## Story

**As a** registered user (Nicolas),
**I want** to upvote or downvote a submission with instant visual feedback,
**So that** I can express my opinion and influence the ranking of fiscal outrages.

**FRs Covered:** FR6, FR7
**NFRs Integrated:** NFR2, NFR15, NFR23

---

## Acceptance Criteria (BDD)

### AC 3.3.1: Votes Table Schema

```gherkin
Given a Drizzle migration creates the `votes` table (if not exists) with columns: `id` (UUID, PK), `user_id` (UUID, FK to users, not null), `submission_id` (UUID, FK to submissions, not null), `direction` (enum: 'up' | 'down', not null), `created_at` (timestamp), `updated_at` (timestamp), and a unique constraint on `(user_id, submission_id)`
When the migration runs
Then the table is created with the unique constraint enforced at the database level (FR6)
```

### AC 3.3.2: Upvote with Optimistic UI

```gherkin
Given a logged-in user clicks the upvote arrow on a submission
When the click is registered
Then the UI optimistically updates within 100ms: the upvote arrow turns `chainsaw-red`, the score increments by 1 (NFR2)
And a `POST /api/votes` request is sent with body `{ "submission_id": "<id>", "direction": "up" }`
And the server confirms the vote within 500ms (NFR2)
And if the server returns an error, the optimistic update is rolled back and an error toast is displayed
```

### AC 3.3.3: Vote Direction Change

```gherkin
Given a logged-in user who has already upvoted clicks the downvote arrow
When the click is registered
Then the UI optimistically updates: the upvote arrow returns to neutral, the downvote arrow turns `text-secondary`, and the score decrements by 2 (removing upvote and adding downvote) (FR7)
And a `PATCH /api/votes` request is sent to change the vote direction
```

### AC 3.3.4: Vote Toggle (Unvote)

```gherkin
Given a logged-in user who has already voted clicks the same vote direction again
When the click is registered
Then the vote is removed (unvoted): the arrow returns to neutral and the score adjusts accordingly (FR7)
```

### AC 3.3.5: Unauthenticated Vote Attempt

```gherkin
Given a visitor (not logged in) clicks a vote arrow
When the click is registered
Then a modal or toast appears with the text "Connectez-vous pour voter" and a link to `/auth/login`
```

### AC 3.3.6: Redis Vote Caching

```gherkin
Given a Redis (Upstash) instance is configured
When votes are cast
Then vote counts are cached in Redis with key `submission:{id}:score` and synced to PostgreSQL within 5 seconds (NFR23)
And the system handles 1000+ concurrent vote operations without data loss (NFR15)
```

---

## Tasks / Subtasks

### Task 1: Votes Table Migration
- [ ] 1.1 Create Drizzle schema for `votes` table in `src/lib/db/schema.ts` [AC 3.3.1]
- [ ] 1.2 Define columns: `id` (UUID, PK, defaultRandom), `user_id` (UUID, FK to users, not null), `submission_id` (UUID, FK to submissions, not null), `vote_type` (enum 'up'|'down', not null), `created_at` (timestamp, defaultNow) [AC 3.3.1]
- [ ] 1.3 Add unique index on `(user_id, submission_id)` [AC 3.3.1]
- [ ] 1.4 Add index on `submission_id` for vote count queries [AC 3.3.1]
- [ ] 1.5 Run `npx drizzle-kit generate` and `npx drizzle-kit push` to create migration [AC 3.3.1]

### Task 2: Zustand Vote Cache Store
- [ ] 2.1 Create `src/stores/vote-cache.ts` Zustand store [AC 3.3.2, AC 3.3.3, AC 3.3.4]
- [ ] 2.2 Implement `VoteCacheStore` interface with `votes` Map (submissionId -> VoteState) and `counts` Map (submissionId -> {up, down}) [AC 3.3.2]
- [ ] 2.3 Implement `setVote()`, `setCounts()`, `getVote()`, `getCounts()` methods [AC 3.3.2]
- [ ] 2.4 Use immutable Map updates via `new Map(state.votes)` pattern [AC 3.3.2]

### Task 3: Optimistic Voting Hook (useVote)
- [ ] 3.1 Create `src/hooks/use-vote.ts` with full optimistic voting logic [AC 3.3.2, AC 3.3.3, AC 3.3.4]
- [ ] 3.2 Accept `submissionId` and `serverCounts` ({ up, down }) as parameters [AC 3.3.2]
- [ ] 3.3 Implement `onMutate` callback: save previous state, optimistically update counts and vote direction [AC 3.3.2, AC 3.3.3, AC 3.3.4]
- [ ] 3.4 Implement toggle-off logic: if user clicks same direction, remove vote [AC 3.3.4]
- [ ] 3.5 Implement switch logic: if user changes direction, decrement old + increment new [AC 3.3.3]
- [ ] 3.6 Implement `onError` callback: rollback to previous state from context [AC 3.3.2]
- [ ] 3.7 Check `isAuthenticated` before mutating; call `openAuthGate()` if not authenticated [AC 3.3.5]
- [ ] 3.8 Return `{ vote, currentVote, counts, isLoading }` from hook [AC 3.3.2]

### Task 4: VoteButton Client Component
- [ ] 4.1 Create `src/components/features/voting/VoteButton.tsx` as Client Component [AC 3.3.2]
- [ ] 4.2 Render upvote arrow (ChevronUp icon), score count, downvote arrow (ChevronDown icon) [AC 3.3.2]
- [ ] 4.3 Style active-up state: upvote arrow `text-chainsaw-red`, fill applied [AC 3.3.2]
- [ ] 4.4 Style active-down state: downvote arrow `text-text-secondary` (indigo in UX spec) [AC 3.3.3]
- [ ] 4.5 Style neutral state: both arrows `text-text-muted` [AC 3.3.2]
- [ ] 4.6 Add subtle scale bounce animation on tap using Motion library [AC 3.3.2]
- [ ] 4.7 Add counter increment/decrement animation [AC 3.3.2]
- [ ] 4.8 Set minimum touch target 48x48px for each arrow button [AC 3.3.2]
- [ ] 4.9 Add `aria-label="Voter pour"` on upvote, `aria-label="Voter contre"` on downvote [AC 3.3.2]
- [ ] 4.10 Add `aria-pressed` attribute reflecting current vote state [AC 3.3.2]
- [ ] 4.11 Display formatted score between arrows [AC 3.3.2]

### Task 5: Vote API Route Handler
- [ ] 5.1 Create `src/app/api/v1/submissions/[id]/votes/route.ts` [AC 3.3.2, AC 3.3.3, AC 3.3.4]
- [ ] 5.2 Implement `POST` handler: cast new vote or toggle/switch existing vote [AC 3.3.2, AC 3.3.3]
- [ ] 5.3 Validate request body with Zod: `{ voteType: z.enum(['up', 'down']) }` [AC 3.3.2]
- [ ] 5.4 Check authentication via `auth()` -- return 401 if not authenticated [AC 3.3.5]
- [ ] 5.5 Use database transaction for vote upsert + submission counter update [AC 3.3.2]
- [ ] 5.6 Implement upsert logic: INSERT ON CONFLICT (user_id, submission_id) DO UPDATE SET vote_type [AC 3.3.3]
- [ ] 5.7 Implement `DELETE` handler: remove vote and adjust counters [AC 3.3.4]
- [ ] 5.8 Update Redis cache `vote:sub:{id}` with new counts after database write [AC 3.3.6]
- [ ] 5.9 Apply rate limiting: 10 writes/minute per IP (NFR8) [AC 3.3.2]
- [ ] 5.10 Return updated counts in response envelope `{ data: { upvoteCount, downvoteCount, userVote } }` [AC 3.3.2]

### Task 6: Server-Side Vote Processing
- [ ] 6.1 Create `src/lib/api/votes.ts` with `castVote()`, `removeVote()`, `getUserVote()` functions [AC 3.3.2, AC 3.3.3, AC 3.3.4]
- [ ] 6.2 Implement atomic counter update in single transaction [AC 3.3.2]:
  - If new upvote: `upvote_count += 1`, `score += 1`
  - If switch up->down: `upvote_count -= 1, downvote_count += 1, score -= 2`
  - If switch down->up: `downvote_count -= 1, upvote_count += 1, score += 2`
  - If toggle off up: `upvote_count -= 1, score -= 1`
  - If toggle off down: `downvote_count -= 1, score += 1`
- [ ] 6.3 Use Drizzle `sql` template for atomic increment: `sql\`${submissions.upvoteCount} + 1\`` [AC 3.3.2]
- [ ] 6.4 Recalculate `hot_score` after vote change (triggers Story 3.4 algorithm) [AC 3.3.2]

### Task 7: Redis Vote Cache Layer
- [ ] 7.1 Create `src/lib/cache/vote-cache.ts` with Redis helpers [AC 3.3.6]
- [ ] 7.2 Implement `getVoteCounts(submissionId)`: read from Redis key `vote:sub:{id}`, fallback to PostgreSQL [AC 3.3.6]
- [ ] 7.3 Implement `updateVoteCounts(submissionId, upCount, downCount)`: write to Redis with 5-minute TTL [AC 3.3.6]
- [ ] 7.4 Implement `getUserVoteFromCache(userId, submissionId)`: read from Redis key `vote:user:{userId}:{subId}` with 1-hour TTL [AC 3.3.6]
- [ ] 7.5 Implement cache invalidation on vote change [AC 3.3.6]
- [ ] 7.6 Use Redis pipeline for batch operations during high concurrency [AC 3.3.6]

### Task 8: Lazy Auth Gate Integration
- [ ] 8.1 Create or extend `src/hooks/use-auth.ts` with `isAuthenticated` and `openAuthGate()` [AC 3.3.5]
- [ ] 8.2 Integrate with `LazyAuthGate` component from Story 1.2 [AC 3.3.5]
- [ ] 8.3 Pass `pendingAction="voter"` to LazyAuthGate modal [AC 3.3.5]

### Task 9: Tests
- [ ] 9.1 Unit test Zustand vote cache store: setVote, setCounts, getVote, getCounts [AC 3.3.2]
- [ ] 9.2 Unit test `useVote` hook: upvote, downvote, toggle off, switch direction, rollback on error [AC 3.3.2, AC 3.3.3, AC 3.3.4]
- [ ] 9.3 Unit test `useVote` hook: unauthenticated user triggers auth gate [AC 3.3.5]
- [ ] 9.4 Component test `VoteButton`: renders arrows, score, applies correct styles per state [AC 3.3.2]
- [ ] 9.5 Component test `VoteButton`: optimistic update within 100ms [AC 3.3.2]
- [ ] 9.6 API route test `POST /api/v1/submissions/{id}/votes`: cast vote, returns updated counts [AC 3.3.2]
- [ ] 9.7 API route test: duplicate vote same direction toggles off [AC 3.3.4]
- [ ] 9.8 API route test: vote switch updates counts correctly [AC 3.3.3]
- [ ] 9.9 API route test: unauthenticated returns 401 [AC 3.3.5]
- [ ] 9.10 Integration test: vote persists to database and updates Redis cache [AC 3.3.6]
- [ ] 9.11 Unit test `castVote()`: atomic counter updates in all scenarios [AC 3.3.2]
- [ ] 9.12 Load test: 1000+ concurrent vote operations (NFR15) [AC 3.3.6]

---

## Dev Notes

### Architecture

**Optimistic Voting Pattern (from Architecture Section 3.4):**

The voting system uses a three-layer approach:
1. **Zustand store** for instant client-side state updates (< 100ms)
2. **TanStack Query mutation** for the API call
3. **Redis cache** for cross-request state
4. **PostgreSQL** as the eventual source of truth

The flow:
1. User taps vote button
2. UI immediately updates vote count and button state (< 100ms) via Zustand store
3. API call fires in background via TanStack Query mutation
4. On success: server state eventually syncs (Redis updated, then PostgreSQL)
5. On error: UI rolls back to previous state + error toast notification

**Full Zustand Vote Cache Store (from Architecture):**

```typescript
// src/stores/vote-cache.ts
import { create } from 'zustand';

type VoteState = 'up' | 'down' | null;

interface VoteCacheStore {
  votes: Map<string, VoteState>;
  counts: Map<string, { up: number; down: number }>;
  setVote: (submissionId: string, vote: VoteState) => void;
  setCounts: (submissionId: string, up: number, down: number) => void;
  getVote: (submissionId: string) => VoteState;
  getCounts: (submissionId: string) => { up: number; down: number } | undefined;
}

export const useVoteCache = create<VoteCacheStore>((set, get) => ({
  votes: new Map(),
  counts: new Map(),
  setVote: (submissionId, vote) =>
    set((state) => {
      const newVotes = new Map(state.votes);
      newVotes.set(submissionId, vote);
      return { votes: newVotes };
    }),
  setCounts: (submissionId, up, down) =>
    set((state) => {
      const newCounts = new Map(state.counts);
      newCounts.set(submissionId, { up, down });
      return { counts: newCounts };
    }),
  getVote: (submissionId) => get().votes.get(submissionId) ?? null,
  getCounts: (submissionId) => get().counts.get(submissionId),
}));
```

**Full Optimistic Voting Hook (from Architecture):**

```typescript
// src/hooks/use-vote.ts
'use client';

import { useVoteCache } from '@/stores/vote-cache';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

export function useVote(submissionId: string, serverCounts: { up: number; down: number }) {
  const { setVote, setCounts, getVote, getCounts } = useVoteCache();
  const { isAuthenticated, openAuthGate } = useAuth();

  // Use cache if available, fallback to server data
  const currentVote = getVote(submissionId);
  const counts = getCounts(submissionId) ?? serverCounts;

  const mutation = useMutation({
    mutationFn: async (voteType: 'up' | 'down') => {
      const res = await fetch(`/api/v1/submissions/${submissionId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
      if (!res.ok) throw new Error('Vote failed');
      return res.json();
    },
    onMutate: async (voteType) => {
      // Optimistic update
      const prevVote = currentVote;
      const prevCounts = { ...counts };

      if (prevVote === voteType) {
        // Toggle off
        setVote(submissionId, null);
        setCounts(
          submissionId,
          counts.up - (voteType === 'up' ? 1 : 0),
          counts.down - (voteType === 'down' ? 1 : 0)
        );
      } else {
        // New vote or switch
        setVote(submissionId, voteType);
        let newUp = counts.up;
        let newDown = counts.down;
        if (prevVote === 'up') newUp--;
        if (prevVote === 'down') newDown--;
        if (voteType === 'up') newUp++;
        if (voteType === 'down') newDown++;
        setCounts(submissionId, newUp, newDown);
      }

      return { prevVote, prevCounts };
    },
    onError: (_err, _voteType, context) => {
      // Rollback on error
      if (context) {
        setVote(submissionId, context.prevVote);
        setCounts(submissionId, context.prevCounts.up, context.prevCounts.down);
      }
    },
  });

  const vote = (voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      openAuthGate();
      return;
    }
    mutation.mutate(voteType);
  };

  return { vote, currentVote, counts, isLoading: mutation.isPending };
}
```

### Technical Requirements

**Database Vote Table Schema (Drizzle ORM):**

```typescript
// Addition to src/lib/db/schema.ts
import { pgTable, uuid, timestamp, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const voteType = pgEnum('vote_type', ['up', 'down']);

export const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id),
  voteType: voteType('vote_type').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userSubmissionUnique: uniqueIndex('idx_votes_user_submission').on(table.userId, table.submissionId),
  submissionIdx: index('idx_votes_submission_id').on(table.submissionId),
}));
```

**Database Indexes (from Architecture):**

```sql
CREATE UNIQUE INDEX idx_votes_user_submission ON votes (user_id, submission_id);
CREATE INDEX idx_votes_submission_id ON votes (submission_id);
```

**Vote Processing with Atomic Counter Updates:**

```typescript
// src/lib/api/votes.ts
import { db } from '@/lib/db';
import { votes, submissions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function castVote(
  userId: string,
  submissionId: string,
  voteType: 'up' | 'down'
) {
  return db.transaction(async (tx) => {
    // Check for existing vote
    const existing = await tx
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.submissionId, submissionId)))
      .limit(1);

    const existingVote = existing[0];

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off: remove vote
        await tx.delete(votes).where(eq(votes.id, existingVote.id));

        if (voteType === 'up') {
          await tx.update(submissions)
            .set({
              upvoteCount: sql`${submissions.upvoteCount} - 1`,
              updatedAt: new Date(),
            })
            .where(eq(submissions.id, submissionId));
        } else {
          await tx.update(submissions)
            .set({
              downvoteCount: sql`${submissions.downvoteCount} - 1`,
              updatedAt: new Date(),
            })
            .where(eq(submissions.id, submissionId));
        }

        return { action: 'removed', userVote: null };
      } else {
        // Switch direction
        await tx.update(votes)
          .set({ voteType, createdAt: new Date() })
          .where(eq(votes.id, existingVote.id));

        if (voteType === 'up') {
          // Switching from down to up
          await tx.update(submissions)
            .set({
              upvoteCount: sql`${submissions.upvoteCount} + 1`,
              downvoteCount: sql`${submissions.downvoteCount} - 1`,
              updatedAt: new Date(),
            })
            .where(eq(submissions.id, submissionId));
        } else {
          // Switching from up to down
          await tx.update(submissions)
            .set({
              upvoteCount: sql`${submissions.upvoteCount} - 1`,
              downvoteCount: sql`${submissions.downvoteCount} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(submissions.id, submissionId));
        }

        return { action: 'switched', userVote: voteType };
      }
    } else {
      // New vote
      await tx.insert(votes).values({
        userId,
        submissionId,
        voteType,
      });

      if (voteType === 'up') {
        await tx.update(submissions)
          .set({
            upvoteCount: sql`${submissions.upvoteCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(submissions.id, submissionId));
      } else {
        await tx.update(submissions)
          .set({
            downvoteCount: sql`${submissions.downvoteCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(submissions.id, submissionId));
      }

      return { action: 'created', userVote: voteType };
    }
  });
}
```

**Redis Vote Cache Patterns:**

```typescript
// src/lib/cache/vote-cache.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Key patterns (from Architecture Redis Strategy):
// vote:sub:{id}       -- TTL 5 min  -- Cached vote counts for submission
// vote:user:{userId}:{subId} -- TTL 1 hour -- User's vote on a submission (dedup)

export async function getVoteCounts(submissionId: string): Promise<{ up: number; down: number } | null> {
  const cached = await redis.get<{ up: number; down: number }>(`vote:sub:${submissionId}`);
  return cached;
}

export async function updateVoteCounts(
  submissionId: string,
  upCount: number,
  downCount: number
): Promise<void> {
  await redis.set(
    `vote:sub:${submissionId}`,
    JSON.stringify({ up: upCount, down: downCount }),
    { ex: 300 } // 5-minute TTL
  );
}

export async function getUserVote(
  userId: string,
  submissionId: string
): Promise<'up' | 'down' | null> {
  return redis.get<'up' | 'down' | null>(`vote:user:${userId}:${submissionId}`);
}

export async function setUserVote(
  userId: string,
  submissionId: string,
  voteType: 'up' | 'down' | null
): Promise<void> {
  const key = `vote:user:${userId}:${submissionId}`;
  if (voteType === null) {
    await redis.del(key);
  } else {
    await redis.set(key, voteType, { ex: 3600 }); // 1-hour TTL
  }
}

export async function invalidateVoteCache(submissionId: string): Promise<void> {
  await redis.del(`vote:sub:${submissionId}`);
}
```

**Vote API Route Handler:**

```typescript
// src/app/api/v1/submissions/[id]/votes/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { castVote } from '@/lib/api/votes';
import { apiSuccess, apiError } from '@/lib/api/response';
import { updateVoteCounts, setUserVote } from '@/lib/cache/vote-cache';
import { z } from 'zod';

const voteSchema = z.object({
  voteType: z.enum(['up', 'down']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError('UNAUTHORIZED', 'Connectez-vous pour voter', 401);
  }

  const body = await request.json();
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Type de vote invalide', 400);
  }

  const { id: submissionId } = await params;
  const { voteType } = parsed.data;

  try {
    const result = await castVote(session.user.id, submissionId, voteType);

    // Update Redis cache after database write
    // Fetch fresh counts from DB for accuracy
    const submission = await db
      .select({ upvoteCount: submissions.upvoteCount, downvoteCount: submissions.downvoteCount })
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1);

    if (submission[0]) {
      await updateVoteCounts(submissionId, submission[0].upvoteCount, submission[0].downvoteCount);
      await setUserVote(session.user.id, submissionId, result.userVote);
    }

    return apiSuccess({
      upvoteCount: submission[0]?.upvoteCount ?? 0,
      downvoteCount: submission[0]?.downvoteCount ?? 0,
      userVote: result.userVote,
    });
  } catch (error) {
    return apiError('INTERNAL_ERROR', 'Erreur lors du vote. Reessayez.', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError('UNAUTHORIZED', 'Connectez-vous pour voter', 401);
  }

  const { id: submissionId } = await params;

  try {
    await removeVote(session.user.id, submissionId);
    await invalidateVoteCache(submissionId);
    await setUserVote(session.user.id, submissionId, null);

    return apiSuccess({ userVote: null });
  } catch (error) {
    return apiError('INTERNAL_ERROR', 'Erreur lors de la suppression du vote', 500);
  }
}
```

### File Structure

```
src/
  app/
    api/
      v1/
        submissions/
          [id]/
            votes/
              route.ts                     # POST vote, DELETE unvote
  components/
    features/
      voting/
        VoteButton.tsx                     # Upvote/downvote with optimistic UI (Client)
        VoteButton.test.tsx                # Component tests
  hooks/
    use-vote.ts                            # Optimistic voting hook
    use-auth.ts                            # Auth state + lazy auth gate
  stores/
    vote-cache.ts                          # Zustand: optimistic vote cache
  lib/
    api/
      votes.ts                             # Server-side vote processing (Drizzle)
    cache/
      vote-cache.ts                        # Redis vote cache helpers
    db/
      schema.ts                            # votes table schema (addition)
      migrations/                          # Generated vote table migration
  types/
    vote.ts                                # Vote TypeScript types
```

### Testing

| Test Type | Tool | File | Description |
|---|---|---|---|
| Unit | Vitest | `src/stores/vote-cache.test.ts` | Zustand store operations (set/get vote, counts) |
| Unit | Vitest | `src/hooks/use-vote.test.ts` | All vote scenarios: up, down, toggle, switch, rollback |
| Unit | Vitest | `src/lib/api/votes.test.ts` | castVote atomic operations, all scenarios |
| Component | Vitest + Testing Library | `src/components/features/voting/VoteButton.test.tsx` | Renders arrows, styles per state, animation triggers |
| API Route | Vitest | `__tests__/api/votes.test.ts` | POST/DELETE vote operations, auth check, validation |
| Integration | Vitest | `__tests__/integration/voting.test.ts` | Full vote flow: API -> DB -> Redis cache |
| Load | k6 or Artillery | `load-tests/voting.js` | 1000+ concurrent votes without data loss |
| E2E | Playwright | `e2e/submission.spec.ts` | Vote from feed and detail page |

**Key Test Scenarios for `use-vote.ts`:**
1. New upvote: counts.up +1, vote state = 'up'
2. New downvote: counts.down +1, vote state = 'down'
3. Toggle off upvote: counts.up -1, vote state = null
4. Toggle off downvote: counts.down -1, vote state = null
5. Switch up->down: counts.up -1, counts.down +1, vote state = 'down'
6. Switch down->up: counts.down -1, counts.up +1, vote state = 'up'
7. Server error: rollback to previous state
8. Unauthenticated: auth gate opens, no mutation fired

### UX/Design

**shadcn/ui Components Used:**
- `Button` -- Base for vote arrow buttons (ghost variant)
- `Toast` -- Error notification on vote failure ("Erreur lors du vote. Reessayez.")

**VoteButton Component Design (from UX Spec):**
| Property | Detail |
|---|---|
| **Content** | Arrow icon + vote count |
| **Actions** | Tap to vote (optimistic), tap again to undo |
| **States** | Default (gray/muted), active-up (chainsaw-red), active-down (text-secondary/indigo), loading (pulse), disabled (not logged in -> lazy registration) |
| **Animation** | Counter increment/decrement animation. Arrow color transition. Subtle scale bounce on tap. |
| **Touch target** | 48x48px minimum. Thumb-reach positioning on mobile. |

**Visual States:**
- **Neutral:** Both arrows `text-text-muted` (#737373), score `text-text-secondary`
- **Upvoted:** Up arrow `text-chainsaw-red` (#DC2626), down arrow `text-text-muted`, score `text-chainsaw-red`
- **Downvoted:** Down arrow `text-info` (#3B82F6), up arrow `text-text-muted`, score `text-text-secondary`

**Toast Notifications (from Architecture):**
| Action | Toast Type | Message |
|---|---|---|
| Vote cast | None (optimistic) | No toast needed |
| Vote failed | Error | "Erreur lors du vote. Reessayez." |
| Login required | Info | "Connectez-vous pour continuer" |

**Responsive Behavior:**
- Mobile (375px-767px): Vertical layout (up arrow, score, down arrow), 48px touch targets
- Desktop (1024px+): Can be vertical or horizontal depending on card layout, hover states enabled

### Dependencies

**Upstream (required before this story):**
- Story 1.1: Project Scaffold & Design System Foundation
- Story 1.2: Email/Password Registration & Login (authentication for voting)
- Story 2.1: Waste Submission Form (submissions table with counter columns)
- Story 3.1: Submission Feed (SubmissionCard integrates VoteButton)

**Downstream (depends on this story):**
- Story 3.4: Score Calculation & Feed Ranking Algorithm (hot score recalculation on vote)
- Story 5.2: Comment Voting (same pattern reused)

### References

- Architecture: Section 3.1 (votes table schema, database indexes), Section 3.4 (Zustand vote-cache store, useVote hook, optimistic voting pattern), Section 4.4 (Optimistic UI for Votes flow, toast notifications), Redis Caching Strategy (vote key patterns, TTLs)
- UX Design: VoteButton component spec, Button Hierarchy (Vote custom component), Feedback Patterns (optimistic update), Touch Targets (48px minimum)
- PRD: FR6 (upvote/downvote, one per user per submission), FR7 (change vote), NFR2 (optimistic UI < 100ms, server < 500ms), NFR15 (1000+ concurrent votes), NFR23 (eventual consistency within 5 seconds)

---

## Dev Agent Record

| Field | Value |
|---|---|
| **Story Key** | 3.3 |
| **Status** | Draft |
| **Assigned To** | -- |
| **Started** | -- |
| **Completed** | -- |
| **Blocked By** | Story 1.1, Story 1.2, Story 2.1, Story 3.1 |
| **Notes** | Core story -- the voting hook and Zustand store are reused by Story 5.2 (comment voting) |
