// Task5: HTTPサーバ経由でヒーロー画像が実際に読み込まれ、テキストが画像より前面にあるかを検証
const { chromium } = require('playwright');

const TARGETS = [
  { url: 'http://localhost:8777/', sel: '.hero-img', wrap: '.hero .wrap' },
  // ローカルの python http.server は _redirects を解さないため実ファイル名で検証（本番は /stores/okaido）
  { url: 'http://localhost:8777/page-stores-okaido.html', sel: '.store-hero-img', wrap: '.store-hero .wrap' },
  { url: 'http://localhost:8777/page-stores-airport.html', sel: '.store-hero-img', wrap: '.store-hero .wrap' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  let fail = 0;
  for (const t of TARGETS) {
    for (const vp of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport: vp });
      const errs = [];
      page.on('pageerror', (e) => errs.push(String(e)));
      page.on('response', (r) => {
        if (r.url().includes('/assets/img/') && r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.url()}`);
      });
      const resp = await page.goto(t.url, { waitUntil: 'load' });
      await page.waitForTimeout(700);
      const r = await page.evaluate(({ sel, wrap }) => {
        const img = document.querySelector(sel);
        const w = document.querySelector(wrap);
        if (!img) return { missing: true };
        const ib = img.getBoundingClientRect();
        const wb = w ? w.getBoundingClientRect() : null;
        const topEl = wb ? document.elementFromPoint(Math.round(wb.left + 20), Math.round(wb.top + 20)) : null;
        return {
          complete: img.complete,
          naturalW: img.naturalWidth,
          naturalH: img.naturalHeight,
          currentSrc: img.currentSrc.replace(location.origin, ''),
          box: { w: Math.round(ib.width), h: Math.round(ib.height) },
          imgZ: getComputedStyle(img).zIndex,
          wrapZ: w ? getComputedStyle(w).zIndex : null,
          topElAtWrap: topEl ? topEl.tagName + '.' + (topEl.className || '') : null,
        };
      }, t);
      const ok = !r.missing && r.complete && r.naturalW > 0 && r.currentSrc.endsWith('.webp')
        && r.box.w > 0 && r.topElAtWrap && !/IMG/.test(r.topElAtWrap) && errs.length === 0;
      if (!ok) fail++;
      console.log(`[${ok ? 'PASS' : 'FAIL'}] ${t.url} @${vp.width} status=${resp.status()}`, JSON.stringify(r), errs.length ? 'ERRORS:' + JSON.stringify(errs) : '');
      await page.close();
    }
  }
  await browser.close();
  console.log(fail === 0 ? 'ALL PASS' : `FAILURES: ${fail}`);
  process.exit(fail === 0 ? 0 : 1);
})();
