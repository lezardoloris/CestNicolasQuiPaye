# Security Audit Report -- C'est Nicolas Qui Paye

**Date:** 2026-03-02
**Auditor:** Claude Opus 4.6 (automated static analysis)
**Scope:** Full codebase at `/work/projects/NICOLAS/CestNicolasQuiPaye` (branch `feat/simulateur`, commit `30f275e`)
**Stack:** Next.js 16, React 19, TypeScript 5.9, Drizzle ORM, PostgreSQL 16, NextAuth v5 (beta), Upstash Redis

---

## Executive Summary

The application demonstrates a generally solid security posture for an early-stage civic platform. Authentication uses NextAuth v5 with JWT strategy, input validation is consistently applied via Zod schemas, and Drizzle ORM protects against SQL injection by default. Security headers are properly configured in `next.config.ts`.

However, several findings require attention, ranging from a **CRITICAL** SQL-injection-like vector in the search API to **HIGH** severity issues with rate limiting being disabled without Upstash Redis, and a hardcoded default IP hashing salt.

**Summary by severity:**
- CRITICAL: 1
- HIGH: 5
- MEDIUM: 8
- LOW: 6

---

## CRITICAL

### SEC-01: SQL Injection via `ilike` with Unsanitized Search Query

- **Severity:** CRITICAL
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/api/public-submissions.ts`
- **Lines:** 363-366
- **Description:** The public search endpoint interpolates the user-supplied query `q` directly into an `ilike` pattern using string concatenation:
  ```typescript
  or(
    ilike(submissions.title, `%${q}%`),
    ilike(submissions.description, `%${q}%`),
  ),
  ```
  While Drizzle ORM parameterizes values (preventing classic SQL injection), the `%` and `_` characters in LIKE/ILIKE patterns are **not** escaped. An attacker can submit `q=%` to match all rows, or craft `_` patterns to perform character-level enumeration. More critically, PostgreSQL `ilike` with unbounded user input combined with complex patterns (e.g., `%a%b%c%d%e%f%g%h%`) can cause catastrophic backtracking in the regex engine, leading to **ReDoS/DoS** against the database.
- **Impact:** Denial of service via crafted search patterns; potential information disclosure through pattern matching.
- **Remediation:**
  1. Escape LIKE special characters (`%`, `_`, `\`) in user input before interpolation:
     ```typescript
     function escapeLike(s: string): string {
       return s.replace(/[%_\\]/g, '\\$&');
     }
     ```
  2. Consider using PostgreSQL full-text search (`to_tsvector`/`to_tsquery`) instead of `ilike` for better security and performance.
  3. Add a maximum query length check (the existing `max(200)` in Zod helps but does not prevent pattern abuse).

---

## HIGH

### SEC-02: Rate Limiting Silently Disabled Without Upstash Redis

- **Severity:** HIGH
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/api/rate-limit.ts`
- **Lines:** 4-13, 20-23, 70-81
- **Description:** When `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` are not configured, all rate limiters return `null`, and `checkRateLimit()` returns `null` (meaning "allowed"). This means **all rate limiting is silently bypassed** in any environment without Upstash configured. The `.env.example` file does not include Upstash variables, making it easy to deploy to production without rate limiting.
- **Impact:** Without rate limiting, an attacker can:
  - Brute-force login credentials at unlimited speed
  - Spam submissions, comments, and votes
  - Abuse the registration endpoint for account enumeration
  - Exhaust database resources via rapid API calls
- **Remediation:**
  1. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.example` with clear documentation.
  2. In production, fail-closed: if rate limiting is not configured, either reject requests or use an in-memory fallback (e.g., `Map`-based sliding window).
  3. Add a startup check/warning: if `NODE_ENV=production` and Upstash is not configured, log a critical warning.

### SEC-03: Hardcoded Default Salt for IP Hashing

- **Severity:** HIGH
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/utils/ip-hash.ts`
- **Line:** 3
- **Description:**
  ```typescript
  const IP_HASH_SALT = process.env.IP_HASH_SALT || 'nicolas-paye-default-salt';
  ```
  If `IP_HASH_SALT` is not set (it is absent from `.env.example`), a hardcoded, publicly known salt is used. Anyone with the source code can precompute rainbow tables and reverse anonymous IP vote hashes, de-anonymizing voters. This is a **GDPR violation** for a French platform, since hashed IPs with a known salt are reversible and thus constitute personal data.
- **Impact:** De-anonymization of anonymous voters; GDPR non-compliance.
- **Remediation:**
  1. Remove the default fallback entirely: `const IP_HASH_SALT = process.env.IP_HASH_SALT!;`
  2. Add `IP_HASH_SALT` to `.env.example` and document that it must be a cryptographically random string.
  3. Add a startup check that refuses to run if the salt is not set in production.

