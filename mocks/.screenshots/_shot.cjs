const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PAGES = [
  { file: 'mock-a-real.html',          name: '01_top' },
  { file: 'page-first-time.html',      name: '02_first-time' },
  { file: 'page-menu.html',            name: '03_menu' },
  { file: 'page-features.html',        name: '04_features' },
  { file: 'page-stores.html',          name: '05_stores' },
  { file: 'page-stores-okaido.html',   name: '06_stores-okaido' },
  { file: 'page-stores-airport.html',  name: '07_stores-airport' },
  { file: 'page-voice.html',           name: '08_voice' },
  { file: 'page-faq.html',             name: '09_faq' },
  { file: 'page-reserve.html',         name: '10_reserve' },
  { file: 'page-tickets.html',         name: '11_tickets' },
];

const VIEWPORTS = [
  { name: 'pc', width: 1280, height: 900 },
  { name: 'sp', width: 390,  height: 844 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const outDir = __dirname;
  const report = [];
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
    for (const p of PAGES) {
      const url = `http://localhost:8777/${p.file}`;
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', e => errs.push('JS:' + e.message));
      page.on('console', m => { if (m.type() === 'error') errs.push('CON:' + m.text()); });
      try {
        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
        const status = resp ? resp.status() : 0;
        const hasHeader = await page.locator('header').count();
        const hasFooter = await page.locator('footer').count();
        const hasCTA    = await page.locator('section.cta-strip').count();
        const h1Text    = await page.locator('h1').first().textContent().catch(()=>null);
        const fullH     = await page.evaluate(() => document.documentElement.scrollHeight);
        const out = path.join(outDir, `${p.name}_${vp.name}.png`);
        await page.screenshot({ path: out, fullPage: true });
        report.push({ vp: vp.name, page: p.name, status, header: hasHeader, footer: hasFooter, cta: hasCTA, h1: (h1Text||'').trim().slice(0,30), h: fullH, err: errs.length, size: fs.statSync(out).size });
      } catch (e) {
        report.push({ vp: vp.name, page: p.name, status: -1, error: e.message });
      }
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  console.log('=== Screenshot Report ===');
  for (const r of report) {
    console.log(JSON.stringify(r));
  }
  console.log('\n=== Summary ===');
  const errs = report.filter(r => r.error || r.status !== 200 || r.header === 0 || r.footer === 0);
  console.log(`Total: ${report.length}, Issues: ${errs.length}`);
  if (errs.length) console.log('Issues:', JSON.stringify(errs, null, 2));
})();
