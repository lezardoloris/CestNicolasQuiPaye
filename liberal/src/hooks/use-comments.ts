'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CommentData {
  id: string;
  authorId: string | null;
  authorDisplay: string;
  submissionId: string;
  parentCommentId: string | null;
  body: string;
  depth: number;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  replies?: CommentData[];
  hasMoreReplies?: boolean;
  totalReplyCount?: number;
}

interface CommentsResponse {
  data: CommentData[];
  error: null;
  meta: {
    cursor?: string;
    hasMore?: boolean;
    totalCount?: number;
  };
}

export function useComments(submissionId: string, sort: 'best' | 'newest' = 'best') {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ['comments', submissionId, sort],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams({
        sort,
        limit: '20',
      });
      if (pageParam) {
        params.set('cursor', pageParam);
      }
      const res = await fetch(`/api/submissions/${submissionId}/comments?${params}`);
      if (!res.ok) throw new Error('Erreur lors du chargement des commentaires');
      return res.json() as Promise<CommentsResponse>;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? lastPage.meta.cursor : undefined,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: async ({
      body,
      parentCommentId,
    }: {
      body: string;
      parentCommentId?: string | null;
    }) => {
      const res = await fetch(`/api/submissions/${submissionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, parentCommentId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error?.message || 'Erreur lors de la publication');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', submissionId] });
      toast.success('Commentaire publie');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const allComments = query.data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = query.data?.pages[0]?.meta?.totalCount ?? 0;

  return {
    comments: allComments,
    totalCount,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    createComment: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
