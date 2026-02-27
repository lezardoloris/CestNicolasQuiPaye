import ProfileHeader from '@/components/features/profile/ProfileHeader';
import ProfileTabs from '@/components/features/profile/ProfileTabs';
import type { UserProfile } from '@/types/user';

interface ProfileViewProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

export default function ProfileView({
  profile,
  isOwnProfile,
}: ProfileViewProps) {
  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
      <ProfileTabs userId={profile.id} isOwnProfile={isOwnProfile} />
    </div>
  );
}
