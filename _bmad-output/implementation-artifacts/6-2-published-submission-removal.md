# Story 6.2: Published Submission Removal

Status: ready-for-dev

## Story

As an administrator,
I want to remove published submissions that violate terms of service,
so that the platform remains a credible and safe space for fiscal accountability.

## Acceptance Criteria

1. **Given** an administrator navigates to any approved submission's detail page, **When** the page renders for an admin user, **Then** an additional "Retirer" (Remove) button is displayed in a moderation toolbar at the top of the page, styled with a red outline (destructive variant) to indicate a destructive action. (FR28)

2. **Given** an administrator clicks "Retirer" on an approved submission, **When** the removal confirmation modal appears, **Then** the modal displays: "Etes-vous sur de vouloir retirer ce signalement ? Il ne sera plus visible dans le feed public.", with a textarea for the removal reason (required, max 500 chars), and two buttons: "Confirmer le retrait" (red/destructive) and "Annuler" (neutral/ghost).

3. **Given** the administrator confirms the removal, **When** the action is processed, **Then** the submission's `moderation_status` is updated to `'removed'` (soft-delete pattern -- `is_removed = true`, `removal_reason` stored, `removed_by` set to admin user ID), the submission is no longer visible in the public feed or search results, the submission page at `/s/{id}/{slug}` displays a notice: "Ce signalement a ete retire par la moderation.", a row is inserted into the `moderation_actions` table with `action = 'remove'` and the provided reason, and a success toast displays "Signalement retire avec succes". (FR28)

4. **Given** an administrator navigates to `/admin/removed`, **When** the page renders, **Then** a list of all removed submissions is displayed with: title, removal date, removal reason, and the admin who removed it. Each item has a "Voir" link to the submission page (which shows the removal notice).

5. **Given** a non-admin user views a removed submission at `/s/{id}/{slug}`, **When** the page renders, **Then** the submission content is hidden and replaced with the notice "Ce signalement a ete retire par la moderation." The vote buttons and share buttons are disabled.

6. **Given** a non-admin user attempts to access `/admin/removed`, **When** the server checks authorization, **Then** a `403 Forbidden` response is returned and the user is redirected to `/feed/hot`.

## Tasks / Subtasks

