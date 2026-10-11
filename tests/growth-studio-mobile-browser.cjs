// Isolated responsive acceptance for the Owner-only Growth Studio. No live services.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const { artifact, serve, root } = await import('../dev/redesign/preview.mjs');
  const snapshot = await artifact();
  const server = await serve(snapshot, 0);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  const outside = [];
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    for (const viewport of [{ width: 360, height: 800 }, { width: 430, height: 932 }]) {
      const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
      try {
        await context.route('**/*', route => {
          const url = route.request().url();
          if (url.startsWith(`${origin}/`)) return route.continue();
          outside.push(url);
          return route.abort();
        });
        const page = await context.newPage();
        page.setDefaultTimeout(10000);
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${origin}/#growth`);
        try {
          await page.getByRole('heading', { name: 'Tallyo Growth Studio', exact: true }).waitFor();
        } catch (error) {
          throw new Error(`${error.message}\nVisible preview: ${(await page.locator('body').innerText()).slice(0, 2000)}`);
        }

        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${viewport.width}px page must not overflow horizontally`);
        const hero = page.locator('.growth-hero');
        const heroStyle = await hero.evaluate(element => {
          const style = getComputedStyle(element);
          return { backgroundImage: style.backgroundImage, color: style.color };
        });
        assert.notEqual(heroStyle.backgroundImage, 'none', 'hero must retain its high-contrast background');
        assert.equal(heroStyle.color, 'rgb(255, 255, 255)', 'hero foreground must remain white');

        const tabs = page.locator('.growth-section-tabs');
        assert.equal(await tabs.getByRole('button').count(), 9, 'all Growth Studio sections must be visible on phones');
        const tabColumns = await tabs.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length);
        assert.equal(tabColumns, 3, 'phone section switcher must use three columns');

        await tabs.getByRole('button', { name: 'Content Studio', exact: true }).click();
        const queue = page.locator('.growth-content-queue-items');
        const queueLayout = await queue.evaluate(element => ({ display: getComputedStyle(element).display, scrolls: element.scrollWidth > element.clientWidth }));
        assert.deepEqual(queueLayout, { display: 'grid', scrolls: true }, 'content queue must be a compact horizontal rail');
        await page.getByRole('heading', { name: 'Edit LinkedIn draft', exact: true }).waitFor();
        await page.waitForTimeout(200);

        const privacy = await page.locator('.app-cookie-settings').evaluate(element => {
          element.hidden = false;
          const box = element.getBoundingClientRect();
          const nav = document.querySelector('.shell-bottom-nav').getBoundingClientRect();
          return { width: box.width, height: box.height, bottom: box.bottom, navTop: nav.top };
        });
        assert.ok(privacy.width <= 44 && privacy.height <= 44, 'phone privacy control must remain compact');
        assert.ok(privacy.bottom <= privacy.navTop, 'phone privacy control must not overlap bottom navigation');

        await mkdir(path.join(root, 'tmp/growth-studio-mobile'), { recursive: true });
        await page.screenshot({ path: path.join(root, `tmp/growth-studio-mobile/${viewport.width}px.png`), fullPage: true });
      } finally {
        await context.close();
      }
    }
    assert.deepEqual(outside, [], 'mobile preview must not attempt non-loopback requests');
    assert.deepEqual(errors, [], 'mobile preview must mount without uncaught errors');
    console.log('Growth Studio mobile browser acceptance passed at 360px and 430px.');
  } finally {
    await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
