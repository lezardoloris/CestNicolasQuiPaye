# Audit SEO -- C'est Nicolas Qui Paye

**Date** : 2 mars 2026
**Branche** : `feat/simulateur`
**URL de production** : `https://nicoquipaie.co`
**Auditeur** : Claude Opus 4.6

---

## Sommaire executif

Le site dispose d'une base SEO honorable -- metadata sur la plupart des pages, OG images dynamiques pour les submissions, balise `lang="fr"`, et des URL propres. Cependant, **plusieurs lacunes critiques** compromettent significativement l'indexation, le partage social et le positionnement dans les resultats de recherche :

- Aucun fichier `sitemap.xml` ni `robots.txt`
- Aucune donnee structuree (JSON-LD / schema.org)
- OG image par defaut (`og-default.png`) inexistante dans `/public`
- Balises canonical absentes sur la majorite des pages
- Pas de `noindex` sur les pages admin (indexables par les crawlers)
- Absence de descriptions/OG specifiques sur ~40% des pages

**Score SEO estime : 45/100** (avant corrections)

---

## Table des matieres

1. [CRITIQUES -- A corriger immediatement](#1-critiques)
2. [HAUTS -- Impact fort sur le referencement](#2-hauts)
3. [MOYENS -- Ameliorations significatives](#3-moyens)
4. [BAS -- Bonnes pratiques supplementaires](#4-bas)
5. [Recapitulatif par page](#5-recapitulatif-par-page)
6. [Plan d'action](#6-plan-daction)

---

## 1. CRITIQUES

### 1.1 Aucun sitemap.xml

**Impact** : CRITICAL
**Fichier** : _Manquant_ -- `src/app/sitemap.ts` n'existe pas

Google et les autres moteurs ne peuvent pas decouvrir efficacement toutes les pages du site. Les soumissions dynamiques (`/s/[id]`) ne seront probablement jamais indexees sans sitemap.

**Correction** :

Creer `src/app/sitemap.ts` :

```typescript
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nicoquipaie.co';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/feed/hot`, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${SITE_URL}/feed/new`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/feed/top`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/chiffres`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/simulateur`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/stats`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/leaderboard`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/submit`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contribuer`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/methodologie`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/developers`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/features`, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${SITE_URL}/data-status`, changeFrequency: 'weekly', priority: 0.3 },
    { url: `${SITE_URL}/login`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/register`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  // Dynamic submission pages
  const approvedSubmissions = await db
    .select({ id: submissions.id, updatedAt: submissions.updatedAt })
    .from(submissions)
    .where(eq(submissions.moderationStatus, 'approved'));

  const submissionPages: MetadataRoute.Sitemap = approvedSubmissions.map((s) => ({
    url: `${SITE_URL}/s/${s.id}`,
    lastModified: s.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...submissionPages];
}
```

---

### 1.2 Aucun robots.txt

**Impact** : CRITICAL
**Fichier** : _Manquant_ -- `src/app/robots.ts` n'existe pas

Sans `robots.txt`, les crawlers n'ont aucune directive. Les pages admin, API et les routes protegees sont potentiellement crawlables et indexables.

**Correction** :

Creer `src/app/robots.ts` :

```typescript
import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nicoquipaie.co';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/profile/',
          '/profile/settings/',
          '/feed/review',
          '/submit/confirmation/',
          '/onboarding',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

---

### 1.3 OG image par defaut inexistante

**Impact** : CRITICAL
**Fichier** : `src/app/layout.tsx` (ligne 46) / `public/` (manquant)

Le layout racine reference `/og-default.png` comme OG image mais ce fichier n'existe **pas** dans le dossier `public/`. Contenu actuel de `public/` : `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `logo.png`, `window.svg`.

Consequence : chaque partage social sur les pages sans OG image specifique (la majorite) affiche soit une image cassee, soit rien.

**Correction** :

1. Creer un fichier `public/og-default.png` au format 1200x630 px avec le branding du site.
2. Ou bien creer un `src/app/opengraph-image.tsx` dynamique comme celui existant pour `/chiffres`.

---

### 1.4 Pages admin indexables

**Impact** : CRITICAL
**Fichiers** :
- `src/app/admin/page.tsx`
- `src/app/admin/moderation/page.tsx`
- `src/app/admin/broadcast/page.tsx`
- `src/app/admin/features/page.tsx`
- `src/app/admin/flags/page.tsx`
- `src/app/admin/gamification/page.tsx`
- `src/app/admin/imports/page.tsx`

Aucune de ces pages n'a de directive `robots: { index: false }` dans ses metadata. Bien que le middleware redirige les non-admins, les crawlers pourraient potentiellement indexer le contenu de redirection ou les URL.

**Correction** :

Ajouter dans `src/app/admin/layout.tsx` :

```typescript
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
```

---

## 2. HAUTS

### 2.1 Aucune donnee structuree (JSON-LD / schema.org)

**Impact** : HIGH
**Fichiers** : Tous les `page.tsx`

Aucun balisage JSON-LD n'est present nulle part dans le projet. Les rich results Google (articles, FAQ, breadcrumbs, organisation) sont impossibles.

**Corrections recommandees** :

**a) Organisation (layout racine)** -- `src/app/layout.tsx` :

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "C'est Nicolas Qui Paye",
  url: "https://nicoquipaie.co",
  logo: "https://nicoquipaie.co/logo.png",
  sameAs: ["https://twitter.com/NicolasPaye_FR"],
}) }} />
```

**b) WebSite + SearchAction (layout racine)** :

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "C'est Nicolas Qui Paye",
  "url": "https://nicoquipaie.co",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://nicoquipaie.co/feed/hot?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

**c) Article (page /s/[id])** -- `src/app/s/[id]/page.tsx` :

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "description": "...",
  "datePublished": "...",
  "author": { "@type": "Person", "name": "..." },
  "publisher": { "@type": "Organization", "name": "C'est Nicolas Qui Paye" }
}
```

**d) BreadcrumbList** sur les pages de detail pour la navigation fil d'Ariane.

