# ReFrame — Design System de l'APPLICATION (gelé, UX5)

> **Périmètre : le chrome du produit** (studio, éditeur, result, shell, panneaux,
> boutons, cartes, inputs). **PAS** les sites générés — ceux-ci suivent la
> grammaire `DESIGN.md` + skill `reframe-redesign` (deux systèmes distincts :
> l'un habille ReFrame, l'autre habille les sites reconstruits).
>
> Statut : **v1 gelée (2026-07-10)**. Toute nouvelle UI de chrome DOIT consommer
> ces tokens ; aucune valeur ad hoc de rayon / easing / ombre / spacing. Modifié
> rarement, par décision actée au registre. Source des tokens :
> `src/app/globals.css` (`:root`) + `tailwind.config.ts` (theme.extend).

---

## 1. Philosophie (ce qui fait « premium »)

Linear / Framer / Arc / Raycast / Apple : **calme, précis, presque monochrome,
léger**. La couleur guide, jamais ne décore. La profondeur vient de hairlines
translucides et d'ombres très légères, jamais de blur lourd. Le mouvement est
court, naturel, une seule courbe. Chaque espace est volontaire (grille 4px). Le
preview reste l'élément dominant ; le chrome s'efface.

## 2. Les tokens (frozen)

### 2.1 Rayons — un seul système (`--radius: 0.75rem` = 12px)
| Token | Valeur | Usage |
|---|---|---|
| `rounded-sm` | 8px (`--radius − 4`) | petits contrôles, badges |
| `rounded-md` | 10px (`--radius − 2`) | inputs, boutons icône, items |
| `rounded-lg` | 12px (`--radius`) | inputs, menus, petits panneaux, dialogs |
| `rounded-2xl` | 16px (Tailwind) | **boutons** (grammaire de marque V3) |
| `rounded-3xl` | 24px (Tailwind) | **cartes / verre dépoli** (`.glass`, grandes surfaces) |
| `rounded-[1.75rem]` | 28px | **exception documentée** : bezel du device mobile (PreviewStage) |

Échelle V3 (Creative Director) — TROIS crans délibérés : **12** petits contrôles
· **16** boutons (`rounded-2xl`, fin des pills) · **24** cartes et verre dépoli
(`rounded-3xl`, aligné sur `.glass`). Avant UX5 : `--radius`=20px, échelle
incohérente ; UX5 avait tout resserré à 12 + pills — V3 rouvre 16/24 pour le
langage bouton/carte demandé.

### 2.2 Motion — une courbe, deux durées
| Token | Valeur | Usage |
|---|---|---|
| `ease-premium` | `cubic-bezier(0.2, 0.8, 0.2, 1)` (`--rf-ease`) | TOUTES les transitions du chrome |
| `duration-fast` | 120ms (`--rf-dur-1`) | micro : hover, press, focus, couleur |
| `duration-base` | 180ms (`--rf-dur-2`) | panneaux, device switch, largeur, layout |

`prefers-reduced-motion` → transitions neutralisées (déjà honoré dans
PreviewStage). Avant UX5 : 3 easings (`.23,1,.32,1` / `.25,.46,.45,.94` /
`.32,.72,0,1`) + 3 durées (200/300/500) — unifiés.

### 2.3 Ombres — légères, profondeur par hairline
| Token | Valeur | Usage |
|---|---|---|
| `shadow-raise` | `0 1px 2px rgb(0 0 0 /.35)` | élévation minimale (cartes posées) |
| `shadow-float` | `0 12px 32px -14px rgb(0 0 0 /.55)` | éléments flottants (preview, cluster, dialogs) |
| `shadow-hairline` | `inset 0 0 0 1px rgb(255 255 255 /.05)` | anneau interne translucide |
| bordures | `border-border` (`0 0% 13%`) | **hairline** — séparations très fines |

Avant UX5 : `shadow-2xl` (×6), `shadow-[0_50px_120px…]` — lourdes. Remplacées
par `shadow-float` (léger) ; la profondeur passe par ring/hairline + contraste.

### 2.4 Couleur — MONOCHROME intemporel, palette exacte (DESIGN OVERHAUL V3)
Presque monochrome + surfaces en verre dépoli. Aucune teinte ne domine.
Inspiration : 40% Lovable · 25% Apple · 20% Linear · 15% Framer.

| Rôle | Hex | Token | Usage |
|---|---|---|---|
| Fond principal | `#080808` | `--background` (0 0% 3.1) | canvas |
| Fond secondaire | `#101010` | `--secondary-2` (0 0% 6.3) | sidebar |
| Surface | `#151515` | `--card` / `--muted` (0 0% 8.2) | cards |
| Surface hover | `#1B1B1B` | `--secondary` (0 0% 10.6) | hover |
| Bordure | `rgba(255,255,255,.08)` | `--border` (0 0% 11) | toutes bordures |
| Bordure active | `rgba(255,255,255,.16)` | (focus) | états actifs |
| Texte principal | `#FAFAFA` | `--foreground` (0 0% 98) | titres |
| Texte secondaire | `#CFCFCF` | — (`text-zinc-300`) | corps |
| Texte faible | `#8E8E8E` | `--muted-foreground` (0 0% 56) | descriptions |

