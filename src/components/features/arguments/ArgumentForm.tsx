'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ArgumentFormProps {
  onSubmit: (body: string, type: 'pour' | 'contre') => Promise<unknown>;
  isSubmitting: boolean;
}

export function ArgumentForm({ onSubmit, isSubmitting }: ArgumentFormProps) {
  const [body, setBody] = useState('');
  const [type, setType] = useState<'pour' | 'contre'>('pour');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = body.trim();
    if (trimmed.length < 10) {
      setError('L\'argument doit contenir au moins 10 caractères.');
      return;
    }

    try {
      await onSubmit(trimmed, type);
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la soumission');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setType('pour')}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            type === 'pour'
              ? 'bg-green-600 text-white'
              : 'bg-surface-secondary text-text-muted hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950 dark:hover:text-green-400',
          )}
        >
          Pour
        </button>
        <button
          type="button"
          onClick={() => setType('contre')}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            type === 'contre'
              ? 'bg-red-600 text-white'
              : 'bg-surface-secondary text-text-muted hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400',
          )}
        >
          Contre
        </button>
      </div>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          type === 'pour'
            ? 'Pourquoi cette dépense est-elle justifiée ?'
            : 'Pourquoi cette dépense est-elle contestable ?'
        }
        className="min-h-[80px] border-border-default bg-surface-primary text-text-primary placeholder:text-text-muted"
        maxLength={2000}
      />
      {error && <p className="text-sm text-chainsaw-red">{error}</p>}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">{body.length}/2000</span>
        <Button
          type="submit"
          disabled={isSubmitting || body.trim().length < 10}
          size="sm"
        >
          {isSubmitting ? 'Envoi...' : 'Ajouter l\'argument'}
        </Button>
      </div>
    </form>
  );
}
