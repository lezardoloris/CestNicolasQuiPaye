import { BookOpen } from 'lucide-react';

interface PinnedNoteProps {
  body: string;
}

export function PinnedNote({ body }: PinnedNoteProps) {
  return (
    <div className="rounded-lg border border-info/30 bg-info/5 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-info">
        <BookOpen className="size-3" aria-hidden="true" />
        Note de contexte
      </div>
      <p className="mt-1 text-xs leading-relaxed text-text-secondary line-clamp-2">
        {body}
      </p>
    </div>
  );
}
