# Audit 06 — React Patterns & Best Practices

**Date** : 2 mars 2026
**Scope** : React 19, Next.js 16 App Router, React Query, Zustand
**Files audited** : ~180 `.ts`/`.tsx` files under `src/`

---

## Executive Summary

The codebase demonstrates solid fundamentals: proper use of App Router server/client boundaries in most places, good React Query patterns for data-heavy components, well-structured Zustand stores for cross-component state, and consistent use of `useMemo`/`useCallback` in performance-sensitive areas. However, several components bypass React Query in favor of raw `useEffect` + `fetch`, some pages lack error/loading boundaries, and a handful of components exceed the 200-line guideline. This audit identifies **40 findings** across 12 audit categories.

### Summary by Severity

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 10 |
| MEDIUM | 18 |
| LOW | 10 |

---

## 1. Server vs Client Components

### FINDING 1.1 — `RecentActivityFeed` has unnecessary `'use client'` directive

- **Severity**: MEDIUM
- **File**: `/src/components/features/admin/RecentActivityFeed.tsx`, line 1
- **Description**: This component has `'use client'` but uses no hooks, event handlers, or browser APIs. It is a pure rendering component that receives data via props (`actions: ModerationActionItem[]`). It could be a Server Component.
- **Fix**: Remove `'use client'` directive. The component only renders props data with `formatRelativeTime` (a pure function) and static JSX.

### FINDING 1.2 — `DataStatusTable` is correctly a Server Component (positive)

- **Severity**: N/A (positive observation)
- **File**: `/src/components/features/data-status/DataStatusTable.tsx`
- **Description**: Good pattern. This component renders tabular data from props without `'use client'` and relies on server-fetched data.

### FINDING 1.3 — `BudgetPageClient` could partially be a Server Component

- **Severity**: LOW
- **File**: `/src/components/features/budget/BudgetPageClient.tsx`, line 1
- **Description**: `BudgetPageClient` is marked `'use client'` but does not use any hooks or event handlers itself. It is purely a composition of child components. The `'use client'` boundary is not needed here since child components that need it already declare it. However, given that it is a layout-level composition, the current approach is acceptable but slightly wasteful.
- **Fix**: Remove `'use client'` and let Next.js treat it as a Server Component. Children like `BudgetNav` and chart components already declare their own `'use client'`.

### FINDING 1.4 — `StatsPageClient` has unnecessary `'use client'`

- **Severity**: MEDIUM
- **File**: `/src/components/features/stats/StatsPageClient.tsx`, line 1
- **Description**: This is a pure composition component that receives `stats: StatsData` via props and renders child components. It uses no hooks, event handlers, or browser APIs. The child components (`GrandTotalCounter`, `KpiCards`, etc.) already have their own `'use client'` directives.
- **Fix**: Remove `'use client'` directive.

### FINDING 1.5 — Multiple consequences `ConsequenceCard` variants without `'use client'` (positive)

- **Severity**: N/A (positive observation)
- **File**: `/src/components/features/consequences/ConsequenceCard.tsx`
- **Description**: The component in the `consequences` folder correctly omits `'use client'` — it is a pure rendering component. The variant in `submissions/ConsequenceCard.tsx` correctly has `'use client'` because it uses icons and Lucide components that rely on client rendering context.

---

## 2. useEffect Misuse — Data Fetching in useEffect

### FINDING 2.1 — `LeaderboardPageClient` fetches data in `useEffect` instead of React Query

- **Severity**: HIGH
- **File**: `/src/components/features/leaderboard/LeaderboardPageClient.tsx`, lines 12-20
- **Description**: Uses raw `useEffect` + `fetch` + `useState` for data loading. This is an anti-pattern per the CLAUDE.md guidelines ("Never use `useEffect` for data fetching"). The component should use React Query's `useQuery`, which is already set up in the app via `QueryClientProvider`. This results in: no caching, no retry logic, no refetch on window focus, no deduplication, and no loading/error state management through React Query.
- **Fix**: Replace with `useQuery`:
  ```typescript
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      const json = await res.json();
      return json.data ?? [];
    },
  });
  ```

### FINDING 2.2 — `AdminGamificationClient` fetches data in `useEffect` instead of React Query

