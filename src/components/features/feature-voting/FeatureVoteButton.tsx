'use client';

import { useState, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSession } from '@/hooks/useAuth';

interface FeatureVoteButtonProps {
  featureId: string;
  initialVoteCount: number;
  initialUserVote: number | null;
  onVoteChange?: (newCount: number, newVote: number | null) => void;
}

export function FeatureVoteButton({
  featureId,
  initialVoteCount,
  initialUserVote,
  onVoteChange,
}: FeatureVoteButtonProps) {
  const { isAuthenticated, openAuthGate } = useSession();
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [userVote, setUserVote] = useState<number | null>(initialUserVote);

  const mutation = useMutation({
    mutationFn: async (value: number) => {
      const res = await fetch(`/api/features/${featureId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error('Vote echoue');
      return res.json();
    },
    onMutate: async (value: number) => {
      const prev = { voteCount, userVote };

      if (userVote === value) {
        // Toggle off
        setVoteCount((c) => c - value);
        setUserVote(null);
      } else {
        // New or switch
        if (userVote !== null) {
          setVoteCount((c) => c - userVote);
        }
        setVoteCount((c) => c + value);
        setUserVote(value);
      }

      return prev;
    },
    onError: (_err, _value, context) => {
      if (context) {
        setVoteCount(context.voteCount);
        setUserVote(context.userVote);
      }
      toast.error('Erreur lors du vote');
    },
    onSuccess: (data) => {
      if (data?.data) {
        setVoteCount(data.data.voteCount);
        setUserVote(data.data.userVote);
        onVoteChange?.(data.data.voteCount, data.data.userVote);
      }
    },
  });

  const handleVote = useCallback(
    (value: number) => {
      if (!isAuthenticated) {
        openAuthGate();
        return;
      }
      mutation.mutate(value);
    },
    [isAuthenticated, openAuthGate, mutation]
  );

  const hasUpvoted = userVote === 1;

  return (
    <button
      onClick={() => handleVote(1)}
      disabled={mutation.isPending}
      aria-label={hasUpvoted ? `Retirer votre vote (${voteCount} votes)` : `Voter pour cette proposition (${voteCount} votes)`}
      aria-pressed={hasUpvoted}
      className={cn(
        'flex min-h-12 min-w-16 flex-col items-center justify-center gap-0.5 rounded-lg border px-3 py-2 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
        hasUpvoted
          ? 'border-chainsaw-red bg-chainsaw-red/10 text-chainsaw-red'
          : 'border-border text-text-muted hover:border-text-muted hover:text-text-secondary',
      )}
    >
      <ChevronUp className="h-5 w-5" aria-hidden="true" />
      <span className="text-sm font-bold tabular-nums">{voteCount}</span>
    </button>
  );
}
