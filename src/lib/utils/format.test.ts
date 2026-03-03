import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatEUR,
  formatEURPrecise,
  formatRelativeTime,
  extractDomain,
  truncate,
  formatScore,
  formatWorkDays,
  formatCompactNumber,
  formatCompactEUR,
  formatDateFr,
  pluralize,
  fmtDecimal1,
  formatPctFr,
  formatFrenchNumber,
  formatFrenchCurrency,
  formatFrenchDate,
} from './format';

// ─── formatEUR ──────────────────────────────────────────────────────

describe('formatEUR', () => {
  it('formate un entier en EUR sans decimales', () => {
    const result = formatEUR(12500000);
    // Intl peut utiliser des espaces insecables
    expect(result.replace(/\s/g, ' ')).toContain('12 500 000');
    expect(result).toContain('€');
  });

  it('formate zero correctement', () => {
    const result = formatEUR(0);
    expect(result).toContain('0');
    expect(result).toContain('€');
  });

  it('formate un nombre negatif', () => {
    const result = formatEUR(-500);
    expect(result).toContain('500');
    expect(result).toContain('€');
  });

  it('accepte une chaine de caracteres valide', () => {
    const result = formatEUR('42000');
    expect(result.replace(/\s/g, ' ')).toContain('42 000');
  });

  it('retourne "0 EUR" pour une chaine invalide', () => {
    expect(formatEUR('abc')).toBe('0 EUR');
  });

  it('retourne "0 EUR" pour NaN', () => {
    expect(formatEUR(NaN)).toBe('0 EUR');
  });

  it('formate un tres grand nombre', () => {
    const result = formatEUR(999999999999);
    expect(result).toContain('€');
  });

  it('arrondit les decimales (pas de fraction)', () => {
    const result = formatEUR(12.99);
    expect(result).toContain('13');
    expect(result).toContain('€');
  });
});

// ─── formatEURPrecise ───────────────────────────────────────────────

describe('formatEURPrecise', () => {
  it('formate avec 2 decimales', () => {
    const result = formatEURPrecise(0.0263);
    expect(result).toContain('0,03');
    expect(result).toContain('€');
  });

  it('formate zero avec 2 decimales', () => {
    const result = formatEURPrecise(0);
    expect(result).toContain('0,00');
  });

  it('retourne "0,00 EUR" pour NaN', () => {
    expect(formatEURPrecise(NaN)).toBe('0,00 EUR');
  });

  it('retourne "0,00 EUR" pour une chaine invalide', () => {
    expect(formatEURPrecise('xyz')).toBe('0,00 EUR');
  });

  it('accepte une chaine de caracteres numerique', () => {
    const result = formatEURPrecise('123.456');
    expect(result).toContain('123,46');
    expect(result).toContain('€');
  });

  it('formate un nombre negatif avec precision', () => {
    const result = formatEURPrecise(-9.5);
    expect(result).toContain('9,50');
  });
});

