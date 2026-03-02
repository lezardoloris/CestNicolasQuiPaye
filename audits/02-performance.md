# Performance Audit Report

**Project**: C'est Nicolas Qui Paye
**Date**: 2026-03-02
**Auditor**: Claude Opus 4.6
**Stack**: Next.js 16 (App Router), React 19, TypeScript 5.9, Recharts 3, Tailwind 4, Drizzle ORM, PostgreSQL

---

## Executive Summary

The application is well-architected with several good performance patterns already in place: ISR on feed pages, cursor-based pagination, `Promise.all` for parallel data fetching, dynamic imports for budget charts (Recharts), and Zustand for lightweight client state. However, there are **14 findings** across bundle size, data fetching, rendering, and database query optimization that, if addressed, would significantly improve Core Web Vitals (LCP, INP, CLS) and server response times.

| Severity | Count |
|----------|-------|
| CRITICAL | 2     |
| HIGH     | 5     |
| MEDIUM   | 5     |
| LOW      | 2     |

---

## 1. Bundle Size

### 1.1 CRITICAL -- Recharts not dynamically imported on /stats and /simulateur pages

**Files**:
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/features/stats/StatsPageClient.tsx` (lines 6-8)
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/features/simulator/SimulatorPageClient.tsx` (line 12)

**Description**: The `/chiffres` page correctly lazy-loads all Recharts-dependent components via `BudgetDynamicCharts.tsx` using `next/dynamic` with `ssr: false`. However, the `/stats` page directly imports `CategoryPieChart`, `Top10BarChart`, and `TimelineChart` -- all of which pull in Recharts (~500 KB gzipped). The `/simulateur` page similarly directly imports `BudgetAllocationChart`. This means **Recharts is included in the main client bundle** for these routes, blocking interactivity on initial load.

**Impact**: Adds approximately 500 KB of parsed JavaScript to the initial bundle for `/stats` and `/simulateur`. This directly harms LCP, TTI, and INP, especially on mobile networks.

**Fix**: Create dynamic wrappers analogous to `BudgetDynamicCharts.tsx`:

```typescript
// src/components/features/stats/StatsDynamicCharts.tsx
'use client';
import dynamic from 'next/dynamic';

export const CategoryPieChart = dynamic(
  () => import('./CategoryPieChart').then((m) => m.CategoryPieChart),
  { ssr: false },
);
export const Top10BarChart = dynamic(
  () => import('./Top10BarChart').then((m) => m.Top10BarChart),
  { ssr: false },
);
export const TimelineChart = dynamic(
  () => import('./TimelineChart').then((m) => m.TimelineChart),
  { ssr: false },
);
```

```typescript
// src/components/features/simulator/SimulatorDynamicCharts.tsx
'use client';
import dynamic from 'next/dynamic';

export const BudgetAllocationChart = dynamic(
  () => import('./BudgetAllocationChart').then((m) => m.BudgetAllocationChart),
  { ssr: false },
);
```

Then update the imports in `StatsPageClient.tsx` and `SimulatorPageClient.tsx` to use these dynamic wrappers. Consider adding a lightweight loading skeleton to prevent CLS during lazy load.

---

### 1.2 HIGH -- motion (Framer Motion) pulled into every feed card

**Files**:
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/features/feed/SubmissionCard.tsx` (line 4, line 47)
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/features/voting/VoteButtonInline.tsx` (line 4, line 66)
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/features/feed/CategoryFilter.tsx` (line 5)
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/features/feed/HeroSection.tsx` (line 5)
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/features/feed/MobileFeedFAB.tsx` (line 5)

**Description**: The `motion` package (~40 KB gzipped) is imported in `SubmissionCard` (rendered N times in the feed), `VoteButtonInline` (rendered N times), `CategoryFilter`, `HeroSection`, and `MobileFeedFAB`. While `motion/react` is tree-shakable and lighter than `framer-motion`, the feed page is the most visited route and every submission card creates a `motion.article` element with enter animations. For a list of 20 items, this is significant animation overhead during initial render.

**Impact**: Adds ~40 KB to the feed bundle. Each `motion.article` with `initial/animate/transition` triggers layout calculations and paints on mount. With 20 cards animating simultaneously (staggered by 50ms each), this causes jank during initial feed render, particularly on mid-range mobile devices.

**Fix suggestions**:
1. Replace `motion.article` in `SubmissionCard` with a plain `<article>` and CSS animation (`@keyframes fadeInUp`) using `animation-delay: calc(var(--index) * 50ms)`. CSS animations are handled off-main-thread and cost zero JS bundle.
2. Keep `motion` only in `VoteButtonInline` (score counter AnimatePresence) where it provides meaningful UX value.
3. In `CategoryFilter`, replace `motion.button` with `whileTap` with a simple CSS `active:scale-95` (already used elsewhere in the codebase).
4. Consider dynamically importing motion-dependent components that appear below the fold.

---

### 1.3 MEDIUM -- `pino` and `pino-pretty` in production dependencies but unused

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/package.json` (lines 41-42)

