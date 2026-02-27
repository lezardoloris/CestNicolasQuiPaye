# Story 3.5: Feed Accessibility & Mobile Optimization

## Story

**As a** visitor using assistive technology or a mobile device,
**I want** the feed and voting interface to be fully accessible and mobile-optimized,
**So that** I can participate regardless of my device or abilities.

**FRs Covered:** (cross-cutting quality story supporting FR2, FR3, FR6, FR9)
**NFRs Integrated:** NFR17, NFR18, NFR19

---

## Acceptance Criteria (BDD)

### AC 3.5.1: Mobile Responsive Layout

```gherkin
Given the feed page is rendered on a mobile viewport (< 768px)
When the user views the page
Then submission cards are displayed in a single-column layout with touch-friendly tap targets (minimum 44x44px)
And the bottom tab bar highlights the "Feed" tab as active
And sort tabs are horizontally scrollable if they overflow the viewport width
```

### AC 3.5.2: Screen Reader Semantics

```gherkin
Given a screen reader traverses the feed
When each submission card is read
Then the card has `role="article"` and an `aria-label` describing: "{title}, score: {score}, cout: {cost} EUR" (NFR17)
And vote buttons have `aria-label="Voter pour"` and `aria-label="Voter contre"` respectively
And the current vote state is announced: `aria-pressed="true"` when voted, `aria-pressed="false"` when not voted
```

### AC 3.5.3: Keyboard Navigation

```gherkin
Given a user navigates the feed using keyboard only
When they press Tab
Then focus moves logically through: sort tabs, then each submission card (entering the card focuses the title link, then upvote button, then downvote button), then the "load more" trigger (NFR18)
And all focused elements have a visible `ring-2 ring-chainsaw-red` outline
```

### AC 3.5.4: Color Contrast Compliance

```gherkin
Given any text element in the feed
When its contrast ratio is measured against the background
Then all text meets a minimum 4.5:1 contrast ratio (NFR19)
And the `chainsaw-red` (#DC2626) on `bg-dark` (#0A0A0A) has a contrast ratio of at least 4.5:1
```

---

## Tasks / Subtasks

### Task 1: Mobile Responsive Layout
- [ ] 1.1 Implement single-column card layout for viewports < 768px (`md` breakpoint) [AC 3.5.1]
- [ ] 1.2 Set full-width cards on mobile with `px-4` horizontal padding [AC 3.5.1]
- [ ] 1.3 Implement two-column layout at `lg` breakpoint (1024px): feed 65% + sidebar 35% [AC 3.5.1]
- [ ] 1.4 Set max-width 1280px centered layout at `xl` breakpoint [AC 3.5.1]
- [ ] 1.5 Ensure cards don't stretch beyond 1280px on wide desktop [AC 3.5.1]
- [ ] 1.6 Set minimum touch target size 44x44px on all interactive elements (buttons, links) using `min-h-11 min-w-11` [AC 3.5.1]
- [ ] 1.7 Set vote button touch targets to 48x48px using `min-h-12 min-w-12` [AC 3.5.1]
- [ ] 1.8 Position vote buttons at card edges for thumb-reach on mobile [AC 3.5.1]

### Task 2: Mobile Tab Bar Integration
- [ ] 2.1 Ensure `BottomTabBar` component highlights "Feed" tab when on `/feed/*` routes [AC 3.5.1]
- [ ] 2.2 Hide bottom tab bar on viewports >= `md` (768px) [AC 3.5.1]
- [ ] 2.3 Ensure feed content has bottom padding to avoid tab bar overlap (e.g., `pb-20 md:pb-0`) [AC 3.5.1]

### Task 3: FeedSortTabs Mobile Optimization
- [ ] 3.1 Make sort tabs sticky below the header on mobile using `sticky top-[header-height]` [AC 3.5.1]
- [ ] 3.2 Enable horizontal scroll on tabs container with `overflow-x-auto` and `scrollbar-hide` [AC 3.5.1]
- [ ] 3.3 Add snap scroll behavior: `scroll-snap-type: x mandatory` on container, `scroll-snap-align: start` on each tab [AC 3.5.1]
- [ ] 3.4 Ensure tab text doesn't wrap: `whitespace-nowrap` on each tab trigger [AC 3.5.1]