### SEC-04: Password Policy Too Weak

- **Severity:** HIGH
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/validators/auth.ts`
- **Lines:** 9-12
- **Description:** The password validation only enforces `min(8)` and `max(128)`. There are no requirements for character complexity (uppercase, lowercase, digits, special characters), no check against common password lists (e.g., "12345678", "password"), and no check against the user's email.
- **Impact:** Users can register with trivially guessable passwords, making brute-force attacks more effective.
- **Remediation:**
  1. Add regex validation for at least one uppercase, one lowercase, and one digit.
  2. Consider checking against the top 10,000 common passwords (a small list checked at registration time).
  3. Example:
     ```typescript
     password: z.string()
       .min(8)
       .max(128)
       .regex(/[A-Z]/, 'Au moins une majuscule')
       .regex(/[a-z]/, 'Au moins une minuscule')
       .regex(/[0-9]/, 'Au moins un chiffre'),
     ```

### SEC-05: CSP Allows `'unsafe-inline'` and `'unsafe-eval'` for Scripts

- **Severity:** HIGH
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/next.config.ts`
- **Lines:** 8
- **Description:**
  ```
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
  ```
  The Content Security Policy allows inline scripts and `eval()`. This effectively **nullifies XSS protection** from CSP, since any injected inline script or `eval`-based payload will be permitted by the browser.
- **Impact:** CSP provides no meaningful defense against XSS attacks.
- **Remediation:**
  1. Remove `'unsafe-eval'` entirely. If a library requires it (e.g., some charting libraries), investigate alternatives or use a hash/nonce-based approach.
  2. Replace `'unsafe-inline'` with nonce-based CSP using Next.js's built-in `nonce` support:
     ```typescript
     // In next.config.ts headers or middleware
     script-src 'self' 'nonce-${nonce}'
     ```
  3. If removing `'unsafe-inline'` is not immediately feasible, at minimum remove `'unsafe-eval'` and plan a migration to nonce-based CSP.

### SEC-06: OAuth User Password Hash Set to Empty String

- **Severity:** HIGH
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/auth/index.ts`
- **Line:** 107
- **Description:**
  ```typescript
  passwordHash: '', // OAuth user -- no password
  ```
  OAuth-only users are created with an empty-string `passwordHash`. While the credentials `authorize` callback checks `if (!user.passwordHash) return null;` (line 66), this depends on JavaScript's truthiness evaluation of empty strings being falsy. If this check is ever refactored (e.g., `if (user.passwordHash === undefined)`), it would allow login with any password. Additionally, the empty string hash is a code smell that could confuse future developers.
- **Impact:** Fragile security invariant; potential authentication bypass if code is refactored carelessly.
- **Remediation:**
  1. Use `null` instead of empty string for OAuth users: change the schema column to be nullable, and set `passwordHash: null` for OAuth users.
  2. Check explicitly: `if (user.passwordHash === null) return null;`

---

## MEDIUM

### SEC-07: Seed Badge Endpoint Protected Only by Header Secret

- **Severity:** MEDIUM
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/api/gamification/seed-badges/route.ts`
- **Lines:** 5-8
- **Description:**
  ```typescript
  const secret = request.headers.get('x-seed-secret');
  if (secret !== process.env.SEED_SECRET) {
  ```
  The seed endpoint compares the secret with simple `!==` equality. If `SEED_SECRET` is not set in the environment (`undefined`), the check becomes `header !== undefined`, which will always be true (since the header is a string), meaning the endpoint is **accidentally open** when `SEED_SECRET` is not configured.
- **Impact:** Anyone can re-seed badge definitions if `SEED_SECRET` is not set in the environment.
- **Remediation:**
  1. Add an explicit check: `if (!secret || !process.env.SEED_SECRET || secret !== process.env.SEED_SECRET)`
  2. Add `SEED_SECRET` to `.env.example`.

### SEC-08: Missing UUID Validation on Several Dynamic Route Parameters

- **Severity:** MEDIUM
- **Files:**
  - `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/api/submissions/[id]/route.ts` (line 36: `const { id } = await params;`)
  - `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/api/submissions/[id]/comments/route.ts` (line 14: `const { id } = await params;`)
  - `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/api/submissions/[id]/flag/route.ts` (line 16: `const { id } = await params;`)
  - `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/api/admin/submissions/[id]/moderate/route.ts` (line 12: `const { id } = await params;`)
