#!/usr/bin/env bash
set -euo pipefail
OUT="/Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks/assets/img"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

BASE="https://storage.readdy-site.link/project_files/f4855191-8498-4dea-80b6-ea07112d8fed"
declare -a SRC=(
  "hero-therapist|$BASE/48996b8b-b212-416b-831a-3b0535365f95_IMG_1861.jpeg"
  "aroma|$BASE/399bdb2a-af0c-410d-b3f7-c7b94a806242_unnamed.jpg"
  "fullbody|$BASE/d7b4e8b6-9652-4bcf-b4eb-f92cf8751890_IMG_2020.jpeg"
  "footcare|$BASE/e3705560-d994-4ce3-aae3-4b649022b4b6_unnamed.jpg"
  "storefront|https://public.readdy.ai/ai/img_res/edited_94938a77131156633011444627a74811_709c1087.jpg"
)

echo "name,orig_bytes,webp_bytes,reduction,width,height"
for entry in "${SRC[@]}"; do
  name="${entry%%|*}"; url="${entry#*|}"
  curl -sSL "$url" -o "$TMP/$name.src"
  # ダウンロード事故検知: 0バイト/HTMLエラーページを画像として変換しないためのガード
  dl_size=$(stat -f%z "$TMP/$name.src")
  if [ "$dl_size" -eq 0 ]; then
    echo "ERROR: $name のダウンロードが0バイトです ($url)" >&2
    exit 1
  fi
  if ! magick identify "$TMP/$name.src" >/dev/null 2>&1; then
    echo "ERROR: $name は画像として認識できません（HTMLエラーページの可能性）: $url" >&2
    exit 1
  fi
  # 長辺1600pxに収める（ヒーロー用途に十分・それ以上は無駄）
  magick "$TMP/$name.src" -auto-orient -resize '1600x1600>' -quality 86 "$OUT/$name.jpg"
  cwebp -quiet -q 82 "$OUT/$name.jpg" -o "$OUT/$name.webp"
  o=$(stat -f%z "$TMP/$name.src"); w=$(stat -f%z "$OUT/$name.webp")
  dim=$(magick identify -format '%w,%h' "$OUT/$name.webp")
  echo "$name,$o,$w,$(( 100 - w*100/o ))%,$dim"
done
