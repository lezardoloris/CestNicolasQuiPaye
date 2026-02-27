# Story 1.5: Account Deletion & GDPR Right to Erasure

Status: ready-for-dev

## Story

As a registered user (Nicolas),
I want to delete my account and all associated personal data,
so that I can exercise my GDPR right to erasure and leave the platform cleanly.

## Acceptance Criteria (BDD)

**Given** a logged-in user navigates to `/profile/settings`,
**When** the settings page renders,
**Then** a "Supprimer mon compte" (Delete my account) section is displayed at the bottom of the page with a red-outlined danger button.

**Given** the user clicks "Supprimer mon compte",
**When** the confirmation dialog appears,
**Then** a modal displays the text: "Cette action est irreversible. Toutes vos donnees personnelles seront supprimees. Vos signalements publies seront anonymises.",
**And** the modal requires the user to type "SUPPRIMER" in a confirmation input field,
**And** the modal has two buttons: "Confirmer la suppression" (red) and "Annuler" (neutral).

**Given** the user types "SUPPRIMER" and clicks "Confirmer la suppression",
**When** the deletion is processed,
**Then** the following data is permanently deleted from the database: `users.email`, `users.password_hash`, `users.display_name`,
**And** the `users.anonymous_id` is replaced with "Utilisateur supprime",
**And** all entries in the `votes` table for this user are deleted,
**And** all submissions by this user have their `user_id` set to null and `author_display` set to "Utilisateur supprime",
**And** all comments by this user have their `user_id` set to null and `author_display` set to "Utilisateur supprime",
**And** the user's session is terminated and they are redirected to `/` with a flash message: "Votre compte a ete supprime.",
**And** the deletion completes within 30 seconds of confirmation.

## Tasks / Subtasks

### Phase 1: Server Action for Account Deletion

- [ ] **Task 1.5.1: Create the account deletion server action** (AC: all personal data deleted, submissions/comments anonymized, session terminated)
  - Create `src/app/profile/settings/delete-account-action.ts`:
    ```typescript
    'use server';

    import { db } from '@/lib/db';
    import { users, votes, submissions, comments } from '@/lib/db/schema';
    import { requireAuth } from '@/lib/auth/helpers';
    import { signOut } from '@/lib/auth/config';
    import { eq } from 'drizzle-orm';
    import { redirect } from 'next/navigation';
    import { cookies } from 'next/headers';

    export async function deleteAccountAction(formData: FormData) {
      const user = await requireAuth();

      // Verify confirmation text
      const confirmationText = formData.get('confirmation') as string;
      if (confirmationText !== 'SUPPRIMER') {
        return { error: 'Veuillez taper SUPPRIMER pour confirmer' };
      }

      // Execute deletion within a transaction
      await db.transaction(async (tx) => {
        // 1. Delete all votes by this user
        await tx.delete(votes).where(eq(votes.userId, user.id));

        // 2. Anonymize all submissions by this user
        await tx.update(submissions)
          .set({
            authorId: null,
            authorDisplay: 'Utilisateur supprime',
            updatedAt: new Date(),
          })
          .where(eq(submissions.authorId, user.id));

        // 3. Anonymize all comments by this user
        await tx.update(comments)
          .set({
            authorId: null,
            authorDisplay: 'Utilisateur supprime',
            updatedAt: new Date(),
          })
          .where(eq(comments.authorId, user.id));

        // 4. Scrub personal data from user record
        // We soft-delete by clearing PII and setting deletedAt
        await tx.update(users)
          .set({
            email: `deleted_${user.id}@deleted.local`,
            passwordHash: '',
            displayName: null,
            anonymousId: 'Utilisateur supprime',
            twitterId: null,
            twitterHandle: null,
            avatarUrl: null,
            bio: null,
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
      });

      // 5. Terminate session
      await signOut({ redirect: false });

      // 6. Set flash message cookie for the redirect target
      const cookieStore = await cookies();
      cookieStore.set('liberal_flash', 'Votre compte a ete supprime.', {
        maxAge: 60, // expires in 60 seconds
        path: '/',
      });

      // 7. Redirect to home
      redirect('/');
    }
    ```

  - **Important implementation notes:**
    - The transaction ensures atomicity -- if any step fails, the entire deletion is rolled back
    - Email is replaced with `deleted_{userId}@deleted.local` rather than NULL to maintain the UNIQUE constraint without conflicting with future registrations
    - `passwordHash` is set to empty string (no valid bcrypt hash can match this)
    - `deletedAt` timestamp is set for audit trail
    - The 30-second completion requirement (AC) should be met easily since all operations are simple UPDATE/DELETE queries

