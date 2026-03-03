import { describe, it, expect, vi } from 'vitest';
import {
  buildShareText,
  appendUtmParams,
  buildSubmissionUrl,
  buildTwitterShareUrl,
  buildFacebookShareUrl,
  buildWhatsAppShareUrl,
  sanitizeReferrer,
  canUseWebShareApi,
  copyToClipboard,
  triggerWebShare,
  openSharePopup,
} from './share';

// ─── buildShareText ─────────────────────────────────────────────────

describe('buildShareText', () => {
  it('construit un texte de partage avec le titre et le cout', () => {
    const text = buildShareText('Budget Defense 2026', 47.05);
    expect(text).toContain('Budget Defense 2026');
    expect(text).toContain('47,05');
    expect(text).toContain('EUR');
    expect(text).toContain('#NicolasPaie');
    expect(text).toContain('#Tronçonneuse');
  });

  it('tronque les titres de plus de 80 caracteres', () => {
    const longTitle = 'A'.repeat(100);
    const text = buildShareText(longTitle, 10);
    expect(text).toContain('A'.repeat(80) + '...');
    expect(text).not.toContain('A'.repeat(81));
  });

  it('ne tronque pas les titres de 80 caracteres ou moins', () => {
    const title = 'A'.repeat(80);
    const text = buildShareText(title, 10);
    expect(text).toContain(title);
    expect(text).not.toContain('...');
  });

  it('formate le cout en format francais avec 2 decimales', () => {
    const text = buildShareText('Test', 1234.5);
    expect(text).toContain('1\u202f234,50');
  });

  it('inclut le contexte "par an a chaque contribuable francais"', () => {
    const text = buildShareText('Test', 10);
    expect(text).toContain('par an à chaque contribuable français');
  });
});

// ─── appendUtmParams ────────────────────────────────────────────────

describe('appendUtmParams', () => {
  it('ajoute les parametres UTM a une URL', () => {
    const result = appendUtmParams('https://example.com/page', 'twitter', 'social');
    expect(result).toContain('utm_source=twitter');
    expect(result).toContain('utm_medium=social');
    expect(result).toContain('utm_campaign=submission');
  });

  it('utilise une campagne personnalisee', () => {
    const result = appendUtmParams('https://example.com', 'fb', 'social', 'promo');
    expect(result).toContain('utm_campaign=promo');
  });

  it('utilise "submission" comme campagne par defaut', () => {
    const result = appendUtmParams('https://example.com', 'src', 'med');
    expect(result).toContain('utm_campaign=submission');
  });

  it('preserve les parametres existants', () => {
    const result = appendUtmParams('https://example.com?existing=param', 'src', 'med');
    expect(result).toContain('existing=param');
    expect(result).toContain('utm_source=src');
  });
});

// ─── buildSubmissionUrl ─────────────────────────────────────────────

describe('buildSubmissionUrl', () => {
  it('construit l\'URL de soumission sans UTM', () => {
    const url = buildSubmissionUrl('abc-123');
    expect(url).toContain('/submissions/abc-123');
    expect(url).not.toContain('utm_');
  });

  it('construit l\'URL avec parametres UTM', () => {
    const url = buildSubmissionUrl('abc-123', 'twitter', 'social');
    expect(url).toContain('/submissions/abc-123');
    expect(url).toContain('utm_source=twitter');
    expect(url).toContain('utm_medium=social');
  });

  it('n\'ajoute pas d\'UTM si seul source est fourni (sans medium)', () => {
    const url = buildSubmissionUrl('abc-123', 'twitter');
    expect(url).not.toContain('utm_');
  });
});

// ─── buildTwitterShareUrl ───────────────────────────────────────────

describe('buildTwitterShareUrl', () => {
  it('construit une URL Twitter valide', () => {
    const url = buildTwitterShareUrl('Texte du tweet', 'https://example.com');
    expect(url).toContain('https://twitter.com/intent/tweet');
    expect(url).toContain('text=');
    expect(url).toContain('url=');
  });

  it('encode correctement les caracteres speciaux', () => {
    const url = buildTwitterShareUrl('Coût: 10 € #test', 'https://example.com');
    expect(url).toContain('twitter.com/intent/tweet');
    // The URL should be properly encoded
    expect(url).not.toContain(' ');
  });
});

// ─── buildFacebookShareUrl ──────────────────────────────────────────

describe('buildFacebookShareUrl', () => {
  it('construit une URL Facebook valide', () => {
    const url = buildFacebookShareUrl('https://example.com/page');
    expect(url).toContain('https://www.facebook.com/sharer/sharer.php');
    expect(url).toContain('u=');
    expect(url).toContain(encodeURIComponent('https://example.com/page'));
  });

  it('encode correctement l\'URL', () => {
    const url = buildFacebookShareUrl('https://example.com/page?q=test&lang=fr');
    expect(url).toContain('https://www.facebook.com/sharer/sharer.php?u=');
  });
});

// ─── buildWhatsAppShareUrl ──────────────────────────────────────────

