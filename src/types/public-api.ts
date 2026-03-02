// ─── Public API Response Types ──────────────────────────────────
// These types strip all private fields (email, passwordHash, authorId, ipHash)

export interface PublicSubmission {
  id: string;
  title: string;
  slug: string;
  description: string;
  sourceUrl: string;
  amount: number;
  category: string | null;
  author: {
    displayName: string;
    anonymousId: string;
  };
  votes: {
    up: number;
    down: number;
    score: number;
  };
  commentCount: number;
  costPerTaxpayer: number | null;
  costToNicolas: PublicCostCalculation | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicCostCalculation {
  amountEur: number;
  costPerCitizen: number | null;
  costPerTaxpayer: number | null;
  costPerHousehold: number | null;
  daysOfWorkEquivalent: number | null;
  equivalences: unknown;
}

export interface PublicSubmissionDetail extends PublicSubmission {
  sources: PublicSource[];
  communityNotes: PublicCommunityNote[];
  solutions: PublicSolution[];
}

export interface PublicSource {
  id: string;
  url: string;
  title: string;
  sourceType: string;
  validationCount: number;
  createdAt: string;
}

export interface PublicCommunityNote {
  id: string;
  authorDisplay: string;
  body: string;
  sourceUrl: string | null;
  upvoteCount: number;
  downvoteCount: number;
  isPinned: boolean;
  createdAt: string;
}

export interface PublicSolution {
  id: string;
  authorDisplay: string;
  body: string;
  upvoteCount: number;
  downvoteCount: number;
  createdAt: string;
}

export interface PublicCategory {
  slug: string;
  label: string;
}

export interface PublicExportRow {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string | null;
  sourceUrl: string;
  votesUp: number;
  votesDown: number;
  commentCount: number;
  costPerTaxpayer: number | null;
  createdAt: string;
}
