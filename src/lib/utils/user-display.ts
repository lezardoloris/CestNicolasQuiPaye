/**
 * Resolves the display name for a user, falling back to anonymous ID.
 */
export function resolveDisplayName(
  displayName: string | null | undefined,
  anonymousId: string,
): string {
  return displayName ?? anonymousId;
}

/**
 * Masks an email address for privacy display.
 * "nicolas@example.com" -> "n***@example.com"
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***';
  const maskedLocal = local.charAt(0) + '***';
  return `${maskedLocal}@${domain}`;
}
