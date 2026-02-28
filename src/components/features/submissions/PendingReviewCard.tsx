import Link from 'next/link';
import { Shield } from 'lucide-react';

interface PendingReviewCardProps {
  count: number;
}

export function PendingReviewCard({ count }: PendingReviewCardProps) {
  return (
    <Link
      href="/feed/review"
      className="border-border-default bg-surface-primary hover:bg-surface-elevated flex items-center gap-3 rounded-2xl border p-4 transition-colors"
    >
      <div className="bg-drapeau-rouge/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
        <Shield className="text-drapeau-rouge h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-text-primary text-sm font-semibold">Valider des signalements</p>
        <p className="text-text-secondary text-xs">
          {count} en attente de validation
        </p>
      </div>
      <span className="bg-drapeau-rouge flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white">
        {count}
      </span>
    </Link>
  );
}
