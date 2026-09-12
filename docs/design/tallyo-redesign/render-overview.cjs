// Isolated screenshot renderer. Never loads application scripts or calls a provider.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const deps = process.env.TALLYO_DESIGN_NODE_MODULES || 'C:/Users/Edson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps, 'playwright'));
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1120 }, deviceScaleFactor: 2 });
    const failures = [];
    page.on('pageerror', e => failures.push(e.message));
    await page.route(/^https?:/, route => { failures.push('Unexpected network request'); return route.abort(); });
    await page.goto(pathToFileURL(path.join(__dirname, 'desktop-overview.html')).href);
    await page.addScriptTag({ path: path.join(deps, 'lucide/dist/umd/lucide.min.js') });
    await page.evaluate(() => lucide.createIcons());
    await page.evaluate(() => document.fonts.ready);
    const qa = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      imagesLoaded: [...document.images].every(i => i.complete && i.naturalWidth > 0),
      iconsRendered: document.querySelectorAll('svg.lucide').length,
      attentionActions: document.querySelectorAll('.attention-row .row-action').length,
      kpis: document.querySelectorAll('.kpi').length,
      clippedText: [...document.querySelectorAll('h1,h2,h3,p,button,.age-row,.step')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim()),
    }));
    if (qa.width !== 1600 || qa.height !== 1120 || !qa.imagesLoaded || qa.iconsRendered < 30 || qa.attentionActions !== 4 || qa.kpis !== 4 || qa.clippedText.length || failures.length) throw new Error(JSON.stringify({qa, failures}));
    await page.screenshot({ path: path.join(__dirname, 'desktop-overview.png'), fullPage: true });
    console.log(JSON.stringify({ ...qa, screenshot: 'desktop-overview.png', resolution: '3200 x 2240', networkRequests: 0, errors: failures }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
