// Step 4: real editor bindings against the loopback-only, fictional fixture.
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
    page.on('dialog', dialog => dialog.dismiss());
    await page.clock.setFixedTime(new Date('2026-09-12T10:00:00Z'));
    await page.goto(origin + '/#create');
    await page.locator('#preview-warning').waitFor();
    const vmRead = expression => page.evaluate(expression => {
      const vm = document.querySelector('#app').__vue_app__._container._vnode.component.proxy;
      return Function('vm', 'return (' + expression + ')')(vm);
    }, expression);
    const form = page.locator('.editor-form');
    const details = form.locator('.editor-section').nth(1);
    const items = form.locator('.editor-section').nth(2);
    await form.getByLabel('Customer', { exact: true }).selectOption({ label: 'Willow & Pine Studio (fictional)' });
    await details.getByLabel('Number', { exact: true }).fill('INV-DEMO-1042');
    await details.getByLabel('PO / reference').fill('DEMO-7781');
    const item = items.locator('.editor-item').first();
    await item.getByLabel('Add from Products & services').selectOption('0');
    assert.equal(await item.getByLabel('Description').inputValue(), 'Website maintenance');
    await item.getByLabel('Unit', { exact: true }).selectOption('hrs');
    await item.getByLabel('Hours', { exact: true }).fill('1');
    await item.getByLabel('Minutes', { exact: true }).fill('30');
    assert.equal(await item.getByLabel('Quantity').inputValue(), '1.5');
    await item.getByLabel('Unit price', { exact: false }).fill('100');
    await item.getByLabel('Discount (%)', { exact: true }).fill('10');
    await item.getByLabel('Tax (%)').fill('20');
    assert.equal(await vmRead('vm.totals.grandTotal'), 162);
    await items.getByRole('button', { name: 'Prices include tax' }).click();
    assert.equal(await vmRead('vm.totals.grandTotal'), 135);
    await items.getByRole('button', { name: 'Add tax on top' }).click();
    await items.getByLabel('Document discount (%)').fill('10');
    await items.getByLabel('Shipping').fill('5');
    assert.equal(await vmRead('vm.totals.grandTotal'), 150.8);
    await item.getByLabel('Unit', { exact: true }).selectOption('__custom');
    await item.getByLabel('Custom unit').fill('session');
    await items.getByRole('button', { name: '+ Add item', exact: true }).click();
    assert.equal(await items.locator('.editor-item').count(), 2);
    await items.getByRole('button', { name: 'Remove item 2', exact: true }).click();
    const terms = form.locator('.editor-section').nth(3), notes = form.locator('.editor-section').nth(4);
    await terms.locator('summary').click(); await terms.getByLabel('Terms', { exact: true }).fill('Payment within 14 days.');
    await notes.locator('summary').click(); await notes.getByLabel('Notes', { exact: true }).fill('Thank you for your business.');
    // Preparation and preview must not save, send, or alter the draft.
    const before = await vmRead('JSON.stringify(vm.draft)');
    await page.locator('.editor-header').getByRole('button', { name: 'Preview', exact: true }).click();
    await page.waitForURL('**/#create-preview');
    assert.equal(await vmRead('JSON.stringify(vm.draft)'), before);
    assert.ok(await page.locator('#invoice-canvas').isVisible());
    assert.match(await page.locator('#invoice-canvas').innerText(), /Thank you for your business/);
    assert.equal(await page.locator('#invoice-canvas input:visible').count(), 0);
    await page.goBack(); await page.waitForURL('**/#create');
    assert.ok(await form.isVisible(), 'browser Back returns from Preview to the same editor');
    assert.equal(await vmRead('JSON.stringify(vm.draft)'), before);
    await page.goForward(); await page.waitForURL('**/#create-preview');
    await page.locator('.editor-header').getByRole('button', { name: 'Back to editing' }).click();
    await page.waitForURL('**/#create');
    assert.equal(await vmRead('JSON.stringify(vm.draft)'), before);
    await page.locator('.editor-header').getByRole('button', { name: 'Review & send' }).click();
    assert.equal(await vmRead('vm.documentEmailModal.includeOnlinePayment'), false);
    await page.getByRole('button', { name: 'Close email window' }).click();
    assert.equal(await vmRead('JSON.stringify(vm.draft)'), before);
    // Existing Save validation, without any provider call.
    await item.getByLabel('Quantity').fill('-1');
    await form.getByRole('button', { name: 'Save Invoice', exact: true }).click();
    assert.equal(await vmRead('vm.activeTab'), 'create');
    assert.ok(await page.locator('.app-notice').isVisible());
    await item.getByLabel('Quantity').fill('1.5');
    await vmRead('vm.closeAppNotice()');
    // Automation remains opt-in; opening configuration does not turn it on.
    const assertPill = async control => {
      const shape = await control.evaluate(el => {
        const track = getComputedStyle(el, '::before');
        const box = el.getBoundingClientRect(), thumb = el.firstElementChild.getBoundingClientRect();
        return { width: parseFloat(track.width), height: parseFloat(track.height), radius: parseFloat(track.borderRadius), hitHeight: box.height, thumbLeft: thumb.left - box.left, thumbWidth: thumb.width, on: el.getAttribute('aria-checked') === 'true' };
      });
      assert.equal(shape.width, 56); assert.equal(shape.height, 28);
      assert.ok(shape.radius >= shape.height / 2); assert.ok(shape.hitHeight >= 44);
      assert.equal(shape.thumbLeft, shape.on ? 32 : 4); assert.equal(shape.thumbWidth, 20);
    };
    const recurring = page.locator('.editor-aux').filter({ has: page.locator('button[aria-label="Recurring invoice"]') });
    await recurring.locator('summary').click();
    assert.equal(await vmRead('vm.draft.repeat.enabled'), false);
    await assertPill(recurring.getByRole('switch'));
    await recurring.getByRole('switch').click();
    assert.equal(await vmRead('vm.draft.repeat.enabled'), true);
    await page.waitForTimeout(200); await assertPill(recurring.getByRole('switch'));
    await recurring.getByRole('combobox').first().selectOption('custom');
    assert.ok(await recurring.getByText('Every', { exact: true }).isVisible());
    await recurring.getByRole('switch').click(); await recurring.locator('summary').click();
    const reminders = page.locator('.editor-aux').filter({ has: page.locator('button[aria-label="Overdue reminders"]') });
    await reminders.locator('summary').click(); await assertPill(reminders.getByRole('switch')); await reminders.getByRole('switch').click();
    assert.equal(await vmRead('vm.draft.overdueRemindersEnabled'), true);
    await page.waitForTimeout(200); await assertPill(reminders.getByRole('switch'));
    await reminders.getByRole('switch').click(); await reminders.locator('summary').click();
    // Native keyboard section and menu operation.
    await notes.locator('summary').focus(); await page.keyboard.press('Enter');
    assert.equal(await notes.getAttribute('open'), null);
    const more = page.locator('.editor-more');
    await more.locator('summary').focus(); await page.keyboard.press('Enter');
    await page.keyboard.press('Escape'); assert.equal(await more.getAttribute('open'), null);
    await more.locator('summary').click();
    assert.equal(await more.getAttribute('open'), '');
    await page.locator('.editor-header h2').click();
    assert.equal(await more.getAttribute('open'), null, 'More closes after an outside click');
    await mkdir(path.join(root, 'tmp/redesign-evidence'), { recursive: true });
    await page.locator('#main-content').evaluate(el => { el.scrollTop = 0; });
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/step4-desktop-editor.png') });
    for (const width of [320, 390, 768, 900, 1024, 1100, 1240, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const overflow = await page.locator('.editor-layout').evaluate(el => el.scrollWidth > el.clientWidth + 1);
      assert.equal(overflow, false, 'editor horizontal overflow at ' + width);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    // Fresh mobile composition begins with compact sections, not a desktop table.
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.reload(); await page.locator('#preview-warning').waitFor();
    assert.equal(await form.locator('details[open]').count(), 0);
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/step4-mobile-editor.png') });
    await items.locator('summary').click();
    assert.ok(await item.getByLabel('Description').isVisible());
    await item.getByLabel('Description').fill('Fictional design service');
    await item.getByLabel('Unit price', { exact: false }).fill('800');
    await item.getByLabel('Tax (%)').fill('20');
    assert.equal(await vmRead('vm.totals.grandTotal'), 960);
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/step4-mobile-items.png') });
    for (const element of await item.locator('input,select,button').all()) {
      if (await element.isVisible()) assert.ok((await element.boundingBox()).height >= 44);
    }
    await items.getByRole('button', { name: 'Done editing items' }).click();
    assert.equal(await items.getAttribute('open'), null);
    assert.ok(await items.locator('summary').evaluate(el => el === document.activeElement));
    // Save/reopen uses the actual existing handler and the in-memory fixture only.
    await form.getByRole('button', { name: 'Save Invoice', exact: true }).click();
    assert.equal(await vmRead('vm.activeTab'), 'invoices');
    await vmRead("vm.loadInvoice(vm.invoices.find(inv => inv.items.some(item => item.name === 'Fictional design service')))");
    assert.equal(await vmRead('vm.draft.items[0].price'), 800);
    assert.equal(await vmRead('vm.draft.items[0].tax'), 20);
    const paymentPanel = page.locator('.editor-payments');
    const activityPanel = page.locator('.editor-activity');
    await page.setViewportSize({ width: 1440, height: 1000 });
    const flowGeometry = await Promise.all([notes, form.locator('.editor-save-row'), paymentPanel, activityPanel].map(locator => locator.boundingBox()));
    const [notesBox, saveBox, paymentBox, activityBox] = flowGeometry;
    assert.ok(Math.abs(paymentBox.x - notesBox.x) < 1 && Math.abs(paymentBox.width - notesBox.width) < 1, 'Payments matches the main editor section width');
    assert.ok(Math.abs(activityBox.x - notesBox.x) < 1 && Math.abs(activityBox.width - notesBox.width) < 1, 'Activity matches the main editor section width');
    assert.ok(paymentBox.y >= saveBox.y + saveBox.height, 'Payments follows the save row');
    assert.ok(activityBox.y >= paymentBox.y + paymentBox.height, 'Activity follows Payments');
    await paymentPanel.locator('summary').click();
    assert.ok(await paymentPanel.getByRole('button', { name: 'Record Payment', exact: true }).isVisible());
    // No payment action is invoked. Expanded legacy controls must also fit the rail/mobile.
    for (const width of [320, 390, 1100, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await paymentPanel.evaluate(el => el.scrollWidth > el.clientWidth + 1), false, 'expanded payments at ' + width);
    }
    await paymentPanel.locator('summary').click();
    await page.setViewportSize({ width: 390, height: 1000 });
    // Actual multi-page PDF download from the same draft, with no regeneration on Preview.
    await vmRead("vm.draft.items = Array.from({length:24}, (_,i) => ({name:'Fictional service '+(i+1),qty:1,unit:'day',price:100,discount:0,tax:20}))");
    const pdfWait = page.waitForEvent('download');
    await more.locator('summary').click(); await more.getByRole('button', { name: 'Download PDF' }).click();
    const pdf = await pdfWait;
    const bytes = await readFile(await pdf.path());
    assert.match(bytes.subarray(0, 8).toString(), /^%PDF-/);
    assert.ok((bytes.toString('latin1').match(/\/Type \/Page\b/g) || []).length >= 2);
    assert.equal(await vmRead('vm.draft.items.length'), 24);
    assert.equal(await vmRead('vm.activeTab'), 'edit');
    assert.deepEqual(errors, []); assert.deepEqual(outside, []);
    console.log('Step 4 browser passed: editor fields, catalogue reuse, time/custom units, discounts/tax/shipping, notes/terms, exact Back/Forward preview retention, review-only email, invalid save, keyboard controls, 320–1440px layouts, touch targets, multi-page PDF, zero external requests/errors.');
  } finally { await context.close(); await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
