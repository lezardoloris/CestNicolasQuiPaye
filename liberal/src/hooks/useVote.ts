'use client';

import { useVoteStore } from '@/stores/vote-store';
import { useMutation } from '@tanstack/react-query';

export function useVote(
  submissionId: string,
  serverCounts: { up: number; down: number },
) {
  const { setVote, setCounts, getVote, getCounts } = useVoteStore();

  // Use cache if available, fallback to server data
  const currentVote = getVote(submissionId);
  const counts = getCounts(submissionId) ?? serverCounts;

  const mutation = useMutation({
    mutationFn: async (voteType: 'up' | 'down') => {
      const res = await fetch(`/api/submissions/${submissionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
      if (!res.ok) throw new Error('Vote failed');
      return res.json();
    },
    onMutate: async (voteType) => {
      const prevVote = currentVote;
      const prevCounts = { ...counts };

      if (prevVote === voteType) {
        setVote(submissionId, null);
        setCounts(
          submissionId,
          counts.up - (voteType === 'up' ? 1 : 0),
          counts.down - (voteType === 'down' ? 1 : 0),
        );
      } else {
        setVote(submissionId, voteType);
        let newUp = counts.up;
        let newDown = counts.down;
        if (prevVote === 'up') newUp--;
        if (prevVote === 'down') newDown--;
        if (voteType === 'up') newUp++;
        if (voteType === 'down') newDown++;
        setCounts(submissionId, newUp, newDown);
      }

      return { prevVote, prevCounts };
    },
    onError: (_err, _voteType, context) => {
      if (context) {
        setVote(submissionId, context.prevVote);
        setCounts(
          submissionId,
          context.prevCounts.up,
          context.prevCounts.down,
        );
      }
    },
    onSuccess: (data) => {
      if (data?.data) {
        setCounts(
          submissionId,
          data.data.upvoteCount,
          data.data.downvoteCount,
        );
        setVote(submissionId, data.data.userVote);
      }
    },
  });

  const vote = (voteType: 'up' | 'down') => {
    mutation.mutate(voteType);
  };

  return { vote, currentVote, counts, isLoading: mutation.isPending };
}
