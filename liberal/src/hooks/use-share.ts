'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  buildShareText,
  buildSubmissionUrl,
  buildTwitterShareUrl,
  buildFacebookShareUrl,
  buildWhatsAppShareUrl,
  copyToClipboard,
  canUseWebShareApi,
  triggerWebShare,
  openSharePopup,
} from '@/lib/utils/share';

type SharePlatform = 'twitter' | 'facebook' | 'whatsapp' | 'copy_link' | 'native';

interface UseShareOptions {
  submissionId: string;
  title: string;
  costPerTaxpayer?: number;
}

export function useShare({ submissionId, title, costPerTaxpayer }: UseShareOptions) {
  const [isSharing, setIsSharing] = useState(false);

  const trackShare = useCallback(
    async (platform: SharePlatform) => {
      try {
        await fetch(`/api/submissions/${submissionId}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform }),
        });
      } catch {
        // Silently fail tracking - do not block user experience
      }
    },
    [submissionId]
  );

  const shareText = buildShareText(title, costPerTaxpayer ?? 0);
  const shareUrl = buildSubmissionUrl(submissionId);

  const shareOnTwitter = useCallback(async () => {
    const url = buildTwitterShareUrl(shareText, buildSubmissionUrl(submissionId, 'twitter', 'social'));
    openSharePopup(url);
    await trackShare('twitter');
  }, [shareText, submissionId, trackShare]);

  const shareOnFacebook = useCallback(async () => {
    const url = buildFacebookShareUrl(buildSubmissionUrl(submissionId, 'facebook', 'social'));
    openSharePopup(url);
    await trackShare('facebook');
  }, [submissionId, trackShare]);

  const shareOnWhatsApp = useCallback(async () => {
    const url = buildWhatsAppShareUrl(shareText, buildSubmissionUrl(submissionId, 'whatsapp', 'social'));
    openSharePopup(url);
    await trackShare('whatsapp');
  }, [shareText, submissionId, trackShare]);

  const copyLink = useCallback(async () => {
    const url = buildSubmissionUrl(submissionId, 'copy_link', 'social');
    const success = await copyToClipboard(url);
    if (success) {
      toast.success('Lien copie dans le presse-papiers');
    } else {
      toast.error('Impossible de copier le lien');
    }
    await trackShare('copy_link');
  }, [submissionId, trackShare]);

  const nativeShare = useCallback(async () => {
    if (!canUseWebShareApi()) return false;
    setIsSharing(true);
    const success = await triggerWebShare(title, shareText, shareUrl);
    if (success) {
      await trackShare('native');
    }
    setIsSharing(false);
    return success;
  }, [title, shareText, shareUrl, trackShare]);

  return {
    shareOnTwitter,
    shareOnFacebook,
    shareOnWhatsApp,
    copyLink,
    nativeShare,
    canNativeShare: canUseWebShareApi(),
    isSharing,
  };
}
