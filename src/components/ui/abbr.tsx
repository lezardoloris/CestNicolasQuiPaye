import { ACRONYMS } from '@/lib/constants/acronyms';
import { cn } from '@/lib/utils';

interface AbbrProps {
  a: string;
  className?: string;
}

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
