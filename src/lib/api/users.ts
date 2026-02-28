import { db } from '@/lib/db';
import { users, submissions, votes, submissionSources, communityNotes } from '@/lib/db/schema';
import { eq, and, isNull, desc, lt, count } from 'drizzle-orm';
import { resolveDisplayName, maskEmail } from '@/lib/utils/user-display';
import { calculateKarma, getKarmaTier } from '@/lib/utils/karma';
import { getLevelProgress } from '@/lib/gamification/xp-config';
import { userBadges, badgeDefinitions } from '@/lib/db/schema';
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

  // Get activity counts
  const voteCount = await getUserVoteCount(userId);

  let sourceCount = 0;
  let noteCount = 0;
  try {
    const [srcResult] = await db
      .select({ count: count() })
      .from(submissionSources)
      .where(eq(submissionSources.addedBy, userId));
    sourceCount = srcResult?.count ?? 0;

    const [noteResult] = await db
      .select({ count: count() })
      .from(communityNotes)
      .where(and(eq(communityNotes.authorId, userId), isNull(communityNotes.deletedAt)));
    noteCount = noteResult?.count ?? 0;
  } catch {
    // Tables may not exist yet
  }

  const karma = calculateKarma({
    submissionCount: user.submissionCount,
    voteCount,
    sourceCount,
    noteCount,
    shareCount: 0,
  });

  // Compute rank: count users with higher karma
  let rank = 1;
  try {
    const allUsers = await db
      .select({
        id: users.id,
        submissionCount: users.submissionCount,
      })
      .from(users)
      .where(isNull(users.deletedAt));

    // Count users with higher karma (simplified: only use submissionCount + voteCount for ranking)
    const usersAbove = allUsers.filter((u) => {
      if (u.id === userId) return false;
      // Approximate: use submissionCount * 10 as minimum karma
      return u.submissionCount * 10 > karma;
    });
    rank = usersAbove.length + 1;
  } catch {
    // Fallback
  }

  const tier = rank <= 100 ? getKarmaTier(rank) : undefined;

  // Gamification data
  const totalXp = user.totalXp ?? 0;
  const levelProgress = getLevelProgress(totalXp);

  let earnedBadges: Array<{ slug: string; name: string; description: string; category: string; earnedAt: string }> = [];
  try {
    const rawBadges = await db
      .select({
        slug: badgeDefinitions.slug,
        name: badgeDefinitions.name,
        description: badgeDefinitions.description,
        category: badgeDefinitions.category,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .innerJoin(badgeDefinitions, eq(userBadges.badgeDefinitionId, badgeDefinitions.id))
      .where(eq(userBadges.userId, userId));
    earnedBadges = rawBadges.map((b) => ({
      ...b,
      earnedAt: b.earnedAt.toISOString(),
    }));
  } catch {
    // Tables may not exist yet
  }

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
    karma,
    karmaTier: tier ? { label: tier.label, emoji: tier.emoji, color: tier.color } : undefined,
    totalXp,
    level: levelProgress.current.level,
    levelTitle: levelProgress.current.title,
    progressPercent: levelProgress.progressPercent,
    currentStreak: user.currentStreak ?? 0,
    longestStreak: user.longestStreak ?? 0,
    streakFreezeCount: user.streakFreezeCount ?? 0,
    badges: earnedBadges,
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
