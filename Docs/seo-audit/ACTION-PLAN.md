# SEO改善アクションプラン

- 作成日: 2026-07-22
- 元データ: `FULL-AUDIT-REPORT.md`（SEOヘルススコア 67/100）
- 対象: https://pspo-relaxation.pages.dev → 公開後 https://pspo-relaxation.jp

判断が必要な項目には ⚠️ を付けています。それ以外は指示があればこちらで実装可能です。

---

## Critical — 公開前に必ず対応

### C-1. ヒーロー画像の `<img>` 化＋WebP自前ホスト化
- **効果**: モバイルLCP **13.4秒 → 約3秒**（実測ベース試算）。同時に **alt属性・画像検索・fetchpriority** も解決
- **対象**: `index.html` のヒーロー、`page-stores-okaido.html` / `page-stores-airport.html` のヒーロー ほか計6箇所
- **手順**:
  1. readdy から現行画像をダウンロード → `cwebp -q 82` で変換 → `mocks/assets/img/` に配置
  2. `.hero-bg{background:url(...)}` を `<img class="hero-img" src="..." alt="..." width="..." height="..." fetchpriority="high">` ＋ CSS `object-fit:cover` に置換
  3. `<link rel="preload" as="image" href="/assets/img/hero.webp" fetchpriority="high">` を `<head>` に追加
  4. 旧ブラウザ用に `<picture>` で JPEG フォールバック
- **検証**: Lighthouse モバイルで LCP < 2.5s / Performance 90+ を再計測
- **工数**: 2〜3時間

### C-2. `404.html` の作成
- **効果**: ソフト404（存在しないURLが200でTOPを返す）が自動解消
- **手順**: `mocks/404.html` を作成（Cloudflare Pages が自動的に404ステータスで返す）。既存テンプレートのヘッダー／フッターを流用し、主要ページへの導線を置く
- **検証**: `curl -o /dev/null -w '%{http_code}' https://.../存在しないURL` が `404` を返すこと
- **工数**: 15分

### C-3. ⚠️ 薬機法・景表法リスクへの対応
| 対象 | 対応 | 判断者 |
|---|---|---|
| お客様の声に「※効果の感じ方には個人差があります」注記追加 | **すぐ実施可・リスク低** | 実施してよいか要確認 |
| 「睡眠改善コース」のメニュー名 | 効能を保証しない愛称へ変更（例: おやすみリラックスコース） | **クライアント判断必須**（実在メニュー名・ホットペッパー掲載名との整合） |
| 「眼精疲労・睡眠改善におすすめ」 | 体感・提案型表現へ書き換え | クライアント確認推奨 |

> メニュー名の変更は JSON-LD・価格表・下層ページの複数箇所に波及するため、決定後に一括で行う。

---

## High — 公開後1週間以内

### H-1. タップ領域の是正
```css
/* assets/page-template.html および全11ページ */
.ham{padding:11px 12px;margin:-11px -12px}      /* 19×27px → 44×44px以上 */
.foot-col li{margin-bottom:0}
.foot-col a{display:inline-block;padding:9px 0} /* 19px高 → 37px高 */
```
- **対象**: 110箇所超。**モバイル唯一のナビが押しにくい状態**の解消
- **工数**: 30分

### H-2. CTAボタンのコントラスト是正
```css
.btn-gold{background:var(--gold-deep)}  /* 3.41:1 → 5.00:1（AA適合）*/
.btn-gold:hover{background:#6f5530}     /* hover を更に濃く */
```
- **新色の追加は不要**（既存パレット内で解決）
- ⚠️ ゴールドがやや濃くなるためトンマナへの影響を目視確認 → 必要ならクライアント確認
- **LINEボタン(2.26:1)** はLINE公式ブランド規定との衝突があるため**現状維持を推奨**。サイズ拡大で補う
- **工数**: 15分＋確認

