# Chantier 7 — Préparation : SceneShell & Composition Engine

> Statut : **audit + plan validables — aucun code C7 écrit**
> Pré-requis atteints : A1 (rythme), A2 (containers/hiérarchie de largeurs),
> A3 (échelle typo) — le renderer consomme désormais la DesignDNA pour ces
> trois axes. C7 étend ce raccordement à la **composition** (géométrie de
> scènes), pilotée par la SceneDNA mesurée + les décisions premium.

---

## 1. Audit du renderer — où la composition est encore figée

Chiffres mesurés sur `src/components/blocks/index.tsx` (~4 200 lignes) :

| Axe de composition | État | Volume |
|---|---|---|
| **Grilles** | figées par composant | ~40 déclarations `grid-cols-*` (11× `sm:grid-cols-2`, 9× `lg:grid-cols-3`, 4× `lg:grid-cols-4`, ratios custom `[1.05fr_0.95fr]`, `[3rem_1fr_1.1fr]`…) |
| **Gaps** | figés | ~100 `gap-*` (27× gap-3, 22× gap-4, 9× gap-12…) |
| **Heroes** | géométrie figée | 13 composants ; 8 `min-h-*`/`minHeight` ; 4 encore en `py-*` figé ; `props.heightVh` lu par 1 seul ; `imagePosition/overlay/parallax` **jamais lus** |
| **Alternances texte/image** | figées ou seedées | `FeaturesAlternating` alterne par index ; `imagePlacements` de l'AD jamais consommé |
| **Proportions verticales / occupation viewport** | figées | aucun composant ne lit `SceneDna.bounds.viewportRatio` |
| **Zones média** | figées | `SceneDna.media[].zone` (3×3 + behind) mesuré en C6, **zéro consommateur** |
| **Transitions entre sections** | uniformes | fonds alternés par `alternateBackgrounds` global, pas par scène mesurée |