// ─── formatRelativeTime ─────────────────────────────────────────────

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-02T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('affiche "il y a quelques secondes" pour moins de 60 secondes', () => {
    const date = new Date('2026-03-02T11:59:30Z');
    expect(formatRelativeTime(date)).toBe('il y a quelques secondes');
  });

  it('affiche les minutes', () => {
    const date = new Date('2026-03-02T11:45:00Z');
    expect(formatRelativeTime(date)).toBe('il y a 15min');
  });

  it('affiche les heures', () => {
    const date = new Date('2026-03-02T09:00:00Z');
    expect(formatRelativeTime(date)).toBe('il y a 3h');
  });

  it('affiche les jours', () => {
    const date = new Date('2026-02-28T12:00:00Z');
    expect(formatRelativeTime(date)).toBe('il y a 2j');
  });

  it('affiche les semaines', () => {
    const date = new Date('2026-02-16T12:00:00Z');
    expect(formatRelativeTime(date)).toBe('il y a 2sem');
  });

  it('affiche les mois', () => {
    const date = new Date('2025-12-02T12:00:00Z');
    expect(formatRelativeTime(date)).toBe('il y a 3mois');
  });

  it('affiche les annees', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    expect(formatRelativeTime(date)).toBe('il y a 2a');
  });

  it('accepte une chaine ISO', () => {
    const result = formatRelativeTime('2026-03-02T11:50:00Z');
    expect(result).toBe('il y a 10min');
  });

  it('1 minute exactement', () => {
    const date = new Date('2026-03-02T11:59:00Z');
    expect(formatRelativeTime(date)).toBe('il y a 1min');
  });

  it('1 heure exactement', () => {
    const date = new Date('2026-03-02T11:00:00Z');
    expect(formatRelativeTime(date)).toBe('il y a 1h');
  });

  it('1 jour exactement', () => {
    const date = new Date('2026-03-01T12:00:00Z');
    expect(formatRelativeTime(date)).toBe('il y a 1j');
  });
});

// ─── extractDomain ──────────────────────────────────────────────────

describe('extractDomain', () => {
  it('extrait le domaine sans www', () => {
    expect(extractDomain('https://www.lemonde.fr/article/123')).toBe('lemonde.fr');
  });

  it('extrait le domaine sans prefix www', () => {
    expect(extractDomain('https://google.com/search?q=test')).toBe('google.com');
  });

  it('extrait le domaine avec sous-domaine', () => {
    expect(extractDomain('https://api.example.com/v1')).toBe('api.example.com');
  });

  it('retourne la chaine originale pour une URL invalide', () => {
    expect(extractDomain('not-a-url')).toBe('not-a-url');
  });

  it('retourne la chaine vide pour une chaine vide', () => {
    expect(extractDomain('')).toBe('');
  });

  it('gere http sans s', () => {
    expect(extractDomain('http://example.org')).toBe('example.org');
  });
});

// ─── truncate ───────────────────────────────────────────────────────

describe('truncate', () => {
  it('ne tronque pas si le texte est plus court que maxLength', () => {
    expect(truncate('Bonjour', 10)).toBe('Bonjour');
  });

  it('ne tronque pas si le texte est exactement maxLength', () => {
    expect(truncate('12345', 5)).toBe('12345');
  });

  it('tronque et ajoute des points de suspension', () => {
    expect(truncate('Bonjour le monde', 7)).toBe('Bonjour\u2026');
  });

  it('gere une chaine vide', () => {
    expect(truncate('', 10)).toBe('');
  });

  it('tronque a 1 caractere', () => {
    expect(truncate('AB', 1)).toBe('A\u2026');
  });

  it('supprime les espaces en fin avant les points de suspension', () => {
    expect(truncate('Bonjour le monde', 9)).toBe('Bonjour l\u2026');
  });
});

// ─── formatScore ────────────────────────────────────────────────────

describe('formatScore', () => {
  it('retourne le nombre tel quel en dessous de 1000', () => {
    expect(formatScore(500)).toBe('500');
  });

  it('retourne "0" pour zero', () => {
    expect(formatScore(0)).toBe('0');
  });

  it('formate en milliers avec k', () => {
    const result = formatScore(1500);
    expect(result).toContain('1,5');
    expect(result).toContain('k');
  });

  it('formate un nombre negatif inferieur a -1000', () => {
    const result = formatScore(-2500);
    expect(result).toContain('2,5');
    expect(result).toContain('k');
  });

  it('retourne le nombre negatif tel quel au dessus de -1000', () => {
    expect(formatScore(-500)).toBe('-500');
  });

  it('formate 1000 exactement en k', () => {
    const result = formatScore(1000);
    expect(result).toContain('1');
    expect(result).toContain('k');
  });

  it('formate 999 sans k', () => {
    expect(formatScore(999)).toBe('999');
  });
});

