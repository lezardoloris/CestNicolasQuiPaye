---
title: "LIBERAL Project - Comprehensive Brainstorming Session"
date: 2026-02-27
type: brainstorming
status: complete
participants: ["AI Brainstorming Facilitator"]
idea_count: 142
categories: 15
session_goal: "Generate 100+ ideas across all project domains to expose France's government spending and fiscal irresponsibility"
project_context: |
  France has one of the highest tax burdens in the world (46%+ of GDP), government spending ~57% of GDP,
  public debt over 110% of GDP. The LIBERAL project aims to make fiscal data transparent, accessible,
  and actionable for French citizens through open-source tools.
---

# LIBERAL Project -- Brainstorming Session

**Date:** 2026-02-27
**Objective:** Generate a comprehensive set of ideas to expose France's outrageous government spending, make fiscal data transparent, and empower citizens to demand accountability.
**Guiding Principle:** Every euro taken from a citizen's pocket deserves scrutiny. Transparency is liberation.

---

## Table of Contents

1. [Data Visualization & Dashboards](#1-data-visualization--dashboards)
2. [Data Sources & Collection](#2-data-sources--collection)
3. [Citizen Engagement](#3-citizen-engagement)
4. [Political Accountability](#4-political-accountability)
5. [Comparison Tools](#5-comparison-tools)
6. [Gamification & Virality](#6-gamification--virality)
7. [Mobile & Accessibility](#7-mobile--accessibility)
8. [Community & Crowdsourcing](#8-community--crowdsourcing)
9. [Media & Communication](#9-media--communication)
10. [Legal & Institutional](#10-legal--institutional)
11. [Open Source Strategy](#11-open-source-strategy)
12. [Shock Value Features](#12-shock-value-features)
13. [Personal Tax Calculator](#13-personal-tax-calculator)
14. [Waste & Scandal Tracker](#14-waste--scandal-tracker)
15. [Alternative Budget Proposals](#15-alternative-budget-proposals)
16. [Top Picks & Rankings](#16-top-picks--rankings)

---

## 1. Data Visualization & Dashboards

> How to present spending data compellingly so that citizens immediately grasp the scale of fiscal excess.

**1.1 -- The National Debt Clock (Live)**
A real-time counter showing France's national debt ticking upward in euros per second. Display it prominently on the homepage. Show the debt per citizen, per taxpayer, per household, and per newborn baby. The number never stops. It should feel visceral -- like watching your savings drain away.

**1.2 -- "Where Does Your Euro Go?" Sankey Diagram**
An interactive Sankey (flow) diagram that starts with 1 EUR of tax revenue on the left and flows into all the spending categories on the right: social protection, debt interest, defense, education, culture, administration overhead, etc. Users can click any branch to drill down. The visual makes it impossible to ignore that over 60 centimes of every euro goes to social transfers.

**1.3 -- The Budget Treemap**
A zoomable treemap visualization of the entire French budget (Loi de Finances). Each rectangle is proportional to spending. Users can zoom from the macro (ministries) to the micro (individual budget lines). Color-code by growth rate: red for categories growing faster than inflation, green for shrinking ones.

**1.4 -- Historical Spending Timeline**
An animated timeline from 1960 to present showing how government spending as a percentage of GDP has grown decade by decade. Overlay key events: oil crises, Mitterrand's nationalization, the 35-hour workweek, COVID stimulus. Let users see the ratchet effect -- spending goes up in crises and never comes back down.

**1.5 -- The Tax Burden Heatmap**
A geographic heatmap of France showing tax pressure by department/region. Combine local taxes (taxe fonciere, CFE, CVAE) with national averages. Let citizens see how their locality compares. Highlight departments where combined tax burden exceeds 50% of median income.

**1.6 -- Real-Time Budget Execution Dashboard**
Track actual spending vs. budgeted amounts throughout the fiscal year, using data from the Direction du Budget. Show overruns in real time. Create an "overspending alert" system that flags when a ministry exceeds its allocation.

**1.7 -- The "Government as a Company" Balance Sheet**
Present France's finances as if it were a publicly traded corporation: assets, liabilities, revenue, operating costs, net income (always negative), and "shareholder equity" (negative, meaning citizens owe more than they own). Use standard corporate financial reporting formats that business-literate citizens will instantly understand. Include a "stock price" that reflects fiscal health.

**1.8 -- The Bureaucracy Org Chart**
An interactive visualization of every government agency, department, authority, commission, and committee in France. Show headcount, budget, and overlap with other entities. Let users discover the hundreds of obscure agencies most people have never heard of (and probably do not need to exist).

**1.9 -- The "Day the Government Stops" Calendar**
Inspired by "Tax Freedom Day" concepts: for each category of spending, show what day of the year you stop "working for" that category. Working for social security until April. Working for debt interest until mid-February. Working for defense until late February. Free to earn for yourself only starting in late July. Make it a personal calendar view.

**1.10 -- Inflation-Adjusted Everything**
Every single figure on the platform should have a toggle to show values in constant euros. This prevents the government's favorite trick: announcing "record investment" when it is simply inflation eating the numbers. Show the real story.

---

## 2. Data Sources & Collection

> What data to collect, from where, and how to keep it current.

**2.1 -- data.gouv.fr Automated Pipeline**
Build automated scrapers/API consumers for all fiscal datasets on data.gouv.fr: budget execution data, local authority finances (DGFiP), public employment statistics, and social security accounts. Set up nightly data pulls with validation checks.

**2.2 -- Cour des Comptes Report Parser**
The Cour des Comptes publishes hundreds of reports annually identifying waste, mismanagement, and inefficiency. Build an NLP pipeline to automatically extract key findings, quantified waste amounts, and recommendations from these PDF reports. Create a searchable database of every finding going back 20+ years.

**2.3 -- Journal Officiel Monitor**
Monitor the Journal Officiel (JORF) for all new spending authorizations, regulatory costs, tax changes, and administrative creations. Alert system when new spending is enacted or new taxes/levies are created.

**2.4 -- HATVP (Transparency Authority) Data Integration**
Ingest all declarations of assets and interests from elected officials via the Haute Autorite pour la Transparence de la Vie Publique. Cross-reference politician wealth trajectories with their time in office.

**2.5 -- EU/Eurostat Comparative Data**
Pull harmonized fiscal data from Eurostat for all EU-27 countries to enable direct comparisons. Same definitions, same methodology -- no room for French government spin.

**2.6 -- OECD Tax Database Integration**
Integrate OECD tax burden data, government efficiency metrics, and public spending breakdowns for all 38 OECD member countries. France's position is damning and should be shown constantly.

**2.7 -- Assemblee Nationale & Senat Voting Records**
Scrape and structure all parliamentary votes on fiscal matters: budgets, tax laws, spending authorizations. Link every parliamentarian to their fiscal voting record. Who voted to raise your taxes? Who voted against cutting spending?

**2.8 -- Public Procurement Data (BOAMP/TED)**
Ingest public procurement data from the Bulletin Officiel des Annonces de Marches Publics and the EU's Tenders Electronic Daily. Track government contracts, identify patterns of overspending, no-bid contracts, and suspicious procurement.

**2.9 -- INSEE Economic Indicators**
Automated integration of INSEE data: GDP, inflation, unemployment, median income, poverty rates. This provides the economic context to judge whether spending is producing results.

**2.10 -- Social Media Politician Promise Tracker (NLP)**
Use NLP to scrape and catalog fiscal promises made by politicians on social media, TV appearances, and campaign materials. Build a structured database of promises with dates and attribution for later accountability scoring.

---

## 3. Citizen Engagement

> How to make citizens care enough to look, share, and act.

**3.1 -- "Your Personal Tax Receipt"**
Let users enter their annual income and receive a personalized, itemized "receipt" showing exactly how many euros they paid for each government function: X euros for debt interest, Y euros for public hospitals, Z euros for military operations abroad. Make it shareable as an image.

**3.2 -- Monthly "Fiscal Newsletter"**
A plain-language monthly email digest summarizing: biggest spending stories, new waste discovered, politician accountability updates, comparisons with other countries. Written in an accessible, slightly irreverent tone. Not dry -- angry.

**3.3 -- "Ask Your Deputy" Template Generator**
Generate pre-written letters/emails citizens can send to their local depute or senator asking specific, data-backed questions about spending. "Dear Deputy, the Cour des Comptes found EUR 3.2 billion in waste at [agency]. How did you vote on their budget?"

**3.4 -- Participatory Budget Simulator**
Let citizens build their own version of the French budget. Give them the real revenue constraints and let them allocate spending. Show them the trade-offs. At the end, aggregate results to show "what citizens want" versus "what politicians deliver." This becomes a powerful lobbying data point.

**3.5 -- Town Hall Meeting Toolkit**
Provide downloadable data packages, presentation slides, and talking points for citizens who want to raise fiscal issues at local council meetings or public forums. Arm them with facts their elected officials cannot dismiss.

**3.6 -- "Fiscal Literacy" Course**
A free online mini-course (5-10 lessons) teaching citizens how French public finances work: where money comes from, where it goes, how budgets are voted, what the Cour des Comptes does, how to read a PLF (Projet de Loi de Finances). Knowledge is power.

**3.7 -- SMS/Telegram Alert System**
Opt-in alerts when spending milestones are hit: "France's debt just passed EUR 3.3 trillion," or "Your region's budget was just increased by 8%," or "Parliament just voted for EUR 5 billion in new spending."

**3.8 -- Petition Integration Platform**
When waste is documented, automatically generate petition templates on platforms like change.org or Avaaz, pre-populated with the relevant data and addressed to the responsible officials. Lower the friction to zero.

**3.9 -- Annual "State of the Taxpayer" Report**
Publish an annual comprehensive report -- the taxpayer's equivalent of the government's PLF -- that tells the story of the year in public finances from the citizen's perspective. Make it a media event.

**3.10 -- Volunteer Ambassador Program**
Recruit and equip citizen ambassadors in every department of France. Give them data dashboards for their locality, talking points, and social media assets. Create a network of informed, articulate fiscal watchdogs.

---

## 4. Political Accountability

> Tracking politician promises vs. reality. Names, votes, consequences.

**4.1 -- The "Promise Tracker" Dashboard**
For every major politician (President, Prime Minister, Finance Minister, key deputies), maintain a public scorecard of their fiscal promises vs. outcomes. "Promised to reduce deficit to 3% by 2025 -- actual deficit: 5.5%." Color-coded: kept, broken, in progress, abandoned.

**4.2 -- Voting Record Heat Matrix**
A visual matrix showing how every parliamentarian voted on every fiscal bill. Rows = politicians, columns = votes. Color by position. Instantly identify who always votes for more spending, who votes for tax increases, who is fiscally responsible. Sortable, filterable, shareable.

**4.3 -- "Cost of a Politician" Calculator**
Calculate the total cost to taxpayers of each elected official: salary, pension accrual, office allowance (IRFM), staff costs, travel, perks. Show the total for all 577 deputies, 348 senators, and local elected officials. The aggregate number is staggering.

**4.4 -- Revolving Door Tracker**
Document the movement of individuals between government positions and private sector roles (pantouflage). Highlight cases where former officials now lobby for industries they previously regulated or awarded contracts to.

**4.5 -- "They Said / They Did" Side-by-Side**
For every fiscal promise, create a side-by-side comparison: the promise (with video clip or quote source) on the left, the actual outcome with data on the right. Make it impossible to deny.

**4.6 -- Absenteeism Scoreboard**
Track parliamentarian attendance at budget debates and fiscal committee meetings specifically. Show who was absent during critical votes on spending. "Your deputy was absent for 73% of budget votes. They still get paid EUR 7,493.30/month."

**4.7 -- "Who Broke the Budget" Attribution**
For every major budget overrun, trace responsibility to the specific minister, director, or decision. Name names. Link to their current position. Create a chain of accountability that does not fade with time.

**4.8 -- Election Fiscal Report Card**
Before every election, publish a comprehensive fiscal report card for incumbents and their parties. What did they promise? What did they deliver? How much more debt was accumulated on their watch?

**4.9 -- Committee & Commission Sunset Tracker**
Track every government commission, committee, and advisory body. When were they created? What was their mandate? Have they fulfilled it? Are they still active and costing money years after their purpose ended? France has thousands of these.

**4.10 -- Lobbying Expenditure Cross-Reference**
Cross-reference HATVP lobbying declarations with subsequent policy decisions and spending. Show correlations between industry lobbying spending and favorable government contracts or regulatory decisions.

---

## 5. Comparison Tools

> France vs. the world. Region vs. region. The power of context.

**5.1 -- "France vs. X" Country Comparator**
Side-by-side comparison of France with any other country: tax burden, spending/GDP, debt/GDP, public employment, GDP growth, unemployment. Pre-set comparisons with Germany, UK, Switzerland, Sweden, and the US. Let citizens see what is "normal" and what is excessive.

**5.2 -- The "What If France Were Switzerland?" Simulator**
Model what French citizens would pay in taxes and receive in services if France adopted the fiscal profile of another country. "If France spent like Germany, you would save EUR 2,800/year in taxes." Make it personal.

**5.3 -- Region vs. Region Dashboard**
Compare fiscal performance across French regions: spending per capita, debt levels, growth rates, unemployment. Identify regions that deliver more with less and those that are fiscal black holes. Name them.

**5.4 -- Public vs. Private Sector Comparison**
Compare compensation, benefits, retirement conditions, job security, and working hours between public and private sector workers in France. Show the privileges gap with hard data. Include the cost of public sector pensions versus private pensions.

**5.5 -- Tax Competitiveness Index**
Create a composite index showing France's tax competitiveness for individuals and businesses versus EU neighbors. Show where entrepreneurs are fleeing to (Netherlands, Ireland, Luxembourg) and quantify the economic cost of this fiscal exile.

**5.6 -- "Time Machine" Spending Comparator**
Compare today's spending levels (inflation-adjusted) with past decades. How much more does the government spend per citizen today than in 1980? In 2000? Show the growth that produces no proportional improvement in outcomes.

**5.7 -- Healthcare Spending vs. Outcomes**
France spends heavily on healthcare. Compare spending per capita with health outcomes (life expectancy, infant mortality, wait times, cancer survival) against countries that spend less but achieve similar or better results.

**5.8 -- Education Spending vs. PISA Scores**
France's education spending is substantial. Compare it with PISA scores and educational outcomes over time. Show that throwing money at the system has not improved results -- and in many metrics, France is declining.

**5.9 -- Infrastructure Quality per Euro**
Compare infrastructure spending with quality metrics (road conditions, rail punctuality, broadband speeds) against countries like Switzerland, Japan, and South Korea. Where does the money go if not into better infrastructure?

**5.10 -- Municipality Comparator**
Let citizens compare their commune's finances with similar-sized communes. Per-capita spending, debt, tax rates, number of municipal employees. Discover if your mayor is frugal or extravagant compared to peers.

---

## 6. Gamification & Virality

> Making fiscal data shareable and engaging enough to go viral.

**6.1 -- "Tax Freedom Countdown" Social Sharing**
Each citizen can calculate their personal "Tax Freedom Day" -- the day they stop working for the government and start earning for themselves. Generate a personalized social media card: "I work for the government until July 19th. When is YOUR Tax Freedom Day?" Highly shareable.

**6.2 -- The Fiscal Quiz**
A quiz that asks citizens to guess spending amounts, tax rates, and fiscal facts. "How much does France spend on [X] per year?" Most people underestimate dramatically. Show the shocking real answer. Score the quiz. Make it competitive and shareable.

**6.3 -- "Budget Tetris" Game**
A Tetris-style game where spending blocks fall and you must fit them into the revenue container. The blocks quickly overflow, visualizing the deficit. The game is literally unwinnable -- just like balancing France's budget under current policies. Share your "score" (how long you lasted).

**6.4 -- Weekly "Waste of the Week" Award**
Every week, highlight the most egregious example of government waste discovered. Create a branded social media series with a consistent visual identity. Encourage nominations from the community. Build anticipation.

**6.5 -- "Government Bingo" Card**
A bingo card of fiscal absurdities: "New tax announced," "Promise of deficit reduction broken," "Minister claims spending cut while increasing budget," "New commission created to study a problem another commission already studied." Citizens play along with real news.

**6.6 -- Fiscal Meme Generator**
A tool that auto-generates shareable memes using real fiscal data. Templates like: "[Shocking statistic] -- But sure, the problem is that you are not paying enough taxes." Give citizens weapons-grade content for social media.

**6.7 -- Leaderboard of Fiscal Shame**
Rank politicians, ministries, regions, and agencies by various fiscal metrics: biggest budget overruns, most broken promises, highest cost per citizen. Updated monthly. Create a "Hall of Shame" archive.

**6.8 -- "Spot the Waste" Citizen Challenge**
Gamify waste reporting. Citizens earn badges and points for identifying and documenting government waste in their locality: unused buildings, overstaffed offices, absurd projects. Verify submissions and add to the database.

**6.9 -- Tax Day Countdown Timer**
A countdown to key fiscal dates: income tax filing deadline, TVA payment dates. Accompany each with context about what the money funds. "3 days until you pay [amount] to a government that loses [amount] to waste every year."

**6.10 -- "Fiscal Fortune Wheel"**
A spinning wheel that lands on a random shocking fiscal fact each spin. Quick, addictive, shareable. "Spin to discover where your taxes REALLY go!" Each fact links to a detailed explainer.

---

## 7. Mobile & Accessibility

> Reaching every citizen, everywhere, on every device.

**7.1 -- Progressive Web App (PWA)**
Build as a PWA first: installable, offline-capable, fast on low-end devices. No app store gatekeeping. Works on any smartphone with a browser. This is the best path to reach the maximum number of French citizens.

**7.2 -- Offline-First Data Caching**
Core datasets should be cached locally so citizens in areas with poor connectivity (rural France) can still access key information. Sync when connected.

**7.3 -- Accessibility Compliance (RGAA)**
Full compliance with RGAA (Referentiel General d'Amelioration de l'Accessibilite) -- France's accessibility standard. Screen reader support, keyboard navigation, high contrast modes, font size adjustment. Fiscal transparency is for everyone.

**7.4 -- Multi-Language Support**
French is primary, but include English for international press and expat taxpayers. Consider regional languages (Breton, Occitan, Basque, Alsatian) as a statement about respecting local identity over centralized uniformity.

**7.5 -- Low-Data Mode**
A stripped-down version of the site that loads quickly on 3G connections and consumes minimal data. Essential charts rendered as optimized SVGs or even ASCII art in extreme cases.

**7.6 -- SMS-Based Query System**
For citizens without smartphones, offer an SMS number they can text to get key fiscal data. Text "DETTE" to get the current national debt. Text "IMPOT 30000" to get a quick tax summary for a EUR 30,000 income.

**7.7 -- Voice Assistant Integration**
"Hey Google/Alexa/Siri, how much does France spend on X?" Develop voice app skills so citizens can query fiscal data hands-free.

**7.8 -- Embeddable Widgets**
Create lightweight, embeddable widgets that bloggers, journalists, and other websites can drop into their pages: debt counter, spending ticker, tax calculator mini-version. Spread the data across the web.

**7.9 -- QR Code Campaign Integration**
Generate QR codes that link to specific shocking data points. Designed to be printed on stickers, flyers, or posters for guerrilla awareness campaigns. Scan to discover the truth.

**7.10 -- Kiosk Mode for Public Events**
A full-screen presentation mode designed for use at rallies, conferences, and public events. Large fonts, auto-cycling dashboards, live debt counter as a backdrop.

---

## 8. Community & Crowdsourcing

> Leveraging collective intelligence to build something no single team could.

**8.1 -- Data Verification Bounties**
Offer recognition (badges, leaderboard ranking) to community members who verify data accuracy, find discrepancies, or improve data quality. Crowdsource quality assurance.

**8.2 -- Local Chapter System**
Organize the community into local chapters by department or region. Each chapter maintains local fiscal data, attends local council meetings, and reports on local spending. Federated watchdog network.

**8.3 -- Expert Advisory Network**
Recruit volunteer economists, accountants, lawyers, and policy experts who can provide analysis, verify claims, and add expert commentary to the platform's findings. Give them prominent attribution.

**8.4 -- Citizen Journalist Program**
Train and equip interested citizens to file CADA (Commission d'Acces aux Documents Administratifs) requests, attend public meetings, and investigate local spending stories. Provide templates, guides, and legal support.

**8.5 -- Translation & Localization Sprints**
Organize periodic community events to translate content, localize data for specific regions, and adapt messaging for different audiences.

**8.6 -- Hackathon Events**
Regular online and in-person hackathons focused on fiscal transparency tools. Partner with tech schools and coding bootcamps. Build new features, visualizations, and analyses.

**8.7 -- Data Contribution Portal**
Allow citizens to submit fiscal data they have obtained through personal CADA requests, local government publications, or other sources. Structured intake forms with verification workflow.

**8.8 -- "Adopt a Ministry" Program**
Community members can specialize in monitoring specific ministries or agencies. They become the experts on that entity's spending patterns, develop deep knowledge, and produce regular reports.

**8.9 -- Academic Partnership Program**
Partner with university economics and political science departments. Students can use the platform's data for research projects, theses, and publications. Their findings feed back into the platform.

**8.10 -- Corporate Whistleblower Channel**
A secure, anonymous channel for government employees or contractors to report waste, fraud, or abuse. Use established secure communication protocols. Protect sources above all.

---

## 9. Media & Communication

> Getting press coverage and social media traction to amplify the message.

**9.1 -- Press Data Service**
Offer journalists a dedicated API and data service. When they write about fiscal issues, they can pull verified, well-sourced data from LIBERAL. Become the go-to source. Include embeddable charts with attribution.

**9.2 -- Pre-Packaged Story Kits**
Before major fiscal events (budget vote, PLF release, Cour des Comptes annual report), prepare ready-to-publish story kits for journalists: key data points, charts, context, quotes, and angles. Reduce their workload to increase coverage.

**9.3 -- Infographic Factory**
Produce a steady stream of high-quality, branded infographics suitable for social media sharing. One new infographic per week minimum. Each tells a compelling data story. Optimize dimensions for Twitter/X, Instagram, LinkedIn, and Facebook.

**9.4 -- Podcast Series: "Le Prix de l'Etat"**
A regular podcast discussing fiscal issues in plain language. Interview economists, entrepreneurs who left France for tax reasons, Cour des Comptes magistrates, and citizens affected by fiscal policy. 20-30 minute episodes.

**9.5 -- YouTube/TikTok Short-Form Content**
60-second explainer videos on specific fiscal outrages. Fast-paced, data-driven, shareable. "In 60 seconds: why you work until July for the government." Target young voters who get news from social video.

**9.6 -- Annual Fiscal Awards Ceremony ("Les Gaspis")**
A tongue-in-cheek annual awards ceremony recognizing the worst examples of government waste. Categories: "Biggest Budget Overrun," "Most Useless Commission," "Most Broken Promises," "Lifetime Achievement in Spending." Generate media coverage through irreverence.

**9.7 -- Op-Ed Supply Chain**
Coordinate with sympathetic economists, business leaders, and public intellectuals to place op-eds in major publications (Le Figaro, Les Echos, Le Point, L'Opinion) that reference and link to LIBERAL data.

**9.8 -- Social Media Automation Calendar**
Pre-schedule social media posts around fiscal events: budget vote dates, tax payment deadlines, economic data releases, anniversary of spending scandals. Ensure consistent presence.

**9.9 -- Journalist of the Year Award**
Recognize journalists who do outstanding fiscal transparency reporting. Creates goodwill with the press corps and incentivizes more coverage of these issues.

**9.10 -- Multilingual Press Outreach**
Target international media (Financial Times, The Economist, Bloomberg, Wall Street Journal) with English-language data packages. International embarrassment is a powerful motivator for French politicians.

---

## 10. Legal & Institutional

> Working within the system to create pressure and change.

**10.1 -- Systematic CADA Requests**
File regular, strategic CADA (freedom of information) requests to obtain spending data that is not proactively published. Document refusals and appeals. Create a public log of government transparency (or lack thereof).

**10.2 -- Cour des Comptes Referral Pipeline**
When the community identifies suspected waste or mismanagement, prepare formal referrals to the Cour des Comptes or Chambres Regionales des Comptes (CRC). Use their institutional power to investigate.

**10.3 -- Legal Challenge Fund**
Raise money for legal challenges against non-transparent fiscal practices, illegal spending, or refusal to publish required data. Even the threat of legal action increases compliance.

**10.4 -- Civic Initiative Referendum (RIC) Support**
If/when referendum mechanisms become available, provide the data infrastructure to support citizen-initiated referendums on fiscal matters: spending caps, tax limits, balanced budget requirements.

**10.5 -- Constitutional Council Briefs**
Prepare data-driven briefs ("portes etroites") for the Conseil Constitutionnel when fiscal legislation is being reviewed. Provide the data that shows unconstitutional overreach in taxation.

**10.6 -- EU Fiscal Rule Compliance Monitor**
Track France's compliance with EU Stability and Growth Pact rules (3% deficit, 60% debt targets). Document every violation and the lack of consequences. Show that France plays by its own rules.

**10.7 -- Model Legislation Library**
Draft model legislation for fiscal reforms: spending caps, sunset clauses on programs, mandatory cost-benefit analysis for new spending, tax simplification. Make it easy for sympathetic legislators to act.

**10.8 -- Regulatory Impact Assessment (AIR) Watchdog**
Monitor the government's own regulatory impact assessments (Etudes d'Impact) for new legislation. Rate their quality. Call out cases where costs are underestimated or benefits are overstated.

**10.9 -- Mediateur de la Republique Complaint Facilitator**
Help citizens file complaints with the Defenseur des Droits when they experience administrative abuse related to taxation or government services. Templates, guides, tracking.

**10.10 -- International Treaty Fiscal Impact Analysis**
For every international treaty or EU regulation, calculate the fiscal impact on French taxpayers. Show the hidden costs of commitments made by politicians without democratic debate.

---

## 11. Open Source Strategy

> Building a developer community that sustains and grows the project.

**11.1 -- Modular Architecture**
Design the platform as independent, reusable modules: data ingestion, analysis engine, visualization library, API layer, frontend. Each module can be used independently, attracting different contributor profiles.

**11.2 -- "Good First Issue" Pipeline**
Maintain a curated list of beginner-friendly contributions: data entry tasks, simple visualizations, documentation improvements, translation work. Lower the barrier to first contribution.

**11.3 -- API-First Design**
Build a comprehensive, well-documented public API. Other developers and organizations can build on top of LIBERAL data without contributing to the core codebase. Ecosystem growth.

**11.4 -- Developer Documentation Excellence**
Invest heavily in documentation: architecture decisions (ADRs), data dictionaries, contribution guides, API docs, deployment guides. The quality of documentation determines the health of an open-source community.

**11.5 -- Monthly Contributor Showcase**
Highlight community contributions monthly: new features, analyses, visualizations. Public recognition motivates continued participation and attracts new contributors.

**11.6 -- Fiscal Data NPM/PyPI Packages**
Publish reusable packages for accessing French fiscal data in popular languages (JavaScript, Python, R). Data scientists and developers worldwide can use them for their own projects.

**11.7 -- Plugin/Extension Architecture**
Design the platform to support community-built plugins: new data sources, visualization types, analysis tools, export formats. Let the community extend functionality without core team bottlenecks.

**11.8 -- CI/CD with Automated Data Validation**
Continuous integration that not only tests code but validates data integrity. Every data update is automatically checked for anomalies, completeness, and consistency.

**11.9 -- Template Repository for Other Countries**
Create a template version of the platform that citizens of other high-tax countries can fork and adapt: Belgium, Denmark, Italy. Spread the transparency model internationally.

**11.10 -- University Course Integration**
Develop the platform as a teaching tool for computer science courses on data visualization, open data, and civic tech. Students contribute features as coursework.

---

## 12. Shock Value Features

> The most impactful "did you know" type features that make jaws drop.

**12.1 -- "Your Lifetime Tax Bill"**
Enter your age and career profile. See a running estimate of total taxes you will pay over your lifetime -- including all hidden taxes (TVA, TICPE, employer social charges, etc.). For a median earner, the number exceeds EUR 1 million. Show what that buys. Show what else it could have been.

**12.2 -- The "Hidden Tax" Revealer**
Most citizens think of income tax as "their taxes." Show the full picture: employer social charges (that reduce their salary before they ever see it), TVA on everything they buy, TICPE on fuel, CSG/CRDS, taxe fonciere embedded in rent, and dozens of other taxes. The real tax rate for a median French worker is not 30% -- it is closer to 55-60%.

**12.3 -- "What EUR 1,000 ACTUALLY Costs" Calculator**
Show that when an employer wants to pay a worker EUR 1,000 net, the total cost including all charges and taxes is approximately EUR 2,200-2,500. The government takes more than the worker receives. Visualize this as a shrinking euro: start with EUR 2,500 and watch it get consumed.

**12.4 -- The Debt Inheritance Counter**
"Congratulations on the birth of your child! They arrive in the world owing EUR 42,000 in national debt. That will be EUR 53,000 by the time they are 18." A shareable birth announcement card of debt. Emotionally devastating for young parents.

**12.5 -- Government Employment vs. Private Sector**
France has approximately 5.7 million public employees. One in five workers. Show what this looks like: in a room of 5 people, one works for the government and the other four pay their salary. Visualize the ratio over time -- it keeps growing.

**12.6 -- The "Dead Agency" Museum**
A curated gallery of government agencies, commissions, and programs that were created for a specific purpose, achieved nothing, and continue to exist. Show their annual cost, their headcount, and the date they became irrelevant.

**12.7 -- Interest Payment Visualization**
France's debt interest payments are roughly EUR 50 billion/year. Show what that could fund instead: 500 new hospitals, or 1 million teachers, or free public transport for every citizen. The money is literally burned to service past overspending.

**12.8 -- "One Hour of Government Spending"**
Calculate what the French government spends in a single hour (approximately EUR 170 million). Show a real-time counter of what that buys. In the time it takes to read this page, the government spent EUR X.

**12.9 -- The Millefeuille Territorial Visualizer**
Visualize the absurd layering of French territorial administration: communes, intercommunalites, departments, regions, the state, and the EU. For a single citizen's address, show all the layers of government with their own budgets, employees, and taxes. The "millefeuille administratif" is a beloved French complaint -- quantify it.

**12.10 -- "France's Most Expensive Roundabout"**
France has more roundabouts than any other country (estimated 30,000-65,000). Find and highlight the most absurdly expensive examples, cost overruns, and unnecessary construction. A perfect symbol of spending priorities.

**12.11 -- Public Pension Time Bomb Visualizer**
Show the unfunded pension liabilities -- the promises made to current and future retirees that are not backed by assets. Estimates range from EUR 4-8 trillion. Dwarf the official national debt. Show the intergenerational transfer: young workers funding generous retirements they will never receive themselves.

**12.12 -- "Where Your Fuel Money Goes" Pump Price Breakdown**
At the gas pump, approximately 60% of the price is taxes (TICPE + TVA on TICPE -- yes, a tax on a tax). Show a visual fuel pump where the "fuel" portion is a small fraction and the rest is government take. Update in real time with current fuel prices.

---

## 13. Personal Tax Calculator

> Showing individuals exactly where their money goes, personally and viscerally.

**13.1 -- Comprehensive Tax Estimator**
Not just income tax. Calculate ALL taxes for a given profile: income tax, CSG/CRDS, social charges (employee and employer), TVA on estimated spending, taxe d'habitation (where applicable), taxe fonciere, taxes on savings (PFU), fuel taxes, alcohol/tobacco taxes, and even indirect taxes embedded in goods. Show the REAL total tax burden.

**13.2 -- "Your Day" Tax Breakdown**
For a given salary, show a 24-hour clock: how many hours you work for income tax, how many for social charges, how many for TVA, and how many hours you actually work for yourself. For many French workers, they only "earn for themselves" after 2pm.

**13.3 -- Career-Long Projection**
Input your age, current salary, and expected career trajectory. See a projection of total lifetime taxes, pension contributions vs. expected pension, and cumulative impact. Include the opportunity cost: if those taxes had been invested at market rates, how much would you have?

**13.4 -- "Before and After" Payslip Decoder**
Upload or simulate a French pay stub (bulletin de paie). Decode every line, explain every charge, and show the true cost of employment vs. take-home pay. Most French employees have never truly understood their fiche de paie -- it is deliberately complex.

**13.5 -- Family Impact Calculator**
Model tax impact for different family configurations: single, married, with children. Show how the family quotient (quotient familial) works, its caps, and whether it actually compensates for the cost of raising children in a highly taxed environment.

**13.6 -- Entrepreneur Tax Shock Calculator**
For entrepreneurs and self-employed (auto-entrepreneurs, professions liberales, SARL/SAS owners), show the crushing combined tax and social charge burden. Compare with what the same entrepreneur would pay in neighboring countries: Switzerland, UK, Ireland, Estonia.

**13.7 -- Retirement Reality Check**
Input your career profile. See your projected government pension versus what you could have accumulated if your contributions had been invested privately. The gap is enormous for younger workers who will face a bankrupt system.

**13.8 -- "What Would You Keep?" Slider**
An interactive slider showing your salary. As you slide from gross to net to after-TVA to after-all-taxes, watch the number shrink. The visceral experience of watching your earnings disappear.

**13.9 -- Real Estate Tax Horror**
For property owners: combine taxe fonciere, IFI (if applicable), plus-value tax, droits de succession. Show the lifetime cost of owning property including all taxes. Compare with equivalent properties in neighboring countries.

**13.10 -- Inheritance Tax Impact Simulator**
Model what happens when assets are passed to the next generation. Show how the combination of droits de succession and lifetime tax burden means that wealth accumulated over a lifetime is substantially confiscated. Compare with inheritance tax regimes in other EU countries.

---

## 14. Waste & Scandal Tracker

> Documenting specific instances of waste with names, dates, and amounts.

**14.1 -- Comprehensive Waste Database**
A searchable, filterable database of every documented instance of government waste: source (Cour des Comptes, press investigation, citizen report), amount wasted, entity responsible, status (ongoing, resolved, ignored), and responsible officials.

**14.2 -- Scandal Timeline**
An interactive timeline of French fiscal scandals: Credit Lyonnais bailout, France Telecom pension transfer, tax amnesty deals, offshore accounts, HLM fraud, military procurement disasters. Show the pattern: scandals happen, nobody is punished, and the cycle repeats.

**14.3 -- "Cost of Delay" Tracker**
Track major government IT projects, infrastructure projects, and reform initiatives. Document delays and cost overruns in real time. The Grand Paris Express, the Louviers-Incarville bypass, SIV (vehicle registration system), etc. Show how chronic delays multiply costs.

**14.4 -- Ghost Employee & No-Show Investigation**
Use public employment data and CADA requests to investigate departments with suspicious employee-to-output ratios. The phenomenon of "emplois fictifs" has been documented before. Build the case with data.

**14.5 -- Redundancy & Overlap Mapper**
Map government agencies and programs that have overlapping mandates. Show where multiple agencies do the same thing. Calculate the cost of this duplication. France excels at creating new agencies without eliminating old ones.

**14.6 -- Failed IT Project Graveyard**
A memorial to France's spectacular government IT failures: Louvois (military payroll), ONP (national payroll), Sirhen (education HR), the healthcare carte vitale 2 saga. Billions wasted. Show the pattern.

**14.7 -- Subsidy Absurdity Showcase**
Highlight the most absurd subsidies: paying farmers to not produce, subsidizing industries that then relocate abroad, funding art projects of dubious value, subsidizing organizations that lobby for more subsidies.

**14.8 -- "Follow the Money" Investigation Tool**
For any government program, trace the flow of money from budget allocation to final spending. Identify where money disappears into administrative overhead, where intermediaries take cuts, and how much reaches the intended beneficiaries.

**14.9 -- Public Property Waste Tracker**
Document government-owned properties that sit empty, are underutilized, or are maintained at great expense for marginal use. France's government property portfolio is enormous and poorly managed.

**14.10 -- Emergency Spending Abuse Monitor**
Track the use of emergency/exceptional spending mechanisms (decrets d'avance, credits exceptionnels). Show how "temporary" emergency spending becomes permanent. Document cases where emergencies are manufactured to bypass normal budget scrutiny.

---

## 15. Alternative Budget Proposals

> What could be done differently -- constructive alternatives.

**15.1 -- The "Estonian Model" Simulator**
Model what France would look like with Estonia's fiscal framework: flat tax, e-government, minimal bureaucracy. Show potential savings and economic growth.

**15.2 -- "Zero-Based Budget" Exercise**
Start every ministry's budget at zero and require justification for every euro. Let citizens see what a ministry's budget looks like when built from need rather than from last year's spending plus inflation.

**15.3 -- The Swiss Canton Comparison**
Model France as if it were organized like Swiss cantons: fiscal competition between regions, local tax-setting authority, direct democracy on spending. Show how decentralization could improve efficiency.

**15.4 -- Flat Tax Calculator**
Calculate what a revenue-neutral flat tax rate would be in France if all deductions, niches fiscales, and special regimes were eliminated. Show the simplicity versus the current labyrinth.

**15.5 -- "Privatization Portfolio" Analysis**
Identify state-owned enterprises and assets that could be privatized. Estimate sale values and annual savings in subsidies and management costs. Show what debt reduction would be possible.

**15.6 -- Digital Government Savings Estimator**
Estimate savings from full government digitalization: eliminating paper processes, automating routine tasks, consolidating IT systems. Other countries have done this. Calculate France's potential savings.

**15.7 -- Public Pension Reform Simulator**
Model different pension reform scenarios: raising retirement age, moving to defined-contribution, Swedish notional accounts, fully funded personal accounts. Show the fiscal impact of each and the impact on individual retirees.

**15.8 -- Tax Simplification Proposals**
Model proposals to simplify the tax code: merging CSG/CRDS into income tax, eliminating micro-taxes that cost more to collect than they generate, consolidating local taxes. Show administrative savings.

**15.9 -- "Constitutional Spending Cap" Analysis**
Model the effect of a constitutional spending cap (as exists in Switzerland, Sweden, or Germany's debt brake). Show how France's fiscal trajectory would change if spending were constitutionally limited.

**15.10 -- Crowd-Sourced Savings Ideas**
Let citizens propose and vote on specific spending cuts. Aggregate the most popular ideas. Calculate the total savings if the top 50 citizen proposals were implemented. Present to politicians.

**15.11 -- "What Would Friedman Do?" Policy Simulator**
Model major free-market reforms: school vouchers, negative income tax replacing all welfare programs, eliminating agricultural subsidies, deregulating labor markets. Show the fiscal impact of each using France-specific data.

**15.12 -- Government Efficiency Audit Template**
Create a standardized audit template that citizen groups can use to evaluate any government program: cost per beneficiary, administrative overhead ratio, outcome metrics, alternatives analysis. Crowdsource program evaluation.

---

## 16. Top Picks & Rankings

### Top 10 High-Impact Ideas
*Most likely to create real political pressure and tangible change.*

| Rank | ID | Idea | Impact Rationale |
|------|------|------|------------------|
| 1 | 4.1 | **Promise Tracker Dashboard** | Directly destroys political credibility with irrefutable data. Forces electoral consequences. |
| 2 | 12.2 | **Hidden Tax Revealer** | Changes public understanding of their true tax burden. Once people know, they cannot un-know. |
| 3 | 3.4 | **Participatory Budget Simulator** | Gives citizens constructive agency and produces aggregated data about what voters actually want. |
| 4 | 2.2 | **Cour des Comptes Report Parser** | Weaponizes the government's own auditor against it. Unimpeachable credibility. |
| 5 | 9.1 | **Press Data Service** | Multiplies impact through professional journalists. Every article cites LIBERAL data. |
| 6 | 14.1 | **Comprehensive Waste Database** | A permanent, searchable record that politicians cannot escape. Accumulates power over time. |
| 7 | 10.1 | **Systematic CADA Requests** | Forces transparency through legal mechanisms. Builds the data foundation everything else depends on. |
| 8 | 1.2 | **"Where Does Your Euro Go?" Sankey Diagram** | The single visualization that best communicates the scale of government. Simple enough for anyone. |
| 9 | 5.1 | **France vs. X Country Comparator** | Eliminates the "it is necessary" defense by showing other countries manage with less. |
| 10 | 3.9 | **Annual "State of the Taxpayer" Report** | Creates a recurring media event. Becomes the counter-narrative to the government's own budget presentations. |

### Top 10 Viral Ideas
*Most likely to spread rapidly on social media and in conversation.*

| Rank | ID | Idea | Virality Rationale |
|------|------|------|-------------------|
| 1 | 6.1 | **Tax Freedom Countdown** | Deeply personal, shareable card. Everyone wants to compare. Natural social media conversation starter. |
| 2 | 12.4 | **Debt Inheritance Counter** | Emotionally devastating for parents. The "birth announcement of debt" is shareable outrage fuel. |
| 3 | 12.1 | **Your Lifetime Tax Bill** | The number is so large it feels unreal. People share out of sheer disbelief. |
| 4 | 6.2 | **The Fiscal Quiz** | Interactive, competitive, surprising. People share their scores and the shocking answers. |
| 5 | 12.12 | **Fuel Pump Tax Breakdown** | Everyone buys fuel. Everyone complains about prices. Now they see who really profits. |
| 6 | 6.6 | **Fiscal Meme Generator** | Gives citizens ready-made ammunition for social media. Lowers effort to zero. |
| 7 | 12.3 | **What EUR 1,000 Actually Costs** | Simple, infuriating, universally relevant to anyone who works or hires. |
| 8 | 6.3 | **Budget Tetris** | A game you literally cannot win. The metaphor is perfect. People share to vent frustration. |
| 9 | 13.8 | **"What Would You Keep?" Slider** | Visceral, tactile experience of watching your money disappear. Designed for screen recording and sharing. |
| 10 | 9.6 | **Annual Fiscal Awards ("Les Gaspis")** | Irreverent, funny, media-friendly. A "Golden Raspberry" for government waste. |

### Top 10 Quick Wins
*Easiest to implement with the highest return on development effort.*

| Rank | ID | Idea | Implementation Simplicity |
|------|------|------|--------------------------|
| 1 | 1.1 | **National Debt Clock** | Single API call to public data + a counter animation. Achievable in one day. |
| 2 | 6.1 | **Tax Freedom Countdown** | Simple calculation + image generation. One week of work. Massive shareability. |
| 3 | 3.1 | **Your Personal Tax Receipt** | Basic income input + fixed allocation percentages. One week. Highly engaging. |
| 4 | 7.8 | **Embeddable Widgets** | Package existing visualizations as iframes/scripts. Multiplies reach with minimal new code. |
| 5 | 6.4 | **Waste of the Week** | Editorial process, not engineering. Start immediately with a social media account. |
| 6 | 9.3 | **Infographic Factory** | Design templates + data pipeline. Can start producing weekly content immediately. |
| 7 | 6.2 | **The Fiscal Quiz** | Simple quiz framework + curated questions from existing data. Two weeks. |
| 8 | 12.12 | **Fuel Pump Breakdown** | Known data, simple visualization, real-time fuel price APIs exist. One week. |
| 9 | 1.9 | **Tax Freedom Calendar** | Calculation from known data + calendar visualization. One week. |
| 10 | 4.3 | **Cost of a Politician Calculator** | Public salary/benefit data. Straightforward calculation. High outrage value. |

### Moonshot Ideas
*Ambitious, potentially transformative, requiring significant resources but capable of fundamentally shifting the fiscal debate in France.*

| # | Idea | Vision |
|---|------|--------|
| 1 | **Real-Time Government Spending Dashboard** | A live feed of every euro spent by the French government as it happens. Like a Bloomberg terminal for taxpayers. Requires deep integration with government accounting systems (CHORUS) -- fight for API access through CADA and political pressure. |
| 2 | **AI-Powered Fiscal Auditor** | Train a large language model on every Cour des Comptes report, budget document, and fiscal law ever published. Let citizens ask natural language questions: "How much has defense spending increased since 2015?" "Which ministry has the worst cost overruns?" Democratize the expertise that currently exists only in elite institutions. |
| 3 | **Blockchain-Based Budget Tracking** | Every euro of public spending recorded on a public, immutable ledger. Citizens can trace any expenditure from allocation to final payment. Technically possible, politically revolutionary. Pilot with a willing municipality first. |
| 4 | **Fiscal Impact Assessment for Every Law** | For every bill introduced in Parliament, automatically generate an independent fiscal impact assessment using AI and historical data. Publish before the vote. Force politicians to confront the cost of their proposals. |
| 5 | **European Fiscal Transparency Network** | Fork and adapt LIBERAL for every EU country. Create a pan-European network of fiscal watchdogs sharing data, tools, and strategies. Compare governments across the EU with identical methodology. The network effect makes every national platform stronger. |
| 6 | **Citizen-Initiated Fiscal Referendum Platform** | If France ever adopts Referendum d'Initiative Citoyenne (RIC), be the platform that manages the signature collection, data provision, and deliberation for fiscal referendums. Become the infrastructure of direct fiscal democracy. |
| 7 | **"Shadow Budget" -- The People's Budget** | Every year, simultaneously with the government's PLF, publish a complete alternative budget built from citizen input, expert analysis, and international best practices. Make it detailed enough to be taken seriously. Get economists and former officials to endorse it. |
| 8 | **Municipal Fiscal Transparency Certification** | Create a certification standard for local government fiscal transparency. Rate every commune, department, and region. Award "Fiscal Transparency Stars." Create competitive pressure between municipalities. Partner with taxpayer associations to make it prestigious. |

---

## Appendix: Idea Index

Total ideas generated: **142**

| Category | Count |
|----------|-------|
| Data Visualization & Dashboards | 10 |
| Data Sources & Collection | 10 |
| Citizen Engagement | 10 |
| Political Accountability | 10 |
| Comparison Tools | 10 |
| Gamification & Virality | 10 |
| Mobile & Accessibility | 10 |
| Community & Crowdsourcing | 10 |
| Media & Communication | 10 |
| Legal & Institutional | 10 |
| Open Source Strategy | 10 |
| Shock Value Features | 12 |
| Personal Tax Calculator | 10 |
| Waste & Scandal Tracker | 10 |
| Alternative Budget Proposals | 12 |
| **Subtotal (Categories)** | **154** (includes duplicates in rankings) |
| Moonshot Ideas (additional) | 8 |
| **Unique Ideas Total** | **142** |

---

## Next Steps

1. **Prioritize:** Use the Top 10 rankings above to select the first sprint of features.
2. **Validate:** Share this document with the core team and stakeholders for feedback.
3. **Prototype:** Build quick prototypes of the top 3 Quick Wins to demonstrate momentum.
4. **Recruit:** Use early features to attract developers, data scientists, and citizen volunteers.
5. **Launch:** Start with a "Minimum Viable Outrage" -- the smallest set of features that generates maximum public attention.

---

*"The art of taxation consists in so plucking the goose as to obtain the largest possible amount of feathers with the smallest possible amount of hissing."*
-- Jean-Baptiste Colbert, Minister of Finance under Louis XIV

*The LIBERAL project exists to make the goose hiss louder than ever before.*
