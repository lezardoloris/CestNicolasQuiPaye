import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  varchar,
  decimal,
  pgEnum,
  uniqueIndex,
  index,
  jsonb,
  boolean,
  date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ──────────────────────────────────────────────────────────
export const userRole = pgEnum('user_role', ['user', 'moderator', 'admin']);
export const voteType = pgEnum('vote_type', ['up', 'down']);
export const moderationStatus = pgEnum('moderation_status', [
  'pending',
  'approved',
  'rejected',
  'flagged',
]);
export const submissionStatus = pgEnum('submission_status', [
  'draft',
  'published',
  'hidden',
  'deleted',
]);
export const importSourceEnum = pgEnum('import_source', ['decp', 'plf_budget', 'subventions']);
export const importStatusEnum = pgEnum('import_status', ['running', 'completed', 'failed']);
export const votingPosition = pgEnum('voting_position', [
  'essentiel',
  'justifie_ameliorable',
  'discutable',
  'injustifie',
]);
export const argumentType = pgEnum('argument_type', ['pour', 'contre']);
export const aiContextSource = pgEnum('ai_context_source', ['template', 'llm', 'admin']);
export const aiContextStatus = pgEnum('ai_context_status', ['draft', 'approved', 'rejected']);

// ─── Users ──────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 100 }),
  anonymousId: varchar('anonymous_id', { length: 20 }).notNull().unique(),
  role: userRole('role').notNull().default('user'),
  twitterId: varchar('twitter_id', { length: 255 }).unique(),
  twitterHandle: varchar('twitter_handle', { length: 50 }),
  githubId: varchar('github_id', { length: 255 }),
  githubUsername: varchar('github_username', { length: 50 }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  submissionCount: integer('submission_count').notNull().default(0),
  karmaScore: integer('karma_score').notNull().default(0),
  // ─── Gamification fields ───
  totalXp: integer('total_xp').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActiveDate: date('last_active_date'),
  streakFreezeCount: integer('streak_freeze_count').notNull().default(0),
  dailyGoal: integer('daily_goal').notNull().default(20),
  reposDaysUsedThisMonth: integer('repos_days_used_this_month').notNull().default(0),
  leagueOptOut: boolean('league_opt_out').notNull().default(false),
  // ─── Privacy settings ───
  showXpPublicly: boolean('show_xp_publicly').notNull().default(false),
  showLevelPublicly: boolean('show_level_publicly').notNull().default(false),
  showStreakPublicly: boolean('show_streak_publicly').notNull().default(false),
  showBadgesPublicly: boolean('show_badges_publicly').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── Auth.js required tables ────────────────────────────────────────
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires').notNull(),
  },
  (table) => [uniqueIndex('verification_tokens_identifier_token_idx').on(table.identifier, table.token)],
);

// ─── Submissions ────────────────────────────────────────────────────
export const submissions = pgTable('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  authorDisplay: varchar('author_display', { length: 100 }).notNull().default('Anonyme'),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 250 }).notNull(),
  description: text('description').notNull(),
  sourceUrl: text('source_url').notNull(),
  tweetUrl: text('tweet_url'),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  ministryTag: varchar('ministry_tag', { length: 100 }),
  costPerTaxpayer: decimal('cost_per_taxpayer', { precision: 10, scale: 4 }),
  consequenceText: text('consequence_text'),
  upvoteCount: integer('upvote_count').notNull().default(0),
  downvoteCount: integer('downvote_count').notNull().default(0),
  commentCount: integer('comment_count').notNull().default(0),
  hotScore: decimal('hot_score', { precision: 20, scale: 10 }).notNull().default('0'),
  status: submissionStatus('status').notNull().default('published'),
  moderationStatus: moderationStatus('moderation_status').notNull().default('approved'),
  costToNicolasResults: jsonb('cost_to_nicolas_results'),
  ogImageUrl: text('og_image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  isSeeded: integer('is_seeded').notNull().default(0),
  // ─── Open Data import fields ───
  externalId: varchar('external_id', { length: 255 }),
  importSource: importSourceEnum('import_source'),
  // ─── 4-Position vote denormalized counts ───
  fourPosEssentielCount: integer('four_pos_essentiel_count').notNull().default(0),
  fourPosJustifieCount: integer('four_pos_justifie_count').notNull().default(0),
  fourPosDiscutableCount: integer('four_pos_discutable_count').notNull().default(0),
  fourPosInjustifieCount: integer('four_pos_injustifie_count').notNull().default(0),
  fourPosTotalCount: integer('four_pos_total_count').notNull().default(0),
  consensusType: varchar('consensus_type', { length: 30 }),
  // ─── Maturity system ───
  maturityLevel: integer('maturity_level').notNull().default(1),
  maturityPct: integer('maturity_pct').notNull().default(0),
  maturityUpdatedAt: timestamp('maturity_updated_at'),
  // ─── Community validation weights ───
  approveWeight: integer('approve_weight').notNull().default(0),
  rejectWeight: integer('reject_weight').notNull().default(0),
}, (table) => [
  uniqueIndex('idx_submissions_external_id_source').on(table.importSource, table.externalId),
]);

