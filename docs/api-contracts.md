# Contrats API

> **Projet :** C'EST NICOLAS QUI PAIE
> **Date :** 2026-02-28
> **Format de reponse :** `{ data, error, meta }`

## Format de reponse standardise

Toutes les reponses suivent cette enveloppe :

```json
{
  "data": "<objet|tableau|null>",
  "error": null | { "code": "string", "message": "string", "details": {} },
  "meta": { "cursor": "string|null", "hasMore": true, "totalCount": 0, "requestId": "uuid" }
}
```

## Codes d'erreur

| Code | HTTP | Usage |
|------|------|-------|
| VALIDATION_ERROR | 400 | Format d'entree invalide |
| BAD_REQUEST | 400 | Structure de requete invalide |
| UNAUTHORIZED | 401 | Authentification requise |
| FORBIDDEN | 403 | Permissions insuffisantes |
| NOT_FOUND | 404 | Ressource introuvable |
| CONFLICT / DUPLICATE | 409 | Conflit d'unicite |
| RATE_LIMITED | 429 | Limite de debit depassee |
| EXTERNAL_ERROR | 502 | Erreur service tiers |
| INTERNAL_ERROR | 500 | Erreur serveur |

## Middleware

**Fichier :** `src/middleware.ts`

Routes protegees :
- `/admin/*` → role `admin` requis
- `/profile`, `/profile/settings/*` → authentification requise
- `/submit` → ouvert a tous (y compris anonymes)
- Toutes les autres → redirection vers `/feed/hot` si non autorise

---

## 1. Authentification

### POST /api/auth/register

Inscription par email/mot de passe.

| Propriete | Detail |
|-----------|--------|
| Auth | Non requise |
| Rate limit | `registration` (3/1h, IP) |
| Body | `{ email: string, password: string }` |
| Reponse | `{ id, email, anonymousId }` (201) |
| Erreurs | VALIDATION_ERROR (400), CONFLICT (409 email existant), RATE_LIMITED (429) |

### GET/POST /api/auth/[...nextauth]

Handlers NextAuth (Google OAuth + Credentials). Gere automatiquement par Auth.js.

---

## 2. Flux principal

### GET /api/feed

Flux pagine de soumissions.

| Propriete | Detail |
|-----------|--------|
| Auth | Non requise |
| Rate limit | `api` (60/min, IP) |
| Parametres | `sort` (hot/new/top), `cursor`, `limit` (1-50, defaut 20), `timeWindow` (today/week/month/all) |
| Reponse | Tableau de soumissions avec `meta.cursor` et `meta.hasMore` |
| Erreurs | VALIDATION_ERROR (400), RATE_LIMITED (429) |

---

## 3. Soumissions

### POST /api/submissions

Creer une nouvelle soumission.

| Propriete | Detail |
|-----------|--------|
| Auth | Optionnelle (soumissions anonymes autorisees) |
| Rate limit | `submission` (5/24h auth, 2/24h anon, IP) |
| Body | `{ title: 1-200, description: 1-2000, estimatedCostEur: >0, sourceUrl: URL }` |
| Reponse | Soumission creee (201) |
| Traitement | Generation slug, detection tweet, statut `pending` |

### PATCH /api/submissions/[id]

Editer une soumission.

| Propriete | Detail |
|-----------|--------|
| Auth | Requise (auteur ou admin/moderateur) |
| Body | `{ title?, description?, estimatedCostEur?, sourceUrl?, ministryTag? }` |
| Reponse | `{ id, updatedAt }` |
| Erreurs | UNAUTHORIZED (401), FORBIDDEN (403), NOT_FOUND (404) |

### POST /api/submissions/[id]/vote

Voter sur une soumission.

| Propriete | Detail |
|-----------|--------|
| Auth | Optionnelle (userId ou IP hash) |
| Rate limit | `vote` (100/1h, IP) |
| Body | `{ voteType: "up"|"down" }` |
| Reponse | `{ upvoteCount, downvoteCount, userVote }` |
| Logique | Meme direction = retrait, direction opposee = basculement |

### DELETE /api/submissions/[id]/vote

Retirer un vote.

| Propriete | Detail |
|-----------|--------|
| Auth | Optionnelle |
| Reponse | `{ upvoteCount, downvoteCount, userVote: null }` |

