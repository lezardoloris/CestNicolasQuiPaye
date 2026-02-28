import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sourceValidations, submissionSources } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateSourceSchema, isValidUUID } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import { getHashedIp } from '@/lib/utils/ip-hash';

/**
 * POST /api/sources/[id]/validate
 * Vote on source validity. Dual-track: userId or ipHash.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const ip = getClientIp(request.headers);

  const rateLimitError = await checkRateLimit('vote', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  const { id: sourceId } = await params;

  if (!isValidUUID(sourceId)) {
    return apiError('VALIDATION_ERROR', 'ID de source invalide', 400);
  }

  const body = await request.json();
  const parsed = validateSourceSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Donnees invalides', 400);
  }

  const { isValid } = parsed.data;
  const isValidInt = isValid ? 1 : 0;

  try {
    const userId = session?.user?.id ?? null;
    const ipHash = !userId ? getHashedIp(request) : null;

    // Find existing validation
    const whereClause = userId
      ? and(eq(sourceValidations.userId, userId), eq(sourceValidations.sourceId, sourceId))
      : and(eq(sourceValidations.ipHash, ipHash!), eq(sourceValidations.sourceId, sourceId));

    const existing = await db
      .select()
      .from(sourceValidations)
      .where(whereClause)
      .limit(1);

    const existingValidation = existing[0];

    if (existingValidation) {
      if (existingValidation.isValid === isValidInt) {
        // Toggle off — remove validation
        await db.delete(sourceValidations).where(eq(sourceValidations.id, existingValidation.id));
        if (isValid) {
          await db.update(submissionSources).set({
            validationCount: sql`${submissionSources.validationCount} - 1`,
          }).where(eq(submissionSources.id, sourceId));
        } else {
          await db.update(submissionSources).set({
            invalidationCount: sql`${submissionSources.invalidationCount} - 1`,
          }).where(eq(submissionSources.id, sourceId));
        }
        return apiSuccess({ userValidation: null });
      } else {
        // Switch direction
        await db.update(sourceValidations)
          .set({ isValid: isValidInt, createdAt: new Date() })
          .where(eq(sourceValidations.id, existingValidation.id));
        if (isValid) {
          await db.update(submissionSources).set({
            validationCount: sql`${submissionSources.validationCount} + 1`,
            invalidationCount: sql`${submissionSources.invalidationCount} - 1`,
          }).where(eq(submissionSources.id, sourceId));
        } else {
          await db.update(submissionSources).set({
            validationCount: sql`${submissionSources.validationCount} - 1`,
            invalidationCount: sql`${submissionSources.invalidationCount} + 1`,
          }).where(eq(submissionSources.id, sourceId));
        }
        return apiSuccess({ userValidation: isValid });
      }
    } else {
      // New validation
      await db.insert(sourceValidations).values({
        sourceId,
        userId,
        ipHash,
        isValid: isValidInt,
      });
      if (isValid) {
        await db.update(submissionSources).set({
          validationCount: sql`${submissionSources.validationCount} + 1`,
        }).where(eq(submissionSources.id, sourceId));

        // Award XP for positive validation to the source contributor
        if (userId) {
          const source = await db.select({ addedBy: submissionSources.addedBy }).from(submissionSources).where(eq(submissionSources.id, sourceId)).limit(1);
          if (source[0]?.addedBy && source[0].addedBy !== userId) {
            const { awardXp } = await import('@/lib/gamification/xp-engine');
            await awardXp(source[0].addedBy, 'source_validated', sourceId, 'source');
          }
        }
      } else {
        await db.update(submissionSources).set({
          invalidationCount: sql`${submissionSources.invalidationCount} + 1`,
        }).where(eq(submissionSources.id, sourceId));
      }
      return apiSuccess({ userValidation: isValid });
    }
  } catch (error) {
    console.error('Source validation error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors de la validation', 500);
  }
}
