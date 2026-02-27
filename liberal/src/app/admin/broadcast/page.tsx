import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BroadcastTool } from '@/components/features/admin/BroadcastTool';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diffusion Twitter - Administration',
};

export default async function BroadcastPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-text-primary">
          Diffusion Twitter / X
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Publiez des soumissions sur le compte Twitter officiel @LIBERAL_FR.
        </p>
      </div>

      <BroadcastTool />
    </div>
  );
}
