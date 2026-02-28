'use client';

import { Badge } from '@/components/ui/badge';
import { FeatureVoteButton } from '@/components/features/feature-voting/FeatureVoteButton';
import { formatRelativeTime } from '@/lib/utils/format';
import {
  FEATURE_PROPOSAL_CATEGORIES,
  FEATURE_VOTE_STATUS_LABELS,
} from '@/lib/utils/validation';

interface FeatureProposalCardProps {
  feature: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    voteCount: number;
    authorDisplay: string;
    createdAt: string;
    userVote: number | null;
    rejectionReason?: string | null;
  };
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  proposed: 'outline',
  planned: 'secondary',
  in_progress: 'default',
  shipped: 'default',
  declined: 'destructive',
};

export function FeatureProposalCard({ feature }: FeatureProposalCardProps) {
  const statusLabel =
    FEATURE_VOTE_STATUS_LABELS[feature.status as keyof typeof FEATURE_VOTE_STATUS_LABELS] ??
    feature.status;
  const categoryLabel =
    FEATURE_PROPOSAL_CATEGORIES[feature.category as keyof typeof FEATURE_PROPOSAL_CATEGORIES] ??
    feature.category;

  return (
    <article
      className="flex gap-4 rounded-lg border border-border/50 bg-surface-elevated p-4"
      aria-label={`Proposition : ${feature.title}`}
    >
      {/* Vote button */}
      <div className="shrink-0">
        <FeatureVoteButton
          featureId={feature.id}
          initialVoteCount={feature.voteCount}
          initialUserVote={feature.userVote}
        />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-text-primary">{feature.title}</h3>
          <Badge
            variant={STATUS_VARIANTS[feature.status] ?? 'outline'}
            className="shrink-0 text-xs"
          >
            {statusLabel}
          </Badge>
        </div>

        <p className="text-sm text-text-secondary line-clamp-2">
          {feature.description}
        </p>

        {feature.rejectionReason && feature.status === 'declined' && (
          <p className="text-xs text-destructive">
            Raison du refus : {feature.rejectionReason}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Badge variant="outline" className="text-xs">
            {categoryLabel}
          </Badge>
          <span aria-hidden="true">-</span>
          <span>{feature.authorDisplay}</span>
          <span aria-hidden="true">-</span>
          <span>{formatRelativeTime(feature.createdAt)}</span>
        </div>
      </div>
    </article>
  );
}
