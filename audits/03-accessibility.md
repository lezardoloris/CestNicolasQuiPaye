# Audit Accessibilite (a11y) — C'est Nicolas Qui Paye

**Date** : 2 mars 2026
**Referentiel** : WCAG 2.2 AA / RGAA 4.1
**Perimetre** : tous les composants `src/components/`, toutes les pages `src/app/`, feuilles de style `globals.css`

---

## Resume executif

L'application presente un niveau d'accessibilite globalement **bon**, avec de nombreux bons reflexes deja en place :

- `lang="fr"` sur `<html>` (excellent)
- Skip-to-content link fonctionnel
- `prefers-reduced-motion` globalement traite
- Focus visible systematique via `ring-2 ring-chainsaw-red`
- `aria-label`, `aria-pressed`, `aria-live` sur les composants interactifs (votes, filtres)
- Labels sur les formulaires, `role="alert"` sur les erreurs
- `aria-hidden="true"` sur les icones decoratives
- Recharts enveloppe dans des `role="img"` avec `aria-label` descriptifs (budget)
- Tables avec `<caption class="sr-only">` dans les sections budget

Neanmoins, **34 problemes** ont ete identifies, dont **4 critiques**, **10 hauts**, **14 moyens** et **6 faibles**.

---

## Synthese par severite

| Severite | Nombre |
|----------|--------|
| CRITICAL | 4 |
| HIGH     | 10 |
| MEDIUM   | 14 |
| LOW      | 6 |
| **Total** | **34** |

---

## Resultats detailles

### 1. STRUCTURE SEMANTIQUE & LANDMARKS

#### A11Y-01 — Absence de `<main>` sur plusieurs pages

| Champ | Valeur |
|-------|--------|
| **Severite** | HIGH |
| **WCAG** | 1.3.1 Info and Relationships, 2.4.1 Bypass Blocks |
| **Fichiers** | `src/app/submit/page.tsx:12`, `src/app/profile/page.tsx:28`, `src/app/profile/settings/page.tsx:31`, `src/app/data-status/page.tsx:19`, `src/app/methodologie/page.tsx:25`, `src/app/developers/page.tsx:151`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx` |
| **Description** | Ces pages utilisent `<div>` au lieu de `<main>` comme conteneur principal. Le skip-link `#main-content` ne trouvera pas de cible sur ces pages. Les lecteurs d'ecran ne peuvent pas identifier la zone de contenu principal. |
| **Correction** | Remplacer le `<div>` racine par `<main id="main-content">` sur chaque page concernee. |

#### A11Y-02 — Absence de landmark `<nav>` sur le footer

| Champ | Valeur |
|-------|--------|
| **Severite** | LOW |
| **WCAG** | 1.3.1 Info and Relationships |
| **Fichier** | `src/components/layout/Footer.tsx:3` |
| **Description** | Le footer contient des liens de navigation (Methodologie, API) mais ils ne sont pas enveloppes dans un `<nav>`. |
| **Correction** | Ajouter `<nav aria-label="Liens du pied de page">` autour des liens. |

#### A11Y-03 — Section `#deficit` et autres sections budget sans heading explicite

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 1.3.1 Info and Relationships, 2.4.6 Headings and Labels |
| **Fichier** | `src/components/features/budget/BudgetPageClient.tsx:68` |
| **Description** | La `<section id="deficit">` n'a pas de `<h2>` directement a l'interieur. Le heading est dans le composant enfant `DeficitCounter` mais pas forcement un heading semantique. |
| **Correction** | S'assurer que chaque `<section>` a un heading direct ou un `aria-labelledby` pointant vers un heading existant. |

---

### 2. ARIA & ROLES

#### A11Y-04 — `role="article"` redondant sur `<motion.article>`

| Champ | Valeur |
|-------|--------|
| **Severite** | LOW |
| **WCAG** | 4.1.2 Name, Role, Value |
| **Fichier** | `src/components/features/feed/SubmissionCard.tsx:51` |
| **Description** | L'element `<motion.article>` a deja un role implicite `article`. Ajouter `role="article"` est redondant. |
| **Correction** | Supprimer `role="article"`. |

