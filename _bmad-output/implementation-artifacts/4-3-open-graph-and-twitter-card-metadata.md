# Story 4.3: Open Graph & Twitter Card Metadata

Status: ready-for-dev

## Story

As a **system**,
I want every submission page to have proper Open Graph and Twitter Card metadata generated via Next.js Metadata API,
so that links shared on social media display a rich preview with the auto-generated image, title, and Cost to Nicolas summary.

## Acceptance Criteria (BDD)

### AC 4.3.1: Submission Page Open Graph Metadata

**Given** a submission page at `/submissions/{id}` (or `/s/[id]/[slug]`) is rendered,
**When** the HTML `<head>` is generated via Next.js `generateMetadata` function,
**Then** the following Open Graph meta tags are present in the server-rendered HTML:
```html
<meta property="og:title" content="{submission.title}" />
<meta property="og:description" content="Ce gaspillage coute {cost_per_citizen} EUR a chaque Francais. {submission.description (truncated to 200 chars)}" />
<meta property="og:image" content="https://liberal.fr/api/og/{submission.id}?v={updatedAt}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="{submission.title} - Cout pour Nicolas" />
<meta property="og:url" content="https://liberal.fr/submissions/{submission.id}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="LIBERAL" />
<meta property="og:locale" content="fr_FR" />
```

### AC 4.3.2: Twitter Card Metadata

**Given** a submission page at `/submissions/{id}` is rendered,
**When** the HTML `<head>` is generated via Next.js `generateMetadata` function,
**Then** the following Twitter Card meta tags are present:
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@LIBERAL_FR" />
<meta name="twitter:creator" content="@LIBERAL_FR" />
<meta name="twitter:title" content="{submission.title}" />
<meta name="twitter:description" content="Ce gaspillage coute {cost_per_citizen} EUR a chaque Francais." />
<meta name="twitter:image" content="https://liberal.fr/api/og/{submission.id}?v={updatedAt}" />
<meta name="twitter:image:alt" content="{submission.title} - Cout pour Nicolas" />
```
**And** the `twitter:card` type is `summary_large_image` (displays the full 1200x630 OG image).

### AC 4.3.3: Server-Side Rendering for Crawlers

**Given** a social media crawler (Facebook, Twitter, LinkedIn, WhatsApp, Telegram) fetches a submission URL,
**When** the HTML response is returned,
**Then** the crawler receives fully server-rendered HTML with all meta tags present in the initial response (no JavaScript execution required),
**And** the submission page uses SSR rendering strategy (per architecture: RSC + SSR for `/s/[id]/[slug]`),
**And** the OG image URL returns a valid PNG within 3 seconds when the crawler fetches it.

### AC 4.3.4: Next.js generateMetadata Implementation

**Given** the submission detail page uses Next.js App Router,
**When** the `generateMetadata` async function is defined in the page file,
**Then** the function:
- Receives `{ params: { id: string } }` as its argument
- Fetches the submission data from the database (title, description, amount, costPerTaxpayer, id, updatedAt)
- Returns a `Metadata` object with `openGraph`, `twitter`, `title`, `description`, and `alternates` properties
- Handles missing submissions by returning default metadata with a "not found" title
- Uses the canonical URL `https://liberal.fr/submissions/{id}` in `alternates.canonical`

### AC 4.3.5: Home Page Default Metadata

**Given** the home page at `/` is rendered,
**When** the HTML `<head>` is generated,
**Then** default Open Graph tags are present:
```html
<meta property="og:title" content="LIBERAL - La tronconneuse citoyenne" />
<meta property="og:description" content="LIBERAL - Plateforme citoyenne de responsabilite fiscale. Decouvrez ce que le gaspillage public vous coute." />
<meta property="og:image" content="https://liberal.fr/og-default.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://liberal.fr" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="LIBERAL" />
<meta property="og:locale" content="fr_FR" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@LIBERAL_FR" />
```

### AC 4.3.6: Feed Page Metadata

