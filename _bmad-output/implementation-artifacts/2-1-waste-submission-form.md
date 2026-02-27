# Story 2.1: Waste Submission Form

Status: ready-for-dev

## Story

As a registered user (Nicolas),
I want to submit a government waste item with a title, description, estimated cost, and source URL,
so that my fellow citizens can see and vote on this fiscal outrage.

## Acceptance Criteria (BDD)

**Given** a logged-in user navigates to `/submit`,
**When** the submission form renders,
**Then** the form displays the following fields:
  - `title`: text input, required, max 200 characters, with a live character counter showing "{count}/200"
  - `description`: textarea, required, max 2000 characters, with a live character counter showing "{count}/2000"
  - `estimated_cost_eur`: number input, required, minimum value 1, formatted with EUR currency display
  - `source_url`: URL input, required, must match `https?://` pattern
**And** every field has a visible `<label>` and descriptive placeholder text (NFR20),
**And** the submit button text is "Signaler ce gaspillage".

**Given** a Drizzle migration creates the `submissions` table (if not exists) with columns: `id` (UUID, PK), `user_id` (UUID, FK to users, nullable), `title` (varchar 200, not null), `description` (text, not null), `estimated_cost_eur` (decimal 15,2, not null), `source_url` (text, not null), `author_display` (varchar 100, not null), `status` (enum: 'pending' | 'approved' | 'rejected' | 'removed', default 'pending'), `score` (integer, default 0), `upvote_count` (integer, default 0), `downvote_count` (integer, default 0), `created_at` (timestamp), `updated_at` (timestamp),
**When** the user fills in all fields with valid data and submits,
**Then** a new row is inserted into the `submissions` table with `status = 'pending'`,
**And** the `source_url` is stored permanently and unmodified (NFR22),
**And** the `author_display` is set to the user's `display_name` or `anonymous_id`,
**And** all database queries use parameterized inputs via Drizzle ORM (NFR13),
**And** the user is redirected to a confirmation page showing "Votre signalement a ete soumis et sera examine par nos moderateurs.",
**And** the source URL is displayed prominently on the confirmation page with a clickable external link icon (FR5).

**Given** the user submits a form with validation errors,
**When** the server responds,
**Then** inline error messages appear below each invalid field with `role="alert"` (NFR20),
**And** the form preserves all previously entered values.

**Given** a logged-in user submits waste items,
**When** they exceed 10 submissions per minute from the same IP,
**Then** a `429 Too Many Requests` response is returned (NFR8).

## Tasks / Subtasks

### Task 1: Database Schema & Migration (AC2)
- [ ] Define the `submissionStatus` pgEnum in `src/lib/db/schema.ts` with values: `'pending'`, `'approved'`, `'rejected'`, `'removed'`
- [ ] Define the `submissions` table in `src/lib/db/schema.ts` with all columns specified in AC2:
  ```typescript
  export const submissionStatus = pgEnum('submission_status', ['pending', 'approved', 'rejected', 'removed']);

  export const submissions = pgTable('submissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    estimatedCostEur: decimal('estimated_cost_eur', { precision: 15, scale: 2 }).notNull(),
    sourceUrl: text('source_url').notNull(),
    authorDisplay: varchar('author_display', { length: 100 }).notNull(),
    status: submissionStatus('status').notNull().default('pending'),
    score: integer('score').notNull().default(0),
    upvoteCount: integer('upvote_count').notNull().default(0),
    downvoteCount: integer('downvote_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  });
  ```
- [ ] Create performance indexes:
  ```sql
  CREATE INDEX idx_submissions_status ON submissions (status);
  CREATE INDEX idx_submissions_user_id ON submissions (user_id);
  CREATE INDEX idx_submissions_created_at ON submissions (created_at DESC) WHERE status = 'approved';
  CREATE INDEX idx_submissions_score ON submissions (score DESC) WHERE status = 'approved';
  ```
- [ ] Run `npx drizzle-kit generate` and `npx drizzle-kit push` to apply migration