// ─── Votes ──────────────────────────────────────────────────────────
export const votes = pgTable(
  'votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    voteType: voteType('vote_type').notNull(),
    superseded: boolean('superseded').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('votes_user_submission_idx').on(table.userId, table.submissionId)],
);

// ─── IP Votes (anonymous voting by IP hash) ────────────────────────
export const ipVotes = pgTable(
  'ip_votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ipHash: varchar('ip_hash', { length: 64 }).notNull(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    voteType: voteType('vote_type').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('ip_votes_hash_submission_idx').on(table.ipHash, table.submissionId),
    index('idx_ip_votes_submission').on(table.submissionId),
  ]
);

// ─── Criteria Votes (multi-axis evaluation) ────────────────────────
export const criterionKey = pgEnum('criterion_key', ['proportional', 'legitimate', 'alternative']);

export const criteriaVotes = pgTable(
  'criteria_votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    criterion: criterionKey('criterion').notNull(),
    value: boolean('value').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('criteria_votes_user_submission_criterion_idx').on(
      table.userId,
      table.submissionId,
      table.criterion,
    ),
    index('idx_criteria_votes_submission').on(table.submissionId),
  ],
);

export const ipCriteriaVotes = pgTable(
  'ip_criteria_votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ipHash: varchar('ip_hash', { length: 64 }).notNull(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    criterion: criterionKey('criterion').notNull(),
    value: boolean('value').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('ip_criteria_votes_hash_submission_criterion_idx').on(
      table.ipHash,
      table.submissionId,
      table.criterion,
    ),
    index('idx_ip_criteria_votes_submission').on(table.submissionId),
  ],
);

// ─── 4-Position Votes (v2: Authenticated) ────────────────────────
export const fourPositionVotes = pgTable(
  'four_position_votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    position: votingPosition('position').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('four_pos_votes_user_submission_idx').on(
      table.userId,
      table.submissionId,
    ),
    index('idx_four_pos_votes_submission').on(table.submissionId),
  ],
);

// ─── 4-Position IP Votes (v2: Anonymous) ─────────────────────────
export const ipFourPositionVotes = pgTable(
  'ip_four_position_votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ipHash: varchar('ip_hash', { length: 64 }).notNull(),
    salt: varchar('salt', { length: 64 }).notNull(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    position: votingPosition('position').notNull(),
    isMigrated: boolean('is_migrated').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('ip_four_pos_votes_hash_submission_idx').on(
      table.ipHash,
      table.submissionId,
    ),
    index('idx_ip_four_pos_votes_submission').on(table.submissionId),
  ],
);

// ─── Solutions ──────────────────────────────────────────────────────
export const solutions = pgTable(
  'solutions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    authorDisplay: varchar('author_display', { length: 100 }).notNull().default('Citoyen Anonyme'),
    body: text('body').notNull(),
    upvoteCount: integer('upvote_count').notNull().default(0),
    downvoteCount: integer('downvote_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    index('idx_solutions_submission').on(table.submissionId),
  ]
);

// ─── Solution Votes ─────────────────────────────────────────────────
export const solutionVotes = pgTable(
  'solution_votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    solutionId: uuid('solution_id')
      .notNull()
      .references(() => solutions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    ipHash: varchar('ip_hash', { length: 64 }),
    voteType: voteType('vote_type').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('solution_votes_user_idx').on(table.userId, table.solutionId),
    uniqueIndex('solution_votes_ip_idx').on(table.ipHash, table.solutionId),
    index('idx_solution_votes_solution').on(table.solutionId),
  ]
);

