// Render an actual narrow mobile page, not a scaled desktop or device frame.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const deps = process.env.TALLYO_DESIGN_NODE_MODULES || 'C:/Users/Edson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps, 'playwright'));
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => { errors.push('Unexpected external request'); return route.abort(); });
    await page.goto(pathToFileURL(path.join(__dirname, 'mobile-overview.html')).href);
    await page.addScriptTag({ path: path.join(deps, 'lucide/dist/umd/lucide.min.js') });
    await page.evaluate(() => lucide.createIcons());
    await page.evaluate(() => document.fonts.ready);
    const qa = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      logoLoaded: document.querySelector('.brand').naturalWidth > 0,
      summaryRows: document.querySelectorAll('.summary-row').length,
      activityItems: document.querySelectorAll('.event').length,
      smallTouchTargets: [...document.querySelectorAll('button')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.width < 44 || r.height < 44); }).map(e => e.textContent.trim() || e.getAttribute('aria-label')),
      clippedText: [...document.querySelectorAll('h1,h2,h3,p,button')].filter(e => e.clientWidth && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim()),
      activityAboveNavigation: document.querySelector('.feed').getBoundingClientRect().bottom <= document.querySelector('.bottom-nav').getBoundingClientRect().top,
    }));
    await page.screenshot({ path: path.join(__dirname, 'mobile-overview.png'), fullPage: true });
    if (qa.width !== 390 || qa.height !== 844 || !qa.logoLoaded || qa.summaryRows !== 4 || qa.activityItems !== 2 || qa.smallTouchTargets.length || qa.clippedText.length || !qa.activityAboveNavigation || errors.length) throw new Error(JSON.stringify({ qa, errors }));
    await page.locator('#new-button').tap();
    if (!await page.locator('#new-sheet').isVisible()) throw new Error('Global New menu did not open');
    await page.locator('#close-new').tap();
    if (await page.locator('#new-sheet').isVisible()) throw new Error('Global New menu did not close');
    const narrowChecks = [];
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 844 });
      narrowChecks.push(await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth })));
    }
    if (narrowChecks.some(c => c.viewport !== c.document)) throw new Error('Horizontal scrolling at narrow width');
    console.log(JSON.stringify({ ...qa, resolution: '780 x 1688', newMenuOpensAndCloses: true, narrowChecks, externalRequests: 0, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
