import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const querySchema = z.object({
  moderationStatus: z
    .enum(['pending', 'approved', 'rejected', 'flagged'])
    .default('pending'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return apiError('UNAUTHORIZED', 'Authentification requise', 401);
  }

  if (!['admin', 'moderator'].includes(session.user.role as string)) {
    return apiError('FORBIDDEN', 'Acces refuse', 403);
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    moderationStatus: searchParams.get('moderationStatus') ?? 'pending',
    limit: searchParams.get('limit') ?? '50',
  });

  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Parametres invalides', 400);
  }

  try {
    const results = await db
      .select()
      .from(submissions)
      .where(
        and(
          eq(submissions.status, 'published'),
          eq(submissions.moderationStatus, parsed.data.moderationStatus),
        ),
      )
      .orderBy(desc(submissions.createdAt))
      .limit(parsed.data.limit);

    return apiSuccess(results);
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
