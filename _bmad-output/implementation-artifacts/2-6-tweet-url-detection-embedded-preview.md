# Story 2.6: Tweet URL Detection & Embedded Preview

Status: ready-for-dev

## Story

As a visitor (Nicolas),
I want the system to detect tweet URLs in submission sources and display an embedded tweet preview,
so that I can see the original social media context of the reported waste.

## Acceptance Criteria (BDD)

**Given** a submission has a `source_url` matching the pattern `https://(twitter.com|x.com)/*/status/*`,
**When** the submission detail page renders,
**Then** an embedded tweet preview is displayed alongside the submission details using Twitter's oEmbed API or the `react-tweet` library (FR21),
**And** the embed is loaded lazily (after the main content renders) to avoid blocking LCP,
**And** if the tweet embed fails to load (deleted tweet, API error), a fallback card is displayed with the tweet URL as a clickable link and the text "Tweet indisponible - voir le lien original".

**Given** a submission has a `source_url` that does NOT match a tweet URL pattern,
**When** the submission detail page renders,
**Then** no tweet embed is shown,
**And** the source URL is displayed as a prominent clickable link with an external-link icon (FR5).

**Given** the tweet embed loads,
**When** the user views it,
**Then** the embed does not set any third-party tracking cookies until the user interacts with it (NFR12).

## Tasks / Subtasks