### GET /api/submissions/[id]/comments

Commentaires files avec pagination.

| Propriete | Detail |
|-----------|--------|
| Parametres | `sort` (best/new), `cursor`, `limit`, `parentId` |
| Reponse | Commentaires top-level avec 3 reponses imbriquees, `totalCount`, `hasMore` |
| Profondeur | 3 niveaux maximum |

### POST /api/submissions/[id]/comments

Creer un commentaire.

| Propriete | Detail |
|-----------|--------|
| Auth | Requise |
| Rate limit | `comment` (20/1h, IP) |
| Body | `{ body: 1-2000, parentCommentId?: UUID }` |
| Reponse | Commentaire cree (201) |

### GET /api/submissions/[id]/sources

Lister les sources d'une soumission.

### POST /api/submissions/[id]/sources

Ajouter une source.

| Propriete | Detail |
|-----------|--------|
| Auth | Optionnelle |
| Rate limit | `source` (10/1h, IP) |
| Body | `{ url: URL, title: 3-300, sourceType: enum }` |
| Erreurs | DUPLICATE (409) si meme URL deja liee |

### GET /api/submissions/[id]/notes

Lister les notes communautaires (triees par epinglage puis score).

### POST /api/submissions/[id]/notes

Creer une note communautaire.

| Propriete | Detail |
|-----------|--------|
| Auth | Requise |
| Rate limit | `communityNote` (5/1h, IP) |
| Body | `{ body: 10-500, sourceUrl?: URL }` |

### GET /api/submissions/[id]/solutions

Lister les solutions (triees par upvoteCount DESC).

### POST /api/submissions/[id]/solutions

Proposer une solution.

| Propriete | Detail |
|-----------|--------|
| Auth | Optionnelle |
| Rate limit | `comment` (20/1h, IP) |
| Body | `{ body: 10-2000 }` |

### POST /api/submissions/[id]/flag

Signaler une soumission.

| Propriete | Detail |
|-----------|--------|
| Auth | Requise |
| Rate limit | `api` (60/min) |
| Body | `{ reason: "inaccurate"|"spam"|"inappropriate", details?: string }` |
| Auto-flag | Quand nombre >= seuil (defaut 3), passe en `flagged` |

### GET /api/submissions/[id]/flag

Verifier si l'utilisateur courant a signale (`{ flagged: boolean }`).

### POST /api/submissions/[id]/share

Tracker un evenement de partage.

| Propriete | Detail |
|-----------|--------|
| Rate limit | `api` |
| Body | `{ platform: "twitter"|"facebook"|"whatsapp"|"copy_link"|"native" }` |

### GET /api/submissions/[id]/cost

Calculer le cout par contribuable.

| Propriete | Detail |
|-----------|--------|
| Parametres | `amount` (montant EUR en float) |
| Reponse | `{ cost_per_citizen, cost_per_taxpayer, cost_per_household, days_of_work_equivalent, equivalences, denominators_used }` |

---

## 4. Votes

### GET /api/votes/batch

Recuperer les etats de vote par lot.

| Propriete | Detail |
|-----------|--------|
| Auth | Optionnelle |
| Parametres | `ids` (UUIDs separes par virgule, max 50) |
| Reponse | Map `{ submissionId: voteType }` |

### POST /api/comments/[id]/vote

Voter sur un commentaire.

| Propriete | Detail |
|-----------|--------|
| Auth | Requise |
| Rate limit | `vote` |
| Body | `{ direction: "up"|"down" }` |
| Reponse | `{ commentId, direction, score, upvoteCount, downvoteCount }` |

### DELETE /api/comments/[id]/vote

Retirer un vote de commentaire.

### POST /api/notes/[id]/vote

Voter sur une note communautaire.

| Propriete | Detail |
|-----------|--------|
| Auth | Optionnelle (userId ou IP) |
| Body | `{ isUseful: boolean }` |
| Auto-pin | Epingle si score > 10 ET usefulPercent >= 80% |

### POST /api/solutions/[id]/vote

Voter sur une solution.

| Propriete | Detail |
|-----------|--------|
| Auth | Optionnelle (userId ou IP) |
| Body | `{ voteType: "up"|"down" }` |

### POST /api/sources/[id]/validate

Valider/invalider une source.

