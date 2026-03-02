'use client';

import { BarChart3, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCriteriaVote } from '@/hooks/useCriteriaVote';

type CriterionKey = 'proportional' | 'legitimate' | 'alternative';

const CRITERIA: { key: CriterionKey; label: string }[] = [
  { key: 'proportional', label: 'Le montant est-il proportionné ?' },
  { key: 'legitimate', label: "L'objectif est-il légitime ?" },
  { key: 'alternative', label: 'Existe-t-il une alternative moins coûteuse ?' },
];

interface CriteriaVoteSectionProps {
  submissionId: string;
}

export function CriteriaVoteSection({ submissionId }: CriteriaVoteSectionProps) {
  const { criteria, vote, isLoading, totalVoters } = useCriteriaVote(submissionId);

  return (
    <section className="mt-8" aria-label="Évaluation détaillée">
      <div className="rounded-xl border border-border-default bg-surface-primary p-5">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="size-5 text-text-muted" aria-hidden="true" />
          <h2 className="text-lg font-bold text-text-primary">Évaluation détaillée</h2>
          {totalVoters > 0 && (
            <span className="text-xs text-text-muted">
              {totalVoters} votant{totalVoters > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="space-y-4">
          {CRITERIA.map(({ key, label }) => {
            const data = criteria[key];
            const total = data.yes + data.no;
            const yesPercent = total > 0 ? Math.round((data.yes / total) * 100) : 0;
            const noPercent = total > 0 ? 100 - yesPercent : 0;

            return (
              <CriterionRow
                key={key}
                label={label}
                yesCount={data.yes}
                noCount={data.no}
                yesPercent={yesPercent}
                noPercent={noPercent}
                userVote={data.userVote}
                disabled={isLoading}
                onVoteYes={() => vote(key, true)}
                onVoteNo={() => vote(key, false)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface CriterionRowProps {
  label: string;
  yesCount: number;
  noCount: number;
  yesPercent: number;
  noPercent: number;
  userVote: boolean | null;
  disabled: boolean;
  onVoteYes: () => void;
  onVoteNo: () => void;
}

function CriterionRow({
  label,
  yesCount,
  noCount,
  yesPercent,
  noPercent,
  userVote,
  disabled,
  onVoteYes,
  onVoteNo,
}: CriterionRowProps) {
  const total = yesCount + noCount;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-primary">{label}</p>

      <div className="flex items-center gap-2">
        {/* Yes button */}
        <button
          onClick={onVoteYes}
          disabled={disabled}
          aria-pressed={userVote === true}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
            userVote === true
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-emerald-600/30 bg-emerald-600/5 text-emerald-700 hover:bg-emerald-600/10',
          )}
        >
          <ThumbsUp className="size-3.5" aria-hidden="true" />
          Oui
        </button>

        {/* Progress bar */}
        <div className="flex h-6 flex-1 overflow-hidden rounded-full bg-surface-secondary">
          {total > 0 ? (
            <>
              {yesPercent > 0 && (
                <div
                  className="flex items-center justify-center bg-emerald-600/20 text-[11px] font-semibold text-emerald-700 transition-all duration-300"
                  style={{ width: `${yesPercent}%` }}
                >
                  {yesPercent >= 15 && `${yesPercent}%`}
                </div>
              )}
              {noPercent > 0 && (
                <div
                  className="flex items-center justify-center bg-chainsaw-red/15 text-[11px] font-semibold text-chainsaw-red transition-all duration-300"
                  style={{ width: `${noPercent}%` }}
                >
                  {noPercent >= 15 && `${noPercent}%`}
                </div>
              )}
            </>
          ) : (
            <div className="flex w-full items-center justify-center text-[11px] text-text-muted">
              Aucun vote
            </div>
          )}
        </div>

        {/* No button */}
        <button
          onClick={onVoteNo}
          disabled={disabled}
          aria-pressed={userVote === false}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
            userVote === false
              ? 'border-chainsaw-red bg-chainsaw-red text-white'
              : 'border-chainsaw-red/30 bg-chainsaw-red/5 text-chainsaw-red hover:bg-chainsaw-red/10',
          )}
        >
          <ThumbsDown className="size-3.5" aria-hidden="true" />
          Non
        </button>
      </div>
    </div>
  );
}
