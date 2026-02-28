'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SubmissionDetailError({
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
        Impossible de charger ce signalement. Veuillez reessayer.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={reset} variant="outline">
          Reessayer
        </Button>
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/feed/hot">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour au fil
          </Link>
        </Button>
      </div>
    </main>
  );
}
