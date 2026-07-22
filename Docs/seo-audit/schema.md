# 構造化データ監査レポート

- 監査日: 2026-07-22
- 対象: `mocks/` 配下 実サイト11ページ（`index.html` + `page-*.html` 10種）
- 監査方法: 各ページの `<script type="application/ld+json">` を抽出しJSONパース検証＋本文との突合（静的解析。ライブHTTPリクエストは未実施）
- 前提: noindexは意図的のため対象外。`aggregateRating`/`review`は裏付け（GBP等）がない限り追加提案しない方針を厳守。

## 検出済みスキーマ一覧

| ページ | ブロック |
|---|---|
| `index.html`（TOP） | Organization / WebSite / `@graph`(DaySpa×2) |
| `page-menu.html` | Organization / BreadcrumbList |
| `page-first-time.html` | Organization / BreadcrumbList |
| `page-features.html` | Organization / BreadcrumbList |
| `page-stores.html` | Organization / BreadcrumbList / `@graph`(DaySpa×2) |
| `page-stores-okaido.html` | Organization / BreadcrumbList / DaySpa（単体） |
| `page-stores-airport.html` | Organization / BreadcrumbList / DaySpa（単体） |
| `page-voice.html` | Organization / BreadcrumbList |
| `page-faq.html` | Organization / BreadcrumbList / FAQPage（23問） |
| `page-reserve.html` | Organization / BreadcrumbList |
| `page-tickets.html` | Organization / BreadcrumbList |

構文: 全ブロック `json.loads()` でパースエラーなし（11ページ・全ブロック正常）。

## 内容一致確認（PASS）
- `page-faq.html`: 本文の `.faq-q` 個数（23）＝ `FAQPage.mainEntity` 個数（23）で一致。抜粋2問の文言も本文と完全一致。
- `openingHoursSpecification`: 大街道店 `10:00〜01:00`（CLAUDE.md記載の「10:00〜翌1:00」と整合）／空港通り店 `10:00〜24:00`（同「10:00〜24:00」と整合）。
- `geo` 座標: 大街道店 `33.8399607, 132.7696973` ／空港通り店 `33.8288384, 132.7462523`。前回セッション6でマップ埋込と合わせて追加されたもので今回ずれなし。
- `canonical` / JSON-LDの `url` は全ページで一致し、クリーンURL（`/menu` `/stores/okaido` 等）に統一済み。本番ドメイン `pspo-relaxation.jp` への差替は不要（既に該当ドメインで記述済み）。

---

## Critical

### 1. `Organization.logo` が実際のロゴ画像ではなく人物写真になっている
- 該当: 全11ページの `Organization` ブロック（例: `index.html`）
```json
"logo": "https://storage.readdy-site.link/project_files/.../48996b8b-...IMG_1861.jpeg"
```
- 問題: このURLはヒーロー画像（セラピストの笑顔写真）であり、ロゴではない。Googleのナレッジパネル・ロゴリッチリザルトの要件は「実際のブランドロゴ画像」であることが前提で、写真を指定すると要件違反かつ表示崩れの原因になる。
- 事実: サイトヘッダーで実際に使われているロゴ画像が `mocks/assets/logo-pspo.png` に存在する（`ls`で確認済み・17KB）。
- 推奨修正（実データのみ・本番ドメイン公開後にホスト想定）:
```json
"logo": "https://pspo-relaxation.jp/assets/logo-pspo.png"
```
※ 現状 `.pages.dev` でも同一パスで配信されているため、本番ドメイン切替前は `https://pspo-relaxation.pages.dev/assets/logo-pspo.png` を暫定値にする選択肢もある（★要確認: どちらを正本にするかはユーザー判断）。

---

## High