// ─── formatWorkDays ─────────────────────────────────────────────────

describe('formatWorkDays', () => {
  it('formate un nombre de jours', () => {
    const result = formatWorkDays(2.5);
    expect(result).toContain('2,5');
    expect(result).toContain('jours de travail');
  });

  it('formate zero jour', () => {
    const result = formatWorkDays(0);
    expect(result).toContain('0,0');
    expect(result).toContain('jours de travail');
  });

  it('accepte une chaine de caracteres', () => {
    const result = formatWorkDays('3.7');
    expect(result).toContain('3,7');
    expect(result).toContain('jours de travail');
  });

  it('retourne "0 jours de travail" pour une chaine invalide', () => {
    expect(formatWorkDays('abc')).toBe('0 jours de travail');
  });

  it('retourne "0 jours de travail" pour NaN', () => {
    expect(formatWorkDays(NaN)).toBe('0 jours de travail');
  });
});

// ─── formatCompactNumber ────────────────────────────────────────────

describe('formatCompactNumber', () => {
  it('retourne le nombre tel quel en dessous de 1000', () => {
    expect(formatCompactNumber(500)).toBe('500');
  });

  it('retourne "0" pour zero', () => {
    expect(formatCompactNumber(0)).toBe('0');
  });

  it('formate en notation compacte pour les milliers', () => {
    const result = formatCompactNumber(1500);
    // Intl compact peut produire "1,5 k" ou "2 k" selon l'arrondi
    expect(result).toBeTruthy();
  });

  it('formate les millions', () => {
    const result = formatCompactNumber(5000000);
    expect(result).toBeTruthy();
    expect(result.length).toBeLessThan(10);
  });

  it('retourne le nombre negatif tel quel en dessous de 1000 en absolu', () => {
    expect(formatCompactNumber(-999)).toBe('-999');
  });
});

// ─── formatCompactEUR ───────────────────────────────────────────────

describe('formatCompactEUR', () => {
  it('formate les milliards en "Md EUR"', () => {
    const result = formatCompactEUR(1500000000);
    expect(result).toContain('1,5');
    expect(result).toContain('Md');
    expect(result).toContain('€');
  });

  it('formate les millions en "M EUR"', () => {
    const result = formatCompactEUR(45000000);
    expect(result).toContain('45');
    expect(result).toContain('M');
    expect(result).toContain('€');
  });

  it('formate les milliers en "k EUR"', () => {
    const result = formatCompactEUR(5000);
    expect(result).toContain('5');
    expect(result).toContain('k');
    expect(result).toContain('€');
  });

  it('formate les petits montants avec EUR seulement', () => {
    expect(formatCompactEUR(500)).toBe('500 €');
  });

  it('formate zero', () => {
    expect(formatCompactEUR(0)).toBe('0 €');
  });

  it('formate un nombre negatif en milliards', () => {
    const result = formatCompactEUR(-2000000000);
    expect(result).toContain('-');
    expect(result).toContain('2');
    expect(result).toContain('Md');
    expect(result).toContain('€');
  });

  it('formate un nombre negatif en millions', () => {
    const result = formatCompactEUR(-10000000);
    expect(result).toContain('-');
    expect(result).toContain('10');
    expect(result).toContain('M');
    expect(result).toContain('€');
  });

  it('formate les trillions en Md (car >= 1e12)', () => {
    const result = formatCompactEUR(1_500_000_000_000);
    expect(result).toContain('Md');
    expect(result).toContain('€');
  });
});

// ─── formatDateFr ───────────────────────────────────────────────────

describe('formatDateFr', () => {
  it('formate une date en format francais', () => {
    const result = formatDateFr(new Date('2026-03-02'));
    expect(result).toBe('02/03/2026');
  });

  it('accepte une chaine ISO', () => {
    const result = formatDateFr('2026-01-15');
    expect(result).toBe('15/01/2026');
  });
});

