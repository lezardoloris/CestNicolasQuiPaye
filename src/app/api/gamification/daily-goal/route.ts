import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { auth } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError('UNAUTHORIZED', 'Connexion requise', 401);
  }

  try {
    const body = await request.json();
    const goal = body.dailyGoal;

    if (![20, 50, 100].includes(goal)) {
      return apiError('VALIDATION_ERROR', 'Objectif invalide. Choisissez 20, 50 ou 100.', 400);
    }

    await db
      .update(users)
      .set({ dailyGoal: goal, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    return apiSuccess({ dailyGoal: goal });
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