- **Description:** Several API routes use the `[id]` path parameter directly in database queries without first validating it as a UUID. While Drizzle ORM will parameterize the value (preventing SQL injection), passing an invalid format triggers a PostgreSQL error (`invalid input syntax for type uuid`) that results in a 500 Internal Server Error instead of a clean 400 validation error.
- **Impact:** Information leakage via error messages; unclean error handling; potential for error-based enumeration.
- **Remediation:** Add `isValidUUID(id)` check at the top of each handler, as already done in routes like `vote/route.ts` and `sources/route.ts`. Apply consistently across all `[id]` routes.

### SEC-09: Public Export Endpoint Has No Pagination Limit

- **Severity:** MEDIUM
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/api/public-submissions.ts`
- **Lines:** 416-450 (`exportPublicSubmissions`)
- **Description:** The export endpoint fetches **all matching submissions** from the database without any `LIMIT` clause. As the dataset grows, this can:
  - Cause memory exhaustion on the server (loading all rows into memory)
  - Cause timeout errors for large datasets
  - Be used as a DoS vector
- **Impact:** Denial of service; server resource exhaustion.
- **Remediation:**
  1. Add a hard limit (e.g., `.limit(10000)`) to the export query.
  2. Add streaming CSV generation instead of building the entire string in memory.
  3. Consider adding a `limit` parameter to the export query schema.

### SEC-10: Admin API Routes Vulnerable to Session Role Caching Stale Data

- **Severity:** MEDIUM
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/auth/index.ts`
- **Lines:** 146-170
- **Description:** The JWT callback only refreshes user data from the database when `user` or `account` is populated (first sign-in). After that, the `role` in the JWT is static for up to 30 days (session `maxAge`). If an admin revokes a user's admin/moderator role, the JWT continues to grant elevated access until the session expires.
- **Impact:** Revoked admin/moderator users retain elevated access for up to 30 days.
- **Remediation:**
  1. Reduce JWT `maxAge` to a shorter duration (e.g., 24 hours).
  2. For admin actions, perform an additional DB check of the user's current role, not just the JWT claim.
  3. Implement a session invalidation mechanism (e.g., store a "role version" in the DB and check it in the `session` callback).

### SEC-11: Missing `HttpOnly` / `SameSite` Cookie Configuration Documentation

- **Severity:** MEDIUM
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/auth/index.ts`
- **Description:** NextAuth v5 manages cookies automatically with secure defaults (`HttpOnly`, `SameSite=Lax`, `Secure` in production). However, the configuration does not explicitly set cookie options, relying entirely on NextAuth defaults. If the platform ever needs to customize cookies or if defaults change in a future NextAuth version, this could introduce a vulnerability.
- **Impact:** Low immediate risk; potential future regression.
- **Remediation:** Explicitly configure cookie options in NextAuth config:
  ```typescript
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
    },
  },
  ```

### SEC-12: `stripHtmlTags` Sanitizer Is Defined But Never Used

- **Severity:** MEDIUM
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/utils/sanitize.ts`
- **Lines:** 1-9
- **Description:** A `stripHtmlTags` function exists for XSS prevention, but it is never imported or called anywhere in the codebase. User-submitted content (titles, descriptions, comments, solutions, community notes) is stored raw from Zod-validated input and rendered by React (which auto-escapes JSX output). While React's auto-escaping prevents reflected XSS in the browser, the raw HTML is stored in the database and could be rendered unsafely if:
  - The data is consumed by a non-React client (e.g., future mobile app, email digest)
  - The CSV export is opened in Excel (CSV injection)
  - The data is displayed in an email notification
- **Impact:** Stored XSS risk if data is consumed outside React context; CSV formula injection via export.
- **Remediation:**
  1. Apply `stripHtmlTags` (or a more robust sanitizer like DOMPurify) on write, in the Zod schemas via `.transform()`.
  2. For CSV export, prefix cell values starting with `=`, `+`, `-`, `@`, `\t`, `\r` with a single quote to prevent formula injection.

### SEC-13: CSV Export Vulnerable to Formula Injection

