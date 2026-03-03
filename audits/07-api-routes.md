# Audit 07 -- API Routes Quality

**Date**: 2026-03-02
**Scope**: All 51 route handlers under `src/app/api/`
**Auditor**: Claude Opus 4.6

---

## Executive Summary

The API layer is reasonably well-structured: most routes use Zod validation, the `apiSuccess`/`apiError` envelope from `src/lib/api/response.ts`, and Upstash-based rate limiting. However, the audit identified **42 findings** across 12 categories, including 4 critical, 11 high-severity, 16 medium, and 11 low-severity issues.

**Key risk areas**:
1. Unprotected `request.json()` calls that crash on malformed bodies (CRITICAL)
2. Inline manual validation bypassing Zod schemas (HIGH)
3. Non-atomic vote counter updates causing race conditions (HIGH)
4. Several routes exceeding the 80-line limit with embedded business logic (HIGH)
5. Missing rate limiting on user-mutating routes (MEDIUM)
6. Inconsistent response format in the `v1/denominators` and `submissions/[id]/cost` routes (MEDIUM)

| Severity | Count |
|----------|-------|
| CRITICAL | 4     |
| HIGH     | 11    |
| MEDIUM   | 16    |
| LOW      | 11    |

---

## 1. Input Validation

### CRITICAL-01: Unprotected `request.json()` crashes on malformed request body

**Severity**: CRITICAL
**Affected files** (17 routes):

| File | Line |
|------|------|
| `src/app/api/submissions/route.ts` | 22 |
| `src/app/api/submissions/[id]/vote/route.ts` | 32 |
| `src/app/api/submissions/[id]/notes/route.ts` | 63 |
| `src/app/api/submissions/[id]/solutions/route.ts` | 55 |
| `src/app/api/submissions/[id]/share/route.ts` | 24 |
| `src/app/api/submissions/[id]/sources/route.ts` | 55 |
| `src/app/api/submissions/[id]/validate/route.ts` | 32 |
| `src/app/api/notes/[id]/vote/route.ts` | 37 |
| `src/app/api/solutions/[id]/vote/route.ts` | 29 |
| `src/app/api/solutions/[id]/adjustments/route.ts` | 60 |
| `src/app/api/sources/[id]/validate/route.ts` | 33 |
| `src/app/api/admin/gamification/route.ts` | 74 |
| `src/app/api/gamification/daily-goal/route.ts` | 16 |
| `src/app/api/gamification/privacy/route.ts` | 40 |
| `src/app/api/comments/[id]/vote/route.ts` | 27 |
| `src/app/api/features/[id]/vote/route.ts` | 27 |
| `src/app/api/features/[id]/route.ts` | 21 |

**Description**: `await request.json()` throws a runtime exception when the request body is not valid JSON (e.g., empty body, plain text, or truncated payload). Many routes call this **outside** of a try/catch, or call it inside try/catch but the call itself is at the top of the handler before the try block.

Only one route (`src/app/api/submissions/[id]/route.ts`, line 58-61) explicitly wraps `request.json()` in its own try/catch. The rest rely on an outer try/catch that may or may not exist.

Routes where `request.json()` is **outside any try/catch**:
- `src/app/api/submissions/[id]/vote/route.ts` (line 32, outside the try at line 40)
- `src/app/api/notes/[id]/vote/route.ts` (line 37, outside the try at line 46)
- `src/app/api/solutions/[id]/vote/route.ts` (line 29, outside the try at line 37)
- `src/app/api/admin/gamification/route.ts` POST (line 74, outside any try)
- `src/app/api/submissions/[id]/validate/route.ts` (line 32, outside the try at line 40)

**Fix**: Wrap every `request.json()` call in a try/catch or move it inside the existing try block. Standardize with a helper:

```typescript
async function parseJsonBody(request: NextRequest): Promise<[unknown, null] | [null, Response]> {
  try {
    const body = await request.json();
    return [body, null];
  } catch {
    return [null, apiError('BAD_REQUEST', 'Corps de requete invalide', 400)];
  }
}
```

---

### HIGH-01: Manual validation instead of Zod schema in `gamification/daily-goal`

**Severity**: HIGH
**File**: `src/app/api/gamification/daily-goal/route.ts`, line 19
**Description**: Uses `if (![20, 50, 100].includes(goal))` instead of a Zod schema. The `body.dailyGoal` value is not type-checked -- if a string `"20"` is sent, `[20, 50, 100].includes("20")` returns `false` (type mismatch). Also, the "repos mode" value of `0` is not listed as a valid option, but the cron route (`streak-check`) explicitly handles users with `dailyGoal=0`.

**Fix**: Create a Zod schema:
```typescript
const dailyGoalSchema = z.object({
  dailyGoal: z.union([z.literal(0), z.literal(20), z.literal(50), z.literal(100)]),
});
```

---

### HIGH-02: Manual validation instead of Zod schema in `gamification/privacy` PUT

**Severity**: HIGH
**File**: `src/app/api/gamification/privacy/route.ts`, lines 41-54
**Description**: Uses a manual allowlist loop (`for (const key of allowedKeys) { if (typeof body[key] === 'boolean') }`) instead of Zod. This accepts partial updates silently and provides no validation error details.

**Fix**: Define a Zod schema:
```typescript
const privacyUpdateSchema = z.object({
  showXpPublicly: z.boolean().optional(),
  showLevelPublicly: z.boolean().optional(),
  showStreakPublicly: z.boolean().optional(),
  showBadgesPublicly: z.boolean().optional(),
  leagueOptOut: z.boolean().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'Au moins un parametre requis' });
```

---

### HIGH-03: Manual validation for `verdict` in `submissions/[id]/validate`

