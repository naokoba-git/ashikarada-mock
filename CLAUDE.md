# あしカラダ松山店 サイト高品質化プロジェクト

## 概要
愛媛・松山のリラクゼーションサロン「あしカラダ」の既存サイトを高品質化するための**デザインモック制作**プロジェクト。
**2026-06-27 にA案（上質・高級スパ系）で方向性確定。TOP＋下層10ページが完成。**
**2026-07-22 にリブランド確定：店舗名「あしカラダ」→「P・SPO リラクゼーション」、新ドメイン `pspo-relaxation.jp`。**
**2026-07-23 に Cloudflare Pages デプロイ完了（Phase 1）: `https://pspo-relaxation.pages.dev`（GitHub連携・pushで自動デプロイ・noindex 3層）。実TOPを `index.html` にリネームし比較ビューアを退避、クライアントには「完全に実際と同じ」実サイトを表示。クリーンURL（`/menu` 等）実装済み。詳細は memory `project_pspo-relaxation-hosting-domain` / `project_cloudflare-pages-clean-url-behavior` 参照。**

## 🔜 次セッション開始点（2026-07-23 終了時点）
**タスク: `pspo-relaxation.jp` のネームサーバー切替（本番ドメイン接続）。⚠️メール稼働中＝手順厳守。**
- 完了済み: Pagesデプロイ・実サイト化・クリーンURL・全push・docs/memory更新。ローカル未pushは docsコミット `fe1e360` のみ（サイト内容は反映不要）。
- 中断理由: Cloudflare「サイト追加」画面がブラウザのレンダラー不調で描画できず（スクショ連続タイムアウト）。高リスク作業のためユーザーに段取り提示して終了。
- **再開手順（推奨=オプションA）**:
  1. ユーザーがCloudflareで**ゾーンだけ追加**（`ドメイン概要`→`サイトを追加`→`pspo-relaxation.jp`→**Freeプラン選択**）。※NSを切らない限り無害。
  2. 表示される**Cloudflare NS2本**をユーザーが貼る。
  3. Claudeが**取り込みDNSを現行(さくら)と突合**し MX/SPF/A/www/(DKIM等) 完全複製を検証（メール安全ゲート）。
  4. 検証OK後、**業者送付文**（下記）にNS2本を差し込んで完成 → ユーザーが業者へ送付。
- **業者送付文ドラフト**（NS2本は段階1で確定後に差込）:
  > `pspo-relaxation.jp` のネームサーバーを下記2つへ変更をお願いします。① ★____.ns.cloudflare.com ② ★____.ns.cloudflare.com ／ 事前にDNS(Web・メール)移設済み・切替後もメール/現行サイト継続。
- **後日のWeb本番切替（段階3）**: apexをPagesに向ける前に、**MXをさくら実メールサーバ名（`www2192.sakura.ne.jp`系・要さくらパネル確認）へ付替え**。MXがapex参照のままだとメール断。
- 現行DNS棚卸し結果: NS=`ns1/ns2.dns.ne.jp`(さくら) / A=`182.48.49.102` / MX=`10 pspo-relaxation.jp` / SPF=`v=spf1 a:www2192.sakura.ne.jp mx ~all`。

- **対象サイト**: https://あしカラダ松山店.jp/ （Punycode: `https://xn--l8jzb2o0cyjn09v9ed4ox.jp/`）
- **既存サイトの作り**: readdy 製（画像は `storage.readdy-site.link` / `public.readdy.ai` にホスト）
- **業種**: マッサージ・リラクゼーションサロン（横揉み施術・アロマ・足つぼ）
- **客層**: 40〜50代男女中心、女性アロマ客、仕事帰り・深夜利用層
- **強み**: 「価格（リーズナブル）× 確かな技術」の二枚看板。全身60分3,700円（税込）〜

## 店舗情報（モック共通データ）
| 店舗 | エリア | 電話 | 営業時間 | 所在地 |
|---|---|---|---|---|
| 大街道店 | 大街道・銀天街 | 0120-919-323 | 10:00〜翌1:00（最終受付24:00） | 松山市2番町3-8-21 コメダ珈琲店の2階 |
| 空港通り店 | 松山西部・駐車場完備 | 0120-695-427 | 10:00〜24:00（年中無休/年末年始除く） | 松山市空港通1丁目15-1【1階】 |

