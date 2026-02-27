# Story 5.1: Comment Submission & Threading

## Story

**As a** registered user (Nicolas),
**I want** to post comments on submissions and reply to other comments,
**So that** I can discuss, debate, and provide additional context on fiscal waste claims.

## Status

**Status:** Draft
**Epic:** 5 -- Comments & Community Discussion
**Priority:** High
**Estimate:** 8 story points
**FRs:** FR19 (comments, max 2000 chars), FR20 (threaded replies with parent_id, depth max 2 mobile / 4 desktop)
**NFRs:** NFR8 (rate limiting), NFR13 (parameterized queries / SQL injection prevention), NFR17 (RGAA AA), NFR20 (form labels + error messages)

---

## Acceptance Criteria (BDD)

### AC 1: Database Migration -- comments table

```gherkin
Given a Drizzle migration creates the `comments` table (if not exists) with columns:
  | Column             | Type                          | Constraints                                      |
  |--------------------|-------------------------------|--------------------------------------------------|
  | id                 | UUID                          | PK, default random                               |
  | submission_id      | UUID                          | FK to submissions, NOT NULL                       |
  | user_id            | UUID                          | FK to users, nullable (set null on account delete) |
  | parent_comment_id  | UUID                          | FK to comments (self-ref), nullable               |
  | body               | text                          | NOT NULL, max 2000 chars (enforced via Zod + CHECK) |
  | author_display     | varchar(100)                  | NOT NULL                                         |
  | score              | integer                       | NOT NULL, default 0                              |
  | upvote_count       | integer                       | NOT NULL, default 0                              |
  | downvote_count     | integer                       | NOT NULL, default 0                              |
  | depth              | integer                       | NOT NULL, default 0                              |
  | created_at         | timestamp                     | NOT NULL, default now()                          |
  | updated_at         | timestamp                     | NOT NULL, default now()                          |
  | deleted_at         | timestamp                     | nullable (soft delete)                           |
When the migration runs,
Then the table is created with:
  - a CHECK constraint: `depth <= 2`
  - an index on `(submission_id, created_at)`
  - an index on `(parent_id)`
```

### AC 2: Comment form display

```gherkin
Given a logged-in user views a submission detail page at `/submissions/{id}`,
When the comment section renders below the submission content,
Then a comment form is displayed with:
  - a textarea (max 2000 chars, with live character counter)
  - a <label> "Votre commentaire" (NFR20)
  - a "Publier" submit button (disabled until textarea has >= 1 non-whitespace char)
  - the character counter format: "{current}/{max}" turning chainsaw-red at 90% capacity
```

### AC 3: Top-level comment submission

```gherkin
Given the user types a valid comment (1-2000 chars) and clicks "Publier",
When the comment is submitted,
Then a new row is inserted into the `comments` table with `depth = 0` and `parent_comment_id = null`,
And the comment appears immediately at the top of the comment list (optimistic update),
And a success toast "Commentaire publié" is shown,
And the textarea is cleared and focus returns to the textarea,
And all inputs use parameterized queries (NFR13).
```

### AC 4: Reply to existing comment (depth 0 or 1)

```gherkin
Given a logged-in user clicks "Répondre" on an existing comment at depth 0 or 1,
When the reply form appears inline below the target comment,
Then the reply textarea (max 2000 chars) is displayed with a "Publier la réponse" button,
And submitting the reply inserts a row with:
  - parent_comment_id = {parent_id}
  - depth = parent_depth + 1
And the reply appears inline below its parent (optimistic update),
And the submission's comment_count is incremented.
```

### AC 5: Maximum nesting enforcement

```gherkin
Given a comment is at depth 2 (maximum nesting),
When the comment renders,
Then no "Répondre" button is displayed for that comment,
And on mobile viewports (< 768px), depth-2 replies are indented by 16px per level (max 32px total).
```

### AC 6: Rate limiting

```gherkin
Given the user exceeds 20 comments per hour,
When they attempt to post another comment,
Then a 429 Too Many Requests response is returned (NFR8),
And a warning toast is shown: "Trop de requêtes. Réessayez dans X minutes."
```

### AC 7: Unauthenticated user

```gherkin
Given an unauthenticated user views the comment section,
When they attempt to interact with the comment form or click "Répondre",
Then the LazyAuthGate modal appears with login/register options,
And after successful authentication, the user can proceed with their intended action.
```

### AC 8: Empty and invalid input handling

