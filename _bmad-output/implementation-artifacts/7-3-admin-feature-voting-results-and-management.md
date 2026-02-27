# Story 7.3: Admin Feature Voting Results & Management

## Story

**As an** administrator,
**I want** to view community feature voting results and manage proposal statuses,
**So that** I can make informed decisions about the development roadmap and communicate progress to the community.

**Epic:** 7 — Community Feature Voting & Platform Democracy
**FRs:** FR31 (Administrators can view community feature voting results and current rankings)
**NFRs:** NFR8 (Rate limiting)

---

## Acceptance Criteria (BDD)

### AC 7.3.1: Admin Feature Management Page

```gherkin
Given an administrator navigates to `/admin/features`
When the feature management page renders
Then all feature proposals are displayed in a data table with columns:
  | Column       | Sortable | Description                                  |
  |--------------|----------|----------------------------------------------|
  | Title        | No       | Full proposal title (truncated with tooltip)  |
  | Vote Count   | Yes      | Current net vote count (default sort DESC)    |
  | Category     | No       | Category pill (General, Donnees, UX, etc.)    |
  | Status       | No       | Color-coded status badge                      |
  | Created By   | No       | Author display name or "Nicolas #XXXX"        |
  | Created Date | Yes      | Formatted date (dd/MM/yyyy)                   |
And the table is sorted by vote count descending by default
And the table supports ascending/descending toggle on sortable columns
And a status filter bar allows filtering by: Tous, Propose, Planifie, En cours, Realise, Refuse
And a search input allows filtering proposals by title (client-side for MVP)
And the total count of proposals per status is displayed in the filter bar (e.g., "Propose (24)")
```

### AC 7.3.2: Proposal Detail View

```gherkin
Given an administrator clicks on a feature proposal row in the table
When the detail view opens (modal or side panel)
Then the following information is displayed:
  - Full title
  - Full description (untruncated)
  - Category
  - Current status with badge
  - Vote count (net total)
  - Author display name and ID
  - Creation date (full timestamp)
  - Vote trend: a simple sparkline or bar chart showing votes received over the last 30 days
And a status change dropdown is available
And a rejection reason text area is shown when status is changed to "declined"
```

### AC 7.3.3: Status Change — Mark as Planned

```gherkin
Given an administrator views a proposal with status "proposed"
When they change the status to "planned" via the dropdown
Then the `feature_votes.status` is updated to "planned" in the database via PATCH /api/v1/feature-votes/[id]
And the status badge updates to blue "Planifie" in the admin table
And on the public `/features` page, the proposal displays a blue "Planifie" badge
And a success toast shows: "Statut mis a jour : Planifie"
```

### AC 7.3.4: Status Change — Mark as In Progress

```gherkin
Given an administrator changes a proposal's status to "in_progress"
Then the `feature_votes.status` is updated to "in_progress"
And the status badge updates to amber "En cours de developpement" in the admin table
And on the public `/features` page, the proposal displays an amber "En cours" badge
And a success toast shows: "Statut mis a jour : En cours de developpement"
```

### AC 7.3.5: Status Change — Mark as Shipped

```gherkin
Given an administrator changes a proposal's status to "shipped"
Then the `feature_votes.status` is updated to "shipped"
And the status badge updates to green "Realise" in the admin table
And on the public `/features` page, the proposal displays a green "Realise" badge with a checkmark icon
And a success toast shows: "Statut mis a jour : Realise"
```

### AC 7.3.6: Status Change — Mark as Declined (with Reason)

```gherkin
Given an administrator changes a proposal's status to "declined"
When the status dropdown selection is made
Then a mandatory reason textarea appears (max 500 chars, label "Raison du refus")
And the "Confirmer" button is disabled until a reason is entered (min 10 chars)
When the administrator enters a reason and clicks "Confirmer"
Then the `feature_votes.status` is updated to "declined"
And the rejection reason is stored (new column `rejection_reason` on `feature_votes` or in a separate log)
And the proposal is hidden from the main list on the public `/features` page
Or displayed at the bottom of the page with a "Refuse" badge and the reason visible on hover/expand
And a success toast shows: "Proposition refusee"
```

### AC 7.3.7: Admin Role Guard

```gherkin
Given a non-admin user navigates to `/admin/features`
When the page attempts to render
Then the user is redirected to the home page or shown a 403 Forbidden error
And the admin layout role guard from `src/app/admin/layout.tsx` handles the authorization check
```

### AC 7.3.8: API Endpoint — PATCH /api/v1/feature-votes/[id] (Status Update)

