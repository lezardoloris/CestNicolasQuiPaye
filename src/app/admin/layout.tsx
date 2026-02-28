import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import {
  LayoutDashboard,
  Shield,
  Flag,
  Megaphone,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/moderation', label: 'Moderation', icon: Shield },
  { href: '/admin/flags', label: 'Signalements', icon: Flag },
  { href: '/admin/broadcast', label: 'Diffusion', icon: Megaphone },
  { href: '/admin/features', label: 'Fonctionnalites', icon: Lightbulb },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!['admin', 'moderator'].includes(session.user.role as string)) {
    redirect('/');
  }

  const isAdmin = session.user.role === 'admin';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      {/* Admin header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Administration
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {isAdmin ? 'Administrateur' : 'Moderateur'}
        </p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar navigation */}
        <nav
          className="flex gap-1 overflow-x-auto md:w-56 md:shrink-0 md:flex-col"
          aria-label="Navigation administration"
        >
          {NAV_ITEMS.map((item) => {
            // Moderators can only see moderation and flags
            if (
              !isAdmin &&
              !['moderation', 'flags'].some((s) => item.href.includes(s)) &&
              item.href !== '/admin'
            ) {
              return null;
            }

            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red',
                )}
                aria-label={item.label}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="flex-1" id="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
