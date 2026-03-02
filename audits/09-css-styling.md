# Audit 09 -- CSS / Styling Quality

**Date**: 2026-03-02
**Branch**: `feat/simulateur`
**Scope**: Tailwind 4 design tokens, light/dark mode, responsive design, hardcoded values, accessibility, animations, z-index, overflow, print styles, component patterns
**Files examined**: `globals.css`, all layout components, all feature components (~100+ `.tsx` files), all page files

---

## Executive Summary

The project has a well-structured design token system in `globals.css` with proper light/dark mode switching for core tokens (`surface-primary`, `text-primary`, `border-default`, etc.) and good Tailwind 4 integration. However, there are **two critical issues** (undefined `drapeau-rouge` token causing silent failures, and hardcoded hex colors in `global-error.tsx` bypassing the design system), plus several high-severity inconsistencies where Tailwind palette colors (`green-500`, `red-500`, `blue-500`, `amber-500`, etc.) are used instead of the defined semantic tokens (`success`, `warning`, `info`, `destructive`).

**Finding count**: 4 CRITICAL, 12 HIGH, 14 MEDIUM, 8 LOW

---

## 1. Design Tokens -- Consistency of Token Usage

### CRITICAL-01: Undefined `drapeau-rouge` token used in 11 files

| Field | Value |
|-------|-------|
| Severity | **CRITICAL** |
| Files | `SignupCTA.tsx`, `GamificationTeaser.tsx`, `SidebarGamification.tsx`, `MiniLeaderboard.tsx`, `PendingReviewCard.tsx`, `ValidationCard.tsx`, `DesktopSidebar.tsx`, `feed/review/page.tsx` |
| Lines | Multiple (see grep results) |
| Description | The token `drapeau-rouge` (used as `bg-drapeau-rouge`, `text-drapeau-rouge`, `bg-drapeau-rouge/10`, `border-drapeau-rouge/20`) is **never defined** in `globals.css` or any Tailwind config. It does not appear in `@theme inline`. This means these classes resolve to nothing -- the colors silently fail. |
| Fix | Replace all `drapeau-rouge` references with `chainsaw-red`, which IS the defined token (`--color-chainsaw-red: #C62828`). The names appear to be a leftover from a rename. Global find-and-replace: `drapeau-rouge` -> `chainsaw-red`. |

Affected patterns:
```
bg-drapeau-rouge        -> bg-chainsaw-red
text-drapeau-rouge      -> text-chainsaw-red
bg-drapeau-rouge/10     -> bg-chainsaw-red/10
bg-drapeau-rouge/5      -> bg-chainsaw-red/5
border-drapeau-rouge/20 -> border-chainsaw-red/20
```

### CRITICAL-02: `hover:bg-red-700` used as hover state for `bg-drapeau-rouge` buttons

| Field | Value |
|-------|-------|
| Severity | **CRITICAL** |
| Files | `SignupCTA.tsx:14`, `GamificationTeaser.tsx:52`, `SidebarGamification.tsx:33`, `MiniLeaderboard.tsx:71` |
| Description | These files use `hover:bg-red-700` as the hover state for `bg-drapeau-rouge` buttons. Even after fixing drapeau-rouge -> chainsaw-red, the hover state uses a raw Tailwind palette color instead of the defined `chainsaw-red-hover` token. |
| Fix | Replace `hover:bg-red-700` with `hover:bg-chainsaw-red-hover` (defined as `#8E1B1B`). |

### HIGH-01: Inconsistent use of Tailwind palette colors instead of semantic tokens

| Field | Value |
|-------|-------|
| Severity | **HIGH** |
| Description | The design system defines `--color-success: #16A34A`, `--color-warning: #D97706`, `--color-info: #2563EB`, yet many components use raw Tailwind palette equivalents instead. |

Violations (non-exhaustive):

