'use client';

import { useQuery } from '@tanstack/react-query';
import type { MaturityResult } from '@/types/maturity';

interface MaturityResponse {
  data: MaturityResult;
}

export function useMaturity(submissionId: string) {
  const { data, isLoading } = useQuery<MaturityResponse>({
    queryKey: ['maturity', submissionId],
    queryFn: async () => {
      const res = await fetch(`/api/submissions/${submissionId}/maturity`);
      if (!res.ok) throw new Error('Failed to fetch maturity');
      return res.json();
    },
  });

  return {
    maturity: data?.data ?? null,
    isLoading,
  };
}
