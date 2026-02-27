---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-e-01-discovery, step-e-02-review, step-e-03-edit]
inputDocuments:
  - product-brief-LIBÉRAL-2026-02-27.md
  - domain-french-public-finance-research-2026-02-27.md
  - market-fiscal-transparency-research-2026-02-27.md
  - technical-open-data-stack-research-2026-02-27.md
  - brainstorming-session-2026-02-27.md
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 3
  brainstorming: 1
  projectDocs: 0
  projectContext: 0
classification:
  projectType: web_app
  domain: govtech
  complexity: high
  projectContext: greenfield
lastEdited: '2026-02-27'
editHistory:
  - date: '2026-02-27'
    changes: 'Major pivot: data viz platform → community-driven fiscal accountability platform. NICOLAS unified persona. Milei-inspired viral strategy. Submit/vote/share mechanics. Twitter sharing integration.'
  - date: '2026-02-27'
    changes: 'Post-validation fixes: removed implementation leakage from NFR7/9/12, replaced FR21 embed code with tweet URL detection (embed deferred to Phase 2), added embeddable cards to Phase 2 scope.'
---

# Product Requirements Document — LIBÉRAL

**Author:** Tirakninepeiijub
**Date:** 2026-02-27

## Executive Summary

LIBÉRAL is an open-source, community-driven fiscal accountability platform where French citizens — collectively embodied as **NICOLAS**, the average overtaxed taxpayer — expose, vote on, and share government waste. Inspired by Javier Milei's chainsaw movement in Argentina, LIBÉRAL weaponizes social media virality to make fiscal outrage personal, collective, and impossible to ignore.

France operates the highest government expenditure-to-GDP ratio in the EU (57.2%), the 2nd highest tax burden in the OECD (43.5%), and public debt exceeding 3,482 billion EUR (117.4% of GDP). The political class — *la caste* — continues spending while Nicolas works until mid-July before earning a single euro for himself. LIBÉRAL gives Nicolas the chainsaw.

**The core loop is dead simple:** Anyone can submit a government waste item or quote a politician's spending announcement. The community upvotes or downvotes. The platform auto-calculates "What this costs Nicolas" — translating every outrage into personal euros, days of work, or household impact. The top-voted outrages are broadcast via the @LIBERAL_FR Twitter/X account. Every item is shareable as a viral graphic.

The platform aggregates fiscal data from 13+ official open data sources (data.gouv.fr, INSEE, budget.gouv.fr, Eurostat, OECD) to power the "Cost to Nicolas" calculations with verifiable, unchallengeable numbers. The data doesn't lie — it just needed a community to weaponize it.

Target user: **NICOLAS** — every French taxpayer. Whether a 28-year-old developer on Twitter/X, a 45-year-old mother crushed by taxe foncière, or a 70-year-old retiree watching his grandchildren inherit 55,000 EUR of public debt. Nicolas is the meme. Nicolas is everyone. Nicolas is angry.

MVP delivers one viral mechanic: **Submit → Vote → "Cost to Nicolas" → Share to Twitter/X**. Post-MVP phases add data visualization tools (debt clock, personal tax receipt, country comparator), politician accountability tracking, and participatory budget simulation — all serving the community platform.

### What Makes This Special

1. **Community-driven accountability** — not a top-down data portal but a crowd-powered fiscal watchdog where every citizen is an auditor
2. **"Cost to Nicolas" engine** — every government expense auto-translated into personal taxpayer impact using official data, making abstract billions visceral
3. **Viral-first, data-second** — designed for Twitter/X shares and social media outrage, not PDF reports; the data serves the virality, not the other way around
4. **Milei-inspired movement** — the chainsaw cuts through waste; NICOLAS is France's answer to Argentina's libertarian revolution
5. **Open-source transparency** — every line of code, every calculation, every data source is public and auditable; the platform practices what it preaches
6. **Upvote/downvote democracy** — the community decides what matters most, what gets investigated next, and even what features get built

## Project Classification

| Attribute | Value |
|-----------|-------|
| **Project Type** | Community Web Application (social voting + fiscal data engine) |
| **Domain** | GovTech / Civic Technology |
| **Complexity** | High — community UGC, real-time voting, multiple data sources, political sensitivity, RGAA, GDPR |
| **Project Context** | Greenfield — new platform, no existing codebase |
| **Tech Stack** | Next.js, PostgreSQL, ECharts (Phase 2), Python FastAPI (data pipeline + Cost-to-Nicolas engine) |
| **Hosting** | French/EU infrastructure (Scaleway, Cloudflare Pages) — data sovereignty |
| **License** | AGPL-3.0 (code), ODbL (data) |
| **Symbol** | The Chainsaw — cutting through government waste |