**Given** a feed page at `/feed/hot`, `/feed/new`, or `/feed/top` is rendered,
**When** the HTML `<head>` is generated,
**Then** the metadata reflects the feed type:
- Title: "Gaspillages en tendance - LIBERAL" (hot), "Derniers gaspillages - LIBERAL" (new), "Top gaspillages - LIBERAL" (top)
- Description: "Decouvrez les gaspillages publics les plus votes par la communaute."
- Image: default OG image (`/og-default.png`)
- Type: `website`

### AC 4.3.7: SEO HTML Metadata

**Given** any page on the platform is rendered,
**When** the HTML `<head>` is generated,
**Then** the following SEO-relevant tags are also present:
- `<html lang="fr">` attribute (already set in root layout)
- `<meta name="robots" content="index, follow" />` for public pages
- `<link rel="canonical" href="{canonical_url}" />`
- `<meta name="description" content="{page_description}" />`
- Structured data (`application/ld+json`) for submission pages with:
  - `@type: "Article"`
  - `headline: submission.title`
  - `datePublished: submission.createdAt`
  - `author.name: submission.authorDisplay`
  - `publisher.name: "LIBERAL"`

## Tasks / Subtasks

- [ ] **Task 1: Implement `generateMetadata` for submission detail page** (AC: 4.3.1, 4.3.2, 4.3.3, 4.3.4)
  - [ ] Locate the submission detail page file: `src/app/(main)/s/[id]/[slug]/page.tsx` (or equivalent `submissions/[id]` path)
  - [ ] Add `export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata>` (Note: Next.js 16 uses `Promise<Params>`)
  - [ ] Fetch submission from database inside `generateMetadata`:
    ```typescript
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, params.id),
      with: { costCalculation: true }
    });
    ```
  - [ ] Build and return `Metadata` object with `openGraph` and `twitter` properties
  - [ ] Handle not-found: return `{ title: 'Signalement introuvable - LIBERAL' }` with default image
  - [ ] Format OG description: `"Ce gaspillage coute ${formatEurFr(costPerCitizen)} EUR a chaque Francais. ${truncate(description, 200)}"`
  - [ ] Set OG image URL: `${SITE_URL}/api/og/${submission.id}?v=${submission.updatedAt.getTime()}`
  - [ ] Set `twitter.card: 'summary_large_image'`
  - [ ] Set `twitter.site: '@LIBERAL_FR'`

- [ ] **Task 2: Create site-wide metadata constants** (AC: 4.3.5, 4.3.6)
  - [ ] Create `src/lib/metadata.ts` with shared constants:
    ```typescript
    export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://liberal.fr';
    export const SITE_NAME = 'LIBERAL';
    export const TWITTER_HANDLE = '@LIBERAL_FR';
    export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
    export const DEFAULT_DESCRIPTION = 'LIBERAL - Plateforme citoyenne de responsabilite fiscale. Decouvrez ce que le gaspillage public vous coute.';
    ```
  - [ ] Create helper function `buildSubmissionMetadata(submission: Submission): Metadata`
  - [ ] Create helper function `buildPageMetadata(title: string, description?: string): Metadata`

- [ ] **Task 3: Set default metadata in root layout** (AC: 4.3.5)
  - [ ] In `src/app/layout.tsx`, export `metadata` object with default OG tags:
    ```typescript
    export const metadata: Metadata = {
      metadataBase: new URL(SITE_URL),
      title: { default: 'LIBERAL - La tronconneuse citoyenne', template: '%s | LIBERAL' },
      description: DEFAULT_DESCRIPTION,
      openGraph: { siteName: SITE_NAME, locale: 'fr_FR', type: 'website', images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }] },
      twitter: { card: 'summary_large_image', site: TWITTER_HANDLE },
      robots: { index: true, follow: true },
    };
    ```

- [ ] **Task 4: Add metadata to feed pages** (AC: 4.3.6)
  - [ ] In `src/app/(main)/feed/[sort]/page.tsx` (or equivalent), add `generateMetadata` that sets title based on sort param:
    - `hot` -> "Gaspillages en tendance - LIBERAL"
    - `new` -> "Derniers gaspillages - LIBERAL"
    - `top` -> "Top gaspillages - LIBERAL"