**Description**: `pino` (structured logger) and `pino-pretty` (dev formatter) are listed in `dependencies` but are not imported anywhere in `src/`. `pino-pretty` in particular is a dev-only tool (~200 KB) that should never be in production dependencies.

**Impact**: These packages may be included in the server bundle, increasing cold start time in serverless environments. `pino-pretty` adds unnecessary weight.

**Fix**: Either remove both packages if unused, or move `pino-pretty` to `devDependencies` and keep `pino` only if you plan to use it. If using pino, configure it with `pino-pretty` only in development:

```typescript
const logger = pino({
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});
```

---

### 1.4 MEDIUM -- `drizzle-kit` in production dependencies

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/package.json` (line 34)

**Description**: `drizzle-kit` is a CLI tool for migrations/introspection and should be in `devDependencies`. It is currently in `dependencies`, which means it gets installed in production builds.

**Impact**: Adds unnecessary packages to production `node_modules`, increasing deploy size and potentially cold start times.

**Fix**: Move `drizzle-kit` to `devDependencies`. Update the `start` script to run migrations via a separate step or pre-deploy hook rather than at runtime.

---

## 2. Server vs Client Components

### 2.1 HIGH -- `BudgetPageClient` is a server-renderable component marked with no `"use client"`

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/features/budget/BudgetPageClient.tsx`

**Description**: This component receives static data as props (`BUDGET_2026` constant) and renders only static markup with dynamically imported chart components. It uses no hooks, no event handlers, and no browser APIs -- it is effectively a **Server Component**. Despite its name ending in `Client`, it does NOT have `"use client"` and is indeed rendered as a Server Component. This is actually **correct** -- the naming is misleading but the behavior is right. The dynamic chart children bring their own `"use client"` boundary.

**Impact**: None (this is already correct). The naming `BudgetPageClient` is misleading -- consider renaming to `BudgetPageContent` to avoid confusion.

---

### 2.2 MEDIUM -- `StatsPageClient` wraps server-fetched data but forces all children client-side

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/features/stats/StatsPageClient.tsx` (line 1)

**Description**: `StatsPageClient` is marked `"use client"` but its only purpose is to compose `GrandTotalCounter`, `KpiCards`, `CategoryPieChart`, `Top10BarChart`, and `TimelineChart` -- none of which require shared client state. The page (`/stats`) already fetches data server-side via `getFullStats()` and passes it as props. By marking this component `"use client"`, all static parts (headings, KPI cards) are also forced into the client bundle.

**Impact**: Increases the client-side JS bundle for `/stats`. Static content like `GrandTotalCounter`, `KpiCards`, and headings could be server-rendered, reducing TTI.

**Fix**: Remove `"use client"` from `StatsPageClient.tsx` and make it a Server Component. Since `CategoryPieChart`, `Top10BarChart`, and `TimelineChart` already have `"use client"` (and should be dynamically imported per finding 1.1), the composition would work correctly:

```typescript
// No "use client" -- this is a Server Component
import type { StatsData } from '@/types/stats';
import { GrandTotalCounter } from './GrandTotalCounter';
import { KpiCards } from './KpiCards';
import { CategoryPieChart, Top10BarChart, TimelineChart } from './StatsDynamicCharts';
// ...
```

---

## 3. Images

### 3.1 LOW -- Logo loaded with `priority` in 3 layout components simultaneously

**Files**:
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/layout/DesktopSidebar.tsx` (line 53)
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/layout/MobileHeader.tsx` (line 20)
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/layout/DesktopNav.tsx` (line 51)

**Description**: The `logo.png` image is loaded with `priority` in three separate layout components. While only one is visible at a time (mobile vs tablet vs desktop), all three are rendered in the DOM and the `priority` prop causes preload hints for all three. This means the browser receives three `<link rel="preload">` hints for essentially the same image at different sizes.

**Impact**: Minor. Multiple preload hints for the same resource are deduplicated by browsers, but the three different `width`/`height` combinations (180x32, 192x34, 216x38) may cause three different image variants to be generated by next/image.

