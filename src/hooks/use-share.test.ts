import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShare } from '@/hooks/use-share';

// Mock sonner
vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock useXpResponse
const mockProcessXpResponse = vi.fn();
vi.mock('@/hooks/useXpResponse', () => ({
  useXpResponse: () => ({ processXpResponse: mockProcessXpResponse }),
}));

// Mock share utils
const mockOpenSharePopup = vi.fn();
const mockCopyToClipboard = vi.fn().mockResolvedValue(true);
const mockCanUseWebShareApi = vi.fn().mockReturnValue(false);
const mockTriggerWebShare = vi.fn().mockResolvedValue(true);

vi.mock('@/lib/utils/share', () => ({
  buildShareText: vi.fn((title: string, cost: number) => `${title} coute ${cost} EUR`),
  buildSubmissionUrl: vi.fn(
    (id: string, source?: string, medium?: string) =>
      `https://nicoquipaie.co/submissions/${id}${source ? `?utm_source=${source}&utm_medium=${medium}` : ''}`,
  ),
  buildTwitterShareUrl: vi.fn(
    (text: string, url: string) => `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
  ),
  buildFacebookShareUrl: vi.fn(
    (url: string) => `https://facebook.com/sharer?u=${url}`,
  ),
  buildWhatsAppShareUrl: vi.fn(
    (text: string, url: string) => `https://wa.me/?text=${text}+${url}`,
  ),
  copyToClipboard: (...args: unknown[]) => mockCopyToClipboard(...args),
  canUseWebShareApi: () => mockCanUseWebShareApi(),
  triggerWebShare: (...args: unknown[]) => mockTriggerWebShare(...args),
  openSharePopup: (...args: unknown[]) => mockOpenSharePopup(...args),
}));

