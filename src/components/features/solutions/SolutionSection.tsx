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

  const defaultSuggestions = [
    'Réduire le budget de moitié',
    'Supprimer cette dépense',
    'Fusionner avec un service existant',
    'Externaliser au privé via appel d\u2019offres',
  ];

  return (
    <section className="mt-4" aria-label="Solutions proposées">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="size-4 text-warning" />
        <h2 className="text-sm font-semibold text-text-primary">
          Solutions proposées
          {solutions.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-text-muted">
              ({solutions.length})
            </span>
          )}
        </h2>
        {totalUpvotes > 0 && (
          <span className="ml-auto text-[11px] text-text-muted">
            {totalUpvotes} vote{totalUpvotes > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-1.5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-surface-secondary"
              />
            ))}
          </div>
        ) : solutions.length === 0 ? (
          <div>
            <p className="mb-2 text-xs text-text-muted">
              Aucune solution proposée. Choisissez une idée ou proposez la vôtre :
            </p>
            <div className="flex flex-wrap gap-1.5">
              {defaultSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => createSolution(suggestion)}
                  disabled={isCreating}
                  className="rounded-full border border-border-default bg-surface-secondary px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:border-warning/40 hover:bg-warning/10 hover:text-warning"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
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

      <div className="mt-2">
        <SolutionForm onSubmit={createSolution} isSubmitting={isCreating} />
      </div>
    </section>
  );
}
