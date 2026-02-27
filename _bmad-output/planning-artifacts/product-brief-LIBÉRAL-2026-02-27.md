---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - brainstorming-session-2026-02-27.md
  - domain-french-public-finance-research-2026-02-27.md
  - market-fiscal-transparency-research-2026-02-27.md
  - technical-open-data-stack-research-2026-02-27.md
date: 2026-02-27
author: Tirakninepeiijub
project_name: LIBÉRAL
---

# Product Brief: LIBÉRAL

## Executive Summary

**LIBÉRAL** is an open-source civic technology platform that exposes France's government spending, fiscal waste, and political irresponsibility to every citizen. France carries the highest government spending-to-GDP ratio in the EU (57.2%), the 2nd highest tax burden in the OECD (43.5% of GDP), public debt surpassing 3,482 billion EUR (117.4% of GDP), and a budget deficit nearly double the EU limit at 5.8% of GDP. Yet no citizen-facing digital platform exists that makes this data transparent, personal, and actionable from a perspective that challenges the size and scope of government.

LIBÉRAL fills this gap by combining open government data, compelling visualizations, and a libertarian editorial lens into a free, open-source platform that transforms abstract fiscal numbers into personal, shareable, visceral experiences. When a citizen discovers they work until late July before earning a single euro for themselves, or that France has 483 separate taxes, or that failed IT projects have wasted over 1 billion EUR — they share it. And sharing is how fiscal awareness becomes fiscal pressure.

The platform targets France's 50.4 million social media users, particularly the 18-34 demographic who feel the tax burden most acutely while having the least visibility into where their money goes. Trust in government has fallen to 29%, and 68% perceive widespread corruption — the audience is ready. What's missing is the tool.

---

## Core Vision

### Problem Statement

French citizens bear one of the heaviest tax burdens in the developed world, yet they have almost no accessible way to understand where their money goes, how it compares to other countries, or how to hold politicians accountable for fiscal decisions. The information exists — in 616-page Cour des Comptes reports, in dense PLF annexes, in scattered data.gouv.fr datasets — but it is effectively inaccessible to the average citizen. This information asymmetry between the state and its citizens is the fundamental problem LIBÉRAL solves.

### Problem Impact

The consequences of fiscal opacity are severe and measurable:

- **Financial burden:** The average French household loses 43.5 centimes of every euro earned to taxes and mandatory contributions — 10 percentage points above the OECD average. A worker earning 3,000 EUR/month gross actually costs their employer ~4,500 EUR (the "super-brut"), receives ~2,300 EUR net, then pays TVA (20%) on most purchases, plus taxe foncière, plus 483 other possible levies.
- **Debt spiral:** Public debt has risen from 97.4% of GDP (2019) to 117.4% (Q3 2025), with IMF projections reaching 130% by 2030. Debt servicing alone costs 59.3 billion EUR in 2026 — money that buys citizens nothing.
- **Democratic deficit:** 88% of French citizens are pessimistic about the economy. Trust in government is at 29%. The Gilets Jaunes movement proved that fiscal anger is real but lacks data-driven focus.
- **Institutional failure:** France has violated the EU's Maastricht 3% deficit rule almost continuously. Failed government IT projects (Louvois: 500M+ EUR, SIRHEN, ONP: 346M EUR, Ecotaxe: ~1B EUR) waste billions with no accountability. CAF erroneous payments total 6.3 billion EUR.
- **Generational injustice:** Each newborn inherits ~52,000 EUR in public debt before taking their first breath.

### Why Existing Solutions Fall Short

| Player | What They Do | Why It's Not Enough |
|--------|-------------|-------------------|
| **IFRAP** | Think-tank research and policy papers | Academic tone, no interactive tools, not citizen-facing |
| **Contribuables Associés** | Taxpayer advocacy, Argus des Communes | Aging membership, dated digital presence, perceived right-wing bias |
| **OpenFisca** | Open-source tax microsimulation engine | Developer-focused, no editorial angle, no citizen interface |
| **Cour des Comptes** | 616-page audit reports | Government institution, bureaucratic communication, findings routinely ignored |
| **Institut Montaigne** | Centrist policy analysis | Pro-business centrist, traditional publication format |
| **France Stratégie** | Government strategic planning | Pro-establishment by design |
| **USAspending.gov** | Comprehensive US spending tracker | US-only, government-run (no critical perspective) |
| **Where Does My Money Go?** (UK) | Personal tax calculator | UK-only, evolved into OpenSpending, limited development |

