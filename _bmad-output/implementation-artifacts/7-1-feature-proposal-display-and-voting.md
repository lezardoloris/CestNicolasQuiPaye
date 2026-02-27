# Story 7.1: Feature Proposal Display & Voting

## Story

**As a** registered user (Nicolas),
**I want** to browse proposed platform features and vote on the ones I want built,
**So that** I can influence the development roadmap and feel ownership of the platform's direction.

**Epic:** 7 — Community Feature Voting & Platform Democracy
**FRs:** FR10 (Registered users can vote on proposed platform features to influence the development roadmap)
**NFRs:** NFR8 (Rate limiting), NFR17 (RGAA AA), NFR18 (Focus indicators), NFR20 (Form labels and errors)

---

## Acceptance Criteria (BDD)

### AC 7.1.1: Database Schema Creation

```gherkin
Given a Drizzle migration for the feature voting system
When the migrations run
Then a `feature_votes` table is created with columns:
  | Column      | Type                   | Constraints                          |
  |-------------|------------------------|--------------------------------------|
  | id          | uuid                   | PK, default random                   |
  | title       | varchar(200)           | NOT NULL                             |
  | description | text                   | NOT NULL                             |
  | category    | varchar(50)            | NOT NULL, default 'general'          |
  | status      | varchar(50)            | NOT NULL, default 'proposed'         |
  | author_id   | uuid                   | NOT NULL, FK -> users.id             |
  | vote_count  | integer                | NOT NULL, default 0                  |
  | created_at  | timestamp              | NOT NULL, default now()              |
And a `feature_vote_ballots` table is created with columns:
  | Column          | Type       | Constraints                          |
  |-----------------|------------|--------------------------------------|
  | id              | uuid       | PK, default random                   |
  | feature_vote_id | uuid       | NOT NULL, FK -> feature_votes.id     |
  | user_id         | uuid       | NOT NULL, FK -> users.id             |
  | vote_value      | integer    | NOT NULL, default 1 (values: +1/-1)  |
  | created_at      | timestamp  | NOT NULL, default now()              |
And a UNIQUE constraint exists on (feature_vote_id, user_id) in `feature_vote_ballots`
And indexes exist on feature_votes(vote_count DESC) and feature_vote_ballots(feature_vote_id)
```

### AC 7.1.2: Feature Proposals Page Display

```gherkin
Given a visitor navigates to `/features`
When the feature voting page renders
Then a list of feature proposals with `status IN ('proposed', 'planned', 'in_progress')` is displayed, sorted by `vote_count` descending (FR10)
And each proposal card shows:
  - Title (truncated to fit card)
  - Description (first 200 characters with ellipsis)
  - Current vote count (formatted: e.g., "1.2k")
  - Status badge (color-coded: proposed=gray, planned=blue, in_progress=amber, shipped=green, declined=red)
  - Category pill (e.g., "Données", "UX", "Social", "Technique")
  - Time since creation ("il y a 3 jours")
And a progress bar or rank indicator shows relative popularity among open proposals
And the page title is "Fonctionnalités — LIBERAL" with appropriate meta description
```

### AC 7.1.3: Upvote a Feature Proposal

```gherkin
Given a logged-in user views a feature proposal they have NOT voted on
When they click the "Voter" (upvote) button on the proposal card
Then a row is inserted into `feature_vote_ballots` with vote_value = +1
And `feature_votes.vote_count` is incremented by 1
And the button visually transitions to a "Voted" state with a checkmark icon
And the vote count on the card updates optimistically (instant UI feedback < 100ms)
And the API call fires in the background (POST /api/v1/feature-votes/[id]/vote)
And on API success, the server state syncs with TanStack Query
And on API failure, the UI rolls back to the previous state with a toast: "Erreur lors du vote. Reessayez."
```

### AC 7.1.4: Remove Vote (Toggle Off)

