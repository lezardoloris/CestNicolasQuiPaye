import { describe, it, expect } from 'vitest';
import { stripHtmlTags } from './sanitize';

describe('stripHtmlTags', () => {
  // ─── Cas de base ────────────────────────────────────────────────

  it('supprime les balises HTML simples', () => {
    expect(stripHtmlTags('<p>Bonjour</p>')).toBe('Bonjour');
  });

  it('supprime les balises auto-fermantes', () => {
    expect(stripHtmlTags('Hello<br/>World')).toBe('HelloWorld');
  });

  it('supprime les balises avec attributs', () => {
    expect(stripHtmlTags('<a href="https://example.com">Lien</a>')).toBe('Lien');
  });

  it('retourne le texte inchange sans balises', () => {
    expect(stripHtmlTags('Texte simple')).toBe('Texte simple');
  });

  // ─── Prevention XSS ────────────────────────────────────────────

  it('supprime les balises script', () => {
    expect(stripHtmlTags('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  it('supprime les event handlers inline', () => {
    expect(stripHtmlTags('<div onclick="alert(1)">Click</div>')).toBe('Click');
  });

  it('supprime les balises img avec onerror', () => {
    expect(stripHtmlTags('<img src="x" onerror="alert(1)">')).toBe('');
  });

  it('supprime les iframes', () => {
    expect(stripHtmlTags('<iframe src="evil.com"></iframe>')).toBe('');
  });

  // ─── Gestion des espaces ───────────────────────────────────────

  it('normalise les espaces multiples en un seul', () => {
    expect(stripHtmlTags('Hello   World')).toBe('Hello World');
  });

  it('supprime les espaces en debut et fin', () => {
    expect(stripHtmlTags('  Hello World  ')).toBe('Hello World');
  });

  it('normalise les sauts de ligne et tabulations', () => {
    expect(stripHtmlTags('Hello\n\n\tWorld')).toBe('Hello World');
  });

  it('normalise les espaces apres suppression de balises', () => {
    expect(stripHtmlTags('<p>Hello</p> <p>World</p>')).toBe('Hello World');
  });

  // ─── Cas limites ──────────────────────────────────────────────

  it('gere une chaine vide', () => {
    expect(stripHtmlTags('')).toBe('');
  });

  it('gere une chaine contenant seulement des balises', () => {
    expect(stripHtmlTags('<div><span></span></div>')).toBe('');
  });

  it('gere les chevrons invalides (pas des balises)', () => {
    // "5 < 10 > 3" - the regex will remove "< 10 >" as it looks like a tag
    // but "5" and "3" should remain
    expect(stripHtmlTags('5 < 10 > 3')).toBe('5 3');
  });

  it('gere les balises imbriquees', () => {
    expect(stripHtmlTags('<div><p><strong>Texte</strong></p></div>')).toBe('Texte');
  });

  it('preserve les caracteres speciaux francais', () => {
    expect(stripHtmlTags('<p>éàü ç ñ</p>')).toBe('éàü ç ñ');
  });

  it('gere les entites HTML comme du texte brut (apres suppression des balises)', () => {
    expect(stripHtmlTags('&amp; &lt; &gt;')).toBe('&amp; &lt; &gt;');
  });

  it('supprime les balises style', () => {
    expect(stripHtmlTags('<style>body{color:red}</style>Texte')).toBe('body{color:red}Texte');
  });
});
