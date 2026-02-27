# Story 4.1: Auto-Generated Shareable Image (OG Image)

Status: ready-for-dev

## Story

As a **system**,
I want to auto-generate a branded PNG image for each approved submission,
so that shares on social media display a compelling visual preview with LIBERAL branding and the "Cost to Nicolas" breakdown.

## Acceptance Criteria (BDD)

### AC 4.1.1: OG Image Generation Endpoint

**Given** a submission with `status = 'approved'` exists in the database,
**When** the image generation endpoint `GET /api/og/[id]` is called with the submission's UUID,
**Then** a PNG image is returned with:
- HTTP status 200
- `Content-Type: image/png`
- Dimensions exactly 1200x630 pixels (Open Graph standard)
- Response time under 3 seconds (NFR4)

### AC 4.1.2: Image Visual Content & Brand Identity

**Given** the OG image is generated for a submission,
**When** the image renders,
**Then** the image contains ALL of the following elements:
- **Background:** Dark background `#0A0A0B` (brand `bg-dark`)
- **Top-left:** LIBERAL wordmark/logo rendered in `chainsaw-red` (#DC2626) using Space Grotesk font
- **Chainsaw icon:** SVG chainsaw icon adjacent to the logo (from `public/chainsaw-icon.svg`)
- **Title:** Submission title in white (#F5F5F5) text, truncated to 100 characters with ellipsis if needed, rendered in Space Grotesk Bold
- **Cost amount:** Estimated cost in large, bold text formatted as "XX XXX XXX EUR" (French number formatting with space separators) rendered in `chainsaw-red` (#DC2626) using Space Grotesk
- **Cost to Nicolas summary:** "Coute pour chaque Francais : X,XX EUR" in white (#F5F5F5) text using Inter font
- **Footer:** "liberal.fr" URL text and the platform tagline, rendered in `text-secondary` (#A3A3A3)
- **Red accent line:** A horizontal `chainsaw-red` (#DC2626) divider separating the cost section from the footer

### AC 4.1.3: Serverless-Compatible Generation

**Given** the image generation uses `@vercel/og` (Satori-based `ImageResponse`),
**When** the image is generated,
**Then** no headless browser is required (Edge Runtime compatible),
**And** the route handler uses `export const runtime = 'edge'`,
**And** fonts are loaded via `fetch` from the `public/fonts/` directory (Space Grotesk Bold, Inter Regular).

### AC 4.1.4: Image Caching

**Given** an OG image has been generated for a submission,
**When** the same endpoint is called again for the same submission,
**Then** the response includes `Cache-Control: public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400` headers,
**And** CDN (Cloudflare/Vercel Edge) serves the cached version instantly,
**And** the `submissions.og_image_url` column stores the generated image URL.

### AC 4.1.5: Cache Invalidation on Update

**Given** a submission's title or estimated cost is updated (via admin edit or author edit within the 15-minute window),
**When** the OG image is requested again,
**Then** the cached image is invalidated (via URL versioning with `?v={updatedAt timestamp}` query parameter),
**And** a fresh image is generated with the updated content.

### AC 4.1.6: Error Handling

**Given** a request is made to `GET /api/og/[id]` with a non-existent or non-approved submission ID,
**When** the endpoint processes the request,
**Then** a 404 response is returned,
**And** a default fallback OG image (`public/og-default.png`) path is suggested for meta tag usage.

### AC 4.1.7: Share Text Template

**Given** an OG image is generated for sharing purposes,
**When** the share text is composed (used by Story 4.2 share buttons),
**Then** the canonical share text template is:
```
[Title] coute [X]EUR par an a chaque contribuable francais. #CostToNicolas #LIBERAL [URL]
```

## Tasks / Subtasks

- [ ] **Task 1: Install @vercel/og dependency** (AC: 4.1.3)
  - [ ] Run `npm install @vercel/og`
  - [ ] Verify compatibility with Next.js 16.1.6

- [ ] **Task 2: Add font files to public directory** (AC: 4.1.2, 4.1.3)
  - [ ] Download Space Grotesk Bold (`.woff`/`.ttf`) to `public/fonts/SpaceGrotesk-Bold.ttf`
  - [ ] Download Inter Regular (`.woff`/`.ttf`) to `public/fonts/Inter-Regular.ttf`
  - [ ] Ensure font files are available for `fetch()` at Edge Runtime

- [ ] **Task 3: Create the OG image Route Handler** (AC: 4.1.1, 4.1.2, 4.1.3)
  - [ ] Create file `src/app/api/og/[id]/route.tsx`
  - [ ] Set `export const runtime = 'edge'`
  - [ ] Import `ImageResponse` from `@vercel/og`
  - [ ] Implement `GET` handler that:
    - Extracts `id` (UUID) from route params
    - Fetches submission data from database (title, amount, costPerTaxpayer, consequenceText)
    - Validates submission exists and `status = 'approved'` (or `moderationStatus = 'approved'`)
    - Returns 404 for missing/unapproved submissions
    - Loads Space Grotesk Bold and Inter Regular fonts via `fetch(new URL(...))`
    - Returns `new ImageResponse(...)` with JSX layout
  - [ ] Implement the JSX image layout with exact visual spec:
    - Root `div`: 1200x630, `backgroundColor: '#0A0A0B'`, `display: 'flex'`, `flexDirection: 'column'`
    - Logo area: LIBERAL text in `#DC2626`, `fontFamily: 'Space Grotesk'`, chainsaw SVG icon
    - Title area: submission title in `#F5F5F5`, `fontSize: 40`, `fontFamily: 'Space Grotesk'`, truncated to 100 chars
    - Cost amount: formatted EUR value in `#DC2626`, `fontSize: 56`, `fontWeight: 'bold'`
    - Cost to Nicolas line: "Coute pour chaque Francais : X,XX EUR" in `#F5F5F5`, `fontSize: 24`, `fontFamily: 'Inter'`
    - Red divider: `height: 3`, `backgroundColor: '#DC2626'`
    - Footer: "liberal.fr" in `#A3A3A3`, `fontSize: 18`

- [ ] **Task 4: Implement French number formatting utility** (AC: 4.1.2)
  - [ ] Add/extend `src/lib/utils/format.ts` with `formatEurFr(amount: number): string` function
  - [ ] Format with French locale: space as thousands separator, comma as decimal separator (e.g., "346 000 000 EUR")
  - [ ] Add unit tests for formatting edge cases (decimals, large numbers, zero)

- [ ] **Task 5: Set Cache-Control headers** (AC: 4.1.4)
  - [ ] Add `Cache-Control` header to successful responses: `public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400`
  - [ ] Store generated image URL in `submissions.og_image_url` column after generation

- [ ] **Task 6: Implement cache invalidation via URL versioning** (AC: 4.1.5)
  - [ ] Append `?v={submission.updatedAt.getTime()}` to OG image URLs in meta tags
  - [ ] Ensure `updatedAt` is refreshed on any submission edit

- [ ] **Task 7: Create default fallback OG image** (AC: 4.1.6)
  - [ ] Design and save `public/og-default.png` (1200x630) with LIBERAL branding
  - [ ] Dark background, logo, tagline "Plateforme citoyenne de responsabilite fiscale"

- [ ] **Task 8: Write tests** (AC: all)
  - [ ] Unit test: `formatEurFr` formatting function with various inputs
  - [ ] Integration test: `GET /api/og/[id]` returns PNG with correct Content-Type for valid submission
  - [ ] Integration test: `GET /api/og/[id]` returns 404 for non-existent submission
  - [ ] Integration test: `GET /api/og/[id]` returns 404 for non-approved submission
  - [ ] Integration test: Response includes correct Cache-Control headers
  - [ ] E2E test: verify OG image renders in social media debugger format (optional, manual)

## Dev Notes

### Architecture

- **Route pattern:** `src/app/api/og/[id]/route.tsx` -- Next.js App Router Route Handler (NOT a page)
- **Runtime:** Edge Runtime (`export const runtime = 'edge'`) for fast cold starts and global distribution
- **Library:** `@vercel/og` uses Satori under the hood to convert JSX to SVG, then renders to PNG via WASM-based resvg. No headless browser needed.
- **Database access from Edge:** Edge Runtime has limited Node.js API access. Use either:
  - Direct `fetch()` to an internal API endpoint that queries the DB
  - Or use a Neon/Vercel Postgres serverless driver compatible with Edge
  - Architecture specifies `postgres` (postgres.js) which supports Edge via `@neondatabase/serverless` adapter if needed
- **Submissions schema** already has `ogImageUrl: text('og_image_url')` column defined in `src/lib/db/schema.ts`

### Tech Stack

- **Next.js** 16.1.6 (App Router, Route Handlers)
- **@vercel/og** (latest) -- `ImageResponse` API
- **Satori** (bundled with @vercel/og) -- JSX-to-SVG engine
- **Fonts:** Space Grotesk (display/headings), Inter (body text) -- loaded as ArrayBuffer via fetch
- **Drizzle ORM** 0.45.1 for DB queries
- **TypeScript** 5.7.x

### Key Files to Create/Modify

| Action | File Path | Purpose |
|--------|-----------|---------|
| CREATE | `src/app/api/og/[id]/route.tsx` | OG image generation Route Handler |
| MODIFY | `src/lib/utils/format.ts` | Add `formatEurFr()` French number formatter |
| CREATE | `public/fonts/SpaceGrotesk-Bold.ttf` | Space Grotesk Bold font file |
| CREATE | `public/fonts/Inter-Regular.ttf` | Inter Regular font file |
| CREATE | `public/og-default.png` | Default/fallback OG image (1200x630) |
| MODIFY | `src/lib/db/schema.ts` | `ogImageUrl` column already exists; verify migration |
| CREATE | `src/app/api/og/[id]/route.test.tsx` | Integration tests |
| CREATE/MODIFY | `src/lib/utils/format.test.ts` | Unit tests for EUR formatting |

### Testing Strategy

- **Unit tests (Vitest):** `formatEurFr()` with edge cases (0, negatives, large numbers, decimals)
- **Integration tests (Vitest):** Mock database, call route handler, assert PNG response with correct headers
- **Manual verification:** Use Twitter Card Validator and Facebook Sharing Debugger to verify image renders correctly at 1200x630
- **Performance:** Verify generation time < 3 seconds via test timing assertions
- **Visual testing (optional):** Snapshot test comparing generated image output

### UX Design Alignment

- **Colors:** Dark background `#0A0A0B`, Chainsaw Red `#DC2626` accents, white `#F5F5F5` text, muted `#A3A3A3` footer
- **Fonts:** Space Grotesk for headings/logo/cost amount; Inter for body text/descriptions
- **Visual hierarchy:** Logo/brand > Title > Cost amount (largest/red) > Cost to Nicolas > Footer
- **The card is the product** -- per UX spec, the shareable consequence card is what spreads. It must be visually distinctive, emotionally impactful, and instantly readable at thumbnail size.
- **ConsequenceCard variants:** This implements the "share card" variant optimized for social media image generation (per UX component spec)

### Dependencies

- **Requires (from other stories):**
  - Story 2.1 (submissions table with title, amount, source_url)
  - Story 2.3 (Cost to Nicolas calculations cached in DB: costPerTaxpayer, consequenceText)
  - Story 1.1 (project scaffold, design tokens, font setup)
- **Required by (other stories):**
  - Story 4.2 (share buttons reference the OG image URL)
  - Story 4.3 (Open Graph meta tags reference the OG image URL)

### References

- [Source: architecture.md - Section 3.3 API Routes] `/api/og/[id]` route definition
- [Source: architecture.md - Section 3.2 Schema Design] `ogImageUrl` column on submissions table
- [Source: architecture.md - Section 5 File Structure] `src/app/api/og/[id]/route.tsx` path
- [Source: architecture.md - Section 2.1 Technology Manifest] @vercel/og, Next.js 16.1.6
- [Source: architecture.md - Section 3.4 Typography & Design Tokens] Color/font definitions
- [Source: ux-design-specification.md - ConsequenceCard] Share card variant spec
- [Source: ux-design-specification.md - Design Principles] "The card is the product"
- [Source: epics.md - Story 4.1] Complete acceptance criteria
- [Source: prd.md - FR18] Auto-generated shareable image requirement
- [Source: prd.md - NFR4] Share image generation < 3 seconds

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

(none yet)

### Completion Notes List

(none yet)

### File List

(populated during implementation)
