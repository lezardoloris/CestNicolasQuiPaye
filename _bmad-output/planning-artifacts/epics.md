---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
status: 'complete'
---

# LIBERAL - Epic Breakdown

## Overview

LIBERAL is a community-driven fiscal accountability platform where French citizens (represented by the "NICOLAS" persona) can submit examples of government waste, vote on them, see their personal financial impact via the "Cost to Nicolas" engine, and share outrages on social media. The platform is inspired by Milei's chainsaw movement and aims to create viral awareness of public spending inefficiencies.

This document breaks the full product into 7 value-driven epics containing 33 user stories. Each epic delivers standalone, demonstrable functionality. Stories are sequenced so that earlier stories within an epic create the foundation for later ones, but no epic has hard forward dependencies on another epic (Epic 1 being the natural prerequisite for authenticated features).

---

## Requirements Inventory

### Functional Requirements

| ID | Requirement |
|----|-------------|
| FR1 | Registered users can submit a government waste item with title (max 200 chars), description (max 2000 chars), estimated cost in EUR, and a mandatory source URL |
| FR2 | The system can display submissions in a feed with Hot (trending), Top (highest score), and New (chronological) sorting options |
| FR3 | Visitors can view any individual submission page with full details, Cost to Nicolas breakdown, vote count, and source link |
| FR4 | Registered users can flag a submission as inaccurate, spam, or inappropriate |
| FR5 | The system can display the original source URL prominently on every submission for verification |
| FR6 | Registered users can upvote or downvote any submission (one vote per user per submission) |
| FR7 | Registered users can change their vote on a submission |
| FR8 | The system can calculate a submission score (upvotes minus downvotes) and rank submissions accordingly |
| FR9 | The system can display vote counts on each submission card in the feed |
| FR10 | Registered users can vote on proposed platform features to influence the development roadmap |
| FR11 | The system can auto-calculate "Cost per citizen" by dividing the submitted EUR amount by France's current population (from INSEE) |
| FR12 | The system can auto-calculate "Cost per taxpayer" by dividing by the number of income tax payers (from DGFIP/INSEE) |
| FR13 | The system can auto-calculate "Cost per household" by dividing by the number of French households (from INSEE) |
| FR14 | The system can auto-calculate "Days of work equivalent" by dividing cost per taxpayer by the daily median net income (from INSEE) |
| FR15 | The system can auto-calculate at least one concrete equivalence (e.g., "X school lunches" or "Y hospital bed-days") using published per-unit costs |
| FR16 | The system can display all Cost to Nicolas calculations with links to the official data sources used for each denominator |
| FR17 | The system can display the calculation methodology page explaining every formula and data source |
| FR18 | The system can auto-generate a shareable image (PNG, OG-dimensions) for each submission showing: title, cost, and Cost to Nicolas breakdown with LIBERAL branding and chainsaw icon |
| FR19 | Visitors can share any submission via one-click buttons for Twitter/X (via share intent URL), Facebook, WhatsApp, and copy-link |
| FR20 | The system can generate Open Graph and Twitter Card metadata for every submission page with the auto-generated preview image |
| FR21 | The system can detect tweet URLs in submission source fields and display an embedded tweet preview alongside the submission details |
| FR22 | Visitors can register an account using email and password |
| FR23 | Registered users can choose a display name or remain anonymous as "Nicolas #XXXX" |
| FR24 | Registered users can view their submission history and vote history |
| FR25 | Registered users can delete their account and all associated personal data (GDPR right to erasure) |
| FR26 | Administrators can view a moderation queue of pending submissions awaiting approval |
| FR27 | Administrators can approve, reject, or request-edits on pending submissions |
| FR28 | Administrators can remove published submissions that violate terms of service |
| FR29 | Administrators can view flagged submissions sorted by flag count |
| FR30 | Administrators can select top-voted submissions for broadcast via the @LIBERAL_FR Twitter/X account |
| FR31 | Administrators can view community feature voting results and current rankings |
| FR32 | The system can maintain a local cache of key demographic and fiscal denominators (population, taxpayer count, household count, median income) from official sources |
| FR33 | The system can update cached denominators on a configurable schedule (default: quarterly) |
| FR34 | The system can display the last-updated date for all denominators used in Cost to Nicolas calculations |
| FR35 | The system can provide a public data status page showing denominator freshness and source links |

### Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR1 | Feed pages LCP < 2.5s on 4G mobile |
| NFR2 | Vote optimistic UI < 100ms, server confirm < 500ms |
| NFR3 | Cost to Nicolas calculation < 5 seconds |
| NFR4 | Share image generation < 3 seconds |
| NFR5 | Feed pagination < 1 second |
| NFR6 | HTTPS with TLS 1.2+ and HSTS |
| NFR7 | Password hashing with adaptive algorithm (cost factor 12+) |
| NFR8 | Rate limiting: 100 reads/min, 10 writes/min per IP |
| NFR9 | CDN-level DDoS protection |
| NFR10 | CSP headers |
| NFR11 | CAPTCHA on registration |
| NFR12 | Privacy-respecting cookie-free analytics |
| NFR13 | SQL injection prevention via parameterized queries |
| NFR14 | Support 50K MAU via CDN + horizontal scaling |
| NFR15 | Handle 1000+ concurrent votes during viral moments |
| NFR16 | Cost to Nicolas cache operates independently of external APIs |
| NFR17 | RGAA AA conformance (WCAG 2.1 AA) |
| NFR18 | Visible focus indicators on all interactive elements |
| NFR19 | 4.5:1 contrast ratio on all text |
| NFR20 | Labels and error messages on all forms |
| NFR21 | "Verify this" link on every Cost to Nicolas calculation |
| NFR22 | Source URLs stored permanently |
| NFR23 | Vote counts eventually consistent (within 5 seconds) |

### Additional Requirements

**From Architecture:**
- Starter template: `create-next-app` with TypeScript, Tailwind, App Router, `src/` directory
- Drizzle ORM with PostgreSQL (create tables per-story, not upfront)
- Auth.js v5 for authentication
- Python FastAPI microservice for Cost to Nicolas engine
- Vercel deployment with GitHub Actions CI/CD
- Redis (Upstash) for vote caching and rate limiting

