---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
inputDocuments:
  - prd.md
  - ux-design-specification.md
  - product-brief-LIBÉRAL-2026-02-27.md
  - research/domain-french-public-finance-research-2026-02-27.md
  - research/market-fiscal-transparency-research-2026-02-27.md
  - research/technical-open-data-stack-research-2026-02-27.md
workflowType: 'architecture'
project_name: 'LIBÉRAL'
user_name: 'Tirakninepeiijub'
date: '2026-02-27'
---

# Architecture Decision Document -- LIBERAL

_Complete architecture specification for the LIBERAL fiscal accountability platform. This document is the single source of truth for all implementation decisions._

---

## Technology Version Manifest

All versions locked as of 2026-02-27. Every dependency used in the project MUST match or exceed these minimum versions.

| Technology | Version | Role |
|---|---|---|
| Node.js | 24.13.1 LTS (Krypton) | Runtime |
| Next.js | 16.1.6 | Frontend framework (App Router) |
| React | 19.x (bundled with Next.js 16) | UI library |
| TypeScript | 5.7.x | Type safety |
| Python | 3.14.3 | Cost engine runtime |
| FastAPI | 0.133.1 | Cost engine web framework |
| PostgreSQL | 17.9 | Primary database |
| Drizzle ORM | 0.45.1 | TypeScript ORM (SQL-first) |
| drizzle-kit | 0.30.x | Migration tooling |
| Tailwind CSS | 4.2.0 | Utility-first CSS |
| shadcn/ui | 2026-02 (CLI 3.0) | Component primitives |
| Auth.js (NextAuth v5) | 5.x | Authentication |
| Zustand | 5.0.11 | Client state management |
| TanStack Query | 5.90.x | Server state management |
| Motion (Framer Motion) | 12.34.x | Animation library |
| Vitest | 4.0.18 | Test runner |
| Upstash Redis | @upstash/redis 1.36.x | Serverless Redis (caching, rate limiting) |
| Zod | 3.x | Schema validation |
| ECharts | 5.x | Data visualization (Phase 2) |
| Meilisearch | 1.x | Full-text search (Phase 2) |

---

## Section 1: Project Context Analysis

### 1.1 Requirements Overview

#### Functional Requirements Summary (FR1--FR35)

The 35 functional requirements decompose into the following architectural domains:

**Identity & Access (FR1--FR4, FR34)**
- FR1: User registration (email + password)
- FR2: User login / logout with session management
- FR3: Twitter/X OAuth linking for share-to-tweet functionality
- FR4: User profile page (submissions, vote history, badges)
- FR34: Notification system (in-app + optional email digest)

**Submission Lifecycle (FR5--FR9, FR26--FR28)**
- FR5: Submit government waste (title, description, source URL, amount, ministry tag)
- FR6: Auto-calculate "Cost to Nicolas" on submission
- FR7: Edit/delete own submissions (within 15-minute window)
- FR8: Submission detail page with full consequence breakdown
- FR9: OG image generation for social sharing
- FR26: Submission flagging by community
- FR27: Duplicate detection (fuzzy title matching)
- FR28: Source URL validation (check domain is official .gouv.fr or media)

**Voting System (FR10--FR13)**
- FR10: Upvote / downvote on submissions
- FR11: Optimistic UI for vote feedback (<100ms perceived)
- FR12: Vote count caching with eventual consistency
- FR13: One vote per user per submission (idempotent)

**Feed & Discovery (FR14--FR18)**
- FR14: Hot feed (score decay algorithm)
- FR15: New feed (chronological)
- FR16: Top feed (by time window: day, week, month, all-time)
- FR17: Infinite scroll with cursor-based pagination
- FR18: Trending submissions sidebar / section

**Comments (FR19--FR22)**
- FR19: Comment on submissions (text, max 2000 chars)
- FR20: Threaded replies (max 2 nesting levels on mobile, 4 on desktop)
- FR21: Upvote comments
- FR22: Sort comments by best / newest

**Cost to Nicolas Engine (FR23--FR25)**
- FR23: Calculate per-taxpayer cost from total government expenditure
- FR24: Display consequence equivalences (e.g., "3.2 baguettes" or "0.7 hours of median wage")
- FR25: Refresh base data monthly from official sources (INSEE, data.gouv.fr)

**Sharing & Virality (FR29--FR31)**
- FR29: Generate share card image (submission title, cost, consequence)
- FR30: One-tap share to Twitter/X with pre-filled text + image
- FR31: @LIBERAL_FR bot broadcast of top submissions (admin-triggered)

**Moderation & Admin (FR32--FR33, FR35)**
- FR32: Moderation queue for flagged content
- FR33: Admin dashboard (user management, content moderation, broadcast tool)
- FR35: Community feature voting (meta-feature for roadmap prioritization)

#### Non-Functional Requirements Summary (23 NFRs)

**Performance (NFR1--NFR5)**
- NFR1: Page load < 2 seconds (LCP) on 4G mobile
- NFR2: Vote interaction response < 100ms (optimistic UI)
- NFR3: Cost to Nicolas calculation < 500ms
- NFR4: Support 10,000 concurrent users
- NFR5: Feed page Time to Interactive < 3 seconds

**Accessibility (NFR6--NFR7)**
- NFR6: RGAA AA compliance (French accessibility standard, equivalent to WCAG 2.1 AA)
- NFR7: Full keyboard navigation, screen reader support, focus management

