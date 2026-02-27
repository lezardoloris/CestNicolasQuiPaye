'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h2 className="text-2xl font-display font-bold text-text-primary">
        Quelque chose s&apos;est casse
      </h2>
      <p className="text-text-secondary max-w-md">
        Une erreur inattendue est survenue. Vous pouvez reessayer ou revenir a
        la page d&apos;accueil.
      </p>
      <Button
        onClick={reset}
        className="bg-chainsaw-red hover:bg-chainsaw-red-hover text-white"
      >
        Reessayer
      </Button>
    </div>
  );
}