**料金**（ピースポ会員 / 一般）:
- 足底30分＋全身60分［1番人気］ 5,800 / 6,300円
- 顔・頭30分＋全身60分［睡眠改善コース］ 5,400 / 5,900円
- アロマ60分＋顔・頭15分［女性限定/アロマスペシャル］ 5,900 / 6,400円
- ピースポ会員は全メニュー500円OFF（会員以外も通常料金で利用可）／LINE友だち追加で500円クーポン

## ディレクトリ構成
```
ashikarada/
├── CLAUDE.md            ← このファイル
├── Docs/
│   ├── prompts.md       ← プロンプト履歴
│   └── changelog.md     ← 修正履歴
└── mocks/
    ├── index.html       ★ 実サイトTOP（旧 mock-a-real.html をリネーム・本実装基準・`/` で配信）
    ├── viewer.html      ← 【比較ビューア】旧 index.html を退避（内部用・案A〜D切替。クライアントには出さない）
    ├── _headers         ← Cloudflare Pages: X-Robots-Tag noindex（3層目）
    ├── _redirects       ← Cloudflare Pages: クリーンURL /menu 等 → page-*.html 200リライト
    ├── mock-a-premium.html  ← 案A（方向性確認用・ダミー文言）
    ├── mock-b-natural.html  ← 案B ナチュラル癒し系
    ├── mock-c-clean.html    ← 案C クリーン洗練（現グリーン路線を磨く）
    ├── mock-d-irodori.html  ← 案D 彩り・和の余白（桔梗が丘整骨院 参考）
    ├── page-first-time.html         ★ 下層: 初めての方へ
    ├── page-menu.html               ★ 下層: メニュー・料金
    ├── page-features.html           ★ 下層: 施術の特徴
    ├── page-stores.html             ★ 下層: 店舗案内（2店舗一覧）
    ├── page-stores-okaido.html      ★ 下層: 大街道店 詳細
    ├── page-stores-airport.html     ★ 下層: 空港通り店 詳細
    ├── page-voice.html              ★ 下層: お客様の声
    ├── page-faq.html                ★ 下層: よくある質問
    ├── page-reserve.html            ★ 下層: ご予約
    ├── page-tickets.html            ★ 下層: お得なチケット（全身60分専用回数券・2026-07-22追加）
    ├── _contact.html    ← 開発用：使用画像のコンタクトシート
    ├── .screenshots/    ← Playwright自動検証スクリプト＆PNG（20枚）
    └── assets/
        ├── page-template.html  ★ 下層共通テンプレート（ヘッダー/フッター/CSS/CTA骨格）
        ├── line-qr.svg  ← LINE公式 lin.ee/wmRAMM9 のQR（SVG・A案ink色）
        └── line-qr.png  ← 同上 PNG 480px
```

## モック4案の方向性
| 案 | 名称 | トンマナ | フォント | アクセント色 |
|---|---|---|---|---|
| A | 上質・高級スパ系 | ダーク/ゴールド・余白広め・横組み明朝 | Shippori Mincho + Zen Kaku Gothic | ゴールド #a9854f |
| B | ナチュラル癒し系 | 丸ゴシック・ブロブ写真・葉あしらい・親しみ | Zen Maru Gothic | セージ#7e9171 + テラコッタ#c8765a |
| C | クリーン洗練 | 現グリーン路線をモダンに整理・浮遊カード | Noto Sans JP | グリーン #2f8f6e |
| D | 彩り・和の余白 | **縦書き明朝**・角丸写真が余白に浮く・✦ | Shippori Mincho + Zen Kaku Gothic New + Jost | 桜ピンク #d9789f |

- **案Dの参考サイト**: 桔梗が丘整骨院 https://kikyougaoka.com/
  - 参考DNA: 縦書き明朝見出し / クリーム地#FDF8F4 / グレージュ文字#8F8B81 / 桜ピンク#D866A1 / 角丸非対称の写真フレーム / ✦きらめき
  - 参考サイトは Adobe Fonts（`ryo-gothic-plusn` 本文 / `shippori-mincho` 見出し / `azo-sans-web` 欧文）使用。案Dは無料Googleフォントで近似（Adobe Fonts契約で忠実度UP可）。

## 使用画像（既存サイトから流用・本実装時に差し替え検討）
- ヒーロー/横揉み: `.../48996b8b-...IMG_1861.jpeg`（明るい・笑顔のセラピスト・最良のヒーロー）
- アロマ: `.../399bdb2a-...unnamed.jpg`
- リーズナブル/全身: `.../d7b4e8b6-...IMG_2020.jpeg`
- 技術力/足つぼ: `.../e3705560-...unnamed.jpg`
- 店頭看板（busy・ヒーロー不可）: `public.readdy.ai/.../709c1087.jpg`
- ベースURL: `https://storage.readdy-site.link/project_files/f4855191-8498-4dea-80b6-ea07112d8fed/`