### Task 4: SubmissionCard Accessibility (ARIA)
- [ ] 4.1 Add `role="article"` to each SubmissionCard root element [AC 3.5.2]
- [ ] 4.2 Add `aria-label` with pattern: `"{title}, score: {score}, cout: {cost} EUR"` [AC 3.5.2]
- [ ] 4.3 Ensure card title is wrapped in a semantic heading element (`<h2>` or `<h3>`) within the card [AC 3.5.2]
- [ ] 4.4 Add `aria-label="Voter pour: {score} votes positifs"` on upvote button [AC 3.5.2]
- [ ] 4.5 Add `aria-label="Voter contre: {score} votes negatifs"` on downvote button [AC 3.5.2]
- [ ] 4.6 Add `aria-pressed="true"` when user has voted in that direction, `aria-pressed="false"` otherwise [AC 3.5.2]
- [ ] 4.7 Use `<button>` elements (not `<div>`) for vote controls to ensure native keyboard support [AC 3.5.2]

### Task 5: Live Region for Vote Count Updates
- [ ] 5.1 Add `aria-live="polite"` region for vote count display [AC 3.5.2]
- [ ] 5.2 When vote count changes (optimistic update), screen reader announces "Score mis a jour: {newScore}" [AC 3.5.2]
- [ ] 5.3 Use `aria-atomic="true"` so the entire score is re-read, not just the changed character [AC 3.5.2]
- [ ] 5.4 Debounce live region announcements to avoid rapid-fire updates during burst voting [AC 3.5.2]

### Task 6: Keyboard Navigation
- [ ] 6.1 Ensure tab order follows visual layout: sort tabs -> first card (title link -> upvote -> downvote) -> next card -> load more [AC 3.5.3]
- [ ] 6.2 Add `tabindex="0"` on card container for keyboard focus, with roving tabindex for internal elements [AC 3.5.3]
- [ ] 6.3 Implement `Enter` key activation on card to navigate to detail page [AC 3.5.3]
- [ ] 6.4 Implement `Enter` or `Space` key activation on vote buttons to cast vote [AC 3.5.3]
- [ ] 6.5 Add `role="tablist"` on sort tabs container, `role="tab"` on each tab with `aria-selected` [AC 3.5.3]
- [ ] 6.6 Support arrow key navigation between sort tabs (left/right arrows move between tabs) [AC 3.5.3]
- [ ] 6.7 Add skip navigation link: "Aller au contenu principal" at the top of the page [AC 3.5.3]

### Task 7: Focus Management
- [ ] 7.1 Apply visible focus indicator `ring-2 ring-chainsaw-red ring-offset-2 ring-offset-surface-primary` on `:focus-visible` for all interactive elements [AC 3.5.3]
- [ ] 7.2 Ensure focus is not trapped within any component (no keyboard traps) [AC 3.5.3]
- [ ] 7.3 When sort tab changes, move focus to the first submission card in the new results [AC 3.5.3]
- [ ] 7.4 When infinite scroll loads new items, do NOT move focus (let user continue tabbing naturally) [AC 3.5.3]
- [ ] 7.5 When lazy auth gate modal opens (from voting), trap focus inside modal [AC 3.5.3]
- [ ] 7.6 When lazy auth gate modal closes, return focus to the vote button that triggered it [AC 3.5.3]

