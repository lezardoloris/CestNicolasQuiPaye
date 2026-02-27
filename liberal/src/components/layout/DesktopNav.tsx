'use client';

import Link from 'next/link';
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

const navLinks = [
  { href: '/feed/hot', label: 'Feed' },
  { href: '/submit', label: 'Signaler' },
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
        className="font-display text-chainsaw-red font-bold text-xl"
      >
        LIBERAL
      </Link>

      <nav className="flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors hover:text-chainsaw-red ${
              pathname?.startsWith(link.href)
                ? 'text-chainsaw-red'
                : 'text-text-secondary'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {isAuthenticated ? (
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
                Parametres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/feed/hot' })}
              className="cursor-pointer text-chainsaw-red focus:text-chainsaw-red"
            >
              <LogOut className="mr-2 size-4" />
              Se deconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="outline" size="sm" asChild>
          <Link href="/auth/login">Se connecter</Link>
        </Button>
      )}
    </header>
  );
}
