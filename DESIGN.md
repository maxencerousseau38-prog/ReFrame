# DESIGN.md — Système de design "Premium Dark Product"

> **Source d'inspiration :** analyse en direct du design system de [linear.app]
> (rendu headless + extraction des styles calculés : 273 variables CSS `:root`,
> typo, couleurs, ombres, rayons, courbes de motion).
>
> **Intention :** s'INSPIRER de la direction artistique — la rigueur, la
> retenue, la densité de détail — **pas** copier le contenu, les logos ni les
> textes. Ce fichier est une boîte à outils de tokens, pensée pour être
> **appliquée aux sites clients recréés** par ReFrame.
>
> **Re-skin marque :** tout repose sur **une seule couleur d'accent**
> (`--brand`). Donne ta couleur principale et seules ~3 variables changent —
> le reste (neutres, type, espacements, motion) tient tel quel.

---

## 0. L'âme du design — 3 règles d'or

> Si tu ne retiens que trois choses, ce sont celles-ci. Elles expliquent
> *pourquoi* Linear "respire le produit cher" et comment le reproduire.

### 🟣 Règle 1 — Le presque-noir, jamais le noir
Le fond n'est **jamais** `#000`. C'est un **off-black légèrement bleuté**
(`#08090a`). Les surfaces s'éclaircissent par paliers minuscules
(`#08090a → #0f1011 → #141516 → #1c1c1f`), jamais par bordures dures. La
profondeur vient de **superpositions de translucides** et d'**ombres très
diffuses**, pas de contrastes francs. Résultat : c'est dense, calme, et ça ne
fatigue jamais l'œil.

### ⚪ Règle 2 — Type serrée, accent rare
Texte presque blanc cassé (`#f7f8f8`), titres en **graisse intermédiaire**
(510/590, jamais 700) avec un **letter-spacing négatif** (`-0.022em`) qui rend
les grands titres "compacts et techniques". La couleur d'accent est **rare** :
elle ne peint pas des pavés entiers, elle ponctue (un lien, un focus ring, un
point). Le hiérarchie se fait au **niveau de gris du texte**
(`#f7f8f8 → #d0d6e0 → #8a8f98 → #62666d`), pas à la couleur.

### 🟢 Règle 3 — Le mouvement est court et confiant
Tout bouge en **0.16s** sur **une seule courbe** : `cubic-bezier(.25,.46,.45,.94)`
(ease-out-quad). Rien ne rebondit, rien ne traîne. Les interactions micro
(couleur/fond) sont encore plus vives (`0.1s`). Le mouvement sert la
*lisibilité de l'état*, jamais le spectacle. Et il est **toujours désactivable**
(`prefers-reduced-motion`).

---

## 1. Palette — variables CSS prêtes à coller

Colle ce bloc dans `:root`. Section **NEUTRES** = ne pas toucher (c'est la
"signature dark"). Section **MARQUE** = à re-skinner avec la couleur du client.

