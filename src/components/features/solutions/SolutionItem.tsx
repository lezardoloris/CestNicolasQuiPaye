'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowUp, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAdjustments } from '@/hooks/useAdjustments';
import { AdjustmentThread } from '@/components/features/solutions/AdjustmentThread';
import { SolutionForm } from '@/components/features/solutions/SolutionForm';

interface SolutionItemProps {
  solution: {
    id: string;
    authorId?: string | null;
    authorDisplay: string;
    body: string;
    upvoteCount: number;
    downvoteCount: number;
    createdAt: string;
  };
  totalUpvotes: number;
  rank: number;
  onVote: (solutionId: string, voteType: 'up' | 'down') => void;
  isVoting: boolean;
  onUpdate?: (solutionId: string, data: { body: string }) => Promise<unknown>;
  onDelete?: (solutionId: string) => Promise<unknown>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function SolutionItem({
  solution,
  totalUpvotes,
  rank,
  onVote,
  isVoting,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: SolutionItemProps) {
  const { data: session } = useSession();
  const [showThread, setShowThread] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { adjustments, isLoading: loadingAdjustments, refetch, createAdjustment, isCreating } =
    useAdjustments(solution.id);

  const isAuthor = !!session?.user?.id && solution.authorId === session.user.id;
  const isAdminOrMod =
    session?.user?.role === 'admin' || session?.user?.role === 'moderator';
  const canEdit = isAuthor || isAdminOrMod;

  const handleToggleThread = () => {
    const next = !showThread;
    setShowThread(next);
    if (next) refetch();
  };

  const handleUpdate = async (body: string) => {
    if (!onUpdate) return;
    await onUpdate(solution.id, { body });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    await onDelete(solution.id);
    setShowDeleteConfirm(false);
  };

  const percentage = totalUpvotes > 0
    ? Math.round((solution.upvoteCount / totalUpvotes) * 100)
    : 0;
  const isLeader = rank === 0 && solution.upvoteCount > 0;

  if (isEditing) {
    return (
      <div className="rounded-lg border border-border-default bg-surface-secondary p-3">
        <SolutionForm
          onSubmit={handleUpdate}
          isSubmitting={!!isUpdating}
          initialBody={solution.body}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border-default bg-surface-secondary p-3">
      {/* Solution text */}
      <div className="flex items-start gap-2">
        <p className="flex-1 text-sm leading-relaxed text-text-primary">
          {solution.body}
        </p>
        {canEdit && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded p-1 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-secondary"
              aria-label="Modifier la solution"
              title="Modifier"
            >
              <Pencil className="size-3" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded p-1 text-text-muted transition-colors hover:bg-chainsaw-red/10 hover:text-chainsaw-red"
              aria-label="Supprimer la solution"
              title="Supprimer"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="mt-2 flex items-center gap-2 rounded-md bg-chainsaw-red/5 px-3 py-2">
          <span className="text-xs text-text-secondary">Supprimer cette solution ?</span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-md bg-chainsaw-red px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-chainsaw-red/80 disabled:opacity-50"
          >
            {isDeleting ? '...' : 'Confirmer'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="rounded-md px-2 py-1 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-secondary"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Progress bar + percentage + vote */}
      <div className="mt-2.5 flex items-center gap-2">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-elevated">
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
              isLeader ? 'bg-chainsaw-red' : 'bg-text-muted/40',
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span
          className={cn(
            'min-w-[3ch] text-right text-xs font-bold tabular-nums',
            isLeader ? 'text-chainsaw-red' : 'text-text-muted',
          )}
        >
          {percentage}%
        </span>
        <button
          onClick={() => onVote(solution.id, 'up')}
          disabled={isVoting}
          title="Soutenir cette solution"
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors',
            'text-text-muted hover:bg-chainsaw-red/10 hover:text-chainsaw-red',
          )}
        >
          <ArrowUp className="size-3.5" />
          <span className="tabular-nums">{solution.upvoteCount}</span>
        </button>
      </div>

      {/* Author + date + thread toggle */}
      <div className="mt-2 flex items-center gap-2 text-[11px] text-text-muted">
        <span>{solution.authorDisplay}</span>
        <span aria-hidden="true">&middot;</span>
        <time>
          {formatDistanceToNow(new Date(solution.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </time>
        <span className="flex-1" />
        <button
          onClick={handleToggleThread}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-secondary"
        >
          <MessageCircle className="size-3" aria-hidden="true" />
          Suggérer un ajustement
        </button>
      </div>

      {showThread && (
        <AdjustmentThread
          adjustments={adjustments}
          isLoading={loadingAdjustments}
          onSubmit={createAdjustment}
          isSubmitting={isCreating}
        />
      )}
    </div>
  );
}
