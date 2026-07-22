# P・SPO リラクゼーション SEO監査 指摘対応 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SEO監査（`Docs/seo-audit/FULL-AUDIT-REPORT.md`・スコア67/100）で検出したCritical〜Mediumの指摘のうち、クライアント判断が不要な全項目を実装し、モバイルLCPを13.4秒→3秒以下、アクセシビリティをWCAG AA相当に引き上げる。

**Architecture:** ビルド工程を持たない静的HTML11ページ＋Cloudflare Pages。CSSは各HTMLの `<style>` にインライン、共通骨格は `assets/page-template.html` が原本。したがって「テンプレートを直す→全11ページへ同じ差分を適用する」が基本手順。画像は外部CDN（readdy）依存を脱し `mocks/assets/img/` に自前ホストする。

**Tech Stack:** 静的HTML / CSS / 素のJS / Cloudflare Pages（`_headers`・`_redirects`）/ 検証は Playwright headless ＋ Lighthouse ＋ curl

## Global Constraints

- **`mocks/` は Cloudflare Pages の公開ディレクトリ**。監査成果物・検証スクリプト・作業用ファイルを置かない（`mocks/.screenshots/` のみ例外）。
- **noindex 3層は維持する**（`<meta robots>` / `robots.txt` / `_headers`）。本計画では解除しない。
- **メニュー名「睡眠改善コース」は変更禁止**（クライアントの実在メニュー名。ユーザー決定 2026-07-22）。
- **実在しないデータを作らない**。`aggregateRating` / `review` の構造化データ追加は禁止。施術者の資格・実績の創作も禁止。
- **見出し階層は h1→h2→h3 を維持**（h4以下を新規に使わない。2026-07-22に全ページ正規化済み）。
- **デザイン（A案：ダーク/ゴールドの高級スパ系）を崩さない**。CSS変数 `--ink:#22302c` / `--gold:#a9854f` / `--gold-deep:#8a6a3a` / `--cream:#f7f2e9` / `--paper:#fffdf9` / `--line:#e0d6c4` / `--line-green:#06c755` の意味を変えない。
- **LINEボタン `.btn-line` の緑（`#06c755`）は変更しない**（LINE公式ブランド規定優先。コントラスト2.26:1は許容と決定）。
- **push はユーザーの明示指示があるまで行わない**。コミットは各タスク完了ごとに行う。
- 対象HTMLは12ファイル: `index.html` / `page-first-time.html` / `page-menu.html` / `page-features.html` / `page-stores.html` / `page-stores-okaido.html` / `page-stores-airport.html` / `page-voice.html` / `page-faq.html` / `page-reserve.html` / `page-tickets.html` / `assets/page-template.html`

---

## File Structure

| ファイル | 役割 | 本計画での変更 |
|---|---|---|
| `mocks/assets/page-template.html` | 下層共通骨格の原本 | タップ領域・コントラスト・固定CTAバー・フォント非同期・フッターリンク形式 |
| `mocks/index.html` | 実サイトTOP | 上記＋ヒーロー`<img>`化＋preload＋背景画像の自前ホスト化＋JSON-LD |
| `mocks/page-*.html`（10枚） | 下層ページ | 上記共通差分＋各ページ固有のJSON-LD／画像 |
| `mocks/404.html` | **新規** | ソフト404の解消 |
| `mocks/assets/img/` | **新規ディレクトリ** | WebP＋JPEGフォールバック（5点） |
| `mocks/_headers` | Cloudflare Pages ヘッダ | セキュリティヘッダ追加・開発ファイルのnoindex固定 |
| `mocks/_redirects` | Cloudflare Pages リライト | `/page-*` → `/*` の明示301追加 |
| `mocks/.screenshots/verify-*.cjs` | 検証スクリプト | 各タスクの合否判定に使う |

---

## Task 1: ソフト404の解消（404.html）

**Files:**
- Create: `mocks/404.html`

**Interfaces:**
- Consumes: なし
- Produces: なし（独立）

**背景:** 存在しないURLが全て HTTP 200 でTOPページ本文を返す（Cloudflare Pages 既定のフォールバック）。実測で `/this-page-does-not-exist-12345`・`/menu/nonexistent`・`/sitemap.xml` すべて200を確認済み。Cloudflare Pages はルートに `404.html` があればそれを404ステータスで返す。

- [ ] **Step 1: 現状が壊れていることを確認（失敗の再現）**

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://pspo-relaxation.pages.dev/this-page-does-not-exist-12345
```
Expected: `200`（＝バグが再現している）

- [ ] **Step 2: `mocks/404.html` を作成**

`page-template.html` のヘッダー・フッター・CSSをそのまま流用し、`<!-- CONTENT -->` 部分を以下に置き換える。`<head>` には既存同様 `<meta name="robots" content="noindex, nofollow, noarchive">` を入れ、`<title>` は `ページが見つかりません｜P・SPO リラクゼーション松山店`、canonical は**入れない**（404ページのため）。

```html
<section class="page-hero">
  <div class="wrap">
    <div class="divider"></div>
    <h1>ページが見つかりません</h1>
    <p class="lead">お探しのページは移動または削除された可能性があります。お手数ですが以下からお探しください。</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="grid-3">
      <a class="card" href="/menu">
        <h2>メニュー・料金</h2>
        <p>人気の組み合わせから単品まで、料金を掲載しています。</p>
      </a>
      <a class="card" href="/stores">
        <h2>店舗案内</h2>
        <p>大街道店・空港通り店のアクセスと営業時間。</p>
      </a>
      <a class="card" href="/reserve">
        <h2>ご予約</h2>
        <p>Web・お電話・LINEからご予約いただけます。</p>
      </a>
    </div>
    <div style="text-align:center;margin-top:48px">
      <a class="btn btn-gold" href="/">トップページへ戻る</a>
    </div>
  </div>
