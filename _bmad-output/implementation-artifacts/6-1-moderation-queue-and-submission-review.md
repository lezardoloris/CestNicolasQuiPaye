# Story 6.1: Moderation Queue & Submission Review

Status: ready-for-dev

## Story

As an administrator or moderator,
I want to view and process a queue of pending submissions,
so that only verified, appropriate content is published to the community feed.

## Acceptance Criteria

1. **Given** an admin/moderator navigates to `/admin/moderation`, **When** the moderation queue renders, **Then** a list of submissions with `moderation_status = 'pending'` is displayed sorted by `created_at` ascending (oldest first), each showing: title, description (first 200 chars), estimated cost (EUR formatted), source URL (clickable, opens new tab), author display name, and submission date. A count badge displays "{n} signalements en attente". (FR26)

2. **Given** an admin/moderator views a pending submission in the queue, **When** they click on it, **Then** a detail panel shows the full submission content: complete title, full description, estimated cost, source URL (clickable, opens new tab), author display name, and any existing Cost to Nicolas calculation.

3. **Given** an admin/moderator clicks "Approuver" on a pending submission, **When** the action is processed, **Then** the submission's `moderation_status` is updated to `'approved'`, the submission becomes visible in the public feed, a row is inserted into `moderation_actions` with `action = 'approve'`, and a success toast displays "Signalement approuv\u00e9". (FR27)

4. **Given** an admin/moderator clicks "Rejeter" on a pending submission, **When** the rejection form appears, **Then** a textarea for the rejection reason is displayed (required, max 500 chars). Submitting the rejection updates `moderation_status` to `'rejected'`, inserts a row into `moderation_actions` with `action = 'reject'` and the reason, and displays a success toast. (FR27)

5. **Given** an admin/moderator clicks "Demander des modifications" on a pending submission, **When** the edit request form appears, **Then** a textarea for the requested changes is displayed (required, max 500 chars). Submitting updates `moderation_status` to `'needs_edit'` and inserts a row into `moderation_actions` with `action = 'request_edit'` and the reason. (FR27)

6. **Given** a non-admin/non-moderator user attempts to access `/admin/moderation`, **When** the server checks authorization, **Then** a `403 Forbidden` response is returned and the user is redirected to `/feed/hot`.

7. **Given** an unauthenticated visitor attempts to access `/admin/moderation`, **When** the middleware checks the session, **Then** the user is redirected to `/login`.

## Tasks / Subtasks

