#!/bin/bash
set -euo pipefail
cd /Users/kobayashi/Desktop/claude/sanpuku/ashikarada/mocks
python3 -m http.server 8777 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
sleep 2
cd .screenshots
NODE_PATH=/opt/homebrew/lib/node_modules/designlang/node_modules node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const pages = [['/', 'task5-top'], ['/page-stores-okaido.html', 'task5-okaido'], ['/page-stores-airport.html', 'task5-airport']];
  for (const [u, n] of pages) {
    for (const vp of [{width:1280,height:900,t:'pc'},{width:390,height:844,t:'sp'}]) {
      const p = await b.newPage({ viewport: vp });
      await p.goto('http://localhost:8777' + u, { waitUntil: 'load' });
      await p.waitForTimeout(800);
      await p.screenshot({ path: n + '-' + vp.t + '.png' });
      await p.close();
    }
  }
  await b.close();
  console.log('shots done');
})();
"
