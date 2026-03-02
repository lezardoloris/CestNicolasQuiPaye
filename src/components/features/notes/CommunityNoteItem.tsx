'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { BookOpen, ThumbsUp, ThumbsDown, Pin, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/format';
import { CommunityNoteForm } from '@/components/features/notes/CommunityNoteForm';

interface CommunityNoteItemProps {
  note: {
    id: string;
    authorId: string | null;
    authorDisplay: string;
    body: string;
    sourceUrl: string | null;
    upvoteCount: number;
    downvoteCount: number;
    isPinned: number;
    createdAt: string;
  };
  onVote: (isUseful: boolean) => void;
  isVoting: boolean;
  onUpdate?: (noteId: string, data: { body: string; sourceUrl?: string }) => Promise<unknown>;
  onDelete?: (noteId: string) => Promise<unknown>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function CommunityNoteItem({
  note,
  onVote,
  isVoting,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: CommunityNoteItemProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const totalVotes = note.upvoteCount + note.downvoteCount;
  const usefulPercent = totalVotes > 0 ? Math.round((note.upvoteCount / totalVotes) * 100) : 0;

  const isAuthor = !!session?.user?.id && note.authorId === session.user.id;
  const isAdminOrMod =
    session?.user?.role === 'admin' || session?.user?.role === 'moderator';
  const canEdit = isAuthor || isAdminOrMod;

  const handleUpdate = async (data: { body: string; sourceUrl?: string }) => {
    if (!onUpdate) return;
    await onUpdate(note.id, data);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    await onDelete(note.id);
    setShowDeleteConfirm(false);
  };

  if (isEditing) {
    return (
      <div
        className={cn(
          'rounded-lg border-l-4 p-3',
          'border-l-border-default bg-surface-secondary border border-border-default',
        )}
      >
        <CommunityNoteForm
          onSubmit={handleUpdate}
          isSubmitting={!!isUpdating}
          initialData={{ body: note.body, sourceUrl: note.sourceUrl ?? '' }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-3',
        note.isPinned
          ? 'border-l-chainsaw-red bg-chainsaw-red/5 border border-chainsaw-red/20'
          : 'border-l-border-default bg-surface-secondary border border-border-default',
      )}
    >
      <div className="flex items-start gap-2">
        <BookOpen
          className={cn('mt-0.5 size-3.5 shrink-0', note.isPinned ? 'text-chainsaw-red' : 'text-text-muted')}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('text-[11px] font-semibold', note.isPinned ? 'text-chainsaw-red' : 'text-text-secondary')}>
              Note de contexte
            </span>
            {note.isPinned === 1 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-chainsaw-red/10 px-1.5 py-0 text-[10px] font-semibold text-chainsaw-red">
                <Pin className="size-2.5" aria-hidden="true" />
                Epinglee
              </span>
            )}
            {canEdit && (
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded p-1 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-secondary"
                  aria-label="Modifier la note"
                  title="Modifier"
                >
                  <Pencil className="size-3" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded p-1 text-text-muted transition-colors hover:bg-chainsaw-red/10 hover:text-chainsaw-red"
                  aria-label="Supprimer la note"
                  title="Supprimer"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            )}
          </div>

          {showDeleteConfirm && (
            <div className="mt-2 flex items-center gap-2 rounded-md bg-chainsaw-red/5 px-3 py-2">
              <span className="text-xs text-text-secondary">Supprimer cette note ?</span>
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

          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {note.body}
          </p>

          {note.sourceUrl && (
            <a
              href={note.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-text-secondary hover:underline"
            >
              Source
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          )}

          <div className="mt-2 flex items-center gap-3 text-[11px] text-text-muted">
            <span>{note.authorDisplay}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{formatRelativeTime(note.createdAt)}</span>

            <div className="flex-1" />

            <button
              onClick={() => onVote(true)}
              disabled={isVoting}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors hover:bg-chainsaw-red/10 hover:text-chainsaw-red disabled:opacity-50"
              aria-label="Utile"
            >
              <ThumbsUp className="size-3" aria-hidden="true" />
              <span>{note.upvoteCount}</span>
            </button>
            <button
              onClick={() => onVote(false)}
              disabled={isVoting}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors hover:bg-chainsaw-red/10 hover:text-chainsaw-red disabled:opacity-50"
              aria-label="Pas utile"
            >
              <ThumbsDown className="size-3" aria-hidden="true" />
              <span>{note.downvoteCount}</span>
            </button>
            {totalVotes > 0 && (
              <span>{usefulPercent}% utile</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
