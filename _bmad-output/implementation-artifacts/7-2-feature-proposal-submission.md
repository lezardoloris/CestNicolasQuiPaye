# Story 7.2: Feature Proposal Submission

## Story

**As a** registered user (Nicolas),
**I want** to propose new platform features for community voting,
**So that** I can suggest improvements that matter to me and the community.

**Epic:** 7 — Community Feature Voting & Platform Democracy
**FRs:** FR10 (Registered users can vote on proposed platform features to influence the development roadmap)
**NFRs:** NFR8 (Rate limiting), NFR20 (Form labels, error messages, required field indicators)

---

## Acceptance Criteria (BDD)

### AC 7.2.1: Proposal Submission Button Visibility

```gherkin
Given a logged-in user navigates to `/features`
When the page renders
Then a "Proposer une fonctionnalite" button is displayed prominently at the top of the page
And the button uses the primary chainsaw-red accent color for visibility
And the button is positioned above the proposal list

Given a visitor (not logged in) navigates to `/features`
When the page renders
Then the "Proposer une fonctionnalite" button is still visible
But clicking it triggers the LazyAuthGate modal with message: "Connectez-vous pour proposer une fonctionnalite"
```

### AC 7.2.2: Proposal Submission Form Display

```gherkin
Given a logged-in user clicks "Proposer une fonctionnalite"
When the proposal form appears (as a dialog/modal)
Then the form displays:
  - Title field: text input, required, max 200 chars, label "Titre de la fonctionnalite" (NFR20)
  - Description field: textarea, required, max 1000 chars, label "Decrivez la fonctionnalite souhaitee" (NFR20)
  - Category field: select dropdown, required, label "Categorie", options: "General", "Donnees", "UX / Design", "Social", "Technique" (NFR20)
  - Character counters showing remaining characters for title and description
  - A "Soumettre" (submit) button
  - A "Annuler" (cancel) button
And all required fields are indicated with an asterisk (*) and `aria-required="true"` (NFR20)
And the form has focus trapped within the modal for keyboard users
```

### AC 7.2.3: Zod Validation — Client-Side

```gherkin
Given a user is filling out the proposal form
When they attempt to submit with an empty title
Then a validation error appears below the title field: "Le titre est requis"
And the error is programmatically linked to the field via `aria-describedby` (NFR20)

Given a user types more than 200 characters in the title field
When the character counter updates
Then the counter turns red and displays "0 caracteres restants"
And the input prevents further typing or shows an error: "Le titre ne doit pas depasser 200 caracteres"

Given a user attempts to submit with an empty description
Then a validation error appears: "La description est requise"

Given a user types more than 1000 characters in the description
Then a validation error appears: "La description ne doit pas depasser 1000 caracteres"

Given a user attempts to submit without selecting a category
Then a validation error appears: "Veuillez choisir une categorie"
```

### AC 7.2.4: Successful Proposal Submission

```gherkin
Given a logged-in user fills in a valid title, description, and category
When they click "Soumettre"
Then a POST request is sent to `/api/v1/feature-votes` with the proposal data
And a new row is inserted into the `feature_votes` table with:
  - title = submitted title
  - description = submitted description
  - category = selected category value
  - status = 'proposed'
  - author_id = current user's ID
  - vote_count = 0
And the modal closes
And a success toast displays: "Votre proposition a ete soumise. Merci !"
And the new proposal appears at the top of the list (if sorted by date) or in its correct position (if sorted by votes)
And the proposal list is refetched/invalidated via TanStack Query
```

### AC 7.2.5: Rate Limiting — Proposal Spam Prevention

```gherkin
Given a logged-in user has already submitted 3 feature proposals in the current 24-hour period
When they attempt to submit another proposal
Then the API returns HTTP 429 with error code "RATE_LIMITED"
And an error message displays: "Vous avez atteint la limite de propositions pour aujourd'hui. Reessayez demain."
And the "Soumettre" button remains active but the submission is rejected server-side

Given a logged-in user has submitted 2 proposals today
When the proposal form is displayed
Then no rate limit warning is shown (limit not yet reached)
And the submission proceeds normally
```

