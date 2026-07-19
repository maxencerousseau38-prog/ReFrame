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

**NAV IMMERSIVE + HERO FIDÉLITÉ ARCHFORM (2026-07-19) — les sites ressemblent à la référence.**
Cible utilisateur : capture de la référence Archform (hero cinématique sombre,
display SERIF monumental, nav transparente centrée majuscules + pill « • CONTACT »,
cue « SCROLL TO EXPLORE »). Diagnostic Directeur Artistique : l'écart n°1 était
la NAV — ReFrame avait une barre solide AU-DESSUS du hero, la référence a une nav
TRANSPARENTE qui SURVOLE le hero plein-cadre puis se solidifie au scroll (pattern
premium immersif). 21st MCP consulté (heroes archi/editorial) : archétypes déjà
couverts → le gap est la nav + la finition, pas un composant. Livré : (1) **SiteNav
mode `overlay`** — transparent blanc sur hero sombre (liens majuscules trackés,
pill blanche outline à point), `fixed`, se solidifie en barre givrée au scroll
(listener) ; non-overlay inchangé (barre solide). (2) **SiteRenderer** détecte un
hero sombre plein-cadre (`OVERLAY_HEROES` = HeroArchform/HeroImageFull/
HeroMonumental) → passe `overlay` + injecte `_overlayNav` au 1er bloc. (3) Heroes :
HeroImageFull + HeroArchform masquent leur rangée-marque interne sous la nav
(plus de doublon) ; **HeroArchform** reçoit la finition référence — titre en
**reveal masqué ligne** (rise-from-mask) + cue « — SCROLL TO EXPLORE » à trait.
Preuve : architect(serif) HeroArchform top = nav transparente + « SPACES THAT
SHAPE HOW YOU LIVE » serif monumental + scroll cue (≈ référence) ; scrolled = nav
givrée solide ; mobile OK ; restaurant HeroImageFull overlay (rangée cachée) ;
saas hero clair = barre solide inchangée (régression) ; overflow-x=0 partout.
tsc, 530 tests, build exit 0. LOCAL (feature). **Suivants** : étendre reveal
masqué + scroll cue à HeroMonumental/ImageFull ; hamburger mobile ; imagerie
architect dans zpreview. **Promotion `main`** : SUR DEMANDE (feature +3 lots).

**MONOPOLE DU HERO éliminé pour architect/realestate (2026-07-19) — routing, pas nouveau composant.**
Suite du fil « variété du hero dans une famille ». Probe aux VRAIS moods des
secteurs (le probe précédent utilisait « warm » à tort) : architect(elegant)/
realestate(elegant) = 1/8 ; health(elegant) = **déjà 2/8** (jamais monopolisé,
artefact du mauvais mood) ; agency(bold) = 1/8. Décision Directeur Artistique
validée par **21st MCP** (search architecture/property hero → tous les archétypes
premium — full-bleed/split/collage/image-above — sont DÉJÀ couverts par nos 5
heroes éditoriaux) : le défaut est du ROUTING, pas un composant manquant ; ajouter
un 6e hero = redondance refusée. Fix = déverrouiller les heroes premium existants
via co-prefer (2 lignes catalog) : `HeroMonumental` prefer += realestate,
`HeroArchform` prefer += architect → pour architect ET realestate les deux
signatures architecturales s'égalisent (11=11 / 13=13) → jitter départage →
**2/8 distinct**. Preuve : probe 2/8, 2 marques realestate RÉELLES = 2 heros
(Atelier Nord→Monumental wordmark-bas, Studio Vela→Archform display-géant),
overflow-x=0. agency reste **1/8 par CHOIX** : HeroAgencia (wordmark condensé
near-black) EST la signature agence — forcer un co-égal sacrifierait le fit (D-doctrine).
Bonus QA : `INDUSTRIES` whitelist de zpreview += architect, hotel (avant : fallback
silencieux → agency). Régression `editorial-hero-variety.test.ts` (5). tsc, 530
tests, build exit 0. LOCAL (feature). **État heros par secteur** : restaurant/
hotel/architect/realestate/health/saas = ≥2 ; agency = 1 (voulu). **Défauts
suivants** : Nav (jamais audité) ; `ensureSlot("stats")` en retail. **Promotion
`main`** : feature en avance de 2 lots (HeroCollage + ce lot) — SUR DEMANDE.

