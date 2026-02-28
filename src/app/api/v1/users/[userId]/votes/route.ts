import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserVotedSubmissions } from '@/lib/api/users';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const session = await auth();

    // Votes are private -- only accessible by the user themselves
    if (!session?.user || session.user.id !== userId) {
      return apiError('FORBIDDEN', 'Acces refuse', 403);
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') ?? undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

    const result = await getUserVotedSubmissions(userId, cursor, limit);

    return apiSuccess(result.items, {
      cursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error('User votes error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne du serveur', 500);
  }
}
