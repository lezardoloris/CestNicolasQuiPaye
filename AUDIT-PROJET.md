# Audit Projet — C'est Nicolas Qui Paye

> Date : 28 février 2026
> Site : https://nicoquipaie.co/
> Scope : Projet complet (hors contribution "Les Chiffres" — voir `AUDIT-LES-CHIFFRES.md`)
> Audits : 12 agents parallèles (a11y, SEO, perf, data, DRY, mobile, navigation, thème, SEO global, architecture, sécurité, site live)

---

## Synthèse

| Catégorie | Critique | Haute | Moyenne | Basse | Total |
|-----------|----------|-------|---------|-------|-------|
| Sécurité & Architecture | 2 | 4 | 5 | 5 | 16 |
| SEO global | 0 | 2 | 8 | 5 | 15 |
| Navigation & UX | 0 | 1 | 7 | 0 | 8 |
| Thème (light mode) | 0 | 1 | 0 | 0 | 1 |
| Site live (frontend) | 0 | 1 | 3 | 2 | 6 |
| **Total** | **2** | **9** | **23** | **12** | **46** |

**Score architecture/sécurité : 7.5/10** (8.5/10 après corrections P0)

---

## 1. SÉCURITÉ & ARCHITECTURE

### Critique (2)

| # | Issue | Fichier(s) | Suggestion |
|---|-------|------------|------------|
| SEC-C1 | **NextAuth en version beta** (`^5.0.0-beta.30`) en production | `package.json` | Mettre à jour vers une version stable. Risque : bugs de sécurité non corrigés. |
| SEC-C2 | **Salt IP hardcodé** : `'nicolas-paye-default-salt'` en fallback | `src/lib/utils/ip-hash.ts:3` | Déplacer en variable d'environnement requise. IPs hashées prédictibles sinon. |

### Haute (4)

| # | Issue | Fichier(s) | Suggestion |
|---|-------|------------|------------|
| SEC-H1 | CSP permissive avec `'unsafe-eval'` et `'unsafe-inline'` | `next.config.ts:8-9` | Remplacer par des hashes/nonces ou supprimer `unsafe-*`. |
| SEC-H2 | Rate-limiting silencieusement désactivé sans Upstash | `src/lib/api/rate-limit.ts:6-10` | Ajouter logs d'avertissement en dev, `validateEnv()` au startup. |
| SEC-H3 | Google OAuth sans validation de l'existence des credentials | `src/lib/auth/index.ts:29-38` | Ajouter `validateEnv()` au startup pour GOOGLE_CLIENT_ID/SECRET. |
| SEC-H4 | Erreur API expose nom d'index PostgreSQL | `src/app/api/submissions/[id]/sources/route.ts:79` | Utiliser un message d'erreur générique. |

### Moyenne (5)

| # | Issue | Fichier(s) | Suggestion |
|---|-------|------------|------------|
| SEC-M1 | Pas de documentation de la stratégie CSRF | Routes POST/PATCH/DELETE | Documenter que NextAuth v5 gère via SameSite cookies. |
| SEC-M2 | `console.error(error)` en production (17 occurrences) | Routes API | Utiliser Pino (déjà installé) en logger structuré. |
| SEC-M3 | Soumissions publiées immédiatement malgré `moderationStatus: 'pending'` | `src/app/api/submissions/route.ts:65,78` | Clarifier l'intent : publier après modération ou afficher avec badge "en attente". |
| SEC-M4 | Suppression de compte immédiate sans délai de grâce (RGPD recommande 30j) | `src/app/api/user/delete/route.ts` | Implémenter `soft_delete_at` avec délai 30 jours. |
| SEC-M5 | Pas de vérification d'existence de soumission avant vote | `src/app/api/submissions/[id]/vote/route.ts:26-47` | Ajouter vérification `EXISTS` avant insertion du vote. |

### Basse (5)

| # | Issue | Fichier(s) | Suggestion |
|---|-------|------------|------------|
| SEC-L1 | `anonymousId` généré avec `Math.random()` (entropie faible) | `src/lib/auth/index.ts:16-19` | Utiliser `crypto.randomUUID()`. |
| SEC-L2 | Pas de rate-limiting sur les profils publics (énumération possible) | `src/app/api/v1/users/[userId]/route.ts` | Ajouter rate-limit bas. |
| SEC-L3 | Pas de validation UUID dans certaines routes | `src/app/api/v1/users/[userId]/submissions/route.ts` | Ajouter validation Zod de l'UUID. |
| SEC-L4 | Regex modération incomplète (petit ensemble de mots) | `src/app/api/submissions/route.ts:43` | Améliorer avec une liste plus complète ou service tiers. |
| SEC-L5 | `.env` ignoré mais pas `.env.production` explicitement | `.gitignore` | Vérifier qu'aucun `.env.production` n'existe en root. |

