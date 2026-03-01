'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check, Link2 } from 'lucide-react';
import { formatEUR } from '@/lib/utils/format';
import type { TaxSimulationResult } from '@/types/simulator';

interface SimulatorShareCardProps {
  simulation: TaxSimulationResult;
}

export function SimulatorShareCard({ simulation }: SimulatorShareCardProps) {
  const [copied, setCopied] = useState(false);
  const { input, totalPrelevements, tauxEffectifGlobal } = simulation;

  // Build shareable URL
  const [shareUrl, setShareUrl] = useState('');
  useEffect(() => {
    const params = new URLSearchParams({
      gross: String(input.annualGross),
      single: input.isSingle ? '1' : '0',
      children: String(input.nbChildren),
    });
    setShareUrl(`${window.location.origin}/simulateur?${params.toString()}`);
  }, [input]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: ignore
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Mon simulation fiscale — C\'est Nicolas qui paye',
        text: `Avec ${formatEUR(input.annualGross)} brut/an, je paye ${formatEUR(totalPrelevements)} de prélèvements (${(tauxEffectifGlobal * 100).toFixed(1)}%).`,
        url: shareUrl,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="rounded-xl border border-border-default bg-surface-secondary p-5">
      <h3 className="mb-2 text-sm font-medium text-text-secondary">Partager votre résultat</h3>

      <div className="mb-3 rounded-lg bg-surface-primary p-3 text-sm text-text-primary">
        <p>
          Avec un salaire de <strong>{formatEUR(input.annualGross)}</strong> brut/an
          {!input.isSingle ? ' (couple)' : ''}{input.nbChildren > 0 ? `, ${input.nbChildren} enfant${input.nbChildren > 1 ? 's' : ''}` : ''},
          je paye <strong className="text-chainsaw-red">{formatEUR(totalPrelevements)}</strong> de
          prélèvements par an ({(tauxEffectifGlobal * 100).toFixed(1)} %).
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
          {copied ? <Check className="size-4 text-emerald-500" /> : <Link2 className="size-4" />}
          {copied ? 'Copié !' : 'Copier le lien'}
        </Button>
        <Button variant="default" size="sm" onClick={handleNativeShare} className="gap-2">
          <Share2 className="size-4" />
          Partager
        </Button>
      </div>
    </div>
  );
}
