'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator, Heart, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchPrefix: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/feed/hot', label: 'Feed', icon: Home, matchPrefix: '/feed' },
  { href: '/chiffres', label: 'Chiffres', icon: Calculator, matchPrefix: '/chiffres' },
  { href: '/contribuer', label: 'Contribuer', icon: Heart, matchPrefix: '/contribuer' },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[220px] shrink-0 lg:block">
      <nav className="sticky top-20 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.matchPrefix);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-full px-4 py-2.5 text-[15px] transition-colors',
                isActive
                  ? 'font-bold text-text-primary'
                  : 'font-medium text-text-secondary hover:bg-surface-secondary/50 hover:text-text-primary',
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}

        {/* Primary CTA — always visible, like Twitter's "Post" button */}
        <Link
          href="/submit"
          className={cn(
            'mt-4 flex w-full items-center justify-center gap-2 rounded-full',
            'bg-chainsaw-red px-4 py-2.5 text-[15px] font-bold text-white',
            'hover:bg-chainsaw-red-hover transition-colors',
          )}
        >
          <PlusCircle className="size-5" />
          Signaler
        </Link>
      </nav>
    </aside>
  );
}
