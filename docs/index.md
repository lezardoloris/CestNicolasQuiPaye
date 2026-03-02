# C'EST NICOLAS QUI PAIE — Index de documentation

> **Date de generation :** 2026-02-28
> **Mode de scan :** Exhaustif (tous les fichiers source)
> **Type de projet :** Monolithe web (Next.js 16 fullstack)

## Vue rapide

| Propriete | Valeur |
|-----------|--------|
| **Type** | Application web monolithique |
| **Langage** | TypeScript 5.9 (strict) |
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Base de donnees** | PostgreSQL 16 + Drizzle ORM |
| **Auth** | NextAuth v5 (JWT, Google OAuth + Credentials) |
| **Etat** | TanStack React Query + Zustand |
| **UI** | Tailwind CSS 4, shadcn/ui, Radix UI |
| **Tests** | Vitest (unitaire) + Playwright (E2E) |
| **Deploiement** | Railway |
| **Point d'entree** | `src/app/layout.tsx` |
| **Schema DB** | `src/lib/db/schema.ts` (22 tables) |
| **Endpoints API** | ~30 routes REST |
| **Composants** | ~95 composants React |

## Documentation generee

| Document | Description |
|----------|-------------|
| [Vue d'ensemble du projet](./project-overview.md) | Resume executif, stack, metriques |
| [Architecture](./architecture.md) | Patterns, couches, securite, scoring, rendu |
| [Analyse de l'arbre source](./source-tree-analysis.md) | Arbre complet annote, repertoires critiques |
| [Contrats API](./api-contracts.md) | ~30 endpoints documentes (auth, body, reponse) |
| [Modeles de donnees](./data-models.md) | 22 tables avec colonnes, contraintes, relations |
| [Inventaire des composants](./component-inventory.md) | ~95 composants, hooks, stores |
| [Guide de developpement](./development-guide.md) | Installation, commandes, conventions |
| [Guide de deploiement](./deployment-guide.md) | Railway, variables, CI/CD |

## Documentation existante

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | Documentation principale du projet |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Guide de contribution |
| [LICENSE](../LICENSE) | Licence MIT |

## Demarrage rapide

### Pour comprendre le projet

1. Lire [Vue d'ensemble du projet](./project-overview.md) pour le contexte
2. Consulter [Architecture](./architecture.md) pour les decisions techniques
3. Explorer [Arbre source](./source-tree-analysis.md) pour la structure

### Pour developper

1. Suivre [Guide de developpement](./development-guide.md) pour l'installation
2. Consulter [Contrats API](./api-contracts.md) pour les endpoints
3. Voir [Inventaire des composants](./component-inventory.md) pour les composants existants
4. Verifier [Modeles de donnees](./data-models.md) pour le schema DB

### Pour deployer

1. Suivre [Guide de deploiement](./deployment-guide.md)

### Pour planifier de nouvelles fonctionnalites (PRD brownfield)

1. Lire **cet index** pour la vue d'ensemble
2. Utiliser [Architecture](./architecture.md) pour comprendre les contraintes
3. Consulter [Contrats API](./api-contracts.md) pour les endpoints existants
4. Verifier [Modeles de donnees](./data-models.md) pour le schema a etendre
5. Explorer [Inventaire des composants](./component-inventory.md) pour les composants reutilisables

## Guide pour l'IA

Ce dossier `docs/` est concu pour etre utilise comme contexte par les agents IA (Claude, etc.) lors de la planification et l'implementation de nouvelles fonctionnalites sur ce projet brownfield.

**Fichiers cles a charger :**
- `docs/index.md` — Point d'entree (ce fichier)
- `docs/architecture.md` — Decisions et contraintes architecturales
- `docs/data-models.md` — Schema de la base de donnees
- `docs/api-contracts.md` — Endpoints existants
- `docs/component-inventory.md` — Composants reutilisables