### Task 2: Zod Validation Schemas (AC1, AC3)
- [ ] Create submission validation schema in `src/lib/utils/validation.ts`:
  ```typescript
  import { z } from 'zod';

  export const submissionFormSchema = z.object({
    title: z.string()
      .min(1, 'Le titre est obligatoire')
      .max(200, 'Le titre ne doit pas depasser 200 caracteres'),
    description: z.string()
      .min(1, 'La description est obligatoire')
      .max(2000, 'La description ne doit pas depasser 2000 caracteres'),
    estimatedCostEur: z.coerce.number()
      .min(1, 'Le montant doit etre superieur a 0 EUR')
      .max(999_999_999_999.99, 'Le montant est trop eleve'),
    sourceUrl: z.string()
      .min(1, 'Le lien source est obligatoire')
      .url('Le lien source doit etre une URL valide')
      .regex(/^https?:\/\//, 'Le lien source doit commencer par http:// ou https://'),
  });

  export type SubmissionFormData = z.infer<typeof submissionFormSchema>;
  ```

### Task 3: Server Action for Submission Creation (AC2, AC4)
- [ ] Create `src/app/submit/actions.ts` with a `createSubmission` Server Action:
  - Verify user is authenticated via `auth()` from Auth.js
  - Validate input with `submissionFormSchema.safeParse()`
  - Check rate limit via Upstash Ratelimit (10 submissions/minute per IP)
  - Return `429` if rate limited (AC4)
  - Resolve `authorDisplay` from `users.display_name` or `users.anonymous_id`
  - Insert row into `submissions` table via Drizzle ORM (parameterized queries, NFR13)
  - Store `source_url` unmodified (NFR22)
  - Set `status = 'pending'`
  - On success, return the submission ID for redirect
  - On validation failure, return field-level errors

### Task 4: SubmissionForm Client Component (AC1, AC3)
- [ ] Create `src/components/features/submissions/SubmissionForm.tsx` as a `'use client'` component
- [ ] Implement form fields using shadcn/ui `Input` and `Textarea` components:
  - `title`: `<Input>` with `maxLength={200}`, live character counter `{count}/200`
  - `description`: `<Textarea>` with `maxLength={2000}`, live character counter `{count}/2000`
  - `estimated_cost_eur`: `<Input type="number">` with `min={1}`, EUR currency label
  - `source_url`: `<Input type="url">` with `placeholder="https://..."`
- [ ] Each field wrapped in `<div>` with visible `<label htmlFor={...}>` (NFR20)
- [ ] Add descriptive placeholder text to every field
- [ ] Submit button with text "Signaler ce gaspillage"
- [ ] Implement client-side validation with Zod before submission
- [ ] Display inline error messages with `role="alert"` below invalid fields (AC3)
- [ ] Preserve all entered values on validation error (AC3)
- [ ] Show loading state on submit button during submission
- [ ] Call `createSubmission` Server Action on form submit

### Task 5: Submit Page Route (AC1)
- [ ] Create `src/app/submit/page.tsx` that:
  - Checks authentication via `auth()` middleware — redirect unauthenticated users to `/login?callbackUrl=/submit`
  - Renders `<SubmissionForm />` component
  - Sets page metadata: `title: "Signaler un gaspillage - LIBERAL"`

### Task 6: Confirmation Page (AC2)
- [ ] Create `src/app/submit/confirmation/[id]/page.tsx` that:
  - Fetches the newly created submission by ID from database
  - Displays success message: "Votre signalement a ete soumis et sera examine par nos moderateurs."
  - Displays the source URL prominently with a clickable external link icon (FR5)
  - Displays submission title and estimated cost as summary
  - Provides a "Retour au fil" link to `/feed/hot`

### Task 7: Rate Limiting (AC4)
- [ ] Add submission rate limiter to `src/lib/api/rate-limit.ts`:
  ```typescript
  submission: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1m'),
    prefix: 'ratelimit:submission',
  }),
  ```
- [ ] Apply rate limit check in the `createSubmission` Server Action using requester IP
- [ ] Return appropriate error message on rate limit: "Trop de soumissions. Reessayez dans quelques minutes."

### Task 8: Tests
- [ ] Write Vitest unit tests for `submissionFormSchema` in `src/lib/utils/validation.test.ts`:
  - Valid submission data passes validation
  - Empty title fails with appropriate error
  - Title exceeding 200 chars fails
  - Description exceeding 2000 chars fails
  - Cost of 0 or negative fails
  - Invalid URL format fails
  - URL without http(s) prefix fails
- [ ] Write Vitest component test for `SubmissionForm.tsx` in `src/components/features/submissions/SubmissionForm.test.tsx`:
  - Renders all 4 fields with labels
  - Displays character counters that update on typing
  - Shows inline errors on invalid submission attempt
  - Submit button text is "Signaler ce gaspillage"
  - Form preserves values after validation error
