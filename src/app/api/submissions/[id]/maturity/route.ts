import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { isValidUUID } from '@/lib/utils/validation';
import { recalculateMaturity } from '@/lib/api/maturity';
import { getMaturityDataForSubmission } from '@/lib/api/maturity-data';
import { calculateMaturity, DEFAULT_THRESHOLDS } from '@/lib/utils/maturity';

/**
 * GET /api/submissions/[id]/maturity
 * Returns current maturity level, percentage, and missing-for-next hints.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: submissionId } = await params;

  if (!isValidUUID(submissionId)) {
    return apiError('VALIDATION_ERROR', 'ID de soumission invalide', 400);
  }

  try {
    // Trigger a fresh recalculation
    await recalculateMaturity(submissionId);

    // Compute full result with missingForNext hints
    const maturityData = await getMaturityDataForSubmission(submissionId);
    const result = calculateMaturity(maturityData, DEFAULT_THRESHOLDS);

    return apiSuccess(result);
  } catch (error) {
    console.error('Maturity GET error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors du calcul de maturité', 500);
  }
}