- **Severity**: HIGH
- **File**: `/src/components/features/admin/AdminGamificationClient.tsx`, lines 42-54
- **Description**: Same pattern as 2.1 — raw `useEffect` + `fetch` + multiple `useState` calls for `topUsers`, `xpStats`, `recentEvents`. Also, the manual XP form (lines 56-85) uses raw `fetch` instead of `useMutation`. This component manages 7 state variables (`topUsers`, `xpStats`, `recentEvents`, `loading`, `userId`, `amount`, `reason`, `submitting`, `message`) when React Query would handle loading/error/data states automatically.
- **Fix**: Convert data loading to `useQuery` and the manual XP form to `useMutation`. The form handler at `handleManualXp` should also invalidate the stats query on success.

### FINDING 2.3 — `ValidationQueue` fetches data in `useEffect` instead of React Query

- **Severity**: HIGH
- **File**: `/src/components/features/submissions/ValidationQueue.tsx`, lines 25-42
- **Description**: Uses `useEffect` with manual `useState` for loading/error/data. The `handleValidate` function at line 44 also uses raw `fetch` without optimistic updates or cache invalidation. After a validation action, the list does not update — users would need to refresh the page.
- **Fix**: Convert to `useQuery` for the list and `useMutation` for validation actions with `queryClient.invalidateQueries`.

### FINDING 2.4 — `FlagButton` fetches initial flag state in `useEffect` instead of React Query

- **Severity**: HIGH
- **File**: `/src/components/features/submissions/FlagButton.tsx`, lines 37-46
- **Description**: Uses `useEffect` to check if the user has already flagged. Also uses raw `fetch` for the POST action (lines 48-84) instead of `useMutation`. No loading state during initial check, no caching, no retry.
- **Fix**: Convert initial check to `useQuery` and submission to `useMutation`.

### FINDING 2.5 — `PrivacyControls` fetches settings in `useEffect` instead of React Query

- **Severity**: HIGH
- **File**: `/src/components/features/gamification/PrivacyControls.tsx`, lines 28-36
- **Description**: Uses `useEffect` for initial data load and raw `fetch` for updates. The optimistic update pattern at `updateSetting` (line 38-58) is manually implemented, but React Query's `useMutation` with `onMutate`/`onError` rollback would be cleaner and more consistent with the rest of the codebase.
- **Fix**: Convert to `useQuery` + `useMutation` with optimistic updates.

### FINDING 2.6 — `GamificationProvider` fetches stats in `useEffect` instead of React Query

- **Severity**: MEDIUM
- **File**: `/src/components/features/gamification/GamificationProvider.tsx`, lines 13-40
- **Description**: Uses `useEffect` to fetch gamification stats and populate a Zustand store. While the pattern of populating Zustand from an API is a valid design choice (it serves as a client-side cache for gamification data used across many components), it bypasses React Query's caching and deduplication. The `loaded` flag in Zustand is a manual reimplementation of `isSuccess` in React Query.
- **Fix**: Consider using `useQuery` with `onSuccess` to populate Zustand, or accept the current pattern given its cross-component nature but add error handling beyond `console.error`.

### FINDING 2.7 — `SimulatorShareCard` uses `useEffect` to build URL with `window.location.origin`

- **Severity**: LOW
- **File**: `/src/components/features/simulator/SimulatorShareCard.tsx`, lines 19-26
- **Description**: Uses `useEffect` solely to access `window.location.origin` and build a share URL. This is a legitimate pattern since `window` is only available client-side and the component needs the current origin. However, a simpler approach would be to build the URL lazily in the event handlers instead.
- **Fix**: Remove the `useEffect` and build the URL inside `handleCopy` and `handleNativeShare`:
  ```typescript
  const getShareUrl = () => {
    const params = new URLSearchParams({...});
    return `${window.location.origin}/simulateur?${params}`;
  };
  ```

---

## 3. useEffect Patterns — Proper Usage (Positive Observations)

### FINDING 3.1 — `MobileFeedFAB` correctly uses `useEffect` with cleanup

- **Severity**: N/A (positive observation)
- **File**: `/src/components/features/feed/MobileFeedFAB.tsx`, lines 12-19
- **Description**: Properly uses `useEffect` with scroll event listener and cleanup via `removeEventListener`. This is a legitimate browser API interaction, not data fetching.

