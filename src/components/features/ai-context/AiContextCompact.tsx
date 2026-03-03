'use client';

import { useAiContext } from '@/hooks/useAiContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

interface AiContextCompactProps {
  submissionId: string;
}

export function AiContextCompact({ submissionId }: AiContextCompactProps) {
  const { context, isLoading } = useAiContext(submissionId);

  if (isLoading) {
    return (
      <div className="space-y-1.5 rounded-lg border border-border-default p-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!context?.budgetContext) return null;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
          Contexte budgétaire
        </span>
      </div>

      <p className="text-xs leading-relaxed text-text-secondary line-clamp-3">
        {context.budgetContext}
      </p>

      {context.costComparison && (
        <div className="mt-2 rounded bg-white/60 px-2.5 py-1.5 dark:bg-white/5">
          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">
            Équivalences
          </p>
          <p className="whitespace-pre-line text-xs text-text-secondary line-clamp-2">
            {context.costComparison}
          </p>
        </div>
      )}
    </div>
  );
}
