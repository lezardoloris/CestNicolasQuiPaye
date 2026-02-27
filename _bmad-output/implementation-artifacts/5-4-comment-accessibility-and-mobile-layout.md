# Story 5.4: Comment Accessibility & Mobile Layout

## Story

**As a** visitor using assistive technology or a mobile device,
**I want** comments to be fully accessible and well-formatted on small screens,
**So that** I can read and participate in discussions regardless of device or ability.

## Status

**Status:** Draft
**Epic:** 5 -- Comments & Community Discussion
**Priority:** High
**Estimate:** 5 story points
**FRs:** FR19 (comments), FR20 (threading -- 2-level nesting on mobile / 4-level on desktop)
**NFRs:** NFR17 (RGAA AA conformance), NFR18 (visible focus indicators with 3:1 contrast ratio), NFR19 (4.5:1 text contrast ratio), NFR20 (form labels, error messages programmatically linked)

---

## Acceptance Criteria (BDD)

### AC 1: Screen reader -- comment semantic structure

```gherkin
Given the comment section is rendered,
When a screen reader traverses the comments,
Then each comment has `role="article"` with an `aria-label`:
  "{author_display} a commenté : {body (truncated to 50 chars)}, score : {score}" (NFR17),
And the reply button has `aria-label="Répondre au commentaire de {author_display}"`,
And threaded replies are wrapped in a `<section>` with `aria-label="Réponses au commentaire de {author_display}"`,
And the comment section container has `role="region"` with `aria-label="Commentaires"`.
```

### AC 2: Screen reader -- live region announcements

```gherkin
Given a user posts a new comment,
When the comment appears in the thread (optimistic update),
Then a screen reader announces "Commentaire publié" via an `aria-live="polite"` live region.

Given a user casts a vote on a comment,
When the vote count changes,
Then the vote count element has `aria-live="polite"` and the screen reader announces the updated score.

Given new comments are loaded (pagination or reply expansion),
When they appear in the DOM,
Then a screen reader announces "X nouveaux commentaires chargés" via an `aria-live="polite"` live region.
```

### AC 3: Mobile layout -- nesting and indentation

```gherkin
Given the comment section is rendered on a mobile viewport (< 768px),
When the user views comments,
Then depth-0 comments have no left indentation,
And depth-1 replies are indented by 16px with a `border-left: 2px solid #DC2626` (chainsaw-red),
And depth-2 replies are indented by 32px with the same border style,
And all comment action buttons (vote, reply) have a minimum tap target of 44x44px.
```

### AC 4: Desktop layout -- wider nesting

```gherkin
Given the comment section is rendered on a desktop viewport (>= 1024px),
When the user views comments,
Then depth-0 comments have no left indentation,
And depth-1 replies are indented by 32px with a `border-left: 2px solid #DC2626`,
And depth-2 replies are indented by 64px with the same border style,
And comment action buttons have standard sizing (no special touch target enforcement).
```

### AC 5: Keyboard navigation -- tab order

```gherkin
Given a user navigates comments with keyboard only,
When they press Tab within the comment section,
Then focus moves through in this order:
  1. Comment body (if focusable, or the article container)
  2. Upvote button
  3. Downvote button
  4. Reply button (if visible, i.e., depth < 2)
  5. Then to the next comment
