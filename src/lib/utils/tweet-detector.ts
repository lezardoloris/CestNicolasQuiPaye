/**
 * Regex pattern to detect Twitter/X tweet URLs.
 * Matches:
 *   - https://twitter.com/{username}/status/{tweet_id}
 *   - https://www.twitter.com/{username}/status/{tweet_id}
 *   - https://x.com/{username}/status/{tweet_id}
 *   - https://www.x.com/{username}/status/{tweet_id}
 * Optionally followed by query params or fragments.
 */
export const TWEET_URL_REGEX =
  /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]{1,15})\/status\/(\d+)(?:\?[^#]*)?(?:#.*)?$/;

/**
 * Check if a URL is a tweet URL.
 */
export function isTweetUrl(url: string): boolean {
  if (!url) return false;
  return TWEET_URL_REGEX.test(url);
}

/**
 * Extract tweet ID from a tweet URL.
 * Returns null if the URL is not a valid tweet URL.
 */
export function extractTweetId(url: string): string | null {
  if (!url) return null;
  const match = url.match(TWEET_URL_REGEX);
  if (!match) return null;
  return match[2]; // The tweet ID (numeric string)
}

/**
 * Extract username from a tweet URL.
 * Returns null if the URL is not a valid tweet URL.
 */
export function extractTweetUsername(url: string): string | null {
  if (!url) return null;
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
