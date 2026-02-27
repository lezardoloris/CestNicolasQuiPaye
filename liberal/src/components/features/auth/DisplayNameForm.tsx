'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { displayNameSchema } from '@/lib/validators/display-name';
import { resolveDisplayName } from '@/lib/utils/user-display';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DisplayNameFormProps {
  currentDisplayName: string | null;
  anonymousId: string;
}

export default function DisplayNameForm({
  currentDisplayName,
  anonymousId,
}: DisplayNameFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const [displayName, setDisplayName] = useState(currentDisplayName ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewName = resolveDisplayName(
    displayName.trim() || null,
    anonymousId,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const parsed = displayNameSchema.safeParse({ displayName: displayName.trim() });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setError(fieldErrors.displayName?.[0] ?? 'Donnees invalides');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/display-name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? 'Une erreur est survenue');
        setIsLoading(false);
        return;
      }

      await update({ name: displayName.trim(), displayName: displayName.trim() });
      toast.success('Pseudonyme mis a jour avec succes');
      router.refresh();
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetToAnonymous() {
    setIsResetting(true);
    setError(null);

    try {
      const res = await fetch('/api/user/display-name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: null }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message ?? 'Une erreur est survenue');
        return;
      }

      await update({ name: anonymousId, displayName: null });
      setDisplayName('');
      toast.success('Pseudonyme reinitialise');
      router.refresh();
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-text-primary">
          Pseudonyme
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Vous apparaissez actuellement comme :{' '}
          <strong className="text-text-primary">
            {resolveDisplayName(currentDisplayName, anonymousId)}
          </strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="displayName"
            className="text-sm font-medium text-text-primary"
          >
            Nouveau pseudonyme
          </label>
          <Input
            id="displayName"
            name="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={100}
            placeholder="Votre pseudonyme"
            aria-describedby={error ? 'display-name-error' : 'display-name-counter'}
            aria-invalid={!!error}
            className="bg-surface-primary border-border-default text-text-primary"
          />
          <div className="flex items-center justify-between">
            {error ? (
              <p
                id="display-name-error"
                role="alert"
                className="text-sm text-chainsaw-red"
              >
                {error}
              </p>
            ) : (
              <span />
            )}
            <span id="display-name-counter" className="text-xs text-text-muted">
              {displayName.length}/100
            </span>
          </div>
        </div>

        {/* Live preview */}
        <div className="rounded-lg bg-surface-elevated p-4">
          <p className="text-sm text-text-muted">
            Apercu : <strong className="text-text-primary">{previewName}</strong>
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Soumis par <strong>{previewName}</strong> - il y a 2 minutes
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isLoading || !displayName.trim()}
            className="bg-chainsaw-red text-white hover:bg-chainsaw-red-hover"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Mise a jour...
              </>
            ) : (
              'Mettre a jour'
            )}
          </Button>
          {currentDisplayName && (
            <Button
              type="button"
              variant="ghost"
              disabled={isResetting}
              onClick={handleResetToAnonymous}
              className="text-text-secondary"
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Reinitialisation...
                </>
              ) : (
                "Revenir a l'anonymat"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
