# Story 6.4: Twitter/X Broadcast Tool

Status: ready-for-dev

## Story

As an administrator,
I want to select top-voted submissions for broadcast via the @LIBERAL_FR Twitter/X account,
so that the most impactful fiscal outrages reach a wider audience and drive viral engagement.

## Acceptance Criteria

1. **Given** an administrator navigates to `/admin/broadcast`, **When** the broadcast page renders, **Then** a list of approved submissions is displayed sorted by score descending, each showing: title, score (upvotes - downvotes), estimated cost (EUR formatted), cost per citizen, and a "Selectionner pour diffusion" button. Submissions already broadcast have a "Deja diffuse" badge with the broadcast date. (FR30)

2. **Given** a Drizzle migration creates the `broadcasts` table (if not exists) with columns: `id` (UUID PK), `submission_id` (UUID FK to submissions, not null), `admin_user_id` (UUID FK to users, not null), `tweet_text` (text, not null), `tweet_url` (text, nullable), `status` (enum: `'draft'` | `'sent'` | `'failed'`, default `'draft'`), `created_at` (timestamp), `sent_at` (timestamp, nullable), **When** the migration runs, **Then** the table is created.

3. **Given** an administrator clicks "Selectionner pour diffusion" on a submission, **When** the broadcast composer opens, **Then** a pre-filled tweet text is generated: `"{title}\n\nCout pour chaque Francais : {cost_per_citizen} EUR\n\n{submission_url}\n\n#LIBERAL #GaspillagePublic #ChaqueEuroCompte"`, the administrator can edit the tweet text (max 280 chars with a live character counter), and the auto-generated share image is displayed as a preview.

4. **Given** the administrator clicks "Publier sur @LIBERAL_FR", **When** the tweet is sent via the Twitter/X API v2 (using stored OAuth 2.0 credentials), **Then** the broadcast's `status` is updated to `'sent'`, `tweet_url` is populated with the live tweet URL, `sent_at` is set to current timestamp, and a success toast displays "Tweet publie avec succes !".

5. **Given** the Twitter/X API is unavailable or returns an error, **When** the broadcast attempt fails, **Then** the broadcast's `status` is updated to `'failed'`, an error toast displays "Erreur lors de la publication. Reessayez.", and the administrator can retry the broadcast.

6. **Given** a non-admin user attempts to access `/admin/broadcast`, **When** the server checks authorization, **Then** a `403 Forbidden` response is returned and the user is redirected to `/feed/hot`. (Broadcast is admin-only, not moderator-accessible.)

7. **Given** an administrator views the broadcast page, **When** broadcast history is displayed, **Then** a "Historique" section shows previously sent broadcasts with: tweet text (truncated), tweet URL (clickable), submission title, sent date, and status badge (sent/failed).

## Tasks / Subtasks