#### A11Y-05 — Charts Recharts sans `role="img"` (Stats page)

| Champ | Valeur |
|-------|--------|
| **Severite** | HIGH |
| **WCAG** | 1.1.1 Non-text Content |
| **Fichiers** | `src/components/features/stats/CategoryPieChart.tsx:35`, `src/components/features/stats/TimelineChart.tsx:20`, `src/components/features/stats/Top10BarChart.tsx:26`, `src/components/features/simulator/BudgetAllocationChart.tsx:17` |
| **Description** | Contrairement aux graphiques de la page `/chiffres` qui ont correctement `role="img"` et `aria-label`, les graphiques de la page `/stats` et du simulateur n'ont aucun `role="img"` ni `aria-label` sur leur conteneur. Les lecteurs d'ecran ne peuvent pas decrire ces visualisations. |
| **Correction** | Envelopper chaque `<ResponsiveContainer>` dans un `<div role="img" aria-label="Description du graphique">`. |

#### A11Y-06 — XpProgressBar sans label accessible

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 1.1.1 Non-text Content, 4.1.2 Name, Role, Value |
| **Fichier** | `src/components/features/gamification/XpProgressBar.tsx:20` |
| **Description** | La barre de progression XP est un `<div>` pur sans semantique `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, ni label accessible. Un lecteur d'ecran ne communique aucune information. |
| **Correction** | Ajouter `role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Progression XP"` sur le conteneur de la barre. |

#### A11Y-07 — XpToast sans `role="status"` ni `aria-live`

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 4.1.3 Status Messages |
| **Fichier** | `src/components/features/gamification/XpToast.tsx:13` |
| **Description** | Les toasts XP qui apparaissent (+50 XP, level up) ne sont pas annonces aux technologies d'assistance. Le conteneur n'a pas `role="status"` ou `aria-live="polite"`. |
| **Correction** | Ajouter `role="status" aria-live="polite"` sur le conteneur des toasts. |

#### A11Y-08 — Zap icon sans `aria-hidden` dans XpProgressBar

| Champ | Valeur |
|-------|--------|
| **Severite** | LOW |
| **WCAG** | 1.1.1 Non-text Content |
| **Fichier** | `src/components/features/gamification/XpProgressBar.tsx:17` |
| **Description** | L'icone `<Zap>` dans XpProgressBar n'a pas `aria-hidden="true"`, ce qui peut lire "Zap" dans un lecteur d'ecran. |
| **Correction** | Ajouter `aria-hidden="true"` sur l'icone Zap. |

---

### 3. NAVIGATION CLAVIER

#### A11Y-09 — WelcomeDisplayNameModal bloque le clavier sans echappatoire

| Champ | Valeur |
|-------|--------|
| **Severite** | CRITICAL |
| **WCAG** | 2.1.2 No Keyboard Trap |
| **Fichier** | `src/components/features/auth/WelcomeDisplayNameModal.tsx:91-95` |
| **Description** | Le modal de bienvenue bloque Escape (`onEscapeKeyDown={(e) => e.preventDefault()}`), empeche le clic exterieur (`onPointerDownOutside={(e) => e.preventDefault()}`), et masque le bouton de fermeture (`showCloseButton={false}`). Un utilisateur clavier est piege : il ne peut fermer le dialog qu'en choisissant un pseudo ou en cliquant "Rester anonyme". Si le focus ne va pas correctement sur ces boutons, c'est un piege clavier pur. |
| **Correction** | Soit restaurer la touche Escape comme declencheur de "Rester anonyme", soit s'assurer que le focus initial est place sur le premier bouton interactif. Ajouter un `autoFocus` sur le champ pseudonyme ou le bouton "Rester anonyme". |

#### A11Y-10 — Stretched link `tabIndex={-1}` sur SubmissionCard

