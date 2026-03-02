# Vue d'ensemble du projet

> **Projet :** C'EST NICOLAS QUI PAIE
> **Type :** Application web monolithique (Next.js fullstack)
> **Date de documentation :** 2026-02-28
> **Scan :** Exhaustif (tous les fichiers source lus)

## Objectif

Plateforme citoyenne open source de transparence fiscale. Les utilisateurs soumettent des exemples de depenses publiques, votent, commentent, proposent des solutions et partagent sur les reseaux sociaux. Le projet se nomme en interne "liberal" et vise a rendre les depenses publiques francaises accessibles et comprehensibles par tous les citoyens.

## Resume executif

**C'EST NICOLAS QUI PAIE** est une plateforme civic-tech construite avec Next.js 16 et React 19, deployee sur Railway. Elle permet aux citoyens de :

- **Soumettre** des depenses publiques avec montant, source et description
- **Voter** (pour/contre) sur les soumissions, meme anonymement (par IP)
- **Commenter** avec des fils de discussion a 3 niveaux de profondeur
- **Calculer** le cout par contribuable, par menage, en jours de travail et en equivalences concretes
- **Partager** sur Twitter/X, Facebook, WhatsApp avec tracking analytique
- **Moderer** via un panneau d'administration avec workflow d'approbation
- **Contribuer** des notes communautaires (style Twitter), des sources et des solutions
- **Classer** les contributeurs via un systeme de karma et leaderboard

## Stack technique

| Categorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React | 19.2.3 |
| Langage | TypeScript (strict) | 5.9.3 |
| CSS | Tailwind CSS | 4 |
| Composants UI | shadcn/ui + Radix UI | 1.4.3 |
| Animations | Framer Motion (motion) | 12.34.3 |
| ORM | Drizzle ORM | 0.45.1 |
| Base de donnees | PostgreSQL | 16 (Alpine) |
| Auth | NextAuth (Auth.js) v5 | beta.30 |
| Etat serveur | TanStack React Query | 5.90.21 |
| Etat client | Zustand | 5.0.11 |
| Validation | Zod | 4.3.6 |
| Graphiques | Recharts | 3.7.0 |
| Rate Limiting | Upstash Ratelimit + Redis | 2.0.8 |
| Tests unitaires | Vitest | 4.0.18 |
| Tests E2E | Playwright | 1.58.2 |
| Logging | Pino + pino-pretty | 10.3.1 |
| Deploiement | Railway | - |

## Architecture

- **Pattern :** Application web monolithique fullstack
- **Rendu :** SSR avec ISR (Incremental Static Regeneration) par page
- **API :** REST (API Routes Next.js) avec enveloppe de reponse standardisee
- **Auth :** JWT (30 jours) avec providers Google OAuth + Credentials (email/mdp)
- **Cache :** Multi-niveaux (memoire → Redis → API → donnees de seed)
- **Pagination :** Curseur base64url pour tous les flux
- **Votes :** Double systeme (utilisateurs authentifies + votes anonymes par hash IP)

## Structure du depot

```
CestNicolasQuiPaye/           (Monolithe)
├── src/                       # Code source principal
│   ├── app/                   # Routes Next.js (App Router)
│   │   ├── api/               # ~30 endpoints REST
│   │   ├── (auth)/            # Pages login/register/onboarding
│   │   ├── admin/             # Panneau d'administration
│   │   ├── feed/[sort]/       # Flux principal (hot/new/top)
│   │   ├── s/[id]/            # Detail soumission
│   │   └── ...                # 22 routes au total
│   ├── components/            # ~95 composants React
│   │   ├── features/          # Composants metier (19 domaines)
│   │   ├── layout/            # Navigation, footer, providers
│   │   └── ui/                # Composants shadcn/ui (14)
│   ├── hooks/                 # 11 hooks personnalises
│   ├── lib/                   # Logique metier (37 fichiers)
│   │   ├── api/               # Couche API (9 fichiers)
│   │   ├── auth/              # Configuration auth (2 fichiers)
│   │   ├── db/                # Schema + connexion DB (3 fichiers)
│   │   ├── utils/             # Utilitaires (12 fichiers)
│   │   └── validators/        # Schemas Zod (3 fichiers)
│   ├── stores/                # Store Zustand (votes)
│   └── types/                 # Definitions TypeScript (5 fichiers)
├── scripts/                   # Scripts (seed DB)
├── public/                    # Assets statiques
├── docs/                      # Documentation (ce dossier)
└── _bmad/                     # Framework BMAD (dev assistee par IA)
```

## Metriques du projet

| Metrique | Valeur |
|----------|--------|
| Fichiers TypeScript | ~170 |
| Tables de base de donnees | 22 |
| Endpoints API | ~30 |
| Composants React | ~95 |
| Hooks personnalises | 11 |
| Schemas de validation Zod | ~15 |
| Categories de depenses | 16 |
| Regles de rate limiting | 8 |
| Roles utilisateur | 3 (user, moderator, admin) |

## Liens vers la documentation detaillee

- [Architecture](./architecture.md)
- [Arbre source annote](./source-tree-analysis.md)
- [Contrats API](./api-contracts.md)
- [Modeles de donnees](./data-models.md)
- [Inventaire des composants](./component-inventory.md)
- [Guide de developpement](./development-guide.md)
- [Guide de deploiement](./deployment-guide.md)
