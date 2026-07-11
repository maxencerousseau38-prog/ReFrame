# C8 — Audit de l'existant & plan d'implémentation (validation avant code)

> Statut : **plan à valider** (2026-07-10). Spec de référence :
> `docs/C8_BUSINESSDNA_SPEC.md` (v2). Règle absolue D9 actée au registre :
> raisonner en expert métier — jamais en pages/sections/composants ; le
> Composition Engine ne compose pas tant que les questions métier n'ont pas
> de réponse (ou d'inconnu déclaré et tracé).

## 1. Audit de l'existant (faits, fichier:ligne)

**Découverte n°1 — la chaîne produits existe déjà à 70 % et meurt au
composer.** `engine.ts#extractProducts` (L796) lit le JSON-LD
`Product`/`ItemList` ET les cartes DOM (prix, anti-faux-positifs) ; la passe
V2 l'appelle (`pass-content.ts:470`) ; le pont transporte
(`bridge.ts:73-75`) → `extractedContent.products/collection`
(`types.ts:279-285`). **Preuve empirique (2026-07-10)** : bruneau →
8 produits réels {nom, prix « 14,25 € », image, url de fiche} dans
l'analysis V2 dès aujourd'hui. Mais AUCUN case du composer smart ne consomme
`c.products` → ils sont jetés à la composition. (Rectifie M5 de l'audit
C7e : le schéma a des champs produits ; c'est le CONSOMMATEUR qui manque —
plus les objets non-e-commerce : rooms/properties/practitioners/plans.)
Bruit observé : bannières promo captées comme produits (item 1 bruneau) →
filtre nécessaire.

**Inventaire réutilisable (ne rien réécrire) :**

| Module | Localisation | Rôle pour C8 |
|---|---|---|
| `extractProducts` (JSON-LD+DOM) | engine.ts:796, appelé par pass-content:470 | producteur OfferDNA e-commerce (à filtrer/enrichir, pas à réécrire) |
| `collection` (menus/tarifs) | pass-content:468 → bridge:73 ; rendu legacy CMS-lite (engine:2183) + `CollectionGrid` | producteur Menu/Dish ; le bloc renderer EXISTE |
| `serviceItems` (réels) | pass-content → composer (consommé) | entités Service génériques |
| `parseJsonLd` (Organization partiel) | pass-content:58 (type/name/description/telephone) | embryon IdentityDNA — à étendre (adresse, horaires, AggregateRating, sameAs) |
| `detectPlatform` | extraction/platform.ts (shopify/webflow/wordpress/wix/squarespace/framer) | prior fort BusinessModel/Capability (Shopify ⇒ panier garanti) |
| Intégrations détectées | pass-content + engine → `DetectedIntegration{payments/scheduling/booking/chat…}` | base de CapabilityDNA `reconnected` (mécanisme de réinjection au publish EXISTE) |
| `crawlPages` | engine.ts:2323 (4 pages internes) | extensible : crawl ciblé des pages fiches (motifs d'URL) |
| `BusinessProfile` | generation/business.ts (tier/audience/goals par industrie) | à ABSORBER par BusinessModelDNA (préset → inferred faible) |
| Resolver/Sourced/candidates + trace | dna/* | les rails : `businessLayer`/`intentLayer` = nouveaux producteurs |
| `SceneSpecSources` | compose/scene-spec.ts | l'entrée `business`/`intent` était conçue pour ça (D7) |
| `sceneTraceEntries` | compose/scene-spec.ts | patron à décliner : `businessTraceEntries` (« pourquoi ce CTA ? ») |
| Harnais + 9 dumps avant/après | scripts/c7e-audit.mjs, eval-c7e*/ | le juge de paix D8 de chaque sous-lot |
| BlockType `products/booking/menu/schedule/map` | types.ts:31-57 | existants mais rabattus par `renderableCategory` (structure.ts:101, M12) — à dé-rabattre bloc par bloc |
| i18n `label()` | generation/labels.ts | CTA canoniques par ontologie (fr/en/es/de/it) |

**Ce qui n'existe pas du tout** : entités non-e-commerce (Room, Property,
Practitioner, PracticeArea, Plan…), relations entre objets, détection de
surfaces (recherche/date-picker/formulaires typés), capacités + niveaux de
préservation, modèles économiques pondérés, classification descendante,
chaîne des buts/intents, Readiness.

## 2. Points de branchement minimaux (tous additifs)

| # | Point | Localisation | Nature |
|---|---|---|---|
| B1 | `SiteAnalysis.business?: BusinessDna` | generation/types.ts | champ additif (patron `measuredTokens`/`measuredScenes`) |
| B2 | Nouvelles passes d'extraction | extraction/pass-*.ts (patron existant) + nouveau `src/lib/business/` (types, ontologies, moteurs purs) | pas de nouveau pipeline — les passes existantes s'enrichissent |
| B3 | `businessLayer`/`intentLayer` | dna/candidates.ts | producteurs CandidateLayer (patron inspirationLayer) |
| B4 | `SceneSpecSources.business/.intent` | compose/scene-spec.ts | entrées nommées (interface prête) |
| B5 | Cases consommateurs du composer | composer.ts (`case "products"` d'abord — c.products existe !) | additif |
| B6 | Slots par capacités/entités | planner.ts (généralise le patron `opts.hasFaq` F14) | additif |
| B7 | Dé-rabattement | structure.ts#renderableCategory | 1 ligne retirée PAR bloc métier livré (jamais avant) |
| B8 | Route/renderer | — | RIEN (l'analysis transporte tout ; SceneShell/BlockRenderer inchangés) |
| B9 | Trace | pipeline.ts (+1 spread, patron sceneTraceEntries) | « pourquoi chaque décision » — exigence de clôture C8 |

## 3. Découpage proposé (ajusté après audit)

Le découpage utilisateur (a-e) est conservé dans l'esprit ; l'audit le
réordonne sur un critère : **chaque sous-lot doit avoir son gain visible D8
sur le harnais** — d'où « extraction + consommateur » toujours livrés
ensemble (jamais d'entité sans bloc, P6).

| Lot | Contenu | Gain utilisateur mesurable (harnais) | Risque | Est. |
|---|---|---|---|---|
| **C8a — Fondations + identité réelle** | `src/lib/business/` : types Sourced des 8 couches + `Entity` générique + ontologie déclarative (format + 2 ontologies : e-commerce, hôtel) ; **lecteur JSON-LD/microdata étendu** (Organization complet : adresse/horaires/téléphone/sameAs ; AggregateRating→TrustDNA v0) ; filtre anti-bruit produits (bannières promo) + anti-cookies (F23) ; B1 + B9 (businessTraceEntries) ; harnais : dumps exportent `business.*` | headline réelle (fini « Accueil »/« Paris »), téléphone réel (fini « 3924 »), preuve chiffrée réelle (PayFit « 20 000+ ») rendus sur 9/9 | faible (additif pur) | 1 session |
| **C8b — Le catalogue vit (F18)** | OfferDNA e-commerce : products existants → `Entity[]` (+collections via méga-menu/NavigationDNA v0, +crawl fiches léger via motifs d'URL) ; **consommateur** : case composer `products` + blocs `ProductGrid`/fiches réels (prix/images/liens, CTA ontologie « Voir le produit ») ; B7 pour `products` ; pages catalogue dans le multi-pages | bruneau & matfer : catalogue réel navigable avec prix — la vitrine devient e-commerce (début) | moyen (qualité visuelle des cartes → skills design obligatoires) | 1-2 sessions |
| **C8c — Capabilities + BusinessModel + classification** | détection de surfaces (recherche, panier, date-picker, formulaires typés, portails) ; `CapabilityDNA` avec 4 niveaux de préservation (reconnected s'appuie sur les intégrations existantes ; delegated = deep-link) ; `BusinessModelDNA` pondéré ; **classification descendante** (F22) — l'industrie mots-clés rétrogradée en candidat faible ; CTA hierarchy par capacité | ELSAN : badge santé + « Prendre rendez-vous » ; Lutetia : « Réserver » (delegated vers son booking engine) ; Guy Hoquet : badge immobilier + « Estimer mon bien » ; 4/9 → 0/9 classifications fausses | moyen (heuristiques de surfaces à calibrer sur le harnais) | 1-2 sessions |
| **C8d — Intent Engine v1 + parcours** | chaîne des buts (§5.0 spec) ; intents pondérés de page puis de section ; le plan suit les intents (généralise `varySectionOrder`/`sceneOrderMeasured`) ; `journeys` produits et injectés ; `intentLayer` + `SceneSpecSources.intent` | ordre des sections et hiérarchie des CTA justifiés par le métier sur 9/9 ; trace « pourquoi » complète | moyen | 1 session |
| **C8e — Commercial Readiness v1 + validation** | matrice capacité×préservation → warnings UI (bloquants sur `lost` critique) ; « explication structurée » : rapport des décisions depuis la PipelineTrace (exigence de clôture) ; validation complète harnais 9 sites + revue PE + registre + absorption business.ts | le critère utilisateur : pour chaque site du harnais, le moteur EXPLIQUE le métier compris et ce qu'il a préservé | faible | 1 session |

Ordre : a→b→c→d→e. b avant c (décision d'audit) : le catalogue a déjà ses
producteurs ET son gain F18 maximal — c
(surfaces/capacités) calibrera mieux avec de vraies entités en face.

## 4. Risques transverses & mitigations

| Risque | Mitigation |
|---|---|
| Faux positifs d'entités (bannières promo, nav) | filtres dédiés C8a + seuil de confiance A2 + echantillon harnais revu à chaque lot |
| Blocs métier qui « cassent » le premium | skills design obligatoires (CLAUDE.md) + revue visuelle D8 systématique |
| E1 sandbox (pas de Tier 2 externe) | JSON-LD/DOM = Tier 1 (prouvé : 8 produits sans navigateur) ; deltas Tier 2 en prod |
| Sites pauvres en signaux | le gate D9 n'interdit pas de composer : il exige réponses OU inconnus déclarés+tracés → dégradation honnête (comme aujourd'hui), jamais d'invention |
| Scope creep ontologies | P6 (pas d'entité sans consommateur) ; 2 ontologies en C8a, extension par lot |
| Legacy sous-pages (crawl) toujours en vitrine | hors périmètre C8a-c ; C8b apporte les pages catalogue au multi-pages smart ; unification complète = C12 |

## 5. Critère de réussite (contractuel, D8/D9)

Mesuré exclusivement sur les 9 sites du harnais C7e : pour chacun, le
moteur doit pouvoir répondre — preuves à l'appui dans la trace — à : qui est
cette entreprise ? que vend-elle ? quels objets ? quels parcours ? quels CTA
critiques ? quelles capacités doivent survivre (et comment) ? quelles pertes
seraient inacceptables ? — ET la reconstruction doit le montrer (catalogue
navigable réel, « Réserver »/« Prendre RDV » préservés, badges justes).
Le nombre d'entités extraites n'est PAS un critère.
