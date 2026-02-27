# Story 3.2: Submission Detail Page

## Story

**As a** visitor (Nicolas),
**I want** to view a detailed page for any submission with its full description, Cost to Nicolas breakdown, and source link,
**So that** I can fully understand the fiscal waste and verify the claim.

**FRs Covered:** FR3, FR5
**NFRs Integrated:** NFR1, NFR17, NFR21, NFR22

---

## Acceptance Criteria (BDD)

### AC 3.2.1: Submission Detail Rendering

```gherkin
Given a visitor navigates to `/submissions/{id}`
When the submission detail page renders
Then the page displays:
  - Title as `<h1>` (FR3)
  - Full description text
  - Estimated cost formatted as "XX XXX XXX EUR" with French number formatting
  - Source URL displayed as a prominent clickable button with text "Verifier la source" and an external-link icon (FR5)
  - Vote score with upvote and downvote buttons (showing current count)
  - Author display name and relative submission date
  - Submission status badge (if pending/rejected, visible only to the author)
```

### AC 3.2.2: Cost to Nicolas Display (Cached)

```gherkin
Given the submission has Cost to Nicolas results cached in the `cost_to_nicolas_results` JSONB column
When the detail page renders
Then a "Cout pour Nicolas" section is displayed with:
  - Cost per citizen, formatted in EUR with 2 decimal places
  - Cost per taxpayer, formatted in EUR with 2 decimal places
  - Cost per household, formatted in EUR with 2 decimal places
  - Days of work equivalent, formatted as "X,X jours de travail"
  - At least one concrete equivalence (e.g., "Soit X repas de cantine scolaire")
  - Each value has a "Verifier" link pointing to `/data-status` (NFR21)
```

### AC 3.2.3: Cost to Nicolas Lazy Calculation

```gherkin
Given the submission does NOT have cached Cost to Nicolas results
When the detail page renders
Then the Cost to Nicolas section shows a loading spinner
And a background request is made to the FastAPI `/api/cost-to-nicolas` endpoint
And once results return, they are displayed and cached on the submission record
```

### AC 3.2.4: 404 Not Found Handling

```gherkin
Given a visitor navigates to `/submissions/{id}` with an invalid or nonexistent ID
When the server processes the request
Then a 404 page is returned with the message "Signalement introuvable"
```

---

## Tasks / Subtasks

### Task 1: Detail Route & RSC Page Setup
- [ ] 1.1 Create detail route at `src/app/s/[id]/[slug]/page.tsx` as a React Server Component [AC 3.2.1]
- [ ] 1.2 Configure ISR revalidation of 300 seconds for submission detail pages [AC 3.2.1]
- [ ] 1.3 Create `src/app/s/[id]/[slug]/loading.tsx` with detail skeleton (text blocks, number placeholders) [AC 3.2.1]
- [ ] 1.4 Create `src/app/s/[id]/[slug]/error.tsx` error boundary [AC 3.2.1]
- [ ] 1.5 Create `src/app/s/[id]/[slug]/not-found.tsx` with "Signalement introuvable" message [AC 3.2.4]
- [ ] 1.6 Implement redirect from `/submissions/{id}` to `/s/{id}/{slug}` for backwards compatibility [AC 3.2.1]
- [ ] 1.7 Implement `generateMetadata()` for Open Graph and Twitter Card tags (delegates to Story 4.3 for full implementation) [AC 3.2.1]

### Task 2: Submission Data Fetching
- [ ] 2.1 Create `src/lib/api/submission-detail.ts` with `getSubmissionById()` using Drizzle ORM [AC 3.2.1]
- [ ] 2.2 Query joins submission with cost calculation data (left join on `cost_calculations` table) [AC 3.2.2]
- [ ] 2.3 Include author info (display_name or anonymous_id) via join on users table [AC 3.2.1]
- [ ] 2.4 Include user's current vote direction if authenticated (left join on votes table for current user) [AC 3.2.1]
- [ ] 2.5 Return `null` for nonexistent submissions; call `notFound()` in page component [AC 3.2.4]
- [ ] 2.6 Validate submission ID is a valid UUID format before querying [AC 3.2.4]