</section>
```

> 注意: `.card h3` のCSSがあるが本ページでは `h2` を使う（h1直下はh2、h3スキップ禁止のグローバル制約）。見た目を合わせるため `<style>` 末尾に `.card h2{font-family:"Shippori Mincho",serif;font-size:22px;font-weight:600;margin-bottom:10px}` を追加する。

- [ ] **Step 3: ローカルで見出し階層と表示を確認**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
grep -o -E '<h[1-6]' 404.html | sed 's/<h//' | tr '\n' ' '
```
Expected: `1 2 2 2`（h1が1つ・スキップなし）

- [ ] **Step 4: コミット**

```bash
git add mocks/404.html && git commit -m "追加: 404ページを作成しソフト404（未定義URLが200でTOPを返す）を解消"
```

- [ ] **Step 5: デプロイ後の実測（pushはユーザー指示後）**

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://pspo-relaxation.pages.dev/this-page-does-not-exist-12345
```
Expected: `404`

---

## Task 2: タップ領域とコントラストの是正

**Files:**
- Modify: `mocks/assets/page-template.html`（CSS 3箇所）
- Modify: `mocks/index.html` および `mocks/page-*.html` 10枚（同一CSS差分）
- Create: `mocks/.screenshots/verify-a11y.cjs`

**Interfaces:**
- Consumes: なし
- Produces: `.btn-gold` の背景が `--gold-deep` になる（Task 3 の固定CTAバーはこの状態を前提にする）

**背景（実測値）:**
- `.ham` のタップ領域 19×27px（980px未満ではモバイル唯一のナビ）
- `.foot-col a` のタップ高さ 19px（11ページ×10リンク＝110箇所超）
- `.btn-gold` のコントラスト 3.41:1（AA基準4.5未達）→ 既存パレットの `--gold-deep #8a6a3a` で **5.00:1** に適合（メインセッションで独立検算済み）
- `--muted #6f7a73` のコントラスト 4.39:1（僅差未達）→ `#67726b` で適合

- [ ] **Step 1: 検証スクリプトを作成（失敗を先に確認する）**

Create `mocks/.screenshots/verify-a11y.cjs`:

```javascript
const { chromium } = require('playwright');
const path = require('path');
const BASE = 'file://' + path.resolve(__dirname, '..');
const PAGES = ['index.html','page-first-time.html','page-menu.html','page-features.html',
  'page-stores.html','page-stores-okaido.html','page-stores-airport.html',
  'page-voice.html','page-faq.html','page-reserve.html','page-tickets.html'];

const lum = (rgb) => {
  const c = rgb.match(/\d+/g).slice(0,3).map(v => v/255);
  const l = c.map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
  return 0.2126*l[0] + 0.7152*l[1] + 0.0722*l[2];
};
const ratio = (a,b) => { const [x,y] = [lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };

(async () => {
  const browser = await chromium.launch({ headless: true });
  let fail = 0;
  for (const p of PAGES) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${BASE}/${p}`, { waitUntil: 'load' });
    await page.waitForTimeout(400);

    const r = await page.evaluate(() => {
      const box = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { w: Math.round(b.width), h: Math.round(b.height) };
      };
      const small = [];
      document.querySelectorAll('.foot-col a').forEach(a => {
        const b = a.getBoundingClientRect();
        if (b.height < 40) small.push(Math.round(b.height));
      });
      const gold = document.querySelector('.btn-gold');
      const gs = gold ? getComputedStyle(gold) : null;
      return { ham: box('.ham'), footSmall: small.length,
               goldBg: gs ? gs.backgroundColor : null, goldFg: gs ? gs.color : null };
    });

    const hamOK = r.ham && r.ham.w >= 44 && r.ham.h >= 44;
    const footOK = r.footSmall === 0;
    const cr = r.goldBg ? ratio(r.goldFg, r.goldBg) : 0;
    const goldOK = cr >= 4.5;
    if (!hamOK || !footOK || !goldOK) fail++;
    console.log(`${p.padEnd(26)} ham:${r.ham ? r.ham.w+'x'+r.ham.h : 'n/a'}${hamOK?'✅':'❌'} ` +
                `小さいフッターリンク:${r.footSmall}${footOK?'✅':'❌'} btn-gold:${cr.toFixed(2)}:1${goldOK?'✅':'❌'}`);
    await page.close();
  }
  await browser.close();
  console.log(fail === 0 ? '\n判定: PASS ✅' : `\n判定: FAIL ❌ ${fail}ページ`);
  process.exit(fail === 0 ? 0 : 1);
})();
```

- [ ] **Step 2: 実行して現状が FAIL することを確認**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks/.screenshots
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node verify-a11y.cjs
```
Expected: FAIL（`.ham` が 19x27・フッターリンク10件が40px未満・btn-gold 3.41:1）

- [ ] **Step 3: `assets/page-template.html` のCSSを修正**

`.ham` を置換:
```css
.ham{display:none;background:none;border:0;color:var(--ink);font-size:22px;cursor:pointer;padding:11px 12px;margin:-11px -12px;line-height:1}
```

`.foot-col li` と `.foot-col a` を置換:
```css
.foot-col li{margin-bottom:0}
.foot-col a{color:#aeb6b0;transition:.2s;display:inline-block;padding:9px 0}
```

`.btn-gold` を置換（hoverはさらに濃く）:
```css
.btn-gold{background:var(--gold-deep);color:#fff}
.btn-gold:hover{background:#6f5530}
```

