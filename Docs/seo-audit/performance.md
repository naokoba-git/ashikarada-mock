# パフォーマンス監査（Core Web Vitals）

計測日: 2026-07-22
計測ツール: Lighthouse 13.4.1（`npx lighthouse` / headless Chrome）
対象: https://pspo-relaxation.pages.dev （TOP `/`・`/menu`・`/stores/okaido`・`/voice`）
※ noindex は公開前の意図的措置のため本監査では無視。

## サマリー（実測値）

| ページ | モバイル Score | モバイル LCP | モバイル CLS | デスクトップ Score | デスクトップ LCP |
|---|---|---|---|---|---|
| `/`（TOP） | **65** | **13.4 s** 🔴 | 0.002 | 91 | 1.7 s |
| `/menu` | 92 | 2.7 s | 0.002 | 94 | 1.2 s |
| `/stores/okaido` | **68** | **10.8 s** 🔴 | 0.014 | 90 | 1.8 s |
| `/voice` | 94 | 2.5 s | 0.003 | 98 | 0.9 s |

TBT（INPの代理指標）は全ページ・全デバイスで **0ms**（JSがほぼ無いため良好）。CLSも全ページ 0.014 以下で「良好」基準（≤0.1）を大きく下回る。

**問題はモバイルLCPの1点に集約される。** 特に「ヒーロー画像を持つページ（TOP・店舗詳細2ページ）」だけがモバイルで著しく悪化しており（Score 65〜68、LCP 10.8〜13.4秒＝「不良」基準4.0秒の2.5〜3倍）、画像を持たないページ（`/menu` `/voice`）はモバイルでも合格に近い（Score 92〜94、LCP 2.5〜2.7秒）。原因は明確に特定できた。

---

## Critical

### 1. ヒーロー画像がCSS背景画像実装のためLCP検出が遅延（TOP・店舗詳細2ページ）

**実測（TOPページ・モバイル、Lighthouse `lcp-breakdown-insight`）**:
```
LCP要素: body > section.hero > div.hero-bg
TTFB:               88 ms
resourceLoadDelay: 2,216 ms  ← 画像がCSS背景のため発見が遅れる
resourceLoadDuration: 11,118 ms  ← 203KB無圧縮JPEGの転送時間
elementRenderDelay:    18 ms
合計 LCP: 13,440 ms
```
`/stores/okaido` も同型（`store-hero-bg`）で resourceLoadDelay 2,196ms + resourceLoadDuration 8,555ms → LCP 10.8秒。

**原因**: `mocks/index.html:71-73` の実装
```css
.hero-bg{position:absolute;inset:0;background:
   linear-gradient(...),
   url('https://storage.readdy-site.link/.../IMG_1861.jpeg') center/cover}
```
`<img>` タグではなく CSS `background-image` で読み込んでいるため:
- Lighthouseの `lcp-discovery-insight` が `fetchpriority=high should be applied: false` と検出（背景画像には `fetchpriority` を付けられない）
- ブラウザのpreloadスキャナはHTML内の `<img src>` `<link rel=preload>` は投機的に先読みするが、CSS内の `background-image` はスタイル解決・レイアウト計算後まで要求が始まらない → 2.2秒の発見遅延

**修正案**（推奨度 ⭐⭐⭐⭐⭐）:
```html
<!-- <head> に追加：最優先で先読み -->
<link rel="preload" as="image"
      href="https://storage.readdy-site.link/project_files/.../48996b8b-...IMG_1861.jpeg"
      fetchpriority="high">

<!-- .hero-bg の中身を <img> に置換（グラデーションはoverlay用の別要素で重ねる） -->
<div class="hero-bg">
  <img src="https://storage.readdy-site.link/.../IMG_1861.jpeg"
       alt="" fetchpriority="high" decoding="async"
       style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
  <div class="hero-overlay"></div> <!-- 元のlinear-gradient部分をここに移す -->
</div>
```
`.hero-bg::after` の擬似要素と同様に、グラデーションは絶対配置した別divで重ねればレイアウトは変わらない（現状 `.hero{min-height:88vh}` で高さ固定のためCLSリスクもなし）。

**期待効果**: resourceLoadDelay 2,216ms → ほぼ0ms（HTML解析中に即発見・最優先で要求開始）。

---

### 2. ヒーロー画像が無圧縮JPEGで配信（4枚とも170〜204KB）

**実測（実ファイルをダウンロードして cwebp / avifenc で実変換・同一画質目視確認済み）**:

| 画像 | 現状(JPEG) | WebP(q80) | 削減率 | AVIF(q60) | 削減率 |
|---|---|---|---|---|---|
| TOP ヒーロー IMG_1861 | 203,380 B | 56,554 B | **-72.2%** | 57,108 B | -71.9% |
| 大街道店ヒーロー IMG_2020 | 195,556 B | 52,094 B | **-73.4%** | 未計測 | - |
| アロマ画像 unnamed(399bdb2a) | 184,351 B | 未計測 | - | - | - |
| 足つぼ画像 unnamed(e3705560) | 166,041 B | 未計測 | - | - | - |

原寸は1500×1000px（TOPヒーロー確認・`sips`実測）。CSS側で `background-size:cover` 表示のため、実際の表示サイズ（PC/モバイルどちらもビューポート幅いっぱい）に対しては妥当な解像度だが、フォーマットが最適化されていない。

