# あしカラダ松山店 サイト高品質化プロジェクト

## 概要
愛媛・松山のリラクゼーションサロン「あしカラダ」の既存サイトを高品質化するための**デザインモック制作**プロジェクト。
**2026-06-27 にA案（上質・高級スパ系）で方向性確定。TOP＋下層10ページが完成。**
**2026-07-22 にリブランド確定：店舗名「あしカラダ」→「P・SPO リラクゼーション」、新ドメイン `pspo-relaxation.jp`。**
**2026-07-23 に Cloudflare Pages デプロイ完了（Phase 1）: `https://pspo-relaxation.pages.dev`（GitHub連携・pushで自動デプロイ・noindex 3層）。実TOPを `index.html` にリネームし比較ビューアを退避、クライアントには「完全に実際と同じ」実サイトを表示。クリーンURL（`/menu` 等）実装済み。詳細は memory `project_pspo-relaxation-hosting-domain` / `project_cloudflare-pages-clean-url-behavior` 参照。**

## 🔜 次セッション開始点（2026-07-23 セッション8 終了時点）
**タスク: `pspo-relaxation.jp` のネームサーバー切替（本番ドメイン接続）。⚠️メール稼働中＝手順厳守。**
- **状態: サイトの中身は完成。未pushゼロ・本番実測PASS・要確認プレースホルダ0件。** 残るのは公開の「手続き」だけで、手順は **`Docs/公開切替手順.md`**（正本）に集約済み。
- **⚠️ 最初のアクションはユーザー操作待ち**（下記「再開手順」の1）。Claudeから先に着手できる作業はない。セッション開始時は現状を要約し、**Cloudflareでのゾーン追加を依頼して NS2本の入力を待つ**こと。
- **先に手を動かしてよい例外**（ユーザーが別件を指示した場合）: クライアント依頼リスト（透過ロゴ／施術者情報／睡眠改善コース改名可否／アロマのお客様の声追加）はいずれも素材待ちのため着手不可。手すきなら `/audit`（memory定期監査・期限超過中）が候補。
- **再開手順（推奨=オプションA）**:
  1. ユーザーがCloudflareで**ゾーンだけ追加**（`ドメイン概要`→`サイトを追加`→`pspo-relaxation.jp`→**Freeプラン選択**）。※NSを切らない限り無害。
  2. 表示される**Cloudflare NS2本**をユーザーが貼る。
  3. Claudeが**取り込みDNSを現行(さくら)と突合**し MX/SPF/A/www/(DKIM等) 完全複製を検証（メール安全ゲート）。
  4. 検証OK後、**業者送付文**（下記）にNS2本を差し込んで完成 → ユーザーが業者へ送付。
- **業者送付文ドラフト**（NS2本は段階1で確定後に差込）:
  > `pspo-relaxation.jp` のネームサーバーを下記2つへ変更をお願いします。① ★____.ns.cloudflare.com ② ★____.ns.cloudflare.com ／ 事前にDNS(Web・メール)移設済み・切替後もメール/現行サイト継続。
