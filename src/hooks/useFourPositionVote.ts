'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { VotingPosition } from '@/lib/utils/validation';
import type { ConsensusResult } from '@/lib/utils/consensus';

interface VoteDistribution {
  essentiel: number;
  justifie_ameliorable: number;
  discutable: number;
  injustifie: number;
  total: number;
  weighted: {
    essentiel: number;
    justifie_ameliorable: number;
    discutable: number;
    injustifie: number;
    total: number;
  };
}

interface FourPositionVoteResponse {
  data: {
    userVote: VotingPosition | null;
    legacyVote?: 'up' | 'down' | null;
    distribution: VoteDistribution;
    consensus: ConsensusResult;
  };
}

interface VoteMutationResponse {
  data: {
    position: VotingPosition;
    isNew: boolean;
    distribution: VoteDistribution;
    consensus: ConsensusResult;
  };
}

export function useFourPositionVote(submissionId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['four-position-vote', submissionId];

  const { data, isLoading } = useQuery<FourPositionVoteResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/submissions/${submissionId}/four-position-vote`);
      if (!res.ok) throw new Error('Failed to fetch vote');
      return res.json();
    },
  });

  const mutation = useMutation<
    VoteMutationResponse,
    Error,
    VotingPosition,
    { previous: FourPositionVoteResponse | undefined }
  >({
    mutationFn: async (position) => {
      const res = await fetch(`/api/submissions/${submissionId}/four-position-vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? 'Vote failed');
      }
      return res.json();
    },
    onMutate: async (position) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<FourPositionVoteResponse>(queryKey);

      // Optimistic update
      if (previous?.data) {
        const oldPos = previous.data.userVote;
        const newDist = { ...previous.data.distribution };

        // Decrement old position, increment new
        if (oldPos && oldPos in newDist) {
          (newDist[oldPos as keyof typeof newDist] as number)--;
        } else {
          // New vote, increment total
          newDist.total++;
        }
        (newDist[position as keyof typeof newDist] as number)++;

        queryClient.setQueryData<FourPositionVoteResponse>(queryKey, {
          data: {
            ...previous.data,
            userVote: position,
            distribution: newDist,
          },
        });
      }

      return { previous };
    },
    onError: (_err, _position, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSuccess: (response) => {
      // Replace with server-accurate data
      queryClient.setQueryData<FourPositionVoteResponse>(queryKey, {
        data: {
          userVote: response.data.position,
          distribution: response.data.distribution,
          consensus: response.data.consensus,
        },
      });
    },
  });

  return {
    userVote: data?.data?.userVote ?? null,
    legacyVote: data?.data?.legacyVote ?? null,
    distribution: data?.data?.distribution ?? null,
    consensus: data?.data?.consensus ?? null,
    isLoading,
    vote: (position: VotingPosition) => mutation.mutate(position),
    isVoting: mutation.isPending,
  };
}
