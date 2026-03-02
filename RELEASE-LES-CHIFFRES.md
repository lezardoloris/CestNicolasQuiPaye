# Release Note — « Les Chiffres » (`/chiffres`)

> **Date :** 28 février 2026
> **Auteur :** [@beuzzleklair](https://github.com/beuzzleklair) + Claude
> **Branche :** `feat/les-chiffres`
> **Route :** [`/chiffres`](https://nicoquipaie.co/chiffres)

Que des sources publiques/officielles, made with love and Claude.

---

## Vue d'ensemble

Nouvelle page **« Les Chiffres »** : une visualisation interactive et pédagogique des finances publiques françaises, entièrement basée sur des **sources officielles et publiques**.

9 sections thématiques, 19 composants, 728 lignes de données sourcées, 7 graphiques interactifs Recharts, le tout audité par 12 agents spécialisés (accessibilité, SEO, performance, données, DRY, mobile, navigation, thème, architecture, sécurité).

**Fichiers associés :**
- [`AUDIT-LES-CHIFFRES.md`](AUDIT-LES-CHIFFRES.md) — Audit détaillé (71 issues, 31 corrigées)
- [`AUDIT-PROJET.md`](AUDIT-PROJET.md) — Audit projet global (46 issues)
- [`ROADMAP.md`](ROADMAP.md) — Roadmap priorisée (simulateur, light mode, acronymes, SEO…)

---

## Sections de la page

### 1. Déficit budgétaire (hero)
- Compteur déficit **-134,6 Md€** mis en avant
- 5 KPI cards : recettes, dépenses, déficit, % non financé, déficit/PIB
- Source : Loi de Finances Initiale 2026 (vote définitif)

### 2. Dépenses publiques totales (COFOG)
- Graphique des **1 672 Md€** de dépenses publiques par fonction (INSEE, COFOG 2024)
- Mise en contexte : le budget de l'État (459 Md€) ne représente que 27% du total

### 3. Budget de l'État — Missions et recettes
- **Bar chart horizontal** : 12 missions budgétaires (crédits de paiement), charge de la dette mise en évidence
- **Donut chart** : répartition des recettes fiscales (TVA, IR, IS, TICPE…)
- Source : budget.gouv.fr, PLF 2026

### 4. Protection sociale, santé et fraude
- Dépenses de protection sociale (**693 Md€** COFOG) et santé (**333 Md€** DCSi)
- Graphiques par poste (retraites, maladie, famille, chômage, invalidité)
- **Fraude sociale** : tableau estimée vs détectée par domaine, taux de détection
- Mise en perspective : la fraude estimée (~26 Md€) couvre le déficit de la Sécu (15,3 Md€)
- Sources : DREES, Cour des comptes, HCFiPS

### 5. Prospective : la dette publique
- **4 KPI cards** : dette/habitant (50 900€), dette/contribuable IR (177 700€), intérêts/habitant/an, émissions 2026 (record)
- **Area chart** : évolution de la dette 2017-2036, zone historique vs projections
- Critère de Maastricht (60%) en référence
- Sources : INSEE, programme de stabilité

### 6. Impôt sur le revenu
- Répartition par décile de revenu : qui paye l'IR et combien
- Graphiques bar + donut, KPI concentration (top 10% payent 72%)
- Source : DGFiP — Statistiques n°41 (nov. 2025)

### 7. Rémunérations publiques
- Tables comparatives : élus, dirigeants d'entreprises publiques, hauts fonctionnaires, directeurs d'agences
- Colonne « x SMIC » pour la mise en perspective
- Sources : Sénat, Assemblée nationale, rapports annuels

### 8. Associations subventionnées
- Top des associations les plus subventionnées par l'État
- Opacité des rémunérations des dirigeants (IGAS : 44% ne publient pas leurs comptes)
- Sources : Contribuables Associés (2018), IFRAP, IGAS

### 9. La France et l'UE
- Comparaison dette/déficit/dépenses publiques France vs 7 pays UE
- 2 bar charts horizontaux + table complète
- Critères de Maastricht (60% dette, 3% déficit) en référence
- Encart : la France dépasse les deux critères
- Source : Eurostat — Government finance statistics (2024)

---

## Architecture technique

### Nouveaux fichiers (22 fichiers)

```
src/
├── app/chiffres/
│   ├── page.tsx                          # Server Component (metadata + layout)
│   └── opengraph-image.tsx               # Image OG dynamique 1200x630 (edge runtime)
├── components/features/budget/
│   ├── BudgetPageClient.tsx              # Orchestrateur (Server Component)
│   ├── BudgetDynamicCharts.tsx           # Client islands — dynamic imports Recharts
│   ├── BudgetNav.tsx                     # Navigation sticky avec ancres (client)
│   ├── DeficitCounter.tsx                # Hero compteur déficit (server)
│   ├── BudgetKpiCards.tsx                # 5 KPI cards (server)
│   ├── BudgetKpiCard.tsx                 # Composant KPI card partagé (server)
│   ├── PublicSpendingChart.tsx           # Dépenses publiques COFOG (client)
│   ├── MissionBarChart.tsx               # Missions budgétaires (client)
│   ├── RevenueBreakdownChart.tsx         # Recettes fiscales donut (client)
│   ├── SocialSpendingSection.tsx         # Protection sociale + santé (client)
│   ├── SocialFraudSection.tsx            # Fraude sociale (server)
│   ├── DebtProjectionChart.tsx           # Projection dette (client)
│   ├── DebtPerCapitaCards.tsx            # Dette par habitant (server)
│   ├── IncomeTaxSection.tsx              # IR par décile (client)
│   ├── PublicSalariesSection.tsx         # Rémunérations publiques (server)
│   ├── AssociationsSection.tsx           # Associations (server)
│   ├── AgenciesSection.tsx               # Agences de l'État (server)
│   ├── EUComparisonSection.tsx           # Comparaison UE (client)
│   └── BudgetSourcesSection.tsx          # Sources et méthodologie (server)
├── lib/constants/
│   ├── budget-2026.ts                    # 728 lignes de données sourcées + types
│   └── chart-styles.ts                   # Styles tooltip Recharts partagés
└── lib/utils/
    └── format.ts                         # +fmtDecimal1, +formatPctFr (DRY)
```

### Fichiers modifiés (4 fichiers)

| Fichier | Modification |
|---------|-------------|
| `src/components/layout/DesktopNav.tsx` | Lien "Les chiffres" ajouté dans la navigation |
| `src/components/layout/MobileTabBar.tsx` | Lien "Chiffres" ajouté (5e onglet) |
| `src/app/globals.css` | `scroll-padding-top`, print CSS (`@media print`) |
| `src/lib/utils/format.ts` | `fmtDecimal1` et `formatPctFr()` (formatage FR partagé) |

### Choix techniques

| Aspect | Choix | Justification |
|--------|-------|---------------|
| **Données** | Constantes TypeScript hardcodées | Loi votée = données stables, pas besoin de BDD |
| **Rendering** | Server Components par défaut, client islands pour les charts | 7 composants statiques = 0 JS client, Recharts lazy-loaded (~1 MB) |
| **Lazy loading** | `next/dynamic({ ssr: false })` dans `BudgetDynamicCharts.tsx` | Recharts non SSR-compatible, chargé à la demande |
| **Formatage** | `Intl.NumberFormat('fr-FR')` partagé | Séparateur décimal français, singleton (pas de recréation) |
| **Accessibilité** | `role="img"` + `aria-label` sur charts, `scope` + `caption` sur tables | WCAG 2.1 AA |
| **SEO** | Metadata OG + image dynamique + canonical URL | Partage social optimisé |
| **Mobile** | BudgetNav sticky, grilles responsive avec breakpoints intermédiaires | Lisibilité tablette/mobile |
| **Print** | `@media print` dédié | Usage journalistes/enseignants |

---

## Qualité — Audit multi-agents

Deux passes d'audit (10 + 12 agents spécialisés) ont identifié **71 issues** au total.

| Catégorie | Identifiées | Corrigées | Restantes |
|-----------|-------------|-----------|-----------|
| Critiques | 3 | 3 | 0 |
| Hautes | 15 | 13 | 2 |
| Moyennes | 29 | 14 | 15 |
| Basses | 24 | 1 | 23 |
| **Total** | **71** | **31** | **40** |

Les 2 hautes restantes sont des améliorations structurelles (navigation clavier BudgetNav, JSON-LD Schema.org) planifiées dans la roadmap.

Audit complet : [`AUDIT-LES-CHIFFRES.md`](AUDIT-LES-CHIFFRES.md)

---

## Sources officielles utilisées

| Source | Organisme | Date |
|--------|-----------|------|
| Chiffres-clés LFI 2026 (PDF 8 pages) | Direction du Budget, budget.gouv.fr | Fév. 2026 |
| Première n°2093 — COFOG 2024 | INSEE | 2025 |
| Statistiques n°41 — IR par décile | DGFiP | Nov. 2025 |
| Comptes de la santé 2024 (DCSi) | DREES | 2025 |
| Government finance statistics 2024 | Eurostat | 2025 |
| Rapport Sécurité sociale 2025 | Cour des comptes | 2025 |
| Jaune budgétaire « Opérateurs » | PLF 2026, Sénat | 2026 |
| Analyses sectorielles | IFRAP, FIPECO, HCFiPS, Sénat | 2024-2026 |

Aucune donnée ne provient de sources partisanes. Les analyses (IFRAP, Cour des comptes, Sénat) sont attribuées et sourcées.

---

## Roadmap post-release

| Priorité | Feature | Effort |
|----------|---------|--------|
| HAUTE | Simulateur "Combien Nicolas Paye" (`/simulateur`) | 2-3 jours |
| P1 | SEO : sitemap, canonical, JSON-LD | 1 jour |
| P2 | Light mode (next-themes) | ~13h |
| P2 | Infobulles acronymes (JSON + `<Acronym>`) | ~4,5h |
| P3 | CountUp animation, export PDF, API publique | Variable |

Roadmap complète : [`ROADMAP.md`](ROADMAP.md)

---

## Comment vérifier

```bash
npm run type-check   # ✅ Aucune erreur
npm run build        # ✅ 37/37 pages, /chiffres statique
npm run dev          # → http://localhost:3000/chiffres
```

---

*Que des sources publiques/officielles, made with love and Claude.*
