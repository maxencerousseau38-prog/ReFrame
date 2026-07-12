# REASONING.md — Comment ReFrame pense

> **Le document de référence du raisonnement du moteur.** Pas le pipeline —
> le raisonnement. Tout module, présent ou futur, répond à la question
> « à quelle étape du raisonnement j'interviens ? », jamais « à quel fichier
> j'appartiens ? ». Statut : fondateur (2026-07-10), modifié rarement, par
> décision actée au registre. Compagnons : `docs/C8_BUSINESSDNA_SPEC.md`
> (les couches), `docs/ARCHITECTURE_DECISIONS.md` (D1-D9),
> `ai/PIPELINE.md` (la carte fichiers — la matérialisation, pas la pensée).

---

## 0. Le principe zéro : de la donnée à la compréhension

Le moteur ne « fait » pas de l'extraction. Il produit de la **compréhension**.

- **Donnée** : « 458 cartes produit, 27 prix, 126 "ajouter au panier" ».
- **Compréhension** : « Cette entreprise vit de la vente de fournitures de
  bureau à travers un catalogue structuré nécessitant recherche, filtres,
  comparaison, panier et paiement. »

La différence est opérationnelle, pas rhétorique. Une compréhension est :

1. **une affirmation falsifiable** (on peut la vérifier sur le site source) ;
2. **portée par des preuves** (`Sourced` : provenance + confiance par champ) ;
3. **lourde de conséquences** pour l'aval (elle contraint la composition).

Une donnée n'a pas de conséquences ; une compréhension en a. Chaque étape du
raisonnement transforme les sorties de l'étape précédente en jugements de ce
type. Un module qui produit des listes sans conséquences n'est pas un module
de compréhension — c'est un capteur (il en faut, mais ils vivent à l'étape R1).

## 1. Le raisonnement en quatre actes, douze étapes

```
ACTE I — OBSERVER          R1  il regarde (faits mesurés, zéro jugement)
ACTE II — COMPRENDRE       R2  qui est cette entreprise ?
                           R3  comment se présente-t-elle ? (langage visuel)
                           R4  que vend-elle réellement ? (objets)
                           R5  comment gagne-t-elle de l'argent ? (modèle)
                           R6  que PERMET son site ? (capacités)
                           R7  qui veut quoi, par quel chemin ? (buts+parcours)
ACTE III — JUGER           R8  qu'est-ce qui doit absolument survivre ?
                           R9  qu'est-ce qui peut être amélioré ?
ACTE IV — AGIR & PROUVER   R10 composer une nouvelle expérience (R0)
                           R11 vérifier : rien d'essentiel n'a disparu
                           R12 vérifier : le résultat est commercialement crédible
```

L'ordre est **causal et irréversible dans un même cycle** : une étape ne
consomme que les jugements des étapes antérieures. La composition (R10) ne
redéfinit jamais la compréhension (R2-R7) ; la vérification (R11-R12) peut
uniquement déclencher un NOUVEAU cycle partiel (re-juger, re-composer),
jamais réécrire les faits.

### ACTE I — OBSERVER

**R1 — Il regarde.**
*Question* : « que puis-je constater, sans rien interpréter ? »
*Produit* : des FAITS sourcés — DOM, styles calculés, géométrie des scènes,
captures multi-viewports, signaux bruts (JSON-LD, motifs d'URL, plateforme,
intégrations), texte verbatim, médias.
*Interdit* : tout jugement. R1 ne « détecte » pas un e-commerce ; il compte
des cartes et lit des balises.
*Dégradé* : site injoignable / JS-hostile → faits partiels, marqués comme
tels (`confidence`, notices) — jamais complétés par du plausible.
*Aujourd'hui* : capture C1, snapshot, measure C4/C6, passes d'extraction,
platform.ts, scans. *C8* : lecteur JSON-LD étendu, détection de surfaces.

### ACTE II — COMPRENDRE

Chaque étape produit UNE phrase de compréhension (falsifiable, sourcée) +
sa structure de données. Si la phrase ne peut pas être écrite, l'étape
déclare l'inconnu (D9) — elle n'invente jamais la suite.

**R2 — Qui est cette entreprise ?** → IdentityDNA
*Phrase type* : « ELSAN est un groupe d'hospitalisation privée français de
212 établissements, s'adressant aux patients en français. »
*Conséquences* : ton, langue, échelle, gamme, contacts réels partout en aval.