### AC 7.2.6: API Endpoint — POST /api/v1/feature-votes (Create Proposal)

```gherkin
Given an authenticated user sends POST /api/v1/feature-votes
When the request body contains:
  {
    "title": "Ajout d'un comparateur France vs UE",
    "description": "Permettre de comparer les depenses publiques francaises avec les autres pays de l'UE...",
    "category": "data"
  }
Then the server validates the input with Zod schema:
  - title: string, min 3 chars, max 200 chars, required
  - description: string, min 10 chars, max 1000 chars, required
  - category: enum ['general', 'data', 'ux', 'social', 'tech'], required
And rate limiting is checked (3 proposals per 24 hours per userId)
And on success, the response returns HTTP 201 with the created proposal:
  { data: { id, title, description, category, status: 'proposed', voteCount: 0, createdAt } }

Given an unauthenticated user sends POST /api/v1/feature-votes
Then the response is HTTP 401 with error code "UNAUTHORIZED"

Given the request body fails validation
Then the response is HTTP 400 with error code "VALIDATION_ERROR" and field-level error details
```

### AC 7.2.7: Input Sanitization

```gherkin
Given a user submits a proposal with HTML tags in the title or description
When the proposal is processed
Then HTML tags are stripped/escaped before database insertion
And the stored text is safe for rendering without XSS risk
And Markdown formatting is NOT supported (plain text only for MVP)
```

---

## Tasks / Subtasks

### Task 1: Zod Validation Schema for Feature Proposal

- [ ] 1.1: Add `featureProposalCreateSchema` to `src/lib/utils/validation.ts`:
  ```typescript
  z.object({
    title: z.string().min(3, 'Le titre doit contenir au moins 3 caracteres').max(200, 'Le titre ne doit pas depasser 200 caracteres'),
    description: z.string().min(10, 'La description doit contenir au moins 10 caracteres').max(1000, 'La description ne doit pas depasser 1000 caracteres'),
    category: z.enum(['general', 'data', 'ux', 'social', 'tech'], { required_error: 'Veuillez choisir une categorie' }),
  })
  ```
- [ ] 1.2: Add `FEATURE_PROPOSAL_CATEGORIES` constant with display labels:
  ```typescript
  { general: 'General', data: 'Donnees', ux: 'UX / Design', social: 'Social', tech: 'Technique' }
  ```

### Task 2: Rate Limiter for Feature Proposals

- [ ] 2.1: Add `featureProposal` rate limiter to `src/lib/api/rate-limit.ts`:
  ```typescript
  featureProposal: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '24h'),
    prefix: 'ratelimit:feature-proposal',
  }),
  ```

### Task 3: API Route — POST /api/v1/feature-votes (Create)

- [ ] 3.1: Add POST handler to `src/app/api/v1/feature-votes/route.ts` (extend the file from Story 7.1)
- [ ] 3.2: Require authentication via `requireAuth()` helper from `src/lib/auth/helpers.ts`
- [ ] 3.3: Parse and validate request body with `featureProposalCreateSchema`
- [ ] 3.4: Check rate limit with `rateLimiters.featureProposal.limit(userId)`
- [ ] 3.5: Sanitize title and description (strip HTML tags, trim whitespace)
- [ ] 3.6: Insert row into `feature_votes` table via Drizzle ORM
- [ ] 3.7: Return HTTP 201 with created proposal in standard API envelope
- [ ] 3.8: On validation error, return HTTP 400 with field-level errors
- [ ] 3.9: On rate limit exceeded, return HTTP 429 with `RATE_LIMITED` error and `retryAfter` in seconds

### Task 4: Feature Proposal Form Component

