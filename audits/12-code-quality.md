# Audit 12 -- Code Quality

**Date**: 2026-03-02
**Branch**: `feat/simulateur`
**Auditor**: Claude Opus 4.6
**Scope**: All source files under `src/` checked against CLAUDE.md conventions

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 17 |
| MEDIUM | 22 |
| LOW | 10 |
| **Total** | **52** |

---

## 1. File Size Violations

### 1.1 Components Exceeding 200 Lines

| # | Severity | File | Lines | Description | Fix |
|---|----------|------|-------|-------------|-----|
| 1 | HIGH | `src/components/features/admin/ModerationQueue.tsx` | 310 | Exceeds 200-line component limit by 55%. Contains data fetching, form state, table rendering, and moderation logic all in one component. | Split into `ModerationTable`, `ModerationActions`, and a custom hook `useModerationQueue`. |
| 2 | HIGH | `src/components/features/submissions/SubmissionForm.tsx` | 302 | Multi-step form with validation, state management, and rendering all combined. | Extract validation logic to a hook `useSubmissionForm`, split form sections into sub-components. |
| 3 | HIGH | `src/components/features/admin/AdminGamificationClient.tsx` | 295 | God component: stats cards, manual XP form, top users table, recent events table -- 4 distinct sections with their own data. | Split into `AdminXpStatsCards`, `ManualXpForm`, `AdminTopUsersTable`, `AdminRecentXpEvents`. |
| 4 | HIGH | `src/components/features/budget/BudgetPageClient.tsx` | 283 | Orchestrator component importing 15+ sub-components. | Acceptable as a page-level orchestrator but consider grouping related sections. |
| 5 | HIGH | `src/components/features/auth/RegisterForm.tsx` | 268 | Form with extensive inline validation and error handling. | Extract form logic into `useRegisterForm` hook. |
| 6 | HIGH | `src/components/features/admin/FeatureManagementTable.tsx` | 254 | Combined table, status badges, and admin actions. | Split admin actions into `FeatureRowActions` sub-component. |
| 7 | HIGH | `src/components/features/budget/EUComparisonSection.tsx` | 253 | Chart + KPI cards + data transformation all in one. | Extract chart into `EUDebtChart` and `EUDeficitChart` sub-components. |
| 8 | MEDIUM | `src/components/features/auth/LoginForm.tsx` | 252 | Similar to RegisterForm -- inline validation and rendering. | Extract form logic into `useLoginForm` hook. |
| 9 | MEDIUM | `src/components/features/admin/BroadcastTool.tsx` | 250 | Broadcast form + history table combined. | Split into `BroadcastForm` and `BroadcastHistory`. |
| 10 | MEDIUM | `src/components/features/submissions/SuggestCorrectionDialog.tsx` | 246 | Complex dialog with multi-field form. | Extract form state to a hook. |
| 11 | MEDIUM | `src/components/features/submissions/SubmissionDetail.tsx` | 242 | Renders many sub-sections. | Acceptable as page-level orchestrator if sub-components are well-factored. |
| 12 | MEDIUM | `src/components/features/budget/SocialSpendingSection.tsx` | 231 | Charts + data transformation. | Extract chart into dedicated sub-component. |
| 13 | MEDIUM | `src/components/features/submissions/EditSubmissionDialog.tsx` | 225 | Dialog with form logic. | Extract form state to a hook. |
| 14 | MEDIUM | `src/components/features/admin/FlaggedContentQueue.tsx` | 222 | Data fetching + table rendering. | Split into table and hook. |
| 15 | MEDIUM | `src/components/features/feed/SubmissionCard.tsx` | 211 | Card rendering + conditional logic. | Could extract metric display row to shared sub-component. |
| 16 | MEDIUM | `src/components/features/feature-voting/FeatureProposalList.tsx` | 211 | List + filtering + skeleton. | Extract filtering to hook. |

### 1.2 Hooks Exceeding 100 Lines

