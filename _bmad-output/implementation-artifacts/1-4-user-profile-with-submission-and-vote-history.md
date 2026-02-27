# Story 1.4: User Profile with Submission & Vote History

Status: ready-for-dev

## Story

As a registered user (Nicolas),
I want to view my submission history and vote history on my profile page,
so that I can track my contributions and engagement with the platform.

## Acceptance Criteria (BDD)

**Given** a logged-in user navigates to `/profile`,
**When** the profile page renders,
**Then** the page displays the user's display name (or anonymous_id), email (partially masked as `n***@example.com`), member since date, total submissions count, and total votes cast count,
**And** the page has two tabs: "Mes signalements" (My Submissions) and "Mes votes" (My Votes).

**Given** the user selects the "Mes signalements" tab,
**When** the tab content loads,
**Then** a paginated list of the user's submissions is displayed (20 per page), each showing: title, submission date, current score, and status (pending/approved/rejected),
**And** a skeleton loading state is displayed while data is fetching,
**And** clicking a submission title navigates to `/submissions/{id}`.

**Given** the user selects the "Mes votes" tab,
**When** the tab content loads,
**Then** a paginated list of submissions the user has voted on is displayed (20 per page), each showing: title, the user's vote direction (upvote/downvote icon), and current score,
**And** the user's vote direction is visually indicated with `chainsaw-red` for upvote and `text-secondary` for downvote.

**Given** a visitor navigates to `/profile/{userId}`,
**When** the public profile page renders,
**Then** only the display name (or anonymous_id), member since date, and the "Mes signalements" tab (public submissions only) are visible,
**And** the "Mes votes" tab is not shown (votes are private).

## Tasks / Subtasks

### Phase 1: API Endpoints for Profile Data

- [ ] **Task 1.4.1: Create API endpoint for fetching user profile data** (AC: display name, email masked, member since, counts)
  - Create `src/app/api/v1/users/[userId]/route.ts`:
    ```typescript
    // GET /api/v1/users/[userId]
    // Returns: { displayName, anonymousId, memberSince, submissionCount, voteCount }
    // For own profile: includes maskedEmail
    // For public profile: omits email entirely
    ```
  - Query the `users` table by `id`
  - If requesting own profile (session user ID matches), include masked email via `maskEmail()` utility
  - If public profile, omit email field
  - Include aggregate counts:
    - `submissionCount`: from `users.submission_count` denormalized field (or COUNT query on submissions table)
    - `voteCount`: COUNT query on `votes` table WHERE `user_id = userId`
  - Use `apiSuccess()` response wrapper
  - Return 404 if user not found or deleted

