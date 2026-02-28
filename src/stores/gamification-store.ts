import { create } from 'zustand';

interface GamificationState {
  totalXp: number;
  todayXp: number;
  dailyGoal: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number | null;
  progressPercent: number;
  xpInLevel: number;
  xpForLevel: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezeCount: number;
  badges: Array<{ slug: string; name: string; description: string; category: string; earnedAt: string }>;
  xpBreakdown: Record<string, number>;
  loaded: boolean;

  // XP toast queue
  xpToasts: Array<{ id: string; amount: number; leveledUp: boolean; newLevelTitle: string | null }>;

  // Actions
  setStats: (stats: Partial<GamificationState>) => void;
  addXpToast: (amount: number, leveledUp: boolean, newLevelTitle: string | null) => void;
  removeXpToast: (id: string) => void;
  incrementTodayXp: (amount: number) => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  totalXp: 0,
  todayXp: 0,
  dailyGoal: 20,
  level: 1,
  levelTitle: 'Citoyen',
  nextLevelXp: 100,
  progressPercent: 0,
  xpInLevel: 0,
  xpForLevel: 100,
  currentStreak: 0,
  longestStreak: 0,
  streakFreezeCount: 0,
  badges: [],
  xpBreakdown: {},
  loaded: false,
  xpToasts: [],

  setStats: (stats) => set((state) => ({ ...state, ...stats, loaded: true })),

  addXpToast: (amount, leveledUp, newLevelTitle) =>
    set((state) => ({
      xpToasts: [
        ...state.xpToasts,
        { id: crypto.randomUUID(), amount, leveledUp, newLevelTitle },
      ],
    })),

  removeXpToast: (id) =>
    set((state) => ({
      xpToasts: state.xpToasts.filter((t) => t.id !== id),
    })),

  incrementTodayXp: (amount) =>
    set((state) => ({
      todayXp: state.todayXp + amount,
      totalXp: state.totalXp + amount,
    })),
}));
