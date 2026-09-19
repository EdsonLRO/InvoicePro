const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const token = 'a'.repeat(43);
const endpoint = 'https://public-preview.example.supabase.co/functions/v1/quote-public';
const quote = {
  state: 'active',
  business: { name: 'North & Stone', logoUrl: null, email: 'hello@northandstone.example', phone: '020 7946 0123' },
  quote: {
    number: 'QUO-0217', status: 'Sent', issueDate: '2026-09-11', validUntil: '2026-09-25', currency: 'GBP',
    customer: { name: 'Sarah Jones' }, items: [
      { name: 'Bathroom preparation', qty: 1, unit: 'service', price: 1800, tax: 20 },
      { name: 'Installation and finishing', qty: 1, unit: 'service', price: 5000, tax: 20 }
    ], total: 6800, notes: 'Thank you for considering North & Stone.'
  },
  acceptance: null,
  invoice: null
};

const contentType = (file) => file.endsWith('.html') ? 'text/html' : file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : 'image/png';
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://local').pathname;
  if (pathname === '/config.js') {
    response.writeHead(200, { 'Content-Type': 'text/javascript' });
    response.end(`window.SUPABASE_URL='https://public-preview.example.supabase.co';window.SUPABASE_ANON_KEY='sb_publishable_test';window.TALLYO_QUOTE_ACCEPTANCE_ENABLED=true;`);
    return;
  }
  const file = pathname === '/quote/' || pathname === '/quote/index.html'
    ? path.join(root, 'quote', 'index.html')
    : pathname === '/quote/quote.css' || pathname === '/quote/quote.js'
      ? path.join(root, pathname.slice(1))
      : pathname === '/tallyo-wordmark-white.png'
        ? path.join(root, 'tallyo-wordmark-white.png')
        : null;
  if (!file || !fs.existsSync(file)) { response.writeHead(404); response.end('Not found'); return; }
  response.writeHead(200, { 'Content-Type': contentType(file), 'Cache-Control': 'no-store' });
  response.end(fs.readFileSync(file));
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const outside = [];
  const pageErrors = [];
  let state = 'active';
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    await context.route('**/*', async route => {
      const request = route.request();
      if (request.url() === endpoint) {
        const body = JSON.parse(request.postData() || '{}');
        assert.equal(body.token, token);
        assert.equal(request.headers().authorization, undefined);
        assert.equal(request.headers().apikey, 'sb_publishable_test');
        if (body.action === 'accept' && String(body.name || '').trim().length < 2) {
          await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ state: 'invalid_name' }) }); return;
        }
        if (body.action === 'accept') state = 'accepted';
        if (body.action === 'decline') state = 'declined';
        const response = structuredClone(quote);
        response.state = state;
        response.quote.status = state === 'active' ? 'Sent' : state[0].toUpperCase() + state.slice(1);
        if (state === 'accepted') {
          response.acceptance = { confirmedName: body.name || 'Sarah Jones', respondedAt: '2026-09-11T18:42:00Z' };
          response.invoice = { number: 'INV-1048', status: 'Draft', issueDate: '2026-09-11', dueDate: null, currency: 'GBP', customer: quote.quote.customer, items: quote.quote.items, total: 6800 };
        }
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) }); return;
      }
      if (request.url().startsWith(`${origin}/`)) { await route.continue(); return; }
      outside.push(request.url()); await route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto(`${origin}/quote/#${token}`);
    await page.getByRole('heading', { name: 'Quote QUO-0217' }).waitFor();
    if (process.env.TALLYO_QUOTE_UI_SCREENSHOT) {
      await page.screenshot({ path: process.env.TALLYO_QUOTE_UI_SCREENSHOT, fullPage: true });
    }
    assert.match(await page.locator('main').innerText(), /North & Stone[\s\S]*Sarah Jones[\s\S]*£6,800\.00/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'mobile quote page must not overflow horizontally');
    await page.getByRole('button', { name: 'Accept quote' }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('alert').filter({ hasText: 'Enter your name' }).waitFor();
    await page.getByLabel('Your name').fill('Sarah Jones');
    await page.getByRole('button', { name: 'Accept quote' }).click();
    await page.getByRole('heading', { name: 'Quote accepted' }).waitFor();
    assert.match(await page.locator('main').innerText(), /Invoice INV-1048 has been created/);
    await page.getByRole('button', { name: 'View invoice' }).click();
    await page.getByRole('heading', { name: 'Invoice INV-1048' }).waitFor();

    state = 'active';
    await page.goto(`${origin}/quote/#${token}`, { waitUntil: 'domcontentloaded' });
    await page.reload();
    await page.getByRole('button', { name: 'Decline quote' }).waitFor();
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Decline quote' }).click();
    await page.getByRole('heading', { name: 'Quote declined' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Accept quote' }).count(), 0);
    assert.deepEqual(outside, []);
    assert.deepEqual(pageErrors, []);
    console.log('Quote acceptance customer UI browser test passed: mobile layout, keyboard action, validation, accept, linked invoice, decline, no external requests.');
    await context.close();
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
