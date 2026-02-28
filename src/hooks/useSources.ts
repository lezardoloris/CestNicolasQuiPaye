'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SourceType } from '@/lib/utils/validation';

interface SubmissionSource {
  id: string;
  submissionId: string;
  url: string;
  title: string;
  sourceType: SourceType;
  addedBy: string | null;
  validationCount: number;
  invalidationCount: number;
  createdAt: string;
}

export function useSources(submissionId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<SubmissionSource[]>({
    queryKey: ['sources', submissionId],
    queryFn: async () => {
      const res = await fetch(`/api/submissions/${submissionId}/sources`);
      if (!res.ok) throw new Error('Failed to fetch sources');
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: { url: string; title: string; sourceType: SourceType }) => {
      const res = await fetch(`/api/submissions/${submissionId}/sources`, {
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
      queryClient.invalidateQueries({ queryKey: ['sources', submissionId] });
    },
  });

  const validateMutation = useMutation({
    mutationFn: async ({ sourceId, isValid }: { sourceId: string; isValid: boolean }) => {
      const res = await fetch(`/api/sources/${sourceId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isValid }),
      });
      if (!res.ok) throw new Error('Validation failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources', submissionId] });
    },
  });

  return {
    sources: query.data ?? [],
    isLoading: query.isLoading,
    addSource: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    validateSource: validateMutation.mutate,
    isValidating: validateMutation.isPending,
  };
}
