'use client';

import { formatEUR } from '@/lib/utils/format';
import { Skull } from 'lucide-react';

interface GrandTotalCounterProps {
  totalAmountEur: number;
}

export function GrandTotalCounter({ totalAmountEur }: GrandTotalCounterProps) {
  return (
    <div className="rounded-xl border border-chainsaw-red/20 bg-chainsaw-red/5 p-6 text-center">
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-text-muted">
        <Skull className="size-4 text-chainsaw-red" aria-hidden="true" />
        Total des gaspillages signalés
      </div>
      <p className="mt-2 font-display text-3xl font-black tabular-nums text-chainsaw-red sm:text-5xl">
        {formatEUR(totalAmountEur)}
      </p>
      <p className="mt-1 text-xs text-text-muted">
        Cumul des dépenses publiques documentées par les citoyens
      </p>
    </div>
  );
}