**Legal & Compliance (NFR8--NFR12)**
- NFR8: RGPD/GDPR compliance (consent, data export, right to erasure)
- NFR9: CADA compliance (Commission d'acces aux documents administratifs)
- NFR10: French/EU data hosting (Scaleway Paris DC, no US data transfer)
- NFR11: Cookie consent banner (CNIL requirements)
- NFR12: Privacy-first analytics (no Google Analytics; use Plausible or Umami)

**Security (NFR13--NFR17)**
- NFR13: Rate limiting (submissions, votes, comments, API calls)
- NFR14: Content moderation pipeline (auto-flag + human review)
- NFR15: DDoS protection (Cloudflare)
- NFR16: Input sanitization (XSS prevention)
- NFR17: CSRF protection on all mutations

**Operational (NFR18--NFR23)**
- NFR18: Open source under AGPL-3.0
- NFR19: CI/CD pipeline with automated testing
- NFR20: Preview deployments for pull requests
- NFR21: Database backups (daily, 30-day retention)
- NFR22: Structured logging and error tracking
- NFR23: Health check endpoints for monitoring

### 1.2 Scale & Complexity Assessment

**Classification: Medium-High Complexity**

| Dimension | Assessment | Rationale |
|---|---|---|
| User Scale | Medium | 10K concurrent target; viral spikes from Twitter/X |
| Data Complexity | Medium | Relational data with voting aggregations; external data pipeline |
| Computation | Medium | Cost engine with 13+ data sources; score decay algorithm |
| Integration | Medium | Twitter/X OAuth, data.gouv.fr API, OG image generation |
| Regulatory | High | RGPD, CADA, CNIL, French hosting mandate |
| Real-time | Low-Medium | Optimistic voting (client-side), no WebSocket requirement in Phase 1 |

**Risk Factors:**
- Viral traffic spikes from Twitter/X shares (mitigated by ISR + CDN)
- French regulatory compliance (RGPD, CNIL cookie consent)
- Open source governance under AGPL-3.0
- Data pipeline reliability for government open data sources
- Content moderation at scale

### 1.3 Technical Constraints & Dependencies

**Hard Constraints:**
1. All data must be hosted in France or EU (Scaleway Paris DC)
2. AGPL-3.0 license -- all server-side code must be source-available
3. French language primary (i18n support for future expansion)
4. No proprietary analytics (CNIL compliance)
5. Mobile-first design (70%+ traffic from social referrals)

**External Dependencies:**
1. data.gouv.fr -- French open data platform (primary fiscal data)
2. INSEE -- National statistics (population, taxpayer count, median wage)
3. budget.gouv.fr -- Budget execution data
4. Eurostat -- EU-level comparative data (Phase 2)
5. OECD -- International benchmarks (Phase 2)
6. Twitter/X API v2 -- OAuth + tweet posting

**Technology Constraints:**
1. Next.js App Router mandated (Server Components for SEO, ISR for performance)
2. Python FastAPI for cost engine only (data science ecosystem, pandas/numpy)
3. PostgreSQL for ACID compliance on vote counting and financial data
4. Redis for cache layer (vote counts, rate limiting, session data)

### 1.4 Cross-Cutting Concerns

| Concern | Strategy | Implementation |
|---|---|---|
| Authentication | Auth.js v5 with JWT | httpOnly cookies, CSRF tokens |
| Authorization | Role-based (anon/user/mod/admin) | Middleware + route guards |
| Logging | Structured JSON logs | Pino (Next.js), structlog (Python) |
| Error Handling | Error boundaries + API error codes | Per-route-segment error.tsx |
| Internationalization | French-first, i18n-ready | next-intl (Phase 2) |
| Caching | Multi-layer (ISR + Redis + HTTP) | Cloudflare CDN + Upstash Redis |
| Rate Limiting | Token bucket per user/IP | Upstash Ratelimit |
| Monitoring | Health checks + error tracking | Sentry (self-hosted or EU instance) |
| Testing | Unit + Integration + E2E | Vitest + Playwright |
| CI/CD | Automated pipeline | GitHub Actions |

---

## Section 2: Starter Template Evaluation

### 2.1 Primary Technology Domain

**Domain:** Full-stack Next.js application with Python microservice

The application is a server-rendered React application with API routes, making Next.js with App Router the natural primary framework. The Python FastAPI microservice is scoped exclusively to the Cost to Nicolas calculation engine and data pipeline.

### 2.2 Recommended Starter: `create-next-app`

**CLI Command:**

```bash
npx create-next-app@latest liberal --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Flags explained:**
- `--typescript`: TypeScript configuration with strict mode
- `--tailwind`: Tailwind CSS v4 with PostCSS configuration
- `--eslint`: ESLint with Next.js recommended rules
- `--app`: App Router (not Pages Router)
- `--src-dir`: Source code under `src/` directory
- `--import-alias "@/*"`: Clean import paths (`@/components/...`)

### 2.3 What the Starter Provides Architecturally

| Provided by Starter | Needs to Be Added |
|---|---|
| Next.js App Router scaffold | Drizzle ORM + PostgreSQL connection |
| TypeScript tsconfig.json | Auth.js v5 configuration |
| Tailwind CSS v4 + PostCSS | shadcn/ui component installation |
| ESLint configuration | Zustand stores |
| `src/app/` directory structure | TanStack Query provider |
| `src/app/layout.tsx` root layout | Motion (Framer Motion) |
| `src/app/page.tsx` home page | Vitest + Playwright test setup |
| `.gitignore` | CI/CD workflows |
| `next.config.ts` | Python FastAPI microservice |
| `public/` directory | Upstash Redis integration |
| `package.json` with scripts | Zod validation schemas |
| Turbopack dev server support | OG image generation |

### 2.4 Post-Scaffold Setup Commands

```bash
# 1. Install shadcn/ui
npx shadcn@latest init --style new-york --base-color neutral --css-variables

# 2. Install core shadcn/ui components
npx shadcn@latest add button input textarea toast dialog dropdown-menu avatar badge tabs skeleton card separator scroll-area

# 3. Install Drizzle ORM + PostgreSQL driver
npm install drizzle-orm postgres
npm install -D drizzle-kit

# 4. Install Auth.js
npm install next-auth@5

# 5. Install state management
npm install zustand @tanstack/react-query

# 6. Install animation
npm install motion

# 7. Install validation
npm install zod

# 8. Install utilities
npm install @upstash/redis @upstash/ratelimit
npm install pino pino-pretty
npm install date-fns

# 9. Install testing
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
npm install -D playwright @playwright/test

# 10. Install dev tools
npm install -D prettier prettier-plugin-tailwindcss
npm install -D @tanstack/react-query-devtools
```

---

## Section 3: Core Architectural Decisions

### 3.1 Data Architecture

#### Decision: PostgreSQL 17.9 + Drizzle ORM 0.45.x

**Why Drizzle over Prisma:**
- Drizzle is SQL-first and lightweight (~7.4KB); Prisma bundles a proprietary Rust query engine (~15MB)
- Drizzle generates standard SQL migrations (better for open source contributors)
- Drizzle has zero runtime dependencies beyond the database driver
- Type inference is derived directly from schema definitions (single source of truth)
- Better alignment with AGPL-3.0 open source philosophy (no proprietary engine)

**Database Driver:** `postgres` (postgres.js -- fastest pure JS PostgreSQL driver)

#### Schema Design

```typescript
// src/lib/db/schema.ts
import { pgTable, text, timestamp, integer, boolean, uuid, varchar, decimal, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRole = pgEnum('user_role', ['user', 'moderator', 'admin']);
export const voteType = pgEnum('vote_type', ['up', 'down']);
export const moderationStatus = pgEnum('moderation_status', ['pending', 'approved', 'rejected', 'flagged']);
export const submissionStatus = pgEnum('submission_status', ['draft', 'published', 'hidden', 'deleted']);

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 30 }).notNull().unique(),
  passwordHash: text('password_hash'),
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

// Submissions
export const submissions = pgTable('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 250 }).notNull(),
  description: text('description').notNull(),
  sourceUrl: text('source_url').notNull(),
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
  ogImageUrl: text('og_image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Votes
export const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id),
  voteType: voteType('vote_type').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
// UNIQUE constraint on (user_id, submission_id) enforced via migration

// Comments
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id),
  parentId: uuid('parent_id').references(() => comments.id),
  body: text('body').notNull(),
  depth: integer('depth').notNull().default(0),
  upvoteCount: integer('upvote_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Comment Votes
export const commentVotes = pgTable('comment_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  commentId: uuid('comment_id').notNull().references(() => comments.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
// UNIQUE constraint on (user_id, comment_id) enforced via migration

// Cost Calculations (cached results from Python engine)
export const costCalculations = pgTable('cost_calculations', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id).unique(),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  taxpayerCount: integer('taxpayer_count').notNull(),
  costPerTaxpayer: decimal('cost_per_taxpayer', { precision: 10, scale: 4 }).notNull(),
  baguetteEquivalent: decimal('baguette_equivalent', { precision: 10, scale: 2 }),
  wageHoursEquivalent: decimal('wage_hours_equivalent', { precision: 10, scale: 4 }),
  smic_hours_equivalent: decimal('smic_hours_equivalent', { precision: 10, scale: 4 }),
  referenceDataVersion: varchar('reference_data_version', { length: 20 }).notNull(),
  calculatedAt: timestamp('calculated_at').notNull().defaultNow(),
});

// Moderation Queue
export const moderationQueue = pgTable('moderation_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').references(() => submissions.id),
  commentId: uuid('comment_id').references(() => comments.id),
  reporterId: uuid('reporter_id').notNull().references(() => users.id),
  reason: text('reason').notNull(),
  moderatorId: uuid('moderator_id').references(() => users.id),
  resolution: varchar('resolution', { length: 50 }),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Feature Votes (community roadmap)