---

### 2.2 Canonical URLs absentes sur la majorite des pages

**Impact** : HIGH
**Fichiers** : Toutes les pages sauf `src/app/chiffres/page.tsx`

Seule la page `/chiffres` definit `alternates.canonical`. Toutes les autres pages risquent des problemes de contenu duplique (notamment si accessibles avec/sans trailing slash, avec parametres UTM, etc.).

**Pages prioritaires pour ajout de canonical** :

| Page | Fichier |
|------|---------|
| `/feed/hot` | `src/app/feed/[sort]/page.tsx` |
| `/feed/new` | `src/app/feed/[sort]/page.tsx` |
| `/feed/top` | `src/app/feed/[sort]/page.tsx` |
| `/s/[id]` | `src/app/s/[id]/page.tsx` |
| `/stats` | `src/app/stats/page.tsx` |
| `/leaderboard` | `src/app/leaderboard/page.tsx` |
| `/simulateur` | `src/app/simulateur/page.tsx` |
| `/submit` | `src/app/submit/page.tsx` |
| `/contribuer` | `src/app/contribuer/page.tsx` |
| `/methodologie` | `src/app/methodologie/page.tsx` |
| `/developers` | `src/app/developers/page.tsx` |

**Correction type** :

```typescript
// Dans generateMetadata pour les routes dynamiques :
alternates: {
  canonical: `${SITE_URL}/s/${id}`,
},

// Dans les metadata statiques :
alternates: {
  canonical: `${SITE_URL}/stats`,
},
```

---

### 2.3 Page d'accueil (/) est une redirection sans metadata

**Impact** : HIGH
**Fichier** : `src/app/page.tsx`

```typescript
export default function Home() {
  redirect('/feed/hot');
}
```

La page racine `/` effectue une redirection server-side vers `/feed/hot` sans aucun metadata. Si un crawler indexe `/`, il ne trouvera aucun contenu. La page `/` devrait etre la page principale du site.

**Corrections** :

1. Ajouter des metadata a `src/app/page.tsx` meme avec la redirection (le crawler peut les lire avant la redirection).
2. Idealement, envisager de rendre le contenu du feed directement sur `/` pour eviter la redirection (meilleur pour le SEO et les performances).

---

### 2.4 Descriptions manquantes sur plusieurs pages

**Impact** : HIGH

Les pages suivantes n'ont **aucune description** dans leurs metadata :

