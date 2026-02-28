import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserProfile } from '@/lib/api/users';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const session = await auth();
    const isOwnProfile = session?.user?.id === userId;

    const profile = await getUserProfile(userId, isOwnProfile);

    if (!profile) {
      return apiError('NOT_FOUND', 'Utilisateur introuvable', 404);
    }

    return apiSuccess(profile);
  } catch (error) {
    console.error('User profile error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne du serveur', 500);
  }
}