**The gap:** No platform combines (1) comprehensive French fiscal data, (2) compelling citizen-facing visualizations, (3) a critical editorial lens challenging government spending, (4) personal relevance ("what does this mean for ME"), and (5) open-source community development. LIBÉRAL is the first to occupy all five dimensions.

### Proposed Solution

LIBÉRAL is a free, open-source web platform that:

1. **Aggregates** French government spending data from 13+ official sources (data.gouv.fr, INSEE, budget.gouv.fr, Assemblée Nationale, Cour des Comptes, Eurostat, OECD, etc.) into a unified, clean, queryable database
2. **Visualizes** fiscal data through compelling, interactive dashboards — debt clocks, Sankey diagrams, treemaps, heatmaps, timelines — designed for emotional impact and instant comprehension
3. **Personalizes** the fiscal experience — "Your Personal Tax Receipt" shows each citizen exactly where their specific euros go; "Tax Freedom Day" shows when they stop working for the state
4. **Compares** France against other countries, regions against regions, politicians against their promises — context that makes the scale of the problem undeniable
5. **Tracks accountability** — politician promise scorecards, voting records on fiscal matters, waste and scandal databases, cost-per-politician calculators
6. **Empowers action** — shareable infographics, pre-written letters to deputies, petition generators, town hall meeting toolkits
7. **Operates transparently** — all code open-source (AGPL-3.0), all data versioned and reproducible, community-driven development

### Key Differentiators

1. **Open source and transparent:** Unlike IFRAP or Contribuables Associés, every line of code, every data transformation, and every editorial decision is public and auditable. The platform practices what it preaches about transparency.

2. **Citizen-first design:** Unlike Cour des Comptes reports or OpenFisca APIs, LIBÉRAL is designed for the average citizen with no fiscal expertise. Mobile-first, shareable, emotionally resonant.

3. **Personal relevance:** The "Your Personal Tax Receipt" and "Tax Freedom Day" features transform abstract billions into personal euros. "You paid 8,247 EUR for debt interest this year" hits differently than "France's debt servicing costs 59.3 billion."

4. **Critical editorial lens:** Unlike government portals (budget.gouv.fr, USAspending.gov), LIBÉRAL doesn't just present data neutrally — it contextualizes, compares, and challenges. The data speaks for itself, but context is everything.

5. **Viral by design:** Every visualization, every fact, every comparison is designed to be shared. The platform produces social media assets, not just web pages. In a country with 50.4 million social media users, virality is the growth engine.

6. **Technical modernity:** Built with Next.js, ECharts, PostgreSQL, DuckDB, and Meilisearch — a modern stack that attracts developer contributors and delivers performance. DuckDB-WASM enables client-side data exploration without server costs.

7. **French sovereignty:** Hosted on French/European infrastructure (Scaleway, OVHcloud), data stored in France, RGAA accessibility compliant, GDPR compliant.

---

## Target Users

### Primary Users

#### Persona 1: "Marie" — The Concerned Taxpayer (age 35-50)
- **Profile:** Middle-class professional, homeowner, pays income tax + CSG + taxe foncière. Two children. Household income ~55,000 EUR/year.
- **Pain:** Feels crushed by taxes but doesn't know exactly where the money goes. Sees headlines about government waste but can't quantify it. Frustrated that her taxe foncière increased 30% in 5 years with no visible improvement in local services.
- **Behavior:** Uses smartphone daily, active on Facebook and Instagram, shares articles about cost of living. Signed a Gilets Jaunes petition once.
- **LIBÉRAL value:** The Personal Tax Receipt shows her exact allocation. She discovers she pays 4,100 EUR/year in debt interest alone — money that buys her nothing. She shares the infographic. Her friends share it too.
- **Success moment:** "I had no idea I was paying THIS much for THAT."

#### Persona 2: "Lucas" — The Digital Activist (age 22-30)
- **Profile:** Urban professional or student, politically engaged, uses Twitter/X and TikTok. Leans libertarian or classical liberal. Tech-savvy.
- **Pain:** Feels the system is broken but lacks ammunition for debates. Knows taxes are too high but can't cite specific figures. Wants to contribute to something meaningful.
- **Behavior:** 38+ hours/month on TikTok, shares political content, follows IFRAP and libertarian accounts. Would contribute to an open-source project if the cause resonates.
- **LIBÉRAL value:** The comparison tools ("France vs Switzerland"), the politician scorecards, and the shock-value features give him a constant stream of shareable content. The open-source repo lets him contribute code.
- **Success moment:** His TikTok using LIBÉRAL data gets 100K views. He submits his first pull request.

