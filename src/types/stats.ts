export interface StatsData {
  totals: {
    submissions: number;
    totalAmountEur: number;
    totalUpvotes: number;
    uniqueVoters: number;
  };
  byCategory: Array<{
    category: string;
    count: number;
    totalAmount: number;
  }>;
  top10: Array<{
    id: string;
    title: string;
    amount: number;
    ministryTag: string | null;
  }>;
  overTime: Array<{
    month: string;
    count: number;
    cumulativeAmount: number;
  }>;
}
