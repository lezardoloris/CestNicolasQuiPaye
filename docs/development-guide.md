# Guide de developpement

> **Projet :** C'EST NICOLAS QUI PAIE
> **Date :** 2026-02-28

## Prerequis

| Outil | Version minimum | Notes |
|-------|----------------|-------|
| Node.js | >= 20 | LTS recommande |
| npm | Inclus avec Node.js | Lockfile npm |
| Docker + Docker Compose | Derniere version stable | Pour PostgreSQL local |
| Git | Derniere version | Gestion de versions |

## Installation

### 1. Cloner le depot

```bash
git clone <url-du-repo>
cd CestNicolasQuiPaye
```

### 2. Lancer PostgreSQL

```bash
docker compose -f docker-compose.dev.yml up -d
```

PostgreSQL 16 Alpine sur le port `5433` :
- **Utilisateur :** liberal
- **Mot de passe :** liberal
- **Base :** liberal

### 3. Configurer l'environnement

```bash
cp .env.example .env
```

Variables requises :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://liberal:liberal@localhost:5433/liberal` |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app | `http://localhost:3000` |
| `AUTH_SECRET` | Secret NextAuth (generer avec `openssl rand -base64 32`) | (chaine aleatoire) |
| `AUTH_URL` | URL de callback auth | `http://localhost:3000` |

Variables optionnelles :

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | OAuth Google (optionnel en dev local) |
| `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `UPSTASH_REDIS_REST_URL` | Cache Redis (fallback memoire si absent) |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis |
| `COST_ENGINE_URL` | URL microservice calcul (defaut: http://localhost:8000) |
| `COST_ENGINE_KEY` | Cle API microservice |
| `TWITTER_BEARER_TOKEN` | API Twitter/X (admin broadcast) |
| `IP_HASH_SALT` | Sel de hashage IP (defaut fourni) |

### 4. Installer les dependances

```bash
npm install
```

### 5. Initialiser la base de donnees

```bash
npm run db:setup
```

Cette commande pousse le schema Drizzle vers PostgreSQL puis execute le seed (50+ soumissions de depenses publiques reelles).

### 6. Lancer le serveur de developpement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Commandes

### Developpement

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de dev Next.js avec Turbopack |
| `npm run build` | Build de production (push schema + build Next.js) |
| `npm run start` | Demarrer le serveur de production |

### Base de donnees

| Commande | Description |
|----------|-------------|
| `npm run db:push` | Pousser le schema vers PostgreSQL |
| `npm run db:generate` | Generer les fichiers de migration |
| `npm run db:migrate` | Executer les migrations |
| `npm run db:studio` | Interface visuelle Drizzle Studio |
| `npm run db:seed` | Seed des donnees de base (idempotent) |
| `npm run db:reseed` | Reset + re-seed |
| `npm run db:setup` | Push schema + seed (premiere installation) |

### Qualite du code

| Commande | Description |
|----------|-------------|
| `npm run lint` | Linter ESLint (`src/`) |
| `npm run type-check` | Verification TypeScript (`tsc --noEmit`) |
| `npm run format` | Formatter avec Prettier |
| `npm run format:check` | Verifier le formatage |

### Tests

| Commande | Description |
|----------|-------------|
| `npm run test` | Tests unitaires Vitest (run) |
| `npm run test:watch` | Tests unitaires en mode watch |
| `npm run test:coverage` | Tests avec couverture |
| `npm run test:e2e` | Tests end-to-end Playwright |

### Docker Compose

```bash
# Demarrer PostgreSQL
docker compose -f docker-compose.dev.yml up -d

# Voir les logs
docker compose -f docker-compose.dev.yml logs -f postgres

# Arreter
docker compose -f docker-compose.dev.yml down

