# ReFrame V2 — Registre d'architecture (document vivant)

> Règle : tout finding découvert pendant un chantier est **enregistré ici**,
> jamais corrigé hors périmètre. Chaque entrée porte son chantier de
> résolution et la justification du report. Maintenu jusqu'à la fin du projet.
>
> Statuts : `Open` · `In Progress` · `Closed`

## Findings de la revue du Chantier 1 (revue Principal Engineer, 2026-07-03)

| ID | Description | Chantier prévu | Statut | Justification du report |
|----|-------------|----------------|--------|--------------------------|
| **F1** | Granularité des blocs insuffisante sur DOM Framer : la découverte (`snapshot.ts`) ne descend pas les wrappers `<div data-framer-name>` — la géométrie peut se réduire à 1-2 blocs géants sur la plateforme cible n°1. | **C6** (SceneDNA) | **Closed** (2026-07-04, 6a) | Descente géométrique des wrappers (couverture ≥85% page + ≥2 enfants → les enfants concourent ; chaînes mono-enfant ≥90% traversées) + indice mécanique `[data-framer-name]` ; prouvé par la fixture Framer-like (section sous double wrapper + div nu retrouvés, wrappers exclus). |
| **F2** | Sérialisabilité de `collectSnapshot` sous bundler de production non vérifiée (testée sous vitest uniquement). Casse silencieuse possible (`computedSnapshot:false` en prod). | **C10** (premier run prod) | Open | Non observable avant un build/run de prod ; si fragile → migration du script vers une chaîne littérale figée. |
| **F3** | `cssPath` tronqué à 12 ancêtres : collisions possibles sur DOM profonds, path non interrogeable depuis la racine. C6 (diffs responsive) et C10 (patch ciblé) en dépendent. | **C6** | **Closed** (2026-07-04, 6a) | Cap relevé à 16 ancêtres, préfixe « … > » explicite si tronqué (jamais confondu avec un sélecteur requêtable), registre d'unicité par snapshot (suffixe ~n) + cache par élément (même élément = même identité, jointure blocks↔nodes préservée) ; dédoublonnage des nodes imbriqués. |
| **F4** | Buffers de screenshots dans `RenderedSite` : explosion en cas de `JSON.stringify` (route, cache, journal) ; pic Chromium ~66 Mo/screenshot fullPage. | **C4/C10** | **Closed** (décision, C4) | Décision actée : les screenshots restent **memory-only** — aucun chemin de sérialisation ne doit transporter les Buffers ; MEASURE (C4) les ignore, VERIFY (C10) les lira in-process. Toute future API/persistance devra passer par un résumé sans pixels ; réouvrir si C10 exige une persistance. |
| **F5** | Aucun plafond de concurrence des captures : N requêtes = N contextes × 3 screenshots → risque OOM en self-host. | **C10** | Open | Durcissement prod ; sémaphore 2-3 captures. |
| **F6** | LRU CSS sans plafond total d'octets (worst case ~150 Mo). | **C4** | **Closed** (2026-07-03) | Plafond 8 Mo cumulés + éviction oldest-first + refus des fichiers plus gros que le plafond ; testé (éviction vérifiée par re-fetch). |
| **F7** | Support proxy Chromium ajouté pendant C1 sans amendement de spec : (a) entorse de processus actée ; (b) `bypass` ignorait `NO_PROXY` de l'environnement. | **C2 (début)** | **Closed** (2026-07-03) | Correctif appliqué en 2a : la liste de bypass reprend `NO_PROXY`/`no_proxy`. Le « fallback direct si proxy échoue » envisagé en revue est **rejeté** : ce serait un fallback silencieux (violation charte) — une navigation qui échoue doit le dire, pas changer de chemin réseau. |
| **F8** | Lazy-load non re-déclenché après resize (scroll complet à 1440 uniquement) : hauteurs sous-le-fold potentiellement fausses à 390/768. | **C6** | **Closed** (2026-07-04, 6c) | Re-scroll complet à chaque viewport après resize (le lazy-load spécifique à la largeur monte avant mesure) ; coût ~1-2 s/viewport dans le budget Tier 2 ; audit Chromium vert. |
| **F9** | `CAPTURE_VIEWPORTS` n'inclut pas 320 alors que le plancher qualité audite 320/390/768/1440. | **C10** | Open | Élargissement de l'union au moment où VERIFY en a besoin (trivial, additif). |
| **F10** | `adoptedStyleSheets` / CSSOM construits invisibles pour `discoverFromHtml`. Framer/Webflow non concernés ; angle mort sur sites custom modernes. | **C4** | **Closed** (2026-07-03, 4b) | Dump du CSSOM vivant (`document.styleSheets` + `adoptedStyleSheets`) dans le snapshot, caps 40/256 Ko/1 Mo, feuilles cross-origin comptées ; `RenderedSite.runtimeCss` additif (`via:"runtime"`). |
| **F11** | Dette légère : `BROWSER_UA` dupliqué (engine.ts / fetch-css.ts) ; `staticFetchWith` sans en-têtes UA (seam de test) ; `IMPORT_RE` peut matcher un `@import` commenté (faux « partial »). | **C4** | **Closed** (2026-07-03) | `BROWSER_UA` exporté d'engine.ts (source unique) ; seam aligné sur les en-têtes de `fetchStatic` ; commentaires CSS strippés avant le scan `@import` (contenu stocké verbatim) ; testé. |
| **F12** | `quality.css:"none"` confond « site sans CSS » et « échec de collecte » ; fallback famille de `mergeFonts` peut rattacher le `src` d'une autre graisse. | **C4** | **Closed** (2026-07-03) | Note explicite « page declares no stylesheets » quand le HTML n'en déclare aucun ; `mergeFonts` exige famille + style + graisse couvrante (plage variable acceptée) ; testé. |

