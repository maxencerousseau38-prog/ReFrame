# ReFrame V2 — Chantier 1 : Spécification technique de la couche CAPTURE

> Statut : **proposé — en attente de validation**
> Charte applicable : REFRAME V2 (invariants I1–I3, principes 1–10 verrouillés)
> Règle de l'étape (charte) : **« aucune interprétation, uniquement collecte »**
> Ce document est le contrat d'implémentation. Toute déviation pendant le
> développement doit être signalée et validée avant d'être codée.

---

## 1. Périmètre

### 1.1 Objectif

Construire `src/lib/capture/` : la couche d'acquisition qui transforme une URL
en `RenderedSite` — le site source **tel qu'un humain le voit**, à trois
largeurs — sans aucune interprétation sémantique.

### 1.2 Dans le périmètre

- Tier 2 (chemin de référence, principe #10) : rendu Chromium local via le
  `withPage()` existant — DOM post-JS, styles calculés, fonts, screenshots
  390/768/1440, géométrie brute des blocs.
- Tier 1 (fallback) : fetch statique + **récupération des CSS externes**
  (`<link rel="stylesheet">` + `@import`, récursif).
- `CaptureQuality` : état explicite de chaque artefact (jamais d'échec silencieux).
- Branchement additif derrière flag ; chemin V5 par défaut **octet-identique**.

### 1.3 Hors périmètre (chantiers ultérieurs)

- Toute mesure/interprétation (palette, échelle typo, détection de sections
  sémantiques) → Chantier 4/6 (MEASURE).
- Consommation du `RenderedSite` par l'extraction → début au Chantier 4.
- Comparaison source/sortie → Chantier 10 (VERIFY).
- Suppression de `scraping/scrapling-engine.ts` → Chantier 11.

---

## 2. Nouveaux dossiers et fichiers

```
src/lib/capture/
  types.ts        Tous les types du contrat CAPTURE (section 3)
  fetch-css.ts    Tier 1 : collecte des feuilles de style externes
  snapshot.ts     Script injecté dans la page (styles calculés, fonts,
                  géométrie, animations) — fonction sérialisable pure
  render.ts       Tier 2 : orchestration Chromium (goto, settle, scroll,
                  3 viewports, screenshots, injection de snapshot.ts)
  capture.ts      Orchestrateur : décision de tier, assemblage RenderedSite,
                  CaptureQuality, cache
  index.ts        API publique : captureSite(), types ré-exportés

src/lib/capture/__fixtures__/
  mini-site/      Fixture HTML+CSS+font locale pour le test d'intégration
                  (index.html, styles.css, deep.css via @import, font.woff2,
                  image lazy-load)

src/lib/capture/fetch-css.test.ts
src/lib/capture/capture.test.ts        (unitaires, fetch mocké, hermétiques)
src/lib/capture/capture.audit.test.ts  (intégration Chromium, gated AUDIT=1)
```

Aucun fichier V5 supprimé. **Un seul fichier V5 modifié** (section 7).

---

## 3. Types et interfaces (contrat complet)

Tout ce que produit CAPTURE est par définition `measured` ; le wrapper
`Sourced<T>` (Chantier 2) n'est donc **pas** requis ici — la provenance est
portée par `RenderedSite.quality` + `origin` implicite (`capture/*`). C'est le
Chantier 2 qui enveloppera ces données à l'entrée du Resolver.

```ts
// ── capture/types.ts ────────────────────────────────────────────────

/** Largeurs de référence de toute la V2 (capture, render, verify). */
export const CAPTURE_VIEWPORTS = [390, 768, 1440] as const;
export type CaptureViewport = (typeof CAPTURE_VIEWPORTS)[number];

export type CaptureTier = "static" | "rendered";

/** État explicite de chaque artefact — jamais d'échec silencieux (charte). */
export interface CaptureQuality {
  tier: CaptureTier;
  html: "rendered" | "static" | "none";
  css: "full" | "partial" | "none";        // partial = budget atteint ou fetchs manqués
  cssFetched: number;                       // feuilles récupérées
  cssFailed: string[];                      // URLs en échec (traçabilité)
  computedSnapshot: boolean;
  screenshots: CaptureViewport[];           // largeurs effectivement capturées
  fonts: "collected" | "none";
  geometry: boolean;
  challenge: boolean;                       // page anti-bot détectée
  durationMs: number;
  notes: string[];                          // anomalies lisibles (ex: "infinite scroll capped")
}

export interface CapturedStylesheet {
  url: string | null;      // null = <style> inline
  media: string | null;    // attribut media éventuel
  content: string;         // texte CSS brut, non interprété
  bytes: number;
  via: "link" | "import" | "inline";
  depth: number;           // profondeur @import (0 = direct)
}

export interface FontFaceRecord {
  family: string;           // tel que déclaré ("Inter Display")
  weight: string;           // "400", "100 900" (variable)
  style: string;
  src: string | null;       // URL résolue du fichier (woff2 prioritaire)
  status: "loaded" | "declared";  // document.fonts vs @font-face parse
}

/** Styles calculés d'un nœud structurant. Propriétés en camelCase CSSOM. */
export interface ComputedNodeStyle {
  /** Sélecteur court reproductible: "section:nth-of-type(3) > h2:first-of-type" */
  path: string;
  tag: string;
  role: "block" | "heading" | "text" | "media" | "action" | "nav";
  text?: string;            // premiers 160 caractères, trim (collecte, pas contenu)
  rect: DOMRectLike;        // à CE viewport
  styles: Record<string, string>;  // sous-ensemble COMPUTED_PROPS (section 6.2)
}

export interface DOMRectLike { x: number; y: number; width: number; height: number }

/** Géométrie BRUTE des blocs de premier niveau — aucune sémantique (charte).
 *  Le typage "hero/features/…" appartient à MEASURE (Chantier 6). */
export interface RawBlockGeometry {
  path: string;
  rect: DOMRectLike;
  backgroundColor: string;      // computed, tel quel
  backgroundImage: string;      // computed, tel quel ("none" inclus)
  childCount: number;
  headingText: string | null;   // premier h1-h3 interne, brut
}

export interface CssAnimationRecord {
  path: string;                 // nœud porteur
  kind: "transition" | "animation" | "webAnimation";
  properties: string[];         // propriétés animées
  duration: number;             // ms
  easing: string;
  delay: number;
}

/** Une passe complète à un viewport donné. */
export interface ViewportCapture {
  viewport: CaptureViewport;
  screenshot: Buffer | null;            // JPEG fullPage (section 6.4)
  nodes: ComputedNodeStyle[];           // snapshot des nœuds structurants
  blocks: RawBlockGeometry[];           // géométrie brute de premier niveau
  scrollHeight: number;
}

/** LA sortie du Chantier 1 — l'entrée de MEASURE (Chantiers 4/6). */
export interface RenderedSite {
  url: string;                          // URL normalisée finale (post-redirect)
  capturedAt: string;                   // ISO — injecté par l'appelant, pas Date.now interne
  html: string;                         // DOM post-JS sérialisé (Tier 2) ou statique (Tier 1)
  stylesheets: CapturedStylesheet[];
  cssVariables: Record<string, string>; // variables :root résolues (getComputedStyle),
                                        // collecte brute — l'interprétation est MEASURE
  fonts: FontFaceRecord[];
  viewports: ViewportCapture[];         // [] en Tier 1
  animations: CssAnimationRecord[];     // [] en Tier 1
  quality: CaptureQuality;
}

export interface CaptureOptions {
  /** "auto" (défaut) : Tier 2 si navigateur dispo, sinon Tier 1. */
  tier?: CaptureTier | "auto";
  viewports?: readonly CaptureViewport[];  // défaut CAPTURE_VIEWPORTS
  screenshots?: boolean;                   // défaut true (Tier 2)
  cssBudget?: { maxFiles: number; maxBytes: number };  // défaut 20 / 3 Mo
  timeoutMs?: number;                      // budget global Tier 2, défaut 30_000
}
```

### API publique (`capture/index.ts`)

```ts
/** Point d'entrée unique. L'appelant DOIT avoir validé l'URL (assertSafeTarget). */
export async function captureSite(url: string, opts?: CaptureOptions): Promise<RenderedSite>;
```

`captureSite` **ne lance jamais** : tout échec dégrade le `CaptureQuality`
(ex: navigateur indisponible → Tier 1 ; CSS en échec → `css:"partial"`).
La seule exception propagée est `BlockedUrlError` (SSRF), déjà levée en amont.

---

## 4. Réutilisation de l'existant (principe #4 — zéro code mort nouveau)

| Existant | Rôle dans le Chantier 1 |
|---|---|
| `server/browser.ts` — `withPage()`, `localBrowserReady()` | **Réutilisé tel quel** : substrat navigateur (Chromium partagé, contexte jetable, `ignoreHTTPSErrors` pour le proxy TLS). Une seule évolution tolérée si nécessaire : paramètre `viewport` optionnel sur `withPage` (additif, défaut inchangé) |
| `engine.ts` — `assertSafeTarget`, `normalizeUrl`, `fetchStatic`, `looksLikeChallenge`, `needsRendering` | **Réutilisés tels quels** (imports). `assertSafeTarget` est appliqué à **chaque URL de sous-ressource CSS** avant fetch (anti-SSRF, section 9) |
| `server/render.ts` — `renderHtml()`, `screenshot()` | **Non modifiés.** Ils restent le chemin V5. `capture/render.ts` reprend leurs patterns éprouvés (scroll anti-lazy-load, waitForFunction body text, budgets) sans les casser. Convergence/suppression au Chantier 11 |
| Chemin Browserless (`BROWSERLESS_URL`) | **Hors Tier 2** : l'API `/content` ne permet ni multi-viewport ni script de snapshot. Le Tier 2 exige le Chromium local. Environnement sans Chromium + Browserless configuré → Tier 1 avec HTML rendu via `renderHtml()` (note `quality.notes`) |
| `scraping/scrapling-engine.ts` | **Ni utilisé ni supprimé** dans ce chantier. Son concept 3-tiers est absorbé par `capture.ts` ; le fichier est retiré au Chantier 11 (décision tracée ici pour éviter tout « V6 bis ») |

---

## 5. Flux de données et contrat d'étape

```
captureSite(url, opts)
  1. normalizeUrl(url)            [réutilisé]     — l'appelant a déjà fait assertSafeTarget
  2. Décision de tier:
       opts.tier === "static"           → Tier 1
       opts.tier === "rendered"|"auto"  → localBrowserReady() ? Tier 2 : Tier 1
  3a. TIER 2 (chemin de référence):
       withPage(viewport 1440):
         goto(domcontentloaded, 15s) → networkidle(6s, best-effort)
         → scroll complet (pattern render.ts, cap 12 000 px + note si atteint)
         → document.fonts.ready (3s, best-effort)
         → snapshot 1440 : injectSnapshot() (section 6)
         → screenshot fullPage JPEG
         → setViewportSize(768) → settle 400ms → snapshot + screenshot
         → setViewportSize(390) → settle 400ms → snapshot + screenshot
         → html = page.content()
       puis fetch-css sur les <link> du DOM rendu (mêmes gardes que Tier 1)
  3b. TIER 1 (fallback):
       fetchStatic(url) [réutilisé] → looksLikeChallenge → quality.challenge
       → fetch-css (section 6.1)
       → viewports: [], animations: []
  4. Assemblage RenderedSite + CaptureQuality (chaque artefact évalué)
```

**Contrat de sortie (validation d'étape)** :
- `html` non vide OU `quality.html === "none"` explicitement ;
- Tier 2 : ≥ 1 `ViewportCapture` complète, sinon rétrogradation Tier 1 tracée ;
- aucune exception ne traverse `captureSite` (hors `BlockedUrlError` amont) ;
- **aucun champ interprété** : pas de "hero", pas de palette, pas de mood.

---

## 6. Détails d'implémentation normatifs

### 6.1 `fetch-css.ts` (Tier 1 et 2)

- Sources : `<link rel="stylesheet" href>` (+ `media`), `<style>` inline,
  puis `@import url(...)` **récursif, profondeur max 2**.
- Chaque URL : résolution relative → `assertSafeTarget(url)` → fetch avec
  timeout 5 s/fichier, UA navigateur, suivi de redirections limité (3).
- Budget (défaut) : **20 fichiers / 3 Mo cumulés** ; dépassement → arrêt +
  `css:"partial"` + note. Échec unitaire → `cssFailed[]`, jamais bloquant.
- Contenu stocké **brut** (pas de parse, pas de minify) — l'interprétation
  appartient à MEASURE.
- Cache mémoire LRU (50 entrées, TTL 10 min) clé = URL — les captures
  multi-pages d'un même site ne re-téléchargent pas le CSS partagé.

### 6.2 `snapshot.ts` — le script injecté (collecte pure)

Fonction **sérialisable** (aucune closure Node) passée à `page.evaluate()`.

- **Nœuds structurants** sélectionnés mécaniquement (aucune sémantique) :
  - blocs : enfants directs de `body`/`main` + `section, header, footer, nav`
    dont `rect.height ≥ 40px` et visibles — cap **80 nœuds** ;
  - dans chaque bloc : premier `h1-h4`, premier paragraphe, première image
    (`img`, `[style*=background-image]`, `picture`, `video`), premiers
    `a[href], button` (cap 3) — cap global **400 nœuds**.
- **`COMPUTED_PROPS`** (sous-ensemble figé, ~40 propriétés) :
  couleurs (`color, backgroundColor, backgroundImage, borderColor`),
  typo (`fontFamily, fontSize, fontWeight, lineHeight, letterSpacing,
  textTransform, textAlign`), boîte (`display, position, paddingTop/Bottom/
  Left/Right, marginTop/Bottom, gap, borderRadius, boxShadow, opacity,
  overflow, zIndex`), grille (`gridTemplateColumns, gridTemplateRows,
  flexDirection, justifyContent, alignItems, maxWidth, width, height`),
  motion (`transitionProperty, transitionDuration, transitionTimingFunction,
  transitionDelay, animationName, animationDuration, transform, filter,
  backdropFilter`).
- **Variables CSS** : itération des propriétés `--*` de
  `getComputedStyle(document.documentElement)` (cap 200) — la lecture des
  design tokens Framer/Webflow sans interprétation.
- **Fonts** : `document.fonts` (status loaded) + parse regex des blocs
  `@font-face` des stylesheets pour les `src:` (woff2 prioritaire).
- **Animations** : `document.getAnimations()` (durée, easing, delay, cible)
  + transitions non-nulles déjà présentes dans `COMPUTED_PROPS`.
- **`path`** : générateur `tag:nth-of-type` remontant jusqu'à `body`
  (stable entre les 3 viewports pour permettre les diffs responsive en
  Chantier 6).
- Budget d'exécution : `page.evaluate` sous timeout 5 s ; dépassement →
  `computedSnapshot:false` + note, la capture continue.

### 6.3 Multi-viewport

**Un seul chargement de page**, puis `setViewportSize()` descendant
(1440 → 768 → 390) avec settle 400 ms + re-scroll léger (haut de page →
1 écran) avant chaque snapshot/screenshot. Justification : 3 chargements
tripleraient la latence et feraient diverger l'état JS entre viewports.
Limite assumée (notée dans quality) : les breakpoints pilotés par JS au
resize peuvent différer d'un vrai chargement mobile — acceptable pour la
géométrie ; VERIFY (Chantier 10) rechargera si besoin.

### 6.4 Screenshots

- `fullPage: true`, **JPEG qualité 70** (PNG pleine page = 5-15 Mo, JPEG ≈ 300-800 Ko).
- Cap hauteur : si `scrollHeight > 20 000px`, capture viewport-par-viewport
  abandonnée au profit d'un fullPage tronqué par Chromium + note.
- Les buffers restent en mémoire dans `RenderedSite` (pas de persistance
  disque dans ce chantier ; le stockage éventuel est une décision VERIFY).

---

## 7. Point d'intégration V5 (unique fichier modifié)

`src/lib/extraction/analyze.ts` :

```ts
export async function analyzeUrlV2(rawUrl: string): Promise<SiteAnalysis> {
  // ... chemin actuel INCHANGÉ ...
}

/** V2 (Chantier 1) : capture complète + analyse V5 sur le HTML capturé.
 *  Consommé par personne par défaut — activé par flag d'appel. */
export async function analyzeUrlV2WithCapture(
  rawUrl: string
): Promise<{ analysis: SiteAnalysis; captured: RenderedSite }> {
  const url = normalizeUrl(rawUrl);
  await assertSafeTarget(url);
  const captured = await captureSite(url);
  const ext = await extractSite(url, captured.html);   // pipeline V5 inchangé
  return { analysis: toSiteAnalysis(ext), captured };
}
```

- La route `/api/generate-site` n'est **pas** modifiée dans ce chantier.
- Activation manuelle pour la démo : script d'audit ou appel direct.
- Le `RenderedSite` n'est **pas** encore consommé par l'extraction (Chantier 4) —
  mais l'extraction V5 bénéficie déjà du meilleur HTML (identique au chemin
  render actuel, donc sans changement de comportement notable).

---

## 8. Tests

### 8.1 Unitaires (hermétiques, s'exécutent dans les 339+)

- `fetch-css.test.ts` (fetch mocké via injection d'un `fetchImpl`) :
  résolution `<link>` relatifs/absolus ; récursion `@import` prof. 2 ;
  budget fichiers/octets → `partial` ; échec unitaire → `cssFailed` ;
  déduplication ; respect `assertSafeTarget` (URL privée → exclue + note).
- `capture.test.ts` : décision de tier (auto sans navigateur → static —
  garanti sous Vitest par le garde `VITEST` de `browser.ts`) ; assemblage
  `CaptureQuality` ; `captureSite` ne throw jamais (fetch qui explose →
  quality dégradée).
- `snapshot.ts` : la fonction étant sérialisable pure, ses helpers
  (générateur de `path`, filtre de visibilité) sont testés en jsdom-like
  via `node-html-parser`? — Non : helpers extraits en fonctions pures
  testables sans DOM réel (string in/out), le reste est couvert par 8.2.

### 8.2 Intégration (gated, non-CI par défaut)

- `capture.audit.test.ts` sous `AUDIT=1` (convention existante de
  `browser.ts`) : serveur HTTP local (`node:http`) servant
  `__fixtures__/mini-site/` — page avec CSS externe + `@import` + variable
  CSS `--brand` + webfont locale + image lazy + section haute.
  Assertions : 3 screenshots non vides ; `cssVariables["--brand"]` présent ;
  font `status:"loaded"` ; `blocks.length ≥ 3` ; rects cohérents entre
  viewports (mêmes `path`).
- Démo manuelle de sortie de chantier : capture d'un site Framer réel +
  vérification visuelle des artefacts.

### 8.3 Non-régression V5

- Les 339 tests existants tournent inchangés (aucun fichier V5 touché sauf
  l'ajout de fonction exportée dans `analyze.ts`).
- `npx tsc --noEmit` propre.

---

## 9. Sécurité

- **SSRF** : `assertSafeTarget` sur l'URL principale (appelant) **et sur
  chaque sous-ressource CSS/fonte** avant fetch. Redirections re-validées.
- **Budgets stricts** partout (fichiers, octets, profondeur, nœuds, timeout)
  — aucune ressource non bornée.
- Aucune exécution de JS de la page hors sandbox Chromium ; le script
  injecté ne lit que le DOM, n'écrit rien.
- Screenshots/HTML restent en mémoire process ; aucune écriture disque.

---

## 10. Performance

| Chemin | Latence attendue | Notes |
|---|---|---|
| Tier 1 (statique + CSS) | 1–4 s | fetch parallèle des CSS (pool 4) |
| Tier 2 complet (3 viewports) | 8–15 s | 1 chargement + 2 resizes ; scroll ≈ 2-4 s ; snapshots ≈ 0,5 s ×3 ; screenshots ≈ 1-2 s ×3 |
| Mémoire pic | ~10–25 Mo/capture | 3 JPEG + HTML + snapshots ; contexte fermé systématiquement |

- Compatible `maxDuration: 60` de la route (mais la route n'est pas branchée
  dans ce chantier). Pour la prod Vercel, le Tier 2 nécessitera Chromium sur
  l'infra — décision de déploiement **hors périmètre**, tracée ici.
- Navigateur partagé (`browser.ts`) : pas de relance par capture ;
  1 contexte/capture, jamais 2 captures dans le même contexte.

---

## 11. Risques techniques et mitigations

| Risque | Mitigation |
|---|---|
| Anti-bot bloque Chromium headless | `looksLikeChallenge` sur le HTML rendu → `quality.challenge:true`, rétrogradation Tier 1 tracée ; UA réaliste déjà en place |
| Bannières cookies polluent screenshots/géométrie | **Pas de dismissal dans ce chantier** (ce serait de l'interprétation) ; noté dans `quality.notes` si sélecteurs de consent connus détectés ; traitement éventuel en Chantier 10 |
| Scroll infini | Cap 12 000 px + note (pattern V5 conservé) |
| Fonts cross-origin non résolues | `src` conservé même non téléchargé ; `status:"declared"` |
| Resize ≠ vrai chargement mobile (breakpoints JS) | Limite documentée + note ; VERIFY rechargera par viewport |
| Proxy TLS de l'environnement | `ignoreHTTPSErrors` déjà géré par `browser.ts` ; fetch CSS via l'agent proxy standard |
| Page qui ne se stabilise jamais (networkidle) | Tous les waits en best-effort avec caps ; budget global `timeoutMs` 30 s |

---

## 12. Rollback

- **Additif pur** : flag non activé ⇒ V5 octet-identique (garanti par tests).
- Un seul commit par sous-lot ; rollback = `git revert` d'un commit, aucun
  autre fichier impliqué.
- Aucune migration de données, aucun changement d'API publique existante.

---

## 13. Découpage en sous-lots (principe #7 : ~60 k tokens max/lot)

| Sous-lot | Contenu | Est. tokens | Commit |
|---|---|---|---|
| **1a** | `types.ts` + `fetch-css.ts` + tests unitaires | ~35 k | `feat(capture): CSS externe + types RenderedSite` |
| **1b** | `snapshot.ts` + `render.ts` (Tier 2) + évolution additive éventuelle de `withPage` | ~45 k | `feat(capture): rendu Chromium multi-viewport` |
| **1c** | `capture.ts` + `index.ts` + `analyzeUrlV2WithCapture` + fixture + test d'intégration + démo Framer | ~40 k | `feat(capture): orchestrateur + intégration flag` |

Critères de sortie de chaque sous-lot : `tsc` propre, suite complète verte,
commit poussé. Critère de sortie du chantier : démo réussie sur un site
Framer réel (CSS récupérés, 3 screenshots, géométrie, variables CSS).
