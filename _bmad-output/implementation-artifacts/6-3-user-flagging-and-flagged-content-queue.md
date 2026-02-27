# Story 6.3: User Flagging & Flagged Content Queue

Status: ready-for-dev

## Story

As a registered user (Nicolas),
I want to flag a submission as inaccurate, spam, or inappropriate,
so that moderators can review potentially problematic content.

As an administrator or moderator,
I want to view flagged submissions sorted by flag count,
so that I can prioritize reviewing the most-reported content.

## Acceptance Criteria

1. **Given** a Drizzle migration creates the `flags` table (if not exists) with columns: `id` (UUID PK), `submission_id` (UUID FK to submissions, not null), `user_id` (UUID FK to users, not null), `reason` (enum: `'inaccurate'` | `'spam'` | `'inappropriate'`, not null), `details` (text, nullable, max 500 chars), `created_at` (timestamp), and a unique constraint on `(user_id, submission_id)`, **When** the migration runs, **Then** the table is created.

2. **Given** a logged-in user views a submission detail page, **When** the page renders, **Then** a "Signaler" (Flag) button with a flag icon is displayed in the submission actions area (next to share/vote buttons).

3. **Given** the user clicks "Signaler", **When** the flag form modal appears, **Then** the modal displays three radio options: "Informations inexactes" (inaccurate), "Spam" (spam), "Contenu inapproprie" (inappropriate), an optional textarea for additional details (max 500 chars), and a "Envoyer le signalement" submit button. (FR4)

4. **Given** the user submits the flag form, **When** the flag is processed via `POST /api/v1/submissions/[id]/flag`, **Then** a new row is inserted into the `flags` table, and a success toast displays "Merci, votre signalement a ete enregistre."

5. **Given** the user has already flagged this submission (unique constraint violation), **When** they attempt to flag again, **Then** an error toast displays "Vous avez deja signale ce contenu." and the "Signaler" button shows a "Deja signale" state.

6. **Given** a submission accumulates 3 or more flags (configurable threshold), **When** the third flag is inserted, **Then** the submission's `moderation_status` is automatically updated to `'flagged'` to prioritize it in the moderation queue.

7. **Given** an administrator or moderator navigates to `/admin/flags`, **When** the flagged content page renders, **Then** a list of submissions with at least 1 flag is displayed, ordered by total flag count descending (FR29), each showing: title, total flags count, breakdown by reason (e.g., "3 inexact, 2 spam, 1 inapproprie"), submission status, most recent flag date. Each item has quick-action buttons: "Voir" (view detail), "Approuver" (dismiss flags and keep published), "Retirer" (remove submission).

8. **Given** an admin/moderator clicks "Approuver" on a flagged submission, **When** the action is processed, **Then** the submission's `moderation_status` is reset to `'approved'`, all flags for that submission are marked as resolved (or deleted), and the submission remains in the public feed.

9. **Given** a non-authenticated user views a submission, **When** the page renders, **Then** the "Signaler" button is not displayed (flagging requires login).

## Tasks / Subtasks

