#!/usr/bin/env bash
set -euo pipefail
ROOT=/Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
cd "$ROOT"

python3 -m http.server 8777 >/dev/null 2>&1 &
SRV=$!
cleanup() { kill "$SRV" 2>/dev/null || true; }
trap cleanup EXIT
sleep 2

export NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules
export BASE_URL=http://localhost:8777

echo "=== A: フォント非同期化の実測（JS有効/無効） ==="
node "$ROOT/.screenshots/verify-font-async.cjs" || true

echo ""
echo "=== B: 見出しスタイル回帰（HTTP配信で実行） ==="
node "$ROOT/.screenshots/verify-heading-styles.cjs" || true

echo ""
echo "=== C: 旧形式リンク残存チェック（期待: 0件） ==="
N=$( { grep -o 'href="\(page-[a-z-]*\|mock-a-real\)\.html"' index.html page-*.html 404.html assets/page-template.html || true; } | wc -l | tr -d ' ')
if [ "$N" = "0" ]; then echo "旧形式リンクなし ✅ (0件)"; else echo "❌ 残存 $N 件"; fi

echo ""
echo "=== D: クリーンURLの到達確認（200であること） ==="
for u in / /menu /first-time /features /stores /stores/okaido /stores/airport /voice /faq /reserve /tickets; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:8777$u" || echo ERR)
  echo "  $u -> $code (※ローカルhttp.serverは_redirects非対応。実挙動はCF Pages上で確認)"
done