**HERO COLLAGE livré (2026-07-18) — variété du hero AU SEIN d'une famille.**
Revue Directeur Artistique : deux marques d'un même secteur prenaient le MÊME
hero (>50% de la qualité perçue → « template » immédiat). Défaut reproduit
(probe) : restaurant/hotel/architect/realestate/health = **1/6 distinct** (un
seul hero pour toutes les marques). Racine PROUVÉE par le scoring : un `prefer`
unique = +5, la jitter par marque plafonne à 1.6 → le prefer gagne TOUJOURS
(monopole). Fusion 3 sources réellement minées : **21st MCP** (search hospitality
hero → 10 comparés ; retenu #19074 « Editorial Collage Hero » = collage 2 images
superposées + titre serif ; get_component bloqué par la limite 2/j → reinterprété
depuis desc/preview) + **Archform** `Hero.tsx` (reveal masqué ligne-par-ligne +
ken-burns scale-in) + **grammaire ReFrame**. → `HeroCollage` : hero SPLIT éditorial
(eyebrow mono-caps + titre serif reveal-masqué à gauche ; collage 2 photos
superposées à droite, matte + profondeur, ken-burns). Distinct des heroes
full-bleed ET de HeroEditorial (portrait unique). **Fix du monopole** : co-prefer
restaurant/hotel avec HeroImageFull (scores égaux 14=14 → jitter départage) →
restaurant/hotel passent à **2/6 distinct** (~50/50). Pas de photo dupliquée :
`image2` seulement sur HeroCollage + `qualityPass.serveBlock` lui donne un slot
pool UNIQUE (dégrade en tuile simple si pool épuisé). Câblé : blocks (composant+
REGISTRY), catalog (HeroCollage co-prefer), engine (variant calculé une fois +
image2 conditionnel), qualityPass (image2), zpreview (param `?brand=` pour auditer
la variété par marque). Preuve : probe 2/6, moteur SÉLECTIONNE (test+DOM), 2 restos
RÉELS = 2 heros différents (Osteria Nord→Collage, Le Marais→ImageFull, captures
1440+390), overflow-x=0, régression `hero-collage.test.ts` (6), tsc, 525 tests,
build exit 0. LOCAL (feature). **Défauts suivants** : architect/realestate/health
encore 1/6 (chacun mérite son 2e hero — prochaines passes) ; Nav ;
`ensureSlot("stats")` en retail. **Promotion `main`** : SUR DEMANDE.

**FOOTER SIGNATURE livré (2026-07-18) — la dernière impression, enfin premium.**
Revue Directeur Artistique : le footer était le moment le plus « template » de
CHAQUE site (Footer1 mince par défaut ; FooterColumns = sitemap SaaS générique ;
+ fabrication « Crafted with care. » codée en dur, jamais la vraie tagline).
Fusion 3 sources RÉELLEMENT minées : **21st MCP** (comparé 10 footers ; retenu
#19358 « Footer Section 5 » — wordmark OUTLINÉ monumental + panneau qui chevauche
sa baseline ; REJETÉ son shader fluted-glass/dep lourde + bleu codé + 6 colonnes
fabriquées) + **Archform** `Contact.tsx > Footer` (fond sombre inversé + eyebrows
mono-caps par colonne + baseline hairline) + **grammaire ReFrame** (vraie tagline
only, accent rare, `--brand-contrast`/`--brand-contrast-ink` → AA par construction).
→ `FooterSignature` : sign-off éditorial sombre (brand-contrast), tagline réelle,
colonnes Pages/Services/Contact réelles à eyebrows mono-caps, et le **nom de la
marque en OUTLINE monumental** en pied (le site « signe »), rogné par le footer
(jamais la page). Correct en clair ET sombre ; s'adapte à la typo de marque (sans
pour architect, serif pour restaurant — prouvé). **Fabrication tuée globalement** :
`tagline` réelle (`deAiDash(headline)`) passée à TOUS les footers ; « Crafted with
care. » supprimé de Footer1 + FooterColumns (omis si pas de tagline, F21). Câblage :
`blocks/index.tsx` (composant + REGISTRY + fix fabrication), `catalog.ts` (entrée
prefer architect/realestate/restaurant/hotel ; sectors editorial+hospitality+
fashion/lawyer/finance ; autres gardent Footer1/Columns/Minimal), `engine.ts`
(props.tagline). Preuve : moteur SÉLECTIONNE (test+DOM `data-variant`), avant/après
architect (light générique → dark signé) + restaurant (serif chaud), 320/390/768/
1440 overflow-x=0 (wordmark rogné), régression `footer-signature.test.ts` (4 tests),
tsc, **520 tests**, build exit 0. LOCAL (feature). **Défauts suivants** : hero
variety AU SEIN d'une famille (2 restos = même hero) ; Nav ; `ensureSlot("stats")`
en retail. **Promotion `main`** : SUR DEMANDE (main==dev depuis le dernier lot).