#### Points positifs sécurité

- Bcrypt avec cost factor 12
- Drizzle ORM (pas de raw SQL / injection impossible)
- HSTS, X-Content-Type-Options, X-Frame-Options, Permissions-Policy
- IPs hashées avec SHA-256 (RGPD)
- Email masqué (`maskEmail()`)
- Rate-limiting par type d'action (Upstash Redis)
- TypeScript strict, pas de `any`

---

## 2. SEO GLOBAL

### Haute (2)

| # | Issue | Fichier(s) | Suggestion |
|---|-------|------------|------------|
| SEO-H1 | **Sitemap manquant** | Projet | Créer `src/app/sitemap.ts` avec toutes les routes publiques. |
| SEO-H2 | **Robots.txt manquant** | Projet | Créer `src/app/robots.ts` : allow `/`, disallow `/admin`, `/profile`, `/login`, `/register`. |

### Moyenne (8)

| # | Issue | Fichier(s) | Suggestion |
|---|-------|------------|------------|
| SEO-M1 | `canonical` manquant sur toutes les pages sauf `/chiffres` | Toutes les pages | Ajouter `alternates.canonical` à chaque page publique. |
| SEO-M2 | Pages admin sans `robots: { index: false }` | `src/app/admin/**` | Exclure explicitement de l'indexation. |
| SEO-M3 | Pages login/register sans description SEO | `src/app/(auth)/**` | Ajouter descriptions. |
| SEO-M4 | `/profile/[userId]` sans OG metadata (profils publics) | `src/app/profile/[userId]/page.tsx` | Ajouter OG avec avatar et stats. |
| SEO-M5 | Viewport incomplet — manque `width`, `initial-scale` | `src/app/layout.tsx` | Compléter le viewport. |
| SEO-M6 | Pas de JSON-LD structured data (WebSite, BreadcrumbList, Article) | Projet | Ajouter JSON-LD dans layout et pages clés. |
| SEO-M7 | Feed pages sans OG image personnalisée | `src/app/feed/[sort]/page.tsx` | Ajouter OG image dynamique ou par défaut. |
| SEO-M8 | Pagination feed sans `rel="next"` / `rel="prev"` | `src/app/feed/[sort]/page.tsx` | Ajouter metadata de pagination. |

### Basse (5)

| # | Issue | Fichier(s) | Suggestion |
|---|-------|------------|------------|
| SEO-L1 | ISR revalidation non documenté (60s/300s/3600s) | Pages dynamiques | Documenter la stratégie dans un ADR. |
| SEO-L2 | OG incomplet sur feed (`og:type`, `og:locale` manquants) | `src/app/feed/[sort]/page.tsx` | Compléter. |
| SEO-L3 | Descriptions meta trop courtes (< 50 chars) sur pages auth/admin | Plusieurs pages | Viser 120-160 caractères. |
| SEO-L4 | Pas de manifest.json (PWA) | Projet | Créer `public/manifest.json`. |
| SEO-L5 | Pas de `hreflang` (préparer i18n future) | Metadata | Ajouter `alternates.languages: { fr: SITE_URL }`. |

---

## 3. NAVIGATION & UX

### Haute (1)

| # | Issue | Fichier(s) | Suggestion |
|---|-------|------------|------------|
| NAV-H1 | **`/chiffres` inaccessible depuis mobile** — MobileTabBar a 4 onglets, pas d'accès | `MobileTabBar.tsx` | Ajouter 5e onglet ou menu hamburger/drawer. |

### Moyenne (7)

| # | Issue | Fichier(s) | Suggestion |
|---|-------|------------|------------|
| NAV-M1 | Méthodologie et Data-Status cachés (Footer seulement) | `DesktopNav.tsx`, `Footer.tsx` | Ajouter dans nav ou dropdown "Ressources". |
| NAV-M2 | Leaderboard sans lien dans la navigation | `DesktopNav.tsx` | Ajouter dans la nav (lien commenté trouvé). |
| NAV-M3 | Lien Footer `/methodology` au lieu de `/methodologie` | `Footer.tsx` | Corriger le lien. |
| NAV-M4 | Pages sans `loading.tsx` (chiffres, methodologie, data-status, leaderboard) | Plusieurs routes | Ajouter skeletons. |
| NAV-M5 | Pages sans `error.tsx` (stats, chiffres, methodologie, data-status) | Plusieurs routes | Ajouter error boundaries. |
| NAV-M6 | Pas de breadcrumbs sur pages détail (`/s/[id]`, `/profile/[userId]`) | Pages détail | Ajouter composant Breadcrumb. |
| NAV-M7 | HeroSection sans CTA vers `/chiffres` ou `/stats` | `HeroSection.tsx` | Ajouter CTA secondaire "Découvrir les chiffres". |

---

## 4. THÈME — Proposition "Mode Jour" (Light Mode)

