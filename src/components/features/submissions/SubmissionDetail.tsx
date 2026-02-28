'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Pencil, MessageSquarePlus, BookOpen, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VoteButton } from '@/components/features/voting/VoteButton';
import { EditSubmissionDialog } from '@/components/features/submissions/EditSubmissionDialog';
import { SuggestCorrectionDialog } from '@/components/features/submissions/SuggestCorrectionDialog';
import { getCategoryDef } from '@/lib/constants/categories';
import {
  formatEUR,
  formatRelativeTime,
  extractDomain,
} from '@/lib/utils/format';

interface SubmissionDetailProps {
  submission: {
    id: string;
    title: string;
    description: string;
    sourceUrl: string;
    amount: string;
    costPerTaxpayer: string | null;
    upvoteCount: number;
    downvoteCount: number;
    commentCount: number;
    status: string;
    authorDisplay: string;
    authorId: string | null;
    createdAt: Date | string;
    userVote: 'up' | 'down' | null;
    ministryTag: string | null;
  };
  currentUserId?: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  published: { label: 'Publié', variant: 'default' },
  draft: { label: 'Brouillon', variant: 'secondary' },
  hidden: { label: 'Masqué', variant: 'outline' },
  deleted: { label: 'Supprimé', variant: 'destructive' },
};

export function SubmissionDetail({
  submission,
  currentUserId,
}: SubmissionDetailProps) {
  const isAuthor = !!(currentUserId && submission.authorId === currentUserId);
  const statusInfo = STATUS_LABELS[submission.status];
  const category = getCategoryDef(submission.ministryTag);

  const [editOpen, setEditOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/feed/hot"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour au fil
      </Link>

      {/* ── Educational source banner ── */}
      <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 px-4 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
        <div className="min-w-0 text-xs text-text-secondary">
          <span className="font-semibold text-success">Dépense sourcée</span>
          {' '}— Toutes les fiches de cette plateforme sont documentées par des sources officielles
          (rapports parlementaires, Cour des comptes, presse vérifiée).{' '}
          <button
            onClick={() => setSuggestOpen(true)}
            className="underline underline-offset-2 hover:text-text-primary"
          >
            Une inexactitude ?
          </button>
        </div>
      </div>

      {/* Title and vote */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
            {submission.title}
          </h1>
          <div className="shrink-0">
            <VoteButton
              submissionId={submission.id}
              serverCounts={{
                up: submission.upvoteCount,
                down: submission.downvoteCount,
              }}
              serverVote={submission.userVote}
            />
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          {isAuthor && statusInfo && (
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          )}
          {category && (
            <Badge variant="outline" className={`border-border-default/50 text-xs ${category.color}`}>
              <category.icon className="mr-1 size-3" aria-hidden="true" />
              {category.label}
            </Badge>
          )}
          <Badge
            variant="outline"
            className="border-success/40 bg-success/5 text-success text-xs font-medium"
          >
            <ShieldCheck className="mr-1 size-3" aria-hidden="true" />
            Sourcé
          </Badge>
          <Badge variant="outline" className="border-info/40 bg-info/5 text-info text-xs font-medium">
            <BookOpen className="mr-1 size-3" aria-hidden="true" />
            Éducatif
          </Badge>
        </div>
      </div>

      {/* Author and date */}
      <p className="text-sm text-text-secondary">
        Soumis par{' '}
        <span className="font-medium text-text-primary">{submission.authorDisplay}</span>{' '}
        {formatRelativeTime(submission.createdAt)}
      </p>

      {/* Cost block */}
      <div className="rounded-lg border border-chainsaw-red/20 bg-surface-elevated p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Coût estimé de la dépense
        </p>
        <p className="mt-1 font-display text-3xl font-bold text-chainsaw-red">
          {formatEUR(submission.amount)}
        </p>
        {submission.costPerTaxpayer && (
          <p className="mt-1 text-sm text-text-secondary">
            soit environ{' '}
            <span className="font-semibold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(parseFloat(submission.costPerTaxpayer))}
            </span>{' '}
            par citoyen
          </p>
        )}
        <p className="mt-2 text-xs text-text-muted">
          💡 Montant incorrect ?{' '}
          <button
            onClick={() => setSuggestOpen(true)}
            className="text-text-secondary underline underline-offset-2 hover:text-text-primary"
          >
            Suggérer une correction
          </button>
        </p>
      </div>

      {/* Action buttons row */}
      <div className="flex flex-wrap items-center gap-2">
        {isAuthor && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="gap-2"
            id="btn-edit-submission"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Modifier ma publication
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSuggestOpen(true)}
          className="gap-2 text-text-muted hover:text-text-primary"
          id="btn-suggest-correction"
        >
          <MessageSquarePlus className="size-3.5" aria-hidden="true" />
          Suggérer une correction
        </Button>
      </div>

      <Separator />

      {/* Description */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <BookOpen className="size-4 text-info" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
            Contexte & explication
          </h2>
        </div>
        <p className="whitespace-pre-wrap leading-relaxed text-text-primary">
          {submission.description}
        </p>
      </div>

      <Separator />

      {/* Source */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Source officielle
        </p>
        <Button variant="outline" asChild className="gap-2">
          <a href={submission.sourceUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Vérifier la source
          </a>
        </Button>
        <p className="text-xs text-text-muted">
          {extractDomain(submission.sourceUrl)}
        </p>
      </div>

      {/* Dialogs */}
      {isAuthor && (
        <EditSubmissionDialog
          submission={submission}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
      <SuggestCorrectionDialog
        submission={submission}
        open={suggestOpen}
        onOpenChange={setSuggestOpen}
      />
    </div>
  );
}
