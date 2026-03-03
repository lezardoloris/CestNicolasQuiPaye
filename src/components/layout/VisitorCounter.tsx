'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { formatCompactNumber } from '@/lib/utils/format';

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/page-views');
        if (!res.ok) return;
        const json = await res.json();
        setCount(json.data?.totalViews ?? null);
      } catch {
        // Silently fail — decorative element
      }
    }
    fetchCount();
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-text-muted" aria-label={`${count} pages vues`}>
      <Eye className="size-3" aria-hidden="true" />
      <span className="tabular-nums">{formatCompactNumber(count)} vues</span>
    </div>
  );
}
