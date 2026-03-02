# Roadmap — C'est Nicolas Qui Paye

> Dernière mise à jour : 28 février 2026
> Audits : voir `AUDIT-LES-CHIFFRES.md` (contribution) et `AUDIT-PROJET.md` (projet)

---

## -- EN COURS @BEUZZLEKLAIR -- Prochaine feature : Simulateur « Combien Nicolas Paye » 

**Priorité : HAUTE — À développer immédiatement après le push de la feature "Les Chiffres"**

| Aspect | Description |
|--------|-------------|
| **Concept** | L'utilisateur saisit son revenu annuel brut → calcul automatique de sa contribution personnelle : IR, TVA estimée, CSG/CRDS, part de dette par contribuable |
| **Données** | Barèmes IR 2026, taux TVA, taux CSG/CRDS, dette par contribuable (depuis `budget-2026.ts`) |
| **UX** | Slider ou input numérique, résultats en temps réel, répartition visuelle (donut/bar) |
| **Partage** | Bouton "Partager mon résultat" avec image OG dynamique personnalisée |
| **Effort estimé** | 2-3 jours |
| **Route** | `/simulateur` |

---

## P0 — Critique (avant production)

| # | Amélioration | Effort | Source |
|---|-------------|--------|--------|
| P0-1 | **Mettre à jour NextAuth** vers version stable (actuellement beta.30) | 0,5 jour | Audit sécurité |
| P0-2 | **Fixer le salt IP_HASH** en variable d'environnement (hardcodé actuellement) | 0,1 jour | Audit sécurité |
| P0-3 | **Corriger la CSP** : retirer `'unsafe-eval'` et `'unsafe-inline'` | 0,5 jour | Audit sécurité |

---

## P1 — Haute priorité

### SEO & Découvrabilité

