'use client';

import { useMaturity } from '@/hooks/useMaturity';
import { MaturityBadge } from './MaturityBadge';
import { MaturityProgress } from './MaturityProgress';
import { Skeleton } from '@/components/ui/skeleton';
import type { MaturityLevel } from '@/types/maturity';

interface MaturitySectionProps {
  submissionId: string;
  serverLevel: number;
}

export function MaturitySection({ submissionId, serverLevel }: MaturitySectionProps) {
  const { maturity, isLoading } = useMaturity(submissionId);

  const level = (maturity?.level ?? serverLevel) as MaturityLevel;

  return (
    <div className="space-y-3 rounded-xl border border-border-default bg-surface-primary p-4">
      <div className="flex items-center gap-2">
        <MaturityBadge level={level} />
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-full rounded-lg" />
      ) : maturity ? (
        <MaturityProgress
          level={maturity.level}
          percentage={maturity.percentage}
          missingForNext={maturity.missingForNext}
        />
      ) : null}
    </div>
  );
}