## Success Criteria

### User Success

| Criterion | Metric | Target |
|-----------|--------|--------|
| Waste item submitted | Nicolas submits a government waste item or politician tweet evaluation | >500 submissions in first month |
| Community vote cast | Nicolas upvotes or downvotes a waste item | >5,000 votes in first month |
| "Cost to Nicolas" generated | System auto-calculates personal taxpayer impact for a submission | 100% of submissions get a Cost to Nicolas figure |
| Share action taken | Nicolas shares a waste item or Cost to Nicolas graphic to Twitter/X or other social | >20% of visitors share at least one item |
| Return engagement | Nicolas returns to vote, submit, or check top outrages | >40% return within 7 days |

**User success moment:** Nicolas sees a politician's tweet about a new 2 billion EUR program, quotes it into LIBÉRAL, the community votes it to #1, and the "Cost to Nicolas" card — "This costs you 30 EUR/year, or one full day of work" — gets 50,000 retweets.

### Business Success

LIBÉRAL is a non-profit open-source movement. "Business" objectives focus on impact and growth:

| Criterion | 3-Month Target | 12-Month Target |
|-----------|----------------|-----------------|
| Registered Nicolas accounts | 5,000 | 50,000 |
| Monthly active voters | 2,000 | 20,000 |
| Waste submissions | 1,000 total | 500/month ongoing |
| Twitter/X followers (@LIBERAL_FR) | 10,000 | 100,000 |
| Social media shares | 20,000/month | 100,000/month |
| Media coverage | 5 mentions | 30+ mentions (Le Monde, Le Figaro, BFM, etc.) |
| GitHub community | 100 stars, 10 contributors | 500+ stars, 50+ contributors |
| Civic impact | — | Data cited in 3+ parliamentary questions |
| Monthly hosting cost | <100 EUR | <200 EUR |

### Technical Success

| Criterion | Metric | Target |
|-----------|--------|--------|
| Vote processing | Time from vote click to updated count displayed | <500ms |
| Cost to Nicolas calculation | Time from submission to auto-calculated impact | <5 seconds |
| Data accuracy | Variance between Cost to Nicolas figures and official sources | 0% — exact match with verifiable methodology |
| Platform availability | Uptime | 99.5% monthly |
| Page performance | LCP on mobile (4G) | <2.5 seconds |
| Submission moderation | Time from submission to community visibility | <24 hours (manual review for MVP) |

### Measurable Outcomes

| Outcome | Measurement Method | Success Threshold |
|---------|-------------------|-------------------|
| Viral traction | A single waste item or Cost to Nicolas card shared >10K times | Within first 60 days |
| Community critical mass | Daily active voters sustaining without promotional pushes | >200 daily active voters by month 3 |
| Media pickup | Journalists citing LIBÉRAL data or top-voted items | >1 major outlet in first 90 days |
| Movement identity | "Nicolas" meme adopted organically on French Twitter/X | Unprompted usage of "Nicolas" in fiscal debates |

## Product Scope

### MVP — Minimum Viable Product

**MVP philosophy:** One viral mechanic, dead simple. If Nicolas can't use it in 30 seconds and share it in 60, it's too complex. Milei didn't need a dashboard — he needed a chainsaw and a microphone.

**The Core Loop:**

```
Submit waste item → Community votes (upvote/downvote) → "Cost to Nicolas" auto-calculated → Share to Twitter/X
```

**MVP Features:**

1. **Submit a Waste Item** — Any registered user can submit a government waste report: title, description, estimated cost (EUR), source link (article, official document, politician tweet URL). Simple form. Mandatory source link for credibility.

2. **Upvote / Downvote** — Reddit-style voting on every submission. Hot/Top/New sorting. Score = upvotes minus downvotes. Community decides what's most outrageous.

3. **"Cost to Nicolas" Engine** — For every submission with a EUR amount, auto-calculate:
   - Cost per French citizen (÷ 68M population)
   - Cost per French taxpayer (÷ ~18M income tax payers)
   - Cost per household (÷ ~30M households)
   - Equivalent in days/hours of work for median income earner
   - Equivalent in concrete items ("that's X school lunches" or "Y hospital beds")
   - Uses official data from INSEE, budget.gouv.fr for all denominators