**Fix**: Consider using a single responsive Image component or ensure all three use the same source dimensions.

---

### 3.2 LOW -- Missing `og-default.png` in public directory

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/layout.tsx` (line 44)

**Description**: The root layout references `/og-default.png` as the default Open Graph image, but this file does not exist in `/public/`. This means social media preview cards for pages without custom OG images will show a broken image.

**Impact**: Not a runtime performance issue, but affects perceived performance of social sharing (broken preview images reduce click-through rates).

**Fix**: Add a properly sized `og-default.png` (1200x630px) to the `/public/` directory.

---

## 4. Rendering

### 4.1 HIGH -- SubmissionCard re-renders all cards when new page loads (infinite scroll)

**Files**:
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/features/feed/FeedList.tsx` (lines 26-38)
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/components/features/feed/SubmissionCard.tsx`

**Description**: When a new page of submissions is fetched via infinite scroll, `allSubmissions` is recomputed from `data?.pages.flatMap(...)`, causing a new array reference. This triggers a re-render of `FeedList`, which re-renders **every** `SubmissionCard` in the entire list (not just the new ones). With 60+ cards loaded after 3 pages, this means 60 `motion.article` components re-animate.

Additionally, `SubmissionCard` is not wrapped in `React.memo`, so every prop comparison defaults to referential equality, meaning every card re-renders even when its data hasn't changed.

**Impact**: Causes visible jank and increased INP on mobile when loading additional pages. Each re-render involves motion animation recalculation and DOM updates for all cards.

**Fix**:
1. Wrap `SubmissionCard` in `React.memo`:
```typescript
export const SubmissionCard = React.memo(function SubmissionCard({ submission, index }: SubmissionCardProps) {
  // ... existing implementation
});
```
2. The `initial={{ opacity: 0, y: 12 }}` animation on `motion.article` should only trigger on mount, not on re-render. With `React.memo`, this is solved since the component won't re-render when props haven't changed.

---

### 4.2 MEDIUM -- Zustand vote store creates new Map on every `setVote` / `setCounts` call

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/stores/vote-store.ts` (lines 20-28)

**Description**: Both `setVote` and `setCounts` create a new `Map` instance (`new Map(state.votes)`) on every call. When batch-hydrating votes for 20 submissions, this creates 20 new Map instances in rapid succession, each triggering a Zustand state update and re-render of all subscribed components.

**Impact**: 20 rapid state updates with Map cloning during vote hydration. Each update triggers re-renders of every `VoteButtonInline` component that subscribes to the store.

**Fix**: Batch the vote hydration into a single store update:

```typescript
setVotes: (entries: Array<[string, VoteState]>) =>
  set((state) => {
    const newVotes = new Map(state.votes);
    for (const [id, vote] of entries) {
      newVotes.set(id, vote);
    }
    return { votes: newVotes };
  }),
```

Update `useVoteHydration.ts` to call `setVotes` once with all entries instead of calling `setVote` in a loop.

---

## 5. Data Fetching

### 5.1 CRITICAL -- N+1 query in comments API route

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/api/submissions/[id]/comments/route.ts` (lines 69-90)

**Description**: The GET handler fetches top-level comments, then for **each** comment executes 2 additional queries (replies + reply count) inside a `Promise.all(items.map(async ...))` loop. For 20 top-level comments, this results in **1 + 20*2 + 1 = 42 database queries** per request.

```typescript
const commentsWithReplies = await Promise.all(
  items.map(async (comment) => {
    const replies = await db.select()...;     // Query per comment
    const [replyCount] = await db.select()...; // Query per comment
    return { ...comment, replies, hasMoreReplies: ... };
  })
);
```

**Impact**: This is a textbook N+1 problem. With 20 comments, the database is hit 42 times. Database latency compounds quickly, especially under load or with network hops to the PostgreSQL server.

**Fix**: Replace the N+1 loop with two batch queries:

```typescript
const commentIds = items.map((c) => c.id);

// Single query: fetch top 3 replies per parent using a window function
const allReplies = await db
  .select()
  .from(comments)
  .where(inArray(comments.parentCommentId, commentIds))
  .orderBy(asc(comments.createdAt));

// Single query: count replies per parent
const replyCounts = await db
  .select({
    parentId: comments.parentCommentId,
    count: sql<number>`count(*)`,
  })
  .from(comments)
  .where(inArray(comments.parentCommentId, commentIds))
  .groupBy(comments.parentCommentId);