```gherkin
Given an authenticated admin sends PATCH /api/v1/feature-votes/[id]
When the request body contains:
  {
    "status": "planned" | "in_progress" | "shipped" | "declined",
    "rejectionReason": "Doublon avec la proposition #abc123..." (required only for "declined")
  }
Then the server validates:
  - User has admin role
  - Status is a valid enum value
  - If status is "declined", rejectionReason is present and 10-500 chars
And the feature_votes.status is updated
And the response returns HTTP 200 with the updated proposal
And the response follows the standard API envelope

Given a non-admin user sends PATCH /api/v1/feature-votes/[id]
Then the response is HTTP 403 with error code "FORBIDDEN"

Given the feature vote ID does not exist
Then the response is HTTP 404 with error code "NOT_FOUND"
```

### AC 7.3.9: Vote Trend Data

```gherkin
Given an administrator views a proposal detail
When the vote trend section loads
Then the system queries `feature_vote_ballots` for the proposal grouped by day over the last 30 days
And displays a simple bar chart or sparkline showing daily vote activity
And the total votes for the 30-day period are shown as a summary number
```

---

## Tasks / Subtasks

### Task 1: Schema Update — Rejection Reason

- [ ] 1.1: Add `rejectionReason` column to `featureVotes` schema in `src/lib/db/schema.ts`:
  ```typescript
  rejectionReason: text('rejection_reason'),
  ```
- [ ] 1.2: Add `updatedAt` column to `featureVotes` schema if not already present:
  ```typescript
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  ```
- [ ] 1.3: Generate and run Drizzle migration for the new columns

### Task 2: TypeScript Types for Admin

- [ ] 2.1: Add admin-specific types to `src/types/feature-vote.ts`:
  - `FeatureVoteAdminView`: extends `FeatureVote` with `authorEmail`, `rejectionReason`, `updatedAt`
  - `FeatureVoteStatusUpdate`: `{ status: FeatureVoteStatus; rejectionReason?: string }`
  - `FeatureVoteTrend`: `{ date: string; count: number }[]`
- [ ] 2.2: Add `FEATURE_VOTE_STATUS_LABELS` constant with French display labels:
  ```typescript
  { proposed: 'Propose', planned: 'Planifie', in_progress: 'En cours', shipped: 'Realise', declined: 'Refuse' }
  ```

### Task 3: Zod Validation — Status Update

- [ ] 3.1: Add `featureVoteStatusUpdateSchema` to `src/lib/utils/validation.ts`:
  ```typescript
  z.object({
    status: z.enum(['proposed', 'planned', 'in_progress', 'shipped', 'declined']),
    rejectionReason: z.string().min(10).max(500).optional(),
  }).refine(
    (data) => data.status !== 'declined' || (data.rejectionReason && data.rejectionReason.length >= 10),
    { message: 'Une raison est requise pour refuser une proposition', path: ['rejectionReason'] }
  )
  ```

### Task 4: API Route — PATCH /api/v1/feature-votes/[id]

- [ ] 4.1: Create `src/app/api/v1/feature-votes/[id]/route.ts` with PATCH handler
- [ ] 4.2: Require authentication and admin role via `requireAdmin()` helper
- [ ] 4.3: Validate request body with `featureVoteStatusUpdateSchema`
- [ ] 4.4: Verify feature vote exists (return 404 if not)
- [ ] 4.5: Update `feature_votes.status` and optionally `rejection_reason` via Drizzle ORM
- [ ] 4.6: Return HTTP 200 with updated proposal in standard API envelope
- [ ] 4.7: On forbidden (non-admin), return HTTP 403

### Task 5: API Route — GET /api/v1/feature-votes/[id]/trend

- [ ] 5.1: Create `src/app/api/v1/feature-votes/[id]/trend/route.ts` with GET handler
- [ ] 5.2: Require admin role
- [ ] 5.3: Query `feature_vote_ballots` grouped by `DATE(created_at)` for the last 30 days
- [ ] 5.4: Return array of `{ date: string, count: number }` objects
- [ ] 5.5: Fill in zero-count days for continuous sparkline display

### Task 6: Admin Feature Management Page

- [ ] 6.1: Create `src/app/admin/features/page.tsx` as RSC (Server Component)
- [ ] 6.2: Fetch all feature proposals server-side (no pagination for MVP — admin sees all)
- [ ] 6.3: Create `src/app/admin/features/loading.tsx` with skeleton loader
- [ ] 6.4: Set page metadata: title "Gestion des fonctionnalites — Admin LIBERAL"
- [ ] 6.5: Verify admin layout guard (`src/app/admin/layout.tsx`) applies to this route

### Task 7: Admin Feature Table Component

- [ ] 7.1: Create `src/components/features/admin/FeatureManagementTable.tsx` (Client Component)
- [ ] 7.2: Implement data table with columns: Title, Vote Count, Category, Status, Created By, Created Date
- [ ] 7.3: Add sort toggle for Vote Count and Created Date columns (ascending/descending)
- [ ] 7.4: Add status filter bar with counts: "Tous (42) | Propose (24) | Planifie (5) | En cours (3) | Realise (8) | Refuse (2)"
- [ ] 7.5: Add title search input (client-side filter for MVP)
- [ ] 7.6: Implement row click to open detail panel
- [ ] 7.7: Status badge color coding:
  - proposed: gray background
  - planned: blue background
  - in_progress: amber background
  - shipped: green background
  - declined: red background

