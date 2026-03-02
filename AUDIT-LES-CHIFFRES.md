# Audit — Contribution « Les Chiffres » (`/chiffres`)

> Date : 28 février 2026
> Scope : 18 composants budget, 1 fichier data, 1 page, 2 navs, 1 OG image
> Audits : 2 passes — initiale (10 agents) + approfondissement (12 agents)

---

## Synthèse

### Audit initial (30 issues)

| Sévérité | Total | Corrigés | Restants |
|----------|-------|----------|----------|
| CRITIQUE | 3 | 3 | 0 |
| HAUTE | 7 | 7 | 0 |
| MOYENNE | 12 | 12 | 0 |
| BASSE | 8 | 1 | 7 |
| **Total** | **30** | **23** | **7** |

### Audit approfondi multi-agents (41 observations)

| Sévérité | Total | Corrigés | Résolus indirectement | Restants |
|----------|-------|----------|-----------------------|----------|
| HAUTE | 8 | 5 | 1 | 2 |
| MOYENNE | 17 | 0 | 2 | 15 |
| BASSE | 16 | 0 | 0 | 16 |
| **Total** | **41** | **5** | **3** | **33** |

### Enrichissements livrés (hors audits)

Section UE, badges fraîcheur, image OG dynamique, print CSS, renommage route `/chiffres`, suppression "LFI", composant `BudgetKpiCard` partagé, canonical URL.

---

## Audit initial — Corrections livrées

### Critiques (3/3 ✅)

| # | Issue | Action | Fichier |
|---|-------|--------|---------|
| C1 ✅ | Incohérence déficit -133 477 vs -134 627 M€ | Commentaire ajouté : écart = comptes spéciaux du Trésor | `les-chiffres/data.ts:674-675` |
| C2 ✅ | BudgetNav sticky `top-16` incorrect sur mobile | Changé en `top-12 md:top-16` | `BudgetNav.tsx:59` |
| C3 ✅ | `scrollIntoView` masqué par sticky bars | Ajouté `scroll-padding-top: 7.5rem` sur html | `globals.css:140` |

### Hautes (7/7 ✅)

| # | Issue | Action | Fichier |
|---|-------|--------|---------|
| H1 ✅ | Charts sans alternative accessible | Ajouté `role="img"` + `aria-label` descriptif sur 9 charts | Tous les composants chart |
| H2 ✅ | BudgetNav dropdown sans ARIA | Ajouté `aria-expanded`, `aria-haspopup`, `role="menu/menuitem"`, Escape handler | `BudgetNav.tsx` |
| H5 ✅ | Recharts eager-loaded (~1 MB JS) | Lazy-load via `next/dynamic({ ssr: false })` dans `BudgetDynamicCharts.tsx` | `BudgetDynamicCharts.tsx` |
| H6 ✅ | Tooltip contentStyle dupliqué 8x | Extrait dans fichier partagé | `chart-styles.ts` |
| H7 ✅ | KPI card markup dupliqué dans 7 composants | Composant `BudgetKpiCard` partagé, refactorisé dans 7 fichiers | `BudgetKpiCard.tsx` |
| H8 ✅ | `.toFixed()` → séparateur décimal anglais | Remplacé par `Intl.NumberFormat('fr-FR')` (6 occurrences) | 4 composants |
| M11 ✅ | Touch targets BudgetNav < 48px | `py-3` items, `size-12` bouton retour | `BudgetNav.tsx` |

### Moyennes (12/12 ✅)