| Champ | Valeur |
|-------|--------|
| **Severite** | HIGH |
| **WCAG** | 2.1.1 Keyboard, 2.4.7 Focus Visible |
| **Fichier** | `src/components/features/feed/SubmissionCard.tsx:61` |
| **Description** | Le lien principal de la carte (`<Link tabIndex={-1}>`) est retire du flux de tabulation. Le titre `<h3>` n'est pas non plus focusable. Un utilisateur clavier ne peut pas naviguer vers une soumission individuelle via Tab. Les boutons de vote sont accessibles mais le lien vers la page detail est impossible a atteindre au clavier. |
| **Correction** | Retirer `tabIndex={-1}` du lien principal, ou ajouter un lien secondaire focusable dans le titre. Le pattern actuel "stretched link" est un anti-pattern clavier. |

#### A11Y-11 — BudgetNav dropdown: pas de gestion de focus a l'ouverture

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 2.4.3 Focus Order |
| **Fichier** | `src/components/features/budget/BudgetNav.tsx:61-93` |
| **Description** | Quand le dropdown s'ouvre, le focus reste sur le bouton declencheur. Les items du menu `role="menuitem"` ne recoivent pas le focus automatiquement. De plus, il n'y a pas de navigation par fleches Haut/Bas entre les items du menu. |
| **Correction** | A l'ouverture, deplacer le focus sur le premier `menuitem`. Implementer la navigation par ArrowUp/ArrowDown entre les items. Ou utiliser le composant `DropdownMenu` de Radix qui gere tout cela nativement. |

#### A11Y-12 — FamilySituationSelector: boutons toggle sans semantique appropriee

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 4.1.2 Name, Role, Value |
| **Fichier** | `src/components/features/simulator/FamilySituationSelector.tsx:26-42` |
| **Description** | Les boutons "Celibataire" et "Couple" fonctionnent comme un groupe de toggle/radio mais n'ont pas `aria-pressed`, `role="radiogroup"`, ou `role="group"`. Un lecteur d'ecran ne communique pas l'etat actif. |
| **Correction** | Ajouter `aria-pressed={isSingle}` / `aria-pressed={!isSingle}` sur les boutons, ou utiliser un `<fieldset>` avec des `<input type="radio">` visuellement masques. |

---

### 4. CONTRASTE DES COULEURS

#### A11Y-13 — `text-text-muted` sur fond clair : contraste insuffisant

| Champ | Valeur |
|-------|--------|
| **Severite** | CRITICAL |
| **WCAG** | 1.4.3 Contrast (Minimum) |
| **Fichiers** | Utilise dans ~80+ composants |
| **Description** | En mode clair : `--np-text-muted: #94A3B8` sur `--np-surface-primary: #FFFFFF`. Le ratio de contraste est **3.26:1** (requis : 4.5:1 pour texte normal, 3:1 pour gros texte). Ce token est utilise massivement pour les metadonnees (dates, compteurs de caracteres, descriptions secondaires, legendes de graphiques). |
| **Correction** | Assombrir `--np-text-muted` a au moins `#6B7280` (ratio 4.6:1) ou `#6E7A8A` en mode clair. En mode sombre, `--np-text-muted: #737373` sur `#111318` donne un ratio de **4.42:1**, egalement a la limite. Passer a `#8A8A8A` (5.1:1). |

#### A11Y-14 — `text-text-muted` 10px dans MobileTabBar et XpProgressBar

| Champ | Valeur |
|-------|--------|
| **Severite** | HIGH |
| **WCAG** | 1.4.3 Contrast (Minimum) |
| **Fichiers** | `src/components/features/gamification/XpProgressBar.tsx:27` (text-[10px]), `src/components/layout/MobileTabBar.tsx:40` (text-[10px]) |
| **Description** | Du texte a 10px avec la couleur `text-text-muted` combine un faible contraste ET une taille de police tres petite. A cette taille, le minimum WCAG AA est 4.5:1 et on est a 3.26:1. |
| **Correction** | Augmenter la taille a minimum 12px ou utiliser une couleur plus contrastee. |

#### A11Y-15 — `chainsaw-red` (#C62828) sur fond blanc : contraste au titre

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 1.4.3 Contrast (Minimum) |
| **Fichiers** | Multiples composants (montants, CTA) |
| **Description** | `#C62828` sur `#FFFFFF` donne un ratio de **4.68:1**. Suffisant pour du texte normal (>= 4.5:1), mais au-dessous du seuil AAA (7:1). Pour les gros textes (`text-3xl` et au-dessus), le ratio de 3:1 est respecte. Cependant, pour du texte a `text-xs` (petites tailles comme les badges), c'est insuffisant. |
| **Correction** | Pour les petits textes en chainsaw-red, envisager un rouge plus fonce (`#B71C1C`) ou s'assurer que le fond est toujours clair. |

