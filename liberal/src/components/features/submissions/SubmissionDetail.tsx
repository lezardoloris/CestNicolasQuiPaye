'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VoteButton } from '@/components/features/voting/VoteButton';
import {
  formatEUR,
  formatRelativeTime,
  extractDomain,
} from '@/lib/utils/format';
interface SubmissionDetailProps {
  submission: {
    id: string;
    title: string;
    description: string;
    sourceUrl: string;
    amount: string;
    costPerTaxpayer: string | null;
    upvoteCount: number;
    downvoteCount: number;
    commentCount: number;
    status: string;
    authorDisplay: string;
    authorId: string | null;
    createdAt: Date | string;
    userVote: 'up' | 'down' | null;
    ministryTag: string | null;
  };
  currentUserId?: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  published: { label: 'Publie', variant: 'default' },
  draft: { label: 'Brouillon', variant: 'secondary' },
  hidden: { label: 'Masque', variant: 'outline' },
  deleted: { label: 'Supprime', variant: 'destructive' },
};

export function SubmissionDetail({
  submission,
  currentUserId,
}: SubmissionDetailProps) {
  const isAuthor = currentUserId && submission.authorId === currentUserId;
  const statusInfo = STATUS_LABELS[submission.status];

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/feed/hot"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour au fil
      </Link>

      {/* Title and status */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
            {submission.title}
          </h1>

          {/* Vote buttons */}
          <div className="shrink-0">
            <VoteButton
              submissionId={submission.id}
              serverCounts={{
                up: submission.upvoteCount,
                down: submission.downvoteCount,
              }}
              serverVote={submission.userVote}
            />
          </div>
        </div>

        {/* Status badge - only visible to author */}
        {isAuthor && statusInfo && (
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        )}

        {/* Ministry tag */}
        {submission.ministryTag && (
          <Badge variant="outline" className="text-text-muted">
            {submission.ministryTag}
          </Badge>
        )}
      </div>

      {/* Author and date */}
      <p className="text-sm text-text-secondary">
        Soumis par{' '}
        <span className="font-medium text-text-primary">
          {submission.authorDisplay}
        </span>{' '}
        {formatRelativeTime(submission.createdAt)}
      </p>

      {/* Estimated cost */}
      <div className="rounded-lg bg-surface-elevated p-4">
        <p className="text-sm text-text-muted">Cout estime</p>
        <p className="mt-1 font-display text-3xl font-bold text-chainsaw-red">
          {formatEUR(submission.amount)}
        </p>
        {submission.costPerTaxpayer && (
          <p className="mt-1 text-sm text-text-secondary">
            soit environ{' '}
            <span className="font-semibold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(parseFloat(submission.costPerTaxpayer))}
            </span>{' '}
            par citoyen
          </p>
        )}
      </div>

      <Separator />

      {/* Description */}
      <div className="prose prose-invert max-w-none">
        <p className="whitespace-pre-wrap text-text-primary leading-relaxed">
          {submission.description}
        </p>
      </div>

      <Separator />

      {/* Source URL */}
      <div className="space-y-2">
        <Button
          variant="outline"
          asChild
          className="gap-2"
        >
          <a
            href={submission.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Verifier la source
          </a>
        </Button>
        <p className="text-xs text-text-muted">
          Source : {extractDomain(submission.sourceUrl)}
        </p>
      </div>
    </div>
  );
}
