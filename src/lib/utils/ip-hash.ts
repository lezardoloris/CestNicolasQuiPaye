import { createHash } from 'crypto';

const IP_HASH_SALT = process.env.IP_HASH_SALT || 'nicolas-paye-default-salt';

/**
 * Hash an IP address with SHA-256 + salt for GDPR compliance.
 * Never store raw IPs in the database.
 */
export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + IP_HASH_SALT)
    .digest('hex');
}

/**
 * Get the daily rotating salt for anonymous vote hashing.
 * Changes at midnight Europe/Paris so votes can't be correlated across days.
 */
export function getDailySalt(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' });
  return createHash('sha256')
    .update(dateStr + IP_HASH_SALT)
    .digest('hex');
}

/**
 * Hash an IP with a daily rotating salt for anonymous 4-position votes.
 * Returns both the hash and the salt used (salt stored per-record for audit).
 */
export function hashIpWithDailySalt(ip: string): { hash: string; salt: string } {
  const salt = getDailySalt();
  const hash = createHash('sha256')
    .update(ip + salt)
    .digest('hex');
  return { hash, salt };
}

/**
 * Hash an IP with a specific salt (for matching existing records).
 */
export function hashIpWithSalt(ip: string, salt: string): string {
  return createHash('sha256')
    .update(ip + salt)
    .digest('hex');
}

/**
 * Extract client IP from request headers (X-Forwarded-For, X-Real-IP, etc.)
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

/**
 * Get the hashed IP from a request in one step.
 */
export function getHashedIp(request: Request): string {
  return hashIp(getClientIp(request));
}
