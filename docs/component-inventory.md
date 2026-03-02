# Inventaire des composants

> **Projet :** C'EST NICOLAS QUI PAIE
> **Date :** 2026-02-28
> **Total :** ~95 composants React

## Organisation

```
src/components/
├── ui/          # 14 composants de base (shadcn/ui + Radix)
├── layout/      # 5 composants de mise en page
└── features/    # ~76 composants metier (19 domaines)
```

## Composants UI de base (shadcn/ui)

Composants de base construits sur Radix UI, personnalises avec Tailwind CSS 4.

| Composant | Fichier | Description |
|-----------|---------|-------------|
| Avatar | ui/avatar.tsx | Affichage d'avatar |
| Badge | ui/badge.tsx | Badge/pilule avec variantes |
| Button | ui/button.tsx | Bouton avec variantes (CVA) |
| Card | ui/card.tsx | Conteneur carte |
| Dialog | ui/dialog.tsx | Modale/dialogue |
| DropdownMenu | ui/dropdown-menu.tsx | Menu deroulant |
| Input | ui/input.tsx | Champ de texte |
| ScrollArea | ui/scroll-area.tsx | Zone defilable |
| Separator | ui/separator.tsx | Separateur horizontal/vertical |
| Skeleton | ui/skeleton.tsx | Chargement generique |
| SkeletonCard | ui/skeleton-card.tsx | Chargement carte |
| Sonner | ui/sonner.tsx | Notifications toast |
| Tabs | ui/tabs.tsx | Navigation par onglets |
| Textarea | ui/textarea.tsx | Zone de texte |

## Composants de mise en page

| Composant | Fichier | Description | Dependances cles |
|-----------|---------|-------------|-----------------|
| DesktopNav | layout/DesktopNav.tsx | Navigation desktop avec auth et dropdown | NextAuth, Image, DropdownMenu |
| MobileHeader | layout/MobileHeader.tsx | Header mobile avec logo | Image |
| MobileTabBar | layout/MobileTabBar.tsx | Barre d'onglets mobile (bas) | Lucide, NextAuth |
| Footer | layout/Footer.tsx | Pied de page desktop | — |
| Providers | layout/Providers.tsx | Wrapper de providers (Auth, QueryClient, Sonner) | NextAuth, React Query |

## Composants metier par domaine

### Administration (7 composants)

| Composant | Description | API |
|-----------|-------------|-----|
| BroadcastTool | Interface de diffusion Twitter/X | POST /api/admin/broadcast |
| DashboardMetricCard | Cartes KPI avec icones | — |
| FeatureManagementTable | Gestion des propositions de fonctionnalites | GET/PATCH /api/features |
| FlaggedContentQueue | File de contenu signale | GET /api/admin/flags, POST moderate |
| ModerationQueue | File de moderation des soumissions | GET /api/admin/submissions, POST moderate |
| QuickLinksPanel | Liens rapides admin | — |
| RecentActivityFeed | Flux d'activite recente | — (props) |

### Authentification (6 composants)

| Composant | Description | API |
|-----------|-------------|-----|
| LoginForm | Formulaire de connexion (email + Google) | NextAuth signIn |
| RegisterForm | Formulaire d'inscription | POST /api/auth/register |
| DisplayNameForm | Formulaire de pseudonyme | PATCH /api/user/display-name |
| UserProfile | Affichage mini-profil (nav) | — (session) |
| WelcomeDisplayNameModal | Modale de bienvenue post-inscription | PATCH /api/user/display-name |
| WelcomePromptWrapper | Wrapper declencheur de modale premiere connexion | — |

### Commentaires (6 composants)

| Composant | Description | Etat |
|-----------|-------------|------|
| CommentForm | Formulaire de commentaire | useState |
| CommentItem | Commentaire individuel avec reponses | useState, motion |
| CommentSection | Section principale commentaires | useComments hook |
| CommentSkeleton | Skeleton de chargement | — |
| CommentThread | Fil de commentaires avec pagination | — (props) |
| CommentVoteButton | Vote sur commentaire | useCommentVote hook |

