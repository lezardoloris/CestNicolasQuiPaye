'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Calculator, SlidersHorizontal, Heart, PlusCircle, Github, Zap, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveDisplayName } from '@/lib/utils/user-display';
import { XpProgressBar } from '@/components/features/gamification/XpProgressBar';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchPrefix: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/feed/hot', label: 'Feed', icon: Home, matchPrefix: '/feed' },
  { href: '/chiffres', label: 'Chiffres', icon: Calculator, matchPrefix: '/chiffres' },
  { href: '/simulateur', label: 'Simulateur', icon: SlidersHorizontal, matchPrefix: '/simulateur' },
  { href: '/contribuer', label: 'Contribuer', icon: Heart, matchPrefix: '/contribuer' },
];

interface DesktopSidebarProps {
  children?: ReactNode;
}

export function DesktopSidebar({ children }: DesktopSidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  return (
    <aside className="hidden w-[220px] shrink-0 lg:block">
      <div className="sticky top-4 space-y-4">
        {/* Logo — like X/Twitter top-left */}
        <Link
          href="/feed/hot"
          className="flex flex-col items-start gap-0 px-2 pb-2"
          aria-label="C'est Nicolas qui paie - accueil"
        >
          <Image
            src="/logo.png"
            alt="C'est Nicolas qui paie"
            width={180}
            height={32}
            className="h-7 w-auto invert dark:invert-0"
            priority
          />
        </Link>

        <nav className="space-y-1">
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
              'bg-chainsaw-red px-4 py-2.5 text-sm font-bold text-white',
              'hover:bg-chainsaw-red-hover transition-colors',
            )}
          >
            <PlusCircle className="size-5" />
            Signaler une dépense
          </Link>

          {/* GitHub contribution CTA */}
          <a
            href="https://github.com/lezardoloris/CestNicolasQuiPaye"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'mt-2 flex w-full items-center justify-center gap-1.5 rounded-full',
              'border border-border-default bg-surface-secondary px-4 py-2 text-xs font-medium',
              'text-text-secondary transition-colors',
              'hover:bg-surface-elevated hover:text-text-primary',
            )}
          >
            <Github className="size-3.5" />
            Contribuer sur GitHub
            <span className="inline-flex items-center gap-0.5 rounded-full bg-chainsaw-red/10 px-1.5 py-0.5 text-[10px] font-bold text-chainsaw-red">
              <Zap className="size-2.5" />
              +50 XP
            </span>
          </a>
        </nav>

        {children}

        {/* Auth section — like X/Twitter bottom of sidebar */}
        {isAuthenticated ? (
          <div className="border-border-default border-t pt-3">
            <XpProgressBar />
            <Link
              href="/profile"
              className="mt-2 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-secondary/50 hover:text-text-primary"
            >
              <div className="bg-drapeau-rouge/10 text-drapeau-rouge flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {resolveDisplayName(session.user.displayName, session.user.anonymousId).charAt(0).toUpperCase()}
              </div>
              <span className="min-w-0 truncate">
                {resolveDisplayName(session.user.displayName, session.user.anonymousId)}
              </span>
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-full',
              'border border-border-default px-4 py-2 text-sm font-semibold',
              'text-text-primary transition-colors',
              'hover:bg-surface-secondary/50',
            )}
          >
            <LogIn className="size-4" />
            Se connecter
          </Link>
        )}

        <div className="flex justify-center pt-2">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