| Page | Fichier | Titre seul |
|------|---------|------------|
| `/login` | `src/app/(auth)/login/page.tsx` | "Se connecter" |
| `/register` | `src/app/(auth)/register/page.tsx` | "Creer un compte" |
| `/onboarding` | `src/app/(auth)/onboarding/page.tsx` | "Bienvenue" |
| `/profile` | `src/app/profile/page.tsx` | "Mon profil" |
| `/profile/settings` | `src/app/profile/settings/page.tsx` | "Parametres du profil" |
| `/submit/confirmation/[id]` | `src/app/submit/confirmation/[id]/page.tsx` | "Signalement soumis" |
| Toutes les pages admin | `src/app/admin/*/page.tsx` | Titre seul |

Les pages auth et profil sont moins critiques (souvent noindex), mais les pages publiques comme la confirmation devraient avoir des descriptions.

---

### 2.5 Open Graph / Twitter Cards incomplets sur la majorite des pages

**Impact** : HIGH

Seules ces pages ont des OG/Twitter specifiques :
- `/` (layout racine -- partiel, image cassee)
- `/s/[id]` (complet avec OG image dynamique)
- `/chiffres` (complet avec `opengraph-image.tsx`)
- `/simulateur` (OG partiel, pas d'image specifique)

Les pages suivantes heritent uniquement du layout racine (avec l'image OG cassee) :

- `/feed/[sort]` -- haute priorite, page la plus partagee
- `/stats`
- `/leaderboard`
- `/submit`
- `/contribuer`
- `/developers`
- `/methodologie`
- `/features`
- `/data-status`

**Correction** : Ajouter `openGraph` et `twitter` dans les metadata de chaque page publique, ou au minimum creer un `src/app/opengraph-image.tsx` par defaut fonctionnel.

---

## 3. MOYENS

### 3.1 Hierarchie des headings (H1-H6)

**Impact** : MEDIUM

**Problemes identifies** :

| Page | Probleme |
|------|----------|
| `/admin/*` | Le layout admin a un `<h1>Administration</h1>`, et chaque sous-page utilise `<h2>`. Correct, mais les pages admin n'ont pas de `<main>` propre (utilise `id="admin-content"` sans role). |
| `/profile` | Le `<h1>` est `sr-only` ("Mon profil"), ce qui est correct pour l'accessibilite. |
| `/not-found` (racine) | Utilise `<h2>` ("404") au lieu de `<h1>` -- manque de heading principal. |
| `/data-status` | Pas de `<main>` wrappant le contenu (utilise `<div>`). |
| `/submit` | Pas de `<main>` wrappant le contenu (utilise `<div>`). |

**Correction pour `/not-found`** (`src/app/not-found.tsx`) :

Remplacer `<h2>` par `<h1>` pour le "404".

**Correction pour les pages sans `<main>`** :

Remplacer les `<div>` racines par `<main id="main-content">` dans :
- `src/app/data-status/page.tsx`
- `src/app/submit/page.tsx`
- `src/app/submit/confirmation/[id]/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/profile/[userId]/page.tsx`
- `src/app/profile/settings/page.tsx`

---

### 3.2 URL de partage incorrecte dans share.ts

**Impact** : MEDIUM
**Fichier** : `src/lib/utils/share.ts` (ligne 42)

```typescript
const base = `${SITE_URL}/submissions/${submissionId}`;
```

L'URL de partage utilise `/submissions/` mais la route reelle est `/s/`. Les liens partages sur les reseaux sociaux pointent vers une page 404.

**Correction** :

```typescript
const base = `${SITE_URL}/s/${submissionId}`;
```

---

### 3.3 Profil public `/profile/[userId]` -- metadata incomplets

**Impact** : MEDIUM
**Fichier** : `src/app/profile/[userId]/page.tsx`

Le `generateMetadata` ne retourne qu'un `title`. Pas de `description`, pas de `robots` (les profils publics sont-ils voulus pour l'indexation ?).

**Correction** :

```typescript
export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { userId } = await params;
  const profile = await getUserProfile(userId, false);

  if (!profile) {
    return { title: 'Profil introuvable', robots: { index: false } };
  }

  const name = resolveDisplayName(profile.displayName, profile.anonymousId);
  return {
    title: name,
    description: `Profil de ${name} sur C'est Nicolas Qui Paye.`,
    robots: { index: false, follow: true }, // Optionnel : proteger la vie privee
  };
}
```

---

### 3.4 Accents manquants dans les metadata

**Impact** : MEDIUM

Plusieurs textes de metadata manquent d'accents, ce qui nuit a la credibilite en francais :

| Fichier | Texte | Correction |
|---------|-------|------------|
| `src/app/(auth)/register/page.tsx` | `'Creer un compte'` | `'Créer un compte'` |
| `src/app/features/page.tsx` | `'Propositions de fonctionnalites'` | `'Propositions de fonctionnalités'` |
| `src/app/features/page.tsx` | `'fonctionnalites'`, `'idees'` | `'fonctionnalités'`, `'idées'` |
| `src/app/leaderboard/page.tsx` | `'decrocher'` | `'décrocher'` |

---

### 3.5 Absence de favicon/icons modernes

**Impact** : MEDIUM
**Fichier** : `src/app/favicon.ico` (seul fichier)

Seul un `favicon.ico` existe. Il manque :
- `apple-touch-icon.png` (180x180)
- `icon.svg` ou `icon.png` (192x192, 512x512)
- `manifest.json` / `manifest.webmanifest` pour le PWA

**Correction** :

Creer `src/app/manifest.ts` :

```typescript
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "C'est Nicolas Qui Paye",
    short_name: 'Nicolas Paye',
    description: 'Plateforme citoyenne pour tronconner les depenses publiques.',
    start_url: '/feed/hot',
    display: 'standalone',
    background_color: '#111318',
    theme_color: '#C62828',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```

---

### 3.6 Pas de `loading.tsx` ni `error.tsx` sur certaines pages

**Impact** : MEDIUM

Les pages suivantes manquent de `loading.tsx` (mauvaise experience utilisateur = taux de rebond eleve = signal SEO negatif) :

- `src/app/chiffres/` -- page lourde avec graphiques
- `src/app/simulateur/` -- composant client avec calculs
- `src/app/methodologie/`
- `src/app/contribuer/`
- `src/app/developers/`
- `src/app/data-status/`
- `src/app/submit/`

Pages sans `error.tsx` specifique :
- `src/app/stats/`
- `src/app/chiffres/`
- Toutes les pages hors feed et submission detail

---

## 4. BAS

### 4.1 Images alt text -- decoratives correctes, mais profil manquant

**Impact** : LOW

Les images decoratives (avatars dans leaderboard, hero section) utilisent correctement `alt=""`. Les logos ont des alt text descriptifs. Cependant :

| Composant | Probleme |
|-----------|----------|
| `PodiumCards.tsx` (ligne 60) | `alt=""` sur les avatars du podium -- devrait etre `alt={entry.displayName}` |
| `LeaderboardTable.tsx` (ligne 52) | `alt=""` sur les avatars -- devrait etre `alt={entry.displayName}` |
| `HeroSection.tsx` (ligne 112) | `alt=""` sur le logo en mode collapse -- devrait etre `alt="C'est Nicolas Qui Paye"` |

### 4.2 Pas de `theme-color` dans le viewport

**Impact** : LOW
**Fichier** : `src/app/layout.tsx` (ligne 27-29)

Le `viewport` export ne definit que `viewportFit: 'cover'`. Ajouter `themeColor` pour une meilleure integration mobile (barre d'adresse coloree).

**Correction** :

```typescript
export const viewport = {
  viewportFit: 'cover' as const,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#111318' },
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
  ],
};
```

### 4.3 Pas de hreflang (i18n)

**Impact** : LOW

Le site est monolingue (francais), ce qui est coherent. Le `<html lang="fr">` est correctement defini dans `src/app/layout.tsx` (ligne 64). Aucun `hreflang` n'est necessaire pour le moment.

Si une version anglaise est envisagee a l'avenir, il faudra ajouter `hreflang` dans les metadata.

### 4.4 Titre des pages feed utilise un format double

**Impact** : LOW
**Fichier** : `src/app/feed/[sort]/page.tsx` (ligne 57)

```typescript
title: `${meta.title} - C'est Nicolas Qui Paye`,
```

Mais le layout racine a deja un template `'%s | C\'est Nicolas Qui Paye'`. Le resultat est donc :
`Tendances - C'est Nicolas Qui Paye | C'est Nicolas Qui Paye`

**Correction** :

Utiliser uniquement le titre court pour profiter du template :

```typescript
return {
  title: meta.title,
  description: meta.description,
};
```

Meme probleme dans :
- `src/app/stats/page.tsx` : `Statistiques - ${SITE_NAME}` -> doublon
- `src/app/leaderboard/page.tsx` : `Classement - La Tronconneuse d'Or - ${SITE_NAME}` -> doublon
- `src/app/chiffres/page.tsx` : `Les chiffres — ${SITE_NAME}` -> doublon

