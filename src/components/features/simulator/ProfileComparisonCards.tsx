'use client';

import { useState } from 'react';
import { formatEUR } from '@/lib/utils/format';
import { PUBLIC_PROFILES } from '@/lib/constants/tax-2026';
import { cn } from '@/lib/utils';
import type { ProfileType } from '@/types/simulator';

interface ProfileComparisonCardsProps {
  totalTaxes: number;
}

export function ProfileComparisonCards({ totalTaxes }: ProfileComparisonCardsProps) {
  const [selected, setSelected] = useState<ProfileType>('retraite');
  const selectedProfile = PUBLIC_PROFILES.find((p) => p.type === selected)!;
  const nbFinanced = totalTaxes > 0 ? totalTaxes / selectedProfile.annualCost : 0;

  return (
    <div className="rounded-xl border border-border-default bg-surface-secondary p-5">
      <h3 className="mb-1 text-sm font-medium text-text-secondary">
        Vos impôts financent combien de…
      </h3>
      <p className="mb-4 text-xs text-text-muted">
        Coût public moyen par profil (sources : DREES, CNAF, Unédic, CNAV)
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-3">
        {PUBLIC_PROFILES.map((profile) => {
          const isActive = selected === profile.type;
          return (
            <button
              key={profile.type}
              onClick={() => setSelected(profile.type)}
              className={cn(
                'rounded-lg border p-3 text-left transition-all',
                isActive
                  ? 'border-chainsaw-red bg-chainsaw-red/5'
                  : 'border-border-default bg-surface-primary hover:border-text-muted',
              )}
            >
              <div className="mb-1 text-xl">{profile.icon}</div>
              <p className="text-xs font-medium text-text-primary">{profile.label}</p>
              <p className="tabular-nums text-sm font-bold text-chainsaw-red">
                {formatEUR(profile.annualCost)}
                <span className="font-normal text-text-muted">/an</span>
              </p>
            </button>
          );
        })}
      </div>

      {/* Comparison callout */}
      <div className="rounded-lg bg-surface-primary p-4 text-center">
        <p className="text-sm text-text-secondary">
          Avec vos{' '}
          <span className="font-bold text-chainsaw-red">
            {formatEUR(totalTaxes)}
          </span>{' '}
          d'impôts (IR + TVA), vous financez l'équivalent de :
        </p>
        <p className="mt-1 font-display text-3xl font-bold text-text-primary" aria-live="polite">
          {nbFinanced.toFixed(1)} {selectedProfile.label.toLowerCase()}
          {nbFinanced >= 2 ? 's' : ''}
        </p>
      </div>

      {/* Breakdown of selected profile */}
      <div className="mt-3 space-y-1">
        {selectedProfile.breakdown.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">{item.label}</span>
            <span className="tabular-nums font-medium text-text-primary">
              {formatEUR(item.amount)}
            </span>
          </div>
        ))}
        <p className="pt-1 text-[0.65rem] text-text-muted">Source : {selectedProfile.source}</p>
      </div>
    </div>
  );
}
