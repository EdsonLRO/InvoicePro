const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const { artifact, serve } = await import('./preview.mjs');
  const server = await serve(await artifact(), 0);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const output = path.resolve(__dirname, '../../docs/design/tallyo-redesign');
  try {
    const customer = await browser.newPage({ viewport: { width: 430, height: 1000 }, deviceScaleFactor: 2 });
    await customer.goto(`${origin}/customer`, { waitUntil: 'networkidle' });
    await customer.screenshot({ path: path.join(output, 'quote-acceptance-customer-preview.png'), fullPage: true });

    const owner = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.5 });
    await owner.goto(`${origin}/owner`, { waitUntil: 'networkidle' });
    await owner.screenshot({ path: path.join(output, 'quote-acceptance-owner-preview.png'), fullPage: true });
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log('Quote acceptance screenshots captured.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