// ─── Arguments (Pour / Contre) ──────────────────────────────────────
export const submissionArguments = pgTable(
  'submission_arguments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    authorDisplay: varchar('author_display', { length: 100 }).notNull().default('Citoyen Anonyme'),
    type: argumentType('type').notNull(),
    body: text('body').notNull(),
    upvoteCount: integer('upvote_count').notNull().default(0),
    downvoteCount: integer('downvote_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    index('idx_arguments_submission').on(table.submissionId),
    index('idx_arguments_type').on(table.submissionId, table.type),
  ],
);

export const argumentVotes = pgTable(
  'argument_votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    argumentId: uuid('argument_id')
      .notNull()
      .references(() => submissionArguments.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    ipHash: varchar('ip_hash', { length: 64 }),
    voteType: voteType('vote_type').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('argument_votes_user_idx').on(table.userId, table.argumentId),
    uniqueIndex('argument_votes_ip_idx').on(table.ipHash, table.argumentId),
    index('idx_argument_votes_argument').on(table.argumentId),
  ],
);

// ─── Comments ───────────────────────────────────────────────────────
export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    authorDisplay: varchar('author_display', { length: 100 }).notNull().default('Anonyme'),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    parentCommentId: uuid('parent_comment_id'),
    solutionId: uuid('solution_id').references(() => solutions.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    depth: integer('depth').notNull().default(0),
    upvoteCount: integer('upvote_count').notNull().default(0),
    downvoteCount: integer('downvote_count').notNull().default(0),
    score: integer('score').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [index('idx_comments_solution').on(table.solutionId)],
);

// ─── Relations ──────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(submissions),
  votes: many(votes),
  comments: many(comments),
  accounts: many(accounts),
  sessions: many(sessions),
  xpEvents: many(xpEvents),
  badges: many(userBadges),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  author: one(users, {
    fields: [submissions.authorId],
    references: [users.id],
  }),
  votes: many(votes),
  ipVotes: many(ipVotes),
  criteriaVotes: many(criteriaVotes),
  ipCriteriaVotes: many(ipCriteriaVotes),
  fourPositionVotes: many(fourPositionVotes),
  ipFourPositionVotes: many(ipFourPositionVotes),
  comments: many(comments),
  solutions: many(solutions),
  sources: many(submissionSources),
  communityNotes: many(communityNotes),
  communityValidations: many(communityValidations),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  submission: one(submissions, {
    fields: [votes.submissionId],
    references: [submissions.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  submission: one(submissions, {
    fields: [comments.submissionId],
    references: [submissions.id],
  }),
  solution: one(solutions, {
    fields: [comments.solutionId],
    references: [solutions.id],
  }),
  commentVotes: many(commentVotes),
}));

export const ipVotesRelations = relations(ipVotes, ({ one }) => ({
  submission: one(submissions, {
    fields: [ipVotes.submissionId],
    references: [submissions.id],
  }),
}));

export const criteriaVotesRelations = relations(criteriaVotes, ({ one }) => ({
  user: one(users, {
    fields: [criteriaVotes.userId],
    references: [users.id],
  }),
  submission: one(submissions, {
    fields: [criteriaVotes.submissionId],
    references: [submissions.id],
  }),
}));

export const ipCriteriaVotesRelations = relations(ipCriteriaVotes, ({ one }) => ({
  submission: one(submissions, {
    fields: [ipCriteriaVotes.submissionId],
    references: [submissions.id],
  }),
}));

export const fourPositionVotesRelations = relations(fourPositionVotes, ({ one }) => ({
  user: one(users, {
    fields: [fourPositionVotes.userId],
    references: [users.id],
  }),
  submission: one(submissions, {
    fields: [fourPositionVotes.submissionId],
    references: [submissions.id],
  }),
}));

export const ipFourPositionVotesRelations = relations(ipFourPositionVotes, ({ one }) => ({
  submission: one(submissions, {
    fields: [ipFourPositionVotes.submissionId],
    references: [submissions.id],
  }),
}));

export const solutionsRelations = relations(solutions, ({ one, many }) => ({
  submission: one(submissions, {
    fields: [solutions.submissionId],
    references: [submissions.id],
  }),
  author: one(users, {
    fields: [solutions.authorId],
    references: [users.id],
  }),
  solutionVotes: many(solutionVotes),
  adjustments: many(comments),
}));

