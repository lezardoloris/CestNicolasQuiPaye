'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-50 flex md:hidden h-12 items-center justify-center border-b border-border-default bg-surface-primary/80 backdrop-blur-sm px-4">
      <Link href="/feed/hot" aria-label="C'est Nicolas qui paie - accueil">
        <Image
          src="/logo.png"
          alt="C'est Nicolas qui paie"
          width={160}
          height={28}
          className="h-5 w-auto"
          priority
        />
      </Link>
    </header>
  );
}
