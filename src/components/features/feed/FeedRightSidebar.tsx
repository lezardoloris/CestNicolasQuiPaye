'use client';

import type { ReactNode } from 'react';
import { useFeedPreviewStore } from '@/stores/feed-preview-store';
import { SubmissionPreview } from '@/components/features/feed/SubmissionPreview';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface FeedRightSidebarProps {
  children: ReactNode;
}

export function FeedRightSidebar({ children }: FeedRightSidebarProps) {
  const selectedSubmission = useFeedPreviewStore((s) => s.selectedSubmission);
  const clearSelectedSubmission = useFeedPreviewStore((s) => s.clearSelectedSubmission);
  const isPreviewOpen = !!selectedSubmission;

  return (
    <>
      {/* Desktop: sidebar that expands into a wide panel */}
      <aside
        className={cn(
          'hidden shrink-0 transition-all duration-300 ease-in-out lg:block',
          isPreviewOpen ? 'w-[55%]' : 'w-[340px]'
        )}
      >
        <div className="sticky top-4">
          {selectedSubmission ? (
            <SubmissionPreview submission={selectedSubmission} />
          ) : (
            <div className="space-y-4">{children}</div>
          )}
        </div>
      </aside>

      {/* Mobile: full-screen Sheet */}
      {selectedSubmission && (
        <Sheet open onOpenChange={(open) => { if (!open) clearSelectedSubmission(); }}>
          <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-full">
            <div className="pt-10">
              <SubmissionPreview submission={selectedSubmission} />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