export const solutionVotesRelations = relations(solutionVotes, ({ one }) => ({
  solution: one(solutions, {
    fields: [solutionVotes.solutionId],
    references: [solutions.id],
  }),
  user: one(users, {
    fields: [solutionVotes.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// ─── Cost Calculations ─────────────────────────────────────────────
export const costCalculations = pgTable(
  'cost_calculations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' })
      .unique(),
    amountEur: decimal('amount_eur', { precision: 15, scale: 2 }).notNull(),
    costPerCitizen: decimal('cost_per_citizen', { precision: 20, scale: 6 }),
    costPerTaxpayer: decimal('cost_per_taxpayer', { precision: 20, scale: 6 }),
    costPerHousehold: decimal('cost_per_household', { precision: 20, scale: 6 }),
    daysOfWorkEquivalent: decimal('days_of_work_equivalent', {
      precision: 10,
      scale: 4,
    }),
    equivalences: jsonb('equivalences'),
    denominatorsUsed: jsonb('denominators_used'),
    calculatedAt: timestamp('calculated_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_cost_calculations_submission_id').on(table.submissionId),
  ]
);

export const costCalculationsRelations = relations(costCalculations, ({ one }) => ({
  submission: one(submissions, {
    fields: [costCalculations.submissionId],
    references: [submissions.id],
  }),
}));

// ─── Share Events (Epic 4) ──────────────────────────────────────────
export const sharePlatform = pgEnum('share_platform', [
  'twitter',
  'facebook',
  'whatsapp',
  'copy_link',
  'native',
]);

export const shareEvents = pgTable(
  'share_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id),
    platform: sharePlatform('platform').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_share_events_submission_created').on(
      table.submissionId,
      table.createdAt
    ),
  ]
);

// ─── Page Views (Epic 4) ────────────────────────────────────────────
export const pageViews = pgTable(
  'page_views',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pagePath: varchar('page_path', { length: 500 }).notNull(),
    utmSource: varchar('utm_source', { length: 100 }),
    utmMedium: varchar('utm_medium', { length: 100 }),
    utmCampaign: varchar('utm_campaign', { length: 100 }),
    referrer: varchar('referrer', { length: 500 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_page_views_path_created').on(table.pagePath, table.createdAt),
  ]
);

// ─── Comment Votes (Epic 5) ─────────────────────────────────────────
export const commentVoteDirection = pgEnum('comment_vote_direction', [
  'up',
  'down',
]);

export const commentVotes = pgTable(
  'comment_votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    commentId: uuid('comment_id')
      .notNull()
      .references(() => comments.id, { onDelete: 'cascade' }),
    direction: commentVoteDirection('direction').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_comment_votes_user_comment').on(
      table.userId,
      table.commentId
    ),
  ]
);

// ─── Moderation Actions (Epic 6) ────────────────────────────────────
export const moderationActionType = pgEnum('moderation_action_type', [
  'approve',
  'reject',
  'request_edit',
  'remove',
]);

export const moderationActions = pgTable(
  'moderation_actions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id),
    adminUserId: uuid('admin_user_id')
      .notNull()
      .references(() => users.id),
    action: moderationActionType('action').notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_moderation_actions_submission').on(table.submissionId),
  ]
);

// ─── Flags (Epic 6) ─────────────────────────────────────────────────
export const flagReason = pgEnum('flag_reason', [
  'inaccurate',
  'spam',
  'inappropriate',
]);

export const flags = pgTable(
  'flags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    reason: flagReason('reason').notNull(),
    details: text('details'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_flags_user_submission').on(
      table.userId,
      table.submissionId
    ),
    index('idx_flags_submission_id').on(table.submissionId),
  ]
);

// ─── Broadcasts (Epic 6) ────────────────────────────────────────────
export const broadcastStatus = pgEnum('broadcast_status', [
  'draft',
  'sent',
  'failed',
]);

export const broadcasts = pgTable(
  'broadcasts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id),
    adminUserId: uuid('admin_user_id')
      .notNull()
      .references(() => users.id),
    tweetText: text('tweet_text').notNull(),
    tweetUrl: text('tweet_url'),
    status: broadcastStatus('status').notNull().default('draft'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    sentAt: timestamp('sent_at'),
  },
  (table) => [
    index('idx_broadcasts_submission').on(table.submissionId),
    index('idx_broadcasts_status').on(table.status, table.sentAt),
  ]
);

