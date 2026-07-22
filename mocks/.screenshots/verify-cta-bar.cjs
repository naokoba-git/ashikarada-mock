const { chromium } = require('playwright');
const path = require('path');
const BASE = 'file://' + path.resolve(__dirname, '..');
const PAGES = ['index.html','404.html','page-first-time.html','page-menu.html','page-features.html',
  'page-stores.html','page-stores-okaido.html','page-stores-airport.html',
  'page-voice.html','page-faq.html','page-reserve.html','page-tickets.html'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  let fail = 0;
  for (const p of PAGES) {
    // モバイル: 表示され、44px以上、横スクロールなし
    const sp = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await sp.goto(`${BASE}/${p}`, { waitUntil: 'load' });
    await sp.waitForTimeout(300);
    // html{scroll-behavior:smooth} のため、scrollTo直後は値が確定していない
    // （長いページほどアニメーションが完了するまでに時間がかかる）。
    // scrollYが安定するまで繰り返し最下部へ送ってから読む。
    let prevY = -1;
    for (let i = 0; i < 20; i++) {
      const y = await sp.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
        return window.scrollY;
      });
      if (y === prevY) break;
      prevY = y;
      await sp.waitForTimeout(200);
    }
    const m = await sp.evaluate(() => {
      const bar = document.querySelector('.cta-bar');
      if (!bar) return { ok:false, why:'.cta-barが無い' };
      const b = bar.getBoundingClientRect();
      const items = [...bar.querySelectorAll('.cta-bar-item')].map(a => Math.round(a.getBoundingClientRect().height));
      const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
      // フッター最下部までスクロールしてコピーライトが読めるか
      const copy = document.querySelector('.copy');
      const cb = copy ? copy.getBoundingClientRect() : null;
      const hidden = cb ? (cb.bottom > window.innerHeight - b.height + 2) : false;
      return { ok:true, visible: getComputedStyle(bar).display !== 'none',
               h: Math.round(b.height), items, overflow, copyHidden: hidden };
    });
    // PC: 非表示であること
    const pc = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await pc.goto(`${BASE}/${p}`, { waitUntil: 'load' });
    const d = await pc.evaluate(() => {
      const bar = document.querySelector('.cta-bar');
      return bar ? getComputedStyle(bar).display : 'missing';
    });

    const ok = m.ok && m.visible && m.items.every(h => h >= 44) && !m.overflow && !m.copyHidden && d === 'none';
    if (!ok) fail++;
    console.log(`${p.padEnd(26)} SP表示:${m.visible?'✅':'❌'} 高さ:${m.items} 横スクロール:${m.overflow?'❌':'✅'} ` +
                `コピーライト隠れ:${m.copyHidden?'❌':'✅'} PC非表示:${d==='none'?'✅':'❌'+d}`);
    await sp.close(); await pc.close();
  }
  await browser.close();
  console.log(fail === 0 ? '\n判定: PASS ✅' : `\n判定: FAIL ❌ ${fail}ページ`);
  process.exit(fail === 0 ? 0 : 1);
})();
