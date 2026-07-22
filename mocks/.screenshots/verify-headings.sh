#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/.."

echo "=== 1. 見出し並び（h1が1つ・スキップ無しを確認）==="
fail=0
for f in index.html page-*.html; do
  seq=$(grep -o -E '<h[1-6]' "$f" | sed 's/<h//' | tr '\n' ' ')
  h1=$(grep -c -o -E '<h1' "$f" || true)
  # スキップ検出
  prev=0; skip=""
  for n in $seq; do
    if [ "$n" -gt $((prev+1)) ]; then skip="${skip} ${prev}->${n}"; fi
    prev=$n
  done
  status="OK"
  [ "$h1" != "1" ] && { status="NG(h1=$h1)"; fail=1; }
  [ -n "$skip" ] && { status="NG(skip:${skip})"; fail=1; }
  printf '%-28s %-6s %s\n' "$f" "$status" "$seq"
done

echo
echo "=== 2. h4/h5/h6 の残存（HTML・CSS両方）==="
grep -n -E '<h[4-6]|h[4-6]\{|h[4-6] ' index.html page-*.html assets/page-template.html || echo "残存なし ✅"

echo
echo "=== 3. フッター置換の整合（各ファイル foot-title=5 / nav 3個）==="
for f in index.html page-*.html assets/page-template.html; do
  printf '%-28s foot-title:%s  footer-nav:%s\n' "$f" \
    "$(grep -c 'foot-title' "$f")" \
    "$(grep -c -E 'aria-label="(会社概要|メニュー|店舗情報)"' "$f")"
done

echo
echo "=== 4. 判定 ==="
[ "$fail" = "0" ] && echo "見出し構造: 全ページ PASS ✅" || echo "見出し構造: FAIL ❌"
