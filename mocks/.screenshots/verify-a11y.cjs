const { chromium } = require('playwright');
const path = require('path');
const BASE = 'file://' + path.resolve(__dirname, '..');
const PAGES = ['index.html','page-first-time.html','page-menu.html','page-features.html',
  'page-stores.html','page-stores-okaido.html','page-stores-airport.html',
  'page-voice.html','page-faq.html','page-reserve.html','page-tickets.html','404.html'];

const lum = (rgb) => {
  const c = rgb.match(/\d+/g).slice(0,3).map(v => v/255);
  const l = c.map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
  return 0.2126*l[0] + 0.7152*l[1] + 0.0722*l[2];
};
const ratio = (a,b) => { const [x,y] = [lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };

(async () => {
  const browser = await chromium.launch({ headless: true });
  let fail = 0;
  for (const p of PAGES) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${BASE}/${p}`, { waitUntil: 'load' });
    await page.waitForTimeout(400);

    const r = await page.evaluate(() => {
      const box = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { w: Math.round(b.width), h: Math.round(b.height) };
      };
      const small = [];
      document.querySelectorAll('.foot-col a').forEach(a => {
        const b = a.getBoundingClientRect();
        if (b.height < 40) small.push(Math.round(b.height));
      });
      const gold = document.querySelector('.btn-gold');
      const gs = gold ? getComputedStyle(gold) : null;
      return { ham: box('.ham'), footSmall: small.length,
               goldBg: gs ? gs.backgroundColor : null, goldFg: gs ? gs.color : null };
    });

    const hamOK = r.ham && r.ham.w >= 44 && r.ham.h >= 44;
    const footOK = r.footSmall === 0;
    const cr = r.goldBg ? ratio(r.goldFg, r.goldBg) : 0;
    const goldOK = cr >= 4.5;
    if (!hamOK || !footOK || !goldOK) fail++;
    console.log(`${p.padEnd(26)} ham:${r.ham ? r.ham.w+'x'+r.ham.h : 'n/a'}${hamOK?'✅':'❌'} ` +
                `小さいフッターリンク:${r.footSmall}${footOK?'✅':'❌'} btn-gold:${cr.toFixed(2)}:1${goldOK?'✅':'❌'}`);
    await page.close();
  }
  await browser.close();
  console.log(fail === 0 ? '\n判定: PASS ✅' : `\n判定: FAIL ❌ ${fail}ページ`);
  process.exit(fail === 0 ? 0 : 1);
})();
