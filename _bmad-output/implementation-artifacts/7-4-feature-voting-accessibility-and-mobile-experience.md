# Story 7.4: Feature Voting Accessibility & Mobile Experience

## Story

**As a** visitor using assistive technology or a mobile device,
**I want** the feature voting page to be fully accessible and mobile-optimized,
**So that** I can participate in platform democracy regardless of my device or abilities.

**Epic:** 7 — Community Feature Voting & Platform Democracy
**FRs:** FR10 (Registered users can vote on proposed platform features)
**NFRs:** NFR17 (RGAA AA conformance), NFR18 (Visible focus indicators with 3:1 contrast), NFR19 (4.5:1 text contrast)

---

## Acceptance Criteria (BDD)

### AC 7.4.1: Mobile Responsive Layout — Feature Proposal Cards

```gherkin
Given the `/features` page is rendered on a mobile viewport (< 768px)
When the user views the page
Then feature proposal cards are displayed in a single-column layout with full-width cards
And each card has adequate padding (min 16px) for comfortable reading
And the "Proposer une fonctionnalite" button spans the full width of the viewport (with side margins)
And the sort tabs ("Plus votes", "Plus recents") are displayed as a horizontal scrollable row
And the category filter pills wrap to a second line if they overflow the viewport width
And no horizontal scroll is present on the page body
And all content is readable without zooming at default text size (16px base)
```

### AC 7.4.2: Touch-Friendly Vote Buttons

```gherkin
Given a user interacts with the feature voting page on a touch device
When they tap the vote button on a proposal card
Then the vote button has a minimum tap target of 44x44px (WCAG 2.5.5 AAA / RGAA minimum)
And the tap target has adequate spacing from adjacent interactive elements (min 8px gap)
And the vote button provides haptic-style visual feedback on tap (scale animation or background flash)
And the vote count display is positioned adjacent to the button with clear visual association
And there is no double-tap zoom conflict on the vote button area

Given the user accidentally taps outside the vote button but within the card
Then no vote is registered (tap targets are precise, not full-card)
```

### AC 7.4.3: Screen Reader — Proposal Card Semantics

```gherkin
Given a screen reader (NVDA, VoiceOver, JAWS) traverses the feature proposals list
When each proposal card is encountered
Then the card element has `role="article"` with `aria-label` containing: "{title}, {vote_count} votes, statut : {status_label}"
And the vote count is announced as part of the card context
And the status badge text is accessible (not icon-only — includes visually hidden text if using icons)

Given a screen reader reads a specific proposal card
When the vote button is focused
Then the button has `aria-label="Voter pour {title}"` when the user has NOT voted
And the button has `aria-label="Retirer votre vote pour {title}"` when the user HAS voted
And the button has `aria-pressed="false"` when unvoted and `aria-pressed="true"` when voted
And after a vote action, the screen reader announces the updated vote count via `aria-live="polite"` region
```

### AC 7.4.4: Screen Reader — Proposal Form Accessibility

```gherkin
Given a screen reader user opens the "Proposer une fonctionnalite" dialog
When the dialog opens
Then focus is moved to the first focusable element inside the dialog (the title input)
And the dialog has `role="dialog"` with `aria-labelledby` pointing to the dialog title
And the dialog has `aria-modal="true"` to prevent background interaction
And each form field has a `<label>` element with `for` attribute matching the input `id`
And required fields have `aria-required="true"` and visual asterisk indicator
And validation error messages are linked to their fields via `aria-describedby`
And the character counter for each field is linked via `aria-describedby` (e.g., "187 sur 200 caracteres")
And when the user tabs past the last element in the dialog, focus wraps to the first element (focus trap)
And pressing Escape closes the dialog and returns focus to the trigger button
```

### AC 7.4.5: Keyboard Navigation — Full Page