// ─── Source Types ───────────────────────────────────────────────────
export const sourceType = pgEnum('source_type', [
  'official_report',
  'press_article',
  'think_tank',
  'parliamentary',
  'other',
]);

// ─── Submission Sources ─────────────────────────────────────────────
export const submissionSources = pgTable(
  'submission_sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    title: varchar('title', { length: 300 }).notNull(),
    sourceType: sourceType('source_type').notNull().default('other'),
    addedBy: uuid('added_by').references(() => users.id, { onDelete: 'set null' }),
    ipHash: varchar('ip_hash', { length: 64 }),
    validationCount: integer('validation_count').notNull().default(0),
    invalidationCount: integer('invalidation_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_submission_sources_submission').on(table.submissionId),
    uniqueIndex('idx_submission_sources_url_submission').on(table.submissionId, table.url),
  ]
);

// ─── Source Validations ─────────────────────────────────────────────
export const sourceValidations = pgTable(
  'source_validations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => submissionSources.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    ipHash: varchar('ip_hash', { length: 64 }),
    isValid: integer('is_valid').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_source_validations_user').on(table.userId, table.sourceId),
    uniqueIndex('idx_source_validations_ip').on(table.ipHash, table.sourceId),
    index('idx_source_validations_source').on(table.sourceId),
  ]
);

// ─── Community Notes ────────────────────────────────────────────────
export const communityNotes = pgTable(
  'community_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    authorDisplay: varchar('author_display', { length: 100 }).notNull().default('Citoyen Anonyme'),
    body: text('body').notNull(),
    sourceUrl: text('source_url'),
    upvoteCount: integer('upvote_count').notNull().default(0),
    downvoteCount: integer('downvote_count').notNull().default(0),
    isPinned: integer('is_pinned').notNull().default(0),
    pinnedAt: timestamp('pinned_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    index('idx_community_notes_submission').on(table.submissionId),
    index('idx_community_notes_pinned').on(table.submissionId, table.isPinned),
  ]
);

// ─── Community Note Votes ───────────────────────────────────────────
export const communityNoteVotes = pgTable(
  'community_note_votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    noteId: uuid('note_id')
      .notNull()
      .references(() => communityNotes.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    ipHash: varchar('ip_hash', { length: 64 }),
    isUseful: integer('is_useful').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_community_note_votes_user').on(table.userId, table.noteId),
    uniqueIndex('idx_community_note_votes_ip').on(table.ipHash, table.noteId),
    index('idx_community_note_votes_note').on(table.noteId),
  ]
);

// ─── Feature Votes (Epic 7) ─────────────────────────────────────────
export const featureVotes = pgTable(
  'feature_votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    category: varchar('category', { length: 50 }).notNull().default('general'),
    status: varchar('status', { length: 50 }).notNull().default('proposed'),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id),
    voteCount: integer('vote_count').notNull().default(0),
    rejectionReason: text('rejection_reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_feature_votes_vote_count').on(table.voteCount),
    index('idx_feature_votes_status').on(table.status),
  ]
);

// ─── Feature Vote Ballots (Epic 7) ──────────────────────────────────
export const featureVoteBallots = pgTable(
  'feature_vote_ballots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    featureVoteId: uuid('feature_vote_id')
      .notNull()
      .references(() => featureVotes.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    voteValue: integer('vote_value').notNull().default(1),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_feature_vote_ballots_user_feature').on(
      table.featureVoteId,
      table.userId
    ),
    index('idx_feature_vote_ballots_feature_id').on(table.featureVoteId),
  ]
);

// ─── Source & Community Note Relations ───────────────────────────────
export const submissionSourcesRelations = relations(submissionSources, ({ one, many }) => ({
  submission: one(submissions, {
    fields: [submissionSources.submissionId],
    references: [submissions.id],
  }),
  addedByUser: one(users, {
    fields: [submissionSources.addedBy],
    references: [users.id],
  }),
  validations: many(sourceValidations),
}));

