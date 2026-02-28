'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SOURCE_TYPES, SOURCE_TYPE_LABELS } from '@/lib/utils/validation';
import type { SourceType } from '@/lib/utils/validation';

interface AddSourceFormProps {
  onSubmit: (data: { url: string; title: string; sourceType: SourceType }) => Promise<void>;
  isSubmitting: boolean;
}

export function AddSourceForm({ onSubmit, isSubmitting }: AddSourceFormProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('other');
  const [error, setError] = useState('');

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border-default',
          'px-3 py-2 text-xs text-text-muted transition-colors',
          'hover:border-text-muted hover:text-text-secondary',
        )}
      >
        <PlusCircle className="size-3.5" aria-hidden="true" />
        Ajouter une source
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim() || !title.trim()) {
      setError('URL et titre sont requis');
      return;
    }

    try {
      await onSubmit({ url: url.trim(), title: title.trim(), sourceType });
      setUrl('');
      setTitle('');
      setSourceType('other');
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border-default bg-surface-secondary p-3">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="w-full rounded-md border border-border-default bg-surface-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-chainsaw-red focus:outline-none"
        required
      />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de la source"
        maxLength={300}
        className="w-full rounded-md border border-border-default bg-surface-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-chainsaw-red focus:outline-none"
        required
      />
      <select
        value={sourceType}
        onChange={(e) => setSourceType(e.target.value as SourceType)}
        className="w-full rounded-md border border-border-default bg-surface-primary px-3 py-2 text-sm text-text-primary focus:border-chainsaw-red focus:outline-none"
      >
        {SOURCE_TYPES.map((type) => (
          <option key={type} value={type}>
            {SOURCE_TYPE_LABELS[type]}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-chainsaw-red">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'rounded-md bg-chainsaw-red px-3 py-1.5 text-xs font-semibold text-white',
            'transition-colors hover:bg-chainsaw-red-hover disabled:opacity-50',
          )}
        >
          {isSubmitting ? 'Ajout...' : 'Ajouter'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-1.5 text-xs text-text-muted hover:text-text-secondary"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
