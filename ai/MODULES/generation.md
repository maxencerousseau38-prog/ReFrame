# Module `src/lib/generation/` — GÉNÉRATION (pipeline V5→V2)

**Responsabilité** : `SiteAnalysis` → `SiteSchema` (blocs+variants+props+theme+tokens).

- **Fichiers clés** : `pipeline.ts` (orchestration ; couches resolver ; trace ;
  `PipelineResult.inspiration`) · `composer.ts` (blocs, contenu réel d'abord via
  ContentModel, `applyThemePatch`, `schema.tokens`, no-fabrication FAQ) ·
  `planner.ts` (INDUSTRY_FLOW ; `opts.hasFaq` F14) · `business.ts` (tables/industrie) ·
  `dna.ts` (compileDNA presets) · `art-direction.ts` (29 décisions seedées, variantMap) ·
  `references.ts`+`reference-db.ts` (moodboard catégoriel, 22 refs) ·
  `reference-dna.ts`+`reference-library.ts` (**6 richDna premium** : archform, linear,
  stripe, agencia, noma, flavor — décisions mesurables uniquement, JAMAIS de markup) ·
  `similarity.ts` (`findClosestReferences`) · `quality-gate.ts` (8 dims, seuil 72) ·
  `labels.ts` (i18n en/fr/es/de/it, EN = octet-identique V5) · `color.ts` (deriveScheme = fallback) ·
  `engine.ts` (LEGACY — pages crawlées/zpreview ; suppression C11).
- **Invariants** : contenu réel > libellé localisé > preset ; accent/primary mesurés
  priment hint/preset ; toute fusion passe par le resolver (jamais ici).
- **Tests** : pipeline.test (fixtures sans visualDna = compat V5), composer-content,
  composer-tokens, content-trace, inspiration-layer, reference-diversity, similarity, quality.
- **Dette** : mood figé par industrie + pools de variantes étroits (diversité par seed) —
  traité progressivement par C7/C8 ; engine.ts legacy (C11) ; double rendu D4 (C11).
- **À venir** : C7a `compose/scene-spec.ts` (Composition Engine) appelé d'ici.