// Assemble in JS
const repliesByParent = new Map<string, typeof allReplies>();
for (const reply of allReplies) { /* group by parentCommentId */ }
const countByParent = new Map(replyCounts.map((r) => [r.parentId, r.count]));
```

This reduces 42 queries to 3 queries regardless of comment count.

---

### 5.2 HIGH -- Submission detail page makes sequential queries (waterfall)

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/api/submission-detail.ts` (lines 23-83)

**Description**: `getSubmissionById` performs queries in **sequence**:
1. First: main submission + author + cost calculation (JOIN query)
2. Then: user vote lookup (conditional)
3. Then: three count queries in parallel (sources, notes, solutions)

Steps 2 and 3 depend on step 1 (need the submission ID and author check), but step 2 (vote lookup) and step 3 (counts) are **independent of each other** and could run in parallel.

Additionally, the `generateMetadata` function in `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/s/[id]/page.tsx` (line 34) calls `getSubmissionById(id)` with only the ID, and then the page component (line 91) calls it again with full auth context. This results in the **same submission query being executed twice** -- once for metadata and once for rendering.

**Impact**: Sequential queries add up to ~50-100ms of unnecessary latency. The double fetch doubles the DB load for every submission page view.

**Fix**:
1. Run vote lookup and count queries in parallel:
```typescript
const [userVote, sourceCount, noteCount, solutionCount] = await Promise.all([
  fetchUserVote(currentUserId, ipHash, id),
  db.select({ value: count() }).from(submissionSources).where(...),
  db.select({ value: count() }).from(communityNotes).where(...),
  db.select({ value: count() }).from(solutions).where(...),
]);
```

2. Use Next.js `fetch` deduplication or `React.cache()` to avoid the double fetch in `generateMetadata` + page render:
```typescript
import { cache } from 'react';

export const getSubmissionById = cache(async (id: string, ...) => {
  // ... existing implementation
});
```

---

### 5.3 HIGH -- Feed query uses correlated subqueries for every row

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/api/submissions.ts` (lines 7-15)

**Description**: The `feedSelect` object includes 6 correlated subqueries that execute **for each row** returned:

```typescript
const feedSelect = {
  ...getTableColumns(submissions),
  sourceCount: sql`(SELECT count(*) FROM submission_sources WHERE ...)`,
  pinnedNoteBody: sql`(SELECT body FROM community_notes WHERE ...)`,
  authorLevel: sql`(SELECT total_xp FROM users WHERE ...)`,
  authorStreak: sql`(SELECT current_streak FROM users WHERE ...)`,
  solutionCount: sql`(SELECT count(*) FROM solutions WHERE ...)`,
  topSolutionBody: sql`(SELECT LEFT(body, 200) FROM solutions WHERE ...)`,
};
```

For a feed page of 20 items, this means **6 * 20 = 120 subquery executions** per feed request. PostgreSQL may optimize some of these, but correlated subqueries are generally the slowest approach.

**Impact**: Significantly increases feed query time, especially as table sizes grow. This is the most-hit endpoint in the application.

**Fix**: Replace correlated subqueries with lateral joins or a single `LEFT JOIN` + `GROUP BY` approach. Alternatively, use materialized/cached counts:

```sql
-- Using lateral joins (PostgreSQL)
SELECT s.*,
  sc.source_count,
  pn.pinned_note_body,
  u.total_xp as author_level,
  u.current_streak as author_streak,
  sol.solution_count,
  sol.top_solution_body
FROM submissions s
LEFT JOIN users u ON u.id = s.author_id
LEFT JOIN LATERAL (
  SELECT count(*) as source_count
  FROM submission_sources WHERE submission_id = s.id
) sc ON true
LEFT JOIN LATERAL (
  SELECT body as pinned_note_body
  FROM community_notes
  WHERE submission_id = s.id AND is_pinned = 1
  ORDER BY pinned_at DESC LIMIT 1
) pn ON true
LEFT JOIN LATERAL (
  SELECT count(*) as solution_count,
    (SELECT LEFT(body, 200) FROM solutions
     WHERE submission_id = s.id AND deleted_at IS NULL
     ORDER BY (upvote_count - downvote_count) DESC, created_at ASC LIMIT 1
    ) as top_solution_body
  FROM solutions WHERE submission_id = s.id AND deleted_at IS NULL
) sol ON true
WHERE ...
```

Or better yet, denormalize `source_count` and `solution_count` onto the `submissions` table (like `comment_count` already is) and update them via triggers or application-level increments.

---

### 5.4 MEDIUM -- No `React.cache()` or `unstable_cache` used anywhere

**Files**: All files under `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/api/`

**Description**: None of the server-side data fetching functions use `React.cache()` for request-level deduplication or `unstable_cache` (now `use cache` in Next.js 16) for cross-request caching. While ISR `revalidate` is set on page segments, the individual data fetching functions have no caching layer, meaning:

- `getSubmissionById` is called twice per submission page load (once in `generateMetadata`, once in the page component)
- `getPlatformStats`, `getTopLeaderboard`, `getActiveCategories` are fresh DB queries on every request even within the same ISR window

**Impact**: Unnecessary database load, especially for the submission detail double-fetch pattern.

**Fix**: Wrap frequently called functions with `React.cache()` for request deduplication:

```typescript
import { cache } from 'react';