**Sources de vérité déjà disponibles mais inertes** :
- `analysis.measuredScenes` (C6) : bounds/viewportRatio/fullBleed, grille calculée (tracks/colonnes/gap), paddings, fond+contraste mesurés, zones média, CTA réels, deltas responsive par path — **consommé uniquement par `heroCtaLabel`**.
- `ReferenceDNA.layout/hero/image` (premium) : gridPhilosophy, asymmetryIntensity, sectionRhythm, viewportOccupation, imagePosition, galleryStyle — **non mappés** par `inspirationLayer` (la DesignDNA n'a pas encore ces champs → A4 intégré à C7d).
- `ArtDirection.imagePlacements/asymmetry/compositionStyle` : calculés, injectés dans `_dna`, jamais lus.

## 2. Points de branchement minimaux (identifiés, non intrusifs)

| # | Point | Localisation | Nature |
|---|---|---|---|
| B1 | `Block.scene?: SceneSpec` | `generation/types.ts` | champ additif |
| B2 | **Montage du SceneShell** | `SiteRenderer` L~4160 : le `<div key={block.id}>` qui wrappe déjà chaque bloc | le shell remplace ce div ; zéro changement dans les 46 composants |
| B3 | `compileSceneSpecs()` | nouveau `compose/scene-spec.ts`, appelé par `composer.ts#compose` (3 lignes) | fill-only : scène mesurée > premium > défauts DNA |
| B4 | Matching scène↔bloc | hero/nav/footer par type ; sections par catégorie + ordre | pur, testable |
| B5 | Vars par scène | le shell pose `--rf-scene-cols/gap/media/bg` sur son wrapper ; les composants migrent famille par famille (C7c/C9) en `var(--rf-scene-*, fallback-V5)` | même patron qu'A1-A3 |
| B6 | Champs composition DNA (A4) | `DesignDNA` +`composition{negativeSpaceRatio?, heroViewportOccupation?, asymmetry?, sectionRhythm?}` ; mappés par `visualDnaPartial`/`tokensLayer` (mesures) et `inspirationLayer` (ReferenceDNA) | additif, resolver inchangé |

## 3. Architecture cible (5 moteurs, réutilisation maximale)

```
Measure Engine        measure/tokens.ts + measure/scenes.ts        (existant, C4/C6)
      ↓
SceneDNA              SceneDna[] mesurées                          (existant)
      ↓
Reference Learning    findClosestReferences + richDna              (existant, branché)
      ↓
Similarity            similarity.ts                                 (existant)
      ↓
Composition Engine    compose/scene-spec.ts  ← NOUVEAU (C7a)
   ├─ Hero Engine        heroSpec(): viewport, media, layering      (extension du pickHeroVariant existant)
   └─ Layout Engine      layoutSpec(): cols/gap/alternance/zones    (nouveau, pur)
      ↓
Renderer = exécuteur  SceneShell (nouveau, ~80 l.) + skins existants consommant --rf-scene-*
```

- **SceneDescription** (= `SceneSpec` runtime) : la SceneDna **résolue** fill-only
  (mesuré > premium > défaut DNA), plate, sans `undefined` sur les champs
  requis (`assertRenderable`), attachée au bloc. Champs : `minHeightVh?`,
  `paddingY?`, `background?`, `inverted?`, `cols?`, `colsRatio?`, `gap?`,
  `mediaZone?`, `alternate?`, `contrastPair?`, `provenance`.
- **SceneShell** : composant unique remplaçant le wrapper existant de
  `SiteRenderer`. Applique UNIQUEMENT ce que les skins ne posent plus
  (progressif) : `minHeight` (hero), fond/inversion par scène, et publie les
  `--rf-scene-*`. Aucun markup décoratif — le skin reste l'idiome visuel.
- **Composition Engine** : pur, déterministe, testable sans DOM ; unique
  endroit où mesures/premium/défauts se rencontrent pour la géométrie
  (mêmes règles I1/A2 que le resolver, mêmes `Sourced` pour la trace).
- **Hero Engine** : `pickHeroVariant` existant + `heroSpec()` — occupation
  viewport (mesurée `bounds.viewportRatio` > premium `viewportOccupation` >
  `dna.heroDirection.heightVh`), position média (mesurée `hero.mediaPosition`
  > premium > DNA), layering/overlay.
- **Layout Engine** : `layoutSpec()` — colonnes (tracks mesurés → ratio fr
  simplifié ; sinon `gridPhilosophy` premium ; sinon défaut du skin), gap
  (mesuré > `--rf-space-section`/4), alternance (ordre mesuré des zones
  média par scène > `sectionRhythm` premium > alternance par index actuelle).

**Réponses aux 9 axes demandés** : occupation viewport → `minHeightVh`
(B2/B6) ; proportions texte/image → `colsRatio` depuis tracks mesurés ou
`visualWeight` premium ; colonnes → `cols` ; alternances → `alternate` par
scène ; espaces négatifs → `paddingY` scène (surcharge du `--rf-space-section`
global) + `negativeSpaceRatio` premium (B6) ; hiérarchie visuelle →
`typeScale`/A3 + `inverted` par scène ; zones média → `mediaZone` (3×3 +
behind) ; storytelling → ordre mesuré des scènes (déjà `sceneOrderMeasured`,
à brancher dans `varySectionOrder`) ; transitions entre sections → fonds par
scène mesurés (`background/contrastPair`) au lieu de l'alternance globale.

## 4. Plan d'implémentation (sous-lots)

| Lot | Contenu | Fichiers | Risque | Est. |
|---|---|---|---|---|
| **C7a** | `SceneSpec` + `compileSceneSpecs` (Composition Engine, pur) + matching scène↔bloc + `Block.scene` + SceneShell minimal monté en B2 (fond/minHeight/vars ; transparent sans scene) + tests | `compose/scene-spec.ts` (nouveau), `types.ts`, `composer.ts` (+3 l.), `blocks/index.tsx` (+~40 l.) | faible (shell transparent par défaut) | 1 lot |
| **C7b** | **Hero Engine** : les 13 heroes consomment `minHeightVh`/`mediaPosition`/`paddingY` (leur géométrie figée tombe, fallbacks V5) — le hero = 50 % du perçu | `blocks/index.tsx` (heroes) | moyen (visuel hero) | 1-2 lots |
| **C7c** | **Layout Engine** : Features/Gallery/Portfolio consomment `--rf-scene-cols/gap` + alternance par scène | `blocks/index.tsx` (familles grilles) | moyen | 1-2 lots |
| **C7d** | **A4** : champs composition premium first-class dans la DNA + mapping `inspirationLayer` (asymmetryIntensity, sectionRhythm, negativeSpaceRatio, viewportOccupation) + `sceneOrderMeasured` → plan | `dna.ts`, `dna/candidates.ts`, `planner/pipeline` | faible | 1 lot |
| **C7e** | Validation : comparatifs visuels multi-sites, zpreview 5×4, budget perf, revue PE, registre | — | — | 1 lot |

**Ordre optimal** : C7a → C7b → C7c → C7d → C7e (le shell d'abord car tout
s'y branche ; hero ensuite pour l'impact ; A4 après pour nourrir des
consommateurs qui existent).

## 5. Risques & mitigations

| Risque | Mitigation |
|---|---|
| Double géométrie shell/skin (padding/fond appliqués deux fois) | Le shell n'applique un axe QUE quand le skin l'a cédé (migration par famille, flags par axe dans SceneSpec) ; fallbacks V5 partout |
| Matching scène↔bloc erroné (plan ≠ ordre mesuré) | Matching par type pour hero/nav/footer, par catégorie+rang pour le reste ; scène non matchée → bloc sans `scene` → shell transparent (aucun changement) |
| Sites sans mesures (legacy/zpreview) | `measuredScenes` absent → SceneSpec = premium/défauts seulement → mêmes valeurs qu'aujourd'hui via fallbacks (octet-identique vérifiable) |
| Régression visuelle heroes | C7b par petits groupes (3-4 heroes/commit) + screenshots avant/après par hero + overflow 4 largeurs |
| Tracks mesurés bruités (`grid-template-columns` exotiques) | Simplification en ratios fr bornés (max 4 colonnes, ratio ∈ [0.5, 2]) ; hors bornes → non offert (I1, rien d'inventé) |
| Perf (style/vars par wrapper) | ~10 scènes × ~8 vars = négligeable ; aucun re-render additionnel (props stables) |

## 6. Invariants

I1/G1-G4/A2 inchangés : `compileSceneSpecs` consomme des `Sourced` et
produit une trace par champ de scène (`scene.<path>.<champ>`) ajoutée à la
PipelineTrace ; no-fabrication (une scène sans mesure n'invente rien : elle
hérite du premium gaté par similarité, sinon du défaut du skin) ; compat V5
par fallbacks + shell transparent.