```css
:root {
  /* ── FONDS (du plus profond au plus élevé) ─────────────────────────── */
  --bg-0:            #08090a;   /* canvas / page (off-black bleuté) */
  --bg-1:            #0f1011;   /* panneaux, header */
  --bg-2:            #141516;   /* surface élevée niv.2 */
  --bg-3:            #191a1b;   /* surface élevée niv.3 */
  --bg-secondary:    #1c1c1f;   /* cards, inputs */
  --bg-tertiary:     #232326;   /* hover de surface */
  --bg-quaternary:   #28282c;   /* élément actif/pressé */
  --bg-marketing:    #010102;   /* fond "hero" ultra-profond (sections pleines) */
  --bg-translucent:  rgba(255,255,255,0.05);  /* survol/voile sur fond sombre */

  /* ── TEXTE (la hiérarchie se joue ICI, en niveaux de gris) ─────────── */
  --fg-primary:      #f7f8f8;   /* titres, texte fort (blanc cassé) */
  --fg-secondary:    #d0d6e0;   /* sous-titres, texte courant clair */
  --fg-tertiary:     #8a8f98;   /* texte d'appoint, paragraphes secondaires */
  --fg-quaternary:   #62666d;   /* placeholders, légendes, désactivé */

  /* ── BORDURES (hairlines — toujours très discrètes) ────────────────── */
  --border-primary:           #23252a;            /* hairline opaque par défaut */
  --border-secondary:         #34343a;
  --border-translucent:       rgba(255,255,255,0.05);
  --border-translucent-strong: rgba(255,255,255,0.08);
  --header-border:            rgba(255,255,255,0.08);

  /* ── MARQUE (★ RE-SKIN ICI ★) ──────────────────────────────────────── */
  /* Donne UNE couleur ; dérive hover (+12% lum) et tint (très désaturé). */
  --brand:           #5e6ad2;   /* couleur d'accent principale (indigo Linear) */
  --brand-hover:     #828fff;   /* +luminosité au survol */
  --brand-tint:      #18182f;   /* fond ultra-désaturé de la marque (cartouches) */
  --brand-contrast:  #ffffff;   /* texte posé SUR --brand */
  --brand-link:      #828fff;   /* liens texte */

  /* ── COULEURS UTILITAIRES (statuts — laisser tel quel) ─────────────── */
  --c-green:  #27a644;
  --c-blue:   #4ea7fc;
  --c-teal:   #00b8cc;
  --c-orange: #fc7840;
  --c-yellow: #f0bf00;
  --c-red:    #eb5757;

  /* ── SÉLECTION ─────────────────────────────────────────────────────── */
  --selection-bg:   color-mix(in lch, var(--brand), black 10%);
  --selection-text: #ffffff;
}

::selection { background: var(--selection-bg); color: var(--selection-text); }
```

### Re-skin en 3 lignes
Pour adapter à la marque d'un client, on ne touche en pratique que :
```css
--brand:        <couleur principale du client>;
--brand-hover:  <même couleur, +10 à +15% de luminosité>;
--brand-tint:   <même teinte, saturation ~15%, très sombre>;   /* fond de pastilles */
```
Si l'accent du client est clair (ex. jaune/lime), poser `--brand-contrast: #08090a`.

---

## 2. Échelle typographique

**Police :** `Inter Variable` en tête, fallback système. C'est une variable
font — d'où les graisses "non rondes" (510, 590) impossibles en statique.

```css
:root {
  --font-sans: "Inter Variable", "SF Pro Display", -apple-system,
               BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
               Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  --font-mono: "Berkeley Mono", ui-monospace, "SF Mono", Menlo, monospace;

  /* Graisses (clé du look : on s'arrête à 590, jamais 700 pour les titres) */
  --fw-normal:    400;
  --fw-medium:    510;   /* titres d'affichage */
  --fw-semibold:  590;   /* sous-titres, labels, h3/h4 */
  --fw-bold:      680;   /* réservé, usage rare */
}
```

### Barème (titres → corps → légendes)
Valeurs issues des styles calculés. Le **letter-spacing négatif croît avec la
taille** : plus le titre est grand, plus on resserre.

| Rôle              | Taille        | Graisse | Interligne | Letter-spacing | Couleur          |
|-------------------|---------------|---------|------------|----------------|------------------|
| Display / Hero    | 64px (4rem)   | 510     | 1.0–1.06   | -0.022em       | `--fg-primary`   |
| H1 section        | 48px (3rem)   | 510–590 | 1.0–1.1    | -0.022em       | `--fg-primary`   |
| H2                | 40px (2.5rem) | 590     | 1.1        | -0.022em       | `--fg-primary`   |
| H3                | 32px (2rem)   | 590     | 1.125      | -0.022em       | `--fg-primary`   |
| H4 / titre carte  | 20px (1.25rem)| 590     | 1.33       | -0.012em       | `--fg-secondary` |
| Label / eyebrow   | 16px (1rem)   | 590     | 1.4        | normal         | `--fg-secondary` |
| **Corps (large)** | 17px          | 400     | 1.6        | 0              | `--fg-secondary` |
| **Corps (base)**  | 15px (.9375rem)| 400    | 1.6        | -0.011em       | `--fg-tertiary`  |
| Small             | 14px (.875rem)| 400     | 1.5        | -0.013em       | `--fg-tertiary`  |
| Mini / caption    | 13px          | 400–510 | 1.5        | -0.01em        | `--fg-tertiary`  |
| Micro             | 12px          | 400     | 1.4        | 0              | `--fg-quaternary`|

