# Journal des sessions (append-only — 3 à 5 lignes par entrée, le plus récent en haut)

## 2026-07-14 — MODE V2 (Continuous Product Evolution) + propagation #1 : /login AuthSplit
- Mode V2 acté dans ai/INTAKE_STATE.md : après chaque intake, le PRODUIT doit être visiblement meilleur (avant/après exigé) ; phases 7 Propagation (zéro composant orphelin) + 8 Moteur IA (🔵 file, câblage bloqué par lib/library morte — U0). Garde-fou : jamais forcer une brique inutile.
- Propagation #1 : `/login` reconstruit en AuthSplit (I-017 🟡→🟢) — formulaire gauche (Input verre, PasswordInput toggle œil, Button argent 16px fin du pill, LabeledDivider + secondary pour le switch login/signup), panneau éditorial droit (copy produit réelle, grid+ambient, zéro fabrication). Comportement intégralement préservé (modes, forgot, needsConfirmation, next, erreurs → tokens destructive).
- BUG RÉEL corrigé : overflow-x mobile 145px (halo ambient w-680 non clippé) → `overflow-x-clip` + `w-[min(680px,100vw)]` ; mesuré 145→0 @390. Décision U0 : pas de checkbox « keep me signed in » (sessions Supabase = cookies, case non câblée = fausse UI). Preuve LOCALE avant/après 1440+390, tsc propre, 497 tests.