And all focused elements have a visible `ring-2 ring-chainsaw-red` outline (NFR18),
And the focus ring has a minimum 3:1 contrast ratio against both light and dark backgrounds.
```

### AC 6: Keyboard navigation -- reply form

```gherkin
Given a user activates the "Répondre" button via keyboard (Enter or Space),
When the reply form expands inline below the comment,
Then focus automatically moves to the reply textarea,
And the user can type, then press Tab to reach "Publier la réponse",
And pressing Escape closes the reply form and returns focus to the "Répondre" button.
```

### AC 7: Focus management on new comment

```gherkin
Given a user submits a new comment (top-level or reply),
When the comment appears in the thread (optimistic update),
Then focus moves to the newly created comment element,
And the screen reader announces "Commentaire publié" via the live region.
```

### AC 8: Color contrast compliance

```gherkin
Given any text in the comment section,
When its contrast ratio is measured,
Then all body text meets a minimum 4.5:1 contrast ratio against the background (NFR19),
And all small text (timestamps, metadata) meets a minimum 4.5:1 contrast ratio,
And the chainsaw-red border-left (#DC2626) against the surface background has at minimum 3:1 contrast,
And vote count numbers meet 4.5:1 contrast.
```

### AC 9: Text scaling

```gherkin
Given a user has their browser font size scaled to 200%,
When the comment section renders,
Then all text scales proportionally without horizontal scroll,
And the comment layout remains readable and functional,
And no text is clipped or overlaps.
```

### AC 10: Form accessibility

```gherkin
Given the comment form is rendered (top-level or reply),
Then the textarea has an associated `<label>` ("Votre commentaire") via `htmlFor` / `id` pairing (NFR20),
And the character counter is associated with the textarea via `aria-describedby`,
And error messages are programmatically linked to the textarea via `aria-describedby` (NFR20),
And required fields are indicated with `aria-required="true"`,
And the submit button state (disabled/enabled) is conveyed via `aria-disabled`.
```

### AC 11: Reduced motion

```gherkin
Given a user has `prefers-reduced-motion: reduce` enabled in their OS settings,
When comment interactions occur (vote animation, new comment slide-in, counter bounce),
Then all animations are suppressed or reduced to opacity-only transitions,
And the comment section remains fully functional without motion.
```

### AC 12: Mobile collapse for deep threads

```gherkin
Given the comment section is rendered on a mobile viewport (< 768px),
And a comment thread has replies at depth 2 (maximum),
When the thread renders,
Then depth-0 and depth-1 comments are fully visible,
And depth-2 comments are visible but at maximum indentation (32px),
And no "Répondre" button is shown on depth-2 comments (enforced by Story 5.1),
And the total horizontal space consumed by indentation never exceeds 32px on mobile.
```

---

## Tasks / Subtasks

### Task 1: Semantic HTML Structure

- [ ] 1.1: Wrap each comment in an `<article>` element with `role="article"`
- [ ] 1.2: Add `aria-label` to each comment article:
  ```
  "{author_display} a commenté : {truncatedBody}, score : {score}"
  ```
  (body truncated to 50 characters)
- [ ] 1.3: Wrap the entire comment section in a `<section role="region" aria-label="Commentaires">`
- [ ] 1.4: Wrap threaded replies in a nested `<section>` with:
  ```
  aria-label="Réponses au commentaire de {author_display}"
  ```
- [ ] 1.5: Add `aria-label` to reply buttons: `"Répondre au commentaire de {author_display}"`
- [ ] 1.6: Add `lang="fr"` to the comment section (inherits from page `<html lang="fr">` but explicit for clarity)

### Task 2: ARIA Live Regions

- [ ] 2.1: Add a visually-hidden `<div aria-live="polite" aria-atomic="true">` at the top of the comment section for announcements
- [ ] 2.2: On new comment submission: set live region text to "Commentaire publié"
- [ ] 2.3: On comment vote: update vote count element with `aria-live="polite"` to announce score changes
- [ ] 2.4: On pagination/reply expansion: set live region text to "{n} nouveaux commentaires chargés"
- [ ] 2.5: Clear live region text after 3 seconds to prevent re-announcement

### Task 3: Keyboard Navigation

- [ ] 3.1: Ensure correct tab order within each comment: body -> upvote -> downvote -> reply -> next comment
- [ ] 3.2: Make comment `<article>` elements focusable via `tabIndex={0}` (for keyboard users to navigate between comments)
- [ ] 3.3: Add visible focus styles: `focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2`
- [ ] 3.4: Ensure focus ring has >= 3:1 contrast against both dark background (#0F0F0F) and light background (#FFFFFF)
- [ ] 3.5: Implement reply form keyboard flow:
  - Enter/Space on "Répondre" opens reply form, focuses textarea
  - Tab from textarea moves to "Publier la réponse" button
  - Escape closes reply form, returns focus to "Répondre" button
- [ ] 3.6: Add keyboard shortcut hint for reply (optional): "Répondre (R)" with `accessKey` attribute

### Task 4: Focus Management

- [ ] 4.1: On new comment submission, programmatically move focus to the newly inserted comment `<article>`:
  ```typescript
  const newCommentRef = useRef<HTMLElement>(null);
  // After optimistic insert:
  newCommentRef.current?.focus();
  ```
- [ ] 4.2: On reply form open, programmatically move focus to the reply textarea
- [ ] 4.3: On reply form close (Escape or cancel button), return focus to the "Répondre" button
- [ ] 4.4: On "Charger plus de commentaires" completion, move focus to the first newly loaded comment
- [ ] 4.5: On "Voir {n} autres réponses" completion, move focus to the first newly loaded reply

### Task 5: Mobile-Responsive Indentation

- [ ] 5.1: Implement responsive indentation with Tailwind classes:
  ```tsx
  // Mobile (< 768px): 16px per level, max 32px
  // Desktop (>= 1024px): 32px per level, max 64px
  const indentClasses = {
    0: '',
    1: 'ml-4 lg:ml-8 border-l-2 border-chainsaw-red pl-3',
    2: 'ml-8 lg:ml-16 border-l-2 border-chainsaw-red pl-3',
  };
  ```
- [ ] 5.2: Ensure `border-left: 2px solid #DC2626` on all indented replies (both mobile and desktop)
- [ ] 5.3: Set minimum tap targets on mobile:
  ```tsx
  // All interactive elements in comments
  className="min-h-[44px] min-w-[44px]"
  ```
- [ ] 5.4: Ensure vote buttons have 44x44px touch targets on mobile, standard sizing on desktop
- [ ] 5.5: Test that 32px max indentation on mobile does not squeeze comment content below readable width (minimum 200px body width)

### Task 6: Color Contrast Verification

- [ ] 6.1: Verify all comment body text passes 4.5:1 contrast:
  - Dark mode: white/light gray text (#E5E5E5 or brighter) on dark surface (#0F0F0F or #1A1A1A)
  - Light mode: dark text (#1A1A1A or darker) on white/light surface
- [ ] 6.2: Verify timestamp text passes 4.5:1 contrast (often a lighter secondary color -- ensure it meets ratio)
- [ ] 6.3: Verify score/vote count text passes 4.5:1 contrast
- [ ] 6.4: Verify chainsaw-red border (#DC2626) against surface passes 3:1 for non-text elements
- [ ] 6.5: Verify focus ring (`ring-chainsaw-red`) passes 3:1 against both dark and light backgrounds
- [ ] 6.6: Add axe-core automated checks to component tests

### Task 7: Form Accessibility

- [ ] 7.1: Associate `<label>` with textarea via matching `htmlFor` / `id`
- [ ] 7.2: Add `aria-describedby` linking textarea to:
  - Character counter element (`id="comment-char-count"`)
  - Error message element (`id="comment-error"`, only when visible)
- [ ] 7.3: Add `aria-required="true"` to the textarea
- [ ] 7.4: Add `aria-invalid="true"` when validation error is displayed
- [ ] 7.5: Add `aria-disabled="true"` to the submit button when disabled (in addition to HTML `disabled` attribute for screen reader clarity)
- [ ] 7.6: Ensure error messages are announced by screen reader when they appear (via `aria-live` or `role="alert"`)

### Task 8: Reduced Motion Support

- [ ] 8.1: Wrap all comment animations in `prefers-reduced-motion` media query:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .comment-animation {
      animation: none;
      transition: opacity 0.1s ease;
    }
  }
  ```
- [ ] 8.2: For Motion (Framer Motion) animations, use the `useReducedMotion` hook:
  ```typescript
  import { useReducedMotion } from 'motion/react';
  const shouldReduceMotion = useReducedMotion();
  ```
- [ ] 8.3: Vote counter bounce animation: skip or use opacity fade when reduced motion is preferred
- [ ] 8.4: New comment slide-in: skip or use instant appear when reduced motion is preferred

### Task 9: Text Scaling

- [ ] 9.1: Ensure all comment text uses `rem` or `em` units (not `px` for font sizes)
- [ ] 9.2: Test at 200% browser zoom: verify no horizontal scroll, no text clipping, no layout breakage
- [ ] 9.3: Ensure comment indentation uses `px` (structural) while text uses `rem` (scalable)
- [ ] 9.4: Verify character counter and metadata remain visible at 200% zoom

### Task 10: Testing

- [ ] 10.1: Automated accessibility audit with axe-core on CommentThread, CommentItem, CommentForm
- [ ] 10.2: Manual screen reader test plan:
  - VoiceOver (macOS/iOS): navigate through comment thread, hear aria-labels, submit comment, hear announcement
  - NVDA (Windows): same test flow
  - TalkBack (Android): same test flow
- [ ] 10.3: Keyboard navigation tests:
  - Tab through comment section: verify focus order
  - Open reply form via keyboard, type, submit, verify focus management
  - Escape to close reply form, verify focus return
- [ ] 10.4: Color contrast tests with Chrome DevTools contrast checker on all text elements
- [ ] 10.5: Mobile responsive tests:
  - 375px width (iPhone SE): verify indentation, tap targets, no horizontal overflow
  - 390px width (iPhone 14): same checks
  - 768px width (iPad): verify tablet layout
  - 1024px+ width (desktop): verify wider indentation
- [ ] 10.6: Text scaling test at 150% and 200% browser zoom
- [ ] 10.7: Reduced motion test: enable `prefers-reduced-motion` and verify all animations are suppressed
- [ ] 10.8: Component tests with @testing-library/react and axe-core integration:
  ```typescript
  import { axe } from 'jest-axe'; // or vitest-axe
  const { container } = render(<CommentThread {...props} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  ```

---

## Dev Notes

### Architecture

- **Accessibility-first component design:** All accessibility requirements (ARIA, focus management, keyboard navigation) are integrated directly into the component implementations from Stories 5.1-5.3. This story ensures those requirements are properly implemented and tested.
- **RGAA AA conformance:** The target is RGAA Level AA, aligned with WCAG 2.1 AA. This is legally recommended for French public-facing web platforms. All comment-related components must pass both automated (axe-core) and manual accessibility audits.
- **Mobile-first responsive design:** Base styles are mobile. `md:` (768px) adds tablet enhancements. `lg:` (1024px) adds desktop layout. The indentation system uses Tailwind responsive prefixes.
- **Live region strategy:** A single persistent `aria-live="polite"` region at the top of the comment section handles all announcements. Content is updated programmatically and cleared after 3 seconds to prevent stale announcements.
- **Focus trap avoidance:** The comment section uses natural tab order (no keyboard traps). The reply form is an expansion, not a modal, so it doesn't require a focus trap -- just careful focus management (move focus in on open, return on close).

### Tech Stack

| Technology | Version | Usage in This Story |
|---|---|---|
| Next.js | 16.1.6 | App Router, RSC hydration |
| React | 19.x | useRef for focus management, useEffect for live regions |
| Tailwind CSS | 4.2.0 | Responsive indentation, focus styles, contrast utilities |
| shadcn/ui | 2026-02 | Textarea (accessible), Button (focus states), Avatar |
| Motion (Framer Motion) | 12.34.x | `useReducedMotion` hook for motion preferences |
| axe-core | latest | Automated accessibility testing |
| Vitest | 4.0.18 | Component and accessibility tests |
| @testing-library/react | latest | Render components for testing |

### Key Files

| File | Purpose |
|---|---|
| `src/components/features/comments/CommentThread.tsx` | Add ARIA region, live region, section semantics |
| `src/components/features/comments/CommentItem.tsx` | Add `role="article"`, `aria-label`, focus styles, tab order |
| `src/components/features/comments/CommentForm.tsx` | Add form ARIA attributes, error linking, focus management |
| `src/components/features/comments/CommentVoteButton.tsx` | Add `aria-live` on vote count, focus styles, tap targets |
| `src/components/features/comments/CommentSkeleton.tsx` | Add `aria-hidden="true"`, `role="status"` |
| `src/app/globals.css` | Reduced motion media queries, focus ring styles |

### Responsive Indentation Reference

```
Mobile (< 768px):
  depth 0: |Comment text here...                              |
  depth 1: | | Comment text here... (16px indent + 2px border)|
  depth 2: | | | Comment text (32px indent + 2px border)      |

Desktop (>= 1024px):
  depth 0: |Comment text here...                              |
  depth 1: |    | Comment text here... (32px indent + border) |
  depth 2: |        | Comment text (64px indent + border)     |
```

### ARIA Label Templates

```
Comment article:   "{author} a commenté : {body50chars}, score : {score}"
Reply button:      "Répondre au commentaire de {author}"
Replies section:   "Réponses au commentaire de {author}"
Comment region:    "Commentaires"
Vote count:        aria-live="polite", aria-label="Score : {score}"
New comment:       "Commentaire publié" (live region)
Loaded comments:   "{n} nouveaux commentaires chargés" (live region)
```

### Testing Strategy

| Test Type | Tool | Coverage Target |
|---|---|---|
| Automated a11y: axe-core | Vitest + axe-core | Zero violations on CommentThread, CommentItem, CommentForm |
| Manual: Screen reader | VoiceOver, NVDA, TalkBack | Full comment flow (read, vote, reply, submit) |
| Manual: Keyboard | Manual testing | Tab order, focus management, Escape handling |
| Automated: Contrast | Chrome DevTools | All text >= 4.5:1, non-text >= 3:1 |
| Automated: Responsive | Vitest + viewport mocks | Mobile (375px), tablet (768px), desktop (1024px+) |
| Automated: Text scaling | Browser zoom test | 200% zoom, no horizontal scroll |
| Automated: Reduced motion | Media query mock | All animations suppressed |
| Automated: Form a11y | axe-core | Labels, describedby, required, invalid states |

### UX Reference

- **CommentThread accessibility:** from UX spec -- "Semantic nested `<article>` elements. ARIA labels on reply buttons. Screen reader announces thread depth."
- **Mobile threading:** from UX spec -- "Maximum 2 levels on mobile. 'Continue thread' link for deeper nesting. Flat view toggle."
- **Touch targets:** from UX spec -- "Touch targets >= 44px" (Operable requirement).
- **Focus indicators:** from UX spec -- "Focus visible on all elements. Skip navigation links."
- **Dynamic content:** from UX spec -- "New comments and feed items announced to screen readers via live regions."
- **Color contrast:** from UX spec -- "4.5:1 color contrast for all text. 7:1 for consequence numbers."
- **Reduced motion:** from PRD -- NFR17 "Platform achieves RGAA AA conformance" + UX spec "respect prefers-reduced-motion."
- **Dark mode default:** The platform uses dark mode as default. All contrast checks must pass in both dark and light modes.

### Dependencies

| Dependency | Story | Reason |
|---|---|---|
| Story 5.1 | Comment Submission & Threading | CommentForm, CommentThread base components |
| Story 5.2 | Comment Voting | CommentVoteButton component |
| Story 5.3 | Comment Display & Pagination | CommentItem, CommentSkeleton, pagination logic |
| Story 1.1 | User Registration | LazyAuthGate for unauthenticated users |

### References

- Epic 5 definition: `_bmad-output/planning-artifacts/epics.md` (lines 985-1014)
- Architecture -- shadcn/ui accessible primitives: `_bmad-output/planning-artifacts/architecture.md` (NFR6 line 1823)
- Architecture -- focus management, ARIA labels: `_bmad-output/planning-artifacts/architecture.md` (NFR7 line 1824)
- UX spec -- accessibility strategy: `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 950-970)
- UX spec -- testing strategy (a11y): `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 972-979)
- UX spec -- mobile adaptations: `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 943-948)
- UX spec -- breakpoints: `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 932-941)
- UX spec -- CommentThread component: `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 794-804)
- PRD -- NFR17 (RGAA AA): `_bmad-output/planning-artifacts/prd.md` (line 569)
- PRD -- NFR18 (focus indicators): `_bmad-output/planning-artifacts/prd.md` (line 570)
- PRD -- NFR19 (contrast ratio): `_bmad-output/planning-artifacts/prd.md` (line 571)
- PRD -- NFR20 (form labels): `_bmad-output/planning-artifacts/prd.md` (line 572)

---

## Dev Agent Record

### Agent Model

_Not yet started_

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-27 | Story created from Epic 5 definition | BMAD |

### Implementation Notes

_To be filled during implementation._

### Test Results

_To be filled after test execution._