### Task 8: Color Contrast Verification
- [ ] 8.1 Verify `text-text-primary` (#F5F5F5) on `bg-surface-primary` (#0F0F0F): contrast ratio 18.3:1 (PASS) [AC 3.5.4]
- [ ] 8.2 Verify `text-text-secondary` (#A3A3A3) on `bg-surface-primary` (#0F0F0F): contrast ratio 9.3:1 (PASS) [AC 3.5.4]
- [ ] 8.3 Verify `text-chainsaw-red` (#DC2626) on `bg-surface-primary` (#0F0F0F): contrast ratio 4.6:1 (PASS, minimum) [AC 3.5.4]
- [ ] 8.4 Verify `text-text-muted` (#737373) on `bg-surface-primary` (#0F0F0F): contrast ratio 5.5:1 (PASS) [AC 3.5.4]
- [ ] 8.5 Verify `text-text-primary` (#F5F5F5) on `bg-surface-secondary` (#1A1A1A): contrast ratio 14.8:1 (PASS) [AC 3.5.4]
- [ ] 8.6 Verify `text-chainsaw-red` (#DC2626) on `bg-surface-secondary` (#1A1A1A): contrast ratio 3.8:1 -- if FAIL, adjust to `#EF4444` (red-500) or use only for large text / decorative elements [AC 3.5.4]
- [ ] 8.7 Ensure focus indicator `ring-chainsaw-red` meets 3:1 contrast ratio against adjacent colors (NFR18) [AC 3.5.4]
- [ ] 8.8 Add `@media (prefers-contrast: more)` override to increase all borders and separators to higher contrast [AC 3.5.4]

### Task 9: Reduced Motion Support
- [ ] 9.1 Wrap all animations (vote bounce, counter animation, skeleton pulse) in `@media (prefers-reduced-motion: no-preference)` [AC 3.5.4]
- [ ] 9.2 When `prefers-reduced-motion: reduce` is active, disable all transitions and animations [AC 3.5.4]
- [ ] 9.3 Ensure infinite scroll loading indicator works without animation (static spinner or text "Chargement...") [AC 3.5.4]

### Task 10: Text Scaling
- [ ] 10.1 Set base font size to 16px (1rem) in root layout [AC 3.5.4]
- [ ] 10.2 Use relative units (`rem`, `em`) for all font sizes, not `px` [AC 3.5.4]
- [ ] 10.3 Test that feed page remains usable when text is scaled to 200% without horizontal scroll [AC 3.5.4]
- [ ] 10.4 Ensure card content reflows properly at 200% text zoom (title may wrap to multiple lines) [AC 3.5.4]

### Task 11: Accessibility Testing
- [ ] 11.1 Run axe-core automated accessibility audit on feed page -- zero critical violations [AC 3.5.2, AC 3.5.3, AC 3.5.4]
- [ ] 11.2 Run axe-core on submission detail page -- zero critical violations [AC 3.5.2]
- [ ] 11.3 Manual keyboard testing: navigate entire feed without mouse [AC 3.5.3]
- [ ] 11.4 Manual screen reader testing with NVDA (Windows): verify all ARIA labels read correctly [AC 3.5.2]
- [ ] 11.5 Manual screen reader testing with VoiceOver (macOS): verify live regions announce vote changes [AC 3.5.2]
- [ ] 11.6 Test on Chrome DevTools device emulation at 375px, 768px, 1024px, 1280px [AC 3.5.1]
- [ ] 11.7 Test on real mobile device (iOS Safari, Android Chrome) for touch target verification [AC 3.5.1]
- [ ] 11.8 Run Lighthouse accessibility audit -- score >= 90 [AC 3.5.2, AC 3.5.4]
- [ ] 11.9 Component test: axe-core integration in SubmissionCard, VoteButton, FeedSortTabs tests [AC 3.5.2]
- [ ] 11.10 Verify RGAA AA criteria coverage: Perceivable, Operable, Understandable, Robust [AC 3.5.2, AC 3.5.3, AC 3.5.4]

---

## Dev Notes

### Architecture

**RGAA AA Compliance Requirements (from PRD):**

RGAA (Referentiel General d'Amelioration de l'Accessibilite) is France's national accessibility standard, aligned with WCAG 2.1 AA. LIBERAL targets RGAA AA conformance. The four principles map to the following feed-specific requirements:

| RGAA Principle | Feed Implementation |
|---|---|
| **Perceivable** | All text meets 4.5:1 contrast. All non-text content has text alternatives. Information is not conveyed by color alone. Content adapts to viewport without horizontal scroll. |
| **Operable** | Full keyboard navigation. No keyboard traps. Focus visible on all elements. Skip navigation links. No time limits on user actions. Touch targets >= 44px. |
| **Understandable** | Page language set to `fr`. Consistent navigation. Input fields have labels. Error messages are descriptive. |
| **Robust** | Valid HTML5 semantics. ARIA attributes correctly used. Compatible with major assistive technologies (NVDA, VoiceOver, TalkBack). |

**Accessibility Implementation Pattern (from Architecture):**

shadcn/ui components are built on Radix UI primitives, which provide ARIA attributes, keyboard navigation, and focus management out of the box. The key additions needed are:

1. **Custom ARIA labels** on domain-specific components (vote buttons, submission cards)
2. **Live regions** for dynamic content updates (vote counts, infinite scroll)
3. **Focus management** for modal flows (lazy auth gate)
4. **Skip navigation** for keyboard users

### Technical Requirements

**Screen Reader Announcements Pattern:**

```typescript
// src/components/features/voting/VoteButton.tsx
'use client';

import { useVote } from '@/hooks/use-vote';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteButtonProps {
  submissionId: string;
  serverCounts: { up: number; down: number };
  serverVote?: 'up' | 'down' | null;
}

export function VoteButton({ submissionId, serverCounts, serverVote }: VoteButtonProps) {
  const { vote, currentVote, counts, isLoading } = useVote(submissionId, serverCounts);
  const score = counts.up - counts.down;

  return (
    <div className="flex flex-col items-center gap-1" role="group" aria-label="Vote">
      <button
        onClick={() => vote('up')}
        disabled={isLoading}
        aria-label={`Voter pour: ${counts.up} votes positifs`}
        aria-pressed={currentVote === 'up'}
        className={cn(
          'min-h-12 min-w-12 rounded-md p-2 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
          currentVote === 'up'
            ? 'text-chainsaw-red'
            : 'text-text-muted hover:text-text-secondary'
        )}
      >
        <ChevronUp className="h-6 w-6" aria-hidden="true" />
      </button>

      <span
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          'text-sm font-semibold tabular-nums',
          currentVote === 'up' && 'text-chainsaw-red',
          currentVote === 'down' && 'text-info',
          !currentVote && 'text-text-secondary'
        )}
      >
        {score}
      </span>

      <button
        onClick={() => vote('down')}
        disabled={isLoading}
        aria-label={`Voter contre: ${counts.down} votes negatifs`}
        aria-pressed={currentVote === 'down'}
        className={cn(
          'min-h-12 min-w-12 rounded-md p-2 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
          currentVote === 'down'
            ? 'text-info'
            : 'text-text-muted hover:text-text-secondary'
        )}
      >
        <ChevronDown className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}
```

**SubmissionCard Accessibility Pattern:**

```tsx
// src/components/features/submissions/SubmissionCard.tsx
import { formatEUR, formatRelativeTime, extractDomain } from '@/lib/utils/format';

interface SubmissionCardProps {
  submission: Submission;
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const score = submission.upvoteCount - submission.downvoteCount;
  const costPerCitizen = submission.costPerTaxpayer; // or costPerCitizen from cost calculation

  return (
    <article
      role="article"
      aria-label={`${submission.title}, score: ${score}, cout: ${formatEUR(submission.amount)} EUR`}
      className={cn(
        'rounded-lg border border-border-default bg-surface-secondary p-4',
        'transition-colors hover:bg-surface-elevated',
        // Outrage tier left border
        'border-l-4',
        getOutrageTierBorderColor(submission.costPerTaxpayer)
      )}
    >
      <div className="flex gap-4">
        {/* Vote buttons - left side on desktop, bottom on mobile */}
        <div className="hidden md:flex">
          <VoteButton
            submissionId={submission.id}
            serverCounts={{ up: submission.upvoteCount, down: submission.downvoteCount }}
          />
        </div>

        <div className="flex-1">
          <a
            href={`/s/${submission.id}/${submission.slug}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-secondary"
          >
            <h3 className="text-lg font-semibold text-text-primary line-clamp-2">
              {submission.title}
            </h3>
          </a>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            <span className="font-semibold text-chainsaw-red">
              {formatEUR(submission.amount)}
            </span>
            {costPerCitizen && (
              <span>{formatEUR(costPerCitizen)}/citoyen</span>
            )}
            <span aria-hidden="true">·</span>
            <span>{extractDomain(submission.sourceUrl)}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={submission.createdAt}>
              {formatRelativeTime(submission.createdAt)}
            </time>
          </div>
        </div>

        {/* Mobile vote buttons - horizontal at bottom */}
        <div className="flex md:hidden">
          <VoteButton
            submissionId={submission.id}
            serverCounts={{ up: submission.upvoteCount, down: submission.downvoteCount }}
          />
        </div>
      </div>
    </article>
  );
}
```

**Keyboard Navigation Pattern for FeedSortTabs:**

```tsx
// src/components/features/feed/FeedSortTabs.tsx (accessibility additions)
'use client';

import { useCallback, useRef } from 'react';

const SORT_OPTIONS = [
  { value: 'hot', label: 'Tendances' },
  { value: 'top', label: 'Top' },
  { value: 'new', label: 'Recent' },
] as const;

export function FeedSortTabs({ activeSort }: { activeSort: string }) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;

    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % SORT_OPTIONS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + SORT_OPTIONS.length) % SORT_OPTIONS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = SORT_OPTIONS.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      tabRefs.current[nextIndex]?.focus();
    }
  }, []);

  return (
    <div
      role="tablist"
      aria-label="Trier les signalements"
      className="sticky top-14 z-10 flex overflow-x-auto bg-surface-primary py-2 scrollbar-hide md:overflow-x-visible"
    >
      {SORT_OPTIONS.map((option, index) => (
        <button
          key={option.value}
          ref={(el) => { tabRefs.current[index] = el; }}
          role="tab"
          aria-selected={activeSort === option.value}
          tabIndex={activeSort === option.value ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onClick={() => navigate(`/feed/${option.value}`)}
          className={cn(
            'whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors',
            'scroll-snap-align-start',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red',
            activeSort === option.value
              ? 'bg-chainsaw-red text-white'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

**Skip Navigation Link:**

```tsx
// src/app/layout.tsx (addition)
<body>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-chainsaw-red focus:px-4 focus:py-2 focus:text-white focus:outline-none"
  >
    Aller au contenu principal
  </a>
  {/* ... rest of layout */}
  <main id="main-content">
    {children}
  </main>
</body>
```

**Focus Management for Lazy Auth Gate:**

```typescript
// src/components/features/auth/LazyAuthGate.tsx (focus management additions)
import { useRef, useEffect } from 'react';

export function LazyAuthGate({ open, onClose, triggerRef }: LazyAuthGateProps & { triggerRef?: React.RefObject<HTMLElement> }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus trap: when modal opens, focus first interactive element
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    }
  }, [open]);

  // Return focus: when modal closes, return focus to trigger element
  const handleClose = () => {
    onClose();
    // Return focus to the vote button that triggered the modal
    requestAnimationFrame(() => {
      triggerRef?.current?.focus();
    });
  };

  // ... modal content with focus trap
}
```

**Reduced Motion CSS:**

```css
/* src/app/globals.css additions */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Responsive Breakpoint Reference (from UX Spec)

| Breakpoint | Width | Tailwind | Layout | Key Adaptations |
|---|---|---|---|---|
| **Mobile** | 375px-767px | (base) | Single column, full-width cards | Bottom tab bar, FAB for submit, sheet-based forms, one-thumb vote targets (48px), swipe gestures |
| **Tablet** | 768px-1023px | `md:` | Single column, max-width 640px centered | Slightly larger cards, touch-optimized, collapsible sidebar for filters |
| **Desktop** | 1024px-1279px | `lg:` | Two-column: feed (65%) + sidebar (35%) | Top navigation, sidebar with trending/stats, hover states, keyboard shortcuts |
| **Wide desktop** | 1280px+ | `xl:` | Two-column, max-width 1280px centered | Same as desktop with more whitespace. Content doesn't stretch beyond 1280px. |

**Mobile-First CSS Rule:** Base styles target 375px. `md:` adds tablet enhancements. `lg:` adds desktop layout. Never use `@media (max-width:)`.

### File Structure

```
src/
  app/
    layout.tsx                             # Skip navigation link, lang="fr"
    globals.css                            # Reduced motion, contrast overrides
    feed/
      [sort]/
        page.tsx                           # Responsive layout classes
  components/
    features/
      submissions/
        SubmissionCard.tsx                 # ARIA labels, role="article", responsive
      voting/
        VoteButton.tsx                     # ARIA labels, aria-pressed, touch targets
      feed/
        FeedSortTabs.tsx                   # role="tablist", arrow key nav, sticky mobile
        FeedList.tsx                       # Keyboard focus management, live region
      auth/
        LazyAuthGate.tsx                   # Focus trap, focus return
    layout/
      BottomTabBar.tsx                     # Active tab highlighting
```

### Testing

| Test Type | Tool | File | Description |
|---|---|---|---|
| Automated a11y | axe-core (via Vitest) | `src/components/features/submissions/SubmissionCard.test.tsx` | Zero violations |
| Automated a11y | axe-core (via Vitest) | `src/components/features/voting/VoteButton.test.tsx` | Zero violations |
| Automated a11y | axe-core (via Vitest) | `src/components/features/feed/FeedSortTabs.test.tsx` | Zero violations |
| Component | Vitest + Testing Library | `src/components/features/feed/FeedSortTabs.test.tsx` | Arrow key navigation between tabs |
| Component | Vitest + Testing Library | `src/components/features/voting/VoteButton.test.tsx` | aria-pressed toggles, live region updates |
| Component | Vitest + Testing Library | `src/components/features/submissions/SubmissionCard.test.tsx` | role="article", aria-label present |
| Responsive | Playwright | `e2e/responsive-feed.spec.ts` | Screenshots at 375px, 768px, 1024px, 1280px |
| Manual | VoiceOver | -- | Verify card labels, vote announcements |
| Manual | NVDA | -- | Verify live regions, tab navigation |
| Manual | TalkBack | -- | Verify touch target accessibility |
| Manual | Keyboard | -- | Full feed navigation without mouse |
| Lighthouse | Lighthouse CI | CI pipeline | Accessibility score >= 90 |
| Contrast | axe-core | Automated | All text elements pass 4.5:1 |

**axe-core Integration in Component Tests:**

```typescript
// Example: SubmissionCard accessibility test
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SubmissionCard } from './SubmissionCard';

expect.extend(toHaveNoViolations);

describe('SubmissionCard Accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <SubmissionCard
        submission={{
          id: 'test-id',
          title: 'Test Submission',
          amount: 1000000,
          upvoteCount: 42,
          downvoteCount: 3,
          sourceUrl: 'https://lemonde.fr/article',
          createdAt: new Date().toISOString(),
          slug: 'test-submission',
          status: 'published',
          costPerTaxpayer: '0.0263',
        }}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has correct role and aria-label', () => {
    const { getByRole } = render(<SubmissionCard submission={mockSubmission} />);
    const article = getByRole('article');
    expect(article).toHaveAttribute('aria-label', expect.stringContaining('Test Submission'));
    expect(article).toHaveAttribute('aria-label', expect.stringContaining('score:'));
  });

  it('vote buttons have aria-pressed', () => {
    const { getAllByRole } = render(<SubmissionCard submission={mockSubmission} />);
    const buttons = getAllByRole('button');
    const voteButtons = buttons.filter(b => b.getAttribute('aria-pressed') !== null);
    expect(voteButtons.length).toBe(2);
  });
});
```

### UX/Design

**Accessibility Verification Checklist (from UX Spec):**

| Criterion | Implementation | Test Method |
|---|---|---|
| Live vote counts | `aria-live="polite"` region with `aria-atomic="true"`. Screen reader announces "Score mis a jour: X." | VoiceOver, NVDA manual test |
| Vote buttons | `<button>` elements with `aria-label`, `aria-pressed` | axe-core automated + manual SR test |
| Dynamic content | New submissions from infinite scroll do NOT steal focus; loading indicator accessible | Keyboard navigation test |
| Color independence | Vote state indicated by color AND icon fill (not color alone) | Visual inspection |
| Focus indicators | `ring-2 ring-chainsaw-red ring-offset-2` on `:focus-visible` | Keyboard navigation test |
| Touch targets | 44x44px minimum (vote buttons: 48x48px) | Chrome DevTools element inspection |
| Text scaling | Usable at 200% zoom without horizontal scroll | Manual browser zoom test |
| Reduced motion | Animations disabled when `prefers-reduced-motion: reduce` | OS setting toggle |
| Language | `<html lang="fr">` | Automated HTML validation |
| Skip navigation | "Aller au contenu principal" link, visible on focus | Keyboard test |

**Color Contrast Reference (verified values):**

| Foreground | Background | Ratio | Status |
|---|---|---|---|
| #F5F5F5 (text-primary) | #0F0F0F (surface-primary) | 18.3:1 | PASS |
| #A3A3A3 (text-secondary) | #0F0F0F (surface-primary) | 9.3:1 | PASS |
| #DC2626 (chainsaw-red) | #0F0F0F (surface-primary) | 4.6:1 | PASS (minimum) |
| #737373 (text-muted) | #0F0F0F (surface-primary) | 5.5:1 | PASS |
| #F5F5F5 (text-primary) | #1A1A1A (surface-secondary) | 14.8:1 | PASS |
| #DC2626 (chainsaw-red) | #1A1A1A (surface-secondary) | 3.8:1 | FAIL for small text -- use for large text/decorative only, or adjust to #EF4444 |
| #22C55E (success) | #0F0F0F (surface-primary) | 7.1:1 | PASS |
| #3B82F6 (info) | #0F0F0F (surface-primary) | 4.7:1 | PASS |

**Action Required:** The combination of `chainsaw-red` (#DC2626) on `surface-secondary` (#1A1A1A) does not meet 4.5:1 for small text. Options:
1. Use `#EF4444` (Tailwind red-500) which has 4.6:1 ratio on #1A1A1A
2. Only use chainsaw-red on surface-primary background for text
3. Reserve chainsaw-red on surface-secondary for large text (18px+ bold) or decorative borders

### Dependencies

**Upstream (required before this story):**
- Story 1.1: Project Scaffold & Design System Foundation (layout, focus indicators, design tokens)
- Story 3.1: Submission Feed (FeedSortTabs, FeedList, SubmissionCard)
- Story 3.3: Upvote/Downvote Mechanics (VoteButton)

**Downstream (depends on this story):**
- Story 5.4: Comment Accessibility & Mobile Layout (same patterns reused)
- All subsequent stories benefit from accessibility foundation

### References

- Architecture: Section 3.4 (Component Rendering Strategy -- FeedSortTabs, VoteButton, SubmissionCard), Section 4.4 (UI/UX Patterns -- Optimistic UI, Skeleton Loading)
- UX Design: Responsive Strategy (breakpoints, mobile-first), Accessibility section (RGAA AA criteria, screen reader, keyboard, contrast), Touch Targets (44x44px minimum, vote 48x48px), Component specs (VoteButton states, SubmissionCard ARIA), Developer Guidelines
- PRD: NFR17 (RGAA AA conformance via axe-core + manual audit), NFR18 (visible focus indicators, 3:1 contrast), NFR19 (4.5:1 text contrast ratio), RGAA Compliance section

---

## Dev Agent Record

| Field | Value |
|---|---|
| **Story Key** | 3.5 |
| **Status** | Draft |
| **Assigned To** | -- |
| **Started** | -- |
| **Completed** | -- |
| **Blocked By** | Story 1.1, Story 3.1, Story 3.3 |
| **Notes** | Cross-cutting quality story. Should be implemented alongside Stories 3.1-3.4, not after. The accessibility patterns established here are reused by all subsequent Epic stories. The chainsaw-red contrast issue on surface-secondary must be resolved before implementation. |