- **後日のWeb本番切替（段階3）**: apexをPagesに向ける前に、**MXをさくら実メールサーバ名（`www2192.sakura.ne.jp`系・要さくらパネル確認）へ付替え**。MXがapex参照のままだとメール断。
- 現行DNS棚卸し結果: NS=`ns1/ns2.dns.ne.jp`(さくら) / A=`182.48.49.102` / MX=`10 pspo-relaxation.jp` / SPF=`v=spf1 a:www2192.sakura.ne.jp mx ~all`。
- **公開時にまとめてやること**: → **`Docs/公開切替手順.md` に全手順を集約済み**（noindex 3層解除／robots.txt本番版／sitemapのlastmod更新／GSC登録／curlでの実機検証コマンド）。sitemap移設は完了済み。
- **クライアント判断待ち（いずれも公開の必須条件ではない）**: ①透過ロゴ(PNG/SVG)＋暗地用の白/反転版 → 受領後フッターも画像化 ②施術者情報（資格・経歴・写真＝E-E-A-Tの最大の弱点）③メニュー名「睡眠改善コース」の改名可否 ④**アロマのお客様の声を数件**（`/voice` のアロマフィルターが1件しかヒットしない）。
- **提案済み・未着手**: 開示請求の連絡先が電話のみになったため、**個人名を含まない共用メール**（`privacy@3puku.co.jp` 等）を作って掲載する案を提示済み。ユーザーは「急ぎでない」と判断。**先方から作成連絡が来たら掲載する**。

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
│   ├── changelog.md     ← 修正履歴
│   ├── plans/           ← 実装計画書（2026-07-22-seo-improvements.md）
│   ├── seo-audit/       ← SEO監査成果物（FULL-AUDIT-REPORT.md / ACTION-PLAN.md / 各領域md / screenshots）※sitemap.xmlは mocks/ へ移設済み
│   └── 公開切替手順.md  ★ 公開当日の実行手順（noindex 3層解除・robots本番版・GSC登録・curl検証）＝正本
└── mocks/
    ├── index.html       ★ 実サイトTOP（旧 mock-a-real.html をリネーム・本実装基準・`/` で配信）
    ├── 404.html         ★ 404ページ（ソフト404対策・2026-07-22追加）
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
    ├── page-privacy.html            ★ 下層: プライバシーポリシー（2026-07-22追加・2026-07-23に事業者情報を確定値で反映）
    ├── page-company.html            ★ 下層: 会社概要（2026-07-23追加・株式会社三福テンダーネス）
    ├── sitemap.xml       ← 公開ディレクトリへ移設済み（13URL・本番ドメイン基準）
    ├── robots.txt        ← 現在 Disallow:/（noindex 3層の1層）。公開時に差替
    ├── favicon.ico       ← 紺地に白抜き「P」（16/32/48/64 マルチサイズ）
    ├── favicon-32x32.png / apple-touch-icon.png(180) / icon-192.png / icon-512.png
    ├── site.webmanifest  ← ホーム画面追加用（display:browser・theme_color #fffdf9）
    ├── _contact.html    ← 開発用：使用画像のコンタクトシート
    ├── .screenshots/    ← Playwright自動検証スクリプト＆PNG（20枚）
    └── assets/
        ├── page-template.html  ★ 下層共通テンプレート（ヘッダー/フッター/CSS/CTA骨格）
        ├── img/         ★ 自前ホスト画像（WebP+JPG 5点・readdy依存を解消）
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
| お客様の声 | `page-voice.html` | 数値サマリー／レビュー12件／**実動作するカテゴリフィルター**（すべて12・大街道7・空港5・横揉み8・アロマ1・足つぼ3）／投稿導線。タグは各カードの `data-tags` に保持し、バッジ文言から導出（足底→足つぼ／アロマ→アロマ／全身→横揉み施術）。**レビューを増減したら `data-tags` の付与を忘れないこと**（無タグだとどのフィルターにも出ない） |
| よくある質問 | `page-faq.html` | 5カテゴリ（料金/施術/予約/店舗/会員）アコーディオン計23問（FAQPage構造化と一致） |
| ご予約 | `page-reserve.html` | 3予約方法カード／フロー4ステップ／注意事項 |
| お得なチケット | `page-tickets.html` | 全身60分専用回数券3プラン（1枚¥3,700／5枚¥18,500[一番お得]／10枚¥37,000）＋ご利用について。ライブ /tickets を再現（2026-07-22追加） |
| プライバシーポリシー | `page-privacy.html` | 全10条（取得情報／利用目的／第三者提供／外部サービス3社／Cookie／安全管理／開示請求／未成年／変更／事業者情報）。**フッター最下部から全ページ導線あり**。※グローバルナビには入れない |
| 会社概要 | `page-company.html` | 運営会社（株式会社三福テンダーネス）／運営店舗2店舗／個人情報の取り扱い導線。**フッター「会社概要」列の「運営会社」から全ページ導線あり**。※グローバルナビには入れない |

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
- [x] **SEO監査＋全面改善** → 完了（2026-07-22・スコア67/100→主要指摘を全対応・readdy画像も自前ホスト化済み）
- [x] **プライバシーポリシー作成・sitemap移設・robots整理** → 完了（2026-07-22）。公開切替の全手順は **`Docs/公開切替手順.md`**（正本）に集約
- [x] **ファビコン一式** → 完了（2026-07-22）。`logo-pspo.png` の上段1文字目「P」（bbox: x28-104 / y12-88 の77×77）を抽出し、紺 `#113062` 地に白抜きで再構成。**ロゴ全体は4行構成のため16pxでは判読不能** → 正方形マーク化が必須だった。再生成する場合も同じ抽出方法を踏襲すること
- [ ] 🔜 **公開前の残り**: `Docs/公開切替手順.md` に従って noindex 3層解除／robots.txt 本番版差替／sitemap の lastmod 更新／GSC登録
- [x] **プライバシーポリシーの事業者情報を確定値で反映＋会社概要ページ新設** → 完了（2026-07-23）
- [x] **【要確認】プレースホルダを全て解消** → 完了（2026-07-23）。設立年月・資本金はクライアント判断で行ごと削除、郵便番号は `790-0964` を反映。**全14ページで `.todo` マーカー0件を実測確認済み**
- [x] **個人情報保護管理者を確定** → **鎌倉 令羅**（`kamakura@3puku.co.jp` は同氏のアドレス）。2026-07-23にクライアント回答で確定・仮置きは解消済み
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

