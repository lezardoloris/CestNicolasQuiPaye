import { Clock, Flag, CheckCircle, Megaphone } from 'lucide-react';
import { DashboardMetricCard } from '@/components/features/admin/DashboardMetricCard';
import { RecentActivityFeed } from '@/components/features/admin/RecentActivityFeed';
import { QuickLinksPanel } from '@/components/features/admin/QuickLinksPanel';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de bord - Administration',
};

async function getDashboardData() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: {
        Cookie: `next-auth.session-token=${(session as unknown as { sessionToken?: string }).sessionToken || ''}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold text-text-primary">
        Vue d&apos;ensemble
      </h2>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          label="En attente de modération"
          value={data?.pendingCount ?? 0}
          icon={Clock}
          variant="warning"
        />
        <DashboardMetricCard
          label="Contenus signalés"
          value={data?.flagsCount ?? 0}
          icon={Flag}
          variant="warning"
        />
        <DashboardMetricCard
          label="Soumissions approuvées"
          value={data?.approvedCount ?? 0}
          icon={CheckCircle}
          variant="success"
        />
        <DashboardMetricCard
          label="Diffusions ce mois"
          value={data?.broadcastsThisMonth ?? 0}
          icon={Megaphone}
        />
      </div>

      {/* Two-column layout: activity + quick links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivityFeed actions={data?.recentActions ?? []} />
        </div>
        <div>
          <QuickLinksPanel />
        </div>
      </div>
    </div>
  );
}
