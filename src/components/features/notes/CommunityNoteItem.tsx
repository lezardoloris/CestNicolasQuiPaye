'use client';

import { BookOpen, ThumbsUp, ThumbsDown, Pin, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/format';

interface CommunityNoteItemProps {
  note: {
    id: string;
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
}

export function CommunityNoteItem({ note, onVote, isVoting }: CommunityNoteItemProps) {
  const totalVotes = note.upvoteCount + note.downvoteCount;
  const usefulPercent = totalVotes > 0 ? Math.round((note.upvoteCount / totalVotes) * 100) : 0;

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-3',
        note.isPinned
          ? 'border-l-warning bg-warning/5 border border-warning/20'
          : 'border-l-info bg-info/5 border border-info/20',
      )}
    >
      <div className="flex items-start gap-2">
        <BookOpen
          className={cn('mt-0.5 size-3.5 shrink-0', note.isPinned ? 'text-warning' : 'text-info')}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('text-[11px] font-semibold', note.isPinned ? 'text-warning' : 'text-info')}>
              Note de contexte
            </span>
            {note.isPinned === 1 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-warning/10 px-1.5 py-0 text-[10px] font-semibold text-warning">
                <Pin className="size-2.5" aria-hidden="true" />
                Epinglee
              </span>
            )}
          </div>

          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {note.body}
          </p>

          {note.sourceUrl && (
            <a
              href={note.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-info hover:underline"
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
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors hover:bg-success/10 hover:text-success disabled:opacity-50"
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
