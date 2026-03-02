'use client';

import { Zap, Target, FileText, BookOpen, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGamificationStore } from '@/stores/gamification-store';
import { XP_TABLE } from '@/lib/gamification/xp-config';

const QUICK_ACTIONS = [
  { label: 'Signaler une dépense', xp: XP_TABLE.submission_published.xp, icon: FileText },
  { label: 'Ajouter une source', xp: XP_TABLE.source_added.xp, icon: Target },
  { label: 'Écrire une note', xp: XP_TABLE.community_note_written.xp, icon: BookOpen },
  { label: 'Proposer une solution', xp: XP_TABLE.solution_proposed.xp, icon: Lightbulb },
] as const;

/** Right-sidebar card showing level progress and quick actions for logged-in users. */
export function LevelUpTeaser() {
  const {
    level,
    levelTitle,
    progressPercent,
    xpInLevel,
    xpForLevel,
    nextLevelXp,
    todayXp,
    dailyGoal,
    loaded,
  } = useGamificationStore();

  if (!loaded) return null;

  const xpRemaining = nextLevelXp ? xpForLevel - xpInLevel : 0;
  const isUrgent = progressPercent >= 60;
  const nextTitle = getNextLevelTitle(level);
  const dailyComplete = todayXp >= dailyGoal;

  return (
    <div className="rounded-2xl border border-border-default bg-surface-primary p-4">
      {/* Level progress header */}
      <div className="flex items-center gap-2">
        <Zap className={cn('size-4', isUrgent ? 'text-chainsaw-red' : 'text-text-muted')} />
        <span className="text-sm font-semibold text-text-primary">
          Nv.{level} {levelTitle}
        </span>
      </div>

      {/* Progress bar */}
      {nextLevelXp && (
        <>
          <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                isUrgent ? 'bg-chainsaw-red' : 'bg-chainsaw-red/60',
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-text-muted">
            {isUrgent ? (
              <>
                Plus que <span className="font-bold text-chainsaw-red">{xpRemaining} XP</span> pour{' '}
                <span className="font-semibold text-text-primary">{nextTitle}</span> !
              </>
            ) : (
              <>
                {xpInLevel}/{xpForLevel} XP vers {nextTitle}
              </>
            )}
          </p>

          {/* Level 2 unlock preview */}
          {level === 1 && (
            <p className="mt-1 text-[10px] text-info">
              Niveau 2 débloque la validation communautaire (+15 XP/action)
            </p>
          )}
        </>
      )}

      {/* Daily goal */}
      <div className="mt-3 flex items-center gap-2">
        <Target className={cn('size-3.5', dailyComplete ? 'text-success' : 'text-text-muted')} />
        <div className="flex-1">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-all',
                dailyComplete ? 'bg-success' : 'bg-chainsaw-red/50',
              )}
              style={{ width: `${Math.min(100, (todayXp / dailyGoal) * 100)}%` }}
            />
          </div>
        </div>
        <span className="text-[11px] tabular-nums text-text-muted">
          {todayXp}/{dailyGoal}
        </span>
      </div>

      {/* Quick actions */}
      <div className="mt-3 border-t border-border-default pt-3">
        <p className="mb-2 text-[11px] font-medium text-text-secondary">Gagnez de l&apos;XP</p>
        <div className="space-y-1.5">
          {QUICK_ACTIONS.map(({ label, xp, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 text-[11px]">
              <Icon className="size-3 text-text-muted" />
              <span className="flex-1 text-text-secondary">{label}</span>
              <span className="font-bold text-chainsaw-red">+{xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getNextLevelTitle(currentLevel: number): string {
  const titles: Record<number, string> = {
    1: 'Citoyen Vigilant',
    2: 'Sentinelle',
    3: 'Enquêteur',
    4: 'Investigateur',
    5: 'Éclaireur',
    6: "Lanceur d'Alerte",
    7: 'Gardien',
    8: 'Contrôleur',
    9: 'Inspecteur',
  };
  return titles[currentLevel] ?? 'le prochain niveau';
}
