# 修正履歴

## 2026-07-23（セッション9・ドメイン移行の段取り確定／DNS実測／Cloudflare MCP接続）

### ドキュメント: 2ドメインのDNS実測結果と301転送方針を記録
- **変更ファイル**: `CLAUDE.md`
- **内容**: 「🔜 次セッション開始点」を全面改稿。旧日本語ドメインを301で新ドメインへ集約する方針、2ドメインのDNS実測表、301がワイルドカード1本で足りる根拠（旧sitemapのURL構造が新と完全一致）、段階1〜3の実行手順を追記
- **理由**: ユーザーから「旧ドメインも Cloudflare に登録して301転送」という新方針が出たため、手順を再設計する必要が生じた。あわせて dig / curl で実測した値（`182.48.49.102` の逆引き＝`www2192.sakura.ne.jp`、旧ドメインのMX/TXTがゼロ＝メール未使用、新ドメインapexにWeb実体なし）は `/clear` で失うと再取得コストが高いため正本に固定した

### 設定変更: Cloudflare 公式 API MCP サーバーを接続
- **変更ファイル**: `~/.claude.json`（プロジェクトスコープのMCP設定）
- **内容**: `claude mcp add --transport http cloudflare-api https://mcp.cloudflare.com/mcp`。OAuth認可でDNS・ゾーン作成・Pages・リダイレクトルールをClaudeから直接操作できる
- **理由**: Cloudflare操作をClaudeに委任するため。当初は手動APIトークンの作成手順を案内したが、ユーザーの「MCPで繋げないの？」の指摘を受けて公式ドキュメントを確認し、公式MCPサーバー（OAuth・トークン作成不要）が存在することが判明したため方針を撤回・差し替えた

### 注記: サイト本体のコード変更なし
- `mocks/` 配下のHTML・CSS・アセットの変更はゼロ。本番 `pspo-relaxation.pages.dev` の表示に影響する変更は行っていない

## 2026-07-23（セッション8・プライバシーポリシー／会社概要／ファビコン／フィルター実装）

### 機能追加: プライバシーポリシーページを新設
- **変更ファイル**: `mocks/page-privacy.html`（新規）, `mocks/_redirects`, `mocks/sitemap.xml`, 全13ページ＋`mocks/assets/page-template.html`（フッター）
- **内容**: 全10条（取得情報／利用目的／第三者提供／外部サービス3社／Cookie／安全管理／開示請求／未成年／変更／事業者情報）。クリーンURL `/privacy`＋`/page-privacy`からの301正規化。全ページのフッター最下部に規約リンク（タップ領域44px実測）
- **理由**: 個人情報保護法上ポリシーの掲示が必要だが、ページもリンクも一切存在しなかった。記述はサイトの実態に合わせ、フォーム・GA/GTMが無いことをgrepで確認したうえで「入力フォームはありません」「アクセス解析ツール未使用」と明記。特商法表記は店頭決済のみで通信販売に非該当のため不要と判断

### 機能追加: 会社概要ページを新設・事業者情報を全面反映
- **変更ファイル**: `mocks/page-company.html`（新規）, `mocks/page-privacy.html`, `mocks/_redirects`, `mocks/sitemap.xml`, 全14ページ＋テンプレ
- **内容**: 株式会社三福テンダーネス／〒790-0964 愛媛県松山市中村2丁目1-3 三福本社ビル3階／代表取締役 村上 晃平。クリーンURL `/company`。フッター「会社概要」列に内部リンク「運営会社」を追加。Organization構造化データに `legalName` / `address`（postalCode含む）を追加
- **理由**: クライアントから事業者情報の提供を受けた。従来フッターの会社概要は外部リンク2本のみで、自社の運営主体を示すページが存在しなかった

