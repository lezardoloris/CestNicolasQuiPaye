'use client';

import { SubmissionPanelHeader } from '@/components/features/submissions/SubmissionPanelHeader';
import { MaturitySection } from '@/components/features/maturity/MaturitySection';
import { AiContextCard } from '@/components/features/ai-context/AiContextCard';
import { ShareButton } from '@/components/features/sharing/ShareButton';
import { FlagButton } from '@/components/features/submissions/FlagButton';
import { CompletenessBar } from '@/components/features/submissions/CompletenessBar';
import { FourPositionVoting } from '@/components/features/voting/FourPositionVoting';
import { VoteProminentButtons } from '@/components/features/voting/VoteProminentButtons';
import { CriteriaVoteSection } from '@/components/features/voting/CriteriaVoteSection';
import { ArgumentSection } from '@/components/features/arguments/ArgumentSection';
import { SourceList } from '@/components/features/sources/SourceList';
import { CommunityNoteSection } from '@/components/features/notes/CommunityNoteSection';
import { ConsequenceCard } from '@/components/features/consequences/ConsequenceCard';
import { ConsequenceLoader } from '@/components/features/consequences/ConsequenceLoader';
import { SolutionSection } from '@/components/features/solutions/SolutionSection';
import { CommentSection } from '@/components/features/comments/CommentSection';
import type { SubmissionCardData } from '@/types/submission';

interface SubmissionFullContentProps {
  submission: SubmissionCardData;
}

export function SubmissionFullContent({ submission }: SubmissionFullContentProps) {
  return (
    <div className="space-y-6">
      {/* Header: banner, title, badges, cost, description, source, actions */}
      <SubmissionPanelHeader submission={submission} />

      {/* Maturity progress */}
      <MaturitySection
        submissionId={submission.id}
        serverLevel={submission.maturityLevel ?? 1}
      />

      {/* AI Context (budget scaffolding) */}
      <AiContextCard submissionId={submission.id} />

      {/* Share and Flag actions */}
      <div className="flex items-center gap-3">
        <ShareButton
          submissionId={submission.id}
          title={submission.title}
          costPerTaxpayer={
            submission.costPerTaxpayer ? parseFloat(submission.costPerTaxpayer) : undefined
          }
        />
        <FlagButton submissionId={submission.id} />
      </div>

      {/* Completeness indicator */}
      <CompletenessBar
        sourceCount={submission.sourceCount ?? 0}
        noteCount={submission.noteCount ?? 0}
        solutionCount={submission.solutionCount ?? 0}
        voteCount={submission.upvoteCount + submission.downvoteCount}
      />

      {/* 4-Position Voting */}
      <section aria-label="Votre position">
        <div className="rounded-xl border border-border-default bg-surface-primary p-5">
          <h2 className="mb-3 text-lg font-bold text-text-primary">Quelle est votre position ?</h2>
          <FourPositionVoting submissionId={submission.id} />
        </div>
      </section>

      {/* Legacy prominent voting */}
      <VoteProminentButtons
        submissionId={submission.id}
        serverCounts={{ up: submission.upvoteCount, down: submission.downvoteCount }}
      />

      {/* Criteria Vote (multi-axis evaluation) */}
      <CriteriaVoteSection submissionId={submission.id} />

      {/* Arguments Pour / Contre */}
      <ArgumentSection submissionId={submission.id} />

      {/* Sources & Verification */}
      <div className="mt-2">
        <SourceList submissionId={submission.id} />
      </div>

      {/* Community Notes */}
      <div className="mt-2">
        <CommunityNoteSection submissionId={submission.id} />
      </div>

      {/* Cost to Nicolas section */}
      {submission.costToNicolasResults ? (
        <ConsequenceCard jsonData={submission.costToNicolasResults} />
      ) : (
        <ConsequenceLoader submissionId={submission.id} amount={submission.amount} />
      )}

      {/* Solutions section */}
      <SolutionSection submissionId={submission.id} />

      {/* Comments section */}
      <section aria-label="Commentaires">
        <CommentSection
          submissionId={submission.id}
          commentCount={submission.commentCount}
        />
      </section>
    </div>
  );
}