### Task 3: SubmissionDetail Component
- [ ] 3.1 Create `src/components/features/submissions/SubmissionDetail.tsx` [AC 3.2.1]
- [ ] 3.2 Render title as `<h1>` with `font-display text-2xl md:text-3xl text-text-primary` [AC 3.2.1]
- [ ] 3.3 Render full description with proper paragraph formatting and text wrapping [AC 3.2.1]
- [ ] 3.4 Render estimated cost in large bold format with French number formatting [AC 3.2.1]
- [ ] 3.5 Render source URL as a `Button` component with `variant="outline"`, external-link icon, and text "Verifier la source" [AC 3.2.1]
- [ ] 3.6 Render author display name and relative time ("Soumis par {author} il y a {time}") [AC 3.2.1]
- [ ] 3.7 Render status badge using shadcn/ui `Badge` component: green for approved, yellow for pending, red for rejected [AC 3.2.1]
- [ ] 3.8 Status badge visible only to the submission author (check session user ID) [AC 3.2.1]
- [ ] 3.9 Include vote score with VoteButton component (delegates to Story 3.3) [AC 3.2.1]
- [ ] 3.10 Add "Retour au fil" back navigation link [AC 3.2.1]

### Task 4: ConsequenceCard Component (Cost to Nicolas)
- [ ] 4.1 Create `src/components/features/consequences/ConsequenceCard.tsx` [AC 3.2.2]
- [ ] 4.2 Display cost per citizen formatted as EUR with 2 decimal places [AC 3.2.2]
- [ ] 4.3 Display cost per taxpayer formatted as EUR with 2 decimal places [AC 3.2.2]
- [ ] 4.4 Display cost per household formatted as EUR with 2 decimal places [AC 3.2.2]
- [ ] 4.5 Display days of work equivalent formatted as "X,X jours de travail" (French decimal) [AC 3.2.2]
- [ ] 4.6 Display at least one concrete equivalence: "Soit X repas de cantine scolaire" [AC 3.2.2]
- [ ] 4.7 Add "Verifier" link next to each value pointing to `/data-status` (NFR21) [AC 3.2.2]
- [ ] 4.8 Use shadcn/ui `Card` as wrapper with `bg-surface-secondary` and `chainsaw-red` accent border [AC 3.2.2]
- [ ] 4.9 Display denominator last-updated date in a tooltip or subtitle for each value [AC 3.2.2]

### Task 5: Lazy Cost Calculation (Client Component)
- [ ] 5.1 Create `src/components/features/consequences/ConsequenceLoader.tsx` as Client Component [AC 3.2.3]
- [ ] 5.2 If cost data is null, show skeleton loading state using shadcn/ui `Skeleton` [AC 3.2.3]
- [ ] 5.3 Fire background `POST /api/cost-to-nicolas` request via `useQuery` on mount [AC 3.2.3]
- [ ] 5.4 On success, cache result on submission record via `PATCH /api/v1/submissions/{id}` [AC 3.2.3]
- [ ] 5.5 On error, display fallback message: "Calcul en cours... Revenez dans quelques instants." [AC 3.2.3]
- [ ] 5.6 Transition from skeleton to ConsequenceCard with fade-in animation (Motion library) [AC 3.2.3]

### Task 6: Source URL Display
- [ ] 6.1 Display source URL prominently with external-link icon (FR5) [AC 3.2.1]
- [ ] 6.2 Add `rel="noopener noreferrer"` and `target="_blank"` to external link [AC 3.2.1]
- [ ] 6.3 Display domain name below the button for visual verification (e.g., "Source: lemonde.fr") [AC 3.2.1]
- [ ] 6.4 Source URL is stored permanently and unmodified (NFR22) -- display exactly as stored [AC 3.2.1]

### Task 7: API Route for Detail
- [ ] 7.1 Create `src/app/api/v1/submissions/[id]/route.ts` GET handler [AC 3.2.1]
- [ ] 7.2 Return submission with all fields, cost calculation, and author info [AC 3.2.1, AC 3.2.2]
- [ ] 7.3 Return 404 with standard error envelope for nonexistent submissions [AC 3.2.4]
- [ ] 7.4 Include user's current vote direction in response if authenticated [AC 3.2.1]

