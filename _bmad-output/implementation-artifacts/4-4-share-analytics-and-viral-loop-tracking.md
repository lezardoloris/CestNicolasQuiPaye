# Story 4.4: Share Analytics & Viral Loop Tracking

Status: ready-for-dev

## Story

As a **system operator**,
I want to track share button clicks and referral traffic without invasive cookies or personal data collection,
so that I can understand which submissions go viral and optimize the sharing experience while respecting user privacy (NFR12).

## Acceptance Criteria (BDD)

### AC 4.4.1: Share Events Database Table

**Given** a Drizzle migration creates the `share_events` table (if not exists),
**When** the migration runs,
**Then** the table is created with columns:
- `id` (UUID, PK, defaultRandom)
- `submission_id` (UUID, FK to submissions, not null)
- `platform` (pgEnum `share_platform`: `'twitter'` | `'facebook'` | `'whatsapp'` | `'copy_link'` | `'native'`, not null)
- `created_at` (timestamp, not null, defaultNow)
**And** no columns store user identity, IP address, cookies, or any personal data (NFR12),
**And** an index exists on `(submission_id, created_at)` for efficient querying.

### AC 4.4.2: Share Event API Endpoint

**Given** the API endpoint `POST /api/v1/share-events` exists,
**When** a request is sent with body `{ "submission_id": "<uuid>", "platform": "<platform>" }`,
**Then** a new row is inserted into the `share_events` table,
**And** the response is `201 Created` with body `{ "ok": true }`,
**And** no cookies or persistent identifiers are set on the visitor (NFR12),
**And** the endpoint is rate-limited to 30 requests per minute per IP (NFR8).

### AC 4.4.3: Share Event Validation

**Given** a `POST /api/v1/share-events` request is sent,
**When** the `submission_id` does not exist in the submissions table,
**Then** a `404 Not Found` response is returned,
**And** no row is inserted.

**Given** a `POST /api/v1/share-events` request is sent,
**When** the `platform` value is not one of the allowed enum values,
**Then** a `400 Bad Request` response is returned with validation error details.

### AC 4.4.4: UTM Parameter Referral Tracking

**Given** a visitor arrives at `/submissions/{id}` (or any page) with UTM query parameters,
**When** the page loads,
**Then** the following UTM parameters are parsed (if present):
- `utm_source` (e.g., `twitter`, `facebook`, `whatsapp`, `copy`)
- `utm_medium` (e.g., `social`, `clipboard`, `native`)
- `utm_campaign` (e.g., `submission`)
**And** a `page_views` table records: `page_path`, `utm_source`, `utm_medium`, `utm_campaign`, `created_at`,
**And** NO cookies, localStorage entries, or persistent identifiers are set on the visitor (NFR12),
**And** NO IP addresses are stored in the `page_views` table.

### AC 4.4.5: Page Views Database Table

**Given** a Drizzle migration creates the `page_views` table (if not exists),
**When** the migration runs,
**Then** the table is created with columns:
- `id` (UUID, PK, defaultRandom)
- `page_path` (varchar 500, not null)
- `utm_source` (varchar 100, nullable)
- `utm_medium` (varchar 100, nullable)
- `utm_campaign` (varchar 100, nullable)
- `referrer` (varchar 500, nullable) -- `document.referrer` value (sanitized, domain only)
- `created_at` (timestamp, not null, defaultNow)
**And** an index exists on `(page_path, created_at)` for efficient querying,
**And** no personal data columns exist (no IP, no user_id, no device fingerprint).

### AC 4.4.6: Privacy-First Analytics Integration

**Given** the platform uses privacy-respecting analytics (NFR12),
**When** analytics is configured,
**Then** one of the following cookie-free analytics tools is integrated:
- **Plausible Analytics** (self-hosted or cloud) -- preferred for its simplicity and GDPR compliance
- **Umami** (self-hosted) -- alternative if Plausible is not feasible
**And** the analytics script is loaded with a `data-domain="liberal.fr"` attribute,
**And** NO Google Analytics, Facebook Pixel, or any tracking-cookie-based analytics tool is used,
**And** the analytics tool does NOT set any cookies on visitors,
**And** the analytics tool is listed in the CSP `script-src` directive (from Story 1.1, NFR10).

### AC 4.4.7: Custom Share Events in Plausible/Umami

**Given** Plausible or Umami is integrated,
**When** a share button is clicked (from Story 4.2),
**Then** a custom event is sent to the analytics tool:
- **Plausible:** `plausible('Share', { props: { platform: '<platform>', submission_id: '<id>' } })`
- **Umami:** `umami.track('Share', { platform: '<platform>', submission_id: '<id>' })`
**And** the custom event is sent in addition to (not instead of) the `POST /api/share-events` database record.

