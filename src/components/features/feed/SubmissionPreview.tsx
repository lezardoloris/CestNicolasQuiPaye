'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  formatCompactEUR,
  formatEURPrecise,
  formatRelativeTime,
} from '@/lib/utils/format';
import { ShareButton } from '@/components/features/sharing/ShareButton';
import { PinnedNote } from '@/components/features/notes/PinnedNote';
import { SolutionSection } from '@/components/features/solutions/SolutionSection';
import { CommentSection } from '@/components/features/comments/CommentSection';
import { VoteProminentButtons } from '@/components/features/voting/VoteProminentButtons';
import { FourPositionVoting } from '@/components/features/voting/FourPositionVoting';
import { X, ExternalLink, ArrowRight, Flame } from 'lucide-react';
import { getCategoryDef } from '@/lib/constants/categories';
import { useFeedPreviewStore } from '@/stores/feed-preview-store';
import type { SubmissionCardData } from '@/types/submission';

interface SubmissionPreviewProps {
  submission: SubmissionCardData;
}

export function SubmissionPreview({ submission }: SubmissionPreviewProps) {
  const clearSelectedSubmission = useFeedPreviewStore((s) => s.clearSelectedSubmission);
  const category = getCategoryDef(submission.ministryTag);
  const costPerTaxpayer = submission.costPerTaxpayer;
  const isExtreme = costPerTaxpayer ? parseFloat(costPerTaxpayer) >= 10 : false;

  const sourceDomain = (() => {
    try {
      return new URL(submission.sourceUrl).hostname.replace('www.', '');
    } catch {
      return null;
    }
  })();

  return (
    <div className="max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-border-default bg-surface-primary">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-default bg-surface-primary/95 px-5 py-2.5 backdrop-blur-sm">
        <span className="text-xs font-medium text-text-muted">Aperçu</span>
        <button
          onClick={clearSelectedSubmission}
          className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
          aria-label="Fermer l'aperçu"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="px-5 py-4">
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
          {category && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4',
                category.color,
                category.bgColor,
              )}
            >
              <category.icon className="size-3" aria-hidden="true" />
              {category.label}
            </span>
          )}
          <span aria-hidden="true">&middot;</span>
          <time
            dateTime={
              typeof submission.createdAt === 'string'
                ? submission.createdAt
                : submission.createdAt.toISOString()
            }
          >
            {formatRelativeTime(submission.createdAt)}
          </time>
          {sourceDomain && (
            <>
              <span aria-hidden="true">&middot;</span>
              <a
                href={submission.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-text-primary"
              >
                <ExternalLink className="size-3" />
                {sourceDomain}
              </a>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-2 text-lg font-bold leading-snug text-text-primary">
          {submission.title}
        </h3>

        {/* Cost */}
        <div className="mt-2 flex items-center gap-2.5">
          <span
            className={cn(
              'text-base font-bold tabular-nums',
              isExtreme ? 'text-chainsaw-red' : 'text-chainsaw-red/90',
            )}
          >
            {isExtreme && <Flame className="mr-0.5 inline size-4" aria-hidden="true" />}
            {formatCompactEUR(Number(submission.amount))}
          </span>
          {costPerTaxpayer && (
            <span className="text-sm font-medium tabular-nums text-text-muted">
              ({formatEURPrecise(costPerTaxpayer)}/citoyen)
            </span>
          )}
        </div>

        {/* Description */}
        {submission.description && (
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            {submission.description}
          </p>
        )}

        {/* Pinned community note */}
        {submission.pinnedNoteBody && (
          <div className="mt-3">
            <PinnedNote body={submission.pinnedNoteBody} />
          </div>
        )}

        {/* ─── Two-column: Votes | Solutions + Comments ─── */}
        <div className="mt-5 grid grid-cols-1 gap-5 border-t border-border-default pt-5 lg:grid-cols-2">
          {/* Left: Voting */}
          <div className="space-y-4">
            <VoteProminentButtons
              submissionId={submission.id}
              serverCounts={{
                up: submission.upvoteCount,
                down: submission.downvoteCount,
              }}
            />
            <FourPositionVoting submissionId={submission.id} variant="full" />
          </div>

          {/* Right: Solutions + Comments */}
          <div className="space-y-5 border-t border-border-default pt-4 lg:border-t-0 lg:border-l lg:border-border-default lg:pt-0 lg:pl-5">
            <SolutionSection submissionId={submission.id} />

            <div className="border-t border-border-default pt-4">
              <CommentSection
                submissionId={submission.id}
                commentCount={submission.commentCount}
              />
            </div>
          </div>
        </div>

        {/* Footer: share + full page link */}
        <div className="mt-4 flex items-center gap-2 border-t border-border-default pt-3">
          <ShareButton
            submissionId={submission.id}
            title={submission.title}
            costPerTaxpayer={
              submission.costPerTaxpayer
                ? parseFloat(submission.costPerTaxpayer)
                : undefined
            }
            variant="compact"
            className="h-auto min-h-0 min-w-0 rounded-full border-none bg-transparent px-2.5 py-1 text-xs font-medium text-text-muted shadow-none hover:bg-surface-elevated hover:text-text-secondary"
          />

          <span className="flex-1" />

          <Link
            href={`/s/${submission.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
          >
            Voir la page complète
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