```gherkin
Given the user submits a comment with empty or whitespace-only content,
When the form is submitted,
Then the submission is blocked client-side (button disabled),
And an inline error message "Le commentaire ne peut pas être vide" is displayed.

Given the user submits a comment exceeding 2000 characters,
When the Zod server-side validation runs,
Then a 400 Bad Request response is returned with message "Le commentaire ne doit pas dépasser 2000 caractères".
```

---

## Tasks / Subtasks

### Task 1: Drizzle ORM Schema & Migration

- [ ] 1.1: Define the `comments` table in `src/lib/db/schema.ts`
- [ ] 1.2: Add CHECK constraint `depth <= 2` in migration SQL
- [ ] 1.3: Add database indexes: `idx_comments_submission_id` on `(submission_id, created_at)` and `idx_comments_parent_id` on `(parent_id)`
- [ ] 1.4: Add `commentCount` field to submissions table if not already present (integer, default 0)
- [ ] 1.5: Generate and run migration with `drizzle-kit generate` and `drizzle-kit migrate`
- [ ] 1.6: Write migration test verifying table creation and constraints

### Task 2: Zod Validation Schemas

- [ ] 2.1: Create `createCommentSchema` in `src/lib/api/validation.ts`:
  ```typescript
  export const createCommentSchema = z.object({
    body: z.string()
      .min(1, 'Le commentaire ne peut pas être vide')
      .max(2000, 'Le commentaire ne doit pas dépasser 2000 caractères')
      .transform(val => val.trim()),
    parentCommentId: z.string().uuid().nullable().optional(),
  });
  ```
- [ ] 2.2: Create `commentParamsSchema` for route params validation (submission_id as UUID)
- [ ] 2.3: Unit tests for validation schemas (valid, empty, too long, invalid UUID)

### Task 3: TypeScript Types

- [ ] 3.1: Define `Comment` interface in `src/types/comment.ts`:
  ```typescript
  export interface Comment {
    id: string;
    submissionId: string;
    userId: string | null;
    parentCommentId: string | null;
    body: string;
    authorDisplay: string;
    score: number;
    upvoteCount: number;
    downvoteCount: number;
    depth: number;
    createdAt: string;
    updatedAt: string;
    replies?: Comment[];
  }
  ```
- [ ] 3.2: Define `CreateCommentInput` and `CommentApiResponse` types

### Task 4: API Route Handler -- POST /api/v1/submissions/[id]/comments

- [ ] 4.1: Create route handler at `src/app/api/v1/submissions/[id]/comments/route.ts`
- [ ] 4.2: Implement POST handler:
  - Authenticate user via `getServerSession`
  - Apply rate limiting (`rateLimiters.comment`)
  - Validate request body with `createCommentSchema`
  - Validate submission_id exists
  - If `parentCommentId` is provided:
    - Verify parent comment exists and belongs to same submission
    - Verify parent depth < 2 (reject if parent is at max depth)
    - Set `depth = parent.depth + 1`
  - Insert into `comments` table using Drizzle ORM (parameterized)
  - Increment `comment_count` on the submission
  - Return `201 Created` with the new comment in response envelope `{ data, error, meta }`
- [ ] 4.3: Implement error handling (400 validation, 401 auth, 404 submission/parent not found, 429 rate limit)
- [ ] 4.4: Add DOMPurify sanitization for comment body before storage (XSS prevention)

### Task 5: API Route Handler -- GET /api/v1/submissions/[id]/comments

- [ ] 5.1: Implement GET handler in the same route file
- [ ] 5.2: Support query params: `sort` (best | newest), `cursor`, `limit` (default 20)
- [ ] 5.3: Return threaded comment structure: top-level comments with nested `replies` array
- [ ] 5.4: Cursor-based pagination on top-level comments (depth = 0)
- [ ] 5.5: For each top-level comment, include up to 3 direct replies sorted by `created_at ASC`
- [ ] 5.6: Include `hasMoreReplies: boolean` and `totalReplyCount: number` for each top-level comment

### Task 6: CommentForm Component