### AC 4.4.8: Admin Dashboard - Sharing Statistics

**Given** an administrator (user with `role = 'admin'`) navigates to the admin dashboard,
**When** they view the sharing statistics section,
**Then** the following data is displayed:
- **Total shares per platform** for the last 7 days, 30 days, and all time (grouped bar chart or table)
- **Top 10 most-shared submissions** (by total share events count) with title and share count breakdown by platform
- **Referral traffic breakdown:** page views grouped by `utm_source` for the last 7 days and 30 days
**And** all data is fetched via `GET /api/v1/admin/share-stats` (admin-only endpoint).

### AC 4.4.9: Share Count on Submission Cards

**Given** a submission has share events recorded,
**When** the submission card or detail page renders,
**Then** the total share count is displayed alongside the vote count and comment count,
**And** the share count is queried efficiently (consider a `share_count` denormalized column on submissions, updated via trigger or application logic).

### AC 4.4.10: Viral Loop Metrics

**Given** the system tracks both share events and referral page views,
**When** an administrator views viral loop metrics,
**Then** the system can calculate and display:
- **Share-to-visit ratio:** (page views with utm_source) / (total share events) -- measures how many shares convert to visits
- **Most viral submissions:** ranked by (referral page views / share events) ratio
- **Platform effectiveness:** which platform drives the most return visits per share

## Tasks / Subtasks

- [ ] **Task 1: Create `share_events` table migration** (AC: 4.4.1)
  - [ ] Add `sharePlatform` pgEnum to `src/lib/db/schema.ts`: `['twitter', 'facebook', 'whatsapp', 'copy_link', 'native']`
  - [ ] Add `shareEvents` table definition to `src/lib/db/schema.ts`
  - [ ] Run `npx drizzle-kit generate` to create migration
  - [ ] Run `npx drizzle-kit migrate` to apply
  - [ ] Add composite index on `(submission_id, created_at)`

- [ ] **Task 2: Create `page_views` table migration** (AC: 4.4.5)
  - [ ] Add `pageViews` table definition to `src/lib/db/schema.ts`
  - [ ] Run `npx drizzle-kit generate` to create migration
  - [ ] Run `npx drizzle-kit migrate` to apply
  - [ ] Add composite index on `(page_path, created_at)`

- [ ] **Task 3: Create share events API endpoint** (AC: 4.4.2, 4.4.3)
  - [ ] Create `src/app/api/v1/share-events/route.ts`
  - [ ] Implement `POST` handler:
    - Validate request body with Zod schema: `{ submission_id: z.string().uuid(), platform: z.enum([...]) }`
    - Verify submission exists in database
    - Insert row into `share_events` table
    - Return 201 with `{ ok: true }`
  - [ ] Apply rate limiting: 30 requests/minute per IP via Upstash rate limiter
  - [ ] Add parameterized queries via Drizzle ORM (NFR13)

- [ ] **Task 4: Create page view tracking API endpoint** (AC: 4.4.4)
  - [ ] Create `src/app/api/v1/page-views/route.ts`
  - [ ] Implement `POST` handler:
    - Accept body: `{ page_path: string, utm_source?: string, utm_medium?: string, utm_campaign?: string, referrer?: string }`
    - Sanitize referrer to domain only (strip paths, query strings)
    - Insert row into `page_views` table
    - Return 201 with `{ ok: true }`
  - [ ] Rate limit: 60 requests/minute per IP

- [ ] **Task 5: Create client-side page view tracking hook** (AC: 4.4.4)
  - [ ] Create `src/hooks/use-page-view.ts`
  - [ ] On page mount, parse `window.location.search` for UTM parameters
  - [ ] Send `POST /api/v1/page-views` fire-and-forget
  - [ ] Extract `document.referrer` domain only
  - [ ] Do NOT set any cookies, localStorage, or sessionStorage
  - [ ] Integrate hook into the submission detail page

- [ ] **Task 6: Integrate Plausible or Umami analytics** (AC: 4.4.6, 4.4.7)
  - [ ] Choose analytics tool: Plausible (recommended) or Umami
  - [ ] **If Plausible:**
    - Add `<Script data-domain="liberal.fr" src="https://plausible.io/js/script.js" />` to root layout
    - Or self-hosted: point to self-hosted Plausible instance
    - Create `src/lib/analytics.ts` with `trackEvent(name: string, props?: Record<string, string>)` wrapper
    - Update CSP `script-src` to include `plausible.io` or self-hosted domain
  - [ ] **If Umami:**
    - Add `<Script data-website-id="xxx" src="https://analytics.liberal.fr/umami.js" />` to root layout
    - Create `src/lib/analytics.ts` with `trackEvent` wrapper for `umami.track()`
    - Update CSP `script-src` to include Umami domain
  - [ ] Add `NEXT_PUBLIC_ANALYTICS_DOMAIN` to `.env.example`
  - [ ] Ensure NO cookies are set by the analytics tool (verify with browser DevTools)

