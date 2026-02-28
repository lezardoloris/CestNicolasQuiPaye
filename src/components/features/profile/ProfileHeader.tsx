import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { UserProfile } from '@/types/user';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
}: ProfileHeaderProps) {
  const initials = profile.resolvedName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = format(new Date(profile.memberSince), 'MMMM yyyy', {
    locale: fr,
  });

  return (
    <Card className="border-border-default bg-surface-secondary">
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Avatar className="size-16 border-2 border-border-default">
          {profile.avatarUrl && (
            <AvatarImage src={profile.avatarUrl} alt={profile.resolvedName} />
          )}
          <AvatarFallback className="bg-surface-elevated text-text-primary font-display text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {profile.resolvedName}
          </h1>

          {isOwnProfile && profile.maskedEmail && (
            <p className="text-sm text-text-muted">{profile.maskedEmail}</p>
          )}

          <p className="text-sm text-text-secondary">
            Membre depuis {memberSince}
          </p>

          <div className="flex gap-3 mt-1">
            <Badge
              variant="outline"
              className="gap-1 border-border-default text-text-secondary"
            >
              <FileText className="size-3" />
              {profile.submissionCount} signalement{profile.submissionCount !== 1 ? 's' : ''}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 border-border-default text-text-secondary"
            >
              <ArrowUpDown className="size-3" />
              {profile.voteCount} vote{profile.voteCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
