# UX — Responsive Premium Workspace + Publish Experience (conception, zéro code)

> Statut : **plan à valider** (2026-07-10). Chantier UX (parallèle au moteur
> C-series). Références jointes (Lovable) = repère de NIVEAU UX uniquement,
> jamais copiées (HTML/CSS/JSX/composants/assets/structure). Grammaire propre :
> `DESIGN.md` (off-black brand-tinté, type serrée 510/590 tracking négatif,
> accent rare, motion `0.16s cubic-bezier(.25,.46,.45,.94)`, hairlines inset).
> Doctrine appliquée à NOTRE PRODUIT : no-fabrication (D9) vaut aussi pour le
> flux de publication — ne jamais théâtraliser une capacité qu'on n'exécute pas.

---

## 1. Audit de l'existant (faits, fichier:ligne)

### 1.1 Le cadre responsive actuel

| Zone | Fichier | Constat |
|---|---|---|
| App shell | `dashboard/shell.tsx:144` | Sidebar `w-60` (240px) **sticky, toujours présente** sur editor+result ; mobile → topbar + `Sheet` (déjà en place, bon patron réutilisable). |
| Éditeur | `editor/page.tsx:255` | `flex h-screen flex-col lg:flex-row` : chat `lg:w-[400px]` **fixe** + preview `flex-1`. Sur 1440 : 240 (shell) + 400 (chat) = 640px de chrome → preview ~800px. Mobile : chat `w-full` EMPILÉ au-dessus du preview (les deux se disputent l'unique colonne, aucun bottom sheet). |
| Preview éditeur | `editor/page.tsx:379` | `flex-1 overflow-y-auto p-6` → `SiteRenderer` rendu à sa **taille naturelle** dans une carte, scrollé. **Aucun scale, aucun fit, aucun mode device.** |
| Preview résultat | `result/page.tsx:501` | `max-h-[70vh] overflow-y-auto` → même chose, clampé à 70vh. `BeforeView` en `h-[70vh]` fixe (iframe/shot). |
| Preview | (les deux) | Le site est rendu tel un desktop et scrollé dans une boîte : c'est le « desktop réduit » / « site perdu au milieu » décrit. Le preview n'est jamais l'élément DOMINANT. |

**Composants qui limitent l'usage de l'espace** (à corriger avant tout) :
`shell.tsx` sidebar `w-60` (non repliable) · `editor` chat `w-[400px]` (non
repliable, non coulissant) · `result`/`editor` preview clampé (70vh / carte) ·
aucune brique « PreviewStage » (scale/fit/device) — elle n'existe pas.

### 1.2 Le flux de publication actuel

- **Deux chemins incohérents** : `result/page.tsx:511` monte `LaunchWizard`
  (Dialog Radix plein écran, sidebar stepper, 10 étapes de CHECKS, score de
  lancement, `PublishSequence`) ; `editor/page.tsx:375` a un `publish()`
  **inline** (bouton → POST direct, pas de wizard). Expérience différente selon
  l'écran d'où on publie.
- **Le wizard existant est un wizard de CHECKS pré-vol** (`types.ts:3`) :
  domain/ssl/integrations/payments/forms/analytics/seo/performance/
  accessibility/review — c'est proche de l'étape « Résumé / Commercial
  Readiness » demandée, mais PAS du flux 4-étapes premium (URL → Visibilité →
  SEO → Résumé).
- **Mobile du wizard** = un `<select>` déroulant (`launch-wizard.tsx:180`) —
  « desktop réduit », pas de bottom sheet.
- **La séquence de publication est théâtrale** (`publish-sequence.tsx:19`) :
  Upload/Optimize/Deploy pilotés par `setTimeout`, non liés au backend.
- **L'écran de succès est pauvre** (`publish-sequence.tsx:134`) : « Visit your
  site » seulement. Pas de QR, copier, partager, inviter, connecter un
  domaine, nouvelle version, analytics — tout ce qui est demandé.

### 1.3 Vérité du backend (`api/publish-site/route.ts`)

`publishSite(schema, user.id)` écrit dans le store et renvoie `/s/<slug>` (ou
`<slug>.<NEXT_PUBLIC_ROOT_DOMAIN>`). Donc **aujourd'hui NON supporté** :
- **slug choisi par l'utilisateur** (le slug est dérivé, non paramétrable) ;
- **visibilité** public/privé/mot de passe (aucun champ) ;
- **override SEO** publié (titre/desc/OG/favicon ne sont pas transmis) ;
- **domaine personnalisé** + DNS + **SSL réel** (n'existe pas) ;
- **CDN/edge deploy** (le rendu est servi par la route `/s/<slug>`).

⇒ Le flux demandé exige du **backend** sur plusieurs étapes ; le §7 en fait le
récapitulatif. Le §3 pose la règle : on n'affiche une étape/animation QUE si
elle correspond à une capacité réelle (sinon on l'omet ou on la marque
« bientôt »), exactement la doctrine no-fabrication du produit.

### 1.4 Briques réutilisables (ne rien réécrire)

`Sheet` (`components/ui/sheet.tsx`, `side` left/right/**bottom** possible) →
drawers tablette + bottom sheets mobile · `Dialog` (Radix) → fenêtre flottante
publish · `LaunchWizard`/`checks.ts`/`use-wizard.ts` → deviennent l'étape 4
(Résumé/Readiness), pas jetés · `PublishSequence` → base de « pendant », à
raccorder au réel · `qualityReport` (result) → scores du Résumé · `framer-
motion` + tokens `--ease` de globals.css → motion · store i18n (`useDash`).

---

## 2. Principes de la refonte (U0-U6, non négociables)

- **U0 — Progrès honnête (no-fabrication produit).** Aucune étape/animation ne
  prétend une capacité non exécutée : pas de « SSL généré » / « déploiement
  CDN » si le back ne le fait pas. Soit on l'implémente, soit on l'omet, soit
  on la marque « bientôt ». (Miroir de D9/R0 côté produit.)
- **U1 — Le preview est l'élément DOMINANT.** Les outils gravitent autour, se
  replient, coulissent. Jamais le preview au service des panneaux.
- **U2 — Une étape = une décision.** Aucun écran surchargé (Apple-like).
- **U3 — Repensé par breakpoint, jamais réduit.** Mobile = bottom sheets +
  overlays, pas un desktop compressé.
- **U4 — Chaque pixel utile.** Zéro largeur/hauteur figée injustifiée ; le
  preview remplit l'espace via scale calculé, jamais une boîte vide.
- **U5 — Réutiliser (Sheet/Dialog/wizard checks), unifier (un seul chemin de
  publication), aucune dépendance externe nouvelle.**
- **U6 — Accessible & fluide** : clavier complet (ESC ferme, Entrée valide,
  focus visibles), motion 0.16s, `prefers-reduced-motion` honoré.

---

## 3. Architecture responsive cible

### 3.1 La brique centrale : `PreviewStage` (nouvelle, ~120 l.)

Un conteneur mesuré (ResizeObserver) qui rend le site à sa largeur de device
CHOISIE (`deviceWidth`) et calcule un `scale` pour remplir l'espace dispo,
centré, sans jamais laisser de vide inutile. Il connaît : taille du conteneur,
device (Desktop/Tablet/Mobile), orientation (Landscape/Portrait), mode fit.

```
fitScale = clamp( containerW / deviceW , minScale , 1 )   // "Fit width"
fitBoth  = min( containerW/deviceW , containerH/deviceH )  // "Fit to Screen"
```

Modes device (largeurs canoniques, la vraie media query du site s'applique
car on rend à `deviceWidth` réel, pas un zoom CSS) :

| Mode | Portrait | Landscape |
|---|---|---|
| Desktop | 1440 | — |
| Tablet | 834 | 1194 |
| Mobile | 390 | 844 |

- **Fit to Screen** : bouton unique → `fitBoth`, plus besoin de régler le zoom.
- **Bascule de mode** : instantanée ; transition `scale`/`width` en 0.16s.
- **Zoom** optionnel (50–200 %) mais le défaut est toujours « fit » (U4).
- Remplace `max-h-[70vh]`/carte naturelle sur editor ET result (source unique).

### 3.2 Desktop ultra-wide (≥1536)

Le preview est immense ; les panneaux se replient sur icônes ; le site prime.

```
┌───────────────────────────────────────────────────────────────────────┐
│  ⌂  Terra Studios          [Desktop ▾] [Fit]      Partager  ⤒ Publier   │  topbar unifiée
├──┬────────────────────────────────────────────────────────────┬────────┤
│▸ │                                                            │  DNA ▸  │  panneaux repliés
│AI│                    P R E V I E W (dominant)                 │ Design ▸│  = rails d'icônes
│  │                    site rendu @1440, fit width              │ Business▸│
│  │                                                            │        │
├──┴────────────────────────────────────────────────────────────┴────────┤
└───────────────────────────────────────────────────────────────────────┘
```
- Shell sidebar → **rail d'icônes repliable** (récupère ~200px pour le preview).
- Panneaux (AI Editor, DesignDNA, BusinessDNA) = **rails repliables** à droite/
  gauche, s'ouvrent en survol/clic sans pousser le preview hors de vue.

### 3.3 Laptop (1024–1535)

Preview dominant ; panneaux plus compacts ; un seul panneau ouvert à la fois.

```
┌──────────────────────────────────────────────────────────────┐
│ ⌂ Terra Studios      [Desktop ▾][Fit]     Partager  ⤒ Publier │
├───────────────┬──────────────────────────────────────────────┤
│  AI Editor    │                                              │
│  (compact)    │            P R E V I E W (fit width)          │
│  chat + input │                                              │
├───────────────┴──────────────────────────────────────────────┤
```
- Chat compacté (pas de `w-[400px]` figé → `clamp(300px, 26vw, 380px)`).
- Ouvrir DesignDNA/BusinessDNA remplace le panneau gauche (jamais deux à la fois).

### 3.4 Tablette (640–1023)

Preview central ; panneaux = **drawers coulissants** (Sheet), AI en panneau
latéral, DNA/Business en drawers.

```
┌──────────────────────────────────────────┐
│ ⌂ Terra Studios   [Tablet ▾][Fit]  Publier│
├──────────────────────────────────────────┤
│                                          │
│           P R E V I E W (fit)            │
│                                          │
├──────────────────────────────────────────┤
│  [✦ AI]     [◫ Design]     [▤ Business]   │  ← ouvre un drawer (Sheet)
└──────────────────────────────────────────┘
```

### 3.5 Mobile (<640) — repensé nativement

Preview quasi plein écran ; outils = **bottom sheets** ; actions au pouce.

```
┌───────────────────┐        Bottom sheet (AI) ↓
│ ⌂ Terra    ⋯  ⤒   │      ┌───────────────────┐
├───────────────────┤      │ ✦ AI Editor    ✕  │
│                   │      ├───────────────────┤
│                   │      │ chat…             │
│   PREVIEW (fit)   │      │ [suggestions]     │
│   @390 portrait   │      │ ┌───────────────┐ │
│                   │      │ │ Décrire…   ➤ │ │
│                   │      └───────────────────┘
├───────────────────┤   thumb-reachable
│ [✦AI] [◫] [▤] [⤒] │  ← barre d'action basse (pouce)
└───────────────────┘
```
- Barre d'action basse fixe : AI · Design · Business · Publier (au pouce).
- Panneaux = overlays/bottom sheets (Sheet `side="bottom"`), jamais empilés.
- Preview par défaut en mode Mobile (le rendu mobile réel du site).

---

## 4. Le workflow de publication (fenêtre flottante, unifié)

Un seul point d'entrée `PublishFlow` (remplace le `publish()` inline de
l'éditeur ET wrappe le LaunchWizard). Dialog flottant, site visible derrière,
fond translucide + flou subtil, coins arrondis, ombres douces. Ouverture
`fade + scale + blur léger`, fermeture inverse. Mobile = **bottom sheet plein
hauteur** avec les mêmes étapes.

**Rythme : 4 décisions, une par écran.** Barre de progression discrète (4
points). ESC ferme, Entrée = Continuer, focus visibles.

### Étape 1 — URL  *(backend requis : slug choisi + validation dispo)*
```
┌─ Publier ──────────────────────────── ⑦ Docs ─┐
│  Où vit votre site                             │
│                                                │
│  ◉  Domaine ReFrame gratuit                    │
│     ┌──────────────────────────────┐          │
│     │ terra-studios     │.reframe.site  ✓ libre│  ← vérif temps réel
│     └──────────────────────────────┘          │
│     suggestions: terra-studios · terra-ceramic │  ← dérivées du BusinessDNA
│                                                │
│  ○  Domaine personnalisé            [Pro]      │
│     www.terrastudios.com                       │
│                                                │
│                                   [ Continuer ]│
└────────────────────────────────────────────────┘
```
Slug pré-rempli depuis l'identité (C8 IdentityDNA plus tard ; d'ici là brand
name). Édition inline, disponibilité vérifiée en direct.

### Étape 2 — Visibilité  *(backend requis : champ visibility + gate au rendu)*
```
┌─ Publier ──────────────────────────────────────┐
│  Qui peut voir ce site                          │
│  ◉ 🌐 Public        Toute personne avec l'URL   │
│  ○ 🔒 Privé         Vous seul (connecté)        │
│  ○ 🔑 Mot de passe  Un code d'accès             │
│  ── bientôt ──────────────────────────────────  │
│  ◌ Espace de travail · Client · Agence [Business]│  ← désactivé, honnête
│                                   [ Continuer ] │
└─────────────────────────────────────────────────┘
```

### Étape 3 — SEO  *(pré-rempli BusinessDNA ; backend requis pour persister l'override)*
```
┌─ Publier ──────────────────────────────────────┐
│  Comment votre site apparaît en partage         │
│  Titre        [ Terra Studios | Céramique… ]44/60│
│  Description  [ Découvrez… ]              117/160│
│  Image OG     [ générée ▮ ]  [Téléverser][Générer]│
│  Favicon      [ ▮ ]                              │
│  ── Aperçus ──────────────────────────────────  │
│  [Google] [X] [LinkedIn] [Facebook]  ← onglets  │
│                                   [ Continuer ] │
└─────────────────────────────────────────────────┘
```
Tout pré-rempli automatiquement (BusinessDNA/ContentDNA) ; le client corrige.
Aperçus multi-plateformes en onglets (une décision visible à la fois, U2).

### Étape 4 — Résumé (absorbe le LaunchWizard checks)
```
┌─ Publier ──────────────────────────────────────┐
│  Prêt à publier                                 │
│  Business compris   Céramique artisanale · e-com │  ← C8 (quand dispo)
│  Pages 5 · Images 12 · SEO ✓                    │
│  Commercial Readiness ▓▓▓▓▓░ 86                  │  ← checks.ts / qualityReport
│   Design 92 · A11y AA · Perf 95 · UX 88          │
│  ⚠ 1 avertissement : paiement non reconnecté     │  ← honnête, non bloquant
│  ✓ Tout est prêt                                │
│                                     [ Publier ] │
└─────────────────────────────────────────────────┘
```

### Pendant — progrès HONNÊTE (U0)
Phases réelles uniquement (validation schéma → écriture store → live). Pas de
« SSL/CDN » tant que non implémenté. Animation élégante (anneau + phase +
points), mais chaque phase = une vraie étape backend.
```
   ◜◝  Publication…
   ◟◞  Validation · Enregistrement · Mise en ligne
   ●●○
```

### Après — écran de succès riche
```
┌────────────────────────────────────────────────┐
│           ✓  terra-studios est en ligne         │
│     terra-studios.reframe.site   [Copier][Ouvrir]│
│     [⤴ Partager] [▦ QR code]                     │
│     ─────────────────────────────────────────   │
│     ↳ Inviter un collaborateur                   │
│     ↳ Connecter un domaine                       │
│     ↳ Publier une nouvelle version               │
│     ↳ Voir les analytics                         │
│     ↳ Retour au tableau de bord                  │
└────────────────────────────────────────────────┘
```
(QR/copier/ouvrir/partager = UI pure ; invite/domaine/analytics = liens vers
flux existants ou marqués « bientôt » — jamais de bouton mort.)

### Domaine personnalisé  *(backend requis : vérif DNS + SSL — sinon « bientôt »)*
Sous-flux 5 pas : saisir → DNS à ajouter (auto) → vérification auto → SSL auto
→ succès. **Ne l'exposer que si le back le fait** ; sinon CTA « Bientôt » (U0).

---

## 5. Motion & accessibilité (contrat)

- Ouverture fenêtre : `fade + scale(0.98→1) + blur léger` en 0.16s `--ease`.
  Fermeture : inverse. Transitions device/scale : 0.16s. Jamais de bounce.
- `prefers-reduced-motion` → transitions instantanées, contenu visible.
- Clavier : Tab dans l'ordre, ESC ferme, Entrée = action primaire, focus rings
  visibles (déjà `focus-visible:ring` dans l'UI). Sheets/Dialog Radix = focus
  trap + retour de focus natifs (réutilisés).

---

## 6. Découpage en sous-lots (indépendants, testables)

Critère de succès transverse : sur chaque breakpoint (320/768/1024/1440/2560),
**le preview domine, zéro vide inutile, zéro overflow horizontal** — prouvé par
captures multi-largeurs (protocole CONVENTIONS, comme le moteur).

| Lot | Contenu | Gain visible | Backend | Risque | Est. |
|---|---|---|---|---|---|
| **UX1 — Audit responsive exécutable** | recensement complet des tailles figées (au-delà du preview) + baseline captures 5 largeurs editor/result AVANT | référence chiffrée | non | faible | 0.5 |
| **UX2 — `PreviewStage`** | brique scale/fit/device/orientation + « Fit to Screen » ; branchée sur result ET editor (supprime `max-h-[70vh]` et la carte naturelle) | le preview remplit l'espace, modes device réels | non | moyen | 1 |
| **UX3 — Shell & panneaux repliables** | sidebar `w-60`→rail repliable ; chat `w-[400px]`→`clamp()` repliable ; un panneau à la fois (laptop) | +200–400px au preview, « dominant » | non | moyen | 1 |
| **UX4 — Tablette/Mobile repensés** | drawers (Sheet) tablette ; bottom sheets + barre d'action basse mobile ; preview mode Mobile par défaut | mobile natif, pas réduit | non | moyen | 1 |
| **UX5 — `PublishFlow` unifié (UI)** | Dialog flottant + bottom sheet mobile ; 4 étapes (URL/Visibilité/SEO/Résumé) ; absorbe LaunchWizard/checks ; supprime le publish inline éditeur ; « pendant » honnête ; succès riche (copier/QR/ouvrir/partager) | un flux premium unique, cohérent | partiel | moyen | 1-2 |
| **UX6 — Backend publication** | slug choisi + validation dispo ; visibilité (public/privé/mot de passe) + gate au rendu `/s`; override SEO persisté | les étapes 1-2-3 deviennent réelles | **oui** | moyen | 1-2 |
| **UX7 — Domaine perso + SSL** (ou « bientôt ») | vérif DNS + SSL réel OU CTA honnête « bientôt » selon décision | domaine pro | **oui** | élevé | à cadrer |

Ordre : UX1→UX2→UX3→UX4 (responsive d'abord, gain immédiat, zéro back) puis
UX5→UX6→(UX7). UX5 livrable en UI-only en dégradant honnêtement les étapes qui
attendent UX6 (U0 : slug non éditable = affiché en lecture seule « bientôt
modifiable », pas un champ qui ment).

## 7. Ce qui exige du backend (récapitulatif, pour ta décision)

| Fonction demandée | Back requis | Aujourd'hui |
|---|---|---|
| Slug personnalisé + « libre ? » | oui (store + route) | slug dérivé, non éditable |
| Visibilité public/privé/mot de passe | oui (champ + gate `/s`) | public implicite |
| Override SEO publié (titre/desc/OG/favicon) | oui (route + rendu `/s`) | non transmis |
| Domaine perso + DNS + SSL | oui (infra) | Pro annoncé, non implémenté |
| « SSL / CDN » dans le progrès | oui, sinon RETIRER (U0) | théâtral (`setTimeout`) |
| QR / copier / ouvrir / partager | non (UI pure) | partiel (copier share) |
| Modes device / fit / scale | non (UI pure) | absent |

---

## 8. Décision attendue

Valider (ou amender) : (a) les principes U0-U6, en particulier **U0** (progrès
honnête — soit on implémente SSL/CDN, soit on les retire du théâtre) ; (b)
l'architecture responsive + la brique `PreviewStage` ; (c) le flux 4-étapes et
l'unification (suppression du publish inline éditeur) ; (d) le découpage UX1-7
et **jusqu'où aller côté backend maintenant** (UX6 requis pour que les étapes
1-3 soient réelles ; UX7 domaine perso : implémenter ou « bientôt »).
Aucune ligne de code avant ta validation.
