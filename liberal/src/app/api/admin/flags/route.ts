import { db } from '@/lib/db';
import { flags, submissions, users } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();

  if (
    !session?.user ||
    !['admin', 'moderator'].includes(session.user.role as string)
  ) {
    return apiError('FORBIDDEN', 'Acces refuse', 403);
  }

  try {
    // Get submissions with flag counts, grouped
    const flaggedSubmissions = await db
      .select({
        submissionId: flags.submissionId,
        submissionTitle: submissions.title,
        moderationStatus: submissions.moderationStatus,
        flagCount: sql<number>`count(*)`,
        latestFlagAt: sql<string>`max(${flags.createdAt})`,
      })
      .from(flags)
      .innerJoin(submissions, eq(flags.submissionId, submissions.id))
      .groupBy(flags.submissionId, submissions.title, submissions.moderationStatus)
      .orderBy(desc(sql`count(*)`))
      .limit(50);

    // Get detailed flags for each submission
    const results = await Promise.all(
      flaggedSubmissions.map(async (item) => {
        const flagDetails = await db
          .select({
            id: flags.id,
            reason: flags.reason,
            details: flags.details,
            createdAt: flags.createdAt,
            userDisplay: users.displayName,
          })
          .from(flags)
          .leftJoin(users, eq(flags.userId, users.id))
          .where(eq(flags.submissionId, item.submissionId))
          .orderBy(desc(flags.createdAt));

        return {
          ...item,
          flags: flagDetails.map((f) => ({
            ...f,
            userDisplay: f.userDisplay ?? 'Anonyme',
          })),
        };
      })
    );

    return apiSuccess(results);
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