| # | Severity | File | Lines | Description | Fix |
|---|----------|------|-------|-------------|-----|
| 17 | MEDIUM | `src/hooks/use-comment-vote.ts` | 117 | Complex optimistic update logic with direction toggling. | Extract the optimistic state calculation (onMutate) to a pure helper function in `src/lib/utils/`. |
| 18 | LOW | `src/hooks/use-comments.ts` | 102 | Marginally over limit. | Monitor; minor refactoring of shared fetch patterns could reduce. |
| 19 | LOW | `src/hooks/use-share.ts` | 101 | Marginally over limit. | Monitor. |

### 1.3 API Routes Exceeding 80 Lines

| # | Severity | File | Lines | Description | Fix |
|---|----------|------|-------|-------------|-----|
| 20 | CRITICAL | `src/app/api/submissions/[id]/comments/route.ts` | 204 | 2.5x the 80-line limit. Contains full GET (cursor pagination, nested replies, counting) and POST (validation, depth checking, XP awarding) handlers with inline business logic. | Extract `getCommentsWithReplies()` and `createComment()` to `src/lib/api/comments.ts`. |
| 21 | HIGH | `src/app/api/comments/[id]/vote/route.ts` | 173 | Vote logic with score recalculation, XP awarding, and a custom `isNull` helper at bottom. | Extract vote toggle/score recalculation to `src/lib/api/comment-votes.ts`. |
| 22 | HIGH | `src/app/api/submissions/[id]/validate/route.ts` | 154 | Community validation with weighted voting, auto-resolve threshold checks, XP awarding. | Extract weighted-vote logic and auto-resolve to `src/lib/api/community-validation.ts`. |
| 23 | HIGH | `src/app/api/notes/[id]/vote/route.ts` | 152 | Note voting with pin/unpin threshold logic. | Extract vote toggle and pinning logic to `src/lib/api/note-votes.ts`. |
| 24 | HIGH | `src/app/api/og/[id]/route.tsx` | 145 | OG image generation. | Acceptable for image-gen routes but consider extracting data fetching. |
| 25 | HIGH | `src/app/api/submissions/[id]/vote/route.ts` | 136 | Dual-track (auth + IP) voting. Already delegates to `castVote`/`castIpVote` but inline XP formatting duplicates `formatXpResponse`. | Use `formatXpResponse()` instead of manual formatting at line 64. |
| 26 | MEDIUM | `src/app/api/features/route.ts` | 135 | GET+POST handlers combined. | Split GET logic to `src/lib/api/feature-proposals.ts`. |
| 27 | MEDIUM | `src/app/api/admin/broadcast/route.ts` | 125 | GET+POST handlers. | Extract broadcast logic. |
| 28 | MEDIUM | `src/app/api/sources/[id]/validate/route.ts` | 123 | Source validation vote toggle. Nearly identical structure to note voting. | Extract shared dual-track vote toggle pattern (see DRY #33). |
| 29 | MEDIUM | `src/app/api/cron/open-data-import/route.ts` | 118 | Import orchestration logic. | Move loop logic to `src/lib/open-data/orchestrator.ts`. |
| 30 | MEDIUM | `src/app/api/submissions/[id]/flag/route.ts` | 118 | GET+POST with threshold logic. | Extract flag logic. |
| 31 | MEDIUM | `src/app/api/solutions/[id]/vote/route.ts` | 117 | Vote toggle with upvote/downvote counting. | Extract to shared vote helper (see DRY #33). |
| 32 | MEDIUM | `src/app/api/submissions/[id]/sources/route.ts` | 114 | Source creation + XP. | Move creation logic to `src/lib/api/sources.ts`. |
| 33 | LOW | `src/app/api/submissions/route.ts` | 113 | Submission creation. | Extract submission creation to lib. |
| 34 | LOW | `src/app/api/features/[id]/vote/route.ts` | 106 | Feature ballot voting. | Extract ballot logic. |
| 35 | LOW | `src/app/api/submissions/[id]/cost/route.ts` | 106 | Cost calculation. | Already delegates, but has significant commented-out code (see Dead Code #44). |
| 36 | LOW | `src/app/api/admin/submissions/[id]/moderate/route.ts` | 104 | Admin moderation. | Extract to `src/lib/api/moderation.ts`. |
| 37 | LOW | `src/app/api/admin/gamification/route.ts` | 104 | GET+POST for admin XP. | Extract handlers. |
| 38 | LOW | `src/app/api/admin/dashboard/route.ts` | 93 | Dashboard stats aggregation. | Extract to `src/lib/api/admin-stats.ts`. |
| 39 | LOW | `src/app/api/cron/streak-check/route.ts` | 96 | Streak expiration logic. | Move to `src/lib/gamification/streak-check.ts`. |

---

## 2. DRY Violations

| # | Severity | Files | Description | Fix |
|---|----------|-------|-------------|-----|
| 40 | CRITICAL | `src/app/api/submissions/[id]/vote/route.ts` line 64 vs `src/lib/gamification/xp-response.ts` | **XP response formatting duplicated.** The vote route manually constructs the XP response object `{ amount: xpResult.xpAmount + ... }` instead of using the existing `formatXpResponse()` helper. Same pattern in `src/app/api/submissions/[id]/validate/route.ts` lines 132-140. | Use `formatXpResponse()` from `@/lib/gamification/xp-response` consistently in all routes. |
| 41 | HIGH | `src/app/api/notes/[id]/vote/route.ts`, `src/app/api/sources/[id]/validate/route.ts`, `src/app/api/solutions/[id]/vote/route.ts` | **Triple-duplicated dual-track vote toggle pattern.** All three routes implement the same algorithm: find existing vote by userId or ipHash, toggle off if same direction, switch if different, insert if new, update counters. ~60 lines of near-identical logic in each. | Extract a generic `dualTrackVoteToggle()` helper to `src/lib/api/vote-toggle.ts` parameterized by entity table, vote table, and counter columns. |
| 42 | HIGH | `src/components/features/submissions/ConsequenceCard.tsx` and `src/components/features/consequences/ConsequenceCard.tsx` | **Two distinct ConsequenceCard components** with overlapping functionality. The `submissions/` version handles `CostCalculationData` and `CostToNicolasResults`; the `consequences/` version handles `CostToNicolasResult`. Both render metric rows with "Cout par citoyen/contribuable/foyer" labels. Both define a `MetricRow` sub-component. | Consolidate into a single ConsequenceCard in `src/components/features/consequences/` that handles all input formats via a normalizer function. |
| 43 | MEDIUM | Multiple API routes | **Auth guard boilerplate duplicated.** The pattern `const session = await auth(); if (!session?.user) return apiError('UNAUTHORIZED', ...)` appears in 15+ API routes with slightly varying messages ("Authentification requise" vs "Connexion requise"). | Create `requireAuth()` middleware helper in `src/lib/api/auth-guard.ts` that throws or returns the session. |
| 44 | MEDIUM | Multiple API routes | **Rate limit check boilerplate duplicated.** `const rateLimited = await checkRateLimit(...); if (rateLimited) return apiError('RATE_LIMITED', ...)` pattern appears 15+ times. | Wrap into a `withRateLimit()` higher-order function or combine with auth guard. |
| 45 | MEDIUM | `src/app/api/submissions/[id]/cost/route.ts` | **Custom `jsonResponse()` helper** defined locally duplicates `apiSuccess`/`apiError` from `@/lib/api/response`. This route does not use the standard API envelope pattern. | Replace `jsonResponse()` calls with `apiSuccess()`/`apiError()`. |

---

## 3. Naming Convention Violations

| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| 46 | MEDIUM | `src/hooks/` directory | **Inconsistent hook file naming.** Some hooks use kebab-case (`use-comments.ts`, `use-comment-vote.ts`, `use-share.ts`, `use-page-view.ts`) while others use camelCase (`useAuth.ts`, `useVote.ts`, `useSolutions.ts`, `useSources.ts`, `useInfiniteScroll.ts`, `useXpResponse.ts`, `useCommunityNotes.ts`, `useAdjustments.ts`, `useVoteHydration.ts`). CLAUDE.md specifies camelCase for hooks. | Rename kebab-case hooks to camelCase: `use-comments.ts` -> `useComments.ts`, `use-comment-vote.ts` -> `useCommentVote.ts`, `use-share.ts` -> `useShare.ts`, `use-page-view.ts` -> `usePageView.ts`. |
| 47 | MEDIUM | `src/lib/hooks/useIsMobile.ts` | **Hook placed in `src/lib/hooks/`** instead of the canonical `src/hooks/` directory as defined in CLAUDE.md. This is the only file in `src/lib/hooks/`. | Move to `src/hooks/useIsMobile.ts`. |
| 48 | LOW | `src/lib/validators/` directory | **Zod schemas split between two locations.** CLAUDE.md says Zod schemas go in `src/lib/utils/validation.ts`, but there are also schemas in `src/lib/validators/auth.ts`, `src/lib/validators/delete-account.ts`, `src/lib/validators/display-name.ts`. | Consolidate into `src/lib/utils/validation.ts` or update CLAUDE.md to acknowledge the `validators/` directory. |
| 49 | LOW | `src/components/ui/skeleton-card.tsx` | **UI component using kebab-case** while CLAUDE.md says components should use PascalCase. | Rename to `SkeletonCard.tsx`. |

---

## 4. Import Style Violations

| # | Severity | Files | Description | Fix |
|---|----------|-------|-------------|-----|
| 50 | MEDIUM | 40+ relative imports across the codebase | **Relative imports used instead of `@/` alias.** Found 47 instances of `from './'` relative imports, primarily within feature folders (e.g., `BudgetPageClient.tsx` imports 10 sibling components via `./`). While sibling imports within the same feature folder are common and arguably acceptable, CLAUDE.md explicitly states "Always use the `@/` path alias. Never use relative paths." | Convert all relative imports to `@/` paths, or update CLAUDE.md to allow sibling-relative imports within feature folders. The most impactful violations are in: `src/lib/db/index.ts` (`'./schema'`), `src/lib/gamification/xp-engine.ts` (`'./xp-config'`), `src/lib/api/cost-cache.ts` (`'./cost-engine'`). Lib-layer relative imports should absolutely use `@/`. |

---

## 5. Dead Code

| # | Severity | File | Line(s) | Description | Fix |
|---|----------|------|---------|-------------|-----|
| 51 | CRITICAL | `src/app/api/submissions/[id]/cost/route.ts` | 37-49, 73-88 | **15 lines of commented-out production code** with inline comments "In production, fetch submission from database" and "In production, cache the result". This suggests the route is incomplete and uses a query param workaround. Also defines a local `jsonResponse()` that duplicates the standard API helper. | Implement the production code path (fetch from DB, cache results) or remove the dead comments and document why the query-param approach is intentional. |
| 52 | MEDIUM | `src/app/submit/confirmation/[id]/page.tsx` | 20-23 | **Commented-out code:** `// const submission = await db.query.submissions.findFirst(...)` indicating incomplete implementation. | Implement the DB lookup or remove the comment. |
| 53 | MEDIUM | `src/hooks/useAuth.ts` | 13-15 | **Stub implementation.** `isAuthenticated` is hard-coded to `false`. The hook contains a TODO and commented-out code: `// const session = useSession() from next-auth/react`. The `useSession` export name also conflicts with next-auth's own `useSession`. | Implement using `useSession` from `next-auth/react`, rename the export to avoid conflict (e.g., `useAuthGate`). |

---

## 6. Complexity Issues

| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| 54 | HIGH | `src/lib/gamification/xp-engine.ts` (512 lines) | **God module.** Single file handling: idempotency checks, anti-gaming detection, session XP caps, streak updates, daily bonus, badge evaluation, level-up detection, and XP event recording. The `awardXp()` function alone spans ~200 lines with deeply nested conditionals (3-4 levels). | Split into: `xp-award.ts` (core award logic), `streak-manager.ts` (streak updates), `badge-evaluator.ts` (badge checks), `daily-bonus.ts` (bonus logic). Keep `xp-engine.ts` as a facade. |
| 55 | MEDIUM | `src/app/api/notes/[id]/vote/route.ts` | **Deeply nested conditionals** (4 levels) for vote toggle logic: `if existingVote -> if same direction -> if isUseful ... else ... else -> if isUseful ... else ...`. | Extract vote state machine logic into a dedicated helper with clear state transitions. |
| 56 | MEDIUM | `src/lib/api/public-submissions.ts` (450 lines) | Large file with multiple exported functions for the public API. | Could be split by concern: `public-list.ts`, `public-detail.ts`, `public-search.ts`, `public-export.ts`. |
| 57 | MEDIUM | `src/lib/db/schema.ts` (1014 lines) | Very large schema file. | Acceptable for Drizzle ORM projects where co-location of tables, relations, and enums is idiomatic. Could split into `schema/tables.ts`, `schema/relations.ts`, `schema/enums.ts` if desired. |

---

## 7. Error Handling Issues

| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| 58 | HIGH | Multiple API routes | **Swallowed errors in empty catch blocks.** 18 API routes use `} catch {` (no error variable) and return a generic `apiError('INTERNAL_ERROR', ...)` without logging the error. Examples: `submissions/[id]/comments/route.ts` lines 103, 201; `features/route.ts` lines 94, 132; `features/[id]/vote/route.ts` line 103. While 26 other routes correctly capture and log the error with `} catch (error) { console.error(...) }`, the inconsistency means some failures will be invisible in production. | Add `(error)` capture and `console.error()` to all catch blocks for observability. Standardize the pattern. |
| 59 | MEDIUM | `src/components/features/submissions/FlagButton.tsx` line 45 | **Silently swallowed fetch error:** `.catch(() => {})` with empty callback. If the flag status check fails, the user sees no feedback and the button state may be wrong. | At minimum log the error, or show a graceful degradation state. |
| 60 | MEDIUM | `src/components/features/leaderboard/LeaderboardPageClient.tsx` line 18 | **Error logged but not shown to user:** `.catch(console.error)`. If the leaderboard fails to load, the loading spinner disappears and an empty state is shown with no error indication. | Add error state handling with user-visible feedback. |
| 61 | MEDIUM | `src/app/api/comments/[id]/vote/route.ts` line 38 | **Missing import for `isNull`.** The route defines a local `isNull` function at line 171 instead of importing it from drizzle-orm. This is a code smell and indicates the function was patched in rather than using the ORM properly. | Import `isNull` from `drizzle-orm` instead of defining a custom SQL helper. |

---

## 8. Magic Numbers and Strings

| # | Severity | File | Line | Description | Fix |
|---|----------|------|------|-------------|-----|
| 62 | MEDIUM | `src/app/api/notes/[id]/vote/route.ts` | 11-12 | `PIN_SCORE_THRESHOLD = 10` and `PIN_USEFUL_PERCENT_THRESHOLD = 0.8` defined as module-level constants. While named, they should live in a shared constants file. | Move to `src/lib/constants/thresholds.ts`. |
| 63 | MEDIUM | `src/app/api/submissions/[id]/flag/route.ts` | 10 | `FLAG_THRESHOLD` uses `process.env` with a magic default `'3'`. | Move default to a named constant in `src/lib/constants/`. |
| 64 | MEDIUM | `src/components/features/leaderboard/LeaderboardPageClient.tsx` | 77-114 | **XP values hardcoded in JSX** (`+50`, `+20`, `+15`, `+10`, `+5`, `+2`). These should come from the XP config (`src/lib/gamification/xp-config.ts`). | Import XP values from `XP_TABLE` in `xp-config.ts` so the leaderboard explanation stays in sync with the actual XP system. |
| 65 | LOW | Multiple files | Various | `limit(3)`, `limit(1)`, `.slice(0, 3)`, `.slice(0, 20)` -- small inline limits that are project-reasonable. | Acceptable; only flag if they diverge from intended behavior. |

---

## 9. Anti-Patterns from CLAUDE.md

| # | Severity | Anti-Pattern | File(s) | Description | Fix |
|---|----------|-------------|---------|-------------|-----|
| 66 | HIGH | "Never use `useEffect` for data fetching" | `src/components/features/leaderboard/LeaderboardPageClient.tsx` line 12, `src/components/features/admin/AdminGamificationClient.tsx` line 42, `src/components/features/gamification/PrivacyControls.tsx` line 28, `src/components/features/submissions/ValidationQueue.tsx` line 25, `src/components/features/submissions/FlagButton.tsx` line 37 | **5 components fetch data in `useEffect`** with manual `fetch()` + `useState` instead of using React Query. This bypasses caching, deduplication, error/loading state management, and refetching. | Migrate to `useQuery` from `@tanstack/react-query` for all data fetching in client components. |
| 67 | HIGH | "Never use `any`" | `src/hooks/useXpResponse.ts` line 32 | `apiResponse: any` parameter with an eslint-disable comment. | Define a proper type for the API response shape, e.g., `interface XpApiResponse { data?: { xp?: XpResponseData } }`. |
| 68 | MEDIUM | "Never use `as` type assertions unless documented" | `src/lib/api/github-webhook.ts` lines 23, 28, 51, 52 | 4 undocumented `as` assertions casting `payload` fields. | Add JSDoc comments explaining why the assertions are safe (webhook payload structure guaranteed by GitHub). |
| 69 | MEDIUM | "Never use `as` type assertions unless documented" | `src/lib/twitter/client.ts` line 41, 45 | `as { detail?: string }` and `as { data: ... }` without documentation. | Add comments or use type guards. |
| 70 | MEDIUM | "Never use `index` as a key" | `src/components/features/submissions/ConsequenceCard.tsx` line 156, `src/components/features/consequences/ConsequenceCard.tsx` line 72, `src/components/features/stats/Top10BarChart.tsx` line 68, `src/components/features/stats/CategoryPieChart.tsx` line 58, `src/components/features/simulator/BudgetAllocationChart.tsx` line 40, `src/components/features/simulator/TaxBreakdownSection.tsx` line 46 | **6 components use `index` as React key** in lists that could potentially reorder. | Use unique identifiers from the data (e.g., `eq.label`, category id, etc.) as keys. |
| 71 | MEDIUM | "`window.location.href` instead of router/Link" | `src/hooks/useAuth.ts` line 22 | `window.location.href = '/login?callbackUrl=...'` causes a full page reload. | Use `useRouter().push()` or `signIn()` from next-auth/react for a client-side navigation. |
| 72 | LOW | "Always use `interface` for object shapes" | `src/lib/api/response.ts` lines 3, 10 | `type ApiMeta = { ... }` and `type ApiErrorBody = { ... }` use `type` for object shapes instead of `interface`. | Change to `interface ApiMeta { ... }` and `interface ApiErrorBody { ... }`. |

---

## 10. File Placement Violations

| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| 73 | MEDIUM | `src/lib/hooks/useIsMobile.ts` | **Hook in wrong directory.** CLAUDE.md specifies hooks go in `src/hooks/`. This is the sole file in `src/lib/hooks/`. | Move to `src/hooks/useIsMobile.ts` and update all 3 imports (`EUComparisonSection.tsx`, `SocialSpendingSection.tsx`, and any others using `@/lib/hooks/useIsMobile`). |
| 74 | LOW | `src/lib/validators/` (3 files) | **Validators directory not in CLAUDE.md conventions.** CLAUDE.md says "Shared validation -> `src/lib/utils/validation.ts`". The separate `src/lib/validators/` directory is undocumented. | Either consolidate into `validation.ts` or add `src/lib/validators/` to CLAUDE.md as a convention. |

---

## 11. Console Statements

| # | Severity | Count | Description | Fix |
|---|----------|-------|-------------|-----|
| 75 | MEDIUM | 44 total | **44 `console.error` and `console.warn` statements** across the codebase. While server-side error logging via `console.error` in catch blocks is acceptable for development, the codebase lacks a structured logging solution. Notable items: `src/lib/twitter/client.ts` line 18 has `console.log` (not error). | Replace `console.log` in twitter client with proper conditional logging. For production readiness, consider a structured logger (e.g., pino) that can be configured per environment. The current `console.error` usage in API routes is acceptable for the project's maturity. |
| 76 | LOW | 1 | `src/lib/twitter/client.ts:18` -- `console.log('[Twitter] Would post tweet:', text)` is a debug statement that logs mock behavior. | Guard with `process.env.NODE_ENV === 'development'` or remove. |

---

## 12. TODO / FIXME / HACK Comments

| # | Severity | File | Line | Comment | Fix |
|---|----------|------|------|---------|-----|
| 77 | HIGH | `src/hooks/useAuth.ts` | 13 | `// TODO: Replace with actual NextAuth session check` -- The entire hook is a stub with `isAuthenticated = false`. Any component using this hook's `isAuthenticated` will always redirect to login. | Implement using `useSession` from `next-auth/react`. This is blocking real auth-gated client interactions. |

---

## 13. Additional Observations

### 13.1 Inconsistent Error Message Language
Some API error messages are in French ("Authentification requise", "Donnees invalides") while others are in English ("Invalid cron secret", "Invalid source parameter"). The v1 public API routes use English. Internal API routes mix both.

**Recommendation**: Standardize on French for user-facing errors, English for internal/developer-facing errors (cron, webhooks, public API).

### 13.2 Non-Atomic Vote Count Updates
In `src/app/api/solutions/[id]/vote/route.ts`, `src/app/api/notes/[id]/vote/route.ts`, and `src/app/api/sources/[id]/validate/route.ts`, vote counts are updated with individual `SET upvoteCount = upvoteCount + 1` statements rather than recalculating from the votes table. Under concurrent access, this can lead to count drift. In contrast, `src/app/api/comments/[id]/vote/route.ts` correctly recalculates counts from the votes table.

**Recommendation**: Standardize on the recalculation pattern (as in comment votes) for correctness, or use database triggers.

### 13.3 `session.user.id!` Non-null Assertions
Found 16+ instances of `session.user.id!` (non-null assertion on user ID) across API routes. While this is technically safe because the auth check above ensures the user exists, it indicates the NextAuth type definitions could be improved.

**Recommendation**: Extend the NextAuth session type to make `id` non-optional when session is confirmed, or create a typed `requireAuth()` helper that returns `{ user: { id: string } }`.

---

## Priority Fix Recommendations

### Immediate (CRITICAL)
1. **Implement the production code path** in `src/app/api/submissions/[id]/cost/route.ts` or document why the workaround is intentional
2. **Eliminate XP response formatting duplication** -- use `formatXpResponse()` consistently across all vote routes
3. **Extract business logic from `comments/route.ts`** (204 lines, 2.5x limit) into `src/lib/api/comments.ts`

### Short-term (HIGH)
4. Extract the generic dual-track vote toggle pattern to reduce ~180 lines of duplication across 3 routes
5. Migrate 5 components from `useEffect` fetch to React Query hooks
6. Implement the `useAuth` hook properly with next-auth integration
7. Split the XP engine (512 lines) into focused modules
8. Split the 6 oversized components (>250 lines) into sub-components

### Medium-term (MEDIUM)
9. Standardize hook file naming to camelCase
10. Move `useIsMobile` from `src/lib/hooks/` to `src/hooks/`
11. Consolidate the two ConsequenceCard components
12. Add error capture to all 18 empty catch blocks
13. Create auth guard and rate limit middleware helpers
14. Replace `console.log` debug statements with environment-guarded logging
