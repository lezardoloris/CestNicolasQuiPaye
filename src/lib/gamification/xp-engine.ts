import { db } from '@/lib/db';
import { xpEvents, users } from '@/lib/db/schema';
import { eq, and, sql, gte } from 'drizzle-orm';
import { XP_TABLE, getLevelFromXp, STREAK_FREEZE_MILESTONES } from './xp-config';
import type { xpActionType } from '@/lib/db/schema';

type XpActionType = (typeof xpActionType.enumValues)[number];

export interface XpAwardResult {
  awarded: boolean;
  xpAmount: number;
  totalXp: number;
  leveledUp: boolean;
  newLevel: number | null;
  newLevelTitle: string | null;
  streakUpdated: boolean;
  currentStreak: number;
  dailyBonusAwarded: boolean;
  dailyBonusXp: number;
  newBadges: string[];
  streakFreezeEarned: boolean;
}

/**
 * Get start of today in Paris timezone.
 */
function getTodayParis(): string {
  const now = new Date();
  const parisDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  return `${parisDate.getFullYear()}-${String(parisDate.getMonth() + 1).padStart(2, '0')}-${String(parisDate.getDate()).padStart(2, '0')}`;
}

/**
 * Get yesterday's date in Paris timezone.
 */
function getYesterdayParis(): string {
  const now = new Date();
  const parisDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  parisDate.setDate(parisDate.getDate() - 1);
  return `${parisDate.getFullYear()}-${String(parisDate.getMonth() + 1).padStart(2, '0')}-${String(parisDate.getDate()).padStart(2, '0')}`;
}

/**
 * Check if the user has already earned XP for this exact (action, entity) combo (idempotent).
 */
async function hasExistingXpEvent(
  userId: string,
  actionType: XpActionType,
  relatedEntityId: string | null,
): Promise<boolean> {
  if (!relatedEntityId) return false;

  const existing = await db
    .select({ id: xpEvents.id })
    .from(xpEvents)
    .where(
      and(
        eq(xpEvents.userId, userId),
        eq(xpEvents.actionType, actionType),
        eq(xpEvents.relatedEntityId, relatedEntityId),
      ),
    )
    .limit(1);

  return existing.length > 0;
}

/**
 * Check daily limit for a specific action type.
 */
async function getDailyActionCount(
  userId: string,
  actionType: XpActionType,
): Promise<number> {
  const todayStart = getTodayParis();

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(xpEvents)
    .where(
      and(
        eq(xpEvents.userId, userId),
        eq(xpEvents.actionType, actionType),
        gte(xpEvents.createdAt, sql`${todayStart}::date`),
      ),
    );

  return result?.count ?? 0;
}

/**
 * Award XP to a user. This is the main entry point for the gamification engine.
 * Handles: idempotency, daily limits, XP recording, total update, streak, daily bonus, badge check.
 */
