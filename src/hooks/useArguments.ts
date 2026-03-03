'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useXpResponse } from '@/hooks/useXpResponse';

interface Argument {
  id: string;
  submissionId: string;
  authorDisplay: string;
  type: 'pour' | 'contre';
  body: string;
  upvoteCount: number;
  downvoteCount: number;
  createdAt: string;
}

export function useArguments(submissionId: string) {
  const queryClient = useQueryClient();
  const { processXpResponse } = useXpResponse();

  const query = useQuery<Argument[]>({
    queryKey: ['arguments', submissionId],
    queryFn: async () => {
      const res = await fetch(`/api/submissions/${submissionId}/arguments`);
      if (!res.ok) throw new Error('Failed to fetch arguments');
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ body, type }: { body: string; type: 'pour' | 'contre' }) => {
      const res = await fetch(`/api/submissions/${submissionId}/arguments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, type }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message ?? 'Erreur');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['arguments', submissionId] });
      processXpResponse(data);
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({
      argumentId,
      voteType,
    }: {
      argumentId: string;
      voteType: 'up' | 'down';
    }) => {
      const res = await fetch(`/api/arguments/${argumentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
      if (!res.ok) throw new Error('Vote failed');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['arguments', submissionId] });
      processXpResponse(data);
    },
  });

  const args = query.data ?? [];
  const pourArgs = args.filter((a) => a.type === 'pour');
  const contreArgs = args.filter((a) => a.type === 'contre');

  return {
    arguments: args,
    pourArgs,
    contreArgs,
    isLoading: query.isLoading,
    createArgument: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    voteArgument: voteMutation.mutate,
    isVoting: voteMutation.isPending,
  };
}
