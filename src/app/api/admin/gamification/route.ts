import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, xpEvents } from '@/lib/db/schema';
import { desc, sql, eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { z } from 'zod';

const manualXpSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().min(-10000).max(10000),
  reason: z.string().min(1).max(200),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return apiError('UNAUTHORIZED', 'Acces refuse', 403);
  }

  try {
    // Top XP earners
    const topUsers = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        anonymousId: users.anonymousId,
        totalXp: users.totalXp,
        currentStreak: users.currentStreak,
      })
      .from(users)
      .orderBy(desc(users.totalXp))
      .limit(20);

    // XP stats
    const [xpStats] = await db
      .select({
        totalXpAwarded: sql<number>`COALESCE(SUM(CASE WHEN ${xpEvents.xpAmount} > 0 THEN ${xpEvents.xpAmount} ELSE 0 END), 0)`,
        totalXpClawed: sql<number>`COALESCE(SUM(CASE WHEN ${xpEvents.xpAmount} < 0 THEN ABS(${xpEvents.xpAmount}) ELSE 0 END), 0)`,
        totalEvents: sql<number>`COUNT(*)`,
      })
      .from(xpEvents);

    // Recent XP events
    const recentEvents = await db
      .select({
        id: xpEvents.id,
        userId: xpEvents.userId,
        actionType: xpEvents.actionType,
        xpAmount: xpEvents.xpAmount,
        createdAt: xpEvents.createdAt,
      })
      .from(xpEvents)
      .orderBy(desc(xpEvents.createdAt))
      .limit(50);

    return apiSuccess({
      topUsers,
      xpStats: xpStats ?? { totalXpAwarded: 0, totalXpClawed: 0, totalEvents: 0 },
      recentEvents,
    });
  } catch (error) {
    console.error('Admin gamification error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return apiError('UNAUTHORIZED', 'Acces refuse', 403);
  }

  const body = await request.json();
  const parsed = manualXpSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
  }

  const { userId, amount, reason } = parsed.data;

  try {
    // Record XP event
    await db.insert(xpEvents).values({
      userId,
      actionType: 'admin_manual',
      xpAmount: amount,
      metadata: { reason, awardedBy: session.user.id },
    });

    // Update user total
    await db
      .update(users)
      .set({
        totalXp: sql`GREATEST(0, ${users.totalXp} + ${amount})`,
      })
      .where(eq(users.id, userId));

    return apiSuccess({ ok: true, amount, userId });
  } catch (error) {
    console.error('Admin manual XP error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
