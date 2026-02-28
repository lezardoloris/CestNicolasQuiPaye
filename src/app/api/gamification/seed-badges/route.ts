import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { seedBadgeDefinitions } from '@/lib/gamification/seed-badges';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-seed-secret');
  if (secret !== process.env.SEED_SECRET) {
    return apiError('UNAUTHORIZED', 'Invalid secret', 401);
  }

  try {
    await seedBadgeDefinitions();
    return apiSuccess({ ok: true, message: 'Badge definitions seeded' });
  } catch (error) {
    console.error('Badge seed error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
