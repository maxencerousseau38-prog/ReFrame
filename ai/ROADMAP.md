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

## En cours / suivant 🔜

| Item | Contenu | Statut |
|---|---|---|
| **C7c** | Layout Engine : grilles/gaps/alternances par scène (`--rf-scene-*`) | **suivant** |
| C7d | A4 : champs composition premium dans la DNA + mapping inspirationLayer + ordre mesuré → plan | après C7c |
| C7e | Validation visuelle complète + revue PE + registre | clôture C7 |

## Plus tard 📋

| Item | Contenu |
|---|---|
| C8 | Library par signature : Premium Composition Library réindexée par SceneSignature, sélection par similarité |
| C9 | Migration complète des skins (grilles/gaps restants, cartes) |
| C10 | Quality Gate comparatif Playwright (FidelityReport 6 dims, AuditFloor) + F2/F5/F9 + validation Tier 2 en prod réelle |
| C11 | Unification moteur : suppression legacy engine/scrapling/v7 ; optimisation double-rendu (D4) ; F13 (langues pt/nl) si non traité avant |

## Findings ouverts (voir registre pour le détail)

F2 (sérialisabilité snapshot en prod → C10) · F5 (concurrence captures → C10) ·
F9 (viewport 320 → C10) · F13 (langues voisines → C6 reliquat/C11).