### FINDING 3.2 — `useInfiniteScroll` correctly uses `useEffect` for IntersectionObserver

- **Severity**: N/A (positive observation)
- **File**: `/src/hooks/useInfiniteScroll.ts`, lines 51-64
- **Description**: Properly sets up and tears down an IntersectionObserver. This is a correct use of `useEffect` for browser API integration.

### FINDING 3.3 — `BudgetNav` correctly uses `useEffect` for click-outside and Escape handling

- **Severity**: N/A (positive observation)
- **File**: `/src/components/features/budget/BudgetNav.tsx`, lines 26-42
- **Description**: Properly sets up event listeners conditionally (`if (!open) return`) and cleans up correctly. Good pattern.

---

## 4. State Management

### FINDING 4.1 — Zustand stores are well-designed (positive)

- **Severity**: N/A (positive observation)
- **Files**: `/src/stores/vote-store.ts`, `/src/stores/gamification-store.ts`, `/src/stores/feed-preview-store.ts`
- **Description**: All three Zustand stores are properly scoped:
  - `vote-store`: Client-side vote cache for optimistic updates across components
  - `gamification-store`: XP state and toast queue for cross-component gamification
  - `feed-preview-store`: Sidebar preview selection state
  Each store is focused, uses `Map` for vote state (good for frequent updates), and avoids storing server-authoritative data.

### FINDING 4.2 — `AdminGamificationClient` manages 9 state variables that should be consolidated

- **Severity**: MEDIUM
- **File**: `/src/components/features/admin/AdminGamificationClient.tsx`, lines 30-40
- **Description**: The component has 9 `useState` calls: `topUsers`, `xpStats`, `recentEvents`, `loading`, `userId`, `amount`, `reason`, `submitting`, `message`. The first 4 should be replaced by a single `useQuery`, and the manual XP form (`userId`, `amount`, `reason`, `submitting`, `message`) should use `useMutation` which handles `isPending` and `isSuccess` internally.
- **Fix**: Consolidate via React Query as described in Finding 2.2.

### FINDING 4.3 — `EditSubmissionDialog` does not reinitialize form state when `submission` prop changes

- **Severity**: MEDIUM
- **File**: `/src/components/features/submissions/EditSubmissionDialog.tsx`, lines 41-47
- **Description**: The `fields` state is initialized from `submission` props with `useState`. If the dialog is reused with a different submission (e.g., in `ModerationQueue` which renders multiple `ModerationCard` instances each with an `EditSubmissionDialog`), the state will not update when `submission` changes because `useState` initial values only apply on first mount. In this codebase, each `ModerationCard` renders its own `EditSubmissionDialog`, so the issue is mitigated by React's keying. However, if the component were reused at a single mount point, stale data could appear.
- **Fix**: Either ensure the component is always keyed by `submission.id`, or add a `useEffect` to sync state when `submission.id` changes.

---

## 5. Re-render Optimization

### FINDING 5.1 — `FeedList` properly uses `useMemo` for derived data (positive)

- **Severity**: N/A (positive observation)
- **File**: `/src/components/features/feed/FeedList.tsx`, lines 26-44
- **Description**: Three `useMemo` calls properly memoize `allSubmissions`, `filteredSubmissions`, and `submissionIds`. Good practice given this is a hot rendering path in the main feed.

### FINDING 5.2 — `SubmissionCard` accesses Zustand store with a selector (positive)

- **Severity**: N/A (positive observation)
- **File**: `/src/components/features/feed/SubmissionCard.tsx`, line 34
- **Description**: `useFeedPreviewStore((s) => s.setSelectedSubmission)` — proper use of a selector to avoid re-renders when unrelated store state changes.

### FINDING 5.3 — `LeaderboardPageClient` creates new arrays on every render

- **Severity**: LOW
- **File**: `/src/components/features/leaderboard/LeaderboardPageClient.tsx`, lines 22-23
- **Description**: `const top3 = entries.slice(0, 3)` and `const rest = entries.slice(3)` create new arrays on every render. While this is a minor issue (the component is not in a hot rendering path), wrapping them in `useMemo` would be consistent with the codebase patterns.
- **Fix**: Wrap in `useMemo`:
  ```typescript
  const top3 = useMemo(() => entries.slice(0, 3), [entries]);
  const rest = useMemo(() => entries.slice(3), [entries]);
  ```

