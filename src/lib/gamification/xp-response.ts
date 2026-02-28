import type { XpAwardResult } from './xp-engine';

export interface XpResponseData {
  amount: number;
  total: number;
  leveledUp: boolean;
  newLevel: number | null;
  newLevelTitle: string | null;
  streak: number;
}

export function formatXpResponse(result: XpAwardResult): XpResponseData | null {
  if (!result.awarded) return null;
  return {
    amount: result.xpAmount + (result.dailyBonusAwarded ? result.dailyBonusXp : 0),
    total: result.totalXp,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    newLevelTitle: result.newLevelTitle,
    streak: result.currentStreak,
  };
}