Tokens prêts à coller :
```css
:root {
  --t-display: 510 4rem/1.05 var(--font-sans);     /* + letter-spacing:-0.022em */
  --t-h1:      590 3rem/1.1  var(--font-sans);      /* + letter-spacing:-0.022em */
  --t-h2:      590 2.5rem/1.1 var(--font-sans);     /* + letter-spacing:-0.022em */
  --t-h3:      590 2rem/1.125 var(--font-sans);     /* + letter-spacing:-0.022em */
  --t-h4:      590 1.25rem/1.33 var(--font-sans);   /* + letter-spacing:-0.012em */
  --t-body-lg: 400 1.0625rem/1.6 var(--font-sans);
  --t-body:    400 .9375rem/1.6 var(--font-sans);   /* + letter-spacing:-0.011em */
  --t-small:   400 .875rem/1.5 var(--font-sans);
  --t-mini:    400 .8125rem/1.5 var(--font-sans);
}
/* Les grands titres : toujours resserrés */
h1,h2,h3 { letter-spacing: -0.022em; }
```

> **Règle pratique :** un titre = `--fg-primary` + graisse 510/590 +
> letter-spacing négatif. Un paragraphe = `--fg-tertiary` (gris !) en 15px/1.6.
> Le gris du corps de texte est ce qui rend l'ensemble "posé".

---

## 3. Échelle d'espacement

Base **4px**, échelle modulaire. Les sections marketing respirent large
(padding vertical 64px+).

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;   /* gap de base intra-composant */
  --space-5:  24px;   /* padding de card, gap de grille */
  --space-6:  32px;   /* inset de page, gap de section interne */
  --space-7:  46px;   /* respiration latérale homepage */
  --space-8:  64px;   /* padding vertical de section */
  --space-9:  96px;
  --space-10: 128px;  /* séparation entre grandes sections */

  /* Layout */
  --container-max:   1320px;   /* largeur utile du contenu */
  --container-wide:  1416px;   /* conteneur large (hero/visuels) */
  --prose-max:       624px;    /* colonne de lecture (texte long) */
  --col-narrow:      512px;    /* blocs de texte centrés */
  --page-inset:      24px;     /* marge latérale (mobile → desktop min) */
  --header-height:   72px;
  --grid-columns:    12;
}
```

**Rythme vertical d'une section type :** `padding-block: var(--space-8)` à
`var(--space-10)` ; titre → sous-titre (gap `--space-3`) → contenu (gap
`--space-6`).

---

## 4. Rayons & ombres

```css
:root {
  /* Rayons — échelle observée */
  --radius-sm:   6px;     /* petits éléments, tags */
  --radius-md:   8px;     /* boutons carrés, champs compacts */
  --radius-lg:   12px;    /* cards, inputs */
  --radius-xl:   16px;    /* grands panneaux */
  --radius-2xl:  24px;    /* conteneurs hero / médias */
  --radius-pill: 9999px;  /* boutons, pills, badges (signature Linear) */
  --radius-circle: 50%;

  /* Ombres — toujours diffuses, jamais dures. */
  --shadow-low:    0px 2px 4px rgba(0,0,0,0.10);
  --shadow-medium: 0px 4px 24px rgba(0,0,0,0.20);
  --shadow-high:   0px 7px 32px rgba(0,0,0,0.35);

  /* "Stack" micro-ombre : empilement de couches quasi nulles → relief subtil.
     C'est CE détail qui donne le rendu "produit cher" aux boutons/cards. */
  --shadow-stack: 0px 8px 2px rgba(0,0,0,0),
                  0px 5px 2px rgba(0,0,0,0.01),
                  0px 3px 2px rgba(0,0,0,0.04),
                  0px 1px 1px rgba(0,0,0,0.07),
                  0px 0px 1px rgba(0,0,0,0.08);

  /* Bordure-en-ombre : hairline interne propre (mieux qu'un border dur). */
  --ring-hairline: inset 0 0 0 1px var(--border-primary);
}
```

> **Règle pratique :** sur fond sombre, une "bordure" est souvent une **ombre
> inset translucide** (`rgba(255,255,255,0.05) 0 0 0 1px inset`) plutôt qu'un
> `border` opaque — ça reste net sans trancher.

---

## 5. Composants types (CSS)

Tous construits sur les tokens ci-dessus → re-skin automatique avec `--brand`.

### 5.1 Bouton

```css
/* Base commune */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  border-radius: var(--radius-pill);
  font: var(--fw-medium) 15px/1 var(--font-sans);
  letter-spacing: -0.01em;
  cursor: pointer;
  white-space: nowrap;
  transition: border .16s var(--ease), background-color .16s var(--ease),
              color .16s var(--ease), box-shadow .16s var(--ease),
              filter .16s var(--ease), transform .16s var(--ease);
}
.btn-sm { height: 32px; padding: 0 12px; font-size: 13px; }