export const featureVotes = pgTable('feature_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  voteCount: integer('vote_count').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('proposed'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Feature Vote Ballots
export const featureVoteBallots = pgTable('feature_vote_ballots', {
  id: uuid('id').primaryKey().defaultRandom(),
  featureVoteId: uuid('feature_vote_id').notNull().references(() => featureVotes.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
// UNIQUE constraint on (feature_vote_id, user_id) enforced via migration

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  body: text('body'),
  referenceId: uuid('reference_id'),
  referenceType: varchar('reference_type', { length: 50 }),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

#### Key Database Indexes

```sql
-- Performance-critical indexes
CREATE INDEX idx_submissions_hot_score ON submissions (hot_score DESC) WHERE status = 'published';
CREATE INDEX idx_submissions_created_at ON submissions (created_at DESC) WHERE status = 'published';
CREATE INDEX idx_submissions_upvote_count ON submissions (upvote_count DESC) WHERE status = 'published';
CREATE INDEX idx_submissions_author_id ON submissions (author_id);
CREATE INDEX idx_submissions_slug ON submissions (slug);

CREATE UNIQUE INDEX idx_votes_user_submission ON votes (user_id, submission_id);
CREATE INDEX idx_votes_submission_id ON votes (submission_id);

CREATE INDEX idx_comments_submission_id ON comments (submission_id, created_at);
CREATE INDEX idx_comments_parent_id ON comments (parent_id);
CREATE UNIQUE INDEX idx_comment_votes_user_comment ON comment_votes (user_id, comment_id);

CREATE INDEX idx_moderation_queue_status ON moderation_queue (resolution) WHERE resolution IS NULL;
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, created_at DESC) WHERE read = false;
```

#### Redis Caching Strategy (Upstash)

| Key Pattern | TTL | Purpose |
|---|---|---|
| `vote:sub:{id}` | 5 min | Cached vote counts for submission |
| `vote:user:{userId}:{subId}` | 1 hour | User's vote on a submission (dedup) |
| `feed:hot:{cursor}` | 60 sec | Hot feed page cache |
| `feed:new:{cursor}` | 30 sec | New feed page cache |
| `feed:top:{window}:{cursor}` | 2 min | Top feed page cache |
| `ratelimit:{userId}:{action}` | varies | Rate limit counters |
| `cost:ref` | 24 hours | Reference data (taxpayer count, median wage) |
| `session:{token}` | 30 days | Session data |

#### ISR (Incremental Static Regeneration) Strategy

| Route | Revalidation | Rationale |
|---|---|---|
| `/feed/hot` | 60 seconds | Balance freshness with performance |
| `/feed/new` | 30 seconds | Needs faster updates for new content |
| `/feed/top` | 120 seconds | Less time-sensitive |
| `/s/[id]/[slug]` | 300 seconds | Submission detail pages |
| `/profile/[username]` | 600 seconds | User profile pages |

### 3.2 Authentication & Security

#### Decision: Auth.js v5 (NextAuth) with Credentials + Twitter/X OAuth

**Configuration:**

```typescript
// src/lib/auth/config.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Twitter from 'next-auth/providers/twitter';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate with Zod, verify bcrypt hash, return user
      },
    }),
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as string;
      session.user.username = token.username as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
});
```

#### Role-Based Access Control

| Role | Permissions |
|---|---|
| `anonymous` | View feed, view submissions, view comments |
| `user` | + Submit, vote, comment, edit own content, flag content |
| `moderator` | + Review moderation queue, hide/approve content, mute users |
| `admin` | + User management, broadcast tool, feature vote admin, system config |

**Implementation:** Middleware checks JWT role claim on protected routes. Server Actions verify role before mutations.

```typescript
// src/middleware.ts
import { auth } from '@/lib/auth/config';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  // Admin routes
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/feed/hot', req.url));
  }

  // Moderation routes
  if (pathname.startsWith('/admin/moderation') && !['moderator', 'admin'].includes(role ?? '')) {
    return NextResponse.redirect(new URL('/feed/hot', req.url));
  }

  // Protected mutations handled by Server Actions (not middleware)
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/submit', '/profile/:path*'],
};
```

#### Rate Limiting

| Action | Limit | Window | Key |
|---|---|---|---|
| Submit waste | 5 per day | 24 hours | `userId` |
| Vote | 100 per hour | 1 hour | `userId` |
| Comment | 20 per hour | 1 hour | `userId` |
| API calls (anon) | 60 per minute | 1 minute | IP address |
| API calls (auth) | 300 per minute | 1 minute | `userId` |
| Registration | 3 per hour | 1 hour | IP address |
| Login attempts | 10 per 15 min | 15 minutes | IP address |

**Implementation:** Upstash Ratelimit with sliding window algorithm.

```typescript
// src/lib/api/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const rateLimiters = {
  submission: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '24h'),
    prefix: 'ratelimit:submission',
  }),
  vote: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1h'),
    prefix: 'ratelimit:vote',
  }),
  comment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1h'),
    prefix: 'ratelimit:comment',
  }),
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1m'),
    prefix: 'ratelimit:api',
  }),
};
```

#### Security Measures

| Measure | Implementation |
|---|---|
| CSRF Protection | SameSite=Lax cookies + CSRF token on Server Actions |
| XSS Prevention | React auto-escaping + DOMPurify for user HTML (comments) |
| SQL Injection | Drizzle ORM parameterized queries (no raw SQL) |
| Password Hashing | bcrypt with cost factor 12 |
| Session Security | httpOnly + Secure + SameSite=Lax cookies |
| Content Security Policy | Strict CSP headers via next.config.ts |
| HTTPS | Enforced at CDN level (Cloudflare) |
| Input Validation | Zod schemas on all API inputs (client + server) |

### 3.3 API & Communication Architecture

#### Decision: Next.js Route Handlers + Python FastAPI Microservice

**Rationale for split architecture:**
- Next.js API Routes handle 90% of CRUD operations (submissions, votes, comments, users, moderation)
- Python FastAPI handles ONLY the Cost to Nicolas engine (data pipeline from government sources, statistical calculations, pandas/numpy for data processing)
- This avoids a full-blown microservice architecture while keeping the data science workload in Python's superior ecosystem

#### API Design Principles

1. **REST with consistent envelope** -- all responses wrapped in `{ data, error, meta }`
2. **Cursor-based pagination** -- no offset pagination (avoids skip-scan performance issues)
3. **Server Actions for mutations** -- votes, comments, submissions use Next.js Server Actions
4. **Route Handlers for reads** -- GET endpoints for feed, search, user profiles
5. **Versioned API** -- `/api/v1/` prefix for all public endpoints

#### API Response Format

**Success Response:**

```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "title": "Renovation du bureau du ministre: 500,000 EUR",
    "costPerTaxpayer": "0.0132",
    "consequence": "0.01 baguettes par contribuable",
    "upvoteCount": 247,
    "downvoteCount": 12
  },
  "error": null,
  "meta": {
    "requestId": "req_abc123"
  }
}
```

**Paginated Response:**

```json
{
  "data": [
    { "id": "...", "title": "...", "hotScore": "42.738" },
    { "id": "...", "title": "...", "hotScore": "41.221" }
  ],
  "error": null,
  "meta": {
    "cursor": "eyJpZCI6ImFiYzEyMyJ9",
    "hasMore": true,
    "totalCount": 1847
  }
}
```

**Error Response:**

```json
{
  "data": null,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Trop de soumissions. Reessayez dans 15 minutes.",
    "details": {
      "retryAfter": 900,
      "limit": 5,
      "remaining": 0
    }
  },
  "meta": {
    "requestId": "req_def456"
  }
}
```

**Standard Error Codes:**

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource (e.g., duplicate vote) |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

#### Response Wrapper Implementation

```typescript
// src/lib/api/response.ts
import { NextResponse } from 'next/server';

type ApiMeta = {
  cursor?: string;
  hasMore?: boolean;
  totalCount?: number;
  requestId?: string;
  page?: number;
  totalPages?: number;
};

type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export function apiSuccess<T>(data: T, meta: ApiMeta = {}, status = 200) {
  return NextResponse.json(
    { data, error: null, meta: { ...meta, requestId: crypto.randomUUID() } },
    { status }
  );
}

export function apiError(code: string, message: string, status: number, details?: Record<string, unknown>) {
  return NextResponse.json(
    {
      data: null,
      error: { code, message, details: details ?? {} } satisfies ApiError,
      meta: { requestId: crypto.randomUUID() },
    },
    { status }
  );
}
```

#### API Endpoint Map

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/submissions` | Public | List submissions (sort, cursor, limit) |
| `POST` | `/api/v1/submissions` | User | Create submission |
| `GET` | `/api/v1/submissions/[id]` | Public | Get submission detail |
| `PATCH` | `/api/v1/submissions/[id]` | Author | Edit submission (within 15 min) |
| `DELETE` | `/api/v1/submissions/[id]` | Author/Admin | Delete submission |
| `POST` | `/api/v1/submissions/[id]/votes` | User | Cast vote (up/down) |
| `DELETE` | `/api/v1/submissions/[id]/votes` | User | Remove vote |
| `GET` | `/api/v1/submissions/[id]/comments` | Public | List comments (threaded) |
| `POST` | `/api/v1/submissions/[id]/comments` | User | Post comment |
| `POST` | `/api/v1/submissions/[id]/flag` | User | Flag submission |
| `GET` | `/api/v1/users/[username]` | Public | Get user profile |
| `GET` | `/api/v1/moderation` | Mod/Admin | Get moderation queue |
| `PATCH` | `/api/v1/moderation/[id]` | Mod/Admin | Resolve moderation item |
| `GET` | `/api/v1/feature-votes` | User | List feature proposals |
| `POST` | `/api/v1/feature-votes` | User | Create feature proposal |
| `POST` | `/api/v1/feature-votes/[id]/vote` | User | Vote on feature proposal |
| `GET` | `/api/og/[id]` | Public | Generate OG share image |

#### Python FastAPI Communication

The Next.js application communicates with the Python Cost Engine via internal HTTP calls. The FastAPI service is not exposed to the public internet.

```typescript
// src/lib/cost-engine/client.ts
const COST_ENGINE_URL = process.env.COST_ENGINE_URL!; // e.g., http://cost-engine:8000

export interface CostCalculationResult {
  totalAmount: number;
  taxpayerCount: number;
  costPerTaxpayer: number;
  baguetteEquivalent: number;
  wageHoursEquivalent: number;
  smicHoursEquivalent: number;
  referenceDataVersion: string;
}

export async function calculateCost(amountEur: number): Promise<CostCalculationResult> {
  const response = await fetch(`${COST_ENGINE_URL}/api/v1/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Internal-Key': process.env.COST_ENGINE_KEY! },
    body: JSON.stringify({ amount: amountEur }),
    signal: AbortSignal.timeout(5000), // 5s timeout
  });

  if (!response.ok) {
    throw new Error(`Cost engine error: ${response.status}`);
  }

  return response.json();
}
```

### 3.4 Frontend Architecture

#### Decision: Next.js App Router with React Server Components

**Component Rendering Strategy:**

| Component | Rendering | Rationale |
|---|---|---|
| Feed pages (`/feed/[sort]`) | RSC + ISR | SEO, fast initial load, cacheable |
| Submission detail (`/s/[id]/[slug]`) | RSC + SSR | SEO, dynamic data, OG meta tags |
| Submit form (`/submit`) | Client Component | Interactive form with validation |
| VoteButton | Client Component | Optimistic UI, instant feedback |
| CommentThread | Client Component | Interactive threading, reply forms |
| SubmissionCard | Mixed (RSC shell + Client voting) | Card layout is static, voting is interactive |
| ConsequenceCard | RSC | Static data display |
| ShareButton | Client Component | Web Share API, clipboard |
| FeedSortTabs | Client Component | URL navigation + active state |
| BottomTabBar | Client Component | Client-side navigation |
| ModerationQueue | Client Component | Real-time moderation actions |
| AdminBroadcast | Client Component | Form with API calls |

#### State Management Architecture

**Three-layer state model:**

1. **Server State (TanStack Query):** Remote data from API -- submissions, comments, user profiles. Handles caching, deduplication, background refetching.

2. **Client State (Zustand):** Ephemeral UI state -- optimistic vote cache, auth state, form drafts. Persists across navigation, cleared on logout.

3. **URL State (Next.js router):** Feed sort, pagination cursor, submission ID. Source of truth for shareable application state.

```typescript
// src/stores/vote-cache.ts
import { create } from 'zustand';

type VoteState = 'up' | 'down' | null;

interface VoteCacheStore {
  votes: Map<string, VoteState>;
  counts: Map<string, { up: number; down: number }>;
  setVote: (submissionId: string, vote: VoteState) => void;
  setCounts: (submissionId: string, up: number, down: number) => void;
  getVote: (submissionId: string) => VoteState;
  getCounts: (submissionId: string) => { up: number; down: number } | undefined;
}

export const useVoteCache = create<VoteCacheStore>((set, get) => ({
  votes: new Map(),
  counts: new Map(),
  setVote: (submissionId, vote) =>
    set((state) => {
      const newVotes = new Map(state.votes);
      newVotes.set(submissionId, vote);
      return { votes: newVotes };
    }),
  setCounts: (submissionId, up, down) =>
    set((state) => {
      const newCounts = new Map(state.counts);
      newCounts.set(submissionId, { up, down });
      return { counts: newCounts };
    }),
  getVote: (submissionId) => get().votes.get(submissionId) ?? null,
  getCounts: (submissionId) => get().counts.get(submissionId),
}));
```

#### Optimistic Voting Pattern

```typescript
// src/hooks/use-vote.ts
'use client';

import { useVoteCache } from '@/stores/vote-cache';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

export function useVote(submissionId: string, serverCounts: { up: number; down: number }) {
  const { setVote, setCounts, getVote, getCounts } = useVoteCache();
  const { isAuthenticated, openAuthGate } = useAuth();

  // Use cache if available, fallback to server data
  const currentVote = getVote(submissionId);
  const counts = getCounts(submissionId) ?? serverCounts;

  const mutation = useMutation({
    mutationFn: async (voteType: 'up' | 'down') => {
      const res = await fetch(`/api/v1/submissions/${submissionId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
      if (!res.ok) throw new Error('Vote failed');
      return res.json();
    },
    onMutate: async (voteType) => {
      // Optimistic update
      const prevVote = currentVote;
      const prevCounts = { ...counts };

      if (prevVote === voteType) {
        // Toggle off
        setVote(submissionId, null);
        setCounts(submissionId, counts.up - (voteType === 'up' ? 1 : 0), counts.down - (voteType === 'down' ? 1 : 0));
      } else {
        // New vote or switch
        setVote(submissionId, voteType);
        let newUp = counts.up;
        let newDown = counts.down;
        if (prevVote === 'up') newUp--;
        if (prevVote === 'down') newDown--;
        if (voteType === 'up') newUp++;
        if (voteType === 'down') newDown++;
        setCounts(submissionId, newUp, newDown);
      }

      return { prevVote, prevCounts };
    },
    onError: (_err, _voteType, context) => {
      // Rollback on error
      if (context) {
        setVote(submissionId, context.prevVote);
        setCounts(submissionId, context.prevCounts.up, context.prevCounts.down);
      }
    },
  });

  const vote = (voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      openAuthGate();
      return;
    }
    mutation.mutate(voteType);
  };

  return { vote, currentVote, counts, isLoading: mutation.isPending };
}
```

#### Typography & Design Tokens

```css
/* src/app/globals.css */
@import 'tailwindcss';

@theme {
  /* Colors */
  --color-chainsaw-red: #DC2626;
  --color-chainsaw-red-hover: #B91C1C;
  --color-chainsaw-red-light: #FEE2E2;
  --color-surface-primary: #0F0F0F;
  --color-surface-secondary: #1A1A1A;
  --color-surface-elevated: #262626;
  --color-border-default: #333333;
  --color-text-primary: #F5F5F5;
  --color-text-secondary: #A3A3A3;
  --color-text-muted: #737373;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-info: #3B82F6;

  /* Typography */
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing (8px grid) */
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-5: 1.25rem;  /* 20px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  --spacing-10: 2.5rem;  /* 40px */
  --spacing-12: 3rem;    /* 48px */
  --spacing-16: 4rem;    /* 64px */

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
}
```

#### Hot Score Algorithm

The hot score determines submission ranking in the `/feed/hot` view. Based on Reddit's algorithm with modifications for the LIBERAL context.

```typescript
// Implemented as a PostgreSQL function for consistency
// Called on vote insert/update via trigger

/*
  hot_score = log10(max(|upvotes - downvotes|, 1)) + (sign * created_epoch / 45000)

  - sign: +1 if net positive, -1 if net negative, 0 if zero
  - created_epoch: Unix timestamp of creation (seconds)
  - 45000: ~12.5 hours decay constant (faster decay than Reddit's 24h)
*/
```

### 3.5 Infrastructure & Deployment

#### Decision: Vercel + Scaleway + Cloudflare

**Updated from PRD:** The PRD specified Cloudflare Pages for frontend hosting. After evaluation, Vercel is chosen for the Next.js frontend because:
- Native Next.js support (Vercel maintains Next.js)
- Built-in ISR, Edge Functions, Image Optimization
- Preview Deployments per PR (built-in)
- Serverless function support for API routes
- Free tier supports initial launch; Pro tier ($20/mo) for production

Cloudflare is retained for CDN and DDoS protection in front of both Vercel and Scaleway.

#### Deployment Architecture

```
                    Internet
                       |
                 [Cloudflare CDN]
                 /              \
          [Vercel]          [Scaleway]
          Next.js           FastAPI
          Frontend +        Cost Engine
          API Routes        (Container)
              |                 |
         [Upstash]        [Scaleway]
          Redis             Managed
          (EU)             PostgreSQL
                           (Paris DC)
```

#### Infrastructure Components

| Component | Service | Region | Tier |
|---|---|---|---|
| Frontend + API | Vercel | Auto (EU edge) | Hobby -> Pro |
| Cost Engine | Scaleway Serverless Container | Paris (fr-par) | Starter |
| PostgreSQL | Scaleway Managed Database | Paris (fr-par) | DB-DEV-S |
| Redis | Upstash | EU (Frankfurt) | Free -> Pay-as-you-go |
| CDN + DDoS | Cloudflare | Global | Free -> Pro |
| DNS | Cloudflare | Global | Free |
| Analytics | Plausible (self-hosted) or Umami | EU | Self-hosted |
| Error Tracking | Sentry | EU | Developer (free) |
| Object Storage | Scaleway Object Storage | Paris (fr-par) | Pay-as-you-go |
| CI/CD | GitHub Actions | N/A | Free (public repo) |

#### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    needs: lint-and-type-check
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_DB: liberal_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
      - run: npm ci
      - run: npx drizzle-kit push
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/liberal_test
      - run: npm run test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/liberal_test

  test-cost-engine:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.14'
      - run: cd cost-engine && pip install -e ".[test]"
      - run: cd cost-engine && pytest

  e2e:
    runs-on: ubuntu-latest
    needs: [test, test-cost-engine]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

#### Environment Variables

```bash
# .env.example

# Database
DATABASE_URL=postgresql://user:password@host:5432/liberal

# Auth.js
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3000

# Twitter/X OAuth
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cost Engine (internal)
COST_ENGINE_URL=http://localhost:8000
COST_ENGINE_KEY=internal-api-key

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=liberal.fr

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Public
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=LIBERAL
```

---

## Section 4: Implementation Patterns & Consistency Rules

### 4.1 Naming Conventions

#### Database Naming

| Element | Convention | Example |
|---|---|---|
| Tables | snake_case, plural | `submissions`, `cost_calculations` |
| Columns | snake_case | `created_at`, `vote_count`, `author_id` |
| Enums | snake_case | `user_role`, `vote_type` |
| Enum values | lowercase | `'user'`, `'moderator'`, `'admin'` |
| Indexes | `idx_{table}_{column}` | `idx_submissions_hot_score` |
| Foreign keys | `{referenced_table_singular}_id` | `author_id`, `submission_id` |

#### API Naming

| Element | Convention | Example |
|---|---|---|
| Paths | `/api/v1/{resource}` plural, kebab-case | `/api/v1/submissions`, `/api/v1/feature-votes` |
| Path params | `[id]`, `[slug]`, `[username]` | `/api/v1/submissions/[id]` |
| Query params | camelCase | `?sortBy=hot&cursor=abc123&limit=20` |
| HTTP methods | Standard REST | GET (read), POST (create), PATCH (update), DELETE |
| Response fields | camelCase | `costPerTaxpayer`, `upvoteCount`, `createdAt` |

#### Code Naming

| Element | Convention | Example |
|---|---|---|
| React components | PascalCase | `SubmissionCard.tsx`, `VoteButton.tsx` |
| Component files | PascalCase.tsx | `ConsequenceCard.tsx` |
| Non-component files | kebab-case.ts | `cost-engine.ts`, `rate-limit.ts` |
| Functions | camelCase | `calculateCost()`, `formatEuro()` |
| Variables | camelCase | `voteCount`, `currentUser` |
| Constants | UPPER_SNAKE_CASE | `MAX_SUBMISSIONS_PER_DAY`, `CACHE_TTL` |
| Types/Interfaces | PascalCase | `Submission`, `VoteCacheStore` |
| Enums (TS) | PascalCase | `UserRole`, `VoteType` |
| Hooks | `use` + camelCase | `useVote`, `useAuth`, `useShare` |
| Stores | `use` + PascalCase + `Store` pattern | `useVoteCache`, `useAuthStore` |
| Test files | `*.test.ts` or `*.test.tsx` | `SubmissionCard.test.tsx` |
| CSS classes | Tailwind utilities | `bg-chainsaw-red text-text-primary` |

### 4.2 Code Organization Patterns

#### Feature-Based Organization

Components are organized by feature domain, not by type. This co-locates related code and tests.

```
src/components/features/submissions/
├── SubmissionCard.tsx          # Component
├── SubmissionCard.test.tsx     # Unit test (co-located)
├── SubmissionForm.tsx          # Component
└── SubmissionDetail.tsx        # Component
```

**Rule:** A feature folder contains only React components. Business logic lives in `src/lib/`, hooks in `src/hooks/`, and stores in `src/stores/`.

#### Server Component / Client Component Boundary

**Rule:** Default to Server Components. Only add `'use client'` when the component needs:
- Event handlers (onClick, onSubmit, onChange)
- useState, useEffect, or other React hooks
- Browser-only APIs (localStorage, Web Share API)
- Third-party client-only libraries (Motion, Zustand)

**Pattern:** Keep Client Components as leaf nodes. Pass server-fetched data as props.

```tsx
// Server Component (default) -- src/app/feed/[sort]/page.tsx
import { FeedList } from '@/components/features/feed/FeedList';
import { getSubmissions } from '@/lib/api/submissions';

export default async function FeedPage({ params }: { params: { sort: string } }) {
  const submissions = await getSubmissions({ sort: params.sort });

  return (
    <main>
      <FeedList initialData={submissions} sort={params.sort} />
    </main>
  );
}
```

```tsx
// Client Component -- src/components/features/feed/FeedList.tsx
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { SubmissionCard } from '@/components/features/submissions/SubmissionCard';

export function FeedList({ initialData, sort }: { initialData: Submission[]; sort: string }) {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['feed', sort],
    queryFn: ({ pageParam }) => fetchFeed(sort, pageParam),
    initialData: { pages: [initialData], pageParams: [null] },
    getNextPageParam: (lastPage) => lastPage.meta?.cursor,
  });

  // Infinite scroll with IntersectionObserver
  return (/* ... */);
}
```

### 4.3 Error Handling Patterns

#### Route-Level Error Boundaries

Every route segment has an `error.tsx` boundary:

```tsx
// src/app/feed/[sort]/error.tsx
'use client';

