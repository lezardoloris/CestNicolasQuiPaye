# Architecture

> **Projet :** C'EST NICOLAS QUI PAIE
> **Type :** web (monolithe Next.js fullstack)
> **Date :** 2026-02-28

## 1. Resume de l'architecture

Application web monolithique construite avec Next.js 16 (App Router), React 19 et TypeScript strict. Le backend est integre via les API Routes de Next.js, avec PostgreSQL 16 comme base de donnees et Drizzle ORM. L'authentification utilise NextAuth v5 en strategie JWT. Le deploiement se fait sur Railway.

## 2. Pattern architectural

**Monolithe fullstack Next.js** avec separation en couches :

```
┌─────────────────────────────────────────────────────┐
│                    Client (React 19)                │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │ Pages    │  │Components│  │ Hooks + Stores    │ │
│  │ (SSR/ISR)│  │ (95+)    │  │ (React Query +   │ │
│  │          │  │          │  │  Zustand)         │ │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘ │
│       │              │                 │            │
├───────┴──────────────┴─────────────────┴────────────┤
│                  API Routes (REST)                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │ Handlers │  │Validation│  │ Rate Limiting     │ │
│  │ (route.ts│  │ (Zod)    │  │ (Upstash Redis)   │ │
│  └────┬─────┘  └──────────┘  └───────────────────┘ │
├───────┴─────────────────────────────────────────────┤
│                Couche metier (lib/)                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │ Auth     │  │ API      │  │ Utilitaires       │ │
│  │ (NextAuth│  │ (queries,│  │ (format, karma,   │ │
│  │  JWT)    │  │  votes)  │  │  cost-calc, etc.) │ │
│  └──────────┘  └────┬─────┘  └───────────────────┘ │
├──────────────────────┴──────────────────────────────┤
│              Base de donnees (PostgreSQL 16)         │
│  ┌──────────────────────────────────────────┐       │
│  │ Drizzle ORM (22 tables, relations)       │       │
│  └──────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

## 3. Stack technologique detaillee

### Frontend

| Technologie | Role | Justification |
|-------------|------|---------------|
| Next.js 16 | Framework fullstack | App Router, SSR/ISR, API Routes integrees, Turbopack |
| React 19 | Bibliotheque UI | Derniere version, Server Components |
| TypeScript 5.9 (strict) | Typage | Securite du code, autocompletion |
| Tailwind CSS 4 | Styles | Utility-first, theme sombre par defaut |
| shadcn/ui + Radix UI | Composants de base | Accessibles, personnalisables, 14 composants |
| Framer Motion | Animations | Transitions fluides, animations de vote |
| Recharts | Graphiques | Camemberts, barres, chronologies |
| Lucide React | Icones | Set d'icones coherent |

### Backend

| Technologie | Role | Justification |
|-------------|------|---------------|
| API Routes Next.js | Endpoints REST | ~30 endpoints, format reponse standardise |
| NextAuth v5 (beta.30) | Authentification | JWT 30j, Google OAuth + Credentials |
| Drizzle ORM | ORM | Type-safe, migrations, relations |
| PostgreSQL 16 | Base de donnees | ACID, JSON, indexation avancee |
| Upstash Redis | Cache + Rate Limit | Cache multi-niveaux, 8 buckets de rate limiting |
| Zod 4 | Validation | ~15 schemas, server + client |
| Pino | Logging | Logging structure performant |
| bcryptjs | Hashage mdp | Facteur de cout 12 |

### Etat client

| Technologie | Role | Justification |
|-------------|------|---------------|
| TanStack React Query | Etat serveur | Cache, revalidation, infinite scroll |
| Zustand | Etat client | Store de votes (optimistic UI) |

### DevOps

| Technologie | Role | Justification |
|-------------|------|---------------|
| Railway | Deploiement | Build + run automatise |
| Docker Compose | Dev local | PostgreSQL 16 Alpine |
| Vitest | Tests unitaires | Rapide, compatible Vite |
| Playwright | Tests E2E | Multi-navigateur |
| ESLint + Prettier | Qualite code | Formatage + linting |

## 4. Architecture des donnees

### Schema de base de donnees

**22 tables** organisees en domaines :

#### Domaine Utilisateurs
- `users` — Comptes (email, mdp hash, role, anonymousId, karmaScore)
- `accounts` — Providers OAuth (Google)
- `sessions` — Sessions NextAuth
- `verificationTokens` — Verification email

#### Domaine Soumissions
- `submissions` — Depenses publiques (titre, montant, slug, hotScore, moderationStatus)
- `costCalculations` — Calculs de cout caches (par citoyen, contribuable, menage)
- `submissionSources` — Sources officielles (URL, type, validationCount)
- `sourceValidations` — Validations communautaires des sources

#### Domaine Interactions
- `votes` — Votes authentifies (up/down)
- `ipVotes` — Votes anonymes (hash IP, RGPD)
- `comments` — Commentaires files (profondeur max 3)
- `commentVotes` — Votes sur commentaires
- `solutions` — Propositions de solutions
- `solutionVotes` — Votes sur solutions
- `communityNotes` — Notes communautaires (style Twitter)
- `communityNoteVotes` — Votes d'utilite sur les notes

#### Domaine Administration
- `moderationActions` — Piste d'audit de moderation
- `flags` — Signalements utilisateurs
- `broadcasts` — File de tweets (Twitter/X API v2)
- `featureVotes` — Propositions de fonctionnalites
- `featureVoteBallots` — Bulletins de vote fonctionnalites

#### Domaine Analytique
- `shareEvents` — Tracking des partages (6 plateformes)
- `pageViews` — Vues de pages avec UTM

### Enumerations

| Enum | Valeurs |
|------|---------|
| `userRole` | user, moderator, admin |
| `voteType` | up, down |
| `moderationStatus` | pending, approved, rejected, flagged |
| `submissionStatus` | draft, published, hidden, deleted |
| `sharePlatform` | twitter, facebook, whatsapp, copy_link, native |
| `sourceType` | official_report, press_article, think_tank, parliamentary, other |
| `broadcastStatus` | draft, sent, failed |

## 5. Architecture d'authentification

```
┌────────────────────────────────────────┐
│           NextAuth v5 (JWT)            │
│  ┌──────────┐     ┌────────────────┐   │
│  │ Google   │     │ Credentials    │   │
│  │ OAuth    │     │ (email/mdp)    │   │
│  └────┬─────┘     └───────┬────────┘   │
│       │                   │            │
│       └───────┬───────────┘            │
│               ▼                        │
│  ┌────────────────────────┐            │
│  │ JWT Token (30 jours)   │            │
│  │ - userId               │            │
│  │ - email                │            │
│  │ - role                 │            │
│  │ - anonymousId          │            │
│  │ - displayName          │            │
│  └────────────────────────┘            │
└────────────────────────────────────────┘

