import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { formatRelativeTime, formatEUR } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

export interface ModerationCardSubmission {
  id: string;
  title: string;
  description: string;
  amount: string;
  sourceUrl: string;
  authorDisplay: string;
  moderationStatus: string;
  ministryTag: string | null;
  createdAt: string;
}

interface ModerationCardProps {
  submission: ModerationCardSubmission;
  isSelected: boolean;
  onClick: () => void;
}

export function ModerationCard({ submission, isSelected, onClick }: ModerationCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer bg-surface-elevated border-border/50 transition-all duration-200 hover:border-border-default',
        isSelected && 'ring-2 ring-chainsaw-red border-chainsaw-red/30'
      )}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={isSelected}
    >
      <CardContent className="space-y-2 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-medium leading-snug text-text-primary line-clamp-2">
            {submission.title}
          </h3>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {submission.moderationStatus}
          </Badge>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>{submission.authorDisplay}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{formatRelativeTime(submission.createdAt)}</span>
          <span aria-hidden="true">&middot;</span>
          <span className="font-semibold text-chainsaw-red">{formatEUR(submission.amount)}</span>
        </div>

        {/* Description preview */}
        <p className="text-xs text-text-secondary line-clamp-2">{submission.description}</p>

        {/* Source */}
        <div className="flex items-center gap-1 text-xs text-info truncate">
          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{new URL(submission.sourceUrl).hostname}</span>
        </div>
      </CardContent>
    </Card>
  );
}
