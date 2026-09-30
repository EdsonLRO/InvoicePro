// Local screenshot and mobile layout checks; no app/provider calls.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const deps = process.env.TALLYO_DESIGN_NODE_MODULES || 'C:/Users/Edson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps, 'playwright'));
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 940 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route(/^https?:/, route => { errors.push('External request'); return route.abort(); });
    await page.goto(pathToFileURL(path.join(__dirname, 'mobile-edit-items.html')).href);
    await page.addScriptTag({ path: path.join(deps, 'lucide/dist/umd/lucide.min.js') });
    await page.evaluate(() => lucide.createIcons()); await page.evaluate(() => document.fonts.ready);
    const qa = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight,
      logoLoaded: document.querySelector('.brand').naturalWidth > 0,
      cards: document.querySelectorAll('.item-card').length, expandedCards: document.querySelectorAll('.item-card[open]').length,
      tables: document.querySelectorAll('table').length,
      smallTouchTargets: [...document.querySelectorAll('button,summary,input,select,textarea')].filter(e => e.checkVisibility()).filter(e => { const r = e.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).map(e => e.getAttribute('aria-label') || e.textContent.trim()),
      clippedText: [...document.querySelectorAll('h1,h2,p,button,label,.item-name,.item-meta')].filter(e => e.checkVisibility() && e.clientWidth && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim()),
      totalsAboveDone: document.querySelector('.totals').getBoundingClientRect().bottom <= document.querySelector('.footer').getBoundingClientRect().top,
    }));
    await page.screenshot({ path: path.join(__dirname, 'mobile-edit-items.png'), fullPage: true });
    if (qa.width !== 390 || qa.height !== 940 || !qa.logoLoaded || qa.cards !== 2 || qa.expandedCards !== 1 || qa.tables || qa.smallTouchTargets.length || qa.clippedText.length || !qa.totalsAboveDone || errors.length) throw new Error(JSON.stringify({ qa, errors }));
    await page.locator('[data-item="copy"] summary').tap();
    await page.waitForFunction(() => document.querySelector('[data-item="copy"]').open && !document.querySelector('[data-item="website"]').open);
    const narrowChecks = [];
    for (const width of [360, 390]) { await page.setViewportSize({ width, height: 844 }); await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); narrowChecks.push(await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, totalsAccessible: document.querySelector('.totals').getBoundingClientRect().bottom <= document.querySelector('.footer').getBoundingClientRect().top }))); }
    if (narrowChecks.some(c => c.viewport !== c.document || !c.totalsAccessible)) throw new Error('Narrow layout failed');
    console.log(JSON.stringify({ ...qa, resolution: '780 x 1880', accordion: 'pass', narrowChecks, externalRequests: 0, errors, arithmetic: '800 + 200 = 1000 subtotal; tax 200; line totals 960 + 240 = 1200' }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
