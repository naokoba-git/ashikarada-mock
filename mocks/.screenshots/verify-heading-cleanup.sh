#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "=== 1. 死んだCSS .flow-step h4 → .flow-step h3 に統一 ==="
for f in index.html page-*.html assets/page-template.html; do
  if grep -q '\.flow-step h4{' "$f"; then
    sed -i '' 's/\.flow-step h4{/.flow-step h3{/' "$f"
    echo "  updated: $f"
  fi
done

echo
echo "=== 2. フッターnavのaria-label重複解消（メニュー → フッターメニュー）==="
for f in index.html page-*.html assets/page-template.html; do
  if grep -q '<nav class="foot-col" aria-label="メニュー">' "$f"; then
    sed -i '' 's|<nav class="foot-col" aria-label="メニュー">|<nav class="foot-col" aria-label="フッターメニュー">|' "$f"
    echo "  updated: $f"
  fi
done

echo
echo "=== 3. 残存確認（h4/h5/h6 は0件であること）==="
grep -n -E '<h[4-6]|h[4-6]\{' index.html page-*.html assets/page-template.html || echo "  残存なし ✅"

echo
echo "=== 4. aria-label 一覧（重複が無いこと）==="
grep -h -o 'aria-label="[^"]*"' index.html | sort | uniq -c
