import { describe, it, expect } from 'vitest';
import { calculateHotScore } from './hot-score';

describe('calculateHotScore', () => {
  const referenceDate = new Date('2026-03-02T12:00:00Z');

  // ─── Cas de base ────────────────────────────────────────────────

  it('retourne un score positif pour des upvotes positifs', () => {
    const score = calculateHotScore(10, 0, referenceDate);
    expect(score).toBeGreaterThan(0);
  });

  it('retourne un score pour zero votes (score net = 0, sign = 0)', () => {
    const score = calculateHotScore(0, 0, referenceDate);
    // log10(max(0, 1)) = 0, sign = 0, so score = 0 + 0 = 0
    expect(score).toBe(0);
  });

  it('retourne un score negatif lie au temps pour des downvotes dominants', () => {
    const score = calculateHotScore(0, 10, referenceDate);
    // log10(10) = 1, sign = -1, time contribution is negative
    // So total = 1 + (-1 * seconds / 45000) which is negative since seconds is large
    expect(score).toBeLessThan(0);
  });

  // ─── Proprietes de la formule ───────────────────────────────────

  it('le score augmente avec plus d\'upvotes', () => {
    const score1 = calculateHotScore(10, 0, referenceDate);
    const score2 = calculateHotScore(100, 0, referenceDate);
    // Both have same sign (positive) and same time, but score2 has higher log component
    expect(score2).toBeGreaterThan(score1);
  });

  it('le score est logarithmique par rapport aux votes', () => {
    // log10(10) = 1, log10(100) = 2, log10(1000) = 3
    const score10 = calculateHotScore(10, 0, referenceDate);
    const score100 = calculateHotScore(100, 0, referenceDate);
    const score1000 = calculateHotScore(1000, 0, referenceDate);

    const diff1 = score100 - score10;
    const diff2 = score1000 - score100;
    // Both diffs should be approximately 1 (the log10 step)
    expect(diff1).toBeCloseTo(1, 0);
    expect(diff2).toBeCloseTo(1, 0);
  });

  it('un post plus recent a un meilleur score qu\'un ancien a votes egaux', () => {
    const recent = new Date('2026-03-02T12:00:00Z');
    const old = new Date('2026-03-01T00:00:00Z');
    const scoreRecent = calculateHotScore(10, 0, recent);
    const scoreOld = calculateHotScore(10, 0, old);
    expect(scoreRecent).toBeGreaterThan(scoreOld);
  });

  it('la constante de decroissance est 45000 secondes (~12.5 heures)', () => {
    const date1 = new Date('2026-03-02T00:00:00Z');
    const date2 = new Date('2026-03-02T12:30:00Z'); // 45000 secondes plus tard
    const score1 = calculateHotScore(10, 0, date1);
    const score2 = calculateHotScore(10, 0, date2);
    // La difference devrait etre environ 1 (45000/45000 = 1)
    expect(score2 - score1).toBeCloseTo(1, 0);
  });

  // ─── Votes equilibres ──────────────────────────────────────────

  it('votes egaux donnent un score net de zero (sign = 0)', () => {
    const score = calculateHotScore(5, 5, referenceDate);
    // score = 0, sign = 0 => log10(1) + 0 = 0
    expect(score).toBe(0);
  });

  // ─── Cas limites ───────────────────────────────────────────────

  it('un seul upvote sans downvote', () => {
    const score = calculateHotScore(1, 0, referenceDate);
    // log10(max(1, 1)) = 0, sign = 1
    const expectedOrder = Math.log10(1);
    const expectedTime = referenceDate.getTime() / 1000 / 45000;
    expect(score).toBeCloseTo(expectedOrder + expectedTime, 5);
  });

  it('gere de tres grands nombres de votes', () => {
    const score = calculateHotScore(1000000, 0, referenceDate);
    expect(score).toBeGreaterThan(0);
    expect(isFinite(score)).toBe(true);
  });

  it('gere une date epoch (1er janvier 1970)', () => {
    const epoch = new Date(0);
    const score = calculateHotScore(10, 0, epoch);
    // log10(10) = 1, time = 0/45000 = 0
    expect(score).toBeCloseTo(1, 5);
  });

  // ─── Verification de la formule exacte ─────────────────────────

  it('calcule la formule correctement pour des valeurs connues', () => {
    const upvotes = 100;
    const downvotes = 30;
    const date = new Date('2026-03-02T12:00:00Z');
    const sign = 1;
    const order = Math.log10(70);
    const seconds = date.getTime() / 1000;
    const expected = order + (sign * seconds) / 45000;

    const result = calculateHotScore(upvotes, downvotes, date);
    expect(result).toBeCloseTo(expected, 10);
  });

  it('le sign est -1 quand les downvotes dominent', () => {
    const upvotes = 3;
    const downvotes = 10;
    const date = new Date('2026-03-02T12:00:00Z');
    const sign = -1;
    const order = Math.log10(7);
    const seconds = date.getTime() / 1000;
    const expected = order + (sign * seconds) / 45000;

    const result = calculateHotScore(upvotes, downvotes, date);
    expect(result).toBeCloseTo(expected, 10);
  });
});
