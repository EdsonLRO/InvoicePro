// Render only the isolated design. Never load app scripts or make provider requests.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const deps = process.env.TALLYO_DESIGN_NODE_MODULES || 'C:/Users/Edson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps, 'playwright'));
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1120 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => { errors.push('Unexpected external request'); return route.abort(); });
    await page.goto(pathToFileURL(path.join(__dirname, 'desktop-accepted-quote.html')).href);
    await page.addScriptTag({ path: path.join(deps, 'lucide/dist/umd/lucide.min.js') });
    await page.evaluate(() => lucide.createIcons());
    await page.evaluate(() => document.fonts.ready);
    const qa = await page.evaluate(() => {
      const times = [...document.querySelectorAll('time')].map(e => Date.parse(e.dateTime));
      return {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        logoLoaded: [...document.images].every(i => i.complete && i.naturalWidth > 0),
        icons: document.querySelectorAll('svg.lucide').length,
        events: times.length,
        chronological: times.every((t, i) => Number.isFinite(t) && (!i || t > times[i - 1])),
        linkedDocuments: document.querySelectorAll('.document-node').length,
        manualConversionAction: [...document.querySelectorAll('button')].some(e => /convert/i.test(e.textContent)),
        clippedText: [...document.querySelectorAll('h1,h2,h3,p,button,.data-value,.summary-row')].filter(e => e.clientWidth && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim()),
        overflowingPanels: [...document.querySelectorAll('.panel')].filter(e => e.scrollHeight > e.clientHeight + 1).map(e => e.className),
      };
    });
    await page.screenshot({ path: path.join(__dirname, 'desktop-accepted-quote.png'), fullPage: true });
    if (qa.width !== 1600 || qa.height !== 1120 || !qa.logoLoaded || qa.events !== 5 || !qa.chronological || qa.linkedDocuments !== 2 || qa.manualConversionAction || qa.clippedText.length || qa.overflowingPanels.length || errors.length) throw new Error(JSON.stringify({ qa, errors }));
    console.log(JSON.stringify({ ...qa, resolution: '3200 x 2240', externalRequests: 0, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