- [ ] Task 1: Create `flags` table schema and migration (AC: #1)
  - [ ] 1.1: Add `flagReason` pgEnum with values `['inaccurate', 'spam', 'inappropriate']` to `src/lib/db/schema.ts`
  - [ ] 1.2: Add `flags` table to `src/lib/db/schema.ts`:

```typescript
export const flags = pgTable('flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  reason: flagReason('reason').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
// Unique constraint on (user_id, submission_id) via migration
```

  - [ ] 1.3: Add unique index `CREATE UNIQUE INDEX idx_flags_user_submission ON flags (user_id, submission_id)`
  - [ ] 1.4: Add index `CREATE INDEX idx_flags_submission_id ON flags (submission_id)`
  - [ ] 1.5: Run `npx drizzle-kit generate` and `npx drizzle-kit migrate`

- [ ] Task 2: Create flagging API endpoint (AC: #4, #5, #6)
  - [ ] 2.1: Create `POST /api/v1/submissions/[id]/flag` route at `src/app/api/v1/submissions/[id]/flag/route.ts`. Accept `{ reason: 'inaccurate' | 'spam' | 'inappropriate', details?: string }`. Verify caller is authenticated (`role !== undefined`). Insert into `flags` table. Handle unique constraint violation (return 409 with message). Apply rate limiting
  - [ ] 2.2: Add auto-flagging threshold logic: after inserting the flag, count total flags for the submission. If count >= `FLAG_THRESHOLD` (default 3, configurable via env `FLAG_AUTO_QUEUE_THRESHOLD`), update `submissions.moderation_status` to `'flagged'`
  - [ ] 2.3: Add `GET /api/v1/submissions/[id]/flag` to check if current user has already flagged this submission (returns `{ flagged: boolean }` for UI state)
  - [ ] 2.4: Add Zod validation schema `flagSubmissionSchema = z.object({ reason: z.enum(['inaccurate', 'spam', 'inappropriate']), details: z.string().max(500).optional() })` to `src/lib/utils/validation.ts`

- [ ] Task 3: Create flag button and modal on submission detail page (AC: #2, #3, #5, #9)
  - [ ] 3.1: Create `src/components/features/submissions/FlagButton.tsx` -- Client Component. Shows flag icon + "Signaler" text. Hidden for unauthenticated users. Shows "Deja signale" disabled state if user has already flagged. Clicking opens FlagSubmissionDialog
  - [ ] 3.2: Create `src/components/features/submissions/FlagSubmissionDialog.tsx` -- shadcn/ui `Dialog` with RadioGroup for three flag reasons (labels in French), optional Textarea for details (max 500 chars with counter), "Envoyer le signalement" submit button. Uses TanStack Query mutation to call `POST /api/v1/submissions/[id]/flag`. Shows success toast on 201, error toast on 409 (already flagged)
  - [ ] 3.3: Integrate `FlagButton` into submission detail page `src/app/(app)/s/[id]/[slug]/page.tsx` -- add to the submission actions area alongside existing share/vote buttons

- [ ] Task 4: Create flagged content admin page (AC: #7, #8)
  - [ ] 4.1: Create `GET /api/v1/moderation/flags` route at `src/app/api/v1/moderation/flags/route.ts` -- returns submissions with flags, aggregated by submission with total count and per-reason breakdown, ordered by total flag count DESC. Joins with submissions table for title/status. Admin/moderator access only
  - [ ] 4.2: Create `src/app/(app)/admin/flags/page.tsx` -- Server Component page rendering the flagged content queue
  - [ ] 4.3: Create `src/components/features/admin/FlaggedContentQueue.tsx` -- Client Component using TanStack Query. Displays list of flagged submissions with: title, total flags badge, reason breakdown (e.g., "3 inexact, 2 spam"), status badge, most recent flag date. Quick-action buttons: "Voir" (navigates to submission), "Approuver" (dismiss flags), "Retirer" (remove submission -- reuses removal pattern from Story 6.2)
  - [ ] 4.4: Implement "Approuver" action for flagged content: calls `PATCH /api/v1/moderation/[id]` with `action = 'approve'`, resets `moderation_status` to `'approved'`, marks flags as resolved (soft-delete or status update on flag rows)

- [ ] Task 5: Write tests (AC: all)
  - [ ] 5.1: Unit test `src/components/features/submissions/FlagButton.test.tsx` -- renders for authenticated users, hidden for unauthenticated, shows "Deja signale" state
  - [ ] 5.2: Unit test `src/components/features/submissions/FlagSubmissionDialog.test.tsx` -- renders radio options, validates selection, shows details textarea, handles submit
  - [ ] 5.3: Unit test `src/components/features/admin/FlaggedContentQueue.test.tsx` -- renders flagged items sorted by count, shows reason breakdown, action buttons work
  - [ ] 5.4: API route test `__tests__/api/flag-submission.test.ts` -- tests POST creates flag, tests 409 on duplicate, tests auto-flagging threshold, tests flag check endpoint, tests 401 for unauthenticated
  - [ ] 5.5: API route test `__tests__/api/moderation-flags.test.ts` -- tests GET returns aggregated flag data, tests approve action resets status, tests 403 for non-admin/mod

## Dev Notes

### Architecture Patterns

- **Flagging API** (from architecture endpoint map): `POST /api/v1/submissions/[id]/flag` with `User` auth level. This is a standard authenticated endpoint, not admin-only.

```typescript
// Flag endpoint auth pattern -- any authenticated user can flag
const session = await auth();
if (!session?.user) {
  return apiError('UNAUTHORIZED', 'Authentication required', 401);
}
```

- **Auto-Flag Threshold**: When a submission accumulates `FLAG_THRESHOLD` (default: 3) flags, automatically set `moderation_status = 'flagged'`. This surfaces heavily-flagged content in the admin queue without manual intervention.

```typescript
// Auto-flag threshold logic
const FLAG_THRESHOLD = parseInt(process.env.FLAG_AUTO_QUEUE_THRESHOLD ?? '3');

// After inserting flag, count total
const [{ count }] = await db
  .select({ count: sql<number>`count(*)` })
  .from(flags)
  .where(eq(flags.submissionId, submissionId));

if (count >= FLAG_THRESHOLD) {
  await db.update(submissions)
    .set({ moderationStatus: 'flagged' })
    .where(eq(submissions.id, submissionId));
}
```

- **Unique Constraint Handling**: The `(user_id, submission_id)` unique index prevents duplicate flags. Catch the database constraint violation error and return a user-friendly 409 response.

```typescript
try {
  await db.insert(flags).values({ ... });
} catch (error) {
  if (error.code === '23505') { // PostgreSQL unique violation
    return apiError('CONFLICT', 'Vous avez d\u00e9j\u00e0 signal\u00e9 ce contenu.', 409);
  }
  throw error;
}
```

- **Flag Reason Enum**: Three values mapping to French labels:
  - `inaccurate` -> "Informations inexactes"
  - `spam` -> "Spam"
  - `inappropriate` -> "Contenu inapproprie"

- **Existing `moderationQueue` Table**: The architecture already defines a `moderation_queue` table for reports. The new `flags` table is separate and specific to user-facing flagging with structured reasons. The `moderation_queue` table is used for moderator-initiated items. Both feed into the admin view but from different angles.

### Tech Stack

| Tech | Version | Usage in This Story |
|---|---|---|
| Next.js | 16.1.6 | App Router, API routes |
| Auth.js v5 | 5.x | `auth()` for session check |
| Drizzle ORM | 0.45.1 | Schema, queries, unique constraint handling |
| TanStack Query | 5.90.x | Mutations for flagging, queries for flag status |
| Vitest | 4.0.18 | Unit + API route tests |
| shadcn/ui | 2026-02 | Dialog, RadioGroup, Button, Badge, Toast, Textarea |
| Tailwind CSS | 4.2.0 | Styling |

### Database Schema

```typescript
// Add to src/lib/db/schema.ts

export const flagReason = pgEnum('flag_reason', ['inaccurate', 'spam', 'inappropriate']);

export const flags = pgTable('flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  reason: flagReason('reason').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

### Key Indexes

```sql
CREATE UNIQUE INDEX idx_flags_user_submission ON flags (user_id, submission_id);
CREATE INDEX idx_flags_submission_id ON flags (submission_id);
CREATE INDEX idx_flags_reason ON flags (reason);
```

### Aggregation Query for Admin View

```typescript
// Flagged content with breakdown query pattern
const flaggedSubmissions = await db
  .select({
    submissionId: flags.submissionId,
    title: submissions.title,
    status: submissions.moderationStatus,
    totalFlags: sql<number>`count(*)`.as('total_flags'),
    inaccurateCount: sql<number>`count(*) filter (where ${flags.reason} = 'inaccurate')`,
    spamCount: sql<number>`count(*) filter (where ${flags.reason} = 'spam')`,
    inappropriateCount: sql<number>`count(*) filter (where ${flags.reason} = 'inappropriate')`,
    latestFlagDate: sql<Date>`max(${flags.createdAt})`,
  })
  .from(flags)
  .innerJoin(submissions, eq(flags.submissionId, submissions.id))
  .groupBy(flags.submissionId, submissions.id)
  .orderBy(desc(sql`count(*)`));
```

### Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `src/lib/db/schema.ts` | MODIFY | Add `flagReason` enum, `flags` table |
| `src/lib/db/migrations/XXXX_flags.sql` | CREATE (via drizzle-kit) | Migration for flags table |
| `src/lib/utils/validation.ts` | MODIFY | Add `flagSubmissionSchema` |
| `src/app/api/v1/submissions/[id]/flag/route.ts` | CREATE | POST flag, GET flag status |
| `src/app/api/v1/moderation/flags/route.ts` | CREATE | GET flagged content list (admin) |
| `src/app/(app)/admin/flags/page.tsx` | CREATE | Flagged content admin page |
| `src/app/(app)/s/[id]/[slug]/page.tsx` | MODIFY | Add FlagButton to submission actions |
| `src/components/features/submissions/FlagButton.tsx` | CREATE | Flag trigger button |
| `src/components/features/submissions/FlagSubmissionDialog.tsx` | CREATE | Flag form modal |
| `src/components/features/admin/FlaggedContentQueue.tsx` | CREATE | Flagged submissions admin list |
| `src/components/features/submissions/FlagButton.test.tsx` | CREATE | Component tests |
| `src/components/features/submissions/FlagSubmissionDialog.test.tsx` | CREATE | Component tests |
| `src/components/features/admin/FlaggedContentQueue.test.tsx` | CREATE | Component tests |
| `__tests__/api/flag-submission.test.ts` | CREATE | API route tests |
| `__tests__/api/moderation-flags.test.ts` | CREATE | API route tests |

### Testing Strategy

- **Unit tests** (Vitest + Testing Library): FlagButton visibility based on auth state, FlagSubmissionDialog form validation and submission, FlaggedContentQueue rendering and sorting.
- **API route tests** (Vitest): Flag creation (201), duplicate prevention (409), auto-flagging threshold trigger, flag status check, flagged content aggregation endpoint, admin-only access for flags list.
- **Coverage targets**: Components > 70%, API routes > 85%

### UX Notes

- "Signaler" button uses a flag icon (Lucide `Flag` icon) with subtle styling -- not prominent, but discoverable
- Flag modal uses `RadioGroup` from shadcn/ui with French labels
- Details textarea shows "Optionnel -- ajoutez des precisions" placeholder
- Character counter for details: "X/500 caracteres"
- "Deja signale" state: button shows filled flag icon, muted color, tooltip "Vous avez deja signale ce contenu"
- Flagged content admin view uses `Badge` components for reason breakdown with color coding: inaccurate (amber), spam (red), inappropriate (purple)
- Total flags count shown as large number badge on each item
- Quick-action buttons are inline for fast moderation workflow

### Dependencies

- **Requires**: Story 6.1 (admin layout, `moderation_actions` table, RBAC patterns)
- **Requires**: Story 6.2 (removal action pattern for "Retirer" quick action)
- **Requires**: Epic 2 (submission detail page to add flag button)
- **Blocks**: Story 6.5 (dashboard shows unresolved flags count)

### Project Structure Notes

- User-facing flagging components go under `src/components/features/submissions/` (not admin, since flagging is a user action)
- Admin flagged content queue goes under `src/components/features/admin/`
- The flag API endpoint follows the architecture's nested resource pattern: `/api/v1/submissions/[id]/flag`

### References

- [Source: epics.md#Story 6.3 -- Full AC and story statement, flags table schema]
- [Source: architecture.md#Schema Design -- `moderationQueue` table (existing report mechanism)]
- [Source: architecture.md#API Endpoint Map -- POST /api/v1/submissions/[id]/flag]
- [Source: architecture.md#Role-Based Access Control -- user role can flag content]
- [Source: prd.md#FR4 -- Registered users can flag submission as inaccurate, spam, or inappropriate]
- [Source: prd.md#FR29 -- Admin view flagged submissions sorted by flag count]
- [Source: ux-design-specification.md#Component Strategy -- flag/report mechanism]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