**Severity**: HIGH
**File**: `src/app/api/submissions/[id]/validate/route.ts`, lines 33-38
**Description**: `const verdict = body.verdict` and `const reason = body.reason || null` are extracted from the raw body with manual validation (`if (verdict !== 'approve' && verdict !== 'reject')`). No Zod schema, no type-narrowing for `reason`.

**Fix**: Create a Zod schema:
```typescript
const communityValidationSchema = z.object({
  verdict: z.enum(['approve', 'reject']),
  reason: z.string().max(500).nullable().optional(),
});
```

---

### MEDIUM-01: Missing `submissionId` UUID validation in several routes

**Severity**: MEDIUM
**Affected files**:
- `src/app/api/submissions/[id]/flag/route.ts` -- no UUID validation on `id` param
- `src/app/api/submissions/[id]/comments/route.ts` -- no UUID validation on `id` param (GET and POST)
- `src/app/api/submissions/[id]/share/route.ts` -- no UUID validation on `id` param
- `src/app/api/submissions/[id]/route.ts` -- no UUID validation on `id` param (PATCH)
- `src/app/api/features/[id]/route.ts` -- no UUID validation on `id` param
- `src/app/api/features/[id]/vote/route.ts` -- no UUID validation on `id` param
- `src/app/api/comments/[id]/vote/route.ts` -- no UUID validation on `commentId` param
- `src/app/api/admin/submissions/[id]/moderate/route.ts` -- no UUID validation on `id` param

**Description**: While other routes correctly use `isValidUUID()`, these routes pass the raw `id` param directly to DB queries. Although Drizzle ORM parameterizes queries (preventing SQL injection), invalid UUIDs still cause unnecessary DB round-trips and potentially obscure Postgres errors.

**Fix**: Add `isValidUUID(id)` checks consistently across all routes accepting ID params.

---

### LOW-01: No `limit` validation on query params in `v1/users/[userId]/submissions`

**Severity**: LOW
**File**: `src/app/api/v1/users/[userId]/submissions/route.ts`, line 14
**Description**: `parseInt(searchParams.get('limit') ?? '20', 10)` is capped at 50 via `Math.min()`, but there is no minimum check. `parseInt('abc')` returns `NaN`, and `Math.min(NaN, 50)` returns `NaN`. Same issue in `v1/users/[userId]/votes/route.ts`.

**Fix**: Use Zod coerce for these query params or add `|| 20` fallback.

---

## 2. Authentication

### MEDIUM-02: Inconsistent admin auth check -- `UNAUTHORIZED` vs `FORBIDDEN`

**Severity**: MEDIUM
**Files**:
- `src/app/api/admin/dashboard/route.ts` (line 16): returns `FORBIDDEN` 403 when not admin
- `src/app/api/admin/gamification/route.ts` (line 18, 70): returns `UNAUTHORIZED` 403 when not admin
- `src/app/api/admin/flags/route.ts` (line 12): returns `FORBIDDEN` 403 when not admin/mod
- `src/app/api/admin/submissions/route.ts` (lines 19-25): correctly returns `UNAUTHORIZED` 401 first, then `FORBIDDEN` 403

**Description**: Some admin routes skip the 401 check entirely and return 403 directly (leaking the existence of the endpoint). Best practice is to always return 401 for unauthenticated, then 403 for unauthorized role. The `admin/gamification` route uses status code 403 with error code `UNAUTHORIZED` (semantic mismatch).

**Fix**: Standardize all admin routes:
```typescript
if (!session?.user) return apiError('UNAUTHORIZED', 'Authentification requise', 401);
if (session.user.role !== 'admin') return apiError('FORBIDDEN', 'Acces reserve', 403);
```

---

### MEDIUM-03: Solutions POST allows anonymous submissions without auth

**Severity**: MEDIUM
**File**: `src/app/api/submissions/[id]/solutions/route.ts`, lines 41, 61-62
**Description**: The solutions POST endpoint does not require authentication. An anonymous user can submit solutions (tracked as `authorId: null`). While the JSDoc says "Open to everyone," this opens the door to spam even with rate limiting by IP. Similarly, the adjustments POST route (`solutions/[id]/adjustments`) allows anonymous submissions.

**Fix**: Consider requiring authentication for solution/adjustment creation, or at minimum add content filtering similar to the submissions POST route.

---

### LOW-02: Cron routes rely solely on bearer token

**Severity**: LOW
**Files**:
- `src/app/api/cron/streak-check/route.ts`
- `src/app/api/cron/open-data-import/route.ts`

**Description**: Cron routes use `CRON_SECRET` bearer token for auth. This is acceptable for cron jobs but provides no IP allowlisting or request origin verification. If the secret is leaked, anyone can trigger these endpoints.

**Fix**: Consider adding IP allowlisting for Railway's egress IPs, or use a more robust secret rotation mechanism.

---

## 3. Authorization

### HIGH-04: No ownership check for comment voting on own comment

**Severity**: HIGH
**File**: `src/app/api/comments/[id]/vote/route.ts`
**Description**: Users can upvote their own comments. The route checks `comment.authorId !== userId` only for XP award purposes (line 120), but still allows the self-vote to be recorded and counted. Contrast with `submissions/[id]/validate` which blocks self-validation (line 72).

**Fix**: Add `if (comment.authorId === userId) return apiError('FORBIDDEN', 'Vous ne pouvez pas voter sur votre propre commentaire', 403);`

---

### MEDIUM-04: No self-vote prevention on solutions

**Severity**: MEDIUM
**File**: `src/app/api/solutions/[id]/vote/route.ts`
**Description**: Similar to comments, users can upvote their own solutions. Only XP award has a self-vote guard (line 101), but the vote itself is recorded.

**Fix**: Add self-vote prevention check.

---

### MEDIUM-05: Admin broadcast route checks only `admin` role, not `moderator`

