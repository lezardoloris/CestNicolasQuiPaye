import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FlaggedContentQueue } from '@/components/features/admin/FlaggedContentQueue';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Signalements - Administration',
};

export default async function FlagsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!['admin', 'moderator'].includes(session.user.role as string)) {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-text-primary">
          Contenus signalés
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Examinez les contenus signalés par la communauté et prenez les mesures nécessaires.
        </p>
      </div>

      <FlaggedContentQueue isAdmin={session.user.role === 'admin'} />
    </div>
  );
}
