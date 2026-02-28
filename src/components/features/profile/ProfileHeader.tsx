import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowUpDown, Zap, Flame, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { UserProfile } from '@/types/user';
import { LevelBadge } from '@/components/features/gamification/LevelBadge';

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
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-text-primary">
              {profile.resolvedName}
            </h1>
            <LevelBadge level={profile.level} title={profile.levelTitle} size="md" />
          </div>

          {isOwnProfile && profile.maskedEmail && (
            <p className="text-sm text-text-muted">{profile.maskedEmail}</p>
          )}

          <p className="text-sm text-text-secondary">
            Membre depuis {memberSince}
          </p>

          {/* XP & Streak row */}
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5">
              <Zap className="size-4 text-chainsaw-red" />
              <span className="text-sm font-bold tabular-nums text-text-primary">
                {profile.totalXp.toLocaleString('fr-FR')} XP
              </span>
            </div>

            {/* XP progress bar */}
            <div className="relative h-2 w-24 overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-chainsaw-red to-red-400"
                style={{ width: `${profile.progressPercent}%` }}
              />
            </div>

            {profile.currentStreak > 0 && (
              <div className="flex items-center gap-1">
                <Flame
                  className={`size-4 ${
                    profile.currentStreak >= 30
                      ? 'text-orange-400'
                      : profile.currentStreak >= 7
                        ? 'text-yellow-400'
                        : 'text-text-muted'
                  }`}
                />
                <span className="text-sm font-bold tabular-nums text-text-primary">
                  {profile.currentStreak}j
                </span>
              </div>
            )}
          </div>

          {/* Badges */}
          {profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {profile.badges.map((badge) => (
                <Badge
                  key={badge.slug}
                  variant="outline"
                  className="gap-1 border-border-default text-text-secondary text-[10px]"
                  title={badge.description}
                >
                  <Shield className="size-3" />
                  {badge.name}
                </Badge>
              ))}
            </div>
          )}

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
