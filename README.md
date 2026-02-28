# C'est Nicolas qui paye

Plateforme citoyenne de transparence fiscale. Les utilisateurs soumettent des exemples de depenses publiques, votent, commentent et partagent.

## Stack technique

- **Frontend** : Next.js 16, React 19, TailwindCSS 4, shadcn/ui
- **Backend** : Next.js API Routes, NextAuth v5 (JWT)
- **Base de donnees** : PostgreSQL 16, Drizzle ORM
- **Etat client** : TanStack React Query, Zustand

## Prerequis

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://docs.docker.com/get-docker/) et Docker Compose
- npm (inclus avec Node.js)

## Installation rapide

### 1. Cloner le depot

```bash
git clone <url-du-repo>
cd CestNicolasQuiPaye
```

### 2. Lancer PostgreSQL

```bash
docker compose -f docker-compose.dev.yml up -d
```

Cela demarre un conteneur PostgreSQL 16 sur le port `5433` avec les identifiants :
- **Utilisateur** : `liberal`
- **Mot de passe** : `liberal`
- **Base** : `liberal`

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Editez `.env` et generez un secret pour NextAuth :

```bash
# Generer AUTH_SECRET
openssl rand -base64 32
```

Collez la valeur generee dans `AUTH_SECRET=` du fichier `.env`.

Les variables Google OAuth sont optionnelles pour le developpement local (la connexion par email/mot de passe fonctionne sans).

### 4. Installer les dependances

```bash
npm install
```

### 5. Initialiser la base de donnees

```bash
npm run db:setup
```

Cette commande pousse le schema Drizzle vers PostgreSQL puis execute le script de seed (50 soumissions de depenses publiques).

### 6. Lancer le serveur de developpement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Commandes utiles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de dev Next.js (Turbopack) |
| `npm run build` | Build de production |
| `npm run lint` | Linter ESLint |
| `npm run type-check` | Verification TypeScript |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright) |
| `npm run db:push` | Pousser le schema vers PostgreSQL |
| `npm run db:seed` | Seed des donnees de base |
| `npm run db:setup` | Push schema + seed (premiere installation) |
| `npm run db:studio` | Interface visuelle Drizzle Studio |
| `npm run format` | Formatter le code (Prettier) |

## Docker Compose (dev)

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

## Structure du projet

```
src/
  app/          # Routes Next.js (App Router)
  components/   # Composants React
  hooks/        # Hooks personnalises
  lib/          # Logique metier, DB, auth, utils
  stores/       # Zustand (cache de votes)
  types/        # Types TypeScript
scripts/        # Scripts (seed, etc.)
public/         # Assets statiques
```

## Contribuer

### Workflow

1. **Forker** le depot (ou creer une branche si vous avez les droits)
2. **Creer une branche** depuis `master` pour votre modification :
   ```bash
   git checkout master
   git pull origin master
   git checkout -b feat/ma-fonctionnalite
   ```
3. **Developper** vos changements sur cette branche
4. **Verifier** que tout passe avant de pousser :
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```
5. **Pousser** votre branche et **ouvrir une Pull Request** vers `master` :
   ```bash
   git push origin feat/ma-fonctionnalite
   ```
6. Decrivez vos changements dans la PR et attendez la review

### Conventions de nommage des branches

| Prefixe | Usage |
|---|---|
| `feat/` | Nouvelle fonctionnalite |
| `fix/` | Correction de bug |
| `refactor/` | Refactoring sans changement fonctionnel |
| `docs/` | Documentation uniquement |

### Regles

- Ne pas pousser directement sur `master`
- Une PR par fonctionnalite ou correction
- Le code doit passer le lint et le type-check
- Formatter avec `npm run format` avant de commit

## Licence

MIT