#### A11Y-16 — `chainsaw-red/20` et `chainsaw-red/10` sur boutons actifs

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 1.4.11 Non-text Contrast |
| **Fichier** | `src/components/features/feed/TopTimeFilter.tsx:37` |
| **Description** | Les boutons actifs du filtre temporel utilisent `bg-chainsaw-red/20 text-chainsaw-red`. Le fond tres transparent peut ne pas fournir assez de contraste entre l'etat actif et inactif pour distinguer visuellement l'etat selectionne (contraste non-text 3:1 requis). |
| **Correction** | Augmenter l'opacite du fond a `/30` minimum, ou ajouter un indicateur additionnel (bordure, soulignement). |

---

### 5. LECTEURS D'ECRAN

#### A11Y-17 — Dialog close button en anglais "Close" dans un site francais

| Champ | Valeur |
|-------|--------|
| **Severite** | HIGH |
| **WCAG** | 3.1.2 Language of Parts |
| **Fichier** | `src/components/ui/dialog.tsx:77` |
| **Description** | Le `<span className="sr-only">Close</span>` du bouton de fermeture des dialogs est en anglais alors que l'interface est entierement en francais. |
| **Correction** | Remplacer par `<span className="sr-only">Fermer</span>`. |

#### A11Y-18 — DialogFooter close button en anglais "Close"

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 3.1.2 Language of Parts |
| **Fichier** | `src/components/ui/dialog.tsx:114` |
| **Description** | `<Button variant="outline">Close</Button>` dans DialogFooter est en anglais. |
| **Correction** | Remplacer par `Fermer`. |

#### A11Y-19 — Leaderboard avatar images sans alt descriptif

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 1.1.1 Non-text Content |
| **Fichier** | `src/components/features/leaderboard/LeaderboardTable.tsx:51` |
| **Description** | `<img src={entry.avatarUrl} alt="" />` : les avatars des contributeurs ont un alt vide. C'est acceptable pour des images decoratives, mais ici l'avatar est l'identifiant visuel d'un utilisateur. Il devrait indiquer le nom. |
| **Correction** | Mettre `alt={entry.displayName}` ou `alt={`Avatar de ${entry.displayName}`}`. |

#### A11Y-20 — DesktopSidebar: icones Lucide sans `aria-hidden`

| Champ | Valeur |
|-------|--------|
| **Severite** | LOW |
| **WCAG** | 1.1.1 Non-text Content |
| **Fichier** | `src/components/layout/DesktopSidebar.tsx:72,87,103,106` |
| **Description** | Les icones dans les liens de navigation (`<Icon>`, `<PlusCircle>`, `<Github>`, `<Zap>`) n'ont pas `aria-hidden="true"`. Puisqu'elles accompagnent du texte, elles devraient etre decoratives. |
| **Correction** | Ajouter `aria-hidden="true"` sur toutes les icones decoratives dans la sidebar. |

#### A11Y-21 — DesktopNav: icones Lucide dans le dropdown sans `aria-hidden`

| Champ | Valeur |
|-------|--------|
| **Severite** | LOW |
| **WCAG** | 1.1.1 Non-text Content |
| **Fichier** | `src/components/layout/DesktopNav.tsx:85,95,101,107,116` |
| **Description** | Les icones `<User>`, `<Settings>`, `<Shield>`, `<LogOut>` dans le dropdown du profil n'ont pas `aria-hidden="true"`. |
| **Correction** | Ajouter `aria-hidden="true"` sur ces icones. |

---

### 6. FORMULAIRES

#### A11Y-22 — Champ email Login/Register : pas d'`autocomplete`

