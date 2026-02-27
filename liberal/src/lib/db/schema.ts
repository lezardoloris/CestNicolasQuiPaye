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
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  submissionCount: integer('submission_count').notNull().default(0),
  karmaScore: integer('karma_score').notNull().default(0),
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
});

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
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('votes_user_submission_idx').on(table.userId, table.submissionId)],
);

// ─── Comments ───────────────────────────────────────────────────────
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  authorDisplay: varchar('author_display', { length: 100 }).notNull().default('Anonyme'),
  submissionId: uuid('submission_id')
    .notNull()
    .references(() => submissions.id, { onDelete: 'cascade' }),
  parentCommentId: uuid('parent_comment_id'),
  body: text('body').notNull(),
  depth: integer('depth').notNull().default(0),
  upvoteCount: integer('upvote_count').notNull().default(0),
  downvoteCount: integer('downvote_count').notNull().default(0),
  score: integer('score').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── Relations ──────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(submissions),
  votes: many(votes),
  comments: many(comments),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  author: one(users, {
    fields: [submissions.authorId],
    references: [users.id],
  }),
  votes: many(votes),
  comments: many(comments),
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
  commentVotes: many(commentVotes),
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
