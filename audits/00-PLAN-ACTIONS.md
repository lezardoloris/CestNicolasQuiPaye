# Plan d'Actions Priorisé — C'est Nicolas Qui Paie

> Issu de l'audit consolidé du 2 mars 2026 (12 audits, ~373 findings)

---

## Phase 1 — Urgences sécurité & data (Semaine 1)

**Objectif** : éliminer les risques de crash, fuite de données et corruption.

| # | Action | Effort | Impact | Audits |
|---|--------|--------|--------|--------|
| 1.1 | **Échapper les wildcards ilike** dans `public-submissions.ts` : remplacer `%` et `_` dans la query utilisateur | 15 min | CRITIQUE — empêche DoS et énumération | 01 |
| 1.2 | **Ajouter indexes sur `submissions`** : index composite sur `(status, moderationStatus, hotScore)`, `(status, moderationStatus, createdAt)`, `(status, moderationStatus, score)` | 30 min | CRITIQUE — élimine les full table scans sur la page la plus visitée | 08, 02 |
| 1.3 | **Wrapper les 5 vote endpoints dans `db.transaction()`** : comments, solutions, notes, sources, community validations | 2h | CRITIQUE — empêche le counter drift | 08, 07 |
| 1.4 | **Wrapper `request.json()` dans try/catch** sur les 17 routes identifiées | 1h | CRITIQUE — empêche les crashes sur body malformé | 07 |
| 1.5 | **Corriger `generateAnonymousId()`** : utiliser une séquence PostgreSQL ou `SELECT FOR UPDATE` | 30 min | CRITIQUE — empêche les doublons d'ID | 08 |
| 1.6 | **Supprimer le salt IP hardcodé** : rendre `IP_HASH_SALT` obligatoire avec validation au démarrage | 15 min | HIGH — conformité RGPD | 01 |
| 1.7 | **Activer un rate limiter en mémoire** quand Redis n'est pas configuré (au lieu de désactiver silencieusement) | 1h | HIGH — protection contre les abus | 01 |
| 1.8 | **Renforcer le CSP** : remplacer `unsafe-inline`/`unsafe-eval` par des nonces ou hashes | 2h | HIGH — protection XSS | 01 |

**Sous-total Phase 1 : ~8h**

---

## Phase 2 — Performance & SEO (Semaine 2)

**Objectif** : améliorer les Core Web Vitals et la découvrabilité.

| # | Action | Effort | Impact | Audits |
|---|--------|--------|--------|--------|
| 2.1 | **Dynamic import Recharts** sur `/stats` et `/simulateur` (comme `/chiffres` le fait déjà) | 30 min | HIGH — -500 KB bundle sur 2 pages | 02 |
| 2.2 | **Corriger le N+1 comments** : JOINer les replies au lieu de boucler | 1h | HIGH — 42→2 queries par page | 02, 08 |
| 2.3 | **Créer `sitemap.ts`** avec génération dynamique des `/s/[id]` | 1h | CRITIQUE SEO — pages indexées | 04 |
| 2.4 | **Créer `robots.ts`** : bloquer `/admin`, `/api`, `/profile/settings` | 30 min | CRITIQUE SEO — protection admin | 04 |
| 2.5 | **Ajouter `og-default.png`** dans `public/` (référencé par layout.tsx mais absent) | 30 min | CRITIQUE SEO — social sharing cassé | 04 |
| 2.6 | **Ajouter `React.memo`** sur `SubmissionCard` pour éviter les re-renders au scroll infini | 30 min | HIGH — perf du feed | 02 |
| 2.7 | **Ajouter `React.cache()`** sur `getSubmissionById` (appelé 2× par page) | 15 min | HIGH — élimine la double requête | 02 |
| 2.8 | **Remplacer les 6 subqueries corrélées** du feed par des JOINs ou CTEs | 2h | HIGH — perf feed | 02, 08 |

**Sous-total Phase 2 : ~7h**

---

## Phase 3 — Accessibilité & CSS (Semaine 3)

**Objectif** : atteindre WCAG 2.2 AA sur les parcours critiques.

| # | Action | Effort | Impact | Audits |
|---|--------|--------|--------|--------|
| 3.1 | **Augmenter le contraste de `text-text-muted`** : passer de `#94A3B8` à `#64748B` en light mode | 15 min | CRITIQUE A11Y — ratio 4.6:1 ≥ AA | 03, 09 |
| 3.2 | **Définir le token `drapeau-rouge`** ou migrer les 11 fichiers vers `chainsaw-red` | 1h | CRITIQUE CSS — styles silencieusement cassés | 09 |
| 3.3 | **Ajouter `prefers-reduced-motion`** aux animations Framer Motion (JS) | 30 min | CRITIQUE A11Y — WCAG 2.3.3 | 03 |
| 3.4 | **Corriger le keyboard trap** dans `WelcomeDisplayNameModal` (Escape bloqué) | 30 min | CRITIQUE A11Y — WCAG 2.1.2 | 03 |
| 3.5 | **Supprimer `overflow-x: hidden`** sur `<html>` (empêche le zoom) | 15 min | CRITIQUE A11Y — WCAG 1.4.10 | 03 |
| 3.6 | **Ajouter `error.tsx`** aux 25 routes qui en manquent | 2h | HIGH — UX d'erreur | 06 |
| 3.7 | **Ajouter `loading.tsx`** aux routes principales manquantes | 1h | HIGH — UX de chargement | 06 |
| 3.8 | **Ajouter `<main>` + `aria-label`** aux 8 pages sans landmark | 1h | HIGH A11Y | 03 |
| 3.9 | **Ajouter dark-mode overrides** pour `success`, `warning`, `info` tokens | 30 min | HIGH CSS | 09 |

