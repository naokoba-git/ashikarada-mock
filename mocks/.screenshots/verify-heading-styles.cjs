// 見出しレベル変更後、CSSが正しく当たっているか（＝見た目が変わっていないか）を実測検証
const { chromium } = require('playwright');
const path = require('path');

const BASE = 'file://' + path.resolve(__dirname, '..');

// [ページ, セレクタ, 期待font-size(px), 期待font-family先頭 ]
const CHECKS = [
  ['index.html', '.reason h3', 21, 'Shippori Mincho'],
  ['index.html', '.voice h3', 19, 'Shippori Mincho'],
  ['index.html', 'nav[aria-label="フッターメニュー"] .foot-title', 15, 'Shippori Mincho'],
  ['index.html', 'nav.corp .foot-title', 12, 'Shippori Mincho'],
  ['index.html', 'nav[aria-label="店舗情報"] .foot-title', 15, 'Shippori Mincho'],
  ['page-first-time.html', '.flow-step h3', 18, 'Shippori Mincho'],
  ['page-first-time.html', 'nav[aria-label="フッターメニュー"] .foot-title', 15, 'Shippori Mincho'],
  ['page-voice.html', 'nav[aria-label="フッターメニュー"] .foot-title', 15, 'Shippori Mincho'],
  ['page-features.html', 'nav[aria-label="フッターメニュー"] .foot-title', 15, 'Shippori Mincho'],
  ['page-reserve.html', 'nav[aria-label="フッターメニュー"] .foot-title', 15, 'Shippori Mincho'],
  ['page-menu.html', 'nav[aria-label="フッターメニュー"] .foot-title', 15, 'Shippori Mincho'],
  ['page-faq.html', 'nav[aria-label="フッターメニュー"] .foot-title', 15, 'Shippori Mincho'],
  ['page-stores.html', 'nav[aria-label="フッターメニュー"] .foot-title', 15, 'Shippori Mincho'],
  ['page-stores-okaido.html', 'nav[aria-label="フッターメニュー"] .foot-title', 15, 'Shippori Mincho'],
  ['page-stores-airport.html', 'nav[aria-label="フッターメニュー"] .foot-title', 15, 'Shippori Mincho'],
  ['page-tickets.html', 'nav[aria-label="フッターメニュー"] .foot-title', 15, 'Shippori Mincho'],
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let fail = 0;

  for (const [file, sel, expectSize, expectFamily] of CHECKS) {
    await page.goto(`${BASE}/${file}`, { waitUntil: 'domcontentloaded' });
    const res = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { size: parseFloat(cs.fontSize), family: cs.fontFamily, weight: cs.fontWeight, tag: el.tagName };
    }, sel);

    if (!res) { console.log(`❌ ${file} ${sel} : 要素が見つからない`); fail++; continue; }
    const okSize = Math.abs(res.size - expectSize) < 0.6;
    const okFam = res.family.includes(expectFamily);
    if (okSize && okFam) {
      console.log(`✅ ${file.padEnd(26)} ${sel.padEnd(24)} ${res.tag} ${res.size}px / ${expectFamily}`);
    } else {
      console.log(`❌ ${file} ${sel} : ${res.size}px (期待${expectSize}px) / ${res.family}`);
      fail++;
    }
  }

  // ページ全体のJSエラー・横スクロール確認
  console.log('\n=== 横スクロール発生チェック（PC1280 / SP390）===');
  for (const vp of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const p2 = await browser.newPage({ viewport: vp });
    for (const f of ['index.html', 'page-first-time.html', 'page-voice.html', 'page-features.html']) {
      await p2.goto(`${BASE}/${f}`, { waitUntil: 'load' });
      const over = await p2.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (over) { console.log(`❌ ${vp.width}px ${f} 横スクロールあり`); fail++; }
    }
    await p2.close();
    console.log(`  ${vp.width}px: チェック完了`);
  }

  console.log(fail === 0 ? '\n判定: PASS ✅ 見た目は変化なし' : `\n判定: FAIL ❌ ${fail}件`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})();