**🚀 PROMOTION `main` FAITE (2026-07-18) — le blocage prod historique est LEVÉ.**
Sur GO explicite de l'utilisateur, `main` a été avancée en **fast-forward** vers
la pointe de `claude/siterevive-ai-saas-a9sxzw` (`9d493d5`) : +214 commits, 0
divergence (main était ancêtre strict → aucun conflit, rien perdu). Remote
`main` == remote feature == `9d493d5` (vérifié). Gate avant push : tsc propre,
**516 tests**, `npm run build` exit 0. Ce qui atteint enfin la prod : tout V2
(chantiers 1→C7e), zéro-fabrication (F21), Design System, et les **5 familles de
design**. **Vercel** : la prod suit `main`, donc le déploiement se déclenche via
l'intégration GitHub↔Vercel de Vercel — NON vérifiable depuis cet environnement
(le connecteur Vercel MCP exige une approbation interactive indisponible en
headless). À confirmer côté dashboard Vercel (repo `maxencerousseau38-prog/
ReFrame`). Rollback si besoin : `git push origin <sha_précédent>:main` (l'ancien
main était `c627536`). **Désormais la règle « rien n'atteint la prod avant GO
main » ne tient plus** : main et la branche de dev sont alignées ; les prochains
lots repartent de la feature et re-promeuvent sur demande.

