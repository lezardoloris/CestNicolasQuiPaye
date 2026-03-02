'use client';

import { useEffect, useState } from 'react';
import { PodiumCards } from './PodiumCards';
import { LeaderboardTable, type LeaderboardEntry } from './LeaderboardTable';
import { Trophy, Zap } from 'lucide-react';

export function LeaderboardPageClient() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setEntries(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-text-primary md:text-4xl">
          <Trophy className="inline-block size-8 text-chainsaw-red mr-2 -mt-1" aria-hidden="true" />
          La Tronçonneuse d&apos;Or
        </h1>
        <p className="text-sm text-text-muted max-w-lg mx-auto">
          Classement des citoyens les plus actifs dans la traque aux gaspillages.
          Gagnez de l&apos;XP, montez en niveau et grimpez au classement.
        </p>
      </div>

      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="flex justify-center gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-52 w-full max-w-[280px] rounded-xl border border-border-default bg-surface-secondary"
              />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-surface-secondary" />
            ))}
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-text-muted">Aucun contributeur pour le moment.</p>
          <p className="mt-2 text-sm text-text-muted">
            Soyez le premier à soumettre un signalement !
          </p>
        </div>
      ) : (
        <>
          {/* Podium */}
          <PodiumCards top3={top3} />

          {/* Table 4-50 */}
          {rest.length > 0 && (
            <LeaderboardTable entries={rest} />
          )}

          {/* XP explanation */}
          <div className="rounded-lg border border-border-default bg-surface-secondary p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">
              <Zap className="inline size-5 text-chainsaw-red mr-1 -mt-0.5" />
              Comment gagner de l&apos;XP ?
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-chainsaw-red/10 text-xs font-bold text-chainsaw-red">
                  +50
                </span>
                <span>Signalement publié</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-chainsaw-red/10 text-xs font-bold text-chainsaw-red">
                  +20
                </span>
                <span>Source ajoutée</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-chainsaw-red/10 text-xs font-bold text-chainsaw-red">
                  +15
                </span>
                <span>Note de communauté</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-chainsaw-red/10 text-xs font-bold text-chainsaw-red">
                  +10
                </span>
                <span>Bonus quotidien (série)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-surface-elevated text-xs font-bold text-text-secondary">
                  +5
                </span>
                <span>Commentaire ou partage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-surface-elevated text-xs font-bold text-text-muted">
                  +2
                </span>
                <span>Vote donné ou reçu</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