export const sourceValidationsRelations = relations(sourceValidations, ({ one }) => ({
  source: one(submissionSources, {
    fields: [sourceValidations.sourceId],
    references: [submissionSources.id],
  }),
  user: one(users, {
    fields: [sourceValidations.userId],
    references: [users.id],
  }),
}));

export const communityNotesRelations = relations(communityNotes, ({ one, many }) => ({
  submission: one(submissions, {
    fields: [communityNotes.submissionId],
    references: [submissions.id],
  }),
  author: one(users, {
    fields: [communityNotes.authorId],
    references: [users.id],
  }),
  noteVotes: many(communityNoteVotes),
}));

export const communityNoteVotesRelations = relations(communityNoteVotes, ({ one }) => ({
  note: one(communityNotes, {
    fields: [communityNoteVotes.noteId],
    references: [communityNotes.id],
  }),
  user: one(users, {
    fields: [communityNoteVotes.userId],
    references: [users.id],
  }),
}));

// ─── Additional Relations ───────────────────────────────────────────
export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
  comment: one(comments, {
    fields: [commentVotes.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentVotes.userId],
    references: [users.id],
  }),
}));

export const moderationActionsRelations = relations(moderationActions, ({ one }) => ({
  submission: one(submissions, {
    fields: [moderationActions.submissionId],
    references: [submissions.id],
  }),
  admin: one(users, {
    fields: [moderationActions.adminUserId],
    references: [users.id],
  }),
}));

export const flagsRelations = relations(flags, ({ one }) => ({
  submission: one(submissions, {
    fields: [flags.submissionId],
    references: [submissions.id],
  }),
  user: one(users, {
    fields: [flags.userId],
    references: [users.id],
  }),
}));

export const broadcastsRelations = relations(broadcasts, ({ one }) => ({
  submission: one(submissions, {
    fields: [broadcasts.submissionId],
    references: [submissions.id],
  }),
  admin: one(users, {
    fields: [broadcasts.adminUserId],
    references: [users.id],
  }),
}));

export const featureVotesRelations = relations(featureVotes, ({ one, many }) => ({
  author: one(users, {
    fields: [featureVotes.authorId],
    references: [users.id],
  }),
  ballots: many(featureVoteBallots),
}));

export const featureVoteBallotsRelations = relations(featureVoteBallots, ({ one }) => ({
  featureVote: one(featureVotes, {
    fields: [featureVoteBallots.featureVoteId],
    references: [featureVotes.id],
  }),
  user: one(users, {
    fields: [featureVoteBallots.userId],
    references: [users.id],
  }),
}));

// ─── Gamification: XP Events ────────────────────────────────────────
export const xpActionType = pgEnum('xp_action_type', [
  'submission_published',
  'source_added',
  'cross_reference_bonus',
  'source_validated',
  'vote_cast',
  'upvote_received',
  'comment_posted',
  'comment_upvoted',
  'community_note_written',
  'community_note_pinned',
  'solution_proposed',
  'solution_upvoted',
  'share',
  'moderation_action',
  'price_correction',
  'daily_bonus',
  'oauth_linked',
  'github_pr_opened',
  'github_pr_merged',
  'github_issue_opened',
  'admin_manual',
  'clawback',
  'criteria_vote',
  'argument_proposed',
  'argument_upvoted',
]);

export const xpEvents = pgTable(
  'xp_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    actionType: xpActionType('action_type').notNull(),
    xpAmount: integer('xp_amount').notNull(),
    relatedEntityId: uuid('related_entity_id'),
    relatedEntityType: varchar('related_entity_type', { length: 50 }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_xp_events_user_id').on(table.userId),
    index('idx_xp_events_user_action_entity').on(table.userId, table.actionType, table.relatedEntityId),
    index('idx_xp_events_created_at').on(table.createdAt),
  ]
);

export const xpEventsRelations = relations(xpEvents, ({ one }) => ({
  user: one(users, {
    fields: [xpEvents.userId],
    references: [users.id],
  }),
}));

// ─── Gamification: Badge Definitions ────────────────────────────────
export const badgeCategory = pgEnum('badge_category', [
  'streak',
  'contribution',
  'quality',
  'social',
  'moderation',
  'code',
  'special',
]);