### 4.5 Fichiers SVG inutilises dans /public

**Impact** : LOW
**Fichier** : `public/`

Les fichiers `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` sont des fichiers par defaut de Next.js et ne sont utilises nulle part. Ils augmentent la taille du deploiement inutilement.

### 4.6 Performance (LCP/CLS)

**Impact** : LOW

**Points positifs** :
- `priority` est correctement applique aux images logo (`DesktopNav.tsx`, `MobileHeader.tsx`, `DesktopSidebar.tsx`)
- `font-display: swap` est utilise pour les polices Google
- Les images utilisent `next/image` avec dimensionnement explicite (sauf les avatars dans `PodiumCards.tsx` qui utilisent `<img>` natif)

**Points d'attention** :
- `PodiumCards.tsx` (ligne 59) : utilise `<img>` au lieu de `next/image` pour les avatars -- pas d'optimisation automatique
- `LeaderboardTable.tsx` (ligne 50-53) : idem, `<img>` natif pour les avatars
- Les graphiques Recharts sont lazy-loaded (bon), mais pas de `Suspense` boundary explicite autour d'eux

---

## 5. Recapitulatif par page

| Page | Route | Titre | Description | OG | Twitter | Canonical | JSON-LD | H1 | `<main>` |
|------|-------|-------|-------------|----|---------|-----------|---------|----|----------|
| Accueil | `/` | -- (redirect) | -- | -- | -- | -- | -- | -- | -- |
| Feed Hot | `/feed/hot` | Doublon | Oui | Herite (casse) | Herite | Non | Non | Oui | Oui |
| Feed New | `/feed/new` | Doublon | Oui | Herite (casse) | Herite | Non | Non | Oui | Oui |
| Feed Top | `/feed/top` | Doublon | Oui | Herite (casse) | Herite | Non | Non | Oui | Oui |
| Submission | `/s/[id]` | Oui | Oui | Oui (dynamique) | Oui | Non | Non | Oui | Oui |
| Chiffres | `/chiffres` | Doublon | Oui | Oui (genere) | Oui | **Oui** | Non | Oui | Oui |
| Simulateur | `/simulateur` | Oui | Oui | Partiel | Non (image) | Non | Non | Oui | Oui |
| Stats | `/stats` | Doublon | Oui | Herite (casse) | Herite | Non | Non | Oui | Oui |
| Leaderboard | `/leaderboard` | Doublon | Oui | Herite (casse) | Herite | Non | Non | Oui | Oui |
| Submit | `/submit` | Oui | Oui | Herite (casse) | Herite | Non | Non | Oui | **Non** |
| Confirmation | `/submit/confirmation/[id]` | Oui | Minimale | Herite (casse) | Herite | Non | Non | Oui | **Non** |
| Contribuer | `/contribuer` | Oui | Oui | Herite (casse) | Herite | Non | Non | Oui | Oui |
| Methodologie | `/methodologie` | Oui | Oui | Herite (casse) | Herite | Non | Non | Oui | Oui |
| Data Status | `/data-status` | Oui | Oui | Herite (casse) | Herite | Non | Non | Oui | **Non** |
| Developers | `/developers` | Oui | Oui | Herite (casse) | Herite | Non | Non | Oui | Oui |
| Features | `/features` | Sans accents | Sans accents | Herite (casse) | Herite | Non | Non | Oui | Oui |
| Feed Review | `/feed/review` | Oui | Oui | Herite (casse) | Herite | Non | Non | Oui | Oui |
| Login | `/login` | Oui | Non | Herite (casse) | Herite | Non | Non | Non | Non |
| Register | `/register` | Sans accents | Non | Herite (casse) | Herite | Non | Non | Non | Non |
| Onboarding | `/onboarding` | Oui | Non | Herite (casse) | Herite | Non | Non | Non | Non |
| Profil | `/profile` | Oui | Non | Herite (casse) | Herite | Non | Non | sr-only | **Non** |
| Profil public | `/profile/[userId]` | Oui | Non | Herite (casse) | Herite | Non | Non | Non | **Non** |
| Profil params | `/profile/settings` | Oui | Non | Herite (casse) | Herite | Non | Non | Oui | **Non** |
| Admin (toutes) | `/admin/*` | Oui | Non | Herite (casse) | Herite | Non | Non | Oui (layout) | Oui |
| 404 | not-found | -- | -- | -- | -- | -- | -- | **H2** | Non |

