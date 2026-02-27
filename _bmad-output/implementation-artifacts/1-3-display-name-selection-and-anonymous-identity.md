# Story 1.3: Display Name Selection & Anonymous Identity

Status: ready-for-dev

## Story

As a registered user (Nicolas),
I want to choose a display name or keep my auto-generated anonymous identity,
so that I can participate publicly or anonymously according to my preference.

## Acceptance Criteria (BDD)

**Given** a user has just completed registration and is logged in,
**When** they are redirected to `/feed` for the first time,
**Then** a modal or inline prompt appears inviting them to set a display name, with the text: "Bienvenue ! Vous pouvez choisir un pseudonyme ou rester anonyme en tant que {anonymous_id}.",
**And** the prompt contains an input field `display_name` (max 100 chars) and two buttons: "Choisir ce pseudo" and "Rester anonyme".

**Given** the user enters a display name and clicks "Choisir ce pseudo",
**When** the request is processed,
**Then** the `users.display_name` column is updated with the entered value,
**And** the display name is shown in the navigation bar and on their profile page,
**And** the display name must not contain the strings "admin", "moderat", or "liberal" (case-insensitive).

**Given** the user clicks "Rester anonyme",
**When** the prompt is dismissed,
**Then** the `users.display_name` remains null,
**And** everywhere the user's name would appear, the system displays the `anonymous_id` value (e.g., "Nicolas #0042").

**Given** a registered user navigates to `/profile/settings`,
**When** the settings page renders,
**Then** the user can change their display name at any time,
**And** a preview shows how their name will appear on submissions and comments.

## Tasks / Subtasks

### Phase 1: Validation & Server Logic

- [ ] **Task 1.3.1: Create display name validation schema** (AC: max 100 chars, forbidden strings)
  - Create `src/lib/validators/display-name.ts`:
    ```typescript
    import { z } from 'zod';

    const FORBIDDEN_STRINGS = ['admin', 'moderat', 'liberal', 'liberale', 'libéral', 'libérale'];

    export const displayNameSchema = z.object({
      displayName: z
        .string()
        .min(2, 'Le pseudonyme doit contenir au moins 2 caracteres')
        .max(100, 'Le pseudonyme ne peut pas depasser 100 caracteres')
        .refine(
          (name) => !FORBIDDEN_STRINGS.some((forbidden) =>
            name.toLowerCase().includes(forbidden)
          ),
          'Ce pseudonyme contient un terme reserve'
        )
        .refine(
          (name) => /^[a-zA-Z0-9\u00C0-\u024F\s._-]+$/.test(name),
          'Le pseudonyme ne peut contenir que des lettres, chiffres, espaces, points, tirets et underscores'
        ),
    });

    export type DisplayNameInput = z.infer<typeof displayNameSchema>;
    ```

- [ ] **Task 1.3.2: Create server action for setting display name** (AC: update display_name column)
  - Create `src/app/profile/settings/actions.ts`:
    ```typescript
    'use server';

    import { db } from '@/lib/db';
    import { users } from '@/lib/db/schema';
    import { requireAuth } from '@/lib/auth/helpers';
    import { displayNameSchema } from '@/lib/validators/display-name';
    import { eq } from 'drizzle-orm';
    import { revalidatePath } from 'next/cache';

    export async function updateDisplayNameAction(formData: FormData) {
      const user = await requireAuth();

      const rawData = {
        displayName: formData.get('displayName') as string,
      };

      const parsed = displayNameSchema.safeParse(rawData);
      if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
      }

      await db.update(users)
        .set({
          displayName: parsed.data.displayName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      revalidatePath('/profile');
      revalidatePath('/profile/settings');

      return { success: true };
    }

    export async function dismissDisplayNamePromptAction() {
      // Mark that the user has seen the prompt (store in cookie or user record)
      // This prevents the prompt from reappearing on subsequent visits
      const user = await requireAuth();

      // Option: set a flag in a cookie or a user preferences column
      // For MVP, use a cookie approach
      return { success: true };
    }
    ```

- [ ] **Task 1.3.3: Create a utility function to resolve display name** (AC: anonymous_id fallback)
  - Create `src/lib/utils/user-display.ts`:
    ```typescript
    export function resolveDisplayName(
      displayName: string | null,
      anonymousId: string
    ): string {
      return displayName ?? anonymousId;
    }

    export function maskEmail(email: string): string {
      const [local, domain] = email.split('@');
      if (!local || !domain) return '***@***';
      const maskedLocal = local.charAt(0) + '***';
      return `${maskedLocal}@${domain}`;
    }
    ```

### Phase 2: Welcome Modal Component

