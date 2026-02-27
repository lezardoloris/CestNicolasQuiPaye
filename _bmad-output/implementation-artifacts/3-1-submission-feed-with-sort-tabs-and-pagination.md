# Story 3.1: Submission Feed with Sort Tabs & Pagination

## Story

**As a** visitor (Nicolas),
**I want** to browse a feed of government waste submissions with sorting options,
**So that** I can discover the most outrageous or newest fiscal waste.

**FRs Covered:** FR2, FR9
**NFRs Integrated:** NFR1, NFR5, NFR14

---

## Acceptance Criteria (BDD)

### AC 3.1.1: Feed Page with Sort Tabs

```gherkin
Given a visitor navigates to `/feed` (or `/`)
When the feed page renders
Then the page displays three sort tabs at the top: "Tendances" (Hot), "Top" (Top), and "Recent" (New)
And the default active tab is "Tendances" (Hot)
And the URL updates to reflect the active tab: `/feed?sort=hot`, `/feed?sort=top`, `/feed?sort=new`
```

### AC 3.1.2: Hot Sort (Tendances)

```gherkin
Given the "Tendances" (Hot) tab is active
When submissions are loaded
Then submissions are sorted by a trending algorithm: `score / (hours_since_creation + 2)^1.5` (FR2, FR8)
And only submissions with `status = 'approved'` are displayed
```

### AC 3.1.3: Top Sort

```gherkin
Given the "Top" tab is active
When submissions are loaded
Then submissions are sorted by `score` descending (FR2, FR8)
```

### AC 3.1.4: New Sort (Recent)

```gherkin
Given the "Recent" (New) tab is active
When submissions are loaded
Then submissions are sorted by `created_at` descending (FR2)
```

### AC 3.1.5: Submission Card Display

```gherkin
Given the feed loads
When submission cards render
Then each card displays: title (truncated to 120 chars with ellipsis), estimated cost formatted as EUR (e.g., "12 500 000 EUR"), cost per citizen from Cost to Nicolas, vote score with upvote/downvote arrows, source URL domain name (e.g., "lemonde.fr"), and relative time (e.g., "il y a 3h") (FR9)
And each card is a clickable link to `/submissions/{id}`
And a skeleton loading state with 5 placeholder cards is shown while data is fetching
```

### AC 3.1.6: Infinite Scroll Pagination

```gherkin
Given the feed contains more than 20 submissions
When the user scrolls to the bottom of the list
Then the next 20 submissions are loaded via infinite scroll (cursor-based pagination)
And each page load completes within 1 second (NFR5)
And the Largest Contentful Paint of the initial feed page is under 2.5 seconds on a simulated 4G connection (NFR1)
```

---

## Tasks / Subtasks

### Task 1: Feed Route & RSC Page Setup
- [ ] 1.1 Create feed route at `src/app/feed/[sort]/page.tsx` as a React Server Component with ISR [AC 3.1.1]
- [ ] 1.2 Configure ISR revalidation per sort type in `page.tsx` using `export const revalidate`: hot=60s, new=30s, top=120s [AC 3.1.2, AC 3.1.3, AC 3.1.4]
- [ ] 1.3 Create `src/app/feed/[sort]/loading.tsx` with `FeedSkeleton` component (5 skeleton cards) [AC 3.1.5]
- [ ] 1.4 Create `src/app/feed/[sort]/error.tsx` error boundary with retry button
- [ ] 1.5 Set up redirect from `/` and `/feed` to `/feed/hot` in `src/app/page.tsx` [AC 3.1.1]
- [ ] 1.6 Validate `sort` parameter: only accept `hot`, `top`, `new`; return `notFound()` for invalid values [AC 3.1.1]

### Task 2: Feed Data Fetching Layer
- [ ] 2.1 Create `src/lib/api/submissions.ts` with `getSubmissions()` function using Drizzle ORM [AC 3.1.2, AC 3.1.3, AC 3.1.4]
- [ ] 2.2 Implement cursor-based pagination: encode cursor as base64 JSON `{ id, sortValue }`, decode on next request [AC 3.1.6]
- [ ] 2.3 Implement hot sort query: `SELECT * FROM submissions WHERE status='approved' ORDER BY (score::float / POWER(EXTRACT(EPOCH FROM (NOW() - created_at))/3600 + 2, 1.5)) DESC` [AC 3.1.2]
- [ ] 2.4 Implement top sort query: `SELECT * FROM submissions WHERE status='approved' ORDER BY score DESC` [AC 3.1.3]
- [ ] 2.5 Implement new sort query: `SELECT * FROM submissions WHERE status='approved' ORDER BY created_at DESC` [AC 3.1.4]
- [ ] 2.6 Set page size to 20 items, return `{ data, meta: { cursor, hasMore, totalCount } }` envelope [AC 3.1.6]
- [ ] 2.7 Add Redis cache layer for feed queries with keys `feed:hot:{cursor}` (60s TTL), `feed:new:{cursor}` (30s TTL), `feed:top:{window}:{cursor}` (120s TTL) [AC 3.1.6]

