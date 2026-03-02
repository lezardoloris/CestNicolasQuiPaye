# Audit 10 — Testing Coverage Analysis

**Date**: 2026-03-02
**Scope**: Unit tests (Vitest + Testing Library), E2E tests (Playwright), test infrastructure
**Severity Legend**: CRITICAL = business risk if untested, HIGH = significant gap, MEDIUM = recommended, LOW = nice to have

---

## 1. Executive Summary

The project has **near-zero test coverage**. Out of approximately **90+ source files** containing business logic, components, hooks, stores, API routes, and utilities, only **1 test file exists** (`src/lib/utils/tax-calculator.test.ts` with 27 test cases). There are no E2E tests, no component tests, no hook tests, no API route tests, and no Playwright configuration.

| Metric | Status |
|---|---|
| Test files in project | **1** |
| Total test cases | **27** |
| Utility files (src/lib/utils/) | 15 files, **1 tested** (6.7%) |
| Custom hooks (src/hooks/) | 13 files, **0 tested** (0%) |
| API routes (src/app/api/) | 50 route files, **0 tested** (0%) |
| Components (src/components/) | ~95 files, **0 tested** (0%) |
| Zustand stores | 3 files, **0 tested** (0%) |
| Gamification modules | 5 files, **0 tested** (0%) |
| Validators | 4 files, **0 tested** (0%) |
| E2E tests | **None** |
| Playwright config | **Missing** |
| Code coverage reporting | **Not configured** |

**Overall Test Coverage Estimate: ~2%**

---

## 2. Test Infrastructure Assessment

### 2.1 Vitest Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

**Assessment**: Adequate for basic unit tests. Missing:
- No `coverage` configuration (provider, thresholds, reporters)
- No `exclude` patterns (node_modules is covered by default, but `e2e/` should be excluded)
- No timeout configuration for slow tests
- No `clearMocks` / `restoreMocks` / `mockReset` defaults

### 2.2 Test Setup (`src/test-setup.ts`)

```typescript
import '@testing-library/jest-dom/vitest';
```

**Assessment**: Minimal. Missing:
- No global mocks for `next/navigation`, `next-auth`, `@tanstack/react-query`
- No `fetch` mock setup (MSW or global mock)
- No `IntersectionObserver` mock (needed for `useInfiniteScroll`)
- No `crypto.randomUUID` polyfill (used in stores and API responses)
- No `window.matchMedia` mock (needed for theme/responsive tests)
- No cleanup between tests (React Testing Library auto-cleanup)

### 2.3 Playwright Configuration

**Status: MISSING ENTIRELY**

The project declares `@playwright/test` as a devDependency and has a `test:e2e` npm script, but:
- No `playwright.config.ts` exists
- No `e2e/` or `tests/` directory exists
- No test fixtures, page objects, or E2E test files
- Playwright browsers are likely not installed

### 2.4 Package Dependencies

All testing dependencies are installed:
- `vitest@^4.0.18` -- runner
- `@testing-library/react@^16.3.2` -- component testing
- `@testing-library/jest-dom@^6.9.1` -- DOM matchers
- `jsdom@^28.1.0` -- DOM environment
- `@vitejs/plugin-react@^5.1.4` -- JSX transform
- `@playwright/test@^1.58.2` -- E2E (unused)

**Missing testing dependencies**:
- `msw` is in dependencies but not configured for tests
- No `@testing-library/user-event` for realistic interaction simulation
- No `vitest/coverage-v8` or `@vitest/coverage-istanbul` for coverage

---

## 3. Existing Test Analysis

### 3.1 The Only Test File: `src/lib/utils/tax-calculator.test.ts`

**Test count**: 27 tests across 6 describe blocks
**Quality**: GOOD

**Strengths**:
- Tests cover all exported functions: `calculateQFParts`, `calculateSocialContributions`, `calculateNetImposable`, `calculateIR`, `estimateTVA`, `calculateBudgetAllocation`, `runFullSimulation`
- Edge cases covered: zero input, SMIC boundary, high income
- Tests verify mathematical correctness with `toBeCloseTo` for floating point
- Integration test (`runFullSimulation`) validates the full pipeline
- Good use of range assertions (`toBeGreaterThan`/`toBeLessThan`) for non-deterministic calculations

