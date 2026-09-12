const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');
(async () => {
  const { artifact, serve, root } = await import('../dev/redesign/preview.mjs');
  const server = await serve(await artifact(), 0);
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  const outside = [], errors = [];
  await context.route('**/*', route => {
    if (route.request().url().startsWith(origin + '/')) return route.continue();
    outside.push(route.request().url()); return route.abort();
  });
  try {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    // Only the in-memory schedule pause confirmation is accepted. No live scheduler exists here.
    page.on('dialog', dialog => dialog.message().startsWith('Pause this recurring schedule?') ? dialog.accept() : dialog.dismiss());
    await page.clock.setFixedTime(new Date('2026-09-12T10:00:00Z'));
    await page.goto(origin + '/#customers'); await page.locator('#preview-warning').waitFor();
    const customers = page.locator('.customers-page');
    const detail = page.locator('.customer-detail');
    await customers.locator('.customer-name').click();
    assert.equal(await detail.locator('h2').evaluate(el => el === document.activeElement), true);
    assert.equal(await detail.locator('.customer-summary dd').last().innerText(), '5');
    assert.match(await detail.locator('.customer-summary').innerText(), /6,840.00/);
    assert.match(await detail.locator('.customer-summary').innerText(), /4,320.00/);
    await mkdir(path.join(root, 'tmp/redesign-evidence'), { recursive: true });
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await customers.evaluate(el => el.scrollWidth <= el.clientWidth), 'customer detail no horizontal scrolling ' + width);
      if ([390, 1440].includes(width)) {
        await page.locator('#main-content').evaluate(el => { el.scrollTop = 0; });
        await page.screenshot({ path: path.join(root, `tmp/redesign-evidence/step5-customer-${width}.png`) });
      }
    }
    await detail.getByRole('button', { name: 'Edit customer', exact: true }).click();
    await customers.getByLabel('Name / Company *', { exact: true }).fill('Renamed fictional studio');
    await customers.getByRole('button', { name: 'Save Customer', exact: true }).click();
    await detail.getByRole('heading', { name: 'Renamed fictional studio' }).waitFor();
    assert.equal(await detail.locator('.customer-summary dd').last().innerText(), '5');
    assert.equal(await page.evaluate(() => document.querySelector('#app').__vue_app__._container._vnode.component.proxy.invoices[0].customer.name), 'Willow & Pine Studio (fictional)');
    await detail.getByRole('button', { name: /INV-1042/ }).first().click();
    await page.waitForURL('**/#edit');
    assert.match(await page.locator('.editor-header').innerText(), /INV-1042/);
    await page.goto(origin + '/#customers'); await page.locator('#preview-warning').waitFor();
    await customers.locator('.customer-name').click();
    await detail.getByRole('button', { name: 'View schedule', exact: true }).click();
    await page.waitForURL('**/#recurring-form');
    const recurring = page.locator('.recurring-page');
    assert.equal(await recurring.getByLabel('Frequency', { exact: true }).inputValue(), 'monthly');
    await recurring.getByLabel('Schedule name (optional)', { exact: true }).fill('Fictional monthly upkeep');
    await recurring.getByRole('button', { name: 'Save Schedule', exact: true }).click();
    await recurring.locator('.schedule-record').waitFor();
    await recurring.getByRole('button', { name: 'Pause Fictional monthly upkeep', exact: true }).click();
    await recurring.getByRole('button', { name: 'Resume Fictional monthly upkeep', exact: true }).waitFor();
    await recurring.getByRole('button', { name: 'Resume Fictional monthly upkeep', exact: true }).click();
    await recurring.getByRole('button', { name: 'Pause Fictional monthly upkeep', exact: true }).waitFor();
    for (const width of [320, 390, 768, 1024, 1100, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const [route, selector] of [['recurring', '.recurring-page'], ['customers', '.customers-page'], ['settings', '.business-settings-page'], ['account', '.account-page']]) {
        await page.evaluate(route => { document.querySelector('#app').__vue_app__._container._vnode.component.proxy.navigateTo(route); }, route);
        assert.ok(await page.locator(selector).evaluate(el => el.scrollWidth <= el.clientWidth + 1), route + ' no horizontal scrolling at ' + width);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no page overflow');
        if (['customers', 'recurring'].includes(route)) {
          const select = page.getByRole('checkbox', { name: route === 'customers' ? 'Select customers on page' : 'Select schedules on page', exact: true });
          await select.check();
          assert.equal(await page.locator(selector + ' tbody input:checked').count(), 1);
          await select.uncheck();
        }
        if (width === 390 && route === 'recurring') await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/step5-recurring-390.png') });
      }
    }
    await page.goto(origin + '/#owner'); await page.locator('#preview-warning').waitFor();
    assert.equal(await page.getByRole('heading', { name: 'Owner Console', exact: true }).isVisible(), false, 'no Owner access added');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'More', exact: true }).click();
    await page.getByRole('button', { name: 'Help & support', exact: true }).filter({ visible: true }).click();
    const help = page.getByRole('dialog', { name: 'Help & install Tallyo' });
    assert.ok(await help.isVisible());
    assert.ok(await help.evaluate(el => el.scrollWidth <= el.clientWidth));
    await page.keyboard.press('Escape');
    assert.equal(await help.count(), 0);
    await page.goto(origin + '/#customers'); await page.locator('#preview-warning').waitFor();
    await customers.locator('.customer-name').click();
    await detail.getByRole('button', { name: '← All customers', exact: true }).click();
    assert.equal(await customers.getByRole('heading', { name: 'Customers', exact: true }).evaluate(el => el === document.activeElement), true);
    await page.evaluate(() => {
      const vm = document.querySelector('#app').__vue_app__._container._vnode.component.proxy;
      vm.invoices = []; vm.recurringTemplates = []; vm.auditEvents = [];
    });
    await customers.locator('.customer-name').click();
    assert.match(await detail.innerText(), /No linked documents yet/);
    assert.match(await detail.innerText(), /No linked recurring schedules/);
    assert.match(await detail.innerText(), /No recent activity/);
    assert.deepEqual(outside, []); assert.deepEqual(errors, []);
    console.log('Step 5 browser passed: customer links/edit/snapshots/documents, schedule edit/pause/resume, empty states, focus, 320–1440px layout, Account/Owner route integration; no external requests or errors.');
  } finally { await context.close(); await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
