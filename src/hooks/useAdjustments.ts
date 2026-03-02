'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Adjustment {
  id: string;
  authorDisplay: string;
  body: string;
  createdAt: string;
}

export function useAdjustments(solutionId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Adjustment[]>({
    queryKey: ['adjustments', solutionId],
    queryFn: async () => {
      const res = await fetch(`/api/solutions/${solutionId}/adjustments`);
      if (!res.ok) throw new Error('Failed to fetch adjustments');
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: false, // Only fetch when thread is expanded
  });

  const createMutation = useMutation({
    mutationFn: async (body: string) => {
      const res = await fetch(`/api/solutions/${solutionId}/adjustments`, {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjustments', solutionId] });
    },
  });

  return {
    adjustments: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createAdjustment: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
