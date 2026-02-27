# Story 5.3: Comment Display & Pagination

## Story

**As a** visitor (Nicolas),
**I want** to read comments on a submission page with proper threading and pagination,
**So that** I can follow the community discussion without overwhelming page load.

## Status

**Status:** Draft
**Epic:** 5 -- Comments & Community Discussion
**Priority:** High
**Estimate:** 5 story points
**FRs:** FR19 (comments), FR20 (threaded replies), FR22 (sort by best/newest)
**NFRs:** NFR1 (LCP < 2.5s), NFR5 (pagination loads < 1 second), NFR17 (RGAA AA)

---

## Acceptance Criteria (BDD)

### AC 1: Initial comment load with threading

```gherkin
Given a submission has comments,
When the submission detail page renders the comment section,
Then the first 20 top-level comments (depth 0) are loaded, sorted by score descending (best first, default),
And for each top-level comment, up to 3 direct replies are shown inline,
And if a comment has more than 3 replies, a "Voir {n} autres réponses" link is displayed,
And the total comment count is displayed in the section header ("X commentaires").
```

### AC 2: Lazy loading nested replies

```gherkin
Given a top-level comment has more than 3 replies,
And the "Voir {n} autres réponses" link is displayed,
When the user clicks "Voir {n} autres réponses",
Then a skeleton loading state is shown (3 skeleton comment bubbles),
And all remaining replies for that thread are fetched via GET /api/v1/submissions/[id]/comments?parentId={parentId},
And the replies are inserted below the parent comment with proper indentation,
And the "Voir {n} autres réponses" link disappears after all replies load.
```

### AC 3: Cursor-based pagination for top-level comments

```gherkin
Given there are more than 20 top-level comments,
When the user scrolls to the bottom of the comment section,
Then a "Charger plus de commentaires" button is displayed,
And clicking it triggers a GET request with cursor-based pagination:
  GET /api/v1/submissions/[id]/comments?cursor={lastCommentId}&limit=20&sort=best
And a skeleton loading state is shown during the fetch,
And the next 20 top-level comments with their initial replies (up to 3 each) are appended below existing comments,
And the button disappears when all comments have been loaded.
```

### AC 4: Empty state

```gherkin
Given a submission has zero comments,
When the comment section renders,
Then an empty state is displayed with:
  - An illustration or icon (speech bubble with chainsaw)
  - The text "Soyez le premier à commenter ce signalement"
  - The comment form is prominently displayed above the empty state message
```

### AC 5: Sort toggle between best and newest

```gherkin
Given the comment section is rendered with comments,
When the user toggles between "Meilleurs" and "Récents" sort,
Then the comment section re-fetches comments with the new sort order:
  - "Meilleurs": top-level sorted by score DESC
  - "Récents": top-level sorted by created_at DESC
And a skeleton loading state replaces the comment list during re-fetch,
And the sort preference is persisted in the URL query param (?commentSort=best|newest),
And replies within threads always remain sorted by created_at ASC regardless of sort mode.
```

### AC 6: Comment count display

```gherkin
Given a submission has comments,
When the submission detail page renders,
Then the comment section header displays "{count} commentaire(s)" using the submission's comment_count,
And the count uses proper French pluralization (0: "Aucun commentaire", 1: "1 commentaire", 2+: "X commentaires").
```

### AC 7: Skeleton loading states

```gherkin
Given comments are being loaded (initial load, pagination, or reply expansion),
When the loading state is active,
Then skeleton comment bubbles are displayed matching the layout of real comments:
  - Avatar circle (40px) + username bar + timestamp bar
  - Body text block (2-3 lines)
  - Vote buttons placeholder + reply button placeholder
And the skeleton uses the same indentation as the expected comment depth.
```

### AC 8: Deleted/moderated comments

```gherkin
Given a comment has been soft-deleted (deleted_at is not null),
When the comment list renders,
Then the deleted comment is displayed as "[Commentaire supprimé]" in italic gray text,
And the author name and body are hidden,
And vote buttons are disabled,
And any replies to the deleted comment are still shown normally.
```

---

## Tasks / Subtasks

### Task 1: GET /api/v1/submissions/[id]/comments -- Pagination & Threading