**R3 — Comment se présente-t-elle ?** → BrandDNA (mesurée) + SceneDNA
*Phrase type* : « Elle se présente en bleu institutionnel, typographie sobre,
héros pleine largeur à 90 vh, scènes aérées alternées. »
*Conséquences* : le « c'est exactement mon site » — palette, fonts, rythme,
composition mesurés qui priment tout préset (I1).
*Aujourd'hui* : C4/C5/C6 + Reference Learning + Composition Engine C7 (déjà
construits — ce document les RESITUE dans le raisonnement, il ne les change pas).

**R4 — Que vend-elle réellement ?** → OfferDNA
*Phrase type* : « Bruneau vend des fournitures et du mobilier de bureau —
un catalogue de centaines de produits à prix affichés, organisé en
collections. » *Conséquences* : les entités existent, la reconstruction doit
les montrer ; leurs fiches/URLs sont un actif SEO à préserver.

**R5 — Comment gagne-t-elle de l'argent ?** → BusinessModelDNA
*Phrase type* : « Elle vit de la vente en ligne transactionnelle (panier,
checkout), complétée de la génération de comptes B2B. » — modèles PONDÉRÉS.
*Conséquences* : la primitive de conversion à protéger ; le prior des intents.

**R6 — Que permet son site ?** → CapabilityDNA
*Phrase type* : « On peut y chercher, filtrer, comparer, ajouter au panier,
payer, suivre sa commande. » *Conséquences* : la liste de ce qui doit
survivre, avec pour chacune son niveau de préservation possible
(native / reconnected / delegated / lost). Un CTA n'existera que si sa
capacité vit (jamais de bouton factice).

**R7 — Qui veut quoi, par quel chemin ?** → IntentDNA (chaîne des buts)
*Phrase type* : « Le propriétaire veut vendre ; le visiteur veut trouver le
bon produit au bon prix ; leur rencontre passe par chercher → filtrer →
fiche → panier → payer. » *Conséquences* : Business Goal → User Goal →
Objects → Capabilities → Journey — l'ossature de toute la composition.

### ACTE III — JUGER

**R8 — Qu'est-ce qui doit absolument survivre ?**
*Question* : « quelles pertes seraient commercialement inacceptables ? »
*Produit* : le contrat de préservation — capacités critiques (avec leur mode
de survie), contenus irremplaçables (témoignages réels, preuves chiffrées,
fiches), parcours principaux, actifs SEO (URLs, métadonnées), intégrations
vitales. *C'est le gate D9* : tant que R2-R7 n'ont ni réponses ni inconnus
déclarés, R10 n'a pas le droit de commencer.

**R9 — Qu'est-ce qui peut être amélioré ?**
*Question* : « où le site actuel échoue-t-il, et que ferait un designer
senior du secteur ? » *Produit* : les jugements d'amélioration — hiérarchie
faible, confiance enterrée, CTA noyé, parcours à raccourcir, dette visuelle —
nourris par les références premium (Reference Learning) et les scores
qualité. *Interdit* : « améliorer » en changeant le message, le
positionnement ou l'offre (règle d'or). C'est ici — et seulement ici — que
vit l'ambition « dramatically better ».

### ACTE IV — AGIR & PROUVER

**R10 — Composer une nouvelle expérience.** (R0)
*Question* : « quelle est la meilleure mise en scène de CE parcours, avec
CES objets, CES capacités, dans CE langage visuel ? »
*Produit* : le plan d'expérience → puis, en conséquence seulement, les
sections/blocs/props (SiteSchema). Le Composition Engine reste aveugle à
l'origine des décisions (D7) : il reçoit des jugements résolus par rang de
preuve (measured > user > inferred > curated > preset).
*Aujourd'hui* : DNA résolue, compose, SceneSpec, SceneShell, renderer
exécuteur — construits en C2-C7.

**R11 — Vérifier que rien d'essentiel n'a disparu.**
*Question* : « le contrat de préservation (R8) est-il honoré ? »
*Produit* : la matrice capacité×préservation vérifiée, les pertes listées.
Une perte critique = warning bloquant avant publication — jamais silencieuse.

