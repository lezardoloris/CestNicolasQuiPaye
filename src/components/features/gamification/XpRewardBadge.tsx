'use client';

import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { XP_TABLE } from '@/lib/gamification/xp-config';

type XpActionKey = keyof typeof XP_TABLE;

interface XpRewardBadgeProps {
  actionType: XpActionKey;
  variant?: 'inline' | 'pill';
  className?: string;
}

/** Displays a "+N XP" badge next to contribution CTAs. */
export function XpRewardBadge({ actionType, variant = 'pill', className }: XpRewardBadgeProps) {
  const config = XP_TABLE[actionType];
  if (!config || config.xp <= 0) return null;

  if (variant === 'inline') {
    return (
      <span className={cn('text-[10px] font-bold text-chainsaw-red', className)}>
        +{config.xp} XP
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full bg-chainsaw-red/10 px-1.5 py-0.5 text-[10px] font-bold text-chainsaw-red',
        className,
      )}
    >
      <Zap className="size-2.5" />
      +{config.xp} XP
    </span>
  );
}