export default function FeedError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <h2 className="font-display text-xl text-text-primary">
        Impossible de charger le fil
      </h2>
      <p className="text-text-secondary">{error.message}</p>
      <button onClick={reset} className="rounded-md bg-chainsaw-red px-4 py-2 text-white">
        Reessayer
      </button>
    </div>
  );
}
```

#### API Error Handling

```typescript
// src/lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static validation(message: string, details?: Record<string, unknown>) {
    return new ApiError('VALIDATION_ERROR', message, 400, details);
  }
  static unauthorized(message = 'Non authentifie') {
    return new ApiError('UNAUTHORIZED', message, 401);
  }
  static forbidden(message = 'Acces refuse') {
    return new ApiError('FORBIDDEN', message, 403);
  }
  static notFound(message = 'Ressource introuvable') {
    return new ApiError('NOT_FOUND', message, 404);
  }
  static conflict(message = 'Conflit de ressource') {
    return new ApiError('CONFLICT', message, 409);
  }
  static rateLimited(retryAfter: number) {
    return new ApiError('RATE_LIMITED', `Trop de requetes. Reessayez dans ${Math.ceil(retryAfter / 60)} minutes.`, 429, { retryAfter });
  }
  static internal(message = 'Erreur interne du serveur') {
    return new ApiError('INTERNAL_ERROR', message, 500);
  }
}
```

### 4.4 UI/UX Patterns

#### Optimistic UI for Votes

1. User taps vote button
2. UI immediately updates vote count and button state (< 100ms)
3. API call fires in background
4. On success: server state eventually syncs
5. On error: UI rolls back to previous state + toast notification

#### Skeleton Loading

Every data-dependent component has a skeleton variant:

```tsx
// src/components/features/feed/FeedSkeleton.tsx
export function FeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg bg-surface-secondary p-4">
          <div className="mb-2 h-5 w-3/4 rounded bg-surface-elevated" />
          <div className="mb-3 h-4 w-1/2 rounded bg-surface-elevated" />
          <div className="flex gap-4">
            <div className="h-8 w-16 rounded bg-surface-elevated" />
            <div className="h-8 w-16 rounded bg-surface-elevated" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### Toast Notifications