- [ ] **Task 1.5.2: Ensure the `submissions` table schema supports nullable `author_id`** (AC: user_id set to null)
  - Verify/update `src/lib/db/schema.ts`:
    - The `submissions` table's `authorId` column must be NULLABLE:
      ```typescript
      authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
      ```
    - The `submissions` table must have an `authorDisplay` column:
      ```typescript
      authorDisplay: varchar('author_display', { length: 100 }).notNull(),
      ```
    - If these columns don't exist yet (from Story 1.4 forward declarations), create them now

- [ ] **Task 1.5.3: Ensure the `comments` table schema supports nullable `author_id`** (AC: user_id set to null on comments)
  - Verify/update `src/lib/db/schema.ts`:
    - The `comments` table's `authorId` column must be NULLABLE:
      ```typescript
      authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
      ```
    - The `comments` table must have an `authorDisplay` column:
      ```typescript
      authorDisplay: varchar('author_display', { length: 100 }).notNull(),
      ```
    - If the `comments` table doesn't exist yet, create a minimal forward declaration

- [ ] **Task 1.5.4: Generate and apply the migration** (AC: schema changes applied)
  - Run `npx drizzle-kit generate` to generate migration for any schema changes
  - Run `npx drizzle-kit push` to apply to local database
  - Verify the `ON DELETE SET NULL` behavior on foreign keys

### Phase 2: Confirmation Dialog UI

- [ ] **Task 1.5.5: Create `<DeleteAccountSection />` component** (AC: danger section at bottom of settings)
  - Create `src/components/features/profile/DeleteAccountSection.tsx`
  - Mark as `'use client'`
  - Display:
    - Section heading: "Zone de danger" in `text-chainsaw-red font-display text-lg`
    - Explanation text: "La suppression de votre compte est definitive. Vos signalements publies seront conserves mais anonymises."
    - Button: "Supprimer mon compte" with destructive styling:
      ```tsx
      <Button
        variant="outline"
        className="border-chainsaw-red text-chainsaw-red hover:bg-chainsaw-red hover:text-white"
      >
        Supprimer mon compte
      </Button>
      ```
    - Clicking the button opens the `<DeleteAccountDialog />`
  - Section is visually separated from the rest of the settings page with a `<Separator />` and extra top margin

- [ ] **Task 1.5.6: Create `<DeleteAccountDialog />` component** (AC: confirmation modal with text input)
  - Create `src/components/features/profile/DeleteAccountDialog.tsx`
  - Mark as `'use client'`
  - Use shadcn/ui `<Dialog />`, `<Input />`, `<Button />` components
  - Props:
    ```typescript
    interface DeleteAccountDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }
    ```
  - Content:
    - Title: "Supprimer votre compte" in `font-display text-xl text-text-primary`
    - Body text: "Cette action est irreversible. Toutes vos donnees personnelles seront supprimees. Vos signalements publies seront anonymises."
    - Detailed list of what will happen:
      - "Votre email et mot de passe seront supprimes"
      - "Votre pseudonyme sera supprime"
      - "Vos votes seront supprimes"
      - "Vos signalements seront anonymises sous 'Utilisateur supprime'"
      - "Vos commentaires seront anonymises sous 'Utilisateur supprime'"
    - Confirmation input: `<Input />` with `<label>Tapez SUPPRIMER pour confirmer</label>`
    - The "Confirmer la suppression" button is DISABLED until the input value exactly matches "SUPPRIMER"
    - Button "Confirmer la suppression":
      ```tsx
      <Button
        type="submit"
        disabled={confirmText !== 'SUPPRIMER' || isDeleting}
        className="bg-chainsaw-red hover:bg-chainsaw-red-hover disabled:opacity-50"
      >
        {isDeleting ? 'Suppression en cours...' : 'Confirmer la suppression'}
      </Button>
      ```
    - Button "Annuler": `<Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>`
  - Loading state: show spinner and disable both buttons during deletion
  - Error state: display error message in `role="alert"` if deletion fails
  - Modal is not dismissible by pressing Escape while deletion is in progress
  - All interactive elements have `:focus-visible` styling
  - The confirmation input auto-focuses when the dialog opens

