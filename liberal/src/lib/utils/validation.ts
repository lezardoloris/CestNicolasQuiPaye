import { z } from 'zod';

// ─── Submission Form Validation ────────────────────────────────────

export const submissionFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est obligatoire')
    .max(200, 'Le titre ne doit pas depasser 200 caracteres'),
  description: z
    .string()
    .min(1, 'La description est obligatoire')
    .max(2000, 'La description ne doit pas depasser 2000 caracteres'),
  estimatedCostEur: z.coerce
    .number()
    .min(1, 'Le montant doit etre superieur a 0 EUR')
    .max(999_999_999_999.99, 'Le montant est trop eleve'),
  sourceUrl: z
    .string()
    .min(1, 'Le lien source est obligatoire')
    .url('Le lien source doit etre une URL valide')
    .regex(
      /^https?:\/\//,
      'Le lien source doit commencer par http:// ou https://'
    ),
});

export type SubmissionFormData = z.infer<typeof submissionFormSchema>;

// ─── Cost Calculation Validation ───────────────────────────────────

export const costCalculationRequestSchema = z.object({
  amountEur: z.coerce
    .number()
    .positive('Le montant doit etre un nombre positif'),
});

export type CostCalculationRequest = z.infer<
  typeof costCalculationRequestSchema
>;

// ─── Feed Query Validation ────────────────────────────────────────

export const feedQuerySchema = z.object({
  sort: z.enum(['hot', 'new', 'top']).default('hot'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  timeWindow: z.enum(['today', 'week', 'month', 'all']).default('week'),
});

export type FeedQueryParams = z.infer<typeof feedQuerySchema>;

// ─── Vote Validation ──────────────────────────────────────────────

export const voteSchema = z.object({
  voteType: z.enum(['up', 'down']),
});

export type VoteInput = z.infer<typeof voteSchema>;

// ─── Sort Validation ──────────────────────────────────────────────

export const VALID_SORTS = ['hot', 'new', 'top'] as const;
export type SortType = (typeof VALID_SORTS)[number];

export function isValidSort(sort: string): sort is SortType {
  return VALID_SORTS.includes(sort as SortType);
}

/**
 * Validate that a string is a valid UUID format.
 */
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}

// ─── Share Events Validation (Epic 4) ─────────────────────────────
export const shareEventSchema = z.object({
  submissionId: z.string().uuid('ID de soumission invalide'),
  platform: z.enum(['twitter', 'facebook', 'whatsapp', 'copy_link', 'native'], {
    error: 'Plateforme de partage invalide',
  }),
});

export type ShareEventData = z.infer<typeof shareEventSchema>;

export const pageViewSchema = z.object({
  pagePath: z.string().min(1).max(500),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  referrer: z.string().max(500).optional(),
});

export type PageViewData = z.infer<typeof pageViewSchema>;

// ─── Comment Validation (Epic 5) ──────────────────────────────────
export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, 'Le commentaire ne peut pas etre vide')
    .max(2000, 'Le commentaire ne doit pas depasser 2000 caracteres')
    .transform((val) => val.trim()),
  parentCommentId: z.string().uuid().nullable().optional(),
});

export type CreateCommentData = z.infer<typeof createCommentSchema>;

export const commentQuerySchema = z.object({
  sort: z.enum(['best', 'newest']).default('best'),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  parentId: z.string().uuid().optional(),
});

export type CommentQueryData = z.infer<typeof commentQuerySchema>;

export const commentVoteSchema = z.object({
  direction: z.enum(['up', 'down'], {
    error: 'Direction de vote invalide',
  }),
});

export type CommentVoteData = z.infer<typeof commentVoteSchema>;

// ─── Moderation Validation (Epic 6) ───────────────────────────────
export const moderationActionSchema = z
  .object({
    action: z.enum(['approve', 'reject', 'request_edit', 'remove']),
    reason: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (['reject', 'request_edit', 'remove'].includes(data.action)) {
        return data.reason && data.reason.trim().length > 0;
      }
      return true;
    },
    { message: 'Une raison est requise pour cette action', path: ['reason'] }
  );

export type ModerationActionData = z.infer<typeof moderationActionSchema>;

export const flagSubmissionSchema = z.object({
  reason: z.enum(['inaccurate', 'spam', 'inappropriate'], {
    error: 'Raison de signalement invalide',
  }),
  details: z.string().max(500).optional(),
});

export type FlagSubmissionData = z.infer<typeof flagSubmissionSchema>;

export const broadcastSchema = z.object({
  submissionId: z.string().uuid('ID de soumission invalide'),
  tweetText: z
    .string()
    .min(1, 'Le texte du tweet est requis')
    .max(280, 'Le tweet ne doit pas depasser 280 caracteres'),
});

export type BroadcastData = z.infer<typeof broadcastSchema>;

// ─── Feature Proposal Validation (Epic 7) ─────────────────────────
export const featureProposalCreateSchema = z.object({
  title: z
    .string()
    .min(3, 'Le titre doit contenir au moins 3 caracteres')
    .max(200, 'Le titre ne doit pas depasser 200 caracteres'),
  description: z
    .string()
    .min(10, 'La description doit contenir au moins 10 caracteres')
    .max(1000, 'La description ne doit pas depasser 1000 caracteres'),
  category: z.enum(['general', 'data', 'ux', 'social', 'tech'], {
    error: 'Veuillez choisir une categorie',
  }),
});

export type FeatureProposalCreateData = z.infer<typeof featureProposalCreateSchema>;

export const FEATURE_PROPOSAL_CATEGORIES = {
  general: 'General',
  data: 'Donnees',
  ux: 'UX / Design',
  social: 'Social',
  tech: 'Technique',
} as const;

export const FEATURE_VOTE_STATUS_LABELS = {
  proposed: 'Propose',
  planned: 'Planifie',
  in_progress: 'En cours',
  shipped: 'Realise',
  declined: 'Refuse',
} as const;

export const featureVoteBallotSchema = z.object({
  value: z.number().int().refine((v) => v === 1 || v === -1, {
    message: 'La valeur du vote doit etre 1 ou -1',
  }),
});

export type FeatureVoteBallotData = z.infer<typeof featureVoteBallotSchema>;

export const featureVoteStatusUpdateSchema = z
  .object({
    status: z.enum(['proposed', 'planned', 'in_progress', 'shipped', 'declined']),
    rejectionReason: z.string().min(10).max(500).optional(),
  })
  .refine(
    (data) =>
      data.status !== 'declined' ||
      (data.rejectionReason && data.rejectionReason.length >= 10),
    { message: 'Une raison est requise pour refuser une proposition', path: ['rejectionReason'] }
  );

export type FeatureVoteStatusUpdateData = z.infer<typeof featureVoteStatusUpdateSchema>;

export const featureVoteQuerySchema = z.object({
  sortBy: z.enum(['votes', 'date']).default('votes'),
  status: z.string().optional(),
  category: z.string().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
