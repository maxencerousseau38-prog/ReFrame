# ReFrame — ÉTAT COURANT (point d'entrée de session)

> **Règle : ce fichier est la SEULE lecture obligatoire en début de session.**
> Il est injecté automatiquement (hook SessionStart). Pour localiser du code :
> `graphify query/explain/path` — jamais de lecture exploratoire du dépôt.
> Propriétaire : Claude. Mis à jour AVANT le dernier commit de chaque session/sous-lot.

## Où on en est (2026-07-10)

- **Branche** : `claude/siterevive-ai-saas-a9sxzw` (remote renommé → `maxencerousseau38-prog/ReFrame`, redirect OK).
- **Fait & mergé** : Chantiers V2 1→6 · raccordement prod C4→C6
  (`enrichWithMeasurements`, kill-switch `REFRAME_MEASURE=0`) · Reference Learning
  (6 richDna, seuil 0.6) · **A1/A2/A3** (rythme/containers/typo pilotés par la DNA,
  fallbacks V5) · **C7a — Composition Engine fondé** : `compose/scene-spec.ts`
  (SceneSpec, compileSceneSpecs fill-only + bornes, matching B4), `Block.scene?`,
  `SceneShell` publie `--rf-scene-*`+`data-scene*` (transparent sans scene,
  prouvé au DOM). Fiche : `ai/MODULES/compose.md` · **C7b — Hero Engine** :
  13/13 heroes consomment `--rf-scene-minh/pt/pb` (inline `rfHeroMinH/rfHeroPadY`
  pour full-bleed/Split, classes arbitraires par breakpoint pour les bannières
  responsives — fallbacks V5 exacts vérifiés aux 2 largeurs) ; `heroMediaPosition`
  mesuré → `_scene` prop (BlockRenderer) → flip `lg:order` (Premium2/SplitPremium)
  · **C7c — Layout Engine** : 13 grilles de cartes (`--rf-scene-cols/gap` au
  breakpoint large, stacking mobile V5 intact), 7 splits (`--rf-scene-ratio`),
  alternance par scène (`FeaturesAlternating` via `_scene.alternate`, parité V5
  en fallback). Exclusions voulues : footer, hairline gap-px, bento interne,
  gaps verticaux de rythme · **D6 acté** : Business Understanding → Composition
  (jamais l'inverse) ; C8 = Business Understanding Engine (F18 e-commerce
  vitrine) ; Composition Engine reste générique, BusinessDNA = future couche
  · **C7d — couche premium** : `DesignDNA.composition` (mappée par
  inspirationLayer) → `compileSceneSpecs(blocks, SceneSpecSources{measured?,
  dna?})` fill-only (gate : composition présente ⇔ signal réel ; un preset
  seul ne pilote jamais) ; occupation ≥85 → skin full-bleed ; ordre mesuré →
  `varySectionOrder` (position galerie) ; `sceneTraceEntries` → PipelineTrace
  · **D7 acté** : multi-couches (Brand/Business/Content/Scene/Design/Motion/
  Responsive/Quality-DNA) + Intent Engine — sources nommées, moteur aveugle
  à l'origine, zéro logique métier dans compose/renderer.
- **Baseline verte** : 497 tests passed | 3 skipped · `npx tsc --noEmit` propre.
- **F17 (ouvert, → C10)** : overflow zpreview restaurant@768 flaky (7↔440px),
  PRÉEXISTANT (reproduit sans C7a) — mesure d'overflow à stabiliser dans le
  harnais C10, pas de fix renderer.

## Prochaine action

**P0 — Rebrancher le moteur dans le produit (GO à donner).** L'audit C7e
(`docs/C8_PREPARATION.md`, M1-M12 + 44 défauts + carte des fuites) a prouvé
que le parcours produit par défaut passe par le LEGACY (F19 : dashboard
`preserve` → `generateSite`), que le smart via dashboard n'a jamais de
mesures (F20 : enrich seulement sur `url` nu), et que des services préséts
anglais sont FABRIQUÉS (F21 : `bridge.ts:61` + composer L277/356). P0 = ces
4 corrections → gain de qualité perçue maximal à coût minimal, à prouver
avant/après avec `scripts/c7e-audit.mjs` (harnais réutilisable, D8 : la
qualité perçue est désormais LE critère — CONVENTIONS 5bis). Ensuite : **C8
Business Understanding Engine** sur la base des lacunes prouvées (F18/F22,
§4 du rapport : BusinessDna, extraction par familles de signaux,
classification par signaux métier, couche businessLayer + entrée
`SceneSpecSources.business`).

## Commandes

- Tests : `npm test` · Typecheck : `npx tsc --noEmit` · Audit Chromium : `AUDIT=1 npx vitest run src/lib/capture/capture.audit.test.ts`
- Vérif visuelle : dev server + zpreview 320/390/768/1440, overflow=0 exigé (protocole dans `ai/CONVENTIONS.md`).
- Nouveau conteneur ? → `bash ai/bootstrap.sh` (node_modules, graphify+hooks, sanity Chromium).

## Pièges d'environnement connus

- **E1** : la sandbox tue les handshakes TLS des navigateurs vers l'extérieur
  (CONNECT 200 puis reset) → Tier 2 réel invérifiable ici ; fixtures locales OK.
- Les conteneurs sont **recréés** : node_modules/.claude/.git-hooks/binaires Chromium
  peuvent disparaître → `ai/bootstrap.sh`. Chromium préinstallé : `/opt/pw-browsers/chromium`
  (fallback `executablePath` déjà dans `server/browser.ts`).
- `pkill` en fin de commande composée → exit 144 : lancer `pkill` dans une commande séparée.
- vitest n'affiche pas `console.log` des tests verts : `--silent=false --disable-console-intercept`.

## Cartes (ne relire les sources qu'après Graphify)

`ai/PIPELINE.md` (pipeline→fichiers) · `ai/MODULES/*.md` (fiches par module) ·
`ai/ROADMAP.md` (chantiers) · `ai/CONVENTIONS.md` (protocole, patrons, gouvernance docs) ·
`docs/ARCHITECTURE_DECISIONS.md` (registre F/D/E/A — décisions actées) ·
`ai/SESSION_LOG.md` (journal append-only).