# Arreter et supprimer les donnees
docker compose -f docker-compose.dev.yml down -v
```

## Structure du code

### Conventions de nommage

| Element | Convention | Exemple |
|---------|-----------|---------|
| Composants | PascalCase | `SubmissionCard.tsx` |
| Hooks | camelCase avec prefixe `use` | `useVote.ts` |
| Utilitaires | kebab-case | `hot-score.ts` |
| Routes API | dossier/route.ts | `api/submissions/[id]/vote/route.ts` |
| Types | PascalCase | `SubmissionCardData` |
| Schemas Zod | camelCase + suffixe `Schema` | `submissionFormSchema` |
| Constantes | UPPER_SNAKE_CASE | `VALID_SORTS` |

### Organisation des composants

```
src/components/
├── ui/            # Composants de base (shadcn/ui, ne pas modifier directement)
├── layout/        # Mise en page (nav, footer, providers)
└── features/      # Composants metier organises par domaine
    ├── admin/     # Administration
    ├── auth/      # Authentification
    ├── comments/  # Commentaires
    ├── feed/      # Flux principal
    └── ...        # 19 domaines au total
```

### Ajout d'un composant shadcn/ui

```bash
npx shadcn add <nom-du-composant>
```

La configuration est dans `components.json` (style "new-york", imports `@/components/ui`).

### Organisation des routes API

Chaque endpoint suit le pattern :

```typescript
// src/app/api/[domaine]/[id]/[action]/route.ts
import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // 1. Rate limiting
  const rateLimited = await checkRateLimit('vote', getClientIp(req.headers));
  if (rateLimited) return apiError('RATE_LIMITED', rateLimited, 429);

  // 2. Validation (Zod)
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError('VALIDATION_ERROR', '...', 400);

  // 3. Auth (optionnel)
  const session = await auth();

  // 4. Logique metier
  const result = await doSomething(parsed.data);

  // 5. Reponse
  return apiSuccess(result);
}
```

### Alias de chemin

Le projet utilise l'alias `@/*` → `./src/*` dans `tsconfig.json`.

```typescript
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { apiSuccess } from '@/lib/api/response';
```

## Patterns de developpement

### Ajout d'une nouvelle route de page

1. Creer le fichier `src/app/<route>/page.tsx`
2. Definir les metadata (titre, description, OG)
3. Choisir le mode de rendu (SSR avec ISR ou client component)
4. Utiliser les composants existants de `features/`

### Ajout d'un nouvel endpoint API

1. Creer `src/app/api/<domaine>/route.ts`
2. Importer `apiSuccess`/`apiError` depuis `@/lib/api/response`
3. Ajouter le rate limiting avec `checkRateLimit`
4. Valider les entrees avec un schema Zod de `@/lib/utils/validation`
5. Ajouter l'auth si necessaire avec `auth()` ou `requireAuth()`

### Ajout d'une nouvelle table

1. Definir la table dans `src/lib/db/schema.ts` avec Drizzle
2. Definir les relations
3. Exporter les types (`type NewX = typeof x.$inferInsert`)
4. `npm run db:push` pour appliquer le schema

### Ajout d'un hook de donnees

1. Creer `src/hooks/use<Nom>.ts`
2. Utiliser `useQuery` ou `useInfiniteQuery` de TanStack React Query
3. Definir les mutations avec `useMutation` + `queryClient.invalidateQueries`
4. Implementer les mises a jour optimistes si necessaire

## Conventions de contribution

### Branches

| Prefixe | Usage |
|---------|-------|
| `feat/` | Nouvelle fonctionnalite |
| `fix/` | Correction de bug |
| `refactor/` | Refactoring |
| `docs/` | Documentation |

### Workflow

1. Creer une branche depuis `master`
2. Developper les changements
3. Verifier : `npm run lint && npm run type-check && npm run test`
4. Formatter : `npm run format`
5. Pousser et ouvrir une Pull Request vers `master`

### Regles

- Ne pas pousser directement sur `master`
- Une PR par fonctionnalite ou correction
- Le code doit passer lint + type-check
- Formatter avec Prettier avant de commit
- TypeScript strict, pas de `any`
- Tailwind CSS uniquement (pas de CSS custom sauf tokens)
