import { ACRONYMS } from '@/lib/constants/acronyms';
import { cn } from '@/lib/utils';

interface AbbrProps {
  /** The acronym key (must exist in ACRONYMS dictionary). */
  a: string;
  className?: string;
}

/**
 * Accessible acronym tooltip using native <abbr>.
 * Renders a dotted underline and shows the full meaning on hover/focus.
 */
export function Abbr({ a, className }: AbbrProps) {
  const title = ACRONYMS[a];
  if (!title) return <>{a}</>;

  return (
    <abbr
      title={title}
      className={cn(
        'cursor-help decoration-text-muted/50 decoration-dotted underline underline-offset-2',
        className,
      )}
    >
      {a}
    </abbr>
  );
}