export const badgeDefinitions = pgTable('badge_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description').notNull(),
  category: badgeCategory('category').notNull(),
  criteria: jsonb('criteria').notNull(),
  iconUrl: varchar('icon_url', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const userBadges = pgTable(
  'user_badges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    badgeDefinitionId: uuid('badge_definition_id')
      .notNull()
      .references(() => badgeDefinitions.id, { onDelete: 'cascade' }),
    earnedAt: timestamp('earned_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_user_badges_unique').on(table.userId, table.badgeDefinitionId),
    index('idx_user_badges_user').on(table.userId),
  ]
);

export const badgeDefinitionsRelations = relations(badgeDefinitions, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badgeDefinitions, {
    fields: [userBadges.badgeDefinitionId],
    references: [badgeDefinitions.id],
  }),
}));

// ─── Anti-Gaming Events ─────────────────────────────────────────────
export const antiGamingEventType = pgEnum('anti_gaming_event_type', [
  'excessive_votes',
  'rapid_same_target',
  'daily_outlier',
  'reciprocal_decay',
  'session_cooldown',
]);

export const antiGamingEvents = pgTable(
  'anti_gaming_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    eventType: antiGamingEventType('event_type').notNull(),
    details: jsonb('details'),
    actionTaken: varchar('action_taken', { length: 100 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_anti_gaming_events_user').on(table.userId),
    index('idx_anti_gaming_events_type').on(table.eventType, table.createdAt),
  ],
);

export const antiGamingEventsRelations = relations(antiGamingEvents, ({ one }) => ({
  user: one(users, {
    fields: [antiGamingEvents.userId],
    references: [users.id],
  }),
}));

// ─── Community Validations ─────────────────────────────────────────
export const validationVerdict = pgEnum('validation_verdict', ['approve', 'reject']);

export const communityValidations = pgTable(
  'community_validations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    verdict: validationVerdict('verdict').notNull(),
    weight: integer('weight').notNull().default(1),
    reason: text('reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_community_validations_user_submission').on(table.userId, table.submissionId),
    index('idx_community_validations_submission').on(table.submissionId),
  ],
);

export const communityValidationsRelations = relations(communityValidations, ({ one }) => ({
  submission: one(submissions, {
    fields: [communityValidations.submissionId],
    references: [submissions.id],
  }),
  user: one(users, {
    fields: [communityValidations.userId],
    references: [users.id],
  }),
}));

// ─── AI Context (scaffolding) ─────────────────────────────────────
export const aiContexts = pgTable('ai_contexts', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id')
    .notNull()
    .references(() => submissions.id, { onDelete: 'cascade' })
    .unique(),
  budgetContext: text('budget_context'),
  costComparison: text('cost_comparison'),
  relatedFacts: jsonb('related_facts').$type<string[]>(),
  summary: text('summary'),
  voteSummary: text('vote_summary'),
  solutionSummary: text('solution_summary'),
  source: aiContextSource('source').notNull().default('template'),
  status: aiContextStatus('status').notNull().default('draft'),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const aiContextsRelations = relations(aiContexts, ({ one }) => ({
  submission: one(submissions, {
    fields: [aiContexts.submissionId],
    references: [submissions.id],
  }),
  approver: one(users, {
    fields: [aiContexts.approvedBy],
    references: [users.id],
  }),
}));

// ─── Notifications ────────────────────────────────────────────────
export const notificationType = pgEnum('notification_type', [
  'submission_approved',
  'submission_rejected',
  'submission_flagged',
  'vote_milestone',
  'comment_reply',
  'level_up',
  'badge_earned',
  'streak_warning',
  'streak_milestone',
  'community_note_pinned',
  'solution_added',
  'weekly_digest',
  'admin_broadcast',
]);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: notificationType('type').notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    body: text('body'),
    data: jsonb('data').$type<Record<string, unknown>>(),
    actionUrl: varchar('action_url', { length: 500 }),
    read: boolean('read').notNull().default(false),
    emailSent: boolean('email_sent').notNull().default(false),
    pushSent: boolean('push_sent').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_notifications_user_read').on(table.userId, table.read, table.createdAt),
    index('idx_notifications_user_type').on(table.userId, table.type, table.createdAt),
  ],
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  emailEnabled: boolean('email_enabled').notNull().default(true),
  pushEnabled: boolean('push_enabled').notNull().default(false),
  emailModeration: boolean('email_moderation').notNull().default(true),
  emailStreaks: boolean('email_streaks').notNull().default(true),
  emailDigest: boolean('email_digest').notNull().default(true),
  emailMilestones: boolean('email_milestones').notNull().default(true),
  emailCommunity: boolean('email_community').notNull().default(false),
  pushStreaks: boolean('push_streaks').notNull().default(false),
  pushModeration: boolean('push_moderation').notNull().default(false),
  pushCommunity: boolean('push_community').notNull().default(false),
  quietHoursStart: varchar('quiet_hours_start', { length: 5 }).notNull().default('22:00'),
  quietHoursEnd: varchar('quiet_hours_end', { length: 5 }).notNull().default('08:00'),
  digestDay: varchar('digest_day', { length: 10 }).notNull().default('monday'),
  unsubscribeToken: varchar('unsubscribe_token', { length: 64 }).notNull().unique(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    userAgent: varchar('user_agent', { length: 500 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_push_subscriptions_user_endpoint').on(table.userId, table.endpoint),
    index('idx_push_subscriptions_user').on(table.userId),
  ],
);

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));

