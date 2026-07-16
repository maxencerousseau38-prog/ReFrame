# Intake Pipeline — checkpoints (cerveau visuel)

> Protocole permanent pour chaque composant 21st.dev reçu. UNE étape à la fois
> (5-10 min), un résultat produit + commit à chaque checkpoint. Si une session
> meurt/bloque : lire ce fichier, reprendre à la première étape non cochée.
> Ne JAMAIS refaire une étape cochée. Référentiel des idées : `src/components/
> design-system/PATTERNS.md` · décisions par intake : `.../README.md`.

## Les 6 étapes (checkpoints)

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
- Dernier intake terminé : **#002** (Zoom Parallax → `ScrollScaleReveal`), 6/6 ✅.
- Dernier checkpoint committé : `10194e2` (Visual Brain ledger, 13 idées).
- Ledger : 6 🟢 réalisées · 3 🟡 patterns candidats · 1 🔵 queued génération · 3 🔴 anti-patterns.

## Journal des intakes (append-only)

| Intake | Composant | Étapes | Commit final |
|---|---|---|---|
| #001 | Ethereal Beams Hero (three.js) | 6/6 ✅ | `eec73c8` |
| #002 | Zoom Parallax (framer-motion+Lenis) | 6/6 ✅ | `50031b8` |
