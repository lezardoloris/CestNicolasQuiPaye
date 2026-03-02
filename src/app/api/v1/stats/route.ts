import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { publicApiGuard, withCacheHeaders } from '@/lib/api/public-api';
import { getFullStats } from '@/lib/api/stats';

export async function GET(request: NextRequest): Promise<Response> {
  const guardResult = await publicApiGuard(request);
  if (guardResult) return guardResult;

  try {
    const stats = await getFullStats();
    const response = apiSuccess(stats);
    return withCacheHeaders(response, 600);
  } catch (error) {
    console.error('[Public API] stats error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne du serveur', 500);
  }
}