- [ ] **Task 5: Add JSON-LD structured data to submission pages** (AC: 4.3.7)
  - [ ] Create `src/components/features/submissions/SubmissionJsonLd.tsx`
  - [ ] Render a `<script type="application/ld+json">` tag with Article schema:
    ```json
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "{title}",
      "datePublished": "{createdAt}",
      "author": { "@type": "Person", "name": "{authorDisplay}" },
      "publisher": { "@type": "Organization", "name": "LIBERAL", "url": "https://liberal.fr" },
      "image": "{ogImageUrl}",
      "url": "{canonicalUrl}"
    }
    ```
  - [ ] Include this component in the submission detail page

- [ ] **Task 6: Set `NEXT_PUBLIC_SITE_URL` environment variable** (AC: 4.3.1)
  - [ ] Add `NEXT_PUBLIC_SITE_URL=https://liberal.fr` to `.env.example`
  - [ ] Add `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `.env.local` for development
  - [ ] Ensure `metadataBase` in root layout uses this variable

- [ ] **Task 7: Write tests** (AC: all)
  - [ ] Unit test: `buildSubmissionMetadata` returns correct OG and Twitter tags
  - [ ] Unit test: handles missing submission gracefully (returns default metadata)
  - [ ] Unit test: OG description is truncated to 200 chars
  - [ ] Unit test: OG image URL includes `?v=` cache-busting parameter
  - [ ] Integration test: Render submission page, inspect `<head>` for correct meta tags
  - [ ] Integration test: Render home page, inspect `<head>` for default meta tags
  - [ ] E2E test (optional): Use Playwright to fetch page HTML and parse meta tags
  - [ ] Manual test: Validate with Twitter Card Validator (https://cards-dev.twitter.com/validator)
  - [ ] Manual test: Validate with Facebook Sharing Debugger (https://developers.facebook.com/tools/debug/)

## Dev Notes

### Architecture

- **Next.js Metadata API:** Use the built-in `generateMetadata` async function in page files and the static `metadata` export in layout files. This is the canonical approach in Next.js 16 App Router -- do NOT use `<Head>` components or manual `<meta>` tag insertion.
- **Server-side rendering:** The submission detail page uses **RSC + SSR** strategy per architecture. `generateMetadata` runs on the server before the page renders, ensuring crawlers receive fully-rendered HTML.
- **`metadataBase`:** Set in root layout to `new URL(SITE_URL)`. This allows relative URLs in OG image paths.
- **Next.js 16 params:** In Next.js 16.x, route params in `generateMetadata` are wrapped in a `Promise`. Await them: `const { id } = await params;`
- **Data fetching in generateMetadata:** Use Drizzle ORM directly (server-side). Do NOT call an API route from `generateMetadata` -- that would create an unnecessary network hop.

### Tech Stack

- **Next.js** 16.1.6 (App Router, Metadata API, `generateMetadata`, `metadataBase`)
- **Drizzle ORM** 0.45.1 for server-side database queries in `generateMetadata`
- **TypeScript** 5.7.x with `Metadata` type from `next`
- **JSON-LD** structured data via `<script type="application/ld+json">`

### Key Files to Create/Modify

| Action | File Path | Purpose |
|--------|-----------|---------|
| CREATE | `src/lib/metadata.ts` | Shared metadata constants and builder functions |
| MODIFY | `src/app/layout.tsx` | Default metadata export with OG/Twitter defaults |
| MODIFY | `src/app/(main)/s/[id]/[slug]/page.tsx` | `generateMetadata` for submission detail pages |
| MODIFY | `src/app/(main)/feed/[sort]/page.tsx` | `generateMetadata` for feed pages |
| CREATE | `src/components/features/submissions/SubmissionJsonLd.tsx` | JSON-LD structured data component |
| MODIFY | `.env.example` | Add `NEXT_PUBLIC_SITE_URL` |
| CREATE | `src/lib/metadata.test.ts` | Unit tests for metadata builders |

### Testing Strategy

- **Unit tests (Vitest):**
  - `buildSubmissionMetadata()`: correct OG title, description, image, Twitter card type
  - `buildPageMetadata()`: correct title template, default description
  - Edge cases: missing costPerTaxpayer, very long title, special characters in title
- **Integration tests (Vitest):**
  - Render submission page with mock data, extract metadata from rendered output
  - Verify all required OG and Twitter meta tags are present
- **Manual validation tools:**
  - Twitter Card Validator: https://cards-dev.twitter.com/validator
  - Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
  - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
  - Open Graph preview: https://www.opengraph.xyz/
- **Crawler simulation:**
  - Fetch the page with `curl` and inspect raw HTML for meta tags
  - Verify meta tags are present in the initial HTML (no JS required)

### UX Design Alignment

- **SEO strategy (per PRD):** Each submission page is a unique URL with Open Graph meta tags and generated Cost to Nicolas preview image
- **OG image dimensions:** 1200x630 (standard for Twitter `summary_large_image` and Facebook shares)
- **French locale:** `og:locale` set to `fr_FR`, page `lang="fr"`
- **Brand consistency:** OG site_name = "LIBERAL", Twitter handle = "@LIBERAL_FR"
- **Description format:** Always starts with the Cost to Nicolas figure for maximum impact in previews: "Ce gaspillage coute X EUR a chaque Francais."

### Important Implementation Details

```typescript
// Next.js 16 generateMetadata pattern
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SITE_URL, SITE_NAME, TWITTER_HANDLE, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from '@/lib/metadata';
import { formatEurFr } from '@/lib/utils/format';

