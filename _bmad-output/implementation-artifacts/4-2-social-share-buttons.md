# Story 4.2: Social Share Buttons

Status: ready-for-dev

## Story

As a **visitor (Nicolas)**,
I want one-click share buttons for Twitter/X, Facebook, WhatsApp, and copy-link on every submission,
so that I can easily spread awareness of fiscal outrages to my network with zero friction.

## Acceptance Criteria (BDD)

### AC 4.2.1: Share Toolbar Display

**Given** a visitor views a submission detail page at `/submissions/{id}` (or `/s/[id]/[slug]`),
**When** the page renders,
**Then** a `<ShareButton />` toolbar is displayed with four buttons in this order: Twitter/X, Facebook, WhatsApp, Copy Link,
**And** each button has a recognizable platform icon (Twitter/X bird/logo, Facebook F, WhatsApp phone, Link/clipboard icon),
**And** each button has an `aria-label` describing the action (e.g., `aria-label="Partager sur Twitter"`) (NFR17),
**And** each button has a visible focus indicator with `ring-2 ring-chainsaw-red` on `:focus-visible` (NFR18).

### AC 4.2.2: Web Share API (Mobile Primary)

**Given** the visitor is on a mobile device that supports the Web Share API (`navigator.share`),
**When** the visitor taps the primary share button (or the main share icon),
**Then** the native OS share sheet opens with:
- `title`: submission title
- `text`: the canonical share text (see AC 4.2.7)
- `url`: the full submission URL with UTM parameters (`?utm_source=share&utm_medium=native&utm_campaign=submission`)
**And** if the Web Share API is not supported, the fallback share toolbar with individual platform buttons is displayed instead.

### AC 4.2.3: Twitter/X Share

**Given** the visitor clicks the Twitter/X share button,
**When** the click is processed,
**Then** a new window/tab opens with the URL:
```
https://twitter.com/intent/tweet?text={encodedShareText}&url={encodedSubmissionUrl}
```
**And** the `text` parameter contains the canonical share text template (AC 4.2.7),
**And** the URL includes UTM parameters: `?utm_source=twitter&utm_medium=social&utm_campaign=submission`,
**And** the window dimensions are `width=550,height=420` (Twitter intent popup size).

### AC 4.2.4: Facebook Share

**Given** the visitor clicks the Facebook share button,
**When** the click is processed,
**Then** a new window opens with the URL:
```
https://www.facebook.com/sharer/sharer.php?u={encodedSubmissionUrl}
```
**And** the submission URL includes UTM parameters: `?utm_source=facebook&utm_medium=social&utm_campaign=submission`,
**And** Facebook will pull the Open Graph metadata (from Story 4.3) to display the preview.

### AC 4.2.5: WhatsApp Share

**Given** the visitor clicks the WhatsApp share button,
**When** the click is processed,
**Then** a new window opens with the URL:
```
https://wa.me/?text={encodedShareText}%20{encodedSubmissionUrl}
```
**And** the text contains: `"{title} - Ca coute {cost_per_citizen} EUR a chaque Francais !"`,
**And** the URL includes UTM parameters: `?utm_source=whatsapp&utm_medium=social&utm_campaign=submission`.

### AC 4.2.6: Copy Link to Clipboard

**Given** the visitor clicks the Copy Link button,
**When** the click is processed,
**Then** the submission URL (with UTM: `?utm_source=copy&utm_medium=clipboard&utm_campaign=submission`) is copied to the clipboard via `navigator.clipboard.writeText()`,
**And** the button text/icon temporarily changes to a checkmark with "Lien copie !" for 2 seconds,
**And** a success toast notification appears with green left border confirming the copy action (per UX feedback patterns),
**And** the button reverts to its original state after 2 seconds.

### AC 4.2.7: Canonical Share Text Template