- [ ] Task 1: Create `moderation_actions` Drizzle table schema and migration (AC: #3, #4, #5)
  - [ ] 1.1: Add `moderationActionType` pgEnum with values `['approve', 'reject', 'request_edit', 'remove']` to `src/lib/db/schema.ts`
  - [ ] 1.2: Add `moderation_actions` table to `src/lib/db/schema.ts` with columns: `id` (UUID PK), `submission_id` (UUID FK to submissions), `admin_user_id` (UUID FK to users), `action` (moderationActionType enum), `reason` (text, nullable), `created_at` (timestamp, defaultNow)
  - [ ] 1.3: Update `submissions` table to add `'needs_edit'` to the `moderationStatus` enum if not present (ensure enum values: `['pending', 'approved', 'rejected', 'flagged', 'needs_edit']`)
  - [ ] 1.4: Run `npx drizzle-kit generate` to create the migration file
  - [ ] 1.5: Run `npx drizzle-kit migrate` to apply

- [ ] Task 2: Create moderation API endpoints (AC: #1, #2, #3, #4, #5)
  - [ ] 2.1: Create `GET /api/v1/moderation` route at `src/app/api/v1/moderation/route.ts` -- returns paginated pending submissions sorted by `created_at ASC`, includes author info via join. Verify caller role is `admin` or `moderator` using `auth()` from Auth.js
  - [ ] 2.2: Create `PATCH /api/v1/moderation/[id]` route at `src/app/api/v1/moderation/[id]/route.ts` -- accepts `{ action: 'approve' | 'reject' | 'request_edit', reason?: string }`. Validates: reason required for reject/request_edit (max 500 chars). Updates `submissions.moderation_status`, inserts row into `moderation_actions`. Verify caller role
  - [ ] 2.3: Add Zod validation schemas in `src/lib/utils/validation.ts` for moderation action input: `moderationActionSchema = z.object({ action: z.enum(['approve', 'reject', 'request_edit']), reason: z.string().max(500).optional() }).refine(...)`
  - [ ] 2.4: Apply rate limiting using `rateLimiters.api` from `src/lib/api/rate-limit.ts`

- [ ] Task 3: Create admin layout with RBAC guard (AC: #6, #7)
  - [ ] 3.1: Create `src/app/(app)/admin/layout.tsx` -- Server Component that calls `auth()` and checks `session.user.role` is `'admin'` or `'moderator'`. If not, redirect to `/feed/hot`. Renders admin sidebar navigation with links to `/admin`, `/admin/moderation`, `/admin/flags`, `/admin/broadcast`
  - [ ] 3.2: Verify `src/middleware.ts` handles `/admin/:path*` protection per architecture spec (redirect non-admin to `/feed/hot`)

- [ ] Task 4: Create ModerationQueue page and components (AC: #1, #2, #3, #4, #5)
  - [ ] 4.1: Create `src/app/(app)/admin/moderation/page.tsx` -- Server Component wrapper that fetches initial data, renders `ModerationQueue` client component
  - [ ] 4.2: Create `src/components/features/admin/ModerationQueue.tsx` -- Client Component using TanStack Query to fetch `GET /api/v1/moderation`. Displays queue list with count badge, each item showing title, truncated description (200 chars), cost (EUR formatted via `src/lib/utils/format.ts`), source URL, author name, date
  - [ ] 4.3: Create `src/components/features/admin/ModerationDetailPanel.tsx` -- Expandable detail panel or slide-over showing full submission content, source URL with external link icon, Cost to Nicolas data if available
  - [ ] 4.4: Create `src/components/features/admin/ModerationActionBar.tsx` -- Three action buttons: "Approuver" (green), "Rejeter" (red), "Demander des modifications" (amber). Each triggers modal/form with reason textarea for reject/request_edit. Calls `PATCH /api/v1/moderation/[id]` via TanStack Query mutation. Shows success/error toast via `src/components/ui/toast.tsx`
  - [ ] 4.5: Add optimistic update: on approve, remove item from queue list immediately. On reject/request_edit, remove from list. Invalidate query on success

- [ ] Task 5: Write tests (AC: all)
  - [ ] 5.1: Unit test `src/components/features/admin/ModerationQueue.test.tsx` -- renders queue items, displays count badge, handles empty state
  - [ ] 5.2: Unit test `src/components/features/admin/ModerationActionBar.test.tsx` -- renders three buttons, opens reason textarea for reject/request_edit, validates required reason
  - [ ] 5.3: API route test `__tests__/api/moderation.test.ts` -- tests GET returns pending submissions sorted by created_at ASC, tests PATCH approve/reject/request_edit, tests 403 for non-admin users, tests reason validation

## Dev Notes

### Architecture Patterns

- **RBAC Enforcement (Two Layers):**
  1. `src/middleware.ts` -- Edge middleware checks JWT `role` claim. Redirects non-admin from `/admin/*` routes. Also allows `moderator` role for `/admin/moderation` specifically.
  2. API route handlers -- Each handler calls `auth()` and verifies `session.user.role in ['admin', 'moderator']` before processing. Never trust middleware alone.

```typescript
// Pattern for API route auth check
import { auth } from '@/lib/auth/config';
import { apiError } from '@/lib/api/response';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !['admin', 'moderator'].includes(session.user.role)) {
    return apiError('FORBIDDEN', 'Insufficient permissions', 403);
  }
  // ... handler logic
}
```

- **Middleware RBAC (from architecture):**

```typescript
// src/middleware.ts
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith('/admin') && role !== 'admin') {
    // Note: moderator access to /admin/moderation handled separately
    if (pathname.startsWith('/admin/moderation') && role === 'moderator') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/feed/hot', req.url));
  }
  return NextResponse.next();
});
```

- **API Response Envelope** -- all API responses use the standard wrapper from `src/lib/api/response.ts`:

```typescript
{ data: T | null, error: ApiError | null, meta: { requestId: string } }
```

### Tech Stack

| Tech | Version | Usage in This Story |
|---|---|---|
| Next.js | 16.1.6 | App Router, API routes, Server Components |
| Auth.js v5 | 5.x | `auth()` for session/role, JWT with role claim |
| Drizzle ORM | 0.45.1 | Schema, queries, migrations |
| TanStack Query | 5.90.x | Client data fetching, mutations, cache invalidation |
| Vitest | 4.0.18 | Unit + API route tests |
| shadcn/ui | 2026-02 | Button, Badge, Dialog, Toast, Card, Textarea components |
| Tailwind CSS | 4.2.0 | Styling |

### Database Schema

```typescript
// Add to src/lib/db/schema.ts

export const moderationActionType = pgEnum('moderation_action_type', [
  'approve', 'reject', 'request_edit', 'remove'
]);

export const moderationActions = pgTable('moderation_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id),
  adminUserId: uuid('admin_user_id').notNull().references(() => users.id),
  action: moderationActionType('action').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

**Existing `moderationStatus` enum** (already in schema): `['pending', 'approved', 'rejected', 'flagged']` -- may need to add `'needs_edit'` value.

**Existing `moderationQueue` table** (already in schema) -- used for flag-based reports. The `moderation_actions` table is NEW and tracks admin decisions (approve/reject/request_edit/remove) as an audit log.

### Key Indexes

```sql
-- Already exists
CREATE INDEX idx_moderation_queue_status ON moderation_queue (resolution) WHERE resolution IS NULL;

-- Add for this story
CREATE INDEX idx_moderation_actions_submission ON moderation_actions (submission_id);
CREATE INDEX idx_submissions_moderation_pending ON submissions (created_at ASC) WHERE moderation_status = 'pending';
```

### Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `src/lib/db/schema.ts` | MODIFY | Add `moderationActionType` enum, `moderationActions` table, update `moderationStatus` enum |
| `src/lib/db/migrations/XXXX_moderation_actions.sql` | CREATE (via drizzle-kit) | Migration for new table |
| `src/lib/utils/validation.ts` | MODIFY | Add `moderationActionSchema` Zod schema |
| `src/app/api/v1/moderation/route.ts` | CREATE | GET endpoint for queue |
| `src/app/api/v1/moderation/[id]/route.ts` | CREATE | PATCH endpoint for actions |
| `src/app/(app)/admin/layout.tsx` | CREATE | Admin layout with RBAC guard + nav |
| `src/app/(app)/admin/moderation/page.tsx` | CREATE | Moderation queue page |
| `src/components/features/admin/ModerationQueue.tsx` | CREATE | Queue list component |
| `src/components/features/admin/ModerationDetailPanel.tsx` | CREATE | Submission detail panel |
| `src/components/features/admin/ModerationActionBar.tsx` | CREATE | Approve/Reject/Request-edit buttons |
| `src/components/features/admin/ModerationQueue.test.tsx` | CREATE | Component tests |
| `src/components/features/admin/ModerationActionBar.test.tsx` | CREATE | Component tests |
| `__tests__/api/moderation.test.ts` | CREATE | API route tests |

### Testing Strategy

- **Unit tests** (Vitest + Testing Library): ModerationQueue renders items, shows count badge, handles empty state. ModerationActionBar renders buttons, opens dialogs, validates reason field.
- **API route tests** (Vitest): Mock `auth()` to return admin/moderator/user sessions. Test GET returns correct data shape. Test PATCH with valid/invalid payloads. Test 403 for unauthorized roles.
- **Coverage targets**: Components > 70%, API routes > 85%

### UX Notes

- Queue items use `Card` component from shadcn/ui with hover highlight
- Count badge uses `Badge` variant with dynamic count: `{n} signalements en attente`
- Action buttons: "Approuver" (green/success variant), "Rejeter" (red/destructive variant), "Demander des modifications" (amber/warning)
- Reason textarea uses `Dialog` component from shadcn/ui as modal
- Success/error feedback via toast notifications (`Toaster` from shadcn/ui)
- EUR amounts formatted with `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })` via `src/lib/utils/format.ts`
- Source URLs display with external link icon, open in new tab (`target="_blank" rel="noopener noreferrer"`)
- Empty state: "Aucun signalement en attente. Bon travail !" with chainsaw icon

### Dependencies

- **Requires before this story**: Epic 1 (Auth/registration with role field in JWT), Epic 2 (Submission creation with `moderation_status` field)
- **Blocks**: Story 6.2 (uses `moderation_actions` table), Story 6.5 (dashboard reads moderation data)

### Project Structure Notes

- Admin pages live under `src/app/(app)/admin/` with a shared layout for the admin sidebar
- Admin components live under `src/components/features/admin/`
- The `(app)` route group is the main authenticated app shell per architecture
- API routes follow RESTful pattern at `src/app/api/v1/`

### References

- [Source: epics.md#Story 6.1 -- Full AC and story statement]
- [Source: architecture.md#Schema Design -- `moderationQueue` table, `moderationStatus` enum, `submissions` table]
- [Source: architecture.md#Role-Based Access Control -- 4 roles, middleware pattern]
- [Source: architecture.md#API Endpoint Map -- GET/PATCH /api/v1/moderation]
- [Source: architecture.md#Section 5 -- File tree, admin routes at /admin/moderation]
- [Source: architecture.md#Testing Patterns -- Vitest, co-located tests, coverage targets]
- [Source: prd.md#FR26 -- Admin view moderation queue]
- [Source: prd.md#FR27 -- Admin approve/reject/request-edits]
- [Source: ux-design-specification.md#Journey 4 -- Admin moderation flow]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
