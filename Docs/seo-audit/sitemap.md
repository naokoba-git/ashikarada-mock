# サイトマップ・内部リンク監査レポート

- **監査日**: 2026-07-22
- **対象**: https://pspo-relaxation.pages.dev（実体: `mocks/`）／本番予定ドメイン `https://pspo-relaxation.jp`
- **前提**: 現在 noindex 運用中（公開前プレビュー）。本レポートの sitemap.xml は「公開時に使う成果物」であり、**今は Search Console 等へ送信しない**。

## 1. 検証結果サマリー

| チェック項目 | 結果 | 重大度 |
|---|---|---|
| sitemap.xml の有無 | **存在しない**（`mocks/` 配下に無し） → 本監査で新規作成 | High |
| XML構文 | 新規作成分は妥当（`urlset` 名前空間・11 `<url>` エントリ） | - |
| 50,000 URL上限 | 11件のみ。単一ファイルでOK、sitemapindex不要 | - |
| priority / changefreq | 未使用（Google無視のため省略。今後追加提案があれば都度検討） | Info |
| lastmod正確性 | 各ページ実体ファイルの git 最終コミット日から取得。全ページ2026-07-22（直近セッションで一括改修されたため） | - |
| robots.txt現状 | `User-agent: * / Disallow: /`（全面ブロック・意図通り） | - |
| noindexの3層 | meta robots / robots.txt / `_headers`(X-Robots-Tag) すべて確認、一致 | - |
| 開発用ファイル(mock-a〜d, viewer.html, _contact.html)の隔離 | 全て`noindex`かつ本番11ページからのリンク無し（クリーン） | - |
| 404/リダイレクトの混入 | 本番11ページの内部リンクは全てクリーンURL11種のみ。孤立・不正リンク無し | - |
| canonicalの一貫性 | 全11ページで`_redirects`宛先と一致した自ページURLをcanonical指定。重複canonical無し | - |

## 2. 生成した sitemap.xml

`/Users/kobayashi/Desktop/claude/sanpuku/ashikarada/Docs/seo-audit/sitemap.xml` に11ページ分を生成済み（`https://pspo-relaxation.jp/` ベース）。**`mocks/`には設置していない**（公開時に手動配置する運用）。

## 3. robots.txt ドラフル（公開時に使う版）

現行（プレビュー用・全面ブロック）:
```
User-agent: *
Disallow: /
```

**公開時に差し替える版**（sitemap行を追加・全面許可）:
```
User-agent: *
Allow: /

Sitemap: https://pspo-relaxation.jp/sitemap.xml
```
※ この差し替えは「①`mocks/robots.txt`更新 ②`_headers`のnoindex行削除 ③各ページmeta robotsの`noindex`除去」の**3点セットで初めて有効**（robots.txtだけ変えてもmeta robotsが残っていれば非表示のまま）。CLAUDE.md記載の「本番公開時に解除」チェックリストと整合。

## 4. 内部リンク構造分析

全11ページ（ヘッダーナビ＋フッター＋モバイルメニュー合算）を突き合わせた結果、**全ページが他の全ページへのリンクを持つメッシュ構造**。孤立ページ・リンク切れは検出されず。

| ページ | 受リンク数（全11ページ内の出現合計） |
|---|---|
| `/stores` | 35 |
| `/menu` | 35 |
| `/voice` | 34 |
| `/first-time` | 34 |
| `/features` | 34 |
| `/faq` | 34 |
| `/tickets` | 22 |
| `/`（TOP） | 21 |
| `/stores/okaido` | 13 |
| `/stores/airport` | 13 |
| `/reserve` | 12 |

- `/tickets` はCLAUDE.md記載どおりPCヘッダーナビには非掲載（フッター＋モバイルメニュー最下部のみ）だが、**22本の内部リンクを受けており孤立ページではない**。導線は十分。
- `/reserve` はCTAボタン中心の導線（ヘッダーナビ1項目＋各ページのCTAブロック）で受リンク数が最少だが、実際の予約導線はHotPepper外部リンク（大街道店・空港通り店それぞれ専用URL）が主役のため、内部リンク数の少なさ自体は設計通りで問題なし。