### Task 8: Tests
- [ ] 8.1 Unit test `getSubmissionById()` returns full submission with cost data [AC 3.2.1, AC 3.2.2]
- [ ] 8.2 Unit test `getSubmissionById()` returns null for nonexistent ID [AC 3.2.4]
- [ ] 8.3 Component test `SubmissionDetail` renders all required fields [AC 3.2.1]
- [ ] 8.4 Component test `ConsequenceCard` renders all Cost to Nicolas metrics [AC 3.2.2]
- [ ] 8.5 Component test `ConsequenceLoader` shows skeleton then transitions to ConsequenceCard [AC 3.2.3]
- [ ] 8.6 Component test: status badge visible only to submission author [AC 3.2.1]
- [ ] 8.7 API route test `GET /api/v1/submissions/{id}` returns correct shape [AC 3.2.1]
- [ ] 8.8 API route test returns 404 for invalid UUID [AC 3.2.4]

---

## Dev Notes

### Architecture

**Rendering Strategy:** The submission detail page is a React Server Component with SSR (not purely static) because it needs dynamic data (vote counts, cost calculations) and must generate OG meta tags server-side for social media crawlers. ISR with 300-second revalidation provides the performance/freshness balance.

**Route Pattern:** The detail route uses `/s/[id]/[slug]` following the architecture spec (e.g., `/s/f47ac10b/renovation-du-bureau-du-ministre`). The slug is for SEO but the `id` is the canonical identifier.

```typescript
// src/app/s/[id]/[slug]/page.tsx
import { SubmissionDetail } from '@/components/features/submissions/SubmissionDetail';
import { ConsequenceCard } from '@/components/features/consequences/ConsequenceCard';
import { ConsequenceLoader } from '@/components/features/consequences/ConsequenceLoader';
import { getSubmissionById } from '@/lib/api/submission-detail';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import type { Metadata } from 'next';

export const revalidate = 300; // 5 minutes ISR

export async function generateMetadata({ params }: { params: { id: string; slug: string } }): Promise<Metadata> {
  const { id } = await params;
  const submission = await getSubmissionById(id);
  if (!submission) return { title: 'Signalement introuvable' };

  return {
    title: `${submission.title} - LIBERAL`,
    description: `Ce gaspillage coute ${submission.costPerCitizen ?? '...'} EUR a chaque Francais. ${submission.description.slice(0, 200)}`,
    openGraph: {
      title: submission.title,
      description: `Ce gaspillage coute ${submission.costPerCitizen ?? '...'} EUR a chaque Francais.`,
      images: [`/api/og/${submission.id}`],
      type: 'article',
      locale: 'fr_FR',
      siteName: 'LIBERAL',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@LIBERAL_FR',
      title: submission.title,
      description: `Ce gaspillage coute ${submission.costPerCitizen ?? '...'} EUR a chaque Francais.`,
      images: [`/api/og/${submission.id}`],
    },
  };
}

export default async function SubmissionPage({ params }: { params: { id: string; slug: string } }) {
  const { id } = await params;
  const session = await auth();
  const submission = await getSubmissionById(id, session?.user?.id);

  if (!submission) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <SubmissionDetail submission={submission} currentUserId={session?.user?.id} />

      {submission.costCalculation ? (
        <ConsequenceCard data={submission.costCalculation} />
      ) : (
        <ConsequenceLoader submissionId={submission.id} amount={submission.amount} />
      )}
    </main>
  );
}
```

**Detail Data Query:**
```typescript
// src/lib/api/submission-detail.ts
import { db } from '@/lib/db';
import { submissions, users, costCalculations, votes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getSubmissionById(id: string, currentUserId?: string) {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) return null;

  const result = await db
    .select({
      submission: submissions,
      author: {
        displayName: users.displayName,
        anonymousId: users.anonymousId,
        username: users.username,
      },
      costCalculation: costCalculations,
    })
    .from(submissions)
    .leftJoin(users, eq(submissions.authorId, users.id))
    .leftJoin(costCalculations, eq(submissions.id, costCalculations.submissionId))
    .where(eq(submissions.id, id))
    .limit(1);

  if (!result.length) return null;

  const row = result[0];

  // Fetch current user's vote if authenticated
  let userVote = null;
  if (currentUserId) {
    const voteResult = await db
      .select({ voteType: votes.voteType })
      .from(votes)
      .where(and(eq(votes.userId, currentUserId), eq(votes.submissionId, id)))
      .limit(1);
    userVote = voteResult[0]?.voteType ?? null;
  }

  return {
    ...row.submission,
    author: row.author,
    costCalculation: row.costCalculation,
    userVote,
  };
}
```

### Technical Requirements

**ConsequenceCard Formatting:**
```typescript
// French number formatting utilities
const frenchFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const eurFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

// "X,X jours de travail" formatting
function formatWorkDays(days: number): string {
  return `${frenchFormatter.format(days)} jours de travail`;
}
```