### FINDING 5.4 — `useVoteStore` creates new Map on every `setVote` / `setCounts` call

- **Severity**: LOW
- **File**: `/src/stores/vote-store.ts`, lines 20-31
- **Description**: `new Map(state.votes)` creates a full copy of the Map on every vote action. For small maps this is fine, but with hundreds of submissions loaded via infinite scroll, this could become expensive. However, Zustand's shallow equality check requires a new reference for state updates, so this is the correct approach with Maps.
- **Fix**: Accept current pattern. If performance becomes an issue, consider using `immer` middleware or a plain object `Record<string, VoteState>` instead of `Map`.

### FINDING 5.5 — `SubmissionCard` inline function in `handleCardClick` is recreated every render

- **Severity**: LOW
- **File**: `/src/components/features/feed/SubmissionCard.tsx`, lines 36-44
- **Description**: `handleCardClick` is defined as a regular function inside the component and recreated on every render. Since `SubmissionCard` is rendered in a list of potentially hundreds of items, this could cause unnecessary GC pressure.
- **Fix**: Wrap in `useCallback`:
  ```typescript
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey || e.button === 1) return;
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      e.preventDefault();
      setSelectedSubmission(submission);
    }
  }, [setSelectedSubmission, submission]);
  ```

---

## 6. Key Usage

### FINDING 6.1 — `RecentActivityFeed` uses `idx` (index) as key in dynamic list

- **Severity**: CRITICAL
- **File**: `/src/components/features/admin/RecentActivityFeed.tsx`, line 55
- **Description**: `key={idx}` is used for a list of moderation actions. Per CLAUDE.md: "Never use `index` as a key in lists where items can be reordered, added, or removed." While these actions are append-only, using index keys is still risky if items are filtered or if the API response changes order.
- **Fix**: Use a unique identifier. If the `ModerationActionItem` does not have an `id`, compose a key from `action.createdAt` + `action.submissionTitle`:
  ```typescript
  key={`${action.createdAt}-${action.submissionTitle}`}
  ```

### FINDING 6.2 — `DataStatusTable` uses `index` variable but keys by `denom.key` (positive)

- **Severity**: N/A (positive observation)
- **File**: `/src/components/features/data-status/DataStatusTable.tsx`, line 82
- **Description**: While the iterator is `(denom, index)`, the `key` is correctly set to `denom.key`, not `index`. The `index` is only used for alternating row styling. Good pattern.

### FINDING 6.3 — `consequences/ConsequenceCard` uses index as key for equivalences

- **Severity**: CRITICAL
- **File**: `/src/components/features/consequences/ConsequenceCard.tsx`, line 71
- **Description**: `key={i}` used in `.map((eq, i) => ...)` for equivalences. Similarly, in `submissions/ConsequenceCard.tsx` line 141: `key={index}` for equivalences. These lists could potentially change if the cost calculation changes.
- **Fix**: Use `eq.label` as the key (equivalence labels should be unique within a single result):
  ```typescript
  key={eq.label}
  ```

### FINDING 6.4 — Skeleton/placeholder lists correctly use index keys (positive)

- **Severity**: N/A (positive observation)
- **Files**: Multiple components (e.g., `FeedSkeleton`, `ModerationQueue` skeleton, `BroadcastTool` skeleton)
- **Description**: Static skeleton loaders like `Array.from({ length: 3 }).map((_, i) => ...)` correctly use `key={i}` since these are static placeholders that never reorder.

---

## 7. Component Definitions Inside Components

### FINDING 7.1 — `ModerationQueue` defines `ModerationCard` in the same file (acceptable)

- **Severity**: LOW
- **File**: `/src/components/features/admin/ModerationQueue.tsx`, lines 101-309
- **Description**: `ModerationCard` is defined as a module-level function in the same file as `ModerationQueue`. Per CLAUDE.md: "Never define components inside other components. Extract to separate files or module-level functions." This is a module-level function, so it follows the guideline. However, `ModerationCard` alone is ~208 lines, making the combined file 310 lines — well over the 200-line guideline.
- **Fix**: Extract `ModerationCard` to its own file `ModerationCard.tsx` in the same directory.

