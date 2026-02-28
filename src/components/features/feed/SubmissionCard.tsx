'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { formatEUR, formatEURPrecise, formatRelativeTime, truncate } from '@/lib/utils/format';
import { VoteButtonInline } from '@/components/features/voting/VoteButtonInline';
import { ShareButton } from '@/components/features/sharing/ShareButton';
import { SourceBadge } from '@/components/features/sources/SourceBadge';
import { PinnedNote } from '@/components/features/notes/PinnedNote';
import { MessageSquare, Flame } from 'lucide-react';
import { getCategoryDef } from '@/lib/constants/categories';
import type { SubmissionCardData } from '@/types/submission';

interface SubmissionCardProps {
  submission: SubmissionCardData;
  index?: number;
}

function getOutrageTier(costPerTaxpayer: string | null): {
  border: string;
  bg: string;
  isExtreme: boolean;
} {
  if (!costPerTaxpayer) return { border: 'border-l-border-default', bg: '', isExtreme: false };
  const cost = parseFloat(costPerTaxpayer);
  if (cost >= 10)
    return { border: 'border-l-chainsaw-red', bg: 'bg-chainsaw-red/[0.03]', isExtreme: true };
  if (cost >= 1) return { border: 'border-l-warning', bg: 'bg-warning/[0.03]', isExtreme: false };
  if (cost >= 0.1) return { border: 'border-l-info', bg: 'bg-info/[0.02]', isExtreme: false };
  return { border: 'border-l-text-muted', bg: 'bg-surface-secondary', isExtreme: false };
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
        'group border-border-default relative rounded-lg border',
        'bg-surface-secondary',
        outrage.bg,
        'hover:bg-surface-elevated hover:border-border-default/80 transition-all duration-200',
        'border-l-[5px]',
        'card-hover-lift',
        outrage.border,
      )}
    >
      {/* Stretched link — makes entire card clickable */}
      <Link
        href={`/s/${submission.id}`}
        className="focus-visible:ring-chainsaw-red focus-visible:ring-offset-surface-secondary absolute inset-0 z-0 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={truncate(submission.title, 120)}
        tabIndex={-1}
      />

      <div className="pointer-events-none relative z-1 space-y-3 p-4">
        {/* Row 1: Metadata + Cost per citizen */}
        <div className="text-text-muted flex flex-wrap items-center gap-2 text-xs">
          {category && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] leading-4 font-semibold',
                category.color,
                category.bgColor,
              )}
            >
              <category.icon className="size-3" aria-hidden="true" />
              {category.label}
            </span>
          )}
          <SourceBadge sourceUrl={submission.sourceUrl} sourceCount={submission.sourceCount} />
          {submission.costPerTaxpayer && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] leading-4 font-bold tabular-nums',
                  outrage.isExtreme
                    ? 'bg-chainsaw-red/15 text-chainsaw-red'
                    : 'bg-warning/15 text-warning',
                )}
              >
                {outrage.isExtreme && <Flame className="size-3" aria-hidden="true" />}
                {formatEURPrecise(submission.costPerTaxpayer)}/citoyen
              </span>
            </>
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

        {/* Row 2: Title + Description */}
        <div>
          <h3 className="text-text-primary group-hover:text-chainsaw-red line-clamp-2 text-base leading-snug font-semibold transition-colors md:text-lg">
            {truncate(submission.title, 120)}
          </h3>
          {submission.description && (
            <p className="text-text-secondary mt-1 line-clamp-2 text-sm leading-relaxed">
              {truncate(submission.description, 200)}
            </p>
          )}
        </div>

        {/* Pinned Community Note */}
        {submission.pinnedNoteBody && <PinnedNote body={submission.pinnedNoteBody} />}

        {/* Row 3: Action Bar */}
        <div className="pointer-events-auto flex items-center gap-1 pt-1">
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
              'text-text-muted text-xs font-medium',
              'hover:bg-surface-elevated hover:text-text-secondary transition-colors',
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
              submission.costPerTaxpayer ? parseFloat(submission.costPerTaxpayer) : undefined
            }
            variant="compact"
            className="text-text-muted hover:bg-surface-elevated hover:text-text-secondary h-auto min-h-0 min-w-0 rounded-full border-none bg-transparent px-3 py-1.5 text-xs font-medium shadow-none"
          />

          <div className="flex-1" />

          <span className="bg-chainsaw-red/10 text-chainsaw-red inline-flex items-center rounded-full px-3 py-1 text-sm font-black tabular-nums">
            {formatEUR(submission.amount)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
