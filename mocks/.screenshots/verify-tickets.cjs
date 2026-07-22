const { chromium } = require('playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = __dirname;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const check = async (file, label, width) => {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const msgs = [];
    page.on('console', m => { if (m.type() === 'error') msgs.push(m.text()); });
    page.on('pageerror', e => msgs.push('PAGEERR: ' + e.message));
    await page.goto('file://' + path.join(ROOT, file), { waitUntil: 'networkidle' });
    const shot = path.join(OUT, `tickets-${label}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    // 基本要素
    const has = async sel => (await page.$(sel)) !== null;
    const header = await has('header');
    const footer = await has('footer');
    const cta = await has('.cta-strip');
    const navTicket = await page.$$eval('nav.menu a', as => as.some(a => a.textContent.includes('お得なチケット')));
    const footTicket = await page.$$eval('footer a', as => as.some(a => a.textContent.includes('お得なチケット')));
    const mobileTicket = await page.$$eval('.mobile-menu a', as => {
      const arr = as.filter(a => a.textContent.includes('お得なチケット'));
      return arr.length ? { present: true, isLast: as[as.length-1].textContent.includes('お得なチケット') } : { present: false };
    });
    const h1 = await page.$eval('h1', el => el.textContent.trim()).catch(()=>null);
    const prices = await page.$$eval('.tk-price', els => els.map(e => e.textContent.replace(/\s+/g,'')));
    console.log(`\n=== ${file} @${width} (${label}) ===`);
    console.log(` header:${header} footer:${footer} cta:${cta} h1:"${h1}"`);
    console.log(` navTicket:${navTicket} footTicket:${footTicket} mobileTicket:`, mobileTicket);
    console.log(` prices:`, prices.join(' | '));
    console.log(` shot: ${shot}`);
    if (msgs.length) { console.log(' JSエラー:', msgs); errors.push(`${file}: ${msgs.join(';')}`); }
    if (!navTicket) errors.push(`${file}: nav に tickets 無し`);
    if (!footTicket) errors.push(`${file}: footer に tickets 無し`);
    await page.close();
  };

  await check('page-tickets.html', 'pc', 1280);
  await check('page-tickets.html', 'sp', 390);
  // 別ページでもリンク挿入されているか（下層 + TOP）
  await check('page-faq.html', 'faq-pc', 1280);
  await check('mock-a-real.html', 'top-pc', 1280);

  await browser.close();
  console.log('\n============================');
  if (errors.length) { console.log('❌ 問題あり:\n' + errors.join('\n')); process.exit(1); }
  else console.log('✅ 全チェックPASS');
})();