export async function awardXp(
  userId: string,
  actionType: XpActionType,
  relatedEntityId?: string | null,
  relatedEntityType?: string | null,
  customAmount?: number,
  metadata?: Record<string, unknown>,
): Promise<XpAwardResult> {
  const result: XpAwardResult = {
    awarded: false,
    xpAmount: 0,
    totalXp: 0,
    leveledUp: false,
    newLevel: null,
    newLevelTitle: null,
    streakUpdated: false,
    currentStreak: 0,
    dailyBonusAwarded: false,
    dailyBonusXp: 0,
    newBadges: [],
    streakFreezeEarned: false,
  };

  try {
    // 1. Idempotency check (skip for actions without entity or unlimited actions)
    if (relatedEntityId && actionType !== 'admin_manual' && actionType !== 'clawback') {
      const exists = await hasExistingXpEvent(userId, actionType, relatedEntityId);
      if (exists) {
        // Return current state without awarding
        const [user] = await db
          .select({ totalXp: users.totalXp, currentStreak: users.currentStreak })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        result.totalXp = user?.totalXp ?? 0;
        result.currentStreak = user?.currentStreak ?? 0;
        return result;
      }
    }

    // 2. Determine XP amount
    const config = XP_TABLE[actionType];
    const xpAmount = customAmount ?? config.xp;

    // 3. Check daily limit
    if (config.maxPerDay !== null && actionType !== 'admin_manual' && actionType !== 'clawback') {
      const dailyCount = await getDailyActionCount(userId, actionType);
      if (dailyCount >= config.maxPerDay) {
        const [user] = await db
          .select({ totalXp: users.totalXp, currentStreak: users.currentStreak })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        result.totalXp = user?.totalXp ?? 0;
        result.currentStreak = user?.currentStreak ?? 0;
        return result;
      }
    }

    // 4. Get current user state before update
    const [userBefore] = await db
      .select({
        totalXp: users.totalXp,
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak,
        lastActiveDate: users.lastActiveDate,
        streakFreezeCount: users.streakFreezeCount,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userBefore) return result;

    const previousLevel = getLevelFromXp(userBefore.totalXp);
    const todayParis = getTodayParis();
    const yesterdayParis = getYesterdayParis();

    // 5. Insert XP event
    await db.insert(xpEvents).values({
      userId,
      actionType,
      xpAmount,
      relatedEntityId: relatedEntityId ?? undefined,
      relatedEntityType: relatedEntityType ?? undefined,
      metadata: metadata ?? undefined,
    });

    // 6. Check for daily bonus (first action of the day)
    if (actionType !== 'daily_bonus' && actionType !== 'clawback' && actionType !== 'admin_manual') {
      const todayBonusCount = await getDailyActionCount(userId, 'daily_bonus');
      if (todayBonusCount === 0) {
        const dailyBonusXp = XP_TABLE.daily_bonus.xp;
        await db.insert(xpEvents).values({
          userId,
          actionType: 'daily_bonus',
          xpAmount: dailyBonusXp,
        });
        result.dailyBonusAwarded = true;
        result.dailyBonusXp = dailyBonusXp;
      }
    }

    const totalXpGain = xpAmount + (result.dailyBonusAwarded ? result.dailyBonusXp : 0);

    // 7. Update streak
    let newStreak = userBefore.currentStreak;
    let newLongestStreak = userBefore.longestStreak;
    let streakFreezeEarned = false;

    if (actionType !== 'clawback' && actionType !== 'admin_manual') {
      const lastActive = userBefore.lastActiveDate;

      if (lastActive === todayParis) {
        // Already active today — no streak change
      } else if (lastActive === yesterdayParis) {
        // Consecutive day — increment streak
        newStreak = userBefore.currentStreak + 1;
        result.streakUpdated = true;
      } else if (lastActive === null) {
        // First ever activity
        newStreak = 1;
        result.streakUpdated = true;
      } else {
        // Missed a day — check for streak freeze
        if (userBefore.streakFreezeCount > 0) {
          // Use a freeze — preserve streak and increment
          newStreak = userBefore.currentStreak + 1;
          result.streakUpdated = true;
          // Decrement freeze count below
        } else {
          // Reset streak
          newStreak = 1;
          result.streakUpdated = true;
        }
      }

      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
      }

      // Check for streak freeze milestone
      if (STREAK_FREEZE_MILESTONES.includes(newStreak) && result.streakUpdated) {
        streakFreezeEarned = true;
      }
    }

    // 8. Update user atomically
    const usedFreeze =
      actionType !== 'clawback' &&
      actionType !== 'admin_manual' &&
      userBefore.lastActiveDate !== null &&
      userBefore.lastActiveDate !== todayParis &&
      userBefore.lastActiveDate !== yesterdayParis &&
      userBefore.streakFreezeCount > 0;

    await db
      .update(users)
      .set({
        totalXp: sql`${users.totalXp} + ${totalXpGain}`,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: actionType !== 'clawback' ? todayParis : userBefore.lastActiveDate,
        streakFreezeCount: usedFreeze
          ? sql`greatest(${users.streakFreezeCount} - 1, 0)`
          : streakFreezeEarned
            ? sql`${users.streakFreezeCount} + 1`
            : users.streakFreezeCount,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // 9. Get updated totals
    const [userAfter] = await db
      .select({ totalXp: users.totalXp, currentStreak: users.currentStreak })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const newTotalXp = userAfter?.totalXp ?? 0;
    const newLevelInfo = getLevelFromXp(newTotalXp);

    result.awarded = true;
    result.xpAmount = xpAmount;
    result.totalXp = newTotalXp;
    result.currentStreak = userAfter?.currentStreak ?? 0;
    result.streakFreezeEarned = streakFreezeEarned;

    if (newLevelInfo.level > previousLevel.level) {
      result.leveledUp = true;
      result.newLevel = newLevelInfo.level;
      result.newLevelTitle = newLevelInfo.title;
    }

    // 10. Badge evaluation (async, don't block response)
    evaluateBadges(userId, actionType, newTotalXp, newStreak).then(() => {
      // Badges are stored in DB; the client will fetch them separately
    }).catch(console.error);

    return result;
  } catch (error) {
    console.error('XP award error:', error);
    return result;
  }
}

/**
 * Clawback XP for content that was later rejected/removed.
 */
export async function clawbackXp(
  userId: string,
  relatedEntityId: string,
  relatedEntityType: string,
): Promise<void> {
  // Find all XP events for this entity
  const events = await db
    .select({ xpAmount: xpEvents.xpAmount })
    .from(xpEvents)
    .where(
      and(
        eq(xpEvents.userId, userId),
        eq(xpEvents.relatedEntityId, relatedEntityId),
        sql`${xpEvents.actionType} != 'clawback'`,
      ),
    );

  const totalToClawback = events.reduce((sum, e) => sum + e.xpAmount, 0);

  if (totalToClawback <= 0) return;

  // Record clawback event
  await db.insert(xpEvents).values({
    userId,
    actionType: 'clawback',
    xpAmount: -totalToClawback,
    relatedEntityId,
    relatedEntityType,
    metadata: { reason: 'content_removed' },
  });

  // Decrement user's totalXp (never below 0)
  await db
    .update(users)
    .set({
      totalXp: sql`greatest(${users.totalXp} - ${totalToClawback}, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

/**
 * Evaluate badges for a user after an XP event.
 */
async function evaluateBadges(
  userId: string,
  _actionType: XpActionType,
  _totalXp: number,
  currentStreak: number,
): Promise<string[]> {
  const { badgeDefinitions, userBadges } = await import('@/lib/db/schema');
  const newBadges: string[] = [];

  try {
    // Get all badge definitions
    const allBadges = await db.select().from(badgeDefinitions);

    // Get user's existing badges
    const existingBadges = await db
      .select({ badgeDefinitionId: userBadges.badgeDefinitionId })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    const earnedIds = new Set(existingBadges.map((b) => b.badgeDefinitionId));

    for (const badge of allBadges) {
      if (earnedIds.has(badge.id)) continue;

      const criteria = badge.criteria as { type: string; actionType?: string; count?: number; days?: number };
      let earned = false;

      if (criteria.type === 'xp_action_count' && criteria.actionType && criteria.count) {
        const [result] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(xpEvents)
          .where(
            and(
              eq(xpEvents.userId, userId),
              eq(xpEvents.actionType, criteria.actionType as XpActionType),
              sql`${xpEvents.xpAmount} > 0`,
            ),
          );
        earned = (result?.count ?? 0) >= criteria.count;
      } else if (criteria.type === 'streak_days' && criteria.days) {
        earned = currentStreak >= criteria.days;
      }

      if (earned) {
        await db.insert(userBadges).values({
          userId,
          badgeDefinitionId: badge.id,
        }).onConflictDoNothing();
        newBadges.push(badge.slug);
      }
    }
  } catch (error) {
    console.error('Badge evaluation error:', error);
  }

  return newBadges;
}

/**
 * Get user's gamification stats for API responses.
 */
export async function getUserGamificationStats(userId: string) {
  const [user] = await db
    .select({
      totalXp: users.totalXp,
      currentStreak: users.currentStreak,
      longestStreak: users.longestStreak,
      lastActiveDate: users.lastActiveDate,
      streakFreezeCount: users.streakFreezeCount,
      dailyGoal: users.dailyGoal,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  // Get today's XP
  const todayParis = getTodayParis();
  const [todayResult] = await db
    .select({ total: sql<number>`coalesce(sum(${xpEvents.xpAmount}), 0)::int` })
    .from(xpEvents)
    .where(
      and(
        eq(xpEvents.userId, userId),
        gte(xpEvents.createdAt, sql`${todayParis}::date`),
      ),
    );

  const todayXp = todayResult?.total ?? 0;

  // Get XP breakdown by action type
  const breakdown = await db
    .select({
      actionType: xpEvents.actionType,
      total: sql<number>`coalesce(sum(${xpEvents.xpAmount}), 0)::int`,
    })
    .from(xpEvents)
    .where(eq(xpEvents.userId, userId))
    .groupBy(xpEvents.actionType);

  // Get user badges
  const { userBadges, badgeDefinitions } = await import('@/lib/db/schema');
  const badges = await db
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

  const levelProgress = (await import('./xp-config')).getLevelProgress(user.totalXp);

  return {
    totalXp: user.totalXp,
    todayXp,
    dailyGoal: user.dailyGoal,
    dailyGoalProgress: Math.min(100, Math.floor((todayXp / user.dailyGoal) * 100)),
    level: levelProgress.current.level,
    levelTitle: levelProgress.current.title,
    nextLevelXp: levelProgress.next?.minXp ?? null,
    progressPercent: levelProgress.progressPercent,
    xpInLevel: levelProgress.xpInLevel,
    xpForLevel: levelProgress.xpForLevel,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    streakFreezeCount: user.streakFreezeCount,
    xpBreakdown: Object.fromEntries(breakdown.map((b) => [b.actionType, b.total])),
    badges,
  };
}