- [ ] 1.1: Implement cursor-based pagination for top-level comments (depth = 0)
- [ ] 1.2: Support query parameters:
  ```
  sort: 'best' | 'newest' (default: 'best')
  cursor: string (UUID of last comment, optional)
  limit: number (default: 20, max: 50)
  parentId: string (UUID, optional -- for loading nested replies)
  ```
- [ ] 1.3: When `parentId` is provided, return all replies (depth > 0) for that parent, sorted by `created_at ASC`
- [ ] 1.4: When `parentId` is omitted, return top-level comments with nested structure:
  ```json
  {
    "data": [
      {
        "id": "...",
        "body": "...",
        "depth": 0,
        "replies": [/* first 3 replies */],
        "hasMoreReplies": true,
        "totalReplyCount": 12
      }
    ],
    "meta": {
      "nextCursor": "uuid-of-last-comment",
      "hasMore": true,
      "totalCount": 87
    }
  }
  ```
- [ ] 1.5: Cursor-based pagination:
  - **Best sort:** cursor is `(score, id)` tuple -- `WHERE (score, id) < (cursor_score, cursor_id) ORDER BY score DESC, id DESC`
  - **Newest sort:** cursor is `(created_at, id)` tuple -- `WHERE (created_at, id) < (cursor_time, cursor_id) ORDER BY created_at DESC, id DESC`
- [ ] 1.6: Filter out hard-deleted comments but include soft-deleted (for "[Commentaire supprimé]" display)
- [ ] 1.7: Include user's current vote direction for each comment (if authenticated, via LEFT JOIN to comment_votes)

### Task 2: Zod Validation for Query Params

- [ ] 2.1: Create `commentQuerySchema` in `src/lib/api/validation.ts`:
  ```typescript
  export const commentQuerySchema = z.object({
    sort: z.enum(['best', 'newest']).default('best'),
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    parentId: z.string().uuid().optional(),
  });
  ```
- [ ] 2.2: Unit tests for query param validation

### Task 3: Comment Display Components

- [ ] 3.1: Create `src/components/features/comments/CommentItem.tsx`:
  - Render individual comment: avatar, author_display, relative timestamp, body, vote buttons, reply button
  - Handle deleted state: "[Commentaire supprimé]" with hidden author/body
  - Accept `depth` prop for indentation styling
- [ ] 3.2: Create `src/components/features/comments/CommentSkeleton.tsx`:
  - Skeleton loading state for a single comment (avatar circle, text blocks, button placeholders)
  - Accept `depth` prop for correct indentation in skeleton state
  - Accept `count` prop to render multiple skeletons
- [ ] 3.3: Create `src/components/features/comments/CommentSortToggle.tsx`:
  - "Meilleurs" | "Récents" toggle using shadcn/ui Tabs or segmented control
  - Updates URL query param `?commentSort=best|newest`
  - Triggers refetch via TanStack Query

### Task 4: CommentThread -- Full Display Logic

- [ ] 4.1: Enhance `src/components/features/comments/CommentThread.tsx`:
  - Section header: "{count} commentaire(s)" with French pluralization
  - Sort toggle (CommentSortToggle)
  - Comment form (CommentForm from Story 5.1)
  - Comment list with threading
  - Empty state when count = 0
- [ ] 4.2: Implement reply expansion:
  - "Voir {n} autres réponses" link below comments with > 3 replies
  - On click: fetch remaining replies via `parentId` query param
  - Show CommentSkeleton during loading
  - Insert replies into the thread below parent
- [ ] 4.3: Implement "Charger plus de commentaires" button:
  - Displayed at the bottom when `meta.hasMore === true`
  - On click: fetch next page via cursor pagination
  - Show CommentSkeleton during loading
  - Append new comments below existing ones
  - Hide button when `meta.hasMore === false`

### Task 5: TanStack Query Integration

- [ ] 5.1: Create `src/hooks/use-comments.ts` using `useInfiniteQuery`:
  ```typescript
  export function useComments(submissionId: string, sort: 'best' | 'newest') {
    return useInfiniteQuery({
      queryKey: ['comments', submissionId, sort],
      queryFn: ({ pageParam }) => fetchComments(submissionId, sort, pageParam),
      getNextPageParam: (lastPage) => lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined,
      initialPageParam: undefined as string | undefined,
    });
  }
  ```