/* Primaire — surface claire sur fond sombre (inversion = contraste max) */
.btn-primary {
  background: #e5e5e6;
  color: #08090a;
  border: 1px solid #e5e5e6;
  box-shadow: var(--shadow-stack);
}
.btn-primary:hover { filter: brightness(0.92); }
.btn-primary:active { transform: translateY(0.5px); }

/* Variante "marque" : si on veut l'accent couleur en CTA principal */
.btn-brand {
  background: var(--brand);
  color: var(--brand-contrast);
  border: 1px solid var(--brand);
  box-shadow: var(--shadow-stack);
}
.btn-brand:hover { background: var(--brand-hover); border-color: var(--brand-hover); }

/* Secondaire — verre translucide, bordure en ombre inset */
.btn-secondary {
  background: rgba(255,255,255,0.05);
  color: var(--fg-primary);
  border: 0;
  box-shadow:
    rgba(255,255,255,0.03) 0 0 0 1px inset,
    rgba(255,255,255,0.04) 0 1px 0 0 inset,
    rgba(0,0,0,0.60)      0 0 0 1px,
    rgba(0,0,0,0.10)      0 4px 4px 0;
}
.btn-secondary:hover { background: rgba(255,255,255,0.08); }

/* Tertiaire / ghost */
.btn-ghost {
  background: transparent;
  color: var(--fg-secondary);
  border: 0;
}
.btn-ghost:hover { color: var(--fg-primary); background: rgba(255,255,255,0.05); }
```

### 5.2 Card

```css
.card {
  background: var(--bg-secondary);          /* #1c1c1f */
  border-radius: var(--radius-lg);          /* 12px */
  padding: var(--space-5);                  /* 24px */
  box-shadow: var(--ring-hairline);         /* hairline inset, pas de border dur */
  transition: box-shadow .16s var(--ease), background-color .16s var(--ease),
              transform .16s var(--ease);
}
.card:hover {
  background: var(--bg-tertiary);           /* #232326 */
  box-shadow: inset 0 0 0 1px var(--border-secondary), var(--shadow-medium);
}
.card-title { font: var(--t-h4); color: var(--fg-primary); margin-bottom: var(--space-2); }
.card-body  { font: var(--t-body); color: var(--fg-tertiary); }
```

### 5.3 Input

```css
.input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  background: var(--bg-secondary);
  color: var(--fg-primary);
  border-radius: var(--radius-md);          /* 8px */
  border: 0;
  box-shadow: inset 0 0 0 1px var(--border-primary);
  font: var(--t-body);
  transition: box-shadow .16s var(--ease), background-color .16s var(--ease);
}
.input::placeholder { color: var(--fg-quaternary); }
.input:hover  { box-shadow: inset 0 0 0 1px var(--border-secondary); }
.input:focus  {
  outline: none;
  background: var(--bg-2);
  /* Focus ring = la marque, fin (1px) + halo doux. Discret mais clair. */
  box-shadow: inset 0 0 0 1px var(--brand),
              0 0 0 3px color-mix(in srgb, var(--brand) 25%, transparent);
}
```

---

## 6. Règles de motion

```css
:root {
  /* Courbe signature (ease-out-quad) — 90% des transitions */
  --ease:           cubic-bezier(.25, .46, .45, .94);
  /* Variantes utiles tirées du système */
  --ease-out-cubic: cubic-bezier(.215, .61, .355, 1);
  --ease-out-quart: cubic-bezier(.165, .84, .44, 1);
  --ease-out-expo:  cubic-bezier(.19, 1, .22, 1);   /* entrées amples */
  --ease-in-out:    cubic-bezier(.455, .03, .515, .955);

  /* Durées */
  --speed-quick:    0.1s;    /* couleur/fond — feedback micro instantané */
  --speed-base:     0.16s;   /* DÉFAUT : tout le reste (border, shadow, transform) */
  --speed-regular:  0.25s;   /* panneaux, overlays, transitions de layout */
}
```

**Doctrine :**
- **Une durée par défaut : `0.16s`.** Une seule courbe par défaut : `--ease`.
- Les changements de **couleur/fond** vont plus vite (`0.1s`) → l'état réagit "au doigt".
- On anime **opacity / transform / box-shadow / color**, jamais la géométrie coûteuse (width/height/top/left).
- Les entrées au scroll : fade + translate léger (8–16px), `--ease-out-expo`, **une seule fois**, courte.
- **Pas de bounce, pas de spring exubérant.** La confiance vient de la sobriété.
- **Accessibilité (obligatoire) :**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. Layout & responsive

```css
.container { max-width: var(--container-max); margin-inline: auto; padding-inline: var(--page-inset); }
.prose     { max-width: var(--prose-max); }   /* texte long = colonne étroite */
```

- **Grille :** 12 colonnes, `gap: var(--space-5)` (24px).
- **Conteneur :** contenu plafonné à **1320px**, visuels/hero jusqu'à **1416px**.
- **Colonne de lecture :** texte long limité à **624px** (jamais pleine largeur).
- **Header :** 72px, sticky, fond translucide `rgba(11,11,11,0.8)` + `backdrop-filter: blur(20px)`, hairline bas `rgba(255,255,255,0.08)`.

Breakpoints conseillés (mobile-first), inset latéral qui grandit avec l'écran :

| Breakpoint | Largeur   | Inset latéral | Colonnes typiques        |
|------------|-----------|---------------|--------------------------|
| base       | < 640px   | 24px          | 1 (empilé)               |
| sm         | ≥ 640px   | 24px          | 1–2                      |
| md         | ≥ 768px   | 32px          | 2                        |
| lg         | ≥ 1024px  | 32–46px       | 3 / 12-col               |
| xl         | ≥ 1280px  | 46px          | 12-col, container 1320px |

---

## 8. Application aux sites clients ReFrame — checklist

Quand on recrée un site client, viser ce rendu :

- [ ] Fond `--bg-0` (off-black bleuté), **jamais `#000`**. Surfaces par paliers.
- [ ] Texte hiérarchisé **par niveaux de gris** (`--fg-primary → quaternary`),
      paragraphes en gris (`--fg-tertiary`), pas en blanc.