**モバイルLCPへの影響推定（実測比率から算出）**: 資源転送時間はほぼ帯域幅に比例するため、TOPページの `resourceLoadDuration 11,118ms` を72%削減後のファイルサイズで換算すると **約3,100ms**（-8,000ms）。上記の背景画像→`<img>`化と合わせると、TOPページのモバイルLCPは理論値 **13.4秒 → 3秒前後**まで改善見込み。

**修正案**（推奨度 ⭐⭐⭐⭐⭐）: 4枚ともWebP化（`<picture>` で AVIF/WebP/JPEGの順にフォールバック）。
```html
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="" fetchpriority="high">
</picture>
```
外部ホスト（readdy CDN）は形式変換に対応していない可能性が高いため、自前ホスト化（Cloudflare Pages配下の `mocks/assets/img/`）が前提になる。CLAUDE.mdのTODOに既にある「readdy画像の自前ホスト化」と合わせて一度に対応するのが効率的。

---

## High

### 3. Google Fonts CSSがレンダーブロッキング（全ページ共通）

**実測（`render-blocking-insight`, `/menu` モバイル）**:
```
URL: https://fonts.googleapis.com/css2?family=Shippori+Mincho...&display=swap
Transfer Size: 178,391 B
Est savings: 2,050 ms（FCP・LCPともに）
```
このCSSファイル自体が178KB（日本語フォントのunicode-rangeサブセットが大量にあるため）あり、`<link rel="stylesheet">` で同期読み込みしているためレンダリングをブロックする。`/menu` のようにLCP要素がテキスト（`p.lead`）のページでも `elementRenderDelay: 2,617ms` の大半がこれに起因。

**修正案**（推奨度 ⭐⭐⭐⭐）:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=...&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...&display=swap"
      media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=..."></noscript>
```
より確実な方法は、実際に使うウェイトのWOFF2だけを自前ホスト化して `@font-face` で読み込むこと（178KBのサブセット判定用CSSが不要になり、フォント自体も先読み対象にできる）。`font-display:swap` は既に適用済みでCLS影響も実測0（`font-display-insight` score 1・wastedMs項目なし）なので、この修正はレンダーブロッキング解消のみが目的でCLS対策としては不要。

---

## Medium

### 4. `/stores/okaido` のGoogleマップiframeは適切に`loading="lazy"`済み・LCPへの影響なし（問題なし・確認事項）

実装確認: `mocks/page-stores-okaido.html:399` で `<iframe ... loading="lazy">` を確認。ネットワークリクエストログ上もLCP要素（ヒーロー画像）より後続で読み込まれており、ファーストビューを阻害していない。**対応不要。良好な実装として維持。**

### 5. CLSは全ページ良好（0.001〜0.014）だが `/stores/okaido` がやや高め

原因（`cls-culprits-insight` 実測）: `body > section` 要素のわずかなシフト（スコア0.014）。Webフォント切り替え時の行送り変化と推定されるが、「良好」基準（≤0.1）の1/7程度で実害なし。**対応不要（優先度Low扱いで良い）**。

---

## Low

- CSSはインライン `<style>` のため未使用CSS・未minifyの指摘あり（`unminified-css` savings 150ms/18KB@ `/`）。実害は小さいが、本実装フェーズでビルドパイプラインを入れる際にminify化を組み込むと良い。

---

## 総ページ転送量（実測）

| ページ | モバイル総転送量 |
|---|---|
| `/`（TOP） | 2,038 KiB |
| `/stores/okaido` | 2,133 KiB |
| `/menu` | 1,130 KiB |

画像4枚合計で約750KB、フォント関連（CSS+woff2複数）で約320KB。上記Critical/High対応で画像を72%圧縮すればページ総量は概ね半分程度まで削減できる見込み。

---

## 優先度まとめ

| 優先度 | 対応 | 効果（実測・推定） | 対象ページ |
|---|---|---|---|
| Critical | ヒーロー背景画像を`<img fetchpriority=high>`＋`<link rel=preload>`化 | resourceLoadDelay -2,200ms | TOP・店舗詳細2ページ |
| Critical | ヒーロー・カード画像をWebP/AVIF化（自前ホスト化とセット） | ファイルサイズ-72%、resourceLoadDuration -8,000ms級 | 全ページ（4枚） |
| High | Google Fonts CSSの非同期読み込み or 自前WOFF2ホスト化 | FCP/LCP -2,050ms | 全ページ共通 |
| Medium | （対応不要）マップiframe lazy loading | 既に適切 | `/stores/okaido` |
| Low | インラインCSSのminify | -150ms/-18KB | 全ページ |

**結論**: モバイルLCPの「不良」判定（TOP 13.4秒・店舗詳細 10.8秒）は、①CSS背景画像によるLCP発見遅延と②未圧縮JPEG配信の2点にほぼ全て起因する、原因の明確な問題。この2点を修正すればモバイルLCPは「良好」基準（≤2.5秒）に近い水準まで改善する見込み（実測データからの試算：TOP 13.4秒→約3秒）。CLS・INP(TBT)は現状すでに良好で追加対応は不要。