`:root` の `--muted` を置換:
```css
--muted:#67726b;
```

- [ ] **Step 4: 同じ差分を全11ページへ適用**

`index.html` と `page-*.html` 10枚に対し Step 3 と同一の置換を行う。`index.html` は `.foot-col li`/`.foot-col a` の行番号が異なる（223/224行付近）ので文字列一致で置換すること。

- [ ] **Step 5: 検証スクリプトが PASS することを確認**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks/.screenshots
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node verify-a11y.cjs
```
Expected: 全11ページ `✅` ／ `判定: PASS ✅`

- [ ] **Step 6: 横スクロールとレイアウト崩れが無いことを確認**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks/.screenshots
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node verify-heading-styles.cjs
```
Expected: `判定: PASS ✅ 見た目は変化なし`（フッター見出しのフォントサイズが維持されていること）

- [ ] **Step 7: コミット**

```bash
git add mocks/ && git commit -m "改善: タップ領域44px確保とCTAコントラストAA適合（btn-goldをgold-deepへ）"
```

---

## Task 3: モバイル下部固定CTAバーの追加

**Files:**
- Modify: `mocks/assets/page-template.html`
- Modify: `mocks/index.html` および `mocks/page-*.html` 10枚

**Interfaces:**
- Consumes: Task 2 の `.btn-gold`（`--gold-deep` 背景）
- Produces: `.cta-bar` クラス（980px以下でのみ表示）

**背景:** `@media(max-width:980px){.menu,.nav-cta{display:none}}` によりモバイルではヘッダーCTAが完全消滅。下層10ページ中9ページでファーストビューにCTAが無く、`/reserve` 自身にも無い。

- [ ] **Step 1: `page-template.html` の `</body>` 直前にマークアップを追加**

```html
<nav class="cta-bar" aria-label="予約導線">
  <a class="cta-bar-item cta-tel" href="tel:0120919323">
    <span class="cta-ico">☎</span><span class="cta-lbl">大街道店</span>
  </a>
  <a class="cta-bar-item cta-tel" href="tel:0120695427">
    <span class="cta-ico">☎</span><span class="cta-lbl">空港通り店</span>
  </a>
  <a class="cta-bar-item cta-line" href="https://lin.ee/wmRAMM9" target="_blank" rel="noopener">
    <span class="cta-ico">💬</span><span class="cta-lbl">LINE</span>
  </a>
  <a class="cta-bar-item cta-reserve" href="/reserve">
    <span class="cta-ico">✓</span><span class="cta-lbl">予約する</span>
  </a>
</nav>
```

- [ ] **Step 2: CSSを `<style>` の末尾に追加**

```css
/* ===== モバイル下部固定CTAバー ===== */
.cta-bar{display:none}
@media(max-width:980px){
  .cta-bar{display:grid;grid-template-columns:repeat(4,1fr);position:fixed;left:0;right:0;bottom:0;z-index:60;
    background:rgba(255,253,249,.97);backdrop-filter:blur(10px);border-top:1px solid var(--line);
    box-shadow:0 -6px 24px -14px rgba(40,30,15,.4);padding-bottom:env(safe-area-inset-bottom)}
  .cta-bar-item{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
    min-height:56px;font-size:11px;letter-spacing:.04em;color:var(--ink-soft);border-right:1px solid var(--line)}
  .cta-bar-item:last-child{border-right:0}
  .cta-ico{font-size:16px;line-height:1}
  .cta-line{color:#04a847}
  .cta-reserve{background:var(--gold-deep);color:#fff}
  /* 固定バーに隠れないよう本文下部に余白 */
  body{padding-bottom:56px}
}
```

- [ ] **Step 3: 全11ページへ同じ差分を適用**

`index.html` と `page-*.html` 10枚それぞれの `</body>` 直前にマークアップを、`<style>` 末尾にCSSを追加する。

- [ ] **Step 4: 検証 — 固定バーが表示され、フッターを隠していないこと**

Create and run `mocks/.screenshots/verify-cta-bar.cjs`:

```javascript
const { chromium } = require('playwright');
const path = require('path');
const BASE = 'file://' + path.resolve(__dirname, '..');
const PAGES = ['index.html','page-first-time.html','page-menu.html','page-features.html',
  'page-stores.html','page-stores-okaido.html','page-stores-airport.html',
  'page-voice.html','page-faq.html','page-reserve.html','page-tickets.html'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  let fail = 0;
  for (const p of PAGES) {
    // モバイル: 表示され、44px以上、横スクロールなし
    const sp = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await sp.goto(`${BASE}/${p}`, { waitUntil: 'load' });
    await sp.waitForTimeout(300);
    const m = await sp.evaluate(() => {
      const bar = document.querySelector('.cta-bar');
      if (!bar) return { ok:false, why:'.cta-barが無い' };
      const b = bar.getBoundingClientRect();
      const items = [...bar.querySelectorAll('.cta-bar-item')].map(a => Math.round(a.getBoundingClientRect().height));
      const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
      // フッター最下部までスクロールしてコピーライトが読めるか
      window.scrollTo(0, document.body.scrollHeight);
      const copy = document.querySelector('.copy');
      const cb = copy ? copy.getBoundingClientRect() : null;
      const hidden = cb ? (cb.bottom > window.innerHeight - b.height + 2) : false;
      return { ok:true, visible: getComputedStyle(bar).display !== 'none',
               h: Math.round(b.height), items, overflow, copyHidden: hidden };
    });
    // PC: 非表示であること
    const pc = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await pc.goto(`${BASE}/${p}`, { waitUntil: 'load' });
    const d = await pc.evaluate(() => {
      const bar = document.querySelector('.cta-bar');
      return bar ? getComputedStyle(bar).display : 'missing';
    });

    const ok = m.ok && m.visible && m.items.every(h => h >= 44) && !m.overflow && !m.copyHidden && d === 'none';
    if (!ok) fail++;
    console.log(`${p.padEnd(26)} SP表示:${m.visible?'✅':'❌'} 高さ:${m.items} 横スクロール:${m.overflow?'❌':'✅'} ` +
                `コピーライト隠れ:${m.copyHidden?'❌':'✅'} PC非表示:${d==='none'?'✅':'❌'+d}`);
    await sp.close(); await pc.close();
  }
  await browser.close();
  console.log(fail === 0 ? '\n判定: PASS ✅' : `\n判定: FAIL ❌ ${fail}ページ`);
  process.exit(fail === 0 ? 0 : 1);
})();
```

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks/.screenshots
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node verify-cta-bar.cjs
```
Expected: 全11ページ PASS

- [ ] **Step 5: スクリーンショットを撮ってユーザーに提示**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks/.screenshots
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node -e "
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({headless:true});
for(const f of ['index.html','page-reserve.html']){
const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto('file://'+path.resolve('..',f),{waitUntil:'load'});await p.waitForTimeout(1000);
await p.screenshot({path:'ctabar-'+f.replace('.html','')+'.png'});await p.close();}
await b.close();})();"
```
Expected: `ctabar-index.png` / `ctabar-page-reserve.png` が生成される。**ユーザーに提示して採否を確認する**（「まず作って見せて判断」の合意事項）。