- [ ] Titres en Inter 510/590 + `letter-spacing: -0.022em`. Jamais 700.
- [ ] **Une seule** couleur d'accent (`--brand` = couleur de la marque cliente),
      utilisée avec parcimonie (CTA, liens, focus, points).
- [ ] Boutons **pill** (`9999px`), micro-ombre `--shadow-stack`.
- [ ] Cards/inputs : hairline **inset** translucide plutôt que border dur ;
      rayon 8–12px.
- [ ] Toutes les transitions à `0.16s var(--ease)`. Pas de bounce.
- [ ] `prefers-reduced-motion` respecté + kill switch motion exposé via le chatbot.
- [ ] Conteneur ≤ 1320px, colonne de lecture ≤ 624px, sections aérées (64px+).

> **Rappel d'intention :** on copie la **grammaire** (espacements, type, motion,
> retenue chromatique), pas l'**identité** (couleur de marque, contenu, logos).
> La couleur d'accent vient toujours du client.

---

## 9. Variante marque — ReFrame (Monochrome)

Marque ReFrame = **monochrome pur**. Aucun accent chromatique :
`#000000 · #0A0A0A · #111111 · #FFFFFF`. L'« accent » devient le **blanc sur
noir** — exactement la logique du bouton primaire de Linear, donc le système
tient sans rien forcer. La hiérarchie repose à 100 % sur les **niveaux de gris**
et le **contraste de surface**.