- [ ] **Task 1.5.7: Integrate `<DeleteAccountSection />` into the settings page** (AC: section at bottom of settings)
  - Modify `src/app/profile/settings/page.tsx`:
    - Add `<DeleteAccountSection />` at the bottom of the page, below the display name form
    - Add a `<Separator />` between the display name section and the danger zone

### Phase 3: Flash Message Display

- [ ] **Task 1.5.8: Create a flash message system** (AC: flash message "Votre compte a ete supprime." on redirect)
  - Create `src/components/features/common/FlashMessage.tsx`:
    - Mark as `'use client'`
    - On mount, check for the `liberal_flash` cookie
    - If present, display the message as a toast notification
    - Delete the cookie after displaying
    ```typescript
    'use client';

    import { useEffect } from 'react';
    import { useToast } from '@/components/ui/use-toast';

    export function FlashMessage() {
      const { toast } = useToast();

      useEffect(() => {
        const flash = document.cookie
          .split('; ')
          .find(row => row.startsWith('liberal_flash='));

        if (flash) {
          const message = decodeURIComponent(flash.split('=')[1]);
          toast({
            title: message,
            variant: 'default',
          });
          // Delete the cookie
          document.cookie = 'liberal_flash=; max-age=0; path=/';
        }
      }, [toast]);

      return null;
    }
    ```
  - Add `<FlashMessage />` to the root layout (`src/app/layout.tsx`) or to the Providers component

### Phase 4: Auth Guards & Edge Cases

- [ ] **Task 1.5.9: Ensure deleted users cannot log in** (AC: session terminated)
  - Modify the `authorize` callback in `src/lib/auth/config.ts`:
    - After finding the user by email, check if `user.deletedAt` is not null
    - If deleted, return `null` (deny login)
    ```typescript
    async authorize(credentials) {
      // ... existing validation ...
      const user = await db.query.users.findFirst({
        where: eq(users.email, parsed.data.email),
      });
      if (!user || user.deletedAt) return null;
      // ... rest of authorize ...
    }
    ```

- [ ] **Task 1.5.10: Handle edge cases for deleted user data** (AC: graceful handling)
  - Ensure profile pages handle the case where a user has been deleted:
    - `/profile/[userId]` returns 404 if `deletedAt` is not null
    - Submissions by deleted users display "Utilisateur supprime" as author
    - Comments by deleted users display "Utilisateur supprime" as author
  - Update `getUserById` in `src/lib/api/users.ts` to filter out deleted users:
    ```typescript
    export async function getUserById(userId: string) {
      return db.query.users.findFirst({
        where: and(eq(users.id, userId), isNull(users.deletedAt)),
      });
    }
    ```

### Phase 5: Validation Schema

- [ ] **Task 1.5.11: Create Zod schema for deletion confirmation** (AC: confirmation text validation)
  - Create `src/lib/validators/delete-account.ts`:
    ```typescript
    import { z } from 'zod';

    export const deleteAccountSchema = z.object({
      confirmation: z
        .string()
        .refine(
          (val) => val === 'SUPPRIMER',
          'Veuillez taper exactement SUPPRIMER pour confirmer'
        ),
    });

    export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
    ```

### Phase 6: Testing

- [ ] **Task 1.5.12: Write unit tests for deletion validation schema** (AC: confirmation validation)
  - Create `src/lib/validators/__tests__/delete-account.test.ts`:
    - Test "SUPPRIMER" passes validation
    - Test "supprimer" (lowercase) fails validation
    - Test empty string fails validation
    - Test "DELETE" fails validation
    - Test partial match "SUPPRIM" fails validation