- 2026-07-23 セッション6（TOPナビ統一・ロゴ修正・店舗マップ刷新）: ①**TOPグローバルメニューをクリーンURL別ページリンクに統一**（`#first`等アンカー→`/first-time`等。`初めての方へ`/`よくある質問`のリンク切れ2件解消。本文CTAのページ内スクロールは据置）②**ロゴ/QRの相対パスをroot-relativeに統一**（`/stores/okaido`のネスト階層で相対`assets/`が404→`/assets/`へ全11p+テンプレ修正）③**店舗マップを公式pb埋込コードに刷新**（クライアント提供の共有リンク解決→店名`あしカラダ`ラベル付き情報カード表示・中心ズレ補正・ズーム`1d3000`街区レベル）＋**JSON-LDにgeo座標/hasMapを全6箇所追加**（マップと構造化の位置一致）。全pushしライブで両店の描画・店名・位置を検証。新memory: `reference_google-maps-embed-place-label` / `feedback_post-deploy-live-verify-cache`。

- 2026-07-22 セッション7（見出し構造是正・SEO監査・全面改善）: ①**見出しレベルの飛びを全12ページで是正**（h2→h4/h5・h1→h3。タグ是正と同時にCSSセレクタを改名し見た目は完全据え置き。フッターの`<h5>`は見出しでなくラベルなので`<p class="foot-title">`＋`<nav aria-label>`へ）②**TOPのH1に地域＋業種を明示** ③**`seo-audit`スキルで6並列監査**（67/100）→ `superpowers:writing-plans` で10タスク計画 → `subagent-driven-development` で実装（タスクごとにレビュー）。ソフト404解消・タップ領域44px・CTAコントラストAA・モバイル固定CTAバー・画像の自前ホスト化+WebP・ヒーローimg化+preload・構造化データ修正・薬機法配慮・セキュリティヘッダ・開発用HTMLの恒久noindex。**モバイルTOP Lighthouse 65→99 / LCP 13.4s→2.0s(-85%)**。全push・本番反映済み。新memory: `feedback_subagent-silent-exit-verify-yourself` / `feedback_plan-values-must-be-measured` / `project_pspo-compliance-decisions` / `project_pspo-public-dir-hygiene`。

