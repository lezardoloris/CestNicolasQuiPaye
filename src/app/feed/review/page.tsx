import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';
import { auth } from '@/lib/auth';
import { ValidationQueue } from '@/components/features/submissions/ValidationQueue';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Validation communautaire - C\'est Nicolas Qui Paie',
  description: 'Validez les signalements soumis par la communauté.',
};

export default async function ReviewPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 pt-4 pb-20 md:pt-6 md:pb-6">
      <div className="mb-6 flex items-center gap-3">
        <Shield className="text-drapeau-rouge h-6 w-6" />
        <div>
          <h1 className="text-text-primary text-xl font-bold">Validation communautaire</h1>
          <p className="text-text-secondary text-sm">
            Aidez à vérifier les signalements soumis par d&apos;autres citoyens. Gagnez +15 XP par
            validation.
          </p>
        </div>
      </div>

      <ValidationQueue />
    </main>
  );
}
