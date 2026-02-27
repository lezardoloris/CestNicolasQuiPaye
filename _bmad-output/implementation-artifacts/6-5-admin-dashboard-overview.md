# Story 6.5: Admin Dashboard Overview

Status: ready-for-dev

## Story

As an administrator,
I want a dashboard overview of platform activity and moderation metrics,
so that I can monitor platform health and prioritize my moderation efforts.

## Acceptance Criteria

1. **Given** an administrator navigates to `/admin`, **When** the admin dashboard renders, **Then** the following summary cards are displayed:
   - "En attente de moderation" with the count of `moderation_status = 'pending'` submissions
   - "Signalements" with the total count of unresolved flags (flags on submissions where `moderation_status` is not `'removed'`)
   - "Utilisateurs actifs" with the count of users who voted or submitted in the last 7 days
   - "Signalements publies" with the total count of `moderation_status = 'approved'` submissions
   - "Tweets diffuses" with the count of `broadcasts.status = 'sent'` broadcasts this month

2. **Given** the dashboard is rendered, **When** the administrator views the activity feed section, **Then** a chronological list of the 20 most recent moderation actions is displayed, each showing: action type (approve/reject/remove with icon), submission title (truncated to 60 chars), admin name, and relative timestamp (e.g., "il y a 2 heures").

3. **Given** the dashboard is rendered, **When** the administrator views the quick links section, **Then** links are provided to: Moderation Queue (`/admin/moderation`), Flagged Content (`/admin/flags`), Broadcast Tool (`/admin/broadcast`), Feature Voting Results (`/admin/features`), and Data Status (`/data-status`). Each link shows the relevant count badge (pending count, flags count, etc.).

4. **Given** a non-admin user (including moderator) attempts to access `/admin`, **When** the server checks authorization, **Then** a `403 Forbidden` response is returned and the user is redirected to `/feed/hot`. (The dashboard home is admin-only; moderators access `/admin/moderation` directly.)

5. **Given** the dashboard loads, **When** the data is being fetched, **Then** skeleton loaders are displayed for each metric card and the activity feed to prevent layout shift and provide visual feedback.

## Tasks / Subtasks