- [ ] **Step 6: コミット**

```bash
git add mocks/ && git commit -m "追加: モバイル下部固定CTAバー（電話2店舗/LINE/予約）"
```

---

## Task 4: 画像の自前ホスト化とWebP変換（アセット準備）

**Files:**
- Create: `mocks/assets/img/`（5点 × WebP+JPEG）
- Create: `Docs/seo-audit/image-conversion-report.txt`

**Interfaces:**
- Produces: 以下のファイル名。Task 5・6 がこの名前を参照する。

| 用途 | 出力ファイル | 元URL（末尾） |
|---|---|---|
| ヒーロー・横揉み施術（セラピスト） | `hero-therapist.webp` / `.jpg` | `48996b8b-...IMG_1861.jpeg` |
| アロマ | `aroma.webp` / `.jpg` | `399bdb2a-...unnamed.jpg` |
| 全身・リーズナブル | `fullbody.webp` / `.jpg` | `d7b4e8b6-...IMG_2020.jpeg` |
| 足つぼ・技術力 | `footcare.webp` / `.jpg` | `e3705560-...unnamed.jpg` |
| 店頭看板 | `storefront.webp` / `.jpg` | `709c1087.jpg`（public.readdy.ai） |

**背景:** 無圧縮JPEG 170〜204KB を外部CDNから取得しており、実変換テストで 203KB → WebP 56.5KB（-72.2%）。これがモバイルLCP 13.4秒の主因。

- [ ] **Step 1: 変換スクリプトを作成**

Create `Docs/seo-audit/convert-images.sh`（**`mocks/` 配下には置かない**）:

```bash
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
  # 長辺1600pxに収める（ヒーロー用途に十分・それ以上は無駄）
  magick "$TMP/$name.src" -auto-orient -resize '1600x1600>' -quality 86 "$OUT/$name.jpg"
  cwebp -quiet -q 82 "$OUT/$name.jpg" -o "$OUT/$name.webp"
  o=$(stat -f%z "$TMP/$name.src"); w=$(stat -f%z "$OUT/$name.webp")
  dim=$(magick identify -format '%w,%h' "$OUT/$name.webp")
  echo "$name,$o,$w,$(( 100 - w*100/o ))%,$dim"
done
```

- [ ] **Step 2: 実行して変換結果を記録**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada
bash Docs/seo-audit/convert-images.sh | tee Docs/seo-audit/image-conversion-report.txt
```
Expected: 5行のCSVが出力され、各 `reduction` が50%以上。**ここで出力された `width,height` を Task 5・6 の `<img width height>` に使う**（推測しない）。

- [ ] **Step 3: 変換画像が壊れていないか目視確認**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks/assets/img && ls -la
```
Expected: `.webp` 5点・`.jpg` 5点が存在。各WebPを Read ツールで開いて内容が元画像と同じであることを目視確認する。

- [ ] **Step 4: コミット**

```bash
git add mocks/assets/img Docs/seo-audit/convert-images.sh Docs/seo-audit/image-conversion-report.txt
git commit -m "追加: 外部CDN依存の画像5点を自前ホスト化しWebP変換"
```

---

## Task 5: ヒーロー画像の `<img>` 化（LCP対策の本丸）

**Files:**
- Modify: `mocks/index.html`（`.hero-bg` CSS 71行付近・HTML 442行付近・`<head>`）
- Modify: `mocks/page-stores-okaido.html`（`.store-hero-bg` 319行）
- Modify: `mocks/page-stores-airport.html`（`.store-hero-bg` 319行）

**Interfaces:**
- Consumes: Task 4 の `hero-therapist.webp/.jpg`・`footcare.webp/.jpg` と、その実寸（`image-conversion-report.txt`）
- Produces: `.hero-img` / `.store-hero-img` クラス

**背景:** LCP候補が全てCSS `background-image` のため `fetchpriority` も preload も効かず、読み込み開始が2,200ms超遅延。`<img>` 化すると **LCP・alt属性・画像検索・WebP** が同時に解決する。