describe('useShare', () => {
  const defaultOptions = {
    submissionId: 'sub-123',
    title: 'Budget Defense 2026',
    costPerTaxpayer: 47.05,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCanUseWebShareApi.mockReturnValue(false);
    mockCopyToClipboard.mockResolvedValue(true);
    mockTriggerWebShare.mockResolvedValue(true);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { xp: { amount: 5 } } }),
      }),
    );
  });

  it('s\'importe correctement', () => {
    expect(useShare).toBeDefined();
    expect(typeof useShare).toBe('function');
  });

  it('retourne toutes les fonctions de partage', () => {
    const { result } = renderHook(() => useShare(defaultOptions));

    expect(typeof result.current.shareOnTwitter).toBe('function');
    expect(typeof result.current.shareOnFacebook).toBe('function');
    expect(typeof result.current.shareOnWhatsApp).toBe('function');
    expect(typeof result.current.copyLink).toBe('function');
    expect(typeof result.current.nativeShare).toBe('function');
    expect(typeof result.current.canNativeShare).toBe('boolean');
    expect(typeof result.current.isSharing).toBe('boolean');
  });

  it('canNativeShare est false quand Web Share API n\'est pas disponible', () => {
    mockCanUseWebShareApi.mockReturnValue(false);
    const { result } = renderHook(() => useShare(defaultOptions));
    expect(result.current.canNativeShare).toBe(false);
  });

  it('canNativeShare est true quand Web Share API est disponible', () => {
    mockCanUseWebShareApi.mockReturnValue(true);
    const { result } = renderHook(() => useShare(defaultOptions));
    expect(result.current.canNativeShare).toBe(true);
  });

  it('isSharing est false initialement', () => {
    const { result } = renderHook(() => useShare(defaultOptions));
    expect(result.current.isSharing).toBe(false);
  });

  // ─── shareOnTwitter ──────────────────────────────────────────

  it('shareOnTwitter ouvre un popup et traque le partage', async () => {
    const { result } = renderHook(() => useShare(defaultOptions));

    await act(async () => {
      await result.current.shareOnTwitter();
    });

    expect(mockOpenSharePopup).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
    );

    // Verifie que le tracking a ete appele
    const fetchMock = vi.mocked(global.fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/submissions/${defaultOptions.submissionId}/share`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ platform: 'twitter' }),
      }),
    );
  });

  // ─── shareOnFacebook ─────────────────────────────────────────

  it('shareOnFacebook ouvre un popup et traque le partage', async () => {
    const { result } = renderHook(() => useShare(defaultOptions));

    await act(async () => {
      await result.current.shareOnFacebook();
    });

    expect(mockOpenSharePopup).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer'),
    );

    const fetchMock = vi.mocked(global.fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/submissions/${defaultOptions.submissionId}/share`,
      expect.objectContaining({
        body: JSON.stringify({ platform: 'facebook' }),
      }),
    );
  });

  // ─── shareOnWhatsApp ─────────────────────────────────────────

  it('shareOnWhatsApp ouvre un popup et traque le partage', async () => {
    const { result } = renderHook(() => useShare(defaultOptions));

    await act(async () => {
      await result.current.shareOnWhatsApp();
    });

    expect(mockOpenSharePopup).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'),
    );

    const fetchMock = vi.mocked(global.fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/submissions/${defaultOptions.submissionId}/share`,
      expect.objectContaining({
        body: JSON.stringify({ platform: 'whatsapp' }),
      }),
    );
  });

  // ─── copyLink ────────────────────────────────────────────────

  it('copyLink copie le lien et affiche un toast de succes', async () => {
    const { toast } = await import('sonner');
    mockCopyToClipboard.mockResolvedValue(true);

    const { result } = renderHook(() => useShare(defaultOptions));

    await act(async () => {
      await result.current.copyLink();
    });

    expect(mockCopyToClipboard).toHaveBeenCalledWith(
      expect.stringContaining(`submissions/${defaultOptions.submissionId}`),
    );
    expect(toast.success).toHaveBeenCalledWith('Lien copie dans le presse-papiers');
  });

  it('copyLink affiche un toast d\'erreur si la copie echoue', async () => {
    const { toast } = await import('sonner');
    mockCopyToClipboard.mockResolvedValue(false);

    const { result } = renderHook(() => useShare(defaultOptions));

    await act(async () => {
      await result.current.copyLink();
    });

    expect(toast.error).toHaveBeenCalledWith('Impossible de copier le lien');
  });

  it('copyLink traque le partage meme si la copie echoue', async () => {
    mockCopyToClipboard.mockResolvedValue(false);

    const { result } = renderHook(() => useShare(defaultOptions));

    await act(async () => {
      await result.current.copyLink();
    });

    const fetchMock = vi.mocked(global.fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/submissions/${defaultOptions.submissionId}/share`,
      expect.objectContaining({
        body: JSON.stringify({ platform: 'copy_link' }),
      }),
    );
  });

  // ─── nativeShare ─────────────────────────────────────────────

  it('nativeShare retourne false si Web Share API n\'est pas disponible', async () => {
    mockCanUseWebShareApi.mockReturnValue(false);

    const { result } = renderHook(() => useShare(defaultOptions));

    let shareResult: boolean | undefined;
    await act(async () => {
      shareResult = await result.current.nativeShare();
    });

    expect(shareResult).toBe(false);
    expect(mockTriggerWebShare).not.toHaveBeenCalled();
  });

  it('nativeShare utilise l\'API Web Share et traque le partage', async () => {
    mockCanUseWebShareApi.mockReturnValue(true);
    mockTriggerWebShare.mockResolvedValue(true);

    const { result } = renderHook(() => useShare(defaultOptions));

    let shareResult: boolean | undefined;
    await act(async () => {
      shareResult = await result.current.nativeShare();
    });

    expect(shareResult).toBe(true);
    expect(mockTriggerWebShare).toHaveBeenCalled();

    const fetchMock = vi.mocked(global.fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/submissions/${defaultOptions.submissionId}/share`,
      expect.objectContaining({
        body: JSON.stringify({ platform: 'native' }),
      }),
    );
  });

  it('nativeShare ne traque pas si le partage natif echoue', async () => {
    mockCanUseWebShareApi.mockReturnValue(true);
    mockTriggerWebShare.mockResolvedValue(false);

    const { result } = renderHook(() => useShare(defaultOptions));

    let shareResult: boolean | undefined;
    await act(async () => {
      shareResult = await result.current.nativeShare();
    });

    expect(shareResult).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // ─── trackShare ──────────────────────────────────────────────

  it('appelle processXpResponse apres un partage reussi', async () => {
    const responseData = { data: { xp: { amount: 5 } } };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(responseData),
      }),
    );

    const { result } = renderHook(() => useShare(defaultOptions));

    await act(async () => {
      await result.current.shareOnTwitter();
    });

    expect(mockProcessXpResponse).toHaveBeenCalledWith(responseData);
  });

  it('ne propage pas les erreurs de tracking', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    );

    const { result } = renderHook(() => useShare(defaultOptions));

    // Cela ne devrait pas throw
    await act(async () => {
      await result.current.shareOnTwitter();
    });

    // Le popup est quand meme ouvert
    expect(mockOpenSharePopup).toHaveBeenCalled();
  });

  it('fonctionne sans costPerTaxpayer', () => {
    const { result } = renderHook(() =>
      useShare({
        submissionId: 'sub-456',
        title: 'Test',
      }),
    );

    expect(result.current).toBeDefined();
    expect(typeof result.current.shareOnTwitter).toBe('function');
  });
});