| # | Issue | Action | Fichier |
|---|-------|--------|---------|
| M2 ✅ | IR 90 vs 92 Md€ sans explication | Commentaire ajouté : 90 Md€ net État, 92 Md€ brut DGFiP | `les-chiffres/data.ts:170-172` |
| M3 ✅ | Opérateurs 434 vs 431 | Harmonisé sur 431 dans PUBLIC_SALARIES | `les-chiffres/data.ts:336` |
| M5 ✅ | `<th>` sans `scope="col"` | Ajouté sur les 4 tables | 4 composants table |
| M6 ✅ | Chart headings `<h2>` → `<h3>` | Corrigé dans 4 composants | 4 composants chart |
| M7 ✅ | Icons BudgetNav sans `aria-hidden` | Ajouté `aria-hidden="true"` | `BudgetNav.tsx:70,102` |
| M8 ✅ | Pas de `useMemo` sur transformations data | Ajouté `useMemo` dans 7 composants chart | 7 composants |
| M9 ✅ | 8 composants pure-display marqués `'use client'` | Retiré `'use client'` de 7 composants statiques + `BudgetPageClient` converti en Server Component. Dynamic imports isolés dans `BudgetDynamicCharts.tsx` (client) | 9 fichiers |
| M10 ✅ | Tables `overflow-hidden` → `overflow-x-auto` | Corrigé sur 4 wrappers | 4 composants table |
| M12 ✅ | ETP vs ETPT incohérence | Harmonisé sur ETP | `AgenciesSection.tsx:37,136` |
| M14 ✅ | `NicolasQuiPaie` incohérence marque | Remplacé par "vos impôts" | `AssociationsSection.tsx` |
| M15 ✅ | `key={index}` → `key={item.name}` | Corrigé sur 5 Cell maps | 5 composants chart |
| M16 ✅ | `labelStyle` manquant sur 2 tooltips | Ajouté | `SocialSpendingSection.tsx` |

### Basses — restantes (7/8)

| # | Statut | Issue | Fichier(s) |
|---|--------|-------|------------|
| L1 | ⬚ | `<h1>` "Les chiffres" trop générique pour le SEO | `BudgetPageClient.tsx` |
| L3 | ⬚ | `text-[10px]` < 12px minimum | `DebtPerCapitaCards.tsx`, `BudgetKpiCard.tsx` |
| L5 | ⬚ | Axis tick config dupliqué 14 fois | 6 fichiers charts |
| L6 | ⬚ | Magic numbers (BILLION, chart heights) | 8 fichiers |
| L7 | ⬚ | `maxWidth` tooltip mobile incohérent (200 vs 220px) | `MissionBarChart`, `PublicSpendingChart` |
| L8 | ✅ | DebtPerCapitaCards grid sans breakpoint `md:` intermédiaire | Résolu par R2 |
| L9 | ⬚ | `fontWeight: 600` unique sur labelStyle RevenueBreakdownChart | `RevenueBreakdownChart.tsx` |
| L10 | ⬚ | Sources section "Sources et méthodologie" est un `<p>` pas un heading | `BudgetSourcesSection.tsx` |