4. **Shareable "Cost to Nicolas" Card** — Auto-generated image (OG-sized) for each submission showing: the waste item title, the cost, and "What this costs Nicolas" breakdown. Optimized for Twitter/X, Facebook, WhatsApp sharing. One-click copy link. Direct share buttons.

5. **@LIBERAL_FR Twitter/X Feed** — The platform's official Twitter account auto-posts (or admin-curated posts) the top-voted waste items daily/weekly with their Cost to Nicolas cards. Becomes the go-to fiscal outrage account.

6. **Community Feature Voting** — Users can vote on what features/data integrations the platform should prioritize next. Democratic product roadmap.

7. **Basic Moderation** — Admin review queue for new submissions before they go live. Flag/report mechanism for community. Anti-spam measures.

8. **User Registration** — Simple email + password. No Twitter OAuth for now (API costs). Display name (or anonymous "Nicolas #4827"). Gravatar or default chainsaw avatar.

### Growth Features (Post-MVP)

**Phase 2 (Months 4-8): Data Tools for Nicolas**
- National Debt Clock (live-ticking, shareable)
- Personal Tax Receipt / "Where Do My Euros Go?" calculator
- France vs. X Country Comparator
- Politician tweet evaluation tool (paste tweet URL → community rates the spending → Cost to Nicolas calculated)
- Automated data pipeline from 5 core sources
- Meilisearch full-text search across waste items

**Phase 3 (Months 9-15): Accountability & Depth**
- Politician fiscal scorecard (voting records on spending bills)
- Waste & scandal verified database (community-submitted, editor-verified)
- Regional/municipal spending comparison map
- "Ask Your Deputy" letter generator with pre-filled fiscal arguments
- Gamification (Nicolas reputation score, badges, leaderboards)
- Public API for journalists and researchers
- Monthly automated newsletter with top outrages

### Vision (Future)

**Phase 4 (Year 2+):**
- Participatory budget simulator ("If Nicolas were Finance Minister...")
- AI-powered fiscal auditor detecting spending anomalies in government data
- Real-time budget execution dashboard
- European expansion — NICOLAS goes continental
- Annual "State of Nicolas" report — a media event
- Mobile app (PWA first, native later)
- DuckDB-WASM for advanced users to query raw fiscal data in-browser

## User Journeys

### Journey 1: Nicolas Discovers the Platform Through a Viral Tweet

**Nicolas, any age, anywhere in France.** Overtaxed. Angry but unfocused. Scrolls Twitter/X.

**Opening scene:** Nicolas sees a tweet from @LIBERAL_FR: "This week's #1 outrage: France spent 346 million EUR on a payroll system (ONP) that never worked. Cost to Nicolas: 5.09 EUR per citizen — thrown in the trash. 🪚" The tweet has a shareable card with the Cost to Nicolas breakdown. 12,000 retweets.

**Rising action:** Nicolas clicks through to LIBÉRAL. The homepage shows the current top-voted waste items, each with their Cost to Nicolas figure. He scrolls: failed IT projects, duplicate agencies, politician perks, absurd spending line items. Each one has a source link to official documents. He creates an account in 20 seconds (email + password).

**Climax:** Nicolas remembers that article about his region spending 500,000 EUR on a roundabout art installation. He submits it: title, description, 500,000 EUR, link to the local newspaper article. Within seconds, the system calculates: "Cost to Nicolas: 0.007 EUR per citizen — or 14 school lunches." He shares the generated card to Twitter/X. By evening, it has 3,000 upvotes and is trending in his region.

**Resolution:** Nicolas returns daily to vote on new submissions and check if his roundabout post is still climbing. He votes on what feature to build next (he wants the politician scorecard). He's now part of the movement. He IS Nicolas.

**Capabilities revealed:** Twitter/X viral discovery, waste submission, Cost to Nicolas auto-calculation, upvote/downvote, shareable cards, user registration, community feature voting.

---

### Journey 2: Nicolas Evaluates a Politician's Spending Announcement

**Nicolas, politically engaged, follows fiscal debates on Twitter/X.**

**Opening scene:** A minister tweets: "Proud to announce 800 million EUR for our new digital sovereignty plan!" Nicolas copies the tweet URL.

**Rising action:** On LIBÉRAL, Nicolas creates a new submission. He pastes the tweet URL, adds context: "Yet another grand digital plan — remember the 500M+ EUR Louvois disaster?" He enters the announced amount: 800,000,000 EUR.

