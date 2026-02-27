'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  formatEUR,
  formatEURPrecise,
  formatRelativeTime,
  extractDomain,
  truncate,
} from '@/lib/utils/format';
import { VoteButton } from '@/components/features/voting/VoteButton';
import { MessageSquare } from 'lucide-react';
import type { SubmissionCardData } from '@/types/submission';

interface SubmissionCardProps {
  submission: SubmissionCardData;
}

/**
 * Determine outrage tier border color based on cost per taxpayer.
 */
function getOutrageTierBorderColor(costPerTaxpayer: string | null): string {
  if (!costPerTaxpayer) return 'border-l-border-default';
  const cost = parseFloat(costPerTaxpayer);
  if (cost >= 10) return 'border-l-chainsaw-red';
  if (cost >= 1) return 'border-l-warning';
  if (cost >= 0.1) return 'border-l-info';
  return 'border-l-text-muted';
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const score = submission.upvoteCount - submission.downvoteCount;

  return (
    <article
      role="article"
      aria-label={`${submission.title}, score: ${score}, cout: ${formatEUR(submission.amount)}`}
      className={cn(
        'rounded-lg border border-border-default bg-surface-secondary',
        'transition-colors hover:bg-surface-elevated',
        'border-l-4',
        getOutrageTierBorderColor(submission.costPerTaxpayer),
      )}
    >
      <div className="flex gap-3 p-4">
        {/* Vote buttons - desktop (left side) */}
        <div className="hidden md:flex">
          <VoteButton
            submissionId={submission.id}
            serverCounts={{
              up: submission.upvoteCount,
              down: submission.downvoteCount,
            }}
          />
        </div>

        {/* Card content */}
        <div className="min-w-0 flex-1">
          <Link
            href={`/s/${submission.id}`}
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-secondary rounded"
          >
            <h3 className="text-base font-semibold text-text-primary line-clamp-2 group-hover:text-chainsaw-red transition-colors md:text-lg">
              {truncate(submission.title, 120)}
            </h3>
          </Link>

          {submission.description && (
            <p className="mt-1 text-sm text-text-secondary line-clamp-2">
              {truncate(submission.description, 200)}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted md:text-sm">
            <span className="font-semibold text-chainsaw-red">
              {formatEUR(submission.amount)}
            </span>

            {submission.costPerTaxpayer && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {formatEURPrecise(submission.costPerTaxpayer)}/citoyen
                </span>
              </>
            )}

            <span aria-hidden="true">·</span>
            <span>{extractDomain(submission.sourceUrl)}</span>

            <span aria-hidden="true">·</span>
            <time
              dateTime={
                typeof submission.createdAt === 'string'
                  ? submission.createdAt
                  : submission.createdAt.toISOString()
              }
            >
              {formatRelativeTime(submission.createdAt)}
            </time>

            {submission.commentCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  {submission.commentCount}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Vote buttons - mobile (right side) */}
        <div className="flex md:hidden">
          <VoteButton
            submissionId={submission.id}
            serverCounts={{
              up: submission.upvoteCount,
              down: submission.downvoteCount,
            }}
          />
        </div>
      </div>
    </article>
  );
}
