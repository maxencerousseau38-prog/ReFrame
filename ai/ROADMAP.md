# Roadmap ReFrame V2

> Propriétaire : Claude (statuts) + utilisateur (priorités/GO).
> Source de vérité des chantiers — remplace toute task-list volatile.

## Fait ✅

| Item | Contenu | Réf |
|---|---|---|
| C1 Capture | RenderedSite : Chromium 3 viewports, CSS externes, snapshot, screenshots | `docs/V2_CHANTIER1_CAPTURE_SPEC.md` |
| C2 Resolver | Sourced/refine fill-only, resolveTree, trace ; applyMoodboard supprimé | registre A1-A3 |
| C3 Contenu réel | langue, headings/CTA réels, i18n libellés, FAQ jamais fabriquée (D3) | |
| C4 Tokens mesurés | palette par aire, fonts exactes, clamp 2-viewports, confiance par champ | |
| C5 Token compiler | themePatch + `--rf-*` + @font-face ; deriveScheme = fallback | |
| C6 SceneDNA | scènes mesurées (F1/F3/F8/F14/F15/F16 clos) | |
| Raccordement prod | `enrichWithMeasurements` dans la route (D4) | |
| Reference Learning | inspirationLayer + 6 richDna premium (D5), diversité prouvée | |
| A1 Rythme | 37 sections `rfSectionPad` (heroes→C7, CTAEditorial exclu) | |
| A2 Containers | `rfContainer` + hiérarchie ×0.89/×0.78 + SiteNav | |
| A3 Typo | `rf-fluid-display/h2/h3` → vars DNA (globals.css) | |
| C7a Composition Engine | `compose/scene-spec.ts` (SceneSpec/compileSceneSpecs/matching B4) + `Block.scene` + SceneShell (`--rf-scene-*`, transparent sans scene) | `ai/MODULES/compose.md` |
| C7b Hero Engine | 13/13 heroes consomment `--rf-scene-minh/pt/pb` (fallbacks V5 exacts par breakpoint) + `heroMediaPosition` mesuré → flip split via `_scene` | preuve : injection vars consommée sur toutes les familles |
| C7c Layout Engine | 13 grilles de cartes (`--rf-scene-cols/gap`), 7 splits (`--rf-scene-ratio`), alternance par scène (FeaturesAlternating via `_scene.alternate`) | 23/29 grilles zpreview consomment (exclusions voulues : footer/hairline/bento) |
| C7d Couche premium | `DesignDNA.composition` (occupation/asymétrie/rythme, mappée par inspirationLayer) → `compileSceneSpecs(sources nommées)` fill-only ; routage full-bleed ≥85 ; ordre mesuré → plan ; `sceneTraceEntries` dans la PipelineTrace ; D7 acté | trace E2E : scene.hero.minHeightVh premium |
| C7e Audit réel | 9 sites réels reconstruits via le VRAI parcours produit : M1-M12 + 44 défauts + carte des fuites (`docs/C8_PREPARATION.md`) ; harnais réutilisable `scripts/c7e-audit.mjs` ; D8 acté (qualité perçue = critère) ; F19-F22 ouverts | clôture C7 |
| **P0 Rebranchement** | smart par défaut (F19) ; mesures sur chemin dashboard (F20) ; zéro fabrication partout (F21, defaultFaq supprimé) ; fidélité du plan ; **F24 clos** (chemin smart rendait des pages vides — clés de props) ; **F25 clos** (blur statique) | avant/après 9 sites : fabriqués 9/9→0/9, FR partout, CTA réels |

## En cours / suivant 🔜

| Item | Contenu | Statut |
|---|---|---|
| **C8-spec** | **Spécification BusinessDNA & Intent Engine livrée** : `docs/C8_BUSINESSDNA_SPEC.md` — 7 couches (Identity/Offer/BusinessModel/Trust/Navigation/Content/Intent), ontologies sectorielles = données (P1/P2), modèle d'entité générique, classification par signaux (fix F22 by design), Intent Engine (intents pondérés page+section → pilotent plan/blocs/CTA/journeys), matrice producteurs↔consommateurs, preuve par les 9 sites, phasage C8a-C8e | **spec v2 VALIDÉE ; D9 actée (expert métier, gate de composition)** |
| **C8-plan** | Audit existant + plan (`docs/C8_IMPLEMENTATION_PLAN.md`) : la chaîne produits existe à 70 % (extractProducts JSON-LD+DOM → bridge → analysis ; PROUVÉ 8 produits réels bruneau) et meurt au composer ; inventaire réutilisable ; B1-B9 additifs ; découpage C8a-e avec gain D8 par lot (a: identité/trust réels · b: catalogue vivant F18 · c: capacités+modèle+classification F22 · d: Intent Engine+parcours · e: Readiness+explication) | **en attente de VALIDATION du plan** |

## Plus tard 📋 (renuméroté 2026-07-10 — D6 : C8 = Business Understanding)

| Item | Contenu |
|---|---|
| **C8** | **Business Understanding Engine** (D6/F18) : industrie exacte, sous-catégorie, modèle économique, objectifs, parcours critiques, objets métier, actions, contenus prioritaires, confiance → **BusinessDNA** injectée dans le Composition Engine comme couche (`CandidateLayer`), AVANT la composition. E-commerce prioritaire (F18 : collections/produits/variantes/prix/panier/fiches générées/CTA métier). Absorbe `business.ts`/`buildContentModel`. |
| C9 (ex-C8) | Library par signature : Premium Composition Library réindexée par SceneSignature, sélection par similarité |
| C10 (ex-C9) | Migration complète des skins (grilles/gaps restants, cartes) |
| C11 (ex-C10) | Quality Gate comparatif Playwright (FidelityReport 6 dims, AuditFloor) + F2/F5/F9/F17 + validation Tier 2 en prod réelle |
| C12 (ex-C11) | Unification moteur : suppression legacy engine/scrapling/v7 ; optimisation double-rendu (D4) ; F13 (langues pt/nl) si non traité avant |

## Vision cible (actée D6 — guide toutes les décisions)

URL → DOM Analysis → Visual Analysis → Capture → Brand Extraction → Content
Extraction → **Business Understanding** → MeasureTokens → SceneDNA → Reference
Learning → Similarity → **Composition** → Motion → Responsive → Quality Review
→ Commercial Readiness → Export. **Business Understanding → Composition,
jamais l'inverse** : le moteur comprend le métier, puis compose. Un site ne
doit plus seulement être beau — il doit paraître conçu par un excellent
designer senior DU secteur (restaurant→excellent restaurant, e-commerce→
véritable e-commerce premium), qualité fonctionnelle/métier/commerciale incluse.

## Findings ouverts (voir registre pour le détail)

F2 (sérialisabilité snapshot en prod → C10) · F5 (concurrence captures → C10) ·
F9 (viewport 320 → C10) · F13 (langues voisines → C6 reliquat/C11).
