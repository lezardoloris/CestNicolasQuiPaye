'use client';

import { useCallback, useState } from 'react';
import { Scale } from 'lucide-react';
import { useArguments } from '@/hooks/useArguments';
import { ArgumentItem } from './ArgumentItem';
import { ArgumentForm } from './ArgumentForm';
import { XpRewardBadge } from '@/components/features/gamification/XpRewardBadge';
import { PostActionNudge } from '@/components/features/gamification/PostActionNudge';

interface ArgumentSectionProps {
  submissionId: string;
}

export function ArgumentSection({ submissionId }: ArgumentSectionProps) {
  const {
    pourArgs,
    contreArgs,
    isLoading,
    createArgument,
    isCreating,
    voteArgument,
    isVoting,
  } = useArguments(submissionId);

  const [showNudge, setShowNudge] = useState(false);
  const dismissNudge = useCallback(() => setShowNudge(false), []);

  const handleCreate = async (body: string, type: 'pour' | 'contre') => {
    const result = await createArgument({ body, type });
    setShowNudge(true);
    return result;
  };

  const totalArgs = pourArgs.length + contreArgs.length;

  return (
    <section id="arguments" className="mt-6" aria-label="Arguments pour et contre">
      <div className="mb-3 flex items-center gap-2">
        <Scale className="size-4 text-blue-600 dark:text-blue-400" />
        <h2 className="text-sm font-semibold text-text-primary">
          Arguments
          {totalArgs > 0 && (
            <span className="ml-1.5 text-xs font-normal text-text-muted">
              ({totalArgs})
            </span>
          )}
        </h2>
        <XpRewardBadge actionType="argument_proposed" variant="pill" />
      </div>

      {isLoading ? (
        <div className="space-y-1.5">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-secondary" />
          ))}
        </div>
      ) : totalArgs === 0 ? (
        <p className="mb-3 text-xs text-text-muted">
          Aucun argument soumis. Ajoutez le vôtre pour enrichir le débat !
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Pour column */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
              Pour ({pourArgs.length})
            </h3>
            {pourArgs.length === 0 ? (
              <p className="text-xs text-text-muted">Aucun argument pour.</p>
            ) : (
              pourArgs.map((arg) => (
                <ArgumentItem
                  key={arg.id}
                  argument={arg}
                  onVote={(id, vt) => voteArgument({ argumentId: id, voteType: vt })}
                  isVoting={isVoting}
                />
              ))
            )}
          </div>

          {/* Contre column */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
              Contre ({contreArgs.length})
            </h3>
            {contreArgs.length === 0 ? (
              <p className="text-xs text-text-muted">Aucun argument contre.</p>
            ) : (
              contreArgs.map((arg) => (
                <ArgumentItem
                  key={arg.id}
                  argument={arg}
                  onVote={(id, vt) => voteArgument({ argumentId: id, voteType: vt })}
                  isVoting={isVoting}
                />
              ))
            )}
          </div>
        </div>
      )}

      <div className="mt-3">
        <ArgumentForm onSubmit={handleCreate} isSubmitting={isCreating} />
      </div>
      <PostActionNudge action="argument_proposed" visible={showNudge} onDismiss={dismissNudge} />
    </section>
  );
}
