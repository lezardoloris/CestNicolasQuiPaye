'use client';

import { BookOpen } from 'lucide-react';
import { useCommunityNotes } from '@/hooks/useCommunityNotes';
import { CommunityNoteItem } from './CommunityNoteItem';
import { CommunityNoteForm } from './CommunityNoteForm';
import { Skeleton } from '@/components/ui/skeleton';

interface CommunityNoteSectionProps {
  submissionId: string;
}

export function CommunityNoteSection({ submissionId }: CommunityNoteSectionProps) {
  const { notes, isLoading, createNote, isCreating, voteNote, isVoting } =
    useCommunityNotes(submissionId);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="size-5 text-info" aria-hidden="true" />
        <h2 className="text-base font-semibold text-text-primary">
          Notes de contexte
        </h2>
        {notes.length > 0 && (
          <span className="rounded-full bg-info/10 px-2 py-0.5 text-xs font-medium text-info">
            {notes.length}
          </span>
        )}
      </div>

      <p className="text-xs text-text-muted">
        Apportez du contexte factuel et sourcé pour aider la communauté à comprendre cette dépense.
      </p>

      <CommunityNoteForm onSubmit={createNote} isSubmitting={isCreating} />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      ) : notes.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-muted">
          Aucune note de contexte. Soyez le premier à apporter du contexte !
        </p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <CommunityNoteItem
              key={note.id}
              note={note}
              onVote={(isUseful) => voteNote({ noteId: note.id, isUseful })}
              isVoting={isVoting}
            />
          ))}
        </div>
      )}
    </section>
  );
}
