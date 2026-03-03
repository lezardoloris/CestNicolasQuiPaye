import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculateMaturity, DEFAULT_THRESHOLDS } from '@/lib/utils/maturity';
import { getMaturityDataForSubmission } from '@/lib/api/maturity-data';

/**
 * Recalculate and persist maturity for a submission.
 * Call this after any write that could affect maturity (vote, source, comment, solution).
 */
export async function recalculateMaturity(submissionId: string): Promise<{
  advanced: boolean;
  newLevel: number;
  newPct: number;
}> {
  const [currentSubmission, maturityData] = await Promise.all([
    db
      .select({ maturityLevel: submissions.maturityLevel })
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1),
    getMaturityDataForSubmission(submissionId),
  ]);

  const oldLevel = currentSubmission[0]?.maturityLevel ?? 1;
  const result = calculateMaturity(maturityData, DEFAULT_THRESHOLDS);

  await db
    .update(submissions)
    .set({
      maturityLevel: result.level,
      maturityPct: result.percentage,
      maturityUpdatedAt: new Date(),
    })
    .where(eq(submissions.id, submissionId));

  return {
    advanced: result.level > oldLevel,
    newLevel: result.level,
    newPct: result.percentage,
  };
}
