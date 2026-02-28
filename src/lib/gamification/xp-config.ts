// ─── XP Earning Table (Quality-Weighted, Configurable) ──────────────
// This is the single source of truth for XP amounts per action.
// All values are server-side only — clients never determine XP.

import type { xpActionType } from '@/lib/db/schema';

type XpActionType = (typeof xpActionType.enumValues)[number];

export interface XpActionConfig {
  xp: number;
  maxPerDay: number | null; // null = unlimited
  label: string;
}

export const XP_TABLE: Record<XpActionType, XpActionConfig> = {
  submission_published: { xp: 50, maxPerDay: 5, label: 'Signalement publié' },
  source_added: { xp: 20, maxPerDay: 10, label: 'Source ajoutée' },
  cross_reference_bonus: { xp: 30, maxPerDay: 5, label: 'Bonus sources croisées' },
  source_validated: { xp: 10, maxPerDay: 20, label: 'Source validée' },
  vote_cast: { xp: 2, maxPerDay: 100, label: 'Vote donné' },
  upvote_received: { xp: 2, maxPerDay: null, label: 'Upvote reçu' },
  comment_posted: { xp: 5, maxPerDay: 20, label: 'Commentaire posté' },
  comment_upvoted: { xp: 3, maxPerDay: null, label: 'Commentaire upvoté' },
  community_note_written: { xp: 15, maxPerDay: 5, label: 'Note de communauté' },
  community_note_pinned: { xp: 30, maxPerDay: null, label: 'Note épinglée' },
  solution_proposed: { xp: 10, maxPerDay: 5, label: 'Solution proposée' },
  solution_upvoted: { xp: 5, maxPerDay: null, label: 'Solution upvotée' },
  share: { xp: 5, maxPerDay: 3, label: 'Partage social' },
  moderation_action: { xp: 15, maxPerDay: 50, label: 'Action de modération' },
  price_correction: { xp: 20, maxPerDay: 10, label: 'Correction de montant' },
  daily_bonus: { xp: 10, maxPerDay: 1, label: 'Bonus du jour' },
  admin_manual: { xp: 0, maxPerDay: null, label: 'Attribution manuelle' },
  clawback: { xp: 0, maxPerDay: null, label: 'Récupération XP' },
};

// ─── Level Thresholds ───────────────────────────────────────────────

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
}

export const LEVEL_THRESHOLDS: LevelInfo[] = [
  { level: 1, title: 'Citoyen', minXp: 0 },
  { level: 2, title: 'Citoyen Vigilant', minXp: 100 },
  { level: 3, title: 'Sentinelle', minXp: 300 },
  { level: 4, title: 'Enquêteur', minXp: 600 },
  { level: 5, title: 'Investigateur', minXp: 1000 },
  { level: 6, title: 'Éclaireur', minXp: 1500 },
  { level: 7, title: "Lanceur d'Alerte", minXp: 2200 },
  { level: 8, title: 'Gardien', minXp: 3000 },
  { level: 9, title: 'Contrôleur', minXp: 4000 },
  { level: 10, title: 'Inspecteur', minXp: 5500 },
  { level: 11, title: 'Vérificateur', minXp: 7500 },
  { level: 12, title: 'Auditeur', minXp: 10000 },
  { level: 13, title: 'Commissaire', minXp: 13000 },
  { level: 14, title: 'Procureur', minXp: 17000 },
  { level: 15, title: 'Justicier', minXp: 22000 },
  { level: 16, title: "Sentinelle d'Or", minXp: 28000 },
  { level: 17, title: 'Gardien de la République', minXp: 35000 },
  { level: 18, title: 'Champion Citoyen', minXp: 45000 },
  { level: 19, title: 'Tronçonneur Suprême', minXp: 60000 },
  { level: 20, title: 'Légende Citoyenne', minXp: 80000 },
];

