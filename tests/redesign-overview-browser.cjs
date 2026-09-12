// Actual application interactions, fresh profiles, fictional adapter, no live calls.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');
(async () => {
  const { artifact, serve, root } = await import('../dev/redesign/preview.mjs');
  const server = await serve(await artifact(), 0);
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, serviceWorkers: 'block' });
  const errors = [], outside = [];
  await context.route('**/*', route => {
    if (route.request().url().startsWith(origin + '/')) return route.continue();
    outside.push(route.request().url()); return route.abort();
  });
  try {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-09-12T10:00:00Z'));
    await page.goto(origin);
    await page.locator('#preview-warning').waitFor();
    const desktop = page.locator('#primary-navigation');
    const overview = page.getByRole('region', { name: 'Overview', exact: true });
    const money = await overview.locator('.overview-kpi dd').allTextContents();
    assert.deepEqual(money, ['£6,840.00', '£1,840.00', '£4,320.00', '1']);
    assert.equal(await overview.locator('.overview-attention li').count(), 4);
    assert.equal(await overview.locator('.overview-activity li').count(), 3);
    await overview.getByRole('button', { name: /View more/ }).click();
    assert.ok(await overview.locator('.overview-activity li').count() > 3);
    await overview.getByRole('button', { name: /Show less/ }).click();
    // A reminder action opens the existing review, never the send function.
    await overview.getByRole('button', { name: /Send reminder/ }).first().click();
    await page.getByRole('button', { name: 'Close reminder dialog' }).waitFor();
    assert.match(await page.locator('textarea').filter({ visible: true }).inputValue(), /240.00/);
    await page.getByRole('button', { name: 'Close reminder dialog' }).click();
    await overview.getByRole('button', { name: /Review schedule/ }).click();
    await page.waitForURL('**/#recurring-form');
    assert.ok(await page.getByRole('button', { name: /Save.*Schedule/i }).isVisible());
    await desktop.getByRole('button', { name: 'Overview', exact: true }).click();
    await overview.getByRole('button', { name: /View quote/ }).click();
    await page.waitForURL('**/#edit');
    assert.match(await page.getByRole('heading', { name: /Edit Quote/ }).innerText(), /QUO-0217/);
    // Preserve all existing hashes and conditional Owner access.
    for (const [label, hash] of [['Documents', 'invoices'], ['Customers', 'customers'], ['Products & services', 'items'], ['Branding', 'branding'], ['Business settings', 'settings'], ['Account', 'account'], ['Recurring', 'recurring']]) {
      await desktop.getByRole('button', { name: label, exact: true }).click();
      await page.waitForURL('**/#' + hash);
    }
    assert.equal(await desktop.getByRole('button', { name: 'Owner Console' }).count(), 0);
    await page.goto(origin + '/#not-a-route');
    await page.locator('#preview-warning').waitFor();
    assert.equal(await overview.isVisible(), true);
    await desktop.getByRole('button', { name: 'Customers', exact: true }).click();
    await desktop.getByRole('button', { name: 'Documents', exact: true }).click();
    await page.goBack(); await page.waitForURL('**/#customers');
    await page.goForward(); await page.waitForURL('**/#invoices');
    await desktop.getByRole('button', { name: 'Reminders', exact: true }).click();
    assert.equal(await page.locator('select').filter({ visible: true }).nth(1).inputValue(), 'Overdue');
    await desktop.getByRole('button', { name: 'Documents', exact: true }).click();
    assert.equal(await page.locator('select').filter({ visible: true }).nth(1).inputValue(), 'All');
    await desktop.getByRole('button', { name: 'Overview', exact: true }).click();
    await mkdir(path.join(root, 'tmp/redesign-evidence'), { recursive: true });
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/step2-desktop-overview.png'), fullPage: true });
    // Mobile is a separate navigation, with accessible focus containment and return.
    await page.setViewportSize({ width: 390, height: 844 });
    const mobile = page.getByRole('navigation', { name: 'Mobile navigation' });
    assert.equal(await desktop.isVisible(), false);
    assert.equal(await mobile.isVisible(), true);
    await mobile.getByRole('button', { name: 'More', exact: true }).click();
    const menu = page.getByRole('dialog', { name: 'More in Tallyo' });
    await menu.waitFor();
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Help & support');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Close menu');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'More');
    await mobile.getByRole('button', { name: 'More', exact: true }).click();
    await menu.getByRole('button', { name: 'Help & support', exact: true }).click();
    await page.getByRole('button', { name: 'Close help and install', exact: true }).click();
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'More');
    // Open all secondary routes through mobile, including branding and install/help.
    for (const [label, hash] of [['Products & services', 'items'], ['Branding', 'branding'], ['Recurring', 'recurring'], ['Business settings', 'settings'], ['Account', 'account']]) {
      await mobile.getByRole('button', { name: 'More', exact: true }).click();
      await menu.getByRole('button', { name: label, exact: true }).click();
      await page.waitForURL('**/#' + hash);
      assert.equal(await menu.count(), 0);
    }
    await mobile.getByRole('button', { name: 'New', exact: true }).click();
    const create = page.getByRole('dialog', { name: 'Create something new' });
    await create.getByRole('button', { name: /Customer/ }).click();
    await page.waitForURL('**/#customers-form');
    assert.ok(await page.getByRole('button', { name: 'Save Customer', exact: true }).isVisible());
    await mobile.getByRole('button', { name: 'New', exact: true }).click();
    await create.getByRole('button', { name: /Product or service/ }).click();
    await page.waitForURL('**/#items-form');
    assert.ok(await page.getByRole('button', { name: 'Save product or service', exact: true }).isVisible());
    await mobile.getByRole('button', { name: 'New', exact: true }).click();
    await create.getByRole('button', { name: /Invoice or quote/ }).click();
    await page.waitForURL('**/#create');
    // No view-only navigation should throw away an unsaved invoice.
    // Vue production app instance is available through the root component vnode.
    await page.evaluate(() => { const vm = document.querySelector('#app').__vue_app__._container._vnode.component.proxy; vm.draft.notes = 'Fictional unsaved note'; });
    await mobile.getByRole('button', { name: 'Overview', exact: true }).click();
    await mobile.getByRole('button', { name: 'New', exact: true }).click();
    await create.getByRole('button', { name: /Invoice or quote/ }).click();
    assert.equal(await page.evaluate(() => document.querySelector('#app').__vue_app__._container._vnode.component.proxy.draft.notes), 'Fictional unsaved note');
    await mobile.getByRole('button', { name: 'Overview', exact: true }).click();
    await page.locator('.shell-main').evaluate(el => { el.scrollTop = 0; });
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/step2-mobile-overview.png'), fullPage: true });
    await page.getByRole('button', { name: 'Recent activity', exact: true }).click();
    assert.equal(await page.evaluate(() => scrollY), 0, 'activity shortcut must scroll only the app content');
    assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), 'screen-reader labels must not create outer-page overflow');
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/step2-mobile-activity.png'), fullPage: true });
    // Cookie settings remain reachable without covering the bottom navigation.
    await page.locator('.app-cookie-settings').evaluate(el => { el.hidden = false; });
    const cookie = await page.locator('.app-cookie-settings').boundingBox(), nav = await mobile.boundingBox();
    assert.ok(cookie.y + cookie.height <= nav.y);
    await page.locator('.app-cookie-settings').evaluate(el => { el.hidden = true; });
    for (const width of [320, 390, 768, 1099, 1100, 1280, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal Overview overflow at ' + width);
      const cards = await overview.locator('.overview-grid > .overview-card').evaluateAll(elements => elements.map(el => {
        const { top, bottom, height } = el.getBoundingClientRect();
        return { top, bottom, height };
      }));
      if (width >= 700) {
        for (const [left, right] of [[0, 1], [2, 3]]) {
          assert.ok(Math.abs(cards[left].top - cards[right].top) < 1, 'paired card tops align at ' + width);
          assert.ok(Math.abs(cards[left].height - cards[right].height) < 1, 'paired card heights match at ' + width);
        }
      } else {
        for (let i = 1; i < cards.length; i++) assert.ok(cards[i].top >= cards[i - 1].bottom, 'mobile cards remain stacked at ' + width);
      }
    }
    // Empty/new account and mixed-currency state without touching real data.
    await page.evaluate(() => {
      const vm = document.querySelector('#app').__vue_app__._container._vnode.component.proxy;
      vm.invoices = []; vm.customers = []; vm.recurringTemplates = []; vm.auditEvents = []; vm.company = {};
    });
    await page.locator('.shell-main').evaluate(el => { el.scrollTop = 0; });
    assert.equal(await overview.locator('.overview-kpi dd').first().innerText(), '£0.00');
    assert.equal(await overview.locator('.overview-setup .complete').count(), 0);
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/step2-empty-overview.png'), fullPage: true });
    await page.evaluate(() => {
      const vm = document.querySelector('#app').__vue_app__._container._vnode.component.proxy;
      vm.invoices = [{ id: 'fictional-currency-record', docType: 'invoice', status: 'Sent', currency: 'USD', number: 'USD-1', totals: { grandTotal: 600 }, payments: [], history: [], dueDate: '2026-09-30' }];
    });
    await overview.getByRole('combobox', { name: 'Overview currency' }).selectOption('USD');
    assert.equal(await overview.locator('.overview-kpi dd').first().innerText(), 'US$600.00');
    await overview.getByRole('combobox', { name: 'Overview currency' }).selectOption('GBP');
    assert.equal(await overview.locator('.overview-kpi dd').first().innerText(), '£0.00');
    assert.deepEqual(errors, []); assert.deepEqual(outside, []);
    console.log('Overview browser passed: desktop/mobile routes, back/forward, review-only attention actions, New actions, unsaved draft retention, keyboard menu containment/return, empty state, 320–1440px overflow, cookie-control clearance, zero external requests and uncaught errors.');
  } finally {
    await context.close(); await browser.close(); await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
