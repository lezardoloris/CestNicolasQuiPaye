import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { auth } from '@/lib/auth';
import { isValidUUID } from '@/lib/utils/validation';
import { getModerationDetail } from '@/lib/api/moderation-detail';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return apiError('UNAUTHORIZED', 'Authentification requise', 401);
  }

  if (!['admin', 'moderator'].includes(session.user.role as string)) {
    return apiError('FORBIDDEN', 'Acces refuse', 403);
  }

  if (!isValidUUID(id)) {
    return apiError('VALIDATION_ERROR', 'ID invalide', 400);
  }

  try {
    const detail = await getModerationDetail(id);
    if (!detail) {
      return apiError('NOT_FOUND', 'Soumission introuvable', 404);
    }
    return apiSuccess(detail);
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
