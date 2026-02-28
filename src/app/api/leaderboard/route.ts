import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { desc, isNull } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import { getLevelFromXp } from '@/lib/gamification/xp-config';

export const revalidate = 300; // ISR 5 min

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rateLimitError = await checkRateLimit('api', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  try {
    const rows = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        anonymousId: users.anonymousId,
        avatarUrl: users.avatarUrl,
        totalXp: users.totalXp,
        currentStreak: users.currentStreak,
        submissionCount: users.submissionCount,
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(desc(users.totalXp))
      .limit(50);

    const ranked = rows
      .filter((r) => r.totalXp > 0)
      .map((row, i) => {
        const rank = i + 1;
        const level = getLevelFromXp(row.totalXp);
        return {
          rank,
          displayName: row.displayName || `Citoyen ${row.anonymousId}`,
          avatarUrl: row.avatarUrl,
          totalXp: row.totalXp,
          level: level.level,
          levelTitle: level.title,
          streak: row.currentStreak,
          submissionCount: row.submissionCount,
        };
      });

    return apiSuccess(ranked);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors du chargement du classement', 500);
  }
}
