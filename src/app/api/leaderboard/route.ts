import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { sql, isNull } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import { calculateKarma, getKarmaTier } from '@/lib/utils/karma';

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
        submissionCount: sql<number>`coalesce((
          select count(*)::int from submissions
          where submissions.author_id = ${users.id}
            and submissions.deleted_at is null
            and submissions.status = 'published'
        ), 0)`,
        voteCount: sql<number>`coalesce((
          select count(*)::int from votes
          where votes.user_id = ${users.id}
        ), 0)`,
        sourceCount: sql<number>`coalesce((
          select count(*)::int from submission_sources
          where submission_sources.added_by = ${users.id}
        ), 0)`,
        noteCount: sql<number>`coalesce((
          select count(*)::int from community_notes
          where community_notes.author_id = ${users.id}
            and community_notes.deleted_at is null
        ), 0)`,
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .limit(50);

    // Calculate karma & sort
    const ranked = rows
      .map((row) => ({
        ...row,
        karma: calculateKarma({
          submissionCount: row.submissionCount,
          voteCount: row.voteCount,
          sourceCount: row.sourceCount,
          noteCount: row.noteCount,
          shareCount: 0, // shareEvents has no userId
        }),
      }))
      .filter((r) => r.karma > 0)
      .sort((a, b) => b.karma - a.karma)
      .slice(0, 50)
      .map((row, i) => {
        const rank = i + 1;
        const tier = getKarmaTier(rank);
        return {
          rank,
          displayName: row.displayName || `Citoyen ${row.anonymousId}`,
          avatarUrl: row.avatarUrl,
          karma: row.karma,
          submissionCount: row.submissionCount,
          voteCount: row.voteCount,
          sourceCount: row.sourceCount,
          noteCount: row.noteCount,
          tier: {
            label: tier.label,
            emoji: tier.emoji,
            color: tier.color,
          },
        };
      });

    return apiSuccess(ranked);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors du chargement du classement', 500);
  }
}
