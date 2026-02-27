import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserProfile } from '@/lib/api/users';
import ProfileView from '@/components/features/profile/ProfileView';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mon profil',
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const profile = await getUserProfile(session.user.id, true);

  if (!profile) {
    redirect('/auth/login');
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="sr-only">Mon profil</h1>
        <div />
        <Button asChild variant="ghost" size="sm" className="text-text-secondary">
          <Link href="/profile/settings">
            <Settings className="mr-2 size-4" />
            Parametres
          </Link>
        </Button>
      </div>

      <ProfileView profile={profile} isOwnProfile={true} />
    </div>
  );
}
