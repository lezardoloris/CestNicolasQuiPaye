'use client';

import { create } from 'zustand';
import type { SubmissionCardData } from '@/types/submission';

interface FeedPreviewState {
  selectedSubmission: SubmissionCardData | null;
  setSelectedSubmission: (submission: SubmissionCardData) => void;
  clearSelectedSubmission: () => void;
}

export const useFeedPreviewStore = create<FeedPreviewState>((set) => ({
  selectedSubmission: null,
  setSelectedSubmission: (submission) => set({ selectedSubmission: submission }),
  clearSelectedSubmission: () => set({ selectedSubmission: null }),
}));
