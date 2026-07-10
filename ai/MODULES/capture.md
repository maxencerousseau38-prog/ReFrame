# Module `src/lib/capture/` — CAPTURE (Tier 2 nominal)

**Responsabilité** : URL → `RenderedSite` (le site tel que vu : DOM post-JS, CSS
externes+CSSOM vivant, styles calculés, fonts, screenshots 390/768/1440,
géométrie brute des blocs). **Collecte pure, zéro interprétation.**

- **Entrées** : URL (SSRF validé par l'appelant), `CaptureOptions` (+seams de test `CaptureInternals`).
- **Sorties** : `RenderedSite` + `CaptureQuality` explicite par artefact (jamais d'échec silencieux).
- **Fichiers** : `capture.ts` (orchestrateur 3 tiers), `render.ts` (Chromium : 1 chargement,
  resize desc., re-scroll complet/viewport F8), `snapshot.ts` (script sérialisable injecté :
  ~44 props calculées, descente wrappers F1, paths uniques F3, CSSOM F10),
  `fetch-css.ts` (@import prof. 2, budgets 20f/3Mo, LRU 8Mo, SSRF/sous-ressource), `types.ts`.
- **Dépendances** : `server/browser.ts` (withPage, proxy env, fallback executablePath),
  `generation/engine.ts` (assertSafeTarget, fetchStatic, BROWSER_UA, looksLikeChallenge).
- **Invariants** : aucun default émis ; budgets stricts partout ; screenshots memory-only (F4).
- **Tests** : `fetch-css.test.ts`, `capture.test.ts`, `snapshot.test.ts` (hermétiques) ;
  `capture.audit.test.ts` (Chromium réel, `AUDIT=1`, fixture `__fixtures__/mini-site` Framer-like ;
  démo site réel via `AUDIT_URL=`).
- **Dette** : F2 (sérialisabilité de `collectSnapshot` sous bundler prod — C10) ;
  F5 (pas de sémaphore de concurrence — C10) ; F9 (pas de viewport 320 — C10).
- **À venir** : consommation des screenshots par VERIFY (C10).
