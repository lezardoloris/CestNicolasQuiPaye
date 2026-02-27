'use client';

import { useVoteStore } from '@/stores/vote-store';
import { useMutation } from '@tanstack/react-query';
import { useSession } from '@/hooks/useAuth';

export function useVote(
  submissionId: string,
  serverCounts: { up: number; down: number },
) {
  const { setVote, setCounts, getVote, getCounts } = useVoteStore();
  const { isAuthenticated, openAuthGate } = useSession();

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
      // Save previous state for rollback
      const prevVote = currentVote;
      const prevCounts = { ...counts };

      if (prevVote === voteType) {
        // Toggle off
        setVote(submissionId, null);
        setCounts(
          submissionId,
          counts.up - (voteType === 'up' ? 1 : 0),
          counts.down - (voteType === 'down' ? 1 : 0),
        );
      } else {
        // New vote or switch
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
      // Rollback on error
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
      // Sync with server response
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
    if (!isAuthenticated) {
      openAuthGate();
      return;
    }
    mutation.mutate(voteType);
  };

  return { vote, currentVote, counts, isLoading: mutation.isPending };
}