// ─── pluralize ──────────────────────────────────────────────────────

describe('pluralize', () => {
  it('retourne le singulier pour 0', () => {
    expect(pluralize(0, 'vote', 'votes')).toBe('vote');
  });

  it('retourne le singulier pour 1', () => {
    expect(pluralize(1, 'vote', 'votes')).toBe('vote');
  });

  it('retourne le pluriel pour 2', () => {
    expect(pluralize(2, 'vote', 'votes')).toBe('votes');
  });

  it('retourne le pluriel pour un grand nombre', () => {
    expect(pluralize(1000, 'commentaire', 'commentaires')).toBe('commentaires');
  });

  it('retourne le singulier pour un nombre negatif (-1)', () => {
    expect(pluralize(-1, 'vote', 'votes')).toBe('vote');
  });
});

// ─── fmtDecimal1 ────────────────────────────────────────────────────

describe('fmtDecimal1', () => {
  it('formate avec 1 decimale max', () => {
    expect(fmtDecimal1.format(4.7)).toBe('4,7');
  });

  it('ne montre pas de decimale si entier', () => {
    expect(fmtDecimal1.format(15)).toBe('15');
  });

  it('arrondit a 1 decimale', () => {
    expect(fmtDecimal1.format(3.14159)).toBe('3,1');
  });

  it('formate zero', () => {
    expect(fmtDecimal1.format(0)).toBe('0');
  });
});

// ─── formatPctFr ────────────────────────────────────────────────────

describe('formatPctFr', () => {
  it('formate un pourcentage avec symbole', () => {
    expect(formatPctFr(4.7)).toBe('4,7%');
  });

  it('formate zero pourcent', () => {
    expect(formatPctFr(0)).toBe('0%');
  });

  it('formate un entier', () => {
    expect(formatPctFr(100)).toBe('100%');
  });

  it('arrondit a 1 decimale', () => {
    expect(formatPctFr(33.333)).toBe('33,3%');
  });
});

// ─── formatFrenchNumber ─────────────────────────────────────────────

describe('formatFrenchNumber', () => {
  it('formate un entier avec separateurs de milliers', () => {
    const result = formatFrenchNumber(68373433);
    expect(result.replace(/\s/g, ' ')).toBe('68 373 433');
  });

  it('formate un nombre decimal sans decimals specifies', () => {
    const result = formatFrenchNumber(62.4658);
    expect(result).toBe('62,4658');
  });

  it('formate avec un nombre de decimales specifie', () => {
    const result = formatFrenchNumber(62.4658, 2);
    expect(result).toBe('62,47');
  });

  it('formate zero', () => {
    expect(formatFrenchNumber(0)).toBe('0');
  });

  it('formate zero avec decimales specifiees', () => {
    expect(formatFrenchNumber(0, 2)).toBe('0,00');
  });
});

// ─── formatFrenchCurrency ───────────────────────────────────────────

describe('formatFrenchCurrency', () => {
  it('formate en EUR avec 2 decimales par defaut', () => {
    const result = formatFrenchCurrency(62.47);
    expect(result).toContain('62,47');
    expect(result).toContain('€');
  });

  it('formate avec un nombre de decimales specifie', () => {
    const result = formatFrenchCurrency(100, 0);
    expect(result).toContain('100');
    expect(result).toContain('€');
  });

  it('formate zero', () => {
    const result = formatFrenchCurrency(0);
    expect(result).toContain('0,00');
    expect(result).toContain('€');
  });
});

// ─── formatFrenchDate ───────────────────────────────────────────────

describe('formatFrenchDate', () => {
  it('formate une date ISO en DD/MM/YYYY', () => {
    expect(formatFrenchDate('2026-03-02')).toBe('02/03/2026');
  });

  it('formate une date avec heure', () => {
    expect(formatFrenchDate('2026-01-15T14:30:00Z')).toBe('15/01/2026');
  });
});