#### Persona 3: "Jean-Pierre" — The Retiree Watchdog (age 60-75)
- **Profile:** Retired fonctionnaire or private sector worker. Comfortable income. Deeply concerned about grandchildren's debt inheritance. Active in local associations.
- **Pain:** Reads Cour des Comptes summaries but finds them impenetrable. Knows the system is unsustainable but feels powerless. Worried about pension cuts.
- **Behavior:** Uses desktop/tablet, active on Facebook, reads Le Figaro and Les Echos online. Member of Contribuables Associés.
- **LIBÉRAL value:** The Debt Inheritance Counter shows each grandchild's share of public debt. The historical timeline shows how spending exploded during his lifetime. The town hall toolkit gives him facts for local council meetings.
- **Success moment:** He presents LIBÉRAL data at a municipal council meeting. The mayor can't refute the numbers.

### Secondary Users

#### Journalists & Data Reporters
- Use LIBÉRAL's clean datasets and API for investigative stories
- Embed visualizations in articles
- Value: pre-processed, verified, contextualised fiscal data saves days of research

#### Political Candidates & Parties
- Use comparison tools and historical data to build campaign arguments
- Value: data-backed policy proposals and opponent critiques

#### Researchers & Academics
- Access structured datasets for economic research
- Value: clean, versioned, well-documented fiscal data with reproducible methodology

#### Open Source Developers
- Contribute code, build plugins, extend the platform
- Value: meaningful civic tech project with real impact, AGPL license, modern tech stack

### User Journey

1. **Discovery:** User sees a viral social media post — a shocking infographic ("France has 483 taxes") or a friend's personalized tax receipt. Clicks through to LIBÉRAL.
2. **First experience:** Lands on the homepage. The live debt clock is ticking. Enters their income for a personalized tax receipt. Sees exactly where their euros go. Emotional impact.
3. **Exploration:** Digs deeper — compares France with Germany, browses the waste tracker, checks their deputy's voting record. Each click reveals another uncomfortable truth.
4. **Sharing:** Creates a shareable image of their personal tax receipt or a shocking stat. Posts to social media. The viral loop begins.
5. **Engagement:** Signs up for the monthly newsletter. Enables spending alerts. Downloads the town hall toolkit.
6. **Advocacy:** Uses LIBÉRAL data to write to their deputy, challenge local spending at council meetings, or support libertarian policy proposals with facts.
7. **Contribution:** Tech-savvy users star the GitHub repo, file issues, submit PRs. Non-tech users crowdsource waste reports and scandal documentation.

---

## Success Metrics

### User Success Metrics
- **Personal tax receipt generated:** User completes the tax calculator and sees their personalized breakdown
- **Share rate:** >15% of visitors share at least one visualization or data point on social media
- **Return visits:** >30% of users return within 30 days
- **Depth of engagement:** Average session explores 3+ different tools/visualizations
- **"Aha moment":** Users express surprise at fiscal data they didn't previously know (measurable via social media mentions and user feedback)

### Business Objectives

Since LIBÉRAL is a non-profit open-source project, "business" objectives focus on impact and sustainability:

- **Reach:** 100,000 unique visitors in first 6 months; 500,000 in first year
- **Awareness:** Featured in at least 5 major French media outlets (Le Monde, Le Figaro, Les Echos, BFM, France Info) within first year
- **Community:** 50+ GitHub contributors, 500+ GitHub stars within first year
- **Civic impact:** Data cited in at least 3 parliamentary questions or committee hearings within 18 months
- **Sustainability:** Achieve 500+ recurring donors covering basic hosting costs (~50 EUR/month) by month 12

### Key Performance Indicators

| KPI | Target (6 months) | Target (12 months) |
|-----|-------------------|-------------------|
| Monthly unique visitors | 50,000 | 150,000 |
| Personal tax receipts generated | 25,000 | 100,000 |
| Social media shares | 10,000/month | 50,000/month |
| GitHub stars | 200 | 500+ |
| GitHub contributors | 20 | 50+ |
| Newsletter subscribers | 5,000 | 20,000 |
| Media mentions | 10 | 30+ |
| Monthly recurring donations | 200 EUR | 500+ EUR |
| Average session duration | >3 minutes | >4 minutes |
| Mobile traffic share | >60% | >65% |