**Climax:** The Cost to Nicolas engine fires: "This costs Nicolas 11.76 EUR per citizen, or 44.44 EUR per taxpayer, or 2.4 hours of work at median wage. That's 160,000 school lunches or 8,000 hospital bed-days." Nicolas adds his editorial comment and submits. The community starts voting. Within 24 hours it reaches the top 5 and @LIBERAL_FR tweets it: "Minister announces 800M EUR digital plan. Last digital plan (Louvois) cost 500M+ and never worked. Cost to Nicolas: 44 EUR per taxpayer. 🪚"

**Resolution:** A journalist from Les Echos sees the LIBÉRAL tweet, investigates, publishes a comparison piece. The minister's team issues a clarification. The community has forced accountability through collective action.

**Capabilities revealed:** Politician tweet evaluation, contextual submissions with source URLs, Cost to Nicolas at scale, community curation, Twitter/X broadcast, media amplification loop.

---

### Journey 3: Nicolas the Passive Voter — Low-Effort, High-Impact Participation

**Nicolas, casual user, 2 minutes per day.**

**Opening scene:** Nicolas opens LIBÉRAL on his phone during his commute. The "Hot" feed shows today's most-voted waste items.

**Rising action:** He scrolls through 5 items, upvotes 3, downvotes 1 (seems exaggerated, weak source). One item catches his eye: "Sénat spent 1.2M EUR renovating a private dining room." Cost to Nicolas: 0.018 EUR per citizen. He taps "Share" → WhatsApp → sends to his family group chat.

**Climax:** His brother-in-law, who never engages with politics, replies: "Wait, that's real? With our tax money?" and clicks through to LIBÉRAL. A new Nicolas is born.

**Resolution:** Nicolas has contributed to the movement in 2 minutes: 4 votes (shaping what rises to the top), 1 share (expanding the network). The platform is designed for this — high impact at minimum effort.

**Capabilities revealed:** Mobile-optimized feed, quick voting, WhatsApp/social sharing, low-friction participation, viral referral loop.

---

### Journey 4: Admin — Moderating and Broadcasting

**Alex, volunteer moderator.** Reviews submissions, manages the @LIBERAL_FR account.

**Opening scene:** Alex opens the moderation queue. 15 new submissions overnight. 3 are spam, 2 lack source links, 10 are legitimate.

**Rising action:** Alex rejects the spam, sends "source required" notices for the 2 incomplete ones, and approves the 10 valid submissions. She checks the day's top-voted items. #1 has 8,000 upvotes — a story about a government agency spending 2M EUR on a "well-being consultant." She selects it for the daily @LIBERAL_FR tweet.

**Climax:** She generates the Cost to Nicolas card, writes the tweet copy with the chainsaw emoji, and schedules it for peak French Twitter hours (12:30 and 19:00). She checks the community feature voting: the politician scorecard is leading with 2,300 votes.

**Resolution:** The tweet goes out, gets 15,000 retweets by evening. Alex writes a brief moderation report. Total time: 45 minutes.

**Capabilities revealed:** Submission moderation queue, spam detection, source validation, Twitter/X broadcast workflow, community feature voting dashboard, admin tools.

### Journey Requirements Summary

| Journey | Capability Areas Revealed |
|---------|--------------------------|
| Nicolas Discovers (viral) | Twitter/X integration, waste submission, Cost to Nicolas engine, voting, shareable cards, registration |
| Nicolas Evaluates (politician tweet) | Tweet URL evaluation, contextual submissions, community curation, media amplification |
| Nicolas Votes (passive) | Mobile feed, quick voting, multi-platform sharing, low-friction UX, viral referral |
| Admin (moderation) | Moderation queue, spam detection, source validation, Twitter broadcast, feature voting dashboard |

## Domain-Specific Requirements

### Compliance & Regulatory

**RGAA Compliance (Accessibility):**
LIBÉRAL serves the French public. Targeting RGAA level AA (aligned with WCAG 2.1 AA):
- Screen reader compatibility for all submission cards and voting interfaces
- Keyboard navigation for voting, submission, and feed browsing
- Color contrast ratios (4.5:1 minimum) on all Cost to Nicolas cards
- Alt text for generated sharing images
- Focus indicators on all interactive elements