**FAMILLES DE DESIGN livrées (2026-07-18) — la racine de la variété réelle.**
Directive Directeur Artistique : arrêter d'optimiser des composants isolés ;
casser le « même squelette re-skinné ». Diagnostic : `INDUSTRY_FLOW` (planner)
donnait à chaque secteur un arc quasi identique. Remplacé par **5 familles**,
chacune avec son PROPRE arc narratif ET son PROPRE rythme de lecture :
`editorial` (architect/agency/realestate/construction, ×1.35, work-first :
hero→portfolio→about→features→stats→testimonials→cta) · `hospitality`
(restaurant/hotel, ×1.18, imagerie+récit, SANS stats/faq : hero→gallery→about→
features→testimonials→cta) · `product` (saas/gym, ×1.0 dense : hero→features→
stats→testimonials→faq→cta) · `retail` (ecommerce/fashion/automotive, ×1.05
court : hero→gallery→features→testimonials→cta) · `trust` (health/lawyer/
finance/trades…, ×1.08 calme, credentials-led : hero→features→about→stats→
testimonials→faq→cta). Câblage RÉEL : `planner.ts` (FAMILY_FLOW/FAMILY_RHYTHM/
SECTOR_FAMILY/`familyOf`), `types.ts` (`DesignFamily`, `SiteSchema.family`+
`.rhythm`), `engine.ts` (stampe family+rhythm en mode smart), `blocks/index.tsx`
(`rfSectionPad` × `var(--rf-rhythm,1)` — s'applique AUSSI au fallback non-mesuré ;
`--rf-rhythm` publié sur `.rf-site`). Preuve DOM (4 familles @1440) :
`--rf-rhythm`=1.35/1.18/1.05/1.08, paddings sections mesurés distincts
(editorial 112–173 vs retail 80–118), overflow-x=0. Preuve visuelle : 4 sites
génériquement DIFFÉRENTS (agency froid/portfolio-first/wordmark monumental/« LET'S
MAKE SOMETHING PEOPLE REMEMBER » ; restaurant chaud/hero image/gallery+about/
témoignages sombres soir/« The table is set » ; ecommerce vert/hero split/gallery
produit/bannière « Find the piece you'll keep » ; health bleu/hero doux/process+
about+stats+FAQ/« Your health, on your schedule »). Régression :
`design-families.test.ts` (11 tests : routing, 5 arcs distincts, rythme ordonné,
moteur stampe family+rhythm, classic n'en porte pas). Vérif : 5 fichiers, câblé,
moteur sélectionne (test+DOM+captures), build exit 0, **516 tests**, git. LOCAL
(branche≠main → Vercel ne déploie pas avant promotion). **Défaut résiduel repéré
(prochaine passe, PAS ce lot)** : `ensureSlot("stats")` peut ré-insérer une bande
stats APRÈS contact dans les familles retail (arc sans stats) — placement à revoir.
**Défauts suivants (inchangés)** : footer (Footer1/FooterMinimal) ; hero variety
par secteur AU SEIN d'une famille ; Projects archform (cartes décalées scale-in).
**Bloqueur prod** : GO promotion `main` sinon rien en prod.

**Fusion 3 sources : `CTAImmersive` livré (2026-07-15) — closing monumental.**
Défaut n°1 (clôture faible 479px) tué. Fusion 21st(#7181 ossature, exécution
rejetée) + Archform(Contact plein-cadre) + ReFrame(tokens/copy) → closing
immersif (photo plein-cadre partagée du pool OU surface sombre brand-contrast +
titre serif monumental + rangée baseline pill). Signature restaurant/hotel/
realestate/architect ; health reste clair. CTAImmersive rejoint le partage
image-led. Vérif : 3 fichiers+test, câblé, moteur sélectionne (test+DOM), build
exit 0, 505 tests. LOCAL. **Défauts suivants** : footer (Footer1/FooterMinimal
pas encore audités) ; hero variety par secteur ; Projects archform (cartes
décalées scale-in). **Bloqueur prod** : GO promotion `main` sinon rien en prod.

**Minage archform #1 livré (2026-07-15) : `FeaturesProcess` + allocation partagée.**
Section process image-led monumentale (photo alternée + numéros géants), minée
de la Process d'archform, réécrite ReFrame, pilotée par vrais services. Signature
architect ; agency/realestate compétitif ; distincte de ProcessTimeline (texte).
Bug d'allocation corrigé : galerie + FeaturesProcess PARTAGENT le pool (cap) —
avant, la galerie vidait tout et le process rendait sans images. Vérif : 4
fichiers, câblé, moteur sélectionne (test+DOM), image-led rendu (capture), build
exit 0, 502 tests. LOCAL. **Archform : autres patterns à miner** = Projects
(cartes décalées + scale-in), Nav, Studio (ImageReveal/UnderlineLink), Services.
**Bloqueur prod inchangé** : GO promotion `main` (Phase 2/3) sinon rien en prod.

**Fabrication des descriptions features SUPPRIMÉE (2026-07-15, F21).**
`featureBlurb()` inventait une phrase par service depuis son titre → supprimée ;
description réelle uniquement, sinon carte titre-seul. `FeaturesShowcase`
réécrit : tuile image si images, sinon carte icône COMPACTE (Linear/Stripe).
Vérif : 2 fichiers, 0 réf restante, build exit 0, 500 tests, avant/après. LOCAL.
**Défauts Design Review restaurant restants** : clôture présence modeste (479px).
**Bloqueurs en attente de ton action** : (1) approbation `add_repo` archform
pour le minage ; (2) GO promotion `main` (Phase 2/3) sinon rien n'atteint la prod.

**Module moteur `TestimonialsNocturne` livré (2026-07-15) — temps sombre du soir.**
Bloc générable (bande sombre `--brand-contrast`, citation serif monumentale,
halo accent, glyphe filigrane, citations d'appui), signature restaurant+hotel
(autres warm gardent leur variété — mesuré 3/6). REGISTRY+catalog+2 tests màj+1
régression. Vérif : 4 fichiers, câblé, moteur sélectionne (test+DOM), build
exit 0, 500 tests. LOCAL (branche≠main). **Dépôt de minage archform INACCESSIBLE
→ ATTENTE de ton approbation `add_repo` maxencerousseau38-prog/archform-replica-project.**
**Défauts restants Design Review restaurant (prochaines passes)** : 1) copy
cartes features FABRIQUÉE (agency-speak sur services) — à sectoriser/supprimer
(F21) ; 2) clôture présence modeste (479px) ; 3) étendre le catalogue par
secteur (Hero/Gallery/CTA V-multiples) une fois archform accessible.

**Ventre de page restaurant réévalué (2026-07-15) — parcours, pas composants.**
Moteur : « une photo = une fois par page » (qualityPass) avec allocation par
PRIORITÉ ÉDITORIALE (hero → galerie-vitrine partiel OK → singles → rangées
all-or-nothing → texte/icônes) ; v1 par ordre de tableau avait tué la galerie
→ refusée en auto-critique, corrigée. Voix sectorielle de clôture
(`closing{title,subtitle}` ×9 secteurs, restaurant « The table is set »).
Mesuré : 0 doublon (avant 5), galerie 5 vues, About 966→689px, tuiles icônes
propres. tsc, 498 tests, LOCAL. **Design Review — gate « agence ou générateur ? »
PAS ENCORE PASSÉ ; défauts assumés → prochaine passe** : 1) copy des cartes
features = agency-speak FABRIQUÉ plaqué sur les services du secteur (« from
brief to launch » sur un menu) — descriptions inventées à supprimer ou
sectoriser (F21) ; 2) ventre tonalement plat (tout clair) — envisager un temps
sombre éditorial (témoignages ?) pour les moods warm/elegant ; 3) présence de
la clôture encore modeste (479px) ; 4) zones média des tuiles icônes hautes.

