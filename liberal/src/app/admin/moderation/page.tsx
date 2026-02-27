import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ModerationQueue } from '@/components/features/admin/ModerationQueue';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Moderation - Administration',
};

export default async function ModerationPage() {
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
          File de moderation
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Examinez et traitez les soumissions en attente de moderation.
        </p>
      </div>

      <ModerationQueue isAdmin={session.user.role === 'admin'} />
    </div>
  );
}
