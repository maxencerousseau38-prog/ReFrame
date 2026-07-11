# C8 — Spécification BusinessDNA & Intent Engine (conception, zéro code)

> Statut : **proposition à valider** (2026-07-10). Guidera les prochains mois.
> Ancrage : preuves de l'audit C7e/P0 (`docs/C8_PREPARATION.md`, dumps
> `eval-c7e*/dumps/`). Contraintes héritées : charte I1/G1-G4/A2,
> no-fabrication, D6 (Understanding → Composition, jamais l'inverse),
> D7 (multi-couches, moteurs aveugles à l'origine, intelligence = données).

---

## 1. La question fondatrice

**Qu'est-ce qu'un humain comprend instinctivement en 10 secondes sur un site ?**

En visitant bruneau.fr, lutetia.com ou elsan.care, un humain comprend sans
effort, dans cet ordre approximatif :

1. **Qui c'est** — nom, logo, ton, gamme (discount ↔ luxe), taille (artisan ↔
   groupe), ancrage (local ↔ international), langue.
2. **Ce qu'ils offrent** — des OBJETS : des produits avec des prix, des
   chambres avec des dates, des biens avec des surfaces, des médecins avec
   des spécialités, des plats avec une carte. Pas des « sections » : des objets.
3. **Ce qu'on attend de lui** — acheter, réserver, prendre RDV, demander un
   devis, appeler, candidater. L'action principale saute aux yeux (ou pas —
   et c'est un défaut du site).
4. **Comment l'argent circule** — on paie en ligne ? on réserve puis on paie
   sur place ? on laisse ses coordonnées ? on s'abonne ?
5. **Le chemin pour y arriver** — chercher → filtrer → comparer → fiche →
   panier → payer ; ou : voir les chambres → dates → réserver.
6. **Pourquoi faire confiance** — avis (combien, quelle note), labels, presse,
   chiffres, ancienneté, garanties, visages de l'équipe.
7. **Le contexte pratique** — où, quand (horaires), comment contacter,
   plusieurs établissements ou un seul.

La BusinessDNA est la formalisation de ces 7 compréhensions. Tout ce qui suit
en découle.

## 2. Principes d'architecture (non négociables, hérités)

- **P1 — Des données, jamais des branches.** Aucun moteur (extraction mise à
  part) ne contient de logique « si hôtel alors… ». Le savoir sectoriel vit
  dans des **ontologies déclaratives** (des données versionnées), consommées
  par des moteurs génériques. C'est la seule façon de couvrir 20+ secteurs
  sans 20 pipelines.
- **P2 — Peu de couches, riches ; pas une couche par secteur.** La liste
  ProductDNA/RoomDNA/HealthcareDNA/… de la réflexion initiale ne devient PAS
  15 artefacts de pipeline : ce sont des **schémas d'entités** d'une couche
  unique (`OfferDNA.entities`), typés par l'ontologie du secteur. Une couche
  n'existe que si elle a des producteurs ET des consommateurs distincts.
- **P3 — Tout est `Sourced`.** Chaque champ de chaque entité porte
  provenance + confiance (mêmes rangs measured > user > inferred > curated >
  preset, A2 : inféré faible rétrogradé). Un prix incertain = champ absent +
  demande au propriétaire (recovery flow), jamais un prix plausible.
- **P4 — No-fabrication à l'échelle des objets.** Une entité n'existe que si
  elle a été observée. Pas d'objet « exemple ». Une section métier sans
  entités réelles est omise (règle d'or, désormais effective — P0).
- **P5 — Understanding → Composition.** Les couches de compréhension
  produisent des décisions résolues ; le Composition Engine les reçoit par
  `SceneSpecSources` / `CandidateLayer` sans connaître leur origine (D7,
  déjà en place). Le renderer exécute.
- **P6 — Une entité n'entre dans l'ontologie que si un consommateur de
  composition l'utilise.** Garde-fou anti-modélisation infinie : chaque type
  d'objet doit nourrir au moins un bloc/slot/CTA/warning concret.

## 3. Les couches de compréhension (découverte et justification)

Sept couches, chacune avec responsabilité unique. Trois existent déjà à
l'état d'embryon (à absorber, pas à dupliquer).

```
                    ┌─ IdentityDNA (qui)
                    ├─ OfferDNA (quoi — LE cœur : entités + relations)
 EXTRACTION ───────▶├─ BusinessModelDNA (comment l'argent circule)
 (Tier 1 + Tier 2)  ├─ TrustDNA (pourquoi croire)
                    ├─ NavigationDNA (l'architecture d'information réelle)
                    └─ ContentDNA (le verbatim : copy, langue, ton)
                              │
                              ▼
                    IntentDNA (pourquoi — Intent Engine, § 5)
                              │  consomme les 6 couches + SceneDNA
                              ▼
              businessLayer/intentLayer (CandidateLayer)
              + SceneSpecSources.business/.intent
                              ▼
                    Composition Engine → Renderer
```

### 3.1 IdentityDNA — « qui c'est »
- **Responsabilité** : l'identité factuelle (l'identité VISUELLE reste la
  BrandDNA mesurée C4 : palette, fonts, logo — déjà faite, ne pas dupliquer).
- **Données** : nom canonique, baseline réelle, secteur + **sous-catégorie**
  (« hôtel 5★ palace » ≠ « hôtel économique » ; « avocats d'affaires » ≠
  « droit de la famille »), positionnement de gamme (échelle mesurable :
  discount/standard/premium/luxe, inférée des prix + vocabulaire + densité),
  taille (solo/TPE/groupe — ELSAN : « 212 hôpitaux » était DANS le texte),
  présence (adresses, multi-établissements, zones desservies, horaires),
  langues, contacts (tél/email/formulaires — réels), réseaux, mentions légales.
- **Producteurs** : extraction (JSON-LD `Organization/LocalBusiness`, footer,
  page contact, OG meta) ; propriétaire (recovery flow).
- **Consommateurs** : composer (nav, footer, contact, hero eyebrow), SEO,
  Commercial Readiness (« pas de téléphone trouvé »), i18n.
- **Priorité : P1** (fiabilise l'existant ; corrige headline=`<title>`, nav
  bruitée, « 3924 » comme téléphone).
- **Exemple réel** : ELSAN → {nom: ELSAN, sous-catégorie: groupe
  d'hospitalisation privée, taille: 212 établissements, langue: fr} — tout
  était écrit dans le hero source.

### 3.2 OfferDNA — « ce qu'ils offrent » (le cœur de C8)
- **Responsabilité** : le graphe des **objets métier** réellement observés,
  typés par l'ontologie sectorielle (§ 4), avec leurs relations et médias.
- **Données** : `entities: Entity[]` (modèle générique § 4.1) + `relations`
  (variant→of→product, room→in→hotel, dish→on→menu, doctor→at→clinic) +
  agrégats observés (nb de produits, fourchette de prix, catégories) +
  surfaces d'accès (recherche, filtres, tri — existent-ils sur le source ?).
- **Producteurs** : passes d'extraction dédiées par FAMILLE de signaux (pas
  par secteur) : (a) **données structurées** — JSON-LD/microdata schema.org
  (`Product/Offer/Hotel/Room/Restaurant/Menu/Physician/RealEstateListing`),
  massivement présentes sur les sites réels et aujourd'hui JAMAIS lues — le
  gisement n°1 ; (b) **motifs de cartes répétées** (grilles homogènes + prix
  + image + lien — bruneau : 458 cartes) ; (c) **motifs d'URL** (`/produit/`,
  `/chambres/`, `/annonce/`, `/medecin/`) + sitemap ; (d) **plateforme**
  (Shopify/Woo/Prestashop détectés ⇒ vocabulaire d'objets garanti) ;
  (e) Tier 2 (géométrie des cartes, contenus lazy).
- **Consommateurs** : les futurs **blocs métier** du renderer (grille
  produits réelle, fiches, carte des chambres, annuaire praticiens — C8
  aval), le planner (slots par entités disponibles), Commercial Readiness
  (« votre catalogue a 458 produits, la reconstruction en montre 12 »),
  multi-pages (générer les pages fiches).
- **Priorité : P0 de C8** (c'est F18/M5 — la plus grosse perte prouvée).
- **Exemple réel** : bruneau → Product×458 (nom, prix, image, catégorie×365,
  avis×208), surfaces : recherche + filtres. Aujourd'hui : 0 extrait.

### 3.3 BusinessModelDNA — « comment l'argent circule »
- **Responsabilité** : le(s) mécanisme(s) de revenu et la primitive de
  conversion qui en découle. PAS une industrie — un modèle.
- **Données** : `models: [{kind, weight, evidence}]` avec `kind` ∈
  {transactional (panier/checkout), reservation (dates/disponibilité),
  appointment (créneaux/RDV), lead-gen (devis/formulaire), subscription
  (plans/pricing), catalog-to-contact (catalogue sans panier — Matfer !),
  portfolio-to-contract (book → brief), content/audience, walk-in local
  (carte + horaires + téléphone)}. Multi-modèles pondérés : un hôtel =
  reservation + walk-in (restaurant) + lead-gen (événements).
- **Producteurs** : inférence PAR SIGNAUX depuis OfferDNA + intégrations
  détectées (Stripe/Calendly/booking engines — existant C8 étend) + surfaces
  (panier, date-picker, formulaires typés).
- **Consommateurs** : Intent Engine (prior fort), planner (slots), hiérarchie
  des CTA, Commercial Readiness (« modèle transactionnel détecté mais aucun
  paiement reconnecté » — étend l'existant business-asset detection).
- **Priorité : P1.** C'est lui qui remplace la classification d'industrie
  comme AXE PRINCIPAL (fix F22 par conception : ELSAN = appointment +
  annuaire, peu importe que le mot « SaaS » colle aux features).
- **Exemple réel** : Matfer Bourgeat = catalog-to-contact (catalogue riche,
  pas de checkout) — ni « realestate », ni vitrine générique.

### 3.4 TrustDNA — « pourquoi croire »
- **Responsabilité** : l'inventaire des preuves RÉELLES, avec leur force.
- **Données** : avis {volume, note, source (Google/Trustpilot/interne)},
  certifications/labels, presse, récompenses, chiffres d'autorité (« 20 000+
  businesses » — PayFit, perdu aujourd'hui), garanties, partenaires/logos
  clients, ancienneté, équipe (visages, bios).
- **Producteurs** : extraction (widgets d'avis, JSON-LD `AggregateRating`,
  sections presse/logos), testimonials existants (absorbe).
- **Consommateurs** : composer (sections preuve — jamais fabriquées, désormais
  jamais perdues), hero (trust indicators réels), Intent Engine (une page qui
  martèle la preuve a l'intent « rassurer »).
- **Priorité : P2.**
- **Exemple réel** : PayFit « Join 20,000+ businesses » + 394 signaux d'avis
  → aujourd'hui 0 rendu.

### 3.5 NavigationDNA — « l'architecture d'information réelle »
- **Responsabilité** : l'IA du site source : pages, hiérarchie, libellés
  EXACTS, et le rôle de chaque entrée (navigation d'objets ? institutionnelle ?
  action ?). Corrige la nav bruitée (« AccueilAccueil », « Shop » fabriqué).
- **Données** : arbre de pages {url, label verbatim, rôle, entités portées},
  actions de nav (le CTA header réel), méga-menus (les catégories y vivent —
  bruneau), footer map.
- **Producteurs** : extraction nav/sitemap/crawl (existant, à assainir et
  TYPER) ; croisement avec OfferDNA (une entrée qui pointe vers 200 fiches
  produit est une navigation de catalogue).
- **Consommateurs** : SiteNav (libellés/ordre réels), multi-pages (quelles
  pages générer), UserJourney (le chemin passe par la nav).
- **Priorité : P1** (la nav est la première chose visible — et aujourd'hui
  corrompue sur les sites complexes).

### 3.6 ContentDNA — « le verbatim »
- **Responsabilité** : formaliser l'existant `buildContentModel` (C3) en
  couche à part entière : headings réels par scène, copy, langue(s), ton
  (sobre/lyrique/technique — mesurable : longueur de phrases, vocabulaire),
  densité texte/image. + le filtrage du bruit (F23 : consent walls, cookies,
  éléments légaux ≠ contenu).
- **Producteurs** : extraction de contenu (existant) + filtres anti-bruit.
- **Consommateurs** : composer (déjà), copy des CTA, i18n, ton pour le
  moodboard.
- **Priorité : P1 (assainissement), architecture déjà en place.**

### 3.7 IntentDNA — « pourquoi » (produit par l'Intent Engine, § 5)
- La seule couche de SYNTHÈSE : elle consomme les six autres + la SceneDNA
  et produit l'intention du site, de chaque page et de chaque section.

**Couches écartées (et pourquoi)** : AudienceDNA (B2B/B2C, personas) →
attribut de BusinessModelDNA, pas de producteurs fiables pour plus ;
ConversionDNA → c'est IntentDNA + BusinessModelDNA (redondant) ;
CommerceDNA/BookingDNA/PortfolioDNA/PropertyDNA/HealthcareDNA/Hospitality/
Restaurant/EducationDNA → **ontologies sectorielles de OfferDNA** (P2), pas
des couches ; UserJourneyDNA → conservée mais comme SECTION d'IntentDNA
(`journeys`), car produite par la même synthèse ; CatalogDNA/CollectionDNA →
relations dans OfferDNA.

## 4. Les objets métier

### 4.1 Le modèle générique (unique dans le code)

```
Entity {
  id, type,                 // type issu de l'ontologie du secteur
  name,                     // verbatim
  attributes: {…},          // typés par l'ontologie (prix, surface, spécialité…)
  media: […],               // images/vidéos RÉELLES liées
  url?,                     // la fiche source (SEO : à préserver, C9 pipeline)
  relations: [{kind, target}],
  provenance: par champ (Sourced), confidence par champ
}
```

### 4.2 Les ontologies sectorielles (des données, pas du code)

Chaque ontologie déclare : types d'entités + attributs attendus + signaux
d'extraction (sélecteurs schema.org, motifs d'URL, vocabulaire multilingue)
+ intents typiques + slots de composition cibles + CTA canoniques (i18n).

| Secteur | Entités (relations) | Actions critiques | CTA canoniques (fr) |
|---|---|---|---|
| E-commerce | Product (→Variant, →Collection, →Review), Cart, Promotion | chercher, filtrer, fiche, ajouter au panier, checkout, wishlist, cross-sell | « Ajouter au panier », « Acheter », « Voir le produit » |
| Immobilier | Property/Listing (→Agent, →Visit), Estimation | rechercher (géo+filtres), fiche bien, visiter, estimer, contacter l'agent | « Voir le bien », « Estimer mon bien », « Prendre rendez-vous » |
| Hôtellerie | Room (→RatePlan, →Availability), Amenity, Offer, Restaurant/Spa | choisir dates, voir chambres, réserver, découvrir services | « Réserver », « Voir les chambres », « Vérifier les disponibilités » |
| Restauration | Menu (→Dish (→prix)), Service (midi/soir), Reservation | consulter la carte, réserver, commander, venir (horaires/adresse) | « Réserver une table », « Voir la carte », « Commander » |
| Santé | Practitioner (→Specialty, →Location), Service/Care, Appointment | trouver un praticien/établissement, prendre RDV, urgences | « Prendre rendez-vous », « Trouver un praticien » |
| Juridique | PracticeArea, Lawyer (→PracticeArea), CaseStudy/Publication | comprendre l'expertise, évaluer l'équipe, consulter, appeler | « Prendre contact », « Nos expertises » |
| SaaS | Feature, Plan (→prix), Integration, UseCase | comprendre la valeur, comparer les plans, essayer, demander une démo | « Essayer gratuitement », « Demander une démo », « Voir les tarifs » |
| Industrie/B2B | Product/Machine (→SpecSheet, →Category), Distributor | parcourir le catalogue, télécharger la doc, demander un devis | « Demander un devis », « Télécharger la fiche technique » |
| Éducation | Program/Course (→Session, →prix), Campus, Admission | découvrir les programmes, candidater, JPO | « Candidater », « Découvrir le programme » |
| Portfolio/agence | Project (→Client, →Discipline), Service | parcourir le book, comprendre l'approche, briefer | « Voir le projet », « Discuter de votre projet » |
| Fitness/bien-être | Class/Service (→Schedule, →Coach), Membership | voir le planning, essayer, s'abonner | « Réserver un cours », « Essai gratuit » |
| Automobile | Vehicle (→Trim, →prix), Service (entretien), TestDrive | parcourir le stock, configurer, essayer, entretenir | « Voir le véhicule », « Réserver un essai » |

Extensible SANS code : ajouter un secteur = ajouter une ontologie.

### 4.3 Classification refondée (fix F22 par conception)

L'industrie cesse d'être détectée par mots-clés de headings. Elle devient une
**inférence descendante** : entités observées + modèle économique + surfaces
⇒ secteur/sous-catégorie. 458 cartes-prix ⇒ e-commerce ; 708 « chambre » +
moteur de réservation ⇒ hôtel ; annuaire de praticiens + RDV ⇒ santé.
L'industrie actuelle (mots-clés) devient un simple candidat `inferred` de
faible confiance dans le resolver — jamais le juge.

## 5. L'Intent Engine

### 5.1 Taxonomie des intents visiteur (page-level)

`transact-buy · reserve-dates · book-appointment · request-quote ·
browse-catalog · evaluate-portfolio · compare-options · read-learn ·
contact-team · locate-visit · hire-apply · get-support`

**Multi-intent pondéré, jamais une classe unique** : une home d'hôtel =
reserve-dates (0.7) + browse-rooms (0.2) + locate-visit (0.1). Signaux :
BusinessModelDNA (prior), CTA réels du source (verbes, multilingue), surfaces
(date-picker ⇒ reserve), NavigationDNA (l'entrée dominante), position des
preuves.

### 5.2 Intent de SECTION (« pourquoi cette section existe »)

`convert (agir maintenant) · reassure (préduire le risque) · demonstrate
(prouver la compétence) · present-offer (montrer les objets) · orient
(diriger vers le bon parcours) · inform (contexte pratique) · brand
(faire ressentir l'identité)`

Produit par croisement scène mesurée (SceneDNA : CTA présents, densité,
médias) × contenu (ContentDNA : la section parle d'avis ? d'objets ? d'eux ?)
× position dans la page. Chaque scène du source reçoit `{intent, confidence}` ;
chaque bloc composé DÉCLARE l'intent qu'il sert.

### 5.3 Comment l'intent pilote la composition (et jamais l'inverse)

1. **Le plan** : l'ordre des sections suit la hiérarchie d'intents du source
   (mesurée) puis du modèle (les parcours critiques d'abord), plus le
   storytelling générique actuel en simple fallback.
2. **La sélection de blocs** : chaque slot demande « un bloc qui sert
   convert/present-offer pour des entités Room » — le catalogue de blocs
   (C9, réindexation) répond par capacité, pas par nom de secteur.
3. **La hiérarchie des CTA** : l'action primaire de CHAQUE section vient des
   CTA canoniques de l'ontologie × l'intent de la section (fini le
   « Contact » universel — « Réserver » sur l'hôtel, partout où l'intent est
   convert).
4. **Les parcours** (`IntentDNA.journeys`) : chaînes ordonnées d'étapes
   {intent, surface, page} à PRÉSERVER — le Commercial Readiness Engine
   (roadmap) vérifie qu'aucune étape n'a disparu (« le source permettait de
   filtrer 458 produits ; la reconstruction ne le permet plus » = warning
   bloquant avant publication).

### 5.4 Injection dans l'existant (aucune refonte)

- `businessLayer` + `intentLayer` = nouveaux producteurs `CandidateLayer`
  (dna/candidates.ts) — mêmes rangs, même resolver, mêmes traces.
- `SceneSpecSources.business` / `.intent` = nouvelles entrées nommées
  (l'interface D7 est prête ; le Composition Engine reste aveugle).
- Le planner reçoit le plan d'intents comme il reçoit `sceneOrderMeasured`.
- PipelineTrace : chaque décision métier tracée (`business.entity.*`,
  `intent.section.*`) — « pourquoi ce CTA ? » restera répondable.

## 6. Producteurs ↔ consommateurs (matrice)

| Couche | Producteurs (naissance) | Consommateurs (usage) |
|---|---|---|
| IdentityDNA | JSON-LD Organization, footer/contact, OG, owner | nav/footer/contact/hero, SEO, Readiness, i18n |
| OfferDNA | JSON-LD objets, cartes répétées, URL/sitemap, plateforme, Tier 2 | blocs métier, planner, pages fiches, Readiness |
| BusinessModelDNA | inférence signaux (Offer + intégrations + surfaces) | Intent Engine, CTA, slots, Readiness |
| TrustDNA | widgets avis, AggregateRating, sections preuve | sections preuve, hero trust, Intent |
| NavigationDNA | nav/sitemap/crawl typés + croisement Offer | SiteNav, multi-pages, journeys |
| ContentDNA | extraction contenu + anti-bruit (F23) | composer, CTA copy, ton |
| IntentDNA | Intent Engine (synthèse des 6 + SceneDNA) | plan, sélection de blocs, CTA, journeys, Readiness |

Ordre de production : Identity/Content/Navigation/Trust/Offer (parallèles,
même passe d'extraction) → BusinessModel → Intent → composition.

## 7. Preuve par les 9 sites de l'audit (ce que C8 aurait compris)

| Site | OfferDNA (entités) | Modèle | Intent primaire | Ce qui change à la reconstruction |
|---|---|---|---|---|
| Bruneau | Product×458, Collection×365, Review×208 | transactional | browse-catalog + transact-buy | grille produits réelle + fiches + « Ajouter au panier » |
| Guy Hoquet | Listing (recherche), Agency locale, Estimation | lead-gen + search | request-quote (estimer) + browse | recherche de biens + « Estimer mon bien » en action primaire |
| Wilmotte | Project×N (7 images réelles), Studio | portfolio-to-contract | evaluate-portfolio | book de projets réels, plus jamais 5× « Why choose us » |
| Chartier | Menu, Dish (prix), 2 services | walk-in + reservation | locate-visit + reserve | carte réelle + horaires + « Réserver une table » |
| Lutetia | Room×N, RatePlan, Spa/Restaurant | reservation | reserve-dates | chambres + « Réserver » (306 signaux booking enfin servis) |
| August Debouzy | PracticeArea×45, Lawyer×N, Publication | expertise-to-contact | evaluate-expertise | expertises réelles + équipe (jamais « Family law ») |
| PayFit | Feature, Plan, Integration, Proof (20 000+) | subscription | compare + try | pricing + « Essayer » + preuve chiffrée rendue |
| Matfer | Product/SpecSheet, Category | catalog-to-contact | browse-catalog + request-quote | catalogue B2B + « Demander un devis » |
| ELSAN | Facility×212, Practitioner, Specialty | appointment + directory | book-appointment + locate | annuaire + « Prendre rendez-vous » (fini « Start free ») |

## 8. Risques & garde-fous

| Risque | Garde-fou |
|---|---|
| Ontologie infinie / sur-modélisation | P6 : pas d'entité sans consommateur de composition ; revue par secteur |
| Fabrication déguisée (attributs « probables ») | P3/P4 : champ absent + recovery flow ; jamais de valeur plausible |
| Retour de la logique métier dans les moteurs | P1 : revue systématique — tout `if (industry===…)` hors ontologies est un défaut |
| Extraction JS-heavy sans navigateur | Tier 2 en prod (P0/F20 branché) ; JSON-LD souvent server-rendered même sur sites JS |
| Explosion du coût d'extraction | passes par famille de signaux, budget par site, JSON-LD d'abord (quasi gratuit) |
| Blocs métier inexistants côté renderer | phasage : chaque tranche C8 livre l'entité ET son bloc consommateur (D8 : gain visible par sous-lot, harnais avant/après) |

## 9. Phasage indicatif (après validation de cette spec)

- **C8a — Fondations** : types Sourced des 7 couches + ontologie générique +
  lecteur JSON-LD/microdata (le gisement gratuit) + trace. Gain visible :
  Identity/Trust réels (headline, téléphone, avis) sur le harnais.
- **C8b — E-commerce d'abord (F18)** : ontologie e-commerce + extraction
  produits/collections/prix + blocs ProductGrid/ProductCard réels + CTA
  métier. Harnais : bruneau avant/après.
- **C8c — BusinessModel + Intent Engine v1** : modèles pondérés, intents de
  page, CTA hierarchy. Harnais : ELSAN (« Prendre rendez-vous »), Lutetia
  (« Réserver »).
- **C8d — Reservation/appointment** (hôtel, restaurant, santé) : ontologies +
  blocs booking-aware.
- **C8e — Intents de section + journeys + Readiness warnings.**
- Chaque sous-lot : D8 (preuve avant/après sur sites réels), registre, OS.
