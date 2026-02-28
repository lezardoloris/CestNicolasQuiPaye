import { db } from '@/lib/db';
import {
  submissions,
  flags,
  broadcasts,
  moderationActions,
  users,
} from '@/lib/db/schema';
import { eq, sql, and, gte, desc } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return apiError('FORBIDDEN', 'Acces reserve aux administrateurs', 403);
  }

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      pendingResult,
      flagsResult,
      approvedResult,
      broadcastsResult,
      recentActionsResult,
    ] = await Promise.all([
      // Pending moderation count
      db
        .select({ count: sql<number>`count(*)` })
        .from(submissions)
        .where(eq(submissions.moderationStatus, 'pending')),

      // Flags count (distinct submissions with flags)
      db
        .select({ count: sql<number>`count(distinct ${flags.submissionId})` })
        .from(flags),

      // Approved submissions count
      db
        .select({ count: sql<number>`count(*)` })
        .from(submissions)
        .where(eq(submissions.moderationStatus, 'approved')),

      // Broadcasts this month
      db
        .select({ count: sql<number>`count(*)` })
        .from(broadcasts)
        .where(
          and(
            eq(broadcasts.status, 'sent'),
            gte(broadcasts.sentAt, monthStart)
          )
        ),

      // Recent moderation actions
      db
        .select({
          action: moderationActions.action,
          reason: moderationActions.reason,
          createdAt: moderationActions.createdAt,
          submissionTitle: submissions.title,
          adminName: users.displayName,
        })
        .from(moderationActions)
        .innerJoin(
          submissions,
          eq(moderationActions.submissionId, submissions.id)
        )
        .innerJoin(users, eq(moderationActions.adminUserId, users.id))
        .orderBy(desc(moderationActions.createdAt))
        .limit(20),
    ]);

    return apiSuccess({
      pendingCount: pendingResult[0]?.count ?? 0,
      flagsCount: flagsResult[0]?.count ?? 0,
      activeUsersCount: 0, // Simplified for MVP
      approvedCount: approvedResult[0]?.count ?? 0,
      broadcastsThisMonth: broadcastsResult[0]?.count ?? 0,
      recentActions: recentActionsResult,
    });
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
