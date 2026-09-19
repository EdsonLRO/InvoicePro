const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const { artifact, serve } = await import('../dev/quote-acceptance/preview.mjs');
  const snapshot = await artifact();
  const server = await serve(snapshot, 0);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const outside = [], errors = [];
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block' });
    await context.route('**/*', route => {
      if (route.request().url().startsWith(`${origin}/`)) return route.continue();
      outside.push(route.request().url()); return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/customer`);
    assert.match(await page.locator('main').innerText(), /QUOTE QUO-0217/i);
    assert.equal(await page.locator('text=Respond to this quote').count(), 1);
    await page.getByLabel('Your name').fill('Sarah Jones');
    await page.getByLabel('Your name').press('Enter');
    await page.getByRole('heading', { name: 'Quote accepted' }).waitFor();
    assert.match(await page.locator('main').innerText(), /Invoice INV-1048 has been created as a draft/);
    assert.match(await page.locator('main').innerText(), /No payment has been taken/);
    await page.getByRole('button', { name: 'View invoice' }).click();
    assert.equal(await page.locator('.invoice-readonly').count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    for (const unavailable of ['expired', 'revoked']) {
      await page.goto(`${origin}/customer?state=${unavailable}`);
      assert.equal(await page.getByRole('button', { name: 'Accept quote' }).count(), 0);
      assert.match(await page.locator('main').innerText(), unavailable === 'expired' ? /expired/ : /no longer available/);
    }
    await page.goto(`${origin}/customer`);
    await page.getByRole('button', { name: 'Decline quote' }).click();
    assert.equal(await page.getByRole('heading', { name: 'Decline this quote?' }).count(), 1);
    await page.getByRole('button', { name: 'Confirm decline' }).click();
    assert.match(await page.locator('main').innerText(), /No invoice has been created/);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${origin}/owner`);
    assert.equal(await page.getByText('Accepted', { exact: true }).count() > 0, true);
    assert.match(await page.locator('main').innerText(), /Quote QUO-0217[\s\S]*Invoice[\s\S]*INV-1048/);
    assert.equal(await page.locator('.activity li').count(), 5);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(outside, []);
    assert.deepEqual(errors, []);
    console.log('Quote acceptance browser preview passed: pending/accept/decline/unavailable states, linked invoice, owner activity, keyboard submit, responsive layout and zero external requests.');
    await context.close();
  } finally {
    await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