| Champ | Valeur |
|-------|--------|
| **Severite** | HIGH |
| **WCAG** | 1.3.5 Identify Input Purpose |
| **Fichiers** | `src/components/features/auth/LoginForm.tsx:178`, `src/components/features/auth/RegisterForm.tsx:178` |
| **Description** | Les champs email ne possedent pas `autoComplete="email"`, et les champs mot de passe n'ont pas `autoComplete="current-password"` (login) ou `autoComplete="new-password"` (register). Les gestionnaires de mots de passe et les navigateurs ne peuvent pas remplir automatiquement ces champs. |
| **Correction** | Ajouter `autoComplete="email"` sur les inputs email, `autoComplete="current-password"` sur le mot de passe login, `autoComplete="new-password"` sur les mots de passe register. |

#### A11Y-23 — SubmissionForm : pas de `<fieldset>` ni `aria-required` visible pour le groupe

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 1.3.1 Info and Relationships |
| **Fichier** | `src/components/features/submissions/SubmissionForm.tsx` |
| **Description** | Le formulaire a des champs individuels bien labellises, mais le formulaire dans son ensemble manque d'un `aria-label` ou d'un titre associe via `aria-labelledby`. L'indicateur visuel `*` pour les champs obligatoires n'est pas explique textuellement. |
| **Correction** | Ajouter en haut du formulaire `<p class="sr-only">Les champs marques d'un asterisque sont obligatoires</p>` ou un texte visible equivalent. |

#### A11Y-24 — Simulator SalaryInput : input number sans label associe formellement

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 1.3.1 Info and Relationships |
| **Fichier** | `src/components/features/simulator/SalaryInput.tsx:63` |
| **Description** | Le champ `<input type="number">` pour la saisie manuelle a un `aria-label` mais pas de `<label>` associee par `htmlFor`. Le slider au-dessus a un `<label htmlFor="salary-input">` mais l'input number n'a pas cet id — le slider a cet id. Cela signifie que deux controles partagent potentiellement le meme label, ou que l'input number n'est lie qu'a son `aria-label`. |
| **Correction** | Donner un id unique a l'input number (ex: `id="salary-manual-input"`) avec un label `sr-only` ou conserver l'`aria-label`. |

---

### 7. ELEMENTS INTERACTIFS

#### A11Y-25 — SubmissionDetail: bouton "Une inexactitude?" sans label explicite

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 2.4.4 Link Purpose, 4.1.2 Name, Role, Value |
| **Fichier** | `src/components/features/submissions/SubmissionDetail.tsx:76-80` |
| **Description** | Le bouton inline "Une inexactitude ?" dans le banner source n'est qu'un `<button>` avec du texte. Bien que le texte soit descriptif, il manque d'un `aria-label` qui precise l'action : cela ouvre le dialogue de correction. |
| **Correction** | Ajouter `aria-label="Signaler une inexactitude et suggerer une correction"`. |

#### A11Y-26 — Taille de cible tactile insuffisante sur certains boutons

| Champ | Valeur |
|-------|--------|
| **Severite** | HIGH |
| **WCAG** | 2.5.8 Target Size (Minimum) |
| **Fichiers** | `src/components/features/voting/VoteButtonInline.tsx:50-57` (p-1.5 = 6px padding, total ~24x24), `src/components/features/feed/SubmissionCard.tsx:177-192` (bouton "Proposer une solution" avec py-1.5 px-3) |
| **Description** | Les boutons de vote inline et le bouton "Proposer" dans le feed ont une zone cliquable de ~24x24px, en dessous du minimum WCAG 2.2 de 24x24px CSS pixels (certains juste a la limite). La zone interactive des pouces de vote dans la carte est de ~32px avec le padding, mais les cibles restent petites sur mobile. |
| **Correction** | S'assurer que chaque bouton a au minimum `min-h-[44px] min-w-[44px]` pour les cibles tactiles, ou au moins 24px avec suffisamment d'espacement entre les cibles adjacentes. |

#### A11Y-27 — FlagButton radio inputs avec `sr-only` mais pas de focus visible

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 2.4.7 Focus Visible |
| **Fichier** | `src/components/features/submissions/FlagButton.tsx:129-136` |
| **Description** | Les inputs radio sont visuellement masques avec `sr-only`. Le style visuel change sur `checked` via le parent `<label>`, mais il n'y a pas d'anneau de focus visible quand l'utilisateur Tab entre les options radio. Le focus est sur l'input invisible et le style focus n'est pas applique au label visuel. |
| **Correction** | Ajouter un style `focus-within:ring-2 focus-within:ring-chainsaw-red` sur le `<label>` pour montrer le focus quand le radio contenu recoit le focus. |