**From UX Design:**
- Dark mode default with Chainsaw Red (#DC2626) brand color
- Mobile-first design (70%+ traffic expected from social referral)
- Bottom tab bar on mobile: Feed, Submit, Profile
- Optimistic voting UI with instant feedback
- Lazy registration (browse freely, register to write)
- Comment threading (max 2 levels on mobile)
- Skeleton loading states for all pages
- RGAA AA accessibility compliance

### FR Coverage Map

| FR | Epic | Story |
|----|------|-------|
| FR1 | Epic 2 | 2.1 |
| FR2 | Epic 3 | 3.1 |
| FR3 | Epic 3 | 3.2 |
| FR4 | Epic 6 | 6.3 |
| FR5 | Epic 2 | 2.1, Epic 3: 3.2 |
| FR6 | Epic 3 | 3.3 |
| FR7 | Epic 3 | 3.3 |
| FR8 | Epic 3 | 3.4 |
| FR9 | Epic 3 | 3.1 |
| FR10 | Epic 7 | 7.1, 7.2 |
| FR11 | Epic 2 | 2.3 |
| FR12 | Epic 2 | 2.3 |
| FR13 | Epic 2 | 2.3 |
| FR14 | Epic 2 | 2.3 |
| FR15 | Epic 2 | 2.3 |
| FR16 | Epic 2 | 2.4 |
| FR17 | Epic 2 | 2.5 |
| FR18 | Epic 4 | 4.1 |
| FR19 | Epic 4 | 4.2 |
| FR20 | Epic 4 | 4.3 |
| FR21 | Epic 2 | 2.6 |
| FR22 | Epic 1 | 1.2 |
| FR23 | Epic 1 | 1.3 |
| FR24 | Epic 1 | 1.4 |
| FR25 | Epic 1 | 1.5 |
| FR26 | Epic 6 | 6.1 |
| FR27 | Epic 6 | 6.1 |
| FR28 | Epic 6 | 6.2 |
| FR29 | Epic 6 | 6.3 |
| FR30 | Epic 6 | 6.4 |
| FR31 | Epic 7 | 7.3 |
| FR32 | Epic 2 | 2.2 |
| FR33 | Epic 2 | 2.2 |
| FR34 | Epic 2 | 2.4 |
| FR35 | Epic 2 | 2.4 |

---

## Epic List

| Epic | Title | FRs Covered | Stories |
|------|-------|-------------|---------|
| 1 | Project Foundation & User Identity | FR22, FR23, FR24, FR25 | 5 |
| 2 | Waste Submission & Cost to Nicolas Engine | FR1, FR5, FR11-FR17, FR21, FR32-FR35 | 6 |
| 3 | Community Feed & Voting | FR2, FR3, FR6-FR9 | 5 |
| 4 | Social Sharing & Virality | FR18-FR20 | 4 |
| 5 | Comments & Community Discussion | (UX-driven, no FR numbers) | 4 |
| 6 | Moderation & Administration | FR4, FR26-FR31 | 5 |
| 7 | Community Feature Voting & Platform Democracy | FR10, FR31 | 4 |
| | **Total** | **35 FRs** | **33 stories** |

---

## Epic 1: Project Foundation & User Identity

**Goal:** Nicolas can register, log in, manage his profile, and feel ownership of a personal identity on the platform. This epic also establishes the project scaffold, design system, and authentication infrastructure upon which every other epic builds.

**FRs Covered:** FR22, FR23, FR24, FR25
**NFRs Integrated:** NFR6, NFR7, NFR8, NFR10, NFR11, NFR12, NFR17, NFR18, NFR19, NFR20

---

### Story 1.1: Project Scaffold & Design System Foundation

**As a** developer,
**I want** the Next.js project initialized from `create-next-app` with the full base configuration, design tokens, and layout shell,
**So that** all subsequent stories can build on a consistent, accessible, and deployment-ready foundation.

**Acceptance Criteria:**

**Given** a new project is needed,
**When** the scaffold is generated,
**Then** the project is created using `create-next-app@latest` with the following flags: `--typescript`, `--tailwind`, `--app`, `--src-dir`, `--eslint`,
**And** the project structure contains `src/app/`, `src/components/`, `src/lib/`, and `src/styles/` directories,
**And** `tailwind.config.ts` extends the default theme with the LIBERAL brand colors:
  - `chainsaw-red: #DC2626`
  - `bg-dark: #0A0A0A`
  - `surface-dark: #141414`
  - `text-primary: #F5F5F5`
  - `text-secondary: #A3A3A3`
**And** `shadcn/ui` is initialized with the "new-york" style and dark theme default,
**And** the root layout (`src/app/layout.tsx`) sets `<html lang="fr" className="dark">` with the Inter font loaded via `next/font`,
**And** a `<MobileTabBar />` shell component is rendered at the bottom of the viewport on screens below `md` breakpoint with three placeholder tabs: Feed, Submit, Profile,
**And** a `<DesktopNav />` shell component is rendered at the top on screens `md` and above,
**And** CSP headers are configured in `next.config.ts` via the `headers()` function with `default-src 'self'`, `script-src 'self' 'unsafe-inline'`, and `style-src 'self' 'unsafe-inline'` (NFR10),
**And** HSTS is configured with `max-age=63072000; includeSubDomains; preload` (NFR6),
**And** a `<SkeletonCard />` placeholder component exists in `src/components/ui/skeleton-card.tsx` for use in loading states,
**And** all interactive elements (buttons, links, tabs) have a visible `ring-2 ring-chainsaw-red` focus indicator on `:focus-visible` (NFR18),
**And** all text elements meet a 4.5:1 contrast ratio against their background color (NFR19),
**And** `npm run build` completes without errors,
**And** `npm run lint` completes without warnings.

---

### Story 1.2: Email/Password Registration & Login with Auth.js v5

**As a** visitor (Nicolas),
**I want** to register with my email and password and then log in,
**So that** I can participate in voting and submitting waste items.

**Acceptance Criteria:**

**Given** Auth.js v5 is installed and configured with a Credentials provider,
**When** a visitor navigates to `/auth/register`,
**Then** a registration form is displayed with fields: `email` (type email, required), `password` (type password, required, min 8 chars), and `confirmPassword` (type password, required),
**And** every form field has an associated `<label>` element with a visible label text (NFR20),
**And** a CAPTCHA challenge (hCaptcha or Turnstile) is displayed and must be solved before submission (NFR11),
**And** validation errors are displayed inline below the relevant field with `role="alert"` and descriptive text (NFR20).

**Given** a visitor fills in the registration form with valid data,
**When** they submit the form,
**Then** a Drizzle migration creates the `users` table (if not exists) with columns: `id` (UUID, PK), `email` (varchar 255, unique, not null), `password_hash` (varchar 255, not null), `display_name` (varchar 100, nullable), `anonymous_id` (varchar 20, not null, unique, generated as "Nicolas #" + zero-padded sequential number), `role` (enum: 'user' | 'admin', default 'user'), `created_at` (timestamp), `updated_at` (timestamp),
**And** the password is hashed using bcrypt with a cost factor of 12 (NFR7),
**And** a new user row is inserted into the `users` table,
**And** the user is automatically logged in and redirected to `/feed`,
**And** a secure, httpOnly session cookie is set.

**Given** a registered user navigates to `/auth/login`,
**When** the login page renders,
**Then** a login form is displayed with fields: `email` and `password`, each with associated `<label>` elements (NFR20),
**And** a "Forgot password?" link is visible (can be a placeholder for MVP).

**Given** a registered user submits valid credentials on the login form,
**When** the server validates the credentials,
**Then** the user is logged in and redirected to `/feed`,
**And** the session is established via Auth.js v5 with a JWT strategy.

**Given** a visitor or logged-in user attempts to access the registration or login endpoints,
**When** they exceed 10 POST requests per minute from the same IP,
**Then** a `429 Too Many Requests` response is returned (NFR8).

---

### Story 1.3: Display Name Selection & Anonymous Identity

**As a** registered user (Nicolas),
**I want** to choose a display name or keep my auto-generated anonymous identity,
**So that** I can participate publicly or anonymously according to my preference.

**Acceptance Criteria:**

**Given** a user has just completed registration and is logged in,
**When** they are redirected to `/feed` for the first time,
**Then** a modal or inline prompt appears inviting them to set a display name, with the text: "Bienvenue ! Vous pouvez choisir un pseudonyme ou rester anonyme en tant que {anonymous_id}.",
**And** the prompt contains an input field `display_name` (max 100 chars) and two buttons: "Choisir ce pseudo" and "Rester anonyme".

**Given** the user enters a display name and clicks "Choisir ce pseudo",
**When** the request is processed,
**Then** the `users.display_name` column is updated with the entered value,
**And** the display name is shown in the navigation bar and on their profile page,
**And** the display name must not contain the strings "admin", "moderat", or "liberal" (case-insensitive).

**Given** the user clicks "Rester anonyme",
**When** the prompt is dismissed,
**Then** the `users.display_name` remains null,
**And** everywhere the user's name would appear, the system displays the `anonymous_id` value (e.g., "Nicolas #0042").

**Given** a registered user navigates to `/profile/settings`,
**When** the settings page renders,
**Then** the user can change their display name at any time,
**And** a preview shows how their name will appear on submissions and comments.

---

### Story 1.4: User Profile with Submission & Vote History

**As a** registered user (Nicolas),
**I want** to view my submission history and vote history on my profile page,
**So that** I can track my contributions and engagement with the platform.

**Acceptance Criteria:**

**Given** a logged-in user navigates to `/profile`,
**When** the profile page renders,
**Then** the page displays the user's display name (or anonymous_id), email (partially masked as `n***@example.com`), member since date, total submissions count, and total votes cast count,
**And** the page has two tabs: "Mes signalements" (My Submissions) and "Mes votes" (My Votes).

**Given** the user selects the "Mes signalements" tab,
**When** the tab content loads,
**Then** a paginated list of the user's submissions is displayed (20 per page), each showing: title, submission date, current score, and status (pending/approved/rejected),
**And** a skeleton loading state is displayed while data is fetching,
**And** clicking a submission title navigates to `/submissions/{id}`.

**Given** the user selects the "Mes votes" tab,
**When** the tab content loads,
**Then** a paginated list of submissions the user has voted on is displayed (20 per page), each showing: title, the user's vote direction (upvote/downvote icon), and current score,
**And** the user's vote direction is visually indicated with `chainsaw-red` for upvote and `text-secondary` for downvote.

**Given** a visitor navigates to `/profile/{userId}`,
**When** the public profile page renders,
**Then** only the display name (or anonymous_id), member since date, and the "Mes signalements" tab (public submissions only) are visible,
**And** the "Mes votes" tab is not shown (votes are private).

---

### Story 1.5: Account Deletion & GDPR Right to Erasure

**As a** registered user (Nicolas),
**I want** to delete my account and all associated personal data,
**So that** I can exercise my GDPR right to erasure and leave the platform cleanly.

**Acceptance Criteria:**

**Given** a logged-in user navigates to `/profile/settings`,
**When** the settings page renders,
**Then** a "Supprimer mon compte" (Delete my account) section is displayed at the bottom of the page with a red-outlined danger button.

**Given** the user clicks "Supprimer mon compte",
**When** the confirmation dialog appears,
**Then** a modal displays the text: "Cette action est irréversible. Toutes vos données personnelles seront supprimées. Vos signalements publiés seront anonymisés.",
**And** the modal requires the user to type "SUPPRIMER" in a confirmation input field,
**And** the modal has two buttons: "Confirmer la suppression" (red) and "Annuler" (neutral).

**Given** the user types "SUPPRIMER" and clicks "Confirmer la suppression",
**When** the deletion is processed,
**Then** the following data is permanently deleted from the database: `users.email`, `users.password_hash`, `users.display_name`,
**And** the `users.anonymous_id` is replaced with "Utilisateur supprimé",
**And** all entries in the `votes` table for this user are deleted,
**And** all submissions by this user have their `user_id` set to null and `author_display` set to "Utilisateur supprimé",
**And** all comments by this user have their `user_id` set to null and `author_display` set to "Utilisateur supprimé",
**And** the user's session is terminated and they are redirected to `/` with a flash message: "Votre compte a été supprimé.",
**And** the deletion completes within 30 seconds of confirmation.

---

## Epic 2: Waste Submission & Cost to Nicolas Engine

**Goal:** Nicolas can submit a government waste item and immediately see its personal financial impact broken down into relatable metrics (cost per citizen, cost per taxpayer, days of work, school lunch equivalents). The Cost to Nicolas engine runs as a Python FastAPI microservice and relies on cached INSEE/DGFIP denominators.

**FRs Covered:** FR1, FR5, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR21, FR32, FR33, FR34, FR35
**NFRs Integrated:** NFR3, NFR8, NFR13, NFR16, NFR20, NFR21, NFR22

---

### Story 2.1: Waste Submission Form

**As a** registered user (Nicolas),
**I want** to submit a government waste item with a title, description, estimated cost, and source URL,
**So that** my fellow citizens can see and vote on this fiscal outrage.

**Acceptance Criteria:**

**Given** a logged-in user navigates to `/submit`,
**When** the submission form renders,
**Then** the form displays the following fields:
  - `title`: text input, required, max 200 characters, with a live character counter showing "{count}/200"
  - `description`: textarea, required, max 2000 characters, with a live character counter showing "{count}/2000"
  - `estimated_cost_eur`: number input, required, minimum value 1, formatted with EUR currency display
  - `source_url`: URL input, required, must match `https?://` pattern
**And** every field has a visible `<label>` and descriptive placeholder text (NFR20),
**And** the submit button text is "Signaler ce gaspillage".

**Given** a Drizzle migration creates the `submissions` table (if not exists) with columns: `id` (UUID, PK), `user_id` (UUID, FK to users, nullable), `title` (varchar 200, not null), `description` (text, not null), `estimated_cost_eur` (decimal 15,2, not null), `source_url` (text, not null), `author_display` (varchar 100, not null), `status` (enum: 'pending' | 'approved' | 'rejected' | 'removed', default 'pending'), `score` (integer, default 0), `upvote_count` (integer, default 0), `downvote_count` (integer, default 0), `created_at` (timestamp), `updated_at` (timestamp),
**When** the user fills in all fields with valid data and submits,
**Then** a new row is inserted into the `submissions` table with `status = 'pending'`,
**And** the `source_url` is stored permanently and unmodified (NFR22),
**And** the `author_display` is set to the user's `display_name` or `anonymous_id`,
**And** all database queries use parameterized inputs via Drizzle ORM (NFR13),
**And** the user is redirected to a confirmation page showing "Votre signalement a été soumis et sera examiné par nos modérateurs.",
**And** the source URL is displayed prominently on the confirmation page with a clickable external link icon (FR5).

**Given** the user submits a form with validation errors,
**When** the server responds,
**Then** inline error messages appear below each invalid field with `role="alert"` (NFR20),
**And** the form preserves all previously entered values.

**Given** a logged-in user submits waste items,
**When** they exceed 10 submissions per minute from the same IP,
**Then** a `429 Too Many Requests` response is returned (NFR8).

---

### Story 2.2: Denominator Data Pipeline & Cache (Python FastAPI)

**As a** system operator,
**I want** the Cost to Nicolas engine to maintain a local cache of key demographic and fiscal denominators from official sources,
**So that** calculations are fast, independent of external APIs, and always available.

**Acceptance Criteria:**

**Given** the Python FastAPI microservice is initialized,
**When** the service starts,
**Then** a `denominators` table is created (if not exists) in the PostgreSQL database with columns: `id` (serial PK), `key` (varchar 100, unique, not null), `value` (decimal 20,4, not null), `source_name` (varchar 255, not null), `source_url` (text, not null), `last_updated` (timestamp, not null), `update_frequency` (varchar 50, default 'quarterly'), `created_at` (timestamp),
**And** the table is seeded with the following initial denominator rows:
  - `france_population`: value from latest INSEE estimate, source_url pointing to `insee.fr`
  - `income_tax_payers`: value from latest DGFIP/INSEE data, source_url pointing to official publication
  - `france_households`: value from latest INSEE data, source_url pointing to `insee.fr`
  - `daily_median_net_income`: calculated as (annual median net income / 365), source_url pointing to `insee.fr`
  - `school_lunch_cost`: published average cost per school lunch, source_url pointing to official source
  - `hospital_bed_day_cost`: published average cost per hospital bed-day, source_url pointing to official source.

**Given** the FastAPI service exposes a `GET /api/denominators` endpoint,
**When** a client requests the endpoint,
**Then** the response is a JSON array of all denominator objects with fields: `key`, `value`, `source_name`, `source_url`, `last_updated`,
**And** the response is served from the local database cache, not from external APIs (NFR16).

**Given** a configurable cron schedule (default: quarterly, configurable via `DENOMINATOR_UPDATE_CRON` environment variable),
**When** the scheduled job runs,
**Then** the service fetches the latest values from the official source URLs,
**And** updates the `denominators` table with new values and `last_updated` timestamps,
**And** logs a summary of which denominators were updated and their old vs. new values,
**And** if any external fetch fails, the existing cached value is retained and an error is logged (NFR16).

**Given** an administrator calls `POST /api/denominators/refresh` with a valid admin API key,
**When** the request is processed,
**Then** a manual refresh of all denominators is triggered immediately,
**And** the response confirms which denominators were updated.

---

### Story 2.3: Cost to Nicolas Calculation Engine

**As a** visitor or registered user (Nicolas),
**I want** the system to automatically calculate the personal financial impact of a government waste item,
**So that** I can understand what this waste means to me in relatable terms.

**Acceptance Criteria:**

**Given** the FastAPI service exposes a `POST /api/cost-to-nicolas` endpoint,
**When** a request is sent with body `{ "amount_eur": <number> }`,
**Then** the response is a JSON object with the following calculated fields:
  - `cost_per_citizen`: `amount_eur / france_population`, formatted to 4 decimal places (FR11)
  - `cost_per_taxpayer`: `amount_eur / income_tax_payers`, formatted to 4 decimal places (FR12)
  - `cost_per_household`: `amount_eur / france_households`, formatted to 4 decimal places (FR13)
  - `days_of_work_equivalent`: `cost_per_taxpayer / daily_median_net_income`, formatted to 2 decimal places (FR14)
  - `equivalences`: an array containing at least one object like `{ "label": "repas de cantine scolaire", "count": <number>, "unit_cost": <number>, "source_url": "<url>" }` computed as `cost_per_citizen / school_lunch_cost` (FR15)
  - `denominators_used`: an array of objects `{ "key": "<key>", "value": <number>, "source_url": "<url>", "last_updated": "<ISO date>" }` for every denominator used in the calculation (FR16)
**And** the total response time is under 5 seconds (NFR3).

**Given** the `amount_eur` is zero or negative,
**When** the request is processed,
**Then** a `400 Bad Request` response is returned with body `{ "error": "amount_eur must be a positive number" }`.

**Given** a denominator value in the cache is null or zero,
**When** the calculation is attempted,
**Then** the affected metric is omitted from the response with a `"unavailable": true` flag,
**And** the remaining metrics are still calculated and returned.

**Given** the Next.js frontend calls the Cost to Nicolas API for a submission,
**When** the results are returned,
**Then** the frontend stores the results in the `cost_to_nicolas_results` JSONB column on the `submissions` table (added via migration in this story) so subsequent views do not re-calculate,
**And** the cached result includes a `calculated_at` timestamp.

---

### Story 2.4: Data Status Page & Denominator Transparency

**As a** visitor (Nicolas),
**I want** to see a public data status page showing the freshness and sources of all denominators used in calculations,
**So that** I can trust the platform's numbers and verify them myself.

**Acceptance Criteria:**

**Given** a visitor navigates to `/data-status`,
**When** the page renders,
**Then** a table is displayed with columns: "Donnée" (denominator name in French), "Valeur actuelle" (current value, formatted with French number formatting), "Source" (clickable link to `source_url`), "Dernière mise à jour" (last_updated date in `DD/MM/YYYY` format), "Prochaine mise à jour" (next expected update based on `update_frequency`),
**And** the page title is "Statut des données - LIBERAL" (FR35).

**Given** a denominator was last updated more than 6 months ago,
**When** the table renders,
**Then** that row displays a yellow warning badge with text "Donnée potentiellement obsolète".

**Given** a denominator was last updated within the expected frequency window,
**When** the table renders,
**Then** that row displays a green checkmark badge with text "À jour".

**Given** any Cost to Nicolas calculation is displayed anywhere on the platform (submission detail page, feed card, share image),
**When** the calculation values are rendered,
**Then** each denominator-dependent value has a "Vérifier" (Verify this) link next to it that navigates to `/data-status` (NFR21),
**And** the last-updated date for the denominator is displayed in a tooltip or subtitle (FR34).

---

### Story 2.5: Calculation Methodology Page

**As a** visitor (Nicolas),
**I want** to read a clear explanation of every formula and data source used in Cost to Nicolas calculations,
**So that** I can understand and trust the methodology.

**Acceptance Criteria:**

**Given** a visitor navigates to `/methodologie`,
**When** the page renders,
**Then** the page displays the following sections in order:
  1. "Coût par citoyen" with the formula: `montant / population_france`, the current population value, and a link to the INSEE source
  2. "Coût par contribuable" with the formula: `montant / nombre_contribuables`, the current taxpayer count, and a link to the DGFIP/INSEE source
  3. "Coût par ménage" with the formula: `montant / nombre_menages`, the current household count, and a link to the INSEE source
  4. "Jours de travail équivalents" with the formula: `coût_par_contribuable / revenu_net_médian_journalier`, the current daily median income, and a link to the INSEE source
  5. "Équivalences concrètes" with the formula for each equivalence (e.g., `coût_par_citoyen / coût_repas_cantine`), the current unit cost, and a link to the source
**And** each section displays the current denominator value, the source institution name, and a clickable link to the official source URL (FR17),
**And** the page includes a "Dernière mise à jour des données" section showing when each denominator was last refreshed.

**Given** the methodology page is rendered,
**When** a screen reader traverses the page,
**Then** all mathematical formulas are wrapped in `<code>` elements with `aria-label` attributes describing the formula in plain French (NFR17).

---

### Story 2.6: Tweet URL Detection & Embedded Preview

**As a** visitor (Nicolas),
**I want** the system to detect tweet URLs in submission sources and display an embedded tweet preview,
**So that** I can see the original social media context of the reported waste.

**Acceptance Criteria:**

**Given** a submission has a `source_url` matching the pattern `https://(twitter.com|x.com)/*/status/*`,
**When** the submission detail page renders,
**Then** an embedded tweet preview is displayed alongside the submission details using Twitter's oEmbed API or the `react-tweet` library (FR21),
**And** the embed is loaded lazily (after the main content renders) to avoid blocking LCP,
**And** if the tweet embed fails to load (deleted tweet, API error), a fallback card is displayed with the tweet URL as a clickable link and the text "Tweet indisponible - voir le lien original".

**Given** a submission has a `source_url` that does NOT match a tweet URL pattern,
**When** the submission detail page renders,
**Then** no tweet embed is shown,
**And** the source URL is displayed as a prominent clickable link with an external-link icon (FR5).

**Given** the tweet embed loads,
**When** the user views it,
**Then** the embed does not set any third-party tracking cookies until the user interacts with it (NFR12).

---

## Epic 3: Community Feed & Voting

**Goal:** Nicolas can browse a feed of fiscal outrages, sort by different criteria, view detailed submission pages, and cast votes to express agreement or disagreement. The voting system is optimistic, fast, and resilient to viral load spikes.

**FRs Covered:** FR2, FR3, FR6, FR7, FR8, FR9
**NFRs Integrated:** NFR1, NFR2, NFR5, NFR14, NFR15, NFR17, NFR18, NFR19, NFR23

---

### Story 3.1: Submission Feed with Sort Tabs & Pagination

**As a** visitor (Nicolas),
**I want** to browse a feed of government waste submissions with sorting options,
**So that** I can discover the most outrageous or newest fiscal waste.

**Acceptance Criteria:**

**Given** a visitor navigates to `/feed` (or `/`),
**When** the feed page renders,
**Then** the page displays three sort tabs at the top: "Tendances" (Hot), "Top" (Top), and "Récent" (New),
**And** the default active tab is "Tendances" (Hot),
**And** the URL updates to reflect the active tab: `/feed?sort=hot`, `/feed?sort=top`, `/feed?sort=new`.

**Given** the "Tendances" (Hot) tab is active,
**When** submissions are loaded,
**Then** submissions are sorted by a trending algorithm: `score / (hours_since_creation + 2)^1.5` (FR2, FR8),
**And** only submissions with `status = 'approved'` are displayed.

**Given** the "Top" tab is active,
**When** submissions are loaded,
**Then** submissions are sorted by `score` descending (FR2, FR8).

**Given** the "Récent" (New) tab is active,
**When** submissions are loaded,
**Then** submissions are sorted by `created_at` descending (FR2).

**Given** the feed loads,
**When** submission cards render,
**Then** each card displays: title (truncated to 120 chars with ellipsis), estimated cost formatted as EUR (e.g., "12 500 000 EUR"), cost per citizen from Cost to Nicolas, vote score with upvote/downvote arrows, source URL domain name (e.g., "lemonde.fr"), and relative time (e.g., "il y a 3h") (FR9),
**And** each card is a clickable link to `/submissions/{id}`,
**And** a skeleton loading state with 5 placeholder cards is shown while data is fetching.

**Given** the feed contains more than 20 submissions,
**When** the user scrolls to the bottom of the list,
**Then** the next 20 submissions are loaded via infinite scroll (cursor-based pagination),
**And** each page load completes within 1 second (NFR5),
**And** the Largest Contentful Paint of the initial feed page is under 2.5 seconds on a simulated 4G connection (NFR1).

---

### Story 3.2: Submission Detail Page

**As a** visitor (Nicolas),
**I want** to view a detailed page for any submission with its full description, Cost to Nicolas breakdown, and source link,
**So that** I can fully understand the fiscal waste and verify the claim.

**Acceptance Criteria:**

**Given** a visitor navigates to `/submissions/{id}`,
**When** the submission detail page renders,
**Then** the page displays:
  - Title as `<h1>` (FR3)
  - Full description text
  - Estimated cost formatted as "XX XXX XXX EUR" with French number formatting
  - Source URL displayed as a prominent clickable button with text "Vérifier la source" and an external-link icon (FR5)
  - Vote score with upvote and downvote buttons (showing current count)
  - Author display name and relative submission date
  - Submission status badge (if pending/rejected, visible only to the author)

**Given** the submission has Cost to Nicolas results cached in the `cost_to_nicolas_results` JSONB column,
**When** the detail page renders,
**Then** a "Coût pour Nicolas" section is displayed with:
  - Cost per citizen, formatted in EUR with 2 decimal places
  - Cost per taxpayer, formatted in EUR with 2 decimal places
  - Cost per household, formatted in EUR with 2 decimal places
  - Days of work equivalent, formatted as "X,X jours de travail"
  - At least one concrete equivalence (e.g., "Soit X repas de cantine scolaire")
  - Each value has a "Vérifier" link pointing to `/data-status` (NFR21)

**Given** the submission does NOT have cached Cost to Nicolas results,
**When** the detail page renders,
**Then** the Cost to Nicolas section shows a loading spinner,
**And** a background request is made to the FastAPI `/api/cost-to-nicolas` endpoint,
**And** once results return, they are displayed and cached on the submission record.

**Given** a visitor navigates to `/submissions/{id}` with an invalid or nonexistent ID,
**When** the server processes the request,
**Then** a 404 page is returned with the message "Signalement introuvable".

---

### Story 3.3: Upvote/Downvote Mechanics with Optimistic UI

**As a** registered user (Nicolas),
**I want** to upvote or downvote a submission with instant visual feedback,
**So that** I can express my opinion and influence the ranking of fiscal outrages.

**Acceptance Criteria:**

**Given** a Drizzle migration creates the `votes` table (if not exists) with columns: `id` (UUID, PK), `user_id` (UUID, FK to users, not null), `submission_id` (UUID, FK to submissions, not null), `direction` (enum: 'up' | 'down', not null), `created_at` (timestamp), `updated_at` (timestamp), and a unique constraint on `(user_id, submission_id)`,
**When** the migration runs,
**Then** the table is created with the unique constraint enforced at the database level (FR6).

**Given** a logged-in user clicks the upvote arrow on a submission,
**When** the click is registered,
**Then** the UI optimistically updates within 100ms: the upvote arrow turns `chainsaw-red`, the score increments by 1 (NFR2),
**And** a `POST /api/votes` request is sent with body `{ "submission_id": "<id>", "direction": "up" }`,
**And** the server confirms the vote within 500ms (NFR2),
**And** if the server returns an error, the optimistic update is rolled back and an error toast is displayed.

**Given** a logged-in user who has already upvoted clicks the downvote arrow,
**When** the click is registered,
**Then** the UI optimistically updates: the upvote arrow returns to neutral, the downvote arrow turns `text-secondary`, and the score decrements by 2 (removing upvote and adding downvote) (FR7),
**And** a `PATCH /api/votes` request is sent to change the vote direction.

**Given** a logged-in user who has already voted clicks the same vote direction again,
**When** the click is registered,
**Then** the vote is removed (unvoted): the arrow returns to neutral and the score adjusts accordingly (FR7).

**Given** a visitor (not logged in) clicks a vote arrow,
**When** the click is registered,
**Then** a modal or toast appears with the text "Connectez-vous pour voter" and a link to `/auth/login`.

**Given** a Redis (Upstash) instance is configured,
**When** votes are cast,
**Then** vote counts are cached in Redis with key `submission:{id}:score` and synced to PostgreSQL within 5 seconds (NFR23),
**And** the system handles 1000+ concurrent vote operations without data loss (NFR15).

---

### Story 3.4: Score Calculation & Feed Ranking Algorithm

**As a** system,
**I want** to calculate submission scores and apply ranking algorithms,
**So that** the most relevant and engaging content surfaces to the top of the feed.

**Acceptance Criteria:**

**Given** a vote is cast or changed on a submission,
**When** the vote is persisted,
**Then** the submission's `score` is recalculated as `upvote_count - downvote_count` (FR8),
**And** the `upvote_count` and `downvote_count` columns are updated atomically in a single database transaction.

**Given** the Hot (Tendances) sort is applied to the feed,
**When** submissions are queried,
**Then** the ranking formula `score / (hours_since_creation + 2)^1.5` is computed,
**And** submissions are ordered by this rank descending,
**And** submissions older than 7 days with a score below 10 are excluded from the Hot feed to keep it fresh.

**Given** the Top sort is applied with a time filter,
**When** submissions are queried,
**Then** the system supports time filters: "Aujourd'hui" (today), "Cette semaine" (this week), "Ce mois" (this month), "Tout temps" (all time),
**And** the default time filter for Top is "Cette semaine".

**Given** the Redis vote cache contains a score for a submission,
**When** the feed is loaded,
**Then** the score displayed uses the Redis-cached value for real-time accuracy,
**And** the PostgreSQL `score` column is treated as the eventual source of truth, synced within 5 seconds (NFR23).

**Given** the feed is loaded under high traffic,
**When** the server processes requests,
**Then** feed queries use database indexes on `(status, score)`, `(status, created_at)`, and a computed column or materialized view for hot ranking,
**And** the query execution time is under 100ms for the first page of results (NFR14).

---

### Story 3.5: Feed Accessibility & Mobile Optimization

**As a** visitor using assistive technology or a mobile device,
**I want** the feed and voting interface to be fully accessible and mobile-optimized,
**So that** I can participate regardless of my device or abilities.

**Acceptance Criteria:**

**Given** the feed page is rendered on a mobile viewport (< 768px),
**When** the user views the page,
**Then** submission cards are displayed in a single-column layout with touch-friendly tap targets (minimum 44x44px),
**And** the bottom tab bar highlights the "Feed" tab as active,
**And** sort tabs are horizontally scrollable if they overflow the viewport width.

**Given** a screen reader traverses the feed,
**When** each submission card is read,
**Then** the card has `role="article"` and an `aria-label` describing: "{title}, score: {score}, coût: {cost} EUR" (NFR17),
**And** vote buttons have `aria-label="Voter pour"` and `aria-label="Voter contre"` respectively,
**And** the current vote state is announced: `aria-pressed="true"` when voted, `aria-pressed="false"` when not voted.

**Given** a user navigates the feed using keyboard only,
**When** they press Tab,
**Then** focus moves logically through: sort tabs, then each submission card (entering the card focuses the title link, then upvote button, then downvote button), then the "load more" trigger (NFR18),
**And** all focused elements have a visible `ring-2 ring-chainsaw-red` outline.

**Given** any text element in the feed,
**When** its contrast ratio is measured against the background,
**Then** all text meets a minimum 4.5:1 contrast ratio (NFR19),
**And** the `chainsaw-red` (#DC2626) on `bg-dark` (#0A0A0A) has a contrast ratio of at least 4.5:1.

---

## Epic 4: Social Sharing & Virality

**Goal:** Nicolas can share outrages on social media with auto-generated branded images and proper Open Graph metadata, maximizing the viral potential of each submission and driving new users to the platform.

**FRs Covered:** FR18, FR19, FR20
**NFRs Integrated:** NFR4, NFR17

---

### Story 4.1: Auto-Generated Shareable Image (OG Image)

**As a** system,
**I want** to auto-generate a branded PNG image for each submission,
**So that** shares on social media display a compelling visual preview with LIBERAL branding.

**Acceptance Criteria:**

**Given** a submission with `status = 'approved'` exists,
**When** the image generation endpoint `GET /api/og-image/{submission_id}` is called,
**Then** a PNG image is returned with dimensions 1200x630 pixels (OG standard),
**And** the image contains:
  - LIBERAL logo and chainsaw icon in the top-left corner
  - Submission title (truncated to 100 chars if needed, white text on dark background)
  - Estimated cost in large, bold text formatted as "XX XXX XXX EUR" in `chainsaw-red`
  - Cost to Nicolas summary: "Coût pour chaque Français : X,XX EUR" in white text
  - Footer with "liberal.fr" URL and the tagline
**And** the image uses the brand dark background (`#0A0A0A`) with `chainsaw-red` (#DC2626) accents,
**And** the image is generated in under 3 seconds (NFR4),
**And** the generated image is cached (CDN or filesystem) so subsequent requests for the same submission are served instantly.

**Given** the image generation uses `@vercel/og` (Satori) or a similar edge-compatible library,
**When** the image is generated,
**Then** no headless browser is required (serverless-compatible),
**And** the image text is rendered with the Inter font to match the platform typography.

**Given** a submission's title or cost is updated,
**When** the image is requested again,
**Then** the cached image is invalidated and regenerated with the updated content.

---

### Story 4.2: Social Share Buttons

**As a** visitor (Nicolas),
**I want** one-click share buttons for Twitter/X, Facebook, WhatsApp, and copy-link on every submission,
**So that** I can easily spread awareness of fiscal outrages to my network.

**Acceptance Criteria:**

**Given** a visitor views a submission detail page at `/submissions/{id}`,
**When** the page renders,
**Then** a share toolbar is displayed with four buttons in this order: Twitter/X, Facebook, WhatsApp, Copy Link,
**And** each button has a recognizable icon and `aria-label` describing the action (NFR17).

**Given** the user clicks the Twitter/X share button,
**When** the click is processed,
**Then** a new window/tab opens with the URL: `https://twitter.com/intent/tweet?text={encodedText}&url={encodedSubmissionUrl}`,
**And** the `text` parameter contains: "{title} - {cost_per_citizen} EUR par Français #LIBERAL #GaspillagePublic" (FR19).

**Given** the user clicks the Facebook share button,
**When** the click is processed,
**Then** a new window opens with the URL: `https://www.facebook.com/sharer/sharer.php?u={encodedSubmissionUrl}` (FR19).

**Given** the user clicks the WhatsApp share button,
**When** the click is processed,
**Then** a new window opens with the URL: `https://wa.me/?text={encodedText}%20{encodedSubmissionUrl}`,
**And** the `text` contains: "{title} - Ça coûte {cost_per_citizen} EUR à chaque Français !" (FR19).

**Given** the user clicks the Copy Link button,
**When** the click is processed,
**Then** the submission URL is copied to the clipboard,
**And** the button text temporarily changes to "Lien copié !" for 2 seconds with a checkmark icon,
**And** a toast notification confirms the copy action.

**Given** the share toolbar is rendered on a mobile viewport,
**When** the user views it,
**Then** the buttons are displayed as a horizontal row with equal spacing,
**And** each button has a minimum tap target of 44x44px.

---

### Story 4.3: Open Graph & Twitter Card Metadata

**As a** system,
**I want** every submission page to have proper Open Graph and Twitter Card metadata,
**So that** links shared on social media display a rich preview with the auto-generated image.

**Acceptance Criteria:**

**Given** a submission page at `/submissions/{id}` is rendered,
**When** the HTML `<head>` is generated (via Next.js `generateMetadata`),
**Then** the following meta tags are present:
  - `<meta property="og:title" content="{submission.title}" />`
  - `<meta property="og:description" content="Ce gaspillage coûte {cost_per_citizen} EUR à chaque Français. {submission.description (truncated to 200 chars)}" />`
  - `<meta property="og:image" content="https://liberal.fr/api/og-image/{submission.id}" />`
  - `<meta property="og:image:width" content="1200" />`
  - `<meta property="og:image:height" content="630" />`
  - `<meta property="og:url" content="https://liberal.fr/submissions/{submission.id}" />`
  - `<meta property="og:type" content="article" />`
  - `<meta property="og:site_name" content="LIBERAL" />`
  - `<meta property="og:locale" content="fr_FR" />`
  - `<meta name="twitter:card" content="summary_large_image" />`
  - `<meta name="twitter:site" content="@LIBERAL_FR" />`
  - `<meta name="twitter:title" content="{submission.title}" />`
  - `<meta name="twitter:description" content="Ce gaspillage coûte {cost_per_citizen} EUR à chaque Français." />`
  - `<meta name="twitter:image" content="https://liberal.fr/api/og-image/{submission.id}" />`
(FR20)

**Given** a social media crawler (Facebook, Twitter, LinkedIn) fetches the submission URL,
**When** the HTML is returned,
**Then** the crawler receives fully rendered meta tags (not requiring JavaScript execution),
**And** the OG image URL returns a valid PNG within 3 seconds.

**Given** the home page at `/` is rendered,
**When** the HTML `<head>` is generated,
**Then** default Open Graph tags are present with the LIBERAL logo as the OG image and a description: "LIBERAL - Plateforme citoyenne de responsabilité fiscale. Découvrez ce que le gaspillage public vous coûte."

---

### Story 4.4: Share Analytics & Viral Loop Tracking

**As a** system operator,
**I want** to track share button clicks and referral traffic without invasive cookies,
**So that** I can understand which submissions go viral and optimize the sharing experience.

**Acceptance Criteria:**

**Given** a Drizzle migration creates the `share_events` table (if not exists) with columns: `id` (UUID, PK), `submission_id` (UUID, FK to submissions, not null), `platform` (enum: 'twitter' | 'facebook' | 'whatsapp' | 'copy_link', not null), `created_at` (timestamp),
**When** a user clicks any share button,
**Then** a `POST /api/share-events` request is sent with `{ "submission_id": "<id>", "platform": "<platform>" }`,
**And** a new row is inserted into the `share_events` table,
**And** no personal data or cookies are stored in connection with the event (NFR12).

**Given** a visitor arrives at `/submissions/{id}` with a `?ref=twitter` query parameter,
**When** the page loads,
**Then** the referral source is logged in a `page_views` table with the `ref` parameter value,
**And** no cookies or persistent identifiers are set on the visitor (NFR12).

**Given** an administrator views the admin dashboard,
**When** they navigate to the sharing statistics section,
**Then** a summary shows: total shares per platform (last 7 days, 30 days, all time), top 10 most-shared submissions, and referral traffic breakdown.

---

## Epic 5: Comments & Community Discussion

**Goal:** Nicolas can engage in discussions on submissions, debate the accuracy of claims, and build community around fiscal accountability. Comments support threading (max 2 levels on mobile) and voting.

**FRs Covered:** (UX-driven requirement, no specific FR numbers)
**NFRs Integrated:** NFR8, NFR13, NFR17, NFR18, NFR19, NFR20

---

### Story 5.1: Comment Submission & Threading

**As a** registered user (Nicolas),
**I want** to post comments on submissions and reply to other comments,
**So that** I can discuss, debate, and provide additional context on fiscal waste claims.

**Acceptance Criteria:**

**Given** a Drizzle migration creates the `comments` table (if not exists) with columns: `id` (UUID, PK), `submission_id` (UUID, FK to submissions, not null), `user_id` (UUID, FK to users, nullable), `parent_comment_id` (UUID, FK to comments, nullable), `body` (text, not null, max 1000 chars), `author_display` (varchar 100, not null), `score` (integer, default 0), `upvote_count` (integer, default 0), `downvote_count` (integer, default 0), `depth` (integer, not null, default 0), `created_at` (timestamp), `updated_at` (timestamp),
**When** the migration runs,
**Then** the table is created with a check constraint: `depth <= 2`.

**Given** a logged-in user views a submission detail page at `/submissions/{id}`,
**When** the comment section renders below the submission content,
**Then** a comment form is displayed with a textarea (max 1000 chars, with character counter), a `<label>` "Votre commentaire" (NFR20), and a "Publier" submit button.

**Given** the user types a comment and clicks "Publier",
**When** the comment is submitted,
**Then** a new row is inserted into the `comments` table with `depth = 0` and `parent_comment_id = null`,
**And** the comment appears immediately at the top of the comment list (optimistic update),
**And** all inputs use parameterized queries (NFR13).

**Given** a logged-in user clicks "Répondre" on an existing comment at depth 0 or 1,
**When** the reply form appears inline below the comment,
**Then** the reply textarea (max 1000 chars) is displayed with a "Publier la réponse" button,
**And** submitting the reply inserts a row with `parent_comment_id = {parent_id}` and `depth = parent_depth + 1`.

**Given** a comment is at depth 2 (maximum nesting),
**When** the comment renders,
**Then** no "Répondre" button is displayed,
**And** on mobile viewports, depth-2 replies are indented by 16px per level (max 32px total).

**Given** the user exceeds 10 comments per minute,
**When** they attempt to post another comment,
**Then** a `429 Too Many Requests` response is returned (NFR8).

---

### Story 5.2: Comment Voting

**As a** registered user (Nicolas),
**I want** to upvote or downvote comments,
**So that** the most helpful and accurate comments rise to the top.

**Acceptance Criteria:**

**Given** a Drizzle migration creates the `comment_votes` table (if not exists) with columns: `id` (UUID, PK), `user_id` (UUID, FK to users, not null), `comment_id` (UUID, FK to comments, not null), `direction` (enum: 'up' | 'down', not null), `created_at` (timestamp), and a unique constraint on `(user_id, comment_id)`,
**When** the migration runs,
**Then** the table is created with the unique constraint enforced at the database level.

**Given** a logged-in user clicks the upvote arrow on a comment,
**When** the click is registered,
**Then** the UI optimistically updates: the arrow turns `chainsaw-red`, the comment score increments by 1,
**And** a `POST /api/comment-votes` request is sent with `{ "comment_id": "<id>", "direction": "up" }`,
**And** the vote is persisted and the comment's `score`, `upvote_count`, and `downvote_count` are updated.

**Given** a user changes their comment vote or removes it,
**When** the action is processed,
**Then** the behavior mirrors the submission voting logic from Story 3.3 (toggle off, or switch direction).

**Given** comments are displayed on a submission detail page,
**When** the comment list renders,
**Then** comments at depth 0 are sorted by `score` descending (best first),
**And** replies within a thread are sorted by `created_at` ascending (chronological).

---

### Story 5.3: Comment Display & Pagination

**As a** visitor (Nicolas),
**I want** to read comments on a submission page with proper threading and pagination,
**So that** I can follow the community discussion without overwhelming page load.

**Acceptance Criteria:**

**Given** a submission has comments,
**When** the submission detail page renders the comment section,
**Then** the first 20 top-level comments (depth 0) are loaded, sorted by score descending,
**And** for each top-level comment, up to 3 direct replies are shown inline,
**And** if a comment has more than 3 replies, a "Voir {n} autres réponses" link is displayed.

**Given** the user clicks "Voir {n} autres réponses",
**When** the additional replies load,
**Then** all remaining replies for that thread are fetched and inserted below the parent comment,
**And** a skeleton loading state is shown during the fetch.

**Given** there are more than 20 top-level comments,
**When** the user scrolls to the bottom of the comment section,
**Then** a "Charger plus de commentaires" button is displayed,
**And** clicking it loads the next 20 top-level comments with their replies.

**Given** a submission has zero comments,
**When** the comment section renders,
**Then** an empty state is displayed with the text "Soyez le premier à commenter ce signalement" and the comment form is prominently displayed.

---

### Story 5.4: Comment Accessibility & Mobile Layout

**As a** visitor using assistive technology or a mobile device,
**I want** comments to be fully accessible and well-formatted on small screens,
**So that** I can read and participate in discussions regardless of device or ability.

**Acceptance Criteria:**

**Given** the comment section is rendered,
**When** a screen reader traverses the comments,
**Then** each comment has `role="article"` with an `aria-label`: "{author_display} a commenté : {body (truncated to 50 chars)}, score : {score}" (NFR17),
**And** the reply button has `aria-label="Répondre au commentaire de {author_display}"`,
**And** threaded replies are wrapped in a `<section>` with `aria-label="Réponses au commentaire de {author_display}"`.

**Given** the comment section is rendered on a mobile viewport (< 768px),
**When** the user views comments,
**Then** depth-0 comments have no left indentation,
**And** depth-1 replies are indented by 16px with a `border-left: 2px solid #DC2626`,
**And** depth-2 replies are indented by 32px with the same border style,
**And** all comment action buttons (vote, reply) have a minimum tap target of 44x44px.

**Given** a user navigates comments with keyboard only,
**When** they press Tab within the comment section,
**Then** focus moves through: comment body, upvote button, downvote button, reply button, then to the next comment (NFR18),
**And** all focused elements have a visible `ring-2 ring-chainsaw-red` outline.

**Given** any text in the comment section,
**When** its contrast ratio is measured,
**Then** all text meets a minimum 4.5:1 contrast ratio (NFR19).

---

## Epic 6: Moderation & Administration

**Goal:** Administrators can review, approve, and manage submissions, handle flagged content, and broadcast top-voted outrages via the @LIBERAL_FR Twitter/X account. Users can flag problematic content for review.

**FRs Covered:** FR4, FR26, FR27, FR28, FR29, FR30
**NFRs Integrated:** NFR8, NFR13, NFR17

---

### Story 6.1: Moderation Queue & Submission Review

**As an** administrator,
**I want** to view and process a queue of pending submissions,
**So that** only verified, appropriate content is published to the community feed.

**Acceptance Criteria:**

**Given** an administrator (user with `role = 'admin'`) navigates to `/admin/moderation`,
**When** the moderation queue renders,
**Then** a list of submissions with `status = 'pending'` is displayed, sorted by `created_at` ascending (oldest first),
**And** each item shows: title, description (first 200 chars), estimated cost, source URL (clickable), author display name, and submission date (FR26),
**And** the queue displays a count badge: "{n} signalements en attente".

**Given** an administrator views a pending submission in the queue,
**When** they click on it,
**Then** a detail panel or page shows the full submission content including: complete title, full description, estimated cost, source URL (clickable, opens in new tab), author display, and any existing Cost to Nicolas calculation.

**Given** an administrator clicks "Approuver" on a pending submission,
**When** the action is processed,
**Then** the submission's `status` is updated to `'approved'`,
**And** the submission becomes visible in the public feed,
**And** a success toast displays "Signalement approuvé" (FR27).

**Given** an administrator clicks "Rejeter" on a pending submission,
**When** the rejection form appears,
**Then** a textarea for the rejection reason is displayed (required, max 500 chars),
**And** submitting the rejection updates the submission's `status` to `'rejected'`,
**And** the rejection reason is stored in a `moderation_actions` table with columns: `id` (UUID, PK), `submission_id` (UUID, FK), `admin_user_id` (UUID, FK), `action` (enum: 'approve' | 'reject' | 'request_edit' | 'remove'), `reason` (text, nullable), `created_at` (timestamp) (FR27).

**Given** an administrator clicks "Demander des modifications" on a pending submission,
**When** the edit request form appears,
**Then** a textarea for the requested changes is displayed (required, max 500 chars),
**And** submitting updates the submission's `status` to a transient state and notifies the author via their profile page (FR27).

**Given** a non-admin user attempts to access `/admin/moderation`,
**When** the server checks authorization,
**Then** a `403 Forbidden` response is returned and the user is redirected to `/feed`.

---

### Story 6.2: Published Submission Removal

**As an** administrator,
**I want** to remove published submissions that violate terms of service,
**So that** the platform remains a credible and safe space for fiscal accountability.

**Acceptance Criteria:**

**Given** an administrator navigates to any approved submission's detail page,
**When** the page renders for an admin user,
**Then** an additional "Retirer" (Remove) button is displayed in a moderation toolbar at the top of the page,
**And** the button is styled with a red outline to indicate a destructive action.

**Given** an administrator clicks "Retirer" on an approved submission,
**When** the removal confirmation modal appears,
**Then** the modal displays: "Êtes-vous sûr de vouloir retirer ce signalement ? Il ne sera plus visible dans le feed public.",
**And** a textarea for the removal reason is required (max 500 chars),
**And** the modal has "Confirmer le retrait" (red) and "Annuler" (neutral) buttons.

**Given** the administrator confirms the removal,
**When** the action is processed,
**Then** the submission's `status` is updated to `'removed'` (FR28),
**And** the submission is no longer visible in the public feed or search results,
**And** the submission page at `/submissions/{id}` displays a notice: "Ce signalement a été retiré par la modération.",
**And** a row is inserted into the `moderation_actions` table with `action = 'remove'` and the provided reason,
**And** the action is logged with the admin's user ID and timestamp.

**Given** an administrator navigates to `/admin/removed`,
**When** the page renders,
**Then** a list of all removed submissions is displayed with: title, removal date, reason, and the admin who removed it.

---

### Story 6.3: User Flagging & Flagged Content Queue

**As a** registered user (Nicolas),
**I want** to flag a submission as inaccurate, spam, or inappropriate,
**So that** moderators can review potentially problematic content.

**As an** administrator,
**I want** to view flagged submissions sorted by flag count,
**So that** I can prioritize reviewing the most-reported content.

**Acceptance Criteria:**

**Given** a Drizzle migration creates the `flags` table (if not exists) with columns: `id` (UUID, PK), `submission_id` (UUID, FK to submissions, not null), `user_id` (UUID, FK to users, not null), `reason` (enum: 'inaccurate' | 'spam' | 'inappropriate', not null), `details` (text, nullable, max 500 chars), `created_at` (timestamp), and a unique constraint on `(user_id, submission_id)`,
**When** the migration runs,
**Then** the table is created.

**Given** a logged-in user views a submission detail page,
**When** the page renders,
**Then** a "Signaler" (Flag) button with a flag icon is displayed in the submission actions area.

**Given** the user clicks "Signaler",
**When** the flag form modal appears,
**Then** the modal displays three radio options: "Informations inexactes" (inaccurate), "Spam" (spam), "Contenu inapproprié" (inappropriate),
**And** an optional textarea for additional details (max 500 chars),
**And** a "Envoyer le signalement" submit button (FR4).

**Given** the user submits the flag form,
**When** the flag is processed,
**Then** a new row is inserted into the `flags` table,
**And** a success toast displays "Merci, votre signalement a été enregistré.",
**And** if the user has already flagged this submission (unique constraint violation), an error toast displays "Vous avez déjà signalé ce contenu."

**Given** an administrator navigates to `/admin/flags`,
**When** the flagged content page renders,
**Then** a list of submissions is displayed, ordered by total flag count descending (FR29),
**And** each item shows: title, total flags count, breakdown by reason (e.g., "3 inexact, 2 spam, 1 inapproprié"), submission status, and the most recent flag date,
**And** each item has quick-action buttons: "Voir" (view detail), "Approuver" (dismiss flags), "Retirer" (remove submission).

---

### Story 6.4: Twitter/X Broadcast Tool

**As an** administrator,
**I want** to select top-voted submissions for broadcast via the @LIBERAL_FR Twitter/X account,
**So that** the most impactful fiscal outrages reach a wider audience.

**Acceptance Criteria:**

**Given** an administrator navigates to `/admin/broadcast`,
**When** the broadcast page renders,
**Then** a list of approved submissions is displayed, sorted by score descending,
**And** each item shows: title, score, estimated cost, cost per citizen, and a "Sélectionner pour diffusion" button,
**And** submissions already broadcast have a "Déjà diffusé" badge with the broadcast date (FR30).

**Given** a Drizzle migration creates the `broadcasts` table (if not exists) with columns: `id` (UUID, PK), `submission_id` (UUID, FK to submissions, not null), `admin_user_id` (UUID, FK to users, not null), `tweet_text` (text, not null), `tweet_url` (text, nullable), `status` (enum: 'draft' | 'sent' | 'failed', default 'draft'), `created_at` (timestamp), `sent_at` (timestamp, nullable),
**When** the migration runs,
**Then** the table is created.

**Given** an administrator clicks "Sélectionner pour diffusion" on a submission,
**When** the broadcast composer opens,
**Then** a pre-filled tweet text is generated: "{title}\n\nCoût pour chaque Français : {cost_per_citizen} EUR\n\n{submission_url}\n\n#LIBERAL #GaspillagePublic #ChaqueEuroCompte",
**And** the administrator can edit the tweet text (max 280 chars with a character counter),
**And** the auto-generated share image is displayed as a preview.

**Given** the administrator clicks "Publier sur @LIBERAL_FR",
**When** the tweet is sent via the Twitter/X API (using stored OAuth credentials),
**Then** the broadcast's `status` is updated to `'sent'` and `tweet_url` is populated with the live tweet URL,
**And** a success toast displays "Tweet publié avec succès !".

**Given** the Twitter/X API is unavailable or returns an error,
**When** the broadcast attempt fails,
**Then** the broadcast's `status` is updated to `'failed'`,
**And** an error toast displays "Erreur lors de la publication. Réessayez.",
**And** the administrator can retry the broadcast.

---

### Story 6.5: Admin Dashboard Overview

**As an** administrator,
**I want** a dashboard overview of platform activity and moderation metrics,
**So that** I can monitor platform health and prioritize my moderation efforts.

**Acceptance Criteria:**

**Given** an administrator navigates to `/admin`,
**When** the admin dashboard renders,
**Then** the following summary cards are displayed:
  - "En attente de modération" with the count of `status = 'pending'` submissions
  - "Signalements" with the total count of unresolved flags
  - "Utilisateurs actifs" with the count of users who voted or submitted in the last 7 days
  - "Signalements publiés" with the total count of `status = 'approved'` submissions
  - "Tweets diffusés" with the count of `status = 'sent'` broadcasts this month

**Given** the dashboard is rendered,
**When** the administrator views the activity feed section,
**Then** a chronological list of the 20 most recent moderation actions is displayed, each showing: action type (approve/reject/remove), submission title (truncated), admin name, and timestamp.

**Given** the dashboard is rendered,
**When** the administrator views the quick links section,
**Then** links are provided to: Moderation Queue (`/admin/moderation`), Flagged Content (`/admin/flags`), Broadcast Tool (`/admin/broadcast`), Feature Voting Results (`/admin/features`), and Data Status (`/data-status`).

**Given** a non-admin user attempts to access any `/admin/*` route,
**When** the server checks authorization,
**Then** a `403 Forbidden` response is returned and the user is redirected to `/feed`.

---

## Epic 7: Community Feature Voting & Platform Democracy

**Goal:** Nicolas can vote on proposed platform features to influence the development roadmap, reinforcing the democratic spirit of the platform. Administrators can manage feature proposals and view results.

**FRs Covered:** FR10, FR31
**NFRs Integrated:** NFR8, NFR17, NFR18, NFR20

---

### Story 7.1: Feature Proposal Display & Voting

**As a** registered user (Nicolas),
**I want** to browse proposed platform features and vote on the ones I want built,
**So that** I can influence the development roadmap and feel ownership of the platform's direction.

**Acceptance Criteria:**

**Given** a Drizzle migration creates the `feature_proposals` table (if not exists) with columns: `id` (UUID, PK), `title` (varchar 200, not null), `description` (text, not null), `status` (enum: 'open' | 'in_progress' | 'completed' | 'rejected', default 'open'), `vote_count` (integer, default 0), `created_by` (UUID, FK to users, nullable), `created_at` (timestamp), `updated_at` (timestamp),
**And** a `feature_votes` table with columns: `id` (UUID, PK), `user_id` (UUID, FK to users, not null), `feature_id` (UUID, FK to feature_proposals, not null), `created_at` (timestamp), and a unique constraint on `(user_id, feature_id)`,
**When** the migrations run,
**Then** both tables are created.

**Given** a visitor navigates to `/features`,
**When** the feature voting page renders,
**Then** a list of feature proposals with `status = 'open'` is displayed, sorted by `vote_count` descending (FR10),
**And** each proposal card shows: title, description (first 200 chars), current vote count, and status badge,
**And** a progress bar or rank indicator shows relative popularity.

**Given** a logged-in user clicks "Voter" on a feature proposal they haven't voted for,
**When** the vote is processed,
**Then** a row is inserted into the `feature_votes` table,
**And** the `feature_proposals.vote_count` is incremented by 1,
**And** the button changes to "Voté" with a checkmark icon,
**And** the UI updates optimistically.

**Given** a logged-in user clicks "Voté" on a feature they have already voted for,
**When** the unvote is processed,
**Then** the row is deleted from the `feature_votes` table,
**And** the `vote_count` is decremented by 1,
**And** the button reverts to "Voter".

**Given** a visitor (not logged in) clicks "Voter",
**When** the click is registered,
**Then** a prompt appears: "Connectez-vous pour voter sur les fonctionnalités" with a link to `/auth/login`.

---

### Story 7.2: Feature Proposal Submission

**As a** registered user (Nicolas),
**I want** to propose new platform features for community voting,
**So that** I can suggest improvements that matter to me and the community.

**Acceptance Criteria:**

**Given** a logged-in user navigates to `/features`,
**When** the page renders,
**Then** a "Proposer une fonctionnalité" button is displayed at the top of the page.

**Given** the user clicks "Proposer une fonctionnalité",
**When** the proposal form appears (modal or inline),
**Then** the form displays:
  - `title`: text input, required, max 200 chars, with label "Titre de la fonctionnalité" (NFR20)
  - `description`: textarea, required, max 1000 chars, with label "Décrivez la fonctionnalité souhaitée" (NFR20)
  - A "Soumettre" button and a "Annuler" button.

**Given** the user submits a valid proposal,
**When** the proposal is processed,
**Then** a new row is inserted into the `feature_proposals` table with `status = 'open'` and `created_by = {user_id}`,
**And** the proposal appears in the list (may require admin approval depending on configuration),
**And** a success toast displays "Votre proposition a été soumise. Merci !".

**Given** the user exceeds 3 feature proposals per day,
**When** they attempt to submit another,
**Then** an error message displays "Vous avez atteint la limite de propositions pour aujourd'hui. Réessayez demain." (NFR8).

---

### Story 7.3: Admin Feature Voting Results & Management

**As an** administrator,
**I want** to view community feature voting results and manage proposal statuses,
**So that** I can make informed decisions about the development roadmap.

**Acceptance Criteria:**

**Given** an administrator navigates to `/admin/features`,
**When** the feature management page renders,
**Then** all feature proposals are displayed in a table with columns: Title, Vote Count (sortable), Status, Created By, Created Date (FR31),
**And** the table is sortable by vote count (default) and created date,
**And** a filter allows viewing by status: All, Open, In Progress, Completed, Rejected.

**Given** an administrator clicks on a feature proposal row,
**When** the detail view opens,
**Then** the full title, description, vote count, creation date, and a vote trend (votes over the last 30 days) are displayed.

**Given** an administrator changes a proposal's status via a dropdown,
**When** the status is updated (e.g., from "open" to "in_progress"),
**Then** the `feature_proposals.status` is updated in the database,
**And** the status badge updates in real-time on the public `/features` page,
**And** proposals with `status = 'in_progress'` display a blue "En cours de développement" badge,
**And** proposals with `status = 'completed'` display a green "Réalisé" badge.

**Given** an administrator wants to reject a low-quality or duplicate proposal,
**When** they change the status to "rejected",
**Then** a reason textarea is required (max 500 chars),
**And** the proposal is hidden from the public `/features` page (or displayed at the bottom with a "Rejeté" badge).

---

### Story 7.4: Feature Voting Accessibility & Mobile Experience

**As a** visitor using assistive technology or a mobile device,
**I want** the feature voting page to be fully accessible and mobile-optimized,
**So that** I can participate in platform democracy regardless of my device or abilities.

**Acceptance Criteria:**

**Given** the `/features` page is rendered on a mobile viewport (< 768px),
**When** the user views the page,
**Then** feature proposal cards are displayed in a single-column layout,
**And** vote buttons have a minimum tap target of 44x44px,
**And** the "Proposer une fonctionnalité" button spans the full width.

**Given** a screen reader traverses the feature proposals,
**When** each proposal card is read,
**Then** the card has `role="article"` with `aria-label`: "{title}, {vote_count} votes, statut : {status}" (NFR17),
**And** the vote button has `aria-label="Voter pour {title}"` when unvoted and `aria-label="Retirer votre vote pour {title}"` when voted,
**And** `aria-pressed` reflects the current vote state.

**Given** a user navigates the feature page with keyboard only,
**When** they press Tab,
**Then** focus moves logically through: "Proposer" button, then each proposal card (title link, vote button), then pagination controls (NFR18),
**And** all focused elements have a visible `ring-2 ring-chainsaw-red` outline.

**Given** any text on the features page,
**When** its contrast ratio is measured,
**Then** all text meets a minimum 4.5:1 contrast ratio (NFR19).

---

## Appendix: NFR Traceability Matrix

| NFR | Integrated In Stories |
|-----|----------------------|
| NFR1 | 3.1 |
| NFR2 | 3.3 |
| NFR3 | 2.3 |
| NFR4 | 4.1 |
| NFR5 | 3.1 |
| NFR6 | 1.1 |
| NFR7 | 1.2 |
| NFR8 | 1.2, 2.1, 5.1, 7.2 |
| NFR9 | (Infrastructure: Vercel/CDN configuration, not story-scoped) |
| NFR10 | 1.1 |
| NFR11 | 1.2 |
| NFR12 | 4.4, 2.6 |
| NFR13 | 2.1, 5.1 |
| NFR14 | 3.4 |
| NFR15 | 3.3 |
| NFR16 | 2.2 |
| NFR17 | 2.5, 3.5, 4.2, 5.4, 7.4 |
| NFR18 | 1.1, 3.5, 5.4, 7.4 |
| NFR19 | 1.1, 3.5, 5.4, 7.4 |
| NFR20 | 1.2, 2.1, 5.1, 7.2 |
| NFR21 | 2.4, 3.2 |
| NFR22 | 2.1 |
| NFR23 | 3.3, 3.4 |