**GDPR / RGPD Compliance:**
- User accounts require: explicit consent at registration, right to erasure, data minimization
- Email stored for authentication only — no marketing without separate opt-in
- Submissions are public by design (user consented at submission)
- Anonymous participation option ("Nicolas #XXXX") to minimize personal data
- Cookie consent: essential only for MVP; analytics via privacy-respecting tools (Plausible or Umami)
- Data breach notification procedures

**CADA / Open Data Laws:**
- Loi pour une République numérique (2016): government data open by default — LIBÉRAL benefits for data access
- All Cost to Nicolas calculations link to official source data
- Platform methodology is publicly documented

### Technical Constraints

**Data Sovereignty:**
- All infrastructure hosted in France or EU (Scaleway Paris/Amsterdam, Cloudflare EU)
- User data (accounts, votes) stored on EU servers
- No data transfer to US-based services without Standard Contractual Clauses

**Political Sensitivity:**
- All Cost to Nicolas calculations traceable to official government sources with direct links
- Methodology transparent, documented, and reproducible
- User-submitted content clearly distinguished from verified official data
- Platform must withstand legal challenge on accuracy — every calculation verifiable
- Community moderation to prevent defamation or false claims

**Content Moderation & UGC Risks:**
- All submissions require a source link (URL to article, official document, or tweet)
- Manual moderation queue for MVP (admin approves before publication)
- Flag/report mechanism for community self-policing
- Clear terms of service: factual claims only, no personal attacks, source required
- Anti-spam: rate limiting on submissions (max 5/day per user for MVP)

**DDoS and Attack Surface:**
- Civic technology challenging government narratives faces elevated attack risk
- Cloudflare protection mandatory from day one
- Static generation (SSG) for public feed pages reduces attack surface
- API rate limiting for voting and submission endpoints
- CAPTCHA or proof-of-work for registration to prevent bot armies

### Integration Requirements

| Source | Protocol | Purpose | Priority |
|--------|----------|---------|----------|
| data.gouv.fr | REST API v1 (JSON) | Population, household, taxpayer denominators for Cost to Nicolas | Critical |
| INSEE API | REST (JSON) | Median income, CPI, economic indicators for equivalence calculations | Critical |
| budget.gouv.fr | File download (CSV, XML) | Government spending breakdowns for contextualization | High |
| Eurostat | REST API (JSON) | Cross-country comparison data (Phase 2) | Medium |
| OECD.stat | REST API (SDMX-JSON) | International benchmarks (Phase 2) | Medium |
| Twitter/X | Share intents (URL-based, no API needed) | One-click sharing, tweet URL embedding in submissions | Critical |

### Risk Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Legal challenge on user-submitted content | Defamation claims, platform liability | Mandatory source links, moderation queue, clear ToS, LCEN hosting provider status |
| Bot/astroturfing attacks on voting | Corrupted community rankings | Rate limiting, CAPTCHA, email verification, vote pattern anomaly detection |
| DDoS during politically sensitive moments | Platform unavailability when most needed | Cloudflare, SSG for public pages, CDN, graceful degradation |
| Government API changes/deprecation | Cost to Nicolas calculations break | Schema versioning, adapter pattern per source, cached denominators with fallback |
| Platform perceived as partisan/extremist | Mainstream rejection, media hostility | Official data only, open methodology, transparent moderation, community governance |
| Content quality degradation | Low-quality or false submissions dilute credibility | Moderation, community flagging, source requirement, reputation system (Phase 3) |

## Innovation & Novel Patterns

### Detected Innovation Areas

1. **Milei-inspired digital fiscal movement** — No French platform has applied the Argentine playbook: community-driven fiscal outrage, meme-ready content, chainsaw symbolism, social media as primary distribution. LIBÉRAL is France's first weaponized fiscal transparency community.

2. **"Cost to Nicolas" auto-translation engine** — Automatically converting any government expense into personal, emotional, shareable taxpayer impact using official denominators. No one does this at community scale in France. "This costs you 30 EUR" hits harder than "This costs 2 billion."

3. **Community-curated fiscal accountability** — Reddit-style voting applied to government waste creates a crowdsourced priority ranking of fiscal outrages. The community decides what matters, not editors or think tanks.

4. **Politician tweet evaluation pipeline** — Citizens can paste a politician's spending announcement and the community collectively evaluates the real cost. Turns political communication into a two-way accountability mechanism.

5. **Democratic product roadmap** — Users vote on what features to build next. The platform is governed by Nicolas, for Nicolas.

### Validation Approach

