export interface UserProfile {
  id: string;
  displayName: string | null;
  anonymousId: string;
  resolvedName: string;
  maskedEmail?: string;
  memberSince: string;
  submissionCount: number;
  voteCount: number;
  avatarUrl: string | null;
  bio: string | null;
  karma: number;
  karmaTier?: {
    label: string;
    emoji: string;
    color: string;
  };
}

export interface UserSubmission {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  score: number;
  upvoteCount: number;
  downvoteCount: number;
  status: 'draft' | 'published' | 'hidden' | 'deleted';
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
}

export interface UserVote {
  submissionId: string;
  submissionTitle: string;
  submissionSlug: string;
  voteType: 'up' | 'down';
  submissionScore: number;
  votedAt: string;
}
