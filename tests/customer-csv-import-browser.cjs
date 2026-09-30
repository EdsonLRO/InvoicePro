const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const { artifact, serve } = await import('../dev/redesign/preview.mjs');
  const server = await serve(await artifact(), 0);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const outside = [];
  const errors = [];
  await context.route('**/*', route => {
    if (route.request().url().startsWith(`${origin}/`)) return route.continue();
    outside.push(route.request().url());
    return route.abort();
  });

  try {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/#customers`);
    await page.locator('#preview-warning').waitFor();

    const importButton = page.getByRole('button', { name: 'Import CSV', exact: true });
    await importButton.click();
    const dialog = page.getByRole('dialog', { name: 'Import customers from CSV' });
    await dialog.waitFor();
    assert.equal(await dialog.locator('input[type=file]').evaluate(element => element === document.activeElement), true, 'file input receives focus');
    assert.ok(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth), 'dialog has no horizontal overflow');

    await dialog.locator('input[type=file]').setInputFiles({
      name: 'customers.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('Name,Email,Ignored\nNew Customer,new@example.test,discarded\nExisting,hello@willowpine.example,discarded\nInvalid,bad-email,discarded\n')
    });
    await dialog.getByText('1', { exact: true }).first().waitFor();
    assert.match(await dialog.innerText(), /Ready to import\s+1/i);
    assert.match(await dialog.innerText(), /Skipped\s+2/i);
    assert.match(await dialog.innerText(), /Row 3: A customer with this email already exists/);
    assert.match(await dialog.innerText(), /Row 4: Enter a valid email address/);

    await dialog.getByRole('button', { name: 'Import 1 customer', exact: true }).click();
    await dialog.waitFor({ state: 'detached' });
    await page.getByRole('button', { name: 'New Customer', exact: true }).waitFor();
    assert.equal(await page.locator('.customer-record').count(), 2, 'one valid customer was added');
    assert.match(await page.locator('body').innerText(), /Customer imported/);
    assert.match(await page.locator('body').innerText(), /1 customer added; 2 rows skipped/);
    assert.equal(await importButton.evaluate(element => element === document.activeElement), true, 'focus returns to import button');

    await importButton.click();
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).focus();
    await page.keyboard.press('Tab');
    assert.equal(await dialog.getByRole('button', { name: 'Close customer import' }).evaluate(element => element === document.activeElement), true, 'Tab wraps within the modal');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await importButton.evaluate(element => element === document.activeElement), true, 'Escape returns focus');

    await page.setViewportSize({ width: 1440, height: 1000 });
    await importButton.click();
    assert.ok(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth), 'desktop dialog has no horizontal overflow');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();

    assert.deepEqual(outside, []);
    assert.deepEqual(errors, []);
    console.log('Customer CSV import browser checks passed at mobile and desktop widths.');
  } finally {
    await context.close();
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
