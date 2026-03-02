import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';

export async function getPendingSubmissionCount(): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(submissions)
    .where(
      and(
        eq(submissions.moderationStatus, 'pending'),
        eq(submissions.status, 'published'),
        isNull(submissions.deletedAt),
      ),
    );
  return Number(result.count);
}