---

## 6. Plan d'action

### Phase 1 -- Corrections critiques (J+1)

| # | Action | Fichier(s) | Effort |
|---|--------|------------|--------|
| 1 | Creer `sitemap.ts` | `src/app/sitemap.ts` | 30 min |
| 2 | Creer `robots.ts` | `src/app/robots.ts` | 10 min |
| 3 | Creer/ajouter `public/og-default.png` (1200x630) | `public/og-default.png` | 20 min |
| 4 | Ajouter `robots: { index: false, follow: false }` aux pages admin | `src/app/admin/layout.tsx` | 5 min |
| 5 | Corriger l'URL de partage `/submissions/` -> `/s/` | `src/lib/utils/share.ts` | 2 min |

### Phase 2 -- Ameliorations hautes (J+3)

| # | Action | Fichier(s) | Effort |
|---|--------|------------|--------|
| 6 | Ajouter `alternates.canonical` sur toutes les pages publiques | Toutes les `page.tsx` | 45 min |
| 7 | Corriger les titres en doublon (retirer le suffixe du site) | 4 pages | 10 min |
| 8 | Ajouter `description` aux pages qui en manquent | 6 pages | 15 min |
| 9 | Ajouter OG/Twitter cards specifiques aux pages prioritaires | 5-6 pages | 30 min |
| 10 | Ajouter JSON-LD Organization + WebSite au layout racine | `src/app/layout.tsx` | 15 min |
| 11 | Ajouter JSON-LD Article a la page `/s/[id]` | `src/app/s/[id]/page.tsx` | 20 min |

