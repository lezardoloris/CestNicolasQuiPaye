'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, PlusCircle, User, Trophy, BarChart3 } from 'lucide-react';

export default function MobileTabBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const profileHref = isAuthenticated ? '/profile' : '/login';

  const tabs = [
    { href: '/feed/hot', label: 'Feed', icon: Home, primary: false },
    { href: '/stats', label: 'Stats', icon: BarChart3, primary: false },
    { href: '/submit', label: 'Signaler', icon: PlusCircle, primary: true },
    { href: '/leaderboard', label: 'Classement', icon: Trophy, primary: false },
    { href: profileHref, label: 'Profil', icon: User, primary: false },
  ];

  return (
    <nav className="border-border-default bg-surface-primary/80 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname?.startsWith(tab.href);
          const Icon = tab.icon;

          if (tab.primary) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.label}
                className="-mt-3 flex flex-col items-center justify-center gap-1"
              >
                <span className="bg-chainsaw-red shadow-chainsaw-red/30 flex size-12 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95">
                  <Icon className="size-6 text-white" />
                </span>
                <span className="text-chainsaw-red text-[10px] font-semibold">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className={`flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-chainsaw-red' : 'text-text-secondary'
              }`}
            >
              <Icon className="size-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