- 2026-07-22 セッション8（プライバシーポリシー・配信ファイル整備・ファビコン）: ①**プライバシーポリシー新規作成**（`page-privacy.html` / `/privacy`・全10条）。サイトにフォームもGA/GTMも無い実態に合わせて記述（「入力フォームはありません」「アクセス解析ツール未使用・Googleマップ埋込のCookieのみ」）。事業者情報は未確定のため**【要確認】7箇所を可視マーカー**で残置。**特商法表記は不要と判断**（店頭決済のみで通信販売に非該当）②**全13ページのフッター最下部に規約リンク**を追加（タップ領域44px実測）③**sitemap.xml を `Docs/seo-audit/` から `mocks/` へ移設**（＝それまで `/sitemap.xml` は404だった）・`/privacy` 追加で12URL ④`_redirects` に `/privacy` の200リライトと301正規化を追加 ⑤**`mocks/vercel.json` を削除**（Vercel時代の遺物が公開ディレクトリから取得可能だった）⑥**ファビコン一式を新規作成**（ロゴから「P」を抽出→紺地白抜き。ico/PNG各種＋webmanifest＋head5タグ）⑦**`Docs/公開切替手順.md` を新設**（noindex 3層解除・GSC登録の実行手順の正本）。全push・本番実測PASS。

- 2026-07-23 セッション8（プライバシーポリシー・会社概要・ファビコン・フィルター実装）: ①**プライバシーポリシー新設**（`/privacy`・全10条）。フォームもGA/GTMも無い実態をgrepで確認したうえで記述。**特商法表記は不要と判断**（店頭決済のみ＝通信販売に非該当）②**会社概要新設**（`/company`）＋事業者情報を確定（株式会社三福テンダーネス／〒790-0964 松山市中村2-1-3 三福本社ビル3階／代表取締役 村上 晃平）③**個人情報保護は組織名義「個人情報保護担当窓口」**に統一し、個人名と `kamakura@3puku.co.jp` をサイト・JSON-LDから完全削除（Pマーク未取得のため個人名の開示義務なし）④**可視の【要確認】マーカー方式**で情報待ちを回避、4往復で全解消（最終 `.todo` 0件を実測）⑤**sitemap.xml を公開ディレクトリへ移設**（それまで `/sitemap.xml` は404）・13URLへ ⑥**ファビコン一式を新規作成**（ロゴの「P」を抽出→紺地白抜き。ロゴ全体は4行構成で16pxでは判読不能だった）⑦**お客様の声のフィルターを実動作化**し「表示イメージです」注記を削除 ⑧`vercel.json` 削除・`Docs/公開切替手順.md` 新設。全push・本番実測PASS。新memory: `feedback_user-reports-missing-check-unpushed` / `feedback_push-hook-separate-commit-and-push` / `feedback_visible-todo-placeholder-delivery`。

## 運営会社（確定情報・2026-07-23 クライアント提供）
| 項目 | 内容 |
|---|---|
| 会社名 | 株式会社三福テンダーネス |
| 所在地 | 〒790-0964 愛媛県松山市中村2丁目1-3 三福本社ビル3階 |
| 代表者 | 代表取締役 村上 晃平 |
| 個人情報保護担当窓口 | **「株式会社三福テンダーネス 個人情報保護担当窓口」**（組織名義） |
| 開示請求等の連絡先 | 各店舗の電話（0120-919-323 / 0120-695-427）。**サイト上にメールアドレスは掲載しない** |
| 掲載箇所 | `page-company.html`（/company）・`page-privacy.html`（/privacy）・全13ページのOrganization構造化データ（legalName/address） |

⚠️ **掲載してはいけないもの（2026-07-23 クライアント指示）**
- **個人情報保護の責任者の個人名は記載しない**（プライバシーマークを取得していないため、個人名の開示義務がない）。必ず「個人情報保護担当窓口」という**組織名義**で表記する
- **`kamakura@3puku.co.jp` はサイト上に一切掲載しない**（担当者個人が特定されるため）。JSON-LD の `email` からも削除済み。再追加しないこと
- 設立年月・資本金も**掲載しない**（行ごと削除済み）

## 見出しルール（このサイトの規約・2026-07-22 確定）
- **h1は各ページに1つだけ**。h2は複数可。h2の中の小見出しは**必ずh3**。h4以下は原則使わない（そもそもその構造にしない）
- **見出しレベル＝意味。見た目はCSSクラスで与える**（小さく見せたいからh4、は禁止）
- **見出しでないラベル（フッターの列見出し等）に`<h*>`を当てない**。`<p class="foot-title">`＋`<nav aria-label>` で構造を示す

最終更新: 2026-07-23 セッション8（プライバシーポリシー・会社概要・ファビコン・フィルター実装）