---

## MVP Scope

### Core Features (MVP v1.0)

The MVP focuses on three high-impact, quick-win features that can be built rapidly and are designed for maximum viral potential:

#### 1. National Debt Clock (Week 1-2)
- Live-ticking counter showing France's public debt in real-time
- Debt per citizen, per taxpayer, per household, per newborn
- Debt servicing cost per second
- Historical trajectory with key events overlay
- Shareable as image/embed

#### 2. Personal Tax Receipt / "Where Do My Euros Go?" (Month 1-2)
- User inputs annual gross income
- Calculates total tax burden (income tax + CSG/CRDS + TVA estimate + social charges)
- Shows personalized breakdown: X EUR for debt interest, Y EUR for pensions, Z EUR for defense, etc.
- "Tax Freedom Day" — the date you stop working for the government
- Shareable infographic generation
- Integration with OpenFisca calculation engine for accuracy

#### 3. France vs. X Country Comparator (Month 2-3)
- Side-by-side comparison: tax burden, spending/GDP, debt/GDP, public employment
- Pre-set comparisons: France vs Germany, UK, Switzerland, US, OECD average
- Interactive charts showing France's position in OECD rankings
- Key "did you know" facts for each comparison

#### 4. Supporting Infrastructure (Continuous)
- Automated data pipeline from data.gouv.fr, INSEE, Eurostat, OECD
- PostgreSQL database with clean, versioned fiscal data
- Next.js frontend with ECharts visualizations
- Mobile-responsive, RGAA accessible
- Open-source repository (AGPL-3.0) on GitHub
- Basic SEO optimization for French fiscal search terms
- Cloudflare Pages + Scaleway backend hosting (~30-50 EUR/month)

### Out of Scope for MVP

- Politician promise tracker and voting record analysis
- Waste and scandal database
- Local/regional spending comparison
- Participatory budget simulator
- Community crowdsourcing features
- Native mobile app (web-first, PWA later)
- Automated Cour des Comptes report parsing (NLP)
- Full text search (Meilisearch — Phase 2)
- Newsletter and alert system
- User accounts and saved preferences
- API for third-party developers

### MVP Success Criteria

The MVP is successful if:

1. **Viral traction:** At least one visualization goes viral (>10K shares) within first month of launch
2. **Media coverage:** At least one major French media outlet covers the project
3. **Personal engagement:** >5,000 personal tax receipts generated in first month
4. **Technical validation:** Data pipeline runs reliably with <1 hour latency on key datasets
5. **Community signal:** >50 GitHub stars and >5 external contributors within 3 months
6. **Cost validation:** Total hosting costs remain under 100 EUR/month

### Future Vision

**Phase 2 (Months 4-8):**
- Politician accountability dashboard (promise tracker, voting records, cost calculator)
- Waste & scandal tracker database
- Regional/municipal spending comparison map
- Monthly newsletter with automated content
- Meilisearch full-text search across all fiscal data
- PWA for offline access

**Phase 3 (Months 9-15):**
- Participatory budget simulator
- Community crowdsourcing for waste reports
- NLP-powered Cour des Comptes report parsing
- "Ask Your Deputy" letter generator
- API for journalists and researchers
- Gamification (fiscal literacy quizzes, achievements)

**Phase 4 (Year 2+):**
- European Fiscal Transparency Network — expand to other EU countries
- AI-powered fiscal auditor (pattern detection in spending data)
- Real-time budget execution dashboard
- Lobbying expenditure cross-reference
- Blockchain data provenance (experimental)
- Annual "State of the Taxpayer" report — a media event

**The Moonshot:** LIBÉRAL becomes the trusted, go-to source for French fiscal data — the platform that journalists cite, politicians fear, and citizens use to make informed democratic decisions. It proves that transparency is the most powerful tool for fiscal responsibility, and that open-source civic tech can shift the political conversation in a country where the state has had an information monopoly for too long.

---

*Document created: 2026-02-27*
*Project: LIBÉRAL*
*Author: Tirakninepeiijub*
*Input documents: 4 research reports (brainstorming, domain, market, technical)*
