# Modeles de donnees

> **Projet :** C'EST NICOLAS QUI PAIE
> **ORM :** Drizzle ORM (PostgreSQL 16)
> **Schema :** `src/lib/db/schema.ts`
> **Date :** 2026-02-28

## Vue d'ensemble

22 tables organisees en 5 domaines fonctionnels. Toutes les tables utilisent des UUID v4 comme cles primaires (sauf les tables de jointure).

## 1. Domaine Utilisateurs

### users

Comptes utilisateur avec roles et identite.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK, defaut gen | Identifiant unique |
| email | VARCHAR | UNIQUE, NOT NULL | Adresse email |
| emailVerified | TIMESTAMP | | Date de verification |
| passwordHash | VARCHAR | | Hash bcrypt (facteur 12) |
| displayName | VARCHAR | UNIQUE | Pseudonyme choisi |
| anonymousId | VARCHAR | UNIQUE, NOT NULL | "Nicolas #XXXX" (auto-genere) |
| name | VARCHAR | | Nom complet (OAuth) |
| image | VARCHAR | | URL avatar (OAuth) |
| role | ENUM | NOT NULL, defaut 'user' | user / moderator / admin |
| twitterId | VARCHAR | | ID Twitter lie |
| karmaScore | INTEGER | defaut 0 | Score karma calcule |
| deletedAt | TIMESTAMP | | Soft delete |
| createdAt | TIMESTAMP | NOT NULL, defaut now | Date creation |
| updatedAt | TIMESTAMP | NOT NULL, defaut now | Date modification |

### accounts

Comptes OAuth lies (Google).

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| userId | UUID | FK → users, NOT NULL | Utilisateur lie |
| type | VARCHAR | NOT NULL | Type de compte |
| provider | VARCHAR | NOT NULL | Fournisseur (google) |
| providerAccountId | VARCHAR | NOT NULL | ID chez le fournisseur |
| access_token | TEXT | | Token d'acces |
| refresh_token | TEXT | | Token de rafraichissement |
| expires_at | INTEGER | | Expiration du token |
| token_type | VARCHAR | | Type de token |
| scope | VARCHAR | | Portee OAuth |
| id_token | TEXT | | ID token OIDC |

**PK composee :** (provider, providerAccountId)

### sessions

Sessions NextAuth.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| sessionToken | VARCHAR | PK | Token de session |
| userId | UUID | FK → users, NOT NULL | Utilisateur |
| expires | TIMESTAMP | NOT NULL | Date d'expiration |

### verificationTokens

Tokens de verification email.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| identifier | VARCHAR | NOT NULL | Email ou identifiant |
| token | VARCHAR | NOT NULL | Token de verification |
| expires | TIMESTAMP | NOT NULL | Date d'expiration |

**PK composee :** (identifier, token)

## 2. Domaine Soumissions

### submissions

Soumissions de depenses publiques.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant unique |
| authorId | UUID | FK → users | Auteur (null si anonyme) |
| title | VARCHAR(200) | NOT NULL | Titre de la depense |
| slug | VARCHAR | NOT NULL, UNIQUE | Slug URL |
| description | TEXT | NOT NULL | Description detaillee |
| estimatedCostEur | NUMERIC | NOT NULL | Montant en euros |
| amount | NUMERIC | NOT NULL | Montant (alias) |
| sourceUrl | VARCHAR | | URL source initiale |
| tweetUrl | VARCHAR | | URL tweet associe |
| consequenceText | TEXT | | Texte de consequence |
| ogImageUrl | VARCHAR | | URL image OG personnalisee |
| ministryTag | VARCHAR | | Tag ministere/categorie |
| status | ENUM | NOT NULL, defaut 'published' | draft/published/hidden/deleted |
| moderationStatus | ENUM | NOT NULL, defaut 'pending' | pending/approved/rejected/flagged |
| upvoteCount | INTEGER | defaut 0 | Compteur de votes pour |
| downvoteCount | INTEGER | defaut 0 | Compteur de votes contre |
| commentCount | INTEGER | defaut 0 | Compteur commentaires |
| hotScore | NUMERIC | defaut 0 | Score de classement hot |
| costToNicolasResults | JSONB | | Resultats calcul cout (nouveau format) |
| createdAt | TIMESTAMP | NOT NULL | Date creation |
| updatedAt | TIMESTAMP | NOT NULL | Date modification |

### costCalculations

Cache des calculs de cout.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| submissionId | UUID | FK → submissions, UNIQUE | Soumission liee |
| amountEur | NUMERIC | NOT NULL | Montant calcule |
| costPerCitizen | NUMERIC | | Cout par citoyen |
| costPerTaxpayer | NUMERIC | | Cout par contribuable |
| costPerHousehold | NUMERIC | | Cout par menage |
| daysOfWorkEquivalent | NUMERIC | | Jours de travail |
| equivalences | JSONB | | Equivalences concretes |
| calculatedAt | TIMESTAMP | NOT NULL | Date du calcul |

