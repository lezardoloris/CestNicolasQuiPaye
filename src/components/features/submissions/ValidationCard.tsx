'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, ExternalLink, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingSubmission {
  id: string;
  title: string;
  slug: string;
  description: string;
  amount: string;
  sourceUrl: string;
  authorDisplay: string;
  approveWeight: number;
  rejectWeight: number;
  createdAt: string;
}

interface ValidationCardProps {
  submission: PendingSubmission;
  onValidate: (id: string, verdict: 'approve' | 'reject', reason?: string) => Promise<void>;
}

export function ValidationCard({ submission, onValidate }: ValidationCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [reason, setReason] = useState('');
  const [resolved, setResolved] = useState<'approve' | 'reject' | null>(null);

  const totalWeight = submission.approveWeight + submission.rejectWeight;
  const approvePercent = totalWeight > 0 ? (submission.approveWeight / totalWeight) * 100 : 50;

  async function handleVote(verdict: 'approve' | 'reject') {
    if (verdict === 'reject' && !showRejectReason) {
      setShowRejectReason(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await onValidate(submission.id, verdict, verdict === 'reject' ? reason : undefined);
      setResolved(verdict);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (resolved) {
    return (
      <div className="bg-surface-primary border-border-default rounded-2xl border p-4 opacity-60">
        <div className="flex items-center gap-2">
          {resolved === 'approve' ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <X className="h-5 w-5 text-red-500" />
          )}
          <span className="text-text-secondary text-sm">
            {resolved === 'approve' ? 'Approuvé' : 'Rejeté'} — {submission.title}
          </span>
        </div>
      </div>
    );
  }

  const formattedAmount = Number(submission.amount).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });

  return (
    <div className="bg-surface-primary border-border-default rounded-2xl border p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/s/${submission.id}`}
            className="text-text-primary text-sm font-semibold hover:underline"
            target="_blank"
          >
            {submission.title}
            <ExternalLink className="ml-1 inline h-3 w-3" />
          </Link>
          <p className="text-text-secondary mt-0.5 text-xs">
            par {submission.authorDisplay}
          </p>
        </div>
        <span className="text-drapeau-rouge shrink-0 text-sm font-bold">{formattedAmount}</span>
      </div>

      <p className="text-text-secondary mb-3 line-clamp-2 text-xs">{submission.description}</p>

      <a
        href={submission.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-drapeau-rouge mb-3 block truncate text-xs hover:underline"
      >
        {submission.sourceUrl}
      </a>

      {/* Progress bar */}
      {totalWeight > 0 && (
        <div className="mb-3">
          <div className="bg-border-default h-1.5 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${approvePercent}%` }}
            />
          </div>
          <div className="text-text-secondary mt-1 flex justify-between text-[10px]">
            <span>Approuvé: {submission.approveWeight}</span>
            <span>Rejeté: {submission.rejectWeight}</span>
          </div>
        </div>
      )}

      {showRejectReason && (
        <div className="mb-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Raison du rejet (optionnel)..."
            className="border-border-default bg-surface-secondary text-text-primary w-full rounded-lg border p-2 text-xs placeholder:text-gray-400 focus:outline-none"
            rows={2}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleVote('approve')}
          disabled={isSubmitting}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors',
            'bg-green-500/10 text-green-600 hover:bg-green-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <Check className="h-4 w-4" />
          Approuver
        </button>
        <button
          onClick={() => handleVote('reject')}
          disabled={isSubmitting}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors',
            'bg-red-500/10 text-red-600 hover:bg-red-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {showRejectReason ? (
            <>
              <X className="h-4 w-4" />
              Confirmer le rejet
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Rejeter
            </>
          )}
        </button>
      </div>
    </div>
  );
}