- [ ] **Task 7: Wire custom share events to analytics** (AC: 4.4.7)
  - [ ] In `src/hooks/use-share.ts` (from Story 4.2), add call to `trackEvent('Share', { platform, submission_id })` alongside the `POST /api/share-events` call
  - [ ] Both calls are fire-and-forget (do not block share action)

- [ ] **Task 8: Add share_count to submissions** (AC: 4.4.9)
  - [ ] Add `shareCount` integer column (default 0) to submissions table in schema
  - [ ] Create migration for the new column
  - [ ] After inserting a share event (Task 3), increment `submissions.shareCount` via `UPDATE submissions SET share_count = share_count + 1 WHERE id = ?`
  - [ ] Display share count in SubmissionCard and SubmissionDetail components

- [ ] **Task 9: Create admin share stats API endpoint** (AC: 4.4.8, 4.4.10)
  - [ ] Create `src/app/api/v1/admin/share-stats/route.ts`
  - [ ] Implement `GET` handler (admin-only via auth middleware):
    - Total shares per platform (7d, 30d, all time) -- `GROUP BY platform`
    - Top 10 most-shared submissions -- `GROUP BY submission_id ORDER BY count DESC LIMIT 10`
    - Referral breakdown by utm_source (7d, 30d) -- `GROUP BY utm_source`
    - Share-to-visit ratio per platform
  - [ ] Return structured JSON response
  - [ ] Require admin role authentication

- [ ] **Task 10: Write tests** (AC: all)
  - [ ] Unit test: Zod validation schema for share-events endpoint
  - [ ] Integration test: `POST /api/v1/share-events` creates record and returns 201
  - [ ] Integration test: `POST /api/v1/share-events` returns 404 for invalid submission_id
  - [ ] Integration test: `POST /api/v1/share-events` returns 400 for invalid platform
  - [ ] Integration test: `POST /api/v1/page-views` creates record with UTM params
  - [ ] Integration test: `GET /api/v1/admin/share-stats` returns correct aggregations
  - [ ] Integration test: `GET /api/v1/admin/share-stats` returns 403 for non-admin users
  - [ ] Unit test: referrer sanitization (strips paths, keeps domain only)
  - [ ] Unit test: UTM parameter parsing
  - [ ] Unit test: `trackEvent` wrapper correctly calls Plausible/Umami API
  - [ ] Component test: share count displays correctly on SubmissionCard

## Dev Notes

### Architecture

- **Privacy-first analytics (NFR12):** This is a CRITICAL non-functional requirement. The platform MUST NOT use Google Analytics, Facebook Pixel, or any cookie-based tracking. Plausible or Umami are the only approved analytics tools. Both are GDPR-compliant by design and do not set cookies.
- **Two-layer tracking:** The system uses both:
  1. **Internal database tracking** (`share_events` + `page_views` tables) -- for detailed submission-level analytics
  2. **External privacy-respecting analytics** (Plausible/Umami) -- for general site traffic, bounce rates, geographic distribution
- **No user identification in analytics:** Share events and page views are ANONYMOUS. No user_id, no IP address, no device fingerprint. Only the action, platform, timestamp, and submission reference are stored.
- **Fire-and-forget pattern:** All analytics calls (both internal API and Plausible/Umami) must be non-blocking. The user's share action must complete regardless of analytics success.
- **Denormalized share count:** `submissions.shareCount` is incremented on each share event for efficient display. This avoids a `COUNT(*)` query on `share_events` for every card render.

### Tech Stack

- **Next.js** 16.1.6 (App Router, Route Handlers, Client Hooks)
- **Drizzle ORM** 0.45.1 for database operations and migrations
- **Zod** for request body validation
- **Upstash Redis** for rate limiting on analytics endpoints
- **Plausible Analytics** (preferred) or **Umami** -- cookie-free, GDPR-compliant
- **TypeScript** 5.7.x

### Key Files to Create/Modify

| Action | File Path | Purpose |
|--------|-----------|---------|
| MODIFY | `src/lib/db/schema.ts` | Add `shareEvents`, `pageViews` tables, `sharePlatform` enum, `shareCount` column |
| CREATE | `src/app/api/v1/share-events/route.ts` | POST endpoint for share event recording |
| CREATE | `src/app/api/v1/page-views/route.ts` | POST endpoint for page view recording |
| CREATE | `src/app/api/v1/admin/share-stats/route.ts` | GET endpoint for admin share statistics |
| CREATE | `src/lib/analytics.ts` | Plausible/Umami wrapper: `trackEvent()` function |
| CREATE | `src/hooks/use-page-view.ts` | Client-side page view tracking hook |
| MODIFY | `src/hooks/use-share.ts` | Add analytics tracking call alongside share events |
| MODIFY | `src/app/layout.tsx` | Add Plausible/Umami analytics script |
| MODIFY | `src/components/features/submissions/SubmissionCard.tsx` | Display share count |
| MODIFY | `src/components/features/submissions/SubmissionDetail.tsx` | Display share count |
| MODIFY | `.env.example` | Add analytics environment variables |
| CREATE | `src/lib/db/migrations/xxxx_share_events.sql` | Generated migration file |
| CREATE | `src/lib/db/migrations/xxxx_page_views.sql` | Generated migration file |