### 変更: 個人情報保護の表記を組織名義の担当窓口へ（個人名・メールを削除）
- **変更ファイル**: `mocks/page-privacy.html`, `mocks/page-company.html`, 全14ファイル（JSON-LD）
- **内容**: 「個人情報保護管理者：個人名」→「**個人情報保護担当窓口：株式会社三福テンダーネス 個人情報保護担当窓口**」。`kamakura@3puku.co.jp` を本文とOrganization構造化データの`email`から完全削除し、開示請求等の連絡先を各店舗の電話へ集約
- **理由**: プライバシーマークを取得していないため責任者の個人名を記載する必要がなく、クライアント指示により組織名義へ変更。当該メールは担当者個人が特定されるため非掲載

### 機能追加: ファビコン一式
- **変更ファイル**: `mocks/favicon.ico` / `favicon-32x32.png` / `apple-touch-icon.png` / `icon-192.png` / `icon-512.png` / `site.webmanifest`（すべて新規）, 全13ページ＋テンプレ
- **内容**: `assets/logo-pspo.png` の「P」グリフ（bbox x28-104 / y12-88 の77×77）を抽出し、紺 `#113062` 地に白抜きで再構成。ico はマルチサイズ（16/32/48/64）、apple-touch-icon はiOSの角丸トリミングを考慮し余白多め。`theme-color` はヘッダーと同色 `#fffdf9`
- **理由**: 全ページでファビコン参照がゼロで、タブ・ブックマーク・ホーム画面追加がデフォルトアイコンのままだった。**ロゴ全体は4行構成のため16pxでは判読不能**であり、正方形マークを新規に起こす必要があった

### バグ修正: お客様の声のフィルターが動作していなかった
- **変更ファイル**: `mocks/page-voice.html`
- **内容**: 12件のレビューに `data-tags` を付与（店舗は`.who`、メニューはバッジ文言から機械導出。足底→足つぼ／アロマ→アロマ／全身→横揉み施術）。しぼり込みJS・件数の`aria-live`通知・`aria-pressed`・`role="group"`・フォーカスリングを追加。ボタン高さを36→44pxへ。「※ フィルター機能は表示イメージです。」の注記を削除
- **理由**: 本番サイトで動かないUIを言い訳付きの注記とともに公開している状態だった（モック時代の名残）。全フィルターで1件以上ヒットすることを本番URLで実測確認（すべて12/大街道7/空港5/横揉み8/アロマ1/足つぼ3）

### 改善: 配信ファイルの整備と公開ディレクトリの掃除
- **変更ファイル**: `mocks/sitemap.xml`（移設）, `mocks/robots.txt`, `mocks/vercel.json`（削除）, `Docs/公開切替手順.md`（新規）
- **内容**: ①`sitemap.xml` を `Docs/seo-audit/` から公開ディレクトリ `mocks/` へ移設し13URLへ拡張 ②`robots.txt` に「公開前の暫定設定」であることをコメント明記 ③Vercel時代の遺物 `vercel.json` を削除 ④`Docs/公開切替手順.md` を新設し、noindex 3層解除・robots本番版・GSC登録・`curl`での実機検証コマンドを正本化
- **理由**: `sitemap.xml` が公開ディレクトリ外にあり `/sitemap.xml` が404だった。`vercel.json` は `https://.../vercel.json` で誰でも取得できる状態だった。公開当日の作業ミスを防ぐため手順を正本化

## 2026-07-22（セッション7・見出し構造是正＋SEO監査全面対応）
### バグ修正: 見出しレベルの飛び（h2→h4/h5・h1→h3）を全12ページで是正
- **変更ファイル**: `mocks/*.html`（全11ページ＋`404.html`）, `mocks/assets/page-template.html`
- **内容**: 見出しを「サイズで選ぶ」運用になっていたため h2→h4 / h2→h5 の飛び、`page-features.html` の h1→h3 直下りが発生。タグを h3/h2 に是正すると同時に CSS セレクタも改名（`.reason h4`→`h3` / `.voice h5`→`h3` / `.step-line .st h4`→`h3` / `.parking-hi h3`→`h2`）し**見た目は完全据え置き**。フッターの `<h5>` は見出しではなくラベルなので `<p class="foot-title">` ＋ `<nav aria-label>` に置換
- **理由**: ユーザー指摘。h1は1ページ1つ・小見出しはh3・h4以下は原則使わない、という構造ルールに統一。見出しレベル＝意味であり見た目はCSSで与える

