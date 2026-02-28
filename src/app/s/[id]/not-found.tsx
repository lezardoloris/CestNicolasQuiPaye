import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubmissionNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold text-text-primary">
        Signalement introuvable
      </h1>
      <p className="mt-4 text-text-secondary">
        Ce signalement n&apos;existe pas ou a ete supprime.
      </p>
      <Button asChild variant="outline" className="mt-8 gap-2">
        <Link href="/feed/hot">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour au fil
        </Link>
      </Button>
    </main>
  );
}