export function getLevelFromXp(totalXp: number): LevelInfo {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].minXp) {
      return LEVEL_THRESHOLDS[i];
    }
  }
  return LEVEL_THRESHOLDS[0];
}

export function getNextLevel(currentLevel: number): LevelInfo | null {
  if (currentLevel >= 20) return null;
  return LEVEL_THRESHOLDS[currentLevel]; // level is 1-indexed, array is 0-indexed
}

export function getLevelProgress(totalXp: number): {
  current: LevelInfo;
  next: LevelInfo | null;
  progressPercent: number;
  xpInLevel: number;
  xpForLevel: number;
} {
  const current = getLevelFromXp(totalXp);
  const next = getNextLevel(current.level);

  if (!next) {
    return { current, next: null, progressPercent: 100, xpInLevel: 0, xpForLevel: 0 };
  }

  const xpForLevel = next.minXp - current.minXp;
  const xpInLevel = totalXp - current.minXp;
  const progressPercent = Math.min(100, Math.floor((xpInLevel / xpForLevel) * 100));

  return { current, next, progressPercent, xpInLevel, xpForLevel };
}

// ─── Badge Definitions (MVP) ────────────────────────────────────────

export interface BadgeDef {
  slug: string;
  name: string;
  description: string;
  category: 'streak' | 'contribution' | 'quality' | 'social' | 'moderation' | 'code' | 'special';
  criteria: BadgeCriteria;
}

export type BadgeCriteria =
  | { type: 'xp_action_count'; actionType: string; count: number }
  | { type: 'streak_days'; days: number }
  | { type: 'total_count'; entity: string; count: number }
  | { type: 'cross_reference'; count: number };

export const MVP_BADGES: BadgeDef[] = [
  {
    slug: 'premier-signalement',
    name: 'Premier Signalement',
    description: 'Soumettre votre premier signalement sourcé',
    category: 'contribution',
    criteria: { type: 'xp_action_count', actionType: 'submission_published', count: 1 },
  },
  {
    slug: 'sources-croisees',
    name: 'Sources Croisées',
    description: 'Soumettre un signalement avec 2+ types de sources croisées',
    category: 'quality',
    criteria: { type: 'xp_action_count', actionType: 'cross_reference_bonus', count: 1 },
  },
  {
    slug: 'flamme-7-jours',
    name: 'Flamme de 7 Jours',
    description: 'Maintenir une série de 7 jours consécutifs',
    category: 'streak',
    criteria: { type: 'streak_days', days: 7 },
  },
  {
    slug: 'flamme-30-jours',
    name: 'Flamme de 30 Jours',
    description: 'Maintenir une série de 30 jours consécutifs',
    category: 'streak',
    criteria: { type: 'streak_days', days: 30 },
  },
  {
    slug: 'voix-du-peuple',
    name: 'Voix du Peuple',
    description: 'Voter sur 100 signalements',
    category: 'contribution',
    criteria: { type: 'xp_action_count', actionType: 'vote_cast', count: 100 },
  },
  {
    slug: 'moderateur-fiable',
    name: 'Modérateur Fiable',
    description: 'Compléter 50 actions de modération',
    category: 'moderation',
    criteria: { type: 'xp_action_count', actionType: 'moderation_action', count: 50 },
  },
  {
    slug: 'ambassadeur',
    name: 'Ambassadeur',
    description: 'Partager 25 signalements sur les réseaux sociaux',
    category: 'social',
    criteria: { type: 'xp_action_count', actionType: 'share', count: 25 },
  },
  {
    slug: 'correcteur',
    name: 'Correcteur',
    description: 'Faire accepter 5 corrections de montant',
    category: 'quality',
    criteria: { type: 'xp_action_count', actionType: 'price_correction', count: 5 },
  },
];

// ─── Streak Milestones (days that earn freeze tokens) ───────────────

export const STREAK_FREEZE_MILESTONES = [7, 30, 100];