- [ ] **Task 1.3.4: Create `<WelcomeDisplayNameModal />` component** (AC: modal with prompt, input, two buttons)
  - Create `src/components/features/auth/WelcomeDisplayNameModal.tsx`
  - Mark as `'use client'`
  - Use shadcn/ui `<Dialog />`, `<Input />`, `<Button />` components
  - Props:
    ```typescript
    interface WelcomeDisplayNameModalProps {
      open: boolean;
      onClose: () => void;
      anonymousId: string;
    }
    ```
  - Content:
    - Title: "Bienvenue !" (using `font-display text-xl text-text-primary`)
    - Body text: "Vous pouvez choisir un pseudonyme ou rester anonyme en tant que **{anonymousId}**."
    - Input field: `<Input placeholder="Votre pseudonyme" maxLength={100} />` with `<label>Pseudonyme</label>`
    - Character counter: "{count}/100" displayed below the input in `text-text-muted text-sm`
    - Button "Choisir ce pseudo": `<Button className="bg-chainsaw-red">` -- calls `updateDisplayNameAction`
    - Button "Rester anonyme": `<Button variant="ghost">` -- calls `dismissDisplayNamePromptAction` and closes modal
  - Inline validation error below input with `role="alert"` for forbidden strings
  - Live preview: "Vous apparaitrez comme: **{enteredName || anonymousId}**" shown below the input
  - Modal is not dismissible by clicking outside (must choose one option) -- set `onInteractOutside={(e) => e.preventDefault()}` on DialogContent
  - All interactive elements have `:focus-visible` styling

- [ ] **Task 1.3.5: Integrate the welcome modal into the feed page** (AC: modal appears for first-time users)
  - Modify the feed layout or page to check if the current user:
    1. Is authenticated
    2. Has `display_name === null`
    3. Has NOT previously dismissed the prompt (check cookie `liberal_welcome_dismissed`)
  - If all conditions met, render `<WelcomeDisplayNameModal open={true} anonymousId={user.anonymousId} />`
  - After the user makes a choice (set name or stay anonymous), set a cookie `liberal_welcome_dismissed=true` to prevent the modal from reappearing
  - Create a wrapper component `src/components/features/auth/WelcomePromptWrapper.tsx`:
    - Marked as `'use client'`
    - Checks cookie and user state
    - Conditionally renders the modal

### Phase 3: Profile Settings Page

- [ ] **Task 1.3.6: Create the profile settings page** (AC: user can change display name at any time)
  - Create `src/app/profile/settings/page.tsx`:
    - Server Component
    - Protect with `requireAuth()` -- redirect to `/auth/login` if unauthenticated
    - Fetch current user data from database
    - Render page title "Parametres du profil"
    - Render `<DisplayNameForm />` client component with current display name and anonymous ID as props
    - Metadata: `export const metadata = { title: 'Parametres du profil' };`

- [ ] **Task 1.3.7: Create `<DisplayNameForm />` component for settings** (AC: change display name, preview)
  - Create `src/components/features/profile/DisplayNameForm.tsx`
  - Mark as `'use client'`
  - Props:
    ```typescript
    interface DisplayNameFormProps {
      currentDisplayName: string | null;
      anonymousId: string;
    }
    ```
  - Content:
    - Section heading: "Pseudonyme" (h2)
    - Current display: "Vous apparaissez actuellement comme: **{currentDisplayName || anonymousId}**"
    - Input field: `<Input defaultValue={currentDisplayName ?? ''} maxLength={100} />` with `<label>Nouveau pseudonyme</label>`
    - Character counter: "{count}/100"
    - Live preview: "Apercu: **{enteredName || anonymousId}**" -- shows how the name will appear on submissions and comments
    - Submit button: "Mettre a jour" (`<Button className="bg-chainsaw-red">`)
    - Reset to anonymous button: "Revenir a l'anonymat" (`<Button variant="ghost">`) -- sets display_name to null
    - Inline validation errors with `role="alert"`
    - Success toast: "Pseudonyme mis a jour" on successful change
    - All fields have visible labels and `:focus-visible` styling

- [ ] **Task 1.3.8: Create server action to reset to anonymous** (AC: display_name remains null)
  - Add to `src/app/profile/settings/actions.ts`:
    ```typescript
    export async function resetToAnonymousAction() {
      const user = await requireAuth();

      await db.update(users)
        .set({
          displayName: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      revalidatePath('/profile');
      revalidatePath('/profile/settings');

      return { success: true };
    }
    ```

### Phase 4: Navigation Display Name Integration

- [ ] **Task 1.3.9: Update `<DesktopNav />` to show display name** (AC: display name shown in navigation bar)
  - Modify `src/components/layout/DesktopNav.tsx`:
    - Fetch the current session via `useSession()` from `next-auth/react`
    - If authenticated, display the user's name (displayName or anonymousId) in the top-right user menu area
    - Add a dropdown menu (shadcn/ui `<DropdownMenu />`) with options:
      - "Mon profil" -> `/profile`
      - "Parametres" -> `/profile/settings`
      - Separator
      - "Se deconnecter" -> calls `signOut()`
    - If not authenticated, display "Se connecter" link to `/auth/login`