| Innovation | Validation Method | Success Signal |
|-----------|-------------------|----------------|
| Milei-inspired movement | Twitter/X follower growth + "Nicolas" meme adoption | 10K followers in 3 months; organic "Nicolas" usage on French Twitter |
| Cost to Nicolas engine | Share rate of Cost to Nicolas cards vs. raw data | >20% share rate (generic data sites average <3%) |
| Community curation | Daily active voters sustaining without promotion | >200 daily active voters by month 3 |
| Tweet evaluation | Number of politician tweets evaluated per week | >50 evaluated tweets/week by month 3 |
| Democratic roadmap | Feature voting participation rate | >30% of registered users vote on features |

### Risk Mitigation

- If community growth is slow: seed with 100+ pre-researched waste items from Cour des Comptes reports and brainstorming session, create controversy with high-impact first posts
- If "Nicolas" meme doesn't catch on: A/B test alternative personas/branding; the mechanic (submit → vote → cost → share) works regardless of branding
- If content quality is low: introduce verified submissions tier (editor-confirmed sources) alongside community submissions

## Web Application Specific Requirements

### Architecture: Hybrid SSG + Dynamic API

- **Static Site Generation (SSG)** for: public feed (hot/top lists regenerated every 5 minutes via ISR), about page, methodology documentation, Cost to Nicolas explainer
- **Server-Side Rendering (SSR)** for: individual submission pages (for SEO and social sharing preview), user profile pages
- **Client-Side Rendering (CSR)** for: voting interactions (optimistic UI), submission form, moderation dashboard, feature voting
- **API Routes** for: vote processing, submission CRUD, Cost to Nicolas calculation, share image generation, moderation actions, user authentication

### Browser Support

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome/Chromium | Last 2 major versions | Critical |
| Safari (iOS) | Last 2 major versions | Critical (mobile-first) |
| Firefox | Last 2 major versions | High |
| Samsung Internet | Last 2 major versions | Medium |
| Edge | Last 2 major versions | Medium |

### Responsive Design

- **Mobile-first** design — 70%+ expected mobile traffic (Twitter/X referrals are overwhelmingly mobile)
- Feed card layout optimized for thumb scrolling and one-thumb voting
- Submission form optimized for mobile keyboard
- Share buttons positioned for easy one-hand access
- Cost to Nicolas cards render correctly at all breakpoints

### SEO Strategy

- Target French fiscal outrage terms: "gaspillage argent public France", "dépenses inutiles État", "coût contribuable", "scandale dépenses publiques"
- Each submission page is a unique URL with Open Graph meta tags and generated Cost to Nicolas preview image
- Structured data (JSON-LD) for Cost to Nicolas figures
- Sitemap with top-voted submissions
- French-language hreflang tags

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Largest Contentful Paint (LCP) | <2.5s on 4G mobile | Lighthouse, Core Web Vitals |
| First Input Delay (FID) | <100ms | Core Web Vitals |
| Cumulative Layout Shift (CLS) | <0.1 | Core Web Vitals |
| Vote response (optimistic UI) | Instant visual feedback, <500ms server confirmation | Application monitoring |
| Cost to Nicolas calculation | <5 seconds from submission | Server-side timing |
| Share image generation | <3 seconds | Server-side timing |

### Accessibility Level

- **Target:** RGAA AA (aligned with WCAG 2.1 AA)
- Screen reader: all submission cards, voting controls, and Cost to Nicolas figures accessible
- Keyboard: full feed navigation, voting, and submission without mouse
- Color: all UI elements pass 4.5:1 contrast ratio; colorblind-safe voting indicators
- Motion: respect prefers-reduced-motion
- Text: base font 16px, scalable to 200% without horizontal scroll

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**Approach:** Viral-mechanic MVP — one loop that makes Nicolas angry enough to share. Milei didn't need a policy platform — he needed a microphone and a chainsaw. LIBÉRAL needs Submit → Vote → Cost to Nicolas → Share.

**Timeline:** 6 weeks to public launch
**Team:** Solo developer (founder) + open-source community post-launch
**Budget:** <100 EUR/month infrastructure

### MVP Feature Set (Phase 1)

**The ONE journey supported:** Nicolas discovers a waste item (or sees one), votes on it, sees what it costs him personally, shares it.

**Must-Have Capabilities:**