**Sous-total Phase 3 : ~7h**

---

## Phase 4 — TypeScript & Code quality (Semaine 4)

**Objectif** : renforcer la qualité et la maintenabilité du code.

| # | Action | Effort | Impact | Audits |
|---|--------|--------|--------|--------|
| 4.1 | **Supprimer les 2 `any`** : typer `FeedResponse<T>` et `useXpResponse` | 30 min | CRITIQUE TS — propagation any | 05 |
| 4.2 | **Typer les 6 colonnes `jsonb()`** avec `.$type<T>()` dans le schema | 1h | HIGH TS — élimine les `as` assertions | 05 |
| 4.3 | **Migrer les 6 composants `useEffect`-fetch** vers React Query | 3h | HIGH React — cache, retry, loading states | 06 |
| 4.4 | **Découper les 14 composants > 200 lignes** | 4h | HIGH DRY — maintenabilité | 12 |
| 4.5 | **Découper les 5 routes API > 130 lignes** (extraire la logique métier vers `src/lib/api/`) | 2h | HIGH API — séparation des responsabilités | 07, 12 |
| 4.6 | **Logger les 63 `catch {}` vides** (au minimum `console.error`) | 1h | HIGH — erreurs invisibles | 05, 12 |
| 4.7 | **Remplacer les 47 imports relatifs** par `@/` | 30 min | MEDIUM — cohérence | 12 |
| 4.8 | **Supprimer les dépendances inutilisées** : `@auth/drizzle-adapter`, `pino`, `pino-pretty`, `@tanstack/react-query-devtools` | 15 min | MEDIUM — bundle + maintenance | 11 |
| 4.9 | **Ajouter `updatedAt` auto-update** via un trigger SQL ou un helper Drizzle | 1h | CRITIQUE DB — timestamps corrects | 08 |

**Sous-total Phase 4 : ~13h**

---

## Phase 5 — Tests (continu)

**Objectif** : passer de 2% à 60%+ de couverture.

| # | Action | Effort | Tests | Statut |
|---|--------|--------|-------|--------|
| 5.1 | ~~**Tests utilitaires purs** : format, hot-score, cost-calculator, sanitize, validation, karma, ip-hash, share~~ | ~~5h~~ | 371 | **FAIT** |
| 5.2 | ~~**Tests du schema de validation Zod** (16 schemas)~~ — inclus dans 5.1 (validation.test.ts, 118 tests) | ~~2h~~ | — | **FAIT** |
| 5.3 | ~~**Tests hooks** : useVote, useComments, useInfiniteScroll, useAuth, useCriteriaVote, useShare, useXpResponse~~ | ~~3h~~ | 76 | **FAIT** |
| 5.4 | ~~**Tests API routes critiques** : submissions, vote, comments, criteria-vote~~ | ~~4h~~ | 62 | **FAIT** |
| 5.5 | ~~**Tests composants clés** : VoteButton, SubmissionCard, Abbr, SimulatorSummaryKpi, SalaryInput~~ | ~~4h~~ | 73 | **FAIT** |
| 5.6 | **Config Playwright + smoke tests E2E** : feed, submit, vote, login | 4h | ~15 | À faire |
| 5.7 | ~~**Ajouter coverage Vitest** dans CI~~ — config v8 + reporters (text, lcov) ajoutée | ~~1h~~ | — | **FAIT** |

**Bilan Phase 5 : 575 tests / 25 fichiers — utils à 94%+ coverage**
**Restant : E2E Playwright (~4h)**

---

## Résumé effort total

| Phase | Thème | Effort estimé | Findings résolus | Statut |
|-------|-------|---------------|-----------------|--------|
| 1 | Sécurité & data | ~8h | ~15 CRIT+HIGH | À faire |
| 2 | Performance & SEO | ~7h | ~12 CRIT+HIGH | À faire |
| 3 | Accessibilité & CSS | ~7h | ~15 CRIT+HIGH | À faire |
| 4 | TypeScript & code quality | ~13h | ~25 HIGH+MED | À faire |
| 5 | Tests | ~~23h~~ **4h restant** | 575 tests écrits | **95% fait** |
| **Total** | | **~39h restant** | **~67 findings** | |

---

## Quick wins (< 30 min chacun, fort impact)

1. Échapper les wildcards ilike (15 min) → élimine 1 CRITICAL sécurité
2. Ajouter 3 indexes sur submissions (30 min) → élimine les scans séquentiels
3. Créer robots.ts (15 min) → protège les pages admin
4. Définir le token `drapeau-rouge` (15 min) → répare 11 fichiers cassés silencieusement
5. Supprimer `overflow-x: hidden` sur html (5 min) → fix zoom a11y
6. Ajouter `og-default.png` (15 min) → répare le social sharing
7. Supprimer les 3 deps inutilisées (15 min) → nettoyage bundle