### Database Schema

```typescript
// Add to src/lib/db/schema.ts

export const sharePlatform = pgEnum('share_platform', ['twitter', 'facebook', 'whatsapp', 'copy_link', 'native']);

export const shareEvents = pgTable('share_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id),
  platform: sharePlatform('platform').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  submissionCreatedIdx: index('share_events_submission_created_idx').on(table.submissionId, table.createdAt),
}));

export const pageViews = pgTable('page_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  pagePath: varchar('page_path', { length: 500 }).notNull(),
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 100 }),
  referrer: varchar('referrer', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  pagePathCreatedIdx: index('page_views_page_path_created_idx').on(table.pagePath, table.createdAt),
}));

// Add to submissions table:
// shareCount: integer('share_count').notNull().default(0),
```

### Analytics Wrapper

```typescript
// src/lib/analytics.ts
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
    umami?: { track: (event: string, data?: Record<string, string>) => void };
  }
}

export function trackEvent(name: string, props?: Record<string, string>): void {
  try {
    // Plausible
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible(name, { props });
      return;
    }
    // Umami
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track(name, props);
      return;
    }
  } catch {
    // Silently fail -- analytics should never break the app
  }
}
```

### Testing Strategy

- **Unit tests (Vitest):**
  - Zod validation schemas: valid/invalid payloads for share-events and page-views
  - Referrer sanitization: `https://t.co/abc?ref=1` -> `t.co`
  - UTM parsing: extract utm_source, utm_medium, utm_campaign from URL search params
  - `trackEvent` wrapper: mock `window.plausible`, verify correct call signature
- **Integration tests (Vitest):**
  - POST share-events: assert 201 response, verify DB record created
  - POST share-events with bad submission_id: assert 404
  - POST share-events with bad platform: assert 400
  - POST page-views with UTM params: assert DB record with correct values
  - GET admin/share-stats: mock DB data, verify aggregation logic
  - GET admin/share-stats without admin role: assert 403
- **E2E tests (Playwright):**
  - Click share button, verify POST to `/api/v1/share-events` is sent
  - Navigate with UTM params, verify page view recorded

### UX Design Alignment

- **Privacy-first:** No cookie consent banner needed for analytics (Plausible/Umami are cookie-free). This aligns with the GDPR/RGPD compliance requirements and improves UX by eliminating consent popups.
- **Share count display:** Show share count alongside vote count and comment count on SubmissionCard -- follows the existing card information hierarchy (title > cost > votes > comments > shares)
- **No user-facing analytics:** Analytics are admin-only. Nicolas never sees tracking UI or feels tracked.

### Dependencies

- **Requires (from other stories):**
  - Story 4.2 (share buttons that fire share events -- this story creates the backend they report to)
  - Story 2.1 (submissions table: FK reference for share_events)
  - Story 1.1 (project scaffold, CSP headers to whitelist analytics domain)
  - Story 1.2 (auth/role system for admin-only endpoints)
- **Required by (other stories):**
  - Story 6.4 (admin dashboard may consume share stats for broadcast decisions)

### References

- [Source: architecture.md - Section 2.1 Technology Manifest] Plausible/Umami as approved analytics
- [Source: architecture.md - Section 3.2 Schema Design] Database schema patterns with Drizzle ORM
- [Source: architecture.md - Section 3.3 API Routes] Rate limiting patterns with Upstash
- [Source: architecture.md - Section 5 File Structure] API route and hook file locations
- [Source: architecture.md - Section 7.3 Naming] Hook and utility naming conventions
- [Source: epics.md - Story 4.4] Complete acceptance criteria
- [Source: prd.md - NFR12] "No user tracking cookies without explicit consent; analytics via a privacy-respecting, cookie-free tool"
- [Source: prd.md - GDPR/RGPD Compliance] "Cookie consent: essential only for MVP; analytics via privacy-respecting tools (Plausible or Umami)"
- [Source: prd.md - Success Criteria] ">20% of visitors share at least one item" -- share analytics measure this KPI

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

(none yet)

### Completion Notes List

(none yet)

### File List

(populated during implementation)
