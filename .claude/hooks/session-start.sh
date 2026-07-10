#!/usr/bin/env bash
# ReFrame — SessionStart hook (TRACKÉ : survit aux resets de conteneur).
# Injecte l'état courant + les règles de session dans le contexte de Claude.
cd "$(dirname "$0")/../.." || exit 0

echo "=== REFRAME SESSION OS ==="
echo "Point d'entrée UNIQUE : ai/STATE.md (injecté ci-dessous). Localisation de code :"
echo "graphify query/explain/path AVANT toute lecture. Protocole : ai/CONVENTIONS.md."
echo "CLÔTURE OBLIGATOIRE avant le dernier push : mettre à jour ai/STATE.md,"
echo "appendre ai/SESSION_LOG.md, cocher ai/ROADMAP.md."
echo ""
echo "Doctrine produit (CLAUDE.md, toujours chargé) : skills ui-ux-pro-max /"
echo "frontend-design / shadcn-ui / web-design-guidelines / reframe-redesign"
echo "avant toute génération, redesign ou revue de qualité. Jamais de markup copié."
echo ""
if [ -f ai/STATE.md ]; then
  echo "--- ai/STATE.md ---"
  cat ai/STATE.md
fi
if [ ! -f node_modules/next/package.json ] || ! command -v graphify >/dev/null 2>&1; then
  echo ""
  echo "⚠ ENVIRONNEMENT INCOMPLET (conteneur recréé ?) → exécuter : bash ai/bootstrap.sh"
fi
