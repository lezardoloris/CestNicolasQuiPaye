'use client';

import { useCallback, useState } from 'react';
import { FileText, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SOURCE_TYPE_LABELS } from '@/lib/utils/validation';
import type { SourceType } from '@/lib/utils/validation';
import { useSources } from '@/hooks/useSources';
import { AddSourceForm } from './AddSourceForm';
import { extractDomain } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { XpRewardBadge } from '@/components/features/gamification/XpRewardBadge';
import { PostActionNudge } from '@/components/features/gamification/PostActionNudge';

interface SourceListProps {
  submissionId: string;
}

function getSourceTypeColor(_type: SourceType): string {
  return 'text-text-secondary border-border-default';
}

export function SourceList({ submissionId }: SourceListProps) {
  const { sources, isLoading, addSource, isAdding, validateSource, isValidating } =
    useSources(submissionId);
  const [showNudge, setShowNudge] = useState(false);
  const dismissNudge = useCallback(() => setShowNudge(false), []);

  const handleAddSource: typeof addSource = async (data) => {
    const result = await addSource(data);
    setShowNudge(true);
    return result;
  };

  return (
    <section id="sources" className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="size-5 text-text-muted" aria-hidden="true" />
        <h2 className="text-base font-semibold text-text-primary">
          Sources & verification
        </h2>
        <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium text-text-secondary">
          {sources.length}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : sources.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-text-muted">
          Soyez le premier à ajouter une source !
          <XpRewardBadge actionType="source_added" variant="pill" />
        </p>
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
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-text-muted transition-colors hover:bg-chainsaw-red/10 hover:text-chainsaw-red disabled:opacity-50"
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

      <AddSourceForm onSubmit={handleAddSource} isSubmitting={isAdding} />
      <PostActionNudge action="source_added" visible={showNudge} onDismiss={dismissNudge} />
    </section>
  );
}
