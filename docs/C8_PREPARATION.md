# C7e/C8 — Audit qualité & métier sur 9 sites réels (2026-07-10)

> Méthode : harnais `scripts/c7e-audit.mjs` — pilote le VRAI parcours produit
> (dashboard → analyze → Transform my site → result) sur 9 sites réels de
> secteurs différents ; sauvegarde par site la capture pleine page
> (animations off = rendu honnête), les tranches métier de l'analysis et du
> schema (`eval-c7e/dumps/*.json`), et un scan des signaux métier du HTML
> source. Vérifications code croisées par appels API directs.
> Limite d'environnement : E1 (pas de Tier 2 navigateur→extérieur en sandbox) ;
> sans incidence sur M1-M11 qui sont indépendants des mesures.

## 0. Verdict en une phrase

**La qualité perçue ne progresse pas au rythme de l'architecture parce que le
parcours produit par défaut n'exécute PAS le moteur V2** — et parce que, même
en mode smart, l'extraction ne comprend aucun objet métier et fabrique des
services préséts. Le moteur est bon ; il est débranché et sous-alimenté.

## 1. Découvertes systémiques (mécanismes, avec preuves)

| # | Mécanisme | Preuve |
|---|---|---|
| **M1** | **Le flux produit par défaut passe par le moteur LEGACY.** Le dashboard démarre en mode `"preserve"` → `useLegacy=true` → `generateSite` (V5 d'avant les chantiers) : aucune DNA, aucun resolver, aucun token compilé, aucune SceneSpec, FAQ fabriquée, libellés anglais. Tout C1→C7 est invisible pour un client qui clique « Transform my site ». | `src/app/dashboard/page.tsx:64` (`useState<GenerationMode>("preserve")`) ; `src/app/api/generate-site/route.ts:52` ; schémas harnais avec `defaultFaq` (`engine.ts:2022,2504`) reproduits UNIQUEMENT via l'UI ; appel API direct en smart → pas de FAQ. |
| **M2** | **Même en smart, le dashboard bypasse les mesures C4→C6.** La route n'appelle `enrichWithMeasurements` QUE quand elle reçoit `url` seul ; le dashboard poste `{analysis: merged, mode}` → jamais de mesures dans le parcours produit (le raccordement D4 ne couvre que l'API nue). | `route.ts:31-41` (enrich dans `if (!analysis)`) ; `dashboard/page.tsx:131` ; dumps : `measured:{tokens:false,scenes:false}` 9/9. |
| **M3** | **Services fabriqués par préséts d'industrie** (violation de la règle d'or no-fabrication) : quand l'extraction ne trouve pas de services, les préséts anglais du profil sont injectés DANS `extractedContent` puis rendus jusqu'à 3 fois par page. | `src/lib/extraction/bridge.ts:61` (`?? profile.defaults.services`) ; `industries.ts:99` ; composer L277/356 (même fallback) ; dumps 9/9 (« Tax planning » sur Guy Hoquet, « Automation » sur un groupe de 212 hôpitaux) ; capture guy-hoquet : mêmes 4 items ×3 sections. |
| **M4** | **Industrie fausse 4/9** : immobilier→finance, architecture→realestate, équipement cuisine pro→realestate, groupe hospitalier→saas. Toute la chaîne aval (profil, préséts, badge, CTA, flow) hérite de l'erreur : badge « Software & SaaS » + CTA « Start free » sur ELSAN (hôpitaux). | dumps `analysis.industry` ; captures (badges/CTA). |
| **M5** | **L'extraction n'a AUCUN champ métier.** `extractedContent` = headline/description/services/images/testimonials/stats/faq/contact. Pas de : produits, prix, catégories, variantes, panier, chambres, disponibilités, biens, filtres, recherche, domaines d'expertise, menu/carte, RDV. L'information meurt AU NIVEAU DU SCHÉMA, avant tout moteur. | `generation/types.ts#extractedContent` ; scans source : bruneau 458 productCards/365 catégories/27 prix/126 addToCart/208 avis → 0 dans l'analysis ; lutetia booking:306/rooms:708 → 0 ; elsan booking:15 → 0. |
| **M6** | **Répétition template** : la détection de structure rabat presque tout en `features@50` et le contenu de chaque features = les mêmes préséts → sections identiques répétées. | Wilmotte : 5× « Why choose us » avec les 4 MÊMES cartes fabriquées (capture) ; payfit : 6× `FeaturesAlternating` ; guy-hoquet : mêmes 4 items ×3. |
| **M7** | **Libellés anglais sur sites français** : le legacy (M1) n'a pas l'i18n C3 ; et même en smart les items préséts (M3) sont anglais. « Why choose us », « What our clients say », « Book a consultation », « Crafted with care », « Start free » sur des sites `lang=fr`. | captures guy-hoquet/elsan/bruneau ; dumps `language:"fr"`. |
| **M8** | **CTA métier perdus** : l'extraction du CTA prend un texte au hasard — email brut (« molut-reservations@mohg.com »), « AccueilAccueil », « News » — au lieu des actions critiques (Réserver, Prendre RDV, Acheter). | dumps `ctaLabel` hotel/elsan/avocats. |
| **M9** | **Nav corrompue + items fabriqués** : « AccueilAccueil », « Nx:AnnuaireTrouver un établissem » (concaténations), et un onglet « Shop » inventé sur un groupe hospitalier. | capture + dump elsan (`nav`). |
| **M10** | **Images réelles extraites mais non utilisées** : 7 images Wilmotte extraites → cartes en dégradé placeholder ; hero sans photo. À l'inverse hotel/elsan : 0 image extraite (lazy-load JS non exécuté, pas de Tier 2 — cf. M2/E1). | dumps `images` vs captures. |
| **M11** | **Headline = `<title>` brut** quand le H1 n'est pas extractible : « Accueil », « Paris », « Accueil - Matfer Bourgeat » en headline de hero. | dumps `headline` elsan/hotel/industrie. |
| **M12** | **Blocs métier existants mais neutralisés** : la taxonomie a `products/booking/menu/schedule/map`, mais `renderableCategory` les rabat sur `portfolio/features/contact` (pas de composant dédié) → même un e-commerce parfaitement détecté deviendrait une vitrine. | `generation/structure.ts:101-122`. |

