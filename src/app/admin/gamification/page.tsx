import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { AdminGamificationClient } from '@/components/features/admin/AdminGamificationClient';

export const metadata: Metadata = {
  title: 'Gamification - Administration',
};

export default async function AdminGamificationPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  return <AdminGamificationClient />;
}
