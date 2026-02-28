export interface SubmissionCardData {
  id: string;
  title: string;
  slug: string;
  description: string;
  sourceUrl: string;
  amount: string;
  costPerTaxpayer: string | null;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  hotScore: string;
  status: string;
  authorDisplay: string;
  createdAt: Date | string;
  costToNicolasResults: CostToNicolasResults | null;
  ministryTag: string | null;
  sourceCount?: number;
  pinnedNoteBody?: string | null;
}

export interface SubmissionDetailData extends SubmissionCardData {
  authorId: string | null;
  consequenceText: string | null;
  tweetUrl: string | null;
  ogImageUrl: string | null;
  updatedAt: Date | string;
  costCalculation: CostCalculationData | null;
  userVote: 'up' | 'down' | null;
}

export interface CostToNicolasResults {
  costPerCitizen?: number;
  costPerTaxpayer?: number;
  costPerHousehold?: number;
  daysOfWorkEquivalent?: number;
  equivalences?: Array<{
    label: string;
    value: number;
    unit: string;
  }>;
}

export interface CostCalculationData {
  id: string;
  amountEur: string;
  costPerCitizen: string | null;
  costPerTaxpayer: string | null;
  costPerHousehold: string | null;
  daysOfWorkEquivalent: string | null;
  equivalences: unknown;
  calculatedAt: Date | string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FeedResponse<T = any> {
  data: T[];
  error: null;
  meta: {
    cursor: string | null;
    hasMore: boolean;
  };
}
