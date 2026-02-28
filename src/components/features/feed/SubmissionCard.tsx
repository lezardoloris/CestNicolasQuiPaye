'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  formatEUR,
  formatEURPrecise,
  formatRelativeTime,
  truncate,
} from '@/lib/utils/format';
import { VoteButtonInline } from '@/components/features/voting/VoteButtonInline';
import { ShareButton } from '@/components/features/sharing/ShareButton';
import { SourceBadge } from '@/components/features/sources/SourceBadge';
import { PinnedNote } from '@/components/features/notes/PinnedNote';
import { MessageSquare } from 'lucide-react';
import { getCategoryDef } from '@/lib/constants/categories';
import type { SubmissionCardData } from '@/types/submission';

interface SubmissionCardProps {
  submission: SubmissionCardData;
  index?: number;
}

function getOutrageTier(costPerTaxpayer: string | null): { border: string; bg: string } {
  if (!costPerTaxpayer) return { border: 'border-l-border-default', bg: '' };
  const cost = parseFloat(costPerTaxpayer);
  if (cost >= 10) return { border: 'border-l-chainsaw-red', bg: 'bg-chainsaw-red/[0.03]' };
  if (cost >= 1) return { border: 'border-l-warning', bg: 'bg-warning/[0.03]' };
  if (cost >= 0.1) return { border: 'border-l-info', bg: '' };
  return { border: 'border-l-text-muted', bg: '' };
}

export function SubmissionCard({ submission, index = 0 }: SubmissionCardProps) {
  const score = submission.upvoteCount - submission.downvoteCount;
  const category = getCategoryDef(submission.ministryTag);
  const outrage = getOutrageTier(submission.costPerTaxpayer);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5), ease: 'easeOut' }}
      role="article"
      aria-label={`${submission.title}, score: ${score}, cout: ${formatEUR(submission.amount)}`}
      className={cn(
        'group relative rounded-lg border border-border-default',
        'bg-surface-secondary',
        outrage.bg,
        'transition-all duration-200 hover:bg-surface-elevated hover:border-border-default/80',
        'border-l-[5px]',
        'card-hover-lift',
        outrage.border,
      )}
    >
      {/* Stretched link — makes entire card clickable */}
      <Link
        href={`/s/${submission.id}`}
        className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-secondary"
        aria-label={truncate(submission.title, 120)}
        tabIndex={-1}
      />

      <div className="relative z-1 space-y-3 p-4 pointer-events-none">
        {/* Row 1: Metadata */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
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
          <SourceBadge
            sourceUrl={submission.sourceUrl}
            sourceCount={submission.sourceCount}
          />
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

        {/* Row 2: Title + Description */}
        <div>
          <h3 className="text-base font-semibold leading-snug text-text-primary line-clamp-2 transition-colors group-hover:text-chainsaw-red md:text-lg">
            {truncate(submission.title, 120)}
          </h3>
          {submission.description && (
            <p className="mt-1 text-sm leading-relaxed text-text-secondary line-clamp-2">
              {truncate(submission.description, 200)}
            </p>
          )}
        </div>

        {/* Pinned Community Note */}
        {submission.pinnedNoteBody && (
          <PinnedNote body={submission.pinnedNoteBody} />
        )}

        {/* Row 3: Action Bar (Reddit-style) */}
        <div className="flex items-center gap-1 pt-1 pointer-events-auto">
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

          <div className="flex-1" />

          {submission.costPerTaxpayer && (
            <span className="inline-flex items-center rounded-full bg-warning/15 px-2.5 py-1 text-xs font-bold tabular-nums text-warning">
              {formatEURPrecise(submission.costPerTaxpayer)}/citoyen
            </span>
          )}

          <span className="inline-flex items-center rounded-full bg-chainsaw-red/10 px-3 py-1 text-sm font-black tabular-nums text-chainsaw-red">
            {formatEUR(submission.amount)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
