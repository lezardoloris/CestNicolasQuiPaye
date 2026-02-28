'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, Users, Activity } from 'lucide-react';

interface TopUser {
  id: string;
  displayName: string | null;
  anonymousId: string;
  totalXp: number;
  currentStreak: number;
}

interface XpStats {
  totalXpAwarded: number;
  totalXpClawed: number;
  totalEvents: number;
}

interface RecentEvent {
  id: string;
  userId: string;
  actionType: string;
  xpAmount: number;
  createdAt: string;
}

export function AdminGamificationClient() {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [xpStats, setXpStats] = useState<XpStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual XP form
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/gamification')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setTopUsers(json.data.topUsers ?? []);
          setXpStats(json.data.xpStats ?? null);
          setRecentEvents(json.data.recentEvents ?? []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleManualXp(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: parseInt(amount, 10),
          reason,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage(`XP attribue: ${amount} XP a ${userId}`);
        setUserId('');
        setAmount('');
        setReason('');
      } else {
        setMessage(`Erreur: ${json.error?.message ?? 'Erreur inconnue'}`);
      }
    } catch {
      setMessage('Erreur reseau');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded bg-surface-secondary" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-surface-secondary" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold text-text-primary">
        <Zap className="inline size-5 text-chainsaw-red mr-1 -mt-0.5" />
        Gamification
      </h2>

      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border-default bg-surface-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
              <TrendingUp className="size-4" />
              XP total distribue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-text-primary">
              {(xpStats?.totalXpAwarded ?? 0).toLocaleString('fr-FR')}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border-default bg-surface-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
              <Activity className="size-4" />
              Evenements XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-text-primary">
              {(xpStats?.totalEvents ?? 0).toLocaleString('fr-FR')}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border-default bg-surface-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
              <Users className="size-4" />
              Top contributeur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-text-primary truncate">
              {topUsers[0]?.displayName ?? topUsers[0]?.anonymousId ?? '—'}
            </p>
            <p className="text-sm text-chainsaw-red tabular-nums">
              {(topUsers[0]?.totalXp ?? 0).toLocaleString('fr-FR')} XP
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Manual XP attribution */}
      <Card className="border-border-default bg-surface-secondary">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-text-primary">
            Attribution manuelle d&apos;XP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualXp} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-text-muted" htmlFor="gam-userId">
                ID utilisateur
              </label>
              <input
                id="gam-userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-1 w-full rounded-md border border-border-default bg-surface-primary px-3 py-2 text-sm text-text-primary"
                placeholder="UUID de l'utilisateur"
                required
              />
            </div>
            <div className="w-28">
              <label className="text-xs font-medium text-text-muted" htmlFor="gam-amount">
                XP (+/-)
              </label>
              <input
                id="gam-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-md border border-border-default bg-surface-primary px-3 py-2 text-sm text-text-primary"
                placeholder="50"
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-text-muted" htmlFor="gam-reason">
                Raison
              </label>
              <input
                id="gam-reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-md border border-border-default bg-surface-primary px-3 py-2 text-sm text-text-primary"
                placeholder="Raison de l'attribution"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-chainsaw-red px-4 py-2 text-sm font-semibold text-white hover:bg-chainsaw-red/90 disabled:opacity-50"
            >
              {submitting ? '...' : 'Attribuer'}
            </button>
          </form>
          {message && (
            <p className="mt-2 text-sm text-text-secondary">{message}</p>
          )}
        </CardContent>
      </Card>

      {/* Top users */}
      <Card className="border-border-default bg-surface-secondary">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-text-primary">
            Top 20 - XP
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-xs font-semibold uppercase text-text-muted">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Utilisateur</th>
                  <th className="px-4 py-2 text-right">XP</th>
                  <th className="px-4 py-2 text-right">Serie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {topUsers.map((u, i) => (
                  <tr key={u.id} className="hover:bg-surface-elevated/50">
                    <td className="px-4 py-2 text-text-muted">{i + 1}</td>
                    <td className="px-4 py-2 text-text-primary truncate max-w-[200px]">
                      {u.displayName ?? u.anonymousId}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-bold text-chainsaw-red">
                      {(u.totalXp ?? 0).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-text-secondary">
                      {u.currentStreak ?? 0}j
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent events */}
      <Card className="border-border-default bg-surface-secondary">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-text-primary">
            Derniers evenements XP
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-secondary">
                <tr className="border-b border-border-default text-left text-xs font-semibold uppercase text-text-muted">
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2 text-right">XP</th>
                  <th className="px-4 py-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {recentEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-elevated/50">
                    <td className="px-4 py-2 text-text-primary">
                      {e.actionType}
                    </td>
                    <td className={`px-4 py-2 text-right tabular-nums font-bold ${e.xpAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {e.xpAmount >= 0 ? '+' : ''}{e.xpAmount}
                    </td>
                    <td className="px-4 py-2 text-right text-text-muted text-xs">
                      {new Date(e.createdAt).toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