### submissionSources

Sources justificatives.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| submissionId | UUID | FK → submissions, NOT NULL | Soumission liee |
| addedBy | UUID | FK → users | Auteur de l'ajout |
| url | VARCHAR | NOT NULL | URL de la source |
| title | VARCHAR(300) | NOT NULL | Titre de la source |
| sourceType | ENUM | NOT NULL | Type (official_report, press_article, etc.) |
| validationCount | INTEGER | defaut 0 | Validations positives |
| invalidationCount | INTEGER | defaut 0 | Validations negatives |
| createdAt | TIMESTAMP | NOT NULL | Date ajout |

**Contrainte UNIQUE :** (submissionId, url)

### sourceValidations

Validations communautaires des sources.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| sourceId | UUID | FK → submissionSources, NOT NULL | Source validee |
| userId | UUID | FK → users | Utilisateur (si auth) |
| ipHash | VARCHAR | | Hash IP (si anonyme) |
| isValid | BOOLEAN | NOT NULL | Validation positive/negative |
| createdAt | TIMESTAMP | NOT NULL | Date |

## 3. Domaine Interactions

### votes

Votes authentifies sur les soumissions.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| userId | UUID | FK → users, NOT NULL | Votant |
| submissionId | UUID | FK → submissions, NOT NULL | Soumission |
| voteType | ENUM | NOT NULL | up / down |
| createdAt | TIMESTAMP | NOT NULL | Date |

**Contrainte UNIQUE :** (userId, submissionId)

### ipVotes

Votes anonymes par hash IP (RGPD).

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| ipHash | VARCHAR | NOT NULL | Hash SHA-256 de l'IP |
| submissionId | UUID | FK → submissions, NOT NULL | Soumission |
| voteType | ENUM | NOT NULL | up / down |
| createdAt | TIMESTAMP | NOT NULL | Date |

**Contrainte UNIQUE :** (ipHash, submissionId)

### comments

Commentaires files (profondeur max 3).

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| submissionId | UUID | FK → submissions, NOT NULL | Soumission |
| authorId | UUID | FK → users | Auteur |
| parentCommentId | UUID | FK → comments | Parent (null = top-level) |
| body | TEXT | NOT NULL | Contenu du commentaire |
| depth | INTEGER | NOT NULL, defaut 0 | Niveau d'imbrication (0-2) |
| upvoteCount | INTEGER | defaut 0 | Votes pour |
| downvoteCount | INTEGER | defaut 0 | Votes contre |
| score | INTEGER | defaut 0 | Score (up - down) |
| deletedAt | TIMESTAMP | | Soft delete |
| createdAt | TIMESTAMP | NOT NULL | Date creation |

### commentVotes

Votes sur les commentaires.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| commentId | UUID | FK → comments, NOT NULL | Commentaire |
| userId | UUID | FK → users, NOT NULL | Votant |
| direction | VARCHAR | NOT NULL | up / down |
| createdAt | TIMESTAMP | NOT NULL | Date |

**Contrainte UNIQUE :** (commentId, userId)

### solutions

Propositions de solutions.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| submissionId | UUID | FK → submissions, NOT NULL | Soumission |
| authorId | UUID | FK → users | Auteur |
| body | TEXT | NOT NULL | Contenu (10-2000) |
| upvoteCount | INTEGER | defaut 0 | Votes pour |
| downvoteCount | INTEGER | defaut 0 | Votes contre |
| createdAt | TIMESTAMP | NOT NULL | Date |

### solutionVotes

Votes sur les solutions.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| solutionId | UUID | FK → solutions, NOT NULL | Solution |
| userId | UUID | FK → users | Votant auth |
| ipHash | VARCHAR | | Votant anonyme |
| voteType | ENUM | NOT NULL | up / down |
| createdAt | TIMESTAMP | NOT NULL | Date |

### communityNotes

Notes communautaires (style Twitter).

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| submissionId | UUID | FK → submissions, NOT NULL | Soumission |
| authorId | UUID | FK → users | Auteur |
| body | TEXT | NOT NULL | Contenu (10-500) |
| sourceUrl | VARCHAR | | URL source optionnelle |
| isPinned | BOOLEAN | defaut false | Epinglee (auto si score > 10 et 80% utile) |
| usefulCount | INTEGER | defaut 0 | Votes "utile" |
| notUsefulCount | INTEGER | defaut 0 | Votes "pas utile" |
| score | INTEGER | defaut 0 | Score net |
| createdAt | TIMESTAMP | NOT NULL | Date |