**Weaknesses**:
- No negative number inputs tested (what happens with -50000 gross?)
- No extremely large inputs tested (overflow risk?)
- No test for `calculateQFParts` with negative children count
- The import `from '@/lib/constants/tax-2026'` is an external dependency -- not mocked, which is correct for integration tests but means tax bracket changes could break tests silently

---

## 4. Test Gap Analysis -- Prioritized by Business Criticality

### 4.1 CRITICAL Priority (Business-Breaking if Untested)

#### 4.1.1 `src/lib/utils/validation.ts` -- Zod Schemas

**Why critical**: All form inputs and API payloads pass through these schemas. Invalid validation = corrupted data or blocked users.

**Untested schemas** (16 schemas):
- `submissionFormSchema` -- title, description, cost, sourceUrl validation
- `voteSchema` -- vote type enum
- `feedQuerySchema` -- sort, cursor, limit, timeWindow
- `createCommentSchema` -- body trimming, parentCommentId
- `commentVoteSchema` -- direction enum
- `moderationActionSchema` -- action + reason refinement
- `flagSubmissionSchema` -- reason enum
- `broadcastSchema` -- tweetText length
- `featureProposalCreateSchema` -- title/description/category
- `addSourceSchema` -- URL format, title, sourceType
- `createCommunityNoteSchema` -- body length, optional sourceUrl
- `createSolutionSchema` -- body length
- `createAdjustmentSchema` -- body length
- `shareEventSchema` -- platform enum
- `pageViewSchema` -- pagePath
- `publicSubmissionsQuerySchema` -- complex filtering

**Untested helper functions**:
- `isValidSort()` -- sort validation
- `isValidUUID()` -- UUID format check

**Recommended test cases** (~80 tests):
```
submissionFormSchema:
  - valid complete submission -> passes
  - empty title -> fails with French error message
  - title > 200 chars -> fails
  - empty description -> fails
  - description > 2000 chars -> fails
  - cost = 0 -> fails (min 1)
  - cost = -1 -> fails
  - cost = 999999999999.99 -> passes (max)
  - cost = 1000000000000 -> fails
  - sourceUrl empty -> fails
  - sourceUrl without protocol -> fails
  - sourceUrl with ftp:// -> fails
  - sourceUrl with valid https:// -> passes
  - cost as string "42" -> coerces to number

moderationActionSchema:
  - approve without reason -> passes
  - reject without reason -> fails (refinement)
  - reject with empty reason -> fails
  - reject with reason -> passes
  - request_edit without reason -> fails
  - remove without reason -> fails

isValidUUID:
  - valid UUID -> true
  - uppercase UUID -> true (case insensitive)
  - invalid string -> false
  - empty string -> false
  - partial UUID -> false

isValidSort:
  - "hot" -> true
  - "new" -> true
  - "top" -> true
  - "invalid" -> false
  - "" -> false
```

#### 4.1.2 `src/lib/utils/cost-calculator.ts` -- Cost Engine (Pure Functions)

**Why critical**: Core business logic -- calculates what each citizen "pays" for public spending. Displayed on every submission card.

**Untested functions** (7):
- `costPerCitizen(amount, population)` -- division with zero-guard
- `costPerTaxpayer(amount, taxpayers)` -- division with zero-guard
- `costPerHousehold(amount, households)` -- division with zero-guard
- `daysOfWork(amount, taxpayers, medianDailyWage)` -- compound division
- `formatEUR(n, decimals)` -- French locale formatting
- `formatDays(n)` -- French pluralization
- `calculateCostToNicolas(amountEur, denominators)` -- full engine with denominator lookup, equivalences, edge cases

**Recommended test cases** (~45 tests):
```
costPerCitizen:
  - 68M EUR / 68M population = 1.0 EUR
  - 0 EUR -> 0
  - population = 0 -> 0 (guard)
  - population = -1 -> 0 (guard)
  - large amount (500 billion)

calculateCostToNicolas:
  - all denominators present -> full result
  - missing population denominator -> cost_per_citizen_unavailable = true
  - missing taxpayer denominator -> cost_per_taxpayer_unavailable and days_of_work_unavailable
  - zero-value denominator -> treated as missing
  - equivalences populated when cost_per_citizen available
  - denominators_used tracked correctly
  - 0 EUR amount -> all zeroes
```

#### 4.1.3 `src/lib/utils/hot-score.ts` -- Ranking Algorithm

**Why critical**: Determines what users see in the feed. Wrong scoring = wrong content visibility.