Niveaux d'autorisation :
1. Public         — Acces libre
2. Anonyme-amical — Fallback IP hash pour votes
3. Authentifie    — Session requise
4. Proprietaire   — userId == target ou admin
5. Moderateur+    — role in [admin, moderator]
6. Admin          — role == admin
```

## 6. Architecture du rate limiting

8 buckets de limitation via Upstash Redis (fenetre glissante) :

| Bucket | Limite | Fenetre | Identifiant |
|--------|--------|---------|-------------|
| registration | 3 | 1 heure | IP |
| login | 10 | 15 min | IP |
| submission | 5 (auth) / 2 (anon) | 24 heures | IP |
| vote | 100 | 1 heure | IP |
| comment | 20 | 1 heure | IP |
| api | 60 | 1 min | IP |
| source | 10 | 1 heure | IP |
| communityNote | 5 | 1 heure | IP |

## 7. Architecture du cache

Strategie multi-niveaux pour les denominateurs de cout :

```
1. Memoire (TTL 24h) ←── Cache le plus rapide
       │ miss
       ▼
2. Redis Upstash (TTL 24h) ←── Partage entre instances
       │ miss
       ▼
3. Cost Engine API ←── Service externe FastAPI
       │ erreur
       ▼
4. Donnees seed hardcodees ←── Fallback ultime (6 denominateurs)
```

## 8. Architecture du scoring

### Hot Score (algorithme de classement)

```
sign = (upvotes - downvotes > 0) ? 1 : (== 0 ? 0 : -1)
order = log10(max(|upvotes - downvotes|, 1))
seconds = createdAt.getTime() / 1000
hotScore = order + (sign * seconds) / 45000
```

Constante de decroissance : 45000 secondes (~12.5 heures) — plus rapide que Reddit, adaptee au cycle d'actualite francais.

### Karma

```
karma = (submissions × 10) + (votes × 1) + (sources × 5) + (notes × 3) + (shares × 2)
```

Paliers :
- Rang 1 : Tronconneuse d'Or
- Rang 2-5 : Tronconneuse d'Argent
- Rang 6-20 : Tronconneuse de Bronze
- Rang 21-100 : Citoyen Actif
- Rang 101+ : Citoyen

## 9. Architecture du rendu

| Route | Rendu | ISR | Raison |
|-------|-------|-----|--------|
| /feed/[sort] | SSR | 60s | Contenu dynamique, SEO |
| /s/[id] | SSR | 300s | Detail, OG image dynamique |
| /stats | SSR | 300s | Donnees agregees |
| /methodologie | SSR | 3600s | Contenu semi-statique |
| /data-status | SSR | 3600s | Denominateurs caches |
| /leaderboard | SSR | 300s | Classement dynamique |
| /submit | Client | - | Formulaire interactif |
| /admin/* | SSR | - | Donnees temps reel |

## 10. Securite

### Headers HTTP (next.config.ts)
- Content-Security-Policy (strict)
- HSTS (63072000s, preload)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### RGPD
- Hash IP avec salt pour votes anonymes (SHA-256, pas de stockage d'IP brute)
- Suppression de compte avec anonymisation des donnees (soft delete)
- Masquage d'email dans les profils publics
- Confirmation de suppression par mot-cle "SUPPRIMER"

### Validation
- Zod sur toutes les entrees API (server-side)
- Sanitisation HTML (stripHtmlTags)
- Contraintes d'unicite en base de donnees
- Transactions pour les operations critiques (votes, suppression)

## 11. Architecture de test

| Type | Framework | Couverture |
|------|-----------|-----------|
| Unitaire | Vitest + @testing-library/react | Composants, utils |
| E2E | Playwright | Parcours utilisateur |
| Linting | ESLint (config Next.js) | Code source |
| Types | TypeScript strict (tsc --noEmit) | Tout le projet |
| Format | Prettier + plugin Tailwind | Tout le projet |