All user-facing actions provide feedback via toast:

| Action | Toast Type | Message (FR) |
|---|---|---|
| Submission created | Success | "Soumission publiee avec succes" |
| Vote cast | None (optimistic) | No toast needed |
| Vote failed | Error | "Erreur lors du vote. Reessayez." |
| Comment posted | Success | "Commentaire publie" |
| Rate limited | Warning | "Trop de requetes. Reessayez dans X minutes." |
| Content flagged | Info | "Contenu signale. Merci pour votre vigilance." |
| Login required | Info | "Connectez-vous pour continuer" |

#### Lazy Registration Pattern

Anonymous users can browse all content. When they attempt a protected action (vote, comment, submit), a modal `LazyAuthGate` appears with login/register options. After authentication, the original action is completed automatically.

```tsx
// src/components/features/auth/LazyAuthGate.tsx
'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface LazyAuthGateProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  pendingAction?: string;
}

export function LazyAuthGate({ open, onClose, onAuthenticated, pendingAction }: LazyAuthGateProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-surface-primary">
        <h2 className="font-display text-xl text-text-primary">
          Connectez-vous pour {pendingAction ?? 'continuer'}
        </h2>
        {/* Tab between Login / Register */}
      </DialogContent>
    </Dialog>
  );
}
```

