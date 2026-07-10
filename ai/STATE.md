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
  prouvé au DOM). Fiche : `ai/MODULES/compose.md`.
- **Baseline verte** : 493 tests passed | 3 skipped · `npx tsc --noEmit` propre.
- **F17 (ouvert, → C10)** : overflow zpreview restaurant@768 flaky (7↔440px),
  PRÉEXISTANT (reproduit sans C7a) — mesure d'overflow à stabiliser dans le
  harnais C10, pas de fix renderer.

## Prochaine action

**C7b — Hero Engine.** Les 13 heroes consomment `var(--rf-scene-minh/pt/pb, <V5>)`
(+ `mediaPosition` via `data-scene-media`/props) par petits groupes de 3-4
heroes/commit, screenshots avant/après par hero + overflow 4 largeurs
(`docs/C7_PREPARATION.md` §4). Les vars sont DÉJÀ publiées par le SceneShell —
il ne reste qu'à faire céder la géométrie figée des skins. Ensuite C7c
(grilles/gaps/alternances), C7d (A4 premium dans la DNA + trace PipelineTrace),
C7e (validation). Sprint en cours : C7 complet.

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