### Task 3: API Route Handler for Client-Side Pagination
- [ ] 3.1 Create `src/app/api/v1/submissions/route.ts` GET handler accepting `sort`, `cursor`, `limit` query params [AC 3.1.6]
- [ ] 3.2 Apply Zod validation schema for query params: `sort` enum(hot|top|new), `cursor` optional string, `limit` optional number(1-50, default 20) [AC 3.1.6]
- [ ] 3.3 Return standard API envelope `{ data, error, meta }` with cursor pagination [AC 3.1.6]
- [ ] 3.4 Implement rate limiting: 100 reads/minute per IP via Upstash Redis (NFR8)

### Task 4: FeedSortTabs Client Component
- [ ] 4.1 Create `src/components/features/feed/FeedSortTabs.tsx` as a Client Component (`'use client'`) [AC 3.1.1]
- [ ] 4.2 Render three tabs using shadcn/ui `Tabs` component: "Tendances" (hot), "Top" (top), "Recent" (new) [AC 3.1.1]
- [ ] 4.3 Read active sort from URL search params using `useSearchParams()` or route params [AC 3.1.1]
- [ ] 4.4 Navigate to `/feed/[sort]` on tab switch using `useRouter().push()` with shallow routing [AC 3.1.1]
- [ ] 4.5 Make tabs sticky below header on mobile, horizontally scrollable if overflow [AC 3.1.1]
- [ ] 4.6 Add `aria-label="Trier les signalements"` on the Tabs root and `aria-selected` on each tab [AC 3.1.1]

### Task 5: FeedList Client Component with Infinite Scroll
- [ ] 5.1 Create `src/components/features/feed/FeedList.tsx` as a Client Component [AC 3.1.5, AC 3.1.6]
- [ ] 5.2 Accept `initialData` and `sort` props from the RSC parent [AC 3.1.5]
- [ ] 5.3 Implement `useInfiniteQuery` from TanStack Query with `queryKey: ['feed', sort]` and `initialData` seeded from server [AC 3.1.6]
- [ ] 5.4 Configure `getNextPageParam` to extract cursor from `meta.cursor` of each page response [AC 3.1.6]
- [ ] 5.5 Implement IntersectionObserver sentinel element for infinite scroll trigger [AC 3.1.6]
- [ ] 5.6 Show `FeedSkeleton` (3 cards) as loading indicator when fetching next page [AC 3.1.5]
- [ ] 5.7 Handle empty state: display "Aucun signalement pour le moment. Soyez le premier Nicolas a manier la tronconneuse." [AC 3.1.5]

### Task 6: SubmissionCard Component
- [ ] 6.1 Create `src/components/features/submissions/SubmissionCard.tsx` as a mixed component (RSC shell + Client voting) [AC 3.1.5]
- [ ] 6.2 Display: title (truncated 120 chars), formatted EUR amount, cost per citizen, vote score, source domain, relative time [AC 3.1.5]
- [ ] 6.3 Use shadcn/ui `Card` component as the base wrapper [AC 3.1.5]
- [ ] 6.4 Format EUR amounts with French locale: `new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })` [AC 3.1.5]
- [ ] 6.5 Extract source domain from URL: `new URL(source_url).hostname.replace('www.', '')` [AC 3.1.5]
- [ ] 6.6 Format relative time in French using a utility function (e.g., "il y a 3h", "il y a 2j") [AC 3.1.5]
- [ ] 6.7 Make entire card clickable, navigating to `/submissions/{id}` [AC 3.1.5]
- [ ] 6.8 Add left border color based on outrage tier (EUR/citizen severity) [AC 3.1.5]

