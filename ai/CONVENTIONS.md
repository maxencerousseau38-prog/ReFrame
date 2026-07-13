# Conventions de développement & gouvernance de la mémoire

> Propriétaire : Claude + utilisateur (les règles évoluent par décision actée).
> Lu par : chaque session, avant le premier commit. Une info = un seul endroit.

## Invariants non négociables (charte V2)

- **I1 monotonie** : une valeur `measured` n'est jamais écrasée ; `refine()` est
  fill-only ; la précision tardive = nouveau champ, jamais réécriture.
- **G1-G4** : slots jamais réécrits · précédence par rangs (measured>user>inferred>curated>preset),
  jamais par ordre d'appel · une provenance par valeur · aucun candidat perdu (rejected+trace).
- **A2** : `measured` avec confiance < 0.4 rétrogradé sous `curated` (par champ).
- **No-fabrication** : section sans données réelles = omise (testimonials/stats/FAQ).
- **Compat V5** : tout ajout derrière fallback/flag ; sans tokens/mesures → octet-identique.

## Patrons établis (réutiliser, ne pas réinventer)

- **Var + fallback V5** (A1-A3) : `var(--rf-x, <valeur figée d'origine>)` ;
  plancher `max(var, floor)` quand seul « plus généreux » est non-régressif (A1).
- **Hiérarchie proportionnelle** (A2) : largeurs internes = ratio du container
  (`rfContainerRatio`), jamais de nouvelles constantes.
- **Migration mécanique** : script python déterministe sur `blocks/index.tsx`,
  cas manuels listés puis traités un à un ; jamais de rewrite.
- **Couches du resolver** : toute nouvelle source de décisions = un producteur
  `CandidateLayer` dans `dna/candidates.ts` (+ origin précis), jamais un merge ad hoc.
- **Références premium** : uniquement des décisions mesurables (enums/nombres)
  dans `reference-library.ts` — jamais de HTML/JSX/CSS copié (doctrine + droit d'auteur).

## Protocole de sous-lot (obligatoire)

0. **Économie de session** : travailler en SPRINTS cohérents — un seul audit
   d'orientation en début de sprint, puis enchaîner les sous-lots ; le budget
   va au code, pas à la redécouverte (c'est le rôle de l'OS `ai/`).

1. Graphify d'abord (`query/explain/path`) ; lecture ciblée ensuite (jamais le dépôt entier).
2. Vérif de non-régression rapide si le doute existe (`npm test` baseline).
3. Modifs minimales/additives ; petits commits, un objectif par commit.
4. Avant commit : `npx tsc --noEmit` propre + `npm test` vert (baseline dans STATE) ;
   si `blocks/`/`globals.css` touchés → zpreview ≥3 industries × 320/390/768/1440, overflow=0.
5. Preuve visuelle avant/après (multi-sites, valeurs RÉELLEMENT émises par runPipeline)
   quand le rendu change — envoyée à l'utilisateur avant validation.
5bis. **D8 — critère principal : la qualité perçue.** Un sous-lot n'est réussi
   que s'il démontre une amélioration perceptible sur plusieurs SITES RÉELS
   (harnais `scripts/c7e-audit.mjs`, avant/après) — tests verts et fallbacks
   corrects ne suffisent plus.
6. Message de commit : quoi/pourquoi/preuves/exclusions justifiées + trailers Claude.
7. Hors périmètre découvert → `docs/ARCHITECTURE_DECISIONS.md` (finding), pas de fix sauvage.
8. **Fin de session/sous-lot : mettre à jour `ai/STATE.md` (état+prochaine action),
   appendre 3-5 lignes à `ai/SESSION_LOG.md`, cocher `ai/ROADMAP.md`** — AVANT le dernier push.

## Gouvernance des documents (une responsabilité chacun)

| Document | Rôle unique | MAJ quand | Format |
|---|---|---|---|
| `ai/STATE.md` | reprise <1 min : état, prochaine action, pièges env | chaque fin de session | ~1 page |
| `ai/ROADMAP.md` | chantiers/axes + statuts | à chaque GO/DONE | tableau |
| `ai/PIPELINE.md` | carte étape→fichier→I/O | quand un contrat/fichier change | arbre |
| `ai/MODULES/*.md` | fiche par module (responsabilité/IO/deps/invariants/tests/dette) | quand le module change substantiellement | fiche ≤60 l. |
| `ai/CONVENTIONS.md` | règles + protocole + cette table | par décision actée | listes |
| `ai/SESSION_LOG.md` | journal append-only (fait/décidé/suivant) | chaque session | 3-5 l./entrée |
| `docs/ARCHITECTURE_DECISIONS.md` | registre décisions/findings (F/D/E/A) | à chaque décision/finding | tableaux |
| `docs/REASONING.md` | **modèle mental fondateur** : les 12 étapes R1-R12 du raisonnement ; tout module déclare son étape (L5) | rarement, par décision actée | fondateur |
| `docs/*_SPEC.md`, `docs/C7_PREPARATION.md`, `docs/C8_*` | specs de chantier (contrats d'implémentation) | avant le chantier | spec |
| `CLAUDE.md` | doctrine produit + pointeurs OS (toujours chargé) | rarement | court |
| `DESIGN.md` | tokens visuels canoniques des SITES générés | décision design | référence |
| `docs/DESIGN_SYSTEM.md` | **design system du CHROME de l'app** (tokens radius/motion/ombre/spacing/couleur, règles composants) — gelé UX5 | rarement, par décision actée | référence |
| `README.md` | humains (setup, graphify CLI) | outillage | guide |

Interdits : dupliquer une info entre ces fichiers ; créer un doc hors table sans l'y ajouter.

## Localisation du code

`graphify query "<question>"` → `graphify explain "<symbole>"` → lecture des seules
lignes utiles. Le graphe est reconstruit automatiquement post-commit (hook réinstallé
par `ai/bootstrap.sh` après un reset de conteneur).
