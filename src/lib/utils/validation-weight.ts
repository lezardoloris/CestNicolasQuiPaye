/**
 * Returns the vote weight for community validation based on user level.
 * Higher-level users have more influence on validation outcomes.
 */
export function getValidationWeight(level: number): number {
  if (level >= 15) return 5;
  if (level >= 10) return 4;
  if (level >= 7) return 3;
  if (level >= 4) return 2;
  return 1;
}

/** Minimum level required to participate in community validation */
export const MIN_VALIDATION_LEVEL = 2;

/** Thresholds for auto-resolving submissions */
export const VALIDATION_THRESHOLDS = {
  /** Minimum total approve weight to auto-approve (low for early-stage growth) */
  minApproveWeight: 3,
  /** Minimum total reject weight to auto-reject (higher bar to reject) */
  minRejectWeight: 5,
  /** Approve must exceed reject by this ratio */
  approveRatio: 2,
  /** Reject must exceed approve by this ratio */
  rejectRatio: 2,
} as const;