**Untested function**: `calculateHotScore(upvotes, downvotes, createdAt)`

**Recommended test cases** (~12 tests):
```
- zero votes -> score is based on time only
- positive net score -> score increases with votes
- negative net score -> score decreases
- more upvotes = higher score (same time)
- newer submissions score higher (same votes)
- net score of 0 -> only time component
- very old submission with high votes vs new with low votes
- sign function: positive, negative, zero
- log10(max(|score|, 1)) for score = 0 -> log10(1) = 0
- deterministic: same inputs -> same output
```

#### 4.1.4 `src/stores/vote-store.ts` -- Vote Cache

**Why critical**: Client-side vote state. If broken, users see wrong vote counts and wrong highlighted states.

**Recommended test cases** (~10 tests):
```
- initial state: empty maps
- setVote then getVote returns correct state
- setCounts then getCounts returns correct counts
- getVote for unknown ID returns null
- getCounts for unknown ID returns undefined
- multiple setVote calls update independently
- overwrite existing vote
- set vote to null (un-vote)
```

#### 4.1.5 `src/lib/validators/auth.ts` -- Auth Schemas

**Why critical**: Registration and login validation. Weak validation = security issues.

**Untested schemas**: `registerSchema`, `loginSchema`

**Recommended test cases** (~20 tests):
```
registerSchema:
  - valid data -> passes
  - invalid email -> fails
  - password < 8 chars -> fails
  - password > 128 chars -> fails
  - mismatched passwords -> fails with correct path
  - empty email -> fails with French message
  - empty confirmPassword -> fails

loginSchema:
  - valid credentials -> passes
  - empty email -> fails
  - invalid email format -> fails
  - empty password -> fails
```

### 4.2 HIGH Priority

#### 4.2.1 `src/lib/utils/sanitize.ts` -- XSS Prevention

**Why critical**: Security -- strips HTML tags from user input.

**Recommended test cases** (~10 tests):
```
- plain text -> unchanged
- "<script>alert('xss')</script>" -> "alert('xss')"
- nested tags -> all stripped
- "  multiple   spaces  " -> collapsed and trimmed
- empty string -> empty string
- HTML entities preserved
- Markdown-like content not affected
- self-closing tags <br/> stripped
```

#### 4.2.2 `src/lib/utils/tweet-detector.ts` -- Tweet URL Detection

**Recommended test cases** (~20 tests):
```
isTweetUrl:
  - https://twitter.com/user/status/123 -> true
  - https://x.com/user/status/123 -> true
  - https://www.twitter.com/user/status/123 -> true
  - http://twitter.com/user/status/123 -> true
  - https://twitter.com/user/status/123?s=20 -> true
  - https://twitter.com/user/status/123#fragment -> true
  - https://nottwitter.com/user/status/123 -> false
  - empty string -> false
  - null-ish -> false

extractTweetId:
  - valid URL -> returns numeric ID
  - invalid URL -> null

extractTweetUsername:
  - valid URL -> returns username

normalizeTweetUrl:
  - twitter.com URL -> canonical x.com format
  - already x.com -> canonical format
  - invalid -> null
```

#### 4.2.3 `src/lib/utils/format.ts` -- Display Formatting

**Recommended test cases** (~40 tests):
```
formatEUR:
  - 12500000 -> "12 500 000 EUR" (French locale)
  - 0 -> "0 EUR"
  - NaN input -> "0 EUR"
  - string input "42.5" -> coerced

formatRelativeTime:
  - 30 seconds ago -> "il y a quelques secondes"
  - 5 minutes ago -> "il y a 5min"
  - 3 hours ago -> "il y a 3h"
  - 2 days ago -> "il y a 2j"
  - 3 weeks ago -> "il y a 3sem"
  - 6 months ago -> "il y a 6mois"
  - 2 years ago -> "il y a 2a"
  - string date input -> parsed correctly

extractDomain:
  - "https://www.lemonde.fr/article" -> "lemonde.fr"
  - "https://lemonde.fr" -> "lemonde.fr"
  - invalid URL -> returns input

truncate:
  - short text -> unchanged
  - exactly maxLength -> unchanged
  - longer -> truncated with ellipsis

formatScore:
  - 999 -> "999"
  - 1500 -> "1,5k"
  - -1500 -> "-1,5k"

formatCompactEUR:
  - 1500000000 -> "1,5 Md EUR"
  - 45000000 -> "45 M EUR"
  - 1500 -> "1,5 k EUR"
  - 500 -> "500 EUR"
  - negative values -> sign preserved

pluralize:
  - 0 -> singular
  - 1 -> singular
  - 2 -> plural

formatPctFr:
  - 4.7 -> "4,7%"
  - 0 -> "0%"
```