- [ ] Write API integration test in `__tests__/api/submissions.test.ts`:
  - Authenticated user can create a submission
  - Unauthenticated user gets 401
  - Invalid data returns 400 with field errors
  - Rate limited user gets 429

## Dev Notes

### Architecture & Patterns
- The submission form is a **Client Component** (`'use client'`) because it requires interactive form handling, live character counters, and client-side validation.
- Data mutation uses **Next.js Server Actions** (not API Route Handlers) for the create operation, per architecture pattern 3.3.
- The `submissions` table schema in this story aligns with the epics specification but differs from the architecture.md `submissions` table which has additional fields (`slug`, `amount`, `hotScore`, `ogImageUrl`, etc.). This story implements the epics-specified schema; subsequent stories (Epic 3) will add additional columns via migrations.
- Rate limiting uses **Upstash Ratelimit** with sliding window algorithm, applied at the Server Action level using the request IP address.

### Technical Requirements
- **Drizzle ORM 0.45.1**: SQL-first ORM, parameterized queries by default (NFR13)
- **Zod 3.x**: Schema validation shared between client and server
- **shadcn/ui components**: `Input`, `Textarea`, `Button`, `Label` from `src/components/ui/`
- **@upstash/ratelimit 1.36.x**: Sliding window rate limiting
- **Auth.js v5**: Session verification in Server Actions via `auth()`

### File Structure
```
src/
  app/
    submit/
      page.tsx                              # NEW - Submit page route
      actions.ts                            # NEW - createSubmission Server Action
      confirmation/
        [id]/
          page.tsx                           # NEW - Confirmation page
  components/
    features/
      submissions/
        SubmissionForm.tsx                   # NEW - Form client component
        SubmissionForm.test.tsx              # NEW - Component tests
  lib/
    db/
      schema.ts                             # MODIFIED - Add submissions table + enum
      migrations/                           # MODIFIED - New migration file
    utils/
      validation.ts                         # MODIFIED - Add submissionFormSchema
      validation.test.ts                    # NEW - Validation schema tests
    api/
      rate-limit.ts                         # MODIFIED - Add submission rate limiter
__tests__/
  api/
    submissions.test.ts                     # NEW - API integration tests
```

### Testing Requirements
- **Unit tests (Vitest)**: Zod schema validation edge cases
- **Component tests (Vitest + Testing Library)**: Form rendering, interaction, error display
- **Integration tests (Vitest)**: Server Action with test database
- **Coverage target**: >85% for validation schemas, >70% for components

### UX/Design Notes
- **Mobile**: The form should render as a full-screen experience on mobile (375px-767px). Submit button should be sticky at the bottom.
- **Character counters**: Live counters below each text field, format `{count}/200` and `{count}/2000`. Counter text turns `chainsaw-red` when within 20 characters of the limit.
- **Currency display**: The EUR input should show a "EUR" suffix or currency indicator next to the input field.
- **Validation feedback**: Inline errors appear immediately below each field with `role="alert"` for screen reader accessibility. Error text uses `text-destructive` color from shadcn/ui theme.
- **Form preservation**: On validation error, all entered values remain in the form fields. No data loss.
- **Submit button states**: Default ("Signaler ce gaspillage") -> Loading (spinner + "Soumission en cours...") -> Redirect on success
- **Labels**: Every field has a visible `<label>` element (not just placeholder text). Labels use `font-display` weight for consistency.
- **Placeholders**: Title: "Ex: Renovation du bureau ministeriel a 500 000 EUR", Description: "Decrivez le gaspillage en detail...", Cost: "Ex: 500000", Source: "https://www.lemonde.fr/..."
- **Accessibility**: Tab order follows visual order. All error messages linked to fields via `aria-describedby`. Required fields indicated with visual asterisk and `aria-required="true"`.

### Dependencies
- **Story 1.1** (User Registration): Required for authenticated user session
- **Story 1.2** (User Authentication): Required for `auth()` session check in Server Action
- No dependency on the Cost to Nicolas engine (Story 2.3) — calculations happen post-submission

### References
- [Source: epics.md#Epic 2, Story 2.1]
- [Source: architecture.md#Section 3.1 - Schema Design]
- [Source: architecture.md#Section 3.3 - API & Communication]
- [Source: architecture.md#Section 3.4 - Frontend Architecture]
- [Source: ux-design-specification.md#SubmissionForm Component]
- [Source: prd.md#FR1, FR5, NFR8, NFR13, NFR20, NFR22]

## Dev Agent Record

### Agent Model Used
### Completion Notes List
### Change Log
### File List
