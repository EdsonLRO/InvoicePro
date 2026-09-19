// Static design reference; no app scripts, provider requests or customer lookups.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const deps = process.env.TALLYO_DESIGN_NODE_MODULES || 'C:/Users/Edson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps, 'playwright'));
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1040 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => { errors.push('Unexpected external request'); return route.abort(); });
    await page.goto(pathToFileURL(path.join(__dirname, 'desktop-customer-detail.html')).href);
    await page.addScriptTag({ path: path.join(deps, 'lucide/dist/umd/lucide.min.js') });
    await page.evaluate(() => lucide.createIcons());
    await page.evaluate(() => document.fonts.ready);
    const qa = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      logoLoaded: [...document.images].every(i => i.complete && i.naturalWidth > 0),
      kpis: document.querySelectorAll('.kpi').length,
      documentLinks: [...document.querySelectorAll('.doc-id')].map(a => a.getAttribute('href')),
      activityEvents: document.querySelectorAll('.event').length,
      recurringSchedules: document.querySelectorAll('.schedule').length,
      clippedText: [...document.querySelectorAll('h1,h2,h3,p,button,.contact,.schedule-stat')].filter(e => e.clientWidth && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim()),
      overflowingPanels: [...document.querySelectorAll('.panel')].filter(e => e.scrollHeight > e.clientHeight + 1).map(e => e.className),
    }));
    await page.screenshot({ path: path.join(__dirname, 'desktop-customer-detail.png'), fullPage: true });
    if (qa.width !== 1600 || qa.height !== 1040 || !qa.logoLoaded || qa.kpis !== 3 || qa.documentLinks.length !== 4 || new Set(qa.documentLinks).size !== 4 || qa.activityEvents !== 4 || qa.recurringSchedules !== 1 || qa.clippedText.length || qa.overflowingPanels.length || errors.length) throw new Error(JSON.stringify({ qa, errors }));
    console.log(JSON.stringify({ ...qa, resolution: '3200 x 2080', externalRequests: 0, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