### 4.5 Testing Patterns

| Test Type | Tool | Location | Convention |
|---|---|---|---|
| Unit tests | Vitest | Co-located (`*.test.ts`) | Test business logic, hooks, utils |
| Component tests | Vitest + Testing Library | Co-located (`*.test.tsx`) | Test render output, interactions |
| API route tests | Vitest | `__tests__/api/` | Test request/response contracts |
| Integration tests | Vitest | `__tests__/integration/` | Test feature flows with DB |
| E2E tests | Playwright | `e2e/` | Test critical user journeys |
| Python tests | pytest | `cost-engine/tests/` | Test calculation accuracy |

**Coverage Targets:**
- Business logic (lib/): > 90%
- Components: > 70% (focus on interactive components)
- API routes: > 85%
- Cost engine: > 95% (financial accuracy is critical)

---

## Section 5: Project Structure & Boundaries

### 5.1 Complete Directory Tree

```
liberal/
├── .github/
│   └── workflows/
│       ├── ci.yml                          # Lint, type-check, test, e2e
│       ├── deploy-preview.yml              # Preview deployment on PR
│       └── deploy-production.yml           # Production deploy on main merge
├── .env.example                            # Template for environment variables
├── .env.local                              # Local dev overrides (git-ignored)
├── .eslintrc.json                          # ESLint config (Next.js + custom rules)
├── .gitignore                              # Node, Next.js, env, OS ignores
├── .prettierrc                             # Prettier config (singleQuote, semi, printWidth: 100)
├── README.md                               # Project overview, setup, contributing
├── LICENSE                                 # AGPL-3.0 full text
├── package.json                            # Dependencies, scripts
├── next.config.ts                          # Next.js configuration (ISR, headers, rewrites)
├── tailwind.config.ts                      # Tailwind v4 theme extensions
├── tsconfig.json                           # TypeScript strict config
├── drizzle.config.ts                       # Drizzle Kit migration config
├── vitest.config.ts                        # Vitest config (jsdom, aliases)
├── playwright.config.ts                    # Playwright E2E config
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Root layout: dark mode, fonts, metadata, providers
│   │   ├── page.tsx                        # Redirect to /feed/hot
│   │   ├── globals.css                     # Tailwind v4 theme, design tokens, global styles
│   │   ├── not-found.tsx                   # Custom 404 page
│   │   ├── error.tsx                       # Root error boundary
│   │   ├── loading.tsx                     # Root loading skeleton
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx                # Login page
│   │   │   └── register/
│   │   │       └── page.tsx                # Registration page
│   │   ├── feed/
│   │   │   └── [sort]/
│   │   │       ├── page.tsx                # Hot/New/Top feeds (RSC with ISR)
│   │   │       ├── loading.tsx             # Feed skeleton loader
│   │   │       └── error.tsx               # Feed error boundary
│   │   ├── s/
│   │   │   └── [id]/
│   │   │       └── [slug]/
│   │   │           ├── page.tsx            # Submission detail (RSC, SSR, OG meta)
│   │   │           ├── loading.tsx         # Detail skeleton loader
│   │   │           └── error.tsx           # Detail error boundary
│   │   ├── submit/
│   │   │   └── page.tsx                    # Submission form (Client Component)
│   │   ├── profile/
│   │   │   └── [username]/
│   │   │       ├── page.tsx                # User profile page
│   │   │       └── loading.tsx             # Profile skeleton
│   │   ├── admin/
│   │   │   ├── layout.tsx                  # Admin guard (role check)
│   │   │   ├── page.tsx                    # Admin dashboard home
│   │   │   ├── moderation/
│   │   │   │   └── page.tsx                # Moderation queue
│   │   │   └── broadcast/
│   │   │       └── page.tsx                # @LIBERAL_FR broadcast tool
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts            # Auth.js route handler
│   │       ├── v1/
│   │       │   ├── submissions/
│   │       │   │   ├── route.ts            # GET list, POST create
│   │       │   │   └── [id]/
│   │       │   │       ├── route.ts         # GET detail, PATCH update, DELETE
│   │       │   │       ├── votes/
│   │       │   │       │   └── route.ts     # POST vote, DELETE unvote
│   │       │   │       ├── comments/
│   │       │   │       │   └── route.ts     # GET list, POST create
│   │       │   │       └── flag/
│   │       │   │           └── route.ts     # POST flag submission
│   │       │   ├── users/
│   │       │   │   └── [username]/
│   │       │   │       └── route.ts         # GET user profile
│   │       │   ├── moderation/
│   │       │   │   ├── route.ts             # GET queue
│   │       │   │   └── [id]/
│   │       │   │       └── route.ts         # PATCH resolve
│   │       │   ├── feature-votes/
│   │       │   │   ├── route.ts             # GET list, POST create
│   │       │   │   └── [id]/
│   │       │   │       └── vote/
│   │       │   │           └── route.ts     # POST vote on feature
│   │       │   └── notifications/
│   │       │       └── route.ts             # GET user notifications
│   │       └── og/
│   │           └── [id]/
│   │               └── route.tsx            # OG image generation (Vercel OG)
│   ├── components/
│   │   ├── ui/                              # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── card.tsx
│   │   │   ├── separator.tsx
│   │   │   └── scroll-area.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx                   # Top navigation bar
│   │   │   ├── BottomTabBar.tsx             # Mobile bottom tabs (Feed, Submit, Profile)
│   │   │   ├── Sidebar.tsx                  # Desktop sidebar (trending, info)
│   │   │   ├── Footer.tsx                   # Footer with links, AGPL notice
│   │   │   └── Providers.tsx                # Client providers (QueryClient, Zustand, Toaster)
│   │   └── features/
│   │       ├── submissions/
│   │       │   ├── SubmissionCard.tsx        # Feed card (title, cost, vote, share)
│   │       │   ├── SubmissionForm.tsx        # Create/edit submission form
│   │       │   ├── SubmissionDetail.tsx      # Full submission view
│   │       │   └── SubmissionCard.test.tsx   # Unit test
│   │       ├── consequences/
│   │       │   ├── ConsequenceCard.tsx       # "Cost to Nicolas" display
│   │       │   └── ConsequenceCard.test.tsx  # Unit test
│   │       ├── voting/
│   │       │   ├── VoteButton.tsx            # Upvote/downvote with optimistic UI
│   │       │   └── VoteButton.test.tsx       # Unit test
│   │       ├── comments/
│   │       │   ├── CommentThread.tsx         # Threaded comment display
│   │       │   ├── CommentForm.tsx           # Comment input
│   │       │   └── CommentThread.test.tsx    # Unit test
│   │       ├── feed/
│   │       │   ├── FeedSortTabs.tsx          # Hot/New/Top tab navigation
│   │       │   ├── FeedList.tsx              # Infinite scroll feed
│   │       │   └── FeedSkeleton.tsx          # Feed loading skeleton
│   │       ├── sharing/
│   │       │   ├── ShareButton.tsx           # Share to Twitter/X + Web Share API
│   │       │   └── ShareCard.tsx             # Preview of share card
│   │       ├── auth/
│   │       │   ├── LoginForm.tsx             # Email/password login
│   │       │   ├── RegisterForm.tsx          # Registration form
│   │       │   └── LazyAuthGate.tsx          # Modal auth prompt for lazy registration
│   │       └── admin/
│   │           ├── ModerationQueue.tsx       # Flagged content review
│   │           └── BroadcastTool.tsx         # @LIBERAL_FR tweet tool
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                     # Drizzle client initialization
│   │   │   ├── schema.ts                    # All table definitions (single file)
│   │   │   └── migrations/                  # Drizzle Kit generated migrations
│   │   ├── auth/
│   │   │   ├── config.ts                    # Auth.js configuration
│   │   │   └── helpers.ts                   # Auth utility functions (getUser, requireAuth)
│   │   ├── cost-engine/
│   │   │   ├── client.ts                    # HTTP client for FastAPI service
│   │   │   └── types.ts                     # TypeScript types for cost calculations
│   │   ├── api/
│   │   │   ├── response.ts                  # Standard API response wrapper
│   │   │   ├── errors.ts                    # Error codes and ApiError class
│   │   │   └── rate-limit.ts                # Upstash rate limiter instances
│   │   └── utils/
│   │       ├── format.ts                    # EUR formatting, date formatting, number formatting
│   │       ├── share.ts                     # Web Share API helpers, Twitter intent URL
│   │       ├── slug.ts                      # URL slug generation
│   │       ├── hot-score.ts                 # Hot score calculation (client-side preview)
│   │       └── validation.ts                # Zod schemas for all input validation
│   ├── hooks/
│   │   ├── use-vote.ts                      # Optimistic voting hook
│   │   ├── use-auth.ts                      # Auth state + lazy auth gate
│   │   ├── use-share.ts                     # Share functionality hook
│   │   ├── use-infinite-feed.ts             # Infinite scroll + TanStack Query
│   │   └── use-media-query.ts               # Responsive breakpoint detection
│   ├── stores/
│   │   ├── auth-store.ts                    # Zustand: auth state, user data
│   │   └── vote-cache.ts                    # Zustand: optimistic vote cache
│   ├── types/
│   │   ├── submission.ts                    # Submission types
│   │   ├── user.ts                          # User types
│   │   ├── vote.ts                          # Vote types
│   │   ├── comment.ts                       # Comment types
│   │   ├── cost.ts                          # Cost calculation types
│   │   └── api.ts                           # API response envelope types
│   └── middleware.ts                        # Auth verification, rate limiting, locale
├── cost-engine/                             # Python FastAPI microservice
│   ├── pyproject.toml                       # Python project config (dependencies, scripts)
│   ├── Dockerfile                           # Container image for Scaleway deployment
│   ├── .env.example                         # Cost engine env vars template
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                          # FastAPI app entry point
│   │   ├── config.py                        # Environment config (Pydantic settings)
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── calculations.py              # POST /api/v1/calculate endpoint
│   │   │   └── health.py                    # GET /health endpoint
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── cost_calculator.py           # Core calculation logic
│   │   │   └── data_fetcher.py              # Fetch from data.gouv.fr, INSEE, etc.
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── fiscal_data.py               # Pydantic models for fiscal data
│   │   └── data/
│   │       └── reference_data.json          # Static: population, taxpayer count, median wage, baguette price
│   └── tests/
│       ├── __init__.py
│       ├── test_cost_calculator.py           # Unit tests for calculation accuracy
│       ├── test_data_fetcher.py              # Tests for data source integration
│       └── conftest.py                       # Pytest fixtures
├── e2e/
│   ├── feed.spec.ts                          # Feed browsing E2E tests
│   ├── submission.spec.ts                    # Submit + vote E2E tests
│   ├── auth.spec.ts                          # Login/register E2E tests
│   └── share.spec.ts                         # Share card generation E2E tests
├── public/
│   ├── favicon.ico                           # Site favicon (chainsaw icon)
│   ├── chainsaw-icon.svg                     # SVG chainsaw logo
│   ├── og-default.png                        # Default OG image (1200x630)
│   └── fonts/
│       ├── SpaceGrotesk-Variable.woff2       # Display font
│       └── Inter-Variable.woff2              # Body font
├── drizzle/
│   └── migrations/                           # Generated SQL migration files
└── docker-compose.yml                        # Local dev: PostgreSQL + Redis + Cost Engine
```