export const getSubmissionById = cache(async (id: string, ...) => {
  // existing implementation
});
```

For cross-request caching, consider `unstable_cache` with appropriate tags:

```typescript
import { unstable_cache } from 'next/cache';

export const getPlatformStats = unstable_cache(
  async () => { /* existing implementation */ },
  ['platform-stats'],
  { revalidate: 60 },
);
```

---

## 6. Lazy Loading & Code Splitting

### 6.1 (Addressed in 1.1) -- Stats and Simulator charts not dynamically imported

See finding 1.1 above.

---

## 7. CSS

### 7.1 -- No issues found

Tailwind 4 with `@import "tailwindcss"` handles purging automatically based on content detection. The `globals.css` is well-structured with design tokens, print styles, reduced motion, and high contrast. No unused custom CSS classes were detected. The `tw-animate-css` import is small and used by shadcn/ui components.

---

## 8. Database Queries & Indexes

### 8.1 HIGH -- Missing indexes on `submissions` table for feed queries

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts` (lines 109-142)

**Description**: The `submissions` table has only one index: `idx_submissions_external_id_source` for the Open Data import deduplication. However, the feed queries (the most critical queries in the application) order by:
- `hot_score DESC, id DESC` (hot feed)
- `created_at DESC, id DESC` (new feed)
- `(upvote_count - downvote_count) DESC, id DESC` (top feed)

And all filter by `status = 'published'` AND `moderation_status = 'approved'`.

Without composite indexes, PostgreSQL must perform sequential scans on the entire `submissions` table for every feed request, sorting in memory.

**Impact**: Feed queries become progressively slower as the submissions table grows. Currently likely masked by small table size, but will become a critical bottleneck at scale.

**Fix**: Add composite indexes for the three feed query patterns:

```typescript
export const submissions = pgTable('submissions', {
  // ... existing columns
}, (table) => [
  uniqueIndex('idx_submissions_external_id_source').on(table.importSource, table.externalId),
  // Feed indexes
  index('idx_submissions_hot_feed').on(table.status, table.moderationStatus, table.hotScore, table.id),
  index('idx_submissions_new_feed').on(table.status, table.moderationStatus, table.createdAt, table.id),
  index('idx_submissions_slug').on(table.slug),
]);
```

For the top feed (which orders by a computed expression `upvote_count - downvote_count`), consider adding a materialized `score` column and indexing it.

---

### 8.2 MEDIUM -- `comments` table missing index on `submissionId + depth` for top-level comment queries

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/db/schema.ts` (line 242)

**Description**: The comments table has a single index on `solutionId`, but the comments API route filters by `submissionId + depth = 0` for top-level comments and by `parentCommentId` for replies. Neither query pattern is indexed.

**Impact**: Comment loading will slow down significantly for submissions with many comments.

**Fix**:

```typescript
(table) => [
  index('idx_comments_solution').on(table.solutionId),
  index('idx_comments_submission_depth').on(table.submissionId, table.depth),
  index('idx_comments_parent').on(table.parentCommentId),
],
```

---

## 9. Static Generation

### 9.1 MEDIUM -- Conflicting `dynamic = 'force-dynamic'` with `revalidate` on /stats and /leaderboard

**Files**:
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/stats/page.tsx` (lines 6-7)
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/leaderboard/page.tsx` (lines 5-6)

**Description**: Both pages export:
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes ISR
```

`force-dynamic` overrides `revalidate`, meaning the page is **always server-rendered on every request**. The `revalidate = 300` has no effect.

**Impact**: These pages hit the database on every single request instead of being cached for 5 minutes. Under traffic spikes, this causes unnecessary database load.

