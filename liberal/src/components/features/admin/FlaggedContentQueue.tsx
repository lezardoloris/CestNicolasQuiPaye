'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  Trash2,
  Flag,
  Loader2,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import { toast } from 'sonner';

interface FlagDetail {
  id: string;
  reason: string;
  details: string | null;
  createdAt: string;
  userDisplay: string;
}

interface FlaggedSubmission {
  submissionId: string;
  submissionTitle: string;
  moderationStatus: string;
  flagCount: number;
  latestFlagAt: string;
  flags: FlagDetail[];
}

const REASON_LABELS: Record<string, string> = {
  inaccurate: 'Donnees inexactes',
  spam: 'Spam',
  inappropriate: 'Inapproprie',
};

interface FlaggedContentQueueProps {
  isAdmin: boolean;
}

export function FlaggedContentQueue({ isAdmin }: FlaggedContentQueueProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['flagged-content'],
    queryFn: async () => {
      const res = await fetch('/api/admin/flags');
      if (!res.ok) throw new Error('Erreur de chargement');
      const json = await res.json();
      return json.data as FlaggedSubmission[];
    },
  });

  const moderateMutation = useMutation({
    mutationFn: async ({
      submissionId,
      action,
    }: {
      submissionId: string;
      action: string;
    }) => {
      const res = await fetch(`/api/admin/submissions/${submissionId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: action === 'approve' ? undefined : 'Contenu signale par la communaute',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Erreur');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Action effectuee');
      queryClient.invalidateQueries({ queryKey: ['flagged-content'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-surface-elevated">
            <CardContent className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-12 w-full" />
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
          <Flag className="mx-auto h-12 w-12 text-text-muted" aria-hidden="true" />
          <p className="mt-4 text-lg font-medium text-text-primary">
            Aucun contenu signale
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Aucun signalement a traiter pour le moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label="Contenus signales">
      {items.map((item) => (
        <Card
          key={item.submissionId}
          className="bg-surface-elevated border-border/50"
          role="listitem"
        >
          <CardContent className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-text-primary">
                  {item.submissionTitle}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                  <Badge variant="destructive" className="text-xs">
                    {item.flagCount} {item.flagCount > 1 ? 'signalements' : 'signalement'}
                  </Badge>
                  <span>Dernier : {formatRelativeTime(item.latestFlagAt)}</span>
                </div>
              </div>
              <Badge variant="secondary">{item.moderationStatus}</Badge>
            </div>

            {/* Flag details */}
            <div className="space-y-2">
              {item.flags.map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-start gap-2 rounded border border-border/30 p-2 text-sm"
                >
                  <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">
                        {REASON_LABELS[flag.reason] ?? flag.reason}
                      </span>
                      <span className="text-xs text-text-muted">
                        par {flag.userDisplay}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatRelativeTime(flag.createdAt)}
                      </span>
                    </div>
                    {flag.details && (
                      <p className="mt-1 text-xs text-text-secondary">
                        {flag.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() =>
                  moderateMutation.mutate({
                    submissionId: item.submissionId,
                    action: 'approve',
                  })
                }
                disabled={moderateMutation.isPending}
                className="min-h-10 gap-1.5 bg-success hover:bg-success/90"
                aria-label="Ignorer les signalements et approuver"
              >
                {moderateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                )}
                Approuver
              </Button>
              {isAdmin && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    moderateMutation.mutate({
                      submissionId: item.submissionId,
                      action: 'remove',
                    })
                  }
                  disabled={moderateMutation.isPending}
                  className="min-h-10 gap-1.5"
                  aria-label="Retirer ce contenu"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Retirer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
