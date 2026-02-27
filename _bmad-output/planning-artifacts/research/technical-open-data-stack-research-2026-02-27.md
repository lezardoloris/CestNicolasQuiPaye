---
stepsCompleted: [init, technical-overview, integration-patterns, architectural-patterns, implementation-research, research-synthesis]
research_type: technical
research_topic: Open Data Technology Stack for French Fiscal Transparency
date: 2026-02-27
---

# Technical Research Report: Open Data Technology Stack for LIBERAL

## Project: Exposing France's Government Spending and Political Irresponsibilities

**Date:** 2026-02-27
**Scope:** Comprehensive technical research covering data sources, frontend/backend technologies, infrastructure, architecture, and open-source strategy for a libertarian civic transparency platform.

---

## Table of Contents

1. [Data Sources and APIs](#1-data-sources-and-apis)
2. [Frontend Technology Options](#2-frontend-technology-options)
3. [Backend and Data Pipeline](#3-backend-and-data-pipeline)
4. [Hosting and Infrastructure](#4-hosting-and-infrastructure)
5. [Open Source Strategy](#5-open-source-strategy)
6. [Architecture Patterns](#6-architecture-patterns)
7. [Performance and Accessibility](#7-performance-and-accessibility)
8. [Security Considerations](#8-security-considerations)
9. [Recommendations and Synthesis](#9-recommendations-and-synthesis)

---

## 1. Data Sources and APIs

### 1.1 data.gouv.fr -- France's National Open Data Platform

**URL:** https://www.data.gouv.fr/
**API Reference:** https://doc.data.gouv.fr/api/reference/

The central platform for French public open data, hosting **73,000+ datasets** from **6,000+ organizations** with **383,000+ files**.

- **API Endpoint:** `https://www.data.gouv.fr/api/1/`
- **Authentication:** API key via `X-API-KEY` header (required for write operations; read is open)
- **Formats:** JSON (primary API), CSV, XML available per dataset
- **Rate Limits:** Not explicitly documented; reasonable use expected
- **Key Budget/Spending Datasets:**
  - Projet de Loi de Finances (PLF) data -- annual budget law proposals with detailed breakdowns
  - Comptes publics -- public accounts data
  - "Budget vert" (green budget) environmental impact ratings of all budgetary credits
  - Données essentielles de la commande publique (public procurement essential data)
  - State general accounting data published annually since 2012

**Assessment:** Excellent primary data source. Well-documented REST API. JSON output. Regular updates aligned with the budget cycle. Historical data available since 2012 for many datasets.

Sources:
- [data.gouv.fr API Reference](https://doc.data.gouv.fr/api/reference/)
- [data.gouv.fr API Guide](https://guides.data.gouv.fr/guide-data.gouv.fr/api)
- [Catalogue des API publiques](https://www.data.gouv.fr/dataservices)

---

### 1.2 data.economie.gouv.fr -- Ministry of Economy Open Data

**URL:** https://data.economie.gouv.fr/
**API Console:** https://data.economie.gouv.fr/api/v1/console

The Ministry of Economy, Finance, and Industrial Sovereignty's dedicated portal.

- **API Version:** Explore API v2
- **Content:** Budget execution data, tax bulletin (BOFIP), public procurement data, general State accounts
- **Formats:** JSON, CSV via API; some PDF documents
- **Key Datasets:**
  - Compte general de l'Etat (State General Account) -- published since 2018, with data going back to 2012
  - Documents et comptes des entreprises (corporate documents and accounts)
  - Bulletin Officiel des Finances Publiques (tax documentation)

**Assessment:** Essential for detailed budget execution data. API is well-structured. Updates are annual for budget data, more frequent for other datasets.

Sources:
- [Data Economie Portal](https://data.economie.gouv.fr/)
- [API Console](https://data.economie.gouv.fr/api/v1/console)
- [Compte general de l'Etat visualization](https://www.budget.gouv.fr/reperes/comptes_etat/articles/publication-dune-datavisualisation-du-compte-general-de-letat)

---

### 1.3 budget.gouv.fr -- Official Budget Portal

**URL:** https://www.budget.gouv.fr/

- **Content:** Loi de Finances data, budget execution, public finance panorama
- **Formats:** Open standard machine-readable data files (CSV, XML) alongside PDF documents
- **Key Resources:**
  - PLF (Projet de Loi de Finances) annual data in open formats
  - PAP (Projets Annuels de Performance) -- annual performance projects
  - Panorama des finances publiques -- overview of all public administrations (central, local, social security)
  - Administrations Publiques Locales (APUL) data

**Assessment:** Primary source for structured budget law data. Published annually with the finance bill. Machine-readable formats available since ~2019. Historical PLF data available.

Sources:
- [PLF 2023 Open Data](https://www.budget.gouv.fr/documentation/documents-budgetaires/exercice-2023/le-projet-de-loi-de-finances-et-les-documents-annexes-pour-2023/donnees-chiffrees-sous-standard-ouvert-et-exploitables)
- [Panorama des Finances Publiques](https://www.budget.gouv.fr/panorama-finances-publique/administrations-publiques)

---

### 1.4 INSEE API -- National Statistics Institute

**URL:** https://www.insee.fr/
**API Portal:** https://portail-api.insee.fr/

France's official statistics agency, providing economic, demographic, and social data.

- **API Access:** RESTful API via the official portal
- **Key APIs:**
  - SIRENE API -- business directory (9M+ establishments)
  - BDM (Banque de Donnees Macro-economiques) -- macroeconomic time series
  - Donnees locales -- local/regional statistics
  - Nomenclatures -- classification systems
- **Formats:** JSON, CSV, XML (SDMX)
- **Authentication:** API key required (free registration)
- **Key Data:**
  - GDP, inflation, unemployment
  - Consumer Price Index (CPI) -- updated to eCOICOPv2 classification in 2025
  - Public finance statistics
  - Population and demographics
  - Regional economic indicators

**Assessment:** Gold standard for French economic statistics. Well-maintained API. Regular updates (monthly/quarterly/annual depending on indicator). Essential for providing economic context to spending data.

Sources:
- [INSEE API Portal](https://portail-api.insee.fr/)
- [INSEE Statistics by Theme](https://www.insee.fr/en/information/8566052)
- [INSEE GitHub](https://github.com/inseefr)

---

### 1.5 Banque de France -- Webstat API

**URL:** https://webstat.banque-france.fr/
**API:** Webstat API

- **Content:** 40,000+ statistical time series covering monetary policy, financial markets, balance of payments, credit, savings, and regional economic data
- **Formats:** JSON, CSV, SDMX
- **Authentication:** Free registration required
- **Key Data:**
  - Government debt statistics
  - Interest rates and monetary data
  - Balance of payments
  - Credit and savings data
  - Company financial data (bilans via API Entreprise integration)
  - Regional economic conditions

**Assessment:** Critical for financial context -- government debt, interest rates, monetary data. Free API with generous usage. Well-structured time series data.

Sources:
- [Webstat Portal](https://webstat.banque-france.fr/en/)
- [Banque de France APIs on api.gouv.fr](https://api.gouv.fr/producteurs/banque-de-france)
- [Webstat on data.gouv.fr](https://www.data.gouv.fr/dataservices/webstat)

---

### 1.6 DGFIP -- Tax Administration

**URL:** https://www.impots.gouv.fr/ouverture-des-donnees-publiques-de-la-dgfip

The Direction Generale des Finances Publiques manages tax data.

- **Available APIs (4 on data.gouv.fr):**
  - **API Impot particulier** -- individual tax return data (restricted access)
  - **API SFiP** -- financial information exchange between administrations
  - **API Liasses fiscales** -- corporate tax returns data
  - **API Service Finances Publiques** -- general public finance service
- **Open Data:**
  - Tax calculation algorithms (published as code)
  - Source code of main tax calculation programs
  - Local authority financial statistics
  - Property values (DVF -- Demandes de Valeurs Foncieres)
- **Access Restrictions:** Most APIs restricted to authorized public entities. **Open data datasets are freely available.**

**Assessment:** Mixed accessibility. Open data on tax calculation methods and local finance statistics is excellent and freely available. Individual/corporate tax APIs are restricted to administrations. The open datasets on local government finance are particularly valuable for the project.

Sources:
- [DGFIP Open Data](https://www.impots.gouv.fr/ouverture-des-donnees-publiques-de-la-dgfip)
- [DGFIP APIs](https://api.gouv.fr/producteurs/dgfip)
- [DGFIP API Access](https://www.impots.gouv.fr/comment-acceder-aux-api-de-la-dgfip)

---

### 1.7 Assemblee Nationale -- National Assembly Open Data

**URL:** https://data.assemblee-nationale.fr/

- **Content:**
  - Voting records (scrutins solennels, government declarations, procedural motions)
  - Deputies data (current and historical)
  - Parliamentary work (amendments, questions, commission reports)
  - Legislative dossiers
- **Formats:** XML and JSON
- **Coverage:** Current legislature (17th) with archives for previous legislatures
- **Access:** Open, no authentication required

**Assessment:** Excellent for tracking how representatives vote on spending legislation. Well-structured data in JSON/XML. Essential for accountability features.

Sources:
- [Data Assemblee Nationale](https://data.assemblee-nationale.fr/)
- [Voting Data](https://data.assemblee-nationale.fr/travaux-parlementaires/votes)
- [Parliamentary Work](https://data.assemblee-nationale.fr/travaux-parlementaires)

---

### 1.8 Senat -- Senate Open Data

**URL:** https://data.senat.fr/

- **Datasets:**
  - Amendments database (Ameli) -- all amendments filed since October 2001 (public session) and 2010 (commission)
  - Legislative files (Dosleg) -- parliamentary documents since October 1977
  - Questions database -- written and oral questions since April 1978
  - Minutes (Comptes rendus) -- public session minutes since January 2003
  - Legislative texts in Akoma Ntoso format
- **Formats:** XML, JSON, CSV
- **License:** Open data, reusable

**Assessment:** Deep historical data going back to 1977. Complements Assemblee Nationale data for full parliamentary picture. Well-structured legislative tracking.

Sources:
- [data.senat.fr](https://data.senat.fr/)
- [Senat on data.gouv.fr](https://www.data.gouv.fr/organizations/senat)

---

### 1.9 NosDepartementes.fr / Regards Citoyens Ecosystem

**URL:** https://www.nosdeputes.fr/ | https://github.com/regardscitoyens

Regards Citoyens is a volunteer association promoting open data and democratic transparency since 2009, with **87 GitHub repositories**.

- **NosDenommes.fr API:**
  - Parliamentary activity data
  - Available in XML, JSON, CSV
  - Open source (CC-BY-SA for content, ODbL for data)
  - API documentation: https://github.com/regardscitoyens/nosdeputes.fr/blob/master/doc/api.md
- **NosSenateurs.fr:** Same API structure for Senate
- **NosFinancesLocales:** Local government financial data visualization
  - GitHub: https://github.com/regardscitoyens/nosfinanceslocales
- **Additional Projects:**
  - Registres-lobbying (lobbying registers)
  - Collaborateurs-Parlement (parliamentary collaborators)
  - La Fabrique de la Loi (legislative process tracking)
  - ParlAPI.fr -- simplified RESTful API for parliamentary data

**Assessment:** Invaluable ecosystem of existing civic tech. Pre-processed parliamentary data that saves significant development effort. The code is open source and can be studied, forked, or integrated. NosFinancesLocales provides a precedent for local finance visualization.

Sources:
- [NosDenommes.fr](https://www.nosdeputes.fr/)
- [API Documentation](https://github.com/regardscitoyens/nosdeputes.fr/blob/master/doc/api.md)
- [Regards Citoyens GitHub](https://github.com/regardscitoyens)
- [NosFinancesLocales](https://github.com/regardscitoyens/nosfinanceslocales)

---

### 1.10 Cour des Comptes -- National Audit Office

**URL:** https://www.ccomptes.fr/fr/cour-des-comptes/nous-decouvrir/donnees-publiques

- **Open Data:**
  - Published reports dataset on data.gouv.fr (since 2011)
  - Recommendations database (since 2015)
  - **OpenAnafi** -- open-source financial analysis software (MIT license)
    - Backend: Django/Python -- https://github.com/Cour-des-comptes/open-anafi-backend
    - Frontend: Angular/TypeScript -- https://github.com/Cour-des-comptes/open-anafi-frontend
    - Generates financial analysis grids from local authority accounting data
    - Relies on DGFIP database
- **Formats:** Primarily PDF reports; structured data via OpenAnafi and data.gouv.fr datasets

**Assessment:** The Cour des Comptes is the supreme audit institution. OpenAnafi is a goldmine -- a production-grade, MIT-licensed financial analysis tool for local government accounts. Reports are often PDF (requiring extraction), but structured data is increasingly available. The OpenAnafi codebase provides validated financial analysis methodologies.

Sources:
- [Cour des Comptes Open Data](https://www.ccomptes.fr/fr/cour-des-comptes/nous-decouvrir/donnees-publiques)
- [OpenAnafi Backend](https://github.com/Cour-des-comptes/open-anafi-backend)
- [OpenAnafi Frontend](https://github.com/Cour-des-comptes/open-anafi-frontend)
- [Reports on data.gouv.fr](https://www.data.gouv.fr/datasets/rapports-publies-par-la-cour-des-comptes)

---

### 1.11 Collectivites Territoriales -- Local Government Data

**URL:** https://www.collectivites-locales.gouv.fr/finances-locales

- **DGCL (Direction Generale des Collectivites Locales):**
  - Individual data on state grants to local authorities
  - Local authority finance statistics by year
  - "Les collectivites locales en chiffres" -- annual statistical publication (2025 edition available)
- **OFGL (Observatoire des Finances et de la Gestion publique Locales):**
  - data.ofgl.fr portal
  - "FiloTheque" -- comprehensive local finance library
- **DGFIP:**
  - Territorial authority accounts on data.gouv.fr
- **AMF (Association des Maires de France):**
  - Finances locales data and analysis

**Assessment:** Rich but fragmented across multiple sources. OFGL and DGCL provide the most structured data. Local finance data is essential for showing how government spending affects citizens at the local level.

Sources:
- [Collectivites Locales - Finances](https://www.collectivites-locales.gouv.fr/finances-locales)
- [Les Collectivites en Chiffres 2025](https://www.collectivites-locales.gouv.fr/les-collectivites-locales-en-chiffres-2025)
- [INSEE Local Finance Data](https://www.insee.fr/fr/statistiques/3676772?sommaire=3696937)

---

### 1.12 European and International Data Sources

#### Eurostat
**URL:** https://ec.europa.eu/eurostat/data/database
**API:** REST API following SDMX 3.0 specification

- **Request Structure:** `{host_url}/{service}/{version}/{response_type}/{datasetCode}`
- **Key Datasets:**
  - Government expenditure by function (COFOG) -- `gov_10a_exp`
  - Government finance statistics (quarterly)
  - General government gross debt
  - Government deficit/surplus
- **Formats:** JSON, CSV, SDMX
- **Update:** Annual (reference year typically 1-2 years behind)

#### OECD
**URL:** https://www.oecd.org/
- "Government at a Glance" publication (2025 edition includes France country note)
- OECD.Stat API for programmatic access
- Comparative government spending data across member countries

#### ECB (European Central Bank)
**URL:** https://data.ecb.europa.eu/
- Government finance statistics (GFS) including France-specific data
- Quarterly government primary deficit/surplus
- Formats: SDMX, CSV, JSON

#### AMECO Database (European Commission)
**URL:** https://economy-finance.ec.europa.eu/economic-research-and-databases/economic-databases/ameco-database_en
- Macroeconomic data for EU members including France
- 18 chapters from population to sector accounts

**Assessment:** Essential for comparative analysis -- showing France's spending relative to other countries. Eurostat API is mature and well-documented. Data typically lags 1-2 years but provides authoritative cross-country comparisons.

Sources:
- [Eurostat API Getting Started](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/api)
- [Government Expenditure COFOG](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Government_expenditure_by_function_%E2%80%93_COFOG)
- [OECD Government at a Glance 2025: France](https://www.oecd.org/en/publications/government-at-a-glance-2025-country-notes_da3361e1-en/france_fcb2c4da-en.html)
- [ECB Government Finance Statistics](https://data.ecb.europa.eu/data/datasets/GFS/GFS.Q.N.FR.W0.S13.S1._Z.B.B9P._Z._Z._Z.XDC._Z.S.V.N._T)

---

### 1.13 Data Formats and Quality Summary

| Source | Primary Format | Quality | Update Frequency | Historical Depth |
|--------|---------------|---------|------------------|-----------------|
| data.gouv.fr | JSON, CSV | High | Varies by dataset | Varies |
| data.economie.gouv.fr | JSON, CSV | High | Annual (budget) | Since 2012 |
| budget.gouv.fr | CSV, XML, PDF | High | Annual | Since ~2019 (open) |
| INSEE | JSON, CSV, SDMX | Very High | Monthly/Quarterly/Annual | Decades |
| Banque de France | JSON, SDMX | Very High | Monthly/Quarterly | Decades |
| DGFIP | JSON, CSV | High | Annual | Varies |
| Assemblee Nationale | XML, JSON | High | Real-time (sessions) | Multiple legislatures |
| Senat | XML, JSON, CSV | High | Real-time | Since 1977 |
| Regards Citoyens | JSON, XML, CSV | Good | Near real-time | Since 2007 |
| Cour des Comptes | PDF, JSON | Medium | As published | Since 2011 |
| Eurostat | JSON, CSV, SDMX | Very High | Annual | Decades |
| OECD | JSON, CSV | Very High | Annual/Biennial | Decades |

**Key Challenges:**
- Cour des Comptes reports are primarily PDF (requiring extraction)
- Local government data is fragmented across DGCL, OFGL, DGFIP, and AMF
- Some DGFIP APIs are restricted to authorized administrations
- Budget data publication follows the legislative calendar (not continuous)
- European data typically lags 1-2 years behind

---

## 2. Frontend Technology Options

### 2.1 Framework Comparison

#### Next.js (React) -- RECOMMENDED

**Version:** 15.x (stable as of 2026)
**URL:** https://nextjs.org/

- **Strengths:**
  - Full rendering flexibility: SSG, SSR, ISR (Incremental Static Regeneration), streaming, hybrid
  - Largest ecosystem and community
  - Excellent integration with Vercel hosting (free tier available)
  - Native react-dsfr integration available for French government design system
  - Built-in image optimization, font loading, and performance features
  - App Router with React Server Components for efficient data loading
  - Strong TypeScript support
- **Weaknesses:**
  - Larger JavaScript bundles compared to Astro/SvelteKit
  - Average Lighthouse score ~75/100 out of the box
  - Vercel lock-in risk (mitigated by self-hosting capability)
- **For LIBERAL:** Best choice for a comprehensive civic data application that needs both static content pages and interactive data dashboards. ISR allows scheduled data updates without full rebuilds.

#### Astro -- STRONG ALTERNATIVE

**Version:** 5.x
**URL:** https://astro.build/

- **Strengths:**
  - Ships zero JavaScript by default; hydrates only when needed
  - 40% faster load times, 90% less JavaScript than React frameworks
  - LCP metrics 40-70% lower than SSG-optimized Next.js
  - Server-first rendering approach
  - Can use React, Vue, or Svelte components within Astro pages ("islands")
  - Excellent for content-heavy sites
  - Static sites load in under 500ms
- **Weaknesses:**
  - Less mature for full application development
  - Smaller ecosystem than Next.js
  - No built-in react-dsfr integration
- **For LIBERAL:** Excellent for the public-facing content and data pages. Could be used as the primary framework with React islands for interactive visualizations.

#### SvelteKit -- LIGHTWEIGHT ALTERNATIVE

**Version:** 2.x
**URL:** https://svelte.dev/

- **Strengths:**
  - 50%+ less JavaScript shipped versus Next.js
  - 90/100 Lighthouse score out of the box (vs ~75 for Next.js)
  - Can mix SSR and SSG in the same project
  - Halves interactivity delay for authenticated SaaS apps
  - Compile-time framework (no virtual DOM overhead)
  - Smaller bundle sizes, faster initial loads
- **Weaknesses:**
  - Smaller ecosystem and community
  - No react-dsfr support (would need custom DSFR integration)
  - Fewer ready-made dashboard component libraries
- **For LIBERAL:** Very capable but limited ecosystem for civic data dashboards. Would require more custom component development.

#### Nuxt (Vue) -- ALTERNATIVE

**Version:** 3.x
**URL:** https://nuxt.com/

- **Strengths:**
  - Vue ecosystem (popular in France)
  - DSFR has Vue portage available
  - Good SSG/SSR hybrid capabilities
  - Strong developer experience
- **Weaknesses:**
  - Smaller than React ecosystem for data visualization
  - Fewer dashboard component libraries
- **For LIBERAL:** Viable if team prefers Vue. DSFR Vue support is a plus.

Sources:
- [2026 Framework Comparison](https://www.nunuqs.com/blog/nuxt-vs-next-js-vs-astro-vs-sveltekit-2026-frontend-framework-showdown)
- [SvelteKit vs Next.js vs Astro](https://www.gigson.co/blog/sveltekit-vs-next-js-vs-astro-which-framework-wins-in-2026)
- [SSR Performance Benchmarks](https://www.enterspeed.com/blog/we-measured-the-ssr-performance-of-6-js-frameworks-heres-what-we-found)

---

### 2.2 Data Visualization Libraries

#### D3.js -- Full Control

**URL:** https://d3js.org/
**License:** ISC (permissive)

- Complete creative freedom for custom visualizations
- Bind any data to DOM, full SVG/Canvas control
- Steep learning curve; basic charts take significantly more time
- Best for: Unique, custom visualizations (Sankey diagrams for budget flows, treemaps for spending breakdowns)
- **Use case for LIBERAL:** Custom budget flow diagrams, spending treemaps, unique political visualizations

#### Apache ECharts -- RECOMMENDED for Dashboards

**URL:** https://echarts.apache.org/
**License:** Apache 2.0

- Feature-rich: line, bar, heatmaps, candlesticks, 3D, geographic maps
- Technically superior performance, especially with large datasets
- Strong internationalization support (including French)
- Responsive design, smooth animations, dynamic data loading
- Good middle ground between D3 flexibility and Chart.js simplicity
- **Use case for LIBERAL:** Primary chart library for dashboards -- spending trends, budget comparisons, economic indicators

#### Observable Plot -- RECOMMENDED for Data Exploration

**URL:** https://observablehq.com/plot/
**License:** ISC

- Concise, expressive API following grammar of graphics
- Built by the D3 team -- high quality
- Scales, layered marks, small multiples
- GeoJSON support with spherical projections
- Built-in interaction (tips, zoom, filter)
- Works well with React and vanilla JS
- 2025: Enhanced clip mark options, improved waffle marks
- **Use case for LIBERAL:** Data exploration pages, quick analytical views, geographic spending maps

#### Plotly.js -- Scientific Visualization

**URL:** https://plotly.com/javascript/
**License:** MIT

- Publication-quality charts
- Interactive: tooltips, zooming, panning
- Strong Python/R integration (useful for data pipeline)
- Handles large datasets well
- 3D surfaces, geographic maps
- Heavier than ECharts, slower for massive datasets
- **Use case for LIBERAL:** Complex analytical visualizations, 3D budget projections

#### Chart.js -- Simple Charts

**URL:** https://www.chartjs.org/
**License:** MIT

- Easy to use, responsive by default
- Good for beginners and simple dashboards
- Limited for complex visualizations
- **Use case for LIBERAL:** Simple embedded charts in articles/blog posts

#### Tremor -- RECOMMENDED for React Dashboards

**URL:** https://www.tremor.so/
**License:** Apache 2.0

- 35+ components, 300+ copy-paste blocks
- Built on Recharts and Radix UI
- Pre-built: LineChart, BarChart, AreaChart, DonutChart, KPI cards, data tables
- Tailwind CSS styling, fully accessible
- 16,000+ GitHub stars, 300,000+ monthly downloads
- Acquired by Vercel -- strong ongoing investment
- Copy-paste approach (own the code)
- **Use case for LIBERAL:** Primary dashboard UI components -- KPI cards, summary charts, data tables

Sources:
- [JavaScript Chart Libraries Comparison](https://www.luzmo.com/blog/best-javascript-chart-libraries)
- [D3 vs ECharts vs Recharts vs Plotly](https://medium.com/@pallavi8khedle/when-to-use-d3-echarts-recharts-or-plotly-based-on-real-visualizations-ive-built-08ba1d433d2b)
- [Tremor Official](https://www.tremor.so/)
- [Observable Plot](https://observablehq.com/plot/)

---

### 2.3 Geographic Visualization

#### MapLibre GL JS -- RECOMMENDED

**URL:** https://maplibre.org/
**License:** BSD 3-Clause

- Open-source fork of Mapbox GL JS (community-driven since 2020)
- GPU-accelerated vector tile rendering
- No proprietary licensing constraints
- Growing adoption (clear uptrend from mid-2024)
- Full control over data sources and privacy
- **Use case for LIBERAL:** Geographic spending maps per region/department/commune

#### Leaflet

**URL:** https://leafletjs.com/
**License:** BSD 2-Clause

- Lightweight, mobile-friendly
- Huge plugin ecosystem
- Simpler than MapLibre but less performant for large datasets
- **Use case for LIBERAL:** Simpler geographic views, fallback for low-end devices

#### deck.gl

**URL:** https://deck.gl/
**License:** MIT

- WebGL layers for large-scale geospatial data
- Integrates with MapLibre, Mapbox, Google Maps
- Best for: massive point datasets, 3D geographic views
- **Use case for LIBERAL:** Large-scale geographic spending data with millions of points

Sources:
- [MapLibre](https://maplibre.org/)
- [deck.gl Documentation](https://deck.gl/docs)
- [Mapping Libraries Comparison](https://giscarta.com/blog/mapping-libraries-a-practical-comparison)

---

### 2.4 UI Component Libraries

#### shadcn/ui + Radix + Tailwind CSS -- RECOMMENDED

**URL:** https://ui.shadcn.com/

- Copy-paste model: own the source code, full customization
- Built on Radix UI primitives (accessible by default)
- Styled with Tailwind CSS v4
- Updated for React 19 and Tailwind v4
- RTL support, theming via CSS variables
- Both Radix and Base UI variants available
- **Massive ecosystem:** theme generators, blocks, templates

#### DSFR (Systeme de Design de l'Etat) -- FOR CREDIBILITY

**URL:** https://www.systeme-de-design.gouv.fr/
**React Toolkit:** https://github.com/codegouvfr/react-dsfr

- Official French government design system
- 106 accessibility criteria (RGAA compliant)
- react-dsfr: TypeSafe, well-documented API
- Perfect integration with Next.js, Create React App, Vite
- Portages available for React, Vue.js, Angular, Django, Drupal
- Developed by multidisciplinary team including accessibility experts
- **Strategic Value:** Using DSFR elements lends credibility and familiarity. Citizens will recognize the visual language of official government sites. This can be powerful for a transparency project -- using the government's own design tools to expose their spending.

**Recommendation:** Use shadcn/ui as the primary component library with DSFR elements strategically incorporated for credibility and accessibility compliance.

Sources:
- [shadcn/ui](https://ui.shadcn.com/)
- [DSFR Official](https://www.systeme-de-design.gouv.fr/version-courante/fr)
- [react-dsfr](https://github.com/codegouvfr/react-dsfr)
- [DSFR Component Library](https://www.systeme-de-design.gouv.fr/version-courante/fr/composants)

---

## 3. Backend and Data Pipeline

### 3.1 Data Collection Strategy

#### API-First Collection (Primary)
Most data sources provide REST APIs. The pipeline should:
1. Register for API keys (INSEE, Banque de France, data.gouv.fr)
2. Implement rate-limited API clients
3. Schedule collection aligned with data publication cycles
4. Store raw API responses for reproducibility

#### Web Scraping (Secondary -- for PDFs and unstructured data)

**Python PDF Extraction Libraries (2025 landscape):**

| Library | Best For | Performance |
|---------|----------|-------------|
| **marker-pdf** | Perfect structure preservation | Slower |
| **pymupdf4llm** | Markdown output, good speed balance | Fast |
| **pdfplumber** | Table extraction, precise control | Moderate |
| **tabula-py** | Converting PDF tables to CSV/Excel | Moderate |
| **unstructured** | Semantic chunks (RAG workflows) | Moderate |
| **pypdfium2** | Basic text, maximum speed | Very fast |

**Web Scraping Framework:**
- **Scrapy** -- Battle-tested (10+ years), robust pipeline: spiders -> items -> pipelines -> storage
- **Beautiful Soup + Requests** -- Simpler for targeted scraping
- **Playwright/Puppeteer** -- For JavaScript-rendered pages

**Targets for scraping:**
- Cour des Comptes PDF reports
- Budget annexes not available as open data
- Parliamentary document PDFs

Sources:
- [Python PDF Extractors Comparison 2025](https://onlyoneaman.medium.com/i-tested-7-python-pdf-extractors-so-you-dont-have-to-2025-edition-c88013922257)
- [ETL Pipeline for Web Scraping](https://dev.to/techwithqasim/building-an-etl-pipeline-for-web-scraping-using-python-2381)

---

### 3.2 ETL Pipeline Architecture

```
Raw Sources          Extract              Transform           Load
+-----------+       +----------+         +-----------+       +----------+
| APIs      |------>| API      |-------->| Clean     |------>| DuckDB   |
| (JSON)    |       | Clients  |         | Validate  |       | (OLAP)   |
+-----------+       +----------+         | Normalize |       +----------+
                                         | Aggregate |            |
+-----------+       +----------+         +-----------+       +----------+
| PDFs      |------>| PDF      |              |              | Postgres |
| (Reports) |       | Extract  |              |              | (OLTP)   |
+-----------+       +----------+              |              +----------+
                                              |                   |
+-----------+       +----------+              |              +----------+
| CSV/XML   |------>| File     |              |              | Static   |
| (Datasets)|       | Parsers  |              |              | JSON     |
+-----------+       +----------+              |              +----------+
                                              |                   |
                                         +-----------+       +----------+
                                         | Version   |       | Search   |
                                         | Control   |       | Index    |
                                         | (Git/DVC) |       | (Meili)  |
                                         +-----------+       +----------+
```

**Scheduling:**
- **GitHub Actions** (free for public repos): Cron-triggered workflows for data updates
- **Temporal/Prefect** (if self-hosted): More complex orchestration
- Recommended schedule: Weekly for most datasets; daily for parliamentary data during sessions; aligned with publication cycles for budget data

---

### 3.3 Backend Language Options

#### Python (FastAPI) -- RECOMMENDED

- **Strengths:**
  - Superior data processing ecosystem (pandas, numpy, scipy)
  - FastAPI: async-first, automatic OpenAPI docs, Pydantic validation
  - 40% adoption growth in 2025
  - Ideal for financial data validation and analysis
  - Natural integration with data science tools
  - OpenAnafi is Python/Django -- direct reuse opportunity
  - Excellent PDF extraction libraries
- **Weaknesses:**
  - ~44% lower request throughput vs Node.js for pure API serving
  - GIL limits true parallelism (mitigated by async)
- **Verdict:** Best choice for data pipeline and API. The data processing advantages far outweigh raw throughput concerns for this use case.

#### Node.js (Express/Fastify)

- **Strengths:**
  - Same language as frontend (JavaScript/TypeScript)
  - Higher raw request throughput
  - Large ecosystem
- **Weaknesses:**
  - Weaker data science ecosystem
  - Less natural for data processing tasks
- **Verdict:** Good for API serving but less ideal for data pipeline work.

#### Rust

- **Strengths:** Maximum performance for data processing
- **Weaknesses:** Steep learning curve, smaller ecosystem, harder to attract open-source contributors
- **Verdict:** Overkill for this project's scale. Consider for specific performance-critical components only.

#### Go

- **Strengths:** Simple, fast, good concurrency
- **Weaknesses:** Limited data science ecosystem
- **Verdict:** Good for infrastructure components but not ideal for data analysis.

Sources:
- [FastAPI vs Express 2025](https://www.slincom.com/blog/programming/fastapi-vs-express-backend-comparison-2025)
- [Go vs Node.js vs FastAPI 2026](https://www.index.dev/skill-vs-skill/backend-go-vs-nodejs-vs-python-fastapi)

---

### 3.4 Database Options

#### PostgreSQL -- RECOMMENDED as Primary Database

- Relational, ACID-compliant, excellent for structured budget data
- JSON/JSONB support for flexible schemas
- PostGIS for geographic queries
- Full-text search capabilities (adequate for basic search)
- Mature, battle-tested, massive community
- **For LIBERAL:** Primary data store for processed, structured spending data

#### DuckDB -- RECOMMENDED for Analytics

- Embedded, in-process analytical database
- Columnar storage, excellent for OLAP queries
- Runs directly in Python, Node.js, or even in the browser (WASM)
- Perfect for: aggregating budget data, computing statistics, generating visualizations
- Can read Parquet, CSV, JSON directly
- No server needed -- runs as a library
- **For LIBERAL:** Analytics engine. Process raw data files, compute aggregations, power the data exploration features. Can even run client-side via WASM for interactive data exploration.

#### SQLite -- Supplementary

- File-based, zero configuration
- Good for: caching API responses, lightweight local storage
- **For LIBERAL:** Cache layer for API responses during data collection

#### ClickHouse -- At Scale (Future)

- Distributed columnar database
- 9,000x faster than DuckDB for large-scale analytics
- Overkill for initial launch but valuable if data grows to terabytes
- **For LIBERAL:** Future consideration if the project scales significantly

#### Supabase -- Hosted PostgreSQL Option

- **Free Tier:** 500MB database, 1GB file storage, 50K MAUs, unlimited API requests
- Built-in auth, real-time subscriptions, edge functions
- 2 active projects on free tier
- Projects pause after 1 week of inactivity (free tier limitation)
- **For LIBERAL:** Good option for MVP/prototype. The pause-on-inactivity limitation is problematic for production.

Sources:
- [ClickHouse vs DuckDB](https://www.cloudraft.io/blog/clickhouse-vs-duckdb)
- [DuckDB vs ClickHouse 2026](https://tasrieit.com/blog/clickhouse-vs-duckdb-2026)
- [Supabase Pricing](https://supabase.com/pricing)

---

### 3.5 Search Engine

#### Meilisearch -- RECOMMENDED

**URL:** https://www.meilisearch.com/
**License:** MIT
**Origin:** France

- **Performance:** Results in under 50 milliseconds
- **Features:**
  - Typo tolerance
  - Search-as-you-type
  - Hybrid search (semantic + full-text) -- AI-powered (beta)
  - Multi-language support (Latin alphabet optimized)
  - RESTful API
  - Multi-tenancy support
  - Security management
  - AI-ready (langchain, MCP protocol)
- **French Connection:** Made in France, excellent French language support
- **Deployment:** Self-hosted (free) or Meilisearch Cloud
- **For LIBERAL:** Perfect for searching through spending data, parliamentary records, and reports. French language optimization is critical. The "Made in France" angle aligns with the project's identity.

#### Typesense -- Alternative

- Fast, typo-tolerant search
- Good alternative if Meilisearch doesn't meet needs
- Less French language-specific optimization

#### Elasticsearch -- At Scale

- Full-text search at enterprise scale
- More complex to operate
- Heavier resource requirements
- **For LIBERAL:** Overkill for initial launch

Sources:
- [Meilisearch GitHub](https://github.com/meilisearch/meilisearch)
- [Meilisearch Features](https://www.meilisearch.com/)
- [Typesense vs Meilisearch](https://www.meilisearch.com/blog/typesense-review)

---

## 4. Hosting and Infrastructure

### 4.1 Free and Low-Cost Hosting Options

#### Frontend Hosting

| Provider | Free Tier | Best For | Limitations |
|----------|-----------|----------|-------------|
| **Vercel** | 1M requests/mo, 100GB bandwidth | Next.js (native) | Limited serverless |
| **Cloudflare Pages** | 100K daily requests, unlimited static bandwidth | Static + SSR via Workers | 500 builds/month |
| **Netlify** | 100GB bandwidth, 300 build min | Static/SSG | Lower limits than CF |
| **GitHub Pages** | Unlimited for public repos | Pure static sites | No SSR, no dynamic |

**Recommendation:** Cloudflare Pages for static content delivery (unlimited bandwidth) + Vercel for Next.js application features. Use both strategically.

#### Backend/Database Hosting

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| **Supabase** | 500MB DB, 50K MAUs | Pauses after 1 week inactivity |
| **Neon** | 512MB PostgreSQL | Serverless Postgres, scales to zero |
| **Railway** | $5/month credit | Good for Python backends |
| **Render** | Free static, $7/mo for services | Good DX |
| **Fly.io** | 3 shared VMs, 1GB persistent | Good for global distribution |

Sources:
- [Vercel vs Cloudflare Pages 2025](https://www.ai-infra-link.com/vercel-vs-netlify-vs-cloudflare-pages-2025-comparison-for-developers/)
- [Free Next.js Hosting 2025](https://dev.to/joodi/free-nextjs-hosting-providers-in-2025-pros-and-cons-2a0e)

---

### 4.2 French Cloud Providers

#### Scaleway

**URL:** https://www.scaleway.com/
- French cloud (Iliad group, Xavier Niel)
- 10 data centers in Europe (4 in France)
- 20-40% cost savings vs AWS/Azure
- Per-second billing, no hidden data transfer fees within Europe
- GDPR compliant by design
- **For LIBERAL:** Good for self-hosted backend components. Data sovereignty in France.

#### OVHcloud

**URL:** https://www.ovhcloud.com/
- Major French cloud provider
- Competitive pricing for dedicated servers and VPS
- Strong Kubernetes (Managed Kubernetes) offering
- Data centers in France
- **For LIBERAL:** Cost-effective dedicated hosting if needed. Good for database hosting.

#### Clever Cloud

**URL:** https://www.clever-cloud.com/
- French PaaS provider
- Auto-scaling, zero-config deployments
- Supports Node.js, Python, Go, Rust, PostgreSQL, Redis
- European data sovereignty focus
- **For LIBERAL:** Simplified deployment with French data residency.

**Strategic Consideration:** Using French cloud providers (Scaleway or OVHcloud) ensures data sovereignty and aligns with the project's French identity. It also avoids potential criticism about using US cloud providers for French civic data.

Sources:
- [Scaleway Pricing](https://www.scaleway.com/en/pricing/)
- [European Cloud Providers Comparison](https://www.clever.cloud/blog/company/2025/10/03/best-european-cloud-providers/)
- [Scaleway Review](https://www.bestvpsproviders.com/providers/scaleway)

---

### 4.3 CDN Strategy

- **Cloudflare** (free tier): Global CDN, DDoS protection, SSL
- Use Cloudflare in front of any backend/hosting provider
- Cache static data files (JSON, CSV) at the edge
- Purge cache on data updates
- **Priority:** Performance for French users (Paris PoP is essential)

---

## 5. Open Source Strategy

### 5.1 Repository Structure

#### Monorepo -- RECOMMENDED

Using **Turborepo** (by Vercel) for monorepo management:

```
liberal/
+-- apps/
|   +-- web/          # Next.js frontend application
|   +-- api/          # Python FastAPI backend
|   +-- docs/         # VitePress documentation site
+-- packages/
|   +-- data-pipeline/ # Python ETL scripts
|   +-- ui/           # Shared React components
|   +-- config/       # Shared configurations
|   +-- types/        # Shared TypeScript types
|   +-- db/           # Database schemas and migrations
+-- data/
|   +-- raw/          # Raw data files (git-lfs or DVC)
|   +-- processed/    # Processed data
|   +-- snapshots/    # Data version snapshots
+-- .github/
|   +-- workflows/    # GitHub Actions CI/CD
|   +-- ISSUE_TEMPLATE/
|   +-- PULL_REQUEST_TEMPLATE/
+-- turbo.json
+-- package.json
+-- LICENSE
```

**Turborepo advantages:**
- Incremental builds (only rebuild what changed)
- `--filter` flag for affected package detection
- Rust-based core for maximum performance
- Native GitHub Actions integration
- Simpler than Nx for this project's scale

Sources:
- [Turborepo vs Nx Comparison](https://www.wisp.blog/blog/nx-vs-turborepo-a-comprehensive-guide-to-monorepo-tools)
- [GitHub Actions Monorepo Guide](https://www.warpbuild.com/blog/github-actions-monorepo-guide)

---

### 5.2 License Choice

#### AGPL-3.0 -- RECOMMENDED

**Rationale:**
- **Copyleft protection:** If anyone deploys a modified version as a web service, they must share their source code. This prevents entities from taking the project, modifying it to hide data, and deploying it as their own.
- **Civic tech alignment:** Ensures all improvements benefit the community
- **Network protection:** Unlike GPL, AGPL covers web services (not just distributed software)
- **Precedent:** Used by many civic tech projects (Decidim, CKAN data portal)
- **Contributor assurance:** Contributors know their work will always remain open

**Alternative: MIT**
- More permissive, easier for adoption
- No protection against proprietary forks
- OpenAnafi uses MIT -- could be considered for consistency with French government open source

**Recommendation:** AGPL-3.0 for the application code, with data released under ODbL (Open Database License) -- consistent with how Regards Citoyens releases their data.

Sources:
- [AGPL License Overview](https://opensource.org/license/agpl-v3)
- [Open Source Licenses Comparison](https://merginit.com/blog/01082025-47-open-source-licenses-2025)

---

### 5.3 CI/CD with GitHub Actions

```yaml
# Example: Data update workflow
name: Update Spending Data
on:
  schedule:
    - cron: '0 6 * * 1' # Weekly Monday 6 AM UTC
  workflow_dispatch:      # Manual trigger

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
      - run: pip install -r packages/data-pipeline/requirements.txt
      - run: python packages/data-pipeline/collect.py
      - run: python packages/data-pipeline/transform.py
      - run: python packages/data-pipeline/validate.py

  build:
    needs: collect
    runs-on: ubuntu-latest
    steps:
      - run: npx turbo build --filter=web

  deploy:
    needs: build
    # Deploy to Cloudflare Pages / Vercel
```

**GitHub Actions for open source:**
- Free for public repositories (unlimited minutes)
- Scheduled workflows for data collection
- PR checks for code quality
- Automated deployments

---

### 5.4 Community Building

#### Communication Channels
- **GitHub Discussions:** Primary forum (integrated with repo)
- **Discord:** Real-time community chat
- **Twitter/X:** Outreach and data highlights

#### Documentation
- **VitePress** -- RECOMMENDED
  - Vue-powered (good if using any Vue components)
  - Lightning-fast development server
  - Dark mode, search built-in
  - Simpler than Docusaurus
  - Good for a smaller, focused project

- **Docusaurus** -- Alternative
  - React-powered (consistent with Next.js frontend)
  - Built-in versioning and localization
  - Larger community (4x more popular)
  - Better for extensive documentation needs

**Recommendation:** VitePress for its speed and simplicity, unless the documentation needs grow significantly.

#### Contribution Infrastructure
- Issue templates (bug reports, feature requests, data corrections)
- PR template with checklist
- CONTRIBUTING.md with development setup guide
- Code of conduct
- Good first issues labeled for newcomers
- Data contribution guide (how to report data quality issues)

Sources:
- [VitePress vs Docusaurus](https://okidoki.dev/documentation-generator-comparison)
- [Documentation Generators Comparison 2025](https://dev.to/therealmrmumba/i-tried-15-of-the-best-documentation-tools-heres-what-actually-works-in-2025-dam)

---

## 6. Architecture Patterns

### 6.1 Recommended Architecture: Hybrid SSG + ISR with Data Pipeline

```
                     ARCHITECTURE OVERVIEW

[Data Sources]                              [Users]
     |                                          ^
     v                                          |
+------------------+                    +------------------+
| DATA PIPELINE    |                    | FRONTEND (Next.js)|
| (Python/FastAPI) |                    | SSG + ISR         |
|                  |                    |                   |
| Collect -------->|                    | Static pages      |
| Clean           |                    | Data dashboards   |
| Validate        |                    | Interactive viz   |
| Aggregate       |                    | Search UI         |
|                  |                    |                   |
| Schedule:       |                    | Builds on:        |
| - GitHub Actions |                   | - Data update     |
| - Weekly/Daily   |                   | - Code change     |
+--------+---------+                    +--------+----------+
         |                                       |
         v                                       v
+------------------+                    +------------------+
| DATA STORE       |                    | CDN (Cloudflare)  |
|                  |                    |                   |
| PostgreSQL       |<------------------>| Edge Cache        |
| (structured)     |   API calls       | DDoS Protection   |
|                  |                    | SSL               |
| DuckDB           |                    +------------------+
| (analytics)      |
|                  |
| Static JSON      |
| (pre-computed)   |
|                  |
| Meilisearch      |
| (search index)   |
+------------------+
```

### 6.2 Pattern Details

#### Static Site Generation with Scheduled Data Updates (PRIMARY)

**How it works:**
1. GitHub Actions runs data pipeline on schedule (weekly/daily)
2. Pipeline collects fresh data from APIs, processes it, stores in PostgreSQL
3. Pre-compute aggregations and store as static JSON files
4. Trigger Next.js rebuild with ISR (Incremental Static Regeneration)
5. New static pages deployed to CDN

**Advantages:**
- Near-zero hosting costs (static files on Cloudflare Pages)
- Excellent SEO (pre-rendered HTML)
- Maximum performance (no server-side computation on page load)
- Resilient (static files don't go down)
- CDN-cacheable globally

**Trade-offs:**
- Data freshness limited by update schedule
- Build times increase with page count
- Complex interactive features require client-side JavaScript

#### JAMstack with API Calls (SECONDARY)

For interactive features (search, filtering, custom date ranges):
- Static frontend pages load instantly
- Client-side JavaScript calls API endpoints for dynamic data
- API backed by PostgreSQL/DuckDB
- Meilisearch for instant search

#### Client-Side Analytics with DuckDB-WASM (INNOVATIVE)

- Ship pre-computed Parquet data files
- Load DuckDB-WASM in the browser
- Users can run custom queries on budget data client-side
- Zero server cost for interactive data exploration
- Example: "Show me defense spending growth from 2015-2025"

Sources:
- [JAMstack Architecture 2025](https://www.avidclan.com/blog/what-is-jamstack-architecture-a-complete-guide-for-2025-and-why-it-is-the-future-of-web-development/)
- [ISR in Next.js](https://nextjs.org/docs/app/guides/progressive-web-apps)

---

### 6.3 Data Pipeline Architecture

```
Stage 1: EXTRACTION
+---> API Clients (data.gouv.fr, INSEE, BdF, Eurostat)
+---> PDF Extractors (Cour des Comptes reports)
+---> File Downloaders (CSV, XML datasets)
      |
      v
Stage 2: RAW STORAGE
+---> Raw JSON/CSV/XML files (versioned with DVC or Git LFS)
+---> Timestamp and source metadata
      |
      v
Stage 3: TRANSFORMATION
+---> Data cleaning (handle missing values, encoding issues)
+---> Schema validation (Pydantic models)
+---> Normalization (consistent units: euros, percentages, per capita)
+---> Cross-referencing (link budget lines to ministries, programs)
+---> Inflation adjustment (real vs nominal values)
      |
      v
Stage 4: AGGREGATION
+---> Time series computation (YoY growth, trends)
+---> Geographic aggregation (national, regional, departmental, communal)
+---> Categorical aggregation (by ministry, program, function)
+---> Per capita calculations (using INSEE population data)
+---> International comparisons (Eurostat/OECD normalization)
      |
      v
Stage 5: LOADING
+---> PostgreSQL (structured, queryable data)
+---> DuckDB (analytical views)
+---> Static JSON (pre-computed for frontend)
+---> Parquet files (for DuckDB-WASM client-side)
+---> Meilisearch (search index)
```

**Data Version Control:**
- Use DVC (Data Version Control) or Git LFS for raw data files
- Every pipeline run produces a versioned snapshot
- Enables reproducibility and auditing
- Citizens can verify that data hasn't been manipulated

---

## 7. Performance and Accessibility

### 7.1 RGAA Compliance (French Accessibility Standard)

**Reference:** https://accessibilite.numerique.gouv.fr/

The RGAA (Referentiel General d'Amelioration de l'Accessibilite) is a legally binding document with **106 criteria** for web accessibility in France.

**Key Obligations (since June 28, 2025):**
- Applies to all organizations with 10+ employees and EUR 2M+ revenue
- Publication of accessibility declaration (mandatory)
- Dedicated contact mechanism for users
- Homepage must display RGAA conformance status
- Multi-year accessibility improvement plan (3-year max)
- **Penalties:** EUR 50,000 fine for non-compliance (renewable every 6 months) + EUR 25,000 for missing declaration

**For LIBERAL:**
- Even though an open-source project may not be legally required to comply, RGAA compliance is:
  1. Ethically important (a transparency project must be accessible to all citizens)
  2. Strategically smart (demonstrates higher standards than government sites that often fail RGAA audits)
  3. A talking point ("We make government spending accessible to ALL citizens, including those with disabilities")

**Implementation:**
- Use DSFR components (pre-validated for RGAA)
- Use shadcn/ui with Radix primitives (accessible by default)
- Follow WCAG 2.1 AA guidelines
- Test with axe-core, Lighthouse accessibility audit
- Screen reader testing (NVDA, VoiceOver)
- Keyboard navigation for all interactive elements
- Color contrast ratios (4.5:1 for text, 3:1 for large text)
- Alt text for all images and chart descriptions
- Data tables with proper headers and scope attributes

Sources:
- [RGAA Official Reference](https://accessibilite.numerique.gouv.fr/)
- [RGAA Legal Obligations](https://accessibilite.numerique.gouv.fr/obligations/)
- [Accessibility Law June 2025](https://pic.digital/accessibilite-web-loi-juin-2025/)

---

### 7.2 Performance Budget

| Metric | Target | Tool |
|--------|--------|------|
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| First Input Delay (FID) | < 100ms | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| Total JS Bundle | < 200KB gzipped | webpack-bundle-analyzer |
| Lighthouse Performance | > 90/100 | Lighthouse |
| Lighthouse Accessibility | > 95/100 | Lighthouse |

**Strategies:**
- SSG/ISR for data pages (zero client-side data fetching for initial load)
- Lazy-load visualization libraries (D3, ECharts) only when charts are in viewport
- Use Next.js Image component for optimized images
- Precompute static JSON data files (no API latency on page load)
- Code splitting per route
- Service Worker for caching (PWA)

---

### 7.3 Progressive Web App (PWA)

**Implementation with Next.js:**
- Service Worker for offline caching of static pages and data
- Cache-first strategy for static assets (CSS, JS, images)
- Stale-while-revalidate for data pages
- Custom offline page with "You're offline" message
- App manifest for installability
- Push notifications for major data updates (optional)

**Caching Strategy:**
```
Static assets (CSS, JS, images) --> Cache First
Data pages (budgets, charts)    --> Stale While Revalidate
API responses                   --> Network First (with cache fallback)
Search                          --> Network Only
```

**Offline Features:**
- Previously viewed budget data available offline
- Skeleton UI during loading
- Clear offline indicators
- Pre-cache most recent year's data for offline exploration

Sources:
- [PWA Best Practices MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Best_practices)
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [PWA Guide 2025](https://isitdev.com/progressive-web-apps-pwa-guide-2025/)

---

### 7.4 Mobile-First Design

- Responsive visualization components (ECharts is responsive by default)
- Touch-friendly chart interactions
- Simplified navigation for mobile
- Reduced data density on small screens
- Performance budget is especially critical on mobile (3G target)
- Test on low-end Android devices (common in France)

---

## 8. Security Considerations

### 8.1 GDPR Compliance

**France-specific considerations:**
- CNIL (Commission Nationale de l'Informatique et des Libertes) oversight
- No personal data collection required for budget visualization
- If analytics are used: cookie consent required
- Prefer privacy-respecting analytics (Plausible, Umami -- both open source)
- No tracking pixels, no third-party cookies
- Privacy policy in French

**Data handling:**
- All data is already public government data
- No PII (Personally Identifiable Information) processing
- Named politicians are public figures (no GDPR issue for public role data)
- User accounts (if any) require standard GDPR protections

---

### 8.2 DDoS Protection

**Threat Assessment:** A political transparency project **will likely face attacks**, especially when publishing embarrassing data. Historical precedent: French civic/political sites have been targets of DDoS attacks (France was the 18th most attacked country in Q3 2025).

**Mitigation Strategy:**

#### Cloudflare (Free Tier) -- ESSENTIAL
- **Always-on DDoS protection** (unmetered, even on free tier)
- Mitigates most attacks automatically in under 3 seconds
- Athenian Project: Free enhanced protection for election/civic infrastructure
- GDPR compliant with Data Localization Suite
- First provider meeting all 37 EU Cloud Code of Conduct criteria
- **Action:** Apply for Cloudflare's Athenian Project or Project Galileo (free enhanced protection for vulnerable civic sites)

#### Additional Measures
- Rate limiting on API endpoints
- CAPTCHA for high-frequency requests (if needed)
- Geographic restrictions (optional -- focus on French users)
- Cache everything possible at the edge (reduces origin load)
- Static site architecture inherently DDoS-resistant (no database to overwhelm)

Sources:
- [Cloudflare DDoS Protection](https://developers.cloudflare.com/ddos-protection/)
- [Cloudflare GDPR Compliance](https://www.cloudflare.com/trust-hub/gdpr/)
- [DDoS Q3 2025 Report](https://radar.cloudflare.com/reports/ddos-2025-q3)

---

### 8.3 Content Integrity and Data Provenance

**Challenge:** As a political transparency project, LIBERAL must prove its data is authentic and unmanipulated.

**Solutions:**

1. **Git-based Data Versioning:**
   - All raw data committed to repository (Git LFS or DVC)
   - Every transformation step is code (auditable)
   - Full audit trail of data changes

2. **Reproducible Pipeline:**
   - Anyone can clone the repo and re-run the pipeline
   - Same inputs always produce same outputs
   - Docker containers for reproducible environments

3. **Source Attribution:**
   - Every data point links back to its source URL/API
   - Timestamps for when data was collected
   - Checksums for downloaded files

4. **Transparency Reports:**
   - Publish methodology documentation
   - List all data sources with access dates
   - Document any data cleaning decisions
   - Explain calculations and aggregations

5. **Community Verification:**
   - Open source code means anyone can audit
   - Encourage data journalists and researchers to verify
   - Public issue tracker for data quality concerns

---

### 8.4 Infrastructure Security

- HTTPS everywhere (Cloudflare provides free SSL)
- API keys stored in GitHub Secrets (never in code)
- Dependency scanning (Dependabot, Snyk)
- Content Security Policy headers
- Subresource Integrity for external scripts
- Regular security audits of dependencies
- No admin interfaces exposed publicly
- If self-hosting: SSH keys only, no password auth, firewall rules

---

## 9. Recommendations and Synthesis

### 9.1 Recommended Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend Framework** | Next.js 15 (React) | Best ecosystem, ISR, react-dsfr support |
| **UI Components** | shadcn/ui + Tremor + DSFR elements | Accessible, beautiful, credible |
| **Charts/Viz** | ECharts (dashboards) + Observable Plot (exploration) + D3 (custom) | Best coverage of all visualization needs |
| **Maps** | MapLibre GL JS | Open source, free, performant |
| **CSS** | Tailwind CSS v4 | Utility-first, integrates with shadcn/ui |
| **Backend/API** | Python FastAPI | Data processing strength, OpenAnafi compatibility |
| **Data Pipeline** | Python (pandas, Scrapy, pdfplumber) | Best tools for ETL |
| **Primary Database** | PostgreSQL | Structured budget data, PostGIS |
| **Analytics Engine** | DuckDB | OLAP queries, WASM for client-side |
| **Search** | Meilisearch | French-made, French language optimized |
| **Frontend Hosting** | Cloudflare Pages + Vercel | Free, global CDN, DDoS protection |
| **Backend Hosting** | Scaleway (Paris) | French data sovereignty, cost-effective |
| **CI/CD** | GitHub Actions | Free for open source, powerful |
| **Monorepo** | Turborepo | Fast, simple, Vercel integration |
| **Documentation** | VitePress | Fast, elegant, search built-in |
| **License** | AGPL-3.0 (code) + ODbL (data) | Copyleft protection for civic tech |
| **Security** | Cloudflare (DDoS) + CSP headers | Essential for political project |
| **Analytics** | Plausible or Umami | Privacy-respecting, GDPR compliant |

---

### 9.2 Phased Implementation Plan

#### Phase 1: Foundation (Months 1-2)
- Set up monorepo with Turborepo
- Next.js frontend with shadcn/ui
- Python data pipeline (data.gouv.fr + INSEE APIs)
- PostgreSQL database on Supabase (MVP) or Scaleway
- Basic budget visualization with ECharts
- Deploy to Cloudflare Pages + Vercel
- GitHub Actions for CI/CD

#### Phase 2: Data Depth (Months 3-4)
- Integrate all major French data sources
- PDF extraction pipeline for Cour des Comptes reports
- Meilisearch integration for full-text search
- Geographic visualizations with MapLibre
- Parliamentary voting data integration
- DuckDB analytics layer

#### Phase 3: Interactive Features (Months 5-6)
- DuckDB-WASM for client-side data exploration
- Observable Plot for interactive data exploration pages
- Custom D3 visualizations (budget Sankey flows, spending treemaps)
- PWA with offline support
- European comparison data (Eurostat, OECD)
- DSFR component integration for credibility

#### Phase 4: Community and Scale (Months 7+)
- VitePress documentation site
- Contribution guides and issue templates
- Discord community
- Data API for third-party developers
- Embed widgets for journalists and bloggers
- Mobile app consideration (React Native or PWA)
- Migrate to Scaleway if Supabase limits are reached

---

### 9.3 Cost Estimate (Monthly)

| Component | Cost | Notes |
|-----------|------|-------|
| Cloudflare Pages | $0 | Free tier, unlimited static bandwidth |
| Vercel | $0 | Hobby plan, 1M requests/month |
| GitHub Actions | $0 | Free for public repos |
| PostgreSQL (Supabase) | $0 - $25 | Free for MVP; Pro plan for production |
| Meilisearch (self-hosted) | $0 - $7 | Free if self-hosted on Scaleway Stardust |
| Scaleway Stardust (backend) | ~$3.50/mo | Smallest instance for API + Meilisearch |
| Domain name | ~$10/year | .fr domain |
| **Total (MVP)** | **~$0/month** | Using free tiers only |
| **Total (Production)** | **~$30-50/month** | With Scaleway backend |

---

### 9.4 Key Existing Open Source Projects to Study/Fork/Integrate

1. **OpenAnafi** (Cour des Comptes) -- Financial analysis methodology, MIT license
2. **NosDeputes.fr** (Regards Citoyens) -- Parliamentary data processing, ODbL
3. **NosFinancesLocales** (Regards Citoyens) -- Local finance visualization
4. **La Fabrique de la Loi** -- Legislative process tracking API
5. **OpenBudget.fr** -- Budget visualization tool (referenced on data.gouv.fr)
6. **DSFR** (GouvernementFR) -- Government design system components

---

### 9.5 Data Source Priority Matrix

| Source | Priority | Value for Project | Ease of Integration |
|--------|----------|-------------------|-------------------|
| data.gouv.fr (budget datasets) | Critical | Very High | Easy (REST API) |
| budget.gouv.fr (PLF data) | Critical | Very High | Medium (file downloads) |
| INSEE API | Critical | High | Easy (REST API) |
| Assemblee Nationale | High | High | Easy (XML/JSON) |
| Eurostat/OECD | High | High (comparisons) | Easy (REST API) |
| Banque de France Webstat | High | High (context) | Easy (REST API) |
| DGFIP open datasets | High | Very High | Medium (various formats) |
| Senat | Medium | Medium | Easy (XML/JSON) |
| Regards Citoyens APIs | Medium | High (pre-processed) | Easy (REST API) |
| Cour des Comptes | Medium | Very High | Hard (PDF extraction) |
| Local government data | Medium | High | Hard (fragmented) |
| data.economie.gouv.fr | Medium | High | Easy (REST API) |

---

### 9.6 Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| DDoS attacks | High | High | Cloudflare (Athenian Project) |
| Data source API changes | Medium | High | Version raw data, multiple sources |
| Legal challenges | Low-Medium | High | Only use public data, cite sources |
| Contributor burnout | Medium | Medium | Clear governance, manageable scope |
| Data quality issues | Medium | High | Validation pipeline, community review |
| API rate limiting | Low | Medium | Caching, scheduled collection |
| Hosting cost growth | Low | Medium | Static-first architecture |
| Political pressure | Low | Medium | Decentralized infrastructure, AGPL |

---

## Appendix A: Key URLs and API Endpoints

| Resource | URL |
|----------|-----|
| data.gouv.fr API | `https://www.data.gouv.fr/api/1/` |
| INSEE API Portal | `https://portail-api.insee.fr/` |
| Banque de France Webstat | `https://webstat.banque-france.fr/` |
| Assemblee Nationale Data | `https://data.assemblee-nationale.fr/` |
| Senat Data | `https://data.senat.fr/` |
| data.economie.gouv.fr | `https://data.economie.gouv.fr/` |
| DGFIP Open Data | `https://www.impots.gouv.fr/ouverture-des-donnees-publiques-de-la-dgfip` |
| Eurostat API | `https://ec.europa.eu/eurostat/api/` |
| OECD Data | `https://data.oecd.org/` |
| ECB Data | `https://data.ecb.europa.eu/` |
| API Entreprise | `https://entreprise.api.gouv.fr/` |
| Catalogue API publiques | `https://api.gouv.fr/` |
| OpenAnafi Backend | `https://github.com/Cour-des-comptes/open-anafi-backend` |
| Regards Citoyens | `https://github.com/regardscitoyens` |
| DSFR React | `https://github.com/codegouvfr/react-dsfr` |

---

## Appendix B: Relevant French Legislation

| Law/Regulation | Relevance |
|----------------|-----------|
| **Loi pour une Republique numerique (2016)** | Mandates open data for public administrations |
| **RGAA** | Web accessibility requirements (106 criteria) |
| **RGPD/GDPR** | Data protection (minimal impact -- using public data) |
| **Loi Lemaire** | Right to open data, source code opening |
| **Directive EU 2019/1024** | Open data and re-use of public sector information |
| **Article L312-1-1 Code CRPA** | Administration obligation to publish data |

---

## Appendix C: Comparable International Projects

| Project | Country | Technology | URL |
|---------|---------|-----------|-----|
| USAspending.gov | USA | React, PostgreSQL | https://usaspending.gov |
| Where Does My Money Go? | UK | D3.js, OpenSpending | https://app.wheredoesmymoneygo.org |
| OffenesParlament.de | Germany | Django, PostgreSQL | https://offenesparlament.de |
| OpenSpending | International | Python, PostgreSQL | https://openspending.org |
| OpenBudgets.eu | EU | Multiple | https://openbudgets.eu |

---

*Research compiled on 2026-02-27 for the LIBERAL project.*
*All sources verified and cited inline.*
*This document should be updated as APIs and technologies evolve.*
