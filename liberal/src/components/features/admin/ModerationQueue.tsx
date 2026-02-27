'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { formatRelativeTime, formatEUR } from '@/lib/utils/format';
import { toast } from 'sonner';

interface SubmissionItem {
  id: string;
  title: string;
  description: string;
  amount: string;
  sourceUrl: string;
  authorDisplay: string;
  moderationStatus: string;
  createdAt: string;
}

interface ModerationQueueProps {
  isAdmin: boolean;
}

export function ModerationQueue({ isAdmin }: ModerationQueueProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: async () => {
      const res = await fetch('/api/feed?sort=new&limit=50&moderationStatus=pending');
      if (!res.ok) throw new Error('Erreur de chargement');
      const json = await res.json();
      return json.data as SubmissionItem[];
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

  return (
    <div className="space-y-4" role="list" aria-label="File de moderation">
      {items.map((item) => (
        <ModerationCard
          key={item.id}
          submission={item}
          isAdmin={isAdmin}
          onActionComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
          }}
        />
      ))}
    </div>
  );
}

function ModerationCard({
  submission,
  isAdmin,
  onActionComplete,
}: {
  submission: SubmissionItem;
  isAdmin: boolean;
  onActionComplete: () => void;
}) {
  const [reason, setReason] = useState('');
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ action, reason }: { action: string; reason?: string }) => {
      const res = await fetch(`/api/admin/submissions/${submission.id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: reason || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Erreur de moderation');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      const labels: Record<string, string> = {
        approve: 'Soumission approuvee',
        reject: 'Soumission rejetee',
        request_edit: 'Modification demandee',
        remove: 'Soumission retiree',
      };
      toast.success(labels[variables.action] || 'Action effectuee');
      onActionComplete();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleAction = (action: string) => {
    if (['reject', 'request_edit', 'remove'].includes(action)) {
      if (!reason.trim()) {
        setExpandedAction(action);
        return;
      }
    }
    mutation.mutate({ action, reason: reason.trim() || undefined });
    setReason('');
    setExpandedAction(null);
  };

  return (
    <Card className="bg-surface-elevated border-border/50" role="listitem">
      <CardContent className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium text-text-primary">{submission.title}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
              <span>{submission.authorDisplay}</span>
              <span aria-hidden="true">-</span>
              <span>{formatRelativeTime(submission.createdAt)}</span>
              <span aria-hidden="true">-</span>
              <span className="font-semibold text-chainsaw-red">
                {formatEUR(submission.amount)}
              </span>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {submission.moderationStatus}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary line-clamp-3">
          {submission.description}
        </p>

        {/* Source link */}
        <a
          href={submission.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-info hover:underline"
          aria-label="Voir la source"
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
          Voir la source
        </a>

        {/* Reason input (when expanded) */}
        {expandedAction && (
          <div className="space-y-2">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Raison de cette action..."
              rows={2}
              maxLength={500}
              aria-label="Raison de moderation"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAction(expandedAction)}
                disabled={!reason.trim() || mutation.isPending}
                className="min-h-10"
                aria-label="Confirmer l'action"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  'Confirmer'
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setExpandedAction(null);
                  setReason('');
                }}
                className="min-h-10"
                aria-label="Annuler"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!expandedAction && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => handleAction('approve')}
              disabled={mutation.isPending}
              className="min-h-10 gap-1.5 bg-success hover:bg-success/90"
              aria-label="Approuver cette soumission"
            >
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              Approuver
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleAction('reject')}
              disabled={mutation.isPending}
              className="min-h-10 gap-1.5"
              aria-label="Rejeter cette soumission"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Rejeter
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('request_edit')}
              disabled={mutation.isPending}
              className="min-h-10 gap-1.5"
              aria-label="Demander une modification"
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
              Modifier
            </Button>
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction('remove')}
                disabled={mutation.isPending}
                className="min-h-10 gap-1.5 text-destructive hover:text-destructive"
                aria-label="Retirer cette soumission"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Retirer
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