- [ ] 4.1: Create `src/components/features/feature-voting/FeatureProposalForm.tsx` (Client Component with 'use client')
- [ ] 4.2: Use `shadcn/ui` `Dialog` component for modal presentation
- [ ] 4.3: Implement form with `shadcn/ui` `Input`, `Textarea`, `Select` components
- [ ] 4.4: Add client-side validation using Zod `featureProposalCreateSchema` with `zodResolver` (react-hook-form or manual)
- [ ] 4.5: Display character counters for title (X/200) and description (X/1000)
- [ ] 4.6: Character counter turns red when < 10% remaining
- [ ] 4.7: All form fields have associated `<label>` elements with `htmlFor` matching input `id` (NFR20)
- [ ] 4.8: Error messages linked to fields via `aria-describedby` (NFR20)
- [ ] 4.9: Required fields marked with asterisk and `aria-required="true"` (NFR20)
- [ ] 4.10: Submit button shows loading spinner during API call
- [ ] 4.11: On success: close modal, show success toast, invalidate TanStack Query cache for feature-votes
- [ ] 4.12: On rate limit error: show rate limit error message in form (not just toast)
- [ ] 4.13: On validation error: show field-level errors
- [ ] 4.14: Cancel button closes modal without submitting

### Task 5: Integrate Form into Features Page

- [ ] 5.1: Add "Proposer une fonctionnalite" button to `src/app/features/page.tsx`
- [ ] 5.2: Wire button to open the `FeatureProposalForm` dialog
- [ ] 5.3: For unauthenticated users, wire button to open `LazyAuthGate` instead
- [ ] 5.4: After successful auth via LazyAuthGate, open the proposal form automatically

### Task 6: Input Sanitization Utility

- [ ] 6.1: Create or extend `src/lib/utils/sanitize.ts` with `stripHtmlTags(input: string): string` function
- [ ] 6.2: Sanitize title and description in the POST API handler before database insertion
- [ ] 6.3: Trim leading/trailing whitespace and collapse multiple spaces

### Task 7: Unit Tests

- [ ] 7.1: Write Vitest tests for `featureProposalCreateSchema` — valid inputs, empty fields, max length violations, invalid category
- [ ] 7.2: Write Vitest tests for `FeatureProposalForm` component — renders all fields, shows validation errors, handles submission, shows rate limit error
- [ ] 7.3: Write Vitest tests for POST `/api/v1/feature-votes` — successful creation, validation errors (400), authentication required (401), rate limit exceeded (429), HTML sanitization
- [ ] 7.4: Write Vitest tests for `stripHtmlTags` utility function
- [ ] 7.5: Write Vitest tests for character counter behavior in the form component

---

## Dev Notes

### Architecture Notes

- **Form pattern:** The feature proposal form follows the same modal dialog pattern used by the submission form (`SubmissionForm.tsx`). Modal with focus trap, client-side validation, server-side validation, optimistic cache invalidation.
- **Rate limiting:** Proposal rate limit (3/day) is separate from vote rate limit (100/hour). A new `featureProposal` rate limiter is added to `src/lib/api/rate-limit.ts` alongside the existing `submission`, `vote`, and `comment` limiters.
- **Rendering:** The form is a pure Client Component (interactive form). The parent page (`/features`) is RSC and passes auth state down as props or reads it from the session.
- **Cache invalidation:** After successful proposal creation, call `queryClient.invalidateQueries({ queryKey: ['feature-votes'] })` to refetch the list.

### Technical Notes

- **Zod validation** runs twice: client-side (for instant feedback) and server-side (for security). The same `featureProposalCreateSchema` is imported in both locations.
- **Rate limit key:** `userId` (not IP), since proposals require authentication. This prevents a single user from spamming but does not rate-limit different users.
- **Rate limit window:** 3 proposals per 24 hours (sliding window). This matches the epic's AC which specifies "3 feature proposals per day."
- **HTML sanitization:** Simple regex-based tag stripping is sufficient for MVP. No Markdown support — plain text only. React's default JSX escaping provides XSS protection on render, but we sanitize on write as defense-in-depth.
- **Form state management:** Use React `useState` or `react-hook-form` (if already in dependencies). The architecture does not mandate a specific form library — keep it simple.

### Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/utils/validation.ts` | MODIFY | Add `featureProposalCreateSchema` and `FEATURE_PROPOSAL_CATEGORIES` |
| `src/lib/api/rate-limit.ts` | MODIFY | Add `featureProposal` rate limiter (3/24h) |
| `src/lib/utils/sanitize.ts` | CREATE | HTML tag stripping utility |
| `src/app/api/v1/feature-votes/route.ts` | MODIFY | Add POST handler for proposal creation |
| `src/components/features/feature-voting/FeatureProposalForm.tsx` | CREATE | Proposal submission form (modal dialog) |
| `src/components/features/feature-voting/FeatureProposalForm.test.tsx` | CREATE | Form component unit tests |
| `src/app/features/page.tsx` | MODIFY | Add "Proposer" button and wire to form dialog |

### Testing Notes

- **Unit tests (Vitest):**
  - Zod schema: Test all validation rules — min/max length, required fields, enum values, edge cases (exactly 200 chars, exactly 3 chars, empty string, HTML in input)
  - Form component: Test render, field interaction, validation error display, submission flow (mock API), rate limit error display, cancel behavior, character counter
  - API route: Mock Drizzle insert, test 201 success, 400 validation, 401 unauthorized, 429 rate limit, sanitization of HTML input
  - Sanitize utility: Test tag stripping (`<script>`, `<b>`, nested tags), preserve plain text, handle edge cases (empty string, no tags, unclosed tags)
- **Coverage target:** >80% line coverage for form and API route

### UX Notes

- **Modal form:** Opens centered with backdrop overlay (same pattern as shadcn/ui `Dialog`). Focus is trapped inside the modal. Escape key closes. Click outside closes.
- **Character counters:** Subtle gray text below each field. Turns red when approaching limit. Format: "187/200" for title, "834/1000" for description.
- **Category selection:** Use `shadcn/ui` `Select` component with French labels. Default to no selection (force user to choose).
- **Success feedback:** Toast notification ("Votre proposition a ete soumise. Merci !") appears bottom-right. Modal closes. The new proposal appears in the list.
- **Rate limit feedback:** Error message appears within the form (above the submit button), not just as a toast. This is more visible and less likely to be missed.
- **French labels:** All form labels, placeholders, errors, and buttons are in French. No English strings in the UI.

### Dependencies

- **Depends on:**
  - Story 7.1 (Feature Proposal Display & Voting) — for `feature_votes` schema, `/features` page, API route file, types
  - Story 1.1 (Project Foundation) — for auth, layout, shadcn/ui Dialog/Input/Textarea/Select components
  - Story 1.2 (User Registration) — for authenticated user session
  - `src/components/features/auth/LazyAuthGate.tsx` — for unauthenticated proposal prompt
  - `src/lib/api/rate-limit.ts` — for rate limiter infrastructure
- **Blocks:**
  - Story 7.3 (Admin Feature Management) — admin needs proposals to exist to manage them
  - Story 7.4 (Accessibility) — needs the form to exist for accessibility audit

### References

- PRD: FR10 (community feature voting)
- Architecture: Section 3.4 (Rate Limiting — 5/day for submissions, we add 3/day for proposals), Section 4.4 (Toast patterns), Section 5.1 (Directory Tree — `src/app/api/v1/feature-votes/route.ts`)
- UX Design: Experience Principle #2 (Democratic everything — "users vote on features to build next"), Effortless Interactions, Form accessibility patterns
- Epics: Epic 7 — Story 7.2 acceptance criteria

---

## Dev Agent Record

| Field | Value |
|-------|-------|
| **Story ID** | 7.2 |
| **Story Title** | Feature Proposal Submission |
| **Epic** | 7 — Community Feature Voting & Platform Democracy |
| **Status** | Not Started |
| **Estimated Complexity** | Medium |
| **Assigned Agent** | — |
| **Started At** | — |
| **Completed At** | — |
| **Commits** | — |
| **Blockers** | Depends on Story 7.1 for schema and page |
| **Notes** | Rate limit is 3 proposals per 24 hours per user (not per IP). This prevents spam while still allowing engaged users to propose multiple ideas. The form follows the same modal dialog pattern as the submission form. |
