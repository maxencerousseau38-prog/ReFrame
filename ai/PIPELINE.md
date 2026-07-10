# Carte du pipeline V2 (étape → fichiers → I/O)

> Propriétaire : Claude. Mise à jour quand une étape change de fichier ou de
> contrat. Rôle : éliminer les greps d'orientation — trouver le bon fichier
> en une lecture. Pour le détail d'un module : `ai/MODULES/<module>.md`.

## Chemin de production (route `POST /api/generate-site`, mode smart)

```
URL
 └─ analyzeUrlV2                 extraction/analyze.ts        HTML statique/rendu → extractSite (7 passes) → SiteAnalysis
 └─ enrichWithMeasurements       extraction/analyze.ts        + captureSite (Tier 2 si Chromium) → measuredTokens/measuredScenes
 └─ rewriteContent (si LLM)      llm.ts                       copy sharpening
 └─ runPipeline                  generation/pipeline.ts
     ├─ analyzeBusinessProfile   generation/business.ts       tier/audience/goals (tables par industrie)
     ├─ planSmart                generation/planner.ts        slots (INDUSTRY_FLOW ; opts.hasFaq — F14)
     ├─ buildMoodboard           generation/references.ts     scoring catégoriel des 22 références
     ├─ compileDNA               generation/dna.ts            preset DesignDNA (tier×mood×industrie×font)
     ├─ findClosestReferences    generation/similarity.ts     similarité VISUELLE mesurée → InspirationProfile
     ├─ resolveTree              dna/resolver.ts              FUSION UNIQUE (I1) des couches :
     │    measuredLayer(visualDna)   dna/candidates.ts          measured 0.9
     │    tokensLayer(measuredTokens) dna/candidates.ts          measured, confiance PAR CHAMP
     │    inspirationLayer(profile)  dna/candidates.ts          curated = match (≥0.6)
     │    curatedLayer(moodboard)    dna/candidates.ts          curated 0.5
     ├─ artDirect                generation/art-direction.ts  29 décisions seedées → variantMap
     ├─ compose                  generation/composer.ts       blocs + props ; contenu réel d'abord
     │    buildContentModel        understand/content-model.ts  contenu par scène (headings réels)
     │    compileTokens            dna/tokens.ts                themePatch + --rf-* + @font-face
     ├─ evaluateQuality          generation/quality-gate.ts   8 dimensions, seuil 72, ≤2 itérations
     └─ trace                    dna/content-trace.ts         + provenance contenu (F15)
 └─ SiteRenderer                 components/blocks/index.tsx  themeCss(+tokens) → --brand-* + --rf-* ;
                                                              sections consomment rfSectionPad/rfContainer(+Ratio)/rf-fluid-*
```

## Mesure (branchée en prod via enrichWithMeasurements)

```
captureSite        capture/capture.ts     orchestrateur 3 tiers → RenderedSite (quality explicite)
 ├─ renderCapture  capture/render.ts      Chromium 1440→768→390, screenshots, snapshot injecté
 ├─ collectSnapshot capture/snapshot.ts   styles calculés ~44 props, blocs (descente wrappers F1), paths uniques F3
 └─ collectStylesheets capture/fetch-css.ts CSS externes + @import (budgets, SSRF, LRU 8Mo)
measureTokens      measure/tokens.ts      palette rôles (aire), fonts exactes, clamp fluide 2-viewports, spacing…
measureScenes      measure/scenes.ts      SceneDna[] (type+confiance+raison, grille, contraste, médias, CTA, deltas responsive)
```

## Chemins secondaires

- **Legacy** (`engine:"legacy"`, modes classic/preserve, pages crawlées, `/zpreview`) :
  `generation/engine.ts#generateSite` — sans tokens → tous les `--rf-*` retombent
  sur les fallbacks V5. Suppression prévue C11.
- **Code mort connu** (à purger C11) : `scraping/scrapling-engine.ts`, `extraction/v7/`,
  `lib/library/*` (Premium Composition Library V8/V9 — sera réindexée par signature en C8).
