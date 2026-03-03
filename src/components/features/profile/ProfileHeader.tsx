import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowUpDown, Flame, Shield, Target, BookOpen, Lightbulb, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { UserProfile } from '@/types/user';
import { ChainsawIcon } from '@/components/ui/icons/ChainsawIcon';

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

        <div className="flex flex-1 flex-col items-center gap-1.5 sm:items-start">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {profile.resolvedName}
          </h1>

          {/* Subtle XP line with chainsaw icon */}
          <div className="flex items-center gap-2 text-sm">
            <ChainsawIcon className="size-4 text-chainsaw-red" />
            <span className="font-semibold tabular-nums text-text-primary">
              {profile.totalXp.toLocaleString('fr-FR')}
            </span>
            <span className="text-text-muted">pts</span>
            <span className="text-text-muted/40">·</span>
            <span className="text-text-secondary">
              Nv.{profile.level} {profile.levelTitle}
            </span>
            {profile.currentStreak > 0 && (
              <>
                <span className="text-text-muted/40">·</span>
                <Flame
                  className={`size-3.5 ${
                    profile.currentStreak >= 7
                      ? 'text-chainsaw-red'
                      : 'text-text-muted'
                  }`}
                />
                <span className="tabular-nums text-text-secondary">
                  {profile.currentStreak}j
                </span>
              </>
            )}
          </div>

          {/* Progress bar — thin, subtle */}
          <div className="relative h-1 w-40 overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-chainsaw-red/80"
              style={{ width: `${profile.progressPercent}%` }}
            />
          </div>

          {isOwnProfile && profile.maskedEmail && (
            <p className="text-xs text-text-muted">{profile.maskedEmail}</p>
          )}

          <p className="text-xs text-text-muted">
            Membre depuis {memberSince}
          </p>

          {/* Badges */}
          {profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-0.5">
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

          <div className="flex flex-wrap gap-2 mt-0.5">
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
            <Badge
              variant="outline"
              className="gap-1 border-border-default text-text-secondary"
            >
              <BookOpen className="size-3" />
              {profile.noteCount} note{profile.noteCount !== 1 ? 's' : ''}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 border-border-default text-text-secondary"
            >
              <Lightbulb className="size-3" />
              {profile.solutionCount} solution{profile.solutionCount !== 1 ? 's' : ''}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 border-border-default text-text-secondary"
            >
              <MessageSquare className="size-3" />
              {profile.commentCount} commentaire{profile.commentCount !== 1 ? 's' : ''}
            </Badge>
            {profile.sourceCount > 0 && (
              <Badge
                variant="outline"
                className="gap-1 border-border-default text-text-secondary"
              >
                <Target className="size-3" />
                {profile.sourceCount} source{profile.sourceCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