### Consequences (2 composants)

| Composant | Description | API |
|-----------|-------------|-----|
| ConsequenceCard | Affichage du cout par citoyen/contribuable | — (props) |
| ConsequenceLoader | Chargement et affichage des calculs de cout | POST /api/submissions/{id}/cost |

### Statut donnees (3 composants)

| Composant | Description |
|-----------|-------------|
| DataStatusTable | Tableau de fraicheur des denominateurs |
| FreshnessBadge | Badge fraicheur (fresh/stale) |
| VerifyLink | Lien de verification source |

### Vote fonctionnalites (4 composants)

| Composant | Description | API |
|-----------|-------------|-----|
| FeatureProposalCard | Carte de proposition | — (props) |
| FeatureProposalForm | Formulaire de proposition | POST /api/features |
| FeatureProposalList | Liste avec filtrage et tri | GET /api/features (infinite) |
| FeatureVoteButton | Bouton de vote | POST /api/features/{id}/vote |

### Flux principal (8 composants)

| Composant | Description | Particularite |
|-----------|-------------|---------------|
| CategoryFilter | Filtre horizontal de categories | Motion, scroll horizontal |
| FeedList | Flux avec scroll infini | useInfiniteScroll, useVoteHydration |
| FeedPageClient | Wrapper client du flux | useState |
| FeedSkeleton | Skeleton de chargement | — |
| FeedSortTabs | Onglets de tri (hot/new/top) | useRef, router.push |
| HeroSection | Banniere hero avec stats | Motion, animations |
| SubmissionCard | Carte de soumission | Motion, useShare |
| TopTimeFilter | Filtre de periode (top) | router.push |

### Classement (3 composants)

| Composant | Description | API |
|-----------|-------------|-----|
| LeaderboardPageClient | Page principale classement | GET /api/leaderboard |
| LeaderboardTable | Tableau des classements | — (props) |
| PodiumCards | Podium top 3 utilisateurs | — (props) |

### Methodologie (3 composants)

| Composant | Description |
|-----------|-------------|
| FormulaDisplay | Affichage de formules mathematiques |
| FormulaSection | Section explicative d'une formule |
| LastUpdatedSection | Dernieres mises a jour des denominateurs |

### Notes communautaires (4 composants)

| Composant | Description | API |
|-----------|-------------|-----|
| CommunityNoteForm | Formulaire de note | — (onSubmit) |
| CommunityNoteItem | Note individuelle | — (props) |
| CommunityNoteSection | Section des notes | useCommunityNotes hook |
| PinnedNote | Note epinglee | — (props) |

### Profil (7 composants)

| Composant | Description | API |
|-----------|-------------|-----|
| DeleteAccountDialog | Dialogue suppression de compte | POST /api/user/delete |
| DeleteAccountSection | Section suppression | — |
| ProfileHeader | En-tete profil avec stats | — (props) |
| ProfileTabs | Onglets soumissions/votes | — |
| ProfileView | Vue complete du profil | — (props) |
| SubmissionsList | Liste des soumissions utilisateur | GET /api/v1/users/{id}/submissions |
| VotesList | Historique des votes | GET /api/v1/users/{id}/votes |

### Partage (1 composant)

| Composant | Description | API |
|-----------|-------------|-----|
| ShareButton | Bouton partage avec dropdown multi-plateforme | useShare hook, POST /api/submissions/{id}/share |

### Solutions (3 composants)

| Composant | Description | API |
|-----------|-------------|-----|
| SolutionForm | Formulaire de solution | — (onSubmit) |
| SolutionItem | Solution individuelle avec vote | — (props) |
| SolutionSection | Section des solutions | useSolutions hook |

### Sources (3 composants)

