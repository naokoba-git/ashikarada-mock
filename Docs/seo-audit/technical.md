# テクニカルSEO監査レポート — P・SPO リラクゼーション

- 監査日: 2026-07-22
- 対象: https://pspo-relaxation.pages.dev （Cloudflare Pages ステージング）
- ローカル実体: `mocks/index.html` + `mocks/page-*.html`（全11ページ）
- 本番予定ドメイン: `https://pspo-relaxation.jp`
- 前提: **noindex 3層は公開準備中のための意図的措置**。canonical が `pspo-relaxation.jp` を指しているのも意図的（本番ドメイン移行前）。両方とも「公開前チェック項目」として別章に切り出し、Critical課題としては扱わない。

---

## 総合スコア: 68 / 100

内訳（各カテゴリ100点満点の単純平均。noindex/canonical起因の減点は除外）:
| カテゴリ | 判定 | スコア |
|---|---|---|
| クロー ラビリティ | ⚠️ 一部不備 | 55 |
| インデクサビリティ | ✅ 概ね良好 | 80 |
| セキュリティ | ⚠️ 一部不足 | 60 |
| URL構造 | ✅ 良好 | 85 |
| モバイル | ✅ 良好 | 85 |
| Core Web Vitals（ソース推定） | ⚠️ 要改善余地 | 55 |
| 構造化データ | ✅ 良好 | 90 |
| JSレンダリング | ✅ 静的HTML・問題なし | 100 |

---

## Critical（公開前に必ず対応）

### C-1. ソフト404: 未定義URLがすべて `index.html` を200で返す
検証コマンドと結果:
```
curl -I https://pspo-relaxation.pages.dev/this-does-not-exist-xyz123
→ HTTP/2 200, content-type: text/html
```
中身も index.html と同一（Cloudflare Pages の「404.html が無い場合は index.html にフォールバックする」既定挙動）。これはSPA向けの挙動がそのまま残っており、静的サイトとしては**ソフト404**。存在しないURLがクロールされた場合、Googleは重複扱い・インデックス汚染の原因と判定しうる。`/sitemap.xml`（実ファイル無し）も同じ理由で200 HTMLを返す。

**修正方法**:
1. `mocks/404.html` を新規作成（`page-template.html` ベースで「ページが見つかりません」+ 主要導線へのリンク）。
2. Cloudflare Pages は `404.html` をルートに置くだけで自動的に未マッチURLに使用する（`_redirects` の書き換え不要）。
3. 併せて `<meta name="robots" content="noindex">` を404.htmlに明記し、レスポンスは404ステータスになることを `curl -I` で確認する。

### C-2. `sitemap.xml` が存在しない
全11ページ構成にもかかわらずXMLサイトマップが無い。クローラビリティ・インデックス速度に直接影響（公開時にGoogle Search Consoleへ送信する導線が無い）。

**修正方法**: `mocks/sitemap.xml` を追加。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://pspo-relaxation.jp/</loc></url>
  <url><loc>https://pspo-relaxation.jp/menu</loc></url>
  <url><loc>https://pspo-relaxation.jp/first-time</loc></url>
  <url><loc>https://pspo-relaxation.jp/features</loc></url>
  <url><loc>https://pspo-relaxation.jp/stores</loc></url>
  <url><loc>https://pspo-relaxation.jp/stores/okaido</loc></url>
  <url><loc>https://pspo-relaxation.jp/stores/airport</loc></url>
  <url><loc>https://pspo-relaxation.jp/voice</loc></url>
  <url><loc>https://pspo-relaxation.jp/faq</loc></url>
  <url><loc>https://pspo-relaxation.jp/reserve</loc></url>
  <url><loc>https://pspo-relaxation.jp/tickets</loc></url>
</urlset>
```
`robots.txt` の `Sitemap:` 行追加も忘れずに（下記C-3と同時対応）。noindex解除と同時に行う。

### C-3. `robots.txt` が本番用に未整備（全面Disallow のまま）
現状:
```
User-agent: *
Disallow: /
```
これは公開前の意図的措置なので現状は問題ないが、**公開時に差し替える本番用robots.txtが用意されていない**。このまま放置すると公開日にnoindex解除だけ行い robots.txt の更新を忘れるリスクが高い（3層のうち2層しか解除されない事故が起きやすい）。

**修正方法**: 公開時に適用する本番用 `robots.txt` を今のうちに別名（`robots.production.txt`等）で用意しておく。
```
User-agent: *
Disallow:

