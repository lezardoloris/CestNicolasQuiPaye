'use client';

import { ACRONYMS } from '@/lib/constants/acronyms';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AbbrProps {
  a: string;
  className?: string;
}

export function Abbr({ a, className }: AbbrProps) {
  const title = ACRONYMS[a];
  if (!title) return <>{a}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <abbr
          title={title}
          className={cn(
            'cursor-help decoration-text-muted/50 decoration-dotted underline underline-offset-2',
            className,
          )}
        >
          {a}
        </abbr>
      </TooltipTrigger>
      <TooltipContent>
        {title}
      </TooltipContent>
    </Tooltip>
  );
}