**Given** a submission with title and cost data exists,
**When** the share text is composed for any platform,
**Then** the canonical share text template is:
```
[Title] coute [X]EUR par an a chaque contribuable francais. #CostToNicolas #LIBERAL [URL]
```
**Where:**
- `[Title]` = submission title (truncated to 80 chars if needed for Twitter's 280 char limit)
- `[X]` = cost per taxpayer formatted with French locale (comma decimal separator)
- `[URL]` = full submission URL with platform-specific UTM parameters

### AC 4.2.8: Mobile Responsive Layout

**Given** the share toolbar is rendered on a mobile viewport (< 768px),
**When** the visitor views it,
**Then** the buttons are displayed as a horizontal row with equal spacing,
**And** each button has a minimum tap target of 44x44px (RGAA AA),
**And** on mobile, a single "Partager" button triggers the Web Share API (if supported), with the individual platform buttons as fallback.

### AC 4.2.9: Share Button in Feed Cards

**Given** a submission card is displayed in the feed (`/feed/hot`, `/feed/new`, `/feed/top`),
**When** the card renders,
**Then** a compact share icon button is displayed on each SubmissionCard,
**And** tapping it on mobile triggers the Web Share API (or opens a bottom sheet with share options),
**And** clicking it on desktop opens a dropdown with the four share platform options.

### AC 4.2.10: Share Event Tracking

**Given** any share button is clicked (on any platform),
**When** the share action is triggered,
**Then** a `POST /api/share-events` request is sent with `{ "submission_id": "<id>", "platform": "<twitter|facebook|whatsapp|copy_link>" }` (feeds into Story 4.4),
**And** the share action proceeds regardless of whether the tracking request succeeds (fire-and-forget).

## Tasks / Subtasks

- [ ] **Task 1: Create share utility functions** (AC: 4.2.3, 4.2.4, 4.2.5, 4.2.6, 4.2.7)
  - [ ] Create/extend `src/lib/utils/share.ts` with:
    - `buildShareText(title: string, costPerTaxpayer: number): string` -- composes canonical share text
    - `buildTwitterShareUrl(text: string, url: string): string` -- Twitter intent URL builder
    - `buildFacebookShareUrl(url: string): string` -- Facebook sharer URL builder
    - `buildWhatsAppShareUrl(text: string, url: string): string` -- WhatsApp share URL builder
    - `appendUtmParams(url: string, source: string, medium: string): string` -- UTM parameter helper
    - `copyToClipboard(text: string): Promise<boolean>` -- clipboard helper with fallback
    - `canUseWebShareApi(): boolean` -- feature detection for Web Share API
    - `triggerWebShare(title: string, text: string, url: string): Promise<boolean>` -- native share
  - [ ] Add unit tests in `src/lib/utils/share.test.ts`

- [ ] **Task 2: Create the `useShare` hook** (AC: 4.2.2, 4.2.10)
  - [ ] Create/extend `src/hooks/use-share.ts`
  - [ ] Hook accepts: `submissionId`, `title`, `costPerTaxpayer`, `submissionUrl`
  - [ ] Exposes: `shareToTwitter()`, `shareToFacebook()`, `shareToWhatsApp()`, `copyLink()`, `shareNative()`, `canNativeShare`, `isCopied` (boolean state with 2s auto-reset)
  - [ ] Each method calls `POST /api/share-events` fire-and-forget before opening share URL
  - [ ] Add unit tests in `src/hooks/use-share.test.ts`

- [ ] **Task 3: Create the `ShareButton` component** (AC: 4.2.1, 4.2.8, 4.2.9)
  - [ ] Create `src/components/features/sharing/ShareButton.tsx` as a Client Component (`'use client'`)
  - [ ] Props: `submissionId: string`, `title: string`, `costPerTaxpayer: number`, `submissionUrl: string`, `variant?: 'full' | 'compact'`
  - [ ] `variant='full'` (submission detail page): horizontal row of 4 labeled buttons
  - [ ] `variant='compact'` (feed card): single share icon that triggers Web Share API on mobile or dropdown on desktop
  - [ ] Use `shadcn/ui` Button, DropdownMenu components
  - [ ] Use Lucide React icons: `Share2`, `Twitter`, `Facebook`, `MessageCircle` (WhatsApp), `Link`, `Check`
  - [ ] Implement `isCopied` state: swap Link icon to Check icon + "Lien copie !" text for 2 seconds
  - [ ] Toast notification on copy via `shadcn/ui` toast

- [ ] **Task 4: Create the `ShareCard` preview component** (AC: 4.2.1)
  - [ ] Create `src/components/features/sharing/ShareCard.tsx`
  - [ ] Shows a visual preview of how the share will look (mirrors OG image layout from Story 4.1)
  - [ ] Used on submission detail page to show Nicolas what the share will look like

- [ ] **Task 5: Integrate ShareButton into SubmissionDetail page** (AC: 4.2.1)
  - [ ] Add `<ShareButton variant="full" ... />` to `src/components/features/submissions/SubmissionDetail.tsx`
  - [ ] Position below the ConsequenceCard and above the comment section
  - [ ] Pass submission data as props

- [ ] **Task 6: Integrate ShareButton into SubmissionCard (feed)** (AC: 4.2.9)
  - [ ] Add `<ShareButton variant="compact" ... />` to `src/components/features/submissions/SubmissionCard.tsx`
  - [ ] Position in the card footer alongside vote count and comment count

- [ ] **Task 7: Accessibility audit** (AC: 4.2.1, 4.2.8)
  - [ ] Verify all buttons have `aria-label` attributes in French
  - [ ] Verify keyboard navigation: Tab through all share buttons, Enter/Space to activate
  - [ ] Verify focus indicators: `ring-2 ring-chainsaw-red` on `:focus-visible`
  - [ ] Verify 44x44px minimum tap targets on mobile
  - [ ] Verify 4.5:1 contrast ratio on all button text/icons (NFR19)

- [ ] **Task 8: Write tests** (AC: all)
  - [ ] Unit tests for `src/lib/utils/share.ts`: URL builders, text composition, UTM params
  - [ ] Unit tests for `useShare` hook: mock navigator.share, navigator.clipboard, fetch
  - [ ] Component test for `ShareButton`: renders 4 buttons, correct aria-labels, click handlers
  - [ ] Component test for compact variant: dropdown menu behavior
  - [ ] Component test: copy-to-clipboard shows "Lien copie !" feedback for 2 seconds
  - [ ] E2E test (Playwright): `e2e/share.spec.ts` -- click share button, verify window.open called with correct URL

## Dev Notes

### Architecture

- **ShareButton** is a **Client Component** (`'use client'`) per architecture decision (requires Web Share API, clipboard API, window.open)
- **Rendering strategy:** The share toolbar is interactive and requires browser-only APIs. It MUST be a client component, but the surrounding SubmissionDetail can remain an RSC
- **State management:** Local React state for `isCopied` boolean. No Zustand needed -- this is ephemeral UI state within the component
- **Fire-and-forget analytics:** Share event tracking (POST to `/api/share-events`) must NOT block the share action. Use `fetch()` without `await` or wrap in a try-catch that silently fails

### Tech Stack

- **Next.js** 16.1.6 (App Router, Client Components)
- **Web Share API** (`navigator.share`) -- mobile-first, with feature detection
- **Clipboard API** (`navigator.clipboard.writeText`) -- with `document.execCommand('copy')` fallback for older browsers
- **shadcn/ui** components: Button, DropdownMenu, Toast
- **Lucide React** icons (already in project via shadcn/ui)
- **Motion** (Framer Motion) 12.34.x -- optional: subtle animation on copy confirmation

### Key Files to Create/Modify

| Action | File Path | Purpose |
|--------|-----------|---------|
| CREATE/MODIFY | `src/lib/utils/share.ts` | Share URL builders, clipboard helper, Web Share API |
| CREATE | `src/lib/utils/share.test.ts` | Unit tests for share utilities |
| CREATE/MODIFY | `src/hooks/use-share.ts` | Share functionality hook |
| CREATE | `src/hooks/use-share.test.ts` | Hook unit tests |
| CREATE | `src/components/features/sharing/ShareButton.tsx` | Share button component (full + compact) |
| CREATE | `src/components/features/sharing/ShareCard.tsx` | Share preview card |
| MODIFY | `src/components/features/submissions/SubmissionDetail.tsx` | Add ShareButton integration |
| MODIFY | `src/components/features/submissions/SubmissionCard.tsx` | Add compact ShareButton |
| CREATE | `e2e/share.spec.ts` | E2E tests for share flow |

### Testing Strategy

- **Unit tests (Vitest):**
  - `share.ts` utilities: URL encoding, text composition, UTM parameter appending
  - `useShare` hook: mock `navigator.share`, `navigator.clipboard.writeText`, `window.open`, `fetch`
- **Component tests (Vitest + Testing Library):**
  - Render ShareButton, assert 4 buttons present with correct aria-labels
  - Simulate click on each button, assert correct URL opened
  - Test copy-to-clipboard: assert "Lien copie !" state change and 2-second reset
  - Test compact variant: dropdown menu opens on click, contains 4 options
- **E2E tests (Playwright):**
  - Navigate to submission page, click Twitter share, verify popup URL format
  - Click copy link, verify clipboard contents
- **Accessibility tests (axe-core):**
  - Run axe on ShareButton component to verify RGAA AA compliance
  - Tab navigation through all 4 buttons

### UX Design Alignment

- **Share flow (per UX spec):** Tap on mobile triggers native share sheet (Web Share API). Desktop shows individual buttons or dropdown.
- **States:** Default, sharing (loading), shared (brief checkmark confirmation) -- per ShareButton component spec
- **Button hierarchy:** Share buttons are **secondary** actions (ghost/outline style) -- the primary action on a submission page is voting
- **Feedback pattern:** Success toast with green left border + checkmark icon, auto-dismiss in 3 seconds
- **Mobile-first:** Share buttons positioned for easy one-hand access. Bottom of card or sticky position
- **The card is the product:** The share output must look striking in Twitter/WhatsApp timeline. The ShareCard preview component helps Nicolas see what they are about to share

### Share URL Patterns

```typescript
// Twitter/X
`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(urlWithUtm)}`

// Facebook
`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlWithUtm)}`

// WhatsApp
`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + urlWithUtm)}`

// Window open dimensions for social popups
window.open(url, '_blank', 'width=550,height=420,noopener,noreferrer')
```

