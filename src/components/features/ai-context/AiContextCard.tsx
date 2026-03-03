'use client';

import { useState } from 'react';
import { useAiContext } from '@/hooks/useAiContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ChevronDown, Sparkles } from 'lucide-react';

interface AiContextCardProps {
  submissionId: string;
}

export function AiContextCard({ submissionId }: AiContextCardProps) {
  const { context, isLoading } = useAiContext(submissionId);
  const [factsOpen, setFactsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-2 rounded-xl border border-border-default bg-surface-primary p-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!context?.budgetContext) return null;

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900 dark:bg-blue-950/30">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
          Contexte budgétaire
        </h3>
      </div>

      {/* Budget context paragraph */}
      <p className="text-sm leading-relaxed text-text-secondary">{context.budgetContext}</p>

      {/* Cost comparisons */}
      {context.costComparison && (
        <div className="mt-3 rounded-lg bg-white/60 p-3 dark:bg-white/5">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">
            Équivalences
          </p>
          <div className="whitespace-pre-line text-sm text-text-secondary">
            {context.costComparison}
          </div>
        </div>
      )}

      {/* LLM summary (when available) */}
      {context.summary && (
        <div className="mt-3 rounded-lg border-l-2 border-blue-400 bg-white/60 p-3 dark:bg-white/5">
          <p className="text-sm italic text-text-secondary">{context.summary}</p>
        </div>
      )}

      {/* Related facts (collapsible) */}
      {context.relatedFacts && context.relatedFacts.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setFactsOpen(!factsOpen)}
            className="flex w-full items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ChevronDown
              className={cn('h-3.5 w-3.5 transition-transform', factsOpen && 'rotate-180')}
            />
            {factsOpen ? 'Masquer' : 'Voir'} les chiffres clés ({context.relatedFacts.length})
          </button>
          {factsOpen && (
            <ul className="mt-2 space-y-1.5">
              {context.relatedFacts.map((fact, i) => (
                <li key={i} className="text-xs leading-relaxed text-text-muted">
                  • {fact}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
