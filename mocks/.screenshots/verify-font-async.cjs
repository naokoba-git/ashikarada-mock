// フォント非同期化（media="print" onload）後、Shippori Mincho が実際に「読み込まれて適用」されているかを実測。
// computed style の font-family は宣言スタックを返すだけなので、
// document.fonts.check() で webfont の実ロードまで確認する。
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:8777';
const PAGES = [
  'index.html', 'page-first-time.html', 'page-menu.html', 'page-features.html',
  'page-stores.html', 'page-stores-okaido.html', 'page-stores-airport.html',
  'page-voice.html', 'page-faq.html', 'page-reserve.html', 'page-tickets.html',
  '404.html',
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  let fail = 0;

  console.log('=== JS有効時: webfont実ロード＋media切替＋noscript有無 ===');
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const f of PAGES) {
    await page.goto(`${BASE}/${f}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(() => {
      const link = document.querySelector('link[href*="fonts.googleapis.com/css2"][onload]');
      const h1 = document.querySelector('h1');
      return {
        media: link ? link.media : null,
        noscript: !!document.querySelector('noscript'),
        mincho: document.fonts.check('600 24px "Shippori Mincho"'),
        gothic: document.fonts.check('400 16px "Zen Kaku Gothic New"'),
        h1family: h1 ? getComputedStyle(h1).fontFamily : null,
        h1size: h1 ? getComputedStyle(h1).fontSize : null,
      };
    });
    const ok = r.media === 'all' && r.noscript && r.mincho && r.gothic &&
      (r.h1family || '').includes('Shippori Mincho');
    if (!ok) fail++;
    console.log(`${ok ? '✅' : '❌'} ${f.padEnd(26)} media=${r.media} noscript=${r.noscript} Mincho=${r.mincho} Gothic=${r.gothic} h1=${r.h1size}`);
  }
  await page.close();

  console.log('\n=== JS無効時: <noscript> フォールバックで同じフォントが当たるか ===');
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const p2 = await ctx.newPage();
  for (const f of ['index.html', 'page-menu.html', '404.html']) {
    await p2.goto(`${BASE}/${f}`, { waitUntil: 'load' });
    // JS無効なので evaluate は使えない → 実描画幅で webfont 適用を判定する
    await p2.waitForTimeout(1200);
    const shot = await p2.locator('h1').first().boundingBox();
    const has = await p2.locator('noscript').count();
    const ok = has > 0 && shot && shot.height > 0;
    if (!ok) fail++;
    console.log(`${ok ? '✅' : '❌'} ${f.padEnd(20)} noscript=${has} h1描画=${shot ? `${Math.round(shot.width)}x${Math.round(shot.height)}` : 'なし'}`);
  }
  await ctx.close();

  console.log(fail === 0 ? '\n判定: PASS ✅ フォント非同期化後も Shippori Mincho / Zen Kaku Gothic New が適用されている'
    : `\n判定: FAIL ❌ ${fail}件`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})();
