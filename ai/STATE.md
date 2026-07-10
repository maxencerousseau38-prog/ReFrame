# ReFrame — ÉTAT COURANT (point d'entrée de session)

> **Règle : ce fichier est la SEULE lecture obligatoire en début de session.**
> Il est injecté automatiquement (hook SessionStart). Pour localiser du code :
> `graphify query/explain/path` — jamais de lecture exploratoire du dépôt.
> Propriétaire : Claude. Mis à jour AVANT le dernier commit de chaque session/sous-lot.

## Où on en est (2026-07-05)

- **Branche** : `claude/siterevive-ai-saas-a9sxzw` (remote renommé → `maxencerousseau38-prog/ReFrame`, redirect OK).
- **Fait & mergé** : Chantiers V2 1→6 (capture, resolver monotone, contenu réel/i18n,
  tokens mesurés, token compiler, SceneDNA) · raccordement production C4→C6
  (`enrichWithMeasurements`, kill-switch `REFRAME_MEASURE=0`) · Reference Learning
  Engine branché (6 richDna premium, seuil 0.6) · **A1/A2/A3** : rythme vertical,
  containers (+hiérarchie ×0.89/×0.78) et typo (via `rf-fluid-*` de globals.css)
  pilotés par la DesignDNA sur 100 % des sections non-hero (fallbacks V5 exacts).
- **Baseline verte** : 477 tests passed | 3 skipped · `npx tsc --noEmit` propre.

## Prochaine action

**C7a — SceneShell + Composition Engine : GO DONNÉ (2026-07-05).**
Démarrer DIRECTEMENT, sans nouvel audit : tout est dans `docs/C7_PREPARATION.md`
(branchements B1-B6, risques, ordre C7a→C7e). Philosophie confirmée :
Measure → SceneDNA → Reference Learning → Similarity → Composition Engine →
Renderer-exécuteur. Priorité transverse : MAXIMISER la valeur produite par
session (sprints cohérents, un seul audit en début de sprint).

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