### 5.2 Module Boundaries & Dependencies

**Dependency rules (enforced by ESLint import rules):**

```
app/ -> components/, lib/, hooks/, stores/, types/
components/features/ -> components/ui/, lib/, hooks/, stores/, types/
components/ui/ -> (no internal imports — leaf dependency)
components/layout/ -> components/ui/, hooks/, stores/
hooks/ -> lib/, stores/, types/
stores/ -> types/
lib/ -> types/
types/ -> (no internal imports — leaf dependency)
```

**Circular dependency prevention:** No module may import from a module that imports from it. The `types/` directory is always a leaf. The `lib/` directory never imports from `components/`, `hooks/`, or `stores/`.

### 5.3 Cost Engine (Python) Structure

```python
# cost-engine/app/main.py
from fastapi import FastAPI, Depends, HTTPException, Header
from app.config import Settings, get_settings
from app.routers import calculations, health

app = FastAPI(
    title="LIBERAL Cost Engine",
    description="Cost to Nicolas calculation service",
    version="1.0.0",
)

# Internal API key verification
async def verify_internal_key(
    x_internal_key: str = Header(...),
    settings: Settings = Depends(get_settings),
):
    if x_internal_key != settings.internal_api_key:
        raise HTTPException(status_code=403, detail="Invalid internal key")

app.include_router(health.router)
app.include_router(calculations.router, dependencies=[Depends(verify_internal_key)])
```

```python
# cost-engine/app/services/cost_calculator.py
from decimal import Decimal
from app.models.fiscal_data import ReferenceData, CostResult

class CostCalculator:
    def __init__(self, reference_data: ReferenceData):
        self.ref = reference_data

    def calculate(self, total_amount_eur: Decimal) -> CostResult:
        cost_per_taxpayer = total_amount_eur / self.ref.taxpayer_count

        baguette_price = self.ref.baguette_price  # ~1.20 EUR
        baguette_equivalent = cost_per_taxpayer / baguette_price

        hourly_median_wage = self.ref.median_annual_wage / Decimal("1820")  # ~35h/week * 52 weeks
        wage_hours = cost_per_taxpayer / hourly_median_wage

        hourly_smic = self.ref.smic_brut_mensuel / Decimal("151.67")  # Legal monthly hours
        smic_hours = cost_per_taxpayer / hourly_smic

        return CostResult(
            total_amount=total_amount_eur,
            taxpayer_count=self.ref.taxpayer_count,
            cost_per_taxpayer=round(cost_per_taxpayer, 4),
            baguette_equivalent=round(baguette_equivalent, 2),
            wage_hours_equivalent=round(wage_hours, 4),
            smic_hours_equivalent=round(smic_hours, 4),
            reference_data_version=self.ref.version,
        )
```

---

## Section 6: Architecture Validation

### 6.1 Functional Requirements Coverage

Every FR is mapped to its architectural support:

| FR | Requirement | Architectural Support |
|---|---|---|
| FR1 | User registration | Auth.js Credentials provider + `users` table + Zod validation |
| FR2 | Login / logout | Auth.js JWT sessions + httpOnly cookies |
| FR3 | Twitter/X OAuth | Auth.js Twitter provider + `twitter_id` / `twitter_handle` columns |
| FR4 | User profile | `/profile/[username]` RSC page + `users` table queries |
| FR5 | Submit waste | `/submit` Client Component + `submissions` table + Server Action |
| FR6 | Auto-calculate cost | FastAPI Cost Engine called on submission creation |
| FR7 | Edit/delete own | PATCH/DELETE routes with 15-min window check + author verification |
| FR8 | Submission detail | `/s/[id]/[slug]` RSC page with SSR + OG meta tags |
| FR9 | OG image generation | `/api/og/[id]` route using Vercel OG (@vercel/og) |
| FR10 | Upvote/downvote | `votes` table + `/api/v1/submissions/[id]/votes` route |
| FR11 | Optimistic vote UI | Zustand `vote-cache` store + `useVote` hook |
| FR12 | Vote count caching | Upstash Redis `vote:sub:{id}` with 5-min TTL |
| FR13 | One vote per user | UNIQUE constraint `(user_id, submission_id)` + Redis dedup |
| FR14 | Hot feed | `hot_score` column + PostgreSQL function + ISR 60s |
| FR15 | New feed | `created_at DESC` index + ISR 30s |
| FR16 | Top feed | `upvote_count` index + time window filter + ISR 120s |
| FR17 | Infinite scroll | Cursor-based pagination + TanStack Query `useInfiniteQuery` |
| FR18 | Trending sidebar | Redis-cached top submissions + Sidebar component |
| FR19 | Comments | `comments` table + `/api/v1/submissions/[id]/comments` |
| FR20 | Threaded replies | `parent_id` self-reference + `depth` column (max 2 mobile, 4 desktop) |
| FR21 | Comment upvotes | `comment_votes` table + optimistic UI |
| FR22 | Comment sorting | ORDER BY `upvote_count DESC` or `created_at DESC` |
| FR23 | Per-taxpayer cost | `CostCalculator.calculate()` in Python service |
| FR24 | Consequence equivalences | Baguette, wage hours, SMIC hours in `CostResult` |
| FR25 | Monthly data refresh | `data_fetcher.py` + scheduled task (cron or manual) |
| FR26 | Flagging | `moderation_queue` table + `/api/v1/submissions/[id]/flag` |
| FR27 | Duplicate detection | Trigram similarity on `title` column (pg_trgm extension) |
| FR28 | Source URL validation | Zod schema with `.gouv.fr` domain allowlist |
| FR29 | Share card image | `/api/og/[id]` generates 1200x630 image with Vercel OG |
| FR30 | Share to Twitter/X | `ShareButton` + Twitter intent URL with image attachment |
| FR31 | @LIBERAL_FR broadcast | `BroadcastTool` admin component + Twitter API v2 |
| FR32 | Moderation queue | `/admin/moderation` page + `moderation_queue` table |
| FR33 | Admin dashboard | `/admin` layout with role guard + management pages |
| FR34 | Notifications | `notifications` table + `/api/v1/notifications` + polling |
| FR35 | Feature voting | `feature_votes` + `feature_vote_ballots` tables + dedicated routes |

