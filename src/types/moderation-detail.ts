export interface ModerationActionRecord {
  id: string;
  action: 'approve' | 'reject' | 'request_edit' | 'remove';
  reason: string | null;
  adminDisplay: string;
  createdAt: string;
}

export interface AiContextData {
  budgetContext: string | null;
  costComparison: string | null;
  summary: string | null;
  voteSummary: string | null;
  solutionSummary: string | null;
  relatedFacts: string[] | null;
  source: string;
}

export interface ModerationDetailData {
  id: string;
  title: string;
  description: string;
  amount: string;
  sourceUrl: string;
  ministryTag: string | null;
  authorDisplay: string;
  moderationStatus: string;
  createdAt: string;
  updatedAt: string;

  costPerTaxpayer: string | null;

  upvoteCount: number;
  downvoteCount: number;
  fourPosEssentielCount: number;
  fourPosJustifieCount: number;
  fourPosDiscutableCount: number;
  fourPosInjustifieCount: number;
  fourPosTotalCount: number;
  consensusType: string | null;
  approveWeight: number;
  rejectWeight: number;

  solutionCount: number;
  noteCount: number;
  sourceCount: number;

  aiContext: AiContextData | null;
  moderationHistory: ModerationActionRecord[];
}
