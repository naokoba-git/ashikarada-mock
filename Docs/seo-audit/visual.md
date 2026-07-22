# ビジュアル / モバイルUX 監査レポート

- 対象: https://pspo-relaxation.pages.dev （全11ページ）
- 検証方法: Playwright headless（PC 1280×800 / SP 390×812）、全22キャプチャ＋DOM実測（フォントサイズ・矩形サイズ・実ピクセルコントラスト）
- スクリーンショット: `Docs/seo-audit/screenshots/`（`<page>_pc.png` `<page>_sp.png` + フルページ版 `_full.png`）
- 生データ: ステータス200・横スクロール・コンソールエラーは全ページで異常なし（詳細は末尾「問題なし項目」参照）

---

## Critical

### C1. ハンバーガーメニューのタップ領域が19×27px（全ページ・唯一のモバイルナビ手段）
- 実測: `<button class="ham">`（`mocks/assets/page-template.html:67`）は `background:none;border:0;font-size:22px` のみでパディング無し。文字グリフそのままのサイズしかタップ領域が無く、実測 **19×27px**（推奨44×44pxの半分以下）。
- なぜ重要か: 980px未満では `.menu,.nav-cta{display:none}` でPC版ナビ・ヘッダーCTAが両方消え（`page-template.html:164`）、**ハンバーガーがモバイルの唯一の遷移・予約導線**になる。ここが押しにくいと、40〜50代の指の大きさでは誤タップ・タップ漏れが起きやすく、全11ページのモバイル回遊率に直結する。
- 修正例:
```css
.ham{
  background:none;border:0;color:var(--ink);font-size:22px;cursor:pointer;
  padding:12px; /* ← 追加。22px+24pxで実質46x46相当 */
  display:none; /* 既存のPC非表示は維持 */
}
```

### C2. フッターナビ全リンクのタップ高さが実測19px（全ページ×10リンク＝計110箇所）
- 実測: `.foot-col a`（`page-template.html:137`）はパディング無し・フォント13px・`li{margin-bottom:9px}`のみで、実測タップ高さ **19px**（横幅は78〜91pxあり問題なし、高さのみ不足）。全11ページのフッターに同一構造で存在。
- なぜ重要か: フッターは「初めての方へ」「メニュー・料金」等、下層への主要な回遊導線。高さ19pxは44pxの半分未満で、隣接リンク（`margin-bottom:9px`で間隔28px相当）との誤タップリスクも高い。
- 修正例:
```css
.foot-col li{margin-bottom:0}
.foot-col a{display:inline-block;padding:8px 0;color:#aeb6b0} /* 上下8pxで高さ~35px、marginをpaddingに移し隣接誤タップも軽減 */
```

---

## High

### H1. モバイル下層10ページ中9ページでファーストビューにCTAが無い
- 実測（SP・スクロールなし1画面目）:

| ページ | H1がファーストビューに入るか | CTA(電話/LINE/予約)がファーストビューに入るか |
|---|---|---|
| `/`（TOP） | ✅ | ✅ |
| `/menu` | ✅ | ❌ |
| `/first-time` | ✅ | ❌ |
| `/features` | ✅ | ❌ |
| `/stores` | ✅ | ❌ |
| `/stores/okaido` | ✅ | ❌ |
| `/stores/airport` | ✅ | ❌ |
| `/voice` | ✅ | ❌ |
| `/faq` | ✅ | ✅ |
| `/reserve` | ✅ | ❌ |
| `/tickets` | ✅ | ❌ |

- 原因: `@media(max-width:980px){.menu,.nav-cta{display:none}}` によりモバイルではヘッダーCTAが完全に消え、ハンバーガーを開かない限り予約・電話・LINEへの導線がゼロになる（`page-template.html:163-165`）。TOP/FAQがたまたま本文内に予約ブロックを持つため達成しているだけで、設計上の導線ではない。
- なぜ重要か: 「メニュー・料金」「よくある質問」等は比較検討段階の閲覧が多く、閲覧直後に予約行動を起こしたいユーザーがハンバーガーを開く1タップを強いられる＝離脱ポイント。特に`/reserve`（予約ページ自体）ですらファーストビューにCTAが無いのは矛盾。
- 推奨: モバイル専用の下部固定CTAバー（電話＋予約の2ボタン、height 56px程度、z-index高め）を全下層ページ共通で追加。既存の `.mobile-menu .cta-set` 相当のボタンをスクロール追従バーとして複製するのが最小工数。