---

### 8. GRAPHIQUES (RECHARTS)

#### A11Y-28 — Tooltips Recharts inaccessibles au clavier

| Champ | Valeur |
|-------|--------|
| **Severite** | HIGH |
| **WCAG** | 2.1.1 Keyboard |
| **Fichiers** | Tous les composants Recharts (`CategoryPieChart.tsx`, `TimelineChart.tsx`, `Top10BarChart.tsx`, `BudgetAllocationChart.tsx`, `MissionBarChart.tsx`, etc.) |
| **Description** | Les tooltips Recharts ne se declenchent qu'au survol de la souris. Un utilisateur clavier ne peut pas acceder aux informations detaillees des graphiques. C'est une limitation connue de Recharts. |
| **Correction** | Fournir une alternative textuelle : soit un tableau de donnees masque accessible, soit un lien "Voir les donnees en tableau" qui affiche les memes informations sous forme textuelle. Les `aria-label` existants sur certains graphiques aident, mais ne remplacent pas l'interaction. |

#### A11Y-29 — Cell `key={index}` dans les graphiques

| Champ | Valeur |
|-------|--------|
| **Severite** | LOW |
| **WCAG** | N/A (bonne pratique React) |
| **Fichiers** | `src/components/features/stats/CategoryPieChart.tsx:58`, `src/components/features/stats/Top10BarChart.tsx:67` |
| **Description** | Les `<Cell>` utilisent `key={index}` au lieu d'une cle stable. Ceci peut causer des bugs de re-rendu si les donnees changent. Ce n'est pas un probleme WCAG direct mais un anti-pattern du CLAUDE.md qui stipule : "Never use index as a key in lists where items can be reordered". |
| **Correction** | Utiliser `key={entry.category}` ou `key={entry.id}` selon le dataset. |

---

### 9. RESPONSIVE & ZOOM

#### A11Y-30 — `overflow-x: hidden` sur `<html>` peut masquer du contenu zoome

| Champ | Valeur |
|-------|--------|
| **Severite** | CRITICAL |
| **WCAG** | 1.4.10 Reflow |
| **Fichier** | `src/app/globals.css:157` |
| **Description** | La regle `html { overflow-x: hidden }` empeche le defilement horizontal. Si un utilisateur zoome a 200-400%, le contenu qui deborde horizontalement est coupe sans possibilite de defilement. |
| **Correction** | Supprimer `overflow-x: hidden` sur `<html>`. Si un debordement horizontal existe, le corriger au niveau des composants concernes via `max-width: 100%` et `overflow-wrap: break-word`. |

#### A11Y-31 — Textes en taille fixe `text-[10px]` et `text-[11px]`

| Champ | Valeur |
|-------|--------|
| **Severite** | MEDIUM |
| **WCAG** | 1.4.4 Resize Text |
| **Fichiers** | `src/components/features/feed/SubmissionCard.tsx:70,119,127`, `src/components/layout/DesktopSidebar.tsx:105`, `src/components/features/gamification/XpProgressBar.tsx:27,42`, `src/components/layout/MobileTabBar.tsx:40` |
| **Description** | Du texte a 10-11px est utilise pour des metadonnees. A ce niveau, le texte est difficile a lire pour les personnes avec des troubles visuels, meme avec un zoom de 200%. |
| **Correction** | Utiliser au minimum `text-xs` (12px) pour tout le contenu textuel lisible. Reserver les tailles < 12px uniquement pour le contenu purement decoratif. |

---

### 10. MOUVEMENT

#### A11Y-32 — Animations Framer Motion non desactivees par `prefers-reduced-motion`