| # | Capability | Justification |
|---|-----------|---------------|
| 1 | User registration (email + password) | Identity for voting integrity, submission attribution |
| 2 | Submit waste item (title, description, EUR amount, source URL) | Core content creation mechanic |
| 3 | Upvote / downvote with Hot/Top/New feeds | Community curation — the democratic backbone |
| 4 | Cost to Nicolas auto-calculation | The emotional translation layer — what makes this shareable |
| 5 | Shareable Cost to Nicolas card (generated image) | The viral payload — designed for Twitter/X, WhatsApp, Facebook |
| 6 | Share buttons (Twitter/X, Facebook, WhatsApp, copy link) | One-click distribution — zero friction sharing |
| 7 | Basic moderation queue (admin approve/reject) | Content quality gatekeeping for credibility |
| 8 | Community feature voting | Democratic product roadmap — Nicolas decides what's next |
| 9 | Mobile-responsive design | 70%+ expected mobile traffic from social referrals |
| 10 | AGPL-3.0 GitHub repository | Open-source trust model |

### Post-MVP Features

**Phase 2 (Months 3-6): Data Tools for Nicolas**
- National Debt Clock (live-ticking, shareable)
- Personal Tax Receipt / "Where Do My Euros Go?" calculator + Tax Freedom Day
- France vs. X Country Comparator
- Politician tweet evaluation tool (enhanced: paste URL, auto-extract claim, community rates)
- Embeddable Cost to Nicolas cards (embed code for external websites)
- Automated data pipeline from core official sources
- Meilisearch full-text search across all submissions

**Phase 3 (Months 7-12): Accountability & Community**
- Politician fiscal scorecard (voting records on spending bills from Assemblée Nationale data)
- Verified waste database (editor-confirmed sources, categorized)
- Regional/municipal spending comparison map
- Nicolas reputation score, badges, and leaderboards
- Public API for journalists and researchers
- Monthly automated newsletter with top outrages

### Risk Mitigation Strategy

**Technical risks:**
- Most challenging: Cost to Nicolas calculation engine with accurate, up-to-date denominators → Mitigate with cached official denominators (population, taxpayer count, median income) updated quarterly, methodology page documenting every source
- Riskiest assumption: users will submit quality content with valid sources → Mitigate with moderation queue, source-required policy, seed content from Cour des Comptes reports

**Market risks:**
- Biggest risk: perceived as fringe/extremist rather than mainstream fiscal accountability → Mitigate with official-data-only calculations, transparent methodology, community governance, diverse content (left and right waste)
- Validation: if 3-month daily active voters <100, pivot to content-first model (editorial team posts, community votes only)

**Resource risks:**
- Solo developer: MVP scoped for 6 weeks by one person
- Minimum viable: could launch with just submission + voting + share (no Cost to Nicolas engine) in 3 weeks as proof of concept
- Community scaling: open-source model + Milei-inspired branding attracts ideological contributors

## Functional Requirements

### Waste Submission & Content

- FR1: Registered users can submit a government waste item with title (max 200 chars), description (max 2000 chars), estimated cost in EUR, and a mandatory source URL
- FR2: The system can display submissions in a feed with Hot (trending), Top (highest score), and New (chronological) sorting options
- FR3: Visitors can view any individual submission page with full details, Cost to Nicolas breakdown, vote count, and source link
- FR4: Registered users can flag a submission as inaccurate, spam, or inappropriate
- FR5: The system can display the original source URL prominently on every submission for verification

### Community Voting

- FR6: Registered users can upvote or downvote any submission (one vote per user per submission)
- FR7: Registered users can change their vote on a submission
- FR8: The system can calculate a submission score (upvotes minus downvotes) and rank submissions accordingly
- FR9: The system can display vote counts on each submission card in the feed
- FR10: Registered users can vote on proposed platform features to influence the development roadmap

### Cost to Nicolas Engine

- FR11: The system can auto-calculate "Cost per citizen" by dividing the submitted EUR amount by France's current population (from INSEE)
- FR12: The system can auto-calculate "Cost per taxpayer" by dividing by the number of income tax payers (from DGFIP/INSEE)
- FR13: The system can auto-calculate "Cost per household" by dividing by the number of French households (from INSEE)
- FR14: The system can auto-calculate "Days of work equivalent" by dividing cost per taxpayer by the daily median net income (from INSEE)
- FR15: The system can auto-calculate at least one concrete equivalence (e.g., "X school lunches" or "Y hospital bed-days") using published per-unit costs
- FR16: The system can display all Cost to Nicolas calculations with links to the official data sources used for each denominator
- FR17: The system can display the calculation methodology page explaining every formula and data source

