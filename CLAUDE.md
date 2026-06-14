# あしカラダ松山店 サイト高品質化プロジェクト

## 概要
愛媛・松山のリラクゼーションサロン「あしカラダ」の既存サイトを高品質化するための**デザインモック制作**プロジェクト。
本実装ではなく、まず方向性を決めるためのモック4案を作成し、ユーザーが比較検討している段階。

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
    ├── index.html       ← 【比較ビューア】4案をタブ切替＋PC/スマホ切替で表示
    ├── mock-a-premium.html  ← 案A 上質・高級スパ系
    ├── mock-b-natural.html  ← 案B ナチュラル癒し系
    ├── mock-c-clean.html    ← 案C クリーン洗練（現グリーン路線を磨く）
    ├── mock-d-irodori.html  ← 案D 彩り・和の余白（桔梗が丘整骨院 参考）
    └── _contact.html    ← 開発用：使用画像のコンタクトシート
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
- **公開URL**: https://mocks-neon.vercel.app （4案タブ切替・PC/スマホ切替・noindex）
- **GitHub**: https://github.com/naokoba-git/ashikarada-mock （public）
- **検索除外**: meta robots / robots.txt / `X-Robots-Tag` ヘッダーの3層でnoindex
- **更新デプロイ**: 修正後 `vercel deploy --prod --cwd mocks --yes`（git連携の自動デプロイは未設定＝push単体では反映されない。コスト対策で意図的にこの運用）

## プレビュー方法（ローカル）
```bash
cd mocks && python3 -m http.server 8777
# ビューア: http://localhost:8777/index.html  （タブで案A〜D切替・PC/スマホ切替・キー1〜4）
# 各案単体: http://localhost:8777/mock-a-premium.html など
```
※ Claude in Chrome のスクショがビューア(iframe)でフリーズする事象あり → **Playwright headless** でスクショ確認するのが確実。
　 Playwrightは `NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node script.cjs` で実行（グローバルのdesignlang配下にplaywright@1.60あり）。

## 開発履歴
- 2026-06-13: モック4案＋比較ビューア作成。案A〜CはオリジナルLP構成、案Dは桔梗が丘整骨院を参考に和の余白エディトリアル。案Dはスマホ縦書き見切れ・縦書き列割れを修正済み。

## TODO（次にやること）
- [ ] **4案からベースを選定**（単独 or 良いとこ取り）← まずここをユーザーに確認
- [ ] 選定案のスマホ最適化を詰める
- [ ] 予約リンク・電話リンク（`tel:`）を実接続
- [ ] 実画像の差し替え／追加撮影の検討
- [ ] （案D採用時）Adobe Fonts契約で ryo-gothic-plusn / azo-sans-web に寄せるか検討
- [ ] 本実装の技術スタック決定（静的HTML / Next.js / 既存readdy更新 など）

## 注意点
- **push/deploy禁止**（明示指示があるまでローカルコミットのみ）
- ユーザーはプログラミング素人 → 実装前に方向性確認・推奨モデル提示
- 並列で別プロジェクト（小林建工 ITAZU, localhost:8799）も稼働中。Chromeタブを取り違えないこと（あしカラダは8777）。

最終更新: 2026-06-13
