// ヒーローのeyebrow/h1の位置・サイズを実測（h1構造変更の前後比較用）
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const vp of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport: vp });
    await page.goto('file://' + path.resolve(__dirname, '../index.html'), { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => {
      const pick = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const b = el.getBoundingClientRect();
        const c = getComputedStyle(el);
        return {
          text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 28),
          top: Math.round(b.top), left: Math.round(b.left),
          w: Math.round(b.width), h: Math.round(b.height),
          size: c.fontSize, weight: c.fontWeight, ls: c.letterSpacing, color: c.color,
        };
      };
      return {
        eyebrow: pick('.hero .eyebrow'),
        h1main: pick('.hero h1 .h1-main'),
        h1: pick('.hero h1'),
        h1text: document.querySelector('.hero h1').innerText.replace(/\s+/g, ' ').trim(),
        lead: pick('.hero p.lead'),
        h1count: document.querySelectorAll('h1').length,
      };
    });
    console.log(`--- viewport ${vp.width}px ---`);
    console.log('eyebrow:', JSON.stringify(r.eyebrow));
    console.log('h1main :', JSON.stringify(r.h1main));
    console.log('h1     :', JSON.stringify(r.h1));
    console.log('lead   :', JSON.stringify(r.lead));
    console.log('h1テキスト:', r.h1text, '| h1数:', r.h1count);
    await page.close();
  }
  await browser.close();
})();