## 2. Défauts observés par site (liste brute, honnête)

**Bruneau (e-commerce)** — 1. zéro produit/prix/panier/catégorie (M5) ; 2. FAQ
fabriquée en anglais (M1) ; 3. services footer « Free shipping… » fabriqués
(M3) ; 4. email placeholder « exemple@domaine.com » ; 5. téléphone extrait
faux (« 3924 ») ; 6. tagline « Crafted with care. » fabriquée ; 7. CTA
« Contact » au lieu d'acheter ; 8. section features quasi vide sous « Why
choose us » ; 9. mélange FR/EN.
**Guy Hoquet (immobilier)** — 10. badge « Finance & Consulting » (M4) ;
11. 4 services finance fabriqués rendus ×3 (M3/M6) ; 12. « Why choose us »
dupliqué à l'identique ; 13. copy filler « executed cleanly from brief to
launch » ; 14. bannière pub source utilisée comme visuel hero ; 15. recherche
de biens/estimation/annonces absentes (cœur du métier) ; 16. libellés EN
(M7). Positif : 5 vrais témoignages clients extraits et rendus ; nav réelle
Vendre/Louer/Acheter préservée.
**Wilmotte (architecture)** — 17. « Why choose us » ×5 identiques (M6) ;
18. cartes immobilières fabriquées sur une agence d'architecture (M3/M4) ;
19. dégradés placeholder alors que 7 vraies images extraites (M10) ;
20. « BOOK A VIEWING » (immobilier, EN) ; 21. projets/actualités réels
(détectés dans les headings) perdus.
**Bouillon Chartier (restaurant)** — 22. menu/carte/prix absents (le site en
a) ; 23. pas de bloc horaires/localisation dédié ; 24. FAQ réelle extraite
(4) mais services préséts EN par-dessus le vrai contenu FR.
**Lutetia (hôtel)** — 25. réservation absente (306 signaux booking source) ;
26. chambres/suites absentes (708 signaux) ; 27. CTA = adresse email brute
(M8) ; 28. 0 image extraite sur un site visuel (M10) ; 29. headline
« Paris ».
**August Debouzy (avocats)** — 30. « Family law » fabriqué pour un cabinet
d'affaires (M3) ; 31. domaines d'expertise réels (45 signaux) non extraits ;
32. équipe/associés absents ; 33. FAQ fabriquée (M1).
**PayFit (SaaS)** — 34. 6× FeaturesAlternating d'affilée (M6) ; 35. « Join
20,000+ businesses » (vraie social proof) perdue ; 36. pricing absent.
**Matfer Bourgeat (industrie)** — 37. classé immobilier (M4) ; 38. services
immobiliers fabriqués ; 39. 398 signaux « menu/carte » (catalogues cuisine)
ignorés.
**ELSAN (santé)** — 40. badge SaaS + « Start free » sur 212 hôpitaux
(M4/M7) ; 41. « Trouver un établissement/praticien » et prise de RDV absents
(parcours critique) ; 42. nav corrompue + « Shop » fabriqué (M9) ; 43. page
réduite à 3 blocs ; 44. headline « Accueil » (M11).

