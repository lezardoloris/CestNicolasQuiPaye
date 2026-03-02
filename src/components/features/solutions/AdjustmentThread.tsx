'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Adjustment {
  id: string;
  authorDisplay: string;
  body: string;
  createdAt: string;
}

interface AdjustmentThreadProps {
  adjustments: Adjustment[];
  isLoading: boolean;
  onSubmit: (body: string) => Promise<unknown>;
  isSubmitting: boolean;
}

export function AdjustmentThread({
  adjustments,
  isLoading,
  onSubmit,
  isSubmitting,
}: AdjustmentThreadProps) {
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = body.trim();
    if (trimmed.length < 5) {
      setError('Au moins 5 caractères requis.');
      return;
    }
    try {
      await onSubmit(trimmed);
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div className="mt-2 border-t border-border-default pt-2">
      <div className="ml-2 space-y-2 border-l-2 border-border-default pl-3">
        {isLoading ? (
          <div className="h-6 animate-pulse rounded bg-surface-elevated" />
        ) : adjustments.length === 0 ? (
          <p className="text-[11px] text-text-muted">Aucune suggestion pour l&apos;instant.</p>
        ) : (
          adjustments.map((adj) => (
            <div key={adj.id} className="text-xs">
              <p className="text-text-primary">{adj.body}</p>
              <span className="text-[10px] text-text-muted">
                {adj.authorDisplay} &middot;{' '}
                {formatDistanceToNow(new Date(adj.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
          ))
        )}

        <form onSubmit={handleSubmit} className="flex gap-1.5">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Votre suggestion d'ajustement..."
            maxLength={500}
            className="flex-1 rounded border border-border-default bg-surface-primary px-2 py-1 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-chainsaw-red"
          />
          <button
            type="submit"
            disabled={isSubmitting || body.trim().length < 5}
            className="shrink-0 rounded bg-chainsaw-red px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-chainsaw-red-hover disabled:opacity-50"
          >
            {isSubmitting ? '...' : 'Envoyer'}
          </button>
        </form>
        {error && <p className="text-[10px] text-chainsaw-red">{error}</p>}
      </div>
    </div>
  );
}
