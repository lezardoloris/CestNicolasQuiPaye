import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getHashedIp } from '@/lib/utils/ip-hash';
import { isValidUUID } from '@/lib/utils/validation';
import { getIpVoteBatch } from '@/lib/api/ip-votes';
import { db } from '@/lib/db';
import { votes } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * GET /api/votes/batch?ids=uuid1,uuid2,...
 * Returns a map of submissionId -> voteType for the current user/IP.
 */
export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get('ids');
  if (!idsParam) {
    return apiError('VALIDATION_ERROR', 'Paramètre ids requis', 400);
  }

  const ids = idsParam.split(',').filter(isValidUUID);
  if (ids.length === 0) {
    return apiSuccess({});
  }

  // Cap at 50 IDs per request
  const submissionIds = ids.slice(0, 50);

  const session = await auth();

  if (session?.user?.id) {
    // Authenticated: fetch user votes
    const results = await db
      .select({
        submissionId: votes.submissionId,
        voteType: votes.voteType,
      })
      .from(votes)
      .where(
        and(
          eq(votes.userId, session.user.id),
          sql`${votes.submissionId} IN ${submissionIds}`,
        ),
      );

    const voteMap: Record<string, string> = {};
    for (const row of results) {
      voteMap[row.submissionId] = row.voteType;
    }
    return apiSuccess(voteMap);
  } else {
    // Anonymous: fetch IP votes
    const ipHash = getHashedIp(request);
    const voteMap = await getIpVoteBatch(ipHash, submissionIds);
    return apiSuccess(voteMap);
  }
}
