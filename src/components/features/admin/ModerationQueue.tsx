'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle } from 'lucide-react';
import { ModerationCard } from '@/components/features/admin/ModerationCard';
import { ModerationDetailPanel } from '@/components/features/admin/ModerationDetailPanel';
import { cn } from '@/lib/utils';
import type { ModerationCardSubmission } from '@/components/features/admin/ModerationCard';

interface ModerationQueueProps {
  isAdmin: boolean;
}

export function ModerationQueue({ isAdmin }: ModerationQueueProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: async () => {
      const res = await fetch('/api/admin/submissions?moderationStatus=pending&limit=50');
      if (!res.ok) throw new Error('Erreur de chargement');
      const json = await res.json();
      return json.data as ModerationCardSubmission[];
    },
  });

  const handleActionComplete = useCallback(
    (submissionId: string) => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-detail', submissionId] });
      setSelectedId(null);
    },
    [queryClient]
  );

  // Close panel on Escape
  useEffect(() => {
    if (!selectedId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-surface-elevated">
            <CardContent className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return (
      <Card className="bg-surface-elevated border-border/50">
        <CardContent className="py-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
          <p className="mt-4 text-lg font-medium text-text-primary">
            File de moderation vide
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Toutes les soumissions ont ete traitees.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isPanelOpen = selectedId !== null;

  return (
    <div
      className={cn(
        'grid transition-all duration-300',
        isPanelOpen ? 'md:grid-cols-[2fr_3fr] md:gap-4' : 'grid-cols-1'
      )}
    >
      {/* Card list pane */}
      <div
        className="space-y-3 overflow-y-auto"
        role="list"
        aria-label="File de moderation"
      >
        {items.map((item) => (
          <ModerationCard
            key={item.id}
            submission={item}
            isSelected={selectedId === item.id}
            onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
          />
        ))}
      </div>

      {/* Detail panel pane (desktop: inline, mobile: Sheet) */}
      {isPanelOpen && (
        <div className="sticky top-4 hidden h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-border-default bg-surface-elevated shadow-lg md:block">
          <ModerationDetailPanel
            submissionId={selectedId}
            isAdmin={isAdmin}
            onClose={() => setSelectedId(null)}
            onActionComplete={handleActionComplete}
          />
        </div>
      )}

      {/* Mobile: panel renders its own Sheet */}
      {isPanelOpen && (
        <div className="md:hidden">
          <ModerationDetailPanel
            submissionId={selectedId}
            isAdmin={isAdmin}
            onClose={() => setSelectedId(null)}
            onActionComplete={handleActionComplete}
          />
        </div>
      )}
    </div>
  );
}