#### 4.2.4 `src/lib/utils/karma.ts` -- Karma Calculation

**Recommended test cases** (~10 tests):
```
calculateKarma:
  - all zeros -> 0
  - 1 submission -> 10
  - mixed stats -> correct weighted sum
  - weights: submission=10, vote=1, source=5, note=3, share=2

getKarmaTier:
  - rank 1 -> "Tronconneuse d'Or"
  - rank 5 -> "Tronconneuse d'Argent"
  - rank 20 -> "Tronconneuse de Bronze"
  - rank 100 -> "Citoyen Actif"
  - rank 101 -> "Citoyen"
```

#### 4.2.5 `src/lib/utils/validation-weight.ts` -- Community Validation

**Recommended test cases** (~8 tests):
```
getValidationWeight:
  - level 1 -> weight 1
  - level 4 -> weight 2
  - level 7 -> weight 3
  - level 10 -> weight 4
  - level 15 -> weight 5
  - level 20 -> weight 5 (capped)
  - level 0 -> weight 1
```

#### 4.2.6 `src/lib/utils/ip-hash.ts` -- GDPR IP Hashing

**Recommended test cases** (~8 tests):
```
hashIp:
  - returns hex string
  - same IP + same salt -> deterministic
  - different IPs -> different hashes
  - never returns raw IP

getClientIp:
  - X-Forwarded-For header -> first IP
  - X-Forwarded-For with multiple IPs -> first only
  - X-Real-IP header -> that IP
  - no headers -> fallback to 127.0.0.1
```

#### 4.2.7 `src/lib/utils/share.ts` -- Social Sharing

**Recommended test cases** (~15 tests):
```
buildShareText:
  - short title -> included fully
  - long title > 80 chars -> truncated with "..."
  - includes cost formatted in French
  - includes hashtags

appendUtmParams:
  - adds utm_source, utm_medium, utm_campaign
  - default campaign = "submission"
  - existing params preserved

buildTwitterShareUrl:
  - includes text and url as params

buildFacebookShareUrl:
  - URL-encoded share URL

sanitizeReferrer:
  - valid URL -> hostname only
  - invalid URL -> empty string
```

#### 4.2.8 `src/lib/utils/csv.ts` -- CSV Export

**Recommended test cases** (~8 tests):
```
toCSV:
  - simple data -> correct CSV output
  - values with commas -> quoted
  - values with quotes -> double-quoted
  - values with newlines -> quoted
  - null/undefined values -> empty string
  - empty data array -> header only
```

#### 4.2.9 `src/lib/gamification/xp-config.ts` -- XP & Level System

**Why important**: Gamification is a core engagement feature.

**Recommended test cases** (~20 tests):
```
getLevelFromXp:
  - 0 XP -> level 1 "Citoyen"
  - 99 XP -> still level 1
  - 100 XP -> level 2 "Citoyen Vigilant"
  - 80000 XP -> level 20 "Legende Citoyenne"
  - negative XP -> level 1

getNextLevel:
  - level 1 -> level 2 info
  - level 19 -> level 20 info
  - level 20 -> null (max level)

getLevelProgress:
  - 0 XP -> 0% progress
  - 50 XP in level 1 (0-100) -> 50%
  - level 20 -> 100% progress, next = null
  - boundary XP (exactly at level threshold)
```

#### 4.2.10 `src/lib/utils/denominator-freshness.ts` -- Data Freshness

**Recommended test cases** (~10 tests):
```
getDenominatorFreshness:
  - recent date -> status "fresh"
  - >6 months old -> status "stale"
  - quarterly frequency -> next update in 3 months
  - yearly frequency -> next update in 12 months
  - unknown frequency -> defaults to 3 months
  - correct French date format (DD/MM/YYYY)
```

#### 4.2.11 `src/lib/utils/github-webhook.ts` -- Webhook Security

