'use client';

import { useQuery } from '@tanstack/react-query';
import type { ModerationDetailData } from '@/types/moderation-detail';

interface DetailApiResponse {
  data: ModerationDetailData;
  error: null;
  meta: { requestId: string };
}

export function useModerationDetail(submissionId: string | null) {
  return useQuery<ModerationDetailData>({
    queryKey: ['moderation-detail', submissionId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/submissions/${submissionId}/detail`);
      if (!res.ok) throw new Error('Erreur de chargement');
      const json: DetailApiResponse = await res.json();
      return json.data;
    },
    enabled: !!submissionId,
    staleTime: 30_000,
  });
}