### Task 1: Tweet URL Detection Utility (AC1, AC2)
- [ ] Create `src/lib/utils/tweet-detection.ts`:
  ```typescript
  /**
   * Regex pattern to detect Twitter/X tweet URLs.
   * Matches:
   *   - https://twitter.com/{username}/status/{tweet_id}
   *   - https://www.twitter.com/{username}/status/{tweet_id}
   *   - https://x.com/{username}/status/{tweet_id}
   *   - https://www.x.com/{username}/status/{tweet_id}
   * Optionally followed by query params or fragments.
   */
  export const TWEET_URL_REGEX = /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]{1,15})\/status\/(\d+)(?:\?.*)?(?:#.*)?$/;

  /**
   * Check if a URL is a tweet URL.
   */
  export function isTweetUrl(url: string): boolean {
    return TWEET_URL_REGEX.test(url);
  }

  /**
   * Extract tweet ID from a tweet URL.
   * Returns null if the URL is not a valid tweet URL.
   */
  export function extractTweetId(url: string): string | null {
    const match = url.match(TWEET_URL_REGEX);
    if (!match) return null;
    return match[2]; // The tweet ID (numeric string)
  }

  /**
   * Extract username from a tweet URL.
   * Returns null if the URL is not a valid tweet URL.
   */
  export function extractTweetUsername(url: string): string | null {
    const match = url.match(TWEET_URL_REGEX);
    if (!match) return null;
    return match[1]; // The username
  }

  /**
   * Normalize a tweet URL to the canonical x.com format.
   */
  export function normalizeTweetUrl(url: string): string | null {
    const id = extractTweetId(url);
    const username = extractTweetUsername(url);
    if (!id || !username) return null;
    return `https://x.com/${username}/status/${id}`;
  }
  ```

### Task 2: Install react-tweet Library (AC1)
- [ ] Install `react-tweet` package:
  ```bash
  npm install react-tweet
  ```
  The `react-tweet` library renders tweet embeds without requiring the Twitter widgets.js script, providing:
  - Server-side rendering support (works with RSC)
  - No third-party tracking cookies by default (NFR12/AC3)
  - Light and dark theme support
  - Graceful fallback on failure

### Task 3: TweetEmbed Component (AC1, AC3)
- [ ] Create `src/components/features/tweets/TweetEmbed.tsx`:
  ```typescript
  'use client';

  import { Suspense, lazy } from 'react';
  import { extractTweetId } from '@/lib/utils/tweet-detection';
  import { TweetFallback } from './TweetFallback';

  // Lazy load the tweet component to avoid blocking LCP (AC1)
  const Tweet = lazy(() =>
    import('react-tweet').then((mod) => ({ default: mod.Tweet }))
  );

  interface TweetEmbedProps {
    sourceUrl: string;
  }

  export function TweetEmbed({ sourceUrl }: TweetEmbedProps) {
    const tweetId = extractTweetId(sourceUrl);

    if (!tweetId) return null;

    return (
      <div className="my-6">
        <Suspense fallback={<TweetEmbedSkeleton />}>
          <TweetContent tweetId={tweetId} sourceUrl={sourceUrl} />
        </Suspense>
      </div>
    );
  }

  function TweetContent({ tweetId, sourceUrl }: { tweetId: string; sourceUrl: string }) {
    return (
      <ErrorBoundary fallback={<TweetFallback url={sourceUrl} />}>
        <div className="mx-auto max-w-[550px]">
          <Tweet
            id={tweetId}
            components={{
              // Custom error fallback
              TweetNotFound: () => <TweetFallback url={sourceUrl} />,
            }}
          />
        </div>
      </ErrorBoundary>
    );
  }

  function TweetEmbedSkeleton() {
    return (
      <div className="mx-auto max-w-[550px] animate-pulse rounded-xl border border-border-default bg-surface-secondary p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-surface-elevated" />
          <div className="flex-1">
            <div className="h-4 w-32 rounded bg-surface-elevated mb-2" />
            <div className="h-3 w-24 rounded bg-surface-elevated" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-surface-elevated" />
          <div className="h-4 w-3/4 rounded bg-surface-elevated" />
          <div className="h-4 w-1/2 rounded bg-surface-elevated" />
        </div>
      </div>
    );
  }
  ```

### Task 4: TweetFallback Component (AC1)
- [ ] Create `src/components/features/tweets/TweetFallback.tsx`:
  ```typescript
  import { ExternalLink, AlertTriangle } from 'lucide-react';

  interface TweetFallbackProps {
    url: string;
  }

  export function TweetFallback({ url }: TweetFallbackProps) {
    return (
      <div className="mx-auto max-w-[550px] rounded-xl border border-border-default bg-surface-secondary p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-text-primary font-medium mb-2">
              Tweet indisponible - voir le lien original
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-chainsaw-red hover:underline"
              aria-label={`Ouvrir le tweet original sur ${new URL(url).hostname}`}
            >
              <span className="break-all">{url}</span>
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
            </a>
          </div>
        </div>
      </div>
    );
  }
  ```

### Task 5: ErrorBoundary for Tweet Embed (AC1)
- [ ] Create `src/components/features/tweets/TweetErrorBoundary.tsx`:
  ```typescript
  'use client';

  import { Component, ReactNode } from 'react';

  interface Props {
    children: ReactNode;
    fallback: ReactNode;
  }

  interface State {
    hasError: boolean;
  }

  export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
      return { hasError: true };
    }

    componentDidCatch(error: Error) {
      console.error('Tweet embed error:', error);
    }

    render() {
      if (this.state.hasError) {
        return this.props.fallback;
      }
      return this.props.children;
    }
  }
  ```

### Task 6: SourceUrlDisplay Component (AC2)
- [ ] Create `src/components/features/submissions/SourceUrlDisplay.tsx`:
  ```typescript
  import { ExternalLink } from 'lucide-react';
  import { isTweetUrl } from '@/lib/utils/tweet-detection';
  import { TweetEmbed } from '@/components/features/tweets/TweetEmbed';

  interface SourceUrlDisplayProps {
    sourceUrl: string;
  }

  export function SourceUrlDisplay({ sourceUrl }: SourceUrlDisplayProps) {
    const isTweet = isTweetUrl(sourceUrl);

    return (
      <div>
        {/* Always show the source URL as a clickable link (FR5) */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-text-secondary text-sm">Source :</span>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-chainsaw-red hover:underline font-medium"
            aria-label={`Ouvrir la source sur ${new URL(sourceUrl).hostname}`}
          >
            <span className="truncate max-w-[300px]">
              {new URL(sourceUrl).hostname.replace('www.', '')}
            </span>
            <ExternalLink className="h-4 w-4 flex-shrink-0" />
          </a>
        </div>

        {/* Show tweet embed if source is a tweet URL */}
        {isTweet && <TweetEmbed sourceUrl={sourceUrl} />}
      </div>
    );
  }
  ```

### Task 7: Integration with Submission Detail Page (AC1, AC2)
- [ ] Modify the submission detail page component (to be created in Epic 3, Story 3.2) to use `<SourceUrlDisplay>`:
  - If the submission detail page does not yet exist, create a minimal placeholder at `src/app/submissions/[id]/page.tsx` that:
    - Fetches the submission by ID
    - Renders the submission title, description, cost
    - Uses `<SourceUrlDisplay sourceUrl={submission.sourceUrl} />` to handle tweet detection
  - The full submission detail page will be completed in Story 3.2, but the source URL display is functional

### Task 8: Privacy-Compliant Embed Configuration (AC3)
- [ ] Configure `react-tweet` to avoid third-party tracking cookies:
  - The `react-tweet` library by default does NOT load Twitter's tracking scripts
  - Verify: no `platform.twitter.com` scripts are loaded on page render
  - Verify: no cookies set from `twitter.com` or `x.com` domains until user interaction
  - Add Content Security Policy headers in `next.config.ts` to allow `react-tweet` assets:
    ```typescript
    // Add to CSP frame-src directive:
    // 'https://platform.twitter.com' (only for interactive embeds if needed)
    ```

### Task 9: Tweet Detection in Submission Form (Enhancement)
- [ ] Optionally enhance the SubmissionForm (Story 2.1) with tweet URL auto-detection:
  - When user types/pastes a URL in the `source_url` field, detect if it matches the tweet pattern
  - If detected, show a visual indicator: "Tweet detecte" badge next to the URL field
  - This is a UX enhancement; the core detection happens at display time (Task 6)

### Task 10: Tests
- [ ] Write `src/lib/utils/tweet-detection.test.ts`:
  - `test_standard_twitter_url`: `https://twitter.com/user/status/123456` -> true
  - `test_x_com_url`: `https://x.com/user/status/123456` -> true
  - `test_www_twitter_url`: `https://www.twitter.com/user/status/123456` -> true
  - `test_www_x_url`: `https://www.x.com/user/status/123456` -> true
  - `test_url_with_query_params`: `https://x.com/user/status/123?s=20` -> true
  - `test_url_with_fragment`: `https://x.com/user/status/123#hash` -> true
  - `test_non_status_twitter_url`: `https://twitter.com/user/likes` -> false
  - `test_non_tweet_url`: `https://lemonde.fr/article` -> false
  - `test_empty_string`: `""` -> false
  - `test_malformed_url`: `not-a-url` -> false
  - `test_extract_tweet_id`: `https://x.com/LIBERAL_FR/status/1234567890` -> "1234567890"
  - `test_extract_username`: `https://x.com/LIBERAL_FR/status/1234567890` -> "LIBERAL_FR"
  - `test_extract_from_invalid`: `https://lemonde.fr` -> null
  - `test_normalize_twitter_to_x`: `https://twitter.com/user/status/123` -> `https://x.com/user/status/123`
  - `test_username_validation`: Username with underscores and numbers works
  - `test_long_tweet_id`: IDs up to 20 digits work

- [ ] Write `src/components/features/tweets/TweetEmbed.test.tsx`:
  - Does not render when sourceUrl is not a tweet
  - Renders skeleton during loading
  - Shows fallback when tweet fails to load
  - Lazy loads the Tweet component

- [ ] Write `src/components/features/tweets/TweetFallback.test.tsx`:
  - Renders "Tweet indisponible - voir le lien original" text
  - Renders source URL as clickable link
  - Link opens in new tab
  - Has appropriate aria-label

- [ ] Write `src/components/features/submissions/SourceUrlDisplay.test.tsx`:
  - Shows tweet embed for tweet URLs
  - Shows plain link for non-tweet URLs
  - External link icon present
  - Source domain extracted correctly

## Dev Notes

### Architecture & Patterns
- The tweet embed uses the `react-tweet` library which renders tweet content **without** loading Twitter's `widgets.js` script. This is critical for:
  1. **Privacy (NFR12)**: No third-party tracking cookies
  2. **Performance**: No external script blocking LCP
  3. **SSR compatibility**: Works with React Server Components
- The `TweetEmbed` component is a **Client Component** (`'use client'`) because it uses `React.lazy()` for code splitting and `Suspense` for loading states.
- The `SourceUrlDisplay` component is the integration point -- it decides whether to show a tweet embed or a plain link based on URL detection.
- Error handling uses a React Error Boundary to catch any render failures from the tweet component and show the fallback card.

### Technical Requirements
- **react-tweet**: Latest version compatible with React 19.x and Next.js 16.x
- **Lucide React icons**: `ExternalLink` and `AlertTriangle` icons
- **URL parsing**: Native `URL()` constructor for hostname extraction
- **RegExp**: `TWEET_URL_REGEX` for tweet URL detection

### Tweet URL Regex Explanation
```
/^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]{1,15})\/status\/(\d+)(?:\?.*)?(?:#.*)?$/

Breakdown:
  ^https?:\/\/          - Start with http:// or https://
  (?:www\.)?            - Optional www. prefix
  (?:twitter\.com|x\.com) - Either twitter.com or x.com domain
  \/                    - Slash separator
  ([a-zA-Z0-9_]{1,15}) - Capture group 1: Twitter username (1-15 alphanumeric + underscore)
  \/status\/            - /status/ path segment
  (\d+)                 - Capture group 2: Tweet ID (numeric)
  (?:\?.*)?             - Optional query string
  (?:#.*)?              - Optional fragment
  $                     - End of string
```

### File Structure
```
src/
  lib/
    utils/
      tweet-detection.ts                       # NEW - URL detection utility
      tweet-detection.test.ts                  # NEW - Detection tests
  components/
    features/
      tweets/
        TweetEmbed.tsx                         # NEW - Tweet embed with lazy loading
        TweetEmbed.test.tsx                    # NEW - Component tests
        TweetFallback.tsx                      # NEW - Fallback for failed embeds
        TweetFallback.test.tsx                 # NEW - Fallback tests
        TweetErrorBoundary.tsx                 # NEW - Error boundary
      submissions/
        SourceUrlDisplay.tsx                   # NEW - Smart source URL display
        SourceUrlDisplay.test.tsx              # NEW - Component tests
  app/
    submissions/
      [id]/
        page.tsx                               # MODIFIED - Add SourceUrlDisplay
```

### Testing Requirements
- **Vitest**: Unit tests for tweet URL detection regex (16+ test cases)
- **Vitest + Testing Library**: Component tests for TweetEmbed, TweetFallback, SourceUrlDisplay
- **Coverage target**: >95% for tweet-detection.ts (regex edge cases critical), >70% for components
- Test URLs with various formats (with/without www, with query params, with fragments)
- Test error scenarios (deleted tweets, API failures, malformed URLs)

### UX/Design Notes
- **Tweet embed style**: `react-tweet` renders tweets in a card format. Apply dark mode theming to match LIBERAL's dark UI. Max width 550px, centered.
- **Lazy loading**: The tweet embed loads AFTER the main submission content renders. A skeleton placeholder shows during loading (matching LIBERAL's skeleton pattern from architecture.md).
- **Fallback card**: When a tweet cannot be loaded, the fallback card uses `bg-surface-secondary` background with a warning icon and the original URL as a clickable link. The text "Tweet indisponible - voir le lien original" communicates the issue clearly in French.
- **Source URL display**: For non-tweet URLs, the source is displayed as a prominent clickable link showing just the domain name (e.g., "lemonde.fr") with an external link icon. The full URL is accessible via hover/click.
- **Mobile**: Tweet embeds are responsive (max-width with auto margins). The fallback card also adapts to mobile width.
- **Accessibility**: External links have `aria-label` attributes specifying the destination. The fallback text is screen-reader friendly.

### Dependencies
- **Story 2.1** (Waste Submission Form): Provides the `source_url` field on submissions
- **Epic 3, Story 3.2** (Submission Detail Page): Full integration point for displaying tweet embeds. This story creates the components; Story 3.2 assembles them on the page.
- No dependency on Story 2.2 or 2.3 (tweet detection is independent of cost calculation)

### References
- [Source: epics.md#Epic 2, Story 2.6]
- [Source: prd.md#FR5, FR21, NFR12]
- [Source: ux-design-specification.md#SubmissionForm - tweet URL auto-detection]
- [Source: architecture.md#Section 3.4 - Frontend Architecture]

## Dev Agent Record

### Agent Model Used
### Completion Notes List
### Change Log
### File List
