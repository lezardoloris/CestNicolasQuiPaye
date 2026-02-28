'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CommunityNote {
  id: string;
  submissionId: string;
  authorId: string | null;
  authorDisplay: string;
  body: string;
  sourceUrl: string | null;
  upvoteCount: number;
  downvoteCount: number;
  isPinned: number;
  pinnedAt: string | null;
  createdAt: string;
}

export function useCommunityNotes(submissionId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<CommunityNote[]>({
    queryKey: ['communityNotes', submissionId],
    queryFn: async () => {
      const res = await fetch(`/api/submissions/${submissionId}/notes`);
      if (!res.ok) throw new Error('Failed to fetch notes');
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { body: string; sourceUrl?: string }) => {
      const res = await fetch(`/api/submissions/${submissionId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message ?? 'Erreur');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityNotes', submissionId] });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ noteId, isUseful }: { noteId: string; isUseful: boolean }) => {
      const res = await fetch(`/api/notes/${noteId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUseful }),
      });
      if (!res.ok) throw new Error('Vote failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityNotes', submissionId] });
    },
  });

  return {
    notes: query.data ?? [],
    isLoading: query.isLoading,
    createNote: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    voteNote: voteMutation.mutate,
    isVoting: voteMutation.isPending,
  };
}