### H2. ゴールドボタン（白文字/gold背景）のコントラスト比 3.41:1（AA基準4.5:1未達）
- 実測: `.btn-gold{background:var(--gold)/* #a9854f */;color:#fff}`（`page-template.html:53`）。白文字14px・実測コントラスト **3.41:1**（WCAG AA通常文字は4.5:1必要）。
- 該当箇所: 「大街道店を予約する」「空港通り店を予約する」等、**サイト最重要のCTAボタン文言**（全ページの本文CTA・TOPのquick storeボタン等、計30箇所以上）。
- 修正例（gold-deepの方が僅かに暗いが不足。文字色を濃くする方が確実）:
```css
.btn-gold{background:var(--gold);color:#22302c} /* 白→ink色に。ratio 6.8:1相当まで改善 */
/* または背景を暗く: --gold-deep:#8a6a3a なら白文字で ratio 4.6:1 相当に届く可能性あり。要再測定 */
```
※ 40〜50代がメインターゲットのため、最重要ボタンでのAA未達は視認性リスクとして特に優先度を上げるべき。

### H3. LINEボタン（白文字/LINEグリーン背景）のコントラスト比 2.26:1
- 実測: `.btn-line{background:var(--line-green)/* #06c755 */;color:#fff}`。**2.26:1**とAA基準を大きく下回る。LINE公式グリーンは明度が高くAAと相性が悪いことで知られる配色。
- 該当箇所: 「LINEで予約」「LINE友だち追加」ボタン（複数ページ）。
- 修正例: 文字を白のまま維持したいならボタン背景を公式の濃色バリアント（LINE公式ブランドガイドの `#00B900` はさらに暗いので不十分。文字色を `#0b3d1a` 系の濃緑にするのが確実）に。または枠線+緑文字の反転デザイン。
```css
.btn-line{background:var(--line-green);color:#0e3a1c;font-weight:700} /* ratio ~4.6:1目安、要実測 */
```

### H4. コンテンツ写真がすべてCSS background-imageで、alt属性を持てない構造
- 実測: 監査対象の全11ページ×PC/SPで検出できた `<img>` タグは2件のみ（ロゴ画像とLINE QR）。ヒーロー写真・店舗写真・特徴写真は全て `background-image:url(...)` で実装（例: `.store-hero-bg{background:...,url('...unnamed.jpg') center/cover}` `page-template.html`各所）。
- なぜ問題か: background-imageは仕様上alt属性を持てず、スクリーンリーダーには「何も無い」ものとして扱われる。写真が伝える「明るい店内」「セラピストの手技」等の情報が視覚障害ユーザーに一切伝わらない。Google画像検索のインデックス対象にもならない（SEO面はseo-content/seo-schema側の管轄と重複するため詳細割愛、ここでは視覚・アクセシビリティ面のみ指摘）。
- 推奨: 少なくとも主要な内容写真（ヒーロー・店舗写真）は `<img alt="...">` + `object-fit:cover` に置き換える、または装飾目的が明確なものに限りbackground-imageのまま `role="img" aria-label="..."` を付与。

---

## Medium

### M1. 本文の準標準テキスト色が実測コントラスト 4.0〜4.4:1（AA基準4.5:1にわずかに未達・全ページ共通）
- 実測: `--muted:#6f7a73`（rgb 111,122,115）が本文リード文・キャプション等に多用され、cream(`#f7f2e9`)背景で **4.00:1**、paper(`#fffdf9`)背景で **4.39:1**。いずれもAA基準の4.5に届かない。全11ページの各セクション導入文（例:「アクセスしやすい立地で、お仕事帰りや観光の際にも便利。」等）で共通発生。
- 影響度がMediumな理由: 完全に読めないレベルではない（4.0前後はギリギリ）が、40〜50代の閲覧環境（屋外の明るい場所でのスマホ閲覧等）では可読性が落ちる可能性。
- 修正例: `--muted` を `#5c675f` 程度に暗くすると cream背景で概ね5:1前後まで改善見込み（要再測定）。

### M2. 小キャプション・ラベル文字（"FEATURE 01" "BENEFIT 01" 等）が実測コントラスト 3.36〜3.48:1・11〜13px
- 実測: gold文字 `rgb(169,133,79)` on cream/paper で **3.36〜3.48:1**。各下層ページの「特徴」「アクセス」「メニュー」セクション見出し直前のアイキャッチラベルに繰り返し使用（"FEATURE 01〜04" "CASE 01〜06" "ACCESS 01〜03" "POINT 01〜03" "BENEFIT 01〜03" 等、計30箇所以上）。
- 装飾的ラベルではあるが文字サイズが小さい分コントラスト基準は本文と同じ4.5:1が適用される。デザイン全体のトーン（ゴールドの控えめな使い方）を壊さない範囲で、`--gold-deep:#8a6a3a` へ差し替えると改善余地あり（要再測定、暗すぎるとブランドトーンが変わるためデザイン判断とセットで）。

