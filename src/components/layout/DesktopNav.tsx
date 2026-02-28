'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';
import { resolveDisplayName } from '@/lib/utils/user-display';
import { XpProgressBar } from '@/components/features/gamification/XpProgressBar';
import { StreakBadge } from '@/components/features/gamification/StreakBadge';

const navLinks = [
  { href: '/feed/hot', label: 'Feed' },
  { href: '/submit', label: 'Signaler' },
  { href: '/stats', label: 'Stats' },
  { href: '/leaderboard', label: 'Classement' },
  { href: '/contribuer', label: 'Contribuer' },
];

export default function DesktopNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const userName = isAuthenticated
    ? resolveDisplayName(session.user.displayName, session.user.anonymousId)
    : null;

  return (
    <header className="hidden md:flex sticky top-0 z-50 h-16 items-center justify-between border-b border-border-default bg-surface-primary/80 backdrop-blur-sm px-6">
      <Link
        href="/feed/hot"
        className="flex items-center gap-3"
        aria-label="C'est Nicolas qui paye - accueil"
      >
        <Image
          src="/logo.png"
          alt="C'est Nicolas qui paie"
          width={216}
          height={38}
          className="h-[2.1rem] w-auto"
          priority
        />
      </Link>

      <nav className="flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors hover:text-chainsaw-red ${pathname?.startsWith(link.href)
                ? 'text-chainsaw-red'
                : 'text-text-secondary'
              }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <XpProgressBar />
          <StreakBadge />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-text-secondary hover:text-text-primary"
            >
              <User className="size-4" />
              <span className="max-w-[150px] truncate">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-surface-secondary border-border-default"
          >
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 size-4" />
                Mon profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile/settings" className="cursor-pointer">
                <Settings className="mr-2 size-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/feed/hot' })}
              className="cursor-pointer text-chainsaw-red focus:text-chainsaw-red"
            >
              <LogOut className="mr-2 size-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      ) : (
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">Se connecter</Link>
        </Button>
      )}
    </header>
  );
}
