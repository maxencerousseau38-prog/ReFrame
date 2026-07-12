# UX1 — Audit responsive exécutable & baseline chiffrée (AVANT)

> Statut : **livré** (2026-07-10). Sprint UX, lot UX1 (`docs/UX_WORKSPACE_
> PUBLISH_SPEC.md`). Objectif : recensement exhaustif des tailles figées du
> workspace + mesures baseline de `/editor` et `/result` à 5 largeurs, AVANT
> toute modification — le mètre-étalon que UX2-5 devront battre. Zéro code UI.
> Méthode : harnais Playwright injectant un vrai schéma (Bruneau, 5 blocs) dans
> `sr:schema` (sessionStorage) via `addInitScript`, puis mesure DOM réelle.
> Honnêteté (U0/D8) : la métrique « dominance % » a été ÉCARTÉE (calcul non
> fiable sur un preview scrollable) ; ne sont reportées que des mesures
> robustes (overflow, chrome, largeur rendue, position du preview).

---

## 1. Recensement des tailles figées (workspace UI, fichier:ligne)

| Taille | Fichier:ligne | Rôle | Verdict UX |
|---|---|---|---|
| `w-60` (240px) | `dashboard/shell.tsx:144` | sidebar app, **sticky, toujours présente** sur editor+result | **PORTEUSE** → rail repliable (UX3) |
| `lg:w-[400px]` | `editor/page.tsx:257` | panneau chat, fixe, non repliable | **PORTEUSE** → `clamp()` repliable (UX3) |
| `max-h-[70vh]` | `result/page.tsx:501` | clamp hauteur preview (ignore l'espace réel) | **PORTEUSE** → `PreviewStage` (UX2) |
| `h-[70vh]` ×2 | `result/page.tsx:567,578` | before-view iframe/checking, hauteur figée | **PORTEUSE** → PreviewStage (UX2) |
| `min-h-[70vh]` | `result/page.tsx:613` | before-view shot | PORTEUSE → PreviewStage (UX2) |
| `h-screen` | `editor:246,255` / `result:208` / `shell:142,144` | pleine hauteur (légitime pour un shell) | **OK** (conserver) |
| `w-64` (256px) | `launch-wizard.tsx:78` | sidebar stepper du wizard | scope wizard → repensé en UX5 |
| `inset-2/4/8` | `launch-wizard.tsx:63` | dialog plein écran | scope wizard → UX5 |
| `min-h-[60vh]` | `publish-sequence.tsx:60` | zone séquence publication | scope wizard → UX5 |
| `w-72` (288px) | `shell.tsx:168` | Sheet menu mobile | **OK** (drawer déjà correct) |
| `h-[18px]`/`w-[18px]` | `shell.tsx:100,128,137` | tailles d'ICÔNES | **OK** (non structurant) |

**4 tailles porteuses** limitent réellement le preview : shell `w-60`, chat
`w-[400px]`, et les 4 clamps `70vh` du result. Ce sont les cibles d'UX2 (clamps
→ PreviewStage) et UX3 (sidebar+chat → repliables). Aucune brique de
scale/fit/device n'existe (confirmé à la lecture : audit spec §1.4).

## 2. Baseline mesurée (5 largeurs × 2 pages)

`overflowX` = `documentElement.scrollWidth − clientWidth` (px ; **cible 0**).
`chromeLeftPx` = position gauche du site rendu = largeur de chrome AVANT le
preview. `siteRenderedW` = largeur à laquelle le site est rendu (suit la
colonne → **prouve l'absence de scale/mode device**). `previewTopVh` = position
du haut du preview en % de la hauteur d'écran (**>100 = le preview commence
sous la ligne de flottaison**, il faut scroller pour voir le site).

### /result

| Largeur | overflowX | chromeLeft | siteRenderedW | previewTopVh |
|---|---|---|---|---|
| 320 | **192 ✗** | 25 | 462 | **190 ✗** |
| 768 | 0 | 25 | 718 | **102 ✗** |
| 1024 | 0 | 265 | 734 | **127 ✗** |
| 1440 | 0 | 265 | 1150 | **96 ✗** |
| 2560 | 0 | 265 | 2270 | 60 |

### /editor

| Largeur | overflowX | chromeLeft | siteRenderedW | previewTopVh |
|---|---|---|---|---|
| 320 | **52 ✗** | 25 | 322 | 90 (chat empilé) |
| 768 | 0 | 25 | 718 | 50 (chat empilé) |
| 1024 | **298 ✗** | **665** | 632 | 11 |
| 1440 | 0 | **665** | 750 | 9 |
| 2560 | 0 | **665** | 1870 | 6 |

## 3. Défauts prouvés (chiffrés)

1. **Overflow horizontal réel** (bug responsive) : `/result@320` = 192px,
   `/editor@320` = 52px, `/editor@1024` = 298px. Scroll horizontal → l'app
   n'est pas responsive à ces largeurs.
2. **Le preview est sous la ligne de flottaison sur /result** : `previewTopVh`
   = 96 → 190 % à toutes les largeurs ≤ 1440. Sur un 1440×900, il faut scroller
   ~865px de bannières (intégrations, capture email, avertissement, « Smart
   optimizations », scores) AVANT de voir le site reconstruit. Capture
   `result-2560` : ~620px de méta-chrome avant le preview.
3. **665px de chrome sur /editor ≥1024** (240 sidebar + 400 chat + paddings) :
   sur 1440, le site n'a que ~750px → le hero « Fournitures de bureau,
   informatique » **casse en cascade** (capture `editor-1440`). C'est le
   « desktop réduit / site perdu » décrit.
4. **Aucun scale, aucun mode device** : `siteRenderedW` suit passivement la
   colonne (322 → 2270px selon la largeur). À 2560, le site est rendu en
   desktop fluide de 2270px (jamais un cadre device réel) ; à 750px il est
   écrasé. Il n'existe pas de rendu Tablet/Mobile ni de « Fit ».
5. **Mobile = desktop empilé** : `/editor` ≤768 place le chat AU-DESSUS du
   preview (`previewTopVh` 50-90) ; pas de bottom sheet.

## 4. Mètre-étalon UX2-5 (cibles chiffrées à battre)

| # | Métrique | Baseline (pire) | Cible |
|---|---|---|---|
| Y1 | `overflowX` à 320/768/1024/1440/2560 | 192 / 52 / 298 | **0 partout** |
| Y2 | `previewTopVh` (result & editor) | 190 (result) / 90 (editor mobile) | **≤ ~5 %** (preview en tête de fold) |
| Y3 | `chromeLeftPx` non repliable | 265 / **665** | repliable → ~0 en mode focus |
| Y4 | modes device réels + Fit | 0 (aucun) | Desktop/Tablet/Mobile + Fit to Screen |
| Y5 | mobile natif (bottom sheets) | empilé | overlays/sheets, preview dominant |

Chaque lot UX2-5 rejouera ce harnais (`.ux1-baseline` archivé dans la
description de commit ; réutilisable) et devra montrer l'amélioration
avant/après sur ces 5 métriques — critère de succès (D8 appliqué au produit).

## 5. Artefacts

Captures baseline (5 largeurs × 2 pages) + `metrics.json` produites hors dépôt
(scratchpad, non versionnées comme les evals). Les deux plus parlantes
(`editor-1440` : 665px de chrome + hero cassé ; `result-2560` : preview sous
620px de bannières) livrées en conversation.