```gherkin
Given a logged-in user views a feature proposal they HAVE already voted on
When they click the "Vote" button (currently showing as "Voted" with checkmark)
Then the ballot row is deleted from `feature_vote_ballots`
And `feature_votes.vote_count` is decremented by 1
And the button reverts to the "Voter" (unvoted) state
And the vote count updates optimistically
```

### AC 7.1.5: Unauthenticated User Vote Attempt

```gherkin
Given a visitor (not logged in) views the `/features` page
When they click "Voter" on any feature proposal
Then the LazyAuthGate modal appears with message: "Connectez-vous pour voter sur les fonctionnalites"
And the modal provides a link to `/auth/login` and `/auth/register`
And after successful authentication, the original vote action is completed automatically
```

### AC 7.1.6: API Endpoint — List Feature Proposals

```gherkin
Given a client sends GET /api/v1/feature-votes
When the request is processed
Then the response contains a paginated list of feature proposals (cursor-based)
And each proposal includes: id, title, description, category, status, voteCount, authorDisplayName, createdAt
And the default sort is `vote_count DESC`
And optional query params are supported: ?sortBy=votes|date&status=proposed|planned|in_progress&category=general|data|ux|social|tech&cursor=...&limit=20
And the response follows the standard API envelope: { data: [...], meta: { cursor, hasMore } }
```

### AC 7.1.7: API Endpoint — Vote on Feature

```gherkin
Given an authenticated user sends POST /api/v1/feature-votes/[id]/vote
When the request body is { "value": 1 } or { "value": -1 }
Then if the user has not voted, a ballot is created and vote_count updated
And if the user has already voted with the same value, the ballot is deleted (toggle off) and vote_count decremented
And if the user has already voted with a different value, the ballot value is updated and vote_count adjusted (+2 or -2)
And the response returns the updated feature proposal with new vote_count
And rate limiting is enforced: 100 votes per hour per userId (same as submission votes)
```

---

## Tasks / Subtasks

### Task 1: Database Schema & Migration

- [ ] 1.1: Add `featureVotes` table definition to `src/lib/db/schema.ts` with columns: id (uuid PK), title (varchar 200), description (text), category (varchar 50, default 'general'), status (varchar 50, default 'proposed'), authorId (uuid FK->users), voteCount (integer default 0), createdAt (timestamp)
- [ ] 1.2: Add `featureVoteBallots` table definition to `src/lib/db/schema.ts` with columns: id (uuid PK), featureVoteId (uuid FK->featureVotes), userId (uuid FK->users), voteValue (integer default 1), createdAt (timestamp)
- [ ] 1.3: Generate Drizzle migration with `npx drizzle-kit generate`
- [ ] 1.4: Add SQL for UNIQUE index on `(feature_vote_id, user_id)` in the migration file
- [ ] 1.5: Add performance indexes: `idx_feature_votes_vote_count` (vote_count DESC), `idx_feature_vote_ballots_feature_id` (feature_vote_id)
- [ ] 1.6: Run migration against local dev database and verify tables exist

### Task 2: TypeScript Types

- [ ] 2.1: Create `src/types/feature-vote.ts` with types: `FeatureVote`, `FeatureVoteBallot`, `FeatureVoteWithAuthor`, `FeatureVoteListResponse`, `FeatureVoteSortBy`, `FeatureVoteStatus`, `FeatureVoteCategory`
- [ ] 2.2: Define `FeatureVoteCategory` enum: `'general' | 'data' | 'ux' | 'social' | 'tech'`
- [ ] 2.3: Define `FeatureVoteStatus` enum: `'proposed' | 'planned' | 'in_progress' | 'shipped' | 'declined'`

### Task 3: Zod Validation Schemas

- [ ] 3.1: Add feature vote Zod schemas to `src/lib/utils/validation.ts`:
  - `featureVoteQuerySchema`: sortBy (votes|date), status filter, category filter, cursor, limit
  - `featureVoteBallotSchema`: value (z.number().int().min(-1).max(1).refine(v => v !== 0))

### Task 4: API Route — GET /api/v1/feature-votes