- [ ] Task 1: Create `broadcasts` table schema and migration (AC: #2)
  - [ ] 1.1: Add `broadcastStatus` pgEnum with values `['draft', 'sent', 'failed']` to `src/lib/db/schema.ts`
  - [ ] 1.2: Add `broadcasts` table to `src/lib/db/schema.ts`:

```typescript
export const broadcasts = pgTable('broadcasts', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id),
  adminUserId: uuid('admin_user_id').notNull().references(() => users.id),
  tweetText: text('tweet_text').notNull(),
  tweetUrl: text('tweet_url'),
  status: broadcastStatus('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  sentAt: timestamp('sent_at'),
});
```

  - [ ] 1.3: Add indexes: `CREATE INDEX idx_broadcasts_submission ON broadcasts (submission_id)` and `CREATE INDEX idx_broadcasts_status ON broadcasts (status, sent_at DESC)`
  - [ ] 1.4: Run `npx drizzle-kit generate` and `npx drizzle-kit migrate`

- [ ] Task 2: Create Twitter/X API v2 integration service (AC: #4, #5)
  - [ ] 2.1: Create `src/lib/twitter/client.ts` -- Twitter/X API v2 client using OAuth 2.0 User Context (for posting tweets on behalf of @LIBERAL_FR). Use native `fetch` with `Authorization: Bearer` header. No SDK dependency needed for tweet posting
  - [ ] 2.2: Implement `postTweet(text: string, mediaId?: string): Promise<{ tweetId: string; tweetUrl: string }>` function. POST to `https://api.twitter.com/2/tweets` with JSON body `{ text }`. Parse response for tweet ID, construct URL as `https://twitter.com/LIBERAL_FR/status/{tweetId}`
  - [ ] 2.3: Implement error handling: catch network errors, API rate limits (429), auth failures (401/403), and generic errors. Return structured error with Twitter error code and message
  - [ ] 2.4: Add environment variables to `.env.example`:
    - `TWITTER_API_KEY` -- API Key (consumer key)
    - `TWITTER_API_SECRET` -- API Secret (consumer secret)
    - `TWITTER_ACCESS_TOKEN` -- Access Token for @LIBERAL_FR
    - `TWITTER_ACCESS_TOKEN_SECRET` -- Access Token Secret for @LIBERAL_FR
    - `TWITTER_BEARER_TOKEN` -- Bearer Token (for app-only auth if needed)
  - [ ] 2.5: Create `src/lib/twitter/types.ts` -- TypeScript types for Twitter API v2 responses

```typescript
// src/lib/twitter/client.ts
export interface TwitterPostResult {
  success: boolean;
  tweetId?: string;
  tweetUrl?: string;
  error?: string;
}

export async function postTweet(text: string): Promise<TwitterPostResult> {
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      // For user-context posting, use OAuth 1.0a signature instead
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { success: false, error: error.detail || 'Twitter API error' };
  }

  const data = await response.json();
  const tweetId = data.data.id;
  return {
    success: true,
    tweetId,
    tweetUrl: `https://twitter.com/LIBERAL_FR/status/${tweetId}`,
  };
}
```

  - [ ] 2.6: Note: For OAuth 1.0a user-context posting (required to tweet as @LIBERAL_FR), consider using `twitter-api-v2` npm package or implementing OAuth 1.0a signature manually. The architecture mentions Twitter/X API v2 OAuth. Evaluate whether `twitter-api-v2` package is appropriate or if manual OAuth header signing is preferred for minimal dependencies

- [ ] Task 3: Create broadcast API endpoints (AC: #1, #3, #4, #5, #7)
  - [ ] 3.1: Create `GET /api/v1/broadcast` route at `src/app/api/v1/broadcast/route.ts` -- returns approved submissions sorted by score DESC, joined with broadcasts table to include broadcast status/date. Admin-only access. Includes flag for "already broadcast" submissions
  - [ ] 3.2: Create `POST /api/v1/broadcast` route at `src/app/api/v1/broadcast/route.ts` -- accepts `{ submission_id: string, tweet_text: string }`. Validates tweet_text <= 280 chars. Creates broadcast row with status `'draft'`, calls Twitter API `postTweet()`, updates status to `'sent'` (+ tweet_url, sent_at) or `'failed'`. Admin-only access
  - [ ] 3.3: Create `POST /api/v1/broadcast/[id]/retry` route at `src/app/api/v1/broadcast/[id]/retry/route.ts` -- retries a failed broadcast. Loads existing broadcast row, re-calls Twitter API, updates status. Admin-only
  - [ ] 3.4: Create `GET /api/v1/broadcast/history` route at `src/app/api/v1/broadcast/history/route.ts` -- returns broadcast history sorted by `created_at DESC`, joined with submission for title. Admin-only
  - [ ] 3.5: Add Zod validation: `broadcastSchema = z.object({ submission_id: z.string().uuid(), tweet_text: z.string().min(1).max(280) })` to `src/lib/utils/validation.ts`

- [ ] Task 4: Create broadcast page and components (AC: #1, #3, #4, #5, #7)
  - [ ] 4.1: Create `src/app/(app)/admin/broadcast/page.tsx` -- Server Component page rendering broadcast tool
  - [ ] 4.2: Create `src/components/features/admin/BroadcastTool.tsx` -- Client Component (referenced in architecture as `AdminBroadcast`). Two sections: "Submissions a diffuser" (submission list) and "Historique" (broadcast history). Uses TanStack Query for data fetching
  - [ ] 4.3: Create `src/components/features/admin/BroadcastComposer.tsx` -- Modal/panel component for tweet composition. Shows pre-filled tweet text with live character counter (280 max, color changes at 260+). Shows preview of share image (from OG image generation at `/api/og/[id]`). "Publier sur @LIBERAL_FR" button (primary/destructive -- posting is irreversible). "Annuler" button
  - [ ] 4.4: Create `src/components/features/admin/BroadcastHistory.tsx` -- List of past broadcasts with status badges: "Envoye" (green), "Echoue" (red), "Brouillon" (grey). Clickable tweet URL for sent broadcasts. "Reessayer" button for failed broadcasts
  - [ ] 4.5: Implement tweet text auto-generation from submission data:

```typescript
function generateTweetText(submission: Submission, costPerCitizen: string): string {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/s/${submission.id}/${submission.slug}`;
  const template = `${submission.title}\n\nCout pour chaque Francais : ${costPerCitizen} EUR\n\n${url}\n\n#LIBERAL #GaspillagePublic #ChaqueEuroCompte`;
  return template.slice(0, 280);
}
```

- [ ] Task 5: Write tests (AC: all)
  - [ ] 5.1: Unit test `src/lib/twitter/client.test.ts` -- mock fetch, test successful tweet posting, test error handling (429, 401, network), test response parsing
  - [ ] 5.2: Unit test `src/components/features/admin/BroadcastComposer.test.tsx` -- renders pre-filled text, character counter works, validates 280 limit, shows preview image
  - [ ] 5.3: Unit test `src/components/features/admin/BroadcastTool.test.tsx` -- renders submission list sorted by score, shows "Deja diffuse" badge, opens composer on select
  - [ ] 5.4: Unit test `src/components/features/admin/BroadcastHistory.test.tsx` -- renders history items, shows correct status badges, retry button for failed
  - [ ] 5.5: API route test `__tests__/api/broadcast.test.ts` -- tests POST creates broadcast and calls Twitter API, tests retry logic, tests 403 for non-admin (moderators cannot broadcast), tests GET returns sorted submissions with broadcast status

## Dev Notes

### Architecture Patterns

- **Admin-Only Access**: Broadcast tool is accessible only to `admin` role (not moderator). This is because posting to the official @LIBERAL_FR account is a high-privilege action.

```typescript
const session = await auth();
if (!session?.user || session.user.role !== 'admin') {
  return apiError('FORBIDDEN', 'Only administrators can broadcast', 403);
}
```

- **Twitter/X API v2 Integration**: The architecture specifies Twitter/X API v2 for posting. Use OAuth 1.0a User Context authentication (required for posting tweets on behalf of a specific user account). The four OAuth tokens (API Key, API Secret, Access Token, Access Token Secret) are stored as environment variables.

- **Component Architecture** (from architecture doc): `AdminBroadcast` is listed as a Client Component with "Form with API calls" rendering strategy. Corresponds to `BroadcastTool.tsx`.

- **Share Image Preview**: The broadcast composer should display the auto-generated OG image from the existing `/api/og/[id]` route (Vercel OG image generation). This image is also the one that will appear when the tweet is shared.

### Tech Stack

| Tech | Version | Usage in This Story |
|---|---|---|
| Next.js | 16.1.6 | App Router, API routes |
| Auth.js v5 | 5.x | `auth()` for admin role check |
| Drizzle ORM | 0.45.1 | Schema, queries, migrations |
| TanStack Query | 5.90.x | Client data fetching, mutations |
| Twitter/X API v2 | v2 | Tweet posting via REST |
| Vitest | 4.0.18 | Unit + API route tests |
| shadcn/ui | 2026-02 | Dialog, Button, Badge, Textarea, Toast |

### Twitter/X API v2 Details

**Endpoint**: `POST https://api.twitter.com/2/tweets`

