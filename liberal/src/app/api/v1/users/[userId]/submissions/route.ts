import { NextRequest } from 'next/server';
import { getUserSubmissions } from '@/lib/api/users';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') ?? undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

    const result = await getUserSubmissions(userId, cursor, limit);

    return apiSuccess(result.items, {
      cursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error('User submissions error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne du serveur', 500);
  }
}