### Content Sharing & Virality

- FR18: The system can auto-generate a shareable image (PNG, OG-dimensions) for each submission showing: title, cost, and Cost to Nicolas breakdown with LIBÉRAL branding and chainsaw icon
- FR19: Visitors can share any submission via one-click buttons for Twitter/X (via share intent URL), Facebook, WhatsApp, and copy-link
- FR20: The system can generate Open Graph and Twitter Card metadata for every submission page with the auto-generated preview image
- FR21: The system can detect tweet URLs in submission source fields and display an embedded tweet preview alongside the submission details

### User Management

- FR22: Visitors can register an account using email and password
- FR23: Registered users can choose a display name or remain anonymous as "Nicolas #XXXX"
- FR24: Registered users can view their submission history and vote history
- FR25: Registered users can delete their account and all associated personal data (GDPR right to erasure)

### Moderation & Administration

- FR26: Administrators can view a moderation queue of pending submissions awaiting approval
- FR27: Administrators can approve, reject, or request-edits on pending submissions
- FR28: Administrators can remove published submissions that violate terms of service
- FR29: Administrators can view flagged submissions sorted by flag count
- FR30: Administrators can select top-voted submissions for broadcast via the @LIBERAL_FR Twitter/X account
- FR31: Administrators can view community feature voting results and current rankings

### Data Pipeline (Supports Cost to Nicolas)

- FR32: The system can maintain a local cache of key demographic and fiscal denominators (population, taxpayer count, household count, median income) from official sources
- FR33: The system can update cached denominators on a configurable schedule (default: quarterly)
- FR34: The system can display the last-updated date for all denominators used in Cost to Nicolas calculations
- FR35: The system can provide a public data status page showing denominator freshness and source links

## Non-Functional Requirements

### Performance

- NFR1: Feed pages load with LCP <2.5 seconds on a 4G mobile connection as measured by Lighthouse
- NFR2: Vote click provides optimistic UI feedback within 100ms; server confirmation within 500ms
- NFR3: Cost to Nicolas calculation completes within 5 seconds of submission
- NFR4: Share image generation completes within 3 seconds
- NFR5: Feed pagination loads next batch of submissions within 1 second

### Security

- NFR6: All traffic served over HTTPS with TLS 1.2+ and HSTS enabled
- NFR7: User passwords hashed with an industry-standard adaptive algorithm (minimum cost factor 12) — never stored in plaintext
- NFR8: API endpoints implement rate limiting: 100 reads/minute, 10 writes/minute per IP
- NFR9: CDN-level DDoS protection enabled on all endpoints from day one
- NFR10: Content Security Policy headers prevent XSS and unauthorized script injection
- NFR11: Registration protected by CAPTCHA or equivalent anti-bot measure
- NFR12: No user tracking cookies without explicit consent; analytics via a privacy-respecting, cookie-free tool
- NFR13: SQL injection prevention via parameterized queries on all database operations

### Scalability

- NFR14: Architecture supports 10x traffic growth (50K monthly active users) through CDN caching for public feeds and horizontal scaling for vote processing
- NFR15: Voting system handles burst traffic (>1000 concurrent votes during viral moments) without data loss
- NFR16: Cost to Nicolas denominator cache operates independently of external API availability

### Accessibility

- NFR17: Platform achieves RGAA AA conformance (aligned with WCAG 2.1 AA) as verified by automated (axe-core) and manual audit
- NFR18: All interactive elements (vote buttons, submission form, share buttons) have visible focus indicators with minimum 3:1 contrast ratio
- NFR19: All text content meets minimum 4.5:1 contrast ratio against background
- NFR20: All forms include associated labels, error messages are programmatically linked, and required fields are indicated

### Content Integrity

- NFR21: Every Cost to Nicolas calculation displays a "verify this" link showing the formula, denominators, and source links used
- NFR22: Submission source URLs are stored and displayed permanently — sources cannot be removed after publication
- NFR23: Vote counts are eventually consistent — displayed counts may lag by up to 5 seconds during high traffic but must converge to accurate totals

---

*Document created: 2026-02-27*
*Document edited: 2026-02-27 — Major pivot to community platform*
*Project: LIBÉRAL*
*Author: Tirakninepeiijub*
*Workflow: BMad Method — PRD Create + Edit*
*Input documents: 1 product brief, 3 research reports, 1 brainstorming session*
