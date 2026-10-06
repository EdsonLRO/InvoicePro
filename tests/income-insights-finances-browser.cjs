const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const { artifact, serve, root } = await import('../dev/redesign/preview.mjs');
  const server = await serve(await artifact(), 0);
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ channel: 'chrome', headless: true, ignoreDefaultArgs: ['--hide-scrollbars'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  const outside = [], errors = [];
  await context.route('**/*', route => {
    if (route.request().url().startsWith(origin + '/')) return route.continue();
    outside.push(route.request().url()); return route.abort();
  });
  try {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-09-12T10:00:00Z'));
    await page.goto(origin + '/#finances');
    await page.locator('#preview-warning').waitFor();

    const finances = page.locator('.finances-page');
    assert.ok(await finances.isVisible(), 'Finances is available only in the approved fictional preview');
    assert.equal(await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Finances', exact: true }).getAttribute('aria-current'), 'page');
    assert.equal(await finances.locator('.finances-kpi').count(), 6);
    assert.equal(await finances.locator('.finances-grid-main .finances-card').count(), 2);
    assert.equal(await finances.locator('.finances-grid-three .finances-card').count(), 3);
    assert.equal(await finances.locator('.finances-money-chart').getAttribute('role'), 'img');
    assert.match(await finances.locator('.finances-money-chart').getAttribute('aria-label'), /Monthly invoiced and net received values/);
    assert.equal(await finances.locator('.finances-position-list li').count(), 3);
    assert.match(await finances.innerText(), /Income by customer/);
    assert.match(await finances.innerText(), /Where the income came from/);
    assert.match(await finances.innerText(), /Records organised/);
    assert.match(await finances.innerText(), /How these figures work/);

    const expected = await page.evaluate(() => {
      const vm = document.querySelector('#app').__vue_app__._container._vnode.component.proxy;
      return {
        invoiced: vm.overviewMoney(vm.financesSummary.invoiced, vm.financesCurrency),
        net: vm.overviewMoney(vm.financesSummary.netReceived, vm.financesCurrency)
      };
    });
    const kpis = await finances.locator('.finances-kpis').innerText();
    assert.ok(kpis.includes(expected.invoiced));
    assert.ok(kpis.includes(expected.net));

    const monthly = finances.locator('.finances-exact-values').first();
    await monthly.locator('summary').focus();
    await page.keyboard.press('Enter');
    assert.ok(await monthly.locator('table').isVisible(), 'exact monthly values are keyboard accessible');
    assert.ok(await monthly.locator('tbody tr').count() > 0);

    await finances.getByRole('button', { name: 'View records', exact: true }).first().click();
    await page.waitForURL('**/#finances-records');
    assert.ok(await finances.getByRole('heading', { name: 'Income records', exact: true }).isVisible());
    assert.ok(await finances.locator('.income-record-table tbody tr').count() > 0);
    await finances.getByLabel('Income records readiness').selectOption('ready');
    assert.ok(await finances.locator('.income-record-table tbody tr').count() > 0);
    await finances.getByLabel('Income records readiness').selectOption('all');
    await page.goBack(); await page.waitForURL('**/#finances');
    assert.ok(await finances.getByRole('heading', { name: 'Money received over time' }).isVisible());
    await finances.getByRole('button', { name: 'UK income periods', exact: true }).click();
    await page.waitForURL('**/#finances-periods');
    assert.equal(await finances.locator('.uk-period-card').count(), 4);
    assert.match(await finances.innerText(), /Nothing is filed with or sent to HMRC/);
    await finances.locator('.uk-period-card').nth(1).getByRole('button', { name: 'View period records', exact: true }).click();
    await page.waitForURL('**/#finances-records');
    assert.equal(await finances.getByLabel('Finances period').inputValue(), 'custom');
    assert.equal(await finances.getByLabel('Finances custom start date').inputValue(), '2026-07-06');
    assert.equal(await finances.getByLabel('Finances custom end date').inputValue(), '2026-10-05');
    await finances.getByRole('button', { name: 'Overview', exact: true }).click();
    await page.waitForURL('**/#finances');

    await finances.getByLabel('Finances period').selectOption('custom');
    await finances.getByLabel('Finances custom start date').fill('2026-10-02');
    await finances.getByLabel('Finances custom end date').fill('2026-10-01');
    await finances.getByRole('heading', { name: 'We could not calculate these figures' }).waitFor();
    await finances.getByLabel('Finances custom start date').fill('2026-09-01');
    await finances.getByLabel('Finances custom end date').fill('2026-09-30');
    await finances.locator('.finances-kpis').waitFor();

    await page.evaluate(() => {
      const vm = document.querySelector('#app').__vue_app__._container._vnode.component.proxy;
      vm.invoices.push({
        id: 'fictional-usd-finance', number: 'INV-USD-1', docType: 'invoice', status: 'Sent', currency: 'USD',
        date: '2026-09-02', dueDate: '2026-10-02', customer: { id: 'fictional-usd-customer', name: 'Fictional US customer' },
        items: [{ name: 'Service', qty: 1, price: 600, discount: 0, tax: 0 }], totals: { grandTotal: 600, taxAmt: 0 },
        payments: [{ amount: 250, date: '2026-09-05', currency: 'USD' }], history: []
      });
    });
    assert.deepEqual(await finances.getByLabel('Finances currency').locator('option').allTextContents(), ['GBP', 'USD']);
    await finances.getByLabel('Finances currency').selectOption('USD');
    assert.match(await finances.locator('.finances-kpis').innerText(), /US\$600\.00/);
    await finances.getByLabel('Finances currency').selectOption('GBP');
    await finances.getByLabel('Finances period').selectOption('this_tax_year');

    await mkdir(path.join(root, 'tmp/redesign-evidence'), { recursive: true });
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const view of ['overview', 'records', 'periods']) {
        await page.evaluate(view => { document.querySelector('#app').__vue_app__._container._vnode.component.proxy.financesView = view; }, view);
        assert.ok(await finances.evaluate(el => el.scrollWidth <= el.clientWidth + 1), `${view} has no horizontal scrolling at ${width}`);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `page has no horizontal overflow for ${view} at ${width}`);
        if ([390, 1440].includes(width)) {
          await page.locator('#main-content').evaluate(el => { el.scrollTop = 0; });
          await page.screenshot({ path: path.join(root, `tmp/redesign-evidence/phase4-${view}-${width}.png`) });
        }
      }
    }

    await page.setViewportSize({ width: 390, height: 844 });
    const mobile = page.getByRole('navigation', { name: 'Mobile navigation' });
    assert.equal(await mobile.getByRole('button', { name: 'Finances', exact: true }).getAttribute('aria-current'), 'page');
    await page.getByRole('button', { name: 'More in Tallyo', exact: true }).click();
    const more = page.getByRole('dialog', { name: 'More in Tallyo' });
    await more.waitFor();
    assert.ok(await more.getByRole('button', { name: 'Business settings', exact: true }).isVisible());
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'More in Tallyo');

    await page.evaluate(() => {
      const vm = document.querySelector('#app').__vue_app__._container._vnode.component.proxy;
      vm.invoices = [];
      vm.financesPeriodChoice = 'this_tax_year';
      vm.financesCurrencyChoice = '';
      vm.financesView = 'overview';
    });
    await finances.getByRole('heading', { name: 'No income records to show for this period' }).waitFor();
    assert.deepEqual(outside, []);
    assert.deepEqual(errors, []);
    console.log('Phase 4 Finances browser passed: direct desktop/mobile navigation, canonical values, filtered income records, UK period routes, keyboard exact values, period errors, separate currencies, empty state, all three views at 320-1440px and zero external requests.');
  } finally {
    await context.close();
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
