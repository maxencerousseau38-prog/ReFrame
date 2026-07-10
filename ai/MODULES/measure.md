# Module `src/lib/measure/` — MEASURE

**Responsabilité** : `RenderedSite` → mesures avec confiance par champ.
Que du `measured` ; champ non mesurable = absent + note (jamais de default).

- **Entrées** : `RenderedSite` (Tier 2 requis pour l'essentiel).
- **Sorties** : `MeasuredTokens` (`tokens.ts`) : palette par rôles pondérée par
  l'aire peinte, fonts exactes+faces, échelle px + **clamp fluide reconstruit
  2-viewports**, paddings→multiplier, container, radius/ombres, prefersDark.
  `SceneMeasurement` (`scenes.ts`) : `SceneDna[]` — type inféré ASSUMÉ
  (confiance+raison), bounds/viewportRatio, grille calculée, contraste WCAG réel,
  zones média 3×3+behind, CTA réels (`heroCtaLabel` F16), motion, deltas
  responsive joints PAR PATH (F3), `sceneOrderMeasured`.
- **Fichiers** : `tokens.ts`, `scenes.ts` (+ leurs tests hermétiques sur RenderedSite synthétique).
- **Dépendances** : `capture/types`, `generation/color.ts#contrastRatio`.
- **Invariants** : `MeasuredValue{value, confidence, origin}` partout ; origin précis à la méthode.
- **Consommateurs** : `extraction/analyze.ts` (attache `measuredTokens/measuredScenes`),
  `dna/candidates.ts#tokensLayer`, C7 Composition Engine (SceneDna → SceneSpec).
- **Dette** : `measuredScenes` encore sous-consommé (grilles/zones média → C7a-c).
- **À venir** : C7 (SceneSpec), enrichissement par `runtimeCss`/stylesheets si besoin.
