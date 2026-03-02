'use client';

import { useMemo } from 'react';
import { Lightbulb } from 'lucide-react';
import { useSolutions } from '@/hooks/useSolutions';
import { SolutionForm } from './SolutionForm';
import { SolutionItem } from './SolutionItem';

interface SolutionSectionProps {
  submissionId: string;
}

export function SolutionSection({ submissionId }: SolutionSectionProps) {
  const {
    solutions,
    isLoading,
    createSolution,
    isCreating,
    voteSolution,
    isVoting,
  } = useSolutions(submissionId);

  const totalUpvotes = useMemo(
    () => solutions.reduce((sum, s) => sum + s.upvoteCount, 0),
    [solutions],
  );

  return (
    <section className="mt-8" aria-label="Solutions proposees">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-warning" />
        <h2 className="font-display text-lg font-semibold text-text-primary">
          Solutions proposees
          {solutions.length > 0 && (
            <span className="ml-2 text-sm font-normal text-text-muted">
              ({solutions.length})
            </span>
          )}
        </h2>
      </div>

      {totalUpvotes > 0 && (
        <p className="mb-3 text-xs text-text-muted">
          {totalUpvotes} vote{totalUpvotes > 1 ? 's' : ''} de la communaute
        </p>
      )}

      <SolutionForm onSubmit={createSolution} isSubmitting={isCreating} />

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-surface-secondary"
              />
            ))}
          </div>
        ) : solutions.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-muted">
            Aucune solution proposee. Soyez le premier !
          </p>
        ) : (
          solutions.map((solution, index) => (
            <SolutionItem
              key={solution.id}
              solution={solution}
              totalUpvotes={totalUpvotes}
              rank={index}
              onVote={(solutionId, voteType) =>
                voteSolution({ solutionId, voteType })
              }
              isVoting={isVoting}
            />
          ))
        )}
      </div>
    </section>
  );
}