## 2026-07-14 — Éditeur V3 : architecture studio (référence Lovable, jamais copiée)
- `/editor` restructuré en studio plein écran : `EditorTopBar` (nouvelle brique workspace) = identité + statut de sauvegarde RÉEL à gauche · pilule `GlassPillNav` « Aperçu » seule au centre (pas d'onglet Code mort, U0) · undo/redo + **Share** (câblé /api/share réel → lien /r/<id> copié) + **Publish** argent à droite. DashboardShell retiré de l'éditeur (canvas = héros), retour via logo.
- Chat V3 : bulle utilisateur = chip verre, assistant = texte calme, chips suggestions, input verre « Ask ReFrame… » + envoi argent. Publish/Live sortis du PreviewStage (restent : devices/fit/dark). Comportements préservés : collapse/resize chat, cluster flottant, undo/redo, streaming.
- Preuve LOCALE (seed sessionStorage — loadSchema lit sessionStorage, pas localStorage) : topbar 7 contrôles réels, iframe preview OK, overflowX=0, 0 erreur, monochrome (3 éléments colorés = pastilles trafic du BrowserFrame, préexistantes). tsc propre, 497 tests. Ledger : I-018/I-019/I-020.

## 2026-07-14 — Intake #003 (Sign-In Page) : champs de formulaire verre V3
- Pipeline checkpointé 6 étapes (ai/INTAKE_STATE.md). Rejetés : violet (A-004), témoignages/avatars fabriqués (A-005), bouton Google OAuth (🟡 queued — non câblé Supabase, U0). lucide→Phosphor.
- MERGE : `Input` upgradé au verre V3 (bg-white/.04, hairline .08→.16 au focus) — pas de fork. NOUVEAUX : `PasswordInput` (toggle Eye/EyeSlash, aria-pressed, compose Input), `Checkbox` (natif zéro dép, coche argent), `LabeledDivider` (role=separator). Exports ui/index + barrel + vitrine /design-system.
- Ledger +10 idées (I-010→I-017, A-004/A-005) dont patterns queued : AuthSplit (redesign /login sur GO), cartes verre sur média (génération, contenu réel only). tsc propre, 497 tests, additif, preuve LOCALE (Vercel non nettoyé).

## 2026-07-13 — Component Library intake #002 (Zoom Parallax → ScrollScaleReveal)
- Composant reçu « Zoom Parallax » (21st.dev, framer-motion + Lenis) DÉCOMPOSÉ, jamais intégré. Rejetés : dép. Lenis (smooth-scroll), cluster 7-images en `vw` codé en dur (non responsive), scale 1→9 (spectaculaire, hors doctrine V3), `<img>` bruts. Corrigé : reduced-motion honoré.
- Extrait 1 primitive : `ScrollScaleReveal` (scale lié au scroll sur scène sticky, retenu 1→1.35, responsive, reduced-motion-safe, transform-only, zéro nouvelle dép) — exportée via `ui/index.ts` + barrel `design-system`. Pas un doublon de `blocks/use-parallax.ts` (gsap/sites générés vs framer-motion/chrome). Vitrine `/design-system` + README intake #002 + scores. Décision : INTÉGRÉ (primitive distillée) ; monolithe REFUSÉ.
- Preuve LOCALE uniquement (pas de déploiement — infra Vercel non nettoyée) : tsc propre, 497 tests verts, additif.

## 2026-07-13 — Component Library fondée + intake #001 (decompose, don't copy)
- Directive « bibliothèque officielle = source de vérité ». Créé `src/components/design-system/` (index barrel + `sections/` + `README.md` = catalogue/gouvernance/pipeline d'intake). Primitives foundation restent dans `ui/` (pas de tree parallèle) ; barrel = surface d'import unique.
- Intake #001 = « Ethereal Beams Hero » (21st.dev, three.js) DÉCOMPOSÉ, jamais intégré. Rejetés (doctrine + D13) : beams 3D (dép. lourdes absentes + effet gaming/particule), shimmer sweep, glow blanc `shadow-white/25`, texte gradient-clip, icônes lucide→Phosphor. Extraits neufs universels : `GlassPillNav` + `StatGroup` (exportés via `ui/index.ts`, tokens gelés, a11y). Réutilisés sans doublon : Button/Badge. Section `HeroReframed` (monochrome, motion fade/translateY only via framer-motion).
- Galerie vivante `/design-system` (page serveur mince + `gallery.tsx` client — split pour éviter Phosphor CSR côté serveur). README documente analyse/kept/removed/improved/where-used + scores (GlassPillNav 5/5/5/5/5).
- Preuve : hue-scan 0/280 coloré, overflowX=0, 0 erreur runtime (1440 & 390), captures premium. 497 tests, tsc propre, additif. Note honnête : Button `light` garde une ombre blanche ≈ glow (préexistant) → cleanup au lot Button V3-2.

## 2026-07-13 — V3 palette exacte : tokens Creative Director + langage bouton + états
- Spec précise reçue → palette exacte posée (`globals.css`) : fond `#080808` (`--background 0 0% 3.1`), sidebar `#101010`, surface `#151515` (`--card`), hover `#1B1B1B` (`--secondary`), texte `#FAFAFA/#CFCFCF/#8E8E8E`, bordures `.08` (`--border 0 0% 11`). Accent = argent `#F3F3F3` (`--accent`), bouton primaire `#F5F5F5`/`#090909` (`--primary`), `--ring 0 0% 62`.
- Langage bouton V3 (`button.tsx`) : `rounded-full`→`rounded-2xl` (16px, fin des pills), `active:scale-[0.98]`, default→`bg-primary` (silver), secondary→`bg-white/5`+border `.08`, outline hairline `.08→.16`. Échelle radius rouverte à 3 crans (12 contrôles / 16 boutons / 24 cartes).
- Couleurs d'état sanctionnées (fonction only, jamais déco) : tokens `--success #22C55E`/`--warning #F59E0B`/`--destructive #EF4444`/`--info #3B82F6` + `bg-success`/`text-destructive`… (tailwind.config). Docs : DESIGN_SYSTEM §2.1/§2.4/§3 réécrits (table palette+états), D13 précisé.
- Preuve : canvas = rgb(8,8,8) exact, `<Button>` « Analyze » radius=16px, hue-scan editor/result 0 % coloré, landing 0,7 % (bleu du mockup « before », voulu). 497 tests, tsc propre, additif. Honnêteté : cartes chrome encore rounded-xl 12px (→ V3-2), CTA bespoke landing en pill par art-direction (à unifier au GO).

## 2026-07-13 — DESIGN OVERHAUL V3 : identité MONOCHROME (D13, supersede D12)
- Revirement de direction (Creative Director) : l'indigo de PX1/D12 est abandonné → grayscale PUR, aucune teinte ne domine (ni vert, ni bleu, ni violet). Tokens `globals.css` : canvas #0E neutre (`--background 0 0% 5.5%`), accent = le clair (`--accent 0 0% 96%`, `--primary 0 0% 100%`, `--ring 0 0% 64%`).
- Glass V3 : `blur(24px)`, border blanc `.08`, `border-radius: 24px`, ombre très légère, jamais de glow/halo/ombre colorée ; `.glass-dark/.panel/.ambient` neutralisés. Statut succès/publié neutralisé (fin du vert : bannière published + « Sent » → surface blanche/foreground), scores lus par la CLARTÉ (lightness) et non la teinte. Résidus lime landing (compare gradient/blur) purgés ; commentaires stale (hero/examples/transform/button) corrigés.
- Preuve : hue-scan (Playwright, 1440) editor/result = 0 % coloré, landing 0,7 % — uniquement le bleu daté des mockups « before » (voulu, storytelling). Captures grayscale livrées. 497 tests verts, tsc propre, additif (tokens + résidus, sites générés inchangés). Warning/erreur (ambre/rouge) conservés en signaux fonctionnels restreints.
- Docs : DESIGN_SYSTEM §2.4 réécrit monochrome, D13 acté (supersede D12), PREMIUM_EDITION_PLAN annoté. Suivant : V3-2 composants en verre 24px (1 lot/fois, preuve avant/après). C8a en attente.

## 2026-07-10 — Premium Edition PX1 : nouvelle identité (indigo)
- Directive massive « SaaS IA le plus premium » → sprint méthodique `docs/PREMIUM_EDITION_PLAN.md` (PX1-PX7, additif, U0/D8/D11). PX1 = identité.
- Tokens `globals.css` : accent lime→INDIGO premium (`234 78% 54%`, AA 7.0 vérifié), canvas near-black cool (`232 16% 5%`, fin du noir pur), brand violet discret (`256 72% 66%`), off-white. `.glass/.glass-dark/.panel` déjà présents, héritent. Commentaires + DESIGN_SYSTEM §2.4 mis à jour. D12 acté.
- Preuve : landing (mot « trust. », CTA, badge, features), editor (avatar/pill/send/Publish), result → tout indigo ; le « vert IA » a disparu. Sites générés inchangés (brand-agnostiques). 497 tests verts, tsc propre, zéro régression (tokens only).
- Suivant : PX2 composants premium (1 lot/fois, preuve avant/après). C8a en attente.

## 2026-07-10 — UX5 : Design System premium unifié + gelé (D11)
- Audit : chrome fragmenté (9 rayons, 3 easings/3 durées, shadow-2xl ×6). Tokens posés dans `globals.css`+`tailwind.config.ts` : rayon 20→12 (échelle sm8/md10/lg12/pill), `ease-premium`+`duration-fast`120/`duration-base`180, `shadow-raise/float/hairline` (fin des ombres lourdes), quasi-monochrome (accent=guide).
- Appliqués au chrome : Button, PreviewStage (motion+shadow-float), shell rail, éditeur cluster, cartes result (rounded-xl+shadow-float). Additif, 497 tests verts, tsc propre, aucune régression UX1-UX4.
- `docs/DESIGN_SYSTEM.md` GELÉ (v1) + gouvernance (CONVENTIONS) + D11 au registre : toute UI de chrome consomme ces tokens, aucune valeur ad hoc. Nature d'un pass DS : refinement + cohérence à l'échelle (la partie motion se ressent en interaction) — honnêteté assumée.
- Suivant : UX4 (mobile) / PublishFlow / C8a selon priorité utilisateur.

## 2026-07-10 — UX3 : Design Studio (sidebar rail + chat repliable, preview dominant)
- `lib/use-persistent-state.ts` (partagé, SSR-safe) ; sidebar shell en rail rétractable (68↔240, persisté, animé, icônes seules) ; chat éditeur repliable/redimensionnable (drag 300-560px, masqué = PAS rendu → 0 espace) + cluster flottant AI+undo/redo.
- PreviewStage desktop fluide-up : rend à un vrai viewport ≥1440 et remplit toute largeur supérieure (ultrawide immense), jamais upscalé.
- Preuves harnais (/editor, défaut A → studio B, 4 largeurs) : +552px preview À CHAQUE largeur ; chromeLeft 632→80 ; ultrawide 1916→2468px ; chat retiré du DOM (0 espace) ; overflowX=0 A&B. 497 tests, tsc propre, additif (aucune régression, défaut inchangé). Captures avant/après livrées.
- Suivant : UX4 (mobile/tablette bottom sheets + chrome result mobile). C8a en attente.

## 2026-07-10 — UX2 : PreviewStage (modes device réels)
- `components/workspace/preview-stage.tsx` : rend le site dans un IFRAME (viewport propre → media queries du site se déclenchent) — modes Desktop/Tablet/Mobile RÉELS, largeur canonique + scale-to-fit (jamais d'upscale, overflow horizontal impossible par construction), Fit-to-Screen + orientation + %. Live via react portal (éditions instantanées). Robustesse : body capturé via effet+rAF (onLoad iframe srcless non fiable → sinon blanc, corrigé), clone des styles parent.
- Branchée result (after) + editor : supprime les 4 clamps 70vh + carte naturelle ; dark+publish en actions. Fix flex min-w-0 (shell `<main>` + colonne preview).
- Preuves harnais : Y4 iframe.innerWidth 390/834 (vrai reflow mobile, capture) ; Y1 overflowX=0 editor 5/5, result 4/5 (résiduel 320 = chrome page result → UX4). 497 tests, tsc propre.
- Suivant : UX3 (shell+chat repliables → Y3 chrome 665px, Y2 previewTopVh). C8a en attente.

## 2026-07-10 — UX1 : audit responsive exécutable + baseline (zéro code UI)
- GO UX1 + U0 verrouillé (progrès honnête, no-fabrication produit) → acté au registre.
- Recensement : 4 tailles PORTEUSES (shell `w-60`, chat éditeur `w-[400px]`, 4× clamp `70vh` du result) ; le reste sain/scope-wizard. `docs/UX1_BASELINE.md`.
- Baseline mesurée (harnais Playwright, `sr:schema` injecté, 5 largeurs × 2 pages) : overflowX réel 192/52/298 ; preview SOUS le fold sur result (previewTopVh 96-190) ; **665px de chrome sur editor≥1024 → hero cassé** (capture) ; aucun scale/mode device (site 2270px @2560). Métrique « dominance% » écartée (non fiable, U0).
- Mètre-étalon Y1-Y5 posé. Suivant : UX2 `PreviewStage`. C8a reste en attente.

## 2026-07-10 — Chantier UX : audit responsive + publish + spec (zéro code)
- Nouveau chantier (parallèle moteur) : refonte responsive workspace + expérience de publication. Références Lovable = repère de niveau, jamais copiées ; grammaire DESIGN.md.
- Audit (fichier:ligne) : shell `w-60` + chat éditeur `w-[400px]` figés + preview clampé (`max-h-[70vh]`/carte naturelle) = cause du « desktop réduit » ; DEUX chemins de publication (editor inline vs result→LaunchWizard, 10 checks, mobile=`<select>`) ; backend publish sans slug choisi/visibilité/SEO override/domaine/SSL (séquence Upload/Optimize/Deploy = setTimeout théâtral).
- Spec `docs/UX_WORKSPACE_PUBLISH_SPEC.md` : principes U0-U6 (U0=progrès honnête, no-fabrication produit), archi Desktop/Laptop/Tablet/Mobile + brique `PreviewStage`, workflow 4 étapes unifié (`PublishFlow`) + wireframes, découpage UX1-7 (UI d'abord, backend flaggé au §7).
- Suivant : validation utilisateur (principes+archi+flux+périmètre backend), puis UX1. C8a reste en attente de GO.

## 2026-07-10 — REASONING.md : le modèle mental fondateur (zéro code)
- `docs/REASONING.md` : comment ReFrame PENSE (pas le pipeline) — 4 actes / 12 étapes R1-R12 (observer → comprendre identité/langage/offre/modèle/capacités/buts → juger indispensable/améliorable → composer/vérifier préservation/vérifier crédibilité).
- Distinction fondatrice actée : produire de la COMPRÉHENSION (affirmation falsifiable + sourcée + lourde de conséquences), jamais de la donnée. Lois L1-L6. D10 : le raisonnement est le référentiel d'appartenance des modules (« à quelle étape R », jamais « à quel fichier ») ; pointeur ajouté dans CLAUDE.md (doctrine toujours chargée) + table de gouvernance.
- Référentiel étapes↔moteurs (R1-R12 mappés sur C1-C7 existants + C8a-e à venir) + exemple canonique Bruneau raconté de R1 à R12.
- Suivant : toute la conception C8 est figée (spec v2 + plan + reasoning + D6-D10) → GO C8a (fondations 8 couches + JSON-LD + IdentityDNA), preuve harnais par lot (D8).

## 2026-07-10 — D9 + audit & plan C8 (zéro code)
- D9 actée : raisonner en expert métier (jamais pages/sections/composants) ; gate de composition (réponses métier ou inconnus déclarés+tracés) ; préservation étendue aux modèles économiques ; design au service du business.
- Audit : la chaîne produits existe à ~70 % et meurt au composer — PROUVÉ 8 produits réels extraits sur bruneau (extractProducts JSON-LD+DOM → pass-content:470 → bridge:73-75) ; inventaire réutilisable (platform, intégrations→reconnected, crawlPages, collection/CollectionGrid, parseJsonLd) ; B1-B9 additifs.
- Plan C8a-e (`docs/C8_IMPLEMENTATION_PLAN.md`) : a fondations+identité réelle · b catalogue vivant (F18, b AVANT c car producteurs prêts) · c capacités+modèle+classification (F22) · d Intent Engine+parcours · e Readiness+explication structurée. Gain D8 mesurable par lot sur le harnais.
- Suivant : validation du plan par l'utilisateur, puis GO C8a.

## 2026-07-10 — Spec BusinessDNA v2 (systèmes, Capability, chaîne des buts, R0)
- Philosophie v1 validée par l'utilisateur (ontologies=données, moteurs aveugles, zéro if-industry) ; enrichissements demandés intégrés.
- R0 actée dans la spec : composer des EXPÉRIENCES, jamais des sections ; unité de reconstruction = le SYSTÈME métier complet, la page = projection.
- CapabilityDNA (8e couche, cœur fonctionnel) : capacités réelles avec 4 niveaux de préservation (native/reconnected/delegated/lost→warning) — jamais de CTA simulant une capacité morte ; chaîne des buts Business Goal→User Goal→Objects→Capabilities→Journey→Composition→Interface.
- Suivant : GO C8a (fondations 8 couches + ontologie générique + lecteur JSON-LD), preuve harnais par sous-lot (D8).

## 2026-07-10 — Conception BusinessDNA & Intent Engine (C8-spec, zéro code)
- `docs/C8_BUSINESSDNA_SPEC.md` : partir de « ce qu'un humain comprend en 10 s » → 7 couches (Identity/Offer/BusinessModel/Trust/Navigation/Content/Intent) ; les *DNA sectorielles deviennent des ONTOLOGIES déclaratives (P2), pas des couches ; entité générique Sourced ; 12 ontologies esquissées.
- Classification refondée : inférence descendante depuis entités+modèle (458 cartes-prix ⇒ e-commerce) — l'industrie mots-clés devient candidat faible du resolver (fix F22 by design).
- Intent Engine : intents pondérés de page (transact/reserve/appointment/quote/browse/portfolio…) et de section (convert/reassure/demonstrate/present-offer/orient/inform/brand) → plan, blocs par capacité, CTA canoniques i18n, journeys→Readiness. Injection : businessLayer/intentLayer + SceneSpecSources (D7, prêt).
- Suivant : validation utilisateur de la spec, puis C8a (fondations + JSON-LD) → C8b e-commerce (F18), preuves harnais par sous-lot (D8).

## 2026-07-10 — P0 : le moteur moderne devient LE produit
- F19/F20/F21 clos : smart par défaut, mesures sur le chemin dashboard, zéro fabrication (bridge/composer/legacy/AI-edit, defaultFaq supprimé) ; varySectionOrder ne jette plus les slots réels.
- **F24 découvert et clos** : le chemin smart rendait des pages VIDES (composer émettait sectionTitle/headline lus par aucun skin — jamais vu car produit=legacy et zpreview=legacy) → alias canoniques. F25 clos : blur-fade non neutralisé en rendu statique (CSS filter:none).
- Avant/après (même harnais, 9 sites) : fabriqués 9/9→0/9, FAQ fab. 3→0, libellés FR, CTA réels (« Acheter »), DNA+Composition 9/9, scene premium en prod. Classification 4/9 et parcours métier inchangés (périmètre C8, addendum du rapport).
- Suivant : décision GO C8 par l'utilisateur sur la base de l'addendum.

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