- [ ] **Task 1.3.10: Update `<MobileTabBar />` to reflect auth state** (AC: display name shown)
  - Modify `src/components/layout/MobileTabBar.tsx`:
    - The Profile tab should show the user's avatar initial or a user icon
    - If authenticated, the Profile tab navigates to `/profile`
    - If not authenticated, the Profile tab navigates to `/auth/login`

- [ ] **Task 1.3.11: Add SessionProvider to Providers component** (AC: session available to client components)
  - Modify `src/components/layout/Providers.tsx`:
    - Import `SessionProvider` from `next-auth/react`
    - Wrap children in `<SessionProvider>` so that `useSession()` is available throughout the app
    - Pass the server-side session as a prop to avoid an extra API call

### Phase 5: Testing

- [ ] **Task 1.3.12: Write unit tests for display name validation** (AC: forbidden strings, max length)
  - Create `src/lib/validators/__tests__/display-name.test.ts`:
    - Test valid display names pass validation
    - Test display name containing "admin" (case-insensitive) is rejected
    - Test display name containing "moderat" is rejected
    - Test display name containing "liberal" is rejected
    - Test display name exceeding 100 chars is rejected
    - Test display name with special characters (accented French characters) is accepted
    - Test display name with only 1 character is rejected (min 2)

- [ ] **Task 1.3.13: Write unit tests for `resolveDisplayName` utility** (AC: anonymous_id fallback)
  - Create `src/lib/utils/__tests__/user-display.test.ts`:
    - Test returns display name when not null
    - Test returns anonymous_id when display name is null
    - Test `maskEmail` correctly masks email addresses

- [ ] **Task 1.3.14: Write component tests for WelcomeDisplayNameModal** (AC: modal content, buttons)
  - Create `src/components/features/auth/__tests__/WelcomeDisplayNameModal.test.tsx`:
    - Test modal renders welcome text with anonymous_id
    - Test input field is present with label
    - Test "Choisir ce pseudo" button is present
    - Test "Rester anonyme" button is present
    - Test live preview updates when typing

- [ ] **Task 1.3.15: Write component tests for DisplayNameForm** (AC: settings form, preview)
  - Create `src/components/features/profile/__tests__/DisplayNameForm.test.tsx`:
    - Test form renders with current display name pre-filled
    - Test form renders with anonymous_id when no display name
    - Test live preview shows entered name
    - Test character counter displays correctly

- [ ] **Task 1.3.16: Verify build and tests pass** (AC: all tests pass)
  - Run `npm run build` -- must succeed
  - Run `npm run lint` -- must pass
  - Run `npm run test` -- all new tests must pass

## Dev Notes

### Architecture & Patterns

- **Server Actions for mutations:** Display name updates use Next.js Server Actions for CSRF-safe form submissions.
- **Cookie-based prompt tracking:** The welcome modal dismissal is tracked via a cookie (`liberal_welcome_dismissed`) rather than a database column to keep the implementation lightweight. This means the prompt may reappear if cookies are cleared, which is acceptable for MVP.
- **Display name resolution pattern:** Use the `resolveDisplayName(displayName, anonymousId)` utility everywhere a user's name is displayed. Never access `displayName` directly without the fallback.
- **Revalidation:** After display name changes, `revalidatePath` is called on profile-related routes to ensure Server Components re-render with updated data.
- **Session refresh:** After display name update, the session JWT's `name` field should reflect the new display name. This may require a session update callback or a page refresh.

### Technical Requirements

| Library | Version | Purpose |
|---|---|---|
| zod | 3.x | Display name validation |
| next-auth | 5.x | Session management, useSession hook |
| shadcn/ui Dialog | 2026-02 | Welcome modal |
| shadcn/ui Input | 2026-02 | Form inputs |
| shadcn/ui Button | 2026-02 | Action buttons |
| shadcn/ui DropdownMenu | 2026-02 | User menu in DesktopNav |

### Database Schema

This story does NOT create new tables. It modifies existing data in the `users` table:

| Column | Operation | Notes |
|---|---|---|
| `users.display_name` | UPDATE | Set to user-provided name or left as NULL |
| `users.updated_at` | UPDATE | Set to current timestamp on name change |

### File Structure

Files created or modified by this story:

```
src/
├── app/
│   ├── profile/
│   │   └── settings/
│   │       ├── page.tsx                          # NEW - Settings page
│   │       └── actions.ts                        # NEW - Display name server actions
│   └── feed/
│       └── [sort]/
│           └── page.tsx                          # MODIFIED - Integrate welcome modal
├── components/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── WelcomeDisplayNameModal.tsx       # NEW - Welcome modal component
│   │   │   ├── WelcomePromptWrapper.tsx          # NEW - Conditional modal wrapper
│   │   │   └── __tests__/
│   │   │       └── WelcomeDisplayNameModal.test.tsx  # NEW
│   │   └── profile/
│   │       ├── DisplayNameForm.tsx               # NEW - Settings display name form
│   │       └── __tests__/
│   │           └── DisplayNameForm.test.tsx       # NEW
│   └── layout/
│       ├── DesktopNav.tsx                        # MODIFIED - User menu with display name
│       ├── MobileTabBar.tsx                      # MODIFIED - Auth-aware profile tab
│       └── Providers.tsx                         # MODIFIED - Add SessionProvider
├── lib/
│   ├── validators/
│   │   ├── display-name.ts                       # NEW - Display name validation
│   │   └── __tests__/
│   │       └── display-name.test.ts              # NEW
│   └── utils/
│       ├── user-display.ts                       # NEW - Display name resolution
│       └── __tests__/
│           └── user-display.test.ts              # NEW
```

### Testing Requirements

- **Unit tests (Vitest):**
  - `display-name.test.ts`: 7+ test cases for validation rules (forbidden strings, max length, min length, special chars)
  - `user-display.test.ts`: 3+ test cases for display name resolution and email masking
  - `WelcomeDisplayNameModal.test.tsx`: 5+ test cases for modal rendering, buttons, and preview
  - `DisplayNameForm.test.tsx`: 4+ test cases for form rendering and preview behavior
- **Coverage target:** >85% on validators, >70% on components
- **Manual testing checklist:**
  - [ ] After registration, welcome modal appears on first visit to feed
  - [ ] Entering a display name and clicking "Choisir ce pseudo" updates the name
  - [ ] Clicking "Rester anonyme" dismisses the modal and keeps anonymous_id
  - [ ] Modal does not reappear on subsequent visits after choice is made
  - [ ] Display name appears in DesktopNav user menu
  - [ ] Profile settings page allows changing display name
  - [ ] Live preview in settings shows how name will appear
  - [ ] Forbidden strings ("admin", "moderat", "liberal") are rejected
  - [ ] Reset to anonymous works from settings page

### UX/Design Notes

- **Welcome modal styling:**
  - Dark background overlay (`bg-black/60`)
  - Modal card: `bg-surface-secondary rounded-xl p-6 max-w-md`
  - Not dismissible by clicking outside -- user must make a choice
  - Title in Space Grotesk (`font-display`), body in Inter
  - Anonymous ID displayed in bold with `text-chainsaw-red` color
- **Settings page layout:**
  - Left-aligned form within `max-w-2xl` container
  - Section heading "Pseudonyme" with explanation text
  - Preview rendered in a card-like box with `bg-surface-elevated rounded-lg p-4`
  - Clear visual separation between "update" and "reset to anonymous" actions
- **Live preview format:** Shows a mini SubmissionCard-like preview with the name: "Soumis par **{name}** - il y a 2 minutes"
- **Success feedback:** Toast notification "Pseudonyme mis a jour avec succes" with green left border
- **French copy:**
  - Welcome title: "Bienvenue !"
  - Welcome body: "Vous pouvez choisir un pseudonyme ou rester anonyme en tant que {anonymousId}."
  - Choose button: "Choisir ce pseudo"
  - Stay anonymous button: "Rester anonyme"
  - Settings heading: "Pseudonyme"
  - Update button: "Mettre a jour"
  - Reset button: "Revenir a l'anonymat"
  - Forbidden string error: "Ce pseudonyme contient un terme reserve"

### Dependencies

- **Depends on:** Story 1.1 (Project Scaffold), Story 1.2 (Registration & Login) -- requires the users table, auth configuration, and session management to be in place.
- **Depended on by:** Story 1.4 (User Profile) -- the profile page needs display name resolution. All future stories displaying user names depend on the `resolveDisplayName` utility.

### References

- [Source: epics.md#Story 1.3] -- Acceptance criteria for display name selection
- [Source: architecture.md#Section 3.1] -- Users table schema (display_name column)
- [Source: architecture.md#Section 3.2] -- Auth.js session callbacks (name in session)
- [Source: prd.md#FR23] -- Registered users can choose a display name or remain anonymous as "Nicolas #XXXX"
- [Source: ux-design-specification.md#Anonymous participation] -- Pseudonymous accounts, low barrier
- [Source: ux-design-specification.md#Form Patterns] -- Inline validation, error recovery
- [Source: ux-design-specification.md#Button Hierarchy] -- Primary vs secondary vs ghost buttons

## Dev Agent Record

### Agent Model Used
(To be filled by dev agent)

### Completion Notes List
(To be filled during implementation)

### Change Log
(To be filled during implementation)

### File List
(To be filled during implementation)