## Findings de la revue du Chantier 3 (revue Principal Engineer, 2026-07-03)

| ID | Description | Chantier prévu | Statut | Justification du report |
|----|-------------|----------------|--------|--------------------------|
| **F13** | Heuristique de langue : les langues voisines non listées peuvent être mal classées (pt→es, nl→de) → libellés générés dans la mauvaise langue quand `<html lang>` est absent. | **C6** | Open | Ajout pt/nl + marge contre « inconnu » à calibrer avec la mesure par scène. |
| **F14** | Le planner insère toujours un slot FAQ + une recommendation « Added an FAQ » alors que le composer omet désormais la section sans données réelles → la recommendation décrit une section inexistante (trace mensongère). | **C6** | **Closed** (2026-07-04, 6d) | `planSmart(opts.hasFaq)` : sans FAQ réelle, ni slot (flow, canonique et preserve) ni recommendation « Added an FAQ » ; `directFaqLayout(hasFaq)` sans `\|\| true` ; appelants legacy sans opts inchangés (compat V5 testée). |
| **F15** | La langue et les headings réels ne passent pas par `Sourced<T>` : la provenance du contenu (réel vs libellé généré) n'apparaît pas dans la PipelineTrace. | **C6/C7** | **Closed** (2026-07-04, 6d) | `dna/content-trace.ts` : langue, headings par catégorie et copy CTA tracés dans la PipelineTrace via resolveField (choisi/rejeté/raison), miroir exact de l'arbitrage du composer (realHeading \|\| label). |
| **F16** | `extractPrimaryCtaLabel` : montée d'ancêtres jusqu'à un conteneur large possible (scan de page entière sur DOM plat) ; un lien inline peut gagner sur le vrai bouton. | **C6** | **Closed** (2026-07-04, 6d) | `measure/scenes.ts#heroCtaLabel` : CTA du hero mesuré par styles calculés + géométrie, prime la règle DOM (qui reste le fallback Tier 1) via `analyzeUrlV2WithCapture`. |
| **F17** | Overflow horizontal flaky sur `/zpreview?industry=restaurant&img=1` @768px : `document.scrollWidth-clientWidth` oscille entre 7 et 440px selon le timing (préexistant — reproduit à l'identique sur la baseline SANS C7a, DOM des wrappers prouvé identique). Piste : marquee/carousel mesuré pré-hydratation + images externes bloquées (E1). | **C10** (Quality Gate) | Open (2026-07-10) | La mesure d'overflow doit attendre la stabilisation (animations/hydratation) ; à corriger avec le harnais C10, pas dans le renderer. |

## Déviations de spec actées

| ID | Description | Décision |
|----|-------------|----------|
| D1 | `capturedAt` : la spec C1 le disait « injecté par l'appelant » ; implémenté avec défaut interne `new Date().toISOString()` + override (`CaptureInternals.capturedAt`). | Acceptée (2026-07-03) — sans conséquence, documentée dans le code. |
| D2 | `server/browser.ts` : support `HTTPS_PROXY` non prévu par la spec C1, ajouté pendant le debug de la démo réelle. | Acceptée a posteriori — voir F7 ; tout ajout hors spec doit désormais passer par ce registre AVANT le code. |
| D5 | **Reference Learning Engine branché** (avance du Chantier 8) : `findClosestReferences(visualDna, ENRICHED_REFERENCE_DB)` → `inspirationLayer` = couche `curated` dérivée des **décisions mesurables** de la référence premium la plus proche (Archform), gated `strongestMatch >= 0.6`. Aucune copie de markup (règle charte respectée). I1 : les mesures du site source gagnent ; l'inspiration comble les trous ; au-dessus du moodboard catégoriel (curated 0.5), sous les mesures. Diversité préservée (couche muette hors match). Actuellement seule Archform a un `richDna` → enrichir la bibliothèque (autres profils premium mesurés) étend la couverture sans autre changement de pipeline. | Actée (2026-07-04). |
| D4 | **Raccordement production C4→C6** (sous-lot dédié) : `route.ts` appelle `enrichWithMeasurements` après `analyzeUrlV2`. Quand un navigateur rend la source, une capture Tier 2 est faite **en plus** de l'extraction (double rendu) → +5-10 s/site et Chromium requis en prod. Gardé par disponibilité navigateur + kill-switch `REFRAME_MEASURE=0` ; dégradation octet-identique sinon. | Actée (2026-07-04). Optimisation future (replier la capture dans `analyzeUrlV2` pour un seul rendu) = candidat C11 ; coût prod à valider au déploiement (cf. F5/E1). |
| D3 | Chantier 3 : trois changements **délibérés** du comportement par défaut, mandatés par les objectifs du chantier et la règle d'or no-fabrication : (a) la FAQ n'est plus jamais fabriquée (`defaultFaq` supprimé — section omise sans données réelles, comme testimonials/stats) ; (b) le contenu réel prime (headings de sections, copy CTA, headline du CTA de clôture) ; (c) les libellés générés suivent la langue détectée (en/fr/es/de/it, anglais octet-identique à V5 en fallback). La contrainte « aucun changement du comportement V5 par défaut » est interprétée comme : API/architecture V5 intactes, moteur legacy intact, consommateurs non cassés. | Actée (2026-07-03), tests mis à jour en conséquence. |

## Limitations d'environnement connues

| ID | Description | Impact |
|----|-------------|--------|
| E1 | La sandbox de développement tue les handshakes TLS des navigateurs vers l'extérieur (CONNECT 200 puis reset, y compris via le Playwright MCP du harness). | Le Tier 2 sur sites réels n'est vérifiable qu'en prod (C10) ; validé localement via la fixture Chromium. Les dégradations sont tracées dans `quality.notes`. |

## Chantier 2 — décisions d'architecture

| ID | Description | Décision |
|----|-------------|----------|
| A1 | Monotonie stricte de `refine()` : aucun slot occupé n'est jamais réécrit, par aucune source. La précision tardive s'exprime par un champ plus spécifique (`heightRange` → `heightPx`), jamais par réécriture (principe #9 validé). | Actée — démonstration formelle G1-G4 livrée avant implémentation (session 2026-07-03). |
| A2 | Règle charte « un curated ne bat un measured que si confidence(measured) < 0.4 » : encodée dans la fonction de rang du resolver (rétrogradation du measured faible), le measured rétrogradé restant archivé dans `rejected`. | Actée. |
| A3 | Conservation totale : tout candidat offert est soit `chosen`, soit dans `rejected[]` ; invariant testé `|offerts| = 1 + |rejected|`. Les entrées du resolver sont gelées profondément. | Actée. |
