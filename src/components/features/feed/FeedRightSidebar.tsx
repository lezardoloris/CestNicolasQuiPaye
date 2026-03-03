'use client';

import type { ReactNode } from 'react';
import { useFeedPreviewStore } from '@/stores/feed-preview-store';
import { SubmissionPreview } from '@/components/features/feed/SubmissionPreview';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

interface FeedRightSidebarProps {
  children: ReactNode;
}

export function FeedRightSidebar({ children }: FeedRightSidebarProps) {
  const selectedSubmission = useFeedPreviewStore((s) => s.selectedSubmission);
  const clearSelectedSubmission = useFeedPreviewStore((s) => s.clearSelectedSubmission);

  return (
    <>
      {/* Default sidebar widgets (hidden when preview is open) */}
      {!selectedSubmission && (
        <aside className="hidden w-[340px] shrink-0 lg:block">
          <div className="sticky top-4">
            <div className="space-y-4">{children}</div>
          </div>
        </aside>
      )}

      {/* Slide-over panel: full-screen on mobile, 75vw on desktop */}
      <Sheet
        open={!!selectedSubmission}
        onOpenChange={(open) => {
          if (!open) clearSelectedSubmission();
        }}
      >
        <SheetContent
          side="right"
          className="w-full p-0 sm:max-w-full lg:max-w-[75vw] lg:pt-0"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Détail de la dépense</SheetTitle>
          {selectedSubmission && (
            <div className="h-full lg:p-4 lg:pl-0">
              <SubmissionPreview submission={selectedSubmission} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