```gherkin
Given a user navigates the `/features` page using keyboard only
When they press Tab starting from the page top
Then focus moves logically through the following order:
  1. Skip navigation link (if present)
  2. Site header navigation items
  3. "Proposer une fonctionnalite" button
  4. Sort tabs ("Plus votes", "Plus recents")
  5. Category filter pills (each pill is a focusable button)
  6. First proposal card's interactive elements:
     a. Title (if it's a link)
     b. Vote button
  7. Second proposal card's interactive elements
  8. ... (repeat for each card)
  9. Pagination controls ("Charger plus" or next page)
  10. Footer links
And all focused elements have a visible focus ring: `ring-2 ring-chainsaw-red` with minimum 3:1 contrast ratio against surrounding colors (NFR18)
And focus is never trapped outside of modal dialogs
And pressing Enter or Space on the vote button toggles the vote (same as click)
```

### AC 7.4.6: Keyboard Navigation — Sort and Filter

```gherkin
Given a keyboard user focuses on the sort tabs
When they press Enter or Space on a sort tab
Then the sort order changes and the proposal list re-renders
And focus remains on the selected tab (does not jump to top of page)
And the active tab has `aria-selected="true"` and inactive tabs have `aria-selected="false"`
And the tab group has `role="tablist"` with each tab having `role="tab"`

Given a keyboard user focuses on a category filter pill
When they press Enter or Space
Then the filter is toggled (active/inactive)
And the pill visually updates to show active state
And the proposal list filters accordingly
And the pill has `aria-pressed="true"` when active and `aria-pressed="false"` when inactive
```

### AC 7.4.7: Color Contrast Compliance

```gherkin
Given any text element on the `/features` page
When its contrast ratio is measured against its background
Then all body text meets minimum 4.5:1 contrast ratio (NFR19)
And all large text (18px+ or 14px+ bold) meets minimum 3:1 contrast ratio
And all status badge text meets 4.5:1 contrast against the badge background color:
  | Badge     | Background | Text Color | Min Ratio |
  |-----------|-----------|------------|-----------|
  | Propose   | gray-100  | gray-800   | 4.5:1     |
  | Planifie  | blue-100  | blue-800   | 4.5:1     |
  | En cours  | amber-100 | amber-900  | 4.5:1     |
  | Realise   | green-100 | green-800  | 4.5:1     |
  | Refuse    | red-100   | red-800    | 4.5:1     |
And the vote count number meets 4.5:1 contrast
And the category pill text meets 4.5:1 contrast against its background
And focus ring color (chainsaw-red) meets 3:1 contrast against the card background (NFR18)
```

### AC 7.4.8: Reduced Motion Preference

```gherkin
Given a user has `prefers-reduced-motion: reduce` set in their OS/browser
When they interact with the feature voting page
Then vote count number changes are instant (no slide animation)
And vote button press effects are instant (no scale/pulse animation)
And sort/filter transitions are instant (no fade/slide)
And the page is fully functional without any motion
```

### AC 7.4.9: Text Scaling

```gherkin
Given a user increases browser text size to 200%
When the `/features` page renders
Then all text scales proportionally
And no text is clipped or hidden
And no horizontal scrollbar appears
And proposal cards reflow gracefully (single column layout)
And vote buttons remain accessible (not overlapping other elements)
And the layout remains usable and readable
```

### AC 7.4.10: Mobile Proposal Form

```gherkin
Given a user opens the proposal form on a mobile device (< 768px)
When the form dialog renders
Then the dialog takes up the full viewport height (bottom sheet style or full-screen modal)
And form fields are stacked vertically with adequate spacing
And the category select opens a native mobile picker (or an accessible custom select)
And the submit and cancel buttons are at the bottom of the form, within thumb reach
And the keyboard does not obscure the active input (form scrolls to keep input visible)
And character counters are visible below their respective fields
```

---

## Tasks / Subtasks

### Task 1: ARIA Attributes on Proposal Cards

- [ ] 1.1: Add `role="article"` to `FeatureProposalCard.tsx` root element
- [ ] 1.2: Add `aria-label` to each card: `"{title}, {voteCount} votes, statut : {statusLabel}"`
- [ ] 1.3: Ensure status badge text is always readable by screen readers (not icon-only)
- [ ] 1.4: Add `aria-live="polite"` region for vote count updates within each card
- [ ] 1.5: Ensure category pill text is accessible (not just color-differentiated)

