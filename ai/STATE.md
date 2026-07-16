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
  · **C7e+P0 (2026-07-10)** : audit 9 sites réels (`docs/C8_PREPARATION.md`,
  M1-M12 + addendum P0) puis REBRANCHEMENT : smart par défaut (F19 clos),
  mesures sur le chemin dashboard (F20 clos), zéro fabrication partout (F21
  clos, defaultFaq supprimé, AI-edit refuse d'inventer), fidélité du plan
  (slots réels jamais jetés), **F24 clos** (le chemin smart rendait des pages
  VIDES — alias canoniques title/subtitle/image/primaryCta émis par le
  composer), **F25 clos** (filter:blur neutralisé en rendu statique).
  Avant/après : fabriqués 9/9→0/9, libellés FR, CTA réels, DNA 9/9.
- **Baseline verte** : 497 tests passed | 3 skipped · `npx tsc --noEmit` propre.
- **F17 (ouvert, → C10)** : overflow zpreview restaurant@768 flaky (7↔440px),
  PRÉEXISTANT (reproduit sans C7a) — mesure d'overflow à stabiliser dans le
  harnais C10, pas de fix renderer.

## Prochaine action

**MODE V2 — Continuous Product Evolution (2026-07-14, ai/INTAKE_STATE.md).**
Après chaque intake : produit visiblement meilleur (avant/après exigé), phases
7 Propagation (zéro composant orphelin, sans forcer) + 8 Moteur IA (🔵 file —
câblage réel bloqué par lib/library morte + blocks god-file, P1/P2, U0).
**Propagation #1 livrée : `/login` AuthSplit** (I-017 🟢) — Input verre,
PasswordInput, Button 16px, LabeledDivider+secondary switch, panneau éditorial
copy réelle ; BUG réel corrigé (overflow-x mobile 145→0 @390, halo clippé) ;
pas de checkbox session (U0 : non câblée). Preuve avant/après 1440+390, tsc,
497 tests. **Candidats propagation suivants** : `/reset` (mêmes briques) ·
EditorTopBar sur /result · pastilles BrowserFrame à neutraliser · GlassPillNav
switch login/signup ?

**Éditeur V3 — architecture studio livrée (réf. Lovable, jamais copiée).**
`/editor` = studio plein écran : `EditorTopBar` (identité + statut réel · pilule
« Aperçu » · undo/redo + Share réel `/api/share` + Publish argent), chat colonne
calme (chip verre / texte / chips / input verre), PreviewStage inchangé
(devices/fit/dark). DashboardShell retiré de l'éditeur. Preuve locale : 7
contrôles réels, overflowX=0, monochrome (reste : pastilles trafic BrowserFrame,
préexistantes), tsc + 497 tests. Ledger I-018/019/020. **Candidats suivants** :
même barre sur /result · redesign /login (AuthSplit, queued) · pastilles
BrowserFrame à neutraliser ?

**Component Library fondée (`src/components/design-system/`) — intake #001.**
Directive « bibliothèque officielle = source de vérité » : pipeline d'intake
gouverné (analyser → décomposer → généraliser → re-skinner ReFrame → dédupliquer
→ rejeter les effets interdits → documenter+scorer). Composant reçu (21st.dev
« Ethereal Beams Hero », three.js) **décomposé, PAS intégré** : REJETÉS = beams
3D (dép. lourdes absentes + effet particule/gaming interdit D13), shimmer sweep,
glow blanc, texte gradient-clip, icônes lucide (→ Phosphor). EXTRAITS (neufs,
universels) : `GlassPillNav` (pill de nav en verre) + `StatGroup` (métriques),
exportés via `ui/index.ts`. RÉUTILISÉS sans doublon : Button, Badge. Section
réinterprétée `HeroReframed` (monochrome, motion fade/translateY only). Catalogue
+ gouvernance + scores : `design-system/README.md`. Galerie vivante `/design-system`.
**Preuve** : hue-scan 0/280 coloré, overflowX=0, 0 erreur (1440 & 390), captures
premium ; 497 tests, tsc propre, additif. Note honnête : variante Button `light`
garde une ombre blanche ≈ glow (préexistant) → à nettoyer au lot Button V3-2.
Prochains intakes (1 lot/fois) : Inputs · Cards→24px · Dialogs · Command palette
· Pricing/Testimonials/Features/Footers · Empty/Loading/Skeleton · Motion presets.

**DESIGN OVERHAUL V3 — MONOCHROME livré + palette exacte (D13, supersede D12).**
Grayscale PUR, aucune teinte ne domine. **Palette exacte (Creative Director)** :
fond `#080808` (`--background 0 0% 3.1`), sidebar `#101010`, surface `#151515`
(`--card`), hover `#1B1B1B` (`--secondary`), texte `#FAFAFA`/`#CFCFCF`/`#8E8E8E`,
bordures `rgba(255,255,255,.08→.16)` (`--border 0 0% 11`). **Accent = argent**
`#F3F3F3` (`--accent`), bouton primaire `#F5F5F5`/`#090909` (`--primary`),
parcimonie absolue (focus `--ring 0 0% 62`, sélection) — jamais au fond.
**Boutons** = `rounded-2xl` 16px (fin des pills, `active:scale-[0.98]`),
secondaire `bg-white/5`+border `.08`. **Cartes/verre** `rounded-3xl` 24px,
`blur(24px)`, jamais glow/halo. **Couleurs d'état** (fonction only, jamais déco) :
tokens `--success #22C55E`/`--warning #F59E0B`/`--destructive #EF4444`/`--info
#3B82F6` → `bg-success` etc. (tailwind.config). **Preuve** : canvas = rgb(8,8,8)
exact, Button « Analyze » radius=16px, hue-scan editor/result 0 % coloré, landing
0,7 % (bleu du mockup « before », voulu) ; 497 tests, tsc propre, additif.
**Suivant (1 lot/fois, preuve avant/après)** : V3-2 = migrer les CARTES du chrome
en verre 24px (`.glass`/rounded-3xl) — result/dashboard/wizard (aujourd'hui
rounded-xl 12px) ; puis motion/micro-interactions (fade/translateY/scale 0.98→1
only) · chat AI premium · publish flow (U0) · imagerie pro (zéro placeholder) ·
responsive parfait (absorbe UX4). Note honnête : les CTA bespoke du landing
(search-pill hero, pill navbar) restent en pill par art-direction — à unifier au
GO. Garde-fous : U0, D8, séparation chrome/sites générés, monochrome (D13).
Rappel : **C8a** (BusinessDNA, figé) en attente.

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