- [ ] Task 1: Create admin dashboard data API endpoint (AC: #1, #2)
  - [ ] 1.1: Create `GET /api/v1/admin/dashboard` route at `src/app/api/v1/admin/dashboard/route.ts`. Admin-only access. Returns JSON with:
    - `pendingCount`: `SELECT COUNT(*) FROM submissions WHERE moderation_status = 'pending'`
    - `flagsCount`: `SELECT COUNT(DISTINCT submission_id) FROM flags f JOIN submissions s ON f.submission_id = s.id WHERE s.moderation_status != 'removed'`
    - `activeUsersCount`: count of users with at least one vote or submission in last 7 days (union of distinct user IDs from `votes` and `submissions` tables where `created_at > NOW() - INTERVAL '7 days'`)
    - `approvedCount`: `SELECT COUNT(*) FROM submissions WHERE moderation_status = 'approved'`
    - `broadcastsThisMonth`: `SELECT COUNT(*) FROM broadcasts WHERE status = 'sent' AND sent_at >= DATE_TRUNC('month', NOW())`
    - `recentActions`: 20 most recent rows from `moderation_actions` joined with `submissions` (title) and `users` (admin name), ordered by `created_at DESC`

  - [ ] 1.2: Verify admin-only access:

```typescript
const session = await auth();
if (!session?.user || session.user.role !== 'admin') {
  return apiError('FORBIDDEN', 'Admin access required', 403);
}
```

  - [ ] 1.3: Apply rate limiting via `rateLimiters.api`

- [ ] Task 2: Create admin dashboard page (AC: #1, #2, #3, #5)
  - [ ] 2.1: Create or update `src/app/(app)/admin/page.tsx` -- Server Component that renders the admin dashboard. Fetches initial data server-side for fast first paint. Renders `AdminDashboard` client component
  - [ ] 2.2: Create `src/components/features/admin/AdminDashboard.tsx` -- Client Component orchestrating the dashboard layout. Uses TanStack Query to fetch `GET /api/v1/admin/dashboard` with auto-refresh (refetchInterval: 60000 -- refresh every 60 seconds). Three sections: Metric Cards, Quick Links, Recent Activity

- [ ] Task 3: Create dashboard metric cards (AC: #1, #5)
  - [ ] 3.1: Create `src/components/features/admin/DashboardMetricCard.tsx` -- Reusable card component with: icon, label (French), value (large number), optional trend indicator, loading skeleton state. Uses shadcn/ui `Card` component
  - [ ] 3.2: Render 5 metric cards in a responsive grid (2 columns mobile, 3 columns tablet, 5 columns desktop):
    - Pending moderation: clock icon, amber accent
    - Flags: flag icon, red accent
    - Active users: users icon, blue accent
    - Published submissions: check-circle icon, green accent
    - Broadcasts this month: megaphone/twitter icon, brand blue accent

- [ ] Task 4: Create recent activity feed (AC: #2)
  - [ ] 4.1: Create `src/components/features/admin/RecentActivityFeed.tsx` -- Client Component displaying list of 20 most recent moderation actions. Each item shows:
    - Action icon: check (approve, green), x (reject, red), trash (remove, red), edit (request_edit, amber)
    - Submission title (truncated to 60 chars with ellipsis)
    - Admin display name
    - Relative timestamp using `Intl.RelativeTimeFormat('fr')` or a helper (e.g., "il y a 2 heures", "il y a 3 jours")
  - [ ] 4.2: Add loading skeleton state for activity feed (5 skeleton rows with animated pulse)

- [ ] Task 5: Create quick links section (AC: #3)
  - [ ] 5.1: Create `src/components/features/admin/QuickLinksPanel.tsx` -- Component with navigation cards linking to admin sections:
    - "File de moderation" -> `/admin/moderation` with pending count badge
    - "Contenu signale" -> `/admin/flags` with flags count badge
    - "Outil de diffusion" -> `/admin/broadcast` with broadcasts count
    - "Vote de fonctionnalites" -> `/admin/features`
    - "Statut des donnees" -> `/data-status`
  - [ ] 5.2: Each link card uses shadcn/ui `Card` with hover effect, icon, label, and optional count `Badge`

- [ ] Task 6: Write tests (AC: all)
  - [ ] 6.1: Unit test `src/components/features/admin/AdminDashboard.test.tsx` -- renders all three sections (metrics, quick links, activity), handles loading state with skeletons
  - [ ] 6.2: Unit test `src/components/features/admin/DashboardMetricCard.test.tsx` -- renders label, value, icon, loading skeleton
  - [ ] 6.3: Unit test `src/components/features/admin/RecentActivityFeed.test.tsx` -- renders action items with correct icons, truncates titles, shows relative timestamps
  - [ ] 6.4: Unit test `src/components/features/admin/QuickLinksPanel.test.tsx` -- renders all 5 links with correct hrefs, shows count badges
  - [ ] 6.5: API route test `__tests__/api/admin-dashboard.test.ts` -- tests GET returns all metrics with correct shapes, tests 403 for non-admin, tests 403 for moderator (dashboard is admin-only)

## Dev Notes

### Architecture Patterns

- **Dashboard is Admin-Only**: The `/admin` dashboard home page is restricted to `admin` role. Moderators do NOT have access to the dashboard overview -- they access `/admin/moderation` directly via the middleware exception.

- **Server-Side Initial Load + Client Hydration**: The dashboard page is a Server Component that fetches initial data for fast first paint, then hydrates with a Client Component that uses TanStack Query for auto-refresh.

```typescript
// src/app/(app)/admin/page.tsx pattern
import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/features/admin/AdminDashboard';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/feed/hot');
  }

  // Optionally fetch initial data server-side for fast first paint
  // const initialData = await fetchDashboardData();

  return <AdminDashboard />;
}
```

- **TanStack Query Auto-Refresh**: Dashboard data should auto-refresh every 60 seconds so the admin sees near-real-time metrics without manual page refresh.

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['admin', 'dashboard'],
  queryFn: () => fetch('/api/v1/admin/dashboard').then(r => r.json()),
  refetchInterval: 60_000, // 60 seconds
});
```

- **Responsive Grid**: Metric cards use CSS Grid with responsive breakpoints:
  - Mobile (< 640px): 2 columns
  - Tablet (640-1024px): 3 columns
  - Desktop (> 1024px): 5 columns (one row)

### Tech Stack

| Tech | Version | Usage in This Story |
|---|---|---|
| Next.js | 16.1.6 | App Router, Server Components, API routes |
| Auth.js v5 | 5.x | `auth()` for admin role check |
| Drizzle ORM | 0.45.1 | Aggregate queries for metrics |
| TanStack Query | 5.90.x | Data fetching with auto-refresh |
| Vitest | 4.0.18 | Unit + API route tests |
| shadcn/ui | 2026-02 | Card, Badge, Skeleton components |
| Tailwind CSS | 4.2.0 | Responsive grid, styling |
| Lucide React | (bundled) | Icons for metrics and actions |

### Dashboard Data Queries

```typescript
// Efficient single-query approach using CTEs or parallel queries
// Option 1: Parallel queries with Promise.all
const [
  pendingCount,
  flagsCount,
  activeUsersCount,
  approvedCount,
  broadcastsThisMonth,
  recentActions,
] = await Promise.all([
  db.select({ count: sql<number>`count(*)` })
    .from(submissions)
    .where(eq(submissions.moderationStatus, 'pending')),

  db.select({ count: sql<number>`count(distinct ${flags.submissionId})` })
    .from(flags)
    .innerJoin(submissions, eq(flags.submissionId, submissions.id))
    .where(ne(submissions.moderationStatus, 'removed')),

  db.select({ count: sql<number>`count(distinct user_id)` })
    .from(sql`(
      SELECT user_id FROM votes WHERE created_at > NOW() - INTERVAL '7 days'
      UNION
      SELECT author_id AS user_id FROM submissions WHERE created_at > NOW() - INTERVAL '7 days'
    ) active_users`),

  db.select({ count: sql<number>`count(*)` })
    .from(submissions)
    .where(eq(submissions.moderationStatus, 'approved')),

  db.select({ count: sql<number>`count(*)` })
    .from(broadcasts)
    .where(and(
      eq(broadcasts.status, 'sent'),
      gte(broadcasts.sentAt, sql`date_trunc('month', now())`)
    )),

  db.select({
    action: moderationActions.action,
    reason: moderationActions.reason,
    createdAt: moderationActions.createdAt,
    submissionTitle: submissions.title,
    adminName: users.username,
  })
    .from(moderationActions)
    .innerJoin(submissions, eq(moderationActions.submissionId, submissions.id))
    .innerJoin(users, eq(moderationActions.adminUserId, users.id))
    .orderBy(desc(moderationActions.createdAt))
    .limit(20),
]);
```

### Relative Time Formatting

```typescript
// src/lib/utils/format.ts -- add relative time formatter
export function formatRelativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (Math.abs(diffMin) < 1) return rtf.format(diffSec, 'second');
  if (Math.abs(diffHour) < 1) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffDay) < 1) return rtf.format(diffHour, 'hour');
  return rtf.format(diffDay, 'day');
}
```

### Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `src/app/api/v1/admin/dashboard/route.ts` | CREATE | Dashboard metrics API |
| `src/app/(app)/admin/page.tsx` | CREATE/MODIFY | Admin dashboard page |
| `src/components/features/admin/AdminDashboard.tsx` | CREATE | Dashboard layout component |
| `src/components/features/admin/DashboardMetricCard.tsx` | CREATE | Reusable metric card |
| `src/components/features/admin/RecentActivityFeed.tsx` | CREATE | Activity log component |
| `src/components/features/admin/QuickLinksPanel.tsx` | CREATE | Navigation links panel |
| `src/lib/utils/format.ts` | MODIFY | Add `formatRelativeTime` helper |
| `src/components/features/admin/AdminDashboard.test.tsx` | CREATE | Dashboard tests |
| `src/components/features/admin/DashboardMetricCard.test.tsx` | CREATE | Metric card tests |
| `src/components/features/admin/RecentActivityFeed.test.tsx` | CREATE | Activity feed tests |
| `src/components/features/admin/QuickLinksPanel.test.tsx` | CREATE | Quick links tests |
| `__tests__/api/admin-dashboard.test.ts` | CREATE | API route tests |

### Testing Strategy

- **Unit tests** (Vitest + Testing Library): All dashboard components render correctly with data and in loading/skeleton states. Metric cards show correct icons and values. Activity feed truncates titles and formats relative times. Quick links render correct URLs and badges.
- **API route tests** (Vitest): Mock `auth()` for admin/moderator/user roles. Test 403 for non-admin (including moderator). Test response shape includes all required metrics. Test recent actions include correct joined data.
- **Coverage targets**: Components > 70%, API routes > 85%

### UX Notes

- Dashboard follows a clean, scannable layout: metrics row at top, then split into activity feed (left 2/3) and quick links (right 1/3) on desktop
- Metric cards use subtle background colors matching their accent (not full colored -- just a tinted border or icon color)
- Skeleton loaders use shadcn/ui `Skeleton` component with pulse animation
- Activity feed items use small icons with color coding: green (approve), red (reject/remove), amber (request_edit)
- Relative timestamps update on client via TanStack Query auto-refresh
- Quick links panel uses card hover effect with subtle lift/shadow
- No charts or graphs for MVP -- just counts and list. Data visualization can be added in future iterations
- French text throughout: all labels, timestamps, and status messages in French

### Dependencies

- **Requires**: Story 6.1 (`moderation_actions` table, admin layout)
- **Requires**: Story 6.2 (removal data for removed count)
- **Requires**: Story 6.3 (`flags` table for flags count)
- **Requires**: Story 6.4 (`broadcasts` table for broadcast count)
- **Requires**: Epic 2 (submissions table with moderation_status)
- Story 6.5 is the final story in Epic 6 and depends on all prior Epic 6 stories being at least schema-complete

### Project Structure Notes

- Dashboard page at `src/app/(app)/admin/page.tsx` (the admin layout index page)
- All dashboard components under `src/components/features/admin/`
- API endpoint at `src/app/api/v1/admin/dashboard/route.ts` (new admin API namespace)
- Relative time formatter added to existing `src/lib/utils/format.ts` (reusable)

### References

- [Source: epics.md#Story 6.5 -- Full AC and story statement]
- [Source: architecture.md#Schema Design -- All tables referenced in metric queries]
- [Source: architecture.md#Role-Based Access Control -- admin-only for /admin dashboard]
- [Source: architecture.md#Section 5 -- /admin/page.tsx in file tree]
- [Source: architecture.md#Frontend Architecture -- Component rendering strategy table]
- [Source: architecture.md#Testing Patterns -- Vitest, coverage targets]
- [Source: prd.md#FR26-FR31 -- All moderation/admin functional requirements]
- [Source: ux-design-specification.md#Journey 4 -- Admin workflow overview]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