| # | Amélioration | Effort |
|---|-------------|--------|
| S1 | Créer `src/app/sitemap.ts` + `src/app/robots.ts` | 0,5 jour |
| S2 | Ajouter `canonical` sur **toutes** les pages (seule `/chiffres` l'a) | 0,5 jour |
| S3 | Ajouter `robots: { index: false }` sur pages admin/profile privée | 0,1 jour |

### Navigation

| # | Amélioration | Effort |
|---|-------------|--------|
| N1 | Rendre `/chiffres` accessible depuis mobile (5e onglet ou menu drawer) | 0,5 jour |
| N2 | Ajouter `loading.tsx` + `error.tsx` sur les pages qui en manquent | 0,5 jour |
| N3 | Corriger lien Footer `/methodology` → `/methodologie` | 0,1 jour |

### Sécurité

| # | Amélioration | Effort |
|---|-------------|--------|
| SEC1 | Ajouter `validateEnv()` au startup (Google OAuth, Upstash, etc.) | 0,25 jour |
| SEC2 | Logger structuré Pino partout (remplacer 17 `console.error`) | 0,5 jour |

### Qualité éditoriale

| # | Amélioration | Effort |
|---|-------------|--------|
| E1 | IFRAP sur-représenté — ajouter note méthodologique + sources alternatives (OFCE, IPP) | 0,5 jour |

---

## P2 — Moyenne priorité

### Thème « Mode Jour » (Light Mode)

**Pour les seniors et l'usage en plein soleil — `next-themes` déjà installé mais non utilisé.**

| Phase | Tâche | Effort |
|-------|-------|--------|
| 1 | Ajouter light values dans `globals.css` (`:root` = light, `.dark` = dark) | 2h |
| 2 | Intégrer `ThemeProvider` dans `Providers.tsx`, retirer `className="dark"` | 1.5h |
| 3 | Créer `ThemeToggle` (soleil/lune) dans DesktopNav + MobileHeader | 1.5h |
| 4 | Adapter couleurs charts Recharts (budget-2026.ts + gradients) | 3h |
| 5 | Tests complets dark/light (cross-browser, contraste WCAG AAA) | 3h |
| **Total** | | **~13h** |

Mapping complet des tokens : voir `AUDIT-PROJET.md` section 4.

### Infobulles sur acronymes (i18n + dictionnaire JSON)

**~15 acronymes non développés dans le site (COFOG, DCSi, PLF, PLFSS, ETPT, IR, IS, TICPE, CSG, CRDS, ACOSS, IGAS, IFRAP, ANSES, HAS, etc.)**

| Phase | Tâche | Effort |
|-------|-------|--------|
| 1 | Créer `src/lib/constants/acronyms.json` — dictionnaire `{ "COFOG": "Classification des fonctions des administrations publiques", ... }` | 0,5h |
| 2 | Créer composant `<Acronym code="COFOG" />` qui génère un `<abbr title="...">` avec tooltip au hover/focus | 1h |
| 3 | Optionnel : lib i18n légère (`next-intl` ou dictionnaire JSON custom) pour préparer la traduction future | 1h |
| 4 | Remplacer les acronymes dans les composants budget par `<Acronym>` | 2h |
| **Total** | | **~4,5h** |

**Approche recommandée :** Un simple dictionnaire JSON + composant `<abbr>` avec Tailwind tooltip (pas besoin de lib i18n complète pour le MVP). Le composant génère un `<abbr title="Classification des fonctions...">COFOG</abbr>` stylé avec `underline decoration-dotted cursor-help`.

### SEO avancé

| # | Amélioration | Effort |
|---|-------------|--------|
| S4 | JSON-LD structured data (WebSite, BreadcrumbList, Article, Dataset) | 0,5 jour |
| S5 | OG images dynamiques pour le feed | 0,5 jour |
| S6 | Viewport complet (`width`, `initial-scale`, `maximum-scale`) | 0,1 jour |
| S7 | Metadata descriptions complètes sur pages auth/admin | 0,25 jour |

### Navigation & UX

| # | Amélioration | Effort |
|---|-------------|--------|
| N4 | Breadcrumbs sur pages détail (`/s/[id]`, `/profile/[userId]`) | 0,5 jour |
| N5 | CTA secondaire "Découvrir les chiffres" dans HeroSection | 0,25 jour |
| N6 | Décommenter lien Classement dans nav quand feature prête | 0,1 jour |
| N7 | Footer visible sur mobile (actuellement `hidden md:block`) | 0,25 jour |

### Qualité éditoriale

| # | Amélioration | Effort |
|---|-------------|--------|
| E2 | Données associations datent de 2018 — dater clairement dans l'UI | 0,25 jour |
| E3 | ~15 acronymes non développés — ajouter tooltips ou glossaire | 0,5 jour |

### Architecture

| # | Amélioration | Effort |
|---|-------------|--------|
| A1 | 8 composants `'use client'` inutilement → Server Components | 1-2 jours |
| A2 | Soft-delete 30j pour suppression de compte (RGPD) | 0,5 jour |
| A3 | Vérification d'existence de soumission avant vote | 0,25 jour |

---

## P3 — Basse priorité

### Code Quality — Page "Les Chiffres"

| # | Amélioration | Effort |
|---|-------------|--------|
| Q1 | Extraire `Intl.NumberFormat` dupliqué 3x dans `format.ts` | 0,1 jour |
| Q2 | Extraire constantes d'axes Recharts (tick config, fontSize) | 0,5 jour |
| Q3 | Extraire magic numbers (BILLION, chart heights) | 0,25 jour |
| Q4 | Scinder EUComparisonSection (254 lignes) en sous-composants | 0,5 jour |
| Q5 | Harmoniser tooltip maxWidth mobile (200 vs 220px) | 0,1 jour |
| Q6 | `text-[10px]` → minimum 12px | 0,1 jour |
| Q7 | DebtPerCapitaCards : ajouter breakpoint `md:` intermédiaire | 0,1 jour |
| Q8 | Sources "Sources et méthodologie" : `<p>` → `<h2>` | 0,1 jour |

### SEO basse

| # | Amélioration | Effort |
|---|-------------|--------|
| S8 | PWA manifest.json | 0,25 jour |
| S9 | `hreflang` préparer i18n future | 0,1 jour |
| S10 | `<h1>` "Les chiffres" trop générique — enrichir | 0,1 jour |

---

## Fonctionnalités futures

| Feature | Description | Effort |
|---------|-------------|--------|
| Animation CountUp | Compteur animé au scroll sur le DeficitCounter, de 0 à -134 Md€ | 0,5 jour |
| Comparaison historique | Évolution des postes de dépenses sur 5-10 ans (graphiques temporels) | 2 jours |
| Export PDF | Bouton "Télécharger en PDF" pour journalistes et enseignants | 1 jour |
| API publique | Exposer les données en JSON (data.gouv.fr mindset) | 1-2 jours |
| Mise à jour annuelle | Workflow documenté pour mettre à jour les données quand le PLF N+1 est voté | Process |

---

## Historique des décisions

| Date | Décision |
|------|----------|
| 28/02/2026 | Route renommée de `/budget-2026` à `/chiffres` (pérenne, pas liée à une année) |
| 28/02/2026 | Suppression de "LFI" → "Loi de Finances (Initiale)" (confusion avec parti politique) |
| 28/02/2026 | Composant `BudgetKpiCard` partagé extrait (DRY, 7 fichiers refactorisés) |
| 28/02/2026 | Lazy-load Recharts via `next/dynamic` (économie ~1 MB JS au chargement initial) |
| 28/02/2026 | Audit multi-agents (12) : 46 issues projet identifiées (2 critiques, 9 hautes) |