## 公開プレビュー（クライアント共有用）
- **現・公開URL**: **https://pspo-relaxation.pages.dev**（Cloudflare Pages・実サイト表示・クリーンURL・noindex 3層）。★これを共有する
- **旧**: https://mocks-neon.vercel.app （Vercel・4案切替ビューア時代。移行済み）
- **GitHub**: https://github.com/naokoba-git/ashikarada-mock （public）
- **検索除外**: meta robots / robots.txt / `_headers`の`X-Robots-Tag` の3層でnoindex（本番公開時に解除）
- **更新デプロイ**: **`git push` で自動デプロイ**（Cloudflare Pages GitHub連携。origin/main への push＝本番反映。push はユーザー明示指示時のみ `CLAUDE_ALLOW_PUSH=1`）
- **Cloudflare**: アカウント Taichan221@gmail.com / account id `bd41691958f6553343d4ccc9a39d2fd7` / プロジェクト `pspo-relaxation`・出力ディレクトリ `mocks`・Free（課金ゼロ）

## プレビュー方法（ローカル）
```bash
cd mocks && python3 -m http.server 8777
# ビューア: http://localhost:8777/index.html  （タブで案A〜D切替・PC/スマホ切替・キー1〜4）
# 各案単体: http://localhost:8777/mock-a-premium.html など
```
※ Claude in Chrome のスクショがビューア(iframe)でフリーズする事象あり → **Playwright headless** でスクショ確認するのが確実。
　 Playwrightは `NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node script.cjs` で実行（グローバルのdesignlang配下にplaywright@1.60あり）。

## A案（確定案）デザイン仕様
- **トンマナ**: ダーク/ゴールドの上質・高級スパ系・余白広め
- **フォント**: `Shippori Mincho`（見出し・¥価格）/ `Zen Kaku Gothic New`（本文）
- **配色変数**: `--ink:#22302c` / `--gold:#a9854f` / `--gold-deep:#8a6a3a` / `--cream:#f7f2e9` / `--paper:#fffdf9` / `--line:#e0d6c4` / `--line-green:#06c755`（LINE導線のみ）
- **共通CTA設計**:
  - `btn-gold`（予約・主要CTA）／`btn-outline`（副次）／`btn-ghost`（軽い遷移）／`btn-line`（LINE専用・緑）
  - **両店舗の予約ボタンは必ず同色gold・対等表現**（片方を強調しない）
  - LINEは緑のまま（性質の違う導線として区別）
- **セクション骨格**: Hero → 2店舗quick → Pricing(会員/一般) → Reasons(4) → Access(2) → LINE(QR+CTA) → Voices(4) → Final CTA → Footer(4col)
- **共通実URL（実接続済み）**:
  - 大街道店予約: `https://beauty.hotpepper.jp/kr/slnH000278593/`
  - 空港通り店予約: `https://beauty.hotpepper.jp/kr/slnH000403924/`
  - LINE友だち追加: `https://lin.ee/wmRAMM9`
  - 電話: `tel:0120919323`（大街道店）/ `tel:0120695427`（空港通り店）
  - 三福グループ: `https://www.sanpuku.co.jp/` / P・SPO: `https://pspo.jp/`

## 下層ページ（A案展開・完成済み）
| ナビ | ファイル | 内容 |
|---|---|---|
| 初めての方へ | `page-first-time.html` | 来店フロー5ステップ／持ち物・服装／所要時間／初回特典／FAQ6問 |
| メニュー・料金 | `page-menu.html` | 人気組合せ（会員/一般）／単品4カテゴリ／ピースポ会員案内／注意事項 |
| 施術の特徴 | `page-features.html` | 4特徴の大カード詳細／お悩み別おすすめ6ケース |
| 店舗案内 | `page-stores.html` | 2店舗比較表／大カード／共通サービス3点 |
| 大街道店詳細 | `page-stores-okaido.html` | ヒーロー＋情報＋地図iframe＋アクセス3点＋ギャラリー＋特色3点 |
| 空港通り店詳細 | `page-stores-airport.html` | 駐車場ハイライト＋情報＋地図iframe＋アクセス3点＋ギャラリー＋特色3点 |
| お客様の声 | `page-voice.html` | 数値サマリー／レビュー12件／フィルター見せ／投稿導線 |
| よくある質問 | `page-faq.html` | 5カテゴリ（料金/施術/予約/店舗/会員）アコーディオン計23問（FAQPage構造化と一致） |
| ご予約 | `page-reserve.html` | 3予約方法カード／フロー4ステップ／注意事項 |
| お得なチケット | `page-tickets.html` | 全身60分専用回数券3プラン（1枚¥3,700／5枚¥18,500[一番お得]／10枚¥37,000）＋ご利用について。ライブ /tickets を再現（2026-07-22追加） |

