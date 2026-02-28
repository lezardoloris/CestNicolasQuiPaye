'use client';

import { FileCheck, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractDomain } from '@/lib/utils/format';

interface SourceBadgeProps {
  sourceUrl: string;
  sourceCount?: number;
  className?: string;
}

export function SourceBadge({ sourceUrl, sourceCount, className }: SourceBadgeProps) {
  if (sourceCount && sourceCount > 1) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs text-text-muted',
          className,
        )}
      >
        <FileCheck className="size-3 text-success" aria-hidden="true" />
        <span>{sourceCount} sources</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs text-text-muted',
        className,
      )}
    >
      <ExternalLink className="size-3" aria-hidden="true" />
      <span>{extractDomain(sourceUrl)}</span>
    </span>
  );
}
