'use client';

import { create } from 'zustand';

type VoteState = 'up' | 'down' | null;

interface VoteCacheStore {
  votes: Map<string, VoteState>;
  counts: Map<string, { up: number; down: number }>;
  setVote: (submissionId: string, vote: VoteState) => void;
  setCounts: (submissionId: string, up: number, down: number) => void;
  getVote: (submissionId: string) => VoteState;
  getCounts: (submissionId: string) => { up: number; down: number } | undefined;
}

export const useVoteStore = create<VoteCacheStore>((set, get) => ({
  votes: new Map(),
  counts: new Map(),

  setVote: (submissionId, vote) =>
    set((state) => {
      const newVotes = new Map(state.votes);
      newVotes.set(submissionId, vote);
      return { votes: newVotes };
    }),

  setCounts: (submissionId, up, down) =>
    set((state) => {
      const newCounts = new Map(state.counts);
      newCounts.set(submissionId, { up, down });
      return { counts: newCounts };
    }),

  getVote: (submissionId) => get().votes.get(submissionId) ?? null,

  getCounts: (submissionId) => get().counts.get(submissionId),
}));