### Task 7: Feed Skeleton Component
- [ ] 7.1 Create `src/components/features/feed/FeedSkeleton.tsx` using shadcn/ui `Skeleton` component [AC 3.1.5]
- [ ] 7.2 Render 5 skeleton cards matching SubmissionCard layout: title bar (75% width), amount bar (50% width), vote buttons (two 32px circles), metadata bar (30% width) [AC 3.1.5]
- [ ] 7.3 Use `animate-pulse` class for loading animation [AC 3.1.5]

### Task 8: Utility Functions
- [ ] 8.1 Create `src/lib/utils/format.ts` with `formatEUR()`, `formatRelativeTime()`, `extractDomain()` [AC 3.1.5]
- [ ] 8.2 Create `src/lib/utils/hot-score.ts` with client-side hot score preview function [AC 3.1.2]
- [ ] 8.3 Create Zod validation schema for feed query params in `src/lib/utils/validation.ts` [AC 3.1.6]

### Task 9: Tests
- [ ] 9.1 Unit test `getSubmissions()` with mocked Drizzle queries for each sort mode [AC 3.1.2, AC 3.1.3, AC 3.1.4]
- [ ] 9.2 Unit test cursor encoding/decoding [AC 3.1.6]
- [ ] 9.3 Component test `SubmissionCard` renders all required fields [AC 3.1.5]
- [ ] 9.4 Component test `FeedSortTabs` switches tabs and updates URL [AC 3.1.1]
- [ ] 9.5 Component test `FeedList` loads initial data and triggers infinite scroll [AC 3.1.6]
- [ ] 9.6 API route test `GET /api/v1/submissions` returns paginated envelope [AC 3.1.6]
- [ ] 9.7 Unit test `formatEUR()`, `formatRelativeTime()`, `extractDomain()` [AC 3.1.5]
- [ ] 9.8 Performance test: verify feed page LCP < 2.5s with Lighthouse CI [AC 3.1.6]

---

## Dev Notes

### Architecture

**Rendering Strategy:** The feed page uses React Server Components with ISR (Incremental Static Regeneration). The RSC page fetches the initial 20 submissions server-side, then passes them as `initialData` to the client-side `FeedList` component. Subsequent pages are loaded client-side via `useInfiniteQuery`.

**Three-Layer State Model:**
1. **Server State (TanStack Query):** Feed data, submission lists. Handles caching, deduplication, background refetching.
2. **Client State (Zustand):** Optimistic vote cache (covered in Story 3.3).
3. **URL State (Next.js router):** Sort parameter, pagination cursor. Source of truth for shareable feed state.

**ISR Configuration per sort:**
```typescript
// src/app/feed/[sort]/page.tsx
export async function generateStaticParams() {
  return [{ sort: 'hot' }, { sort: 'top' }, { sort: 'new' }];
}

// Dynamic revalidation based on sort type
export const revalidate = 60; // Base: 60s for hot
// Override per-sort in the page component using route-level config
```

**ISR Revalidation Schedule (from Architecture):**
| Route | Revalidation | Rationale |
|---|---|---|
| `/feed/hot` | 60 seconds | Balance freshness with performance |
| `/feed/new` | 30 seconds | Needs faster updates for new content |
| `/feed/top` | 120 seconds | Less time-sensitive |

### Technical Requirements

**Cursor-Based Pagination Implementation:**
```typescript
// src/lib/api/submissions.ts
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { desc, lt, eq, and, sql } from 'drizzle-orm';

interface FeedParams {
  sort: 'hot' | 'top' | 'new';
  cursor?: string;
  limit?: number;
}

interface CursorPayload {
  id: string;
  sortValue: string;
}

function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodeCursor(cursor: string): CursorPayload {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString());
}

export async function getSubmissions({ sort, cursor, limit = 20 }: FeedParams) {
  const decoded = cursor ? decodeCursor(cursor) : null;

  let query;

  switch (sort) {
    case 'hot':
      query = db.select()
        .from(submissions)
        .where(
          and(
            eq(submissions.status, 'approved'),
            decoded
              ? lt(submissions.hotScore, decoded.sortValue)
              : undefined
          )
        )
        .orderBy(desc(submissions.hotScore))
        .limit(limit + 1); // Fetch one extra to check hasMore
      break;

    case 'top':
      query = db.select()
        .from(submissions)
        .where(
          and(
            eq(submissions.status, 'approved'),
            decoded
              ? sql`(${submissions.upvoteCount} - ${submissions.downvoteCount}) < ${decoded.sortValue}`
              : undefined
          )
        )
        .orderBy(desc(sql`${submissions.upvoteCount} - ${submissions.downvoteCount}`))
        .limit(limit + 1);
      break;

    case 'new':
      query = db.select()
        .from(submissions)
        .where(
          and(
            eq(submissions.status, 'approved'),
            decoded
              ? lt(submissions.createdAt, new Date(decoded.sortValue))
              : undefined
          )
        )
        .orderBy(desc(submissions.createdAt))
        .limit(limit + 1);
      break;
  }

  const results = await query;
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const lastItem = data[data.length - 1];

  return {
    data,
    meta: {
      cursor: lastItem
        ? encodeCursor({
            id: lastItem.id,
            sortValue: sort === 'hot'
              ? String(lastItem.hotScore)
              : sort === 'top'
              ? String(lastItem.upvoteCount - lastItem.downvoteCount)
              : lastItem.createdAt.toISOString(),
          })
        : null,
      hasMore,
    },
  };
}
```

