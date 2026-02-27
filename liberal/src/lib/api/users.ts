import { db } from '@/lib/db';
import { users, submissions, votes } from '@/lib/db/schema';
import { eq, and, isNull, desc, lt, count } from 'drizzle-orm';
import { resolveDisplayName, maskEmail } from '@/lib/utils/user-display';
import type { UserProfile, UserSubmission, UserVote } from '@/types/user';

export async function getUserById(userId: string) {
  return db.query.users.findFirst({
    where: and(eq(users.id, userId), isNull(users.deletedAt)),
  });
}

export async function getUserProfile(
  userId: string,
  isOwnProfile: boolean,
): Promise<UserProfile | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  // Get vote count
  const voteCount = await getUserVoteCount(userId);

  const profile: UserProfile = {
    id: user.id,
    displayName: user.displayName,
    anonymousId: user.anonymousId,
    resolvedName: resolveDisplayName(user.displayName, user.anonymousId),
    memberSince: user.createdAt.toISOString(),
    submissionCount: user.submissionCount,
    voteCount,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
  };

  if (isOwnProfile) {
    profile.maskedEmail = maskEmail(user.email);
  }

  return profile;
}

export async function getUserVoteCount(userId: string): Promise<number> {
  try {
    const result = await db
      .select({ count: count() })
      .from(votes)
      .where(eq(votes.userId, userId));
    return result[0]?.count ?? 0;
  } catch {
    // Table may not exist yet -- return 0
    return 0;
  }
}

export async function getUserSubmissions(
  userId: string,
  cursor?: string,
  limit = 20,
  showOnlyApproved = true,
): Promise<{ items: UserSubmission[]; hasMore: boolean; nextCursor?: string }> {
  try {
    const conditions = [eq(submissions.authorId, userId)];

    if (showOnlyApproved) {
      conditions.push(eq(submissions.moderationStatus, 'approved'));
    }

    if (cursor) {
      const cursorSubmission = await db.query.submissions.findFirst({
        where: eq(submissions.id, cursor),
      });
      if (cursorSubmission) {
        conditions.push(lt(submissions.createdAt, cursorSubmission.createdAt));
      }
    }

    const items = await db
      .select()
      .from(submissions)
      .where(and(...conditions))
      .orderBy(desc(submissions.createdAt))
      .limit(limit + 1);

    const hasMore = items.length > limit;
    const result = items.slice(0, limit);

    return {
      items: result.map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        createdAt: s.createdAt.toISOString(),
        score: s.upvoteCount - s.downvoteCount,
        upvoteCount: s.upvoteCount,
        downvoteCount: s.downvoteCount,
        status: s.status as UserSubmission['status'],
        moderationStatus: s.moderationStatus as UserSubmission['moderationStatus'],
      })),
      hasMore,
      nextCursor: hasMore ? result[result.length - 1]?.id : undefined,
    };
  } catch {
    // Table may not exist yet
    return { items: [], hasMore: false };
  }
}

export async function getUserVotedSubmissions(
  userId: string,
  cursor?: string,
  limit = 20,
): Promise<{ items: UserVote[]; hasMore: boolean; nextCursor?: string }> {
  try {
    const conditions = [eq(votes.userId, userId)];

    if (cursor) {
      const cursorVote = await db.query.votes.findFirst({
        where: eq(votes.id, cursor),
      });
      if (cursorVote) {
        conditions.push(lt(votes.createdAt, cursorVote.createdAt));
      }
    }

    const items = await db
      .select({
        voteId: votes.id,
        voteType: votes.voteType,
        votedAt: votes.createdAt,
        submissionId: submissions.id,
        submissionTitle: submissions.title,
        submissionSlug: submissions.slug,
        upvoteCount: submissions.upvoteCount,
        downvoteCount: submissions.downvoteCount,
      })
      .from(votes)
      .innerJoin(submissions, eq(votes.submissionId, submissions.id))
      .where(and(...conditions))
      .orderBy(desc(votes.createdAt))
      .limit(limit + 1);

    const hasMore = items.length > limit;
    const result = items.slice(0, limit);

    return {
      items: result.map((v) => ({
        submissionId: v.submissionId,
        submissionTitle: v.submissionTitle,
        submissionSlug: v.submissionSlug,
        voteType: v.voteType as UserVote['voteType'],
        submissionScore: v.upvoteCount - v.downvoteCount,
        votedAt: v.votedAt.toISOString(),
      })),
      hasMore,
      nextCursor: hasMore ? result[result.length - 1]?.voteId : undefined,
    };
  } catch {
    // Table may not exist yet
    return { items: [], hasMore: false };
  }
}
