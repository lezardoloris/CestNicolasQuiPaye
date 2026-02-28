import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import DataStatusTable from '@/components/features/data-status/DataStatusTable';
import { getCachedDenominators } from '@/lib/api/cost-cache';

export const metadata: Metadata = {
  title: 'Statut des données',
  description:
    'Transparence des données utilisées pour les calculs Coût pour Nicolas. Sources officielles, dates de mise à jour et fraîcheur des données.',
};

export const revalidate = 3600; // ISR: 1 hour

export default async function DataStatusPage() {
  const denominators = await getCachedDenominators();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 font-display text-3xl font-bold text-text-primary">
        Statut des données
      </h1>
      <p className="mb-8 text-text-secondary">
        Toutes les données utilisées pour calculer le Coût pour Nicolas
        proviennent de sources officielles. Cette page vous permet de vérifier
        la fraîcheur et l&apos;origine de chaque donnée.
      </p>

      <DataStatusTable denominators={denominators} />

      <div className="mt-8 rounded-lg border border-border-default bg-surface-secondary p-6">
        <h2 className="mb-2 font-display text-lg font-bold text-text-primary">
          Comment lire ce tableau ?
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-text-secondary">
          <li>
            <strong className="text-text-primary">Valeur actuelle</strong> :
            la dernière valeur connue de la donnée, mise en cache localement.
          </li>
          <li>
            <strong className="text-text-primary">Source</strong> : lien
            direct vers la publication officielle. Cliquez pour vérifier
            vous-même.
          </li>
          <li>
            <strong className="text-text-primary">Statut &quot;À jour&quot;</strong> :
            la donnée a été mise à jour dans les 6 derniers mois.
          </li>
          <li>
            <strong className="text-text-primary">
              Statut &quot;Donnée potentiellement obsolète&quot;
            </strong>{' '}
            : la donnée n&apos;a pas été mise à jour depuis plus de 6 mois. Le
            calcul reste valide mais utilise une valeur plus ancienne.
          </li>
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/methodologie"
          className="inline-flex items-center gap-2 text-chainsaw-red hover:underline"
        >
          <BookOpen className="h-4 w-4" />
          Méthodologie de calcul
        </Link>
        <Link
          href="/feed/hot"
          className="inline-flex items-center gap-2 text-text-secondary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au fil
        </Link>
      </div>
    </div>
  );
}