// ─── Data Imports (Open Data tracking) ────────────────────────────
export const dataImports = pgTable('data_imports', {
  id: uuid('id').primaryKey().defaultRandom(),
  source: importSourceEnum('source').notNull(),
  status: importStatusEnum('status').notNull().default('running'),
  recordsFetched: integer('records_fetched').notNull().default(0),
  recordsInserted: integer('records_inserted').notNull().default(0),
  recordsSkipped: integer('records_skipped').notNull().default(0),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

// ─── Type Exports ──────────────────────────────────────────────────
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type CostCalculation = typeof costCalculations.$inferSelect;
export type NewCostCalculation = typeof costCalculations.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type CommentVote = typeof commentVotes.$inferSelect;
export type ShareEvent = typeof shareEvents.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
export type ModerationAction = typeof moderationActions.$inferSelect;
export type Flag = typeof flags.$inferSelect;
export type Broadcast = typeof broadcasts.$inferSelect;
export type FeatureVote = typeof featureVotes.$inferSelect;
export type FeatureVoteBallot = typeof featureVoteBallots.$inferSelect;
export type IpVote = typeof ipVotes.$inferSelect;
export type NewIpVote = typeof ipVotes.$inferInsert;
export type Solution = typeof solutions.$inferSelect;
export type NewSolution = typeof solutions.$inferInsert;
export type AiContext = typeof aiContexts.$inferSelect;
export type SubmissionArgument = typeof submissionArguments.$inferSelect;
export type ArgumentVote = typeof argumentVotes.$inferSelect;
export type SolutionVote = typeof solutionVotes.$inferSelect;
export type NewSolutionVote = typeof solutionVotes.$inferInsert;
export type SubmissionSource = typeof submissionSources.$inferSelect;
export type NewSubmissionSource = typeof submissionSources.$inferInsert;
export type SourceValidation = typeof sourceValidations.$inferSelect;
export type CommunityNote = typeof communityNotes.$inferSelect;
export type NewCommunityNote = typeof communityNotes.$inferInsert;
export type CommunityNoteVote = typeof communityNoteVotes.$inferSelect;
export type XpEvent = typeof xpEvents.$inferSelect;
export type NewXpEvent = typeof xpEvents.$inferInsert;
export type BadgeDefinition = typeof badgeDefinitions.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type AntiGamingEvent = typeof antiGamingEvents.$inferSelect;
export type CommunityValidation = typeof communityValidations.$inferSelect;
export type NewCommunityValidation = typeof communityValidations.$inferInsert;
export type DataImport = typeof dataImports.$inferSelect;
export type NewDataImport = typeof dataImports.$inferInsert;
export type CriteriaVote = typeof criteriaVotes.$inferSelect;
export type NewCriteriaVote = typeof criteriaVotes.$inferInsert;
export type IpCriteriaVote = typeof ipCriteriaVotes.$inferSelect;
export type NewIpCriteriaVote = typeof ipCriteriaVotes.$inferInsert;
export type FourPositionVote = typeof fourPositionVotes.$inferSelect;
export type NewFourPositionVote = typeof fourPositionVotes.$inferInsert;
export type IpFourPositionVote = typeof ipFourPositionVotes.$inferSelect;
export type NewIpFourPositionVote = typeof ipFourPositionVotes.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
