# Story 3.4: Score Calculation & Feed Ranking Algorithm

## Story

**As a** system,
**I want** to calculate submission scores and apply ranking algorithms,
**So that** the most relevant and engaging content surfaces to the top of the feed.

**FRs Covered:** FR8
**NFRs Integrated:** NFR14, NFR23

---

## Acceptance Criteria (BDD)

### AC 3.4.1: Score Recalculation on Vote

```gherkin
Given a vote is cast or changed on a submission
When the vote is persisted
Then the submission's `score` is recalculated as `upvote_count - downvote_count` (FR8)
And the `upvote_count` and `downvote_count` columns are updated atomically in a single database transaction
```

### AC 3.4.2: Hot Ranking Algorithm

```gherkin
Given the Hot (Tendances) sort is applied to the feed
When submissions are queried
Then the ranking formula `score / (hours_since_creation + 2)^1.5` is computed
And submissions are ordered by this rank descending
And submissions older than 7 days with a score below 10 are excluded from the Hot feed to keep it fresh
```

### AC 3.4.3: Top Sort Time Filters

```gherkin
Given the Top sort is applied with a time filter
When submissions are queried
Then the system supports time filters: "Aujourd'hui" (today), "Cette semaine" (this week), "Ce mois" (this month), "Tout temps" (all time)
And the default time filter for Top is "Cette semaine"
```

### AC 3.4.4: Redis-Cached Scores in Feed

```gherkin
Given the Redis vote cache contains a score for a submission
When the feed is loaded
Then the score displayed uses the Redis-cached value for real-time accuracy
And the PostgreSQL `score` column is treated as the eventual source of truth, synced within 5 seconds (NFR23)
```

### AC 3.4.5: Feed Query Performance

```gherkin
Given the feed is loaded under high traffic
When the server processes requests
Then feed queries use database indexes on `(status, score)`, `(status, created_at)`, and a computed column or materialized view for hot ranking
And the query execution time is under 100ms for the first page of results (NFR14)
```

---

## Tasks / Subtasks

