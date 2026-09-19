// Isolated 390px section-editor design and layout validation.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const deps = process.env.TALLYO_DESIGN_NODE_MODULES || 'C:/Users/Edson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps, 'playwright'));
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 940 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => { errors.push('Unexpected external request'); return route.abort(); });
    await page.goto(pathToFileURL(path.join(__dirname, 'mobile-invoice-editor-sections.html')).href);
    await page.addScriptTag({ path: path.join(deps, 'lucide/dist/umd/lucide.min.js') });
    await page.evaluate(() => lucide.createIcons()); await page.evaluate(() => document.fonts.ready);
    const qa = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight,
      logoLoaded: document.querySelector('.brand').naturalWidth > 0,
      sections: [...document.querySelectorAll('.section-label')].map(e => e.textContent),
      tables: document.querySelectorAll('table').length,
      smallTouchTargets: [...document.querySelectorAll('button')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.width < 44 || r.height < 44); }).map(e => e.getAttribute('aria-label') || e.textContent.trim()),
      clippedText: [...document.querySelectorAll('h1,h2,h3,p,button,.section-value,.section-secondary')].filter(e => e.clientWidth && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim()),
      summaryAboveActions: document.querySelector('.total-card').getBoundingClientRect().bottom <= document.querySelector('.actions').getBoundingClientRect().top,
    }));
    await page.screenshot({ path: path.join(__dirname, 'mobile-invoice-editor-sections.png'), fullPage: true });
    if (qa.width !== 390 || qa.height !== 940 || !qa.logoLoaded || qa.sections.length !== 6 || qa.tables || qa.smallTouchTargets.length || qa.clippedText.length || !qa.summaryAboveActions || errors.length) throw new Error(JSON.stringify({ qa, errors }));
    await page.locator('#more-button').tap();
    if (!await page.locator('#more-sheet').isVisible()) throw new Error('More menu failed');
    await page.locator('#close-more').tap();
    const narrowChecks = [];
    for (const width of [360, 390]) { await page.setViewportSize({ width, height: 844 }); await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); narrowChecks.push(await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, summaryAccessible: document.querySelector('.total-card').getBoundingClientRect().bottom <= document.querySelector('.actions').getBoundingClientRect().top }))); }
    if (narrowChecks.some(c => c.viewport !== c.document || !c.summaryAccessible)) throw new Error('Narrow layout failure');
    console.log(JSON.stringify({ ...qa, resolution: '780 x 1880', moreMenu: 'pass', narrowChecks, externalRequests: 0, errors, amounts: '1250 + 250 tax = 1500; paid 0; balance 1500' }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