**R12 — Vérifier que le résultat est commercialement crédible.**
*Question* : « un client paierait-il pour ça ? le propriétaire dirait-il
"c'est exactement mon site, dramatiquement meilleur" ? »
*Produit* : qualité perçue (D8 : sites réels, avant/après), plancher qualité
(responsive/a11y/perf), ET **l'explication** : chaque décision de composition
justifiée depuis la compréhension (PipelineTrace de bout en bout —
l'exigence de clôture C8).

## 2. Les lois du raisonnement (transversales)

- **L1 — Causalité stricte.** Une étape ne lit que les jugements des étapes
  antérieures. Aucun module ne court-circuite (un skin qui « détecte » un
  secteur, un extracteur qui « choisit » un bloc = défauts d'architecture).
- **L2 — Un jugement = affirmation + preuves + confiance.** Tout est
  `Sourced` ; les rangs de preuve arbitrent (I1/G1-G4/A2) ; les conflits
  sont archivés, jamais perdus.
- **L3 — L'inconnu se déclare.** Chaque étape a un mode dégradé honnête :
  répondre, ou dire « je ne sais pas » (tracé, montré, demandé au
  propriétaire). Inventer est le seul échec inacceptable.
- **L4 — Tout se justifie.** De R1 à R12, la trace répond à « pourquoi ? »
  — pourquoi ce CTA, cette hauteur de héros, cet ordre de sections. Un
  moteur qui ne peut pas s'expliquer ne peut pas être corrigé.
- **L5 — Le raisonnement est le référentiel.** Les modules appartiennent à
  des étapes R, pas à des dossiers. Toute nouvelle capacité déclare son
  étape AVANT d'être codée ; une capacité à cheval sur deux étapes doit
  être découpée.
- **L6 — La preuve est externe.** Le succès d'une étape se mesure sur des
  sites réels (harnais, D8), jamais sur ses propres structures internes.

## 3. Référentiel : étapes ↔ moteurs (existants et à venir)

| Étape | Moteurs/modules actuels | Chantiers à venir |
|---|---|---|
| R1 Observer | capture C1, snapshot, measure/tokens C4, measure/scenes C6, passes d'extraction, platform, intégrations, scans harnais | C8a : JSON-LD étendu, surfaces ; C11 : Tier 2 prod |
| R2 Identité | brandName/logo/contact (partiel) | C8a IdentityDNA |
| R3 Langage visuel | C4/C5 tokens, C6 SceneDNA, Reference Learning D5, similarity | C9 library par signature ; C10 skins |
| R4 Offre | products/collection/serviceItems extraits (consommateur manquant) | C8b OfferDNA + blocs |
| R5 Modèle | business.ts (préset, à absorber) | C8c BusinessModelDNA |
| R6 Capacités | DetectedIntegration (embryon `reconnected`) | C8c CapabilityDNA |
| R7 Buts+parcours | — | C8d Intent Engine |
| R8 Indispensable | no-fabrication + hasFaq (embryons du contrat) | C8c/C8e contrat de préservation (gate D9) |
| R9 Améliorable | quality-gate 8 dims, moodboard/AD, richDna premium | C8d jugements d'amélioration sectoriels |
| R10 Composer | resolver C2, DNA, composer, compose/scene-spec C7, renderer | C8b-d consommateurs métier ; C9/C10 |
| R11 Préservation | — (P0 a supprimé les pertes silencieuses fabriquées) | C8e Readiness v1 |
| R12 Crédibilité | harnais c7e-audit (D8), quality floor | C8e explication ; C11 Quality Gate |

## 4. Bruneau, raconté par le raisonnement (l'exemple canonique)

R1 : 383 Ko de HTML ; 8 produits en JSON-LD/cartes {nom, prix, image, url} ;
365 signaux de catégories ; un panier ; GTM ; plateforme custom ; nav
« Gammes mobilier / Promos / Cabines acoustiques / Shop ». → R2 : « Bruneau
France, vépéciste B2B de fournitures et mobilier de bureau, français. » →
R3 : « rouge #e43117 sur blanc, densité commerciale, héros bandeau. » →
R4 : « vit d'un catalogue de centaines de produits à prix affichés,
organisés en gammes. » → R5 : « vente en ligne transactionnelle (panier +
checkout), poids ~0.9. » → R6 : « chercher, filtrer, ajouter au panier,
payer : panier/checkout = reconnected ou delegated ; catalogue = native. » →
R7 : « le visiteur vient trouver et acheter une fourniture au meilleur
prix : chercher → gamme → fiche → panier. » → R8 : « inacceptable de perdre :
le catalogue navigable, les prix, l'accès au panier, les URLs de fiches. » →
R9 : « améliorable : hiérarchie du héros, confiance (208 avis invisibles),
lisibilité des gammes. » → R10 : compose l'expérience d'achat (catalogue
réel navigable, CTA « Ajouter au panier » seulement si la capacité vit,
gammes en nav) dans le langage visuel mesuré. → R11 : « panier delegated
vérifié ; 0 capacité critique perdue. » → R12 : « avant/après harnais +
trace : chaque section justifiée par R4-R9. »

C'est exactement la reconstruction que C8 doit rendre possible — et chaque
sous-lot (a→e) allume les étapes dans l'ordre du raisonnement.
