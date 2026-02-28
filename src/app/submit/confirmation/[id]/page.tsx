import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Signalement soumis',
  description: 'Votre signalement a été soumis avec succès.',
};

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { id } = await params;

  // In production, fetch the submission from the database:
  // const submission = await db.query.submissions.findFirst({
  //   where: eq(submissions.id, id),
  // });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mb-6 flex justify-center">
        <CheckCircle className="h-16 w-16 text-success" />
      </div>

      <h1 className="mb-4 font-display text-3xl font-bold text-text-primary">
        Signalement soumis !
      </h1>

      <p className="mb-8 text-lg text-text-secondary">
        Votre signalement a été soumis et sera examiné par nos modérateurs.
      </p>

      <div className="mb-8 rounded-lg border border-border-default bg-surface-secondary p-6 text-left">
        <p className="mb-2 text-sm text-text-muted">
          Référence de votre signalement
        </p>
        <p className="font-mono text-sm text-text-secondary">{id}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="default" className="bg-chainsaw-red text-white hover:bg-chainsaw-red-hover">
          <Link href="/feed/hot">
            <ArrowLeft className="h-4 w-4" />
            Retour au fil
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/submit">Signaler un autre gaspillage</Link>
        </Button>
      </div>
    </div>
  );
}
