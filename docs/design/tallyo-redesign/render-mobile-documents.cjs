// Isolated mobile mockup rendering and synthetic interaction checks.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const deps = process.env.TALLYO_DESIGN_NODE_MODULES || 'C:/Users/Edson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps, 'playwright'));
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 860 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => { errors.push('Unexpected external request'); return route.abort(); });
    await page.goto(pathToFileURL(path.join(__dirname, 'mobile-documents.html')).href);
    await page.addScriptTag({ path: path.join(deps, 'lucide/dist/umd/lucide.min.js') });
    await page.evaluate(() => lucide.createIcons()); await page.evaluate(() => document.fonts.ready);
    const qa = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight,
      logoLoaded: document.querySelector('.brand').naturalWidth > 0,
      cards: document.querySelectorAll('.document').length, tables: document.querySelectorAll('table').length,
      documentRoutes: [...document.querySelectorAll('.record-open')].map(e => e.getAttribute('href')),
      smallTouchTargets: [...document.querySelectorAll('button,a,input')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.width < 44 || r.height < 44); }).map(e => e.getAttribute('aria-label') || e.textContent.trim()),
      clippedText: [...document.querySelectorAll('h1,h2,h3,p,button,.customer,.record-heading,.due')].filter(e => e.clientWidth && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim()),
      cardsAboveNavigation: document.querySelector('.records').getBoundingClientRect().bottom <= document.querySelector('.bottom-nav').getBoundingClientRect().top,
    }));
    await page.screenshot({ path: path.join(__dirname, 'mobile-documents.png'), fullPage: true });
    if (qa.width !== 390 || qa.height !== 860 || !qa.logoLoaded || qa.cards !== 4 || qa.tables || qa.smallTouchTargets.length || qa.clippedText.length || !qa.cardsAboveNavigation || errors.length) throw new Error(JSON.stringify({ qa, errors }));
    await page.locator('.filter[data-status="overdue"]').tap();
    if (await page.locator('.document:visible').count() !== 1) throw new Error('Overdue filter failed');
    await page.locator('.filter[data-status="all"]').tap(); await page.locator('#search').fill('Harris');
    if (await page.locator('.document:visible').count() !== 1 || !await page.locator('[data-id="QUO-0217"]').isVisible()) throw new Error('Search failed');
    await page.locator('#search').fill(''); await page.locator('.overflow').first().tap();
    if (!await page.locator('#actions-sheet').isVisible()) throw new Error('Overflow failed');
    await page.locator('#actions-sheet .close-sheet').tap(); await page.locator('#new-button').tap();
    if (!await page.locator('#new-sheet').isVisible()) throw new Error('New menu failed');
    await page.locator('#new-sheet .close-sheet').tap();
    const narrowChecks = [];
    for (const width of [360, 390]) { await page.setViewportSize({ width, height: 844 }); narrowChecks.push(await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }))); }
    if (narrowChecks.some(c => c.viewport !== c.document)) throw new Error('Horizontal overflow');
    console.log(JSON.stringify({ ...qa, resolution: '780 x 1720', searchAndFilter: 'pass', menus: 'pass', narrowChecks, externalRequests: 0, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
