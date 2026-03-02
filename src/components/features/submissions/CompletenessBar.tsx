import { FileText, BookOpen, Lightbulb, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompletenessBarProps {
  sourceCount: number;
  noteCount: number;
  solutionCount: number;
  voteCount: number;
}

interface Criterion {
  label: string;
  met: boolean;
  xp: number;
  anchor: string;
  icon: typeof FileText;
}

/** Server component showing submission completeness and missing contributions. */
export function CompletenessBar({ sourceCount, noteCount, solutionCount, voteCount }: CompletenessBarProps) {
  const criteria: Criterion[] = [
    { label: 'Source', met: sourceCount >= 1, xp: 20, anchor: '#sources', icon: FileText },
    { label: 'Note', met: noteCount >= 1, xp: 15, anchor: '#community-notes', icon: BookOpen },
    { label: 'Solution', met: solutionCount >= 1, xp: 10, anchor: '#solutions', icon: Lightbulb },
    { label: '5+ votes', met: voteCount >= 5, xp: 2, anchor: '#main-content', icon: ArrowUpDown },
  ];

  const metCount = criteria.filter((c) => c.met).length;
  const percent = Math.round((metCount / criteria.length) * 100);
  const missing = criteria.filter((c) => !c.met);

  if (metCount === criteria.length) return null;

  return (
    <div className="rounded-lg border border-border-default bg-surface-secondary p-3">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-text-primary">
            Fiche complétée à {percent}%
          </p>
          <div className="relative mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-chainsaw-red/70 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {missing.map(({ label, xp, anchor, icon: Icon }) => (
            <a
              key={label}
              href={anchor}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border border-border-default',
                'bg-surface-primary px-2 py-0.5 text-[10px] font-medium text-text-secondary',
                'transition-colors hover:border-chainsaw-red/30 hover:text-chainsaw-red',
              )}
            >
              <Icon className="size-2.5" />
              {label}
              <span className="font-bold text-chainsaw-red">+{xp}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
