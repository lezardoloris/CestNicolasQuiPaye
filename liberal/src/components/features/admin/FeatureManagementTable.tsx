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
  Loader2,
  Rocket,
  Clock,
  Code,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import {
  FEATURE_PROPOSAL_CATEGORIES,
  FEATURE_VOTE_STATUS_LABELS,
} from '@/lib/utils/validation';
import { toast } from 'sonner';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  voteCount: number;
  authorDisplay: string;
  createdAt: string;
  userVote: number | null;
  rejectionReason: string | null;
}

const STATUS_OPTIONS = [
  { value: 'proposed', label: 'Propose', icon: Clock },
  { value: 'planned', label: 'Planifie', icon: CheckCircle },
  { value: 'in_progress', label: 'En cours', icon: Code },
  { value: 'shipped', label: 'Realise', icon: Rocket },
  { value: 'declined', label: 'Refuse', icon: XCircle },
] as const;

export function FeatureManagementTable() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-features'],
    queryFn: async () => {
      const res = await fetch('/api/features?sortBy=votes&limit=50');
      if (!res.ok) throw new Error('Erreur de chargement');
      const json = await res.json();
      return json.data as FeatureItem[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-surface-elevated">
            <CardContent className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
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
          <p className="text-sm text-text-muted">
            Aucune proposition pour le moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label="Gestion des propositions">
      {items.map((item) => (
        <FeatureManagementCard
          key={item.id}
          feature={item}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-features'] });
          }}
        />
      ))}
    </div>
  );
}

function FeatureManagementCard({
  feature,
  onUpdate,
}: {
  feature: FeatureItem;
  onUpdate: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(feature.status);
  const [rejectionReason, setRejectionReason] = useState(feature.rejectionReason || '');
  const [showActions, setShowActions] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/features/${feature.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          rejectionReason:
            selectedStatus === 'declined' ? rejectionReason : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Erreur');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Statut mis a jour');
      setShowActions(false);
      onUpdate();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const statusLabel =
    FEATURE_VOTE_STATUS_LABELS[feature.status as keyof typeof FEATURE_VOTE_STATUS_LABELS] ??
    feature.status;
  const categoryLabel =
    FEATURE_PROPOSAL_CATEGORIES[feature.category as keyof typeof FEATURE_PROPOSAL_CATEGORIES] ??
    feature.category;

  return (
    <Card className="bg-surface-elevated border-border/50" role="listitem">
      <CardContent className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium text-text-primary">{feature.title}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
              <Badge variant="outline" className="text-xs">
                {categoryLabel}
              </Badge>
              <span>{feature.voteCount} votes</span>
              <span aria-hidden="true">-</span>
              <span>{feature.authorDisplay}</span>
              <span aria-hidden="true">-</span>
              <span>{formatRelativeTime(feature.createdAt)}</span>
            </div>
          </div>
          <Badge variant="secondary">{statusLabel}</Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary line-clamp-2">
          {feature.description}
        </p>

        {/* Status update */}
        {showActions ? (
          <div className="space-y-3 rounded-md border border-border/50 p-3">
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <Button
                    key={opt.value}
                    size="sm"
                    variant={selectedStatus === opt.value ? 'default' : 'outline'}
                    onClick={() => setSelectedStatus(opt.value)}
                    className="min-h-10 gap-1.5"
                    aria-label={`Definir le statut comme ${opt.label}`}
                    aria-pressed={selectedStatus === opt.value}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {opt.label}
                  </Button>
                );
              })}
            </div>

            {selectedStatus === 'declined' && (
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Raison du refus (min. 10 caracteres)..."
                rows={2}
                maxLength={500}
                aria-label="Raison du refus"
              />
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => mutation.mutate()}
                disabled={
                  mutation.isPending ||
                  selectedStatus === feature.status ||
                  (selectedStatus === 'declined' && rejectionReason.length < 10)
                }
                className="min-h-10"
                aria-label="Enregistrer le changement de statut"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  'Enregistrer'
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowActions(false);
                  setSelectedStatus(feature.status);
                }}
                className="min-h-10"
                aria-label="Annuler"
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowActions(true)}
            className="min-h-10"
            aria-label="Modifier le statut"
          >
            Changer le statut
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
