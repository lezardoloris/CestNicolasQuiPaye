'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useXpResponse } from '@/hooks/useXpResponse';

interface Solution {
  id: string;
  submissionId: string;
  authorId: string | null;
  authorDisplay: string;
  body: string;
  upvoteCount: number;
  downvoteCount: number;
  createdAt: string;
}

export function useSolutions(submissionId: string) {
  const queryClient = useQueryClient();
  const { processXpResponse } = useXpResponse();

  const query = useQuery<Solution[]>({
    queryKey: ['solutions', submissionId],
    queryFn: async () => {
      const res = await fetch(`/api/submissions/${submissionId}/solutions`);
      if (!res.ok) throw new Error('Failed to fetch solutions');
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: string) => {
      const res = await fetch(`/api/submissions/${submissionId}/solutions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message ?? 'Erreur');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['solutions', submissionId] });
      processXpResponse(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      solutionId,
      data,
    }: {
      solutionId: string;
      data: { body: string };
    }) => {
      const res = await fetch(`/api/solutions/${solutionId}`, {
        method: 'PATCH',
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
      queryClient.invalidateQueries({ queryKey: ['solutions', submissionId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (solutionId: string) => {
      const res = await fetch(`/api/solutions/${solutionId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message ?? 'Erreur');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions', submissionId] });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({
      solutionId,
      voteType,
    }: {
      solutionId: string;
      voteType: 'up' | 'down';
    }) => {
      const res = await fetch(`/api/solutions/${solutionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
      if (!res.ok) throw new Error('Vote failed');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['solutions', submissionId] });
      processXpResponse(data);
    },
  });

  return {
    solutions: query.data ?? [],
    isLoading: query.isLoading,
    createSolution: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateSolution: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteSolution: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    voteSolution: voteMutation.mutate,
    isVoting: voteMutation.isPending,
  };
}