### Task 2: ARIA Attributes on Vote Button

- [ ] 2.1: Add `aria-label` to `FeatureVoteButton.tsx`:
  - Unvoted: `aria-label="Voter pour {title}"`
  - Voted: `aria-label="Retirer votre vote pour {title}"`
- [ ] 2.2: Add `aria-pressed` attribute: `false` when unvoted, `true` when voted
- [ ] 2.3: After vote action, update the `aria-live="polite"` region with: "{voteCount} votes" to announce the change
- [ ] 2.4: Ensure vote button is a `<button>` element (not a `<div>` with click handler)

### Task 3: Keyboard Navigation

- [ ] 3.1: Verify Tab order flows logically through: Proposer button -> Sort tabs -> Filter pills -> Card vote buttons -> Pagination
- [ ] 3.2: Add `ring-2 ring-chainsaw-red ring-offset-2` focus styles to all interactive elements on the features page
- [ ] 3.3: Verify focus ring contrast ratio is >= 3:1 against card background (NFR18)
- [ ] 3.4: Ensure Enter and Space activate vote buttons (native `<button>` behavior)
- [ ] 3.5: Implement `role="tablist"` / `role="tab"` / `aria-selected` on sort tabs component
- [ ] 3.6: Implement `aria-pressed` on category filter pill buttons
- [ ] 3.7: After sort/filter change, maintain focus on the control (do not jump focus to page top)

### Task 4: Dialog Accessibility (Proposal Form)

- [ ] 4.1: Verify `shadcn/ui` `Dialog` component provides `role="dialog"`, `aria-modal="true"`, focus trap
- [ ] 4.2: Add `aria-labelledby` pointing to dialog title ("Proposer une fonctionnalite")
- [ ] 4.3: Ensure first focusable element (title input) receives focus on dialog open
- [ ] 4.4: Ensure Escape key closes dialog and returns focus to trigger button
- [ ] 4.5: Add `aria-required="true"` to required form fields
- [ ] 4.6: Link validation errors to fields via `aria-describedby`
- [ ] 4.7: Link character counters to fields via `aria-describedby` with format "X sur Y caracteres"
- [ ] 4.8: Ensure character counter has `aria-live="polite"` for dynamic updates (only announce on significant changes, not every keystroke — debounce or announce at thresholds)

### Task 5: Mobile Responsive Styles

- [ ] 5.1: Implement single-column card layout for viewports < 768px
- [ ] 5.2: Set full-width "Proposer" button on mobile: `w-full md:w-auto`
- [ ] 5.3: Set vote button minimum size to 44x44px: `min-w-[44px] min-h-[44px]`
- [ ] 5.4: Add minimum 8px gap between vote button and adjacent interactive elements
- [ ] 5.5: Implement horizontal scroll for sort tabs if they overflow on very small screens: `overflow-x-auto`
- [ ] 5.6: Implement flex-wrap for category filter pills: `flex-wrap`
- [ ] 5.7: Ensure no horizontal page-level scrollbar at any mobile viewport
- [ ] 5.8: Test at breakpoints: 320px (small phone), 375px (iPhone), 414px (iPhone Plus), 768px (tablet)

### Task 6: Mobile Proposal Form Styles

- [ ] 6.1: On mobile, render proposal form as full-screen modal or bottom sheet:
  ```css
  @media (max-width: 767px) {
    .dialog-content { height: 100vh; width: 100vw; border-radius: 0; }
  }
  ```
- [ ] 6.2: Stack form fields vertically with adequate spacing (gap-4)
- [ ] 6.3: Position submit/cancel buttons at bottom of form, sticky or at natural scroll end
- [ ] 6.4: Ensure form scrolls to active input when mobile keyboard appears
- [ ] 6.5: Use native `<select>` element or accessible custom select for category on mobile

### Task 7: Color Contrast Verification