**RSC Feed Page:**
```typescript
// src/app/feed/[sort]/page.tsx
import { FeedList } from '@/components/features/feed/FeedList';
import { FeedSortTabs } from '@/components/features/feed/FeedSortTabs';
import { getSubmissions } from '@/lib/api/submissions';
import { notFound } from 'next/navigation';

const VALID_SORTS = ['hot', 'top', 'new'] as const;

export default async function FeedPage({ params }: { params: { sort: string } }) {
  const { sort } = await params;

  if (!VALID_SORTS.includes(sort as any)) {
    notFound();
  }

  const submissions = await getSubmissions({ sort: sort as 'hot' | 'top' | 'new' });

  return (
    <main className="mx-auto max-w-[1280px] px-4">
      <FeedSortTabs activeSort={sort} />
      <FeedList initialData={submissions} sort={sort} />
    </main>
  );
}
```

**Infinite Scroll with TanStack Query:**
```typescript
// src/components/features/feed/FeedList.tsx
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { SubmissionCard } from '@/components/features/submissions/SubmissionCard';
import { FeedSkeleton } from '@/components/features/feed/FeedSkeleton';

interface FeedListProps {
  initialData: { data: Submission[]; meta: { cursor: string | null; hasMore: boolean } };
  sort: string;
}

export function FeedList({ initialData, sort }: FeedListProps) {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['feed', sort],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ sort });
      if (pageParam) params.set('cursor', pageParam);
      const res = await fetch(`/api/v1/submissions?${params}`);
      if (!res.ok) throw new Error('Feed fetch failed');
      return res.json();
    },
    initialData: {
      pages: [initialData],
      pageParams: [null],
    },
    getNextPageParam: (lastPage) => lastPage.meta?.cursor ?? undefined,
    initialPageParam: null,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allSubmissions = data?.pages.flatMap((page) => page.data) ?? [];

  if (allSubmissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-text-secondary">
          Aucun signalement pour le moment. Soyez le premier Nicolas a manier la tronconneuse.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {allSubmissions.map((submission) => (
        <SubmissionCard key={submission.id} submission={submission} />
      ))}
      {isFetchingNextPage && <FeedSkeleton count={3} />}
      <div ref={ref} className="h-1" aria-hidden="true" />
    </div>
  );
}
```

**Redis Cache Integration:**
```typescript
// src/lib/api/cache.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function getCachedFeed(key: string): Promise<any | null> {
  return redis.get(key);
}

export async function setCachedFeed(key: string, data: any, ttl: number): Promise<void> {
  await redis.set(key, JSON.stringify(data), { ex: ttl });
}

// Cache TTLs per sort type
export const FEED_CACHE_TTL = {
  hot: 60,   // 60 seconds
  new: 30,   // 30 seconds
  top: 120,  // 120 seconds
} as const;
```

### File Structure

```
src/
  app/
    page.tsx                               # Redirect to /feed/hot
    feed/
      [sort]/
        page.tsx                           # RSC feed page with ISR
        loading.tsx                        # Feed skeleton loader
        error.tsx                          # Feed error boundary
    api/
      v1/
        submissions/
          route.ts                         # GET list (sort, cursor, limit)
  components/
    features/
      feed/
        FeedSortTabs.tsx                   # Hot/New/Top tab navigation (Client)
        FeedList.tsx                       # Infinite scroll feed (Client)
        FeedSkeleton.tsx                   # Feed loading skeleton
      submissions/
        SubmissionCard.tsx                 # Feed card (mixed RSC + Client)
  lib/
    api/
      submissions.ts                      # Drizzle ORM queries for feed
      cache.ts                            # Redis cache helpers
      response.ts                         # API response wrapper
      rate-limit.ts                       # Upstash rate limiter
    utils/
      format.ts                           # EUR formatting, relative time, domain extraction
      hot-score.ts                        # Client-side hot score preview
      validation.ts                       # Zod schemas for feed params
  hooks/
    use-infinite-feed.ts                   # Reusable infinite scroll hook
  types/
    submission.ts                          # Submission TypeScript types
    api.ts                                 # API envelope types
```