- [ ] **Task 1.5.13: Write unit tests for the deletion server action logic** (AC: data deletion and anonymization)
  - Create `src/app/profile/settings/__tests__/delete-account-action.test.ts`:
    - Test that incorrect confirmation text returns an error
    - Test that the transaction performs all expected operations (mock the database):
      1. Votes are deleted
      2. Submissions are anonymized
      3. Comments are anonymized
      4. User PII is scrubbed
      5. `deletedAt` is set
    - Test that session is terminated after deletion
    - Note: Use mocked database for unit tests. Integration tests should verify actual DB operations.

- [ ] **Task 1.5.14: Write component tests for DeleteAccountSection** (AC: danger section rendering)
  - Create `src/components/features/profile/__tests__/DeleteAccountSection.test.tsx`:
    - Test renders "Zone de danger" heading
    - Test renders the "Supprimer mon compte" button with destructive styling
    - Test clicking button opens the dialog

- [ ] **Task 1.5.15: Write component tests for DeleteAccountDialog** (AC: modal content, confirmation input)
  - Create `src/components/features/profile/__tests__/DeleteAccountDialog.test.tsx`:
    - Test modal displays warning text
    - Test confirmation input is present with label
    - Test "Confirmer la suppression" button is disabled when input is empty
    - Test "Confirmer la suppression" button is disabled when input does not match "SUPPRIMER"
    - Test "Confirmer la suppression" button is enabled when input matches "SUPPRIMER"
    - Test "Annuler" button is present and closes the dialog
    - Test loading state shows spinner and disables buttons

- [ ] **Task 1.5.16: Write integration test for full deletion flow** (AC: end-to-end data verification)
  - Create `__tests__/integration/delete-account.test.ts`:
    - Set up: create a test user, create test submissions and votes
    - Execute: run the deletion server action
    - Verify:
      - User's email is replaced with `deleted_{id}@deleted.local`
      - User's `password_hash` is emptied
      - User's `display_name` is null
      - User's `anonymous_id` is "Utilisateur supprime"
      - User's `deleted_at` is set
      - All votes by the user are deleted from `votes` table
      - All submissions by the user have `author_id = NULL` and `author_display = 'Utilisateur supprime'`
      - All comments by the user have `author_id = NULL` and `author_display = 'Utilisateur supprime'`
    - Note: Requires test database. Skip if no database available (mark as integration test).

- [ ] **Task 1.5.17: Verify build and all tests pass** (AC: all tests pass)
  - Run `npm run build` -- must succeed
  - Run `npm run lint` -- must pass
  - Run `npm run test` -- all new tests must pass

## Dev Notes

### Architecture & Patterns

- **Database transaction:** The entire deletion process runs within a single database transaction to ensure atomicity. If any step fails (e.g., anonymizing submissions), nothing is committed.
- **Soft delete with PII scrubbing:** The user record is NOT deleted from the database. Instead:
  - PII fields (email, password_hash, display_name) are cleared/replaced
  - `deletedAt` timestamp is set (audit trail)
  - Email is replaced with `deleted_{userId}@deleted.local` to maintain UNIQUE constraint
  - This approach preserves referential integrity while complying with GDPR Art. 17
- **Server Actions for the mutation:** Uses Next.js Server Actions for CSRF-safe form submission. The deletion action requires authentication and confirmation text.
- **Flash message via cookie:** Since the session is destroyed during deletion, we cannot use session-based flash messages. Instead, a short-lived cookie carries the success message to the redirected page.
- **Cascading effects on foreign keys:** The `ON DELETE SET NULL` on `submissions.author_id` and `comments.author_id` provides a database-level safety net, but the explicit UPDATE in the transaction provides more control (setting `author_display` as well).

### Technical Requirements

| Library | Version | Purpose |
|---|---|---|
| drizzle-orm | 0.45.1 | Transaction support for atomic deletion |
| zod | 3.x | Confirmation text validation |
| shadcn/ui Dialog | 2026-02 | Confirmation modal |
| shadcn/ui Input | 2026-02 | Confirmation text input |
| shadcn/ui Button | 2026-02 | Action buttons (destructive variant) |
| shadcn/ui Separator | 2026-02 | Visual section separation |

### Database Operations

**Transaction operations (in order):**

1. **Delete votes:**
```sql
DELETE FROM votes WHERE user_id = $1;
```

