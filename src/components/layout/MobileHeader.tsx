'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { XpProgressBarCompact } from '@/components/features/gamification/XpProgressBar';

export default function MobileHeader() {
  return (
    <header className="border-border-default bg-surface-primary/80 sticky top-0 z-50 flex h-12 items-center justify-between border-b px-4 backdrop-blur-sm md:hidden">
      <Link href="/feed/hot" aria-label="C'est Nicolas qui paie - accueil">
        <Image
          src="/logo.png"
          alt="C'est Nicolas qui paie"
          width={192}
          height={34}
          className="h-6 w-auto"
          priority
        />
      </Link>
      <div className="flex items-center gap-2">
        <XpProgressBarCompact />
        <Link
          href="/submit"
          aria-label="Signaler une dépense"
          className={cn(
            'bg-chainsaw-red inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
            'text-xs font-semibold text-white',
            'hover:bg-chainsaw-red-hover transition-all duration-150 active:scale-95',
          )}
        >
          <PlusCircle className="size-3.5" aria-hidden="true" />
          Signaler
        </Link>
      </div>
    </header>
  );
}
