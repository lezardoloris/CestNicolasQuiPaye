import type { VotingPosition } from '@/lib/utils/validation';

export type ConsensusType =
  | 'consensus_fort'   // >70% on single position
  | 'tendance_claire'  // 50-70% on single position
  | 'polarise'         // Top 2 positions within 15% of each other
  | 'debat_ouvert';    // No position >40%

export interface ConsensusResult {
  type: ConsensusType;
  dominantPosition: VotingPosition | null;
  percentage: number;
}

export const CONSENSUS_LABELS: Record<ConsensusType, string> = {
  consensus_fort: 'Consensus fort',
  tendance_claire: 'Tendance claire',
  polarise: 'Polarisé',
  debat_ouvert: 'Débat ouvert',
};

export const CONSENSUS_COLORS: Record<ConsensusType, string> = {
  consensus_fort: 'text-green-600',
  tendance_claire: 'text-blue-600',
  polarise: 'text-orange-500',
  debat_ouvert: 'text-text-muted',
};

/**
 * Calculate consensus type from a 4-position vote distribution.
 * Uses weighted counts (anonymous = 0.5x) for accuracy.
 */
export function calculateConsensus(
  distribution: Record<VotingPosition, number>,
): ConsensusResult {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return { type: 'debat_ouvert', dominantPosition: null, percentage: 0 };
  }

  const entries = (Object.entries(distribution) as [VotingPosition, number][])
    .sort((a, b) => b[1] - a[1]);

  const [topPosition, topCount] = entries[0];
  const topPercent = (topCount / total) * 100;

  if (topPercent > 70) {
    return { type: 'consensus_fort', dominantPosition: topPosition, percentage: topPercent };
  }

  if (topPercent >= 50) {
    return { type: 'tendance_claire', dominantPosition: topPosition, percentage: topPercent };
  }

  // Check polarization: top 2 within 15% of each other and both > 30%
  if (entries.length >= 2) {
    const secondPercent = (entries[1][1] / total) * 100;
    if (topPercent > 30 && secondPercent > 30 && (topPercent - secondPercent) <= 15) {
      return { type: 'polarise', dominantPosition: topPosition, percentage: topPercent };
    }
  }

  return { type: 'debat_ouvert', dominantPosition: topPosition, percentage: topPercent };
}
