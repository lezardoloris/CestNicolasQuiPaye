'use client';

import Link from 'next/link';
import { X, ExternalLink } from 'lucide-react';
import { SubmissionFullContent } from '@/components/features/submissions/SubmissionFullContent';
import { useFeedPreviewStore } from '@/stores/feed-preview-store';
import type { SubmissionCardData } from '@/types/submission';

interface SubmissionPreviewProps {
  submission: SubmissionCardData;
}

export function SubmissionPreview({ submission }: SubmissionPreviewProps) {
  const clearSelectedSubmission = useFeedPreviewStore((s) => s.clearSelectedSubmission);

  return (
    <div className="flex h-full flex-col bg-surface-primary lg:h-[calc(100vh-4rem)] lg:rounded-2xl lg:border lg:border-border-default">
      {/* Sticky header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border-default px-5 py-2.5">
        <span className="text-xs font-medium text-text-muted">Détail de la dépense</span>
        <div className="flex items-center gap-2">
          <Link
            href={`/s/${submission.id}`}
            target="_blank"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
            aria-label="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="size-3" />
            <span className="hidden sm:inline">Permalink</span>
          </Link>
          <button
            onClick={clearSelectedSubmission}
            className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
            aria-label="Fermer le panneau"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Scrollable content — key resets scroll on submission change */}
      <div key={submission.id} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-5 py-5 pb-20">
          <SubmissionFullContent submission={submission} />
        </div>
      </div>
    </div>
  );
}