- [ ] 4.1: Create `src/app/api/v1/feature-votes/route.ts` with GET handler
- [ ] 4.2: Implement cursor-based pagination (20 items per page)
- [ ] 4.3: Support sortBy query param (votes DESC default, date DESC)
- [ ] 4.4: Support status and category filter query params
- [ ] 4.5: Join with users table to include author display name
- [ ] 4.6: If authenticated, include `userVote` field (the current user's ballot value or null)
- [ ] 4.7: Wrap response in standard API envelope `{ data, meta: { cursor, hasMore } }`

### Task 5: API Route — POST /api/v1/feature-votes/[id]/vote

- [ ] 5.1: Create `src/app/api/v1/feature-votes/[id]/vote/route.ts` with POST handler
- [ ] 5.2: Require authentication (return 401 if not logged in)
- [ ] 5.3: Validate request body with `featureVoteBallotSchema`
- [ ] 5.4: Implement vote toggle logic:
  - No existing ballot -> insert ballot, increment vote_count
  - Existing ballot with same value -> delete ballot, decrement vote_count
  - Existing ballot with different value -> update ballot, adjust vote_count by +/-2
- [ ] 5.5: Use database transaction for atomic ballot + vote_count update
- [ ] 5.6: Apply rate limiting (100 votes/hour per userId) using `rateLimiters.vote`
- [ ] 5.7: Return updated feature vote with new vote_count

### Task 6: Feature Voting Page — `/features`

- [ ] 6.1: Create `src/app/features/page.tsx` as RSC (Server Component)
- [ ] 6.2: Fetch initial feature proposals server-side (sorted by vote_count DESC)
- [ ] 6.3: Create `src/app/features/loading.tsx` with skeleton loader
- [ ] 6.4: Create `src/app/features/error.tsx` with error boundary
- [ ] 6.5: Set page metadata: title "Fonctionnalites — LIBERAL", description about community feature voting

### Task 7: Feature Proposal Card Component

- [ ] 7.1: Create `src/components/features/feature-voting/FeatureProposalCard.tsx` (Client Component)
- [ ] 7.2: Display title, truncated description (200 chars), vote count, status badge, category pill, relative time
- [ ] 7.3: Implement status badge with color coding:
  - proposed: `bg-surface-secondary text-text-secondary` (gray)
  - planned: `bg-blue-100 text-blue-800` (blue)
  - in_progress: `bg-amber-100 text-amber-800` (amber)
  - shipped: `bg-green-100 text-green-800` (green)
  - declined: `bg-red-100 text-red-800` (red)
- [ ] 7.4: Implement category pill display
- [ ] 7.5: Add relative popularity progress bar (vote_count / max_vote_count * 100%)

### Task 8: Feature Vote Button Component

- [ ] 8.1: Create `src/components/features/feature-voting/FeatureVoteButton.tsx` (Client Component with 'use client')
- [ ] 8.2: Implement optimistic UI using TanStack Query `useMutation` with `onMutate` rollback (same pattern as submission VoteButton)
- [ ] 8.3: Two visual states: "Voter" (default) and "Vote" with checkmark (voted)
- [ ] 8.4: Use Motion (Framer Motion) for vote count animation (counter increment/decrement)
- [ ] 8.5: Integrate with `LazyAuthGate` for unauthenticated users
- [ ] 8.6: Minimum tap target 44x44px for mobile accessibility

### Task 9: Feature Proposal List Component

- [ ] 9.1: Create `src/components/features/feature-voting/FeatureProposalList.tsx` (Client Component)
- [ ] 9.2: Implement infinite scroll or paginated list using TanStack Query `useInfiniteQuery`
- [ ] 9.3: Add sort tabs: "Plus votes" (default), "Plus recents"
- [ ] 9.4: Add category filter pills: Toutes, Donnees, UX, Social, Technique
- [ ] 9.5: Show empty state when no proposals exist: "Aucune proposition pour le moment. Soyez le premier a proposer une fonctionnalite !"

### Task 10: Unit Tests

- [ ] 10.1: Write Vitest tests for `FeatureProposalCard` — renders title, description, vote count, status badge, category
- [ ] 10.2: Write Vitest tests for `FeatureVoteButton` — optimistic vote, toggle off, unauthenticated prompt
- [ ] 10.3: Write Vitest tests for GET `/api/v1/feature-votes` — pagination, sorting, filtering
- [ ] 10.4: Write Vitest tests for POST `/api/v1/feature-votes/[id]/vote` — create, toggle, rate limit
- [ ] 10.5: Write Vitest tests for Zod validation schemas

---

## Dev Notes

### Architecture Notes

- **Rendering strategy:** `/features` page is RSC (Server Component) for initial load with ISR (revalidate every 120 seconds). The `FeatureProposalList` and `FeatureVoteButton` are Client Components for interactive voting.
- **State management:** Feature vote state follows the same 3-layer pattern as submission votes:
  1. Server State (TanStack Query): feature proposals list, vote counts
  2. Client State (Zustand): optimistic vote cache for feature votes
  3. URL State: sort and filter params in query string
- **Optimistic UI pattern:** Same as submission voting — UI updates instantly on click, API call fires in background, rollback on failure with toast notification.
- **Database:** The `feature_votes` table in the architecture doc maps to our `featureVotes` schema. The architecture uses `featureVoteBallots` for the join table. We extend it with `category` and `voteValue` (+1/-1) to support upvote/downvote mechanics matching the submission voting pattern.

### Technical Notes

- **Drizzle ORM schema** (from architecture `src/lib/db/schema.ts`):

```typescript
// Feature Votes (community roadmap)
export const featureVotes = pgTable('feature_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 50 }).notNull().default('general'),
  status: varchar('status', { length: 50 }).notNull().default('proposed'),
  authorId: uuid('author_id').notNull().references(() => users.id),
  voteCount: integer('vote_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Feature Vote Ballots
export const featureVoteBallots = pgTable('feature_vote_ballots', {
  id: uuid('id').primaryKey().defaultRandom(),
  featureVoteId: uuid('feature_vote_id').notNull().references(() => featureVotes.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  voteValue: integer('vote_value').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
// UNIQUE constraint on (feature_vote_id, user_id) enforced via migration
```

- **API pattern** follows existing architecture convention:
  - Path: `/api/v1/feature-votes` (kebab-case, plural)
  - Response: `{ data: [...], meta: { cursor, hasMore } }` envelope
  - Errors: `ApiError` class with codes `UNAUTHORIZED`, `VALIDATION_ERROR`, `RATE_LIMITED`, `NOT_FOUND`
- **Vote rate limiting:** Reuses the existing `rateLimiters.vote` (100/hour per userId) from `src/lib/api/rate-limit.ts`
- **French UI strings:** "Voter", "Vote", "Fonctionnalites", "Plus votes", "Plus recents", "Aucune proposition"

### Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/db/schema.ts` | MODIFY | Add `featureVotes` and `featureVoteBallots` table definitions |
| `src/types/feature-vote.ts` | CREATE | TypeScript types for feature voting domain |
| `src/lib/utils/validation.ts` | MODIFY | Add Zod schemas for feature vote query and ballot |
| `src/app/api/v1/feature-votes/route.ts` | CREATE | GET list endpoint |
| `src/app/api/v1/feature-votes/[id]/vote/route.ts` | CREATE | POST vote endpoint |
| `src/app/features/page.tsx` | CREATE | Feature voting page (RSC) |
| `src/app/features/loading.tsx` | CREATE | Skeleton loader |
| `src/app/features/error.tsx` | CREATE | Error boundary |
| `src/components/features/feature-voting/FeatureProposalCard.tsx` | CREATE | Proposal card component |
| `src/components/features/feature-voting/FeatureVoteButton.tsx` | CREATE | Vote button with optimistic UI |
| `src/components/features/feature-voting/FeatureProposalList.tsx` | CREATE | Paginated/infinite list |
| `src/components/features/feature-voting/FeatureProposalCard.test.tsx` | CREATE | Card unit tests |
| `src/components/features/feature-voting/FeatureVoteButton.test.tsx` | CREATE | Vote button unit tests |
| `drizzle/migrations/XXXX_feature_votes.sql` | CREATE (generated) | Migration file |

### Testing Notes

- **Unit tests (Vitest):**
  - `FeatureProposalCard.test.tsx`: Renders all card fields, truncates long descriptions, shows correct status badge color, shows correct category pill
  - `FeatureVoteButton.test.tsx`: Renders "Voter" when unvoted, renders "Vote" with checkmark when voted, triggers optimistic update on click, rolls back on API error, shows LazyAuthGate for unauthenticated users
  - API route tests: Correct pagination, sort, filter behavior; vote create/toggle/delete logic; rate limiting returns 429; unauthenticated returns 401
- **Component tests:** Use `@testing-library/react` with `render`, `screen`, `fireEvent`/`userEvent`
- **API integration tests:** Mock Drizzle ORM queries, test request/response cycle
- **Coverage target:** >80% line coverage for new feature-voting components and API routes

### UX Notes

- **Card design:** Feature proposal cards follow the same design language as submission cards — rounded corners, surface background, chainsaw-red accent on vote count. Cards stack vertically in a single column on all viewports.
- **Vote animation:** Vote count animates with Motion (Framer Motion) — number slides up/down on change. Vote button has a subtle scale pulse on click (same feel as submission voting).
- **Status badges:** Use `shadcn/ui` `Badge` component with variant colors. Badges appear top-right of each card.
- **Category pills:** Rounded pills below the title, using subdued colors to differentiate without visual clutter.
- **Empty state:** Illustration or icon with encouraging text and a CTA to propose a feature.
- **Sort/filter tabs:** Use `shadcn/ui` `Tabs` for sort and inline pill buttons for category filters.
- **This is a meta-feature:** The feature voting page is itself a democratic tool — Nicolas decides what gets built next. The UX should reinforce this feeling of ownership and collective power.

### Dependencies

- **Depends on:**
  - Story 1.1 (Project Foundation — database, auth, base layout) — for users table FK, auth session, page layout
  - Story 1.2 (User Registration) — for authenticated user context
  - `src/components/features/auth/LazyAuthGate.tsx` — for unauthenticated vote prompt
  - `src/lib/api/rate-limit.ts` — for vote rate limiting
  - `src/lib/api/response.ts` — for standard API response wrapper
  - `src/lib/api/errors.ts` — for `ApiError` class
- **Blocks:**
  - Story 7.2 (Feature Proposal Submission) — needs the schema and page to exist
  - Story 7.3 (Admin Feature Management) — needs the schema and API to exist
  - Story 7.4 (Accessibility & Mobile) — needs the components to exist

### References

- PRD: FR10, FR35 (data status page uses same official data pattern)
- Architecture: Section 3.2 (Database Schema — `featureVotes`, `featureVoteBallots`), Section 3.3 (API Routes — `/api/v1/feature-votes`), Section 4.1 (Optimistic Voting Pattern), Section 5.1 (Directory Tree)
- UX Design: Experience Principle #2 (Democratic everything), Experience Principle #3 (Zero-friction democratic participation)
- Epics: Epic 7 — Story 7.1 acceptance criteria

---

## Dev Agent Record

| Field | Value |
|-------|-------|
| **Story ID** | 7.1 |
| **Story Title** | Feature Proposal Display & Voting |
| **Epic** | 7 — Community Feature Voting & Platform Democracy |
| **Status** | Not Started |
| **Estimated Complexity** | Medium-High |
| **Assigned Agent** | — |
| **Started At** | — |
| **Completed At** | — |
| **Commits** | — |
| **Blockers** | — |
| **Notes** | This is a meta-feature: the community votes on what the platform builds next. The voting mechanics (optimistic UI, toggle, rate limiting) mirror the submission voting pattern from Epic 3 but applied to feature proposals instead of waste items. |
