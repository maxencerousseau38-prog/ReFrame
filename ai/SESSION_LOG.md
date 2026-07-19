# Journal des sessions (append-only — 3 à 5 lignes par entrée, le plus récent en haut)

## 2026-07-18 — HeroCollage : casser le monopole du hero au sein d'une famille
- Revue Directeur Artistique : deux marques d'un même secteur = MÊME hero (>50% qualité perçue → template immédiat). Probe : restaurant/hotel/architect/realestate/health = 1/6 distinct. Racine prouvée : un `prefer` unique (+5) bat toujours la jitter (max 1.6) → monopole du hero.
- Minage 3 sources : 21st MCP (search hospitality → 10 comparés ; #19074 « Editorial Collage Hero » = 2 images superposées + serif ; get_component bloqué limite 2/j → reinterprété depuis desc/preview) + Archform Hero.tsx (reveal masqué ligne + ken-burns scale-in) + grammaire ReFrame. Reinterprété 100%.
- `HeroCollage` : hero SPLIT éditorial (eyebrow mono-caps + titre serif reveal-masqué à gauche ; collage 2 photos superposées à droite, matte/profondeur, ken-burns, chip caption). Distinct des full-bleed ET de HeroEditorial (portrait unique). Dégrade en tuile simple si 1 seule photo.
- Fix monopole : co-prefer restaurant/hotel avec HeroImageFull (14=14 → jitter départage) → restaurant/hotel = 2/6 distinct (~50/50). Zéro photo dupliquée : image2 seulement sur HeroCollage + qualityPass.serveBlock lui donne un slot pool UNIQUE. Ajout param QA `?brand=` à zpreview pour auditer la variété par marque.
- VÉRIF : blocks+catalog+engine+qualityPass+zpreview, moteur SÉLECTIONNE (test+DOM), 2 restos réels = 2 heros (Osteria Nord→Collage, Le Marais→ImageFull, captures 1440+390), overflow-x=0, régression hero-collage.test.ts (6), catalog.test.ts mis à jour (restaurant = 2 signatures), tsc, 525 tests (520→525), build exit 0. LOCAL (feature).

## 2026-07-18 — FooterSignature : la dernière impression enfin premium (fusion 3 sources)
- Revue Directeur Artistique : le footer = moment le plus « template » de chaque site. Footer1 (défaut) mince ; FooterColumns = sitemap SaaS générique ; fabrication « Crafted with care. » codée en dur (la vraie tagline n'était jamais passée). Capture BEFORE architect = footer clair 4-colonnes indistinct d'un starter.
- Minage RÉEL 3 sources : 21st MCP (search « premium editorial footer » → 10 résultats comparés ; get_component #19358 « Footer Section 5 » analysé → gardé l'ARCHITECTURE wordmark outliné monumental + panneau chevauchant la baseline ; REJETÉ shader @paper-design + bleu codé + 6 colonnes fabriquées) + Archform Contact.tsx>Footer (fond sombre inversé bg-primary + eyebrows mono-caps + baseline hairline) + grammaire ReFrame. Reinterprété à 100%, zéro markup copié.
- `FooterSignature` : sign-off sombre `--brand-contrast`/`--brand-contrast-ink` (AA par construction), vraie tagline, colonnes Pages/Services/Contact réelles (eyebrows mono-caps), nom de marque en OUTLINE monumental en pied (WebkitTextStroke, min(16vw,260px)), rogné par `overflow-hidden` du footer → jamais la page. S'adapte à la typo de marque (sans architect / serif restaurant, prouvé). Fabrication tuée GLOBALEMENT : props.tagline=deAiDash(headline) sur tous les footers ; « Crafted with care. » retiré de Footer1+FooterColumns (omis si absent, F21).
- Câblé : blocks (composant+REGISTRY+fix), catalog (prefer architect/realestate/restaurant/hotel ; sectors editorial+hospitality+fashion/lawyer/finance ; variété préservée ailleurs), engine (tagline). VÉRIF : moteur SÉLECTIONNE (test+DOM data-variant), avant/après architect+restaurant, 320/390/768/1440 overflow-x=0, régression footer-signature.test.ts (4), tsc, 520 tests (516→520), build exit 0. LOCAL (feature) — promotion main sur demande.

## 2026-07-18 — Promotion `main` : le blocage prod historique est levé
- GO explicite de l'utilisateur pour pousser la branche de dev dans `main`. Une seule branche de travail (`claude/siterevive-ai-saas-a9sxzw`) ; `main` était un ANCÊTRE strict (214 commits de retard, 0 divergence) → fast-forward propre, aucun conflit, aucune perte possible.
- Gate avant push : `npx tsc --noEmit` propre, 516 tests verts, `npm run build` exit 0 sur la pointe `9d493d5`. Puis `git checkout main` + `git merge --ff-only` + `git push origin main` (`c627536..9d493d5`). Vérifié : remote main == remote feature == `9d493d5`.
- Vercel : la prod suit `main` → le déploiement se déclenche via l'intégration GitHub↔Vercel. NON vérifiable ici (connecteur Vercel MCP exige une approbation interactive indisponible en headless) — à confirmer côté dashboard (repo `maxencerousseau38-prog/ReFrame`). Rollback éventuel : `git push origin c627536:main`.
- Conséquence OS : la règle « rien n'atteint la prod avant GO main » ne s'applique plus ; main et dev sont alignées. Les prochains lots repartent de la feature et re-promeuvent sur demande.

## 2026-07-18 — FAMILLES DE DESIGN : casser le « même squelette re-skinné »
- Directive Directeur Artistique : cesser d'optimiser des composants isolés, produire de VRAIES familles de design (rythme/narration/hero/sections/CTA/langage propres). Diagnostic de la racine : `INDUSTRY_FLOW` (planner) donnait à tous les secteurs un arc quasi identique → tout se lisait comme un seul squelette. Remplacé par 5 familles à arc + rythme distincts.
- Câblé RÉELLEMENT du planner au renderer : `planner.ts` (`FAMILY_FLOW` 5 arcs, `FAMILY_RHYTHM` editorial 1.35→product 1.0, `SECTOR_FAMILY`, `familyOf`) ; `types.ts` (`DesignFamily`, `SiteSchema.family`+`.rhythm`) ; `engine.ts` (stampe family+rhythm en mode smart uniquement, classic/preserve/explicit neutres) ; `blocks/index.tsx` (`rfSectionPad` multiplie par `var(--rf-rhythm,1)` — s'applique aussi au fallback NON mesuré, donc rythme visible partout ; `--rf-rhythm` publié inline sur `.rf-site`).
- Preuve DOM 4 familles @1440 : `--rf-rhythm` = 1.35/1.18/1.05/1.08, paddings de sections mesurés distincts (editorial 112–173px vs retail 80–118px), overflow-x=0. Preuve visuelle : agency/restaurant/ecommerce/health rendent 4 sites génériquement DIFFÉRENTS (hero, arc, palette, sections, CTA sectorielle « LET'S MAKE… » / « The table is set » / « Find the piece you'll keep » / « Your health, on your schedule »).
- VÉRIF : 5 fichiers, câblé, moteur SÉLECTIONNE (test+DOM+captures), régression `design-families.test.ts` (11 tests), build exit 0, 516 tests (505→516), tsc propre, git. LOCAL (branche≠main → Vercel ne déploie pas avant promotion). Défaut résiduel noté (prochaine passe) : `ensureSlot("stats")` ré-insère parfois une bande stats après contact dans retail (arc sans stats).

## 2026-07-15 — Fusion 3 sources : CTAImmersive (closing monumental) — défaut n°1 tué
- Défaut visuel n°1 des sites générés : la CLÔTURE (dernière impression) = petite bande claire centrée 479px (CTAEditorial), alors que les meilleurs sites finissent en moment monumental pleine largeur. Attaqué en priorité.
- Sources comparées : 21st (10 CTA cherchés ; #7181 récupéré → dégradé violet + avatars fabriqués + texte gradient REJETÉS, ossature « statement + 1 action » gardée) + Archform Contact.tsx (image plein-cadre + scrim + titre 10vw + rangée baseline lead/pill à point) + ReFrame (tokens + copy sectorielle réelle). Fusion → `CTAImmersive` (100% réécrit, jamais copié).
- Câblé : REGISTRY + BLOCK_CATALOG (prefer restaurant/hotel/realestate/architect ; distinct des 5 CTA existants). Image-led : le bloc CTA porte une image candidate + CTAImmersive rejoint le partage image-led du pool (galerie + process + closing) → mesuré : closing reçoit une photo distincte (image=E sur pool 6), sinon surface sombre `brand-contrast` (jamais plat). Restaurant closing : CTAEditorial→CTAImmersive.
- VÉRIF : 3 fichiers (blocks+catalog+engine) + test régression ; câblé (REGISTRY+catalog) ; moteur SÉLECTIONNE (test restaurant/hotel/realestate/architect + DOM bg rgb(26,26,26) + « The table is set » monumental) ; health reste CTAEditorial (test préservé) ; build exit 0 ; 505 tests (502→505). LOCAL (branche≠main).

## 2026-07-15 — Minage archform #1 : FeaturesProcess (process image-led) + allocation partagée
- Dépôt archform cloné + analysé (site/*: Hero/Process/Projects/Services/Nav/Studio). Pattern extrait : la section Process (récit numéroté « how we work », rythme alterné image/étape, numéros monumentaux) — ARCHITECTURE seulement, réécrite en grammaire ReFrame (tokens/rfSectionPad/CoverImage/EASE/reduced-motion), pilotée par les VRAIS services (zéro fabrication, description réelle only).
- Dédup : ReFrame avait déjà `ProcessTimeline` (timeline verticale compacte texte-seul) → `FeaturesProcess` est la version IMAGE-LED monumentale, distincte. Enregistré REGISTRY+catalog, signature architect (prefer), compétitif agency/realestate (variété préservée — 4 variantes/6 marques), métiers image-pauvres gardent ProcessTimeline. Test régression + 1 test catalog inchangé (agency/X→Spotlight).
- Bug d'allocation découvert & corrigé : hero+galerie vidaient le pool → FeaturesProcess sans images (image-led inerte). qualityPass refait : les sections image-led (galerie + FeaturesProcess) PARTAGENT le pool équitablement (cap quand >1). Mesuré : hero1/galerie3/process2 sur pool de 6. Restaurant inchangé (pas de FeaturesProcess).
- VÉRIF : 4 fichiers, câblé (REGISTRY+catalog), moteur SÉLECTIONNE (test+DOM), image-led rendu (capture architect : photo 4/5 + « 01/ » alterné), build exit 0, 502 tests (500→502). LOCAL (branche≠main).

## 2026-07-15 — Moteur : fin de la fabrication des descriptions de cartes (F21) + FeaturesShowcase compact
- Défaut Design Review n°2 tué : `featureBlurb()` (engine.ts) inventait une phrase pour CHAQUE service depuis son seul titre (« Wine pairing, executed cleanly from brief to launch » sur un resto) → violation no-fabrication. Fonction SUPPRIMÉE ; 2 sites d'appel (features + services) : description RÉELLE uniquement (`s.description`), sinon aucune (carte titre-seul).
- Effet de bord visuel géré (vérifié à l'œil, pas supposé) : sans description ni image, `FeaturesShowcase` montrait une grande zone média VIDE + titre seul (thin/inachevé). Réécrit : grande tuile image seulement s'il y a des images ; sinon carte icône COMPACTE (pastille accent + titre, grammaire Linear/Stripe) — premium même titre-seul.
- VÉRIF : 2 fichiers (engine.ts, blocks/index.tsx), featureBlurb 0 référence restante, build exit 0, 500 tests, capture avant(inventé)/après(compact honnête). LOCAL (branche≠main).

## 2026-07-15 — Module moteur : TestimonialsNocturne (temps sombre du soir) — workflow vérifié
- Dépôt de minage archform INACCESSIBLE (add_repo hors approbation, clone bloqué proxy) → au lieu de rester en analyse, lot moteur visible : le défaut n°1 de ma Design Review (ventre restaurant tonalement PLAT, aucune bande sombre car les variantes sombres avaient moods bold/minimal → jamais servies aux secteurs warm).
- Nouveau bloc GÉNÉRABLE `TestimonialsNocturne` : bande sombre atmosphérique (`var(--brand-contrast)`, citation serif monumentale, halo accent, glyphe guillemet filigrane, 2 citations d'appui), brand-agnostic, reduced-motion, real-only. Enregistré REGISTRY + BLOCK_CATALOG. Recadré après auto-critique : v1 monopolisait TOUS les secteurs warm (même bande partout) → restreint à restaurant+hotel (signature du soir), les autres warm gardent leur variété (mesuré : 3 variantes distinctes/6 marques).
- 2 tests catalog.test.ts encodaient « warm=toujours clair » → mis à jour vers le comportement voulu (le meilleur gagne). Test de régression `testimonials-nocturne.test.ts` : restaurant+hotel → Nocturne.
- VÉRIF : 4 fichiers modifiés, composant câblé (REGISTRY+catalog, pas juste créé), moteur le SÉLECTIONNE (test + DOM : bande sombre rendue sur zpreview restaurant), build exit 0, 500 tests (498→500). Preuve LOCALE (branche≠main : prod Vercel inchangée tant que promotion non faite).

## 2026-07-15 — Ventre de page restaurant : parcours réévalué (Creative Director)
- Carte du rythme mesurée : 5 doublons d'images inter-sections (features réutilisait 4/6 photos de la galerie, About une 5e) + clôture générique « Ready to get started? » 450px/pad32 (la plus petite section) pour un restaurant.
- Moteur : règle « une photo = une fois par page » dans qualityPass avec ALLOCATION PAR PRIORITÉ ÉDITORIALE (hero → GALERIE la vitrine, partiel autorisé → singles → rangées de cartes all-or-nothing → texte/icônes). 1ère version (ordre du tableau) avait TUÉ la galerie — refusée par auto-critique, corrigée. Team toujours exclu (identité).
- Voix sectorielle de clôture : champ `closing{title,subtitle}` dans IndustryProfile + copy originale pour 9 secteurs (restaurant « The table is set »…) consommée par le bloc CTA (fallback neutre conservé).
- Mesures après : 0 doublon inter-sections, galerie 5 vues restaurée, features en tuiles icônes propres, About resserré 966→689px, clôture en voix restaurant. tsc, 498 tests, LOCAL. Défauts identifiés en Design Review (copy cartes = agency-speak fabriqué sur secteur, ventre tonalement plat, présence CTA encore modeste) → prochaine passe.

## 2026-07-15 — Creative Director QG : portraits d'équipe + titre About (moteur)
- Doctrine Creative Director reçue (quality gates : aucune section vide/texte perdu/hiérarchie confuse). Diagnostic DOM factuel : « sections vides » = artefact de capture (whileInView), mais 2 VRAIS bugs moteur confirmés.
- BUG 1 (moteur) : `qualityPass` étape « distribute imagery » écrasait les PORTRAITS des membres d'équipe avec le pool général (salle à manger sur le visage de la fondatrice). Preuve par test : PORTRAIT0/1 → POOL1/2. Fix : blocs `team` exclus de la redistribution (l'image d'une personne = identité). Test de régression permanent `team-portraits.test.ts` → suite passe à 498.
- BUG 2 (renderer) : titre About « écho fantôme » (contour text-stroke) + vrai titre en reveal séparé → tout état pré-animation montrait le contour seul (= titre cassé en capture/print/device lent). Fix : écho + titre révélés comme UNE unité motion.
- Preuves visuelles : « The people behind Northlight » net, 3/4 vrais portraits rendus (4e = cold-start proxy sandbox, URL 200 vérifiée). tsc propre, 498 tests. LOCAL.

## 2026-07-15 — Moteur IA : nouvelle section générable GalleryBento (restaurants/hôtels)
- Mandat « absorber la qualité, l'injecter dans le moteur » : nouvelle section GENERABLE `GalleryBento` (collage éditorial : tuile de tête monumentale + satellites, reveal en cascade, hover profondeur + légendes indexées, hairlines) — code original, grammaire maison (rfSectionPad/rfContainer/CoverImage/EASE, brand-tinted). Enregistrée REGISTRY + BLOCK_CATALOG avec `prefer: restaurant/hotel` → le moteur la SÉLECTIONNE seul.
- Tueur visuel corrigé par construction : l'ancienne galerie alternée affichait des RECTANGLES VIDES pour les items sans image (pleine page restaurant) ; GalleryBento filtre → images réelles uniquement, <4 images = grille propre, 0 image = section omise (no-fabrication).
- Avant/après pleine page restaurant : bandes cassées → collage magazine 6 vues ; page 9116→7570px. tsc propre, 497 tests. Preuve LOCALE. Prochains tueurs identifiés sur la pleine page : « What our clients say » VIDE, « The people behind » VIDE, titre About quasi invisible (beige sur blanc).

## 2026-07-14 — MODE DESIGN LEAD : sites générés — imagerie sectorielle (impact <2s)
- Nouveau mandat : plus de travail de bibliothèque, uniquement des transformations visibles du PRODUIT ; priorité absolue = sites générés. Diagnostic visuel zpreview : le fixture servait 6 photos d'ÉCRANS DE CODE à toutes les industries → un restaurant avait un hero « code flou » (tueur de qualité perçue n°1).
- Fix moteur-galerie : `INDUSTRY_IMAGES` par secteur (restaurant/agency/realestate/artisan/ecommerce/health/saas, 6 images premium chacune, TOUTES vérifiées HTTP 200) + `GENERIC_IMAGES` fallback + `TEAM_PORTRAITS` réels (l'équipe avait des screenshots de code comme visages). Hero [0] pensé par secteur.
- Avant/après restaurant : code flou → table gastronomique ; realestate : maison d'architecte au crépuscule ; santé/ecommerce cohérents. tsc propre, 497 tests, overflow 0. Preuve LOCALE. Suivant (Design Lead) : juger le rendu complet des pages générées (pas que le hero) et attaquer le prochain tueur visuel.

## 2026-07-14 — Expérience de GÉNÉRATION : entrée dashboard + moment d'analyse (V2, ciblage autonome)
- Entrée `/dashboard` refaite en composition focale centrée (badge, titre 4xl→5xl text-balance, sous-titre contenu) + « command field » (I-022) : UNE barre en verre (icône + input + bouton argent à l'intérieur, focus-within), erreur → tokens destructive. Bouton `light` retiré du parcours.
- `AnalyzeLoader` (moment magique) → carte verre 24px (I-023) : en-tête « Reading your site » + URL RÉELLE analysée (prop `url`), étapes calmes (courante en white/[0.06], coches argent, pending muted), motion ease-premium, reduced-motion conservé. Timing narratif préexistant conservé (borderline U0, documenté — le done reste le signal réel).
- Preuve LOCALE : captures avant/après 1440+390 + état analyse (auto-run ?url=example.com), overflowX=0 partout, tsc propre, 497 tests. Comportements intacts (analyze/generate/modes/i18n/extras). Prochaine cible auto : wizard/publish OU pastilles PreviewStage (au choix du prochain tour).

## 2026-07-14 — Expérience de révélation : /result reconstruit (mode V2, ciblage autonome)
- Évaluation des surfaces → /result choisie (pic émotionnel du produit D8, la plus en retard vs la lib : 6 bannières empilées au-dessus du preview, pas de barre de commande, boutons pré-V3). `EditorTopBar` généralisé (slot `center`) et propagé : même langage studio que l'éditeur sur tout le parcours ; pilule Before/After = `GlassPillNav` (mobile : pilule sous la barre).
- Réorganisation « reveal-first » (I-021) : statut/honnêteté seuls au-dessus, la RÉVÉLATION tout de suite, insights (email capture, recommandations, scores) en cartes verre 24px SOUS le preview. DashboardShell retiré (studio full-bleed comme l'éditeur). Pastilles trafic du cadre « before » neutralisées (blanc translucide). Comportements intégralement préservés (share/copy, download, wizard publish, paywall/auth/erreurs, BeforeView iframe→shot→mockup).
- Mesures avant/après (même seed) : previewTop 675→149 @1440, 1489→580 @390 ; BUG réel corrigé : overflow-x mobile 98→0. tsc propre, 497 tests, preuve LOCALE. Ledger : I-018 propagé, I-021 nouveau.

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
