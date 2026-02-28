'use client';

import { FileText, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SOURCE_TYPE_LABELS } from '@/lib/utils/validation';
import type { SourceType } from '@/lib/utils/validation';
import { useSources } from '@/hooks/useSources';
import { AddSourceForm } from './AddSourceForm';
import { extractDomain } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface SourceListProps {
  submissionId: string;
}

function getSourceTypeColor(type: SourceType): string {
  switch (type) {
    case 'official_report':
      return 'text-success border-success/30';
    case 'parliamentary':
      return 'text-info border-info/30';
    case 'press_article':
      return 'text-warning border-warning/30';
    case 'think_tank':
      return 'text-purple-400 border-purple-400/30';
    default:
      return 'text-text-muted border-border-default';
  }
}

export function SourceList({ submissionId }: SourceListProps) {
  const { sources, isLoading, addSource, isAdding, validateSource, isValidating } =
    useSources(submissionId);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="size-5 text-info" aria-hidden="true" />
        <h2 className="text-base font-semibold text-text-primary">
          Sources & verification
        </h2>
        <span className="rounded-full bg-info/10 px-2 py-0.5 text-xs font-medium text-info">
          {sources.length}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : sources.length === 0 ? (
        <p className="text-sm text-text-muted">Aucune source ajoutee.</p>
      ) : (
        <div className="space-y-2">
          {sources.map((source) => {
            const total = source.validationCount + source.invalidationCount;
            const validPercent = total > 0 ? Math.round((source.validationCount / total) * 100) : 0;

            return (
              <div
                key={source.id}
                className="rounded-lg border border-border-default bg-surface-secondary p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'px-1.5 py-0 text-[10px] leading-5',
                          getSourceTypeColor(source.sourceType),
                        )}
                      >
                        {SOURCE_TYPE_LABELS[source.sourceType]}
                      </Badge>
                      <span className="text-[11px] text-text-muted">
                        {extractDomain(source.url)}
                      </span>
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-text-primary hover:text-chainsaw-red"
                    >
                      {source.title}
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => validateSource({ sourceId: source.id, isValid: true })}
                    disabled={isValidating}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-text-muted transition-colors hover:bg-success/10 hover:text-success disabled:opacity-50"
                    aria-label="Valider cette source"
                  >
                    <ThumbsUp className="size-3" aria-hidden="true" />
                    <span>{source.validationCount}</span>
                  </button>
                  <button
                    onClick={() => validateSource({ sourceId: source.id, isValid: false })}
                    disabled={isValidating}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-text-muted transition-colors hover:bg-chainsaw-red/10 hover:text-chainsaw-red disabled:opacity-50"
                    aria-label="Invalider cette source"
                  >
                    <ThumbsDown className="size-3" aria-hidden="true" />
                    <span>{source.invalidationCount}</span>
                  </button>
                  {total > 0 && (
                    <span className="text-[11px] text-text-muted">
                      {validPercent}% validee
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddSourceForm onSubmit={addSource} isSubmitting={isAdding} />
    </section>
  );
}