### FINDING 7.2 — `FeatureManagementTable` defines `FeatureManagementCard` in same file (acceptable)

- **Severity**: LOW
- **File**: `/src/components/features/admin/FeatureManagementTable.tsx`, lines 103-254
- **Description**: Same pattern as 7.1. `FeatureManagementCard` is module-level, but combined file is 254 lines.
- **Fix**: Extract to `FeatureManagementCard.tsx`.

### FINDING 7.3 — `XpToast` defines `XpToastItem` in same file (acceptable)

- **Severity**: N/A (positive observation)
- **File**: `/src/components/features/gamification/XpToast.tsx`, lines 30-72
- **Description**: Module-level function, small component, file is only 72 lines. This is perfectly acceptable.

### FINDING 7.4 — `MiniLeaderboard` defines `RankBadge`, `LeaderboardRow`, `InlineCard` in same file (acceptable)

- **Severity**: N/A (positive observation)
- **File**: `/src/components/features/leaderboard/MiniLeaderboard.tsx`, lines 10-60
- **Description**: Three small helper components defined at module level. File is 114 lines. Acceptable.

### FINDING 7.5 — `SubmissionPreview` defines inline IIFE for `sourceDomain`

- **Severity**: LOW
- **File**: `/src/components/features/feed/SubmissionPreview.tsx`, lines 30-36
- **Description**: Uses an IIFE `(() => { ... })()` to extract domain from URL. While not a component definition, this creates a new function on every render. Since URL parsing is cheap and the component is rendered at most once (sidebar preview), this is acceptable but could be extracted to a utility or wrapped in `useMemo`.
- **Fix**: Use `extractDomain` from `@/lib/utils/format` which already exists in the codebase (used in `SubmissionDetail.tsx`).

---

## 8. Event Handlers

### FINDING 8.1 — `FlaggedContentQueue` has complex inline functions in JSX

- **Severity**: MEDIUM
- **File**: `/src/components/features/admin/FlaggedContentQueue.tsx`, lines 181-186, 200-206
- **Description**: Two inline arrow functions in `onClick` handlers pass object arguments to `moderateMutation.mutate`. While not deeply complex, these create new function references on every render for each list item. Per CLAUDE.md: "Never use inline function definitions in JSX for complex logic."
- **Fix**: Extract to named handlers or use `useCallback`. For mutation calls on list items, the current pattern is common and the performance impact is negligible given the small list size. Accept as-is for admin-only component.

### FINDING 8.2 — `FeedSortTabs` properly uses `useCallback` for event handlers (positive)

- **Severity**: N/A (positive observation)
- **File**: `/src/components/features/feed/FeedSortTabs.tsx`, lines 21, 43
- **Description**: Both `handleKeyDown` and `handleTabClick` are wrapped in `useCallback`. Good practice for a component rendered in the main feed layout.

---

## 9. Error Boundaries & Error Handling

### FINDING 9.1 — Missing `error.tsx` for most route segments

- **Severity**: HIGH
- **File**: Various `src/app/*/` directories
- **Description**: Only 3 error boundaries exist:
  - `/src/app/error.tsx` (root)
  - `/src/app/feed/[sort]/error.tsx`
  - `/src/app/s/[id]/error.tsx`

  Missing error boundaries for:
  - `/src/app/admin/*` (6 pages, none have error.tsx)
  - `/src/app/profile/*` (3 pages)
  - `/src/app/stats/` (1 page)
  - `/src/app/leaderboard/` (1 page)
  - `/src/app/submit/` (2 pages)
  - `/src/app/chiffres/` (1 page)
  - `/src/app/simulateur/` (1 page)
  - `/src/app/features/` (1 page)
  - `/src/app/data-status/` (1 page)

  The root `error.tsx` will catch unhandled errors, but route-specific error boundaries allow for more contextual error messages and partial page recovery.
- **Fix**: Add `error.tsx` at minimum for `/admin/`, `/profile/`, `/stats/`, and `/submit/` route groups, since these are the most interactive and error-prone.