| Champ | Valeur |
|-------|--------|
| **Severite** | CRITICAL |
| **WCAG** | 2.3.3 Animation from Interactions |
| **Fichiers** | `src/components/features/feed/SubmissionCard.tsx:48-50` (fade-in), `src/components/features/feed/HeroSection.tsx:22-26` (slide), `src/components/features/voting/VoteButtonInline.tsx:65-71` (AnimatePresence), `src/components/features/gamification/XpToast.tsx:49-54` (spring), `src/components/features/feed/CategoryFilter.tsx:97` (whileTap scale), `src/components/features/feed/MobileFeedFAB.tsx:28` (scale) |
| **Description** | Le `globals.css` desactive les animations CSS natives via `prefers-reduced-motion: reduce`, mais les animations Framer Motion (`motion/react`) ne sont PAS desactivees car elles utilisent le JavaScript, pas les transitions CSS. Chaque `<motion.article>`, `<AnimatePresence>`, `whileTap` continue de s'animer meme si l'utilisateur a active "Reduire les animations". |
| **Correction** | Ajouter un hook global `useReducedMotion()` de Framer Motion et conditionner toutes les animations. Ou ajouter dans `Providers.tsx` : `<LazyMotion features={domAnimation}><MotionConfig reducedMotion="user">...</MotionConfig></LazyMotion>` qui respecte automatiquement `prefers-reduced-motion`. |

---

### 11. LANGUE

#### A11Y-33 — Liens externes GitHub en anglais sans `lang="en"`

| Champ | Valeur |
|-------|--------|
| **Severite** | LOW |
| **WCAG** | 3.1.2 Language of Parts |
| **Fichiers** | `src/app/contribuer/page.tsx:129` ("Good First Issues"), `src/components/layout/DesktopSidebar.tsx:104` ("Contribuer sur GitHub") |
| **Description** | Le bouton "Good First Issues" est un terme anglais non marque linguistiquement. Les lecteurs d'ecran en mode francais prononceront ces mots avec une phonetique francaise. |
| **Correction** | Ajouter `lang="en"` sur les elements contenant du texte anglais : `<span lang="en">Good First Issues</span>`. |

#### A11Y-34 — Texte avec accents manquants dans certains labels

| Champ | Valeur |
|-------|--------|
| **Severite** | LOW |
| **WCAG** | Bonne pratique |
| **Fichiers** | `src/components/features/stats/CategoryPieChart.tsx:37` ("Repartition par categorie"), `src/components/features/stats/TimelineChart.tsx:22` ("Evolution dans le temps"), `src/components/features/comments/CommentItem.tsx:76` ("[Commentaire supprime]"), `src/components/features/consequences/ConsequenceCard.tsx:39-40` ("Cout pour Nicolas"), `src/components/features/stats/KpiCards.tsx:17` ("Categories", "Citoyens mobilises"), `src/app/profile/page.tsx:35` ("Parametres"), `src/components/features/auth/DisplayNameForm.tsx:63` ("Pseudonyme mis a jour avec succes") |
| **Description** | Plusieurs labels utilisent du texte sans accents francais ("Repartition" au lieu de "Repartition", "categorie" au lieu de "categorie", etc.). Bien que ce ne soit pas strictement un critere WCAG, cela affecte la lisibilite et la prononciation par les lecteurs d'ecran. |
| **Correction** | Corriger tous les textes pour utiliser les accents francais corrects. |

---

## Bonnes pratiques deja en place (positif)

1. **`lang="fr"` sur `<html>`** — excellent, conformite 3.1.1
2. **Skip-to-content** en francais ("Aller au contenu principal") avec focus visible
3. **`prefers-reduced-motion: reduce`** global sur les animations CSS
4. **`prefers-contrast: more`** gere avec renforcement des bordures
5. **Focus visible global** (`ring-2 ring-chainsaw-red ring-offset-2`) — bien visible
6. **`font-display: swap`** sur les polices Google — pas de FOIT
7. **Formulaires bien labellises** avec `<label htmlFor>`, `aria-describedby`, `aria-invalid`, `role="alert"` sur les erreurs
8. **Vote buttons** : `aria-pressed`, `aria-label` avec compteurs, `aria-live="polite"` sur le score
9. **FeedSortTabs** : implementation correcte du pattern tablist avec `role="tab"`, `aria-selected`, navigation fleches, `tabIndex` conditionnel
10. **Icones decoratives** : `aria-hidden="true"` systematique dans la majorite des composants
11. **Graphiques budget** : `role="img"` avec `aria-label` descriptifs, `<caption class="sr-only">` sur les tableaux
12. **Print styles** bien implementes, masquant la navigation et les boutons
13. **Boutons de vote** : `min-h-12 min-w-12` sur les boutons de la page detail (44px)
14. **Dialog accessible** (Radix) avec focus trap, description, titre

