'use client';

import { useQuery } from '@tanstack/react-query';

interface AiContextData {
  budgetContext: string | null;
  costComparison: string | null;
  relatedFacts: string[] | null;
  summary: string | null;
  source: string;
}

interface AiContextResponse {
  data: AiContextData;
}

export function useAiContext(submissionId: string) {
  const { data, isLoading } = useQuery<AiContextResponse>({
    queryKey: ['ai-context', submissionId],
    queryFn: async () => {
      const res = await fetch(`/api/submissions/${submissionId}/ai-context`);
      if (!res.ok) throw new Error('Failed to fetch AI context');
      return res.json();
    },
  });

  return {
    context: data?.data ?? null,
    isLoading,
  };
}
