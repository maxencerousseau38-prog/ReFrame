# Intake Pipeline — checkpoints (cerveau visuel)

> **MODE V2 — Continuous Product Evolution (2026-07-14).** La bibliothèque n'est
> plus l'objectif : c'est un moyen. Après CHAQUE intake, le PRODUIT doit être
> visiblement meilleur (avant/après exigé). Deux phases s'ajoutent aux 6 étapes :
> **7. Propagation** — chaque brique nouvelle/améliorée est immédiatement
> utilisée dans les surfaces où elle améliore réellement le produit (zéro
> composant orphelin) ; **8. Moteur IA** — les idées « génération » sont mises
> en file 🔵 (câblage réel BLOQUÉ par lib/library morte + blocks god-file,
> roadmap P1/P2 — ne jamais prétendre le contraire, U0).
> Garde-fou : la propagation ne force JAMAIS une brique là où elle n'apporte
> rien (« 5 composants utilisés partout > 300 jamais utilisés »).

> Protocole permanent pour chaque composant 21st.dev reçu. UNE étape à la fois
> (5-10 min), un résultat produit + commit à chaque checkpoint. Si une session
> meurt/bloque : lire ce fichier, reprendre à la première étape non cochée.
> Ne JAMAIS refaire une étape cochée. Référentiel des idées : `src/components/
> design-system/PATTERNS.md` · décisions par intake : `.../README.md`.

## Les 6 étapes (checkpoints) + 7 Propagation + 8 Moteur (V2)

| # | Étape | Sortie attendue (committée) |
|---|---|---|
| 1 | **Analyser** le composant (archi, deps, responsive, animations, perf, a11y) | note d'analyse (dans la réponse ; rien au repo si trivial) |
| 2 | **Extraire les idées** (toutes — jamais penser "Hero") | lignes candidates pour PATTERNS.md |
| 3 | **Chercher les doublons** (primitives, sections, ledger, anciens intakes) | verdict REUSE/MERGE/REPLACE/NEW/REJECT par idée |
| 4 | **Créer** les nouvelles primitives (une par une si plusieurs) | fichier(s) `ui/*` + tsc/tests verts |
| 5 | **Intégrer** (exports, vitrine /design-system) | registry + gallery à jour |
| 6 | **Documenter** (PATTERNS.md + README intake + SESSION_LOG) + commit final | ledger à jour, push |

Règles : doctrine gate (monochrome, glass 20-28px, motion sobre + reduced-motion,
zéro fabrication) appliquée à l'étape 3 · preuve LOCALE tant que l'infra Vercel
n'est pas nettoyée (le dire explicitement) · idées « génération IA » → 🔵 QUEUED
dans PATTERNS.md (moteur bloqué par lib/library morte + blocks/index.tsx, P1/P2).

## État courant

- **Intake en cours : AUCUN** — en attente du prochain composant.
- Dernier intake terminé : **#003** (Sign-In Page → `PasswordInput`/`Checkbox`/`LabeledDivider` + upgrade `Input` verre), 6/6 ✅.
- Ledger : 11 🟢 réalisées · 5 🟡 patterns candidats · 2 🔵 queued génération · 5 🔴 anti-patterns.
- Rappel adoption : `/login`+`/reset` consomment ces primitives à leur redesign V3 (pattern AuthSplit, sur GO).

## Journal des intakes (append-only)

| Intake | Composant | Étapes | Commit final |
|---|---|---|---|
| #001 | Ethereal Beams Hero (three.js) | 6/6 ✅ | `eec73c8` |
| #002 | Zoom Parallax (framer-motion+Lenis) | 6/6 ✅ | `50031b8` |
| #003 | Sign-In Page (lucide+violet) | 6/6 ✅ | (ce commit) |