```css
/* ── ReFrame — re-skin monochrome. Remplace la section MARQUE + FONDS. ── */
:root {
  /* Fonds — les 3 noirs de la marque + 3 paliers dérivés */
  --bg-0:           #000000;   /* canvas (noir pur, choix de marque) */
  --bg-1:           #0A0A0A;   /* panneaux, header */
  --bg-2:           #111111;   /* surface élevée */
  --bg-3:           #161616;   /* dérivé : hover de surface profonde */
  --bg-secondary:   #111111;   /* cards, inputs */
  --bg-tertiary:    #1A1A1A;   /* dérivé : hover de card */
  --bg-quaternary:  #222222;   /* dérivé : pressé / actif */
  --bg-marketing:   #000000;   /* hero plein */
  --bg-translucent: rgba(255,255,255,0.05);

  /* Texte — niveaux de gris neutres (la hiérarchie vit ici) */
  --fg-primary:     #FFFFFF;   /* titres, texte fort */
  --fg-secondary:   #B4B4B4;   /* sous-titres, corps clair */
  --fg-tertiary:    #8A8A8A;   /* paragraphes secondaires */
  --fg-quaternary:  #5A5A5A;   /* placeholders, légendes, désactivé */

  /* Bordures — hairlines translucides blanches */
  --border-primary:            rgba(255,255,255,0.08);
  --border-secondary:          rgba(255,255,255,0.14);
  --border-translucent:        rgba(255,255,255,0.05);
  --border-translucent-strong: rgba(255,255,255,0.10);
  --header-border:             rgba(255,255,255,0.08);

  /* MARQUE — l'accent EST le blanc (CTA = blanc sur noir) */
  --brand:          #FFFFFF;
  --brand-hover:    #E5E5E5;   /* on ne peut pas dépasser blanc → on assombrit au survol */
  --brand-tint:     #1A1A1A;   /* « pastille » de marque sur fond noir */
  --brand-contrast: #000000;   /* texte posé SUR --brand (noir sur bouton blanc) */
  --brand-link:     #FFFFFF;   /* liens : blanc + soulignement (pas de couleur) */
}

/* Liens : pas d'accent couleur → on signale par le soulignement. */
a { color: var(--brand-link); text-underline-offset: 0.2em;
    text-decoration-color: rgba(255,255,255,0.35); }
a:hover { text-decoration-color: #fff; }

/* Focus ring monochrome (le halo coloré n'a plus de sens) */
.input:focus {
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6),
              0 0 0 3px rgba(255,255,255,0.12);
}
```

**CTA principal** → utiliser `.btn-primary` (déjà blanc `#e5e5e6` sur noir) :
c'est natif au système, rien à changer. `.btn-brand` devient identique au
primaire — pour ReFrame, garde simplement `.btn-primary`.

### ⚠️ Une nuance de craft (recommandée)
Tu as choisi `#000000` + `#FFFFFF` purs. Sur OLED, **blanc pur sur noir pur**
en grandes surfaces de texte crée un léger *halation* (bavure lumineuse) et
fatigue l'œil. Linear évite ça en adoucissant le texte à `#f7f8f8`. Mon conseil :
garder `#000000` pour le **canvas** (c'est ta signature, OK), mais passer le
texte courant à un blanc cassé :

```css
--fg-primary: #F4F4F5;   /* au lieu de #FFFFFF — réserve le blanc pur aux gros titres / logo */
```

Le `#FFFFFF` pur reste parfait pour le logo, les titres display et les CTA.
Ça ne change rien à l'identité, ça gagne juste en confort de lecture.

### Synthèse — ta marque mappée
| Ton hex   | Rôle dans le système                          |
|-----------|-----------------------------------------------|
| `#000000` | `--bg-0` canvas + `--brand-contrast`          |
| `#0A0A0A` | `--bg-1` panneaux / header                    |
| `#111111` | `--bg-2` / `--bg-secondary` (cards, inputs)   |
| `#FFFFFF` | `--brand` (accent/CTA) + `--fg-primary`       |
