import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FeatureManagementTable } from '@/components/features/admin/FeatureManagementTable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion des propositions - Administration',
};

export default async function AdminFeaturesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-text-primary">
          Gestion des propositions
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Gerez les propositions de fonctionnalites soumises par la communaute.
          Mettez a jour les statuts pour informer les utilisateurs de l&apos;avancement.
        </p>
      </div>

      <FeatureManagementTable />
    </div>
  );
}
