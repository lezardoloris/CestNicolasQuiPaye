import { Lightbulb } from 'lucide-react';

interface TopSolutionPreviewProps {
  body: string;
}

export function TopSolutionPreview({ body }: TopSolutionPreviewProps) {
  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-warning">
        <Lightbulb className="size-3" aria-hidden="true" />
        Meilleure solution
      </div>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
        {body}
      </p>
    </div>
  );
}
