const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const { artifact, serve } = await import('../dev/redesign/preview.mjs');
  const server = await serve(await artifact(), 0);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  const outside = [], errors = [];
  await context.route('**/*', route => {
    if (route.request().url().startsWith(`${origin}/`)) return route.continue();
    outside.push(route.request().url()); return route.abort();
  });
  try {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.accept());
    await page.goto(`${origin}/#branding`);
    await page.locator('#preview-warning').waitFor();
    const vmRead = expression => page.evaluate(expression => {
      const vm = document.querySelector('#app').__vue_app__._container._vnode.component.proxy;
      return Function('vm', `return (${expression})`)(vm);
    }, expression);

    const choices = page.locator('.template-choice');
    assert.equal(await choices.count(), 4, 'Branding offers four curated styles');
    if (process.env.TALLYO_BRANDING_SCREENSHOT) {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.screenshot({
        path: process.env.TALLYO_BRANDING_SCREENSHOT,
        type: 'jpeg',
        quality: 84,
      });
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    const signatures = new Set();
    for (const template of ['tallyo', 'basic', 'modern', 'professional']) {
      const choice = page.locator(`.template-choice-${template}`);
      await choice.click();
      assert.equal(await choice.getAttribute('aria-pressed'), 'true');
      assert.equal(await vmRead('vm.company.invoiceTemplate'), template);
      const preview = page.locator(`.document-template-surface.invoice-template-${template}`).last();
      await preview.waitFor();
      signatures.add(await preview.evaluate(element => {
        const header = getComputedStyle(element.querySelector('.pdf-document-header'));
        const table = getComputedStyle(element.querySelector('.pdf-line-items thead tr'));
        const total = getComputedStyle(element.querySelector('.pdf-document-total'));
        return [header.backgroundColor, header.borderBottomWidth, table.backgroundColor, table.color, total.backgroundColor].join('|');
      }));
    }
    assert.equal(signatures.size, 4, 'the choices produce materially different document presentations');

    const rowToggle = page.getByLabel('Alternating item row colours');
    const brandingPreview = page.locator('.document-template-surface').last();
    const secondRow = brandingPreview.locator('.pdf-line-items tbody tr').nth(1);
    assert.equal(await rowToggle.isChecked(), true);
    assert.equal(await secondRow.evaluate(row => row.classList.contains('pdf-row-tinted')), true);
    await rowToggle.uncheck();
    assert.equal(await secondRow.evaluate(row => row.classList.contains('pdf-row-tinted')), false);
    await page.getByRole('button', { name: 'Save Branding', exact: true }).click();
    assert.equal(await vmRead('vm.companyToRow().invoice_template'), 'professional');
    assert.equal(await vmRead('vm.companyToRow().alternate_item_rows'), false);

    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Branding does not overflow a phone viewport');
    assert.equal(await choices.count(), 4);
    await page.evaluate(() => { location.hash = '#create'; });
    await page.waitForURL('**/#create');
    await page.locator('.editor-header').getByRole('button', { name: 'Preview', exact: true }).click();
    await page.waitForURL('**/#create-preview');
    const canvas = page.locator('#invoice-canvas');
    assert.ok(await canvas.evaluate(element => element.classList.contains('invoice-template-professional')), 'saved template reaches document preview');
    assert.equal(await canvas.locator('tbody tr.pdf-row-tinted').count(), 0, 'disabled alternating rows reach document preview');

    assert.deepEqual(outside, []);
    assert.deepEqual(errors, []);
    console.log('Invoice template browser checks passed at desktop and mobile widths.');
  } finally {
    await context.close();
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