### FINDING 9.2 — `LeaderboardPageClient` swallows errors with `console.error`

- **Severity**: MEDIUM
- **File**: `/src/components/features/leaderboard/LeaderboardPageClient.tsx`, line 18
- **Description**: `.catch(console.error)` — errors during fetch are logged to console but not displayed to the user. If the API fails, the user sees an empty loading state that resolves to "Aucun contributeur pour le moment" — misleading.
- **Fix**: Set an error state and display an error message, or use React Query which handles this automatically.

### FINDING 9.3 — `GamificationProvider` swallows errors with `console.error`

- **Severity**: MEDIUM
- **File**: `/src/components/features/gamification/GamificationProvider.tsx`, line 39
- **Description**: Same issue as 9.2. If the gamification stats API fails, the Zustand store remains with default values (level 1, 0 XP) which could be misleading to the user.
- **Fix**: Set a failed state in the Zustand store, or use React Query.

### FINDING 9.4 — `PrivacyControls` swallows initial fetch errors with `console.error`

- **Severity**: MEDIUM
- **File**: `/src/components/features/gamification/PrivacyControls.tsx`, line 34
- **Description**: Same pattern. User sees a permanent skeleton if fetch fails (since `loading` stays `true` until `.finally()`... actually `.finally(() => setLoading(false))` does run, but `settings` stays `null`, resulting in the loading state being shown indefinitely via `loading || !settings`).
- **Fix**: Convert to React Query or handle the error state explicitly.

---

## 10. Loading States

### FINDING 10.1 — Missing `loading.tsx` for route segments with data fetching

- **Severity**: HIGH
- **File**: Various route directories
- **Description**: Loading states exist for:
  - `/src/app/loading.tsx` (root)
  - `/src/app/feed/[sort]/loading.tsx`
  - `/src/app/s/[id]/loading.tsx`
  - `/src/app/stats/loading.tsx`
  - `/src/app/leaderboard/loading.tsx`
  - `/src/app/profile/[userId]/loading.tsx`

  Missing loading states for:
  - `/src/app/admin/` and all admin sub-routes (6 pages)
  - `/src/app/submit/` (2 pages)
  - `/src/app/chiffres/` (data-heavy page)
  - `/src/app/simulateur/`
  - `/src/app/features/`
  - `/src/app/profile/settings/`
  - `/src/app/data-status/`

  Per CLAUDE.md: "Never ignore loading/error states."
- **Fix**: Add `loading.tsx` for at least `/admin/`, `/chiffres/`, and `/submit/` since these involve server-side data fetching or heavy component loading.

### FINDING 10.2 — Admin sub-routes have no loading or error boundaries

- **Severity**: HIGH
- **File**: `/src/app/admin/moderation/page.tsx`, `/src/app/admin/broadcast/page.tsx`, etc.
- **Description**: All 6 admin pages rely on client-side React Query loading states (skeleton loaders in each component), which is functional. However, if the page-level server component fails (e.g., auth check throws), there is no `error.tsx` to catch it gracefully. The admin layout does exist, which is good.
- **Fix**: Add a single `error.tsx` in `/src/app/admin/` to cover all admin routes.

---

## 11. Component Size

### FINDING 11.1 — Components exceeding 200-line guideline

- **Severity**: MEDIUM
- **Files and line counts**:
  | File | Lines | Issue |
  |------|-------|-------|
  | `admin/ModerationQueue.tsx` | 310 | Contains `ModerationCard` (should be extracted) |
  | `submissions/SubmissionForm.tsx` | 302 | Single form component, could extract field groups |
  | `admin/AdminGamificationClient.tsx` | 295 | Manages too many concerns (stats + manual XP form) |
  | `budget/BudgetPageClient.tsx` | 283 | Composition-only, acceptable but remove `'use client'` |
  | `admin/FeatureManagementTable.tsx` | 254 | Contains `FeatureManagementCard` (should be extracted) |
  | `budget/EUComparisonSection.tsx` | 253 | Chart component with significant JSX |
  | `admin/BroadcastTool.tsx` | 250 | Could extract history list to separate component |
  | `submissions/SuggestCorrectionDialog.tsx` | 246 | Single dialog, borderline acceptable |
  | `submissions/SubmissionDetail.tsx` | 242 | Could extract cost block and action bar |
  | `budget/SocialSpendingSection.tsx` | 231 | Chart component with significant JSX |
  | `submissions/EditSubmissionDialog.tsx` | 225 | Form dialog, borderline acceptable |
  | `admin/FlaggedContentQueue.tsx` | 222 | Single component, borderline |
  | `feed/SubmissionCard.tsx` | 211 | Hot rendering path component |
  | `feature-voting/FeatureProposalList.tsx` | 211 | Contains filters + list + load more |

