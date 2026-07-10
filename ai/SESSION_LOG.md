# Journal des sessions (append-only — 3 à 5 lignes par entrée, le plus récent en haut)

## 2026-07-10 — C7e : audit qualité+métier sur 9 sites réels (clôture C7)
- Harnais `scripts/c7e-audit.mjs` : 9 secteurs reconstruits via le VRAI parcours produit ; dumps+captures+scan source → `docs/C8_PREPARATION.md` (M1-M12, 44 défauts, carte des fuites).
- SMOKING GUNS : F19 (défaut produit = legacy, tout C1→C7 débranché du parcours client), F20 (dashboard bypasse les mesures même en smart), F21 (services préséts fabriqués — violation règle d'or), F22 (industrie fausse 4/9 : hôpitaux→saas « Start free »).
- D8 acté : la qualité perçue devient le critère principal (CONVENTIONS 5bis) ; harnais avant/après réutilisable.
- Suivant : P0 (rebrancher le moteur — 4 fixes, GO à donner) puis C8 BUE sur lacunes prouvées.

## 2026-07-10 — C7d : couche premium dans le Composition Engine + D7
- `DesignDNA.composition` (occupation/asymétrie/rythme) mappée par inspirationLayer ; `compileSceneSpecs(SceneSpecSources{measured?, dna?})` = sources nommées fill-only (D7-ready) ; gate « composition présente ⇔ signal réel » (preset seul ne pilote jamais, testé).
- Occupation premium ≥85 → routage skin full-bleed ; ordre mesuré → varySectionOrder (position galerie) ; sceneTraceEntries → PipelineTrace (fix déterminisme : chemin premium:<type>, pas d'id aléatoire).
- D7 acté au registre : multi-couches Brand/Business/Content/Scene/Design/Motion/Responsive/Quality-DNA + Intent Engine ; renderer sans décision métier, Composition Engine sans logique d'industrie.
- 497 tests verts, tsc propre. Suivant : C7e (validation de clôture C7), puis C8 BUE.

## 2026-07-10 — Vision D6 + C7c : Layout Engine
- D6 acté (registre + ROADMAP renumérotée) : Business Understanding → Composition, jamais l'inverse ; C8 = Business Understanding Engine ; F18 (e-commerce vitrine) ouvert ; Composition Engine générique, BusinessDNA = future couche CandidateLayer.
- C7c : 13 grilles de cartes → `--rf-scene-cols/gap` (breakpoint large, mobile V5 intact) ; 7 splits → `--rf-scene-ratio` ; alternance par scène via `_scene.alternate` (parité V5 fallback). Exclusions voulues : footer/hairline/bento/gap-y.
- Preuves : injection consommée par 23/29 grilles zpreview (6 industries), 494 tests verts, tsc propre, overflow=0 16/16.
- Suivant : C7d (couche premium/DNA dans compileSceneSpecs — plan détaillé dans STATE), puis C7e.

## 2026-07-10 — C7b : Hero Engine (13/13 heroes pilotés)
- 3 commits (b.1 full-bleed ×4, b.2 Premium1/2+SplitPremium+heroMediaPosition bout en bout, b.3 bannières ×6) : min-h/pt/pb figés → `var(--rf-scene-*, <V5 exact>)` (inline ou classes arbitraires par breakpoint pour les paddings responsives).
- Preuves : fallbacks V5 exacts au computed style aux 2 breakpoints ; injection `--rf-scene-minh/pt/pb` consommée sur TOUTES les familles (16 industries testées) ; 494 tests verts ; overflow=0 24/24.
- Décision : heroes bannière sans minh (occupation par le rythme) — l'occupation mesurée forte routera vers un skin full-bleed via pickHeroVariant (C7d). Env : graphify 0.9.12 réinstallé par bootstrap, hook post-commit OK.
- Suivant : C7c Layout Engine (grilles/gaps/alternances par scène — vars et `_scene` déjà en place).

## 2026-07-10 — C7a : fondations du Composition Engine
- `compose/scene-spec.ts` (SceneSpec + compileSceneSpecs fill-only avec bornes saines + matching B4) ; `Block.scene?` ; SceneShell publie `--rf-scene-*`/`data-scene*` sans rien peindre — les skins migreront en `var(--rf-scene-*, <V5>)` (C7b/C7c).
- Transparence V5 prouvée : sans mesures, mêmes références de blocs + wrapper DOM identique (vérifié au DOM sur zpreview). 493 tests verts (477+16), tsc propre, overflow=0 sur 11/12 cellules zpreview.
- F17 ouvert (→ C10) : overflow restaurant@768 flaky (7↔440px), PRÉEXISTANT (reproduit sur la baseline sans C7a).
- Suivant : C7b Hero Engine — faire consommer `--rf-scene-minh/pt/pb` + mediaPosition aux 13 heroes, par groupes de 3-4 avec screenshots avant/après.

## 2026-07-05 — Validation du sprint A1-A3 + OS
- Utilisateur valide : A1/A2/A3, préparation C7, Operating System. Dernier kilomètre DesignDNA→renderer fermé.
- Nouvelle priorité transverse : maximiser la valeur produite par session (sprints, un audit/début de sprint) — actée dans CONVENTIONS §0.
- Suivant : C7a directement en début de prochaine session (GO donné), philosophie Composition Engine confirmée.

## 2026-07-05 — OS de développement IA
- Créé le système de mémoire permanente `ai/` (STATE, ROADMAP, PIPELINE, CONVENTIONS, MODULES×6, ce journal) + bootstrap + hook SessionStart tracké.
- Cause validée : le reset de conteneur avait effacé `.claude/`, node_modules et la révision Chromium — la mémoire vit désormais dans Git.
- Suivant : GO C7a (SceneShell) — plan dans `docs/C7_PREPARATION.md`.

## 2026-07-05 — Sprint A3 + préparation C7
- A3 : typo pilotée par la DNA via `rf-fluid-*` (globals.css), échelles réellement différenciées (Agence 96px/600 vs Luxe 80px/400) ; fallback Chromium `executablePath` dans browser.ts.
- Préparation C7 committée (`docs/C7_PREPARATION.md`) : audit chiffré, B1-B6, 5 moteurs, plan C7a-e.

## 2026-07-04/05 — A1/A2 (dernier kilomètre des tokens)
- A1/A1b : 37 sections en `rfSectionPad` (rythme 120-160px différencié vs 96px figé). A2 : containers `rfContainer` + hiérarchie ×0.89/×0.78 + SiteNav.
- Diagnostic « régression » : aucune — C4-C6 n'étaient juste pas branchés en prod → raccordement `enrichWithMeasurements` (D4).
- Reference Learning branché (D5) + 5 nouveaux richDna premium (linear/stripe/agencia/noma/flavor), diversité prouvée (0.93 linear-like, 0.75 noma-like).

## 2026-07-03/04 — Chantiers V2 1→6
- C1 capture (fixture Framer-like, E1 documenté) ; C2 resolver monotone (I1/G1-G4, applyMoodboard supprimé) ; C3 contenu réel/i18n/no-fabrication FAQ (D3).
- C4 tokens mesurés (confiance par champ) ; C5 token compiler (couleurs/fonts réelles au rendu) ; C6 SceneDNA (+F1/F3/F8/F14/F15/F16 clos).

## Avant (V5→V9)
- Art Director (b7cf45c), Premium Composition Library V8/V9 (~350 compositions, inerte — C8), audit V10 (10 causes racines), blueprint V2 + charte verrouillée.