## 3. Carte des fuites (où l'information meurt)

```
DOM/Extraction   M5 (schéma sans objets métier) · M8 (CTA) · M9 (nav bruitée)
                 M10 (images lazy sans Tier 2) · M11 (headline=title)
Understanding    M4 (industrie fausse 4/9) · aucune sous-catégorie/modèle
                 éco/parcours (n'existent nulle part dans SiteAnalysis)
Bridge/Content   M3 (préséts fabriqués INJECTÉS dans extractedContent)
Generation       M6 (structure→features@50 génériques) · M12 (blocs métier
                 rabattus sur vitrine) · préséts re-fabriqués (composer L277/356)
Composition      saine et volontairement aveugle au métier (D6) — attend la
                 BusinessDNA ; rien à corriger ici
Renderer         exécuteur (OK)
FLUX PRODUIT     M1 (défaut=preserve→LEGACY : tout ce qui précède au carré)
                 M2 (smart via dashboard = jamais de mesures C4→C6)
```

## 4. Conséquences — plan proposé

**P0 — Rebrancher le moteur (avant toute ligne de C8 ; gain visible immédiat)**
1. Dashboard : mode par défaut `smart` (M1) — le moteur V2 devient LE produit.
2. Route : mesurer aussi quand `body.analysis` est fourni (M2) — D4 réellement
   opérant en prod.
3. Supprimer la fabrication de services (`bridge.ts:61`, composer L277/356) :
   sans services réels → section omise (règle d'or) (M3).
4. Legacy `defaultFaq` (`engine.ts:2022`) : omission au lieu de fabrication
   tant que le legacy sert les sous-pages crawlées.

**C8 — Business Understanding Engine (le fond)**
- `BusinessDna` = industrie exacte + sous-catégorie + modèle économique +
  objets métier extraits (produits{nom,prix,image,catégorie}, chambres,
  biens, domaines, menu, praticiens…) + actions critiques (acheter, réserver,
  prendre RDV, estimer, appeler) + parcours à préserver + preuves de confiance.
- Extraction dédiée par familles de signaux (M5) : prix/panier/catégories,
  booking/disponibilités, annuaire/recherche, cartes/menus — le scan source du
  harnais montre que ces signaux sont massivement présents et détectables.
- Classification d'industrie refondée sur ces signaux (M4) : 458 cartes
  produit ⇒ e-commerce, 708 « room » ⇒ hôtel — pas des mots-clés de heading.
- Injection : couche `businessLayer` (CandidateLayer) + entrée `business` de
  `SceneSpecSources` + slots/plan par modèle économique (M12 : composants
  produit/booking/menu dédiés — C9/C10 catalogue).
- i18n des items générés (M7) et CTA critiques par métier (M8).

## 5. Nouveau critère de validation (acté)

Un sous-lot n'est réussi que si, EN PLUS des tests/tsc/fallbacks, il démontre
une amélioration perceptible sur plusieurs reconstructions réelles
(avant/après via `scripts/c7e-audit.mjs` — le harnais est réutilisable tel
quel). Registre : D8.