| Raw Color Used | Should Use | Files |
|----------------|-----------|-------|
| `text-green-500`, `bg-green-500` | `text-success`, `bg-success` | `ValidationCard.tsx:55,108,138`, `DailyGoalIndicator.tsx:19,26` |
| `text-red-500`, `bg-red-500/10` | `text-destructive`, `bg-destructive/10` | `ValidationCard.tsx:57,150` |
| `text-blue-500` | `text-info` | `GamificationTeaser.tsx:6`, `SidebarGamification.tsx:5` |
| `text-green-500` | `text-success` | `GamificationTeaser.tsx:7`, `SidebarGamification.tsx:6` |
| `text-purple-500` | (no token; needs one or use `text-muted-foreground`) | `GamificationTeaser.tsx:8`, `SidebarGamification.tsx:7` |
| `text-orange-500` | `text-warning` | `GamificationTeaser.tsx:9`, `SidebarGamification.tsx:8`, `MiniLeaderboard.tsx:33` |
| `text-yellow-600`, `bg-yellow-500/10` | `text-warning`, `bg-warning/10` | `admin/imports/page.tsx:14`, `developers/page.tsx:230` |
| `text-emerald-500`, `text-emerald-600` | `text-success` | `SimulatorShareCard.tsx:65`, `SimulatorSummaryKpi.tsx:23` |
| `bg-emerald-600` | `bg-success` (or define `emerald` token) | `VoteProminentButtons.tsx:62` |
| `text-amber-500`, `text-amber-600` | `text-warning` | Multiple gamification/leaderboard files |

**Fix**: Use the defined semantic tokens (`success`, `warning`, `info`, `destructive`) consistently. For colors not covered (e.g., purple for community notes), define a new token.

### HIGH-02: `text-[#ec4899]` hardcoded pink used instead of a token

