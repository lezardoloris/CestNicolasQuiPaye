import { describe, it, expect } from 'vitest';
import { calculateKarma, getKarmaTier } from './karma';
import type { KarmaStats } from './karma';

// ─── calculateKarma ─────────────────────────────────────────────────

describe('calculateKarma', () => {
  it('calcule le karma avec tous les facteurs', () => {
    const stats: KarmaStats = {
      submissionCount: 5,
      voteCount: 100,
      sourceCount: 3,
      noteCount: 2,
      shareCount: 10,
    };
    // 5*10 + 100*1 + 3*5 + 2*3 + 10*2 = 50 + 100 + 15 + 6 + 20 = 191
    expect(calculateKarma(stats)).toBe(191);
  });

  it('retourne 0 pour des stats a zero', () => {
    const stats: KarmaStats = {
      submissionCount: 0,
      voteCount: 0,
      sourceCount: 0,
      noteCount: 0,
      shareCount: 0,
    };
    expect(calculateKarma(stats)).toBe(0);
  });

  it('pondere les soumissions a 10 points', () => {
    const stats: KarmaStats = {
      submissionCount: 1,
      voteCount: 0,
      sourceCount: 0,
      noteCount: 0,
      shareCount: 0,
    };
    expect(calculateKarma(stats)).toBe(10);
  });

  it('pondere les votes a 1 point', () => {
    const stats: KarmaStats = {
      submissionCount: 0,
      voteCount: 1,
      sourceCount: 0,
      noteCount: 0,
      shareCount: 0,
    };
    expect(calculateKarma(stats)).toBe(1);
  });

  it('pondere les sources a 5 points', () => {
    const stats: KarmaStats = {
      submissionCount: 0,
      voteCount: 0,
      sourceCount: 1,
      noteCount: 0,
      shareCount: 0,
    };
    expect(calculateKarma(stats)).toBe(5);
  });

  it('pondere les notes a 3 points', () => {
    const stats: KarmaStats = {
      submissionCount: 0,
      voteCount: 0,
      sourceCount: 0,
      noteCount: 1,
      shareCount: 0,
    };
    expect(calculateKarma(stats)).toBe(3);
  });

  it('pondere les partages a 2 points', () => {
    const stats: KarmaStats = {
      submissionCount: 0,
      voteCount: 0,
      sourceCount: 0,
      noteCount: 0,
      shareCount: 1,
    };
    expect(calculateKarma(stats)).toBe(2);
  });

  it('gere de grands nombres', () => {
    const stats: KarmaStats = {
      submissionCount: 1000,
      voteCount: 50000,
      sourceCount: 500,
      noteCount: 200,
      shareCount: 3000,
    };
    // 1000*10 + 50000*1 + 500*5 + 200*3 + 3000*2
    // = 10000 + 50000 + 2500 + 600 + 6000 = 69100
    expect(calculateKarma(stats)).toBe(69100);
  });
});

// ─── getKarmaTier ───────────────────────────────────────────────────

describe('getKarmaTier', () => {
  it('retourne Tronconneuse d\'Or pour le rang 1', () => {
    const tier = getKarmaTier(1);
    expect(tier.label).toBe("Tronconneuse d'Or");
    expect(tier.color).toBe('text-yellow-400');
  });

  it('retourne Tronconneuse d\'Argent pour les rangs 2-5', () => {
    for (const rank of [2, 3, 4, 5]) {
      const tier = getKarmaTier(rank);
      expect(tier.label).toBe("Tronconneuse d'Argent");
      expect(tier.color).toBe('text-slate-300');
    }
  });

  it('retourne Tronconneuse de Bronze pour les rangs 6-20', () => {
    for (const rank of [6, 10, 15, 20]) {
      const tier = getKarmaTier(rank);
      expect(tier.label).toBe('Tronconneuse de Bronze');
      expect(tier.color).toBe('text-amber-600');
    }
  });

  it('retourne Citoyen Actif pour les rangs 21-100', () => {
    for (const rank of [21, 50, 99, 100]) {
      const tier = getKarmaTier(rank);
      expect(tier.label).toBe('Citoyen Actif');
      expect(tier.color).toBe('text-info');
    }
  });

  it('retourne Citoyen pour les rangs au-dela de 100', () => {
    for (const rank of [101, 500, 10000]) {
      const tier = getKarmaTier(rank);
      expect(tier.label).toBe('Citoyen');
      expect(tier.color).toBe('text-text-muted');
    }
  });

  it('chaque tier a un emoji', () => {
    for (const rank of [1, 3, 10, 50, 200]) {
      const tier = getKarmaTier(rank);
      expect(tier.emoji).toBeTruthy();
      expect(tier.emoji.length).toBeGreaterThan(0);
    }
  });

  it('les tiers sont dans l\'ordre decroissant de prestige', () => {
    const gold = getKarmaTier(1);
    const silver = getKarmaTier(3);
    const bronze = getKarmaTier(10);
    const active = getKarmaTier(50);
    const citizen = getKarmaTier(200);

    // All should be different labels
    const labels = [gold.label, silver.label, bronze.label, active.label, citizen.label];
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(5);
  });
});
