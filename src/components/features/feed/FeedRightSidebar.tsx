'use client';

import type { ReactNode } from 'react';
import { useFeedPreviewStore } from '@/stores/feed-preview-store';
import { SubmissionPreview } from '@/components/features/feed/SubmissionPreview';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface FeedRightSidebarProps {
  children: ReactNode;
}

export function FeedRightSidebar({ children }: FeedRightSidebarProps) {
  const selectedSubmission = useFeedPreviewStore((s) => s.selectedSubmission);
  const clearSelectedSubmission = useFeedPreviewStore((s) => s.clearSelectedSubmission);

  return (
    <>
      {/* Desktop: default sidebar widgets (hidden when preview is open) */}
      {!selectedSubmission && (
        <aside className="hidden w-[340px] shrink-0 lg:block">
          <div className="sticky top-4">
            <div className="space-y-4">{children}</div>
          </div>
        </aside>
      )}

      {/* Desktop: fixed 75vw panel from the right */}
      {selectedSubmission && (
        <div className="fixed inset-y-0 right-0 z-40 hidden w-[75vw] pt-16 lg:block">
          <div className="h-full p-4 pl-0">
            <SubmissionPreview submission={selectedSubmission} />
          </div>
        </div>
      )}

      {/* Mobile: full-screen Sheet */}
      {selectedSubmission && (
        <Sheet open onOpenChange={(open) => { if (!open) clearSelectedSubmission(); }}>
          <SheetContent side="right" className="w-full p-0 sm:max-w-full" showCloseButton={false}>
            <SubmissionPreview submission={selectedSubmission} />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
