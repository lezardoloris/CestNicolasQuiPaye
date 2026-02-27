'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  formatEUR,
  formatEURPrecise,
  formatRelativeTime,
  extractDomain,
  truncate,
} from '@/lib/utils/format';
import { VoteButtonInline } from '@/components/features/voting/VoteButtonInline';
import { ShareButton } from '@/components/features/sharing/ShareButton';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { getCategoryDef } from '@/lib/constants/categories';
import type { SubmissionCardData } from '@/types/submission';

interface SubmissionCardProps {
  submission: SubmissionCardData;
  index?: number;
}

function getOutrageTierBorderColor(costPerTaxpayer: string | null): string {
  if (!costPerTaxpayer) return 'border-l-border-default';
  const cost = parseFloat(costPerTaxpayer);
  if (cost >= 10) return 'border-l-chainsaw-red';
  if (cost >= 1) return 'border-l-warning';
  if (cost >= 0.1) return 'border-l-info';
  return 'border-l-text-muted';
}

export function SubmissionCard({ submission, index = 0 }: SubmissionCardProps) {
  const score = submission.upvoteCount - submission.downvoteCount;
  const category = getCategoryDef(submission.ministryTag);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5), ease: 'easeOut' }}
      role="article"
      aria-label={`${submission.title}, score: ${score}, cout: ${formatEUR(submission.amount)}`}
      className={cn(
        'group rounded-lg border border-border-default bg-surface-secondary',
        'transition-all duration-200 hover:bg-surface-elevated hover:border-border-default/80',
        'border-l-4',
        'card-hover-lift',
        getOutrageTierBorderColor(submission.costPerTaxpayer),
      )}
    >
      <div className="space-y-3 p-4">
        {/* Row 1: Metadata */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {category && (
            <Badge
              variant="outline"
              className={cn(
                'px-1.5 py-0 text-[10px] leading-5 border-border-default/50',
                category.color,
              )}
            >
              <category.icon className="mr-0.5 size-3" aria-hidden="true" />
              {category.label}
            </Badge>
          )}
          <span>{extractDomain(submission.sourceUrl)}</span>
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
          <Link
            href={`/s/${submission.id}`}
            className="block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-secondary"
          >
            <h3 className="text-base font-semibold leading-snug text-text-primary line-clamp-2 transition-colors group-hover:text-chainsaw-red md:text-lg">
              {truncate(submission.title, 120)}
            </h3>
          </Link>
          {submission.description && (
            <p className="mt-1 text-sm leading-relaxed text-text-secondary line-clamp-2">
              {truncate(submission.description, 200)}
            </p>
          )}
        </div>

        {/* Row 3: Action Bar (Reddit-style) */}
        <div className="flex items-center gap-1 pt-1">
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

          <span className="inline-flex items-center rounded-full bg-chainsaw-red/10 px-2.5 py-1 text-xs font-bold tabular-nums text-chainsaw-red">
            {formatEUR(submission.amount)}
          </span>

          {submission.costPerTaxpayer && (
            <span className="hidden items-center text-[11px] tabular-nums text-text-muted sm:inline-flex">
              {formatEURPrecise(submission.costPerTaxpayer)}/citoyen
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
