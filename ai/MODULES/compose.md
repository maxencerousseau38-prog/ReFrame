# Module `src/lib/compose/` — COMPOSITION ENGINE (géométrie de scènes)

**Responsabilité** : résoudre les décisions de COMPOSITION par scène
(mesuré > premium > défaut skin, fill-only) en `SceneSpec` plats attachés aux
blocs — l'unique endroit où mesures/premium/défauts se rencontrent pour la
géométrie. Le renderer reste un exécuteur.

- **Entrées** : `Block[]` (composer) + `SceneSpecSources` = sources NOMMÉES
  fusionnées fill-only par rang (C7d/D7) : `measured` (SceneMeasurement, C6)
  > `dna` (DesignDNA résolue — `composition` présente ⇔ signal réel, gate
  inspiration ≥0.6 ; un preset seul ne pilote jamais). Futures couches (D6/D7 :
  BusinessDNA, IntentDNA…) = nouvelles entrées, moteur aveugle à l'origine.
- **Sorties** : `Block[]` avec `Block.scene?: SceneSpec` (nouveau tableau ; sans
  mesures → MÊME tableau, mêmes références = transparence V5).
- **Fichiers** :
  - `scene-spec.ts` : `SceneSpec` (path, sceneType, minHeightVh?,
    heroMediaPosition? (C7b), paddingY?, background?, contrastPair?, cols?,
    colsRatio?, gapPx?, mediaZone?, alternate?, provenance par champ) ;
    `sceneSpecFrom` (extraction mesurée,
    bornes saines : hors bornes → champ NON offert, jamais clampé) ;
    `matchScenesToBlocks` (B4 : hero/footer par type, galeries par famille
    `renderableCategory→portfolio`, sections par rang ; `typeConfidence<0.4`
    → rétrogradé "section", A2) ; `compileSceneSpecs` (entrée B3, appelée par
    `composer.ts#compose` après le quality pass) ; `assertRenderable`.
- **Côté renderer** (B2/B5) : `SceneShell` dans `blocks/index.tsx` — sans
  `scene` rend EXACTEMENT le wrapper V5 ; avec, publie `--rf-scene-minh/pt/pb/
  bg/ink/cols/ratio/gap` + `data-scene`/`data-scene-media`/`data-scene-alt`.
  Il ne peint RIEN : les skins migrent en `var(--rf-scene-*, <V5>)` famille
  par famille — zéro double géométrie. **C7b fait** : 13/13 heroes consomment
  minh/pt/pb ; `BlockRenderer` passe `_scene` en prop pour les décisions
  non-CSS (heroMediaPosition). Reste : grilles C7c.
- **Invariants** : I1 fill-only (premium/C7d ne remplira que les trous),
  no-fabrication (bornes : hero viewportRatio [0.35,1.4], padding [0,400],
  gap [0,160], cols [2,4], ratio fr [0.5,2]), A2 par champ, compat V5
  (transparence prouvée au DOM), pur/déterministe/sans DOM.
- **Tests** : `scene-spec.test.ts` (21) — extraction+bornes, matching,
  transparence (mêmes références), non-mutation, provenance, premium fill-only
  (I1), gate preset, trace. + E2E : candidates.test (déterminisme runPipeline).
- **C7d fait** : premium remplit le hero (occupation→minHeightVh,
  imagePosition→heroMediaPosition) ; `sceneTraceEntries` → PipelineTrace
  (`scene.<type>.<champ>`, chemin déterministe `premium:<type>`) ; occupation
  ≥85 route un skin full-bleed (composer) ; ordre mesuré → varySectionOrder.
- **À venir** : C7e validation ; C8 BusinessDNA (D6/F18) comme nouvelle source.