## 共通テンプレート
- `mocks/assets/page-template.html` — 下層ページ共通の骨格（ヘッダー＋フッター＋全CSS＋CTAストリップ＋モバイルメニュー＋FAQアコーディオンスクリプト）。`<!-- CONTENT -->` を差し替えてページ化する設計。
- ナビゲーション current 表現: 下層ページのヘッダー該当 `<a>` に `class="current"` を付与（`menu a.current` でゴールド下線が常時表示）。

## 検証
- `mocks/.screenshots/_shot.cjs` … Playwright headless で全10ページ × PC(1280) / SP(390) = 20枚スクショ＋検証（status, header, footer, cta, h1, JSエラー）
- `mocks/.screenshots/verify-shots.sh` … 上記の起動スクリプト（`NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules` を使用）

## 開発履歴
- 2026-06-13: モック4案＋比較ビューア作成。案A〜CはオリジナルLP構成、案Dは桔梗が丘整骨院を参考。案Dはスマホ縦書き見切れ修正済み。
- 2026-06-14: 公開プレビュー（GitHub + Vercel + noindex 3層）公開。
- 2026-06-27 セッション2: **A案で方向性確定**。実テキスト・実CTAリンク・実電話・実会社概要を反映した `mock-a-real.html` を作成。両店舗予約CTAを同色統一、料金表2カード完全整列、LINE公式QRをA案テイストで2カラム組込み。
- 2026-06-27 セッション3: **下層9ページ一気に完成＋本番デプロイ**。共通テンプレート抽出→Task並列で9サブエージェント同時生成→Playwrightで20枚スクショ全項目PASS。`index.html` ビューアを「上段4案＋下段A案下層10ページピル型ナビ」の2段構成に拡張。`git push` ＋ `vercel deploy --prod` で `mocks-neon.vercel.app` に反映、noindex 3層を本番URLでライブ検証済み。
- 2026-07-22 セッション4（orca coordinator＋sonnetワーカー運用）: ①**お得なチケットページ追加**（`page-tickets.html`・回数券3プラン・フッター＋スマホ最下部ボタン導線）②**新ドメイン`pspo-relaxation.jp`向けメタ＋JSON-LD構造化データ（標準）**を全11ページ＋テンプレに追加（sonnet実装→Opusレビュー）③**店舗名リブランド あしカラダ→P・SPO リラクゼーション**（ロゴ.markは保持）④**ヘッダーをP・SPOロゴ画像に差替**（`assets/logo-pspo.png`・フッターはテキスト・折返しはword-break:keep-all）⑤**本番ホスティングをCloudflare Pagesに決定**（未着手）。全て未push（ローカル6コミット）。委譲手順は memory `feedback_orca-dispatch-inject-fallback`。

## TODO（次にやること）
- [x] 4案からベースを選定 → **A案で確定（2026-06-27）**
- [x] **下層9ページ作成** → 完成（2026-06-27）
- [x] **本番デプロイ** → `mocks-neon.vercel.app` に反映済み（2026-06-27・noindex 3層ライブ検証済み）
- [x] **お得なチケットページ追加** → 完成（2026-07-22）
- [x] **リブランド（P・SPO リラクゼーション）＋新ドメイン向けメタ・構造化** → 完成（2026-07-22）
- [x] **ヘッダーロゴ画像化** → 完成（2026-07-22・透過版待ちでフッターは保留）
- [x] **本実装の技術スタック決定** → **静的HTML＋Cloudflare Pages**（2026-07-22）
- [x] **Cloudflare Pagesデプロイ（Phase1）** → 完了（2026-07-23・`pspo-relaxation.pages.dev`・GitHub連携・全push済み）
- [x] **実サイト化（比較ビューア退避・TOP=index.html）** → 完了（2026-07-23）
- [x] **クリーンURL設定**（`/menu` 等・下層ナビも統一） → 完了（2026-07-23・`_redirects`）
- [ ] 🔜 **ネームサーバー切替（本番ドメイン接続）**: `pspo-relaxation.jp` はさくら管理・**メール稼働中(MX/SPF)**。①Cloudflareにゾーン追加→②メール込みDNS複製→③検証→④業者へNS切替指示。⚠️複製前にNS切替するとメール断
- [ ] 🔜 **公開前の残り**: noindex解除（公開時）／readdy画像の自前ホスト化／geo座標をGBPから追加
- [ ] ⏳ **クライアントから透過ロゴ(PNG/SVG)＋暗地用の白/反転版** → 受領後フッターも画像化
- [ ] クライアントレビュー → 文言・写真差し替えの反映

