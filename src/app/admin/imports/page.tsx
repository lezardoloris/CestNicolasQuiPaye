import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { dataImports, submissions } from '@/lib/db/schema';
import { desc, eq, count } from 'drizzle-orm';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Imports Open Data - Admin',
};

const STATUS_STYLES: Record<string, string> = {
  running: 'bg-yellow-500/10 text-yellow-600',
  completed: 'bg-green-500/10 text-green-600',
  failed: 'bg-red-500/10 text-red-600',
};

const SOURCE_LABELS: Record<string, string> = {
  decp: 'Marchés publics (DECP)',
  plf_budget: 'Budget (PLF)',
  subventions: 'Subventions',
};

function formatDuration(start: Date, end: Date | null): string {
  if (!end) return 'En cours...';
  const seconds = Math.round((end.getTime() - start.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export default async function ImportsPage() {
  const [recentImports, sourceCounts] = await Promise.all([
    db
      .select()
      .from(dataImports)
      .orderBy(desc(dataImports.startedAt))
      .limit(50),
    db
      .select({
        source: submissions.importSource,
        total: count(),
      })
      .from(submissions)
      .where(eq(submissions.isSeeded, 2))
      .groupBy(submissions.importSource),
  ]);

  const totalImported = sourceCounts.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Imports Open Data</h2>
        <p className="mt-1 text-sm text-text-muted">
          Import automatique des donnees gouvernementales
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total importe" value={totalImported.toLocaleString('fr-FR')} />
        {sourceCounts.map((s) => (
          <StatCard
            key={s.source}
            label={SOURCE_LABELS[s.source ?? ''] ?? s.source ?? 'Inconnu'}
            value={s.total.toLocaleString('fr-FR')}
          />
        ))}
      </div>

      {/* Import trigger info */}
      <div className="rounded-lg border border-border-default bg-surface-primary p-4">
        <p className="text-sm text-text-secondary">
          Les imports sont declenches automatiquement par le cron quotidien a 03:00 (Europe/Paris).
          Pour un import manuel, utilisez :
        </p>
        <pre className="mt-2 overflow-x-auto rounded-md bg-surface-elevated p-3 text-xs text-text-muted">
          curl -X POST /api/cron/open-data-import?source=all -H &quot;Authorization: Bearer $CRON_SECRET&quot;
        </pre>
      </div>

      {/* Recent imports table */}
      <div className="overflow-x-auto rounded-xl border border-border-default">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-default bg-surface-elevated text-text-muted">
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Recuperes</th>
              <th className="px-4 py-3 font-medium">Inseres</th>
              <th className="px-4 py-3 font-medium">Ignores</th>
              <th className="px-4 py-3 font-medium">Duree</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Erreur</th>
            </tr>
          </thead>
          <tbody>
            {recentImports.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-text-muted">
                  Aucun import enregistre
                </td>
              </tr>
            )}
            {recentImports.map((imp) => (
              <tr key={imp.id} className="border-b border-border-default/50">
                <td className="px-4 py-3 font-medium text-text-primary">
                  {SOURCE_LABELS[imp.source] ?? imp.source}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'rounded-md px-2 py-1 text-xs font-semibold',
                      STATUS_STYLES[imp.status] ?? 'bg-surface-elevated text-text-muted',
                    )}
                  >
                    {imp.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{imp.recordsFetched}</td>
                <td className="px-4 py-3 text-text-secondary">{imp.recordsInserted}</td>
                <td className="px-4 py-3 text-text-secondary">{imp.recordsSkipped}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {formatDuration(imp.startedAt, imp.completedAt)}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {imp.startedAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-red-500">
                  {imp.errorMessage ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-primary p-4">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
    </div>
  );
}