- **Description**: 14 files exceed the 200-line guideline. The most actionable are the admin components with embedded sub-components.
- **Fix** (prioritized):
  1. Extract `ModerationCard` from `ModerationQueue.tsx` -> saves ~208 lines
  2. Extract `FeatureManagementCard` from `FeatureManagementTable.tsx` -> saves ~151 lines
  3. Split `AdminGamificationClient` into stats display + manual XP form components
  4. For budget chart components (EUComparison, SocialSpending), the size is driven by chart configuration JSX and is acceptable

---

## 12. Hook Rules

### FINDING 12.1 — All hooks follow the Rules of Hooks (positive)

- **Severity**: N/A (positive observation)
- **Description**: No instances of hooks called conditionally or inside non-component functions. All hooks are at the top level of components or custom hooks. The `useVoteHydration` hook correctly uses `useRef` for the `fetched` set.

### FINDING 12.2 — `useIsMobile` could cause hydration mismatch

- **Severity**: MEDIUM
- **File**: `/src/lib/hooks/useIsMobile.ts`, lines 4-16
- **Description**: The hook initializes `isMobile` to `false` via `useState(false)`, then sets it to the actual value in `useEffect`. During SSR, `isMobile` is always `false`, but on the client, the first render also shows `false` before the `useEffect` fires. This can cause a flash of wrong layout. The hook is used in `SocialSpendingSection` and `EUComparisonSection` for responsive chart labels.
- **Fix**: Use `useSyncExternalStore` with `getServerSnapshot` returning a safe default, or initialize from `window.matchMedia` in a lazy initializer (acceptable since these components are `'use client'`). Alternatively, use CSS-based responsive design instead of JS-based breakpoints.

---

## 13. React Query Patterns

### FINDING 13.1 — React Query is well-used where present (positive)

- **Severity**: N/A (positive observation)
- **Files**: All hooks in `/src/hooks/` and several components in `/src/components/features/admin/`
- **Description**: Where React Query is used, the patterns are solid:
  - `queryKey` arrays properly include all dependencies (e.g., `['feed', sort, timeWindow]`)
  - `useMutation` with `onMutate`/`onError` for optimistic updates (e.g., `useVote`)
  - `queryClient.invalidateQueries` for cache invalidation after mutations
  - `useInfiniteQuery` with proper `getNextPageParam` for pagination
  - `staleTime` configured at both provider level (60s) and per-query level where needed

### FINDING 13.2 — `ConsequenceLoader` uses POST for a query (design issue)

- **Severity**: LOW
- **File**: `/src/components/features/consequences/ConsequenceLoader.tsx`, lines 19-22
- **Description**: Uses `useQuery` with a POST method to calculate costs. While functionally correct (React Query handles caching by `queryKey`), it violates HTTP semantics since this is a read operation that could be a GET with query parameters. The POST is likely used to avoid URL length limits with the amount parameter.
- **Fix**: Accept as-is. The POST is justified if the calculation payload grows, and React Query handles the caching correctly.

### FINDING 13.3 — `useVote` uses mutation but does not invalidate feed queries

- **Severity**: LOW
- **File**: `/src/hooks/useVote.ts`, lines 18-73
- **Description**: The vote hook uses Zustand for optimistic updates and React Query mutation, but does not call `queryClient.invalidateQueries` for the feed query. This is intentional — the Zustand store serves as the single source of truth for vote state across all components, and the feed is infinite-loaded. Invalidating the feed query would refetch all pages. The `onSuccess` handler does sync server counts back to Zustand. Good design choice.

### FINDING 13.4 — QueryClient configuration is appropriate (positive)

