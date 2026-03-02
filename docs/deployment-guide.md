# Guide de deploiement

> **Projet :** C'EST NICOLAS QUI PAIE
> **Plateforme :** Railway
> **Date :** 2026-02-28

## Infrastructure

### Architecture de deploiement

```
┌──────────────────────────────────────────┐
│                 Railway                   │
│  ┌────────────────────────────────────┐  │
│  │   Next.js (Node.js)               │  │
│  │   - Build: npm run build          │  │
│  │   - Start: npm run start          │  │
│  │   - Port: auto-detecte            │  │
│  └───────────────┬────────────────────┘  │
│                  │                        │
│  ┌───────────────▼────────────────────┐  │
│  │   PostgreSQL 16                    │  │
│  │   (Provision Railway ou externe)   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │   Upstash Redis (externe)         │  │
│  │   - Cache denominateurs            │  │
│  │   - Rate limiting                  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### Configuration Railway

Fichier `railway.toml` :

```toml
[build]
buildCommand = "npm run build"

[deploy]
startCommand = "npm run start"
```

**Note :** Le build inclut `drizzle-kit push` (schema DB) suivi de `next build`.

## Variables d'environnement (production)

### Requises

| Variable | Description | Securite |
|----------|-------------|----------|
| `DATABASE_URL` | URL PostgreSQL de production | Secret |
| `AUTH_SECRET` | Secret JWT NextAuth (32 bytes base64) | Secret |
| `AUTH_URL` | URL publique de l'application | Public |
| `NEXT_PUBLIC_APP_URL` | URL publique (build-time) | Public |

### Recommandees

| Variable | Description | Securite |
|----------|-------------|----------|
| `UPSTASH_REDIS_REST_URL` | URL Redis Upstash | Secret |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis | Secret |
| `GOOGLE_CLIENT_ID` | OAuth Google | Secret |
| `GOOGLE_CLIENT_SECRET` | OAuth Google | Secret |
| `IP_HASH_SALT` | Sel de hashage IP (RGPD) | Secret |

### Optionnelles

| Variable | Description |
|----------|-------------|
| `COST_ENGINE_URL` | URL microservice calcul de cout |
| `COST_ENGINE_KEY` | Cle API microservice |
| `TWITTER_BEARER_TOKEN` | API Twitter/X pour broadcasts |
| `FLAG_AUTO_QUEUE_THRESHOLD` | Seuil auto-flagging (defaut: 3) |

## Processus de build

```bash
# 1. Push du schema vers la base de donnees
drizzle-kit push

# 2. Build Next.js (inclut SSR, ISR, generation statique)
next build
```

Pages pre-rendues au build :
- `/feed/hot`, `/feed/new`, `/feed/top` (ISR 60s)
- Routes statiques (contribuer, methodologie, etc.)

## Base de donnees

### Migrations

En production, le schema est pousse automatiquement lors du build (`drizzle-kit push` dans le script `build`).

Pour les migrations manuelles :

```bash
npm run db:generate    # Generer les migrations
npm run db:migrate     # Appliquer les migrations
```

### Seed (premiere installation)

```bash
npm run db:seed
```

Le seed est idempotent (verifie un flag `isSeeded`).

### Connexion

- Pool : 10 connexions max
- Idle timeout : 20 secondes
- Connect timeout : 10 secondes

## Cache et performances

### Strategie ISR (Incremental Static Regeneration)

| Route | TTL | Raison |
|-------|-----|--------|
| /feed/[sort] | 60s | Contenu dynamique, SEO |
| /s/[id] | 300s | Detail soumission |
| /stats | 300s | Donnees agregees |
| /leaderboard | 300s | Classement |
| /methodologie | 3600s | Semi-statique |
| /data-status | 3600s | Denominateurs caches |

### Cache des denominateurs

Cache multi-niveaux (memoire → Redis → API → seed) avec TTL 24h.

### Headers de securite

Configures dans `next.config.ts` :
- CSP strict
- HSTS avec preload
- X-Frame-Options: DENY
- Protection XSS

## Monitoring

### Logging

Pino avec pino-pretty en dev, JSON en production.

### Analytics

- Plausible (cookie-free)
- Umami (cookie-free)
- Tracking interne (pageViews, shareEvents)

## Checklist de deploiement

- [ ] Variables d'environnement configurees sur Railway
- [ ] `AUTH_SECRET` genere et configure
- [ ] `DATABASE_URL` pointe vers PostgreSQL de production
- [ ] Base de donnees accessible depuis Railway
- [ ] Schema DB pousse (`drizzle-kit push` via build)
- [ ] Seed execute si premiere installation
- [ ] Redis Upstash configure (rate limiting, cache)
- [ ] Domaine personnalise configure (si applicable)
- [ ] Headers de securite actifs
- [ ] OAuth Google configure (si utilise)

## CI/CD

Le depot contient des templates d'issues GitHub (`.github/ISSUE_TEMPLATE/`) pour la gestion de projet. Pas de pipeline CI/CD automatise detecte dans le depot — le deploiement se fait via Railway qui detecte les push sur la branche configuree.

### Workflow recommande

1. Developper sur une branche `feat/*` ou `fix/*`
2. Ouvrir une PR vers `master`
3. Verifier lint + type-check + tests
4. Merger dans `master`
5. Railway detecte le push et deploie automatiquement
