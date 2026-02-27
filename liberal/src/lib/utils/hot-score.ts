/**
 * Calculate the hot score for a submission.
 * Matches the PostgreSQL function `calculate_hot_score` exactly.
 *
 * Formula: log10(max(|upvotes - downvotes|, 1)) + (sign * created_epoch / 45000)
 *
 * - sign: +1 if net positive, -1 if net negative, 0 if zero
 * - created_epoch: Unix timestamp in seconds
 * - 45000: Decay constant (~12.5 hours) -- faster than Reddit for French news cycle
 *
 * @param upvotes - Number of upvotes
 * @param downvotes - Number of downvotes
 * @param createdAt - Submission creation date
 * @returns Hot score as a number
 */
export function calculateHotScore(
  upvotes: number,
  downvotes: number,
  createdAt: Date,
): number {
  const score = upvotes - downvotes;

  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const seconds = createdAt.getTime() / 1000;

  return order + (sign * seconds) / 45000;
}
