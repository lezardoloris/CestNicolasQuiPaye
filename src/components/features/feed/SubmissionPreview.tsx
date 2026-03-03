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
import { VoteProminentButtons } from '@/components/features/voting/VoteProminentButtons';
import { FourPositionVoting } from '@/components/features/voting/FourPositionVoting';
import { X, MessageSquare, ExternalLink, ArrowRight, Flame } from 'lucide-react';
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
    <div className="max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-border-default bg-surface-primary">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-default bg-surface-primary/95 px-4 py-2 backdrop-blur-sm">
        <span className="text-xs font-medium text-text-muted">Aperçu</span>
        <button
          onClick={clearSelectedSubmission}
          className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
          aria-label="Fermer l'aperçu"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="px-4 py-3">
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
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
        <h3 className="mt-1.5 text-base font-bold leading-snug text-text-primary">
          {submission.title}
        </h3>

        {/* Cost */}
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-bold tabular-nums',
              isExtreme ? 'text-chainsaw-red' : 'text-chainsaw-red/90',
            )}
          >
            {isExtreme && <Flame className="mr-0.5 inline size-3.5" aria-hidden="true" />}
            {formatCompactEUR(Number(submission.amount))}
          </span>
          {costPerTaxpayer && (
            <span className="text-xs font-medium tabular-nums text-text-muted">
              ({formatEURPrecise(costPerTaxpayer)}/citoyen)
            </span>
          )}
        </div>

        {/* Description */}
        {submission.description && (
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {submission.description}
          </p>
        )}

        {/* Pinned community note */}
        {submission.pinnedNoteBody && (
          <div className="mt-3">
            <PinnedNote body={submission.pinnedNoteBody} />
          </div>
        )}

        {/* ─── Two-column layout: Votes | Solutions ─── */}
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border-default pt-4 md:grid-cols-2">
          {/* Left: Voting */}
          <div className="space-y-3">
            <VoteProminentButtons
              submissionId={submission.id}
              serverCounts={{
                up: submission.upvoteCount,
                down: submission.downvoteCount,
              }}
            />
            <FourPositionVoting submissionId={submission.id} variant="compact" />
          </div>

          {/* Right: Solutions */}
          <div className="min-h-0 border-t border-border-default pt-3 md:border-t-0 md:border-l md:border-border-default md:pt-0 md:pl-4">
            <SolutionSection submissionId={submission.id} />
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-3 flex items-center gap-1 border-t border-border-default pt-2">
          <Link
            href={`/s/${submission.id}#commentaires`}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-secondary"
          >
            <MessageSquare className="size-3.5" aria-hidden="true" />
            <span>{submission.commentCount}</span>
          </Link>

          <span className="flex-1" />

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
        </div>

        {/* Full page link */}
        <Link
          href={`/s/${submission.id}`}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border-default bg-surface-secondary px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
        >
          Voir la page complète
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