- **Severity:** MEDIUM
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/utils/csv.ts`
- **Lines:** 6-12
- **Description:** The `escapeValue` function handles commas, quotes, and newlines, but does **not** escape formula injection characters. If a submission title or description starts with `=`, `+`, `-`, or `@`, opening the CSV in Excel or Google Sheets will execute the value as a formula (e.g., `=HYPERLINK("http://evil.com","Click me")`).
- **Impact:** Remote code execution or data exfiltration when a user opens the exported CSV in a spreadsheet application.
- **Remediation:** Prefix potentially dangerous values:
  ```typescript
  function escapeValue(value: unknown): string {
    let str = value == null ? '' : String(value);
    // Prevent CSV formula injection
    if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
  ```

### SEC-14: `next-auth` Beta Version in Production

- **Severity:** MEDIUM
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/package.json`
- **Line:** 39
- **Description:** The application uses `next-auth@^5.0.0-beta.30`. Beta versions may contain unresolved security issues and do not receive the same level of security scrutiny as stable releases. The beta API surface may also change, potentially introducing breaking security behavior.
- **Impact:** Potential undiscovered authentication vulnerabilities; no security patch guarantees.
- **Remediation:** Monitor NextAuth v5 releases and upgrade to a stable release as soon as available. Pin the version to avoid unexpected beta upgrades: `"next-auth": "5.0.0-beta.30"` (remove the `^`).

---

## LOW

### SEC-15: `generateAnonymousId` Uses `Math.random()` (Non-Cryptographic)

- **Severity:** LOW
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/src/lib/auth/index.ts`
- **Lines:** 17-20
- **Description:**
  ```typescript
  function generateAnonymousId(): string {
    const rand = Math.random().toString(36).slice(2, 8);
    return `citoyen_${rand}`;
  }
  ```
  `Math.random()` is not cryptographically secure. The anonymous ID space is small (36^6 = ~2.2 billion), and `Math.random()` values can be predicted if the internal state is known. Note: there is also a `generateAnonymousId` in `src/lib/db/helpers.ts` used by the registration route; this inline version is only used in the OAuth signIn callback.
- **Impact:** Predictable anonymous IDs; potential enumeration, though the practical risk is low since IDs are not used for authentication.
- **Remediation:** Use `crypto.randomUUID()` or `crypto.getRandomValues()`:
  ```typescript
  import { randomBytes } from 'crypto';
  function generateAnonymousId(): string {
    return `citoyen_${randomBytes(4).toString('hex')}`;
  }
  ```

### SEC-16: Error Messages May Leak Internal Information

- **Severity:** LOW
- **Files:** Multiple API routes
- **Description:** Several routes log full error objects with `console.error()` and some catch blocks re-throw or expose partial error details. While the API responses consistently return generic messages (good), stack traces in logs may contain database connection strings, query details, or internal paths if log aggregation is misconfigured.
- **Impact:** Information leakage via logs.
- **Remediation:** Ensure production logging (Pino) is configured to redact sensitive fields. Consider using structured logging with explicit field selection rather than logging raw error objects.

### SEC-17: `AUTH_SECRET` Present in `.env.local` (Development Only)

- **Severity:** LOW
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/.env.local`
- **Line:** 8
- **Description:** The `.env.local` file contains a real `AUTH_SECRET` value. While `.env.local` is in `.gitignore` (good), it is present on the developer's machine. The value `pGvKwb9glosV8ebwRdbaRBH4q1xpNr6Kvg+Jr40fvRM=` should not be reused in production.
- **Impact:** If accidentally committed or reused in production, the JWT signing secret would be compromised.
- **Remediation:** Verify that production uses a different `AUTH_SECRET` generated with `openssl rand -base64 32`. Add a note in `.env.example` explicitly stating not to reuse the development secret.

### SEC-18: CORS Wildcard on Public API

- **Severity:** LOW
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/next.config.ts`
- **Lines:** 53
- **Description:**
  ```typescript
  { key: 'Access-Control-Allow-Origin', value: '*' },
  ```
  The public API v1 endpoints use `Access-Control-Allow-Origin: *`. Since these are read-only GET endpoints for public data, this is acceptable. However, if POST endpoints are ever added under `/api/v1/`, the wildcard CORS would allow any origin to make mutating requests.
- **Impact:** Low for current read-only API; higher if write endpoints are added.
- **Remediation:** Restrict CORS to specific allowed origins if write endpoints are added. Consider using a dynamic CORS policy based on a whitelist.

### SEC-19: `drizzle-kit push --force` in Start Script

- **Severity:** LOW
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/package.json`
- **Line:** 8
- **Description:**
  ```json
  "start": "drizzle-kit push --force --verbose && next start",
  ```
  The `start` script runs `drizzle-kit push --force` which applies schema changes directly to the database without migration files. The `--force` flag skips confirmation prompts and may drop columns/data. Running this on every server start in production is dangerous.
- **Impact:** Accidental data loss if schema changes are introduced; schema drift if multiple instances start simultaneously.
- **Remediation:**
  1. Use proper migrations (`drizzle-kit generate` + `drizzle-kit migrate`) for production.
  2. Remove `drizzle-kit push --force` from the `start` script.
  3. Run migrations as a separate deployment step, not on every server start.

### SEC-20: Submission Edit Endpoint Missing Rate Limiting

- **Severity:** LOW
- **File:** `/work/projects/NICOLAS/CestNicolasQuiPaye/src/app/api/submissions/[id]/route.ts`
- **Lines:** 27-99
- **Description:** The `PATCH` endpoint for editing submissions has authentication and authorization checks but no rate limiting. An authenticated user could rapidly edit their submissions to abuse the system.
- **Impact:** Potential spam/abuse of the edit functionality.
- **Remediation:** Add rate limiting to the PATCH handler using the existing `checkRateLimit('api', ip)` pattern.

---

## Positive Security Findings

The following security practices are well-implemented and deserve recognition:

1. **Drizzle ORM parameterized queries:** All database queries use Drizzle's query builder with parameterized values. No raw SQL string concatenation with user input was found. The `sql` tagged template literal is used correctly with column references, not user input interpolation.

2. **Zod input validation:** Every API route validates input with Zod schemas before processing. Schemas include appropriate min/max lengths, enum constraints, and type coercion.

3. **No `dangerouslySetInnerHTML`:** Zero instances found in the codebase. React's default JSX escaping handles all user content rendering.

4. **Security headers:** Comprehensive security headers including HSTS (with preload), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, and Permissions-Policy are properly configured.

5. **bcrypt with cost factor 12:** Passwords are hashed with bcrypt at cost 12, which is appropriate for 2026.

6. **GitHub webhook HMAC verification:** The webhook endpoint properly validates signatures using `timingSafeEqual` to prevent timing attacks.

7. **Cron endpoint authentication:** Both cron endpoints (`open-data-import` and `streak-check`) are protected by `CRON_SECRET` Bearer tokens.

8. **UUID primary keys:** All database tables use UUID primary keys, preventing sequential ID enumeration.

9. **Soft delete for accounts:** Account deletion properly anonymizes data and soft-deletes within a transaction, maintaining data integrity.

10. **No file upload endpoints:** The application has no file upload functionality, eliminating an entire class of vulnerabilities.

11. **IP hashing for GDPR:** Anonymous votes store hashed IPs rather than raw IPs (though the salt issue in SEC-03 weakens this).

12. **Anti-gaming system:** The gamification system includes anti-abuse measures (excessive vote detection, reciprocal decay, session cooldown).

13. **`.gitignore` coverage:** Environment files (`.env`, `.env.local`, `.env*.local`) are properly excluded from version control.

---

## Dependency Audit

| Package | Version | Status |
|---------|---------|--------|
| `next` | 16.1.6 | Current |
| `next-auth` | ^5.0.0-beta.30 | **Beta** -- see SEC-14 |
| `bcryptjs` | ^3.0.3 | Current |
| `drizzle-orm` | ^0.45.1 | Current |
| `postgres` | ^3.4.8 | Current |
| `zod` | ^4.3.6 | Current |
| `react` | 19.2.3 | Current |

No known CVEs were identified for the current dependency versions at the time of this audit. However, `next-auth` beta versions should be monitored closely.

---

## Recommendations Summary (Priority Order)

| Priority | Finding | Effort |
|----------|---------|--------|
| 1 | SEC-01: Escape LIKE wildcards in search | Small |
| 2 | SEC-05: Tighten CSP (remove unsafe-eval) | Medium |
| 3 | SEC-03: Require `IP_HASH_SALT` env var | Small |
| 4 | SEC-02: Fail-closed when rate limiting unavailable | Medium |
| 5 | SEC-06: Use `null` for OAuth password hash | Small |
| 6 | SEC-04: Strengthen password policy | Small |
| 7 | SEC-13: Fix CSV formula injection | Small |
| 8 | SEC-07: Fix seed badge secret check | Small |
| 9 | SEC-08: Add UUID validation consistently | Small |
| 10 | SEC-12: Apply HTML sanitization on write | Medium |
| 11 | SEC-09: Add limit to export query | Small |
| 12 | SEC-10: Shorten JWT maxAge or add DB role check | Medium |
| 13 | SEC-14: Pin next-auth version | Small |
| 14 | SEC-19: Remove drizzle-kit push from start script | Small |
| 15 | SEC-11: Explicit cookie config | Small |
| 16 | SEC-15: Use crypto-secure random for anonymous IDs | Small |
| 17 | SEC-16: Configure structured logging | Medium |
| 18 | SEC-17: Verify production AUTH_SECRET differs | Small |
| 19 | SEC-18: Restrict CORS if adding write APIs | Small |
| 20 | SEC-20: Add rate limiting to PATCH endpoint | Small |

---

*End of security audit report.*