2. **Anonymize submissions:**
```sql
UPDATE submissions
SET author_id = NULL, author_display = 'Utilisateur supprime', updated_at = NOW()
WHERE author_id = $1;
```

3. **Anonymize comments:**
```sql
UPDATE comments
SET author_id = NULL, author_display = 'Utilisateur supprime', updated_at = NOW()
WHERE author_id = $1;
```

4. **Scrub user PII:**
```sql
UPDATE users
SET email = 'deleted_' || id || '@deleted.local',
    password_hash = '',
    display_name = NULL,
    anonymous_id = 'Utilisateur supprime',
    twitter_id = NULL,
    twitter_handle = NULL,
    avatar_url = NULL,
    bio = NULL,
    deleted_at = NOW(),
    updated_at = NOW()
WHERE id = $1;
```

### GDPR Compliance Notes

| GDPR Article | Requirement | Implementation |
|---|---|---|
| Art. 17 (Right to Erasure) | User can request deletion of personal data | All PII is permanently deleted or anonymized |
| Art. 17(3)(a) | Freedom of expression exception | Published submissions are preserved but anonymized (public interest in fiscal transparency) |
| Art. 5(1)(e) | Storage limitation | User record marked with `deletedAt`; eventual hard delete possible in future cleanup |
| Art. 7(3) | Withdrawal of consent | Account deletion withdraws consent; session terminated immediately |
| Art. 12(3) | Timely response | Deletion completes within 30 seconds (AC requirement) |

**What is deleted (PII):**
- Email address
- Password hash
- Display name
- Twitter ID and handle
- Avatar URL
- Bio text
- All vote records

**What is preserved (anonymized, public interest):**
- Submission content (title, description, source URL, cost figures) -- attributed to "Utilisateur supprime"
- Comment content -- attributed to "Utilisateur supprime"
- User record shell (for referential integrity and audit trail)

### File Structure

Files created or modified by this story:

```
src/
├── app/
│   ├── layout.tsx                                    # MODIFIED - Add FlashMessage component
│   └── profile/
│       └── settings/
│           ├── page.tsx                              # MODIFIED - Add DeleteAccountSection
│           └── delete-account-action.ts              # NEW - Deletion server action
├── components/
│   └── features/
│       ├── profile/
│       │   ├── DeleteAccountSection.tsx              # NEW - Danger zone section
│       │   ├── DeleteAccountDialog.tsx               # NEW - Confirmation dialog
│       │   └── __tests__/
│       │       ├── DeleteAccountSection.test.tsx      # NEW
│       │       └── DeleteAccountDialog.test.tsx       # NEW
│       └── common/
│           └── FlashMessage.tsx                      # NEW - Cookie-based flash messages
├── lib/
│   ├── auth/
│   │   └── config.ts                                # MODIFIED - Reject deleted users in authorize
│   ├── api/
│   │   └── users.ts                                 # MODIFIED - Filter deleted users
│   ├── db/
│   │   └── schema.ts                                # MODIFIED - Ensure nullable author_id, authorDisplay columns
│   └── validators/
│       ├── delete-account.ts                         # NEW - Deletion confirmation schema
│       └── __tests__/
│           └── delete-account.test.ts                # NEW
├── __tests__/
│   └── integration/
│       └── delete-account.test.ts                    # NEW - Integration test
drizzle/
└── migrations/
    └── XXXX_account_deletion_support.sql             # NEW - Migration for schema changes
```

### Testing Requirements

- **Unit tests (Vitest):**
  - `delete-account.test.ts` (validators): 5+ test cases for confirmation text validation
  - `delete-account-action.test.ts`: 3+ test cases for action logic (mocked DB)
  - `DeleteAccountSection.test.tsx`: 3+ test cases for rendering and button behavior
  - `DeleteAccountDialog.test.tsx`: 7+ test cases for modal content, button states, loading
- **Integration tests (Vitest with test DB):**
  - `delete-account.test.ts`: 1 comprehensive test verifying all data changes after deletion
