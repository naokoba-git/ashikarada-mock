# 修正履歴

## 2026-06-27
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