- [ ] 5.2: Create `src/hooks/use-comment-replies.ts` for lazy reply loading:
  ```typescript
  export function useCommentReplies(submissionId: string, parentId: string) {
    return useQuery({
      queryKey: ['comment-replies', submissionId, parentId],
      queryFn: () => fetchCommentReplies(submissionId, parentId),
      enabled: false, // Only fetch when triggered
    });
  }
  ```
- [ ] 5.3: Handle cache invalidation on new comment (from Story 5.1) and sort change
- [ ] 5.4: Initial comments hydrated from server-side props (passed from RSC page)

### Task 6: Server-Side Initial Load

- [ ] 6.1: In submission detail page (`src/app/(main)/s/[id]/[slug]/page.tsx`), fetch initial 20 comments server-side
- [ ] 6.2: Pass `initialComments` as a prop to CommentThread
- [ ] 6.3: TanStack Query uses `initialData` from server-side fetch for seamless hydration
- [ ] 6.4: Ensure no layout shift between server-rendered and client-hydrated comment section

### Task 7: Testing

- [ ] 7.1: Unit tests for GET /api route handler (pagination, sorting, threading, deleted comments)
- [ ] 7.2: Unit tests for `commentQuerySchema` validation
- [ ] 7.3: Unit tests for cursor-based pagination logic (both sort modes)
- [ ] 7.4: Component tests for CommentItem (render, deleted state, indentation)
- [ ] 7.5: Component tests for CommentSkeleton (render at various depths)
- [ ] 7.6: Component tests for CommentThread (empty state, sort toggle, pagination button, reply expansion)
- [ ] 7.7: Component tests for CommentSortToggle (toggle behavior, URL update)
- [ ] 7.8: Integration test: load page -> scroll -> load more -> verify appended comments

---

## Dev Notes

### Architecture

- **Cursor-based pagination:** Per architecture decision, no offset pagination is used (avoids skip-scan performance issues with large comment sets). The cursor encodes the sort column value and the comment ID for deterministic page boundaries. For "best" sort, the cursor is `(score, id)`; for "newest," it is `(created_at, id)`.
- **Threading data structure:** The API returns a flat list of top-level comments, each with a `replies` array (limited to 3 initially). Additional replies are lazily fetched via a separate query with `parentId` filter. This avoids deep recursive queries on initial load.
- **Hydration strategy:** Initial comments are fetched server-side in the RSC page component and passed to the Client Component `CommentThread` as `initialData` for TanStack Query. This ensures SEO (comments are in the HTML) and fast initial paint (no client-side fetch on first load).
- **Comment count denormalization:** The `submissions.comment_count` field is used for the header display, avoiding a COUNT query on every page load. This is incremented in Story 5.1 on comment creation.
- **Soft delete display:** Comments with `deleted_at IS NOT NULL` are returned from the API but with body replaced by `null` and a `isDeleted: true` flag. The component renders "[Commentaire supprimé]" in place of the body. Replies to deleted comments remain visible.

### Tech Stack

| Technology | Version | Usage in This Story |
|---|---|---|
| Next.js | 16.1.6 | RSC for initial load, API route handlers |
| Drizzle ORM | 0.45.1 | Cursor-based query with composite ordering |
| PostgreSQL | 17.9 | Indexed queries, composite cursor WHERE clause |
| Zod | 3.x | Query parameter validation |
| TanStack Query | 5.90.x | `useInfiniteQuery` for pagination, `useQuery` for reply expansion |
| shadcn/ui | 2026-02 | Skeleton, Tabs (sort toggle), Button, Avatar |
| Vitest | 4.0.18 | Unit and component tests |

### Cursor-Based Pagination SQL Example

```sql
-- "Best" sort: cursor is (score=42, id='abc-123')
SELECT c.*,
  (SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.id) as total_reply_count
FROM comments c
WHERE c.submission_id = $1
  AND c.depth = 0
  AND c.deleted_at IS NULL
  AND (c.score, c.id) < (42, 'abc-123')  -- cursor condition
ORDER BY c.score DESC, c.id DESC
LIMIT 20;

-- "Newest" sort: cursor is (created_at='2026-02-27T10:00:00Z', id='abc-123')
SELECT c.*,
  (SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.id) as total_reply_count
FROM comments c
WHERE c.submission_id = $1
  AND c.depth = 0
  AND c.deleted_at IS NULL
  AND (c.created_at, c.id) < ('2026-02-27T10:00:00Z', 'abc-123')
ORDER BY c.created_at DESC, c.id DESC
LIMIT 20;

-- Lazy load replies for a parent comment
SELECT * FROM comments
WHERE parent_id = $1
  AND deleted_at IS NULL
ORDER BY created_at ASC;
```