## 注意点
- **push/deploy禁止**（明示指示があるまでローカルコミットのみ）
- ユーザーはプログラミング素人 → 実装前に方向性確認・推奨モデル提示
- 並列で別プロジェクト（小林建工 ITAZU, localhost:8799）も稼働中。Chromeタブを取り違えないこと（あしカラダは8777）。
- **下層ページのヘッダー/フッター/CTAは `assets/page-template.html` 由来**。修正時はテンプレートを更新し、各 page-*.html へ同期する（または共通化を本実装フェーズで判断）。
- 料金行や2カラムレイアウト等の高さ揃えは Playwrightで実寸計測 → CSSで `min-height`/`align-items:stretch` 調整が確実
- **ヘッダーPCナビは6項目**（初めての方へ／メニュー・料金／施術の特徴／店舗案内／お客様の声／よくある質問）＋予約CTA3つ。ハンバーガー切替境界は980px。※お得なチケットを7項目目に一度入れたが中間幅(981〜1100px)でナビが詰まり横スクロールが出たため、2026-07-22にPCナビからは外した（フッター＋モバイルに集約）。ナビ項目を増やす時はこの幅で overflow 再検証必須。
- **お得なチケット導線**: フッター「メニュー」列＋モバイルメニュー最下部ボタン（btn-outline）の2箇所（PC上部ナビには入れない方針）。リンク先は**クリーンURL `/tickets`**（2026-07-23の`_redirects`で全ページ統一済み。実ファイルは `page-tickets.html`）
- **新ドメイン＝`pspo-relaxation.jp`**（P・SPO/三福グループのリラクゼーション部門）。全11ページ＋テンプレの`<head>`に canonical/OGP/Twitterカード＋JSON-LD構造化（Organization / DaySpa[LocalBusiness]×2店舗 / 各ページBreadcrumbList / page-faqにFAQPage23問）を追加済み（2026-07-22・sonnetワーカー実装→Opusレビュー済み）。canonicalは対応表どおり（TOP=`/`, 他は `/menu` `/stores/okaido` 等クリーンURL）。**noindex 3層は本番公開時まで維持（構造化追加時に外していない）**。geoは未設定（捏造回避・本実装時にGBP座標で追加）。og:imageは暫定でreaddyヒーロー画像→自前ホスト化時に差替。

- 2026-07-23 セッション5（Cloudflare Pages デプロイ）: **Cloudflare Pages に本番デプロイ（Phase1）**。①GitHub連携（`ashikarada-mock` 限定）でプロジェクト`pspo-relaxation`作成→`pspo-relaxation.pages.dev`公開 ②未pushだった9コミットをpush（origin/main が9遅れていた）＋`_headers`でX-Robots-Tag移植（noindex3層復活）③「完全に実際と同じ」指示で**比較ビューアを`viewer.html`に退避・実TOPを`index.html`にリネーム**し`/`で実サイト配信 ④**クリーンURL不具合を発見・修正**（TOPは`/menu`でリンクするが該当ファイル無く未定義URLがTOPにフォールバック＝「下層ページ消えた」の正体）→`_redirects`で`/menu`等→`page-*.html`を200リライト＋下層10ページのナビ237箇所もクリーンURL統一 ⑤ドメイン`pspo-relaxation.jp`のDNS棚卸し（さくら管理・メール稼働中＝NS切替はメールDNS複製が先）。全push済み。CF Pages固有の落とし穴は memory `project_cloudflare-pages-clean-url-behavior`。

最終更新: 2026-07-23 セッション5（Cloudflare Pages デプロイ・実サイト化・クリーンURL・DNS棚卸し）
