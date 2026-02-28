import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { auth } from '@/lib/auth';
import { calculateHotScore } from '@/lib/utils/hot-score';

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return apiError('FORBIDDEN', 'Acces reserve aux administrateurs', 403);
  }

  try {
    // Get all seeded submissions ordered by id
    const seeded = await db
      .select({ id: submissions.id })
      .from(submissions)
      .where(eq(submissions.isSeeded, 1))
      .orderBy(submissions.id);

    if (seeded.length === 0) {
      return apiError('NOT_FOUND', 'Aucune donnee seedee trouvee', 404);
    }

    const now = new Date();
    const total = seeded.length;

    // Update each row's createdAt spread across 12 months
    for (let i = 0; i < total; i++) {
      const monthsBack = Math.floor((i / total) * 12);
      const dayOffset = i % 28;
      const createdAt = new Date(
        now.getFullYear(),
        now.getMonth() - monthsBack,
        Math.max(1, now.getDate() - dayOffset),
        10 + (i % 12),
      );
      const hotScore = calculateHotScore(0, 0, createdAt);

      await db
        .update(submissions)
        .set({ createdAt, hotScore: String(hotScore) })
        .where(eq(submissions.id, seeded[i].id));
    }

    return apiSuccess({ updated: total, months: 12 });
  } catch (error) {
    console.error('Reseed error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors du reseed', 500);
  }
}