**Severity**: MEDIUM
**File**: `src/app/api/admin/broadcast/route.ts`, lines 12, 42
**Description**: The broadcast route restricts to `admin` only. This is likely intentional (broadcasting is a high-impact action), but the dashboard route also restricts to `admin` only while `flags` and `submissions` allow `moderator`. The inconsistency should be documented or enforced via a shared guard.

**Fix**: Document the intent explicitly or create a shared `requireRole()` helper.

---

## 4. Error Handling

### MEDIUM-06: `request.json()` errors not caught in vote routes

**Severity**: MEDIUM (overlaps with CRITICAL-01)
**Files**:
- `src/app/api/submissions/[id]/vote/route.ts` (line 32)
- `src/app/api/notes/[id]/vote/route.ts` (line 37)
- `src/app/api/solutions/[id]/vote/route.ts` (line 29)

**Description**: The `request.json()` call is placed **before** the try/catch block. If the body is malformed, the handler throws an unhandled exception that surfaces as a 500 with Next.js's default error page (not the `apiError` envelope).

**Fix**: Move `request.json()` inside the try block.

---

### LOW-03: Swallowed error details in catch blocks

**Severity**: LOW
**Files**: Multiple routes use `catch { return apiError(...); }` without logging the error.
- `src/app/api/features/route.ts` (line 94, 132)
- `src/app/api/features/[id]/route.ts` (line 50)
- `src/app/api/features/[id]/vote/route.ts` (line 103)
- `src/app/api/admin/submissions/route.ts` (line 51)
- `src/app/api/submissions/[id]/flag/route.ts` (line 90)
- `src/app/api/submissions/[id]/comments/route.ts` (lines 103, 201)

**Description**: Catching errors without logging makes debugging production issues very difficult.

**Fix**: Add `console.error()` in all catch blocks, or use a centralized error reporting utility.

---

## 5. Rate Limiting

### MEDIUM-07: Missing rate limiting on user-mutating endpoints

**Severity**: MEDIUM
**Files**:
- `src/app/api/user/display-name/route.ts` -- NO rate limiting
- `src/app/api/user/delete/route.ts` -- NO rate limiting
- `src/app/api/gamification/daily-goal/route.ts` -- NO rate limiting
- `src/app/api/gamification/privacy/route.ts` -- NO rate limiting
- `src/app/api/submissions/[id]/route.ts` (PATCH) -- NO rate limiting

**Description**: These endpoints modify user data but have no rate limiting. An attacker could repeatedly change display names, toggle privacy settings, or call DELETE account endpoints in rapid succession.

**Fix**: Add `checkRateLimit('api', session.user.id)` to all authenticated mutation endpoints.

---

### MEDIUM-08: Missing rate limiting on `votes/batch` GET

**Severity**: MEDIUM
**File**: `src/app/api/votes/batch/route.ts`
**Description**: This endpoint accepts up to 50 UUIDs and performs DB queries. No rate limiting means an attacker can hammer it to enumerate vote data.

**Fix**: Add `checkRateLimit('api', ip)`.

---

### LOW-04: Rate limiting disabled in development

**Severity**: LOW
**File**: `src/lib/api/rate-limit.ts`, lines 6-11
**Description**: When Upstash env vars are not set, rate limiting silently returns `null` (allowed). This is expected for dev but could be dangerous if env vars are accidentally unset in production.

**Fix**: Log a warning at startup if rate limiting is disabled.

---

## 6. HTTP Methods

### MEDIUM-09: Account deletion uses POST instead of DELETE

**Severity**: MEDIUM
**File**: `src/app/api/user/delete/route.ts` (line 9)
**Description**: The route exports `POST` for account deletion. RESTful convention would use `DELETE /api/user` or `DELETE /api/user/account`. Using POST makes the API semantically confusing.

**Fix**: Change to `export async function DELETE(request: NextRequest)` or rename the route.

---

### LOW-05: No OPTIONS handler for public API v1 routes

**Severity**: LOW
**Files**: All `src/app/api/v1/*` routes
**Description**: CORS headers are set in `next.config.ts` for `/api/v1/:path*`, including `Access-Control-Allow-Methods: GET, OPTIONS`. However, there are no explicit `OPTIONS` handlers in the route files. Next.js does handle preflight automatically for custom headers, but explicit handlers would ensure consistent behavior across deployments.

**Fix**: Add an OPTIONS handler or verify Next.js handles it correctly in production.

---

## 7. Response Format Consistency

### HIGH-05: `submissions/[id]/cost` uses custom `jsonResponse` instead of `apiSuccess`/`apiError`

**Severity**: HIGH
**File**: `src/app/api/submissions/[id]/cost/route.ts`, lines 7-14
**Description**: This route defines its own `jsonResponse()` helper that produces a different envelope shape. The error format uses `{ code, message }` directly instead of the `apiError` format which wraps errors in `{ code, message, details }`.

**Fix**: Replace `jsonResponse()` with `apiSuccess()` and `apiError()` from `@/lib/api/response`.

---

### HIGH-06: `v1/denominators` uses raw `NextResponse.json` instead of `apiSuccess`/`apiError`

**Severity**: HIGH
**File**: `src/app/api/v1/denominators/route.ts`, lines 10-31
**Description**: Uses `NextResponse.json()` directly with a manually constructed envelope. Missing `requestId` in the meta field. Inconsistent with all other API responses.

**Fix**: Replace with `apiSuccess()` and `apiError()`.

---

### LOW-06: Inconsistent error field names in validation error details

**Severity**: LOW
**Files**:
- `src/app/api/submissions/route.ts` (line 33): `{ fieldErrors }`
- `src/app/api/auth/register/route.ts` (line 26): `{ fields }`
- `src/app/api/submissions/[id]/flag/route.ts` (line 34): `{ errors }`
- `src/app/api/submissions/[id]/comments/route.ts` (line 131): `{ errors }`
- `src/app/api/features/route.ts` (line 117): `{ errors }`
- `src/app/api/submissions/[id]/route.ts` (line 67): `{ fieldErrors }`