### Task 1: Hot Score PostgreSQL Function
- [ ] 1.1 Create a Drizzle migration that adds a PostgreSQL function `calculate_hot_score(upvotes, downvotes, created_at)` [AC 3.4.2]
- [ ] 1.2 Implement the Reddit-inspired hot score formula: `log10(max(|upvotes - downvotes|, 1)) + (sign * created_epoch / 45000)` [AC 3.4.2]
- [ ] 1.3 The `sign` value is: +1 if net positive, -1 if net negative, 0 if zero [AC 3.4.2]
- [ ] 1.4 The `45000` constant provides ~12.5 hours decay (faster than Reddit's 24h) [AC 3.4.2]
- [ ] 1.5 Create a PostgreSQL trigger `trg_update_hot_score` on the `submissions` table that recalculates `hot_score` when `upvote_count` or `downvote_count` changes [AC 3.4.1, AC 3.4.2]

### Task 2: Hot Score Column & Index
- [ ] 2.1 Ensure `hot_score` column exists on `submissions` table (decimal, precision 20, scale 10) [AC 3.4.2]
- [ ] 2.2 Create partial index `idx_submissions_hot_score` on `(hot_score DESC) WHERE status = 'published'` [AC 3.4.5]
- [ ] 2.3 Backfill `hot_score` for all existing submissions via migration script [AC 3.4.2]

### Task 3: Score Column Atomic Updates
- [ ] 3.1 Ensure `score` computed column or application-level calculation: `upvote_count - downvote_count` [AC 3.4.1]
- [ ] 3.2 Update `castVote()` in `src/lib/api/votes.ts` to atomically update `upvote_count`, `downvote_count` in a single transaction [AC 3.4.1]
- [ ] 3.3 Trigger hot score recalculation after counter update (either via DB trigger or application code) [AC 3.4.1]

### Task 4: Client-Side Hot Score Utility
- [ ] 4.1 Create `src/lib/utils/hot-score.ts` with client-side hot score preview function [AC 3.4.2]
- [ ] 4.2 Implement `calculateHotScore(upvotes: number, downvotes: number, createdAt: Date): number` [AC 3.4.2]
- [ ] 4.3 Match the server-side formula exactly for consistency [AC 3.4.2]

### Task 5: Hot Feed Query Implementation
- [ ] 5.1 Create `getHotFeed()` in `src/lib/api/submissions.ts` using the `hot_score` column [AC 3.4.2]
- [ ] 5.2 Exclude submissions older than 7 days with score < 10 from Hot feed [AC 3.4.2]
- [ ] 5.3 Use cursor-based pagination on `hot_score` descending [AC 3.4.2]
- [ ] 5.4 Cache result in Redis key `feed:hot:{cursor}` with 60-second TTL [AC 3.4.4]

### Task 6: Top Feed with Time Filters
- [ ] 6.1 Create `getTopFeed()` in `src/lib/api/submissions.ts` with time window parameter [AC 3.4.3]
- [ ] 6.2 Implement time filter: "today" (last 24h), "week" (last 7 days), "month" (last 30 days), "all" (all time) [AC 3.4.3]
- [ ] 6.3 Default time filter is "week" when none specified [AC 3.4.3]
- [ ] 6.4 Sort by `score` descending within the time window [AC 3.4.3]
- [ ] 6.5 Cache result in Redis key `feed:top:{window}:{cursor}` with 120-second TTL [AC 3.4.4]
- [ ] 6.6 Update URL pattern to support time filter: `/feed/top?t=week` [AC 3.4.3]

### Task 7: Top Sort Time Filter UI
- [ ] 7.1 Add sub-filter dropdown/tabs below FeedSortTabs when "Top" is active [AC 3.4.3]
- [ ] 7.2 Options: "Aujourd'hui", "Cette semaine" (default), "Ce mois", "Tout temps" [AC 3.4.3]
- [ ] 7.3 Update URL query param `t` on filter change [AC 3.4.3]
- [ ] 7.4 Trigger feed reload with skeleton on filter change [AC 3.4.3]

### Task 8: Redis Score Sync
- [ ] 8.1 After each vote, update Redis key `vote:sub:{id}` with latest counts [AC 3.4.4]
- [ ] 8.2 Feed queries read from Redis first, fallback to PostgreSQL [AC 3.4.4]
- [ ] 8.3 Implement eventual consistency: Redis -> PostgreSQL sync within 5 seconds [AC 3.4.4]
- [ ] 8.4 Invalidate feed page caches in Redis when vote counts change significantly (>5% change or new submission enters top 20) [AC 3.4.4]

### Task 9: Database Index Optimization
- [ ] 9.1 Create index `idx_submissions_hot_score ON submissions (hot_score DESC) WHERE status = 'published'` [AC 3.4.5]
- [ ] 9.2 Create index `idx_submissions_created_at ON submissions (created_at DESC) WHERE status = 'published'` [AC 3.4.5]
- [ ] 9.3 Create index `idx_submissions_upvote_count ON submissions (upvote_count DESC) WHERE status = 'published'` [AC 3.4.5]
- [ ] 9.4 Verify query execution plans with `EXPLAIN ANALYZE` for each sort mode [AC 3.4.5]
- [ ] 9.5 Ensure first-page query execution under 100ms with 10K+ rows [AC 3.4.5]

### Task 10: Tests
- [ ] 10.1 Unit test `calculateHotScore()`: verify formula matches expected values for known inputs [AC 3.4.2]
- [ ] 10.2 Unit test: newer submissions with same score rank higher than older ones [AC 3.4.2]
- [ ] 10.3 Unit test: submissions with higher scores rank higher than lower scores at same age [AC 3.4.2]
- [ ] 10.4 Unit test: negative score submissions rank lower than positive ones [AC 3.4.2]
- [ ] 10.5 Unit test: 7-day-old submissions with score < 10 excluded from Hot feed [AC 3.4.2]
- [ ] 10.6 Unit test: Top feed time filters return correct submissions within window [AC 3.4.3]
- [ ] 10.7 Unit test: Top feed default time filter is "week" [AC 3.4.3]
- [ ] 10.8 Integration test: PostgreSQL trigger recalculates hot_score on vote [AC 3.4.1]
- [ ] 10.9 Integration test: atomic counter updates maintain consistency under concurrent writes [AC 3.4.1]
- [ ] 10.10 Performance test: feed query < 100ms with 10K+ submissions [AC 3.4.5]
- [ ] 10.11 Integration test: Redis cache returns correct scores, falls back to PostgreSQL [AC 3.4.4]

---

## Dev Notes

### Architecture

**Hot Score Algorithm (from Architecture Section 3.4):**

The hot score determines submission ranking in the `/feed/hot` view. It is based on Reddit's algorithm with modifications for the LIBERAL context (faster decay for a more dynamic French political news cycle).

**Formula:**
```
hot_score = log10(max(|upvotes - downvotes|, 1)) + (sign * created_epoch / 45000)
```

**Variables:**
- `sign`: +1 if net votes positive, -1 if net negative, 0 if zero
- `created_epoch`: Unix timestamp of creation (seconds since epoch)
- `45000`: Decay constant (~12.5 hours). This means a submission needs to gain ~10x more votes every ~12.5 hours to maintain its ranking position. This is faster than Reddit's 45000-second (~12.5h) but contextualized for LIBERAL's expected posting velocity.

**Key Properties:**
1. **Time decay:** Newer submissions automatically rank higher than older ones with the same score
2. **Logarithmic scoring:** The difference between 10 and 100 votes matters more than 1000 and 1090
3. **Sign handling:** Negative-score submissions sink to the bottom
4. **Epoch-based:** The score is absolute, not relative, making it stable for caching

**PostgreSQL Function Implementation:**

```sql
-- Migration: create hot score function and trigger
CREATE OR REPLACE FUNCTION calculate_hot_score(
  p_upvote_count INTEGER,
  p_downvote_count INTEGER,
  p_created_at TIMESTAMP WITH TIME ZONE
) RETURNS DECIMAL(20, 10) AS $$
DECLARE
  v_score INTEGER;
  v_sign INTEGER;
  v_order DECIMAL;
  v_seconds DECIMAL;
  v_hot_score DECIMAL(20, 10);
BEGIN
  v_score := p_upvote_count - p_downvote_count;

  IF v_score > 0 THEN
    v_sign := 1;
  ELSIF v_score < 0 THEN
    v_sign := -1;
  ELSE
    v_sign := 0;
  END IF;

  v_order := log(10, GREATEST(ABS(v_score), 1)::DECIMAL);
  v_seconds := EXTRACT(EPOCH FROM p_created_at);

  v_hot_score := v_order + (v_sign * v_seconds / 45000.0);

  RETURN v_hot_score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update hot_score on vote count changes
CREATE OR REPLACE FUNCTION update_submission_hot_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.hot_score := calculate_hot_score(
    NEW.upvote_count,
    NEW.downvote_count,
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_hot_score
  BEFORE UPDATE OF upvote_count, downvote_count ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_submission_hot_score();

-- Also set hot_score on insert
CREATE TRIGGER trg_insert_hot_score
  BEFORE INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_submission_hot_score();
```

**Client-Side Hot Score (for preview/sorting):**

```typescript
// src/lib/utils/hot-score.ts

/**
 * Calculate the hot score for a submission.
 * Matches the PostgreSQL function `calculate_hot_score` exactly.
 *
 * Formula: log10(max(|upvotes - downvotes|, 1)) + (sign * created_epoch / 45000)
 *
 * @param upvotes - Number of upvotes
 * @param downvotes - Number of downvotes
 * @param createdAt - Submission creation date
 * @returns Hot score as a number
 */
export function calculateHotScore(
  upvotes: number,
  downvotes: number,
  createdAt: Date
): number {
  const score = upvotes - downvotes;

  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const seconds = createdAt.getTime() / 1000; // Unix epoch in seconds

  return order + (sign * seconds) / 45000;
}
```

### Technical Requirements

**Feed Query Implementations:**

```typescript
// src/lib/api/submissions.ts -- Hot feed query

export async function getHotFeed({ cursor, limit = 20 }: PaginationParams) {
  const decoded = cursor ? decodeCursor(cursor) : null;

  // Exclude stale submissions: older than 7 days with score < 10
  const staleThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const results = await db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.status, 'published'),
        // Exclude stale: (created_at > 7 days ago) OR (score >= 10)
        or(
          gt(submissions.createdAt, staleThreshold),
          gte(sql`${submissions.upvoteCount} - ${submissions.downvoteCount}`, 10)
        ),
        decoded
          ? lt(submissions.hotScore, decoded.sortValue)
          : undefined
      )
    )
    .orderBy(desc(submissions.hotScore))
    .limit(limit + 1);

  return paginateResults(results, limit, 'hot');
}
```

```typescript
// src/lib/api/submissions.ts -- Top feed with time filter

type TimeWindow = 'today' | 'week' | 'month' | 'all';

const TIME_WINDOW_MS: Record<TimeWindow, number | null> = {
  today: 24 * 60 * 60 * 1000,      // 24 hours
  week: 7 * 24 * 60 * 60 * 1000,   // 7 days
  month: 30 * 24 * 60 * 60 * 1000, // 30 days
  all: null,                         // No filter
};

export async function getTopFeed({
  cursor,
  limit = 20,
  timeWindow = 'week',
}: PaginationParams & { timeWindow?: TimeWindow }) {
  const decoded = cursor ? decodeCursor(cursor) : null;

  const windowMs = TIME_WINDOW_MS[timeWindow];
  const windowThreshold = windowMs ? new Date(Date.now() - windowMs) : null;

  const results = await db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.status, 'published'),
        windowThreshold
          ? gt(submissions.createdAt, windowThreshold)
          : undefined,
        decoded
          ? lt(
              sql`${submissions.upvoteCount} - ${submissions.downvoteCount}`,
              Number(decoded.sortValue)
            )
          : undefined
      )
    )
    .orderBy(desc(sql`${submissions.upvoteCount} - ${submissions.downvoteCount}`))
    .limit(limit + 1);

  return paginateResults(results, limit, 'top');
}
```

**Redis Sorted Sets for Ranking (Alternative High-Performance Approach):**

For high-traffic scenarios, Redis sorted sets can maintain real-time rankings:

```typescript
// src/lib/cache/feed-ranking.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Use Redis sorted sets for real-time hot ranking
// Key: feed:hot:ranked
// Score: hot_score value
// Member: submission ID

export async function updateHotRanking(
  submissionId: string,
  hotScore: number
): Promise<void> {
  await redis.zadd('feed:hot:ranked', { score: hotScore, member: submissionId });
}

export async function getHotRanking(
  offset: number = 0,
  limit: number = 20
): Promise<string[]> {
  // ZREVRANGE returns highest scores first
  return redis.zrange('feed:hot:ranked', offset, offset + limit - 1, { rev: true });
}

export async function removeFromRanking(submissionId: string): Promise<void> {
  await redis.zrem('feed:hot:ranked', submissionId);
}

// Periodic cleanup: remove submissions older than 7 days with low scores
export async function cleanupStaleRankings(): Promise<void> {
  // This runs as a scheduled job, not per-request
  const staleThreshold = calculateHotScore(9, 0, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  await redis.zremrangebyscore('feed:hot:ranked', '-inf', staleThreshold);
}
```

**Database Indexes (from Architecture):**

```sql
-- Performance-critical indexes for feed queries
CREATE INDEX idx_submissions_hot_score ON submissions (hot_score DESC) WHERE status = 'published';
CREATE INDEX idx_submissions_created_at ON submissions (created_at DESC) WHERE status = 'published';
CREATE INDEX idx_submissions_upvote_count ON submissions (upvote_count DESC) WHERE status = 'published';
```

**Feed Cache Strategy (from Architecture Redis section):**

| Key Pattern | TTL | Purpose |
|---|---|---|
| `feed:hot:{cursor}` | 60 sec | Hot feed page cache |
| `feed:new:{cursor}` | 30 sec | New feed page cache |
| `feed:top:{window}:{cursor}` | 2 min | Top feed page cache (per time window) |
| `vote:sub:{id}` | 5 min | Cached vote counts for individual submission |

### File Structure

```
src/
  app/
    feed/
      [sort]/
        page.tsx                           # Updated to pass timeWindow to top feed
    api/
      v1/
        submissions/
          route.ts                         # Updated with time filter support for top
  components/
    features/
      feed/
        FeedSortTabs.tsx                   # Updated with time filter sub-tabs for Top
        TopTimeFilter.tsx                  # New: time filter dropdown for Top sort
  lib/
    api/
      submissions.ts                      # getHotFeed(), getTopFeed(), getNewFeed()
    cache/
      feed-ranking.ts                     # Redis sorted set ranking helpers
    utils/
      hot-score.ts                        # Client-side hot score calculation
    db/
      schema.ts                           # hot_score column (already exists)
      migrations/
        XXXX_hot_score_function.sql        # PostgreSQL function + trigger
```

### Testing

| Test Type | Tool | File | Description |
|---|---|---|---|
| Unit | Vitest | `src/lib/utils/hot-score.test.ts` | Formula correctness, edge cases |
| Unit | Vitest | `src/lib/api/submissions.test.ts` | Hot/Top/New feed queries, time filters |
| Integration | Vitest | `__tests__/integration/hot-score.test.ts` | PostgreSQL trigger recalculates on vote |
| Integration | Vitest | `__tests__/integration/feed-ranking.test.ts` | Redis sorted set operations |
| Component | Vitest + Testing Library | `src/components/features/feed/TopTimeFilter.test.tsx` | Time filter rendering, URL updates |
| Performance | pg_bench / custom | `benchmarks/feed-query.ts` | Query execution < 100ms with 10K+ rows |

**Hot Score Test Vectors:**

```typescript
// Expected test cases for calculateHotScore
describe('calculateHotScore', () => {
  // Test: newer submission with same score ranks higher
  it('ranks newer submission higher with equal score', () => {
    const older = calculateHotScore(10, 0, new Date('2026-02-20T12:00:00Z'));
    const newer = calculateHotScore(10, 0, new Date('2026-02-27T12:00:00Z'));
    expect(newer).toBeGreaterThan(older);
  });

  // Test: higher score ranks higher at same time
  it('ranks higher score above lower score at same time', () => {
    const low = calculateHotScore(5, 0, new Date('2026-02-27T12:00:00Z'));
    const high = calculateHotScore(50, 0, new Date('2026-02-27T12:00:00Z'));
    expect(high).toBeGreaterThan(low);
  });

  // Test: negative score sinks to bottom
  it('ranks negative score below positive', () => {
    const negative = calculateHotScore(2, 10, new Date('2026-02-27T12:00:00Z'));
    const positive = calculateHotScore(10, 2, new Date('2026-02-27T12:00:00Z'));
    expect(positive).toBeGreaterThan(negative);
  });

  // Test: log scaling - 10 vs 100 matters more than 1000 vs 1090
  it('applies logarithmic scaling to scores', () => {
    const t = new Date('2026-02-27T12:00:00Z');
    const diff10to100 = calculateHotScore(100, 0, t) - calculateHotScore(10, 0, t);
    const diff1000to1090 = calculateHotScore(1090, 0, t) - calculateHotScore(1000, 0, t);
    expect(diff10to100).toBeGreaterThan(diff1000to1090);
  });

  // Test: minimum score of 1 prevents log(0)
  it('handles zero net score without error', () => {
    const score = calculateHotScore(5, 5, new Date('2026-02-27T12:00:00Z'));
    expect(score).toBeGreaterThan(0); // epoch component ensures positive
  });
});
```

### UX/Design

**Top Time Filter UI:**
- Appears as a row of pills/chips below the FeedSortTabs when "Top" is active
- Options: "Aujourd'hui" | "Cette semaine" (default, highlighted) | "Ce mois" | "Tout temps"
- Mobile: horizontally scrollable, same row
- Active filter: `bg-chainsaw-red text-white rounded-full`
- Inactive filter: `bg-surface-elevated text-text-secondary rounded-full`

**No additional shadcn/ui components needed beyond those in Story 3.1.**

### Dependencies

**Upstream (required before this story):**
- Story 2.1: Waste Submission Form (submissions table with `hot_score`, `upvote_count`, `downvote_count` columns)
- Story 3.1: Submission Feed (feed queries, sort tabs)
- Story 3.3: Upvote/Downvote Mechanics (vote processing triggers score recalculation)

**Downstream (depends on this story):**
- Story 3.5: Feed Accessibility & Mobile Optimization

### References

- Architecture: Section 3.1 (Database Schema -- `hot_score` column, indexes), Section 3.4 (Hot Score Algorithm formula, decay constant 45000), Redis Caching Strategy (feed cache keys, TTLs), ISR Strategy (revalidation intervals per sort)
- UX Design: FeedSortTabs (Hot/New/Top with sub-filters), Feed behavior
- PRD: FR2 (Hot/Top/New sorting), FR8 (score calculation, ranking), NFR14 (50K MAU scalability), NFR23 (eventual consistency within 5 seconds)

---

## Dev Agent Record

| Field | Value |
|---|---|
| **Story Key** | 3.4 |
| **Status** | Draft |
| **Assigned To** | -- |
| **Started** | -- |
| **Completed** | -- |
| **Blocked By** | Story 2.1, Story 3.1, Story 3.3 |
| **Notes** | The hot score PostgreSQL function and trigger are critical infrastructure. The decay constant (45000 = ~12.5h) should be tunable via environment variable for production optimization. |
