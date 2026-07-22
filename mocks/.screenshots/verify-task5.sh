#!/bin/bash
set -euo pipefail
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
python3 -m http.server 8777 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
sleep 2

echo "=== hero-h1 position verify ==="
cd .screenshots
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node verify-hero-h1.cjs

echo ""
echo "=== image render check over HTTP ==="
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node task5-imgcheck.cjs