- **Accent = argent / blanc cassé** `#F3F3F3` (`--accent`), `#F5F5F5` pour le
  bouton primaire (`--primary`). **Parcimonie absolue** : bouton principal,
  focus (`--ring: 0 0% 62%`), sélection. JAMAIS pour le fond, jamais décoratif.
- Surfaces : verre dépoli (`.glass` / `.glass-dark` / `.panel`,
  `bg-white/[0.03…0.05]`) — `blur(24px)`, border blanc `.08`, radius 24px, ombre
  TRÈS légère. Jamais de glow / halo / ombre colorée.
- Texte : hiérarchie par NIVEAUX DE GRIS (98 → 81 → 56), jamais par couleur.
- **Couleurs d'ÉTAT — fonction uniquement, jamais décoratives** :
  `success #22C55E` · `warning #F59E0B` · `destructive #EF4444` · `info #3B82F6`
  (tokens `--success/--warning/--destructive/--info` → `bg-success`, etc.).
  Réservées aux feedbacks (validation, toast, point de statut). Les bannières
  persistantes (publié) restent neutres ; les scores se lisent par la CLARTÉ.
- **Détail de marque** : reflet argenté / très subtile lueur blanc-froid sur
  certaines interactions — jamais néon.

### 2.5 Spacing — grille 4px
Barres/toolbars : `py-2.5` (10) / `py-3` (12), `px-4` (16). Panneaux : `p-3`
(12). Gaps de contrôles : `gap-1`/`gap-0.5`. Un espace = un multiple de 4,
volontaire. Le preview domine ; le chrome reste dense mais aéré.

### 2.6 Icônes
Phosphor, `weight="bold"` (ou `fill` sur actif), taille **`h-4 w-4`** dans les
barres, `h-[18px] w-[18px]` en navigation. Même alignement, même boîte de clic
(`h-7/h-8 w-7/w-8`, centrée).

### 2.7 Typographie
Geist sans. Poids : `font-medium` (contrôles/nav), `font-semibold` (titres de
panneau). Tailles : `text-sm` (14) corps de chrome, `text-xs` (12) méta,
`text-[11px]` labels/uppercase. `antialiased` + `ss01`. Hiérarchie par
taille+gris, pas par graisse lourde.

## 3. Composants (règles)

- **Button** (`components/ui/button.tsx`) : LE langage unique — `rounded-2xl`
  (16px, V3 : fin des pills), `duration-fast ease-premium`, `active:scale-[0.98]`,
  focus `ring-2 ring-ring ring-offset-2`. Variants : `default` (primary silver
  `#F5F5F5`/`#090909`), `light`, `outline` (hairline `.08`→`.16`), `secondary`
  (`bg-white/5` + border `.08`), `ghost`, `link`. Tout bouton du chrome passe
  par là ou reprend ce langage.
- **Boutons icône** (device switch, rail, cluster) : `rounded-md`, hover
  `bg-white/[0.06]`, `transition-colors duration-fast ease-premium`, boîte
  `h-7/h-8 w-7/w-8` centrée. Actif : `bg-white/10`.
- **Cartes / panneaux** : `rounded-lg/xl`, `border-border` (hairline),
  `shadow-raise` (posé) ou `shadow-float` (flottant). Jamais de grosse bordure
  ni de forte ombre.
- **Inputs** : `rounded-md`, `border-border`, focus `ring-4 ring-foreground/5`
  + `border-foreground/20`.
- **PreviewStage** : barre unifiée (dots + label + device + fit + % + actions),
  frame `shadow-float`, motion `ease-premium 180ms`.

## 4. Application UX5 (fichiers touchés)

`globals.css` (radius 12 + tokens motion) · `tailwind.config.ts` (ease-premium,
duration-fast/base, shadow-raise/float/hairline) · `ui/button.tsx` (motion) ·
`workspace/preview-stage.tsx` (motion + shadow-float + hover tokens) ·
`dashboard/shell.tsx` (rail motion tokens) · `editor/page.tsx` (cluster
shadow-float + motion) · `result/page.tsx` (cartes preview → rounded-xl +
shadow-float). Additif, aucune régression (497 tests), tsc propre.

## 5. Gouvernance

- Toute UI de chrome consomme ces tokens ; PR refusée si valeurs ad hoc.
- Étendre le système = éditer `globals.css`/`tailwind.config.ts` + CE doc +
  décision au registre. Jamais de token « local ».
- Pointeur : ajouté à la table de gouvernance des docs (`ai/CONVENTIONS.md`).
