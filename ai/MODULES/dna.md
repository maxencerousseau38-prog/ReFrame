# Module `src/lib/dna/` — RESOLVE (le point de fusion unique)

**Responsabilité** : fusion monotone de toutes les sources de décisions design
(I1/G1-G4/A2) + compilation des tokens de rendu + trace de provenance.

- **Entrées** : preset `DesignDNA` (compileDNA) + couches partielles.
- **Sorties** : `DesignDNA` résolue (gelée) + `PipelineTrace` + `CompiledTokens`.
- **Fichiers** :
  - `provenance.ts` : `Sourced<T>` (gelé), rangs + règle A2 (<0.4 rétrogradé),
    `resolveField` (tri INTERNE — l'appelant ne contrôle jamais la précédence),
    `refine` fill-only, `traceEntry`, `deepFreeze` (skip Buffers).
  - `resolver.ts` : `resolveTree` (feuilles ; tableaux atomiques ; extras greffés ;
    conflits de forme archivés ; `fieldConfidence/fieldOrigin` par chemin).
  - `candidates.ts` : producteurs de couches — `measuredLayer` (VisualDNA),
    `tokensLayer` (MeasuredTokens, confiance/champ), `inspirationLayer`
    (Reference Learning, gate `MIN_INSPIRATION_MATCH=0.6`, conf=match),
    `curatedLayer` (moodboard, conf 0.5).
  - `tokens.ts` : `compileTokens` → themePatch (palette mesurée → champs
    optionnels de `Theme`, gate 0.4), vars `--rf-*`, fonts réelles + @font-face,
    `tokenVarOverrides` (renderer).
  - `content-trace.ts` : provenance du contenu (langue/headings/CTA, F15).
- **Invariants** : jamais de merge ad hoc — toute nouvelle source = un producteur
  `CandidateLayer` ici. `TOKEN_CONFIDENCE_FLOOR = LOW_CONFIDENCE_MEASURED = 0.4`.
- **Tests** : provenance (19), resolver (11), candidates/tokens-layer/inspiration/tokens.compile/content-trace.
- **À venir** : C7d/A4 — champs composition (`negativeSpaceRatio`, `heroViewportOccupation`,
  asymétrie, sectionRhythm) + leur mapping inspirationLayer.
