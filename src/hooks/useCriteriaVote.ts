'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

type CriterionKey = 'proportional' | 'legitimate' | 'alternative';

interface CriterionData {
  yes: number;
  no: number;
  userVote: boolean | null;
}

interface CriteriaResponse {
  data: {
    criteria: Record<CriterionKey, CriterionData>;
  };
}

const CRITERIA_KEYS: CriterionKey[] = ['proportional', 'legitimate', 'alternative'];

function emptyCriteria(): Record<CriterionKey, CriterionData> {
  return {
    proportional: { yes: 0, no: 0, userVote: null },
    legitimate: { yes: 0, no: 0, userVote: null },
    alternative: { yes: 0, no: 0, userVote: null },
  };
}

export function useCriteriaVote(submissionId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['criteria-votes', submissionId];

  const { data, isLoading } = useQuery<CriteriaResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/submissions/${submissionId}/criteria-vote`);
      if (!res.ok) throw new Error('Failed to load criteria votes');
      return res.json();
    },
  });

  const criteria = data?.data?.criteria ?? emptyCriteria();

  const mutation = useMutation({
    mutationFn: async ({ criterion, value }: { criterion: CriterionKey; value: boolean }) => {
      const res = await fetch(`/api/submissions/${submissionId}/criteria-vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criterion, value }),
      });
      if (!res.ok) throw new Error('Vote failed');
      return res.json();
    },
    onMutate: async ({ criterion, value }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CriteriaResponse>(queryKey);

      queryClient.setQueryData<CriteriaResponse>(queryKey, (old) => {
        if (!old) return old;
        const updated = { ...old.data.criteria };
        const current = { ...updated[criterion] };

        if (current.userVote === value) {
          // Toggle off
          if (value) current.yes--;
          else current.no--;
          current.userVote = null;
        } else {
          // Remove old vote if switching
          if (current.userVote === true) current.yes--;
          if (current.userVote === false) current.no--;
          // Add new vote
          if (value) current.yes++;
          else current.no++;
          current.userVote = value;
        }

        updated[criterion] = current;
        return { ...old, data: { ...old.data, criteria: updated } };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const vote = useCallback(
    (criterion: CriterionKey, value: boolean) => {
      mutation.mutate({ criterion, value });
    },
    [mutation],
  );

  const totalVoters = CRITERIA_KEYS.reduce((max, key) => {
    const c = criteria[key];
    return Math.max(max, c.yes + c.no);
  }, 0);

  return { criteria, vote, isLoading, totalVoters };
}