**Authentication**: OAuth 1.0a User Context (to tweet as @LIBERAL_FR account). Requires generating an OAuth signature for each request using the four tokens.

**Request body**:
```json
{
  "text": "Tweet content here (max 280 chars)"
}
```

**Response (success)**:
```json
{
  "data": {
    "id": "1234567890",
    "text": "Tweet content here"
  }
}
```

**Rate limits**: 200 tweets per 15-minute window (user context). More than sufficient for admin broadcast use case.

**Important considerations**:
- Twitter Free tier allows 1,500 tweets/month -- sufficient for daily broadcast
- Twitter Basic tier ($100/month) allows 3,000 tweets/month if needed
- Media attachment (share image) requires separate upload: `POST https://upload.twitter.com/1.1/media/upload.json` (v1.1 endpoint, still required for media)
- Consider implementing media upload in a future iteration; start with text-only tweets that include the submission URL (Twitter will auto-generate a card from OG meta tags)

### Environment Variables

```env
# Twitter/X API v2 credentials for @LIBERAL_FR
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
TWITTER_BEARER_TOKEN=your_bearer_token
```

### Database Schema

```typescript
// Add to src/lib/db/schema.ts

export const broadcastStatus = pgEnum('broadcast_status', ['draft', 'sent', 'failed']);

export const broadcasts = pgTable('broadcasts', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id),
  adminUserId: uuid('admin_user_id').notNull().references(() => users.id),
  tweetText: text('tweet_text').notNull(),
  tweetUrl: text('tweet_url'),
  status: broadcastStatus('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  sentAt: timestamp('sent_at'),
});
```

### Key Indexes

```sql
CREATE INDEX idx_broadcasts_submission ON broadcasts (submission_id);
CREATE INDEX idx_broadcasts_status ON broadcasts (status, sent_at DESC);
```

### Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `src/lib/db/schema.ts` | MODIFY | Add `broadcastStatus` enum, `broadcasts` table |
| `src/lib/db/migrations/XXXX_broadcasts.sql` | CREATE (via drizzle-kit) | Migration |
| `src/lib/twitter/client.ts` | CREATE | Twitter API v2 client |
| `src/lib/twitter/types.ts` | CREATE | Twitter API types |
| `src/lib/utils/validation.ts` | MODIFY | Add `broadcastSchema` |
| `.env.example` | MODIFY | Add Twitter API env vars |
| `src/app/api/v1/broadcast/route.ts` | CREATE | GET submissions, POST broadcast |
| `src/app/api/v1/broadcast/[id]/retry/route.ts` | CREATE | POST retry failed broadcast |
| `src/app/api/v1/broadcast/history/route.ts` | CREATE | GET broadcast history |
| `src/app/(app)/admin/broadcast/page.tsx` | CREATE | Broadcast tool page |
| `src/components/features/admin/BroadcastTool.tsx` | CREATE | Main broadcast UI |
| `src/components/features/admin/BroadcastComposer.tsx` | CREATE | Tweet composer modal |
| `src/components/features/admin/BroadcastHistory.tsx` | CREATE | History list |
| `src/lib/twitter/client.test.ts` | CREATE | Twitter client tests |
| `src/components/features/admin/BroadcastComposer.test.tsx` | CREATE | Component tests |
| `src/components/features/admin/BroadcastTool.test.tsx` | CREATE | Component tests |
| `src/components/features/admin/BroadcastHistory.test.tsx` | CREATE | Component tests |
| `__tests__/api/broadcast.test.ts` | CREATE | API route tests |

### Testing Strategy

- **Unit tests** (Vitest): Twitter client with mocked `fetch` -- test success, 429 rate limit, 401 auth error, network failure. BroadcastComposer character counter, pre-filled text, validation. BroadcastTool list rendering and sorting. BroadcastHistory status badges and retry.
- **API route tests** (Vitest): Mock `auth()` for admin role, mock Twitter client. Test POST creates broadcast and calls Twitter. Test retry updates status. Test 403 for non-admin. Test GET returns correct data.
- **No E2E for Twitter**: Twitter API calls are mocked in all tests. Real posting is only possible in production with valid credentials.
- **Coverage targets**: lib/twitter > 90%, Components > 70%, API routes > 85%

### UX Notes

- Submission list uses `Card` components with score prominently displayed
- "Deja diffuse" badge uses `Badge` variant with green color and broadcast date
- Tweet composer shows live character counter: green (0-259), amber (260-279), red (280)
- Share image preview loads from `/api/og/{submission_id}` and displays at Twitter card dimensions
- "Publier sur @LIBERAL_FR" button is prominent and uses the primary chainsaw-red color
- Loading state during tweet posting: button shows spinner, disabled state
- Success state: confetti or checkmark animation, link to live tweet
- Error state: red alert with error message and "Reessayer" button
- Broadcast history uses alternating row colors for readability

### Dependencies

- **Requires**: Story 6.1 (admin layout with RBAC)
- **Requires**: Epic 2 (submissions with scores, Cost to Nicolas calculations)
- **Requires**: Epic 4 (OG image generation at `/api/og/[id]` for share image preview)
- **External**: Twitter/X API v2 credentials for @LIBERAL_FR account (configured via environment variables)
- **Blocks**: Story 6.5 (dashboard shows broadcast count)

### Project Structure Notes

- Twitter client library lives at `src/lib/twitter/` (new directory)
- Broadcast page at `src/app/(app)/admin/broadcast/page.tsx` per architecture file tree
- Broadcast components at `src/components/features/admin/` following established pattern
- Environment variables for Twitter API must be added to `.env.example` and documented

### References

- [Source: epics.md#Story 6.4 -- Full AC and story statement, broadcasts table schema]
- [Source: architecture.md#Technology Version Manifest -- Twitter/X API v2]
- [Source: architecture.md#Section 5 -- /admin/broadcast page in file tree]
- [Source: architecture.md#Frontend Architecture -- AdminBroadcast as Client Component]
- [Source: architecture.md#FR31 mapping -- BroadcastTool admin component + Twitter API v2]
- [Source: prd.md#FR30 -- Admin select top-voted submissions for @LIBERAL_FR broadcast]
- [Source: prd.md#MVP Feature 5 -- @LIBERAL_FR Twitter/X Feed description]
- [Source: ux-design-specification.md#Journey 4 -- Admin broadcast flow: select, compose, schedule]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
