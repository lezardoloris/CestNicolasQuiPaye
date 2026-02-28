export interface KarmaStats {
  submissionCount: number;
  voteCount: number;
  sourceCount: number;
  noteCount: number;
  shareCount: number;
}

export function calculateKarma(stats: KarmaStats): number {
  return (
    stats.submissionCount * 10 +
    stats.voteCount * 1 +
    stats.sourceCount * 5 +
    stats.noteCount * 3 +
    stats.shareCount * 2
  );
}

export interface KarmaTier {
  label: string;
  emoji: string;
  color: string;
}

export function getKarmaTier(rank: number): KarmaTier {
  if (rank === 1) return { label: "Tronconneuse d'Or", emoji: '\u{1F947}', color: 'text-yellow-400' };
  if (rank <= 5) return { label: "Tronconneuse d'Argent", emoji: '\u{1F948}', color: 'text-slate-300' };
  if (rank <= 20) return { label: 'Tronconneuse de Bronze', emoji: '\u{1F949}', color: 'text-amber-600' };
  if (rank <= 100) return { label: 'Citoyen Actif', emoji: '\u{26A1}', color: 'text-info' };
  return { label: 'Citoyen', emoji: '\u{1F464}', color: 'text-text-muted' };
}
