'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  formatCompactEUR,
  formatEURPrecise,
  formatRelativeTime,
  truncate,
} from '@/lib/utils/format';
import { VoteButtonInline } from '@/components/features/voting/VoteButtonInline';
import { ShareButton } from '@/components/features/sharing/ShareButton';
import { SourceBadge } from '@/components/features/sources/SourceBadge';
import { PinnedNote } from '@/components/features/notes/PinnedNote';
import { TopSolutionPreview } from '@/components/features/solutions/TopSolutionPreview';
import { MessageSquare, Flame, Lightbulb, BarChart3 } from 'lucide-react';
import { getCategoryDef } from '@/lib/constants/categories';
import { getCategoryBudgetFact } from '@/lib/constants/category-budget-context';
import { useFeedPreviewStore } from '@/stores/feed-preview-store';
import type { SubmissionCardData } from '@/types/submission';

interface SubmissionCardProps {
  submission: SubmissionCardData;
  index?: number;
}

export function SubmissionCard({ submission, index = 0 }: SubmissionCardProps) {
  const score = submission.upvoteCount - submission.downvoteCount;
  const category = getCategoryDef(submission.ministryTag);
  const budgetFact = getCategoryBudgetFact(submission.ministryTag);
  const costPerTaxpayer = submission.costPerTaxpayer;
  const isExtreme = costPerTaxpayer ? parseFloat(costPerTaxpayer) >= 10 : false;
  const setSelectedSubmission = useFeedPreviewStore((s) => s.setSelectedSubmission);

  const handleCardClick = (e: React.MouseEvent) => {
    // Let ctrl/meta/middle clicks navigate normally (open in new tab)
    if (e.ctrlKey || e.metaKey || e.button === 1) return;
    // Only intercept on lg+ screens where sidebar preview exists
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      e.preventDefault();
      setSelectedSubmission(submission);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5), ease: 'easeOut' }}
      role="article"
      aria-label={`${submission.title}, score: ${score}`}
      className="group relative border-b border-border-default transition-colors hover:bg-surface-secondary/50"
    >
      {/* Stretched link — makes entire card clickable */}
      <Link
        href={`/s/${submission.id}`}
        onClick={handleCardClick}
        className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-inset"
        aria-label={truncate(submission.title, 120)}
        tabIndex={-1}
      />

      <div className="pointer-events-none relative z-1 px-4 py-3">
        {/* Row 1: metadata */}
        <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-text-muted">
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
          <SourceBadge
            sourceUrl={submission.sourceUrl}
            sourceCount={submission.sourceCount}
          />
        </div>

        {/* Row 2: title */}
        <h3 className="mt-1.5 line-clamp-2 text-[17px] font-semibold leading-snug text-text-primary transition-colors group-hover:text-chainsaw-red">
          {truncate(submission.title, 120)}
        </h3>

        {/* Row 3: description */}
        {submission.description && (
          <p className="mt-1 line-clamp-2 text-[15px] leading-normal text-text-secondary">
            {truncate(submission.description, 200)}
          </p>
        )}

        {/* Row 4: cost info — inline */}
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              'text-[13px] font-bold tabular-nums',
              isExtreme ? 'text-chainsaw-red' : 'text-chainsaw-red/80',
            )}
          >
            {isExtreme && <Flame className="mr-0.5 inline size-3" aria-hidden="true" />}
            {formatCompactEUR(Number(submission.amount))}
          </span>
          {costPerTaxpayer && (
            <span className="text-[13px] font-medium tabular-nums text-text-muted">
              ({formatEURPrecise(costPerTaxpayer)}/citoyen)
            </span>
          )}
        </div>

        {/* Row 4b: official budget context */}
        {budgetFact && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-text-muted">
            <BarChart3 className="size-3 shrink-0" aria-hidden="true" />
            <span>{budgetFact.fact}</span>
            <span aria-hidden="true">&middot;</span>
            <Link
              href={`/chiffres#${budgetFact.anchor}`}
              className="pointer-events-auto text-text-secondary underline-offset-2 hover:underline hover:text-text-primary"
            >
              Voir les chiffres
            </Link>
          </div>
        )}

        {/* Pinned Community Note */}
        {submission.pinnedNoteBody && (
          <div className="mt-2">
            <PinnedNote body={submission.pinnedNoteBody} />
          </div>
        )}

        {/* Top Solution Preview */}
        {submission.topSolutionBody && (
          <div className="mt-2">
            <TopSolutionPreview body={submission.topSolutionBody} />
          </div>
        )}

        {/* Row 5: action bar */}
        <div className="pointer-events-auto mt-2 flex items-center gap-1">
          <VoteButtonInline
            submissionId={submission.id}
            serverCounts={{
              up: submission.upvoteCount,
              down: submission.downvoteCount,
            }}
          />

          <Link
            href={`/s/${submission.id}#commentaires`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
              'text-xs font-medium text-text-muted',
              'transition-colors hover:bg-surface-elevated hover:text-text-secondary',
            )}
            aria-label={`${submission.commentCount} commentaires`}
          >
            <MessageSquare className="size-4" aria-hidden="true" />
            <span>{submission.commentCount}</span>
          </Link>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedSubmission(submission);
            }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
              'text-xs font-medium text-warning/80',
              'transition-colors hover:bg-warning/10 hover:text-warning',
            )}
            aria-label="Proposer une solution"
          >
            <Lightbulb className="size-4" aria-hidden="true" />
            <span>{(submission.solutionCount ?? 0) > 0 ? submission.solutionCount : 'Proposer'}</span>
          </button>

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
      </div>
    </motion.article>
  );
}