**Source URL Permanent Display (NFR22):**
The source URL is stored unmodified in the database and displayed exactly as stored. It can never be edited or removed after publication. The display extracts the domain for user-friendly labeling but always preserves the full URL as the link target.

### File Structure

```
src/
  app/
    s/
      [id]/
        [slug]/
          page.tsx                          # RSC detail page with ISR (300s)
          loading.tsx                       # Detail skeleton loader
          error.tsx                         # Detail error boundary
          not-found.tsx                     # "Signalement introuvable" page
    api/
      v1/
        submissions/
          [id]/
            route.ts                        # GET submission detail
  components/
    features/
      submissions/
        SubmissionDetail.tsx                # Full submission view component
      consequences/
        ConsequenceCard.tsx                 # Cost to Nicolas display (RSC)
        ConsequenceLoader.tsx              # Lazy calculation loader (Client)
  lib/
    api/
      submission-detail.ts                 # Drizzle ORM detail query
  types/
    submission.ts                          # Submission detail types
    cost.ts                                # Cost calculation types
```

### Testing

| Test Type | Tool | File | Description |
|---|---|---|---|
| Unit | Vitest | `src/lib/api/submission-detail.test.ts` | getSubmissionById with joins, null for missing |
| Component | Vitest + Testing Library | `src/components/features/submissions/SubmissionDetail.test.tsx` | All required fields render |
| Component | Vitest + Testing Library | `src/components/features/consequences/ConsequenceCard.test.tsx` | All Cost to Nicolas metrics render |
| Component | Vitest + Testing Library | `src/components/features/consequences/ConsequenceLoader.test.tsx` | Skeleton to card transition |
| API Route | Vitest | `__tests__/api/submissions-detail.test.ts` | GET returns correct shape, 404 for invalid |
| E2E | Playwright | `e2e/submission.spec.ts` | Navigate from feed to detail page |

### UX/Design

**shadcn/ui Components Used:**
- `Card` -- ConsequenceCard wrapper, main detail wrapper
- `Badge` -- Status badge (pending/approved/rejected)
- `Button` -- "Verifier la source" external link button
- `Skeleton` -- Loading states for ConsequenceLoader
- `Separator` -- Between sections (detail, cost, comments placeholder)

**Layout:**
- Mobile (375px-767px): Single column, full width, stacked sections
- Tablet (768px-1023px): Single column, max-width 640px, centered
- Desktop (1024px+): Single column, max-width 768px, centered, with sidebar context

**ConsequenceCard Design:**
- Dark card background (`bg-surface-secondary`) with left chainsaw-red border
- Large headline number for cost per citizen
- Grid layout: 2 columns on desktop, single column on mobile
- Each metric has: label, value, "Verifier" link
- Equivalence section with icon (e.g., school lunch icon)

### Dependencies

**Upstream (required before this story):**
- Story 1.1: Project Scaffold & Design System Foundation
- Story 2.1: Waste Submission Form (submissions table)
- Story 2.3: Cost to Nicolas Calculation Engine (cost calculation endpoint)
- Story 3.1: Submission Feed (SubmissionCard click navigation)

**Downstream (depends on this story):**
- Story 3.3: Upvote/Downvote Mechanics (vote buttons on detail page)
- Story 4.1: Auto-Generated Shareable Image
- Story 4.2: Social Share Buttons
- Story 4.3: Open Graph & Twitter Card Metadata
- Story 5.1: Comment Submission & Threading (comment section below detail)

### References

- Architecture: Section 3.1 (submissions, costCalculations tables), Section 3.4 (RSC + SSR for detail pages, ISR 300s), Section 4.3 (Error Handling -- not-found), Section 5.1 (Route `/s/[id]/[slug]/`)
- UX Design: Custom Components (SubmissionCard detail variant, ConsequenceCard), Loading States, Empty States, Source URL display
- PRD: FR3 (submission detail page), FR5 (source URL display), NFR21 ("Verify this" link), NFR22 (source URLs stored permanently)

---

## Dev Agent Record

| Field | Value |
|---|---|
| **Story Key** | 3.2 |
| **Status** | Draft |
| **Assigned To** | -- |
| **Started** | -- |
| **Completed** | -- |
| **Blocked By** | Story 1.1, Story 2.1, Story 2.3, Story 3.1 |
| **Notes** | -- |
