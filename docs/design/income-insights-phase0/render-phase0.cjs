// Isolated screenshot renderer. Never loads application scripts or calls a provider.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const deps = process.env.TALLYO_DESIGN_NODE_MODULES || 'C:/Users/Edson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps, 'playwright'));

const references = [
  { source: 'desktop-finances.html', output: 'desktop-finances.png', viewport: { width: 1600, height: 1120 }, kind: 'desktop', minIcons: 25 },
  { source: 'mobile-finances.html', output: 'mobile-finances.png', viewport: { width: 390, height: 900 }, kind: 'mobile', minIcons: 8 },
  { source: 'desktop-customer-finances.html', output: 'desktop-customer-finances.png', viewport: { width: 1600, height: 1120 }, kind: 'desktop', minIcons: 20 },
  { source: 'mobile-customer-finances.html', output: 'mobile-customer-finances.png', viewport: { width: 390, height: 900 }, kind: 'mobile', minIcons: 8 },
  { source: 'states.html', output: 'states.png', viewport: { width: 1440, height: 1024 }, kind: 'state', minIcons: 3 },
];

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const results = [];
  try {
    for (const reference of references) {
      const page = await browser.newPage({
        viewport: reference.viewport,
        deviceScaleFactor: 2,
        isMobile: reference.kind === 'mobile',
        hasTouch: reference.kind === 'mobile',
      });
      const failures = [];
      page.on('pageerror', error => failures.push(error.message));
      await page.route(/^https?:/, route => {
        failures.push(`Unexpected network request: ${route.request().url()}`);
        return route.abort();
      });
      await page.goto(pathToFileURL(path.join(__dirname, reference.source)).href);
      await page.addScriptTag({ path: path.join(deps, 'lucide/dist/umd/lucide.min.js') });
      await page.evaluate(() => lucide.createIcons());
      await page.evaluate(() => document.fonts.ready);
      if (reference.kind === 'mobile') {
        // Keep the source navigation fixed for the design contract, but place it at
        // the end of the full-page review export so it does not cover content.
        await page.addStyleTag({ content: '.mobile-shell{position:relative}.mobile-bottom{position:absolute}' });
      }
      const qa = await page.evaluate(kind => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        imagesLoaded: [...document.images].every(image => image.complete && image.naturalWidth > 0),
        iconsRendered: document.querySelectorAll('svg.lucide').length,
        chartsWithText: document.querySelectorAll('[role="img"][aria-label]').length,
        dataTables: document.querySelectorAll('table.sr-only').length,
        scopeNotices: document.querySelectorAll('[role="note"]').length,
        headings: document.querySelectorAll('h1,h2,h3').length,
        clippedText: [...document.querySelectorAll('h1,h2,h3,p,button,dt,dd,strong,span')]
          .filter(element => {
            const style = getComputedStyle(element);
            if (style.position === 'absolute' || style.overflow === 'hidden' || element.closest('.sr-only')) return false;
            return element.scrollWidth > element.clientWidth + 1;
          })
          .map(element => element.textContent.trim()).filter(Boolean),
        kind,
      }), reference.kind);
      const expectedWidth = reference.viewport.width;
      if (qa.width !== expectedWidth || !qa.imagesLoaded || qa.iconsRendered < reference.minIcons || qa.clippedText.length || failures.length) {
        throw new Error(JSON.stringify({ reference, qa, failures }, null, 2));
      }
      if (reference.kind !== 'state' && (qa.chartsWithText < 2 || qa.scopeNotices !== 1)) {
        throw new Error(JSON.stringify({ reference, reason: 'Missing chart text alternative or scope notice', qa }, null, 2));
      }
      await page.screenshot({ path: path.join(__dirname, reference.output), fullPage: true });
      results.push({ ...reference, ...qa, screenshotWidth: qa.width * 2, screenshotHeight: qa.height * 2, networkRequests: 0, errors: failures });
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify(results, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
