import { db } from '@/lib/db';
import { submissions, votes, ipVotes } from '@/lib/db/schema';
import { eq, sql, desc, gte, and } from 'drizzle-orm';
import type { StatsData } from '@/types/stats';

const TAXPAYER_COUNT = 40_000_000;

export interface PlatformStats {
  totalSubmissions: number;
  totalAmountEur: number;
  totalUniqueVoters: number;
  costPerTaxpayer: number;
  submissionsThisWeek: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [submissionStats, authVoters, anonVoters, recentStats] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`coalesce(sum(${submissions.amount}::numeric), 0)`,
      })
      .from(submissions)
      .where(eq(submissions.status, 'published')),

    db
      .select({
        count: sql<number>`count(distinct ${votes.userId})`,
      })
      .from(votes),

    db
      .select({
        count: sql<number>`count(distinct ${ipVotes.ipHash})`,
      })
      .from(ipVotes),

    db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(submissions)
      .where(and(eq(submissions.status, 'published'), gte(submissions.createdAt, oneWeekAgo))),
  ]);

  const totalAmountEur = Number(submissionStats[0]?.totalAmount) || 0;

  return {
    totalSubmissions: Number(submissionStats[0]?.count) || 0,
    totalAmountEur,
    totalUniqueVoters: (Number(authVoters[0]?.count) || 0) + (Number(anonVoters[0]?.count) || 0),
    costPerTaxpayer: totalAmountEur / TAXPAYER_COUNT,
    submissionsThisWeek: Number(recentStats[0]?.count) || 0,
  };
}

export async function getFullStats(): Promise<StatsData> {
  const [totalsRow, authVoters, anonVoters, byCategory, top10, overTime] = await Promise.all([
    // Totals
    db
      .select({
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`coalesce(sum(${submissions.amount}::numeric), 0)`,
        totalUpvotes: sql<number>`coalesce(sum(${submissions.upvoteCount}), 0)`,
      })
      .from(submissions)
      .where(eq(submissions.status, 'published')),

    // Auth voters
    db.select({ count: sql<number>`count(distinct ${votes.userId})` }).from(votes),

    // Anon voters
    db.select({ count: sql<number>`count(distinct ${ipVotes.ipHash})` }).from(ipVotes),

    // By category
    db
      .select({
        category: sql<string>`coalesce(${submissions.ministryTag}, 'Autre')`,
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`coalesce(sum(${submissions.amount}::numeric), 0)`,
      })
      .from(submissions)
      .where(eq(submissions.status, 'published'))
      .groupBy(submissions.ministryTag)
      .orderBy(desc(sql`sum(${submissions.amount}::numeric)`)),

    // Top 10 by amount
    db
      .select({
        id: submissions.id,
        title: submissions.title,
        amount: sql<number>`${submissions.amount}::numeric`,
        ministryTag: submissions.ministryTag,
      })
      .from(submissions)
      .where(eq(submissions.status, 'published'))
      .orderBy(desc(sql`${submissions.amount}::numeric`))
      .limit(10),

    // Over time (monthly)
    db
      .select({
        month: sql<string>`to_char(${submissions.createdAt}, 'YYYY-MM')`,
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`coalesce(sum(${submissions.amount}::numeric), 0)`,
      })
      .from(submissions)
      .where(eq(submissions.status, 'published'))
      .groupBy(sql`to_char(${submissions.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${submissions.createdAt}, 'YYYY-MM')`),
  ]);

  // Coerce all DB values to real JS numbers (PostgreSQL numeric → string)
  const n = (v: unknown): number => Number(v) || 0;

  // Compute cumulative amounts
  let cumulative = 0;
  const timelineData = overTime.map((row) => {
    cumulative += n(row.totalAmount);
    return {
      month: row.month,
      count: n(row.count),
      cumulativeAmount: cumulative,
    };
  });

  return {
    totals: {
      submissions: n(totalsRow[0]?.count),
      totalAmountEur: n(totalsRow[0]?.totalAmount),
      totalUpvotes: n(totalsRow[0]?.totalUpvotes),
      uniqueVoters: n(authVoters[0]?.count) + n(anonVoters[0]?.count),
    },
    byCategory: byCategory.map((r) => ({
      category: r.category,
      count: n(r.count),
      totalAmount: n(r.totalAmount),
    })),
    top10: top10.map((r) => ({
      id: r.id,
      title: r.title,
      amount: n(r.amount),
      ministryTag: r.ministryTag,
    })),
    overTime: timelineData,
  };
}