- [ ] **Step 1: 変更前のLCPを実測（ベースライン）**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada
npx -y lighthouse https://pspo-relaxation.pages.dev/ --only-categories=performance \
  --form-factor=mobile --screenEmulation.mobile --quiet --chrome-flags="--headless" \
  --output=json --output-path=/tmp/lh-before.json >/dev/null 2>&1
node -e "const r=require('/tmp/lh-before.json');console.log('Perf',r.categories.performance.score*100,'LCP',r.audits['largest-contentful-paint'].displayValue)"
```
Expected: Perf 65前後 / LCP 13秒前後（監査時の実測と一致すること）

- [ ] **Step 2: `index.html` の `<head>` に preload を追加**

`<link href="https://fonts.googleapis.com/css2?family=Shippori..." rel="stylesheet">` の**直後**に:

```html
<link rel="preload" as="image" href="/assets/img/hero-therapist.webp" type="image/webp" fetchpriority="high">
```

- [ ] **Step 3: `index.html` の `.hero-bg` CSS を置換**

置換前（71〜74行付近）:
```css
  .hero-bg{position:absolute;inset:0;background:
     linear-gradient(90deg, rgba(20,28,25,.78) 0%, rgba(20,28,25,.45) 45%, rgba(20,28,25,.15) 100%),
     url('https://storage.readdy-site.link/.../48996b8b-...IMG_1861.jpeg') center/cover}
  .hero-bg::after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(15,22,19,.45))}
```

置換後:
```css
  .hero-bg{position:absolute;inset:0;overflow:hidden}
  .hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
  .hero-bg::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(90deg, rgba(20,28,25,.78) 0%, rgba(20,28,25,.45) 45%, rgba(20,28,25,.15) 100%)}
  .hero-bg::after{content:"";position:absolute;inset:0;z-index:1;background:radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(15,22,19,.45))}
```

- [ ] **Step 4: `index.html` の `.hero-bg` マークアップを置換**

置換前:
```html
  <div class="hero-bg"></div>
```

置換後（`WIDTH`/`HEIGHT` は Task 4 の `image-conversion-report.txt` の実寸を入れる）:
```html
  <div class="hero-bg">
    <picture>
      <source srcset="/assets/img/hero-therapist.webp" type="image/webp">
      <img class="hero-img" src="/assets/img/hero-therapist.jpg"
           alt="P・SPO リラクゼーションの施術風景。セラピストが横揉み施術を行っている様子"
           width="WIDTH" height="HEIGHT" fetchpriority="high" decoding="async">
    </picture>
  </div>
```

- [ ] **Step 5: 店舗2ページの `.store-hero-bg` を同様に置換**

`page-stores-okaido.html`（元画像は `footcare`）:
```css
  .store-hero-bg{position:absolute;inset:0;overflow:hidden}
  .store-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
  .store-hero-bg::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(0deg,rgba(20,28,25,.82) 10%,rgba(20,28,25,.25) 60%,rgba(20,28,25,.55) 100%)}
```
```html
  <div class="store-hero-bg">
    <picture>
      <source srcset="/assets/img/footcare.webp" type="image/webp">
      <img class="store-hero-img" src="/assets/img/footcare.jpg"
           alt="大街道店の施術風景。足つぼ施術を行っている様子"
           width="WIDTH" height="HEIGHT" fetchpriority="high" decoding="async">
    </picture>
  </div>
```
`<head>` に `<link rel="preload" as="image" href="/assets/img/footcare.webp" type="image/webp" fetchpriority="high">` を追加。

`page-stores-airport.html`（元画像は `hero-therapist`）も同様。alt は `空港通り店の施術風景。セラピストが横揉み施術を行っている様子`、preload は `hero-therapist.webp`。

- [ ] **Step 6: レイアウトが崩れていないことを確認**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks/.screenshots
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node verify-hero-h1.cjs
```
Expected: PC eyebrow 209 / h1main 255、SP 129 / 196 / 327（Task実施前と同一。ヒーローのテキスト位置が動いていないこと）

- [ ] **Step 7: コミット**

```bash
git add mocks/ && git commit -m "改善: ヒーロー画像をimg要素化しpreload+fetchpriority+WebP適用（LCP対策）"
```

- [ ] **Step 8: デプロイ後にLCPを再実測（pushはユーザー指示後）**

```bash
npx -y lighthouse https://pspo-relaxation.pages.dev/ --only-categories=performance \
  --form-factor=mobile --screenEmulation.mobile --quiet --chrome-flags="--headless" \
  --output=json --output-path=/tmp/lh-after.json >/dev/null 2>&1
node -e "const r=require('/tmp/lh-after.json');console.log('Perf',r.categories.performance.score*100,'LCP',r.audits['largest-contentful-paint'].displayValue)"
```
Expected: **LCP < 3.0s / Performance 85+**。未達なら `performance.md` の insights を再取得して原因を再特定する（推測で追加変更しない）。

---

## Task 6: 残る背景画像の自前ホスト化

**Files:**
- Modify: `mocks/index.html`（`.final-bg` 207行・`.ph` インラインstyle 6箇所）
- Modify: `mocks/page-stores-okaido.html`（`.gi` 3箇所）
- Modify: `mocks/page-stores-airport.html`（`.gi` 3箇所）
- Modify: 外部URLを参照している残りのページ全て

**Interfaces:**
- Consumes: Task 4 の5点