### 改善: TOPのH1に地域＋業種を明示（SEO）
- **変更ファイル**: `mocks/index.html`
- **内容**: H1を `<span class="eyebrow">愛媛・松山のマッサージ・リラクゼーションサロン</span>` ＋ `<span class="h1-main">心も体も、ほぐれる時間を。</span>` の2段構成に。PC/SPともレイアウト位置は実測ベースで完全一致させた（`@media(min-width:981px)` にのみ `padding-top:6px`）
- **理由**: H1がキャッチコピーのみで地域・業種の検索意図に応答していなかった

### 改善: SEO監査（6並列サブエージェント）→ 10タスクの改善を実装・デプロイ
- **変更ファイル**: `mocks/` 13ファイル, `mocks/_headers`, `mocks/_redirects`, `mocks/404.html`（新規）, `mocks/assets/img/`（新規・WebP 5点）
- **内容**: ①ソフト404解消（未定義URLが200でTOPを返していた）→`404.html`追加 ②タップ領域44px確保＋CTAコントラストAA適合（`btn-gold`を`gold-deep`へ・`--muted`を`#67726b`へ） ③モバイル下部固定CTAバー追加（電話2店舗/LINE/予約・クラス名は既存`.cta-tel`との衝突回避で`cta-bar-*`） ④外部CDN(readdy)依存の画像5点を自前ホスト化＋WebP変換（-65〜67%） ⑤ヒーローを`<img>`化し`preload`+`fetchpriority=high`（LCP対策） ⑥構造化データ修正（logo誤指定・`@id`連携・店舗別image・パンくず3階層・実料金OfferCatalog） ⑦薬機法配慮（お客様の声に個人差注記／ヘッドスパ説明文を体感表現へ） ⑧セキュリティヘッダ（HSTS/X-Frame-Options/Referrer-Policy/Permissions-Policy） ⑨開発用HTML（mock-a〜d/viewer/_contact）を`_headers`で恒久noindex ⑩`_redirects`に`.html`→クリーンURLの301明示、テンプレの旧リンク24件（実在しない`mock-a-real.html`含む）を修正
- **理由**: SEO監査スコア67/100。実測結果はモバイルTOP **65→99・LCP 13.4s→2.0s(-85%)** / `/stores/okaido` 68→100 / `/menu` 92→100 / `/voice` 94→100 / デスクトップTOP 100（LCP 0.6s）
- **維持した制約**: メニュー名「睡眠改善コース」は変更せず／`aggregateRating`・`review`構造化は裏付けなしのため追加せず／LINE緑`#06c755`とゴールドは据え置き／noindex 3層は公開時まで維持

