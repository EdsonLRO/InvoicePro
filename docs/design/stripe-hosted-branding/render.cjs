// Isolated Stripe-hosted branding reference renderer. It never loads application scripts or calls a provider.
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const deps = process.env.TALLYO_DESIGN_NODE_MODULES || 'C:/Users/Edson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps, 'playwright'));

const references = [
  ['subscription-checkout.html', 'subscription-checkout.png'],
  ['customer-portal.html', 'customer-portal.png'],
  ['invoice-payment.html', 'invoice-payment.png'],
];

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    for (const [source, screenshot] of references) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
      const failures = [];
      page.on('pageerror', error => failures.push(error.message));
      await page.route(/^https?:/, route => {
        failures.push(`Unexpected network request: ${route.request().url()}`);
        return route.abort();
      });
      await page.goto(pathToFileURL(path.join(__dirname, source)).href);
      await page.evaluate(() => document.fonts.ready);
      const qa = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        imagesLoaded: [...document.images].every(image => image.complete && image.naturalWidth > 0),
        poweredByStripe: document.body.innerText.includes('Powered by Stripe'),
        clippedText: [...document.querySelectorAll('h1,h2,p,button,label,strong,span')]
          .filter(element => element.scrollWidth > element.clientWidth + 1)
          .map(element => element.textContent.trim()),
      }));
      assert.equal(qa.width, 1440, `${source} must remain exactly 1440px wide`);
      assert.ok(qa.height <= 960, `${source} must fit the reference viewport`);
      assert.equal(qa.imagesLoaded, true, `${source} must use loaded local imagery`);
      assert.equal(qa.poweredByStripe, true, `${source} must retain Powered by Stripe`);
      assert.deepEqual(qa.clippedText, [], `${source} must not clip visible text`);
      assert.deepEqual(failures, [], `${source} must make no network request or page error`);
      await page.screenshot({ path: path.join(__dirname, screenshot), fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 });
      const mobile = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        clippedText: [...document.querySelectorAll('h1,h2,p,button,label,strong,span')]
          .filter(element => element.scrollWidth > element.clientWidth + 1)
          .map(element => element.textContent.trim()),
      }));
      assert.equal(mobile.width, 390, `${source} must not overflow at 390px`);
      assert.deepEqual(mobile.clippedText, [], `${source} must not clip text at 390px`);
      await page.close();
      console.log(`${screenshot}: desktop and 390px references passed with official local imagery and zero network requests.`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