- [ ] 6.1: Create `src/components/features/comments/CommentForm.tsx` (Client Component)
- [ ] 6.2: Use shadcn/ui `Textarea` with `maxLength={2000}`
- [ ] 6.3: Add `<label>` "Votre commentaire" (associated with textarea via `htmlFor`)
- [ ] 6.4: Add live character counter: `{count}/2000` with chainsaw-red color at >= 1800 chars
- [ ] 6.5: Disable "Publier" button when textarea is empty/whitespace-only or during submission
- [ ] 6.6: Show loading spinner on button during submission
- [ ] 6.7: Clear textarea and show success toast on successful submission
- [ ] 6.8: Show inline error for validation failures
- [ ] 6.9: Integrate LazyAuthGate for unauthenticated users
- [ ] 6.10: Create variant for reply form: smaller textarea, "Publier la réponse" button, cancel button

### Task 7: Comment Submission Hook

- [ ] 7.1: Create `src/hooks/use-comment.ts` with TanStack Query `useMutation`
- [ ] 7.2: Implement optimistic update: new comment inserted into query cache immediately
- [ ] 7.3: Rollback on mutation error (remove optimistic comment, show error toast)
- [ ] 7.4: Invalidate comment query on success to sync with server
- [ ] 7.5: Handle 429 rate limit response with appropriate toast message

### Task 8: CommentThread Component (Skeleton)

- [ ] 8.1: Create `src/components/features/comments/CommentThread.tsx` (Client Component)
- [ ] 8.2: Render comment form at top of section
- [ ] 8.3: Render list of top-level comments (depth 0)
- [ ] 8.4: For each comment, render: avatar, author_display, timestamp (relative), body, vote buttons, reply button (if depth < 2)
- [ ] 8.5: Render nested replies below parent with visual indentation
- [ ] 8.6: "Répondre" button toggles inline reply form below the target comment
- [ ] 8.7: Only one reply form open at a time (opening a new one closes the previous)

### Task 9: Integration into Submission Detail Page

- [ ] 9.1: Import CommentThread into `src/app/(main)/s/[id]/[slug]/page.tsx`
- [ ] 9.2: Fetch initial comments server-side and pass as props (hydration)
- [ ] 9.3: CommentThread takes `submissionId` and `initialComments` props

### Task 10: Testing

- [ ] 10.1: Unit tests for `createCommentSchema` (Vitest)
- [ ] 10.2: Unit tests for POST /api route handler (mock Drizzle, mock auth session)
- [ ] 10.3: Unit tests for GET /api route handler (mock data, verify threading structure)
- [ ] 10.4: Component tests for CommentForm (render, validation, submission states)
- [ ] 10.5: Component tests for CommentThread (render comments, reply toggle, nesting)
- [ ] 10.6: Integration test: submit comment -> appears in thread (optimistic)

---

## Dev Notes

### Architecture

- **Rendering strategy:** CommentThread is a Client Component (interactive threading, reply forms, optimistic updates). The submission detail page is RSC with SSR -- initial comments are fetched server-side and hydrated into the client component.
- **State management:** TanStack Query for server state (comments list), Zustand for ephemeral UI state (which reply form is open, optimistic comment cache).
- **API design:** REST with consistent envelope `{ data, error, meta }`. Cursor-based pagination (no offset). Server Actions for mutations (comments use Next.js Server Actions via POST route handlers).
- **Threading model:** `parent_comment_id` self-references the `comments` table. `depth` column enforced by CHECK constraint (`depth <= 2`). Max 2 levels of nesting enforced both in database (CHECK) and in application code (API rejects depth > 2). On desktop, the UX spec mentions up to 4 levels of visible nesting -- the architecture caps at 2 in the DB, with desktop displaying the same 2 levels but with wider indentation.
- **Comment count denormalization:** `submissions.comment_count` is incremented on comment creation for efficient display on feed cards without JOIN queries.

### Tech Stack

| Technology | Version | Usage in This Story |
|---|---|---|
| Next.js | 16.1.6 | App Router, API route handlers |
| Drizzle ORM | 0.45.1 | Schema definition, parameterized queries, migrations |
| PostgreSQL | 17.9 | Comments table, CHECK constraint, indexes |
| Zod | 3.x | Input validation (body length, UUID format) |
| TanStack Query | 5.90.x | Server state for comments, optimistic mutations |
| Zustand | 5.0.11 | UI state (open reply form, optimistic cache) |
| shadcn/ui | 2026-02 | Textarea, Button, Avatar components |
| DOMPurify | latest | XSS sanitization on comment body |
| Vitest | 4.0.18 | Unit and component tests |

### Drizzle ORM Schema