- **Severity**: N/A (positive observation)
- **File**: `/src/components/layout/Providers.tsx`, lines 11-21
- **Description**: `staleTime: 60 * 1000` (1 minute) and `refetchOnWindowFocus: false` are reasonable defaults for a civic platform where data freshness is important but not real-time critical. The `QueryClient` is properly initialized inside `useState` to avoid recreation on re-renders.

### FINDING 13.5 — Inconsistent data fetching approach across the codebase

- **Severity**: HIGH
- **Description**: The codebase has two competing patterns for client-side data fetching:
  1. **React Query** (`useQuery`/`useMutation`): Used in `useSolutions`, `useSources`, `useCommunityNotes`, `useComments`, `useVote`, `ConsequenceLoader`, `BroadcastTool`, `ModerationQueue`, `FlaggedContentQueue`, `FeatureManagementTable`, `FeatureProposalList`, `VotesList`, `SubmissionsList`
  2. **Raw useEffect + fetch**: Used in `LeaderboardPageClient`, `AdminGamificationClient`, `ValidationQueue`, `FlagButton`, `PrivacyControls`, `GamificationProvider`

  This inconsistency means some components get caching, retry, deduplication, and loading/error states for free, while others manually implement (or skip) these features. This is the most impactful finding in this audit.
- **Fix**: Migrate all `useEffect`-based data fetching to React Query. Estimated effort: ~2-3 hours for all 6 components.

---

## Summary of Recommended Actions

### Priority 1 — Critical / High (do now)
1. **Migrate `useEffect` fetchers to React Query** (Findings 2.1-2.5, 13.5): `LeaderboardPageClient`, `AdminGamificationClient`, `ValidationQueue`, `FlagButton`, `PrivacyControls`
2. **Fix index-as-key issues** (Findings 6.1, 6.3): `RecentActivityFeed`, `ConsequenceCard` (both variants)
3. **Add error boundaries** (Finding 9.1): At minimum `/admin/error.tsx`, `/profile/error.tsx`, `/submit/error.tsx`
4. **Add loading states** (Finding 10.1): At minimum `/admin/loading.tsx`, `/chiffres/loading.tsx`

### Priority 2 — Medium (do soon)
5. **Remove unnecessary `'use client'`** (Findings 1.1, 1.4): `RecentActivityFeed`, `StatsPageClient`
6. **Fix error swallowing** (Findings 9.2-9.4): Replace `console.error` catch handlers with user-visible error states
7. **Extract large sub-components** (Findings 7.1, 7.2, 11.1): `ModerationCard`, `FeatureManagementCard`, `AdminGamificationClient` form
8. **Fix `useIsMobile` hydration risk** (Finding 12.2): Consider `useSyncExternalStore` or CSS-based approach

### Priority 3 — Low (nice to have)
9. **Optimize `SubmissionCard` handlers** (Finding 5.5): Wrap `handleCardClick` in `useCallback`
10. **Use existing `extractDomain` utility** (Finding 7.5): In `SubmissionPreview`
11. **Remove unnecessary `BudgetPageClient` client directive** (Finding 1.3)
12. **Simplify `SimulatorShareCard` URL building** (Finding 2.7)

---

## Positive Patterns Worth Preserving

1. **Zustand selector pattern**: Components like `SubmissionCard` use `useStore((s) => s.specificProp)` to minimize re-renders
2. **React Query optimistic updates**: `useVote` implements full `onMutate` / `onError` rollback pattern
3. **Server Components by default**: Budget data pages, data-status table, methodology pages are correctly Server Components
4. **Infinite scroll architecture**: `useInfiniteScroll` + `FeedList` + sentinel pattern is well-implemented
5. **`useMemo` in hot paths**: `FeedList`, `CategoryFilter`, `SimulatorPageClient` all memoize derived data
6. **QueryClient configuration**: Sensible defaults with per-query overrides
7. **Module-level helper components**: Small components like `MetricRow`, `RankBadge`, `VoteSkeleton` are extracted at module level, not inline
8. **Proper cleanup in effects**: All `useEffect` calls with subscriptions (`scroll`, `IntersectionObserver`, `matchMedia`) include cleanup functions
