# Audit Consolidé — C'est Nicolas Qui Paie

> **Date** : 2 mars 2026
> **Branche** : `feat/simulateur` (rebasé sur `upstream/master` @ `a4b8265`)
> **Auditeur** : Claude Opus 4.6 (analyse statique automatisée, 12 agents parallèles)

---

## Vue d'ensemble

| # | Domaine | Fichier | CRIT | HIGH | MED | LOW | Total |
|---|---------|---------|------|------|-----|-----|-------|
| 01 | Sécurité (OWASP) | [01-security.md](01-security.md) | 1 | 5 | 8 | 6 | **20** |
| 02 | Performance | [02-performance.md](02-performance.md) | 2 | 5 | 5 | 4 | **16** |
| 03 | Accessibilité (a11y) | [03-accessibility.md](03-accessibility.md) | 4 | 10 | 14 | 6 | **34** |
| 04 | SEO | [04-seo.md](04-seo.md) | 4 | 5 | 6 | 5 | **20** |
| 05 | TypeScript | [05-typescript.md](05-typescript.md) | 2 | 12 | 18 | 11 | **43** |
| 06 | React patterns | [06-react-patterns.md](06-react-patterns.md) | 3 | 10 | 12 | 11 | **40** (est.) |
| 07 | API routes | [07-api-routes.md](07-api-routes.md) | 4 | 11 | 16 | 11 | **42** |
| 08 | Database | [08-database.md](08-database.md) | 5 | 12 | 14 | 8 | **39** |
| 09 | CSS / Styling | [09-css-styling.md](09-css-styling.md) | 4 | 12 | 14 | 8 | **38** |
| 10 | Testing | [10-testing.md](10-testing.md) | 3 | 5 | 5 | 4 | **17** (est.) |
| 11 | Dépendances | [11-dependencies.md](11-dependencies.md) | 0 | 3 | 4 | 5 | **12** |
| 12 | Code quality / DRY | [12-code-quality.md](12-code-quality.md) | 3 | 17 | 22 | 10 | **52** |
| | **TOTAL** | | **35** | **107** | **138** | **89** | **~373** |

**Couverture de tests actuelle : 575 tests / 25 fichiers** (mis à jour le 2 mars 2026)

---

## Top 15 — Findings critiques consolidés

### P0 — Blocker (déployer = risque)

| ID | Domaine | Description | Fichier |
|----|---------|-------------|---------|
| SEC-01 | Sécurité | **Injection ilike** : le search API passe le query utilisateur directement dans `ilike('%${q}%')` sans échapper `%` et `_` → DoS + énumération | `src/lib/api/public-submissions.ts:363` |
| DB-01 | Database | **Race condition `generateAnonymousId()`** : lecture + incrément sans lock → doublons possibles en concurrence | `src/lib/db/helpers.ts` |
| DB-03 | Database | **Transactions manquantes** sur 5 endpoints de vote (comment, solution, note, source, validation) → counter drift | `src/app/api/*/route.ts` |
| API-01 | API | **17 routes `request.json()` hors try/catch** → crash non géré sur body malformé | Multiples routes |
| DB-05 | Database | **Aucun index sur `submissions`** pour les 3 tris du feed (hot/new/top) → full table scan | `src/lib/db/schema.ts` |

### P1 — Critique (sprint en cours)

| ID | Domaine | Description | Fichier |
|----|---------|-------------|---------|
| SEC-02 | Sécurité | Rate limiting silencieusement désactivé sans Redis (pas de fallback) | `src/lib/api/rate-limit.ts` |
| SEC-03 | Sécurité | Salt IP hashage en fallback hardcodé → IPs votants réversibles (RGPD) | `src/lib/utils/ip-hash.ts:3` |
| SEC-05 | Sécurité | CSP autorise `unsafe-inline` + `unsafe-eval` → annule la protection XSS | `next.config.ts:8` |
| PERF-01 | Performance | Recharts non-lazy sur `/stats` et `/simulateur` (+500 KB bundle) | `StatsPageClient.tsx`, `SimulatorPageClient.tsx` |
| PERF-02 | Performance | N+1 comments API : 42 requêtes pour 20 commentaires | `src/app/api/submissions/[id]/comments/route.ts` |
| A11Y-13 | Accessibilité | `text-text-muted` (#94A3B8 sur #FFF) → contraste 3.26:1 < 4.5:1 AA | `globals.css` |
| SEO-01 | SEO | Pas de `sitemap.xml` → pages dynamiques `/s/[id]` non découvertes | `src/app/` |
| SEO-02 | SEO | Pas de `robots.txt` → pages admin crawlées | `src/app/` |
| CSS-01 | CSS | Token `drapeau-rouge` utilisé dans 11 fichiers mais jamais défini → styles silencieusement ignorés | Multiples composants |
| DB-02 | Database | `updatedAt` jamais auto-mis à jour en UPDATE (seulement sur INSERT) | `src/lib/db/schema.ts` |

---

## Couverture de tests — État des lieux (mis à jour 2 mars 2026)

| Catégorie | Tests | Fichiers testés | Couverture utils |
|-----------|-------|-----------------|-----------------|
| Utilitaires (`src/lib/utils/`) | 371 | 9 | **94% stmts / 97% branches** |
| Hooks (`src/hooks/`) | 76 | 7 | testés via mocks |
| API routes (`src/app/api/`) | 62 | 4 | testés via mocks |
| Composants (`src/components/`) | 73 | 5 | testés via RTL |
| Stores (`src/stores/`) | — | 0 | 0% |
| E2E (Playwright) | — | 0 | 0% |

**Détail par fichier utilitaire (coverage v8) :**

| Fichier | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| format.ts | 100% | 100% | 100% | 100% |
| validation.ts | 100% | 100% | 100% | 100% |
| cost-calculator.ts | 100% | 97% | 100% | 100% |
| tax-calculator.ts | 100% | 93% | 100% | 100% |
| hot-score.ts | 100% | 100% | 100% | 100% |
| karma.ts | 100% | 100% | 100% | 100% |
| ip-hash.ts | 100% | 100% | 100% | 100% |
| sanitize.ts | 100% | 100% | 100% | 100% |
| share.ts | 100% | 100% | 100% | 100% |

---

## Métriques clés

- **Fichiers > 200 lignes** : 14 composants, 5 API routes, 1 module XP (512 lignes)
- **`any` TypeScript** : 2 usages critiques (FeedResponse, useXpResponse)
- **`useEffect` pour data fetching** : 6 composants (devraient utiliser React Query)
- **Erreurs silencieuses (`catch {}`)** : 63 blocs catch vides
- **Imports relatifs au lieu de `@/`** : 47 occurrences
- **Dépendances inutilisées** : `@auth/drizzle-adapter`, `pino`, `pino-pretty`