### High: BreadcrumbList が2階層で親カテゴリを省略している

`/stores/okaido` と `/stores/airport` のBreadcrumbList JSON-LDが「ホーム → 店舗名」の2階層になっており、実際のURL階層・内部リンク構造にある `/stores`（店舗案内一覧）を**position 2として含んでいない**。

```json
// 現状（page-stores-okaido.html）
[
  {"position": 1, "name": "ホーム", "item": ".../"},
  {"position": 2, "name": "大街道店", "item": ".../stores/okaido"}
]
```

- URL構造は `/stores/okaido` で `/stores` の子であることを示しており、ナビ・フッターからも `/stores` への内部リンクが全ページに存在する。構造化データだけがこの階層を反映していない。
- 影響: Googleのパンくずリッチリザルト・サイトリンク推定でこの親子関係が伝わらない可能性。修正コストは低い（3階層目を挿入するだけ）。

**推奨修正**（3階層に変更）:
```json
[
  {"position": 1, "name": "ホーム", "item": "https://pspo-relaxation.jp/"},
  {"position": 2, "name": "店舗案内", "item": "https://pspo-relaxation.jp/stores"},
  {"position": 3, "name": "大街道店", "item": "https://pspo-relaxation.jp/stores/okaido"}
]
```
`page-stores-airport.html` も同様に「空港通り店」の前に「店舗案内」を挿入。

## 5. サイト階層の妥当性

- `/stores` → `/stores/okaido` / `/stores/airport` の親子URL構造は内部リンク上は一貫（全ページのナビ・フッターが3リンクとも設置）。
- 唯一の不整合は上記4章の BreadcrumbList 階層省略のみ（High）。

## 6. 不足ページの提案（ローカルビジネスとして）

| 優先度 | 提案ページ | 理由 |
|---|---|---|
| **High** | 単品メニュー詳細ページ（例: `/menu/aroma` `/menu/ashitsubo`）| 現状`/menu`は組合せ料金中心の一覧。単品メニュー（アロマ60分・足つぼ・横揉み等）ごとに独立ページ化すると、指名検索（「松山 アロマ 60分」等）の受け皿が増え、内部リンクのハブも厚くなる。ただしCLAUDE.mdの「あしカラダ→P・SPO」リブランド完了・NS切替待ちの現段階では優先度は次フェーズ扱いでよい。 |
| **High** | アクセス総合ページ（`/access`） | 現状アクセス情報は各店舗ページ内に分散（地図iframe＋テキスト）。2店舗を横断する「アクセス」単独ページがあると、地図・駐車場・最寄り駅/バス停の比較検討がしやすく、`stores`との役割分担も明確になる。GBP座標が入り次第（TODO記載の保留課題）で着手しやすい。 |
| **Medium** | スタッフ紹介ページ（`/staff`） | リラクゼーション業態は指名予約の比重が高く、施術者の経験・得意分野の紹介はコンバージョンに直結しやすい。個人が特定される写真掲載の可否をクライアントに確認する必要あり。 |
| **Medium** | コラム/お役立ち情報（`/column` 一覧＋個別記事） | 「肩こり 松山」「疲労回復 マッサージ」等のロングテール流入を狙える。ただし更新体制（誰が書くか）が無いと放置ページ化するリスクがあるため、運用体制の合意が前提。 |
| **Low** | 採用ページ（`/recruit`） | サロン系は求人SEOとの相性が良いが、事業側の採用ニーズが顕在化してから着手で十分。 |

## 7. その他の所感（Critical/Highの再掲）

- **Critical**: なし（サイトの内部リンク構造・noindex運用・canonicalは健全）。
- **High①**: sitemap.xml が存在しなかった → 本監査で新規作成済み（`Docs/seo-audit/sitemap.xml`）。公開時に `mocks/` へ配置しrobots.txtへ`Sitemap:`行を追加すること。
- **High②**: `/stores/okaido` `/stores/airport` の BreadcrumbList JSON-LD が `/stores` 階層を省略している。3階層への修正を推奨（4章参照）。
