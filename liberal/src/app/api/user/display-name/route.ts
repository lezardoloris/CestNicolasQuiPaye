import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { displayNameSchema } from '@/lib/validators/display-name';
import { apiSuccess, apiError } from '@/lib/api/response';
import { eq } from 'drizzle-orm';

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError('UNAUTHORIZED', 'Non authentifie', 401);
    }

    const body = await request.json();

    // Handle reset to anonymous (displayName: null)
    if (body.displayName === null) {
      await db
        .update(users)
        .set({
          displayName: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));

      return apiSuccess({ displayName: null });
    }

    // Validate display name
    const parsed = displayNameSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Donnees invalides', 400, {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    // Check uniqueness of display name
    const existing = await db.query.users.findFirst({
      where: eq(users.displayName, parsed.data.displayName),
    });

    if (existing && existing.id !== session.user.id) {
      return apiError(
        'CONFLICT',
        'Ce pseudonyme est deja utilise',
        409,
      );
    }

    // Update display name
    await db
      .update(users)
      .set({
        displayName: parsed.data.displayName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return apiSuccess({ displayName: parsed.data.displayName });
  } catch (error) {
    console.error('Display name update error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne du serveur', 500);
  }
}