### Testing

| Test Type | Tool | File | Description |
|---|---|---|---|
| Unit | Vitest | `src/lib/api/submissions.test.ts` | getSubmissions with mocked Drizzle for each sort |
| Unit | Vitest | `src/lib/utils/format.test.ts` | EUR formatting, relative time, domain extraction |
| Unit | Vitest | `src/lib/utils/hot-score.test.ts` | Hot score calculation correctness |
| Component | Vitest + Testing Library | `src/components/features/submissions/SubmissionCard.test.tsx` | Card renders all fields |
| Component | Vitest + Testing Library | `src/components/features/feed/FeedSortTabs.test.tsx` | Tab switching and URL update |
| Component | Vitest + Testing Library | `src/components/features/feed/FeedList.test.tsx` | Initial data rendering, infinite scroll trigger |
| API Route | Vitest | `__tests__/api/submissions.test.ts` | GET /api/v1/submissions returns correct envelope |
| E2E | Playwright | `e2e/feed.spec.ts` | Full feed browsing journey |
| Performance | Lighthouse CI | CI pipeline | LCP < 2.5s on 4G |

### UX/Design

**shadcn/ui Components Used:**
- `Card` -- SubmissionCard wrapper
- `Tabs`, `TabsList`, `TabsTrigger` -- FeedSortTabs
- `Skeleton` -- FeedSkeleton loading states
- `Button` -- vote arrows (covered in Story 3.3)

**Responsive Breakpoints:**
| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | 375px-767px | Single column, full-width cards, bottom tab bar active |
| Tablet | 768px-1023px | Single column, max-width 640px centered |
| Desktop | 1024px-1279px | Two-column: feed (65%) + sidebar (35%) |
| Wide desktop | 1280px+ | Two-column, max-width 1280px centered |

**Design Tokens (from Architecture):**
- Background: `bg-surface-primary` (#0F0F0F)
- Card surface: `bg-surface-secondary` (#1A1A1A)
- Text primary: `text-text-primary` (#F5F5F5)
- Text secondary: `text-text-secondary` (#A3A3A3)
- Accent: `text-chainsaw-red` (#DC2626)
- Fonts: Space Grotesk (display), Inter (body)

**FeedSortTabs Behavior:**
- Tab switch triggers feed reload with skeleton loading
- URL updates for shareability (`/feed/hot`, `/feed/new`, `/feed/top`)
- Sticky below header on mobile
- Horizontally scrollable if needed on narrow viewports

### Dependencies

**Upstream (required before this story):**
- Story 1.1: Project Scaffold & Design System Foundation (layout, design tokens, shadcn/ui)
- Story 2.1: Waste Submission Form (submissions table schema)

**Downstream (depends on this story):**
- Story 3.2: Submission Detail Page (card click navigation)
- Story 3.3: Upvote/Downvote Mechanics (vote arrows in SubmissionCard)
- Story 3.4: Score Calculation & Feed Ranking Algorithm (hot score algorithm)
- Story 3.5: Feed Accessibility & Mobile Optimization

### References

- Architecture: Section 3.1 (Database Schema -- submissions table), Section 3.3 (API Design -- cursor pagination, response envelope), Section 3.4 (Frontend Architecture -- RSC + ISR pattern, FeedList, FeedSortTabs), Section 4.4 (Skeleton Loading)
- UX Design: Custom Components (SubmissionCard, FeedSortTabs), Responsive Design section, Breakpoint Strategy
- PRD: FR2 (feed with Hot/Top/New sorting), FR9 (vote counts on feed cards), NFR1 (LCP < 2.5s), NFR5 (pagination < 1s), NFR14 (50K MAU scalability)

---

## Dev Agent Record

| Field | Value |
|---|---|
| **Story Key** | 3.1 |
| **Status** | Draft |
| **Assigned To** | -- |
| **Started** | -- |
| **Completed** | -- |
| **Blocked By** | Story 1.1 (scaffold), Story 2.1 (submissions table) |
| **Notes** | -- |