### Task 8: Admin Proposal Detail Panel

- [ ] 8.1: Create `src/components/features/admin/FeatureProposalDetail.tsx` (Client Component)
- [ ] 8.2: Display full title, full description, category, status, vote count, author, creation date
- [ ] 8.3: Implement status change dropdown using `shadcn/ui` `Select` component
- [ ] 8.4: Show rejection reason textarea when "declined" is selected (required, 10-500 chars)
- [ ] 8.5: "Confirmer" button disabled until valid (status selected + reason if declining)
- [ ] 8.6: On status change: call PATCH API, show success toast, update table data via TanStack Query invalidation
- [ ] 8.7: Integrate vote trend sparkline/bar chart

### Task 9: Vote Trend Visualization

- [ ] 9.1: Create `src/components/features/admin/FeatureVoteTrend.tsx` (Client Component)
- [ ] 9.2: Implement a simple bar chart or sparkline for 30-day vote activity
- [ ] 9.3: Use lightweight chart approach (CSS-only bars or minimal SVG — avoid adding ECharts dependency for this small chart)
- [ ] 9.4: Show total votes for the period as a summary number
- [ ] 9.5: Fetch trend data from GET `/api/v1/feature-votes/[id]/trend`

### Task 10: Unit Tests

- [ ] 10.1: Write Vitest tests for `featureVoteStatusUpdateSchema` — valid transitions, missing rejection reason for declined, invalid status values
- [ ] 10.2: Write Vitest tests for PATCH `/api/v1/feature-votes/[id]` — status update, admin role check (403), not found (404), declined requires reason
- [ ] 10.3: Write Vitest tests for GET `/api/v1/feature-votes/[id]/trend` — returns 30-day trend, admin role check
- [ ] 10.4: Write Vitest tests for `FeatureManagementTable` — renders columns, sorting, filtering by status, search
- [ ] 10.5: Write Vitest tests for `FeatureProposalDetail` — renders details, status change flow, rejection reason validation
- [ ] 10.6: Write Vitest tests for `FeatureVoteTrend` — renders chart, handles empty data

---

## Dev Notes

### Architecture Notes

- **Admin layout guard:** The existing `src/app/admin/layout.tsx` already implements role-based access control (checking for admin role via Auth.js session). The `/admin/features` route inherits this guard automatically via Next.js nested layouts.
- **Rendering strategy:** The admin page is RSC for initial data load. The table, detail panel, and trend chart are Client Components for interactivity (sorting, filtering, status changes).
- **Admin API authorization:** All admin API endpoints check `session.user.role === 'admin'` before processing. The `requireAdmin()` helper in `src/lib/auth/helpers.ts` centralizes this check.
- **No public visibility of rejection reasons:** Declined proposals are either hidden from `/features` or shown at the bottom with a "Refuse" badge. The rejection reason is visible only to the proposal author and admins (privacy consideration).

### Technical Notes

- **Status transition model:**
  ```
  proposed -> planned -> in_progress -> shipped
  proposed -> declined
  planned -> declined
  in_progress -> declined (rare, but allowed)
  Any status -> proposed (revert, admin only)
  ```
  For MVP, no strict transition enforcement — any status can be set to any other status by an admin. Transition validation can be added post-MVP.

- **Vote trend query:**
  ```sql
  SELECT DATE(created_at) as date, COUNT(*) as count
  FROM feature_vote_ballots
  WHERE feature_vote_id = $1
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ORDER BY date ASC;
  ```
  Fill in missing days with zero counts in the application layer for a continuous sparkline.

- **Rejection reason storage:** Added directly to the `feature_votes` table as a nullable `rejection_reason` text column. This is simpler than a separate audit log table for MVP. If audit history is needed later, a `feature_vote_status_log` table can be introduced.

- **Table component:** For MVP, use a custom table built with `shadcn/ui` primitives (`Table`, `TableHeader`, `TableRow`, `TableCell`). A full-featured data table library (like TanStack Table) can be introduced later if the admin needs become more complex.

- **Sparkline chart:** Avoid importing ECharts (Phase 2 dependency) for this small visualization. Use a lightweight approach:
  - Option A: Pure CSS bars (div elements with dynamic heights)
  - Option B: Inline SVG with `<rect>` elements
  - Option C: A tiny chart library like `react-sparklines` (evaluate bundle size)

### Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/db/schema.ts` | MODIFY | Add `rejectionReason` and `updatedAt` columns to `featureVotes` |
| `src/types/feature-vote.ts` | MODIFY | Add admin-specific types, status labels constant |
| `src/lib/utils/validation.ts` | MODIFY | Add `featureVoteStatusUpdateSchema` |
| `src/app/api/v1/feature-votes/[id]/route.ts` | CREATE | PATCH handler for status updates |
| `src/app/api/v1/feature-votes/[id]/trend/route.ts` | CREATE | GET handler for vote trend data |
| `src/app/admin/features/page.tsx` | CREATE | Admin feature management page (RSC) |
| `src/app/admin/features/loading.tsx` | CREATE | Admin page skeleton loader |
| `src/components/features/admin/FeatureManagementTable.tsx` | CREATE | Sortable/filterable data table |
| `src/components/features/admin/FeatureProposalDetail.tsx` | CREATE | Detail panel with status controls |
| `src/components/features/admin/FeatureVoteTrend.tsx` | CREATE | 30-day vote sparkline/bar chart |
| `src/components/features/admin/FeatureManagementTable.test.tsx` | CREATE | Table component tests |
| `src/components/features/admin/FeatureProposalDetail.test.tsx` | CREATE | Detail panel tests |

### Testing Notes

- **Unit tests (Vitest):**
  - Zod schema: Test `featureVoteStatusUpdateSchema` — valid status changes, declined without reason fails, declined with short reason fails, declined with valid reason passes, invalid status value fails
  - PATCH API: Mock Drizzle update, test 200 success, 403 forbidden (non-admin), 404 not found, 400 validation error, declined requires reason
  - GET trend API: Mock Drizzle query, test 30-day grouping, zero-fill for missing days, admin role check
  - Table component: Renders all columns, click sort toggles order, status filter reduces visible rows, search filters by title
  - Detail panel: Renders all fields, status dropdown triggers API call, rejection textarea appears for declined, disabled confirm until reason entered
  - Trend chart: Renders bars proportional to counts, handles empty data gracefully
- **Coverage target:** >80% for admin components and API routes

### UX Notes

- **Admin table design:** Clean data table with alternating row backgrounds. Sortable columns indicated by sort icon (arrow up/down). Active sort column highlighted.
- **Status filter bar:** Horizontal pill buttons above the table. Active filter highlighted with underline or filled background. Each pill shows the count of proposals in that status.
- **Detail panel:** Opens as a right-side slide-over panel (or modal). Shows full proposal details with a clear status change section at the bottom.
- **Status dropdown:** Uses `shadcn/ui` `Select`. When "Refuse" is selected, the rejection reason textarea slides in below with a smooth transition.
- **Vote trend chart:** Small, inline visualization (sparkline style). No axis labels needed — just visual trend. Hover/tooltip shows exact count for each day.
- **French admin strings:** "Gestion des fonctionnalites", "Filtrer par statut", "Rechercher", "Confirmer", "Raison du refus", "Statut mis a jour"

### Dependencies

- **Depends on:**
  - Story 7.1 (Feature Proposal Display & Voting) — for `feature_votes` schema, types, base API routes
  - Story 7.2 (Feature Proposal Submission) — proposals need to exist in the DB for admin to manage
  - Story 1.1 (Project Foundation) — for admin layout guard, auth, shadcn/ui components
  - `src/app/admin/layout.tsx` — existing admin role guard
  - `src/lib/auth/helpers.ts` — `requireAdmin()` helper
- **Blocks:**
  - None — this is a terminal story in Epic 7. Story 7.4 (Accessibility) applies to the public `/features` page, not the admin page.

### References

- PRD: FR31 (Administrators can view community feature voting results and current rankings)
- Architecture: Section 3.3 (API Routes — `/api/v1/feature-votes`), Section 3.4 (Authorization — admin role), Section 5.1 (Directory Tree — `src/app/admin/`)
- UX Design: Journey 4 (Admin — "She checks the community feature voting: the politician scorecard is leading with 2,300 votes"), Admin workflow patterns
- Epics: Epic 7 — Story 7.3 acceptance criteria

---

## Dev Agent Record

| Field | Value |
|-------|-------|
| **Story ID** | 7.3 |
| **Story Title** | Admin Feature Voting Results & Management |
| **Epic** | 7 — Community Feature Voting & Platform Democracy |
| **Status** | Not Started |
| **Estimated Complexity** | Medium-High |
| **Assigned Agent** | — |
| **Started At** | — |
| **Completed At** | — |
| **Commits** | — |
| **Blockers** | Depends on Stories 7.1 and 7.2 |
| **Notes** | Admin manages the democratic roadmap — viewing what Nicolas wants built and communicating progress via status changes. The status badges on the public `/features` page create a feedback loop: Nicolas sees that their votes lead to real development progress. Key admin statuses: proposed (community submitted), planned (admin acknowledged), in_progress (dev started), shipped (deployed), declined (with mandatory reason). |
