import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, votes, submissions, comments } from '@/lib/db/schema';
import { deleteAccountSchema } from '@/lib/validators/delete-account';
import { apiSuccess, apiError } from '@/lib/api/response';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError('UNAUTHORIZED', 'Non authentifie', 401);
    }

    const body = await request.json();

    // Validate confirmation text
    const parsed = deleteAccountSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        'VALIDATION_ERROR',
        'Veuillez taper SUPPRIMER pour confirmer',
        400,
      );
    }

    const userId = session.user.id;

    // Execute deletion within a transaction
    await db.transaction(async (tx) => {
      // 1. Delete all votes by this user
      await tx.delete(votes).where(eq(votes.userId, userId));

      // 2. Anonymize all submissions by this user
      await tx
        .update(submissions)
        .set({
          authorId: null,
          authorDisplay: 'Utilisateur supprime',
          updatedAt: new Date(),
        })
        .where(eq(submissions.authorId, userId));

      // 3. Anonymize all comments by this user
      await tx
        .update(comments)
        .set({
          authorId: null,
          authorDisplay: 'Utilisateur supprime',
          updatedAt: new Date(),
        })
        .where(eq(comments.authorId, userId));

      // 4. Scrub personal data from user record (soft delete)
      await tx
        .update(users)
        .set({
          email: `deleted_${userId}@deleted.local`,
          passwordHash: '',
          displayName: null,
          anonymousId: 'Utilisateur supprime',
          twitterId: null,
          twitterHandle: null,
          avatarUrl: null,
          bio: null,
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    });

    return apiSuccess({ deleted: true }, {}, 200);
  } catch (error) {
    console.error('Account deletion error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne du serveur', 500);
  }
}
