import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { auth } from '@/lib/auth';
import { getUserGamificationStats } from '@/lib/gamification/xp-engine';

export async function GET(_request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError('UNAUTHORIZED', 'Connexion requise', 401);
  }

  try {
    const stats = await getUserGamificationStats(session.user.id);
    if (!stats) {
      return apiError('NOT_FOUND', 'Utilisateur introuvable', 404);
    }
    return apiSuccess(stats);
  } catch (error) {
    console.error('Gamification stats error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
