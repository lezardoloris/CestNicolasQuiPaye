'use client';

import { formatCompactNumber } from '@/lib/utils/format';
import { FileText, ThumbsUp, Users, Tag } from 'lucide-react';

interface KpiCardsProps {
  submissions: number;
  totalUpvotes: number;
  uniqueVoters: number;
  categories: number;
}

const kpis = [
  { key: 'submissions', label: 'Signalements', icon: FileText, color: 'text-chainsaw-red' },
  { key: 'totalUpvotes', label: 'Votes positifs', icon: ThumbsUp, color: 'text-success' },
  { key: 'uniqueVoters', label: 'Citoyens mobilises', icon: Users, color: 'text-info' },
  { key: 'categories', label: 'Categories', icon: Tag, color: 'text-warning' },
] as const;

export function KpiCards({ submissions, totalUpvotes, uniqueVoters, categories }: KpiCardsProps) {
  const values: Record<string, number> = { submissions, totalUpvotes, uniqueVoters, categories };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {kpis.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="rounded-lg border border-border-default bg-surface-secondary p-4"
        >
          <Icon className={`size-5 ${color}`} aria-hidden="true" />
          <p className="mt-2 font-display text-xl font-bold tabular-nums text-text-primary sm:text-2xl">
            {formatCompactNumber(values[key])}
          </p>
          <p className="text-xs text-text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}
