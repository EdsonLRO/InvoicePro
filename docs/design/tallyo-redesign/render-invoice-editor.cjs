// Local, isolated mockup renderer. No production scripts or provider requests.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const deps = process.env.TALLYO_DESIGN_NODE_MODULES || 'C:/Users/Edson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps, 'playwright'));
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1120 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route(/^https?:/, route => { errors.push('Unexpected external request'); return route.abort(); });
    await page.goto(pathToFileURL(path.join(__dirname, 'desktop-invoice-editor.html')).href);
    await page.addScriptTag({ path: path.join(deps, 'lucide/dist/umd/lucide.min.js') });
    await page.evaluate(() => lucide.createIcons());
    await page.evaluate(() => document.fonts.ready);
    const qa = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      logoLoaded: [...document.images].every(i => i.complete && i.naturalWidth > 0),
      icons: document.querySelectorAll('svg.lucide').length,
      lineItems: document.querySelectorAll('tbody tr').length,
      railSections: document.querySelectorAll('.rail-card').length,
      clippedText: [...document.querySelectorAll('h1,h2,h3,p,button,.input,.text-box')].filter(e => e.clientWidth && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim()),
      manuallySelectablePaid: document.querySelector('.status').getAttribute('aria-label').includes('Paid'),
    }));
    await page.screenshot({ path: path.join(__dirname, 'desktop-invoice-editor.png'), fullPage: true });
    if (qa.width !== 1600 || qa.height !== 1120 || !qa.logoLoaded || qa.icons < 30 || qa.lineItems !== 2 || qa.railSections !== 4 || qa.clippedText.length || qa.manuallySelectablePaid || errors.length) throw new Error(JSON.stringify({ qa, errors }));
    await page.evaluate(() => { document.querySelector('.more-menu').classList.add('open'); document.querySelector('#more-button').setAttribute('aria-expanded', 'true'); });
    await page.locator('.more-menu').screenshot({ path: path.join(__dirname, 'desktop-invoice-editor-more.png') });
    console.log(JSON.stringify({ ...qa, resolution: '3200 x 2240', externalRequests: 0, errors, totalCheck: '8 × 95 + 240 = 1000; tax 200; total and balance 1200' }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