**Recommended test cases** (~10 tests):
```
verifyGitHubWebhookSignature:
  - valid signature -> true
  - invalid signature -> false
  - null signature -> false
  - wrong secret -> false
  - timing-safe comparison (no early exit)

githubEntityToUuid:
  - deterministic: same input -> same UUID
  - different inputs -> different UUIDs
  - output matches UUID format
```

### 4.3 MEDIUM Priority

#### 4.3.1 Zustand Stores

**`src/stores/gamification-store.ts`** -- XP toasts, level tracking
```
setStats: merges partial state, sets loaded=true
addXpToast: adds to queue with unique ID
removeXpToast: removes by ID
incrementTodayXp: increments both todayXp and totalXp
```

**`src/stores/feed-preview-store.ts`** -- Feed preview selection
```
setSelectedSubmission: stores submission
clearSelectedSubmission: resets to null
initial state: null
```

#### 4.3.2 `src/lib/api/response.ts` -- API Response Helpers

```
apiSuccess:
  - wraps data with { data, error: null, meta }
  - includes requestId in meta
  - default status 200, configurable

apiError:
  - wraps error with { data: null, error: { code, message, details }, meta }
  - includes requestId in meta
  - details default to {}
```

#### 4.3.3 `src/lib/api/errors.ts` -- ApiError Class

```
ApiError.validation -> status 400, code VALIDATION_ERROR
ApiError.unauthorized -> status 401
ApiError.forbidden -> status 403
ApiError.notFound -> status 404
ApiError.conflict -> status 409
ApiError.rateLimited -> status 429, includes retryAfter
ApiError.internal -> status 500
```

#### 4.3.4 `src/lib/utils/user-display.ts` -- User Display Names

```
resolveDisplayName:
  - displayName present -> returns it
  - displayName null -> returns anonymousId
  - displayName undefined -> returns anonymousId

maskEmail:
  - "nicolas@example.com" -> "n***@example.com"
  - "a@b.com" -> "a***@b.com"
  - invalid email without @ -> "***@***"
```

### 4.4 LOW Priority (Nice to Have)

#### 4.4.1 Component Tests

While component tests are valuable, they depend on properly configured mocking infrastructure. The following are prioritized by user interaction frequency:

| Component | File | Why |
|---|---|---|
| `SubmissionCard` | `src/components/features/feed/SubmissionCard.tsx` | Most-viewed component in the app |
| `VoteButton` | `src/components/features/voting/VoteButton.tsx` | Core interaction |
| `SubmissionForm` | `src/components/features/submissions/SubmissionForm.tsx` | User input validation |
| `LoginForm` | `src/components/features/auth/LoginForm.tsx` | Auth flow entry |
| `RegisterForm` | `src/components/features/auth/RegisterForm.tsx` | Onboarding flow |
| `CommentForm` | `src/components/features/comments/CommentForm.tsx` | User-generated content |
| `CommentThread` | `src/components/features/comments/CommentThread.tsx` | Nested UI rendering |
| `ShareButton` | `src/components/features/sharing/ShareButton.tsx` | Growth mechanism |
| `FlagButton` | `src/components/features/submissions/FlagButton.tsx` | Moderation entry |
| `LeaderboardTable` | `src/components/features/leaderboard/LeaderboardTable.tsx` | Gamification display |

#### 4.4.2 Hook Tests (renderHook)

These require careful mocking of React Query, fetch, and stores:

| Hook | File | Dependencies |
|---|---|---|
| `useVote` | `src/hooks/useVote.ts` | vote-store, React Query, fetch |
| `useComments` | `src/hooks/use-comments.ts` | React Query, fetch, XP response |
| `useCommentVote` | `src/hooks/use-comment-vote.ts` | React Query, fetch, auth |
| `useInfiniteScroll` | `src/hooks/useInfiniteScroll.ts` | React Query, IntersectionObserver |
| `useSources` | `src/hooks/useSources.ts` | React Query, fetch |
| `useCommunityNotes` | `src/hooks/useCommunityNotes.ts` | React Query, fetch |
| `useXpResponse` | `src/hooks/useXpResponse.ts` | gamification-store |

---

## 5. API Route Test Gap Analysis

All 50 API routes lack integration tests. The following are the highest-priority routes ranked by traffic and business impact:

### 5.1 CRITICAL API Routes (Must Test)