**Creative Director QG (2026-07-15) : 2 bugs moteur tués.** (1) `qualityPass`
écrasait les PORTRAITS d'équipe avec le pool d'images (fix : blocs team exclus
de la redistribution ; test de régression `team-portraits.test.ts`, suite → 498).
(2) Titre About « écho fantôme » : reveal séparé laissait le contour seul en
état pré-animation (fix : écho+titre révélés comme une unité). Diagnostic DOM :
les « sections vides » de la pleine page étaient un artefact de capture — pas
de bug produit. Preuves : portraits réels rendus, titre net. tsc, 498 tests.
**Doctrine à ancrer (conseil utilisateur, en attente)** : architecture de
prompts en couches (Design Rules / Sector Playbooks / Pipeline / Quality Gates)
— candidat : enrichir DOCTRINE dans llm.ts + docs sectoriels. **Cible visuelle
suivante** : ventre de page restant (gap blanc au-dessus des témoignages,
cartes features aux images dupliquées de la galerie ?) ou nouveau composant 21st.

**Moteur IA enrichi (2026-07-15) : section générable `GalleryBento` livrée.**
Collage éditorial (tuile monumentale + satellites, reveal cascade, hover
profondeur) sélectionné SEUL par le moteur (`prefer restaurant/hotel`), images
réelles uniquement (fin des rectangles vides de GalleryFeature). Avant/après
pleine page restaurant, page 9116→7570px, tsc + 497 tests, preuve LOCALE.
**Tueurs visuels suivants (pleine page restaurant)** : 1) « What our clients
say » rend VIDE malgré 3 témoignages réels dans le fixture (bug rendu ?) ;
2) « The people behind » (team) VIDE aussi ; 3) titre « About Northlight »
quasi invisible (beige sur blanc, contraste KO). → prochaine passe : réparer
le ventre de page (testimonials/team/about), même méthode avant/après.

**MODE DESIGN LEAD (2026-07-14) : impact visible <2s, produit d'abord, sites
générés = priorité absolue.** Passe #1 livrée : imagerie SECTORIELLE du
zpreview (`INDUSTRY_IMAGES` 7 secteurs + fallback + vrais portraits équipe,
34 URLs vérifiées 200) — le hero restaurant passait d'un écran de code flou à
une table gastronomique ; realestate = maison d'architecte. tsc, 497 tests.
**Suivant** : audit visuel des pages générées COMPLÈTES (fullPage, pas que le
hero) secteur par secteur → identifier et tuer le prochain « template feel »
(rythme des sections ? cartes ? footer ?). Interdit : parler bibliothèque —
uniquement des transformations visibles du produit.

**Expérience de GÉNÉRATION livrée (V2) : entrée dashboard + moment d'analyse.**
Entrée focale centrée + command field verre (I-022, bouton dans la barre),
erreurs → destructive ; AnalyzeLoader → carte verre 24px avec l'URL réelle
analysée (I-023), étapes calmes argent. Preuves locales avant/après + état
analyse, overflowX=0, tsc, 497 tests, comportements intacts. Le parcours
dashboard → génération → result → editor parle désormais UNE langue.
**Cible suivante auto-sélectionnée : le flow PUBLISH (LaunchWizard)** — dernier
maillon du parcours encore sur l'ancien langage (emerald/rounded anciens vus à
l'audit wizard-steps.tsx), et c'est le moment de conversion payante. Ensuite :
pastilles PreviewStage · /reset · landing pills.

**Expérience de révélation livrée : /result reconstruit (ciblage autonome V2).**
Barre de commande studio propagée (EditorTopBar slot `center`, pilule
Before/After GlassPillNav + variante mobile), réorganisation « reveal-first »
(I-021 : statut/honnêteté seuls au-dessus, insights en cartes verre 24px SOUS le
preview), DashboardShell retiré, pastilles du cadre before neutralisées.
Mesures (même seed) : previewTop 675→149 @1440, 1489→580 @390, overflow-x
mobile 98→0 (bug réel). Comportements préservés. tsc, 497 tests, preuve LOCALE.
**Cible suivante auto-sélectionnée : l'expérience de GÉNÉRATION** (dashboard
entry → analyze loader → arrivée sur result) — première impression du produit,
surface la plus nue vs la lib (1 input + vide), et c'est le moment « magique »
du produit. Puis : wizard/publish · pastilles PreviewStage · /reset.

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
