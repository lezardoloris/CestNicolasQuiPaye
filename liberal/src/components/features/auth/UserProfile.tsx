'use client';

import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { resolveDisplayName } from '@/lib/utils/user-display';

/**
 * Small user profile display component for use in navs and sidebars.
 * Shows avatar initial and resolved display name.
 */
export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  const name = resolveDisplayName(
    session.user.displayName,
    session.user.anonymousId,
  );

  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-8 border border-border-default">
        <AvatarFallback className="bg-surface-elevated text-text-primary text-xs font-display">
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-text-primary truncate max-w-[120px]">
          {name}
        </span>
        <span className="text-xs text-text-muted">{session.user.email}</span>
      </div>
    </div>
  );
}
