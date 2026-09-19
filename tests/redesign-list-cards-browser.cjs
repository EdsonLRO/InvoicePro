const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const { artifact, serve, root } = await import('../dev/redesign/preview.mjs');
  const server = await serve(await artifact(), 0);
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  const outside = [], errors = [];
  await context.route('**/*', route => {
    if (route.request().url().startsWith(origin + '/')) return route.continue();
    outside.push(route.request().url());
    return route.abort();
  });
  try {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/#customers');
    await page.locator('#preview-warning').waitFor();
    await page.evaluate(() => {
      const vm = document.querySelector('#app').__vue_app__._container._vnode.component.proxy;
      vm.customers.push({ ...vm.customers[0], id: '00000000-0000-4000-8000-000000000012', name: 'Northstar Workshop (fictional)' });
      vm.savedItems.push({ ...vm.savedItems[0], id: '00000000-0000-4000-8000-000000000013', name: 'Design consultation' });
    });
    const customerRows = page.locator('.customer-record');
    assert.ok(await customerRows.count() >= 2, 'fictional preview exposes alternating customer rows');
    const customerCells = await customerRows.evaluateAll(rows => rows.slice(0, 2).map(row => {
      const first = getComputedStyle(row.cells[0]);
      const last = getComputedStyle(row.cells[row.cells.length - 1]);
      return { background: first.backgroundColor, leftRadius: first.borderTopLeftRadius, rightRadius: last.borderTopRightRadius, border: first.borderTopWidth };
    }));
    assert.deepEqual(customerCells.map(row => row.background), ['rgb(255, 255, 255)', 'rgb(248, 250, 252)']);
    for (const row of customerCells) {
      assert.equal(row.leftRadius, '12px');
      assert.equal(row.rightRadius, '12px');
      assert.equal(row.border, '1px');
    }
    await mkdir(path.join(root, 'tmp/redesign-evidence'), { recursive: true });
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/customer-row-cards-desktop.png'), fullPage: true });

    await page.goto(origin + '/#items');
    const itemRows = page.locator('.catalogue-record');
    assert.ok(await itemRows.count() >= 2, 'fictional preview exposes alternating catalogue rows');
    const itemGeometry = await itemRows.evaluateAll(rows => rows.slice(0, 2).map(row => ({
      background: getComputedStyle(row.cells[0]).backgroundColor,
      priceLeft: row.cells[2].getBoundingClientRect().left,
      actionRight: row.cells[3].getBoundingClientRect().right
    })));
    assert.deepEqual(itemGeometry.map(row => row.background), ['rgb(255, 255, 255)', 'rgb(248, 250, 252)']);
    assert.ok(Math.abs(itemGeometry[0].priceLeft - itemGeometry[1].priceLeft) < 1, 'catalogue prices remain column-aligned');
    assert.ok(Math.abs(itemGeometry[0].actionRight - itemGeometry[1].actionRight) < 1, 'catalogue actions remain column-aligned');
    await page.screenshot({ path: path.join(root, 'tmp/redesign-evidence/catalogue-row-cards-desktop.png'), fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    for (const [hash, selector] of [['customers', '.customer-record'], ['items', '.catalogue-record']]) {
      await page.goto(origin + '/#' + hash);
      const rows = page.locator(selector);
      const mobileRows = await rows.evaluateAll(elements => elements.slice(0, 2).map(row => {
        const style = getComputedStyle(row);
        return { display: style.display, background: style.backgroundColor, radius: style.borderRadius, border: style.borderTopWidth, borderColor: style.borderTopColor };
      }));
      assert.deepEqual(mobileRows.map(row => row.background), ['rgb(255, 255, 255)', 'rgb(248, 250, 252)']);
      assert.deepEqual(mobileRows.map(row => row.borderColor), ['rgb(220, 228, 239)', 'rgb(220, 228, 239)']);
      for (const row of mobileRows) {
        assert.equal(row.display, 'grid');
        assert.equal(row.radius, '12px');
        assert.equal(row.border, '1px');
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, hash + ' has no horizontal page overflow');
    }
    assert.deepEqual(outside, []);
    assert.deepEqual(errors, []);
    console.log('Customer and product/service row-card browser checks passed.');
  } finally {
    await context.close();
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
