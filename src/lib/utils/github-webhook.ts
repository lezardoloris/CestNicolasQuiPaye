import { createHmac, createHash, timingSafeEqual } from 'crypto';

/**
 * Validate GitHub webhook signature (HMAC-SHA256).
 * GitHub sends the signature in the X-Hub-Signature-256 header as "sha256=<hex>".
 */
export function verifyGitHubWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;

  const expected =
    'sha256=' + createHmac('sha256', secret).update(payload).digest('hex');

  if (signature.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

/**
 * Generate a deterministic UUID from a GitHub entity string.
 * Used to create stable relatedEntityId values for XP idempotency.
 *
 * @example githubEntityToUuid("github:pr:lezardoloris/CestNicolasQuiPaye:42")
 */
export function githubEntityToUuid(entityKey: string): string {
  const hash = createHash('sha256').update(entityKey).digest('hex');
  // Format as UUID v5-style: 8-4-4-4-12
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '5' + hash.slice(13, 16),
    ((parseInt(hash.slice(16, 17), 16) & 0x3) | 0x8).toString(16) +
      hash.slice(17, 20),
    hash.slice(20, 32),
  ].join('-');
}