type Props = {
  params: Promise<{ id: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, id),
  });

  if (!submission) {
    return { title: 'Signalement introuvable' };
  }

  const ogImageUrl = `${SITE_URL}/api/og/${submission.id}?v=${submission.updatedAt.getTime()}`;
  const description = `Ce gaspillage coute ${formatEurFr(Number(submission.costPerTaxpayer))} EUR a chaque Francais. ${submission.description.slice(0, 200)}`;

  return {
    title: submission.title,
    description,
    openGraph: {
      title: submission.title,
      description,
      url: `${SITE_URL}/submissions/${submission.id}`,
      type: 'article',
      siteName: SITE_NAME,
      locale: 'fr_FR',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${submission.title} - Cout pour Nicolas` }],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: submission.title,
      description: `Ce gaspillage coute ${formatEurFr(Number(submission.costPerTaxpayer))} EUR a chaque Francais.`,
      images: [{ url: ogImageUrl, alt: `${submission.title} - Cout pour Nicolas` }],
    },
    alternates: {
      canonical: `${SITE_URL}/submissions/${submission.id}`,
    },
  };
}
```

### Dependencies

- **Requires (from other stories):**
  - Story 4.1 (OG image generation endpoint at `/api/og/[id]` -- the image URL referenced in meta tags)
  - Story 2.1 (submissions table: title, description, amount)
  - Story 2.3 (Cost to Nicolas calculations: costPerTaxpayer)
  - Story 1.1 (root layout with `lang="fr"` and design system)
- **Required by (other stories):**
  - Story 4.2 (share buttons rely on metadata being correct for link previews)
  - Story 4.4 (share analytics -- rich previews drive click-through rates)

### References

- [Source: architecture.md - Section 3.4 Frontend] Submission detail uses RSC + SSR for SEO and OG meta tags
- [Source: architecture.md - Section 3.3 API Routes] `/api/og/[id]` OG image endpoint
- [Source: architecture.md - Section 5 File Structure] `src/app/(main)/s/[id]/[slug]/page.tsx`
- [Source: architecture.md - Section 2.1 Technology Manifest] Next.js 16.1.6
- [Source: epics.md - Story 4.3] Complete acceptance criteria with exact meta tag list
- [Source: prd.md - FR20] Open Graph and Twitter Card metadata for every submission page
- [Source: prd.md - SEO Strategy] Open Graph meta tags, generated preview image, structured data
- [Source: ux-design-specification.md - Design Principles] Viral-first design, share card as the product

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

(none yet)

### Completion Notes List

(none yet)

### File List

(populated during implementation)