---

## Plan de remediation prioritaire

### Phase 1 — Critiques (a corriger immediatement)

| # | Issue | Effort |
|---|-------|--------|
| A11Y-09 | Focus trap modal bienvenue | 30 min |
| A11Y-13 | Contraste text-muted | 15 min |
| A11Y-30 | overflow-x: hidden | 15 min |
| A11Y-32 | Framer Motion reduced-motion | 1h |

### Phase 2 — Hauts (a corriger sous 2 semaines)

| # | Issue | Effort |
|---|-------|--------|
| A11Y-01 | Ajouter `<main>` sur 8 pages | 30 min |
| A11Y-05 | `role="img"` sur charts stats/simulateur | 30 min |
| A11Y-10 | Stretched link clavier | 1h |
| A11Y-14 | Tailles 10px + muted | 20 min |
| A11Y-17 | Dialog "Close" → "Fermer" | 5 min |
| A11Y-22 | autocomplete sur login/register | 10 min |
| A11Y-26 | Tailles de cibles tactiles | 1h |
| A11Y-28 | Alternative textuelle pour Recharts | 3h |

### Phase 3 — Moyens (a corriger sous 1 mois)

| # | Issue | Effort |
|---|-------|--------|
| A11Y-03 | Headings dans sections budget | 30 min |
| A11Y-06 | XpProgressBar semantique | 15 min |
| A11Y-07 | XpToast aria-live | 10 min |
| A11Y-11 | BudgetNav focus management | 1h |
| A11Y-12 | FamilySituationSelector toggle | 30 min |
| A11Y-15 | chainsaw-red petits textes | 30 min |
| A11Y-16 | Contraste non-text boutons actifs | 15 min |
| A11Y-18 | DialogFooter "Close" | 5 min |
| A11Y-19 | Leaderboard avatar alt | 10 min |
| A11Y-23 | Formulaire asterisque explique | 10 min |
| A11Y-24 | Simulator input label | 10 min |
| A11Y-25 | Bouton inexactitude label | 5 min |
| A11Y-27 | Radio focus visible dans Flag | 15 min |
| A11Y-31 | Tailles texte minimales | 30 min |

### Phase 4 — Faibles (amelioration continue)

| # | Issue | Effort |
|---|-------|--------|
| A11Y-02 | Nav dans footer | 5 min |
| A11Y-04 | role="article" redondant | 2 min |
| A11Y-08 | aria-hidden Zap | 2 min |
| A11Y-20 | aria-hidden sidebar icons | 10 min |
| A11Y-21 | aria-hidden desktop nav icons | 10 min |
| A11Y-29 | Cell key={index} | 10 min |
| A11Y-33 | lang="en" sur termes anglais | 10 min |
| A11Y-34 | Accents manquants | 30 min |

---

## Effort total estime

| Phase | Effort |
|-------|--------|
| Phase 1 (Critiques) | ~2h |
| Phase 2 (Hauts) | ~6h30 |
| Phase 3 (Moyens) | ~3h30 |
| Phase 4 (Faibles) | ~1h30 |
| **Total** | **~13h30** |

---

## Recommandations supplementaires

1. **Tests automatises** : integrer `axe-core` via `@axe-core/playwright` dans les tests e2e pour detecter les regressions a11y.
2. **Tests manuels** : tester chaque parcours critique (inscription, soumission, vote, consultation) avec VoiceOver/NVDA et uniquement au clavier.
3. **CI check** : ajouter `eslint-plugin-jsx-a11y` en config stricte au linting (certaines regles peuvent deja etre actives).
4. **Design system** : documenter les tokens de couleur avec leurs ratios de contraste dans un guide de style accessible.
5. **Framer Motion** : standardiser l'utilisation de `<MotionConfig reducedMotion="user">` globalement dans les Providers.