- **Coverage target:** >90% on deletion server action, >85% on validators, >70% on components
- **Manual testing checklist:**
  - [ ] "Zone de danger" section appears at bottom of settings page
  - [ ] Clicking "Supprimer mon compte" opens the confirmation dialog
  - [ ] "Confirmer la suppression" button is disabled until "SUPPRIMER" is typed
  - [ ] "Annuler" closes the dialog without any side effects
  - [ ] Successful deletion redirects to `/` with flash message toast
  - [ ] After deletion, trying to log in with old credentials fails
  - [ ] After deletion, visiting the user's public profile shows 404
  - [ ] After deletion, user's submissions show "Utilisateur supprime" as author
  - [ ] After deletion, user's comments show "Utilisateur supprime" as author
  - [ ] After deletion, user's votes are completely removed
  - [ ] The entire deletion completes within 30 seconds

### UX/Design Notes

- **Danger zone styling:**
  - Separated from the rest of settings by a `<Separator />` and `mt-12` spacing
  - Heading "Zone de danger" in `text-chainsaw-red`
  - Explanation text in `text-text-secondary text-sm`
  - Button: outlined in chainsaw-red, turns solid chainsaw-red on hover
  - This follows the destructive button pattern from the UX spec
- **Confirmation dialog styling:**
  - Dark overlay (`bg-black/60`)
  - Dialog: `bg-surface-secondary rounded-xl p-6 max-w-md`
  - Warning icon at the top (triangle exclamation in chainsaw-red)
  - Bulleted list of consequences in `text-text-secondary text-sm`
  - Confirmation input: standard dark theme input with placeholder "Tapez SUPPRIMER"
  - "Confirmer la suppression" button: solid chainsaw-red, disabled state at 50% opacity
  - "Annuler" button: ghost variant, positioned left of confirm button
- **Loading state:** During deletion, both buttons are disabled, the confirm button shows a spinner with "Suppression en cours...", and the dialog cannot be closed
- **Error state:** If deletion fails, show error message in red below the confirmation input with `role="alert"`
- **French copy:**
  - Section heading: "Zone de danger"
  - Section text: "La suppression de votre compte est definitive. Vos signalements publies seront conserves mais anonymises."
  - Button: "Supprimer mon compte"
  - Dialog title: "Supprimer votre compte"
  - Dialog text: "Cette action est irreversible. Toutes vos donnees personnelles seront supprimees. Vos signalements publies seront anonymises."
  - Confirmation label: "Tapez SUPPRIMER pour confirmer"
  - Confirm button: "Confirmer la suppression"
  - Cancel button: "Annuler"
  - Loading text: "Suppression en cours..."
  - Flash message: "Votre compte a ete supprime."
  - Error: "Une erreur est survenue. Veuillez reessayer."

### Dependencies

- **Depends on:** Story 1.1 (Project Scaffold), Story 1.2 (Registration & Login -- users table, auth config), Story 1.3 (Display Name -- settings page), Story 1.4 (User Profile -- profile infrastructure).
- **Depended on by:** No direct downstream dependencies within Epic 1. However, all future stories that create user-associated data (submissions, comments, votes) must be aware of the deletion pattern:
  - Foreign keys to `users.id` should use `ON DELETE SET NULL`
  - All user-facing data must handle the "Utilisateur supprime" author display
  - The `deletedAt` field must be checked in all user queries

### References

- [Source: epics.md#Story 1.5] -- Acceptance criteria for account deletion
- [Source: architecture.md#Section 3.1] -- Database schema (users, submissions, comments, votes tables)
- [Source: architecture.md#Section 3.2] -- Auth.js authorize callback, session management
- [Source: prd.md#FR25] -- Registered users can delete their account and all associated personal data
- [Source: prd.md#GDPR/RGPD Compliance] -- Right to erasure, data minimization, consent withdrawal
- [Source: prd.md#NFR8] -- Legal compliance (RGPD)
- [Source: ux-design-specification.md#Button Hierarchy] -- Destructive button styling
- [Source: ux-design-specification.md#Feedback Patterns] -- Error and success toast patterns
- [Source: ux-design-specification.md#Form Patterns] -- Error recovery, submit button states

## Dev Agent Record

### Agent Model Used
(To be filled by dev agent)

### Completion Notes List
(To be filled during implementation)

### Change Log
(To be filled during implementation)

### File List
(To be filled during implementation)