- [ ] 7.1: Verify all status badge color combinations pass 4.5:1 contrast using axe-core or manual testing tool
- [ ] 7.2: Verify vote count text contrast against card background
- [ ] 7.3: Verify category pill text contrast against pill background
- [ ] 7.4: Verify focus ring color (chainsaw-red #DC2626 or similar) passes 3:1 against card background
- [ ] 7.5: Verify "Proposer" button text contrast against button background
- [ ] 7.6: Document verified contrast ratios in accessibility audit notes

### Task 8: Reduced Motion Support

- [ ] 8.1: Wrap all Motion (Framer Motion) animations in `FeatureVoteButton.tsx` with `prefers-reduced-motion` check:
  ```typescript
  const prefersReducedMotion = useReducedMotion();
  // If true, use instant transitions (duration: 0)
  ```
- [ ] 8.2: Add CSS `@media (prefers-reduced-motion: reduce)` overrides for any CSS transitions/animations
- [ ] 8.3: Ensure vote count change is still visually indicated without animation (e.g., number simply changes)

### Task 9: Text Scaling Verification

- [ ] 9.1: Test `/features` page at 200% browser zoom
- [ ] 9.2: Verify no text clipping, overflow, or overlapping elements
- [ ] 9.3: Verify no horizontal scrollbar at 200% zoom
- [ ] 9.4: Verify card layout reflows gracefully at large text sizes
- [ ] 9.5: Verify vote button remains usable and accessible at 200% zoom

### Task 10: Automated Accessibility Testing

- [ ] 10.1: Add axe-core integration test for `/features` page: `npx @axe-core/cli http://localhost:3000/features`
- [ ] 10.2: Add Vitest + `@testing-library/react` accessibility assertions:
  - Cards have `role="article"`
  - Vote buttons have `aria-pressed` and `aria-label`
  - Form fields have associated labels
  - Dialog has `role="dialog"` and focus trap
- [ ] 10.3: Add Playwright E2E accessibility test:
  - Keyboard-only navigation through full page flow (tab through cards, vote, open form, submit)
  - Screen reader simulation (verify ARIA attributes present)
- [ ] 10.4: Add contrast ratio checks in component tests (verify class names include correct color tokens)

### Task 11: Manual Accessibility Audit

- [ ] 11.1: Test with NVDA screen reader (Windows): navigate proposals, vote, open form, submit
- [ ] 11.2: Test with VoiceOver (macOS/iOS): same flow
- [ ] 11.3: Test keyboard-only navigation: complete full user journey without mouse
- [ ] 11.4: Test with browser zoom at 200%: verify layout integrity
- [ ] 11.5: Test with `prefers-reduced-motion: reduce`: verify no animations
- [ ] 11.6: Run Lighthouse accessibility audit: target score >= 95
- [ ] 11.7: Document any issues found and remediate before marking story complete

---

## Dev Notes

### Architecture Notes

- **RGAA AA compliance** is a cross-cutting NFR (NFR17) that applies to all public-facing pages. This story specifically ensures the `/features` page and the proposal form meet the standard.
- **shadcn/ui components** are built on Radix UI primitives, which provide strong accessibility foundations (Dialog focus trap, Select keyboard navigation, Button semantics). This story verifies and extends those foundations for the specific feature voting use case.
- **Mobile-first design:** The architecture specifies that 70%+ of traffic is expected from mobile (social media referrals). The feature voting page must be equally usable on mobile as on desktop.
- **No separate mobile components:** Responsive behavior is achieved through Tailwind CSS breakpoint utilities, not separate mobile components.

### Technical Notes

- **ARIA live regions:** Use `aria-live="polite"` for vote count changes. This ensures screen readers announce the updated count without interrupting current speech. Do NOT use `aria-live="assertive"` — vote count changes are informational, not critical.
- **Focus management:** After voting (button click/keypress), focus should remain on the vote button. Do not move focus elsewhere after a vote action.
- **Touch target sizing:** WCAG 2.5.5 (AAA) recommends 44x44px minimum. WCAG 2.5.8 (AA) specifies 24x24px. We target 44x44px for the best mobile experience.
- **Reduced motion:** The `useReducedMotion()` hook from Motion (Framer Motion) detects the `prefers-reduced-motion` media query. Alternatively, use the native CSS `@media (prefers-reduced-motion: reduce)`.
- **Character counter announcements:** Do not announce every keystroke to screen readers — this would be overwhelming. Options:
  - Announce at thresholds (e.g., "50 caracteres restants", "10 caracteres restants")
  - Or only announce when approaching the limit (< 20% remaining)
  - Or let the user check manually via `aria-describedby` (static association)
  For MVP, the static `aria-describedby` approach is simplest and sufficient.

- **Color contrast values** (to verify):
  | Element | Foreground | Background | Expected Ratio |
  |---------|-----------|------------|---------------|
  | Body text | gray-900 (#111827) | white (#FFFFFF) | ~18.1:1 |
  | Proposed badge | gray-800 (#1F2937) | gray-100 (#F3F4F6) | ~12.6:1 |
  | Planned badge | blue-800 (#1E40AF) | blue-100 (#DBEAFE) | ~7.2:1 |
  | In progress badge | amber-900 (#78350F) | amber-100 (#FEF3C7) | ~8.4:1 |
  | Shipped badge | green-800 (#166534) | green-100 (#DCFCE7) | ~7.0:1 |
  | Declined badge | red-800 (#991B1B) | red-100 (#FEE2E2) | ~6.3:1 |
  | Focus ring | chainsaw-red (#DC2626) | white (#FFFFFF) | ~4.6:1 |

  All values exceed the 4.5:1 minimum for normal text and 3:1 minimum for focus indicators.

### Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/features/feature-voting/FeatureProposalCard.tsx` | MODIFY | Add ARIA attributes (role, aria-label, aria-live region) |
| `src/components/features/feature-voting/FeatureVoteButton.tsx` | MODIFY | Add aria-label, aria-pressed, ensure <button> element, reduced motion |
| `src/components/features/feature-voting/FeatureProposalList.tsx` | MODIFY | Add role="tablist" to sort tabs, aria-pressed to filter pills, keyboard nav |
| `src/components/features/feature-voting/FeatureProposalForm.tsx` | MODIFY | Add aria-labelledby, aria-required, aria-describedby for errors and counters |
| `src/app/features/page.tsx` | MODIFY | Add responsive styles, full-width mobile button |
| `e2e/features.spec.ts` | CREATE | Playwright E2E accessibility tests for feature voting page |
| `src/components/features/feature-voting/FeatureProposalCard.test.tsx` | MODIFY | Add accessibility assertions (ARIA attributes) |
| `src/components/features/feature-voting/FeatureVoteButton.test.tsx` | MODIFY | Add accessibility assertions (aria-pressed, aria-label) |

### Testing Notes

- **Automated accessibility tests (Vitest + @testing-library/react):**
  - Verify `role="article"` on cards
  - Verify `aria-label` content on cards and vote buttons
  - Verify `aria-pressed` state changes on vote
  - Verify form field labels and `aria-required`
  - Verify `aria-describedby` links errors to fields
  - Verify `aria-live` region exists for vote count

- **Playwright E2E accessibility tests (`e2e/features.spec.ts`):**
  - Full keyboard navigation test: Tab through page, vote with Enter, open form with Enter, fill form with keyboard, submit
  - Verify no focus traps outside dialog
  - Verify focus returns to trigger after dialog close
  - Run axe-core on page: `await expect(page).toPassAxe()`

- **Manual testing checklist:**
  - [ ] NVDA (Windows): Navigate proposals, vote, submit proposal
  - [ ] VoiceOver (macOS): Same flow
  - [ ] VoiceOver (iOS Safari): Same flow on mobile
  - [ ] Keyboard only: Complete full journey without mouse
  - [ ] 200% browser zoom: Verify layout
  - [ ] `prefers-reduced-motion`: Verify no animations
  - [ ] Lighthouse accessibility: Score >= 95

- **Coverage target:** ARIA attribute tests have near-100% coverage of accessibility requirements. E2E keyboard navigation covers the critical path.

### UX Notes

- **Mobile card design:** Cards take full width with generous padding. Vote button is positioned at the left side of the card (within thumb reach in portrait mode). Title and description stack vertically above the vote count and status badge.
- **Touch feedback:** On tap, the vote button has a brief background color flash (using Tailwind `active:bg-chainsaw-red/20` or similar). With reduced motion, the color flash is instant.
- **Full-screen mobile form:** On mobile, the proposal dialog fills the viewport for maximum usability. The title input is at the top, description in the middle, category and buttons at the bottom. The form scrolls internally if content exceeds viewport.
- **Focus ring visibility:** The `ring-2 ring-chainsaw-red ring-offset-2` focus style provides a clear, visible indicator that meets the 3:1 contrast requirement. The ring-offset ensures the ring is visible even on colored backgrounds.
- **This story is primarily about hardening existing components** from Stories 7.1 and 7.2 — adding ARIA attributes, responsive breakpoints, contrast verification, and keyboard behavior. It does not introduce new features, only ensures the existing features are accessible and mobile-friendly.

### Dependencies

- **Depends on:**
  - Story 7.1 (Feature Proposal Display & Voting) — for `FeatureProposalCard`, `FeatureVoteButton`, `FeatureProposalList` components
  - Story 7.2 (Feature Proposal Submission) — for `FeatureProposalForm` component and dialog
  - Story 1.1 (Project Foundation) — for base accessibility setup, shadcn/ui Radix primitives
  - `shadcn/ui` Dialog, Button, Select, Input, Textarea — for built-in Radix accessibility
- **Blocks:**
  - None — this is the final story in Epic 7

### References

- PRD: NFR17 (RGAA AA conformance), NFR18 (focus indicators 3:1 contrast), NFR19 (text 4.5:1 contrast), NFR20 (form labels, errors, required fields)
- PRD: Accessibility Level section — "RGAA AA (aligned with WCAG 2.1 AA)", screen reader, keyboard, color, motion, text scaling requirements
- Architecture: Section 4.4 (Optimistic UI — reduced motion consideration), Section 6.2 (NFR Coverage — NFR6 RGAA AA via shadcn/ui, NFR7 keyboard + screen reader)
- UX Design: Design Principle #3 (Zero-friction democratic participation), Mobile-first voting and scrolling, Touch target guidance
- Epics: Epic 7 — Story 7.4 acceptance criteria
- WCAG 2.1 AA: Success Criteria 1.3.1 (Info and Relationships), 1.4.3 (Contrast Minimum), 2.1.1 (Keyboard), 2.4.3 (Focus Order), 2.4.7 (Focus Visible), 2.5.5 (Target Size), 4.1.2 (Name, Role, Value)
- RGAA 4.1: Criteria 7.1 (Scripts accessible), 8.2 (Correct language), 10.7 (Focus visible), 11.1 (Form labels)

---

## Dev Agent Record

| Field | Value |
|-------|-------|
| **Story ID** | 7.4 |
| **Story Title** | Feature Voting Accessibility & Mobile Experience |
| **Epic** | 7 — Community Feature Voting & Platform Democracy |
| **Status** | Not Started |
| **Estimated Complexity** | Medium |
| **Assigned Agent** | — |
| **Started At** | — |
| **Completed At** | — |
| **Commits** | — |
| **Blockers** | Depends on Stories 7.1 and 7.2 for components to exist |
| **Notes** | This story hardens the feature voting experience for accessibility and mobile. It modifies existing components (Cards, Vote Button, Form, List) rather than creating new ones. The key deliverables are: ARIA attributes on all interactive elements, keyboard navigation flow, 44x44px touch targets, 4.5:1 contrast verification, reduced motion support, 200% zoom resilience, and both automated (axe-core, Vitest, Playwright) and manual (screen reader, keyboard-only) accessibility testing. RGAA AA is a legal requirement for French public-facing platforms. |
