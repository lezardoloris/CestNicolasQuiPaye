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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SolutionSection } from '@/components/features/solutions/SolutionSection';
import { VoteProminentButtons } from '@/components/features/voting/VoteProminentButtons';
import { X, MessageSquare, ExternalLink, ArrowRight, Flame, Lightbulb } from 'lucide-react';
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
  const solutionCount = submission.solutionCount ?? 0;

  // Extract domain from source URL
  const sourceDomain = (() => {
    try {
      return new URL(submission.sourceUrl).hostname.replace('www.', '');
    } catch {
      return null;
    }
  })();

  return (
    <Tabs defaultValue="apercu" className="gap-0">
      <div className="max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-border-default bg-surface-primary">
        {/* Header: tabs + close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-default bg-surface-primary/95 px-4 py-2 backdrop-blur-sm">
          <TabsList variant="line" className="h-auto">
            <TabsTrigger value="apercu" className="text-sm">
              Apercu
            </TabsTrigger>
            <TabsTrigger value="solutions" className="text-sm">
              <Lightbulb className="size-3.5" aria-hidden="true" />
              Solutions
              {solutionCount > 0 && (
                <span className="ml-1 rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                  {solutionCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <button
            onClick={clearSelectedSubmission}
            className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
            aria-label="Fermer l'apercu"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Apercu tab — existing preview content */}
        <TabsContent value="apercu" className="m-0">
          <div className="px-4 py-3">
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-text-muted">
              {category && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4',
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
            </div>

            {/* Title */}
            <h3 className="mt-2 text-[17px] font-bold leading-snug text-text-primary">
              {submission.title}
            </h3>

            {/* Cost box */}
            <div className="mt-3 rounded-lg border border-chainsaw-red/20 bg-chainsaw-red/5 px-3 py-2.5">
              <p className="text-[11px] font-medium tracking-wide text-text-muted uppercase">
                Cout estime
              </p>
              <p
                className={cn(
                  'mt-0.5 font-display text-xl font-black tabular-nums',
                  isExtreme ? 'text-chainsaw-red' : 'text-chainsaw-red/90',
                )}
              >
                {isExtreme && <Flame className="mr-1 inline size-4" aria-hidden="true" />}
                {formatCompactEUR(Number(submission.amount))}
              </p>
              {costPerTaxpayer && (
                <p className="mt-0.5 text-[13px] text-text-secondary">
                  soit {formatEURPrecise(costPerTaxpayer)} par citoyen
                </p>
              )}
            </div>

            {/* Prominent vote buttons */}
            <div className="mt-3">
              <VoteProminentButtons
                submissionId={submission.id}
                serverCounts={{
                  up: submission.upvoteCount,
                  down: submission.downvoteCount,
                }}
              />
            </div>

            {/* Description — full text */}
            {submission.description && (
              <p className="mt-3 text-[14px] leading-relaxed text-text-secondary">
                {submission.description}
              </p>
            )}

            {/* Source link */}
            {sourceDomain && (
              <a
                href={submission.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-text-muted transition-colors hover:text-text-primary"
              >
                <ExternalLink className="size-3.5" />
                {sourceDomain}
              </a>
            )}

            {/* Pinned community note */}
            {submission.pinnedNoteBody && (
              <div className="mt-3">
                <PinnedNote body={submission.pinnedNoteBody} />
              </div>
            )}

            {/* Action bar */}
            <div className="mt-3 flex items-center gap-1 border-t border-border-default pt-3">
              <Link
                href={`/s/${submission.id}#commentaires`}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-secondary"
              >
                <MessageSquare className="size-4" aria-hidden="true" />
                <span>{submission.commentCount} commentaires</span>
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
                className="h-auto min-h-0 min-w-0 rounded-full border-none bg-transparent px-3 py-1.5 text-xs font-medium text-text-muted shadow-none hover:bg-surface-elevated hover:text-text-secondary"
              />
            </div>

            {/* Full page link */}
            <Link
              href={`/s/${submission.id}`}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border-default bg-surface-secondary px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
            >
              Voir la page complete
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </TabsContent>

        {/* Solutions tab — lazy-loaded via useSolutions */}
        <TabsContent value="solutions" className="m-0">
          <div className="px-4 py-3">
            <SolutionSection submissionId={submission.id} />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