**Fix**: Remove `export const dynamic = 'force-dynamic'` and keep only `export const revalidate = 300` to enable proper ISR caching.

---

### 9.2 -- `/chiffres` and `/methodologie` could be fully static

**Files**:
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/chiffres/page.tsx`
- `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/methodologie/page.tsx`

**Description**: The `/chiffres` page renders entirely from a hardcoded constant (`BUDGET_2026`). It makes no database calls and has no dynamic data. It could be statically generated at build time with `export const dynamic = 'force-static'`. The `/methodologie` page already uses `revalidate = 3600`, which is appropriate.

**Impact**: Minor. The page is likely already static since it has no dynamic data sources, but explicitly marking it ensures Next.js doesn't opt into dynamic rendering.

**Fix**: Add `export const dynamic = 'force-static'` to `/chiffres/page.tsx`.

---

## 10. Third-Party Scripts

### 10.1 -- Analytics correctly implemented as fire-and-forget

**File**: `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/analytics.ts`

**Description**: Analytics (Plausible/Umami) are implemented as client-side fire-and-forget calls with no blocking script tags. No third-party analytics scripts were found in `layout.tsx` or `next.config.ts`. This is the correct pattern for minimal CWV impact.

**Impact**: None -- this is well-implemented.

---

## Summary of Findings

| # | Severity | Category | Finding | File(s) |
|---|----------|----------|---------|---------|
| 1.1 | CRITICAL | Bundle | Recharts not dynamically imported on /stats and /simulateur | `StatsPageClient.tsx`, `SimulatorPageClient.tsx` |
| 5.1 | CRITICAL | Data Fetching | N+1 query in comments API (42 queries for 20 comments) | `api/submissions/[id]/comments/route.ts` |
| 1.2 | HIGH | Bundle | motion/react in every feed card (~40 KB + animation overhead) | `SubmissionCard.tsx`, `VoteButtonInline.tsx` |
| 4.1 | HIGH | Rendering | SubmissionCard re-renders all cards on infinite scroll page load | `FeedList.tsx`, `SubmissionCard.tsx` |
| 5.2 | HIGH | Data Fetching | Submission detail has sequential queries + double fetch | `submission-detail.ts`, `s/[id]/page.tsx` |
| 5.3 | HIGH | Data Fetching | 6 correlated subqueries per row in feed query | `submissions.ts` |
| 8.1 | HIGH | Database | Missing indexes on submissions for feed queries | `schema.ts` |
| 2.2 | MEDIUM | Server/Client | StatsPageClient forces static content client-side | `StatsPageClient.tsx` |
| 4.2 | MEDIUM | Rendering | Zustand vote store creates new Map per vote hydration | `vote-store.ts` |
| 5.4 | MEDIUM | Data Fetching | No React.cache() or unstable_cache used | All `lib/api/` files |
| 8.2 | MEDIUM | Database | Comments table missing index on submissionId + depth | `schema.ts` |
| 9.1 | MEDIUM | Static Gen | force-dynamic overrides revalidate on /stats and /leaderboard | `stats/page.tsx`, `leaderboard/page.tsx` |
| 1.3 | MEDIUM | Bundle | pino/pino-pretty unused but in production deps | `package.json` |
| 1.4 | MEDIUM | Bundle | drizzle-kit in production dependencies | `package.json` |
| 3.1 | LOW | Images | Logo priority prop on 3 hidden-by-breakpoint components | Layout components |
| 3.2 | LOW | Images | Missing og-default.png in public directory | `layout.tsx` |

---

## Recommended Priority Order

1. **Add missing database indexes** (8.1) -- Quick win, huge impact at scale
2. **Fix N+1 comment queries** (5.1) -- Critical, reduces 42 queries to 3
3. **Dynamic import Recharts on /stats and /simulateur** (1.1) -- Quick win, ~500 KB less JS
4. **Fix force-dynamic overriding revalidate** (9.1) -- One-line fix, saves DB load
5. **Add React.cache() to submission detail** (5.4, 5.2) -- Eliminates double-fetch
6. **Replace motion with CSS animations in feed** (1.2) -- Reduces bundle + improves INP
7. **Wrap SubmissionCard in React.memo** (4.1) -- Prevents wasteful re-renders
8. **Batch Zustand vote store updates** (4.2) -- Reduces re-render storm during hydration
9. **Optimize feed correlated subqueries** (5.3) -- Important for scale
10. **Clean up package.json** (1.3, 1.4) -- Housekeeping

---

*End of Performance Audit Report*