| Route | Method | File | Business Impact |
|---|---|---|---|
| `/api/submissions/[id]/vote` | POST, DELETE | `src/app/api/submissions/[id]/vote/route.ts` | Core voting -- auth + anonymous, optimistic updates, XP award |
| `/api/submissions` | POST | `src/app/api/submissions/route.ts` | Submission creation -- validation, content filter, slug gen, auto-moderation |
| `/api/auth/register` | POST | `src/app/api/auth/register/route.ts` | User registration -- email uniqueness, password hashing |
| `/api/feed` | GET | `src/app/api/feed/route.ts` | Main feed -- sort, cursor pagination, time window |
| `/api/submissions/[id]` | GET, PATCH, DELETE | `src/app/api/submissions/[id]/route.ts` | Submission CRUD |
| `/api/submissions/[id]/comments` | GET, POST | `src/app/api/submissions/[id]/comments/route.ts` | Comment system |
| `/api/votes/batch` | GET | `src/app/api/votes/batch/route.ts` | Batch vote hydration |

### 5.2 HIGH API Routes

| Route | Method | File |
|---|---|---|
| `/api/admin/submissions/[id]/moderate` | POST | Moderation actions |
| `/api/admin/dashboard` | GET | Admin stats |
| `/api/submissions/[id]/sources` | GET, POST | Source management |
| `/api/submissions/[id]/notes` | GET, POST | Community notes |
| `/api/submissions/[id]/solutions` | GET, POST | Solutions |
| `/api/comments/[id]/vote` | POST | Comment voting |
| `/api/notes/[id]/vote` | POST | Note voting |
| `/api/gamification/stats` | GET | XP/level/streak data |
| `/api/leaderboard` | GET | Leaderboard rankings |
| `/api/v1/submissions` | GET | Public API |
| `/api/v1/search` | GET | Public search |
| `/api/v1/stats` | GET | Public stats |

**Testing approach for API routes**: These require mocking `db`, `auth()`, and `checkRateLimit()`. Use Vitest's module mocking or MSW for HTTP-level mocking.

---

## 6. E2E Test Gap Analysis

### 6.1 Missing E2E Infrastructure

- No `playwright.config.ts`
- No page object models
- No test fixtures
- No CI/CD integration for E2E
- No database seeding for E2E

### 6.2 Critical E2E Flows (Must Have)

| Flow | Steps | Business Impact |
|---|---|---|
| **Feed Browse** | Visit `/feed/hot` -> see submissions -> sort change -> infinite scroll | Core user experience |
| **Submission View** | Click submission -> see detail with cost, sources, comments | Content consumption |
| **Anonymous Vote** | Visit feed -> upvote/downvote -> count updates | Core engagement |
| **Auth Registration** | `/register` -> fill form -> submit -> redirected | User acquisition |
| **Auth Login** | `/login` -> fill form -> submit -> session created | Auth flow |
| **Submit Proposal** | `/submit` -> fill form -> submit -> confirmation page | Content creation |
| **Comment** | View submission -> post comment -> see it appear | Engagement |
| **Share** | View submission -> click share -> correct URL generated | Growth |

### 6.3 Important E2E Flows

| Flow | Steps |
|---|---|
| **Admin Moderation** | Login as admin -> `/admin` -> approve/reject submission |
| **Community Note** | View submission -> add note -> see note appear |
| **Source Addition** | View submission -> add source -> source listed |
| **Profile View** | `/profile` -> see stats, submissions, votes |
| **Leaderboard** | `/leaderboard` -> see ranked users |
| **Simulateur** | `/simulateur` -> input salary -> see tax breakdown |
| **Feature Voting** | `/features` -> upvote feature proposal |
| **Content Flagging** | View submission -> flag as inappropriate |

---

## 7. Middleware Test Gap

`src/middleware.ts` implements route protection:
- Admin routes require `role === 'admin'`
- `/profile` requires authentication
- `/profile/settings/*` requires authentication

**Recommended tests** (~8 tests):
```
- Unauthenticated user accessing /admin -> redirect to /feed/hot
- Non-admin user accessing /admin -> redirect to /feed/hot
- Admin user accessing /admin -> allowed (NextResponse.next)
- Unauthenticated user accessing /profile -> redirect to /login
- Authenticated user accessing /profile -> allowed
- Unauthenticated user accessing /profile/settings -> redirect to /login
- Unmatched routes -> no middleware applied
```

---

## 8. Test Pattern Recommendations

### 8.1 Mocking Strategy

The project should establish these mock patterns in `src/test-setup.ts`:

```typescript
// Navigation mock
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Auth mock
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

// Database mock
vi.mock('@/lib/db', () => ({
  db: { query: {}, select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), transaction: vi.fn() },
}));

// IntersectionObserver mock
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// crypto.randomUUID
vi.stubGlobal('crypto', { ...crypto, randomUUID: () => '00000000-0000-0000-0000-000000000000' });
```

### 8.2 Test File Organization

```
src/
├── lib/
│   ├── utils/
│   │   ├── format.ts
│   │   ├── format.test.ts          <-- co-located
│   │   ├── validation.ts
│   │   ├── validation.test.ts      <-- co-located
│   │   └── ...
│   ├── gamification/
│   │   ├── xp-config.ts
│   │   ├── xp-config.test.ts       <-- co-located
│   │   └── ...
│   └── api/
│       ├── response.ts
│       ├── response.test.ts         <-- co-located
│       └── ...
├── stores/
│   ├── vote-store.ts
│   ├── vote-store.test.ts           <-- co-located
│   └── ...
├── hooks/
│   ├── useVote.ts
│   ├── useVote.test.tsx             <-- co-located
│   └── ...
└── components/
    └── features/
        └── voting/
            ├── VoteButton.tsx
            ├── VoteButton.test.tsx   <-- co-located
            └── ...
```

### 8.3 Testing Priorities (Implementation Order)

**Phase 1 -- Pure Utility Functions (1-2 days, ~200 tests)**
No mocking needed, highest ROI:
1. `validation.ts` -- all Zod schemas
2. `cost-calculator.ts` -- full engine
3. `hot-score.ts` -- ranking algorithm
4. `format.ts` -- display formatting
5. `sanitize.ts` -- XSS prevention
6. `tweet-detector.ts` -- URL detection
7. `karma.ts` -- karma calculation
8. `validation-weight.ts` -- validation weights
9. `csv.ts` -- CSV export
10. `ip-hash.ts` -- IP hashing
11. `share.ts` -- sharing utilities
12. `user-display.ts` -- display names
13. `denominator-freshness.ts` -- data freshness
14. `github-webhook.ts` -- webhook verification
15. `auth.ts` (validators) -- auth schemas

**Phase 2 -- Gamification & Config (1 day, ~40 tests)**
Pure functions, no DB dependency:
1. `xp-config.ts` -- levels, badges, progress
2. `tax-2026.ts` -- QF parts (already partially tested)

**Phase 3 -- Stores (0.5 day, ~25 tests)**
Minimal mocking (Zustand):
1. `vote-store.ts`
2. `gamification-store.ts`
3. `feed-preview-store.ts`

**Phase 4 -- API Helpers & Response (0.5 day, ~20 tests)**
1. `response.ts` -- apiSuccess/apiError
2. `errors.ts` -- ApiError class
3. `submissions.ts` -- encodeCursor/decodeCursor

**Phase 5 -- Component Tests (2-3 days, ~50 tests)**
Requires mock infrastructure:
1. VoteButton
2. SubmissionCard
3. SubmissionForm
4. LoginForm / RegisterForm
5. CommentForm

**Phase 6 -- Hook Tests (2 days, ~40 tests)**
Requires React Query + fetch mocking:
1. useVote
2. useComments
3. useCommentVote
4. useInfiniteScroll

**Phase 7 -- E2E Setup & Critical Flows (3-4 days, ~20 tests)**
Requires Playwright config + test DB:
1. Playwright configuration
2. Feed browsing flow
3. Voting flow
4. Registration/login flow
5. Submission creation flow

---

## 9. Coverage Configuration Recommendation

Add to `vitest.config.ts`:

```typescript
test: {
  // ... existing config
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    include: ['src/lib/**/*.ts', 'src/hooks/**/*.ts', 'src/stores/**/*.ts'],
    exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test-setup.ts'],
    thresholds: {
      // Phase 1 targets:
      lines: 30,
      functions: 30,
      branches: 25,
      statements: 30,
      // Phase 2 targets (after pure utility coverage):
      // lines: 60, functions: 60, branches: 50, statements: 60
    },
  },
},
```

---

## 10. Risk Assessment

### 10.1 What Could Break Without Tests

