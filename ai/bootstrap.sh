#!/usr/bin/env bash
# ReFrame — réamorçage d'un conteneur recréé (node_modules/.claude/hooks/Chromium
# disparaissent à chaque reset d'environnement ; la mémoire est dans Git).
# Usage : bash ai/bootstrap.sh
set -uo pipefail
cd "$(dirname "$0")/.."

echo "== node_modules =="
[ -f node_modules/next/package.json ] || npm install

echo "== graphify =="
export PATH="$PATH:/root/.local/bin"
if ! command -v graphify >/dev/null 2>&1; then
  command -v uv >/dev/null 2>&1 && uv tool install graphifyy >/dev/null 2>&1 || true
fi
if command -v graphify >/dev/null 2>&1; then
  graphify install --project >/dev/null 2>&1 || true
  graphify hook install >/dev/null 2>&1 || true
  [ -f graphify-out/graph.json ] || graphify src >/dev/null 2>&1 || true
  echo "graphify: $(graphify --version 2>/dev/null || echo indisponible)"
else
  echo "graphify indisponible (uv absent ?) — continuer sans"
fi

echo "== chromium =="
node -e "
const { chromium } = require('playwright');
(async () => {
  try { const b = await chromium.launch({args:['--no-sandbox']}); await b.close(); console.log('chromium: standard OK'); }
  catch { try { const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']}); await b.close(); console.log('chromium: fallback /opt/pw-browsers OK'); }
  catch { console.log('chromium: INDISPONIBLE (Tier 2 dégradera en Tier 1)'); } }
})();" 2>/dev/null

echo "== sanity =="
npx tsc --noEmit >/dev/null 2>&1 && echo "tsc: OK" || echo "tsc: ERREURS — voir npx tsc --noEmit"
echo "Bootstrap terminé. Point d'entrée : ai/STATE.md"