### Phase 3 -- Ameliorations moyennes (J+7)

| # | Action | Fichier(s) | Effort |
|---|--------|------------|--------|
| 12 | Corriger les accents manquants dans les metadata | 4 fichiers | 5 min |
| 13 | Remplacer `<div>` par `<main>` sur les pages sans wrapper semantique | 6 pages | 10 min |
| 14 | Corriger `<h2>` en `<h1>` dans `not-found.tsx` | `src/app/not-found.tsx` | 2 min |
| 15 | Creer `manifest.ts` pour le PWA | `src/app/manifest.ts` | 10 min |
| 16 | Ajouter des `loading.tsx` aux pages sans | 7 repertoires | 30 min |
| 17 | Ajouter `noindex` aux pages de profil, review, confirmation | 3-4 fichiers | 10 min |

### Phase 4 -- Polissage (J+14)

| # | Action | Fichier(s) | Effort |
|---|--------|------------|--------|
| 18 | Ajouter `themeColor` au viewport | `src/app/layout.tsx` | 2 min |
| 19 | Corriger les alt text sur les avatars du podium/leaderboard | 3 composants | 5 min |
| 20 | Remplacer `<img>` par `next/image` pour les avatars | 2 composants | 15 min |
| 21 | Supprimer les SVG inutilises de `/public` | `public/` | 2 min |
| 22 | Ajouter BreadcrumbList JSON-LD aux pages de detail | `src/app/s/[id]/page.tsx` | 20 min |

---

**Effort total estime** : ~6-8 heures

**Score SEO estime apres corrections** : 85/100

---

## Addendum — Post-rebase delta (2 mars 2026)

Trois commits upstream ont ete merges depuis l'audit initial :

| Commit | Resume |
|--------|--------|
| `f5065d8` | Titres et descriptions ameliores sur 13 pages (login, register, onboarding, profile, settings, data-status, features, feed/review, leaderboard, methodologie, stats, submit, confirmation) |
| `952d95b` | Ajout des pages `/cgu` et `/mentions-legales` |
| `b90451a` | Renommage "Paye" -> "Paie" a travers tout le site |

---

### A. Findings RESOLUS par les commits upstream

#### 2.4 Descriptions manquantes sur plusieurs pages — PARTIELLEMENT RESOLU

Les pages suivantes disposent desormais d'un `title` ET d'une `description` complete :

