// Step 3: actual app handlers in the loopback-only fictional fixture.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdir, readFile } = require('node:fs/promises');
const path = require('node:path');
(async () => {
  const { artifact, serve, root } = await import('../dev/redesign/preview.mjs');
  const server = await serve(await artifact(), 0);
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', acceptDownloads: true });
  const outside = [], errors = [];
  await context.route('**/*', route => {
    if (route.request().url().startsWith(origin + '/')) return route.continue();
    outside.push(route.request().url()); return route.abort();
  });
  try {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.dismiss()); // Never accept a destructive action.
    await page.clock.setFixedTime(new Date('2026-09-12T10:00:00Z'));
    await page.goto(origin + '/#invoices');
    await page.locator('#preview-warning').waitFor();
    const docs = page.locator('.documents-page');
    const records = docs.locator('.document-record');
    assert.equal(await records.count(), 5);
    await docs.getByRole('searchbox').fill('1042');
    assert.equal(await records.count(), 1);
    await docs.getByRole('searchbox').fill('no such fictional customer');
    assert.match(await docs.locator('.list-empty').innerText(), /No documents match/);
    await docs.getByRole('searchbox').fill('');
    await docs.getByRole('combobox', { name: 'Document type', exact: true }).selectOption('quote');
    assert.equal(await records.count(), 1);
    assert.match(await records.innerText(), /QUO-0217/);
    await docs.getByRole('combobox', { name: 'Document type', exact: true }).selectOption('All');
    for (const [status, count] of [['Draft', 0], ['Sent', 2], ['Overdue', 2], ['Paid', 1], ['Cancelled', 0], ['Partially Paid', 0]]) {
      await docs.getByRole('combobox', { name: 'Document status', exact: true }).selectOption(status);
      assert.equal(await records.count(), count, status);
    }
    await docs.getByRole('combobox', { name: 'Document status', exact: true }).selectOption('All');
    await docs.getByRole('combobox', { name: 'Sort documents' }).selectOption('amount_asc');
    assert.match(await records.first().innerText(), /INV-1042/);
    await docs.getByRole('combobox', { name: 'Sort documents' }).selectOption('amount_desc');
    assert.match(await records.first().innerText(), /INV-1046/);
    await docs.getByRole('checkbox', { name: 'Select page', exact: true }).check();
    assert.equal(await records.locator('input:checked').count(), 5);
    for (const label of ['Duplicate', 'Email', 'PDF', 'Delete']) assert.ok(await docs.getByRole('button', { name: label, exact: true }).isVisible());
    await docs.getByRole('button', { name: 'Delete', exact: true }).click();
    assert.equal(await records.count(), 5, 'bulk delete of issued documents remains blocked');
    await docs.getByRole('checkbox', { name: 'Select page', exact: true }).uncheck();
    await docs.getByRole('combobox', { name: 'Sort documents' }).selectOption('number_asc');
    // Download uses existing all-document XLSX semantics, not just filtered rows.
    await docs.getByRole('searchbox').fill('1042');
    const xlsxWait = page.waitForEvent('download');
    await docs.getByRole('button', { name: 'Export XLSX' }).click();
    const xlsx = await xlsxWait;
    assert.equal(xlsx.suggestedFilename(), 'Invoices_Export.xlsx');
    assert.ok((await readFile(await xlsx.path())).length > 1000);
    assert.equal(await page.evaluate(() => document.querySelector('#app').__vue_app__._container._vnode.component.proxy.invoices.length), 5);
    await docs.getByRole('searchbox').fill('');
    const target = records.filter({ has: page.getByRole('button', { name: 'Open Invoice INV-1042', exact: true }) });
    await target.locator('summary').focus(); await page.keyboard.press('Enter');
    assert.equal(await target.locator('details').getAttribute('open'), '');
    await page.keyboard.press('Escape');
    assert.equal(await target.locator('details').getAttribute('open'), null);
    assert.equal(await target.locator('summary').evaluate(el => el === document.activeElement), true);
    await target.locator('summary').click();
    await target.getByRole('button', { name: 'Delete', exact: true }).click();
    assert.equal(await records.count(), 5, 'issued document deletion is still blocked');
    const dismissNotice = page.getByRole('button', { name: 'Dismiss notification' });
    if (await dismissNotice.isVisible()) await dismissNotice.click();
    await target.getByRole('button', { name: 'Email', exact: true }).click();
    assert.ok(await page.getByRole('heading', { name: 'Email Invoice', exact: true }).isVisible());
    await page.getByRole('button', { name: 'Cancel', exact: true }).filter({ visible: true }).click();
    const pdfWait = page.waitForEvent('download');
    await target.getByRole('button', { name: 'Download PDF', exact: true }).click();
    const pdf = await pdfWait;
    assert.match(pdf.suggestedFilename(), /\.pdf$/);
    assert.equal((await readFile(await pdf.path())).subarray(0, 5).toString(), '%PDF-');
    await page.waitForURL('**/#invoices');
    await target.locator('summary').click();
    await mkdir(path.join(root, 'tmp/redesign-evidence'), { recursive: true });
    await page.locator('.shell-main').evaluate(el => { el.scrollTop = 0; });
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/step3-desktop-documents.png') });
    for (const width of [320, 390, 768, 900, 1024, 1100, 1240, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await docs.evaluate(el => el.scrollWidth <= el.clientWidth), 'Documents has no horizontal scrolling at ' + width);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no outer overflow at ' + width);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.shell-main').evaluate(el => { el.scrollTop = 0; });
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/step3-mobile-documents.png') });
    assert.equal(await target.evaluate(el => getComputedStyle(el).display), 'grid');
    await target.getByRole('checkbox').check();
    assert.equal(await target.getByRole('checkbox').isChecked(), true);
    await target.getByRole('checkbox').uncheck();
    await target.locator('summary').click();
    assert.ok(await target.getByRole('button', { name: 'Email', exact: true }).isVisible());
    const touch = await target.locator('.record-select-control').boundingBox();
    assert.ok(touch.width >= 44 && touch.height >= 44);
    await target.locator('summary').focus(); await page.keyboard.press('Escape');
    await target.locator('.record-customer').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/step3-mobile-document-card.png') });
    const customerArea = await target.locator('.record-customer').boundingBox();
    await page.mouse.click(customerArea.x + 20, customerArea.y + customerArea.height / 2); // Card-wide button, not the text cell beneath it.
    await page.waitForURL('**/#edit');
    await page.goto(origin + '/#invoices');
    await page.locator('#preview-warning').waitFor();
    // 21 records prove page selection and page changes retain existing state rules.
    await page.evaluate(() => {
      const vm = document.querySelector('#app').__vue_app__._container._vnode.component.proxy;
      vm.invoices = Array.from({ length: 21 }, (_, n) => ({ ...vm.invoices[0], id: 'fictional-page-' + n, number: 'TEST-' + String(n).padStart(2, '0') }));
    });
    assert.equal(await records.count(), 20);
    await docs.getByRole('checkbox', { name: 'Select page', exact: true }).check();
    assert.equal(await records.locator('input:checked').count(), 20);
    await docs.getByRole('button', { name: 'Next documents page' }).first().click();
    assert.equal(await records.count(), 1);
    assert.equal(await records.locator('input:checked').count(), 0);
    await page.evaluate(() => { document.querySelector('#app').__vue_app__._container._vnode.component.proxy.invoices = []; });
    assert.match(await docs.locator('.list-empty').innerText(), /No documents saved yet/);
    // Catalogue UI with actual in-memory save, edit, search and cancelled deletion.
    await page.goto(origin + '/#items');
    await page.locator('#preview-warning').waitFor();
    const catalogue = page.locator('.catalogue-page');
    await catalogue.getByRole('button', { name: '+ New product or service', exact: true }).click();
    await catalogue.getByLabel('Product or service name *', { exact: true }).fill('Fictional design service');
    await catalogue.getByLabel('Description (Optional)', { exact: true }).fill('Reusable fictional design work');
    await catalogue.getByLabel('Default Price', { exact: true }).fill('125');
    await catalogue.getByRole('button', { name: 'Save product or service' }).click();
    await catalogue.getByRole('button', { name: 'Edit Fictional design service', exact: true }).waitFor();
    await catalogue.getByRole('searchbox').fill('Reusable fictional');
    assert.equal(await catalogue.locator('tbody tr').count(), 1);
    await catalogue.getByRole('button', { name: 'Edit Fictional design service', exact: true }).click();
    assert.equal(await catalogue.getByLabel('Default Price', { exact: true }).inputValue(), '125');
    await catalogue.getByLabel('Default Price', { exact: true }).fill('150');
    await catalogue.getByRole('button', { name: 'Save product or service' }).click();
    assert.match(await catalogue.locator('tbody').innerText(), /150.00/);
    await catalogue.getByRole('button', { name: 'Delete', exact: true }).click();
    assert.equal(await catalogue.locator('tbody tr').count(), 1);
    await catalogue.getByRole('checkbox', { name: 'Select page', exact: true }).check();
    await catalogue.getByRole('button', { name: 'Change price', exact: true }).click();
    assert.match(await catalogue.locator('tbody').innerText(), /150.00/, 'cancelled bulk-price prompt retains the price');
    await catalogue.getByRole('checkbox', { name: 'Select page', exact: true }).uncheck();
    assert.deepEqual(await page.evaluate(() => {
      const vm = document.querySelector('#app').__vue_app__._container._vnode.component.proxy;
      const original = JSON.stringify(vm.invoices.map(inv => inv.items));
      vm.selectMatch(0, vm.savedItems.find(item => item.name === 'Fictional design service'));
      return [vm.draft.items[0].name, vm.draft.items[0].price, JSON.stringify(vm.invoices.map(inv => inv.items)) === original];
    }), ['Fictional design service', 150, true], 'catalogue reuse keeps existing document snapshots unchanged');
    await catalogue.getByRole('searchbox').fill('');
    await page.locator('.shell-main').evaluate(el => { el.scrollTop = 0; });
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/step3-mobile-catalogue.png') });
    await page.evaluate(() => {
      const vm = document.querySelector('#app').__vue_app__._container._vnode.component.proxy;
      vm.savedItems.find(item => item.name === 'Website maintenance').description = '';
    }); // Exercise single-line and description-bearing rows together.
    for (const width of [320, 390, 768, 1100, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await catalogue.evaluate(el => el.scrollWidth <= el.clientWidth), 'catalogue has no horizontal scrolling at ' + width);
      const alignment = await catalogue.locator('tbody tr').evaluateAll(rows => rows.map(row => {
        const cells = row.querySelectorAll('td');
        const center = el => { const b = el.getBoundingClientRect(); return b.y + b.height / 2; };
        const range = document.createRange(); range.selectNodeContents(cells[2]);
        const price = range.getBoundingClientRect();
        return { desktop: getComputedStyle(row).display !== 'grid', row: center(row), checkbox: center(cells[0].querySelector('input')), name: center(cells[1]), price: price.y + price.height / 2, actions: center(cells[3].querySelector('button')) };
      }));
      for (const row of alignment) {
        assert.ok(Math.abs(row.checkbox - row.name) <= 1, 'catalogue checkbox centres with name at ' + width);
        if (row.desktop) {
          assert.ok(Math.abs(row.price - row.row) <= 3, 'catalogue price centres in row at ' + width);
          assert.ok(Math.abs(row.actions - row.row) <= 1, 'catalogue actions centre in row at ' + width);
        }
      }
    }
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/step3-desktop-catalogue.png') });
    assert.deepEqual(errors, []); assert.deepEqual(outside, []);
    console.log('Step 3 browser passed: filters, sorting, selection, pagination, blocked/cancelled deletion, keyboard More, email review only, PDF/XLSX downloads, card navigation, catalogue create/edit/search/reuse, cancelled bulk price, mobile/desktop widths, zero external requests/errors.');
  } finally { await context.close(); await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