### H-3. `Organization.logo` の差替
```json
"logo": "https://pspo-relaxation.jp/assets/logo-pspo.png"
```
- 現状は人物写真（`IMG_1861.jpeg`）を指しておりロゴ要件違反
- ⚠️ 本番ドメイン切替前は `pages.dev` 版にするか要判断
- **工数**: 10分（全11ページ）

### H-4. 店舗詳細ページの BreadcrumbList 3階層化
- `ホーム → 大街道店` → `ホーム → 店舗案内 → 大街道店`
- 対象は店舗詳細2ページのみ（`/menu` 等は2階層で正しい）
- **工数**: 20分

### H-5. モバイル下部固定CTAバーの追加
- 下層10ページ中9ページでファーストビューにCTAが無い（`/reserve` 自身も）
- 電話 / LINE / 予約 の3導線を画面下部に固定
- ⚠️ デザインへの影響が大きいため要方針確認
- **工数**: 2時間

### H-6. Google Fonts のレンダーブロッキング解消
- 実測 savings **2,050ms**
- 自前WOFF2ホスト（`font-display:swap` + preload）か非同期読込
- **工数**: 1〜2時間

### H-7. セキュリティヘッダの追加（`mocks/_headers`）
```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```
- ⚠️ CSP はマップiframe・Googleフォント・外部画像があるため慎重に設計（先に上記4つのみ）
- **工数**: 30分＋検証

---

## Medium — 公開後1ヶ月以内

| # | 施策 | 効果 |
|---|---|---|
| M-1 | **スタッフ紹介ページの新設** | E-E-A-T の Expertise 20点を直接改善。⚠️ クライアントから施術者情報・資格・写真の提供が必要 |
| M-2 | プライバシーポリシーページの新設 | 信頼性・法令面 |
| M-3 | `DaySpa.image` を店舗別写真に差替 | 検索結果で2店舗を区別 |
| M-4 | `Organization` ↔ `DaySpa` の `@id` 連携 | エンティティ関係の明示 |
| M-5 | 単品メニュー詳細ページ／アクセス総合ページの新設 | 「松山 足つぼ」「松山 マッサージ 駐車場」等の受け皿 |
| M-6 | `_redirects` に `/page-*` → `/*` の明示301追加 | URL3系統並存の完全解消（canonicalで実害は限定的） |
| M-7 | 本文 `--muted` を `#67726b` 前後へ微調整 | 4.39:1 → AA適合 |
| M-8 | `hasOfferCatalog` / `Service` で実料金を構造化 | 検索結果の情報量増 |

---

## 公開切替時のチェックリスト（noindex解除）

現状の noindex は**意図的**。公開時に以下を漏れなく実施する。

- [ ] 全11ページの `<meta name="robots" content="noindex, nofollow, noarchive">` を削除
- [ ] `mocks/_headers` の `X-Robots-Tag: noindex...` を削除
- [ ] `mocks/robots.txt` を本番版に差替（`Disallow: /` を解除・`Sitemap:` 行を追加）
- [ ] `Docs/seo-audit/sitemap.xml` を `mocks/sitemap.xml` へ移設
- [ ] canonical が `https://pspo-relaxation.jp/...` を指すことを再確認（現状すでに正しい）
- [ ] Google Search Console にプロパティ登録・サイトマップ送信
- [ ] Googleビジネスプロフィールとサイトの NAP（店名・住所・電話）完全一致を確認
- [ ] 公開直後に `curl` で noindex が消えたことを実測確認

---

## 実施しないこと（意図的な除外）

- **`aggregateRating` / `review` の構造化データ追加** — 自社掲載の声しか裏付けが無く、Googleの構造化データポリシー違反かつ捏造にあたる。実施するならGoogleビジネスプロフィールの実数値のみ
- **実績数値・資格の創作** — E-E-A-T改善はクライアントからの実情報提供が前提
- **`WebSite.potentialAction`（サイト内検索）の追加** — サイト内検索機能が存在しないため
