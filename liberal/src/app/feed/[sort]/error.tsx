'use client';

import { Button } from '@/components/ui/button';

export default function FeedError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold text-text-primary">
        Erreur de chargement
      </h1>
      <p className="mt-4 text-text-secondary">
        Impossible de charger le fil. Veuillez reessayer.
      </p>
      <Button onClick={reset} className="mt-8" variant="outline">
        Reessayer
      </Button>
    </main>
  );
}