**Description**: Validation error details use different keys: `fieldErrors`, `fields`, or `errors`. Consumers must handle multiple shapes.

**Fix**: Standardize on one key (recommend `fieldErrors` since it matches Zod's `flatten().fieldErrors`).

---

## 8. Business Logic in Routes

### HIGH-07: Excessive business logic in `submissions/[id]/vote/route.ts` (93 lines)

**Severity**: HIGH
**File**: `src/app/api/submissions/[id]/vote/route.ts`
**Lines**: 93 (exceeds 80-line limit)
**Description**: Contains vote casting, vote count retrieval, XP awarding for voter AND author, all inline. XP logic (lines 59-77) should be in a service layer.

**Fix**: Extract XP awarding to a `postVoteXp()` helper in `src/lib/gamification/`.

---

### HIGH-08: `submissions/[id]/comments/route.ts` at 205 lines

**Severity**: HIGH
**File**: `src/app/api/submissions/[id]/comments/route.ts`
**Lines**: 205 (far exceeds 80-line limit)
**Description**: Contains both GET with complex pagination/reply loading and POST with comment creation, XP awarding. Two complex handlers in one file.

**Fix**: Extract GET handler logic to `src/lib/api/comments.ts`. Keep the route file as a thin orchestrator.

---

### HIGH-09: `notes/[id]/vote/route.ts` at 153 lines

**Severity**: HIGH
**File**: `src/app/api/notes/[id]/vote/route.ts`
**Lines**: 153 (nearly double the 80-line limit)
**Description**: Vote toggle logic, counter updates, auto-pin/unpin logic, and XP awarding all inline.

**Fix**: Extract to `src/lib/api/community-note-votes.ts`.

---

### HIGH-10: `submissions/[id]/validate/route.ts` at 155 lines

**Severity**: HIGH
**File**: `src/app/api/submissions/[id]/validate/route.ts`
**Lines**: 155
**Description**: Validation weight calculation, auto-resolve logic, and XP awarding all inline.

**Fix**: Extract auto-resolve and XP logic to separate service functions.

---

### MEDIUM-10: `comments/[id]/vote/route.ts` at 174 lines

**Severity**: MEDIUM
**File**: `src/app/api/comments/[id]/vote/route.ts`
**Lines**: 174
**Description**: Vote toggle, score recalculation (3 separate queries), XP awarding all inline. Also defines a local `isNull()` function at line 171 instead of importing from Drizzle.

**Fix**: Extract to service layer. Import `isNull` from `drizzle-orm`.

---

### MEDIUM-11: `sources/[id]/validate/route.ts` at 124 lines

**Severity**: MEDIUM
**File**: `src/app/api/sources/[id]/validate/route.ts`
**Lines**: 124
**Description**: Toggle logic, counter updates, XP awarding for source contributor all inline.

**Fix**: Extract to a shared vote-toggle service.

---

### MEDIUM-12: `solutions/[id]/vote/route.ts` at 118 lines

**Severity**: MEDIUM
**File**: `src/app/api/solutions/[id]/vote/route.ts`
**Lines**: 118
**Description**: Same pattern as above -- inline toggle logic.

**Fix**: Extract to shared vote-toggle service.

---

### MEDIUM-13: `submissions/[id]/sources/route.ts` at 115 lines

**Severity**: MEDIUM
**File**: `src/app/api/submissions/[id]/sources/route.ts`
**Lines**: 115
**Description**: Source creation, XP awarding, cross-reference bonus logic all inline.

**Fix**: Extract XP and bonus logic.

---

### MEDIUM-14: `admin/broadcast/route.ts` at 126 lines

**Severity**: MEDIUM
**File**: `src/app/api/admin/broadcast/route.ts`
**Lines**: 126
**Description**: Two handlers (GET + POST) with tweet posting logic inline.

**Fix**: Move tweet posting orchestration to `src/lib/api/`.

---

### MEDIUM-15: `cron/open-data-import/route.ts` at 119 lines

**Severity**: MEDIUM
**File**: `src/app/api/cron/open-data-import/route.ts`
**Lines**: 119
**Description**: Cron orchestration with loop-based import logic inline.

**Fix**: Move orchestration loop to a service function.

---

## 9. SQL Injection

### LOW-07: All SQL uses Drizzle ORM parameterized queries -- no raw SQL injection risk

**Severity**: LOW (informational)
**Description**: All database queries use Drizzle ORM's query builder with `eq()`, `and()`, `sql` tagged template literals, etc. The `sql` tagged template from Drizzle automatically parameterizes interpolated values. No raw string concatenation is used in SQL.

The one pattern to monitor is `sql\`${votes.submissionId} IN ${submissionIds}\`` in `votes/batch/route.ts` (line 42). Drizzle handles array parameterization correctly, but this pattern should be verified if the ORM version changes.

**Status**: PASS -- no SQL injection vulnerabilities found.

---

## 10. Race Conditions (Non-Atomic Operations)

### CRITICAL-02: Non-atomic vote counter updates in multiple routes

**Severity**: CRITICAL
**Files**:
- `src/app/api/comments/[id]/vote/route.ts` -- Three separate queries to count up/down votes, then a separate UPDATE (lines 79-108)
- `src/app/api/solutions/[id]/vote/route.ts` -- Increment/decrement counters with separate UPDATE per operation
- `src/app/api/notes/[id]/vote/route.ts` -- Same pattern
- `src/app/api/sources/[id]/validate/route.ts` -- Same pattern

**Description**: Vote toggle operations (check existing -> delete/update vote -> update counter) are NOT wrapped in a database transaction. Under concurrent requests, race conditions can cause counter drift (e.g., two users voting simultaneously could both see the old count and increment by 1, resulting in a count that's off by 1).

**Fix**: Wrap vote toggle + counter update in `db.transaction()`. For example:
```typescript
await db.transaction(async (tx) => {
  // delete/update vote
  // update counters
});
```

---

### CRITICAL-03: Non-atomic submission comment count increment

**Severity**: CRITICAL
**File**: `src/app/api/submissions/[id]/comments/route.ts`, lines 188-191
**Description**: `commentCount` is incremented with `sql\`${submissions.commentCount} + 1\`` after inserting a comment, but the two operations are not in a transaction. If the insert succeeds but the update fails (or vice versa), the count drifts.

**Fix**: Wrap in `db.transaction()`.

---

## 11. Commented-Out Code

### CRITICAL-04: `submissions/[id]/cost` route has most DB logic commented out

**Severity**: CRITICAL
**File**: `src/app/api/submissions/[id]/cost/route.ts`, lines 37-88
**Description**: The entire submission lookup, caching, and result storage logic is commented out. The route currently only uses a `?amount=` query parameter as a workaround. This means:
1. The route does not verify the submission exists
2. Results are never cached in the database
3. Anyone can calculate costs for any arbitrary amount without referencing an actual submission

**Fix**: Either implement the DB logic or remove the route and use a pure utility endpoint (e.g., `/api/cost-calculator?amount=...`).

---

## 12. CORS

### LOW-08: Public API CORS is wildcard (`*`)

**Severity**: LOW
**File**: `next.config.ts`, line 52
**Description**: The `/api/v1/*` public API routes use `Access-Control-Allow-Origin: *`. This is acceptable for a public read-only API but should be restricted if any v1 routes ever accept writes or authenticated requests.

**Status**: Acceptable for current use case (public read-only API).

---

### LOW-09: No CORS configuration for internal API routes

**Severity**: LOW
**Description**: Routes under `/api/` (non-v1) have no CORS headers. This means they are only accessible from the same origin, which is correct for internal routes. However, if a mobile app or external integration ever needs to call these routes, CORS would need to be configured.

**Status**: Acceptable for current architecture.

---

## 13. Additional Findings

### HIGH-11: Seed badges endpoint uses weak `x-seed-secret` header auth

**Severity**: HIGH
**File**: `src/app/api/gamification/seed-badges/route.ts`, lines 6-8
**Description**: Uses `request.headers.get('x-seed-secret') !== process.env.SEED_SECRET`. If `SEED_SECRET` is not set, `process.env.SEED_SECRET` is `undefined`, and the check `secret !== undefined` would block all requests. However, if it's set to an empty string, `'' !== ''` is false (allowed). This is a fragile auth mechanism.

**Fix**: Add explicit check: `if (!secret || !cronSecret || secret !== cronSecret)`.

---

### MEDIUM-16: Dynamic imports for gamification XP in hot paths

**Severity**: MEDIUM
**Files**: Multiple vote/comment/solution routes use:
```typescript
const { awardXp } = await import('@/lib/gamification/xp-engine');
```
**Description**: Dynamic imports in request handlers add latency on every request (module resolution + potentially cold-loading). Found in 12+ routes.

**Fix**: Convert to static imports at the top of each file.

---

### LOW-10: Slug generation duplicated between `submissions/route.ts` and `submissions/[id]/route.ts`

**Severity**: LOW
**Files**:
- `src/app/api/submissions/route.ts`, lines 53-59
- `src/app/api/submissions/[id]/route.ts`, lines 17-25 (`slugify()` function)

**Description**: The slug generation logic is duplicated. If one is updated, the other may be forgotten.

**Fix**: Extract to `src/lib/utils/slugify.ts`.

---

### LOW-11: `submissions/[id]/route.ts` uses `as` type assertion for role check

**Severity**: LOW
**File**: `src/app/api/submissions/[id]/route.ts`, lines 50-51
**Description**: `(session.user as { role?: string }).role` uses an `as` type assertion, which the CLAUDE.md style guide prohibits. The session type should be augmented to include `role`.

**Fix**: Extend the NextAuth session type in `src/types/next-auth.d.ts`.

---

## Summary Table -- All Findings

| ID | Severity | Category | File(s) | Short Description |
|----|----------|----------|---------|-------------------|
| CRITICAL-01 | CRITICAL | Input Validation | 17 routes | `request.json()` not in try/catch |
| CRITICAL-02 | CRITICAL | Race Conditions | 4 vote routes | Non-atomic vote counter updates |
| CRITICAL-03 | CRITICAL | Race Conditions | comments route | Non-atomic comment count increment |
| CRITICAL-04 | CRITICAL | Commented Code | cost route | DB logic commented out, route is a stub |
| HIGH-01 | HIGH | Input Validation | daily-goal | Manual validation, missing value `0` |
| HIGH-02 | HIGH | Input Validation | privacy PUT | Manual validation, no Zod |
| HIGH-03 | HIGH | Input Validation | validate POST | Manual validation for verdict/reason |
| HIGH-04 | HIGH | Authorization | comment vote | Self-vote allowed on own comments |
| HIGH-05 | HIGH | Response Format | cost route | Custom `jsonResponse` not using `apiSuccess` |
| HIGH-06 | HIGH | Response Format | v1/denominators | Raw `NextResponse.json`, no `requestId` |
| HIGH-07 | HIGH | File Size | vote route | 93 lines, inline XP logic |
| HIGH-08 | HIGH | File Size | comments route | 205 lines, two complex handlers |
| HIGH-09 | HIGH | File Size | notes vote | 153 lines, inline auto-pin logic |
| HIGH-10 | HIGH | File Size | validate route | 155 lines, inline auto-resolve |
| HIGH-11 | HIGH | Authentication | seed-badges | Fragile header-based secret auth |
| MEDIUM-01 | MEDIUM | Input Validation | 8 routes | Missing UUID validation on `id` param |
| MEDIUM-02 | MEDIUM | Authentication | admin routes | Inconsistent 401/403 patterns |
| MEDIUM-03 | MEDIUM | Authentication | solutions POST | Anonymous submissions allowed |
| MEDIUM-04 | MEDIUM | Authorization | solution vote | Self-vote allowed on own solutions |
| MEDIUM-05 | MEDIUM | Authorization | broadcast | Admin-only vs moderator inconsistency |
| MEDIUM-06 | MEDIUM | Error Handling | 3 vote routes | `request.json()` outside try/catch |
| MEDIUM-07 | MEDIUM | Rate Limiting | 5 routes | Missing rate limiting on mutations |
| MEDIUM-08 | MEDIUM | Rate Limiting | votes/batch | Missing rate limiting |
| MEDIUM-09 | MEDIUM | HTTP Methods | user/delete | POST instead of DELETE |
| MEDIUM-10 | MEDIUM | File Size | comment vote | 174 lines, local `isNull` fn |
| MEDIUM-11 | MEDIUM | File Size | source validate | 124 lines |
| MEDIUM-12 | MEDIUM | File Size | solution vote | 118 lines |
| MEDIUM-13 | MEDIUM | File Size | sources route | 115 lines |
| MEDIUM-14 | MEDIUM | File Size | broadcast | 126 lines |
| MEDIUM-15 | MEDIUM | File Size | open-data cron | 119 lines |
| MEDIUM-16 | MEDIUM | Performance | 12+ routes | Dynamic imports for XP in hot paths |
| LOW-01 | LOW | Input Validation | user routes | NaN possible in limit parsing |
| LOW-02 | LOW | Authentication | cron routes | Bearer token only, no IP allowlist |
| LOW-03 | LOW | Error Handling | 7 routes | Swallowed errors without logging |
| LOW-04 | LOW | Rate Limiting | rate-limit.ts | Silently disabled without env vars |
| LOW-05 | LOW | HTTP Methods | v1 routes | No explicit OPTIONS handler |
| LOW-06 | LOW | Response Format | 6 routes | Inconsistent validation error key names |
| LOW-07 | LOW | SQL Injection | all routes | PASS -- Drizzle ORM parameterizes |
| LOW-08 | LOW | CORS | next.config.ts | Wildcard CORS on public API |
| LOW-09 | LOW | CORS | internal routes | No CORS (correct for same-origin) |
| LOW-10 | LOW | DRY | 2 routes | Slug generation duplicated |
| LOW-11 | LOW | TypeScript | submissions PATCH | `as` type assertion for role check |

---

## Recommended Priority Actions

### Immediate (before next deploy)
1. **CRITICAL-01**: Wrap all `request.json()` in try/catch or create a shared helper
2. **CRITICAL-02/03**: Wrap vote and counter operations in `db.transaction()`
3. **CRITICAL-04**: Implement or remove the cost route DB logic

### This sprint
4. **HIGH-01/02/03**: Replace manual validation with Zod schemas
5. **HIGH-04**: Block self-votes on comments and solutions
6. **HIGH-05/06**: Standardize response format to use `apiSuccess`/`apiError`
7. **HIGH-07-10**: Extract business logic from oversized routes to service layer
8. **HIGH-11**: Harden seed-badges auth

### Next sprint
9. **MEDIUM-01**: Add UUID validation to all ID params
10. **MEDIUM-02**: Standardize admin auth pattern
11. **MEDIUM-07/08**: Add rate limiting to user mutation endpoints
12. **MEDIUM-16**: Convert dynamic XP imports to static imports
13. **LOW-06**: Standardize validation error detail keys

---

## Route Inventory (51 handlers)

| Route | Methods | Auth | Rate Limit | Zod | Lines |
|-------|---------|------|------------|-----|-------|
| `auth/[...nextauth]` | GET, POST | NextAuth | -- | -- | 3 |
| `auth/register` | POST | None | registration | Yes | 71 |
| `admin/dashboard` | GET | admin | None | No | 93 |
| `admin/broadcast` | GET, POST | admin | None | Yes | 126 |
| `admin/flags` | GET | admin/mod | None | No | 63 |
| `admin/submissions` | GET | admin/mod | None | Yes | 54 |
| `admin/submissions/[id]/moderate` | POST | admin/mod | None | Yes | 105 |
| `admin/gamification` | GET, POST | admin | None | Yes (POST) | 105 |
| `feed` | GET | None | api | Yes | 48 |
| `features` | GET, POST | None/Auth | submission | Yes | 136 |
| `features/[id]` | PATCH | admin | None | Yes | 53 |
| `features/[id]/vote` | POST | Auth | vote | Yes | 107 |
| `page-views` | POST | None | api | Yes | 36 |
| `submissions` | POST | None | submission | Yes | 113 |
| `submissions/[id]` | PATCH | Auth+Owner | None | Yes | 99 |
| `submissions/[id]/vote` | POST, DELETE | None | vote | Yes | 137 |
| `submissions/[id]/flag` | POST, GET | Auth | api | Yes | 118 |
| `submissions/[id]/cost` | GET | None | None | Manual | 107 |
| `submissions/[id]/comments` | GET, POST | None/Auth | comment | Yes | 205 |
| `submissions/[id]/notes` | GET, POST | None/Auth | communityNote | Yes | 87 |
| `submissions/[id]/solutions` | GET, POST | None | comment | Yes | 85 |
| `submissions/[id]/share` | POST | None | api | Yes | 63 |
| `submissions/[id]/sources` | GET, POST | None/Auth | source | Yes | 115 |
| `submissions/[id]/validate` | POST | Auth (level) | api | Manual | 155 |
| `submissions/pending` | GET | Auth (level) | api | No | 87 |
| `user/display-name` | PATCH | Auth | None | Yes | 66 |
| `user/delete` | POST | Auth | None | Yes | 78 |
| `votes/batch` | GET | None | None | Manual | 57 |
| `comments/[id]/vote` | POST, DELETE | Auth | vote | Yes | 174 |
| `notes/[id]/vote` | POST | None | vote | Yes | 153 |
| `solutions/[id]/vote` | POST | None | vote | Yes | 118 |
| `solutions/[id]/adjustments` | GET, POST | None | comment | Yes | 93 |
| `sources/[id]/validate` | POST | None | vote | Yes | 124 |
| `leaderboard` | GET | None | api | No | 22 |
| `gamification/daily-goal` | PUT | Auth | None | Manual | 32 |
| `gamification/seed-badges` | POST | x-seed-secret | None | No | 18 |
| `gamification/stats` | GET | Auth | None | No | 23 |
| `gamification/privacy` | GET, PUT | Auth | None | Manual | 70 |
| `cron/streak-check` | POST | CRON_SECRET | None | No | 96 |
| `cron/open-data-import` | POST | CRON_SECRET | None | Yes | 119 |
| `v1/denominators` | GET | None | publicApi | No | 32 |
| `v1/users/[userId]` | GET | None | None | No | 26 |
| `v1/users/[userId]/submissions` | GET | None | None | No | 29 |
| `v1/users/[userId]/votes` | GET | Auth+Owner | None | No | 33 |
| `v1/stats` | GET | None | publicApi | No | 18 |
| `v1/search` | GET | None | publicApi | Yes | 32 |
| `v1/categories` | GET | None | publicApi | No | 13 |
| `v1/submissions` | GET | None | publicApi | Yes | 33 |
| `v1/submissions/export` | GET | None | publicApi | Yes | 64 |
| `v1/submissions/[id]` | GET | None | publicApi | Yes | 31 |
| `webhooks/github` | POST | HMAC sig | None | No | 41 |
| `submissions/[id]/criteria-vote` | GET, POST | None | vote (POST) | Yes | 227 |

---

## Addendum — Post-rebase delta (2 mars 2026)

This addendum covers the new **multi-criteria voting** feature (`criteria-vote` route) and the **adjustments fix** (`solutions/[id]/adjustments`), merged since the original audit.

### New Route: `submissions/[id]/criteria-vote/route.ts` (227 lines)

#### DELTA-HIGH-01: File exceeds 80-line limit (227 lines)

**Severity**: HIGH
**File**: `src/app/api/submissions/[id]/criteria-vote/route.ts`
**Lines**: 227

**Description**: The route contains two handlers (GET + POST) with significant inline business logic: aggregate merging from two tables, user vote detection for both authenticated and anonymous users, vote toggling with three branches (toggle off, switch, new), and XP awarding. At 227 lines, this is nearly 3x the 80-line guideline.

**Fix**: Extract the GET aggregation logic to `src/lib/api/criteria-votes.ts` and the POST toggle logic to a shared `toggleCriteriaVote()` helper.

---

#### DELTA-HIGH-02: Non-atomic vote toggle + no transaction in POST handler

**Severity**: HIGH
**File**: `src/app/api/submissions/[id]/criteria-vote/route.ts`
**Lines**: 147-179 (authenticated), 190-219 (anonymous)

**Description**: The POST handler performs a read-then-write pattern (SELECT existing vote, then DELETE/UPDATE/INSERT) without wrapping it in `db.transaction()`. Under concurrent requests from the same user (e.g., double-clicking), two requests could both read "no existing vote" and both insert, violating the unique constraint. The unique index will catch this (causing a 500 error) but the error is not handled gracefully.

This is the same pattern already identified in CRITICAL-02 of the original audit, extended to the new tables.

**Fix**: Wrap each authenticated/anonymous branch in `db.transaction()` and add conflict handling:
```typescript
await db.transaction(async (tx) => {
  const [existing] = await tx.select()...;
  if (existing) { /* toggle/switch */ } else { /* insert */ }
});
```

---

#### DELTA-MEDIUM-01: `request.json()` outside try/catch in POST handler

**Severity**: MEDIUM
**File**: `src/app/api/submissions/[id]/criteria-vote/route.ts`
**Line**: 134

**Description**: `const body = await request.json();` is called at line 134, before the `try` block that starts at line 142. If the request body is not valid JSON (empty body, malformed payload), this throws an unhandled exception that surfaces as a 500 with Next.js's default error page instead of the `apiError` envelope. This is the same class of issue as CRITICAL-01 in the original audit.

**Fix**: Move `await request.json()` inside the try block (after line 142), or use the proposed `parseJsonBody()` helper from CRITICAL-01.

---

#### DELTA-MEDIUM-02: GET handler fires 3 sequential queries instead of parallelizing

**Severity**: MEDIUM
**File**: `src/app/api/submissions/[id]/criteria-vote/route.ts`
**Lines**: 33-106

**Description**: The GET handler fires three sequential database queries:
1. Aggregate counts from `criteriaVotes` (lines 33-41)
2. Aggregate counts from `ipCriteriaVotes` (lines 43-51)
3. User's existing votes (lines 78-106)

Queries 1 and 2 are independent and could be parallelized with `Promise.all()`. For the common unauthenticated case, all three could run in parallel (the user vote query for anonymous users does not depend on the session).

**Fix**: Use `Promise.all()` for the two aggregate queries:
```typescript
const [aggregates, ipAggregates] = await Promise.all([
  db.select(...).from(criteriaVotes)...,
  db.select(...).from(ipCriteriaVotes)...,
]);
```

---

#### DELTA-MEDIUM-03: Dynamic import for XP engine in hot path

**Severity**: MEDIUM
**File**: `src/app/api/submissions/[id]/criteria-vote/route.ts`
**Lines**: 183-184

**Description**: The route uses `const { awardXp } = await import('@/lib/gamification/xp-engine');` inside the request handler. This dynamic import adds latency on every new-vote request (module resolution overhead). This is the same pattern identified in MEDIUM-16 of the original audit.

**Fix**: Convert to a static import at the top of the file:
```typescript
import { awardXp } from '@/lib/gamification/xp-engine';
```

---

#### DELTA-LOW-01: `CriterionKey` type defined locally instead of imported

**Severity**: LOW
**File**: `src/app/api/submissions/[id]/criteria-vote/route.ts`
**Line**: 11

**Description**: The type `type CriterionKey = 'proportional' | 'legitimate' | 'alternative'` is defined locally in the route file. The same type is also defined locally in `src/hooks/useCriteriaVote.ts` (line 6) and in `src/components/features/voting/CriteriaVoteSection.tsx` (line 8). The canonical values exist in the Zod schema `criteriaVoteSchema` in `src/lib/utils/validation.ts` and in the pgEnum `criterionKey` in the schema, but no shared TypeScript type is exported.

**Fix**: Export the type from validation.ts using Zod inference:
```typescript
export type CriterionKey = CriteriaVoteInput['criterion'];
```
Then import it in the route, hook, and component.

---

#### DELTA-LOW-02: `as CriterionKey` type assertions used without guards

**Severity**: LOW
**File**: `src/app/api/submissions/[id]/criteria-vote/route.ts`
**Lines**: 61, 69, 88, 103

**Description**: The database query results are cast with `row.criterion as CriterionKey` in four places. While the database enum constraint ensures validity, the `as` assertion bypasses TypeScript's type checking, which the project's CLAUDE.md style guide discourages.

**Fix**: Use the `criteria[key]` check that already follows each cast as a type guard, or add a runtime validation function.

---

#### DELTA-INFO-01: Positive findings on `criteria-vote` route

**Severity**: INFO (positive)

The route demonstrates several good practices relative to the rest of the codebase:
- **Input validation**: Uses Zod (`criteriaVoteSchema.safeParse`) for the POST body -- good.
- **UUID validation**: Validates the `submissionId` param with `isValidUUID()` on both GET and POST -- good.
- **Rate limiting**: POST handler uses `checkRateLimit('vote', ip)` -- good.
- **Error handling**: Both handlers have try/catch with `console.error()` logging -- better than several existing routes (see LOW-03 original audit).
- **Response format**: Uses `apiSuccess()`/`apiError()` consistently -- good.
- **Auth flexibility**: Supports both authenticated users (via session) and anonymous users (via IP hash) -- consistent with the existing vote pattern.

---

### Updated Route: `solutions/[id]/adjustments/route.ts` (98 lines)

#### DELTA-INFO-02: Adjustments route now correctly increments `commentCount`

**Severity**: INFO (improvement)
**File**: `src/app/api/solutions/[id]/adjustments/route.ts`
**Lines**: 91-95

**Description**: The adjustments POST handler now correctly increments `submissions.commentCount` after creating an adjustment comment (lines 91-95). Previously, adjustments were created as comments linked to a solution but the parent submission's `commentCount` was not updated, causing count drift.

This fix addresses part of the denormalized counter issue flagged in the original database audit (CRITICAL-04). However, the decrement side (on deletion) is still missing.

---

#### DELTA-LOW-03: Adjustments POST still lacks transaction wrapping

**Severity**: LOW
**File**: `src/app/api/solutions/[id]/adjustments/route.ts`
**Lines**: 80-95

**Description**: The comment INSERT (line 80-89) and the `commentCount` INCREMENT (lines 91-95) are two separate operations not wrapped in a transaction. If the increment fails, the comment exists but the count is off. This is the same pattern as CRITICAL-03 / HIGH-12 in the original audit, now extended to the adjustments route.

**Fix**: Wrap in `db.transaction()`.

---

### Delta Summary Table

| ID | Severity | Category | File(s) | Description |
|----|----------|----------|---------|-------------|
| DELTA-HIGH-01 | HIGH | File Size | criteria-vote | 227 lines, inline logic in both handlers |
| DELTA-HIGH-02 | HIGH | Race Conditions | criteria-vote POST | Non-atomic vote toggle, no transaction |
| DELTA-MEDIUM-01 | MEDIUM | Input Validation | criteria-vote POST | `request.json()` outside try/catch |
| DELTA-MEDIUM-02 | MEDIUM | Performance | criteria-vote GET | 3 sequential queries, not parallelized |
| DELTA-MEDIUM-03 | MEDIUM | Performance | criteria-vote POST | Dynamic import for XP engine |
| DELTA-LOW-01 | LOW | DRY / Types | criteria-vote + hook + component | `CriterionKey` type duplicated in 3 files |
| DELTA-LOW-02 | LOW | TypeScript | criteria-vote | `as` type assertions without guards |
| DELTA-LOW-03 | LOW | Transactions | adjustments POST | Comment + count increment not transactional |
| DELTA-INFO-01 | INFO | Positive | criteria-vote | Good Zod, UUID, rate limit, response format |
| DELTA-INFO-02 | INFO | Improvement | adjustments POST | Now increments commentCount (partial fix for CRITICAL-04) |

### Updated Totals (original + delta)

| Severity | Original | Delta | New Total |
|----------|----------|-------|-----------|
| CRITICAL | 4        | 0     | 4         |
| HIGH     | 11       | 2     | 13        |
| MEDIUM   | 16       | 3     | 19        |
| LOW      | 11       | 3     | 14        |
