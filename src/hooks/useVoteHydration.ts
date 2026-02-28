'use client';

import { useEffect, useRef } from 'react';
import { useVoteStore } from '@/stores/vote-store';

/**
 * On mount, batch-fetch vote states for the given submission IDs
 * and populate the Zustand store so VoteButtons show the correct state.
 */
export function useVoteHydration(submissionIds: string[]) {
  const { setVote } = useVoteStore();
  const fetched = useRef(new Set<string>());

  useEffect(() => {
    const toFetch = submissionIds.filter((id) => !fetched.current.has(id));
    if (toFetch.length === 0) return;

    // Mark as fetched immediately to avoid duplicate requests
    toFetch.forEach((id) => fetched.current.add(id));

    fetch(`/api/votes/batch?ids=${toFetch.join(',')}`)
      .then((res) => res.json())
      .then((json) => {
        const voteMap = json?.data;
        if (!voteMap) return;
        for (const id of toFetch) {
          setVote(id, (voteMap[id] as 'up' | 'down') ?? null);
        }
      })
      .catch(() => {
        // Silently fail — votes just won't be highlighted
      });
  }, [submissionIds, setVote]);
}
