'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSession } from '@/hooks/useAuth';

type VoteDirection = 'up' | 'down' | null;

interface UseCommentVoteOptions {
  commentId: string;
  initialDirection?: VoteDirection;
  initialScore: number;
  initialUpvotes: number;
  initialDownvotes: number;
}

export function useCommentVote({
  commentId,
  initialDirection = null,
  initialScore,
  initialUpvotes,
  initialDownvotes,
}: UseCommentVoteOptions) {
  const { isAuthenticated, openAuthGate } = useSession();
  const [direction, setDirection] = useState<VoteDirection>(initialDirection);
  const [score, setScore] = useState(initialScore);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);

  const mutation = useMutation({
    mutationFn: async (newDirection: 'up' | 'down') => {
      const res = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: newDirection }),
      });
      if (!res.ok) throw new Error('Vote echoue');
      return res.json();
    },
    onMutate: async (newDirection: 'up' | 'down') => {
      const prev = { direction, score, upvotes, downvotes };

      if (direction === newDirection) {
        // Toggle off
        setDirection(null);
        if (newDirection === 'up') {
          setUpvotes((u) => u - 1);
          setScore((s) => s - 1);
        } else {
          setDownvotes((d) => d - 1);
          setScore((s) => s + 1);
        }
      } else {
        // New or switch
        if (direction === 'up') {
          setUpvotes((u) => u - 1);
          setScore((s) => s - 1);
        }
        if (direction === 'down') {
          setDownvotes((d) => d - 1);
          setScore((s) => s + 1);
        }
        setDirection(newDirection);
        if (newDirection === 'up') {
          setUpvotes((u) => u + 1);
          setScore((s) => s + 1);
        } else {
          setDownvotes((d) => d + 1);
          setScore((s) => s - 1);
        }
      }

      return prev;
    },
    onError: (_err, _dir, context) => {
      if (context) {
        setDirection(context.direction);
        setScore(context.score);
        setUpvotes(context.upvotes);
        setDownvotes(context.downvotes);
      }
      toast.error('Erreur lors du vote');
    },
    onSuccess: (data) => {
      if (data?.data) {
        setDirection(data.data.direction);
        setScore(data.data.score);
        setUpvotes(data.data.upvoteCount);
        setDownvotes(data.data.downvoteCount);
      }
    },
  });

  const vote = useCallback(
    (dir: 'up' | 'down') => {
      if (!isAuthenticated) {
        openAuthGate();
        return;
      }
      mutation.mutate(dir);
    },
    [isAuthenticated, openAuthGate, mutation]
  );

  return {
    vote,
    direction,
    score,
    upvotes,
    downvotes,
    isLoading: mutation.isPending,
  };
}
