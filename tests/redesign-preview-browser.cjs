// Optional local browser acceptance; requires Playwright and Chrome, no live services.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const { artifact, serve, root } = await import('../dev/redesign/preview.mjs');
  const original = await artifact();
  const changed = { files: new Map(original.files), revision: `${original.revision}-rollback-probe` };
  changed.files.set('/', { ...original.files.get('/'), bytes: Buffer.from(original.files.get('/').bytes.toString().replace('<title>Tallyo</title>', '<title>Tallyo rollback probe</title>')) });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const outside = [], errors = [];
  try {
    for (const snapshot of [original, changed, original]) {
      const server = await serve(snapshot, 0);
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
      try {
        const origin = `http://127.0.0.1:${server.address().port}`;
        await context.route('**/*', route => {
          const url = route.request().url();
          if (url.startsWith(`${origin}/`)) return route.continue();
          outside.push(url); return route.abort();
        });
        const page = await context.newPage();
        page.on('pageerror', error => errors.push(error.message));
        const response = await page.goto(origin);
        assert.equal(response.headers()['x-preview-revision'], snapshot.revision);
        await page.locator('#preview-warning').waitFor();
        assert.match(await page.locator('body').innerText(), /£240\.00/);
        assert.equal(await page.locator('script[src*="supabase"],script[src*="analytics"],link[rel="manifest"]').count(), 0);
        if (snapshot === changed) {
          assert.equal(await page.title(), 'Tallyo rollback probe');
          continue;
        }
        assert.equal(await page.title(), 'Tallyo');
        await page.locator('#primary-navigation').getByRole('button', { name: 'Customers', exact: true }).click();
        await page.getByRole('button', { name: '+ New Customer', exact: true }).click();
        await page.locator('input').filter({ visible: true }).first().fill('Preview test customer');
        await page.getByRole('button', { name: 'Save Customer', exact: true }).click();
        await page.getByRole('table').getByText('Preview test customer', { exact: true }).waitFor();
        await page.reload();
        await page.locator('#preview-warning').waitFor();
        assert.equal(await page.getByText('Preview test customer', { exact: true }).count(), 0);
        // Invoke the dev adapter only: every server-side side effect must return an error.
        const blocked = await page.evaluate(async () => {
          const client = window.supabase.createClient();
          const result = [];
          for (const action of ['send-document-email', 'create-connect-checkout', 'create-billing-checkout', 'owner-account-admin']) {
            result.push(Boolean((await client.functions.invoke(action)).error));
          }
          return result;
        });
        assert.deepEqual(blocked, [true, true, true, true]);
        await page.locator('#primary-navigation').getByRole('button', { name: 'Overview', exact: true }).click();
        await mkdir(path.join(root, 'tmp/redesign-evidence'), { recursive: true });
        await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/desktop-baseline.png'), fullPage: true });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/mobile-baseline.png'), fullPage: true });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      } finally {
        await context.close(); await new Promise(done => server.close(done));
      }
    }
    assert.deepEqual(outside, [], 'no non-loopback request may be attempted');
    assert.deepEqual(errors, [], 'preview must mount without uncaught JS errors');
    console.log('Browser acceptance passed: actual app rendering, fictional customer save/reset, blocked side effects, no external requests, 390px baseline, actual artifact A-B-A restoration.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
