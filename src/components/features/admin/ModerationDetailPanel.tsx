'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CheckCircle, XCircle, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { EditSubmissionDialog } from '@/components/features/submissions/EditSubmissionDialog';
import {
  SubmissionInfoSection,
  CostSection,
  CommunitySignalsSection,
  AiContextSection,
  ModerationHistorySection,
} from '@/components/features/admin/ModerationDetailSections';
import { useModerationDetail } from '@/hooks/useModerationDetail';
import { toast } from 'sonner';
import type { ModerationDetailData } from '@/types/moderation-detail';

interface ModerationDetailPanelProps {
  submissionId: string;
  isAdmin: boolean;
  onClose: () => void;
  onActionComplete: (submissionId: string) => void;
}

export function ModerationDetailPanel({
  submissionId,
  isAdmin,
  onClose,
  onActionComplete,
}: ModerationDetailPanelProps) {
  const { data, isLoading, error, refetch } = useModerationDetail(submissionId);

  return (
    <>
      {/* Desktop: inline panel */}
      <div className="hidden h-full flex-col md:flex">
        <PanelContent
          data={data ?? null}
          isLoading={isLoading}
          error={error}
          isAdmin={isAdmin}
          onClose={onClose}
          onActionComplete={onActionComplete}
          onRetry={() => refetch()}
        />
      </div>

      {/* Mobile: Sheet overlay */}
      <div className="md:hidden">
        <Sheet open onOpenChange={(open) => { if (!open) onClose(); }}>
          <SheetContent side="right" className="w-full p-0">
            <PanelContent
              data={data ?? null}
              isLoading={isLoading}
              error={error}
              isAdmin={isAdmin}
              onClose={onClose}
              onActionComplete={onActionComplete}
              onRetry={() => refetch()}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

// ─── Panel Content (shared between desktop and mobile) ────────────────

interface PanelContentProps {
  data: ModerationDetailData | null;
  isLoading: boolean;
  error: Error | null;
  isAdmin: boolean;
  onClose: () => void;
  onActionComplete: (submissionId: string) => void;
  onRetry: () => void;
}

function PanelContent({
  data,
  isLoading,
  error,
  isAdmin,
  onClose,
  onActionComplete,
  onRetry,
}: PanelContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border-default px-4 py-3">
        <h2 className="truncate text-sm font-semibold text-text-primary">
          {data?.title ?? 'Detail de la soumission'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 shrink-0">
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </Button>
      </div>

      {/* Scrollable body */}
      <ScrollArea className="flex-1">
        <div className="space-y-5 p-4">
          {isLoading && <PanelSkeleton />}
          {error && (
            <div className="text-center">
              <p className="text-sm text-destructive">Erreur de chargement</p>
              <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
                Reessayer
              </Button>
            </div>
          )}
          {data && !isLoading && (
            <>
              <SubmissionInfoSection
                title={data.title}
                description={data.description}
                ministryTag={data.ministryTag}
                authorDisplay={data.authorDisplay}
                moderationStatus={data.moderationStatus}
                createdAt={data.createdAt}
              />
              <CostSection
                amount={data.amount}
                costPerTaxpayer={data.costPerTaxpayer}
                sourceUrl={data.sourceUrl}
              />
              <CommunitySignalsSection
                upvoteCount={data.upvoteCount}
                downvoteCount={data.downvoteCount}
                fourPosEssentielCount={data.fourPosEssentielCount}
                fourPosJustifieCount={data.fourPosJustifieCount}
                fourPosDiscutableCount={data.fourPosDiscutableCount}
                fourPosInjustifieCount={data.fourPosInjustifieCount}
                fourPosTotalCount={data.fourPosTotalCount}
                consensusType={data.consensusType}
                approveWeight={data.approveWeight}
                rejectWeight={data.rejectWeight}
                solutionCount={data.solutionCount}
                noteCount={data.noteCount}
                sourceCount={data.sourceCount}
              />
              <AiContextSection aiContext={data.aiContext} />
              <ModerationHistorySection history={data.moderationHistory} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Sticky action footer */}
      {data && !isLoading && (
        <ModerationActionFooter
          data={data}
          isAdmin={isAdmin}
          onActionComplete={onActionComplete}
        />
      )}
    </div>
  );
}

// ─── Action Footer ───────────────────────────────────────────────────

function ModerationActionFooter({
  data,
  isAdmin,
  onActionComplete,
}: {
  data: ModerationDetailData;
  isAdmin: boolean;
  onActionComplete: (submissionId: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ action, reason }: { action: string; reason?: string }) => {
      const res = await fetch(`/api/admin/submissions/${data.id}/moderate`, {
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
    onSuccess: (_result, variables) => {
      const labels: Record<string, string> = {
        approve: 'Soumission approuvee',
        reject: 'Soumission rejetee',
        request_edit: 'Modification demandee',
        remove: 'Soumission retiree',
      };
      toast.success(labels[variables.action] || 'Action effectuee');
      queryClient.invalidateQueries({ queryKey: ['moderation-detail', data.id] });
      onActionComplete(data.id);
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
    <div className="shrink-0 border-t border-border-default bg-surface-elevated p-3">
      {expandedAction ? (
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
              className="min-h-9"
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
              onClick={() => { setExpandedAction(null); setReason(''); }}
              className="min-h-9"
            >
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => handleAction('approve')}
            disabled={mutation.isPending}
            className="min-h-9 gap-1.5 bg-success hover:bg-success/90"
          >
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            Approuver
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleAction('reject')}
            disabled={mutation.isPending}
            className="min-h-9 gap-1.5"
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Rejeter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditOpen(true)}
            disabled={mutation.isPending}
            className="min-h-9 gap-1.5"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Modifier
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('remove')}
              disabled={mutation.isPending}
              className="min-h-9 gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Retirer
            </Button>
          )}
        </div>
      )}

      <EditSubmissionDialog
        submission={{
          id: data.id,
          title: data.title,
          description: data.description,
          sourceUrl: data.sourceUrl,
          amount: data.amount,
          ministryTag: data.ministryTag,
        }}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) onActionComplete(data.id);
        }}
      />
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────

function PanelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
