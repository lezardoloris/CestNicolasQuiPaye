'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CommunityNoteFormProps {
  onSubmit: (data: { body: string; sourceUrl?: string }) => Promise<unknown>;
  isSubmitting: boolean;
}

export function CommunityNoteForm({ onSubmit, isSubmitting }: CommunityNoteFormProps) {
  const [body, setBody] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (body.trim().length < 10) {
      setError('La note doit contenir au moins 10 caracteres');
      return;
    }

    try {
      await onSubmit({
        body: body.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
      });
      setBody('');
      setSourceUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Apportez du contexte factuel..."
          maxLength={500}
          rows={3}
          className={cn(
            'w-full resize-none rounded-lg border border-border-default bg-surface-primary',
            'px-3 py-2 text-sm text-text-primary placeholder:text-text-muted',
            'focus:border-info focus:outline-none',
          )}
        />
        <span
          className={cn(
            'absolute bottom-2 right-2 text-[10px]',
            body.length > 450 ? 'text-chainsaw-red' : 'text-text-muted',
          )}
        >
          {body.length}/500
        </span>
      </div>

      <input
        type="url"
        value={sourceUrl}
        onChange={(e) => setSourceUrl(e.target.value)}
        placeholder="URL source (optionnel)"
        className="w-full rounded-md border border-border-default bg-surface-primary px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-info focus:outline-none"
      />

      {error && <p className="text-xs text-chainsaw-red">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || body.trim().length < 10}
        className={cn(
          'rounded-md bg-info px-3 py-1.5 text-xs font-semibold text-white',
          'transition-colors hover:bg-info/80 disabled:opacity-50',
        )}
      >
        {isSubmitting ? 'Envoi...' : 'Ajouter une note'}
      </button>
    </form>
  );
}