| Scenario | Probability | Impact | Untested Code |
|---|---|---|---|
| Zod schema change breaks form validation silently | HIGH | HIGH | `validation.ts` |
| Cost calculation rounding error shows wrong EUR amount | MEDIUM | CRITICAL | `cost-calculator.ts` |
| Hot score algorithm change alters feed ranking | MEDIUM | HIGH | `hot-score.ts` |
| XSS injection through unescaped user input | LOW | CRITICAL | `sanitize.ts` |
| Vote toggling bug causes count drift | MEDIUM | HIGH | `vote-store.ts`, `votes.ts` |
| Rate limiter misconfiguration blocks legitimate users | LOW | HIGH | `rate-limit.ts` |
| UUID validation bypass allows SQL injection | LOW | CRITICAL | `validation.ts` |
| Karma calculation weights changed unintentionally | LOW | MEDIUM | `karma.ts` |
| Tweet URL regex false positives/negatives | MEDIUM | LOW | `tweet-detector.ts` |
| Level progression broken by XP threshold change | LOW | MEDIUM | `xp-config.ts` |
| CSV export produces malformed output | LOW | MEDIUM | `csv.ts` |
| Admin route accessible by non-admin | LOW | CRITICAL | `middleware.ts` |
| Registration allows duplicate emails | LOW | HIGH | `register/route.ts` |
| Webhook signature bypass | LOW | CRITICAL | `github-webhook.ts` |

### 10.2 Current Risk Level

**HIGH RISK** -- The application handles:
- Financial data (public spending amounts)
- User authentication (passwords, sessions)
- User-generated content (XSS vectors)
- Admin privileges (moderation, broadcast)
- GDPR-relevant data (IP hashing)

All of these critical paths have **zero automated test coverage**.

---

## 11. Summary of Findings

### Files That MUST Have Tests (Ranked)

| Priority | File | Estimated Tests | Effort |
|---|---|---|---|
| CRITICAL | `src/lib/utils/validation.ts` | 80 | 1 day |
| CRITICAL | `src/lib/utils/cost-calculator.ts` | 45 | 0.5 day |
| CRITICAL | `src/lib/utils/hot-score.ts` | 12 | 1 hour |
| CRITICAL | `src/stores/vote-store.ts` | 10 | 1 hour |
| CRITICAL | `src/lib/validators/auth.ts` | 20 | 2 hours |
| HIGH | `src/lib/utils/sanitize.ts` | 10 | 1 hour |
| HIGH | `src/lib/utils/tweet-detector.ts` | 20 | 2 hours |
| HIGH | `src/lib/utils/format.ts` | 40 | 3 hours |
| HIGH | `src/lib/utils/karma.ts` | 10 | 1 hour |
| HIGH | `src/lib/utils/validation-weight.ts` | 8 | 30 min |
| HIGH | `src/lib/utils/ip-hash.ts` | 8 | 1 hour |
| HIGH | `src/lib/utils/share.ts` | 15 | 1.5 hours |
| HIGH | `src/lib/utils/csv.ts` | 8 | 1 hour |
| HIGH | `src/lib/gamification/xp-config.ts` | 20 | 2 hours |
| HIGH | `src/lib/utils/github-webhook.ts` | 10 | 1 hour |
| HIGH | `src/lib/utils/denominator-freshness.ts` | 10 | 1 hour |
| HIGH | `src/lib/utils/user-display.ts` | 6 | 30 min |
| MEDIUM | `src/lib/api/response.ts` | 8 | 1 hour |
| MEDIUM | `src/lib/api/errors.ts` | 10 | 1 hour |
| MEDIUM | `src/stores/gamification-store.ts` | 10 | 1 hour |
| MEDIUM | `src/stores/feed-preview-store.ts` | 5 | 30 min |

**Total estimated: ~355 unit tests, ~8-10 days of focused work**

### Quick Wins (Can Be Done Today)

1. Add tests for `hot-score.ts` (12 tests, 1 hour) -- pure function, no dependencies
2. Add tests for `sanitize.ts` (10 tests, 1 hour) -- security-critical, pure function
3. Add tests for `karma.ts` (10 tests, 1 hour) -- pure function
4. Add tests for `validation-weight.ts` (8 tests, 30 min) -- pure function
5. Add tests for `user-display.ts` (6 tests, 30 min) -- pure function
6. Add tests for `vote-store.ts` (10 tests, 1 hour) -- Zustand, minimal setup

These 6 files would add ~56 tests in approximately 5 hours, doubling the test count from 27 to 83.
