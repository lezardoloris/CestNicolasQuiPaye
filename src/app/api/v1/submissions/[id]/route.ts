import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { isValidUUID } from '@/lib/utils/validation';
import { publicApiGuard, withCacheHeaders } from '@/lib/api/public-api';
import { getPublicSubmissionDetail } from '@/lib/api/public-submissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guardResult = await publicApiGuard(request);
  if (guardResult) return guardResult;

  const { id } = await params;

  if (!isValidUUID(id)) {
    return apiError('VALIDATION_ERROR', 'ID de soumission invalide', 400);
  }

  try {
    const detail = await getPublicSubmissionDetail(id);
    if (!detail) {
      return apiError('NOT_FOUND', 'Soumission non trouvee', 404);
    }
    const response = apiSuccess(detail);
    return withCacheHeaders(response, 120);
  } catch (error) {
    console.error('[Public API] submission detail error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne du serveur', 500);
  }
}
