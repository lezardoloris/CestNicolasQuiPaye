'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useGamificationStore } from '@/stores/gamification-store';
import { XpToastContainer } from './XpToast';

export function GamificationProvider() {
  const { data: session, status } = useSession();
  const setStats = useGamificationStore((s) => s.setStats);
  const loaded = useGamificationStore((s) => s.loaded);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;
    if (loaded) return;

    fetch('/api/gamification/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setStats({
            totalXp: json.data.totalXp,
            todayXp: json.data.todayXp,
            dailyGoal: json.data.dailyGoal,
            level: json.data.level,
            levelTitle: json.data.levelTitle,
            nextLevelXp: json.data.nextLevelXp,
            progressPercent: json.data.progressPercent,
            xpInLevel: json.data.xpInLevel,
            xpForLevel: json.data.xpForLevel,
            currentStreak: json.data.currentStreak,
            longestStreak: json.data.longestStreak,
            streakFreezeCount: json.data.streakFreezeCount,
            badges: json.data.badges ?? [],
            xpBreakdown: json.data.xpBreakdown ?? {},
          });
        }
      })
      .catch(console.error);
  }, [status, session, loaded, setStats]);

  return <XpToastContainer />;
}