- [ ] **Task 1.4.2: Create API endpoint for user's submissions** (AC: paginated submission list, 20 per page)
  - Create `src/app/api/v1/users/[userId]/submissions/route.ts`:
    ```typescript
    // GET /api/v1/users/[userId]/submissions
    // Query params: ?cursor={lastId}&limit=20
    // Returns: paginated list of submissions by this user
    ```
  - Query the `submissions` table WHERE `author_id = userId`
  - For public profiles: only return submissions with `status = 'published'` (or the architecture's equivalent approved status)
  - For own profile: return all submissions regardless of status (pending, approved, rejected)
  - Each submission returns: `id`, `title`, `slug`, `createdAt`, `upvoteCount`, `downvoteCount`, `score` (computed as upvoteCount - downvoteCount), `status`, `moderationStatus`
  - Cursor-based pagination: order by `created_at DESC`, use cursor for next page
  - Limit: 20 per page
  - Use `apiSuccess()` with pagination metadata (`cursor`, `hasMore`, `totalCount`)

- [ ] **Task 1.4.3: Create API endpoint for user's votes** (AC: paginated vote list, 20 per page)
  - Create `src/app/api/v1/users/[userId]/votes/route.ts`:
    ```typescript
    // GET /api/v1/users/[userId]/votes
    // Query params: ?cursor={lastId}&limit=20
    // Returns: paginated list of submissions user has voted on (PRIVATE - own profile only)
    ```
  - **Authorization:** Only accessible by the authenticated user whose `userId` matches the session. Return 403 for other users.
  - Query the `votes` table JOIN `submissions` WHERE `votes.user_id = userId`
  - Each item returns: `submissionId`, `submissionTitle`, `submissionSlug`, `voteType` ('up' or 'down'), `submissionScore` (upvoteCount - downvoteCount), `votedAt` (votes.created_at)
  - Cursor-based pagination: order by `votes.created_at DESC`
  - Limit: 20 per page
  - Use `apiSuccess()` with pagination metadata

### Phase 2: TypeScript Types

- [ ] **Task 1.4.4: Create TypeScript types for profile data** (AC: type safety)
  - Create/update `src/types/user.ts`:
    ```typescript
    export interface UserProfile {
      id: string;
      displayName: string | null;
      anonymousId: string;
      resolvedName: string; // displayName ?? anonymousId
      maskedEmail?: string; // Only for own profile
      memberSince: string; // ISO date string
      submissionCount: number;
      voteCount: number;
      avatarUrl: string | null;
      bio: string | null;
    }

    export interface UserSubmission {
      id: string;
      title: string;
      slug: string;
      createdAt: string;
      score: number;
      upvoteCount: number;
      downvoteCount: number;
      status: 'draft' | 'published' | 'hidden' | 'deleted';
      moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
    }

    export interface UserVote {
      submissionId: string;
      submissionTitle: string;
      submissionSlug: string;
      voteType: 'up' | 'down';
      submissionScore: number;
      votedAt: string;
    }
    ```

### Phase 3: Profile Page (Own Profile)

- [ ] **Task 1.4.5: Create the own-profile page at `/profile`** (AC: profile with tabs)
  - Create `src/app/profile/page.tsx`:
    - Server Component
    - Protect with `requireAuth()` -- redirect to `/auth/login` if unauthenticated
    - Fetch user profile data server-side from the database
    - Pass data to `<ProfileView />` client component
    - Metadata: `export const metadata = { title: 'Mon profil' };`

- [ ] **Task 1.4.6: Create `<ProfileHeader />` component** (AC: display name, email, member since, counts)
  - Create `src/components/features/profile/ProfileHeader.tsx`
  - Server Component (receives data as props)
  - Display:
    - User avatar: default to initials in a colored circle using shadcn/ui `<Avatar />`
    - Display name (or anonymous_id) in `font-display text-2xl text-text-primary`
    - Masked email (own profile only): `text-sm text-text-muted` -- e.g., "n***@example.com"
    - "Membre depuis {formatted date}" in `text-sm text-text-secondary` -- format with `date-fns` as "fevrier 2026"
    - Stats row: two badges/pills showing:
      - "{count} signalements" with a document icon
      - "{count} votes" with an arrow icon
  - Use `<Card />` from shadcn/ui as the container
  - All text meets 4.5:1 contrast ratio (NFR19)

- [ ] **Task 1.4.7: Create `<ProfileTabs />` component** (AC: two tabs)
  - Create `src/components/features/profile/ProfileTabs.tsx`
  - Mark as `'use client'`
  - Use shadcn/ui `<Tabs />` component
  - Two tabs:
    - "Mes signalements" (default active tab)
    - "Mes votes" (only visible on own profile)
  - Props:
    ```typescript
    interface ProfileTabsProps {
      userId: string;
      isOwnProfile: boolean;
    }
    ```
  - Each tab lazy-loads its content when selected (not pre-fetched)
  - Skeleton loading state while tab content loads

- [ ] **Task 1.4.8: Create `<SubmissionsList />` component** (AC: paginated submission list with skeleton)
  - Create `src/components/features/profile/SubmissionsList.tsx`
  - Mark as `'use client'`
  - Use TanStack Query `useInfiniteQuery` to fetch from `/api/v1/users/{userId}/submissions`
  - Display each submission as a row/card:
    - Title (clickable, links to `/s/{id}/{slug}`) in `text-text-primary font-medium`
    - Submission date formatted as "il y a 3 jours" or "27 fev. 2026" using `date-fns`
    - Score: `{upvoteCount - downvoteCount}` with up/down arrow icon
    - Status badge:
      - "En attente" (pending) -- `<Badge variant="outline" className="text-warning">`
      - "Approuve" (approved) -- `<Badge variant="outline" className="text-success">`
      - "Rejete" (rejected) -- `<Badge variant="outline" className="text-chainsaw-red">`
  - Skeleton loading: render 3 skeleton rows while fetching (use `<Skeleton />` from shadcn/ui)
  - Pagination: "Charger plus" button at bottom (or infinite scroll with IntersectionObserver)
  - Empty state: "Aucun signalement pour le moment. Soyez le premier Nicolas a utiliser la tronconneuse !" with a link to `/submit`

- [ ] **Task 1.4.9: Create `<VotesList />` component** (AC: paginated vote list with direction indicators)
  - Create `src/components/features/profile/VotesList.tsx`
  - Mark as `'use client'`
  - Use TanStack Query `useInfiniteQuery` to fetch from `/api/v1/users/{userId}/votes`
  - Display each vote as a row/card:
    - Submission title (clickable, links to `/s/{submissionId}/{submissionSlug}`) in `text-text-primary font-medium`
    - Vote direction icon:
      - Upvote: arrow-up icon in `text-chainsaw-red` (AC specifies chainsaw-red for upvote)
      - Downvote: arrow-down icon in `text-text-secondary` (AC specifies text-secondary for downvote)
    - Current submission score: `{score}` in `text-text-secondary`
    - Voted date formatted
  - Skeleton loading: render 3 skeleton rows while fetching
  - Pagination: "Charger plus" button
  - Empty state: "Vous n'avez pas encore vote. Parcourez le fil pour commencer !" with a link to `/feed/hot`

### Phase 4: Public Profile Page

- [ ] **Task 1.4.10: Create the public profile page at `/profile/[userId]`** (AC: public profile with limited info)
  - Create `src/app/profile/[userId]/page.tsx`:
    - Server Component
    - Fetch user profile data by `userId` parameter
    - If user not found or deleted (`deleted_at` is not null), return 404
    - If the `userId` matches the current session user, redirect to `/profile` (own profile)
    - Pass data to `<ProfileView />` with `isOwnProfile={false}`
    - Dynamic metadata:
      ```typescript
      export async function generateMetadata({ params }: { params: { userId: string } }) {
        const user = await getUserById(params.userId);
        return {
          title: user ? resolveDisplayName(user.displayName, user.anonymousId) : 'Profil introuvable',
        };
      }
      ```

  - Create `src/app/profile/[userId]/loading.tsx`:
    - Render profile skeleton (header skeleton + tab skeleton)

- [ ] **Task 1.4.11: Create `<ProfileView />` wrapper component** (AC: own vs public profile)
  - Create `src/components/features/profile/ProfileView.tsx`
  - Props:
    ```typescript
    interface ProfileViewProps {
      profile: UserProfile;
      isOwnProfile: boolean;
    }
    ```
  - Renders `<ProfileHeader />` with appropriate data
  - Renders `<ProfileTabs />` with `isOwnProfile` flag:
    - Own profile: shows both "Mes signalements" and "Mes votes" tabs
    - Public profile: shows only "Signalements" tab (no votes tab, votes are private per AC)
  - For public profiles, hides email entirely

### Phase 5: Data Fetching Helpers

- [ ] **Task 1.4.12: Create server-side data fetching functions** (AC: data loading)
  - Create `src/lib/api/users.ts`:
    ```typescript
    import { db } from '@/lib/db';
    import { users, submissions, votes } from '@/lib/db/schema';
    import { eq, count, desc } from 'drizzle-orm';

    export async function getUserById(userId: string) {
      return db.query.users.findFirst({
        where: eq(users.id, userId),
      });
    }

    export async function getUserSubmissions(userId: string, cursor?: string, limit = 20) {
      // Query submissions by author_id with cursor-based pagination
      // Return submissions ordered by created_at DESC
    }

    export async function getUserVoteCount(userId: string): Promise<number> {
      const result = await db
        .select({ count: count() })
        .from(votes)
        .where(eq(votes.userId, userId));
      return result[0]?.count ?? 0;
    }

    export async function getUserVotedSubmissions(userId: string, cursor?: string, limit = 20) {
      // Query votes JOIN submissions WHERE user_id = userId
      // Return submissions with vote direction, ordered by votes.created_at DESC
    }
    ```

### Phase 6: Navigation Integration

- [ ] **Task 1.4.13: Update navigation links for profile** (AC: accessible from nav)
  - Ensure `<DesktopNav />` user dropdown includes "Mon profil" linking to `/profile`
  - Ensure `<MobileTabBar />` Profile tab navigates to `/profile` when authenticated
  - Ensure the profile settings link (`/profile/settings`) is accessible from the profile page via a gear icon or "Parametres" link

### Phase 7: Testing

- [ ] **Task 1.4.14: Write unit tests for data fetching functions** (AC: data queries)
  - Create `src/lib/api/__tests__/users.test.ts`:
    - Test `getUserById` returns user data
    - Test `getUserById` returns null for non-existent user
    - Test `getUserVoteCount` returns correct count
    - Note: These tests require a test database setup. For unit tests, mock the database. For integration tests, use the test PostgreSQL instance.

- [ ] **Task 1.4.15: Write component tests for ProfileHeader** (AC: rendering profile info)
  - Create `src/components/features/profile/__tests__/ProfileHeader.test.tsx`:
    - Test displays resolved display name
    - Test displays anonymous_id when display_name is null
    - Test displays masked email for own profile
    - Test hides email for public profile
    - Test displays member since date
    - Test displays submission and vote counts

- [ ] **Task 1.4.16: Write component tests for ProfileTabs** (AC: tab rendering)
  - Create `src/components/features/profile/__tests__/ProfileTabs.test.tsx`:
    - Test renders both tabs for own profile
    - Test renders only submissions tab for public profile
    - Test "Mes votes" tab is hidden on public profile

- [ ] **Task 1.4.17: Write component tests for SubmissionsList** (AC: submission rendering)
  - Create `src/components/features/profile/__tests__/SubmissionsList.test.tsx`:
    - Test renders submission titles as links
    - Test renders status badges with correct colors
    - Test renders skeleton during loading
    - Test renders empty state message when no submissions

- [ ] **Task 1.4.18: Write component tests for VotesList** (AC: vote rendering with direction)
  - Create `src/components/features/profile/__tests__/VotesList.test.tsx`:
    - Test renders vote direction icons with correct colors
    - Test upvote icon uses `chainsaw-red` color
    - Test downvote icon uses `text-secondary` color
    - Test renders skeleton during loading
    - Test renders empty state message when no votes

- [ ] **Task 1.4.19: Verify build and all tests pass** (AC: all tests pass)
  - Run `npm run build` -- must succeed
  - Run `npm run lint` -- must pass
  - Run `npm run test` -- all new tests must pass

## Dev Notes

### Architecture & Patterns

- **Server Components for initial data loading:** The profile page is a Server Component that fetches user data from the database and passes it to client components as props. This provides fast initial load and good SEO.
- **Client Components for interactive tabs:** `<ProfileTabs />`, `<SubmissionsList />`, and `<VotesList />` are Client Components because they need `useInfiniteQuery` for pagination and `useState` for tab switching.
- **TanStack Query for data fetching:** Paginated lists use `useInfiniteQuery` for automatic caching, deduplication, and background refetching.
- **Cursor-based pagination:** All paginated endpoints use cursor-based pagination (not offset-based) to avoid skip-scan performance issues as specified in the architecture.
- **ISR for public profiles:** Public profile pages (`/profile/[userId]`) use ISR with 600-second revalidation as specified in the architecture.
- **API response envelope:** All API endpoints return `{ data, error, meta }` format using the `apiSuccess()` and `apiError()` utilities created in Story 1.2.

### Technical Requirements

| Library | Version | Purpose |
|---|---|---|
| @tanstack/react-query | 5.90.x | Data fetching and caching for paginated lists |
| shadcn/ui Tabs | 2026-02 | Tab component for submissions/votes |
| shadcn/ui Avatar | 2026-02 | User avatar display |
| shadcn/ui Badge | 2026-02 | Status badges for submissions |
| shadcn/ui Card | 2026-02 | Profile header card |
| shadcn/ui Skeleton | 2026-02 | Loading state placeholders |
| date-fns | latest | Date formatting (relative and absolute) |

### Database Queries

**Profile header query:**
```sql
SELECT id, email, display_name, anonymous_id, avatar_url, bio, submission_count, karma_score, created_at
FROM users
WHERE id = $1 AND deleted_at IS NULL;
```

**Submission count (if not using denormalized field):**
```sql
SELECT COUNT(*) FROM submissions WHERE author_id = $1;
```

**Vote count:**
```sql
SELECT COUNT(*) FROM votes WHERE user_id = $1;
```

**User's submissions (cursor-paginated):**
```sql
SELECT id, title, slug, created_at, upvote_count, downvote_count, status, moderation_status
FROM submissions
WHERE author_id = $1
  AND ($2::uuid IS NULL OR created_at < (SELECT created_at FROM submissions WHERE id = $2))
ORDER BY created_at DESC
LIMIT 20;
```

**User's voted submissions (cursor-paginated, own profile only):**
```sql
SELECT v.id as vote_id, v.vote_type, v.created_at as voted_at,
       s.id as submission_id, s.title, s.slug, s.upvote_count, s.downvote_count
FROM votes v
JOIN submissions s ON v.submission_id = s.id
WHERE v.user_id = $1
  AND ($2::uuid IS NULL OR v.created_at < (SELECT created_at FROM votes WHERE id = $2))
ORDER BY v.created_at DESC
LIMIT 20;
```

### File Structure

Files created or modified by this story:

```
src/
├── app/
│   ├── profile/
│   │   ├── page.tsx                                  # NEW - Own profile page
│   │   ├── [userId]/
│   │   │   ├── page.tsx                              # NEW - Public profile page
│   │   │   └── loading.tsx                           # NEW - Profile skeleton
│   │   └── settings/
│   │       └── page.tsx                              # MODIFIED - Add link from profile
│   └── api/
│       └── v1/
│           └── users/
│               └── [userId]/
│                   ├── route.ts                      # NEW - User profile endpoint
│                   ├── submissions/
│                   │   └── route.ts                  # NEW - User submissions endpoint
│                   └── votes/
│                       └── route.ts                  # NEW - User votes endpoint (private)
├── components/
│   └── features/
│       └── profile/
│           ├── ProfileView.tsx                       # NEW - Profile wrapper
│           ├── ProfileHeader.tsx                     # NEW - Profile info display
│           ├── ProfileTabs.tsx                       # NEW - Tab navigation
│           ├── SubmissionsList.tsx                   # NEW - Submissions tab content
│           ├── VotesList.tsx                         # NEW - Votes tab content
│           └── __tests__/
│               ├── ProfileHeader.test.tsx            # NEW
│               ├── ProfileTabs.test.tsx              # NEW
│               ├── SubmissionsList.test.tsx           # NEW
│               └── VotesList.test.tsx                # NEW
├── lib/
│   └── api/
│       ├── users.ts                                  # NEW - Server-side user queries
│       └── __tests__/
│           └── users.test.ts                         # NEW
├── types/
│   └── user.ts                                       # NEW - User TypeScript types
```

### Testing Requirements

- **Unit tests (Vitest):**
  - `users.test.ts`: Data fetching functions -- 3+ test cases (mocked DB)
  - `ProfileHeader.test.tsx`: 6+ test cases covering own/public profile, display name, email masking, date, counts
  - `ProfileTabs.test.tsx`: 3+ test cases covering tab visibility for own vs public profile
  - `SubmissionsList.test.tsx`: 4+ test cases for rendering, status badges, skeleton, empty state
  - `VotesList.test.tsx`: 5+ test cases for rendering, vote direction colors, skeleton, empty state
- **Coverage target:** >70% on components, >85% on API routes
- **Manual testing checklist:**
  - [ ] Own profile page shows display name and masked email
  - [ ] Own profile shows both tabs (submissions and votes)
  - [ ] Submissions list paginates correctly with "Charger plus" button
  - [ ] Clicking submission title navigates to submission detail page
  - [ ] Status badges show correct colors (pending=yellow, approved=green, rejected=red)
  - [ ] Votes list shows upvote in chainsaw-red and downvote in text-secondary
  - [ ] Public profile page shows only display name, member since, and submissions tab
  - [ ] Public profile hides votes tab entirely
  - [ ] Public profile hides email
  - [ ] Non-existent user shows 404 page
  - [ ] Skeleton loading appears while data is fetching

### UX/Design Notes

- **Profile page layout:**
  - Mobile: Single column, profile header on top, tabs below
  - Desktop: Same single column but within `max-w-3xl mx-auto` container
  - Profile header: `<Card>` with avatar, name, stats in a row
- **Tab styling:** Use shadcn/ui Tabs with dark theme. Active tab has `border-b-2 border-chainsaw-red text-text-primary`, inactive has `text-text-secondary`
- **Submission list item:** Card-like row with left-aligned title, right-aligned score and status. Hover effect `hover:bg-surface-elevated` on desktop.
- **Vote direction indicators:**
  - Upvote: arrow-up icon (Lucide `ChevronUp` or `ArrowUp`) colored `text-chainsaw-red`
  - Downvote: arrow-down icon (Lucide `ChevronDown` or `ArrowDown`) colored `text-text-secondary`
- **Empty states:** Illustrated with a small chainsaw icon and actionable text linking to relevant pages
- **Skeleton loading:** Match the layout dimensions of actual content -- skeleton cards for submission rows, skeleton text for header
- **Accessibility:**
  - Tabs use `role="tablist"`, `role="tab"`, `role="tabpanel"` (handled by shadcn/ui Tabs)
  - All links have descriptive text
  - Status badges have `aria-label` describing the status
  - Loading states announce via `aria-live="polite"`

### Dependencies

- **Depends on:** Story 1.1 (Project Scaffold), Story 1.2 (Registration & Login), Story 1.3 (Display Name Selection) -- requires user accounts, authentication, display name resolution, and the database schema.
- **Depended on by:** Story 1.5 (Account Deletion) -- the profile page is where account deletion is accessed. Also depended on by Epic 2 stories that add submissions to the profile.
- **Note:** The submissions and votes tables do not exist yet at this point. The API endpoints and queries reference these tables, but they will be created in Epic 2 (Story 2.1 for submissions) and Epic 3 (Story 3.1 for votes). For Story 1.4, the profile page should gracefully handle empty states (no submissions, no votes) and the API queries should not error on non-existent tables. Options:
  1. Create the `submissions` and `votes` table schemas in this story as forward declarations (empty tables)
  2. Conditionally skip queries and return empty results until the tables exist
  - **Recommended approach:** Create minimal `submissions` and `votes` table definitions in `schema.ts` as part of this story to enable the queries. These will be expanded in later stories.

### References

- [Source: epics.md#Story 1.4] -- Acceptance criteria for profile page
- [Source: architecture.md#Section 3.1] -- Database schema (users, submissions, votes tables)
- [Source: architecture.md#Section 3.3] -- API endpoint map (/api/v1/users/[username])
- [Source: architecture.md#Section 3.4] -- Frontend architecture, TanStack Query, ISR revalidation
- [Source: architecture.md#Section 4.4] -- Skeleton loading patterns
- [Source: architecture.md#Section 5.1] -- Directory structure (profile pages)
- [Source: prd.md#FR24] -- Registered users can view submission and vote history
- [Source: ux-design-specification.md#Component Strategy] -- Tabs for profile
- [Source: ux-design-specification.md#Loading States] -- Skeleton UI patterns
- [Source: ux-design-specification.md#Empty States] -- Empty state messaging patterns

## Dev Agent Record

### Agent Model Used
(To be filled by dev agent)

### Completion Notes List
(To be filled during implementation)

### Change Log
(To be filled during implementation)

### File List
(To be filled during implementation)