### Key Files

| File | Purpose |
|---|---|
| `src/app/api/v1/submissions/[id]/comments/route.ts` | GET handler with cursor pagination + threading |
| `src/lib/api/validation.ts` | `commentQuerySchema` for query params |
| `src/components/features/comments/CommentThread.tsx` | Full threaded display with pagination |
| `src/components/features/comments/CommentItem.tsx` | Individual comment rendering |
| `src/components/features/comments/CommentSkeleton.tsx` | Loading skeleton for comments |
| `src/components/features/comments/CommentSortToggle.tsx` | Best/Newest sort toggle |
| `src/hooks/use-comments.ts` | `useInfiniteQuery` for paginated comments |
| `src/hooks/use-comment-replies.ts` | Lazy reply loading hook |
| `src/app/(main)/s/[id]/[slug]/page.tsx` | Server-side initial comment fetch |

### Testing Strategy

| Test Type | Tool | Coverage Target |
|---|---|---|
| Unit: API GET handler | Vitest + mocks | Pagination, sorting, threading, cursor logic, deleted comments |
| Unit: Zod query schema | Vitest | Valid/invalid params, defaults |
| Unit: Cursor pagination | Vitest | Edge cases (empty, last page, single comment, score ties) |
| Component: CommentItem | Vitest + Testing Library | Normal render, deleted state, depth indentation |
| Component: CommentSkeleton | Vitest + Testing Library | Various depths, count prop |
| Component: CommentThread | Vitest + Testing Library | Empty state, sort toggle, load more button, reply expansion |
| Component: CommentSortToggle | Vitest + Testing Library | Toggle behavior, URL query param update |
| Integration: Full display | Vitest + Testing Library | Initial load -> paginate -> expand replies -> sort change |

### UX Reference

- **CommentThread:** from UX spec -- content (avatar, username, timestamp, text, vote count, reply count), states (default, collapsed, highlighted/new, deleted). Threading: max 2 levels on mobile, "Continue thread" link for deeper nesting (enforced by DB at max depth 2).
- **Empty state:** "Soyez le premier à commenter ce signalement" -- per UX spec empty states section: "No comments yet: Be the first to speak up. Nicolas has opinions."
- **Skeleton loading:** Per UX spec -- "Comments: Skeleton comment bubbles" for loading states.
- **Sort toggle:** "Meilleurs" (best) | "Récents" (newest) -- maps to FR22 (sort comments by best/newest).
- **Reply expansion:** "Voir {n} autres réponses" link -- lazy loads remaining replies. Skeleton during load.
- **Pagination:** "Charger plus de commentaires" button at bottom -- not infinite scroll (explicit user action to load more, better for accessibility and mobile performance).

### Dependencies

| Dependency | Story | Reason |
|---|---|---|
| Story 5.1 | Comment Submission & Threading | Comments table, API POST route, CommentForm component |
| Story 5.2 | Comment Voting | CommentVoteButton integrated into CommentItem |
| Story 2.3 | Submission Detail Page | Comment section rendered within the detail page |

### References

- Epic 5 definition: `_bmad-output/planning-artifacts/epics.md` (lines 955-982)
- Architecture -- cursor-based pagination: `_bmad-output/planning-artifacts/architecture.md` (line 658)
- Architecture -- API endpoint: `_bmad-output/planning-artifacts/architecture.md` (line 784)
- Architecture -- CommentThread rendering: `_bmad-output/planning-artifacts/architecture.md` (line 841)
- Architecture -- TanStack Query: `_bmad-output/planning-artifacts/architecture.md` (line 854)
- Architecture -- FR22 mapping: `_bmad-output/planning-artifacts/architecture.md` (line 1797)
- Architecture -- database indexes: `_bmad-output/planning-artifacts/architecture.md` (lines 464-466)
- UX spec -- CommentThread component: `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 794-804)
- UX spec -- skeleton states: `_bmad-output/planning-artifacts/ux-design-specification.md` (line 906)
- UX spec -- empty states: `_bmad-output/planning-artifacts/ux-design-specification.md` (line 910)

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