Sitemap: https://pspo-relaxation.jp/sitemap.xml
```

---

## High

### H-1. セキュリティヘッダ不足（HSTS / CSP / X-Frame-Options が無い）
`curl -I` でレスポンスヘッダを確認した結果、存在するのは `x-content-type-options: nosniff` と `referrer-policy` のみ。以下が欠落:
- `Strict-Transport-Security`（HSTS）— HTTP→HTTPSの301リダイレクト自体は機能しているが、HSTSヘッダが無いためブラウザに「常にHTTPSで」を記憶させられない（初回アクセス時のダウングレード攻撃余地）
- `Content-Security-Policy` — 未設定
- `X-Frame-Options`（またはCSPの`frame-ancestors`）— クリックジャッキング対策が無い
- `Permissions-Policy` — 未設定

**修正方法**: `mocks/_headers` に追記（Cloudflare Pagesは`_headers`でカスタムヘッダを追加可能）。
```
/*
  X-Robots-Tag: noindex, nofollow, noarchive
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), camera=(), microphone=()
```
CSPは外部リソース（Google Fonts, readdy画像CDN, HotPepper/LINE遷移リンク, Googleマップ埋め込みiframe）を洗い出してから段階導入を推奨（いきなり厳格にすると地図iframeやフォント読み込みが壊れるため、`report-only`モードで先行検証が安全）。

### H-2. LCP候補画像がすべてCSS `background-image`（`<img>`未使用）でリソースヒント無し
`index.html` を確認したところ `<img>` タグは2枚（ロゴ・QR）のみで、ヒーロー写真を含む主要な写真6箇所はすべてCSS `background-image`（`storage.readdy-site.link` の外部ホスト画像・計13箇所参照）。
- ブラウザのLCP候補要素検出は`background-image`も対象になり得るが、`<img fetchpriority="high">`や`<link rel="preload" as="image">`のような優先度制御ができない。ヒーロー画像はCSSファイル解析後に発見されるため、発見が遅れがちでLCP指標（現行の良好基準 <2.5s）が悪化しやすい。
- `width`/`height`属性も無いため、CSSで明示的なアスペクト比・高さが確保されていない場合はCLS要因になりうる（要CSS側確認）。
- 外部ホスト（readdy.link）はサイト側でキャッシュ制御・WebP配信の最適化ができず、パフォーマンスとインデックス性（画像検索評価）の両面で不利。CLAUDE.mdのTODOにも「readdy画像の自前ホスト化」と記載済みだが、SEO監査の観点でも優先度は高い。

**修正方法**:
1. ヒーロー画像だけでも `<img>` に置き換え、`fetchpriority="high"` + `width`/`height` を明示。
2. または `<link rel="preload" as="image" href="...">` をヒーロー背景画像に対して`<head>`に追加。
3. 中期対応: readdy CDN画像を自サイト配下（`/assets/img/`）にダウンロードし、`astro:assets`等を使わない静的構成でも`.webp`変換＋`width/height`指定で配信。

### H-3. `/page-menu.html` 等「実ファイル名」がCloudflare既定機能で自動的にクリーンURLへ308リダイレクトされ、`_redirects`のカスタムクリーンURLと二重経路になっている
検証:
```
curl -I https://pspo-relaxation.pages.dev/page-menu.html
→ 308 Location: /page-menu   （Cloudflare Pages既定の自動クリーンURL機能）
curl -I https://pspo-relaxation.pages.dev/page-menu
→ 200（実ファイルがそのまま表示される。canonicalは正しく /menu を指す）
```
つまり同一コンテンツに対して `/page-menu.html`（308）→ `/page-menu`（200・実体）→ `/menu`（200・`_redirects`の意図した正規URL）という**3種類のURLパスが並存**している。canonicalタグが `/menu` を指しているため実害は限定的だが、`/page-menu` が200で直接到達可能なままなのは意図しない重複URLの温存であり、内部リンクや外部被リンクが誤って `/page-menu` 系に向かうと評価分散のリスクが残る。

**修正方法**: `_redirects` に実ファイル名への直接アクセスをクリーンURLへ寄せる301を明示的に追加する（Cloudflareの暗黙の自動リダイレクトに頼らない）。
```
/page-menu           /menu           301
/page-features       /features       301
/page-first-time     /first-time     301
/page-voice           /voice         301
/page-faq             /faq           301
/page-reserve         /reserve       301
/page-tickets         /tickets       301
/page-stores-okaido   /stores/okaido 301
/page-stores-airport  /stores/airport 301
/page-stores          /stores        301
```
（既存の200リライト行より**前**に置くと衝突するため、順序はCloudflareの「最初にマッチした行が優先」仕様を確認の上、現行の200リライトとは別ブロックとして分離すること。）

---

## Medium

### M-1. hreflang未設定（多言語想定なしなら現状で問題ないが明示推奨）
全ページ `<html lang="ja">` のみで `hreflang`/`rel="alternate"` は無し。単一言語（日本語のみ）サイトである限り必須ではないが、`lang="ja"` に加えて `<link rel="alternate" hreflang="ja" href="...">` の自己参照を1行追加しておくと将来の多言語展開（英語版等）の布石として安全。現状は多言語計画が無いため優先度Medium。

### M-2. モバイルタップターゲット: モバイルメニューのリンクに明示的な `padding`/`min-height` が無い
`assets/page-template.html` の `.mobile-menu a{font-size:17px; ...}` にはpadding指定が無く、Flexの`gap:18px`のみでタップ領域を確保している状態。フォントサイズ17px・行間のみでは44×44px推奨のタップ領域を下回る可能性がある。

**修正方法**:
```css
.mobile-menu a{padding:10px 0;display:block;min-height:44px}
```

### M-3. PCナビ（`.menu a`）のタップ領域も `padding:4px 0` のみ
デスクトップ中心のため影響は小さいが、タブレット・2-in-1端末でのタッチ操作を考慮するなら同様にpadding拡張が望ましい。

### M-4. `X-Content-Type-Options` はあるが `Content-Type` の文字コード明示は良好、ただし `Cache-Control: public, max-age=0, must-revalidate` は静的アセット（CSSインライン以外の画像・フォント）にも同一設定
現状、CSS/JSはHTMLにインライン化されているため大きな問題ではないが、`assets/`配下の画像・SVG・PNGにも同じ`max-age=0`が適用される場合、リピート訪問時のキャッシュヒットが得られずパフォーマンスに軽微な影響。`_headers`でパス別にキャッシュ期間を分けるのが望ましい。
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

---

## Low

### L-1. `og:image` / `twitter:image` が外部CDN（readdy）を参照
SNSシェア時の画像取得が外部依存になる。自前ホスト化（H-2と同時対応）でOGP画像の安定性も向上。

### L-2. `sitemap.xml` の `Sitemap:` 指定がrobots.txtに無い（C-3と連動）
公開用robots.txt整備時に同時対応するため独立課題としては軽微。

### L-3. 内部リンク構造は良好（孤立ページなし）
`index.html` のグローバルナビ・フッターから全10下層ページへ内部リンクが張られており、孤立ページ（オーファンページ）は確認されなかった。改善不要、現状維持でよい。

---

## 良好だった点（そのまま維持）

- **クリーンURL設計**は妥当。`_redirects`で全ページ200リライト、深い階層（`/stores/okaido`）を浅い階層より先に定義しておりマッチ順序も正しい。
- **canonicalタグ**は全11ページに実装済みで、本番ドメイン（`pspo-relaxation.jp`）を正しく指している（ステージング段階の意図的設計として妥当）。
- **構造化データ**: Organization / WebSite / DaySpa（LocalBusiness系）×2店舗 + 各ページBreadcrumbList + FAQPage（23問）を実装済み。`geo`（GeoCoordinates）と`hasMap`も6箇所に追加済みで座標とマップ埋め込みの整合性も取れている。
- **viewport meta**は全11ページに統一設定済み（`width=device-width, initial-scale=1.0`）。
- **HTTP→HTTPSリダイレクト**は301で正しく機能（`http://pspo-relaxation.pages.dev/` → `https://`）。
- **JSレンダリング**: 完全な静的HTML構成のため、JSレンダリング待ちによるインデックス遅延リスクはゼロ。Cloudflare Pagesの配信もCDNエッジのため応答は高速。
- **画像alt属性**: 確認できた`<img>`タグ（ロゴ・QR）には適切なalt文言が設定済み。

---

## 公開時チェック項目（Critical/High扱いにしない・意図的な現状のため）

これらは**現時点では正しい設計判断**だが、本番ドメイン切替・一般公開のタイミングで**必ず解除・更新が必要**な項目。抜け漏れ防止のため独立してリストアップする。

1. **noindex 3層の解除**
   - `<meta name="robots" content="noindex,...">`（全11ページ）
   - `robots.txt`（`Disallow: /` → 本番用に差し替え。C-3で用意した`robots.production.txt`を適用）
   - `_headers` の `X-Robots-Tag: noindex, nofollow, noarchive` 行を削除
2. **canonical / OGP / JSON-LD の `url`** はすでに `pspo-relaxation.jp` 表記のため、**ドメイン移行自体（NS切替）が完了すればそのまま整合する**（CLAUDE.mdのTODO「ネームサーバー切替」と連動。切替完了前にnoindexだけ解除しないこと）。
3. **Google Search Console** への物件登録＋サイトマップ送信（C-2のsitemap.xml作成後）。
4. **404.html の本番確認**（C-1対応後、公開ドメインで再度 `curl -I` にてステータス404を確認）。

---

## 検証に使用したコマンド（再現用）

```bash
# ステージング環境の生ヘッダ確認
curl -sS -D - -o /dev/null https://pspo-relaxation.pages.dev/
curl -sS -D - -o /dev/null https://pspo-relaxation.pages.dev/menu
curl -sS -D - -o /dev/null https://pspo-relaxation.pages.dev/page-menu.html
curl -sS -D - -o /dev/null https://pspo-relaxation.pages.dev/this-does-not-exist-xyz123
curl -sS https://pspo-relaxation.pages.dev/robots.txt
curl -sS -D - -o /dev/null https://pspo-relaxation.pages.dev/sitemap.xml
curl -sS -D - -o /dev/null http://pspo-relaxation.pages.dev/

# ローカルソース確認（mocks/ 配下・読み取りのみ）
cat mocks/_redirects
cat mocks/_headers
cat mocks/robots.txt
grep -o '<link rel="canonical"[^>]*>' mocks/page-*.html mocks/index.html
```