- [ ] Task 1: Update database schema for soft-delete removal pattern (AC: #3)
  - [ ] 1.1: Add `'removed'` to the `moderationStatus` pgEnum in `src/lib/db/schema.ts` (values become: `['pending', 'approved', 'rejected', 'flagged', 'needs_edit', 'removed']`)
  - [ ] 1.2: Add soft-delete columns to `submissions` table in `src/lib/db/schema.ts`:
    - `isRemoved: boolean('is_removed').notNull().default(false)`
    - `removalReason: text('removal_reason')`
    - `removedBy: uuid('removed_by').references(() => users.id)`
    - `removedAt: timestamp('removed_at')`
  - [ ] 1.3: Run `npx drizzle-kit generate` and `npx drizzle-kit migrate`

- [ ] Task 2: Create removal API endpoint (AC: #3)
  - [ ] 2.1: Create `POST /api/v1/moderation/[id]/remove` route at `src/app/api/v1/moderation/[id]/remove/route.ts` -- OR extend existing `PATCH /api/v1/moderation/[id]` to handle `action = 'remove'`. Accept `{ reason: string }` (required, max 500 chars). Verify caller role is `'admin'` only (not moderator -- removal is admin-only per FR28). Update submission: set `moderation_status = 'removed'`, `is_removed = true`, `removal_reason`, `removed_by`, `removed_at`. Insert row into `moderation_actions` with `action = 'remove'`
  - [ ] 2.2: Add Zod validation schema `removalActionSchema = z.object({ reason: z.string().min(1).max(500) })` to `src/lib/utils/validation.ts`
  - [ ] 2.3: Apply rate limiting

- [ ] Task 3: Create removed submissions list API and page (AC: #4)
  - [ ] 3.1: Create `GET /api/v1/moderation/removed` route at `src/app/api/v1/moderation/removed/route.ts` -- returns all submissions where `is_removed = true`, joined with admin user info (removed_by), sorted by `removed_at DESC`. Admin-only access
  - [ ] 3.2: Create `src/app/(app)/admin/removed/page.tsx` -- Server Component page rendering removed submissions list
  - [ ] 3.3: Create `src/components/features/admin/RemovedSubmissionsList.tsx` -- Client Component displaying list with title, removal date, reason, admin name, and "Voir" link

- [ ] Task 4: Update submission detail page for admin toolbar and removal state (AC: #1, #2, #5)
  - [ ] 4.1: Modify `src/app/(app)/s/[id]/[slug]/page.tsx` (or equivalent submission detail page) to check `session.user.role === 'admin'` and render a moderation toolbar with "Retirer" button if submission is approved
  - [ ] 4.2: Create `src/components/features/admin/RemovalConfirmDialog.tsx` -- shadcn/ui `AlertDialog` with warning text, required reason textarea (max 500 chars with char counter), "Confirmer le retrait" (destructive) and "Annuler" (ghost) buttons. Calls removal API on confirm. Shows success/error toast
  - [ ] 4.3: Modify submission detail page to detect `is_removed === true` and display removal notice "Ce signalement a ete retire par la moderation." instead of submission content. Disable vote buttons and share buttons. Show a muted/greyed-out card style

- [ ] Task 5: Update feed queries to exclude removed submissions (AC: #3)
  - [ ] 5.1: Ensure all feed queries (`GET /api/v1/submissions` with hot/new/top sorting) filter out submissions where `is_removed = true` or `moderation_status = 'removed'`. Verify existing `WHERE status = 'published'` conditions also account for removal state

- [ ] Task 6: Write tests (AC: all)
  - [ ] 6.1: Unit test `src/components/features/admin/RemovalConfirmDialog.test.tsx` -- renders modal with correct text, requires reason, shows char counter, calls API on confirm
  - [ ] 6.2: Unit test `src/components/features/admin/RemovedSubmissionsList.test.tsx` -- renders list items with title, date, reason, admin name
  - [ ] 6.3: API route test `__tests__/api/moderation-removal.test.ts` -- tests removal endpoint (admin-only, reason required, soft-delete columns set, moderation_actions row created), tests 403 for moderator role (removal is admin-only), tests removed submissions list endpoint

## Dev Notes

### Architecture Patterns

- **Soft-Delete Pattern**: Submissions are never hard-deleted. The `is_removed` boolean flag controls visibility. This preserves audit trail and allows potential restoration. All public-facing queries MUST filter `WHERE is_removed = false` (or `moderation_status != 'removed'`).

```typescript
// Soft-delete update pattern
await db.update(submissions)
  .set({
    moderationStatus: 'removed',
    isRemoved: true,
    removalReason: reason,
    removedBy: adminUserId,
    removedAt: new Date(),
  })
  .where(eq(submissions.id, submissionId));
```

- **Removal is Admin-Only**: Unlike moderation queue review (admin + moderator), published submission removal is restricted to `admin` role only. This is a more destructive action requiring higher privilege.

- **RBAC Pattern** (same as Story 6.1):

```typescript
const session = await auth();
if (!session?.user || session.user.role !== 'admin') {
  return apiError('FORBIDDEN', 'Only administrators can remove submissions', 403);
}
```

- **Confirmation Dialog Pattern**: Destructive actions require a two-step confirmation with explicit reason. Uses shadcn/ui `AlertDialog` (not `Dialog`) for blocking modal behavior.

### Tech Stack

| Tech | Version | Usage in This Story |
|---|---|---|
| Next.js | 16.1.6 | App Router, API routes, Server Components |
| Auth.js v5 | 5.x | `auth()` for session/role |
| Drizzle ORM | 0.45.1 | Schema update, queries, migrations |
| TanStack Query | 5.90.x | Mutations for removal action |
| Vitest | 4.0.18 | Unit + API route tests |
| shadcn/ui | 2026-02 | AlertDialog, Button, Badge, Toast, Textarea |

### Database Schema Changes

```typescript
// Additions to submissions table in src/lib/db/schema.ts
// Add these columns to the existing submissions pgTable definition:
isRemoved: boolean('is_removed').notNull().default(false),
removalReason: text('removal_reason'),
removedBy: uuid('removed_by').references(() => users.id),
removedAt: timestamp('removed_at'),
```

```typescript
// Update moderationStatus enum to include 'removed'
export const moderationStatus = pgEnum('moderation_status', [
  'pending', 'approved', 'rejected', 'flagged', 'needs_edit', 'removed'
]);
```

### Key Indexes

```sql
-- Add for efficient removed submissions queries
CREATE INDEX idx_submissions_removed ON submissions (removed_at DESC) WHERE is_removed = true;
```

### Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `src/lib/db/schema.ts` | MODIFY | Add `is_removed`, `removal_reason`, `removed_by`, `removed_at` to submissions; update `moderationStatus` enum |
| `src/lib/db/migrations/XXXX_submission_removal.sql` | CREATE (via drizzle-kit) | Migration for schema changes |
| `src/lib/utils/validation.ts` | MODIFY | Add `removalActionSchema` |
| `src/app/api/v1/moderation/[id]/route.ts` | MODIFY | Extend PATCH to handle `action = 'remove'` OR create separate remove endpoint |
| `src/app/api/v1/moderation/removed/route.ts` | CREATE | GET removed submissions list |
| `src/app/(app)/admin/removed/page.tsx` | CREATE | Removed submissions page |
| `src/app/(app)/s/[id]/[slug]/page.tsx` | MODIFY | Add admin toolbar, removal notice for removed submissions |
| `src/components/features/admin/RemovalConfirmDialog.tsx` | CREATE | Confirmation dialog with reason |
| `src/components/features/admin/RemovedSubmissionsList.tsx` | CREATE | List of removed submissions |
| `src/components/features/admin/RemovalConfirmDialog.test.tsx` | CREATE | Component tests |
| `src/components/features/admin/RemovedSubmissionsList.test.tsx` | CREATE | Component tests |
| `__tests__/api/moderation-removal.test.ts` | CREATE | API route tests |

### Testing Strategy

- **Unit tests** (Vitest + Testing Library): RemovalConfirmDialog renders correctly, validates reason, shows character counter. RemovedSubmissionsList renders list with correct data.
- **API route tests** (Vitest): Mock `auth()` for admin/moderator/user roles. Test soft-delete sets all columns. Test 403 for moderator (removal is admin-only). Test removed submissions list returns correct data.
- **Integration consideration**: Verify feed queries exclude removed submissions. This can be tested via API route test for `GET /api/v1/submissions`.

### UX Notes

- "Retirer" button uses `Button` with `variant="destructive"` and `variant="outline"` -- red outline, not filled, to indicate caution
- Confirmation modal uses `AlertDialog` from shadcn/ui (blocks interaction until resolved)
- Removal reason textarea shows character count: "X/500 caracteres"
- Removed submission page shows a subtle grey banner with lock icon: "Ce signalement a ete retire par la moderation."
- Vote arrows on removed submissions are visually greyed out and `aria-disabled`
- Share buttons on removed submissions are hidden

### Dependencies

- **Requires**: Story 6.1 (creates `moderation_actions` table and `moderationActionType` enum with `'remove'` value)
- **Requires**: Epic 2 (submission detail page at `/s/[id]/[slug]`)
- **Blocks**: Story 6.5 (dashboard shows removed submission count)

### Project Structure Notes

- Admin pages under `src/app/(app)/admin/` share the admin layout from Story 6.1
- Submission detail page may be at `src/app/(app)/s/[id]/[slug]/page.tsx` per architecture file tree
- The `(app)` route group wraps all authenticated app pages

### References

- [Source: epics.md#Story 6.2 -- Full AC and story statement]
- [Source: architecture.md#Schema Design -- submissions table with status/moderationStatus fields]
- [Source: architecture.md#Role-Based Access Control -- admin role for removal]
- [Source: architecture.md#API Endpoint Map -- DELETE /api/v1/submissions/[id] listed as Author/Admin]
- [Source: architecture.md#Section 5 -- File tree]
- [Source: prd.md#FR28 -- Admin remove published submissions violating ToS]
- [Source: ux-design-specification.md#Journey 4 -- Admin moderation flow: reject/remove actions]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