| Field | Value |
|-------|-------|
| Severity | **HIGH** |
| Files | `DebtPerCapitaCards.tsx:51`, `BudgetPageClient.tsx:217` |
| Description | The color `#ec4899` (Tailwind's `pink-500`) is hardcoded for associations/heart icons. No corresponding design token exists. |
| Fix | Define a new token `--color-accent-pink: #ec4899` in `@theme inline` or reuse `destructive` if semantically appropriate. |

---

## 2. Light/Dark Mode

### CRITICAL-03: `global-error.tsx` uses hardcoded hex colors bypassing theme

| Field | Value |
|-------|-------|
| Severity | **CRITICAL** |
| File | `src/app/global-error.tsx:12,17,22` |
| Description | The global error page hardcodes `bg-[#111318]`, `text-[#F5F5F5]`, `text-[#A3A3A3]`, `bg-[#C62828]`, `hover:bg-[#8E1B1B]` instead of using design tokens. While this component creates its own `<html>` (so tokens may not be available), it also forces `className="dark"` which means the np-tokens ARE available. |
| Fix | Use token classes: `bg-surface-primary text-text-primary`, `text-text-secondary`, `bg-chainsaw-red hover:bg-chainsaw-red-hover`. The `.dark` class on `<html>` makes the CSS custom properties accessible. |

### HIGH-03: `success`, `warning`, `info` tokens lack dark mode overrides

| Field | Value |
|-------|-------|
| Severity | **HIGH** |
| File | `src/app/globals.css:60-62` |
| Lines | 60-62 |
| Description | The tokens `--color-success: #16A34A`, `--color-warning: #D97706`, `--color-info: #2563EB` are defined directly in `@theme inline` as static values. They do NOT have dark-mode overrides in the `.dark` selector. In dark mode, `#16A34A` (green-600) may have insufficient contrast against dark backgrounds. Typical dark-mode values would be lighter variants (e.g., green-400 `#4ADE80`). |
| Fix | Move success/warning/info to the `:root`/`.dark` variable pattern like other tokens: |

```css
:root {
  --np-success: #16A34A;
  --np-warning: #D97706;
  --np-info: #2563EB;
}
.dark {
  --np-success: #4ADE80;
  --np-warning: #FBBF24;
  --np-info: #60A5FA;
}
/* Then in @theme inline: */
--color-success: var(--np-success);
--color-warning: var(--np-warning);
--color-info: var(--np-info);
```

### HIGH-04: `chainsaw-red` does not adapt to dark mode

| Field | Value |
|-------|-------|
| Severity | **HIGH** |
| File | `src/app/globals.css:50-52` |
| Description | `--color-chainsaw-red: #C62828` is defined as a static value in `@theme inline`. On very dark backgrounds (`#111318`), the contrast ratio of `#C62828` on `#111318` is approximately 3.7:1 -- below the WCAG AA requirement of 4.5:1 for normal text. The hover variant `#8E1B1B` is even darker (worse contrast in dark mode). |
| Fix | Define dark-mode variant: `.dark { --np-chainsaw-red: #EF5350; --np-chainsaw-red-hover: #C62828; }` and use the variable pattern. Alternatively, since chainsaw-red is primarily used on buttons with white text (which has good contrast), focus on the text-chainsaw-red usage on dark backgrounds. |

### MEDIUM-01: `SimulatorSummaryKpi.tsx` manually handles dark mode with `dark:` prefix

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| File | `src/components/features/simulator/SimulatorSummaryKpi.tsx:23,34,39` |
| Description | Uses `text-emerald-600 dark:text-emerald-400`, `text-amber-600 dark:text-amber-400`, `text-indigo-600 dark:text-indigo-400` instead of using semantic tokens. This works functionally but bypasses the design token system and creates maintenance burden. |
| Fix | Define semantic tokens or use existing ones (`success`, `warning`). |

---

## 3. Responsive Design

### MEDIUM-02: Desktop sidebar hardcodes widths without responsive flexibility

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| Files | `DesktopSidebar.tsx:39` (`w-[220px]`), `FeedRightSidebar.tsx:15` (`w-[340px]`) |
| Description | Fixed pixel widths prevent the layout from adapting to varying viewport sizes between `lg` and very large screens. The main content area gets squeezed. |
| Fix | Consider using `w-56 lg:w-60` (Tailwind scale) or `min-w-[220px] max-w-[260px]` for flexible sizing. |

### MEDIUM-03: `max-w-[1380px]` is a magic number in root layout

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| File | `src/app/layout.tsx:78` |
| Description | `lg:max-w-[1380px]` is an arbitrary magic number. It should be a design token or use a standard Tailwind container size (`max-w-7xl` = 80rem = 1280px, `max-w-screen-2xl` = 1536px). |
| Fix | Use `lg:max-w-screen-xl` (1280px) or `lg:max-w-7xl` and let the sidebars + content fit naturally, or define a custom token. |

### MEDIUM-04: Footer hidden on mobile with no alternative

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| File | `src/components/layout/Footer.tsx:3` |
| Description | `className="hidden md:block ..."` completely hides the footer on mobile. The footer contains legal disclaimers, methodology link, and license info. Mobile users cannot access these. |
| Fix | Show a simplified footer above the MobileTabBar, or make footer links accessible from a mobile menu. |

### LOW-01: Auth layout uses `100dvh - 8rem` on mobile, `100vh - 2rem` on desktop

| Field | Value |
|-------|-------|
| Severity | **LOW** |
| File | `src/app/(auth)/layout.tsx:9` |
| Description | `min-h-[calc(100dvh-8rem)]` on mobile and `md:min-h-[calc(100vh-2rem)]` on desktop. The 8rem offset on mobile accounts for header + tab bar but is a magic number that could break if header/tab bar heights change. |
| Fix | Document the calculation or use a CSS custom property for the total chrome height. |

---

## 4. Hardcoded Values and Magic Numbers

### CRITICAL-04: Chart colors use raw hex in `DebtProjectionChart.tsx`

| Field | Value |
|-------|-------|
| Severity | **CRITICAL** |
| File | `src/components/features/budget/DebtProjectionChart.tsx:61-67,112,122,133,137` |
| Description | SVG gradient stops and stroke colors use raw hex: `#ef4444` (red-500), `#f59e0b` (amber-500). Legend spans use `bg-[#ef4444]` and `border-[#f59e0b]`. These do not adapt to dark/light mode. In Recharts, `var(--color-...)` references DO work for some props but gradient `stopColor` needs explicit handling. |
| Fix | Use CSS custom properties where possible (`stroke="var(--color-chainsaw-red)"`) or define chart-specific tokens. For SVG gradients, consider dynamically reading the computed token value. |

### HIGH-05: `BRACKET_COLORS` array uses raw Tailwind palette in tax simulator

| Field | Value |
|-------|-------|
| Severity | **HIGH** |
| File | `src/components/features/simulator/TaxBreakdownSection.tsx:12-18` |
| Description | `['bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-600']` -- five raw palette colors for IR bracket visualization. These lack semantic meaning and do not participate in the design token system. |
| Fix | Define a chart palette in globals.css using the existing `chart-1` through `chart-5` tokens, or create `bracket-` tokens. |

### HIGH-06: `text-gray-400` used as placeholder color in `ValidationCard.tsx`

| Field | Value |
|-------|-------|
| Severity | **HIGH** |
| File | `src/components/features/submissions/ValidationCard.tsx:125` |
| Description | `placeholder:text-gray-400` -- the only occurrence of `gray-400` in the entire codebase. Should use `placeholder:text-text-muted` for consistency. |
| Fix | Replace `placeholder:text-gray-400` with `placeholder:text-text-muted`. |

### MEDIUM-05: Admin imports page uses raw status colors

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| File | `src/app/admin/imports/page.tsx:13-16` |
| Description | `STATUS_STYLES` maps to `bg-yellow-500/10 text-yellow-600`, `bg-green-500/10 text-green-600`, `bg-red-500/10 text-red-600`. Should use semantic tokens. |
| Fix | Use `bg-warning/10 text-warning`, `bg-success/10 text-success`, `bg-destructive/10 text-destructive`. |

### MEDIUM-06: Developers page uses `bg-yellow-500/10 text-yellow-600`

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| File | `src/app/developers/page.tsx:230` |
| Description | Rate limit badge uses raw yellow palette instead of `warning` token. |
| Fix | Replace with `bg-warning/10 text-warning`. |

### MEDIUM-07: Inconsistent `h-` and `w-` vs `size-` syntax for icons

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| Files | Multiple (see below) |
| Description | Some components use `h-5 w-5` while others use `size-5`. Both work, but the codebase should be consistent. Newer files tend to use `size-*` (Tailwind 4 preferred shorthand). |

Examples of `h-X w-X` (should be `size-X`):
- `MiniLeaderboard.tsx:66` -- `h-8 w-8`
- `GamificationTeaser.tsx:18` -- `h-5 w-5`
- `SidebarGamification.tsx:15` -- `h-4 w-4`
- `ValidationCard.tsx:55,57` -- `h-5 w-5`
- `CommentItem.tsx:103` -- `h-3.5 w-3.5`
- `LeaderboardTable.tsx:53` -- `size-7` (correct!)
- `VoteButton.tsx:51,85` -- `h-6 w-6`

**Fix**: Adopt `size-*` globally for Lucide icons. A codemod or find-replace of `h-(\d+(?:\.\d+)?) w-\1` -> `size-$1` would work.

---

## 5. Tailwind Class Consistency

### HIGH-07: Inconsistent card border radius across components

| Field | Value |
|-------|-------|
| Severity | **HIGH** |
| Description | Cards use different border radii without clear reasoning. |

| Component | Border Radius | Context |
|-----------|--------------|---------|
| `SubmissionPreview` | `rounded-2xl` | Feed sidebar preview |
| `KpiCards` | `rounded-lg` | Stats KPI cards |
| `GrandTotalCounter` | `rounded-xl` | Stats hero |
| `SimulatorSummaryKpi` | `rounded-xl` | Simulator KPIs |
| `TaxBreakdownSection` | `rounded-xl` | Simulator breakdown |
| `MiniLeaderboard` | `rounded-2xl` | Sidebar leaderboard |
| `ValidationCard` | `rounded-2xl` | Review cards |
| `LeaderboardTable` | `rounded-lg` | Table wrapper |
| `PinnedNote` | `rounded-lg` | Inline note |
| `CommunityNoteItem` | `rounded-lg` | Note card |

**Fix**: Establish a convention:
- `rounded-2xl` for standalone cards/panels
- `rounded-xl` for medium containers
- `rounded-lg` for inline/nested elements
- `rounded-full` for pills/badges

### HIGH-08: Inconsistent card padding values

| Field | Value |
|-------|-------|
| Severity | **HIGH** |
| Description | Cards use `p-3`, `p-4`, `p-5`, `p-6` without clear hierarchy. |

| Component | Padding | Context |
|-----------|---------|---------|
| `SubmissionPreview` | `px-3 py-2` | Compact preview |
| `KpiCards` | `p-4` | Stats cards |
| `GrandTotalCounter` | `p-6` | Hero card |
| `SimulatorSummaryKpi` | `p-4` | Simulator KPIs |
| `TaxBreakdownSection` | `p-5` | Breakdown panel |
| `MiniLeaderboard` | `p-4` / `p-3` | Sidebar variants |
| `ValidationCard` | `p-4` | Review cards |
| `PodiumCards` | `p-6` | Podium card |

**Fix**: Standardize: `p-4` for standard cards, `p-6` for hero/feature cards, `p-3` for compact/sidebar cards.

### MEDIUM-08: Font size inconsistency in metadata text

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| Description | Metadata rows use varying sizes: |

| Component | Font Size | Context |
|-----------|-----------|---------|
| `SubmissionCard` | `text-[13px]` | Feed card metadata |
| `SubmissionPreview` | `text-[11px]` | Preview metadata |
| `SubmissionCard` category badge | `text-[11px]` | Category label |
| `SubmissionPreview` category badge | `text-[10px]` | Category label |
| Cost per taxpayer | `text-[13px]` / `text-[12px]` | Different in card vs preview |

**Fix**: Use consistent Tailwind classes (`text-xs` = 12px, `text-sm` = 14px) or define custom sizes as tokens. The arbitrary `text-[13px]`, `text-[11px]`, `text-[10px]` values create a fragmented scale.

---

## 6. Accessibility

### HIGH-09: Focus styles override on VoteButton removes outline but no ring-offset on some paths

| Field | Value |
|-------|-------|
| Severity | **HIGH** |
| File | `VoteButtonInline.tsx:53,98` |
| Description | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red` -- missing `ring-offset-2 ring-offset-surface-primary` that the global focus style provides. The global `*:focus-visible` in `globals.css` sets ring-offset, but these inline overrides (which include `focus-visible:outline-none`) may suppress the global style while not providing offset. |
| Fix | Add `focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary` to match the global convention, or remove the inline focus styles to rely on the global one. |

### HIGH-10: `chainsaw-red` (#C62828) on `surface-secondary` (#1A1D24) dark mode contrast ratio

| Field | Value |
|-------|-------|
| Severity | **HIGH** |
| Description | `text-chainsaw-red` on `bg-surface-secondary` in dark mode: `#C62828` on `#1A1D24` yields approximately **3.5:1** contrast ratio, below WCAG AA (4.5:1 for normal text). This affects cost amounts, XP indicators, error messages, and accent links across the app. |
| Fix | Lighten chainsaw-red in dark mode to `#EF5350` (~5.2:1 contrast on `#1A1D24`) by making it a variable-based token. |

### MEDIUM-09: Missing `aria-label` on some interactive elements

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| Files | `BudgetNav.tsx:61` (dropdown button), `ValidationCard.tsx:133,145` (approve/reject buttons have no aria-label) |
| Description | The BudgetNav dropdown trigger and ValidationCard action buttons lack explicit aria-labels. The button text content provides some context, but the ValidationCard buttons with icons could benefit from more descriptive labels. |
| Fix | Add `aria-label="Approuver ce signalement"` and `aria-label="Rejeter ce signalement"`. |

### LOW-02: Skip link uses `z-100` which is non-standard

| Field | Value |
|-------|-------|
| Severity | **LOW** |
| File | `src/app/layout.tsx:72` |
| Description | `focus:z-100` -- Tailwind 4 supports arbitrary z-index values, but `z-100` is not in the default scale. While functional, it should use `z-[100]` or the standard `z-50`. The skip link needs to be above everything so a high z-index is correct. |
| Fix | Use `focus:z-[100]` for clarity or document the z-index hierarchy. |

---

## 7. Animations and Transitions

### MEDIUM-10: `SubmissionCard` entrance animation applies to ALL cards including during scroll

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| File | `src/components/features/feed/SubmissionCard.tsx:48-50` |
| Description | `initial={{ opacity: 0, y: 12 }}` with `delay: Math.min(index * 0.05, 0.5)` applies on every render, including when cards re-appear after category filter changes. The staggered delay caps at 500ms for 10+ cards, but cards loaded via infinite scroll will also get entrance animations, potentially causing visual jank. |
| Fix | Use `whileInView` instead of `animate`, or conditionally skip animations for cards beyond the initial page load. The `prefers-reduced-motion` media query in globals.css mitigates this for accessibility. |

### MEDIUM-11: HeroSection uses both CSS class and inline `style` for rotation

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| File | `src/components/features/feed/HeroSection.tsx:124-125` |
| Description | `className="text-text-muted size-4 rotate-180"` AND `style={{ transform: 'rotate(180deg)' }}` -- double rotation declaration. The inline style overrides the class. |
| Fix | Remove either the `rotate-180` class or the `style` prop. Keep the Tailwind class for consistency. |

### LOW-03: `card-hover-lift` animation uses hardcoded `rgba(0,0,0,0.1)` shadow

| Field | Value |
|-------|-------|
| Severity | **LOW** |
| File | `src/app/globals.css:176-181` |
| Description | The `.card-hover-lift:hover` shadow uses `rgba(0, 0, 0, 0.1)` in light mode and `rgba(0, 0, 0, 0.4)` in dark mode. These are hardcoded but are appropriate since shadows are inherently absolute (black with opacity). The dark mode variant correctly deepens the shadow. |
| Status | **Acceptable** -- shadows are conventionally hardcoded. No fix needed. |

---

## 8. Z-index Management

### MEDIUM-12: Z-index hierarchy is informal but mostly consistent

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| Description | Current z-index usage: |

| Z-index | Elements |
|---------|----------|
| `z-0` | SubmissionCard stretched link |
| `z-1` | SubmissionCard content layer |
| `z-10` | FeedSortTabs sticky, CategoryFilter fade edges, SubmissionPreview header |
| `z-40` | MobileFeedFAB, BudgetNav sticky |
| `z-50` | MobileHeader, DesktopNav, MobileTabBar, Dialog overlay, Tooltip, BudgetNav back-to-top |
| `z-[100]` | XpToast, Skip link |

**Potential conflict**: `BudgetNav back-to-top` at `z-50` same as `MobileTabBar` at `z-50`. On mobile, the back-to-top button (`bottom-20`) is positioned above the tab bar (`bottom-0`), so they don't visually overlap, but they share the same stacking layer.

**Fix**: Define a z-index scale as CSS custom properties or document the convention:
```css
--z-base: 0;
--z-content: 1;
--z-sticky: 10;
--z-fab: 40;
--z-nav: 50;
--z-toast: 100;
```

---

## 9. Overflow Handling

### MEDIUM-13: LeaderboardTable `overflow-x-auto` but no max-width constraint on names

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| File | `src/components/features/leaderboard/LeaderboardTable.tsx:60` |
| Description | Display names use `truncate max-w-[150px] sm:max-w-[200px]` which is good. However, the table itself at `overflow-x-auto` may still scroll horizontally on small screens due to the fixed column layout. |
| Fix | Consider using `table-fixed` with explicit column widths for better control, or use a card layout on mobile. |

### LOW-04: `SubmissionPreview` scroll container lacks visual scroll indicator

| Field | Value |
|-------|-------|
| Severity | **LOW** |
| File | `src/components/features/feed/SubmissionPreview.tsx:39` |
| Description | `max-h-[calc(100vh-6rem)] overflow-y-auto` creates a scrollable container, but there is no visual indicator that content extends beyond the visible area (no scroll fade, no scrollbar styling). The `scrollbar-hide` utility is NOT used here (correct), but the default scrollbar may be visually jarring. |
| Fix | Consider adding a subtle bottom fade gradient when content overflows, or use a thin custom scrollbar style. |

### LOW-05: CategoryFilter horizontal scroll has no keyboard navigation

| Field | Value |
|-------|-------|
| Severity | **LOW** |
| File | `src/components/features/feed/CategoryFilter.tsx:51-56` |
| Description | The category filter uses `overflow-x-auto` with `scrollbar-hide`, but the scroll container has no keyboard-accessible scroll mechanism. Users can tab through individual pills, but cannot scroll the container with arrow keys. |
| Fix | Add `tabIndex={0}` on the scroll container with `onKeyDown` handling for left/right arrow keys, or rely on the native tab order (current approach is acceptable for WCAG AA). |

---

## 10. Print Styles

### LOW-06: Print styles are well-implemented but miss chart elements

| Field | Value |
|-------|-------|
| Severity | **LOW** |
| File | `src/app/globals.css:213-250` |
| Description | Print styles correctly hide nav, sticky elements, footer, and the back-to-top button. They set readable colors for text tokens. However, Recharts SVG elements (pie charts, bar charts, area charts) are not addressed -- they may render with dark-mode colors on a white print background. |
| Fix | Add a print media query for `.recharts-wrapper` to force light-friendly colors, or hide charts and show a "visit online for charts" message. |

### LOW-07: Print styles reference `.bg-surface-secondary` but not all surface variants

| Field | Value |
|-------|-------|
| Severity | **LOW** |
| File | `src/app/globals.css:233-234` |
| Description | Print overrides for `.bg-surface-secondary` and `.bg-surface-primary\/50` exist, but `.bg-surface-elevated` (used in cards, dropdowns, and hover states) is not addressed. |
| Fix | Add `.bg-surface-elevated { background: #f5f5f5 !important; }` to print styles. |

---

## 11. Component Styling Patterns

### HIGH-11: `cn()` not used consistently for conditional styles

| Field | Value |
|-------|-------|
| Severity | **HIGH** |
| Description | Some components use `cn()` (from `@/lib/utils`) for conditional class merging, while others use template literals. |

Template literal pattern (inconsistent):
- `DesktopNav.tsx:63` -- `` `text-sm font-medium transition-colors hover:text-chainsaw-red ${pathname?.startsWith(link.href) ? '...' : '...'}` ``
- `KpiCards.tsx:30` -- `` `size-5 ${color}` ``
- `XpToast.tsx:55` -- `` `pointer-events-auto rounded-full px-4 py-2 shadow-lg ${leveledUp ? '...' : '...'}` ``
- `DailyGoalIndicator.tsx:25` -- Template literal for conditional bg color
- `SubmissionForm.tsx:149` -- `` `text-text-muted ${formData.title.length >= 180 ? 'text-chainsaw-red' : ''}` ``
- `GamificationTeaser.tsx:26` -- `` `h-4 w-4 ${color}` ``

`cn()` pattern (correct):
- `SubmissionCard.tsx:69` -- `cn('inline-flex...', category.color, category.bgColor)`
- `VoteButtonInline.tsx:30` -- `cn('inline-flex...', activeVote === 'up' && '...')`
- `CategoryPill` -- `cn('inline-flex...', active ? '...' : '...')`

**Fix**: Use `cn()` for ALL conditional class assignments. Template literals with ternaries are error-prone (e.g., they can inject empty strings, don't handle undefined well, and don't deduplicate conflicting classes).

### HIGH-12: Duplicate `GoogleIcon` component defined in both LoginForm and RegisterForm

| Field | Value |
|-------|-------|
| Severity | **HIGH** |
| Files | `LoginForm.tsx:22-31`, `RegisterForm.tsx:20-29` |
| Description | The same `GoogleIcon` SVG component with identical hardcoded Google brand colors is copy-pasted. While the SVG `fill` colors are brand-specific (Google's identity guidelines require exact colors), the component definition is duplicated. |
| Fix | Extract to `src/components/ui/icons/GoogleIcon.tsx` and import in both forms. |

### MEDIUM-14: `font-display` and `font-body` token usage inconsistency

| Field | Value |
|-------|-------|
| Severity | **MEDIUM** |
| File | `src/app/globals.css:63-65` |
| Description | `globals.css` defines `--font-display: 'Space Grotesk'`, `--font-body: 'Inter'`, `--font-mono: 'JetBrains Mono'`. The `font-body` class is applied to `<body>` in `layout.tsx`, but `font-display` is applied via `className` on headings. However, the font variable `--font-space-grotesk` from Next.js font loading and `--font-display` from the theme are not explicitly linked. The `layout.tsx` applies `${spaceGrotesk.variable}` which creates `--font-space-grotesk`, but the theme token `--font-display` references `'Space Grotesk'` directly (the Google font name), not the CSS variable. This works because the font is loaded, but it's a fragile coupling. |
| Fix | Link them explicitly: `--font-display: var(--font-space-grotesk, 'Space Grotesk', system-ui, sans-serif)`. |

---

## Summary Table

| # | Severity | Category | Description | File(s) |
|---|----------|----------|-------------|---------|
| CRITICAL-01 | CRITICAL | Tokens | `drapeau-rouge` token undefined; silently fails | 11 files |
| CRITICAL-02 | CRITICAL | Tokens | `hover:bg-red-700` instead of `hover:bg-chainsaw-red-hover` | 4 files |
| CRITICAL-03 | CRITICAL | Dark Mode | `global-error.tsx` hardcodes hex colors | `global-error.tsx` |
| CRITICAL-04 | CRITICAL | Hardcoded | Chart SVG uses raw hex, not theme-aware | `DebtProjectionChart.tsx` |
| HIGH-01 | HIGH | Tokens | Raw Tailwind palette instead of semantic tokens | ~15 files |
| HIGH-02 | HIGH | Tokens | `#ec4899` hardcoded pink, no token | 2 files |
| HIGH-03 | HIGH | Dark Mode | `success`/`warning`/`info` lack dark mode overrides | `globals.css` |
| HIGH-04 | HIGH | Dark Mode | `chainsaw-red` contrast insufficient in dark mode | `globals.css` |
| HIGH-05 | HIGH | Hardcoded | Bracket colors array uses raw palette | `TaxBreakdownSection.tsx` |
| HIGH-06 | HIGH | Hardcoded | `text-gray-400` placeholder | `ValidationCard.tsx` |
| HIGH-07 | HIGH | Consistency | Inconsistent card border radius | ~10 files |
| HIGH-08 | HIGH | Consistency | Inconsistent card padding | ~10 files |
| HIGH-09 | HIGH | A11y | VoteButtonInline missing ring-offset | `VoteButtonInline.tsx` |
| HIGH-10 | HIGH | A11y | `chainsaw-red` on dark bg below AA contrast | Multiple |
| HIGH-11 | HIGH | Patterns | `cn()` not used for all conditional classes | ~8 files |
| HIGH-12 | HIGH | Patterns | Duplicate GoogleIcon component | 2 files |
| MEDIUM-01 | MEDIUM | Dark Mode | Manual `dark:` prefixes bypass token system | `SimulatorSummaryKpi.tsx` |
| MEDIUM-02 | MEDIUM | Responsive | Hardcoded sidebar widths | `DesktopSidebar.tsx`, `FeedRightSidebar.tsx` |
| MEDIUM-03 | MEDIUM | Responsive | `max-w-[1380px]` magic number | `layout.tsx` |
| MEDIUM-04 | MEDIUM | Responsive | Footer hidden on mobile entirely | `Footer.tsx` |
| MEDIUM-05 | MEDIUM | Hardcoded | Admin imports raw status colors | `imports/page.tsx` |
| MEDIUM-06 | MEDIUM | Hardcoded | Developers page raw yellow | `developers/page.tsx` |
| MEDIUM-07 | MEDIUM | Consistency | Mixed `h-X w-X` vs `size-X` for icons | ~10 files |
| MEDIUM-08 | MEDIUM | Consistency | Arbitrary font sizes `text-[13px]` etc. | Feed components |
| MEDIUM-09 | MEDIUM | A11y | Missing aria-labels on some buttons | `BudgetNav.tsx`, `ValidationCard.tsx` |
| MEDIUM-10 | MEDIUM | Animations | SubmissionCard entrance animation on all renders | `SubmissionCard.tsx` |
| MEDIUM-11 | MEDIUM | Animations | Double rotation (class + style) | `HeroSection.tsx` |
| MEDIUM-12 | MEDIUM | Z-index | Informal z-index hierarchy | Multiple |
| MEDIUM-13 | MEDIUM | Overflow | LeaderboardTable horizontal scroll on mobile | `LeaderboardTable.tsx` |
| MEDIUM-14 | MEDIUM | Patterns | Font token not linked to CSS variable | `globals.css` |
| LOW-01 | LOW | Responsive | Magic number in auth layout height calc | `(auth)/layout.tsx` |
| LOW-02 | LOW | A11y | `z-100` non-standard z-index syntax | `layout.tsx` |
| LOW-03 | LOW | Animations | `card-hover-lift` shadow hardcoded (acceptable) | `globals.css` |
| LOW-04 | LOW | Overflow | SubmissionPreview no scroll indicator | `SubmissionPreview.tsx` |
| LOW-05 | LOW | Overflow | CategoryFilter no keyboard scroll | `CategoryFilter.tsx` |
| LOW-06 | LOW | Print | Charts not addressed in print styles | `globals.css` |
| LOW-07 | LOW | Print | `bg-surface-elevated` missing from print | `globals.css` |
| LOW-08 | LOW | Patterns | Auth layout magic number for chrome height | `(auth)/layout.tsx` |

---

## Recommended Priority Actions

### Immediate (P0 -- before next deploy)

1. **Find-replace `drapeau-rouge` -> `chainsaw-red`** across all files (CRITICAL-01, CRITICAL-02)
2. **Fix `global-error.tsx`** to use token classes (CRITICAL-03)
3. **Add dark-mode overrides for `success`, `warning`, `info`** in globals.css (HIGH-03)

### Short-term (P1 -- this sprint)

4. **Replace raw Tailwind palette colors** with semantic tokens across all components (HIGH-01, HIGH-05, HIGH-06, MEDIUM-01, MEDIUM-05, MEDIUM-06)
5. **Define dark-mode-aware `chainsaw-red`** variant for text usage (HIGH-04, HIGH-10)
6. **Standardize `cn()` usage** for all conditional class merging (HIGH-11)
7. **Standardize card border radius and padding** conventions (HIGH-07, HIGH-08)
8. **Extract `GoogleIcon`** to shared component (HIGH-12)
9. **Add ring-offset to VoteButtonInline** focus styles (HIGH-09)

### Medium-term (P2 -- next sprint)

10. **Define chart color tokens** for Recharts components (CRITICAL-04)
11. **Standardize icon sizing** to `size-*` syntax (MEDIUM-07)
12. **Standardize font sizes** to Tailwind scale or named tokens (MEDIUM-08)
13. **Document z-index hierarchy** (MEDIUM-12)
14. **Address footer mobile visibility** (MEDIUM-04)
15. **Fix HeroSection double rotation** (MEDIUM-11)

### Low priority (P3 -- backlog)

16. Address print style gaps (LOW-06, LOW-07)
17. Add scroll indicators and keyboard navigation improvements (LOW-04, LOW-05)
18. Document magic numbers (LOW-01, LOW-08)
