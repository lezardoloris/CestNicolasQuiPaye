import { NextRequest } from 'next/server';
import { apiError } from '@/lib/api/response';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';

/**
 * Shared guard for public API endpoints.
 * Returns an error response if rate limited, otherwise null.
 */
export async function publicApiGuard(request: NextRequest): Promise<Response | null> {
  const ip = getClientIp(request.headers);
  const rateLimitError = await checkRateLimit('publicApi', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }
  return null;
}

/**
 * Wrap a Response with Cache-Control headers.
 */
export function withCacheHeaders(
  response: Response,
  maxAge: number,
  staleWhileRevalidate = 60,
): Response {
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  );
  return response;
}