```typescript
// src/lib/db/schema.ts (additions for comments)
import { pgTable, uuid, text, integer, timestamp, varchar, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  parentCommentId: uuid('parent_comment_id').references((): AnyPgColumn => comments.id),
  body: text('body').notNull(), // max 2000 chars enforced by Zod + CHECK
  authorDisplay: varchar('author_display', { length: 100 }).notNull(),
  score: integer('score').notNull().default(0),
  upvoteCount: integer('upvote_count').notNull().default(0),
  downvoteCount: integer('downvote_count').notNull().default(0),
  depth: integer('depth').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => [
  check('depth_check', sql`${table.depth} <= 2`),
  check('body_length_check', sql`char_length(${table.body}) <= 2000`),
]);
```

### Key Files

| File | Purpose |
|---|---|
| `src/lib/db/schema.ts` | Drizzle table definitions (add `comments` table) |
| `src/lib/db/migrations/` | Generated migration SQL files |
| `src/lib/api/validation.ts` | Zod schemas (`createCommentSchema`) |
| `src/app/api/v1/submissions/[id]/comments/route.ts` | API route handler (GET + POST) |
| `src/components/features/comments/CommentForm.tsx` | Comment input component |
| `src/components/features/comments/CommentThread.tsx` | Threaded comment display |
| `src/hooks/use-comment.ts` | Comment mutation hook with optimistic UI |
| `src/types/comment.ts` | TypeScript interfaces |
| `src/stores/vote-cache.ts` | Extend or create comment-specific optimistic cache |

### Testing Strategy

| Test Type | Tool | Coverage Target |
|---|---|---|
| Unit: Zod schemas | Vitest | Valid/invalid inputs, edge cases (0 chars, 2001 chars, XSS payloads) |
| Unit: API route handlers | Vitest + mocks | Auth, rate limiting, validation, threading logic, error responses |
| Component: CommentForm | Vitest + Testing Library | Render, validation, character counter, disabled states |
| Component: CommentThread | Vitest + Testing Library | Comment rendering, reply toggle, nesting depth |
| Integration: Optimistic update | Vitest + TanStack Query test utils | Submit -> immediate display -> server sync |
| Accessibility: axe-core | Vitest + axe-core | Form labels, ARIA attributes, focus management |

### UX Reference

- **CommentThread** custom component from UX spec: author avatar, username, timestamp, comment text, vote count, reply count. States: default, collapsed, highlighted (new), deleted (by moderator). Threading: max 2 levels on mobile, "Continue thread" link for deeper nesting. Flat view toggle.
- **Toast:** "Commentaire publié" on success (green left border, checkmark icon, 3 seconds auto-dismiss).
- **Character counter:** `{current}/{max}` format, turns `chainsaw-red` (#DC2626) at 90% (1800+ chars).
- **Lazy registration:** Unauthenticated users see LazyAuthGate modal when attempting to comment.
- **Empty state:** "Soyez le premier à commenter ce signalement" with prominent comment form.
- **Body font:** Inter 400 (Regular) for comment text.

### Dependencies

| Dependency | Story | Reason |
|---|---|---|
| Story 1.1 | User Registration | Users must be authenticated to comment |
| Story 2.1 | Submission Creation | Comments require a submission to attach to |
| Story 2.3 | Submission Detail Page | CommentThread is rendered on the detail page |
| Story 5.2 | Comment Voting | Vote buttons on comments (can be developed in parallel, wired later) |
| Story 5.3 | Comment Display & Pagination | Pagination of comments (developed in parallel) |

### References

- Epic 5 definition: `_bmad-output/planning-artifacts/epics.md` (lines 879-922)
- Architecture -- comments table schema: `_bmad-output/planning-artifacts/architecture.md` (lines 367-378)
- Architecture -- API endpoint map: `_bmad-output/planning-artifacts/architecture.md` (lines 784-785)
- Architecture -- rate limiting: `_bmad-output/planning-artifacts/architecture.md` (lines 594, 620-624)
- Architecture -- toast messages: `_bmad-output/planning-artifacts/architecture.md` (line 1407)
- Architecture -- file structure: `_bmad-output/planning-artifacts/architecture.md` (lines 1592-1595)
- UX spec -- CommentThread component: `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 794-804)
- UX spec -- commenting flow: `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 464-471)
- PRD -- FR19 (comments): `_bmad-output/planning-artifacts/prd.md`
- PRD -- FR20 (threading): architecture.md FR mapping (line 1795)

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
