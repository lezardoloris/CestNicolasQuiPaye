'use client';

import type { ReactNode } from 'react';
import { useFeedPreviewStore } from '@/stores/feed-preview-store';
import { SubmissionPreview } from '@/components/features/feed/SubmissionPreview';

interface FeedRightSidebarProps {
  children: ReactNode;
}

export function FeedRightSidebar({ children }: FeedRightSidebarProps) {
  const selectedSubmission = useFeedPreviewStore((s) => s.selectedSubmission);

  return (
    <aside className="hidden w-[340px] shrink-0 lg:block">
      <div className="sticky top-4">
        {selectedSubmission ? (
          <SubmissionPreview submission={selectedSubmission} />
        ) : (
          <div className="space-y-4">{children}</div>
        )}
      </div>
    </aside>
  );
}