| Composant | Description | API |
|-----------|-------------|-----|
| AddSourceForm | Formulaire d'ajout de source | — (onSubmit) |
| SourceBadge | Badge source (domaine, compteur) | — (props) |
| SourceList | Liste des sources avec validation | useSources hook |

### Statistiques (6 composants)

| Composant | Description | Technologie |
|-----------|-------------|-------------|
| CategoryPieChart | Camembert par categorie | Recharts |
| GrandTotalCounter | Compteur anime du total | Motion |
| KpiCards | Cartes de metriques KPI | — |
| StatsPageClient | Page stats complete | — |
| TimelineChart | Graphique chronologique | Recharts (area) |
| Top10BarChart | Barres des top categories | Recharts |

### Soumissions (7 composants)

| Composant | Description | API |
|-----------|-------------|-----|
| ConsequenceCard | Carte de ventilation des couts | — (props) |
| EditSubmissionDialog | Dialogue d'edition | PATCH /api/submissions/{id} |
| FlagButton | Bouton de signalement | POST /api/submissions/{id}/flag |
| SourceUrlDisplay | Affichage URL source | — (props) |
| SubmissionDetail | Vue detail complete | — (props) |
| SubmissionForm | Formulaire de creation | POST /api/submissions |
| SuggestCorrectionDialog | Dialogue de suggestion correction | POST corrections |

### Tweets (3 composants)

| Composant | Description |
|-----------|-------------|
| TweetEmbed | Embed de tweet |
| TweetErrorBoundary | Error boundary pour tweets |
| TweetFallback | Fallback de chargement tweet |

### Vote (2 composants)

| Composant | Description | Etat |
|-----------|-------------|------|
| VoteButton | Bouton de vote large (page detail) | useVote hook |
| VoteButtonInline | Bouton de vote compact (carte flux) | useVote hook, Motion |

## Hooks personnalises

| Hook | Fichier | Description | API |
|------|---------|-------------|-----|
| useAuth | hooks/useAuth.ts | Gate d'authentification, redirection login | — |
| useVote | hooks/useVote.ts | Vote soumission (optimistic UI + Zustand) | POST /api/submissions/{id}/vote |
| useVoteHydration | hooks/useVoteHydration.ts | Chargement batch des votes | GET /api/votes/batch |
| useCommentVote | hooks/use-comment-vote.ts | Vote sur commentaire | POST /api/comments/{id}/vote |
| useComments | hooks/useComments.ts | Commentaires files + infinite scroll | GET/POST /api/submissions/{id}/comments |
| useCommunityNotes | hooks/useCommunityNotes.ts | Notes CRUD + vote | GET/POST notes, POST vote |
| useSolutions | hooks/useSolutions.ts | Solutions CRUD + vote | GET/POST solutions, POST vote |
| useSources | hooks/useSources.ts | Sources CRUD + validation | GET/POST sources, POST validate |
| useInfiniteScroll | hooks/useInfiniteScroll.ts | Intersection Observer + pagination | GET /api/feed |
| useShare | hooks/use-share.ts | Partage multi-plateforme | POST /api/submissions/{id}/share |
| usePageView | hooks/use-page-view.ts | Tracking analytics | POST /api/page-views |

## Store Zustand

| Store | Fichier | Description |
|-------|---------|-------------|
| useVoteStore | stores/vote-store.ts | Cache client des votes et compteurs (optimistic UI) |

**Structure :** `votes: Map<id, 'up'|'down'|null>`, `counts: Map<id, {up, down}>`

## Patterns architecturaux

- **Etat serveur :** TanStack React Query (cache, revalidation, infinite scroll)
- **Etat client :** Zustand pour les votes (persistance entre navigations)
- **Mutations optimistes :** Mise a jour UI immediate, rollback si erreur
- **Composants serveur :** Pages et layouts SSR
- **Composants client :** Formulaires, interactions, animations (`'use client'`)
- **Error boundaries :** Isolation des erreurs par zone
- **Skeleton loading :** Chargement progressif par zone