### Dependencies

- **Requires (from other stories):**
  - Story 4.1 (OG image URL for the share preview -- though shares work without it, the image makes them viral)
  - Story 2.1 (submission data: title, amount)
  - Story 2.3 (Cost to Nicolas data: costPerTaxpayer)
  - Story 1.1 (design system: shadcn/ui Button, Toast, DropdownMenu)
- **Required by (other stories):**
  - Story 4.4 (share event tracking -- ShareButton fires tracking events)

### References

- [Source: architecture.md - Section 3.4 Frontend] ShareButton as Client Component with Web Share API, clipboard
- [Source: architecture.md - Section 5 File Structure] `src/components/features/sharing/ShareButton.tsx`, `src/lib/utils/share.ts`, `src/hooks/use-share.ts`
- [Source: architecture.md - Section 7.3 Naming] `useShare` hook naming convention
- [Source: ux-design-specification.md - ShareButton] Component spec: actions, content, states
- [Source: ux-design-specification.md - Feedback Patterns] Toast styles, optimistic update patterns
- [Source: ux-design-specification.md - Design Principles] "One tap, native share sheet (mobile) or copy-link (desktop)"
- [Source: epics.md - Story 4.2] Complete acceptance criteria
- [Source: prd.md - FR19] One-click share buttons for Twitter/X, Facebook, WhatsApp, copy-link

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

(none yet)

### Completion Notes List

(none yet)

### File List

(populated during implementation)