- [ ] **Step 1: 外部URL参照が残っている箇所を洗い出す**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
grep -c "storage.readdy-site.link\|public.readdy.ai" index.html page-*.html assets/page-template.html
```
Expected: 各ファイルの残存件数が表示される（この数を0にするのがゴール）

- [ ] **Step 2: URLを一括置換**

以下の対応で、全HTMLの外部URLをローカルパスへ置換する（`background-image` のままでよい。装飾画像でありLCP候補ではないため）:

| 置換前（末尾） | 置換後 |
|---|---|
| `.../48996b8b-...IMG_1861.jpeg` | `/assets/img/hero-therapist.webp` |
| `.../399bdb2a-...unnamed.jpg` | `/assets/img/aroma.webp` |
| `.../d7b4e8b6-...IMG_2020.jpeg` | `/assets/img/fullbody.webp` |
| `.../e3705560-...unnamed.jpg` | `/assets/img/footcare.webp` |
| `https://public.readdy.ai/.../709c1087.jpg` | `/assets/img/storefront.webp` |

**OGP/Twitterカードの `og:image` / `twitter:image` も同様に置換する**が、こちらは**絶対URL必須**なので `https://pspo-relaxation.jp/assets/img/hero-therapist.jpg`（WebPではなくJPEG。SNSクローラの互換性のため）を使う。

- [ ] **Step 3: 外部URLがゼロになったことを確認**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
grep -c "storage.readdy-site.link\|public.readdy.ai" index.html page-*.html assets/page-template.html || echo "外部URL残存なし ✅"
```
Expected: 全ファイル 0（`grep -c` が0を返し終了コード1になるので `|| echo` が出る）

- [ ] **Step 4: 全ページのスクリーンショットで画像欠けが無いか確認**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
python3 -m http.server 8777 &
sleep 2
cd .screenshots
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node _shot.cjs
kill %1
```
> `file://` ではルート相対パス `/assets/` が解決できないため、**必ずHTTPサーバ経由で確認する**こと。
Expected: 全11ページで画像が表示され、404が無いこと

- [ ] **Step 5: コミット**

```bash
git add mocks/ && git commit -m "改善: 残る背景画像とOGP画像を自前ホストへ移行し外部CDN依存を解消"
```

---

## Task 7: 構造化データの修正

**Files:**
- Modify: 全11ページ + `assets/page-template.html` の JSON-LD

**Interfaces:**
- Consumes: Task 4 の画像パス