### 2. `DaySpa.image` が両店舗で同一の汎用写真（店舗を区別できない）
- 該当: `index.html`／`page-stores.html`（`@graph`内）／`page-stores-okaido.html`／`page-stores-airport.html`
- 4箇所すべて `image` が同じ `IMG_1861.jpeg`（ヒーロー写真）を指しており、大街道店と空港通り店を画像面で区別できない。
- Googleの`LocalBusiness`系ガイドラインは「その場所を代表する画像」を推奨。両店で同じ画像だと検索結果・ナレッジパネルで店舗判別に寄与しない。
- 対応: 各店の実写真（現状ページ内ギャラリーに使用中の店舗別写真）があればそちらのURLに差替を推奨。★要確認＝各店個別写真の確定URL（現行ギャラリーで使用中の画像から選定可能）。

### 3. `Organization` と2店舗 `DaySpa` の間にエンティティ参照（`@id`）が一切ない
- 該当: 全ブロック（`Organization`にも`DaySpa`にも `@id` が存在しない）
- 現状、`Organization.parentOrganization`（三福グループ）は正しく設定されているが、逆方向＝「P・SPO リラクゼーションという法人が2店舗を運営している」という関係が構造化データ上に存在しない。各ページで`Organization`ブロックが11回重複生成されているだけで、店舗との紐付けが暗黙（同じ`sameAs`のみ）。
- 推奨: `Organization`に`@id`を付与し、`DaySpa`側から`"brand"`または`"parentOrganization"`で参照する設計に変更（実データのみで実装可能・捏造なし）。
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://pspo-relaxation.jp/#organization",
  "name": "P・SPO リラクゼーション",
  "url": "https://pspo-relaxation.jp/",
  "logo": "https://pspo-relaxation.jp/assets/logo-pspo.png",
  "parentOrganization": { "@type": "Organization", "name": "三福グループ", "url": "https://www.sanpuku.co.jp/" },
  "sameAs": ["https://www.sanpuku.co.jp/", "https://pspo.jp/"]
}
```
```json
{
  "@type": "DaySpa",
  "name": "P・SPO リラクゼーション 大街道店",
  "parentOrganization": { "@id": "https://pspo-relaxation.jp/#organization" },
  "...": "既存プロパティは変更不要"
}
```

### 4. 店舗詳細ページの`BreadcrumbList`がURL階層と一致していない
- 該当: `page-stores-okaido.html` / `page-stores-airport.html`
- 現状: `ホーム → 大街道店`（2階層のみ）
- 実URL構造は `/stores/okaido`（`/stores` 配下のネスト）であり、`page-stores.html`（店舗案内一覧）が実在する中間ページのため、パンくずは3階層にすべき。
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://pspo-relaxation.jp/" },
    { "@type": "ListItem", "position": 2, "name": "店舗案内", "item": "https://pspo-relaxation.jp/stores" },
    { "@type": "ListItem", "position": 3, "name": "大街道店", "item": "https://pspo-relaxation.jp/stores/okaido" }
  ]
}
```
（空港通り店も同様に3階層化）

---

## Medium（参考・簡潔に）
- `priceRange` が両店とも汎用値 `"¥¥"` — メニューページの実料金（例: 全身60分3,700円〜）を使い、`hasOfferCatalog`/`Service`で具体的な料金リストを追加すると検索結果の情報量が増える（実データで構築可能）。
- `WebSite`に`potentialAction`(SearchAction)なし — サイト内検索機能が存在しないため追加は不要（捏造回避のため提案しない）。
- `Review`/`aggregateRating` — `/voice`ページの声は自社掲載のみで第三者検証（GBP等）の裏付けがないため**追加非推奨**。追加する場合はGoogle My Businessの実レビューをAPI等で取得し、実際の評点・件数のみを使うこと。

## Low
- `openingHoursSpecification.closes` の `"24:00"` 表記は多くのバリデータで許容されるが、一部ツールでは `"23:59"` の方が安全という報告もある（必須修正ではない）。

---

## まとめ（対応優先度）
1. **Critical**: `Organization.logo` を実ロゴ画像パスに差替
2. **High**: 店舗別`image`の差替／`Organization`↔`DaySpa`の`@id`連携／店舗詳細ページのBreadcrumbList 3階層化
3. Medium/Lowは公開後の余力があれば対応
