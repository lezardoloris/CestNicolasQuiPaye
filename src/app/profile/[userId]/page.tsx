import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserProfile } from '@/lib/api/users';
import { resolveDisplayName } from '@/lib/utils/user-display';
import ProfileView from '@/components/features/profile/ProfileView';

interface PublicProfilePageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { userId } = await params;
  const profile = await getUserProfile(userId, false);

  return {
    title: profile
      ? resolveDisplayName(profile.displayName, profile.anonymousId)
      : 'Profil introuvable',
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { userId } = await params;
  const session = await auth();

  // If viewing own profile, redirect to /profile
  if (session?.user?.id === userId) {
    redirect('/profile');
  }

  const profile = await getUserProfile(userId, false);

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ProfileView profile={profile} isOwnProfile={false} />
    </div>
  );
}