- [ ] **Step 1: 現状を確認（logoが人物写真であること）**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
grep -o '"logo":[^,]*' index.html | head -1
```
Expected: `IMG_1861.jpeg`（＝ヒーロー写真。ロゴではない）

- [ ] **Step 2: `Organization.logo` を実ロゴに差替（全11ページ＋テンプレ）**

```json
"logo": "https://pspo-relaxation.jp/assets/logo-pspo.png",
```

- [ ] **Step 3: `Organization` に `@id` を付与し `DaySpa` から参照**

`Organization` ブロックに追加:
```json
"@id": "https://pspo-relaxation.jp/#organization",
```
各 `DaySpa` ブロックに追加:
```json
"parentOrganization": { "@id": "https://pspo-relaxation.jp/#organization" },
```

- [ ] **Step 4: `DaySpa.image` を店舗別画像に差替**

- 大街道店（`page-stores-okaido.html` および `index.html`/`page-stores.html` の `@graph` 内）: `"image": "https://pspo-relaxation.jp/assets/img/footcare.jpg"`
- 空港通り店（`page-stores-airport.html` および同上）: `"image": "https://pspo-relaxation.jp/assets/img/hero-therapist.jpg"`

> 各店舗の実写真が今後クライアントから提供されたら差し替える。現状は各ページのヒーローで実際に使っている画像と一致させる（＝ページ内容と構造化データの整合を優先）。

- [ ] **Step 5: 店舗詳細2ページの `BreadcrumbList` を3階層化**

`page-stores-okaido.html`:
```json
"itemListElement": [
  { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://pspo-relaxation.jp/" },
  { "@type": "ListItem", "position": 2, "name": "店舗案内", "item": "https://pspo-relaxation.jp/stores" },
  { "@type": "ListItem", "position": 3, "name": "大街道店", "item": "https://pspo-relaxation.jp/stores/okaido" }
]
```
`page-stores-airport.html` も同様（`position 3` を `空港通り店` / `https://pspo-relaxation.jp/stores/airport`）。

> `/menu` 等の1階層下のページは2階層のままで正しい。変更しないこと。

- [ ] **Step 6: 画面上のパンくず表示と構造化データが一致しているか確認**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
grep -o 'class="crumb">.*</div>' page-stores-okaido.html | head -1
```
Expected: 画面のパンくずにも「店舗案内」が含まれること。**含まれていなければ画面側にもリンクを追加する**（構造化データだけ3階層にして画面が2階層のままだと不整合になる）。

- [ ] **Step 7: 全ページのJSON-LDが壊れていないことを検証**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
python3 -c "
import re,json,glob,sys
ng=0
for f in sorted(glob.glob('index.html')+glob.glob('page-*.html')):
    for i,m in enumerate(re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', open(f).read(), re.S)):
        try: json.loads(m)
        except Exception as e: print('❌',f,i,e); ng+=1
print('JSON-LD 構文チェック:', 'PASS ✅' if ng==0 else f'FAIL ❌ {ng}件')
sys.exit(1 if ng else 0)
"
```
Expected: `PASS ✅`

- [ ] **Step 8: `page-menu.html` に実料金の `OfferCatalog` を追加**

既存の `Organization` / `BreadcrumbList` に加えて、以下を追加する。**価格はCLAUDE.md記載の実データのみ**を使い、推測値を入れないこと。

```json
{
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  "name": "メニュー・料金",
  "url": "https://pspo-relaxation.jp/menu",
  "provider": { "@id": "https://pspo-relaxation.jp/#organization" },
  "itemListElement": [
    {
      "@type": "Offer",
      "itemOffered": { "@type": "Service", "name": "足底30分＋全身60分", "serviceType": "リラクゼーションマッサージ" },
      "price": "6300", "priceCurrency": "JPY",
      "description": "一番人気の組み合わせ。ピースポ会員は5,800円"
    },
    {
      "@type": "Offer",
      "itemOffered": { "@type": "Service", "name": "顔・頭30分＋全身60分［睡眠改善コース］", "serviceType": "リラクゼーションマッサージ" },
      "price": "5900", "priceCurrency": "JPY",
      "description": "ピースポ会員は5,400円"
    },
    {
      "@type": "Offer",
      "itemOffered": { "@type": "Service", "name": "アロマ60分＋顔・頭15分［女性限定／アロマスペシャル］", "serviceType": "アロマトリートメント" },
      "price": "6400", "priceCurrency": "JPY",
      "description": "ピースポ会員は5,900円"
    }
  ]
}
```

> `price` は**一般料金**（会員価格ではない方）を入れる。会員価格は `description` に文章で書く。2種類の価格を `price` に併記するとバリデータでエラーになるため。
> メニュー名「睡眠改善コース」は**そのまま使う**（Task 8 の制約と一致させること）。

- [ ] **Step 9: 各店舗 `DaySpa` の `priceRange` を実データに変更**

置換前: `"priceRange": "¥¥"`
置換後: `"priceRange": "¥3,700〜¥6,400"`

- [ ] **Step 10: コミット**

```bash
git add mocks/ && git commit -m "修正: 構造化データ（logo誤指定・@id連携・店舗別image・パンくず3階層化・実料金OfferCatalog）"
```

---

## Task 8: 薬機法・景表法リスク表現の調整

**Files:**
- Modify: `mocks/page-voice.html`
- Modify: `mocks/page-menu.html`

**Interfaces:** なし

**制約（再掲）:** メニュー名「**睡眠改善コース**」は**変更禁止**。説明文のみ体感表現に変更する（ユーザー決定 2026-07-22）。

- [ ] **Step 1: `page-voice.html` に個人差の注記を追加**

レビュー一覧セクションの見出し直下（`.sec-head` の直後）に:
```html
<p class="disclaimer">※お客様個人の感想です。効果の感じ方には個人差があります。</p>
```
CSS を `<style>` 末尾に追加:
```css
.disclaimer{text-align:center;font-size:12.5px;color:var(--muted);margin:-28px 0 40px}
```

- [ ] **Step 2: `page-menu.html` のヘッドスパ説明文を変更**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
grep -n "眼精疲労" page-menu.html
```
該当の説明文「眼精疲労・睡眠改善におすすめ」を **「目の疲れが気になる方や、一日の終わりにゆったり過ごしたい方に」** へ置換する。

> **メニュー名「睡眠改善コース」は置換対象ではない。** 誤って置換しないよう、置換前に `grep -n "睡眠改善" page-menu.html index.html` で全出現箇所を確認し、コース名の行は残すこと。

- [ ] **Step 3: メニュー名が保持されていることを確認**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
grep -c "睡眠改善コース" index.html page-menu.html
grep -c "眼精疲労・睡眠改善におすすめ" page-menu.html || echo "説明文の置換完了 ✅"
```
Expected: `睡眠改善コース` は変更前と同じ件数で残存 / 「眼精疲労・睡眠改善におすすめ」は0件

- [ ] **Step 4: JSON-LDの商品名と本文が一致しているか確認**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
grep -o '睡眠改善[^"<]*' page-menu.html | sort -u
```
Expected: コース名としての出現のみ（説明文としての「睡眠改善」が消えていること）

- [ ] **Step 5: コミット**

```bash
git add mocks/ && git commit -m "調整: 薬機法配慮（お客様の声に個人差注記・ヘッドスパ説明文を体感表現へ）"
```

---

## Task 9: 配信設定の強化と開発ファイルの隔離

**Files:**
- Modify: `mocks/_headers`
- Modify: `mocks/_redirects`
- Modify: 全11ページ + `assets/page-template.html`（フォント非同期化）
- Modify: `mocks/assets/page-template.html`（フッターリンクのクリーンURL化）

**Interfaces:** なし

**背景（実測）:**
- 実在するヘッダは `x-content-type-options` と `x-robots-tag` のみ。HSTS/X-Frame-Options/Referrer-Policy/Permissions-Policy が無い
- Google Fonts CSS（178KB）がレンダーブロッキング。実測 savings 2,050ms
- `mocks/` に開発用ファイル（`mock-a〜d.html` / `viewer.html` / `_contact.html`）が同居しており、**公開時にnoindexを外すと一緒に公開される**
- `assets/page-template.html` のフッターリンクが旧形式（`page-menu.html`）のままで実ページのクリーンURL（`/menu`）と不一致

- [ ] **Step 1: `_headers` にセキュリティヘッダと開発ファイルの恒久noindexを追加**

```
/*
  X-Robots-Tag: noindex, nofollow, noarchive
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()

# 開発用ファイルは本番公開後も恒久的に検索除外する（上の /* のnoindexを外した後も残す）
/viewer.html
  X-Robots-Tag: noindex, nofollow
/mock-a-premium.html
  X-Robots-Tag: noindex, nofollow
/mock-b-natural.html
  X-Robots-Tag: noindex, nofollow
/mock-c-clean.html
  X-Robots-Tag: noindex, nofollow
/mock-d-irodori.html
  X-Robots-Tag: noindex, nofollow
/_contact.html
  X-Robots-Tag: noindex, nofollow
```

> CSP は マップiframe・Googleフォント・LINEリンクがあり誤設定で表示崩れを起こすため、本タスクでは**追加しない**（別途、実配信リソースを洗い出してから設計する）。

- [ ] **Step 2: `_redirects` に `/page-*` → クリーンURL の明示301を追加**

既存の200リライト行の**後**に追記（順序が重要。200リライトが先にマッチする必要がある）:
```
/page-menu            /menu             301
/page-first-time      /first-time       301
/page-features        /features         301
/page-stores          /stores           301
/page-stores-okaido   /stores/okaido    301
/page-stores-airport  /stores/airport   301
/page-voice           /voice            301
/page-faq             /faq              301
/page-reserve         /reserve          301
/page-tickets         /tickets          301
```

- [ ] **Step 3: Google Fonts を非同期読込に変更（全11ページ＋テンプレ）**

置換前:
```html
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">
```
置換後:
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"></noscript>
```

- [ ] **Step 4: テンプレートのフッターリンクをクリーンURLへ統一**

`assets/page-template.html` の `page-first-time.html` → `/first-time`、`page-menu.html` → `/menu`、`page-features.html` → `/features`、`page-voice.html` → `/voice`、`page-faq.html` → `/faq`、`page-tickets.html` → `/tickets`、`page-stores.html` → `/stores`、`page-stores-okaido.html` → `/stores/okaido`、`page-stores-airport.html` → `/stores/airport`、`page-reserve.html` → `/reserve`

- [ ] **Step 5: 旧形式リンクが残っていないことを確認**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
grep -o 'href="page-[a-z-]*\.html"' index.html page-*.html assets/page-template.html | sort -u || echo "旧形式リンクなし ✅"
```
Expected: `旧形式リンクなし ✅`

- [ ] **Step 6: フォント非同期化で表示が壊れていないことを確認**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
python3 -m http.server 8777 &
sleep 2
cd .screenshots
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node verify-heading-styles.cjs
kill %1
```
Expected: `判定: PASS ✅`（Shippori Mincho が適用されたまま）

- [ ] **Step 7: コミット**

```bash
git add mocks/ && git commit -m "改善: セキュリティヘッダ追加・開発ファイル恒久noindex・フォント非同期化・301明示・テンプレのリンク統一"
```

- [ ] **Step 8: デプロイ後の実測（pushはユーザー指示後）**

```bash
curl -s -D- -o /dev/null https://pspo-relaxation.pages.dev/ | grep -i -E 'strict-transport|x-frame|referrer-policy|permissions-policy'
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://pspo-relaxation.pages.dev/page-menu
```
Expected: 4つのヘッダが返る / `/page-menu` が `301` で `/menu` へ

---

## Task 10: 最終検証と監査レポートの更新

**Files:**
- Modify: `Docs/seo-audit/FULL-AUDIT-REPORT.md`（対応状況を追記）
- Modify: `Docs/seo-audit/ACTION-PLAN.md`（完了項目にチェック）
- Modify: `CLAUDE.md`（開発履歴・TODO更新）

- [ ] **Step 1: 全検証スクリプトを通す**

```bash
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
bash .screenshots/verify-headings.sh
python3 -m http.server 8777 &
sleep 2
cd .screenshots
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node verify-a11y.cjs
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node verify-cta-bar.cjs
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node verify-heading-styles.cjs
kill %1
```
Expected: 全て PASS

- [ ] **Step 2: Lighthouse を全重点ページで再実測**

`/` `/menu` `/stores/okaido` `/voice` のモバイルスコアを取得し、監査時の値（65 / 92 / 68 / 94）と比較した表を作る。

- [ ] **Step 3: レポートに「2026-07-22 対応済み」節を追記**

`FULL-AUDIT-REPORT.md` の末尾に、対応した項目・実測の改善値・**未対応として残した項目とその理由**（睡眠改善コース＝クライアント判断待ち、スタッフ紹介ページ＝情報提供待ち、CSP＝別途設計、LINEボタンのコントラスト＝ブランド規定優先）を記載する。

- [ ] **Step 4: コミット**

```bash
git add Docs/ CLAUDE.md && git commit -m "更新: SEO改善の実施結果を監査レポートへ反映"
```

---

## 対応しない項目（意図的な除外・理由付き）

| 項目 | 理由 |
|---|---|
| メニュー名「睡眠改善コース」の変更 | クライアントの実在メニュー名。ホットペッパー掲載名との整合が必要（ユーザー決定 2026-07-22） |
| `.btn-line` のコントラスト是正（2.26:1） | LINE公式ブランドガイドライン（緑地＋白文字）を優先。ボタンサイズ確保で補う |
| `aggregateRating` / `review` の追加 | 自社掲載の声しか裏付けが無く、構造化データポリシー違反かつ捏造にあたる |
| スタッフ紹介ページの新設 | 施術者の資格・経歴・写真がクライアントから未提供。創作は禁止 |
| プライバシーポリシーページ | 事業者情報の確認が必要。クライアント確認案件 |
| CSP ヘッダ | マップiframe・フォント・外部リンクの洗い出しが先。誤設定で表示崩れのリスク |
| 単品メニュー詳細／アクセス総合ページの新設 | 新規ページ制作は別プロジェクトスコープ |
| ギャラリー・理由セクションの写真の `<img>` 化 | LCP候補ではない**装飾画像**のため `background-image` のまま自前ホスト化のみ行う（Task 6）。alt が付かない状態は残るが、周囲の見出し・本文で内容は伝わる。`<img>`化するとレイアウト（`aspect-ratio`/`object-fit`）の作り直しが必要で、得られるSEO効果に対してリスクが大きい |
| noindex の解除 | 本番ドメイン接続後に実施（`ACTION-PLAN.md` の公開チェックリスト参照） |