## 2026-07-23（セッション6）
### バグ修正: TOPグローバルメニューがページ内アンカーで下層と不整合＋リンク切れ
- **変更ファイル**: `mocks/index.html`
- **内容**: TOPのナビ12リンク（PC6+モバイル6）を`#first`等のアンカー→`/first-time`等クリーンURL別ページに統一。`初めての方へ`(#first)/`よくある質問`(#faq)はアンカー先セクションが存在せずリンク切れだった（独立ページは実在）→接続。本文CTA`メニュー・料金を見る`(#price)はページ内スクロールのため据置
- **理由**: 同じラベルがTOPではページ内スクロール・下層では別ページ遷移と挙動が割れ、かつ2件がリンク切れ。下層ナビの形に統一

### バグ修正: 店舗詳細ページのロゴが404（相対パス×ネストしたクリーンURL）
- **変更ファイル**: `mocks/*.html`（全11ページ）, `mocks/assets/page-template.html`
- **内容**: ロゴ/QRの相対パス`src="assets/..."`をroot-relative`src="/assets/..."`に統一（計12箇所+テンプレ）。`/stores/okaido`のようにURLが1階層深いページで相対パスが`/stores/assets/...`に解決され404→ロゴ切れになっていた。単層URL(`/menu`)では偶然動いていた
- **理由**: ライブで店舗ページのロゴがエラー。クリーンURLのネスト階層で相対パスが壊れる地雷（memory `project_cloudflare-pages-clean-url-behavior`）

### 変更: 店舗マップを公式埋め込みコード（店名ラベル付き）に刷新
- **変更ファイル**: `mocks/page-stores-okaido.html`, `mocks/page-stores-airport.html`, `mocks/index.html`, `mocks/page-stores.html`
- **内容**: 住所文字列検索の埋め込み→クライアント提供の共有リンクを解決し**公式pb埋込コード**に差替（店名`あしカラダ`ラベル付き情報カード表示）。提供コードの中心が両店とも同一だったため各店の正確な座標へ中心補正、ズームを市域`1d26514`→街区`1d3000`に調整。JSON-LD(DaySpa)に`geo`座標+`hasMap`を全6箇所（index/一覧の@graph各2店+詳細2ページ）追加
- **理由**: マップの位置が不正確・店名ラベル無し。座標はクライアント提供の公式Googleマップリンク由来。マップと構造化データの位置を一致

## 2026-07-23
### 機能追加: Cloudflare Pages デプロイ（Phase1・クライアント共有先を移行）
- **変更ファイル**: `mocks/_headers`（新規）, GitHub連携（Cloudflare側設定）
- **内容**: Cloudflare Pages でプロジェクト`pspo-relaxation`作成（GitHub連携`ashikarada-mock`限定・出力`mocks`・Free）。`https://pspo-relaxation.pages.dev`公開。未pushだった9コミットをpush。`_headers`で`X-Robots-Tag: noindex,nofollow,noarchive`を付与（Vercel`vercel.json`はCF無効のため移植・noindex3層復活）
- **理由**: 本番ホスティングをVercel→Cloudflare Pagesへ移行（静的で完全無料・商用OK・暴走課金リスク低）

### 変更: 実サイト化（比較ビューア退避・TOPをindex.htmlに）
- **変更ファイル**: `mocks/index.html`（旧ビューア→`viewer.html`にリネーム）, `mocks/mock-a-real.html`→`mocks/index.html`, 下層10ページのhomeリンク
- **内容**: 実TOPを`index.html`にリネームし`/`でネイティブ配信。旧比較ビューア（A/B/C/D切替）は`viewer.html`へ退避（内部保全）。下層のhomeリンク`mock-a-real.html`→`/`
- **理由**: ユーザー指示「完全に実際と同じようにやって」＝案確定後はモック切替を見せず本番同一に（memory `feedback_client-preview-production-identical`）

### バグ修正: クリーンURL未接続で下層ページに到達不能だった不具合
- **変更ファイル**: `mocks/_redirects`（新規）, `mocks/index.html`, 下層10ページのナビ（`page-*.html`→クリーンURL 237箇所）
- **内容**: TOPは`/menu`等クリーンURLでリンクするが該当ファイル無く、未定義URLがindex.htmlに200フォールバック→クリックしてもTOP再表示だった。`_redirects`で`/menu /features /stores/okaido`等→`page-*`へ200リライト（宛先は`.html`無しでURL保持）。下層ナビもクリーンURLに統一
- **理由**: TODOの「クリーンURL設定」未実装分が実サイト表示で露呈。CF Pages固有挙動は memory `project_cloudflare-pages-clean-url-behavior`

## 2026-07-22
### 機能追加: お得なチケットページ
- **変更ファイル**: `mocks/page-tickets.html`（新規）, `mocks/assets/page-template.html`, `mocks/*.html`, `mocks/index.html`, `mocks/.screenshots/_shot.cjs`
- **内容**: ライブ`/tickets`をA案テイストで再現（全身60分回数券 1枚¥3,700／5枚¥18,500[一番お得]／10枚¥37,000＋ご利用について）。導線をフッター「メニュー」列＋モバイルメニュー最下部ボタンに追加
- **理由**: クライアントサイトにお得なチケットページが追加されたため

### 機能追加: 新ドメイン向けメタ＋構造化データ(JSON-LD)
- **変更ファイル**: 全11ページ＋`assets/page-template.html`の`<head>`
- **内容**: canonical/OGP/Twitterカード＋JSON-LD（Organization/DaySpa[LocalBusiness]×2/BreadcrumbList/page-faqにFAQPage23問）。全URLを`https://pspo-relaxation.jp`のクリーンURLで
- **理由**: 新ドメイン`pspo-relaxation.jp`への移行準備。noindexは公開時まで維持・geoは捏造せず省略

### スタイル: 店舗名リブランド あしカラダ→P・SPO リラクゼーション
- **変更ファイル**: 確定A案12ファイル＋`index.html`
- **内容**: タイトル/メタ/OGP/JSON-LD名/本文/コピーライト/altを新名称に一括置換。ヘッダー/フッターのロゴ`.mark`2箇所は「あしカラダ」のまま保持（実ロゴ待ち）。TOPのtitle/meta冗長も解消
- **理由**: 店舗名変更。ロゴデータは後日受領のためロゴ部分は据え置き指示

### 機能追加: ヘッダーロゴ画像化
- **変更ファイル**: 確定A案12ファイル, `mocks/assets/logo-pspo.png`（新規）
- **内容**: ヘッダーのテキストロゴを`<img src=assets/logo-pspo.png>`に差替（height54px/SP42px・MATSUYAMA RELAXATIONサブタイトル削除）。フッターは暗地対応でテキスト維持し`word-break:keep-all`で折返し整形
- **理由**: 実ロゴ提供。白背景/非透過のため暗地フッターは画像化せずテキスト。透過版受領後にフッターも差替予定

## 2026-06-27
### 設定変更: 公開プレビュー本番デプロイ（下層9ページ・noindex 3層ライブ検証）
- **対象**: GitHub `naokoba-git/ashikarada-mock` (main) ＋ Vercel プロジェクト `mocks`（alias `mocks-neon.vercel.app`）
- **内容**:
  - `git push origin main`: commit `d8fad6e`（下層9ページ＋共通テンプレート＋ビューア2段化＋検証スクリプト） を main に push
  - `vercel deploy --prod --cwd mocks --yes`: 本番デプロイ（19.1MB／ビルド10秒／自動エイリアス）→ `https://mocks-neon.vercel.app/` で全10ページ・案A〜D切替がクライアント側でレビュー可能に
  - noindex 3層を本番ライブ環境で `curl -sI` 検証: HTTP `x-robots-tag: noindex, nofollow, noarchive` / `robots.txt` `Disallow: /` / 各HTMLの `<meta name="robots">` 全て生きていることを確認
- **理由**: 下層9ページが揃ったタイミングでクライアントレビュー用URLが必要。検索インデックス露出は依然NGなので3層を本番で再検証
- **コスト管理**: `vercel.json` の `ignoreCommand: exit 0`（git push 連動の自動デプロイを無効化）と「明示指示時のみ `CLAUDE_ALLOW_PUSH=1` プレフィックスで実行」運用は維持

### 機能追加: 下層9ページ一括生成（A案展開・サブエージェント並列）
- **変更ファイル**: `mocks/assets/page-template.html`（新規・共通テンプレート）, `mocks/page-first-time.html` / `page-menu.html` / `page-features.html` / `page-stores.html` / `page-stores-okaido.html` / `page-stores-airport.html` / `page-voice.html` / `page-faq.html` / `page-reserve.html`（全9ページ新規）, `mocks/index.html`（下層ページ切替バー追加）, `mocks/.screenshots/`（新規・Playwright検証スクリプト&PNG20枚）
- **内容**: TOP（`mock-a-real.html`）と同じ配色変数・フォント・CTA設計・ヘッダー/フッター/モバイルメニューを共有する下層9ページを一気に作成。
  - `page-template.html`: A案ヘッダー/フッター/CTA/モバイルメニュー/全CSSをまとめた骨格（`<!-- CONTENT -->` 差込み式）
  - `page-first-time`: 来店フロー5ステップ／持ち物・服装／所要時間／初回特典／FAQ6問
  - `page-menu`: 人気の組合せ（会員/一般2カラム）／単品メニュー4カテゴリ／ピースポ会員案内／注意事項
  - `page-features`: 4特徴を交互大カードで詳細／お悩み別おすすめ6ケース
  - `page-stores`: 2店舗比較表／大カード2件／共通サービス3つ
  - `page-stores-okaido` / `page-stores-airport`: ヒーロー+店舗情報+地図iframe+アクセス3カード+ギャラリー3枚+特色3点
  - `page-voice`: 数値サマリー（4.8/5.0・15年・9割）／レビュー12件／フィルター見せ／投稿導線
  - `page-faq`: 5カテゴリ別アコーディオン（料金/施術/予約/店舗/会員）計24問・テンプレ末尾のスクリプトで動作
  - `page-reserve`: 3予約方法カード（Hot Pepper/電話/LINE）／予約フロー4ステップ／注意事項
  - `index.html`: 上段4案タブはそのまま、下段に「A案 ／ ページ」ピル型ナビ10件を追加。A案以外を選ぶと下段は自動で隠れる
- **理由**: A案確定後の本実装に向け、サイト全体構造を実テキスト・実CTAで再現する必要があったため
- **手法**: 共通テンプレート抽出 → Task並列で9サブエージェントを同時起動（各エージェントが自分の担当ページのみ Write） → Playwrightで全ページ自動検証（20スクショ・JSエラー0・status 200・header/footer/h1全項目PASS）→ Claude in Chromeで実機確認
- **検証**: `mocks/.screenshots/verify-shots.sh` で再現可能。Issues: 0 / 20

### 機能追加: A案ベース 実テキスト完全再現TOP（確定案）
- **変更ファイル**: `mocks/mock-a-real.html`（新規）, `mocks/index.html`（「A実」タブ追加・デフォルト切替）
- **内容**: 実サイト（`xn--l8jzb2o0cyjn09v9ed4ox.jp`）をWebFetch + Claude in Chromeで全文取得し、A案の上質・高級スパ系トンマナで実テキストを反映。実CTAリンク（Hot Pepper Beauty: `slnH000278593`/`slnH000403924`）、tel:リンク、LINE（`lin.ee/wmRAMM9`）、三福グループ/P・SPO 会社概要、郵便番号まで忠実再現。
- **理由**: ユーザーが4案からA案を確定。本実装に向けて実テキスト反映の確定モックが必要

### 改善: 両店舗予約CTAを同色（ゴールド）に統一
- **変更ファイル**: `mocks/mock-a-real.html`
- **内容**: 修正前は片店ghost・片店goldで「片方が主」に見える状態。ヘッダー・ヒーロー・店舗カード・店舗案内・最終CTA・モバイルメニューの全6箇所でgold統一。LINEのみ緑で導線の質を区別。
- **理由**: 「色を変えると店舗の優劣に見えて分かりにくい」とユーザーFB

### 修正: 料金表2カード（会員/一般）の縦整列
- **変更ファイル**: `mocks/mock-a-real.html`
- **内容**: 修正前は会員カードのhead = 218px（OFFバッジで自然伸長）、一般カード = 200px（min-height）で18pxズレ→料金行が縦に揃わない問題。`.ptable` に `display:flex column`、`.ptable-head` に `min-height:230px` + flex centering を適用してhead+各料金行を完全整列。
- **理由**: ユーザーから「左右の枠が揃っていない、おかしい」と指摘。Playwrightで実寸計測して原因特定

### 機能追加: LINE公式QRコード組込（A案テイスト）
- **変更ファイル**: `mocks/mock-a-real.html`, `mocks/assets/line-qr.svg`（新規）, `mocks/assets/line-qr.png`（新規）
- **内容**: ユーザー提示の「ポップ調」QR画像はA案ダーク/ゴールド世界観と衝突するため、`qrcode` npmで `lin.ee/wmRAMM9` から色 `#22302c`（ink）/ `#ffffff` のSVG+PNG QRを誤り訂正レベルHで生成。LINEセクションを2カラム化し、左にeyebrow+h2+リード+3特典、右に白地ゴールド額装QRカード（四隅コーナー装飾・中央LINEロゴマーク）+「PCはスキャン / OR / スマホはタップ」の二段導線を配置。
- **理由**: ユーザーから「QR使いたいが浮かないか」相談。提示画像はトーン不一致のため、推奨案として「QRのみ抽出+A案スタイル組込」を進言→採用

## 2026-06-14
### 機能追加: 公開プレビュー（GitHub公開リポジトリ＋Vercelデプロイ・noindex）
- **変更ファイル**: 全mock HTML（noindex meta追加）, `mocks/robots.txt`（新規）, `mocks/vercel.json`（新規）, `mocks/index.html`（「4案」表記修正・キー4対応）, `mocks/.gitignore`（新規）
- **内容**: クライアント共有用にモック4案比較ビューアを公開。GitHub公開リポジトリ `naokoba-git/ashikarada-mock` へpush、Vercel CLIで `mocks/` をサイトルートとして本番デプロイ。検索インデックス防止を3層（meta robots / robots.txt / `X-Robots-Tag` ヘッダー）で実装。
- **公開URL**: https://mocks-neon.vercel.app （誰でも閲覧可・検索除外）
- **理由**: ユーザーがクライアントに4案を切替表示で見せるためのURLを希望。検索結果には出したくないためnoindex指定。
- **コスト対策**: `vercel.json` に `ignoreCommand: exit 0` を設定。git連携の自動デプロイは張らず、更新は `vercel --prod` で明示デプロイする運用（過去の高額請求対策）。

## 2026-06-13
### 機能追加: 案D「彩り・和の余白」追加（桔梗が丘整骨院参考）
- **変更ファイル**: `mocks/mock-d-irodori.html`（新規）, `mocks/index.html`（タブ追加）
- **内容**: frontend-designスキルで桔梗が丘整骨院(kikyougaoka.com)のデザインDNAを翻訳。縦書き明朝見出し・クリーム地・グレージュ文字・桜ピンクアクセント・角丸非対称写真・✦きらめき。フォントはShippori Mincho/Zen Kaku Gothic New/Jost。
- **理由**: 既存3案と異なる「和の上品・余白」方向の4案目をユーザーが希望

### バグ修正: 案Dのスマホ見切れ・縦書き列割れ
- **変更ファイル**: `mocks/mock-d-irodori.html`
- **内容**: (1)モバイルで縦書きヒーロー見出しが上端で見切れる→モバイルは横書き(horizontal-tb)に自動切替。(2)縦書きの「彩り」「選ばれる」が列をまたいで割れる→`<br>`で列区切り明示＋height:auto化。
- **理由**: Playwright headlessでの自己レビューで発見

### 機能追加: モック比較ビューア
- **変更ファイル**: `mocks/index.html`（新規）
- **内容**: 4案を1画面でタブ切替表示。PC/スマホ(390px)切替、キーボード1〜4切替、単体別タブ表示リンク。iframe方式で各案ファイル直編集が即反映。
- **理由**: ユーザーが「一つの画面で切り替えたい」と希望

### 機能追加: モック3案（A/B/C）作成
- **変更ファイル**: `mocks/mock-a-premium.html`, `mock-b-natural.html`, `mock-c-clean.html`（新規）
- **内容**: 既存サイトの全文言・実画像・店舗/料金データを流用し、3方向のフルページLPを作成。A=上質高級(明朝/ゴールド)、B=ナチュラル癒し(丸ゴシック/セージ+テラコッタ)、C=クリーン洗練(現グリーン路線をモダンに整理/浮遊カード/信頼バー)。
- **理由**: あしカラダ松山店サイトの高品質化に向けた方向性比較

### 改善: ヒーロー画像の差し替え
- **変更ファイル**: 全モック
- **内容**: 初期に使った店頭看板写真(709c1087)はbusyでヒーロー不適 → 明るく笑顔のセラピスト写真(IMG_1861)に変更（案CはIMG_2020）。
- **理由**: コンタクトシートで全画像確認し、ヒーローに最適な1枚を選定