| Page | Avant | Apres |
|------|-------|-------|
| `/login` | Titre seul, pas de description | `description: 'Connectez-vous pour voter, commenter et signaler les gaspillages publics.'` |
| `/register` | Titre sans accents, pas de description | `title: 'Créer un compte'` + description complete |
| `/onboarding` | Titre seul, pas de description | `description: 'Configurez votre profil et découvrez comment contribuer...'` |
| `/profile` | Titre seul, pas de description | `description: 'Consultez vos signalements, votes et badges...'` |
| `/profile/settings` | Titre seul, pas de description | `description: 'Modifiez votre nom d\'affichage, vos préférences...'` |
| `/data-status` | Titre seul, description manquante | `description: 'Transparence des données utilisées pour les calculs...'` |
| `/submit/confirmation/[id]` | Description minimale | `description: 'Votre signalement a été envoyé et sera vérifié par la communauté.'` |
| `/feed/review` | Titre seul | `title: 'Validation communautaire'` + description |

**Reste ouvert** : les pages admin n'ont toujours pas de description (mais c'est acceptable puisqu'elles devraient etre `noindex`).

#### 3.4 Accents manquants dans les metadata — RESOLU

| Fichier | Avant | Apres |
|---------|-------|-------|
| `register/page.tsx` | `'Creer un compte'` | `'Créer un compte'` |
| `features/page.tsx` | `'Propositions de fonctionnalites'` / `'idees'` | `'Propositions de fonctionnalités'` / `'idées'` |
| `leaderboard/page.tsx` | `'decrocher'` | `'décrocher'` |
| `methodologie/page.tsx` | _(non verifie dans l'audit initial)_ | `'Méthodologie de calcul'` avec accents corrects |
| `stats/page.tsx` | _(non verifie)_ | Accents corrects |
| `data-status/page.tsx` | _(non verifie)_ | `'Statut des données'` avec accents corrects |

Tous les titres et descriptions lus dans les fichiers actuels contiennent des accents francais corrects.

#### Renommage "Paye" -> "Paie" (commit `b90451a`) — RESOLU

- `SITE_NAME` dans `src/lib/metadata.ts` : `"C'est Nicolas Qui Paie"` (correct)
- Layout racine `src/app/layout.tsx` : titre par defaut et template utilisent "Paie" (correct)
- OG `siteName` : `"C'est Nicolas Qui Paie"` (correct)
- Les descriptions des pages feed, features, leaderboard referencent "C'est Nicolas Qui Paie" (correct)

**Note** : le handle Twitter reste `@NicolasPaye_FR` (sans le "i"), ce qui est normal -- c'est le vrai handle du compte Twitter et non un texte du site a corriger.

---

### B. Findings NON RESOLUS (toujours d'actualite)

Les findings suivants de l'audit initial restent ouverts et inchanges :

| # | Finding | Severite |
|---|---------|----------|
| 1.1 | Aucun `sitemap.xml` | CRITICAL |
| 1.2 | Aucun `robots.txt` | CRITICAL |
| 1.3 | OG image par defaut (`og-default.png`) inexistante dans `/public` | CRITICAL |
| 1.4 | Pages admin indexables (pas de `noindex`) | CRITICAL |
| 2.1 | Aucune donnee structuree JSON-LD | HIGH |
| 2.2 | Canonical URLs absentes (sauf `/chiffres`) | HIGH |
| 2.3 | Page d'accueil `/` est une redirection sans metadata | HIGH |
| 2.5 | OG / Twitter Cards incomplets sur la majorite des pages | HIGH |
| 3.1 | Hierarchie des headings (`<h2>` au lieu de `<h1>` dans not-found, pages sans `<main>`) | MEDIUM |
| 3.2 | URL de partage incorrecte `/submissions/` au lieu de `/s/` dans `share.ts` | MEDIUM |
| 3.3 | Profil public `/profile/[userId]` -- metadata incomplets | MEDIUM |
| 3.5 | Absence de favicon/icons modernes et `manifest.ts` | MEDIUM |
| 3.6 | Pas de `loading.tsx` ni `error.tsx` sur certaines pages | MEDIUM |
| 4.1 | Images alt text manquants (podium, leaderboard, hero) | LOW |
| 4.2 | Pas de `theme-color` dans le viewport | LOW |
| 4.4 | Titre doublon sur les pages feed, stats, leaderboard, chiffres | LOW |
| 4.5 | Fichiers SVG inutilises dans `/public` | LOW |
| 4.6 | Performance (`<img>` au lieu de `next/image` pour avatars) | LOW |

**Nota sur 4.4** : le doublon de titre persiste. Le feed utilise toujours `title: \`${meta.title} - C'est Nicolas Qui Paie\`` (fichier `src/app/feed/[sort]/page.tsx`, ligne 55), ce qui produit `"Tendances - C'est Nicolas Qui Paie | C'est Nicolas Qui Paie"` via le template du layout. Idem pour `/chiffres` qui utilise `pageTitle = \`Les chiffres — ${SITE_NAME}\``.

---

### C. NOUVEAUX findings — Pages `/cgu` et `/mentions-legales`

#### C.1 Pas de canonical URL

**Impact** : HIGH
**Fichiers** : `src/app/cgu/page.tsx`, `src/app/mentions-legales/page.tsx`

Aucune des deux pages ne definit `alternates.canonical`. Ce sont des pages juridiques qui ne doivent exister qu'en un seul exemplaire.

**Correction** :

```typescript
// src/app/cgu/page.tsx
export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions générales d'utilisation du site C\u2019est Nicolas Qui Paie — nicoquipaie.co.",
  alternates: {
    canonical: `${SITE_URL}/cgu`,
  },
};

// src/app/mentions-legales/page.tsx
export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site C\u2019est Nicolas Qui Paie — nicoquipaie.co.',
  alternates: {
    canonical: `${SITE_URL}/mentions-legales`,
  },
};
```

#### C.2 Pas de donnees structurees JSON-LD

**Impact** : MEDIUM
**Fichiers** : `src/app/cgu/page.tsx`, `src/app/mentions-legales/page.tsx`

Les pages juridiques beneficieraient d'un balisage `schema.org/WebPage` avec `@type: "WebPage"` et `specialty: "Legal"` pour aider les moteurs a comprendre leur nature.

#### C.3 Absentes du sitemap recommande

**Impact** : MEDIUM

Les pages `/cgu` et `/mentions-legales` ne figurent pas dans le sitemap propose au finding 1.1. Si le sitemap est implemente, elles doivent y etre ajoutees avec `changeFrequency: 'yearly'` et `priority: 0.2`.

#### C.4 OG / Twitter Cards herites du layout (image cassee)

**Impact** : LOW

Comme toutes les autres pages non specifiquement configurees, `/cgu` et `/mentions-legales` heritent de l'OG image par defaut (`og-default.png`) qui est inexistante. Ce n'est pas nouveau (finding 1.3 et 2.5), mais ces pages sont maintenant aussi concernees.

**Points positifs des nouvelles pages** :
- Titre et description presents et bien rediges avec accents
- Utilisation de `<main>` comme wrapper semantique (correct)
- Hierarchie de headings correcte (`<h1>` suivi de `<h2>`)
- Structure HTML semantique avec `<section>` pour chaque bloc
- Liens externes avec `rel="noopener noreferrer"` (correct)

---

### D. Bilan des compteurs mis a jour

| Severite | Audit initial | Resolus | Nouveaux | Reste ouvert |
|----------|--------------|---------|----------|--------------|
| CRITICAL | 4 | 0 | 0 | **4** |
| HIGH | 5 | 1 (partiel : 2.4) | 1 (C.1) | **5** |
| MEDIUM | 6 | 1 (3.4) | 2 (C.2, C.3) | **7** |
| LOW | 6 | 0 | 1 (C.4) | **7** |
| **Total** | **21** | **2** | **4** | **23** |

**Score SEO re-estime : 50/100** (amelioration de +5 points grace aux descriptions et accents corriges ; la base reste la meme sans sitemap, robots.txt, JSON-LD ni canonical)

---

### E. Plan d'action mis a jour — Complement

Ajouter aux phases existantes :

**Phase 1 (CRITIQUES, J+1)** -- inchange, toujours prioritaire.

**Phase 2 (HAUTS, J+3)** :
- Action 6 (canonicals) : ajouter `/cgu` et `/mentions-legales` a la liste des pages
- Action 8 (descriptions) : **RETIRE** -- toutes les pages publiques ont desormais des descriptions
- Action 9 (OG/Twitter) : `/cgu` et `/mentions-legales` a ajouter a la liste

**Phase 3 (MOYENS, J+7)** :
- Action 12 (accents) : **RETIRE** -- tous les accents sont desormais corrects
- Nouveau : ajouter `/cgu` et `/mentions-legales` dans le sitemap recommande (action 1)
- Nouveau : envisager JSON-LD `WebPage` pour les pages juridiques

**Effort total re-estime** : ~5-7 heures (economie de ~1h grace aux descriptions et accents deja corriges)
