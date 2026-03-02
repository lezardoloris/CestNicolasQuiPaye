import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { publicSubmissionsQuerySchema } from '@/lib/utils/validation';
import { publicApiGuard, withCacheHeaders } from '@/lib/api/public-api';
import { getPublicSubmissions } from '@/lib/api/public-submissions';

export async function GET(request: NextRequest): Promise<Response> {
  const guardResult = await publicApiGuard(request);
  if (guardResult) return guardResult;

  const { searchParams } = new URL(request.url);
  const rawParams = Object.fromEntries(searchParams.entries());
  const parsed = publicSubmissionsQuerySchema.safeParse(rawParams);

  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Parametres invalides', 400, {
      errors: parsed.error.flatten(),
    });
  }

  try {
    const result = await getPublicSubmissions(parsed.data);
    const response = apiSuccess(result.data, {
      cursor: result.meta.cursor ?? undefined,
      hasMore: result.meta.hasMore,
    });
    return withCacheHeaders(response, 120);
  } catch (error) {
    console.error('[Public API] submissions list error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne du serveur', 500);
  }
}
