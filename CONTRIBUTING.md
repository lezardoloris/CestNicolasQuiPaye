# Contribuer a NICOLAS PAYE

Merci de vouloir contribuer ! Ce projet est 100% open source et communautaire. Tout le monde peut participer, que ce soit du code, du contenu, des corrections ou des idees.

## Comment contribuer

### 1. Contribuer du code

```bash
# Fork le repo puis clone
git clone https://github.com/<ton-username>/liberal.git
cd liberal

# Installe les dependances
npm install

# Copie les variables d'env
cp .env.example .env.local

# Lance le dev server
npm run dev
```

**Workflow :**
1. Cree une branche depuis `main` : `git checkout -b feat/ma-feature`
2. Code ta feature / fix
3. Verifie que ca passe : `npm run lint && npm run type-check`
4. Commit avec un message clair en francais ou anglais
5. Push et ouvre une Pull Request

**Conventions :**
- TypeScript strict, pas de `any`
- Tailwind CSS pour le style (pas de CSS custom sauf design tokens)
- Composants dans `src/components/features/` organises par domaine
- API routes dans `src/app/api/`
- Hooks custom dans `src/hooks/`
- Zod pour toute validation

### 2. Contribuer du contenu

Tu n'as pas besoin de coder ! Tu peux :
- **Ajouter des depenses publiques** directement sur le site via `/submit`
- **Proposer des solutions** sur chaque depense
- **Corriger des chiffres** en ouvrant une issue GitHub avec la source

### 3. Contribuer de l'educationnel

- Ajouter des explications claires sur les depenses
- Ecrire des articles de vulgarisation
- Creer des infographies (ouvre une issue pour proposer)

### 4. Reporter un bug ou proposer une idee

- **Bug** : ouvre une issue avec le label `bug`
- **Feature** : ouvre une issue avec le label `enhancement`
- **Contenu** : ouvre une issue avec le label `content`
- **Discussion** : utilise l'onglet Discussions sur GitHub

## Structure du projet

```
liberal/
  src/
    app/           # Pages Next.js (App Router)
    components/    # Composants React
      features/    # Composants metier (voting, feed, solutions...)
      layout/      # Layout (navbar, footer, tab bar)
      ui/          # Composants generiques (shadcn/ui)
    hooks/         # Hooks React custom
    lib/           # Logique serveur
      api/         # Fonctions API (votes, submissions...)
      db/          # Schema Drizzle + connexion
      utils/       # Utilitaires (validation, calculs, hash...)
    stores/        # Zustand stores
    types/         # Types TypeScript
  scripts/         # Scripts (seed, etc.)
```

## Stack technique

- **Framework** : Next.js 16 (App Router, React 19)
- **Base de donnees** : PostgreSQL + Drizzle ORM
- **Auth** : Auth.js v5 (next-auth)
- **State** : Zustand + TanStack React Query
- **Style** : Tailwind CSS 4 + shadcn/ui
- **Validation** : Zod v4
- **Deploy** : Railway

## Labels pour les issues

| Label | Description |
|-------|-------------|
| `good first issue` | Parfait pour commencer |
| `help wanted` | On a besoin d'aide |
| `bug` | Quelque chose ne marche pas |
| `enhancement` | Nouvelle fonctionnalite |
| `content` | Ajout/correction de contenu |
| `education` | Contenu educatif |
| `design` | UI/UX |

## Code de conduite

Soyez respectueux. Pas de harcelement, pas d'insultes. On est la pour ameliorer la transparence des finances publiques, pas pour se battre entre nous.

## Licence

Ce projet est sous licence MIT. En contribuant, vous acceptez que votre contribution soit sous la meme licence.