**Result: 35/35 FRs have explicit architectural support.**

### 6.2 Non-Functional Requirements Coverage

| NFR | Requirement | Architectural Support |
|---|---|---|
| NFR1 | Page load < 2s | ISR + RSC + Cloudflare CDN + optimized fonts |
| NFR2 | Vote < 100ms | Optimistic UI (Zustand local update, no network wait) |
| NFR3 | Cost calc < 500ms | FastAPI async + cached reference data + 5s timeout |
| NFR4 | 10K concurrent | Vercel serverless auto-scaling + ISR caching + CDN |
| NFR5 | TTI < 3s | Server Components (minimal JS bundle), code splitting |
| NFR6 | RGAA AA | shadcn/ui (accessible primitives) + manual audit |
| NFR7 | Keyboard + screen reader | Focus management, ARIA labels, skip navigation |
| NFR8 | RGPD/GDPR | Consent management, data export API, deletion endpoint |
| NFR9 | CADA compliance | All public data properly attributed, source links |
| NFR10 | French/EU hosting | Scaleway Paris (DB + Cost Engine), Upstash EU (Redis) |
| NFR11 | Cookie consent | CNIL-compliant cookie banner (tarteaucitron.js or custom) |
| NFR12 | Privacy analytics | Plausible (self-hosted) or Umami -- no cookies, no PII |
| NFR13 | Rate limiting | Upstash Ratelimit (sliding window) per action/user/IP |
| NFR14 | Content moderation | Auto-flag keywords + community flagging + mod queue |
| NFR15 | DDoS protection | Cloudflare (WAF + rate limiting + bot management) |
| NFR16 | Input sanitization | Zod validation + React auto-escaping + CSP headers |
| NFR17 | CSRF protection | SameSite cookies + Server Actions (built-in CSRF) |
| NFR18 | AGPL-3.0 | LICENSE file + no proprietary dependencies |
| NFR19 | CI/CD | GitHub Actions (lint, type-check, test, deploy) |
| NFR20 | Preview deploys | Vercel Preview Deployments (automatic on PR) |
| NFR21 | DB backups | Scaleway Managed DB auto-backup (daily, 30-day retention) |
| NFR22 | Structured logging | Pino (Next.js) + structlog (Python) + Sentry |
| NFR23 | Health checks | `/api/health` (Next.js) + `/health` (FastAPI) |

**Result: 23/23 NFRs have explicit architectural support.**

### 6.3 Coherence Check

| Check | Status | Notes |
|---|---|---|
| All FRs mappable to components | PASS | 35/35 mapped |
| All NFRs have implementation strategy | PASS | 23/23 mapped |
| No circular dependencies in module graph | PASS | Enforced by ESLint import rules |
| Database schema supports all features | PASS | 11 tables cover all domains |
| Auth covers all role-based access | PASS | 4 roles: anon, user, mod, admin |
| Caching strategy addresses performance NFRs | PASS | ISR + Redis + CDN multi-layer |
| Rate limiting covers all attack surfaces | PASS | 7 rate limit categories defined |
| Test strategy covers all layers | PASS | Unit, component, API, integration, E2E |
| Deployment strategy supports French hosting | PASS | Scaleway Paris DC for DB + compute |
| AGPL-3.0 compatible with all dependencies | PASS | No GPL-incompatible dependencies |
| Mobile-first UX reflected in architecture | PASS | RSC for minimal JS, BottomTabBar, responsive components |
| Optimistic UI pattern fully specified | PASS | Zustand store + rollback + error handling |
| Cost Engine boundary clean | PASS | Single HTTP interface, internal-only access |
| i18n preparation adequate | PASS | French-first, next-intl ready for Phase 2 |

### 6.4 Implementation Readiness Checklist

- [x] Technology versions locked and documented
- [x] Database schema fully defined with indexes
- [x] Authentication flow specified (Credentials + Twitter OAuth)
- [x] Authorization model defined (4 roles with permission matrix)
- [x] API contract specified (endpoint map + response format + error codes)
- [x] Frontend component architecture defined (RSC vs Client boundary)
- [x] State management architecture defined (3-layer: server, client, URL)
- [x] Caching strategy defined (Redis keys, TTLs, ISR intervals)
- [x] Rate limiting rules specified (7 categories with limits)
- [x] CI/CD pipeline defined (GitHub Actions with PostgreSQL service)
- [x] Infrastructure topology defined (Vercel + Scaleway + Cloudflare + Upstash)
- [x] Directory structure fully specified (every file and folder)
- [x] Cost Engine microservice boundary and API defined
- [x] Testing strategy defined (tools, locations, coverage targets)
- [x] Security measures enumerated (8 categories)
- [x] Environment variables cataloged (.env.example)
- [x] Design tokens defined (colors, typography, spacing)
- [x] Hot score algorithm specified
- [x] Error handling patterns defined (error boundaries, API errors, toast)
- [x] Naming conventions documented (database, API, code, files)

---

## Section 7: Architecture Completion

### 7.1 Architecture Summary

LIBERAL is architected as a **Next.js App Router application** with a **Python FastAPI microservice** for fiscal calculations. The architecture prioritizes:

1. **Performance:** React Server Components for minimal client JavaScript, ISR for cacheable feeds, optimistic UI for instant vote feedback, Cloudflare CDN for global edge delivery.

2. **SEO & Virality:** Server-rendered submission pages with OG meta tags, dynamic OG image generation, Twitter/X share cards -- all critical for the viral social loop that drives the platform.

3. **Developer Experience:** TypeScript end-to-end, Drizzle ORM with type-safe queries, co-located tests, shadcn/ui accessible components, hot reload with Turbopack.

4. **Regulatory Compliance:** French/EU data hosting (Scaleway Paris), RGPD/GDPR data handling, CNIL cookie consent, RGAA AA accessibility, privacy-first analytics.

5. **Open Source Readiness:** AGPL-3.0 license, no proprietary runtime dependencies, clear module boundaries, comprehensive documentation, contributor-friendly CI/CD.

6. **Scale Readiness:** Serverless auto-scaling (Vercel), managed database (Scaleway), serverless Redis (Upstash), CDN + DDoS protection (Cloudflare). Architecture supports 10K concurrent users with headroom for viral spikes.

### 7.2 Phase 1 vs Phase 2 Boundary

**Phase 1 (MVP -- this architecture):**
- Core loop: Submit > Vote > Cost to Nicolas > Share
- Feed with Hot/New/Top sorting
- Comments with threading
- Email/password + Twitter/X OAuth
- Moderation queue
- Admin broadcast tool
- OG image generation
- Mobile-first responsive design

**Phase 2 (Post-MVP -- architecture-ready, not implemented):**
- ECharts data visualizations (fiscal dashboards)
- Meilisearch full-text search
- Eurostat + OECD data sources in Cost Engine
- i18n (next-intl for multi-language support)
- WebSocket real-time updates (live vote counts)
- Push notifications (web push API)
- Badges and gamification system
- Community feature voting (infrastructure built in Phase 1)

### 7.3 Readiness Assessment

| Criterion | Status |
|---|---|
| Can a developer scaffold the project from this document? | YES |
| Are all technology choices justified and versioned? | YES |
| Is the database schema implementable as-is? | YES |
| Are API contracts sufficient for parallel frontend/backend work? | YES |
| Is the deployment pipeline defined end-to-end? | YES |
| Are all regulatory requirements architecturally addressed? | YES |
| Is the Cost Engine boundary clean enough for independent development? | YES |
| Can the architecture handle 10x growth without redesign? | YES |

**This architecture document is COMPLETE and ready for implementation.**

---

_Document generated: 2026-02-27_
_Architecture workflow steps completed: 1 through 8_
_Status: Complete -- ready for story map and epic generation_