### communityNoteVotes

Votes sur les notes communautaires.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| noteId | UUID | FK → communityNotes, NOT NULL | Note |
| userId | UUID | FK → users | Votant auth |
| ipHash | VARCHAR | | Votant anonyme |
| isUseful | BOOLEAN | NOT NULL | Utile oui/non |
| createdAt | TIMESTAMP | NOT NULL | Date |

## 4. Domaine Administration

### moderationActions

Piste d'audit de moderation.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| submissionId | UUID | FK → submissions, NOT NULL | Soumission moderee |
| adminUserId | UUID | FK → users, NOT NULL | Administrateur |
| action | VARCHAR | NOT NULL | approve/reject/request_edit/remove |
| reason | TEXT | | Raison de la decision |
| createdAt | TIMESTAMP | NOT NULL | Date |

### flags

Signalements utilisateurs.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| submissionId | UUID | FK → submissions, NOT NULL | Soumission signalee |
| userId | UUID | FK → users, NOT NULL | Signaleur |
| reason | VARCHAR | NOT NULL | inaccurate/spam/inappropriate |
| details | TEXT | | Details supplementaires |
| createdAt | TIMESTAMP | NOT NULL | Date |

### broadcasts

File de diffusion Twitter/X.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| submissionId | UUID | FK → submissions, NOT NULL | Soumission diffusee |
| adminUserId | UUID | FK → users, NOT NULL | Admin emetteur |
| tweetText | VARCHAR(280) | NOT NULL | Texte du tweet |
| tweetUrl | VARCHAR | | URL du tweet publie |
| status | ENUM | NOT NULL, defaut 'draft' | draft/sent/failed |
| createdAt | TIMESTAMP | NOT NULL | Date |

### featureVotes

Propositions de fonctionnalites.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| title | VARCHAR(200) | NOT NULL | Titre de la proposition |
| description | TEXT | NOT NULL | Description |
| category | VARCHAR | NOT NULL | general/data/ux/social/tech |
| status | VARCHAR | defaut 'proposed' | proposed/planned/in_progress/shipped/declined |
| authorId | UUID | FK → users | Auteur |
| voteCount | INTEGER | defaut 0 | Nombre de votes |
| rejectionReason | TEXT | | Raison de refus (si declined) |
| createdAt | TIMESTAMP | NOT NULL | Date |

### featureVoteBallots

Bulletins de vote fonctionnalites.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| featureVoteId | UUID | FK → featureVotes, NOT NULL | Proposition |
| userId | UUID | FK → users, NOT NULL | Votant |
| voteValue | INTEGER | NOT NULL | Valeur du vote |
| createdAt | TIMESTAMP | NOT NULL | Date |

**Contrainte UNIQUE :** (featureVoteId, userId)

## 5. Domaine Analytique

### shareEvents

Evenements de partage.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| submissionId | UUID | FK → submissions, NOT NULL | Soumission partagee |
| platform | ENUM | NOT NULL | twitter/facebook/whatsapp/copy_link/native |
| createdAt | TIMESTAMP | NOT NULL | Date |

### pageViews

Vues de pages.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| id | UUID | PK | Identifiant |
| pagePath | VARCHAR | NOT NULL | Chemin de la page |
| utmSource | VARCHAR | | Source UTM |
| utmMedium | VARCHAR | | Medium UTM |
| utmCampaign | VARCHAR | | Campagne UTM |
| referrer | VARCHAR | | Referrer HTTP |
| createdAt | TIMESTAMP | NOT NULL | Date |

## Diagramme des relations

```
users ──┬── submissions ──┬── votes
        │                 ├── ipVotes
        │                 ├── comments ──── commentVotes
        │                 ├── solutions ──── solutionVotes
        │                 ├── communityNotes ──── communityNoteVotes
        │                 ├── submissionSources ──── sourceValidations
        │                 ├── costCalculations
        │                 ├── shareEvents
        │                 ├── flags
        │                 ├── moderationActions
        │                 └── broadcasts
        │
        ├── accounts (OAuth)
        ├── sessions
        ├── featureVotes ──── featureVoteBallots
        └── verificationTokens
```

## Commandes de gestion

| Commande | Description |
|----------|-------------|
| `npm run db:push` | Pousser le schema vers PostgreSQL |
| `npm run db:generate` | Generer les fichiers de migration |
| `npm run db:migrate` | Executer les migrations |
| `npm run db:studio` | Interface Drizzle Studio |
| `npm run db:seed` | Seed initial (50+ depenses) |
| `npm run db:reseed` | Re-seed (reset + seed) |
| `npm run db:setup` | Push schema + seed (premiere installation) |