Note : L2 (année 2026 dans l'URL) résolu — route renommée `/chiffres`.
Note : L4 (`Record<string, string>`) résolu — refactorisé avec `BudgetKpiCard`.

---

## Audit multi-agents approfondi (28/02/2026)

> 12 agents parallèles : a11y, SEO, perf, data, DRY, mobile, navigation, thème, SEO global, architecture, sécurité, site live

### Accessibilité

| # | Statut | Sévérité | Issue | Fichier(s) |
|---|--------|----------|-------|------------|
| A1 | ✅ | HAUTE | Tables manquent `scope="row"` + `<caption>` sr-only | `scope="row"` + `<caption className="sr-only">` ajoutés sur 5 tables |
| A2 | ⬚ | HAUTE | Navigation clavier BudgetNav incomplète (Arrow Up/Down, `aria-selected`) | `BudgetNav.tsx` |
| A3 | ⬚ | MOYENNE | Légendes de charts (color swatches) sans `aria-label` | `RevenueBreakdownChart`, `SocialSpendingSection`, `DebtProjectionChart` |
| A4 | ⬚ | MOYENNE | KPI Cards sans structure sémantique (`<dl>/<dt>/<dd>` ou `role="region"`) | `BudgetKpiCard.tsx` |
| A5 | ⬚ | MOYENNE | Charts complexes sans `aria-describedby` + transcription sr-only | Tous les charts |
| A6 | ⬚ | MOYENNE | Callouts/info boxes sans `role="region"` ou `aria-label` | `BudgetPageClient`, `SocialSpendingSection`, `SocialFraudSection` |
| A7 | ⬚ | BASSE | Éléments masqués sur mobile (`hidden sm:table-cell`) restent dans le DOM | 5 fichiers tables |
| A8 | ⬚ | BASSE | Liens en tables sans contexte (acronymes seuls) | `AssociationsSection`, `AgenciesSection` |

### SEO

| # | Statut | Sévérité | Issue | Fichier(s) |
|---|--------|----------|-------|------------|
| S1 | ⬚ | HAUTE | Pas de JSON-LD structured data (Schema.org `Dataset`) | `page.tsx` |
| S2 | ⬚ | MOYENNE | Description meta dense (147 chars) — pourrait être plus lisible | `page.tsx` |
| S3 | ⬚ | BASSE | Pas de `robots: 'index, follow'` explicite | `page.tsx` |
| S4 | ⬚ | BASSE | Twitter card manque `image` explicite | `page.tsx` |

### Performance

| # | Statut | Sévérité | Issue | Fichier(s) |
|---|--------|----------|-------|------------|
| P1 | ⬚ | HAUTE | `useIsMobile()` cause hydration mismatch — flash/re-layout sur mobile | 7 composants chart |
| P2 | ✅ | MOYENNE | 8 composants `'use client'` pourraient être Server Components | Résolu par M9 — 7 composants convertis en Server Components |
| P3 | ✅ | MOYENNE | `useMemo` manquant dans DeficitCounter et BudgetKpiCards | Résolu par M9 — ces composants sont maintenant des Server Components (pas de re-render) |
| P4 | ⬚ | BASSE | EUComparisonSection : 2 `useMemo` quasi-identiques — extraire helper | `EUComparisonSection.tsx` |
| P5 | ✅ | BASSE | SocialFraudSection recalcule totaux à chaque render sans `useMemo` | Résolu par M9 — Server Component (pas de re-render) |

### Données

| # | Statut | Sévérité | Issue | Fichier(s) |
|---|--------|----------|-------|------------|
| D1 | ✅ | HAUTE | Double-décompte Santé COFOG vs DCSi non documenté | Commentaire ajouté dans `les-chiffres/data.ts` |
| D2 | ⬚ | MOYENNE | "Autres missions" = 27 159 M€ (25%) opaque — sans source | `les-chiffres/data.ts:165` |
| D3 | ⬚ | MOYENNE | Déciles IR somme = 91.8 vs incomeTaxTotal = 92 Md€ (écart arrondi) | `les-chiffres/data.ts` |
| D4 | ⬚ | MOYENNE | TOP_STATE_AGENCIES = 20 items sur 431 — clarifier | `les-chiffres/data.ts` |
| D5 | ⬚ | BASSE | Emoji flags dans EU_COMPARISON — risque encoding | `les-chiffres/data.ts` |

### DRY & Code Quality

| # | Statut | Sévérité | Issue | Fichier(s) |
|---|--------|----------|-------|------------|
| Q1 | ✅ | HAUTE | `Intl.NumberFormat` créé 3x identiquement | Extrait `fmtDecimal1` + `formatPctFr()` dans `format.ts` |
| Q2 | ⬚ | MOYENNE | Conversion `* 1_000_000` / `* 1_000_000_000` répétée 20+ fois | 8 fichiers |
| Q3 | ⬚ | MOYENNE | EUComparisonSection > 200 lignes — scinder en sous-composants | `EUComparisonSection.tsx` (254 lignes) |
| Q4 | ⬚ | MOYENNE | BudgetPageClient > 200 lignes | `BudgetPageClient.tsx` (283 lignes) |
| Q5 | ⬚ | BASSE | `useIsMobile()` importé 9x — pourrait être passé en prop | 9 fichiers |
| Q6 | ⬚ | BASSE | Labels charts hardcodés ('Crédits', 'Dépenses', 'Montant') | 4 fichiers |

### Mobile & Responsive

| # | Statut | Sévérité | Issue | Fichier(s) |
|---|--------|----------|-------|------------|
| R1 | ✅ | HAUTE | Recharts fontSize 9px sur mobile (Y-axis) | Changé `9 → 10` dans 6 occurrences (5 fichiers) |
| R2 | ✅ | HAUTE | Grilles KPI : saut grid-cols-2 → sm:grid-cols-4 sans breakpoint md | Ajouté `md:grid-cols-3` sur `DebtPerCapitaCards`, `IncomeTaxSection` |
| R3 | ⬚ | MOYENNE | Tooltip maxWidth mobile incohérent (200 vs 220px) | `MissionBarChart`, `PublicSpendingChart` |
| R4 | ⬚ | BASSE | Gap/padding uniform p-4 — considérer p-3 sur mobile | Tous les KPI cards |
| R5 | ⬚ | BASSE | DebtProjectionChart tick interval `isMobile ? 2 : 1` — breakpoint tablette | `DebtProjectionChart.tsx` |

---

## Enrichissements livrés

| Feature | Description | Fichier(s) |
|---------|-------------|------------|
| Section UE | Comparaison dette/déficit/dépenses FR vs 7 pays UE + critères Maastricht | `EUComparisonSection.tsx`, `les-chiffres/data.ts` |
| Badges fraîcheur | "Données à jour au 28 février 2026" + "Loi de Finances 2026 — Vote définitif" | `BudgetPageClient.tsx:50-58` |
| Image OG dynamique | 1200x630, 3 KPI (déficit, dette, dette/hab), edge runtime | `opengraph-image.tsx` |
| Print CSS | `@media print` : masque nav/sticky, adapte couleurs | `globals.css:191-229` |
| Route `/chiffres` | Renommage depuis `/budget-2026`, toutes URLs mises à jour | `page.tsx`, `DesktopNav.tsx` |
| Suppression "LFI" | Remplacé par "Loi de Finances (Initiale)" partout | `BudgetPageClient.tsx`, `les-chiffres/data.ts` |
| Source Eurostat | Lien ajouté dans la section sources | `BudgetSourcesSection.tsx` |
| Nav UE | Entrée "France & UE" dans BudgetNav | `BudgetNav.tsx` |
| Composant BudgetKpiCard | KPI card partagé utilisé dans 7 composants (DRY) | `BudgetKpiCard.tsx` |
| Canonical URL | `alternates.canonical` sur `/chiffres` | `page.tsx:13-15` |
| OG metadata | Metadata OG complète + image dynamique | `page.tsx`, `opengraph-image.tsx` |
| Server Components | 7 composants statiques + orchestrateur convertis de Client → Server Components | 9 fichiers |

---

## Sécurité — AUCUN PROBLÈME

- Tous les liens externes ont `target="_blank" rel="noopener noreferrer"`
- Aucun input utilisateur, aucune injection possible
- Toutes les URLs sont hardcodées et HTTPS
- Pas de données sensibles exposées
- React échappe automatiquement tout le contenu JSX

---

## Sources documentaires

### Document principal
**« Le budget de l'État voté pour 2026 — en quelques chiffres (loi de finances initiale) »**
- Éditeur : Direction du Budget, Gouvernement français
- URL : https://www.budget.gouv.fr/
- Fichier local : `documents_officiels/Chiffres-cles-LFI 2026-vdef.pdf`
- Date : Février 2026 (8 pages)
- Contenu : Recettes (art. 147), équilibre budgétaire, crédits par mission (art. 148-150), plafonds d'emplois (art. 153)
- Chiffres clés utilisés : recettes nettes 325 382 M€, dépenses nettes 458 859 M€, solde budget général -133 477 M€, solde total -134 627 M€, 2 016 588 ETPT, 31 missions budgétaires

### Autres sources
- INSEE — Première n°2093 (COFOG 2024) : dépenses publiques par fonction
- DGFiP — Statistiques n°41 (nov. 2025) : impôt sur le revenu par décile
- DREES — Comptes de la santé 2024 (DCSi) : dépenses de santé
- Eurostat — Government finance statistics (2024) : comparaison UE
- Cour des comptes — Sécurité sociale 2025 : fraude et déficit
- Sénat, IFRAP, FIPECO, HCFiPS : analyses et rapports sectoriels

---

## Note pour le responsable du repo

> Le répertoire `documents_officiels/` contient le PDF source officiel de budget.gouv.fr utilisé pour la page "Les Chiffres". Les données ayant été intégrées dans `src/lib/constants/budget-2026.ts`, **ce répertoire peut être supprimé** du repo pour réduire la taille du dépôt. Les sources sont désormais documentées dans cette section.
