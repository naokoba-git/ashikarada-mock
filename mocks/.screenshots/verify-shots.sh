#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules
echo "=== Running Playwright screenshots for all 10 pages × 2 viewports ==="
node _shot.cjs
echo ""
echo "=== Generated files ==="
ls -la *.png 2>/dev/null | awk '{printf "%-40s %s\n",$NF,$5}'