### Diagnostic

Le site est en **dark mode obligatoire** (`<html className="dark">`). `next-themes` est installé (v0.4.6) mais **non utilisé**. Le design system utilise des CSS variables (`--color-surface-primary`, `--color-text-primary`, etc.) ce qui facilite l'ajout d'un light mode.

### Impact accessibilité seniors

- Le dark mode réduit la lisibilité en plein soleil
- Contraste blanc-sur-noir fatiguant pour les yeux des seniors
- WCAG recommande de proposer les deux thèmes

### Plan technique

| Phase | Tâche | Effort |
|-------|-------|--------|
| 1 | Ajouter light values dans `globals.css` (`:root` = light, `.dark` = dark) | 2h |
| 2 | Intégrer `ThemeProvider` dans `Providers.tsx`, retirer `className="dark"` hardcodé | 1.5h |
| 3 | Créer composant `ThemeToggle` (soleil/lune) dans DesktopNav + MobileHeader | 1.5h |
| 4 | Tester persistence localStorage (next-themes gère automatiquement) | 0.5h |
| 5 | Adapter couleurs charts Recharts (budget-2026.ts + gradients) | 3h |
| 6 | Tests complets dark/light (cross-browser, contraste WCAG) | 3h |
| 7 | OG image light (optionnel) | 1h |
| **Total** | | **~13h** |

### Mapping des tokens

| Token | Dark | Light |
|-------|------|-------|
| `surface-primary` | `#111318` | `#FFFFFF` |
| `surface-secondary` | `#1A1D24` | `#F8F8F8` |
| `surface-elevated` | `#252830` | `#F0F0F0` |
| `text-primary` | `#F5F5F5` | `#1A1A1A` |
| `text-secondary` | `#A3A3A3` | `#5A5A5A` |
| `text-muted` | `#737373` | `#8C8C8C` |
| `border-default` | `#2E3340` | `#E5E5E5` |
| `chainsaw-red` | `#C62828` | `#D32F2F` |
| `chainsaw-red-hover` | `#8E1B1B` | `#B71C1C` |
| `chainsaw-red-light` | `#FECDD3` | `#FFEBEE` |
| `success` | `#22C55E` | `#16A34A` |
| `warning` | `#E8A317` | `#CA8A04` |
| `info` | `#3B82F6` | `#2563EB` |

---

## 5. SITE LIVE — Frontend

### Haute (1)

| # | Issue | Page | Suggestion |
|---|-------|------|------------|
| LIVE-H1 | Footer masqué sur mobile (`hidden md:block`) — pas de footer mobile | `Footer.tsx` | Afficher le footer sur mobile ou déplacer les liens importants. |

### Moyenne (3)

| # | Issue | Page | Suggestion |
|---|-------|------|------------|
| LIVE-M1 | SubmissionCard utilise `<h3>` — saut de heading (pas de `<h2>` dans le feed) | Feed | Ajouter un `<h2>` invisible ou restructurer la hiérarchie. |
| LIVE-M2 | HeroSection texte `text-muted` en 10px — lisibilité faible | Accueil | Augmenter à 12px minimum. |
| LIVE-M3 | Accents manquants dans meta description du Leaderboard | `leaderboard/page.tsx` | Corriger les accents. |

### Basse (2)

| # | Issue | Page | Suggestion |
|---|-------|------|------------|
| LIVE-L1 | Lien Classement commenté dans DesktopNav et MobileTabBar | Nav | Décommenter quand la feature est prête. |
| LIVE-L2 | VoteButtonInline excellent pattern ARIA — documenter comme référence | Composants | Utiliser comme modèle pour les autres composants interactifs. |

---

## Recommandations prioritaires

### P0 — Immédiat (avant production)

1. **Mettre à jour NextAuth** vers version stable (SEC-C1)
2. **Fixer le salt IP_HASH** en variable d'environnement (SEC-C2)
3. **Corriger la CSP** : retirer `'unsafe-eval'` et `'unsafe-inline'` (SEC-H1)

### P1 — Court terme (1-2 sprints)

4. Créer `sitemap.ts` + `robots.ts` (SEO-H1, SEO-H2)
5. Ajouter `/chiffres` dans la navigation mobile (NAV-H1)
6. Ajouter `loading.tsx` et `error.tsx` sur les pages manquantes (NAV-M4, NAV-M5)
7. Ajouter `canonical` sur toutes les pages (SEO-M1)
8. Implémenter le light mode (THÈME)

### P2 — Moyen terme

9. JSON-LD structured data (SEO-M6)
10. Corriger le lien Footer `/methodology` → `/methodologie` (NAV-M3)
11. Logger structuré Pino partout (SEC-M2)
12. Soft-delete 30 jours pour suppression de compte (SEC-M4)
13. Breadcrumbs sur pages détail (NAV-M6)
