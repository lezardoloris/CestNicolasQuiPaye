import { NextRequest } from 'next/server';
import { getSubmissions } from '@/lib/api/submissions';
import { apiSuccess, apiError } from '@/lib/api/response';
import { feedQuerySchema } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request.headers);
  const rateLimitError = await checkRateLimit('api', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  // Parse and validate query params
  const { searchParams } = new URL(request.url);
  const rawParams = {
    sort: searchParams.get('sort') ?? 'hot',
    cursor: searchParams.get('cursor') ?? undefined,
    limit: searchParams.get('limit') ?? '20',
    timeWindow: searchParams.get('timeWindow') ?? 'week',
  };

  const parsed = feedQuerySchema.safeParse(rawParams);
  if (!parsed.success) {
    return apiError(
      'VALIDATION_ERROR',
      'Parametres de requete invalides',
      400,
      { errors: parsed.error.flatten() },
    );
  }

  try {
    const result = await getSubmissions(parsed.data);
    return apiSuccess(result.data, {
      cursor: result.meta.cursor ?? undefined,
      hasMore: result.meta.hasMore,
    });
  } catch (error) {
    console.error('Feed fetch error:', error);
    return apiError(
      'INTERNAL_ERROR',
      'Erreur lors du chargement du fil',
      500,
    );
  }
}
