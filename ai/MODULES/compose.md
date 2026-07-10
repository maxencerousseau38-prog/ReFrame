# Module `src/lib/compose/` — COMPOSITION ENGINE (géométrie de scènes)

**Responsabilité** : résoudre les décisions de COMPOSITION par scène
(mesuré > premium > défaut skin, fill-only) en `SceneSpec` plats attachés aux
blocs — l'unique endroit où mesures/premium/défauts se rencontrent pour la
géométrie. Le renderer reste un exécuteur.

- **Entrées** : `Block[]` (composer) + `analysis.measuredScenes` (`SceneMeasurement`, C6).
- **Sorties** : `Block[]` avec `Block.scene?: SceneSpec` (nouveau tableau ; sans
  mesures → MÊME tableau, mêmes références = transparence V5).
- **Fichiers** :
  - `scene-spec.ts` : `SceneSpec` (path, sceneType, minHeightVh?, paddingY?,
    background?, contrastPair?, cols?, colsRatio?, gapPx?, mediaZone?,
    alternate?, provenance par champ) ; `sceneSpecFrom` (extraction mesurée,
    bornes saines : hors bornes → champ NON offert, jamais clampé) ;
    `matchScenesToBlocks` (B4 : hero/footer par type, galeries par famille
    `renderableCategory→portfolio`, sections par rang ; `typeConfidence<0.4`
    → rétrogradé "section", A2) ; `compileSceneSpecs` (entrée B3, appelée par
    `composer.ts#compose` après le quality pass) ; `assertRenderable`.
- **Côté renderer** (B2/B5) : `SceneShell` dans `blocks/index.tsx` — sans
  `scene` rend EXACTEMENT le wrapper V5 ; avec, publie `--rf-scene-minh/pt/pb/
  bg/ink/cols/ratio/gap` + `data-scene`/`data-scene-media`/`data-scene-alt`.
  Il ne peint RIEN : les skins migrent en `var(--rf-scene-*, <V5>)` famille
  par famille (heroes C7b, grilles C7c) — zéro double géométrie.
- **Invariants** : I1 fill-only (premium/C7d ne remplira que les trous),
  no-fabrication (bornes : hero viewportRatio [0.35,1.4], padding [0,400],
  gap [0,160], cols [2,4], ratio fr [0.5,2]), A2 par champ, compat V5
  (transparence prouvée au DOM), pur/déterministe/sans DOM.
- **Tests** : `scene-spec.test.ts` (16) — extraction+bornes, matching,
  transparence (mêmes références), non-mutation, provenance measured.
- **À venir** : C7b heroes consommateurs ; C7c grilles/alternances ; C7d couche
  premium (ReferenceDNA) + défauts DNA dans compileSceneSpecs + trace dans la
  PipelineTrace ; ordre mesuré → plan (`sceneOrderMeasured`).
