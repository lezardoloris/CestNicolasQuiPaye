---
stepsCompleted: [init, customer-behavior, customer-pain-points, customer-decisions, competitive-analysis, research-completion]
research_type: market
research_topic: Fiscal Transparency and Government Accountability
date: 2026-02-27
---

# Market Research Report: Fiscal Transparency and Government Spending Accountability

**Project:** LIBERAL -- Libertarian Open-Source Platform to Expose France's Government Spending and Political Irresponsibilities

**Date:** 2026-02-27

**Research Scope:** Competitive landscape, target audience analysis, customer pain points, market gaps, distribution channels, and sustainability models for a fiscal transparency project focused on France.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Existing Players and Competition](#2-existing-players-and-competition)
   - 2.1 French Organizations
   - 2.2 International Examples
   - 2.3 Tech/Data Projects
3. [Target Audience Analysis](#3-target-audience-analysis)
4. [Customer Pain Points](#4-customer-pain-points)
5. [Market Gaps and Opportunities](#5-market-gaps-and-opportunities)
6. [Distribution and Growth Channels](#6-distribution-and-growth-channels)
7. [Monetization and Sustainability](#7-monetization-and-sustainability)
8. [Strategic Recommendations](#8-strategic-recommendations)
9. [Sources](#9-sources)

---

## 1. Executive Summary

France finds itself in a unique and volatile fiscal moment. With public debt reaching EUR 3.35 trillion (116.2% of GDP) in early 2025, a budget deficit of 5.8% of GDP in 2024, and the second-highest tax-to-GDP ratio in the OECD at 43.5%, French citizens are bearing an unprecedented fiscal burden. Yet trust in the national government has plummeted to just 29% in 2025 (down 13 points), and 68% of French adults perceive widespread government corruption.

Despite this context, there is no single, compelling, citizen-facing digital platform in France that makes government spending truly transparent, accessible, and actionable -- particularly from a libertarian/classical-liberal perspective that challenges the size and scope of government spending.

The LIBERAL project occupies a unique strategic position: combining open-source technology, libertarian fiscal analysis, and modern digital communication to fill a critical gap between institutional reports (Cour des Comptes), think-tank analyses (IFRAP, Institut Montaigne), and citizen activism (Contribuables Associes). The market is ripe for disruption, with an audience of 50.4 million social media users in France and overwhelming public dissatisfaction with fiscal management.

---

## 2. Existing Players and Competition

### 2.1 French Organizations

#### Fondation IFRAP (Institut Francais pour la Recherche sur les Administrations et les Politiques Publiques)

- **Website:** [ifrap.org](https://www.ifrap.org/)
- **Founded:** Over 30 years ago; recognized as being in the public interest by decree of the Council of State (November 19, 2009)
- **Mission:** Conducting studies and scientific research on the effectiveness of public policies, particularly those aimed at achieving full employment and economic development
- **Team:** Approximately 15 permanent researchers (half are volunteers), supported by a network of nearly 150 researchers, contributors, and experts
- **Funding:** Entirely privately funded through tax-deductible donations -- no public subsidies
- **Key Activities:**
  - Publishes detailed reports on public spending, taxation, and civil service reform
  - Produces reform proposals for government and Parliament
  - Covers budget analysis, civil service efficiency, health system costs, education spending
  - Compares political candidates' programs (e.g., ahead of 2026 municipal elections)
- **Reach:** Significant media presence in France; regularly cited in fiscal policy debates
- **Strengths:** Deep expertise, long track record, establishment credibility, tax-deductible donations
- **Weaknesses:** Academic and think-tank tone; not designed for mass citizen engagement; limited data visualization or interactive tools; website is informational rather than interactive
- **Relevance to LIBERAL:** IFRAP is the closest ideological ally but operates as a traditional think tank. LIBERAL can differentiate through technology, interactivity, and populist communication style.

#### Contribuables Associes (Associated Taxpayers)

- **Website:** [contribuablesassocies.org](https://contribuablesassocies.org/) / [touscontribuables.org](https://www.touscontribuables.org)
- **Founded:** Association under the Law of 1901
- **Membership:** Over 350,000 claimed members (as of 2019)
- **Mission:** Defending taxpayers before public authorities; advocating for reduced public spending and against waste of taxpayer money
- **Funding:** Non-subsidized; funded entirely by private member contributions
- **Key Activities:**
  - **Argus des Communes:** A rating tool evaluating the management performance of 35,000 French municipalities -- a standout digital product
  - Proposes bills to Parliament and submits written questions through deputies
  - Organizes "Parliamentary Taxpayer Meetings" at the National Assembly with deputies, experts, and civil society
  - Regular publications denouncing government waste ("gaspillage")
  - Member of the European Taxpayers' federation
- **Strengths:** Large membership base, direct political lobbying, the Argus des Communes tool, grassroots activist approach
- **Weaknesses:** Perceived as politically aligned (right-wing/conservative); aging membership demographics; limited modern digital engagement; website design is dated
- **Relevance to LIBERAL:** Strong potential synergy. The Argus des Communes concept could be expanded and modernized. Their membership base represents a natural early adopter audience, but LIBERAL needs to appeal to a broader, younger demographic.

#### OpenFisca

- **Website:** [openfisca.org](https://openfisca.org/en/)
- **GitHub:** [github.com/openfisca](https://github.com/openfisca/openfisca-france)
- **Founded:** Development began May 2011 at the French Centre d'analyse strategique (now France Strategie)
- **License:** Free software (AGPL)
- **What It Does:** A versatile microsimulation engine that encodes social and fiscal regulations as mathematical rules, enabling calculation of taxes, benefits, and the effect of legislation on individuals or entire populations
- **Key Applications:**
  - TaxIPP (tax simulator by Institut des politiques publiques)
  - LexImpact (legislative impact assessment tool)
  - MesAides (welfare benefit eligibility calculator)
  - Used by the city of Barcelona for welfare calculations
- **Technical Details:** Python-based; describes regulations as collections of mathematical rules; provides an API; can simulate single situations or whole populations
- **Strengths:** Truly open source; technically excellent; government-backed; international adoption (France, Barcelona, others)
- **Weaknesses:** Developer-focused, not citizen-facing; requires technical knowledge to use directly; no editorial or political angle; purely computational -- does not "expose" or "critique" anything
- **Relevance to LIBERAL:** OpenFisca is a potential technical building block. LIBERAL could use OpenFisca's calculation engine as a backend while building a citizen-facing interface that contextualizes and editorializes the data. An integration or fork strategy should be explored.

#### Cour des Comptes (Court of Auditors)

- **Website:** [ccomptes.fr](https://www.ccomptes.fr/fr)
- **Role:** France's supreme audit institution; constitutionally mandated to verify the proper use of public funds
- **Key Publications:**
  - Annual Public Report (2025 edition: 616 pages, 52 recommendations, examining public policies for youth)
  - Report on public finances (2025: deficit reached nearly EUR 175 billion, 6.0% of GDP)
  - Biennial reports on organizations receiving public donations (since 2022 ordinance)
- **Public Engagement Efforts:**
  - First public consultation in 2022: nearly 9,000 registrations, 333 online contributions, leading to 6 investigations in 2023
  - Citizen participation platform: [participationcitoyenne.ccomptes.fr](https://participationcitoyenne.ccomptes.fr/)
  - Reports published freely online
- **Strengths:** Constitutional authority; deep investigative capacity; massive data access; credibility
- **Weaknesses:** Government institution -- inherently constrained in its criticism; reports are lengthy and technical; no data visualization; no mobile app; bureaucratic communication style; findings are often ignored by government
- **Relevance to LIBERAL:** The Cour des Comptes is a goldmine of source material. Its reports can be "translated" by LIBERAL into accessible, shareable, and actionable content. The Court's own consultation platform validates public appetite for fiscal transparency tools.

#### France Strategie / Haut-commissariat a la Strategie et au Plan

- **Website:** [strategie-plan.gouv.fr](https://www.strategie-plan.gouv.fr/en/about-haut-commissariat-la-strategie-et-au-plan)
- **Status:** France Strategie (est. 2013) was succeeded in May 2025 by the Haut-commissariat a la Strategie et au Plan
- **Mission:** Contributing to public policy through analyses and proposals, informing collective decision-making on demographic, economic, social, environmental, health, technological, and cultural issues
- **Key Focus:** Long-term strategic planning (2035-2050 reports), fiscal policy assessment, labor market analysis
- **Strengths:** Government-backed; access to comprehensive data; interdisciplinary approach
- **Weaknesses:** Government think tank -- inherently pro-establishment; academic publications not accessible to general public; no citizen-facing tools
- **Relevance to LIBERAL:** Source of data and policy analysis. Their reports can be deconstructed and critiqued from a libertarian perspective.

#### Institut Montaigne

- **Website:** [institutmontaigne.org](https://www.institutmontaigne.org/en/about-us)
- **Founded:** 2000
- **Mission:** Nonpartisan, independent think tank; public policy proposals for France and Europe
- **Funding:** Exclusively private contributions from over 160 companies; each < 1.2% of total budget (EUR 6.6 million)
- **Fiscal Focus Areas:** Public finances, taxation, local finances, public spending, local authorities
- **Notable Work:**
  - 2024 European Production Tax Barometer (calculated French production taxes at 4.0% of GDP for 2022)
  - Regular analyses of budget proposals and fiscal reforms
  - Published on data.gouv.fr
- **Strengths:** Well-funded; credible; centrist positioning attracts broad attention; good media relationships
- **Weaknesses:** Centrist/pro-business rather than libertarian; traditional publication format; limited digital interactivity
- **Relevance to LIBERAL:** Competitor for media attention on fiscal topics. Institut Montaigne's work is rigorous but lacks the populist, citizen-empowering angle that LIBERAL can provide.

### 2.2 International Examples

#### USAspending.gov (United States)

- **Website:** [usaspending.gov](https://www.usaspending.gov/)
- **Operator:** U.S. Department of the Treasury
- **Legal Basis:** Digital Accountability and Transparency Act of 2014 (DATA Act)
- **Features:**
  - Award Search: prime and subaward data back to FY2008 with extensive filtering
  - Spending Explorer: interactive "big picture" browsing by budget function, agency, and object class
  - Data Lab: creative data visualizations and analyses ([datalab.usaspending.gov](https://datalab.usaspending.gov/))
  - Data Download: bulk export of large datasets
  - Training videos for public use
- **Data Scope:** Over 400 data points collected from 100+ federal agencies; data submitted at least twice monthly
- **Scale:** Comprehensive coverage of contracts, grants, loans, direct payments, and other federal awards
- **Strengths:** Government-backed; comprehensive; interactive; API access; free to use
- **Weaknesses:** Government-run (no critical perspective); US-specific; complex for casual users
- **Relevance to LIBERAL:** The gold standard for government spending transparency platforms. LIBERAL should aspire to this level of data comprehensiveness while adding editorial analysis and a critical libertarian lens that USAspending.gov cannot provide as a government tool.

#### OpenSpending (International, Open Knowledge Foundation)

- **Website:** [openspending.org](https://www.openspending.org/)
- **GitHub:** [github.com/openspending](https://github.com/openspending)
- **Operator:** Open Knowledge Foundation, in partnership with GIFT (Global Initiative for Fiscal Transparency)
- **Origins:** Evolved from "Where Does My Money Go?" (UK, 2007)
- **Features:**
  - Free, open global platform for searching, visualizing, and analyzing fiscal data
  - Over 5 million financial transactions in 627 datasets worldwide (2005-2035)
  - Open Fiscal Data Package (OFDP) standard for data publishers
  - Linked Open Data support
- **Strengths:** Global scope; open source; standardized data format; community-driven
- **Weaknesses:** Requires data to be uploaded in specific formats; less curated/editorial; limited user engagement features
- **Relevance to LIBERAL:** Technical inspiration and potential data source. The Open Fiscal Data Package could be adopted for interoperability. However, OpenSpending is a neutral platform -- LIBERAL adds the critical editorial layer.

#### Where Does My Money Go? (United Kingdom)

- **Website:** [wheredoesmymoneygo.org](https://app.wheredoesmymoneygo.org/about.html)
- **Founded:** First developed in 2007; winner of the UK Government's "Show Us a Better Way" competition (2008)
- **Concept:** Free, impartial, politically neutral tool showing UK citizens where their tax money is spent
- **Approach:** Citizen-driven, relying on users both as consumers and data gatherers/analysts
- **Key Feature:** Personal tax calculator showing individuals exactly where their specific tax contribution goes
- **Strengths:** Simple, intuitive concept; personal relevance; political neutrality broadens audience
- **Weaknesses:** UK-specific; evolved into OpenSpending; limited ongoing development
- **Relevance to LIBERAL:** The "where does my money go" personal calculator concept is brilliant and should be replicated for France. This is perhaps the single most powerful feature for citizen engagement -- showing each individual how their specific tax euros are allocated.

#### OpenBudgets.eu (European Union)

- **Website:** [openbudgets.eu](https://openbudgets.eu/)
- **Funding:** EU H2020 research and innovation programme (grant agreement No 645833)
- **Consortium:** 9 international partners coordinated by Fraunhofer IAIS
- **Features:**
  - 13 tools aimed at administrations, data managers, and investigative journalists
  - Budget visualizations for general public (implementations in Thessaloniki, Paris, and Bonn)
  - Participatory budgeting tools
  - SubsidyStories.eu: uncovering how nearly EUR 300 billion in EU subsidies is spent
  - Games and accessible explanations of public budgeting
- **Strengths:** Multi-stakeholder approach; EU-scale data; multiple specialized tools; academic rigor
- **Weaknesses:** EU-funded project with limited ongoing maintenance; complex tool ecosystem; not specifically citizen-focused
- **Relevance to LIBERAL:** Demonstrates demand for fiscal transparency tools across Europe. The SubsidyStories concept (making EU spending tangible) is worth adapting for French national spending.

#### Sunlight Foundation (United States)

- **Website:** [sunlightfoundation.com](https://sunlightfoundation.com/) (static archive since September 2020)
- **Status:** No longer active as of September 2020
- **Legacy:**
  - Served over 4.2 billion API calls
  - Helped ~60 cities develop open data policies
  - Pioneered the use of civic technologies, open data, policy analysis, and journalism for government transparency
  - Established foundational Open Data Principles: completeness, primacy, timeliness, ease of access, machine readability, non-discrimination, commonly owned standards, licensing, permanence, usage costs
- **Key Initiatives:** Open Cities program, Web Integrity Project, Conflicts-of-Interest project
- **Strengths:** Massive impact; established best practices; open data principles widely adopted
- **Weaknesses:** Ceased operations -- demonstrates sustainability challenges for civic tech nonprofits
- **Relevance to LIBERAL:** A cautionary tale about sustainability. The Sunlight Foundation's principles should guide LIBERAL's approach to data openness. Its closure underscores the need for a robust funding model.

#### mySociety (United Kingdom)

- **Website:** [mysociety.org](https://www.mysociety.org/)
- **Founded:** 2003
- **Structure:** Not-for-profit organization
- **Reach:** Technology, research, and data in 40+ countries
- **Key Products:**
  - **FixMyStreet:** Open-source framework for reporting local government problems
  - **WhatDoTheyKnow:** Freedom of Information request platform (UK)
  - **TheyWorkForYou:** Parliamentary monitoring
  - Local authority service suite (highways, waste management, FOI, licensing)
- **Research:** TICTeC (The Impacts of Civic Technology) conference and research program
- **Strengths:** Proven track record; open source; international; multi-product portfolio; direct citizen impact
- **Weaknesses:** UK-focused core products; generalist civic tech (not specifically fiscal)
- **Relevance to LIBERAL:** mySociety's approach -- building specific, useful tools that solve concrete citizen problems -- should inform LIBERAL's product strategy. Their open-source model and multi-product portfolio demonstrate how to build a sustainable civic tech organization.

#### TaxPayers' Alliance (United Kingdom)

- **Website:** [taxpayersalliance.com](https://taxpayersalliance.com/)
- **Description:** Britain's independent grassroots campaign for lower taxes
- **Key Activities (2025):**
  - National debt clock (UK debt increasing by GBP 4,959 per second; total GBP 2.71 trillion)
  - Campaign to replace GDP with GDP per capita as the primary economic metric
  - Declared a "personal recession" in February 2025 after two quarters of falling GDP per capita
  - Budget response: criticizing the chancellor's spending as being paid for by hard-working taxpayers
  - Commentary on party economic platforms
- **Communication Style:** Punchy, populist, media-friendly messaging; strong social media presence; debt clock as viral tool
- **Strengths:** Large grassroots base; effective media strategy; clear ideological positioning; actionable campaigns
- **Weaknesses:** Politically partisan perception; UK-specific; limited data/tech innovation
- **Relevance to LIBERAL:** The TPA is the closest international model for LIBERAL's communication strategy. The debt clock concept should be directly replicated for France. Their punchy, populist tone combined with data-driven arguments is exactly the right approach. The "personal recession" framing is a masterclass in making fiscal data personally relevant.

#### Follow The Money (Netherlands / International)

- **Website:** [ftm.eu](https://www.ftm.eu/)
- **Type:** Investigative journalism platform
- **Focus:** European financial investigations; tracking government spending and corruption
- **Methodology:** Following financial flows across jurisdictions; using open data and advanced investigative techniques
- **Key Tools and Resources:**
  - Global Investigative Journalism Network (GIJN) provides training and resources
  - Digital guides for tracking corruption (Exposing the Invisible)
  - Finance Uncovered provides financial journalism training
- **Strengths:** Deep investigative journalism; European scope; training resources for journalists
- **Weaknesses:** Subscription-based journalism model; not a citizen tool; requires journalistic expertise
- **Relevance to LIBERAL:** FTM demonstrates the power of financial investigation journalism. LIBERAL could partner with investigative journalists or provide data infrastructure that facilitates their work. The "follow the money" methodology should inform LIBERAL's approach to tracing government spending.

### 2.3 Tech/Data Projects and Civic Tech in France

#### data.gouv.fr (French Open Data Portal)

- **Website:** [data.gouv.fr](https://www.data.gouv.fr/)
- **Operator:** Etalab, under the authority of the Prime Minister
- **Launched:** December 5, 2011
- **Scale:** Over 47,613 datasets available
- **Budget/Fiscal Data Available:**
  - Evolution of public administration expenditures
  - State budget accounts (BUDGET - Comptes_publics)
  - Monthly budget situation datasets
  - Local budget data for every French municipality (from Direction Generale des Finances Publiques)
- **API Access:** Comprehensive API catalog ([data.gouv.fr/dataservices](https://www.data.gouv.fr/dataservices)) plus Ministry of Economy API ([data.economie.gouv.fr](https://data.economie.gouv.fr/))
- **Relevance:** This is the primary data source for LIBERAL. The availability of structured budget data with API access means LIBERAL can build automated data pipelines without manual data collection.

#### data.economie.gouv.fr (Ministry of Economy Data Portal)

- **Website:** [data.economie.gouv.fr](https://data.economie.gouv.fr/)
- **Features:** Explore API v2; datasets from the Ministry of Economy, Finance, and Industrial Sovereignty
- **Key Data:** Tax revenue data, budget execution, public procurement, economic indicators
- **Relevance:** Secondary official data source with more granular financial data.

#### budget.gouv.fr (State Budget Portal)

- **Website:** [budget.gouv.fr](https://www.budget.gouv.fr/budget-etat)
- **Features:** Official state budget presentation; expenditure breakdowns by mission and program
- **Relevance:** Official budget source; data can be scraped or accessed for LIBERAL's visualizations.

#### France's Open Government Partnership Commitments

- **Key Commitments:**
  - FR0019: Open Calculation Models and Simulators (OpenFisca)
  - FR0033: Expand Open Data
  - FR0035: Transparency of Public Algorithms
- **2024-2026 Action Plan:** Three priorities -- citizen participation, citizen engagement for public policy challenges, open government digital applications
- **Relevance:** France's OGP commitments create a legal and political framework that supports LIBERAL's mission. The project can position itself as helping fulfill France's open government obligations.

#### Civic Tech Ecosystem in France

- France is recognized as a leader in open data adoption among European nations
- Paris has implemented participatory budgeting using civic tech platforms
- The civic tech ecosystem is growing with EU support (Horizon Europe, Digital Europe Programme)
- However, most civic tech projects in France focus on participation (participatory budgeting, consultations) rather than accountability (spending transparency, waste exposure)
- There is a notable gap in projects that combine data visualization with editorial/critical analysis of government spending

---

## 3. Target Audience Analysis

### 3.1 French Taxpayer Demographics and Concerns

**Population Context:**
- France population (2025): approximately 66.5 million
- Taxpaying households: approximately 38.2 million fiscal households
- Public debt per citizen: over EUR 48,000 per French national (Q1 2025)
- Government spending: EUR 1,695 billion in 2025 (57.3% of GDP)
- Interest payments on debt: EUR 53 billion in 2025, projected EUR 66 billion in 2026

**Primary Concerns (2025 polling data):**
- 50% cite purchasing power as their top worry
- 44% focused on the future of the social system
- 88% express pessimism about France's economic outlook
- 67% are worried about their personal finances
- 78% expect declines in purchasing power
- 77% expect worsening public debt
- 70% expect increased taxation
- 27% of French adults say they would like to move abroad permanently (doubled from 11% the previous year)

### 3.2 Institutional Trust Crisis

- Trust in national government: 29% (down 13 points in 2025)
- Confidence in election honesty: 51% (down 13 points)
- Confidence in judicial system: 50% (down 9 points)
- Trust in financial institutions: 42% (down 8 points)
- Perception of widespread government corruption: 68% (up 13 points)
- No other EU country saw a bigger average drop in institutional confidence in 2025 than France
- France ranks 27th globally in the 2025 Corruption Perceptions Index (score: 66/100), behind UK and Germany

### 3.3 Digital Literacy and Platform Usage

**Social Media Landscape (January 2025):**
- Total social media user identities: 50.4 million (75.7% of population)
- Users aged 18+: 45.0 million (84.4% of adult population)
- Gender split: 51.1% female / 48.9% male

**Platform-Specific Data:**
| Platform | Users in France | % of Population | Key Demographics |
|----------|----------------|-----------------|------------------|
| Facebook | 46.6 million | 69.5% | Broad demographics, strong 25-54 |
| YouTube | ~36 million | ~55% of social users | All age groups |
| Instagram | 30.5 million | 45.5% | Skews younger, 18-34 |
| TikTok | ~21 million (est. 2025) | ~31% | Strong 16-34; 38+ hrs/month avg |
| X (Twitter) | ~12 million (est.) | ~18% | Political/media elite, 25-49 |
| LinkedIn | ~27 million | ~40% | Professionals, 25-49 |

**Key Insight:** TikTok dominates in engagement time (38+ hours/month average) despite having fewer users than Facebook. This is critical for LIBERAL's content strategy -- short-form video content about government waste could achieve viral reach on TikTok.

### 3.4 Age Group Analysis

**18-24 Year Olds (Gen Z):**
- 24% of social media users
- Highly anti-establishment: support for traditional parties drops to 27%
- Strongly attracted to populist/outsider movements (30%+ for Melenchon, ~25% for Le Pen in recent elections)
- Digital natives; TikTok and Instagram primary platforms
- Concerned about future (jobs, housing, climate, pensions)
- **LIBERAL opportunity:** This group is fiscally anxious but politically disengaged from traditional channels. Short-form, meme-friendly content exposing government waste could resonate strongly.

**25-34 Year Olds (Millennials):**
- 34% of social media users (largest segment)
- Beginning to feel tax burden directly (income tax, social charges)
- Active on Twitter/X for political discussion, Instagram, and increasingly TikTok
- Open to new digital tools and platforms
- Many are entrepreneurs or freelancers dealing with France's complex tax system
- **LIBERAL opportunity:** This is the primary target audience. They feel the tax burden, understand technology, and are willing to engage with new platforms. They need tools that make the abstract concrete.

**35-54 Year Olds:**
- Peak earning and tax-paying years
- Facebook and LinkedIn primary platforms
- Concerned about purchasing power, retirement, education quality
- More politically engaged but increasingly disillusioned
- **LIBERAL opportunity:** Secondary target. They have the most skin in the game financially. Traditional content (articles, reports) plus Facebook/LinkedIn distribution.

**55+ Year Olds:**
- Higher voter turnout and political engagement
- More likely to support traditional parties (57% among 70+)
- Facebook primary social platform; growing adoption of WhatsApp
- Core audience for Contribuables Associes (aging membership)
- **LIBERAL opportunity:** Not the primary digital audience but important for donations and political pressure. Content should be available in accessible formats.

### 3.5 Political Spectrum Analysis

**Left (La France Insoumise, PS, Greens):**
- Share concern about government waste but from an "inequality" frame
- Want to redirect spending, not reduce it
- Skeptical of "libertarian" framing
- **Strategy:** Frame LIBERAL as exposing inequality in how tax money benefits elites vs. citizens. Avoid pure "cut spending" messaging.

**Center (Ensemble/Renaissance):**
- Pro-European, economically liberal
- Support fiscal restraint and structural reform
- Declining trust in Macron's capacity to deliver
- **Strategy:** Appeal with data-driven efficiency arguments. Show waste that undermines France's competitiveness.

**Right (Les Republicains):**
- Traditional fiscal conservative base
- Concerned about government size, immigration costs, pension reform
- **Strategy:** Natural audience. Provide ammunition for fiscal conservative arguments with hard data.

**Far Right (Rassemblement National):**
- Strong anti-elite, anti-establishment sentiment
- Younger voter base (25% of under-35)
- Active on social media
- Fiscally populist rather than classically liberal
- **Strategy:** Shared audience on government waste; divergence on economic freedom. Focus on common ground: exposing elite privilege and taxpayer burden.

**Libertarian/Classical Liberal:**
- Small but vocal community in France
- Active online, particularly Twitter/X and certain blogs
- Historically marginalized in French political discourse
- Growing interest via international libertarian media
- **Strategy:** Core base. These are the evangelists and contributors. Build community features and developer engagement.

### 3.6 Lessons from the Gilets Jaunes Movement

The Gilets Jaunes (Yellow Vests) movement of 2018-2020 provides essential lessons for LIBERAL:

1. **Fiscal anger is real and explosive:** The movement was triggered by a fuel tax increase but rapidly broadened to encompass fiscal injustice, declining purchasing power, and elite disconnect. This demonstrates massive latent demand for fiscal accountability tools.

2. **Perceived inequality is the core issue:** Revelations that the wealthy benefited from tax abolitions (ISF) while ordinary taxpayers bore the burden created the "two systems" narrative -- one for elites, one for everyone else. LIBERAL must make this dual system visible.

3. **Social media is the organizing platform:** The movement was largely organized through Facebook groups, demonstrating the power of social media for fiscal activism in France.

4. **Revenue transparency matters:** The carbon tax failed partly because taxpayers could not see where the revenue went. Transparency about how specific taxes are spent could have prevented the crisis. This is exactly what LIBERAL should provide.

5. **Demand for direct democracy:** The movement expressed desire for citizen referendums and direct participation -- features LIBERAL could incorporate (e.g., citizen votes on spending priorities).

6. **Anti-elite framing resonates broadly:** The movement crossed traditional left-right boundaries by focusing on elite vs. citizen dynamics. LIBERAL should adopt similarly inclusive framing.

---

## 4. Customer Pain Points

### 4.1 Tax System Complexity

- France has one of the most complex tax systems in the OECD, with 465 tax expenditures (exemptions, credits, deductions) totaling an estimated EUR 91.8 billion in 2025
- The system changes far too often -- sometimes multiple times per year -- fostering uncertainty
- VAT C-efficiency ratio is only 53% (OECD average: 58%), revealing massive policy gaps
- France's VAT actionable policy gap is the largest in the EU at EUR 73 billion
- Citizens cannot understand what they pay, why they pay it, or where the money goes
- **Pain intensity: EXTREME** -- This is the foundational frustration. Every French taxpayer, regardless of political orientation, feels this.

### 4.2 Opacity of Government Spending

- Public spending of EUR 1,695 billion annually is a number too large to comprehend
- No citizen-facing tool exists to break this down into personal, understandable terms
- The Cour des Comptes publishes 600+ page reports that almost no one reads
- Budget data exists on data.gouv.fr but requires technical expertise to access and interpret
- Government budget presentations (budget.gouv.fr) are designed for officials, not citizens
- **Pain intensity: HIGH** -- Citizens know spending is enormous but cannot visualize or contextualize it.

### 4.3 Feeling of Powerlessness

- 88% pessimism about economic outlook suggests a deep sense that nothing can change
- Political instability (multiple prime ministers, budget crises) reinforces powerlessness
- The democratic process feels broken: budget decisions are made through Article 49.3 (forced passage without vote)
- Voter abstention is rising, particularly among youth
- 27% want to leave France entirely
- **Pain intensity: HIGH** -- This is the emotional driver. LIBERAL must not just inform but empower.

### 4.4 Trust Deficit

- 68% perceive widespread government corruption
- Trust in national government at historic lows (29%)
- Transparency International ranks France 27th globally -- behind UK and Germany
- Citizens doubt that government reports (even from the Cour des Comptes) lead to actual change
- Media coverage of fiscal issues is perceived as partisan
- **Pain intensity: HIGH** -- Any tool from LIBERAL must establish its own credibility through radical transparency.

### 4.5 Information Asymmetry

- Government has complete information; citizens have almost none
- Technical financial jargon (LOLF, missions, programmes, PLF, PLFR, PLFSS) is impenetrable
- Mainstream media covers fiscal issues superficially (headline deficit numbers without context)
- Think-tank reports are accessible only to policy elites
- No tool shows the personal impact: "Of your EUR X,XXX in taxes, here is exactly where each euro went"
- **Pain intensity: CRITICAL** -- This is the fundamental market gap that LIBERAL can fill.

### 4.6 Comparison and Benchmarking Gap

- Citizens cannot easily compare France's spending with other countries
- No tool shows how France's EUR 57 spent per EUR 100 of GDP compares to EU/OECD peers
- Municipal spending comparisons exist (Argus des Communes) but are limited and outdated
- No time-series tools show how spending has evolved over decades
- **Pain intensity: MODERATE** -- Important for engaged citizens and policy discussions.

---

## 5. Market Gaps and Opportunities

### 5.1 The Missing Product: A "Personal Fiscal Dashboard"

**Gap:** No French platform currently provides a personalized view of government spending based on an individual citizen's tax contribution. The UK's "Where Does My Money Go?" concept has never been properly replicated for France.

**Opportunity:** A tool where citizens enter their approximate income/tax situation and see exactly how their personal tax euros are allocated -- defense, education, debt interest, social transfers, etc. -- would be immediately compelling and highly shareable on social media.

**Differentiation:** Unlike OpenFisca (technical, no editorial), unlike IFRAP (reports, not interactive), unlike Cour des Comptes (institutional, not personal), LIBERAL would make fiscal data personal, visual, and shareable.

### 5.2 Real-Time Spending Tracker

**Gap:** No French platform provides real-time (or near-real-time) tracking of government spending with a citizen-facing interface.

**Opportunity:** A French "debt clock" (inspired by TaxPayers' Alliance UK) showing the national debt increasing in real-time, combined with spending metrics updated as frequently as data permits.

**Features to include:**
- Debt counter (EUR per second)
- Spending counter (EUR per second)
- Interest payments counter
- Per-citizen debt figure
- Historical trend lines

### 5.3 Waste and Scandal Database

**Gap:** Government waste stories appear in media sporadically but are not systematically catalogued. The Cour des Comptes documents waste but in inaccessible formats.

**Opportunity:** A searchable, categorized database of government waste, overspending, and fiscal scandals -- drawn from Cour des Comptes reports, parliamentary questions, investigative journalism, and citizen reports. Each entry would include: amount wasted, responsible entity, source documentation, and follow-up status.

### 5.4 Municipal and Regional Spending Comparisons

**Gap:** Contribuables Associes has the Argus des Communes but it is limited, dated, and not interactive. No tool allows citizens to easily compare their municipality's spending with similar-sized communes.

**Opportunity:** An interactive map-based tool using data from data.gouv.fr's municipal budget datasets, enabling citizens to compare taxes, spending per capita, debt levels, and service quality across municipalities.

### 5.5 Legislative Impact Calculator

**Gap:** When new laws or budgets are proposed, citizens cannot easily understand the personal impact.

**Opportunity:** A tool (potentially leveraging OpenFisca's engine) that translates each proposed law or budget measure into personal terms: "This law would cost/save you approximately EUR X per year."

### 5.6 Mobile-First, Social-Native Content

**Gap:** All existing French fiscal transparency tools are web-based, desktop-oriented, and text-heavy. None produce social media-native content (short videos, infographics, interactive stories).

**Opportunity:** LIBERAL should be built mobile-first and should prioritize producing content optimized for social sharing: 15-second TikTok explanations, Instagram infographics, Twitter/X threads, YouTube Shorts.

### 5.7 Open-Source Community Advantage

**Gap:** No existing French fiscal transparency project has successfully built an open-source developer community around government spending data.

**Opportunity:** By being truly open-source, LIBERAL can:
- Attract developers who want to contribute to a meaningful project
- Enable third-party applications built on LIBERAL's data infrastructure
- Build credibility through code transparency
- Leverage volunteer contributions for features and maintenance

### 5.8 Unserved Audiences

| Audience | Currently Served By | What's Missing |
|----------|-------------------|----------------|
| Young taxpayers (18-35) | Nobody effectively | Mobile-first, social-native fiscal tools |
| Entrepreneurs/freelancers | Tax advisors only | Clear breakdown of their disproportionate burden |
| Municipal voters | Argus des Communes (limited) | Interactive, comparative, real-time municipal data |
| Investigative journalists | Fragmented data sources | Consolidated spending database with search/export |
| Educators | Nothing specific | Classroom-ready materials on government finance |
| Libertarian community | IFRAP (think tank), Contrepoints (blog) | Data-driven tools supporting liberty arguments |

---

## 6. Distribution and Growth Channels

### 6.1 Social Media Strategy

#### Twitter/X (~12 million users in France)
- **Role:** Primary platform for political discourse and media influence
- **Content Types:** Data threads, real-time commentary on fiscal announcements, infographic cards, live-tweeting of budget debates
- **Strategy:** Build thought leadership; engage with journalists, politicians, and opinion leaders; create shareable data visualizations
- **Frequency:** Multiple daily posts; real-time response to fiscal news
- **Key Accounts to Engage:** Political journalists, IFRAP, Contribuables Associes, economic commentators

#### TikTok (~21 million users, 38+ hrs/month engagement)
- **Role:** Reach the 18-34 demographic with viral fiscal content
- **Content Types:** 15-60 second videos explaining government waste; "Did you know?" format; visual data storytelling; "your tax money bought this" reveals
- **Strategy:** Create a recognizable format/series; use trending sounds and formats; aim for viral moments
- **Frequency:** 3-5 videos per week minimum
- **Growth Potential:** Highest of any platform due to algorithmic distribution and engagement depth

#### YouTube (~36 million users)
- **Role:** Deep-dive content; educational series; investigative reports
- **Content Types:** 10-20 minute analysis videos; budget breakdowns; interviews with economists; data visualization walkthroughs
- **Strategy:** SEO-optimized titles; consistent series branding; collaboration with existing French finance/politics YouTubers
- **Frequency:** 1-2 videos per week
- **Long-Form Value:** YouTube content has long shelf life and strong SEO value

#### Instagram (30.5 million users)
- **Role:** Visual data storytelling; infographics; Stories for real-time updates
- **Content Types:** Data infographics, carousel posts explaining complex fiscal topics, Reels (cross-posted from TikTok), Stories with polls/questions
- **Strategy:** Build a visual brand identity; create a consistent aesthetic for fiscal data; use carousel format for multi-step explanations
- **Frequency:** Daily posts; Stories throughout the day

#### Facebook (46.6 million users)
- **Role:** Broad reach; community building; older demographic engagement; sharing engine
- **Content Types:** Articles, infographics, video, community discussions, events
- **Strategy:** Create a Facebook Group for active community members; use Facebook's sharing mechanics for viral distribution; target 35+ demographic
- **Growth Potential:** Facebook Groups were the organizing platform for the Gilets Jaunes -- there is proven appetite for fiscal activism on Facebook

### 6.2 Media Partnerships

- **Target Media:** Les Echos, Le Figaro (natural fiscal conservative audience), Le Monde, Mediapart (investigative), BFM Business, France Info
- **Approach:** Provide exclusive data analyses, pre-release findings, embed LIBERAL's interactive tools in their articles
- **Data Journalism Collaboration:** Partner with data journalism teams at major outlets to co-produce investigations using LIBERAL's data infrastructure
- **Think Tank Co-Publication:** Co-author reports with IFRAP or Institut Montaigne for credibility

### 6.3 Political Party and Association Connections

- **Natural Allies:**
  - Contribuables Associes (350,000+ members -- potential distribution partner)
  - IFRAP (credibility and research partnership)
  - Contrepoints.org (French libertarian blog/media)
  - European Taxpayers' federation network
  - Atlas Network affiliates in France
- **Political Parties (engagement without endorsement):**
  - Provide neutral data tools that any party can use
  - Brief parliamentary aides and elected officials on findings
  - Present at parliamentary hearings when invited
  - Maintain strict non-partisan positioning while being clearly pro-transparency

### 6.4 Developer Community Engagement

- **GitHub:** All code open-source; active issue tracking; contributor guidelines; good documentation
- **Hackathons:** Organize or participate in civic tech hackathons (e.g., Open Data Day, Nuit du Code Citoyen)
- **Developer Blog:** Technical posts about data engineering, visualization techniques, API design
- **API Program:** Provide a public API so developers can build their own applications on LIBERAL's data
- **Community Platforms:** Discord or Matrix server for contributors; regular contributor calls

### 6.5 SEO and Content Strategy

- **Target Keywords (French):**
  - "depenses publiques France" (public spending France)
  - "dette publique France" (public debt France)
  - "ou vont mes impots" (where do my taxes go)
  - "gaspillage argent public" (public money waste)
  - "budget etat France" (state budget France)
  - "combien je paie d'impots" (how much tax do I pay)
  - "comparaison depenses communes" (municipal spending comparison)
- **Content Types:**
  - Evergreen explainers: "How the French budget works", "Understanding your tax bill"
  - News-driven analysis: Real-time commentary on fiscal announcements
  - Data stories: Original analyses of government spending data
  - Guides: "How to read the Loi de Finances", "Understanding the PLF"
- **SEO Approach:** Build topical authority on government spending; earn backlinks through original data analyses; optimize for featured snippets; multilingual content (French primary, English secondary for international reach)

### 6.6 Education and Academic Partnerships

- Partner with economics departments at French universities
- Create classroom-ready materials for civics education
- Engage with Sciences Po, HEC, ENSAE for student projects
- Present at academic conferences on fiscal policy and civic tech

---

## 7. Monetization and Sustainability

### 7.1 How Similar Projects Sustain Themselves

| Organization | Primary Revenue Model | Annual Budget (est.) | Key Lesson |
|-------------|----------------------|---------------------|------------|
| IFRAP | Tax-deductible donations | Not disclosed | Private donation model works in France; tax deductibility is critical |
| Contribuables Associes | Member contributions | Not disclosed | Mass membership can sustain operations; requires large base |
| Sunlight Foundation | Grants + donations | $5-8M (before closure) | **Closed in 2020** -- grant dependency is risky |
| mySociety | Mix: government contracts, grants, donations | ~GBP 3M | Diversified revenue is key; government contracts provide stability |
| TaxPayers' Alliance | Member donations + corporate sponsors | ~GBP 1.5M | Grassroots donations from large base; media prominence drives contributions |
| OpenSpending/OKF | Grants + consulting | Varies by country | Project-based funding creates sustainability challenges |

### 7.2 Recommended Revenue Mix for LIBERAL

#### Tier 1: Foundation (Year 1-2)

**1. Individual Donations (Target: 40% of revenue)**
- Tax-deductible donations (if association d'interet general status achieved)
- Monthly recurring donations via Stripe/PayPal
- Annual fundraising campaigns tied to budget season (September-December)
- "Adopt a dataset" or "Fund an investigation" targeted appeals

**2. Open Collective / GitHub Sponsors (Target: 15% of revenue)**
- Transparent financial management via Open Collective
- GitHub Sponsors for developer contributors
- Patreon/KoFi for content creator support
- Zero platform fees on GitHub Sponsors

**3. Grants (Target: 30% of revenue)**
- EU Horizon Europe civic tech funding
- Next Generation Internet (NGI) micro-grants
- Digital Europe Programme
- Civic Innovation Fund (CIF) for European NGOs
- Atlas Network grants (for libertarian-aligned projects)
- Sovereign Tech Fund (Germany, for open-source infrastructure)
- French government grants for open data projects (through OGP commitments)

**4. Consulting / Data Services (Target: 15% of revenue)**
- Custom data analyses for media organizations
- API access tiers for commercial use
- Training workshops on fiscal data analysis
- Speaking fees and conference appearances

#### Tier 2: Growth (Year 3-5)

**5. Freemium Model**
- Free: All core tools, data visualizations, and content
- Premium: Advanced analytics, downloadable datasets, custom alerts, municipality deep-dives, API access above rate limits
- Enterprise: Bulk data access, white-label solutions for media/researchers

**6. Partnerships**
- Media organization licensing (embed LIBERAL tools in their articles)
- Data syndication agreements
- Co-branded research reports with think tanks

**7. Merchandise and Events**
- Branded merchandise (debt clock t-shirts, fiscal freedom day gear)
- Annual conference/summit on fiscal transparency
- Webinar series with paid premium access

### 7.3 Cost Structure Estimate

| Category | Year 1 (est.) | Year 2 (est.) | Notes |
|----------|---------------|---------------|-------|
| Development (core team) | EUR 120,000 | EUR 200,000 | 2-3 developers |
| Data infrastructure | EUR 12,000 | EUR 24,000 | Cloud hosting, databases |
| Content creation | EUR 30,000 | EUR 60,000 | Video, design, writing |
| Legal and admin | EUR 15,000 | EUR 20,000 | Association setup, accounting |
| Marketing | EUR 10,000 | EUR 30,000 | Social media ads, events |
| **Total** | **EUR 187,000** | **EUR 334,000** | |

### 7.4 Sustainability Best Practices

1. **Diversify early:** Never depend on a single funding source (Sunlight Foundation lesson)
2. **Build recurring revenue:** Monthly donors are more valuable than one-time donors
3. **Radical financial transparency:** Publish LIBERAL's own finances using the same tools it builds for government spending
4. **Community contribution:** Leverage open-source volunteers to reduce development costs
5. **Plan maintenance from the start:** Budget for ongoing updates, security patches, and data pipeline maintenance
6. **Avoid government funding dependency:** Government grants create conflicts of interest for an accountability project; limit to <20% of revenue

---

## 8. Strategic Recommendations

### 8.1 Positioning

LIBERAL should position itself as **"the citizen's fiscal dashboard"** -- not a think tank (IFRAP already fills that role), not a lobbying group (Contribuables Associes), and not a government tool (Cour des Comptes). It is a **technology-driven, citizen-empowering, open-source platform** that makes government spending transparent, personal, and actionable.

**Core Messaging Framework:**
- "See where every euro of your taxes goes"
- "EUR 48,000 of debt in your name. See how it happened."
- "The government's budget in 30 seconds" (TikTok series)
- "Your money. Your right to know."

### 8.2 MVP Feature Prioritization

1. **French Debt Clock** (Week 1-2): Immediate viral potential; simple to build; inspired by TaxPayers' Alliance
2. **Personal Tax Calculator** (Month 1-2): "Where does MY money go?" -- the killer feature
3. **Waste Database** (Month 2-3): Searchable catalogue of government waste from Cour des Comptes reports
4. **Municipal Comparison Tool** (Month 3-6): Interactive map using data.gouv.fr municipal budget data
5. **Legislative Impact Calculator** (Month 6-12): "This new law will cost you EUR X" -- powered by OpenFisca

### 8.3 Key Differentiators

| Feature | IFRAP | Contrib. Associes | Cour des Comptes | OpenFisca | **LIBERAL** |
|---------|-------|-------------------|------------------|-----------|-------------|
| Open Source | No | No | No | Yes | **Yes** |
| Interactive Tools | Limited | Argus only | None | Technical | **Core focus** |
| Mobile-First | No | No | No | No | **Yes** |
| Social-Native Content | Limited | Limited | No | No | **Yes** |
| Personal Tax Dashboard | No | No | No | Backend only | **Yes** |
| Real-Time Data | No | No | Annual reports | On-demand | **Yes** |
| Editorial/Critical Angle | Yes (reports) | Yes (campaigns) | Neutral | Neutral | **Yes** |
| Developer Community | No | No | No | Yes | **Yes** |

### 8.4 Risk Factors

1. **Political backlash:** Government may attempt to discredit or restrict the project
2. **Data quality:** Official data may be incomplete, delayed, or revised
3. **Funding sustainability:** The Sunlight Foundation's closure shows civic tech funding is fragile
4. **Partisan capture:** Risk of being perceived as a tool of one political party
5. **Legal risk:** Defamation concerns when naming specific officials or institutions
6. **Volunteer burnout:** Open-source projects often suffer from contributor fatigue

### 8.5 Success Metrics (Year 1)

- Monthly active users: 100,000+
- Social media followers (combined): 50,000+
- Newsletter subscribers: 10,000+
- GitHub stars: 1,000+
- Active contributors: 20+
- Media mentions: 50+
- Monthly recurring donors: 500+
- Tax calculator uses: 500,000+

---

## 9. Sources

### French Organizations
- [Fondation IFRAP -- Homepage](https://www.ifrap.org/)
- [Fondation IFRAP -- Qui Sommes-Nous](https://www.ifrap.org/qui-sommes-nous)
- [IFRAP -- Wikipedia (French)](https://fr.wikipedia.org/wiki/Fondation_pour_la_recherche_sur_les_administrations_et_les_politiques_publiques)
- [Contribuables Associes -- Homepage](https://contribuablesassocies.org/)
- [Contribuables Associes -- Argus des Communes](https://arguscommunes.touscontribuables.org/)
- [Contribuables Associes -- Wikipedia (French)](https://fr.wikipedia.org/wiki/Contribuables_associ%C3%A9s)
- [OpenFisca -- Homepage](https://openfisca.org/en/)
- [OpenFisca -- GitHub (openfisca-france)](https://github.com/openfisca/openfisca-france)
- [OpenFisca -- About](https://openfisca.org/en/about/)
- [OpenFisca -- When a Digital Commons Turns Law into Code](https://labo.societenumerique.gouv.fr/en/articles/openfisca-quand-un-commun-numerique-transforme-la-loi-en-code/)
- [France Opens Source Code of Tax Calculators -- EU Interoperable Europe Portal](https://interoperable-europe.ec.europa.eu/collection/egovernment/document/france-opens-source-code-tax-and-benefits-calculators-increase-transparency)
- [Cour des Comptes -- 2025 Annual Public Report](https://www.ccomptes.fr/fr/publications/rapport-annuel-2025)
- [Cour des Comptes -- Public Finances Situation 2025](https://www.ccomptes.fr/fr/publications/la-situation-des-finances-publiques-debut-2025)
- [Cour des Comptes -- Citizen Participation](https://participationcitoyenne.ccomptes.fr/)
- [France Strategie / Haut-Commissariat](https://www.strategie-plan.gouv.fr/en/about-haut-commissariat-la-strategie-et-au-plan)
- [Institut Montaigne -- About Us](https://www.institutmontaigne.org/en/about-us)
- [Institut Montaigne -- Wikipedia](https://en.wikipedia.org/wiki/Institut_Montaigne)

### International Organizations
- [USAspending.gov](https://www.usaspending.gov/)
- [USAspending.gov Data Lab](https://datalab.usaspending.gov/)
- [GAO Report on USAspending.gov Data Quality](https://www.gao.gov/products/gao-24-106214)
- [Federal Spending Transparency -- DATA Act](https://fedspendingtransparency.github.io/)
- [OpenSpending.org](https://www.openspending.org/)
- [OpenSpending -- GitHub](https://github.com/openspending)
- [Where Does My Money Go?](https://app.wheredoesmymoneygo.org/about.html)
- [OpenBudgets.eu](https://openbudgets.eu/)
- [OpenBudgets.eu -- EU Success Story](https://digital-strategy.ec.europa.eu/en/news/openbudgets-eu-funded-project-success-story)
- [Sunlight Foundation](https://sunlightfoundation.com/)
- [Sunlight Foundation -- Open Data Guidelines](https://sunlightfoundation.com/opendataguidelines/)
- [mySociety](https://www.mysociety.org/)
- [mySociety -- About](https://www.mysociety.org/about/)
- [TaxPayers' Alliance -- Homepage](https://taxpayersalliance.com/)
- [TaxPayers' Alliance -- 2025 Budget Response](https://taxpayersalliance.com/taxpayers-alliance-responds-to-the-2025-budget/)
- [Follow The Money](https://www.ftm.eu/)
- [GIJN -- Follow the Money Resources](https://gijn.org/resource/introduction-investigative-journalism-following-money/)

### Data Sources and Platforms
- [data.gouv.fr](https://www.data.gouv.fr/)
- [data.economie.gouv.fr](https://data.economie.gouv.fr/)
- [data.gouv.fr -- Budget Comptes Publics Dataset](https://www.data.gouv.fr/datasets/budget-comptes-publics)
- [api.gouv.fr](https://api.gouv.fr/)
- [budget.gouv.fr](https://www.budget.gouv.fr/budget-etat)
- [France Open Government Partnership -- Action Plan](https://www.opengovpartnership.org/documents/france-action-plan-review-2023-2025/)

### Economic and Fiscal Data
- [OECD Revenue Statistics 2025 -- France](https://www.oecd.org/en/publications/revenue-statistics-2025_b1943459-en/france_c55b0aeb-en.html)
- [OECD Government at a Glance 2025 -- France](https://www.oecd.org/en/publications/government-at-a-glance-2025-country-notes_da3361e1-en/france_fcb2c4da-en.html)
- [Tax Foundation -- France Tax Rates](https://taxfoundation.org/location/france/)
- [IMF 2025 Article IV Mission -- France](https://www.imf.org/en/news/articles/2025/05/22/cs-france-2025)
- [France Public Debt 2025 -- EU Debt Map](https://www.eudebtmap.com/articles/france-debt-2025)
- [Public Debt Clock France](https://horloge-de-la-dette-publique.com/en/debt-clock-france/)
- [France 24 -- Massive Debt Behind Political Turmoil](https://www.france24.com/en/live-news/20250905-the-massive-debt-behind-france-s-political-turmoil)
- [Banque de France -- Can Our Tax Debate Be Rational?](https://www.banque-france.fr/en/governors-interventions/can-our-tax-debate-be-rational)

### Trust and Corruption
- [Gallup -- France Political Crisis Rattles Trust](https://news.gallup.com/poll/700160/france-political-crisis-rattles-trust-institutions.aspx)
- [Transparency International -- 2025 CPI France](https://www.transparency.org/en/cpi/2025/index/fra)
- [Eurobarometer -- Citizens' Attitudes Towards Corruption 2025](https://europa.eu/eurobarometer/surveys/detail/3361)
- [OECD Trust Survey 2024 -- France](https://www.oecd.org/en/publications/2024/06/oecd-survey-on-drivers-of-trust-in-public-institutions-2024-results-country-notes_33192204/france_aab7c213.html)

### Audience and Demographics
- [DataReportal -- Digital 2025 France](https://datareportal.com/reports/digital-2025-france)
- [NapoleonCat -- Social Media Users in France 2025](https://napoleoncat.com/stats/social-media-users-in-france/2025/)
- [Statista -- Social Media Usage in France](https://www.statista.com/topics/6278/social-media-usage-in-france/)
- [Euronews -- Tax Revenue as Share of GDP in Europe](https://www.euronews.com/business/2025/08/26/tax-revenue-as-a-share-of-gdp-in-europe-which-countries-collect-the-most)

### Gilets Jaunes and Fiscal Anger
- [International Budget Partnership -- Yellow Vests and Social Media Tax Revolt](https://internationalbudget.org/publications/france-the-yellow-vests-and-their-social-media-driven-fight-over-fair-taxation/)
- [H-Diplo Policy Series -- France's Yellow Vests: Lessons from a Revolt](https://issforum.org/policy/2-5-yellow-vests)
- [The Nation -- The Anger of the Gilets Jaunes](https://www.thenation.com/article/archive/gilets-juanes-yellow-vest-taxes/)
- [Cairn.info -- Origins of the Gilets Jaunes Movement](https://shs.cairn.info/journal-revue-economique-2020-1-page-109?lang=en)

### Funding and Sustainability
- [EU Interoperable Europe -- Funding Opportunities for Open Source](https://interoperable-europe.ec.europa.eu/collection/open-source-observatory-osor/funding-opportunities-open-source-software-projects-public-sector)
- [Open Collective](https://opencollective.com/)
- [GitHub Sponsors](https://github.com/sponsors)
- [Civic Innovation Fund Europe](https://thecivics.eu/projects/civic-innovation-fund/)
- [Horizon Europe Civic Tech Funding Analysis](https://redefine.pt/2025/08/16/horizon-europe-civic-tech-future-democracy/)
- [CivicTech.guide -- Funding Resources](https://civictech.guide/funding/)

### Political and Civic Tech Context
- [France Snapshot of Digital Skills -- EU Platform](https://digital-skills-jobs.europa.eu/en/latest/briefs/france-snapshot-digital-skills)
- [Computer Weekly -- France Leads Global Open Data Race](https://www.computerweekly.com/news/450284803/France-takes-the-lead-in-the-global-open-data-race)
- [TIME -- How Europe's Far Right is Winning Young Voters](https://time.com/6989622/france-eu-europe-far-right-elections/)
- [Ifop -- Political and Regional Barometer September 2025](https://www.ifop.com/en/article/political-and-regional-barometer-september-2025)
- [Human Rights Institute -- Escalating Public Discontent France 2025](https://www.hriui.com/en/news-report-escalating-public-discontent-amidst-economic-crisis-in-france-2025/)
- [Fortune -- France Wealth Tax Repeal](https://fortune.com/2026/01/27/california-france-wealth-tax-inequality/)

---

*This research report was compiled on 2026-02-27 for the LIBERAL project. All data and statistics are drawn from publicly available sources as cited above. The market analysis reflects conditions as of February 2026.*