| Propriete | Detail |
|-----------|--------|
| Auth | Optionnelle (userId ou IP) |
| Body | `{ isValid: boolean }` |

---

## 5. Fonctionnalites (Feature Voting)

### GET /api/features

Lister les propositions de fonctionnalites.

| Propriete | Detail |
|-----------|--------|
| Parametres | `sortBy` (votes/created), `status`, `category`, `cursor`, `limit` |
| Reponse | Tableau avec vote utilisateur si authentifie |

### POST /api/features

Proposer une fonctionnalite.

| Propriete | Detail |
|-----------|--------|
| Auth | Requise |
| Rate limit | `submission` |
| Body | `{ title: 3-200, description: 10-1000, category: enum }` |

### PATCH /api/features/[id]

Mettre a jour le statut (admin).

| Propriete | Detail |
|-----------|--------|
| Auth | Admin requise |
| Body | `{ status, rejectionReason? }` |

### POST /api/features/[id]/vote

Voter sur une proposition.

| Propriete | Detail |
|-----------|--------|
| Auth | Requise |
| Rate limit | `vote` |
| Body | `{ value: number }` |

---

## 6. Utilisateurs

### GET /api/v1/users/[userId]

Profil utilisateur.

### GET /api/v1/users/[userId]/submissions

Soumissions d'un utilisateur (paginee, filtree si non proprietaire).

### GET /api/v1/users/[userId]/votes

Historique de votes (proprietaire uniquement).

### PATCH /api/user/display-name

Modifier le pseudonyme.

| Propriete | Detail |
|-----------|--------|
| Auth | Requise |
| Body | `{ displayName: 2-100 | null }` |
| Contrainte | Unicite, pas de mots reserves (admin, liberal, etc.) |

### POST /api/user/delete

Supprimer le compte.

| Propriete | Detail |
|-----------|--------|
| Auth | Requise |
| Body | `{ confirmation: "SUPPRIMER" }` |
| Traitement | Transaction : suppression votes, anonymisation soumissions/commentaires, soft delete utilisateur |

---

## 7. Analytics

### POST /api/page-views

Tracker une vue de page.

| Propriete | Detail |
|-----------|--------|
| Body | `{ pagePath, utmSource?, utmMedium?, utmCampaign?, referrer? }` |

### GET /api/leaderboard

Classement karma (top 50 utilisateurs).

| Propriete | Detail |
|-----------|--------|
| Rate limit | `api` |
| Reponse | `[{ rank, displayName, karma, tier, submissionCount, ... }]` |
| Cache | ISR 5 min |

### GET /api/og/[id]

Image OG dynamique (1200x630px).

| Propriete | Detail |
|-----------|--------|
| Cache | `public, max-age=86400, s-maxage=604800` |
| Contrainte | Soumission approuvee uniquement |

### GET /api/v1/denominators

Denominateurs de calcul caches.

---

## 8. Administration

### GET /api/admin/dashboard

Metriques du tableau de bord.

| Propriete | Detail |
|-----------|--------|
| Auth | Admin |
| Reponse | `{ pendingCount, flagsCount, approvedCount, broadcastsThisMonth, recentActions }` |

### GET /api/admin/submissions

File de moderation.

| Propriete | Detail |
|-----------|--------|
| Auth | Admin ou Moderateur |
| Parametres | `moderationStatus` (pending/approved/rejected/flagged), `limit` |

### POST /api/admin/submissions/[id]/moderate

Moderer une soumission.

| Propriete | Detail |
|-----------|--------|
| Auth | Admin ou Moderateur (remove = admin seul) |
| Body | `{ action: "approve"|"reject"|"request_edit"|"remove", reason?: string }` |
| Reponse | `{ id, action, newStatus }` |
| Audit | Insert dans `moderationActions` |

### GET /api/admin/flags

Contenu signale (top 50 par nombre de signalements).

### GET /api/admin/broadcast

Historique des diffusions Twitter.

### POST /api/admin/broadcast

Publier un tweet.

| Propriete | Detail |
|-----------|--------|
| Auth | Admin |
| Body | `{ submissionId: UUID, tweetText: 1-280 }` |
| Integration | Twitter/X API v2 via `postTweet()` |
| Contrainte | Soumission approuvee uniquement |
