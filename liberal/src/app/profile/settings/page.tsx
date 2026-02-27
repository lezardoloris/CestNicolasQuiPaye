import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import DisplayNameForm from '@/components/features/auth/DisplayNameForm';
import DeleteAccountSection from '@/components/features/profile/DeleteAccountSection';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Parametres du profil',
};

export default async function ProfileSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 font-display text-2xl font-bold text-text-primary">
        Parametres du profil
      </h1>

      <DisplayNameForm
        currentDisplayName={user.displayName}
        anonymousId={user.anonymousId}
      />

      <Separator className="my-12 bg-border-default" />

      <DeleteAccountSection />
    </div>
  );
}
