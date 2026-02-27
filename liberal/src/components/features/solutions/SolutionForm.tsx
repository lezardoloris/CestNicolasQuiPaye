'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SolutionFormProps {
  onSubmit: (body: string) => Promise<unknown>;
  isSubmitting: boolean;
}

export function SolutionForm({ onSubmit, isSubmitting }: SolutionFormProps) {
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = body.trim();
    if (trimmed.length < 10) {
      setError('La solution doit contenir au moins 10 caracteres.');
      return;
    }

    try {
      await onSubmit(trimmed);
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la soumission');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Proposez une solution pour reduire ce gaspillage..."
        className="min-h-[80px] bg-surface-primary border-border-default text-text-primary placeholder:text-text-muted"
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
          {isSubmitting ? 'Envoi...' : 'Proposer une solution'}
        </Button>
      </div>
    </form>
  );
}
