'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, PlusCircle, User, Heart } from 'lucide-react';

export default function MobileTabBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const profileHref = isAuthenticated ? '/profile' : '/login';

  const tabs = [
    { href: '/feed/hot', label: 'Feed', icon: Home },
    { href: '/submit', label: 'Signaler', icon: PlusCircle },
    { href: '/contribuer', label: 'Contribuer', icon: Heart },
    { href: profileHref, label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border-default bg-surface-primary/80 backdrop-blur-sm">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname?.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] gap-1 text-xs font-medium transition-colors ${
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