describe('buildWhatsAppShareUrl', () => {
  it('construit une URL WhatsApp valide', () => {
    const url = buildWhatsAppShareUrl('Message', 'https://example.com');
    expect(url).toContain('https://wa.me/');
    expect(url).toContain('text=');
  });

  it('combine le texte et l\'URL dans le parametre text', () => {
    const url = buildWhatsAppShareUrl('Voir ceci', 'https://example.com');
    // The text should contain both the message and the URL, encoded
    const decodedText = decodeURIComponent(url.split('text=')[1]);
    expect(decodedText).toContain('Voir ceci');
    expect(decodedText).toContain('https://example.com');
  });
});

// ─── sanitizeReferrer ───────────────────────────────────────────────

describe('sanitizeReferrer', () => {
  it('extrait le hostname d\'une URL valide', () => {
    expect(sanitizeReferrer('https://www.google.com/search?q=test')).toBe('www.google.com');
  });

  it('extrait le hostname sans chemin', () => {
    expect(sanitizeReferrer('https://twitter.com')).toBe('twitter.com');
  });

  it('retourne une chaine vide pour une URL invalide', () => {
    expect(sanitizeReferrer('not-a-url')).toBe('');
  });

  it('retourne une chaine vide pour une chaine vide', () => {
    expect(sanitizeReferrer('')).toBe('');
  });

  it('extrait le hostname avec sous-domaine', () => {
    expect(sanitizeReferrer('https://blog.example.com/article')).toBe('blog.example.com');
  });
});

// ─── canUseWebShareApi ──────────────────────────────────────────────

describe('canUseWebShareApi', () => {
  it('retourne false si navigator.share n\'est pas disponible', () => {
    // In jsdom, navigator.share is not defined by default
    expect(canUseWebShareApi()).toBe(false);
  });

  it('retourne true si navigator.share est disponible', () => {
    const shareMock = vi.fn();
    vi.stubGlobal('navigator', { ...navigator, share: shareMock });
    expect(canUseWebShareApi()).toBe(true);
    vi.unstubAllGlobals();
  });
});

// ─── copyToClipboard ────────────────────────────────────────────────

describe('copyToClipboard', () => {
  it('copie le texte via navigator.clipboard.writeText', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText: writeTextMock } });

    const result = await copyToClipboard('texte a copier');

    expect(writeTextMock).toHaveBeenCalledWith('texte a copier');
    expect(result).toBe(true);
    vi.unstubAllGlobals();
  });

  it('utilise le fallback textarea si navigator.clipboard n\'est pas disponible', async () => {
    vi.stubGlobal('navigator', { clipboard: undefined });

    const mockTextarea = {
      value: '',
      style: { position: '', opacity: '' },
      select: vi.fn(),
    };
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(mockTextarea as unknown as HTMLElement);
    const appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((node) => node);
    const removeChildSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation((node) => node);

    // execCommand is not defined in jsdom, so we define it before spying
    document.execCommand = vi.fn().mockReturnValue(true);
    const execCommandSpy = vi.spyOn(document, 'execCommand');

    const result = await copyToClipboard('texte fallback');

    expect(createElementSpy).toHaveBeenCalledWith('textarea');
    expect(mockTextarea.value).toBe('texte fallback');
    expect(mockTextarea.style.position).toBe('fixed');
    expect(mockTextarea.style.opacity).toBe('0');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(mockTextarea.select).toHaveBeenCalled();
    expect(execCommandSpy).toHaveBeenCalledWith('copy');
    expect(removeChildSpy).toHaveBeenCalled();
    expect(result).toBe(true);

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    execCommandSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('retourne false en cas d\'erreur', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Erreur clipboard')),
      },
    });

    const result = await copyToClipboard('texte');

    expect(result).toBe(false);
    vi.unstubAllGlobals();
  });
});

// ─── triggerWebShare ────────────────────────────────────────────────

describe('triggerWebShare', () => {
  it('appelle navigator.share et retourne true en cas de succes', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share: shareMock });

    const result = await triggerWebShare('Titre', 'Description', 'https://example.com');

    expect(shareMock).toHaveBeenCalledWith({
      title: 'Titre',
      text: 'Description',
      url: 'https://example.com',
    });
    expect(result).toBe(true);
    vi.unstubAllGlobals();
  });

  it('retourne false si navigator.share echoue', async () => {
    const shareMock = vi.fn().mockRejectedValue(new Error('Partage annule'));
    vi.stubGlobal('navigator', { share: shareMock });

    const result = await triggerWebShare('Titre', 'Description', 'https://example.com');

    expect(result).toBe(false);
    vi.unstubAllGlobals();
  });
});

// ─── openSharePopup ─────────────────────────────────────────────────

describe('openSharePopup', () => {
  it('ouvre une fenetre popup avec les parametres corrects', () => {
    const openMock = vi.fn();
    vi.stubGlobal('window', { ...window, open: openMock });

    openSharePopup('https://twitter.com/intent/tweet?text=hello');

    expect(openMock).toHaveBeenCalledWith(
      'https://twitter.com/intent/tweet?text=hello',
      '_blank',
      'width=550,height=420,noopener,noreferrer',
    );
    vi.unstubAllGlobals();
  });
});