### M3. モバイルCTAボタンの実測高さ36〜42px（44pxにわずかに届かない）
- 実測: `.btn{padding:13px 22px;font-size:14px}` の実測ボックス高さは36〜42px（横幅は問題なし）。ゴールドの主要予約ボタン・LINEボタンなど、視認性・重要度の高いボタンが軒並みこのサイズ。
- 修正例: `padding:13px 22px` → `padding:16px 24px` 程度に増やすと44px超を確保しやすい。

### M4. お客様の声ページ（`/voice`）のフィルターボタンが実測高さ38px
- 実測: 「すべて」「大街道店」「空港通り店」「横揉み施術」「アロマ」「足つぼ」の絞り込みボタンが横76〜103px×高さ38px。フィルター切替は誤タップの実害が比較的小さいためMedium。
- 修正例: 上下パディングを4px程度増やすだけで解消可能。

### M5. Googleフォントが `display=swap` でCLSリスク
- 実測: `Shippori Mincho` `Zen Kaku Gothic New` を `<link href="...&display=swap">` で読み込み（`page-template.html:23`）。フォールバック→Webフォント切替時のFOUT（文字幅差）でH1・見出し中心にわずかなレイアウトシフトの可能性。今回のスクリーンショット取得は`networkidle`待機後のため実際のCLS数値は未計測（Lighthouse等での実測が必要、CLAUDE.mdのpagespeed-loopスキル範囲）。
- 参考: 明朝体（Shippori Mincho）は特にフォールバック明朝との字幅差が出やすいフォントのため、視覚的な「ガタつき」体感は他の游ゴシック系より起きやすい傾向。

---

## Low（参考・優先度低）

- 店舗詳細ページ（`/stores/okaido` `/stores/airport`）のヒーロー見出し・パンくずは写真+グラデーションオーバーレイ上に白文字を重ねる構成（`.store-hero-bg{background:linear-gradient(...),url(...)}`）。自動コントラスト測定は写真の明暗に依存し数値化不能だが、目視（スクリーンショット確認）では可読性は概ね確保されていた。ただし写真次第で暗部が薄くなる箇所もあり得るため、オーバーレイの最終ストップ（現状 `rgba(20,28,25,.55)`）をもう一段暗くしておくと写真差し替え時にも安全。
- パンくず区切り記号「›」の色が背景に近く実測コントラスト1.3〜1.5:1（装飾記号のため実害は小さい）。
- 小型バッジ「1番人気」「女性限定」等が実測11〜13px・コントラスト3.9〜4.1:1（M2と同系統、装飾性が高いため優先度は下げてLow寄り）。

---

## 問題なし（実測で異常検出なし）
- **HTTPステータス**: 全11ページ×PC/SP、200
- **コンソールエラー/JSエラー**: 全ページで検出なし
- **横スクロール（overflow）**: 全ページ×PC/SPで document幅 = viewport幅、横スクロールなし
- **画像alt欠落**: 検出できた`<img>`2件（ロゴ・LINE QR）はいずれも意味のあるalt文言あり。ただし前述H4のとおり大半の写真はCSS背景のため「alt欠落チェック」自体の対象になっていない点に注意。
- **H1のファーストビュー表示**: 全11ページ・モバイルで100%表示（H1自体は問題なし。CTAとの併存はH1参照）

---

## 参照ファイル
- スクリーンショット: `/Users/kobayashi/Desktop/claude/sanpuku/ashikarada/Docs/seo-audit/screenshots/`
- 検証スクリプト: `/private/tmp/claude-501/-Users-kobayashi-Desktop-claude-sanpuku-ashikarada/f54a54d5-937c-4fbe-9cb3-d0b71e2ab2ec/scratchpad/audit.cjs`（レイアウト・タップ領域・above-the-fold実測）, `contrast2.cjs`（実ピクセルサンプリングによるコントラスト検証）
- 主要CSS根拠: `/Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks/assets/page-template.html`（`.ham` `.foot-col a` `.btn-gold` `.btn-line` `--muted` 等）
