import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function createRedis() {
  // Skip rate limiting in development when Upstash is not configured
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  return Redis.fromEnv();
}

const redis = createRedis();

function createRateLimiter(
  limiter: ReturnType<typeof Ratelimit.slidingWindow>,
  prefix: string,
) {
  if (!redis) return null;
  return new Ratelimit({ redis, limiter, prefix });
}

export const rateLimiters = {
  registration: createRateLimiter(
    Ratelimit.slidingWindow(3, '1h'),
    'ratelimit:registration',
  ),
  login: createRateLimiter(
    Ratelimit.slidingWindow(10, '15m'),
    'ratelimit:login',
  ),
  submission: createRateLimiter(
    Ratelimit.slidingWindow(5, '24h'),
    'ratelimit:submission',
  ),
  vote: createRateLimiter(
    Ratelimit.slidingWindow(100, '1h'),
    'ratelimit:vote',
  ),
  comment: createRateLimiter(
    Ratelimit.slidingWindow(20, '1h'),
    'ratelimit:comment',
  ),
  api: createRateLimiter(
    Ratelimit.slidingWindow(60, '1m'),
    'ratelimit:api',
  ),
  source: createRateLimiter(
    Ratelimit.slidingWindow(10, '1h'),
    'ratelimit:source',
  ),
  communityNote: createRateLimiter(
    Ratelimit.slidingWindow(5, '1h'),
    'ratelimit:community-note',
  ),
};

/**
 * Check rate limit for a given identifier.
 * Returns null if rate limiting is not configured or if the request is allowed.
 * Returns an error message string if rate limited.
 */
export async function checkRateLimit(
  limiterKey: keyof typeof rateLimiters,
  identifier: string,
): Promise<string | null> {
  const limiter = rateLimiters[limiterKey];
  if (!limiter) return null;

  const { success } = await limiter.limit(identifier);
  if (!success) {
    return 'Trop de tentatives. Reessayez plus tard.';
  }
  return null;
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  );
}
