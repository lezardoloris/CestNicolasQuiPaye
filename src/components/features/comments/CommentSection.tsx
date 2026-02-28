'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CommentForm } from '@/components/features/comments/CommentForm';
import { CommentThread } from '@/components/features/comments/CommentThread';
import { useComments } from '@/hooks/use-comments';
import { pluralize } from '@/lib/utils/format';

interface CommentSectionProps {
  submissionId: string;
  commentCount: number;
}

export function CommentSection({ submissionId, commentCount }: CommentSectionProps) {
  const [sort, setSort] = useState<'best' | 'newest'>('best');

  const {
    comments,
    totalCount,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    createComment,
    isCreating,
  } = useComments(submissionId, sort);

  const handleTopLevelComment = (body: string) => {
    createComment({ body, parentCommentId: null });
  };

  const handleReply = (body: string, parentCommentId: string) => {
    createComment({ body, parentCommentId });
  };

  const displayCount = totalCount || commentCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-text-secondary" aria-hidden="true" />
        <h2 className="font-display text-lg font-semibold text-text-primary">
          {displayCount} {pluralize(displayCount, 'commentaire', 'commentaires')}
        </h2>
      </div>

      {/* Comment form */}
      <CommentForm
        onSubmit={handleTopLevelComment}
        isSubmitting={isCreating}
        placeholder="Partagez votre avis..."
      />

      {/* Sort tabs */}
      <Tabs
        value={sort}
        onValueChange={(v) => setSort(v as 'best' | 'newest')}
      >
        <TabsList>
          <TabsTrigger value="best" aria-label="Trier par pertinence">
            Pertinence
          </TabsTrigger>
          <TabsTrigger value="newest" aria-label="Trier par date">
            Plus recents
          </TabsTrigger>
        </TabsList>

        <TabsContent value={sort}>
          <CommentThread
            comments={comments}
            isLoading={isLoading}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
            onReply={handleReply}
            isReplying={isCreating}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
